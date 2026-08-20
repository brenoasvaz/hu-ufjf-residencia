import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "oauth-user",
      email: "oauth@example.com",
      name: "OAuth User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("senha de acesso", () => {
  it("gera hash bcrypt que valida somente a senha original", async () => {
    const hash = await hashPassword("Senha-segura-2026");

    expect(hash).not.toContain("Senha-segura-2026");
    await expect(verifyPassword("Senha-segura-2026", hash)).resolves.toBe(true);
    await expect(verifyPassword("Senha-incorreta", hash)).resolves.toBe(false);
  });

  it("rejeita definição de senha com menos de oito caracteres antes de acessar o banco", async () => {
    const caller = appRouter.createCaller(createAuthenticatedContext());

    await expect(caller.auth.setPassword({ newPassword: "1234567" }))
      .rejects.toThrow("A senha deve ter pelo menos 8 caracteres");
  });
});
