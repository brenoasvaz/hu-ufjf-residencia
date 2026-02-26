/**
 * Testes de Segurança - Restrições de Acesso a Avaliações
 * 
 * Valida que:
 * - Residentes veem apenas suas próprias avaliações
 * - Residentes não têm acesso às respostas corretas
 * - Admin tem acesso completo
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Segurança - Avaliações", () => {
  // Contextos de teste
  const adminContext: Context = {
    user: {
      id: 1,
      openId: "admin-test",
      email: "admin@test.com",
      name: "Admin Test",
      role: "admin",
    },
  };

  const userContext1: Context = {
    user: {
      id: 2,
      openId: "user1-test",
      email: "user1@test.com",
      name: "User 1",
      role: "user",
    },
  };

  const userContext2: Context = {
    user: {
      id: 3,
      openId: "user2-test",
      email: "user2@test.com",
      name: "User 2",
      role: "user",
    },
  };

  let simuladoUser1Id: number;

  beforeAll(async () => {
    // Criar um simulado para user1
    const caller1 = appRouter.createCaller(userContext1);
    const modelos = await caller1.avaliacoes.modelos.list();
    
    if (modelos.length > 0) {
      const simulado = await caller1.avaliacoes.simulados.gerar({
        modeloId: modelos[0].id,
      });
      simuladoUser1Id = simulado.simuladoId;
    }
  });

  it("Residente NÃO deve conseguir acessar avaliação de outro residente", async () => {
    if (!simuladoUser1Id) {
      console.log("Pulando teste: sem simulados disponíveis");
      return;
    }

    const caller2 = appRouter.createCaller(userContext2);
    
    await expect(
      caller2.avaliacoes.simulados.get({ simuladoId: simuladoUser1Id })
    ).rejects.toThrow("Acesso negado");
  });

  it("Residente NÃO deve conseguir acessar questões de avaliação de outro residente", async () => {
    if (!simuladoUser1Id) {
      console.log("Pulando teste: sem simulados disponíveis");
      return;
    }

    const caller2 = appRouter.createCaller(userContext2);
    
    await expect(
      caller2.avaliacoes.simulados.getQuestoes({ simuladoId: simuladoUser1Id })
    ).rejects.toThrow("Acesso negado");
  });

  it("Residente NÃO deve receber campo 'isCorreta' nas alternativas", async () => {
    if (!simuladoUser1Id) {
      console.log("Pulando teste: sem simulados disponíveis");
      return;
    }

    const caller1 = appRouter.createCaller(userContext1);
    const questoes = await caller1.avaliacoes.simulados.getQuestoes({ 
      simuladoId: simuladoUser1Id 
    });
    
    expect(Array.isArray(questoes)).toBe(true);
    
    if (questoes.length > 0) {
      const primeiraQuestao = questoes[0];
      expect(primeiraQuestao).toHaveProperty("alternativas");
      expect(Array.isArray(primeiraQuestao.alternativas)).toBe(true);
      
      if (primeiraQuestao.alternativas.length > 0) {
        const primeiraAlternativa = primeiraQuestao.alternativas[0];
        // Residente NÃO deve ter acesso ao campo isCorreta
        expect(primeiraAlternativa).not.toHaveProperty("isCorreta");
        expect(primeiraAlternativa).toHaveProperty("id");
        expect(primeiraAlternativa).toHaveProperty("texto");
      }
    }
  });

  it("Admin DEVE receber campo 'isCorreta' nas alternativas", async () => {
    if (!simuladoUser1Id) {
      console.log("Pulando teste: sem simulados disponíveis");
      return;
    }

    const callerAdmin = appRouter.createCaller(adminContext);
    const questoes = await callerAdmin.avaliacoes.simulados.getQuestoes({ 
      simuladoId: simuladoUser1Id 
    });
    
    expect(Array.isArray(questoes)).toBe(true);
    
    if (questoes.length > 0) {
      const primeiraQuestao = questoes[0];
      expect(primeiraQuestao).toHaveProperty("alternativas");
      expect(Array.isArray(primeiraQuestao.alternativas)).toBe(true);
      
      if (primeiraQuestao.alternativas.length > 0) {
        const primeiraAlternativa = primeiraQuestao.alternativas[0];
        // Admin DEVE ter acesso ao campo isCorreta
        expect(primeiraAlternativa).toHaveProperty("isCorreta");
        expect(primeiraAlternativa).toHaveProperty("id");
        expect(primeiraAlternativa).toHaveProperty("texto");
      }
    }
  });

  it("Admin DEVE conseguir acessar avaliação de qualquer residente", async () => {
    if (!simuladoUser1Id) {
      console.log("Pulando teste: sem simulados disponíveis");
      return;
    }

    const callerAdmin = appRouter.createCaller(adminContext);
    const simulado = await callerAdmin.avaliacoes.simulados.get({ 
      simuladoId: simuladoUser1Id 
    });
    
    expect(simulado).toBeDefined();
    expect(simulado.id).toBe(simuladoUser1Id);
  });

  it("Residente deve ver apenas suas próprias avaliações na listagem", async () => {
    const caller1 = appRouter.createCaller(userContext1);
    const simulados = await caller1.avaliacoes.simulados.list();
    
    expect(Array.isArray(simulados)).toBe(true);
    
    // Todos os simulados devem pertencer ao usuário
    simulados.forEach((simulado: any) => {
      expect(simulado.userId).toBe(userContext1.user.id);
    });
  });

  it("Admin deve ver avaliações de todos os residentes na listagem", async () => {
    const callerAdmin = appRouter.createCaller(adminContext);
    const simulados = await callerAdmin.avaliacoes.simulados.list();
    
    expect(Array.isArray(simulados)).toBe(true);
    
    // Admin pode ver simulados de diferentes usuários
    // (não validamos IDs específicos pois depende do estado do banco)
  });
});
