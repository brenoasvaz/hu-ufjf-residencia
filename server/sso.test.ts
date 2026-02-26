import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
const jwt = require("jsonwebtoken");

describe("SSO Token Generation", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  
  beforeAll(() => {
    // Mock authenticated context
    const mockContext: Context = {
      user: {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        role: "admin",
        openId: "test-open-id",
        accountStatus: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };
    
    caller = appRouter.createCaller(mockContext);
  });

  it("should generate a valid SSO token", async () => {
    const result = await caller.auth.generateSSOToken();
    
    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
  });

  it("should generate a token that can be decoded", async () => {
    const result = await caller.auth.generateSSOToken();
    const ssoSecret = process.env.JWT_SSO_SECRET || process.env.JWT_SECRET;
    
    const decoded = jwt.verify(result.token, ssoSecret!) as any;
    
    expect(decoded).toHaveProperty("userId");
    expect(decoded).toHaveProperty("email");
    expect(decoded).toHaveProperty("name");
    expect(decoded).toHaveProperty("role");
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.name).toBe("Test User");
    expect(decoded.role).toBe("admin");
  });

  it("should generate a token with 5 minute expiration", async () => {
    const result = await caller.auth.generateSSOToken();
    const ssoSecret = process.env.JWT_SSO_SECRET || process.env.JWT_SECRET;
    
    const decoded = jwt.verify(result.token, ssoSecret!) as any;
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    
    // Token should expire in approximately 5 minutes (300 seconds)
    // Allow 10 second tolerance for test execution time
    expect(expiresIn).toBeGreaterThan(290);
    expect(expiresIn).toBeLessThanOrEqual(300);
  });
});
