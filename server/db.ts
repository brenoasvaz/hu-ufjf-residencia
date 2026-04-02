import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clinicalMeetings, presentationGuidelines, ClinicalMeeting, InsertClinicalMeeting, PresentationGuideline, InsertPresentationGuideline, escalaAvaliacoes, EscalaAvaliacao, InsertEscalaAvaliacao } from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || user.openId + '@temp.local', // Fallback for OAuth users
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      if (field === 'email') {
        const emailValue = value || values.email;
        values[field] = emailValue;
        updateSet[field] = emailValue;
      } else {
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Clinical Meetings Queries
// ============================================

export async function getAllClinicalMeetings(): Promise<ClinicalMeeting[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get clinical meetings: database not available");
    return [];
  }
  return await db.select().from(clinicalMeetings).orderBy(clinicalMeetings.data);
}

export async function getClinicalMeetingsByMonth(year: number, month: number): Promise<ClinicalMeeting[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get clinical meetings: database not available");
    return [];
  }
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const { gte, lte, and } = await import("drizzle-orm");
  return await db.select().from(clinicalMeetings)
    .where(and(
      gte(clinicalMeetings.data, startDate),
      lte(clinicalMeetings.data, endDate)
    ))
    .orderBy(clinicalMeetings.data);
}

export async function createClinicalMeeting(meeting: InsertClinicalMeeting): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.insert(clinicalMeetings).values(meeting);
}

export async function updateClinicalMeeting(id: number, data: Partial<InsertClinicalMeeting>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.update(clinicalMeetings).set(data).where(eq(clinicalMeetings.id, id));
}

export async function deleteClinicalMeeting(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.delete(clinicalMeetings).where(eq(clinicalMeetings.id, id));
}

export async function swapClinicalMeetingDates(idA: number, idB: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [meetingA] = await db.select().from(clinicalMeetings).where(eq(clinicalMeetings.id, idA)).limit(1);
  const [meetingB] = await db.select().from(clinicalMeetings).where(eq(clinicalMeetings.id, idB)).limit(1);

  if (!meetingA || !meetingB) throw new Error("Uma ou ambas as atividades não foram encontradas");

  // Trocar datas diretamente (sem data temporária) — não há UNIQUE constraint em 'data'
  await db.update(clinicalMeetings).set({ data: meetingB.data }).where(eq(clinicalMeetings.id, idA));
  await db.update(clinicalMeetings).set({ data: meetingA.data }).where(eq(clinicalMeetings.id, idB));
}

// ============================================
// Presentation Guidelines Queries
// ============================================

export async function getAllPresentationGuidelines(): Promise<PresentationGuideline[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get presentation guidelines: database not available");
    return [];
  }
  return await db.select().from(presentationGuidelines);
}

export async function upsertPresentationGuideline(guideline: InsertPresentationGuideline): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.insert(presentationGuidelines).values(guideline).onDuplicateKeyUpdate({
    set: {
      titulo: guideline.titulo,
      descricao: guideline.descricao,
      tempoApresentacao: guideline.tempoApresentacao,
      tempoDiscussao: guideline.tempoDiscussao,
      orientacoes: guideline.orientacoes,
    },
  });
}

// ─── Escala de Avaliações Práticas ───────────────────────────────────────────

export async function getEscalaAvaliacoes(ano: number): Promise<EscalaAvaliacao[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { and } = await import("drizzle-orm");
  return db.select().from(escalaAvaliacoes).where(eq(escalaAvaliacoes.ano, ano));
}

export async function updateEscalaAvaliacao(
  id: number,
  data: Partial<Pick<InsertEscalaAvaliacao, "nomeResidente" | "preceptorHabilidades" | "preceptorAtendimento" | "dataLimite">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(escalaAvaliacoes).set(data).where(eq(escalaAvaliacoes.id, id));
}

export async function createEscalaAvaliacao(data: InsertEscalaAvaliacao): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(escalaAvaliacoes).values(data);
}

export async function deleteEscalaAvaliacao(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(escalaAvaliacoes).where(eq(escalaAvaliacoes.id, id));
}

/**
 * Copia a escala de avaliações de um ano para outro, aplicando progressão de residência:
 * R1 → R2, R2 → R3, R3 → removidos (formados).
 * Não sobrescreve registros já existentes no ano de destino.
 * Retorna o número de registros copiados.
 */
export async function copyEscalaAvaliacoes(
  anoOrigem: number,
  anoDestino: number
): Promise<{ copiados: number; ignorados: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { and } = await import("drizzle-orm");

  const origem = await db
    .select()
    .from(escalaAvaliacoes)
    .where(eq(escalaAvaliacoes.ano, anoOrigem));

  if (origem.length === 0) return { copiados: 0, ignorados: 0 };

  // Verifica registros já existentes no destino para não duplicar
  const destino = await db
    .select({ codigo: escalaAvaliacoes.codigoResidente, quad: escalaAvaliacoes.quadrimestre })
    .from(escalaAvaliacoes)
    .where(eq(escalaAvaliacoes.ano, anoDestino));

  const existentes = new Set(destino.map((d) => `${d.codigo}|${d.quad}`));

  const PROGRESSAO: Record<string, "R1" | "R2" | "R3" | null> = {
    R1: "R2",
    R2: "R3",
    R3: null, // formados — não copiar
  };

  let copiados = 0;
  let ignorados = 0;

  for (const row of origem) {
    const novoAno = PROGRESSAO[row.anoResidencia];
    if (novoAno === null) {
      // R3 formados — pular
      ignorados++;
      continue;
    }

    const chave = `${row.codigoResidente}|${row.quadrimestre}`;
    if (existentes.has(chave)) {
      ignorados++;
      continue;
    }

    await db.insert(escalaAvaliacoes).values({
      ano: anoDestino,
      anoResidencia: novoAno,
      codigoResidente: row.codigoResidente,
      nomeResidente: row.nomeResidente,
      quadrimestre: row.quadrimestre,
      preceptorHabilidades: row.preceptorHabilidades,
      preceptorAtendimento: row.preceptorAtendimento,
      dataLimite: null, // datas limite devem ser redefinidas para o novo ano
    });
    copiados++;
  }

  return { copiados, ignorados };
}
