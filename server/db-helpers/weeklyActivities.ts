import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import { 
  weeklyActivities, 
  activityAudiences,
  type InsertWeeklyActivity,
  type InsertActivityAudience 
} from "../../drizzle/schema";

export async function getAllWeeklyActivities(filters?: {
  diaSemana?: number;
  anoResidencia?: "R1" | "R2" | "R3";
  bloco?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(weeklyActivities);
  
  const conditions = [];
  
  if (filters?.diaSemana !== undefined) {
    conditions.push(eq(weeklyActivities.diaSemana, filters.diaSemana));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  const activities = await query.orderBy(weeklyActivities.diaSemana, weeklyActivities.horaInicio);
  
  // Se tiver filtros de ano/bloco, filtrar pelos audiences
  if (filters?.anoResidencia || filters?.bloco) {
    const activitiesWithAudience = await Promise.all(
      activities.map(async (activity) => {
        const audiences = await getActivityAudiences(activity.id);
        
        // Verificar se a atividade é relevante para os filtros
        const isRelevant = audiences.some(aud => {
          const matchAno = !filters.anoResidencia || aud.anoResidencia === filters.anoResidencia;
          const matchBloco = !filters.bloco || aud.bloco === filters.bloco;
          return matchAno && matchBloco;
        });
        
        return isRelevant ? { ...activity, audiences } : null;
      })
    );
    
    return activitiesWithAudience.filter(a => a !== null);
  }
  
  return activities;
}

export async function getWeeklyActivityById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(weeklyActivities).where(eq(weeklyActivities.id, id)).limit(1);
  return result[0];
}

export async function getActivityWithAudiences(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const activity = await getWeeklyActivityById(id);
  if (!activity) return null;

  const audiences = await getActivityAudiences(id);

  return {
    ...activity,
    audiences,
  };
}

export async function getActivityAudiences(activityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(activityAudiences)
    .where(eq(activityAudiences.activityId, activityId));
}

export async function createWeeklyActivity(data: InsertWeeklyActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(weeklyActivities).values(data);
  return result;
}

export async function updateWeeklyActivity(id: number, data: Partial<InsertWeeklyActivity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(weeklyActivities).set(data).where(eq(weeklyActivities.id, id));
  return getWeeklyActivityById(id);
}

export async function deleteWeeklyActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deletar audiences primeiro
  await db.delete(activityAudiences).where(eq(activityAudiences.activityId, id));
  
  // Depois deletar a atividade
  await db.delete(weeklyActivities).where(eq(weeklyActivities.id, id));
  
  return { success: true };
}

export async function addActivityAudience(data: InsertActivityAudience) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(activityAudiences).values(data);
  return result;
}

export async function removeActivityAudience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(activityAudiences).where(eq(activityAudiences.id, id));
  return { success: true };
}
