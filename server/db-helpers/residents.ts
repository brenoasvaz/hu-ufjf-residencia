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
