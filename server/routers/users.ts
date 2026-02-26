/**
 * Router para gerenciamento de usuários (Admin apenas)
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const usersRouter = router({
  // Listar todos os usuários (admin apenas)
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const allUsers = await db
      .select({
        id: users.id,
        openId: users.openId,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return allUsers;
  }),

  // Editar usuário (admin apenas)
  update: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(['admin', 'user']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verificar se o usuário existe
      const existingUser = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!existingUser[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }

      // Não permitir que o admin remova suas próprias credenciais
      if (input.userId === ctx.user.id && input.role === 'user') {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Você não pode remover suas próprias credenciais de administrador' 
        });
      }

      // Preparar dados para atualização
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.role !== undefined) updateData.role = input.role;

      // Atualizar usuário
      await db.update(users).set(updateData).where(eq(users.id, input.userId));

      return { success: true };
    }),

  // Buscar usuário por ID (admin apenas)
  getById: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const user = await db
        .select({
          id: users.id,
          openId: users.openId,
          email: users.email,
          name: users.name,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user[0]) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }

      return user[0];
    }),
});
