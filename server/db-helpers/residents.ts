import { eq, like, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import { residents, type InsertResident, type Resident } from "../../drizzle/schema";

export async function getAllResidents(filters?: {
  anoResidencia?: "R1" | "R2" | "R3";
  ativo?: boolean;
  search?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(residents);
  
  const conditions = [];
  
  if (filters?.anoResidencia) {
    conditions.push(eq(residents.anoResidencia, filters.anoResidencia));
  }
  
  if (filters?.ativo !== undefined) {
    conditions.push(eq(residents.ativo, filters.ativo ? 1 : 0));
  }
  
  if (filters?.search) {
    conditions.push(
      like(residents.nomeCompleto, `%${filters.search}%`)
    );
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return query.orderBy(desc(residents.createdAt));
}

export async function getResidentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(residents).where(eq(residents.id, id)).limit(1);
  return result[0];
}

export async function createResident(data: InsertResident) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(residents).values(data);
  return result;
}

export async function updateResident(id: number, data: Partial<InsertResident>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(residents).set(data).where(eq(residents.id, id));
  return getResidentById(id);
}

export async function deleteResident(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(residents).where(eq(residents.id, id));
  return { success: true };
}

/**
 * Aplica a progressão anual de residência:
 * - R1 → R2
 * - R2 → R3
 * - R3 → inativo (ativo = 0)
 * Retorna um resumo das alterações realizadas.
 */
export async function progressaoAnualResidentes(): Promise<{
  r1ToR2: number;
  r2ToR3: number;
  r3Inativados: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todos os residentes ativos
  const todos = await db
    .select()
    .from(residents)
    .where(eq(residents.ativo, 1));

  let r1ToR2 = 0;
  let r2ToR3 = 0;
  let r3Inativados = 0;

  for (const r of todos) {
    if (r.anoResidencia === "R3") {
      await db.update(residents).set({ ativo: 0 }).where(eq(residents.id, r.id));
      r3Inativados++;
    } else if (r.anoResidencia === "R2") {
      await db.update(residents).set({ anoResidencia: "R3" }).where(eq(residents.id, r.id));
      r2ToR3++;
    } else if (r.anoResidencia === "R1") {
      await db.update(residents).set({ anoResidencia: "R2" }).where(eq(residents.id, r.id));
      r1ToR2++;
    }
  }

  return { r1ToR2, r2ToR3, r3Inativados };
}
