/**
 * Testes para Links Úteis
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Links Úteis", () => {
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

  const userContext: Context = {
    user: {
      id: 2,
      openId: "user-test",
      email: "user@test.com",
      name: "User Test",
      role: "user",
    },
  };

  it("Usuário comum deve conseguir listar links ativos", async () => {
    const caller = appRouter.createCaller(userContext);
    const links = await caller.links.list();
    
    expect(Array.isArray(links)).toBe(true);
    // Todos os links retornados devem estar ativos
    links.forEach((link: any) => {
      expect(link.ativo).toBe(1);
    });
  });

  it("Admin deve conseguir listar todos os links (ativos e inativos)", async () => {
    const caller = appRouter.createCaller(adminContext);
    const links = await caller.links.listAll();
    
    expect(Array.isArray(links)).toBe(true);
  });

  it("Admin deve conseguir criar novo link", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    const result = await caller.links.create({
      titulo: "Link de Teste",
      url: "https://example.com/test",
      descricao: "Descrição de teste",
      ordem: 10,
    });
    
    expect(result.success).toBe(true);
  });

  it("Admin deve conseguir atualizar link existente", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    // Buscar um link existente
    const links = await caller.links.listAll();
    if (links.length === 0) {
      console.log("Pulando teste: sem links disponíveis");
      return;
    }
    
    const linkId = links[0].id;
    
    const result = await caller.links.update({
      id: linkId,
      titulo: "Título Atualizado",
    });
    
    expect(result.success).toBe(true);
  });

  it("Admin deve conseguir deletar link", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    // Criar um link para deletar
    await caller.links.create({
      titulo: "Link para Deletar",
      url: "https://example.com/delete",
      ordem: 999,
    });
    
    // Buscar o link criado
    const links = await caller.links.listAll();
    const linkParaDeletar = links.find((l: any) => l.titulo === "Link para Deletar");
    
    if (!linkParaDeletar) {
      console.log("Pulando teste: link não encontrado");
      return;
    }
    
    const result = await caller.links.delete({
      id: linkParaDeletar.id,
    });
    
    expect(result.success).toBe(true);
  });

  it("Usuário comum NÃO deve conseguir criar link", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.links.create({
        titulo: "Link Não Autorizado",
        url: "https://example.com/unauthorized",
        ordem: 0,
      })
    ).rejects.toThrow("Acesso negado");
  });

  it("Usuário comum NÃO deve conseguir deletar link", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.links.delete({ id: 1 })
    ).rejects.toThrow("Acesso negado");
  });

  it("Deve validar URL inválida ao criar link", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    await expect(
      caller.links.create({
        titulo: "Link com URL Inválida",
        url: "url-invalida",
        ordem: 0,
      })
    ).rejects.toThrow();
  });

  it("Deve validar título obrigatório ao criar link", async () => {
    const caller = appRouter.createCaller(adminContext);
    
    await expect(
      caller.links.create({
        titulo: "",
        url: "https://example.com",
        ordem: 0,
      })
    ).rejects.toThrow();
  });
});
