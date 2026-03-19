/**
 * Router para gerenciamento de Links Úteis e Categorias
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { linksUteis, linksCategorias } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const linksRouter = router({
  // ─── CATEGORIAS ───────────────────────────────────────────────────────────

  // Listar categorias ativas com seus links (público)
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

  // Listar todas as categorias (admin)
  listAllCategorias: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    return db
      .select()
      .from(linksCategorias)
      .orderBy(asc(linksCategorias.ordem), asc(linksCategorias.createdAt));
  }),

  // Criar categoria (admin)
  createCategoria: adminProcedure
    .input(z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      descricao: z.string().optional(),
      icone: z.string().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.insert(linksCategorias).values({
        nome: input.nome,
        descricao: input.descricao || null,
        icone: input.icone || null,
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
      if (input.ordem !== undefined) updateData.ordem = input.ordem;
      if (input.ativo !== undefined) updateData.ativo = input.ativo;

      await db.update(linksCategorias).set(updateData).where(eq(linksCategorias.id, input.id));

      return { success: true };
    }),

  // Deletar categoria (admin) — move links para "sem categoria"
  deleteCategoria: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const existing = await db.select().from(linksCategorias).where(eq(linksCategorias.id, input.id)).limit(1);
      if (!existing[0]) throw new TRPCError({ code: 'NOT_FOUND', message: 'Categoria não encontrada' });

      // Mover links da categoria para "sem categoria"
      await db.update(linksUteis)
        .set({ categoriaId: null })
        .where(eq(linksUteis.categoriaId, input.id));

      await db.delete(linksCategorias).where(eq(linksCategorias.id, input.id));

      return { success: true };
    }),

  // ─── LINKS ────────────────────────────────────────────────────────────────

  // Listar links ativos com dados da categoria (público)
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

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
        categoriaNome: linksCategorias.nome,
        categoriaIcone: linksCategorias.icone,
        categoriaOrdem: linksCategorias.ordem,
      })
      .from(linksUteis)
      .leftJoin(linksCategorias, eq(linksUteis.categoriaId, linksCategorias.id))
      .where(eq(linksUteis.ativo, 1))
      .orderBy(asc(linksCategorias.ordem), asc(linksUteis.ordem), asc(linksUteis.createdAt));

    return links;
  }),

  // Listar todos os links (admin)
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

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
        categoriaNome: linksCategorias.nome,
        categoriaIcone: linksCategorias.icone,
      })
      .from(linksUteis)
      .leftJoin(linksCategorias, eq(linksUteis.categoriaId, linksCategorias.id))
      .orderBy(asc(linksCategorias.ordem), asc(linksUteis.ordem), asc(linksUteis.createdAt));

    return links;
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
