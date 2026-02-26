/**
 * Database helpers para módulo de Avaliações/Simulados
 */

import { getDb } from "../db";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";
import {
  especialidades,
  questoes,
  alternativas,
  modelosProva,
  simulados,
  simuladoQuestoes,
  respostasUsuario,
} from "../../drizzle/schema";

// ========================================
// ESPECIALIDADES
// ========================================

export async function getAllEspecialidades() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db.select().from(especialidades).orderBy(asc(especialidades.nome));
}

// ========================================
// QUESTÕES
// ========================================

export async function getQuestoesPorEspecialidade(especialidadeId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db
    .select()
    .from(questoes)
    .where(and(eq(questoes.especialidadeId, especialidadeId), eq(questoes.ativo, 1)))
    .orderBy(asc(questoes.id));
}

export async function getQuestaoComAlternativas(questaoId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const questao = await db.select().from(questoes).where(eq(questoes.id, questaoId)).limit(1);
  if (!questao[0]) return null;

  const alts = await db
    .select()
    .from(alternativas)
    .where(eq(alternativas.questaoId, questaoId))
    .orderBy(asc(alternativas.letra));

  return {
    ...questao[0],
    alternativas: alts,
  };
}

// ========================================
// MODELOS DE PROVA
// ========================================

export async function getModelosAtivos() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db
    .select()
    .from(modelosProva)
    .where(eq(modelosProva.ativo, 1))
    .orderBy(desc(modelosProva.createdAt));
}

export async function getModeloPorId(modeloId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.select().from(modelosProva).where(eq(modelosProva.id, modeloId)).limit(1);
  return result[0] || null;
}

export async function createModelo(data: {
  nome: string;
  descricao: string | null;
  duracaoMinutos: number;
  configuracao: string; // JSON
  criadoPorId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(modelosProva).values(data);
  return result[0].insertId;
}

export async function updateModelo(modeloId: number, data: Partial<typeof modelosProva.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(modelosProva).set(data).where(eq(modelosProva.id, modeloId));
}

export async function deleteModelo(modeloId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(modelosProva).set({ ativo: 0 }).where(eq(modelosProva.id, modeloId));
}

// ========================================
// SIMULADOS
// ========================================

export async function getSimuladosPorUsuario(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db
    .select()
    .from(simulados)
    .where(eq(simulados.userId, userId))
    .orderBy(desc(simulados.createdAt));
}

export async function getSimuladoPorId(simuladoId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.select().from(simulados).where(eq(simulados.id, simuladoId)).limit(1);
  return result[0] || null;
}

export async function createSimulado(data: {
  userId: number;
  modeloId: number;
  dataInicio: Date;
  duracaoMinutos: number;
  totalQuestoes: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(simulados).values(data);
  return result[0].insertId;
}

export async function finalizarSimulado(simuladoId: number, totalAcertos: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db
    .update(simulados)
    .set({
      dataFim: new Date(),
      totalAcertos,
      concluido: 1,
    })
    .where(eq(simulados.id, simuladoId));
}

// ========================================
// QUESTÕES DO SIMULADO
// ========================================

export async function addQuestaoAoSimulado(simuladoId: number, questaoId: number, ordem: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(simuladoQuestoes).values({
    simuladoId,
    questaoId,
    ordem,
  });
}

export async function getQuestoesDoSimulado(simuladoId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db
    .select({
      id: simuladoQuestoes.id,
      questaoId: simuladoQuestoes.questaoId,
      ordem: simuladoQuestoes.ordem,
      enunciado: questoes.enunciado,
      especialidadeId: questoes.especialidadeId,
    })
    .from(simuladoQuestoes)
    .innerJoin(questoes, eq(simuladoQuestoes.questaoId, questoes.id))
    .where(eq(simuladoQuestoes.simuladoId, simuladoId))
    .orderBy(asc(simuladoQuestoes.ordem));
}

// ========================================
// RESPOSTAS DO USUÁRIO
// ========================================

export async function salvarResposta(data: {
  simuladoId: number;
  questaoId: number;
  alternativaId: number | null;
  isCorreta: number;
  respondidaEm: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(respostasUsuario).values(data);
}

export async function getRespostasDoSimulado(simuladoId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return await db
    .select()
    .from(respostasUsuario)
    .where(eq(respostasUsuario.simuladoId, simuladoId))
    .orderBy(asc(respostasUsuario.id));
}

// ========================================
// ALGORITMO INTELIGENTE DE SELEÇÃO
// ========================================

/**
 * Seleciona questões de forma inteligente para um usuário
 * Prioridade: não respondidas → erradas → acertadas
 */
export async function selecionarQuestoesInteligentes(
  userId: number,
  especialidadeId: number,
  quantidade: number
): Promise<number[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // 1. Buscar todas as questões da especialidade
  const todasQuestoes = await db
    .select({ id: questoes.id })
    .from(questoes)
    .where(and(eq(questoes.especialidadeId, especialidadeId), eq(questoes.ativo, 1)));

  const todosIds = todasQuestoes.map((q: any) => q.id);

  if (todosIds.length === 0) return [];

  // 2. Buscar histórico de respostas do usuário para essas questões
  const historico = await db
    .select({
      questaoId: respostasUsuario.questaoId,
      isCorreta: respostasUsuario.isCorreta,
    })
    .from(respostasUsuario)
    .innerJoin(simulados, eq(respostasUsuario.simuladoId, simulados.id))
    .where(and(eq(simulados.userId, userId), inArray(respostasUsuario.questaoId, todosIds)));

  // 3. Classificar questões por prioridade
  const naoRespondidas: number[] = [];
  const erradas: number[] = [];
  const acertadas: number[] = [];

  const historicoMap = new Map<number, boolean[]>();
  historico.forEach((h: any) => {
    if (!historicoMap.has(h.questaoId)) {
      historicoMap.set(h.questaoId, []);
    }
    historicoMap.get(h.questaoId)!.push(h.isCorreta === 1);
  });

  todosIds.forEach((id: number) => {
    const respostas = historicoMap.get(id);
    if (!respostas || respostas.length === 0) {
      naoRespondidas.push(id);
    } else {
      const ultimaResposta = respostas[respostas.length - 1];
      if (ultimaResposta) {
        acertadas.push(id);
      } else {
        erradas.push(id);
      }
    }
  });

  // 4. Embaralhar cada grupo
  const shuffle = (arr: number[]) => arr.sort(() => Math.random() - 0.5);
  shuffle(naoRespondidas);
  shuffle(erradas);
  shuffle(acertadas);

  // 5. Selecionar questões na ordem de prioridade
  const selecionadas = [...naoRespondidas, ...erradas, ...acertadas].slice(0, quantidade);

  return selecionadas;
}
