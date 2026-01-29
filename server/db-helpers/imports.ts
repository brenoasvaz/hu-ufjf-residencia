import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { imports, stages, type InsertImport, type InsertStage } from "../../drizzle/schema";

// ===== IMPORTS =====

export async function getAllImports(filters?: {
  tipo?: "RODIZIO" | "CRONOGRAMA";
  status?: "PENDENTE" | "PROCESSANDO" | "CONCLUIDO" | "ERRO";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(imports);
  
  if (filters?.tipo) {
    query = query.where(eq(imports.tipo, filters.tipo)) as typeof query;
  }
  
  if (filters?.status) {
    query = query.where(eq(imports.status, filters.status)) as typeof query;
  }
  
  return query.orderBy(desc(imports.createdAt));
}

export async function getImportById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(imports).where(eq(imports.id, id)).limit(1);
  return result[0];
}

export async function createImport(data: InsertImport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(imports).values(data);
  return result;
}

export async function updateImport(id: number, data: Partial<InsertImport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(imports).set(data).where(eq(imports.id, id));
  return getImportById(id);
}

export async function deleteImport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(imports).where(eq(imports.id, id));
  return { success: true };
}

// ===== STAGES =====

export async function getAllStages(activeOnly = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(stages);
  
  if (activeOnly) {
    query = query.where(eq(stages.ativo, 1)) as typeof query;
  }
  
  return query.orderBy(stages.nome);
}

export async function getStageById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(stages).where(eq(stages.id, id)).limit(1);
  return result[0];
}

export async function createStage(data: InsertStage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(stages).values(data);
  return result;
}

export async function updateStage(id: number, data: Partial<InsertStage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(stages).set(data).where(eq(stages.id, id));
  return getStageById(id);
}

export async function deleteStage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(stages).where(eq(stages.id, id));
  return { success: true };
}
