/**
 * Router tRPC para módulo de Avaliações
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as avaliacoesDb from "../db-helpers/avaliacoes";
import { getDb } from "../db";
import { simulados, simuladoQuestoes, respostasUsuario, users, questoes } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { gerarPDFAvaliacao } from "../pdf-generator";
import { storagePut } from "../storage";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
    });
  }
  return next({ ctx });
});

export const avaliacoesRouter = router({
  // ========================================
  // ESPECIALIDADES (público para todos autenticados)
  // ========================================
  
  especialidades: router({
    list: protectedProcedure.query(async () => {
      return await avaliacoesDb.getAllEspecialidades();
    }),
  }),

  // ========================================
  // QUESTÕES (Admin apenas)
  // ========================================
  
  questoes: router({
    // Contagem total de questões (dinâmica)
    count: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB indisponível' });
      const { count } = await import('drizzle-orm');
      const [result] = await db
        .select({ total: count(questoes.id) })
        .from(questoes)
        .where(eq(questoes.ativo, 1));
      return { total: result?.total ?? 0 };
    }),

    // Listar questões com paginação e filtros (admin)
    list: adminProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        especialidadeId: z.number().optional(),
        busca: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB indisponível' });
        const { count, like, and } = await import('drizzle-orm');
        const { especialidades } = await import('../../drizzle/schema');

        const conditions: any[] = [eq(questoes.ativo, 1)];
        if (input.especialidadeId) {
          conditions.push(eq(questoes.especialidadeId, input.especialidadeId));
        }
        if (input.busca && input.busca.trim()) {
          conditions.push(like(questoes.enunciado, `%${input.busca.trim()}%`));
        }

        const where = conditions.length > 1 ? and(...conditions) : conditions[0];

        const [{ total }] = await db
          .select({ total: count(questoes.id) })
          .from(questoes)
          .where(where);

        const offset = (input.page - 1) * input.pageSize;
        const rows = await db
          .select({
            id: questoes.id,
            enunciado: questoes.enunciado,
            fonte: questoes.fonte,
            ano: questoes.ano,
            especialidadeId: questoes.especialidadeId,
            temImagem: questoes.temImagem,
            imageUrl: questoes.imageUrl,
          })
          .from(questoes)
          .where(where)
          .orderBy(questoes.especialidadeId, questoes.id)
          .limit(input.pageSize)
          .offset(offset);

        return {
          questoes: rows,
          total,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(total / input.pageSize),
        };
      }),

    listByEspecialidade: adminProcedure
      .input(z.object({ especialidadeId: z.number() }))
      .query(async ({ input }) => {
        return await avaliacoesDb.getQuestoesPorEspecialidade(input.especialidadeId);
      }),
    
    // Listar questões que requerem imagem (admin)
    listComImagem: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB indisponível' });
      const rows = await db
        .select({
          id: questoes.id,
          enunciado: questoes.enunciado,
          fonte: questoes.fonte,
          ano: questoes.ano,
          especialidadeId: questoes.especialidadeId,
          temImagem: questoes.temImagem,
          imageUrl: questoes.imageUrl,
        })
        .from(questoes)
        .where(eq(questoes.temImagem, 1))
        .orderBy(questoes.especialidadeId);
      return rows;
    }),

    getWithAlternativas: adminProcedure
      .input(z.object({ questaoId: z.number() }))
      .query(async ({ input }) => {
        const questao = await avaliacoesDb.getQuestaoComAlternativas(input.questaoId);
        if (!questao) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Questão não encontrada' });
        }
        return questao;
      }),

    // Upload de imagem para questão (admin apenas)
    uploadImagem: adminProcedure
      .input(z.object({
        questaoId: z.number(),
        imageBase64: z.string(), // base64 da imagem
        mimeType: z.string().default('image/jpeg'),
        fileName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Verificar se questão existe e requer imagem
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB indisponível' });
        const [questao] = await db
          .select()
          .from(questoes)
          .where(eq(questoes.id, input.questaoId))
          .limit(1);

        if (!questao) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Questão não encontrada' });
        }

        // Converter base64 para buffer
        const base64Data = input.imageBase64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Verificar tamanho (máx 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Imagem muito grande. Máximo 5MB.' });
        }

        // Gerar key única no S3
        const ext = input.mimeType.split('/')[1] || 'jpg';
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileKey = `questoes-imagens/questao-${input.questaoId}-${randomSuffix}.${ext}`;

        // Upload para S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Atualizar questão com URL da imagem
        await db
          .update(questoes)
          .set({ imageUrl: url, imageKey: fileKey })
          .where(eq(questoes.id, input.questaoId));

        return { success: true, imageUrl: url };
      }),

    // Remover imagem de questão (admin apenas)
    removeImagem: adminProcedure
      .input(z.object({ questaoId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB indisponível' });
        await db
          .update(questoes)
          .set({ imageUrl: null, imageKey: null })
          .where(eq(questoes.id, input.questaoId));
        return { success: true };
      }),
  }),

  // ========================================
  // MODELOS DE PROVA
  // ========================================
  
  modelos: router({
    // Listar modelos ativos (todos autenticados)
    list: protectedProcedure.query(async () => {
      return await avaliacoesDb.getModelosAtivos();
    }),
    
    // Criar modelo (admin apenas)
    create: adminProcedure
      .input(z.object({
        nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
        descricao: z.string().nullable(),
        duracaoMinutos: z.number().min(10).max(300),
        configuracao: z.record(z.string(), z.number()), // { "Coluna": 10, "Joelho": 5, ... }
      }))
      .mutation(async ({ input, ctx }) => {
        const modeloId = await avaliacoesDb.createModelo({
          nome: input.nome,
          descricao: input.descricao,
          duracaoMinutos: input.duracaoMinutos,
          configuracao: JSON.stringify(input.configuracao),
          criadoPorId: ctx.user.id,
        });
        return { modeloId };
      }),
    
    // Atualizar modelo (admin apenas)
    update: adminProcedure
      .input(z.object({
        modeloId: z.number(),
        nome: z.string().min(3).optional(),
        descricao: z.string().nullable().optional(),
        duracaoMinutos: z.number().min(10).max(300).optional(),
        configuracao: z.record(z.string(), z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { modeloId, ...data } = input;
        const updateData: any = {};
        if (data.nome) updateData.nome = data.nome;
        if (data.descricao !== undefined) updateData.descricao = data.descricao;
        if (data.duracaoMinutos) updateData.duracaoMinutos = data.duracaoMinutos;
        if (data.configuracao) updateData.configuracao = JSON.stringify(data.configuracao);
        
        await avaliacoesDb.updateModelo(modeloId, updateData);
        return { success: true };
      }),
    
    // Deletar modelo (admin apenas)
    delete: adminProcedure
      .input(z.object({ modeloId: z.number() }))
      .mutation(async ({ input }) => {
        await avaliacoesDb.deleteModelo(input.modeloId);
        return { success: true };
      }),
  }),

  // ========================================
  // SIMULADOS (Residentes)
  // ========================================
  
  simulados: router({
    // Listar simulados do usuário logado (ou todos se for admin)
    list: protectedProcedure.query(async ({ ctx }) => {
      // Se for admin, retorna todos os simulados com informações do usuário
      if (ctx.user.role === 'admin') {
        return await avaliacoesDb.getTodosSimuladosComUsuario();
      }
      // Se for usuário comum, retorna apenas seus simulados
      return await avaliacoesDb.getSimuladosPorUsuario(ctx.user.id);
    }),
    
    // Gerar novo simulado baseado em um modelo
    gerar: protectedProcedure
      .input(z.object({ modeloId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // 1. Buscar modelo
        const modelo = await avaliacoesDb.getModeloPorId(input.modeloId);
        if (!modelo) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Modelo não encontrado' });
        }
        
        // 2. Parsear configuração
        const config = JSON.parse(modelo.configuracao) as Record<string, number>;
        
        // 3. Buscar especialidades
        const especialidades = await avaliacoesDb.getAllEspecialidades();
        const especialidadeMap = new Map(especialidades.map(e => [e.nome, e.id]));
        
        // 4. Selecionar questões inteligentemente para cada especialidade
        const questoesSelecionadas: number[] = [];
        for (const [nomeEsp, quantidade] of Object.entries(config)) {
          const espId = especialidadeMap.get(nomeEsp);
          if (!espId) {
            console.warn(`Especialidade não encontrada: ${nomeEsp}`);
            continue;
          }
          
          const questoesEsp = await avaliacoesDb.selecionarQuestoesInteligentes(
            ctx.user.id,
            espId,
            quantidade
          );
          questoesSelecionadas.push(...questoesEsp);
        }
        
        if (questoesSelecionadas.length === 0) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Não há questões disponíveis para este modelo' 
          });
        }
        
        // 5. Criar simulado
        const simuladoId = await avaliacoesDb.createSimulado({
          userId: ctx.user.id,
          modeloId: input.modeloId,
          dataInicio: new Date(),
          duracaoMinutos: modelo.duracaoMinutos,
          totalQuestoes: questoesSelecionadas.length,
        });
        
        // 6. Adicionar questões ao simulado
        for (let i = 0; i < questoesSelecionadas.length; i++) {
          await avaliacoesDb.addQuestaoAoSimulado(simuladoId, questoesSelecionadas[i], i + 1);
        }
        
        return { simuladoId };
      }),
    
    // Buscar detalhes de um simulado
    get: protectedProcedure
      .input(z.object({ simuladoId: z.number() }))
      .query(async ({ input, ctx }) => {
        const simulado = await avaliacoesDb.getSimuladoPorId(input.simuladoId);
        if (!simulado) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Simulado não encontrado' });
        }
        
        // Verificar se o simulado pertence ao usuário (ou se é admin)
        if (simulado.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        
        return simulado;
      }),
    
    // Buscar questões de um simulado
    getQuestoes: protectedProcedure
      .input(z.object({ simuladoId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verificar acesso
        const simulado = await avaliacoesDb.getSimuladoPorId(input.simuladoId);
        if (!simulado) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Simulado não encontrado' });
        }
        if (simulado.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        
        // Buscar questões
        const questoes = await avaliacoesDb.getQuestoesDoSimulado(input.simuladoId);
        
        // Buscar alternativas para cada questão
        const questoesComAlternativas = await Promise.all(
          questoes.map(async (q) => {
            const questaoCompleta = await avaliacoesDb.getQuestaoComAlternativas(q.questaoId);
            if (!questaoCompleta) return { ...q, alternativas: [] };
            
            // Se não for admin, remover informação de alternativa correta
            if (ctx.user.role !== 'admin') {
              return {
                ...q,
                ...questaoCompleta,
                alternativas: questaoCompleta.alternativas.map((alt: any) => ({
                  id: alt.id,
                  texto: alt.texto,
                  // NÃO incluir 'isCorreta' para residentes
                })),
              };
            }
            
            return {
              ...q,
              ...questaoCompleta,
            };
          })
        );
        
        return questoesComAlternativas;
      }),
    
    // Submeter respostas do simulado
    submeter: protectedProcedure
      .input(z.object({
        simuladoId: z.number(),
        respostas: z.array(z.object({
          questaoId: z.number(),
          alternativaId: z.number().nullable(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB indisponível' });

        // Pré-carregar todas as alternativas corretas em um único query (evita N+1)
        const questaoIds = input.respostas
          .filter(r => r.alternativaId !== null)
          .map(r => r.questaoId);

        const alternativasCorretas: Map<number, number> = new Map();
        if (questaoIds.length > 0) {
          const { alternativas } = await import('../../drizzle/schema');
          const { and: andOp } = await import('drizzle-orm');
          // 1 query: buscar apenas alternativas corretas das questões respondidas
          const altsCorretas = await db
            .select({ questaoId: alternativas.questaoId, id: alternativas.id })
            .from(alternativas)
            .where(
              andOp(
                inArray(alternativas.questaoId, questaoIds),
                eq(alternativas.isCorreta, 1)
              )
            );
          for (const alt of altsCorretas) {
            alternativasCorretas.set(alt.questaoId, alt.id);
          }
        }

        // Toda a operação dentro de uma única transação para evitar race condition
        const resultado = await db.transaction(async (tx) => {
          // 1. Re-verificar estado dentro da transação (leitura consistente)
          const [simuladoAtual] = await tx
            .select()
            .from(simulados)
            .where(eq(simulados.id, input.simuladoId))
            .limit(1);

          if (!simuladoAtual) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Simulado não encontrado' });
          }
          if (simuladoAtual.userId !== ctx.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
          }
          if (simuladoAtual.concluido === 1) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Simulado já foi concluído' });
          }

          // 2. Calcular acertos e preparar registros de resposta
          let totalAcertos = 0;
          const agora = new Date();
          const registros = input.respostas.map(resposta => {
            let isCorreta = 0;
            if (resposta.alternativaId !== null) {
              const corretaId = alternativasCorretas.get(resposta.questaoId);
              if (corretaId !== undefined && corretaId === resposta.alternativaId) {
                isCorreta = 1;
                totalAcertos++;
              }
            }
            return {
              simuladoId: input.simuladoId,
              questaoId: resposta.questaoId,
              alternativaId: resposta.alternativaId,
              isCorreta,
              respondidaEm: agora,
            };
          });

          // 3. Inserir todas as respostas em batch (uma única query)
          if (registros.length > 0) {
            await tx.insert(respostasUsuario).values(registros);
          }

          // 4. Finalizar simulado atomicamente
          await tx
            .update(simulados)
            .set({ dataFim: agora, totalAcertos, concluido: 1 })
            .where(eq(simulados.id, input.simuladoId));

          return {
            totalAcertos,
            totalQuestoes: simuladoAtual.totalQuestoes,
            percentual: Math.round((totalAcertos / simuladoAtual.totalQuestoes) * 100),
          };
        });

        return resultado;
      }),

    // Admin: Deletar simulado
    delete: adminProcedure
      .input(z.object({ simuladoId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Deletar respostas primeiro (foreign key)
        await db.delete(respostasUsuario).where(eq(respostasUsuario.simuladoId, input.simuladoId));
        
        // Deletar questões do simulado
        await db.delete(simuladoQuestoes).where(eq(simuladoQuestoes.simuladoId, input.simuladoId));
        
        // Deletar simulado
        await db.delete(simulados).where(eq(simulados.id, input.simuladoId));
        
        return { success: true };
      }),

    // Admin: Gerar PDF de avaliação
    gerarPDF: adminProcedure
      .input(z.object({ simuladoId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Buscar simulado com dados do usuário
        const simuladoData = await db
          .select({
            simuladoId: simulados.id,
            userId: simulados.userId,
            dataInicio: simulados.dataInicio,
            dataFim: simulados.dataFim,
            duracaoMinutos: simulados.duracaoMinutos,
            totalQuestoes: simulados.totalQuestoes,
            totalAcertos: simulados.totalAcertos,
            concluido: simulados.concluido,
            userName: users.name,
            userEmail: users.email,
          })
          .from(simulados)
          .innerJoin(users, eq(simulados.userId, users.id))
          .where(eq(simulados.id, input.simuladoId))
          .limit(1);

        if (!simuladoData[0]) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Avaliação não encontrada' });
        }

        if (simuladoData[0].concluido === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Avaliação ainda não foi concluída' });
        }

        const simulado = simuladoData[0];

        // Buscar questões com respostas
        const questoesComRespostas = await avaliacoesDb.getQuestoesComRespostas(input.simuladoId);

        // Formatar dados para o PDF
        const pdfData = {
          simuladoId: simulado.simuladoId,
          residenteNome: simulado.userName || 'Não informado',
          residenteEmail: simulado.userEmail || 'Não informado',
          dataInicio: new Date(simulado.dataInicio),
          dataFim: simulado.dataFim ? new Date(simulado.dataFim) : null,
          duracaoMinutos: simulado.duracaoMinutos,
          totalQuestoes: simulado.totalQuestoes,
          totalAcertos: simulado.totalAcertos || 0,
          percentual: Math.round(((simulado.totalAcertos || 0) / simulado.totalQuestoes) * 100),
          questoes: questoesComRespostas.map((q: any, index: number) => ({
            numero: index + 1,
            enunciado: q.enunciado,
            especialidade: q.especialidade,
            alternativas: q.alternativas.map((alt: any) => ({
              letra: alt.letra,
              texto: alt.texto,
              correta: alt.correta === 1,
            })),
            respostaUsuario: q.respostaUsuario,
            acertou: q.acertou === 1,
          })),
        };

        // Gerar PDF
        const pdfBuffer = await gerarPDFAvaliacao(pdfData);

        // Retornar PDF como base64
        return {
          pdf: pdfBuffer.toString('base64'),
          filename: `avaliacao_${input.simuladoId}_${simulado.userName?.replace(/\s+/g, '_')}.pdf`,
        };
      }),
  }),

  // ========================================
  // DASHBOARD (Estatísticas do residente)
  // ========================================
  
  dashboard: router({
    // Estatísticas gerais do usuário
    stats: protectedProcedure.query(async ({ ctx }) => {
      const simulados = await avaliacoesDb.getSimuladosPorUsuario(ctx.user.id);
      const concluidos = simulados.filter(s => s.concluido === 1);
      
      if (concluidos.length === 0) {
        return {
          totalSimulados: 0,
          mediaAcertos: 0,
          melhorDesempenho: 0,
          piorDesempenho: 0,
        };
      }
      
      const percentuais = concluidos.map(s => 
        Math.round((s.totalAcertos / s.totalQuestoes) * 100)
      );
      
      return {
        totalSimulados: concluidos.length,
        mediaAcertos: Math.round(percentuais.reduce((a, b) => a + b, 0) / percentuais.length),
        melhorDesempenho: Math.max(...percentuais),
        piorDesempenho: Math.min(...percentuais),
      };
    }),
  }),
});
