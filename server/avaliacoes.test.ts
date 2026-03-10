/**
 * Testes para módulo de Avaliações/Simulados
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, modelosProva, simulados } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Avaliações - Modelos de Prova", () => {
  let adminContext: any;
  let userContext: any;
  let testModeloId: number;

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
  });

  it("Admin deve conseguir listar modelos de prova", async () => {
    const caller = appRouter.createCaller(adminContext);
    const modelos = await caller.avaliacoes.modelos.list();
    expect(Array.isArray(modelos)).toBe(true);
  });

  it("Usuário comum deve conseguir listar modelos de prova", async () => {
    const caller = appRouter.createCaller(userContext);
    const modelos = await caller.avaliacoes.modelos.list();
    expect(Array.isArray(modelos)).toBe(true);
  });

  it("Admin deve conseguir criar modelo de prova", async () => {
    const caller = appRouter.createCaller(adminContext);
    const result = await caller.avaliacoes.modelos.create({
      nome: "Teste Modelo Vitest",
      descricao: "Modelo criado em teste automatizado",
      duracaoMinutos: 60,
      configuracao: {
        "Joelho": 10,
        "Ombro": 10,
      },
    });

    expect(result).toHaveProperty("modeloId");
    expect(typeof result.modeloId).toBe("number");
    testModeloId = result.modeloId;
  });

  it("Usuário comum NÃO deve conseguir criar modelo de prova", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.avaliacoes.modelos.create({
        nome: "Teste Modelo Não Autorizado",
        descricao: "Este modelo não deveria ser criado",
        duracaoMinutos: 60,
        configuracao: {
          "Joelho": 10,
        },
      })
    ).rejects.toThrow();
  });

  it("Admin deve conseguir atualizar modelo de prova", async () => {
    if (!testModeloId) {
      throw new Error("testModeloId não foi definido");
    }

    const caller = appRouter.createCaller(adminContext);
    const result = await caller.avaliacoes.modelos.update({
      modeloId: testModeloId,
      nome: "Teste Modelo Vitest Atualizado",
      duracaoMinutos: 90,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("Admin deve conseguir deletar modelo de prova", async () => {
    if (!testModeloId) {
      throw new Error("testModeloId não foi definido");
    }

    const caller = appRouter.createCaller(adminContext);
    const result = await caller.avaliacoes.modelos.delete({
      modeloId: testModeloId,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });
});

describe("Avaliações - Simulados", () => {
  let userContext: any;
  let adminContext: any;
  let testSimuladoId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const regularUser = await db.select().from(users).where(eq(users.role, "user")).limit(1);
    const adminUser = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    
    if (!regularUser[0] || !adminUser[0]) {
      throw new Error("Test users not found");
    }

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
  });

  it("Usuário deve conseguir listar seus simulados", async () => {
    const caller = appRouter.createCaller(userContext);
    const simulados = await caller.avaliacoes.simulados.list();
    expect(Array.isArray(simulados)).toBe(true);
  });

  it("Usuário deve conseguir gerar um novo simulado", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar um modelo ativo
    const modelos = await db.select().from(modelosProva).where(eq(modelosProva.ativo, 1)).limit(1);
    if (!modelos[0]) {
      console.log("Nenhum modelo ativo encontrado, pulando teste de geração");
      return;
    }

    const caller = appRouter.createCaller(userContext);
    const result = await caller.avaliacoes.simulados.gerar({
      modeloId: modelos[0].id,
    });

    expect(result).toHaveProperty("simuladoId");
    expect(typeof result.simuladoId).toBe("number");
    testSimuladoId = result.simuladoId;
  });

  it("Usuário deve conseguir buscar detalhes de um simulado próprio", async () => {
    if (!testSimuladoId) {
      console.log("testSimuladoId não foi definido, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(userContext);
    const simulado = await caller.avaliacoes.simulados.get({
      simuladoId: testSimuladoId,
    });

    expect(simulado).toHaveProperty("id");
    expect(simulado.id).toBe(testSimuladoId);
    expect(simulado.userId).toBe(userContext.user.id);
  });

  it("Usuário deve conseguir buscar questões de um simulado próprio", async () => {
    if (!testSimuladoId) {
      console.log("testSimuladoId não foi definido, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(userContext);
    const questoes = await caller.avaliacoes.simulados.getQuestoes({
      simuladoId: testSimuladoId,
    });

    expect(Array.isArray(questoes)).toBe(true);
    expect(questoes.length).toBeGreaterThan(0);
    
    // Verificar estrutura da questão
    const primeiraQuestao = questoes[0];
    expect(primeiraQuestao).toHaveProperty("questaoId");
    expect(primeiraQuestao).toHaveProperty("enunciado");
    expect(primeiraQuestao).toHaveProperty("alternativas");
    expect(Array.isArray(primeiraQuestao.alternativas)).toBe(true);
  });

  it("Usuário deve conseguir submeter respostas de um simulado", async () => {
    if (!testSimuladoId) {
      console.log("testSimuladoId não foi definido, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(userContext);
    
    // Buscar questões do simulado
    const questoes = await caller.avaliacoes.simulados.getQuestoes({
      simuladoId: testSimuladoId,
    });

    if (questoes.length === 0) {
      console.log("Nenhuma questão encontrada, pulando teste de submissão");
      return;
    }

    // Criar respostas (primeira alternativa de cada questão)
    const respostas = questoes.map((q: any) => ({
      questaoId: q.questaoId,
      alternativaId: q.alternativas[0]?.id || null,
    }));

    const result = await caller.avaliacoes.simulados.submeter({
      simuladoId: testSimuladoId,
      respostas,
    });

    expect(result).toHaveProperty("totalAcertos");
    expect(result).toHaveProperty("totalQuestoes");
    expect(result).toHaveProperty("percentual");
    expect(typeof result.totalAcertos).toBe("number");
    expect(typeof result.totalQuestoes).toBe("number");
    expect(typeof result.percentual).toBe("number");
  });

  it("Admin deve conseguir deletar simulado", async () => {
    if (!testSimuladoId) {
      console.log("testSimuladoId não foi definido, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(adminContext);
    const result = await caller.avaliacoes.simulados.delete({
      simuladoId: testSimuladoId,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    
    // Verificar que foi deletado
    const db = await getDb();
    const deleted = await db!.select().from(simulados).where(eq(simulados.id, testSimuladoId));
    expect(deleted.length).toBe(0);
  });

  it("Usuário comum NÃO deve conseguir deletar simulado", async () => {
    const caller = appRouter.createCaller(userContext);
    
    await expect(
      caller.avaliacoes.simulados.delete({ simuladoId: 999 })
    ).rejects.toThrow();
  });

  it("Admin deve conseguir gerar PDF de avaliação concluída", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar um simulado concluído
    const simuladosConcluidos = await db
      .select()
      .from(simulados)
      .where(eq(simulados.concluido, 1))
      .limit(1);

    if (simuladosConcluidos.length === 0) {
      console.log("Nenhum simulado concluído encontrado, pulando teste de PDF");
      return;
    }

    const caller = appRouter.createCaller(adminContext);
    const result = await caller.avaliacoes.simulados.gerarPDF({
      simuladoId: simuladosConcluidos[0].id,
    });

    expect(result).toHaveProperty("pdf");
    expect(result).toHaveProperty("filename");
    expect(typeof result.pdf).toBe("string");
    expect(result.pdf.length).toBeGreaterThan(0);
    expect(result.filename).toContain(".pdf");
  });

  it("Admin NÃO deve conseguir gerar PDF de avaliação não concluída", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar um simulado não concluído
    const simuladosEmAndamento = await db
      .select()
      .from(simulados)
      .where(eq(simulados.concluido, 0))
      .limit(1);

    if (simuladosEmAndamento.length === 0) {
      console.log("Nenhum simulado em andamento encontrado, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(adminContext);
    
    await expect(
      caller.avaliacoes.simulados.gerarPDF({ simuladoId: simuladosEmAndamento[0].id })
    ).rejects.toThrow("ainda não foi concluída");
  });
});

describe("Avaliações - Dashboard", () => {
  let userContext: any;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const regularUser = await db.select().from(users).where(eq(users.role, "user")).limit(1);
    if (!regularUser[0]) {
      throw new Error("Test user not found");
    }

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
  });

  it("Usuário deve conseguir buscar estatísticas do dashboard", async () => {
    const caller = appRouter.createCaller(userContext);
    const stats = await caller.avaliacoes.dashboard.stats();

    expect(stats).toHaveProperty("totalSimulados");
    expect(stats).toHaveProperty("mediaAcertos");
    expect(stats).toHaveProperty("melhorDesempenho");
    expect(stats).toHaveProperty("piorDesempenho");
    expect(typeof stats.totalSimulados).toBe("number");
    expect(typeof stats.mediaAcertos).toBe("number");
  });
});

describe("Avaliações - Especialidades", () => {
  let userContext: any;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const regularUser = await db.select().from(users).where(eq(users.role, "user")).limit(1);
    if (!regularUser[0]) {
      throw new Error("Test user not found");
    }

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
  });

  it("Usuário deve conseguir listar especialidades", async () => {
    const caller = appRouter.createCaller(userContext);
    const especialidades = await caller.avaliacoes.especialidades.list();

    expect(Array.isArray(especialidades)).toBe(true);
    expect(especialidades.length).toBeGreaterThan(0);
    
    // Verificar estrutura da especialidade
    const primeiraEsp = especialidades[0];
    expect(primeiraEsp).toHaveProperty("id");
    expect(primeiraEsp).toHaveProperty("nome");
  });
});

describe("Avaliações - Atomicidade da Transação (Race Condition)", () => {
  let userContext: any;
  let adminContext: any;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const regularUser = await db.select().from(users).where(eq(users.role, "user")).limit(1);
    const adminUser = await db.select().from(users).where(eq(users.role, "admin")).limit(1);

    if (!regularUser[0] || !adminUser[0]) {
      throw new Error("Test users not found");
    }

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
  });

  it("Submissão duplicada deve ser rejeitada (proteção contra race condition)", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Criar um simulado para testar
    const modelos = await db.select().from(modelosProva).where(eq(modelosProva.ativo, 1)).limit(1);
    if (!modelos[0]) {
      console.log("Nenhum modelo ativo encontrado, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(userContext);
    const gerado = await caller.avaliacoes.simulados.gerar({ modeloId: modelos[0].id });
    const simuladoId = gerado.simuladoId;

    // Buscar questões do simulado
    const questoes = await caller.avaliacoes.simulados.getQuestoes({ simuladoId });
    if (questoes.length === 0) {
      console.log("Nenhuma questão encontrada, pulando teste");
      return;
    }

    const respostas = questoes.map((q: any) => ({
      questaoId: q.questaoId,
      alternativaId: q.alternativas[0]?.id || null,
    }));

    // Primeira submissão deve funcionar
    const resultado1 = await caller.avaliacoes.simulados.submeter({ simuladoId, respostas });
    expect(resultado1).toHaveProperty("totalAcertos");
    expect(resultado1).toHaveProperty("percentual");

    // Segunda submissão do mesmo simulado deve ser rejeitada (já concluído)
    await expect(
      caller.avaliacoes.simulados.submeter({ simuladoId, respostas })
    ).rejects.toThrow("já foi concluído");

    // Verificar que totalAcertos não foi duplicado (integridade dos dados)
    const [simuladoFinal] = await db
      .select()
      .from(simulados)
      .where(eq(simulados.id, simuladoId))
      .limit(1);

    expect(simuladoFinal.concluido).toBe(1);
    expect(simuladoFinal.totalAcertos).toBe(resultado1.totalAcertos);

    // Limpar
    await db.delete(simulados).where(eq(simulados.id, simuladoId));
  });

  it("Dois requests simultâneos não devem duplicar totalAcertos", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const modelos = await db.select().from(modelosProva).where(eq(modelosProva.ativo, 1)).limit(1);
    if (!modelos[0]) {
      console.log("Nenhum modelo ativo encontrado, pulando teste");
      return;
    }

    const caller = appRouter.createCaller(userContext);
    const gerado = await caller.avaliacoes.simulados.gerar({ modeloId: modelos[0].id });
    const simuladoId = gerado.simuladoId;

    const questoes = await caller.avaliacoes.simulados.getQuestoes({ simuladoId });
    if (questoes.length === 0) {
      console.log("Nenhuma questão encontrada, pulando teste");
      return;
    }

    const respostas = questoes.map((q: any) => ({
      questaoId: q.questaoId,
      alternativaId: q.alternativas[0]?.id || null,
    }));

    // Disparar dois requests simultâneos (simula race condition)
    const [res1, res2] = await Promise.allSettled([
      caller.avaliacoes.simulados.submeter({ simuladoId, respostas }),
      caller.avaliacoes.simulados.submeter({ simuladoId, respostas }),
    ]);

    // Exatamente um deve ter sucesso e o outro deve falhar
    const sucessos = [res1, res2].filter(r => r.status === "fulfilled");
    const falhas = [res1, res2].filter(r => r.status === "rejected");

    expect(sucessos.length).toBe(1);
    expect(falhas.length).toBe(1);

    // Verificar que totalAcertos não foi duplicado
    const [simuladoFinal] = await db
      .select()
      .from(simulados)
      .where(eq(simulados.id, simuladoId))
      .limit(1);

    const resultadoSucesso = (sucessos[0] as PromiseFulfilledResult<any>).value;
    expect(simuladoFinal.totalAcertos).toBe(resultadoSucesso.totalAcertos);
    expect(simuladoFinal.concluido).toBe(1);

    // Limpar
    await db.delete(simulados).where(eq(simulados.id, simuladoId));
  });
});
