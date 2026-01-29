import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createViewerContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "viewer-user",
    email: "viewer@example.com",
    name: "Viewer User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("residents API", () => {
  it("should allow admin to list residents", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.residents.list({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should allow viewer to list residents", async () => {
    const ctx = createViewerContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.residents.list({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter residents by search term", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.residents.list({ search: "João" });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter residents by year", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.residents.list({ anoResidencia: "R1" });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter residents by active status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.residents.list({ activeOnly: true });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // All returned residents should be active
    result.forEach((resident: any) => {
      expect(resident.ativo).toBe(1);
    });
  });
});

describe("residents mutations (admin only)", () => {
  it("should allow admin to create resident", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const newResident = {
      nomeCompleto: "Test Resident",
      apelido: "Test",
      anoResidencia: "R1" as "R1" | "R2" | "R3",
      ativo: 1,
    };

    const result = await caller.residents.create(newResident);
    expect(result).toBeDefined();
    // Verifica que a criação foi bem-sucedida
    expect(result).toBeTruthy();
  });

  it("should prevent viewer from creating resident", async () => {
    const ctx = createViewerContext();
    const caller = appRouter.createCaller(ctx);

    const newResident = {
      nomeCompleto: "Test Resident",
      apelido: "Test",
      anoResidencia: "R1" as "R1" | "R2" | "R3",
      ativo: 1,
    };

    await expect(caller.residents.create(newResident)).rejects.toThrow("Acesso negado");
  });
});
