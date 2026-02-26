/**
 * Router tRPC para módulo de Avaliações
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as avaliacoesDb from "../db-helpers/avaliacoes";
import { getDb } from "../db";
import { simulados, simuladoQuestoes, respostasUsuario, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { gerarPDFAvaliacao } from "../pdf-generator";

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
    listByEspecialidade: adminProcedure
      .input(z.object({ especialidadeId: z.number() }))
      .query(async ({ input }) => {
        return await avaliacoesDb.getQuestoesPorEspecialidade(input.especialidadeId);
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
        // Verificar acesso
        const simulado = await avaliacoesDb.getSimuladoPorId(input.simuladoId);
        if (!simulado) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Simulado não encontrado' });
        }
        if (simulado.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        if (simulado.concluido === 1) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Simulado já foi concluído' });
        }
        
        // Salvar respostas e calcular acertos
        let totalAcertos = 0;
        const agora = new Date();
        
        for (const resposta of input.respostas) {
          let isCorreta = 0;
          
          if (resposta.alternativaId) {
            // Buscar questão com alternativas para verificar se está correta
            const questao = await avaliacoesDb.getQuestaoComAlternativas(resposta.questaoId);
            if (questao) {
              const alternativaCorreta = questao.alternativas.find(a => a.isCorreta === 1);
              if (alternativaCorreta && alternativaCorreta.id === resposta.alternativaId) {
                isCorreta = 1;
                totalAcertos++;
              }
            }
          }
          
          await avaliacoesDb.salvarResposta({
            simuladoId: input.simuladoId,
            questaoId: resposta.questaoId,
            alternativaId: resposta.alternativaId,
            isCorreta,
            respondidaEm: agora,
          });
        }
        
        // Finalizar simulado
        await avaliacoesDb.finalizarSimulado(input.simuladoId, totalAcertos);
        
        return { 
          totalAcertos, 
          totalQuestoes: simulado.totalQuestoes,
          percentual: Math.round((totalAcertos / simulado.totalQuestoes) * 100),
        };
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
