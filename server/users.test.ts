/**
 * Testes para módulo de Gerenciamento de Usuários
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Gerenciamento de Usuários", () => {
  let adminContext: any;
  let userContext: any;
  let testUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar usuário admin e user para testes
    const adminUser = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    const regularUser = await db.select().from(users).where(eq(users.role, "user")).limit(1);

    if (!adminUser[0] || !regularUser[0]) {
      throw new Error("Test users not found");
    }

    adminContext = {
      user: {
        id: adminUser[0].id,
        email: adminUser[0].email,
        name: adminUser[0].name,
        role: adminUser[0].role,
      },
      req: {} as any,
      res: {} as any,
    };

    userContext = {
      user: {
        id: regularUser[0].id,
        email: regularUser[0].email,
        name: regularUser[0].name,
        role: regularUser[0].role,
      },
      req: {} as any,
      res: {} as any,
    };

    testUserId = regularUser[0].id;
  });

  it("Admin deve conseguir listar todos os usuários", async () => {
    const caller = appRouter.createCaller(adminContext);
    const allUsers = await caller.users.list();
    
    expect(Array.isArray(allUsers)).toBe(true);
    expect(allUsers.length).toBeGreaterThan(0);
    
    // Verificar estrutura do usuário
    const firstUser = allUsers[0];
    expect(firstUser).toHaveProperty("id");
    expect(firstUser).toHaveProperty("email");
    expect(firstUser).toHaveProperty("name");
    expect(firstUser).toHaveProperty("role");
    expect(firstUser).toHaveProperty("createdAt");
  });

  it("Usuário comum NÃO deve conseguir listar usuários", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.users.list()
    ).rejects.toThrow("Acesso negado");
  });

  it("Admin deve conseguir buscar usuário por ID", async () => {
    const caller = appRouter.createCaller(adminContext);
    const user = await caller.users.getById({ userId: testUserId });
    
    expect(user).toHaveProperty("id");
    expect(user.id).toBe(testUserId);
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("role");
  });

  it("Admin deve conseguir editar nome de usuário", async () => {
    const caller = appRouter.createCaller(adminContext);
    const originalName = "Nome Original Teste";
    const newName = "Nome Atualizado Teste";
    
    // Atualizar nome
    const result = await caller.users.update({
      userId: testUserId,
      name: newName,
    });
    
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    
    // Verificar atualização
    const updatedUser = await caller.users.getById({ userId: testUserId });
    expect(updatedUser.name).toBe(newName);
  });

  it("Admin deve conseguir promover usuário a administrador", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Buscar um usuário comum (não o de teste)
    const regularUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "user"))
      .limit(2);
    
    if (regularUsers.length < 2) {
      console.log("Não há usuários suficientes para teste de promoção, pulando");
      return;
    }
    
    // Usar o segundo usuário para não interferir com outros testes
    const userToPromote = regularUsers[1];
    
    const caller = appRouter.createCaller(adminContext);
    const result = await caller.users.update({
      userId: userToPromote.id,
      role: "admin",
    });
    
    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    
    // Verificar promoção
    const promotedUser = await caller.users.getById({ userId: userToPromote.id });
    expect(promotedUser.role).toBe("admin");
    
    // Reverter para não afetar outros testes
    await caller.users.update({
      userId: userToPromote.id,
      role: "user",
    });
  });

  it("Admin deve conseguir ver avaliações de todos os usuários", async () => {
    const caller = appRouter.createCaller(adminContext);
    const allSimulados = await caller.avaliacoes.simulados.list();
    
    expect(Array.isArray(allSimulados)).toBe(true);
    
    // Admin deve ver avaliações com informações do usuário
    if (allSimulados.length > 0) {
      const firstSimulado = allSimulados[0];
      expect(firstSimulado).toHaveProperty("userId");
      expect(firstSimulado).toHaveProperty("userName");
      expect(firstSimulado).toHaveProperty("userEmail");
    }
  });

  it("Usuário comum deve ver apenas suas próprias avaliações", async () => {
    const caller = appRouter.createCaller(userContext);
    const mySimulados = await caller.avaliacoes.simulados.list();
    
    expect(Array.isArray(mySimulados)).toBe(true);
    
    // Todos os simulados devem pertencer ao usuário
    mySimulados.forEach((simulado: any) => {
      expect(simulado.userId).toBe(userContext.user.id);
    });
  });

  it("Admin NÃO deve conseguir remover suas próprias credenciais", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    await expect(
      caller.users.update({
        userId: adminContext.user.id,
        role: "user",
      })
    ).rejects.toThrow("não pode remover suas próprias credenciais");
  });

  it("Usuário comum NÃO deve conseguir editar usuários", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.users.update({
        userId: testUserId,
        name: "Tentativa de Edição",
      })
    ).rejects.toThrow("Acesso negado");
  });
});
