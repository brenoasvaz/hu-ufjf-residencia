import bcrypt from 'bcrypt';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Register a new user with email and password
 */
export async function registerUser(input: RegisterInput) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check if user already exists
  const existingUsers = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

  if (existingUsers.length > 0) {
    throw new Error('Email já cadastrado');
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const result = await db.insert(users).values({
    email: input.email,
    passwordHash,
    name: input.name,
    role: input.role || 'user',
    loginMethod: 'internal',
  });

  return {
    id: result[0].insertId,
    email: input.email,
    name: input.name,
    role: input.role || 'user',
  };
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(input: LoginInput) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Find user by email
  const foundUsers = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  const user = foundUsers[0];

  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  if (!user.passwordHash) {
    throw new Error('Usuário não possui senha configurada. Use o login com Manus.');
  }

  // Verify password
  const isValid = await verifyPassword(input.password, user.passwordHash);

  if (!isValid) {
    throw new Error('Email ou senha inválidos');
  }

  // Check account status
  if (user.accountStatus === 'pending') {
    throw new Error('Sua conta está aguardando aprovação de um administrador.');
  }

  if (user.accountStatus === 'rejected') {
    throw new Error('Sua solicitação de acesso foi negada. Entre em contato com um administrador.');
  }

  // Update last signed in
  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const foundUsers = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const user = foundUsers[0];

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    lastSignedIn: user.lastSignedIn,
  };
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const foundUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return foundUsers[0] || null;
}

/**
 * Get all users with optional status filter
 */
export async function getAllUsers(status?: 'pending' | 'approved' | 'rejected') {
  const db = await getDb();
  if (!db) return [];

  if (status) {
    return db.select().from(users).where(eq(users.accountStatus, status)).orderBy(users.createdAt);
  }
  return db.select().from(users).orderBy(users.createdAt);
}

/**
 * Approve a user account
 */
export async function approveUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(users)
    .set({ accountStatus: 'approved' })
    .where(eq(users.id, userId));
}

/**
 * Reject a user account
 */
export async function rejectUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(users)
    .set({ accountStatus: 'rejected' })
    .where(eq(users.id, userId));
}

/**
 * Check if user account is approved
 */
export async function isUserApproved(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const foundUsers = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = foundUsers[0];
  
  return user?.accountStatus === 'approved';
}
