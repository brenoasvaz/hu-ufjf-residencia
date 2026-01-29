import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { getDb } from "../db";
import { 
  rotations, 
  rotationAssignments, 
  residents,
  type InsertRotation, 
  type InsertRotationAssignment 
} from "../../drizzle/schema";

export async function getAllRotations(filters?: {
  mesReferencia?: string;
  localEstagio?: string;
  residentId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(rotations);
  
  const conditions = [];
  
  if (filters?.mesReferencia) {
    conditions.push(eq(rotations.mesReferencia, filters.mesReferencia));
  }
  
  if (filters?.localEstagio) {
    conditions.push(eq(rotations.localEstagio, filters.localEstagio));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return query.orderBy(desc(rotations.dataInicio));
}

export async function getRotationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(rotations).where(eq(rotations.id, id)).limit(1);
  return result[0];
}

export async function getRotationWithAssignments(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rotation = await getRotationById(id);
  if (!rotation) return null;

  const assignments = await db
    .select({
      assignment: rotationAssignments,
      resident: residents,
    })
    .from(rotationAssignments)
    .leftJoin(residents, eq(rotationAssignments.residentId, residents.id))
    .where(eq(rotationAssignments.rotationId, id));

  return {
    ...rotation,
    assignments,
  };
}

export async function createRotation(data: InsertRotation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(rotations).values(data);
  return result;
}

export async function updateRotation(id: number, data: Partial<InsertRotation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(rotations).set(data).where(eq(rotations.id, id));
  return getRotationById(id);
}

export async function deleteRotation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar assignments primeiro
  await db.delete(rotationAssignments).where(eq(rotationAssignments.rotationId, id));
  
  // Depois deletar o rodízio
  await db.delete(rotations).where(eq(rotations.id, id));
  
  return { success: true };
}

export async function assignResidentToRotation(data: InsertRotationAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(rotationAssignments).values(data);
  return result;
}

export async function checkRotationConflicts(residentId: number, dataInicio: Date, dataFim: Date, excludeRotationId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conflicts = await db
    .select({
      rotation: rotations,
      assignment: rotationAssignments,
    })
    .from(rotationAssignments)
    .leftJoin(rotations, eq(rotationAssignments.rotationId, rotations.id))
    .where(
      and(
        eq(rotationAssignments.residentId, residentId),
        // Verifica sobreposição de datas
        sql`(
          (${rotations.dataInicio} <= ${dataFim} AND ${rotations.dataFim} >= ${dataInicio})
        )`,
        excludeRotationId ? sql`${rotations.id} != ${excludeRotationId}` : undefined
      )
    );

  return conflicts;
}

export async function getRotationsByDateRange(dataInicio: Date, dataFim: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(rotations)
    .where(
      and(
        lte(rotations.dataInicio, dataFim),
        gte(rotations.dataFim, dataInicio)
      )
    )
    .orderBy(rotations.dataInicio);
}
