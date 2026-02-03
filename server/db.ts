import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clinicalMeetings, presentationGuidelines, ClinicalMeeting, InsertClinicalMeeting, PresentationGuideline, InsertPresentationGuideline } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
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
