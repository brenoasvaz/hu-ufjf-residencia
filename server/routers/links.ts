/**
 * Router para gerenciamento de Links Úteis
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { linksUteis } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const linksRouter = router({
  // Listar links ativos (público)
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const links = await db
      .select()
      .from(linksUteis)
      .where(eq(linksUteis.ativo, 1))
      .orderBy(linksUteis.ordem, linksUteis.createdAt);

    return links;
  }),

  // Listar todos os links (admin apenas)
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const links = await db
      .select()
      .from(linksUteis)
      .orderBy(linksUteis.ordem, linksUteis.createdAt);

    return links;
  }),

  // Criar link (admin apenas)
  create: adminProcedure
    .input(
      z.object({
        titulo: z.string().min(1, "Título é obrigatório"),
        url: z.string().url("URL inválida"),
        descricao: z.string().optional(),
        ordem: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.insert(linksUteis).values({
        titulo: input.titulo,
        url: input.url,
        descricao: input.descricao || null,
        ordem: input.ordem,
        ativo: 1,
      });

      return { success: true };
    }),

  // Atualizar link (admin apenas)
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().min(1, "Título é obrigatório").optional(),
        url: z.string().url("URL inválida").optional(),
        descricao: z.string().optional(),
        ordem: z.number().optional(),
        ativo: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se o link existe
      const existingLink = await db.select().from(linksUteis).where(eq(linksUteis.id, input.id)).limit(1);
      if (!existingLink[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });
      }

      // Preparar dados para atualização
      const updateData: any = {};
      if (input.titulo !== undefined) updateData.titulo = input.titulo;
      if (input.url !== undefined) updateData.url = input.url;
      if (input.descricao !== undefined) updateData.descricao = input.descricao;
      if (input.ordem !== undefined) updateData.ordem = input.ordem;
      if (input.ativo !== undefined) updateData.ativo = input.ativo;

      await db.update(linksUteis).set(updateData).where(eq(linksUteis.id, input.id));

      return { success: true };
    }),

  // Deletar link (admin apenas)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se o link existe
      const existingLink = await db.select().from(linksUteis).where(eq(linksUteis.id, input.id)).limit(1);
      if (!existingLink[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Link não encontrado' });
      }

      await db.delete(linksUteis).where(eq(linksUteis.id, input.id));

      return { success: true };
    }),
});
