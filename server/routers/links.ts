/**
 * Router para gerenciamento de Links Úteis e Categorias (com suporte a subpastas)
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { linksUteis, linksCategorias } from "../../drizzle/schema";
import { eq, asc, isNull } from "drizzle-orm";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const linksRouter = router({
  // ─── CATEGORIAS ───────────────────────────────────────────────────────────

  // Listar TODAS as categorias ativas (público) — retorna hierarquia plana para o frontend montar a árvore
  listCategorias: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const categorias = await db
      .select()
      .from(linksCategorias)
      .where(eq(linksCategorias.ativo, 1))
      .orderBy(asc(linksCategorias.ordem), asc(linksCategorias.createdAt));

    return categorias;
  }),

  // Criar categoria (admin)
  createCategoria: adminProcedure
    .input(z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      descricao: z.string().optional(),
      icone: z.string().optional(),
      parentId: z.number().nullable().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Se parentId fornecido, verificar que existe e é raiz (não permite mais de 2 níveis)
      if (input.parentId != null) {
        const parent = await db.select().from(linksCategorias).where(eq(linksCategorias.id, input.parentId)).limit(1);
        if (!parent[0]) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pasta pai não encontrada' });
        if (parent[0].parentId != null) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Não é possível criar subpastas de subpastas' });
      }

      await db.insert(linksCategorias).values({
        nome: input.nome,
        descricao: input.descricao || null,
        icone: input.icone || null,
        parentId: input.parentId ?? null,
        ordem: input.ordem,
        ativo: 1,
      });

      return { success: true };
    }),

  // Atualizar categoria (admin)
  updateCategoria: adminProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1).optional(),
      descricao: z.string().optional(),
      icone: z.string().optional(),
      parentId: z.number().nullable().optional(),
      ordem: z.number().optional(),
      ativo: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const existing = await db.select().from(linksCategorias).where(eq(linksCategorias.id, input.id)).limit(1);
      if (!existing[0]) throw new TRPCError({ code: 'NOT_FOUND', message: 'Categoria não encontrada' });

      const updateData: any = {};
      if (input.nome !== undefined) updateData.nome = input.nome;
      if (input.descricao !== undefined) updateData.descricao = input.descricao;
      if (input.icone !== undefined) updateData.icone = input.icone;
      if (input.parentId !== undefined) updateData.parentId = input.parentId;
      if (input.ordem !== undefined) updateData.ordem = input.ordem;
      if (input.ativo !== undefined) updateData.ativo = input.ativo;

      await db.update(linksCategorias).set(updateData).where(eq(linksCategorias.id, input.id));

      return { success: true };
    }),

  // Deletar categoria (admin) — move links e subpastas para pasta pai (ou sem categoria)
  deleteCategoria: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const existing = await db.select().from(linksCategorias).where(eq(linksCategorias.id, input.id)).limit(1);
      if (!existing[0]) throw new TRPCError({ code: 'NOT_FOUND', message: 'Categoria não encontrada' });

      const parentId = existing[0].parentId;

      // Mover links desta categoria para o pai (ou null)
      await db.update(linksUteis)
        .set({ categoriaId: parentId })
        .where(eq(linksUteis.categoriaId, input.id));

      // Mover subpastas desta categoria para o pai (ou null)
      await db.update(linksCategorias)
        .set({ parentId: parentId })
        .where(eq(linksCategorias.parentId, input.id));

      await db.delete(linksCategorias).where(eq(linksCategorias.id, input.id));

      return { success: true };
    }),

  // ─── LINKS ────────────────────────────────────────────────────────────────

  // Listar links ativos com dados da categoria (público)
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    // Buscar todas as categorias ativas
    const todasCategorias = await db
      .select()
      .from(linksCategorias)
      .where(eq(linksCategorias.ativo, 1))
      .orderBy(asc(linksCategorias.ordem), asc(linksCategorias.createdAt));

    // Buscar todos os links ativos com join de categoria
    const cat = linksCategorias;
    const links = await db
      .select({
        id: linksUteis.id,
        titulo: linksUteis.titulo,
        url: linksUteis.url,
        descricao: linksUteis.descricao,
        categoriaId: linksUteis.categoriaId,
        ordem: linksUteis.ordem,
        ativo: linksUteis.ativo,
        createdAt: linksUteis.createdAt,
        categoriaNome: cat.nome,
        categoriaIcone: cat.icone,
        categoriaOrdem: cat.ordem,
        categoriaParentId: cat.parentId,
      })
      .from(linksUteis)
      .leftJoin(cat, eq(linksUteis.categoriaId, cat.id))
      .where(eq(linksUteis.ativo, 1))
      .orderBy(asc(cat.ordem), asc(linksUteis.ordem), asc(linksUteis.createdAt));

    return { links, categorias: todasCategorias };
  }),

  // Criar link (admin)
  create: adminProcedure
    .input(z.object({
      titulo: z.string().min(1, "Título é obrigatório"),
      url: z.string().url("URL inválida"),
      descricao: z.string().optional(),
      categoriaId: z.number().nullable().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.insert(linksUteis).values({
        titulo: input.titulo,
        url: input.url,
        descricao: input.descricao || null,
        categoriaId: input.categoriaId ?? null,
        ordem: input.ordem,
        ativo: 1,
      });

      return { success: true };
    }),

  // Atualizar link (admin)
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(1).optional(),
      url: z.string().url().optional(),
      descricao: z.string().optional(),
      categoriaId: z.number().nullable().optional(),
      ordem: z.number().optional(),
      ativo: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const existing = await db.select().from(linksUteis).where(eq(linksUteis.id, input.id)).limit(1);
      if (!existing[0]) throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });

      const updateData: any = {};
      if (input.titulo !== undefined) updateData.titulo = input.titulo;
      if (input.url !== undefined) updateData.url = input.url;
      if (input.descricao !== undefined) updateData.descricao = input.descricao;
      if (input.categoriaId !== undefined) updateData.categoriaId = input.categoriaId;
      if (input.ordem !== undefined) updateData.ordem = input.ordem;
      if (input.ativo !== undefined) updateData.ativo = input.ativo;

      await db.update(linksUteis).set(updateData).where(eq(linksUteis.id, input.id));

      return { success: true };
    }),

  // Deletar link (admin)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const existing = await db.select().from(linksUteis).where(eq(linksUteis.id, input.id)).limit(1);
      if (!existing[0]) throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });

      await db.delete(linksUteis).where(eq(linksUteis.id, input.id));

      return { success: true };
    }),
});
