import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { clubeRevista } from "../../drizzle/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { storagePut } from "../storage";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores podem realizar esta ação.",
    });
  }
  return next({ ctx });
});

export const clubeRevistaRouter = router({
  /**
   * Listar artigos do Clube de Revista por ano (e opcionalmente mês)
   */
  list: protectedProcedure
    .input(
      z.object({
        year: z.number().int().min(2020).max(2100),
        month: z.number().int().min(1).max(12).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const { year, month } = input;

      let startDate: Date;
      let endDate: Date;

      if (month !== undefined) {
        startDate = new Date(year, month - 1, 1, 0, 0, 0);
        endDate = new Date(year, month, 0, 23, 59, 59);
      } else {
        startDate = new Date(year, 0, 1, 0, 0, 0);
        endDate = new Date(year, 11, 31, 23, 59, 59);
      }

      const rows = await db
        .select()
        .from(clubeRevista)
        .where(
          and(
            eq(clubeRevista.ativo, 1),
            gte(clubeRevista.data, startDate),
            lte(clubeRevista.data, endDate)
          )
        )
        .orderBy(asc(clubeRevista.data), asc(clubeRevista.id));

      return rows;
    }),

  /**
   * Buscar um artigo por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      const [row] = await db
        .select()
        .from(clubeRevista)
        .where(and(eq(clubeRevista.id, input.id), eq(clubeRevista.ativo, 1)));

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artigo não encontrado" });
      }
      return row;
    }),

  /**
   * Criar novo artigo no cronograma (admin)
   */
  create: adminProcedure
    .input(
      z.object({
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
        tituloArtigo: z.string().min(1).max(500),
        autores: z.string().max(500).optional(),
        revista: z.string().max(255).optional(),
        anoPublicacao: z.number().int().min(1900).max(2100).optional(),
        residenteApresentador: z.string().max(255).optional(),
        preceptor: z.string().max(255).optional(),
        observacao: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      // Converter string YYYY-MM-DD para Date (meio-dia para evitar problemas de timezone)
      const [y, m, d] = input.data.split("-").map(Number);
      const dataDate = new Date(y, m - 1, d, 12, 0, 0);

      const result = await db.insert(clubeRevista).values({
        data: dataDate,
        tituloArtigo: input.tituloArtigo,
        autores: input.autores ?? null,
        revista: input.revista ?? null,
        anoPublicacao: input.anoPublicacao ?? null,
        residenteApresentador: input.residenteApresentador ?? null,
        preceptor: input.preceptor ?? null,
        observacao: input.observacao ?? null,
        ativo: 1,
      });
      return { id: Number((result as any).insertId) };
    }),

  /**
   * Atualizar artigo (admin)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        tituloArtigo: z.string().min(1).max(500).optional(),
        autores: z.string().max(500).nullable().optional(),
        revista: z.string().max(255).nullable().optional(),
        anoPublicacao: z.number().int().min(1900).max(2100).nullable().optional(),
        residenteApresentador: z.string().max(255).nullable().optional(),
        preceptor: z.string().max(255).nullable().optional(),
        observacao: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      const { id, data: dataStr, ...fields } = input;
      const updateData: Record<string, unknown> = {};

      if (dataStr !== undefined) {
        const [y, m, d] = dataStr.split("-").map(Number);
        updateData.data = new Date(y, m - 1, d, 12, 0, 0);
      }
      if (fields.tituloArtigo !== undefined) updateData.tituloArtigo = fields.tituloArtigo;
      if (fields.autores !== undefined) updateData.autores = fields.autores;
      if (fields.revista !== undefined) updateData.revista = fields.revista;
      if (fields.anoPublicacao !== undefined) updateData.anoPublicacao = fields.anoPublicacao;
      if (fields.residenteApresentador !== undefined) updateData.residenteApresentador = fields.residenteApresentador;
      if (fields.preceptor !== undefined) updateData.preceptor = fields.preceptor;
      if (fields.observacao !== undefined) updateData.observacao = fields.observacao;

      await db.update(clubeRevista).set(updateData).where(eq(clubeRevista.id, id));
      return { success: true };
    }),

  /**
   * Excluir artigo (admin) - soft delete
   */
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      await db
        .update(clubeRevista)
        .set({ ativo: 0 })
        .where(eq(clubeRevista.id, input.id));
      return { success: true };
    }),

  /**
   * Upload de PDF do artigo (admin)
   * Recebe base64, faz upload para S3 e atualiza o registro
   */
  uploadPDF: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        fileName: z.string(),
        fileData: z.string(), // Base64
        mimeType: z.string().default("application/pdf"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      // Verificar se o artigo existe
      const [artigo] = await db
        .select()
        .from(clubeRevista)
        .where(eq(clubeRevista.id, input.id));

      if (!artigo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artigo não encontrado" });
      }

      // Converter base64 para buffer
      const buffer = Buffer.from(input.fileData, "base64");

      // Gerar key única no S3
      const ts = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `clube-revista/${ctx.user.id}/${ts}-${randomSuffix}-${safeFileName}`;

      // Upload para S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Atualizar registro no banco
      await db
        .update(clubeRevista)
        .set({
          pdfUrl: url,
          pdfKey: fileKey,
          pdfNome: input.fileName,
        })
        .where(eq(clubeRevista.id, input.id));

      return { url, fileKey, fileName: input.fileName };
    }),

  /**
   * Remover PDF do artigo (admin)
   */
  removePDF: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      await db
        .update(clubeRevista)
        .set({ pdfUrl: null, pdfKey: null, pdfNome: null })
        .where(eq(clubeRevista.id, input.id));
      return { success: true };
    }),

  /**
   * Buscar artigo do Clube de Revista pela data (para vincular com reuniões clínicas)
   * Retorna o artigo cujo campo 'data' coincide com a data informada (mesmo dia)
   */
  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [y, m, d] = input.date.split("-").map(Number);
      const startOfDay = new Date(y, m - 1, d, 0, 0, 0);
      const endOfDay = new Date(y, m - 1, d, 23, 59, 59);

      const rows = await db
        .select()
        .from(clubeRevista)
        .where(
          and(
            eq(clubeRevista.ativo, 1),
            gte(clubeRevista.data, startOfDay),
            lte(clubeRevista.data, endOfDay)
          )
        )
        .orderBy(asc(clubeRevista.id))
        .limit(1);

      return rows[0] ?? null;
    }),

  /**
   * Trocar datas entre dois artigos (admin)
   * Recebe os IDs dos dois artigos e troca suas datas
   */
  swapDates: adminProcedure
    .input(
      z.object({
        idA: z.number().int(),
        idB: z.number().int(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      const { idA, idB } = input;

      if (idA === idB) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Selecione dois artigos diferentes para trocar as datas." });
      }

      // Buscar os dois artigos
      const [artigoA] = await db
        .select({ id: clubeRevista.id, data: clubeRevista.data })
        .from(clubeRevista)
        .where(and(eq(clubeRevista.id, idA), eq(clubeRevista.ativo, 1)));

      const [artigoB] = await db
        .select({ id: clubeRevista.id, data: clubeRevista.data })
        .from(clubeRevista)
        .where(and(eq(clubeRevista.id, idB), eq(clubeRevista.ativo, 1)));

      if (!artigoA) throw new TRPCError({ code: "NOT_FOUND", message: "Primeiro artigo não encontrado." });
      if (!artigoB) throw new TRPCError({ code: "NOT_FOUND", message: "Segundo artigo não encontrado." });

      // Trocar as datas
      await db.update(clubeRevista).set({ data: artigoB.data }).where(eq(clubeRevista.id, idA));
      await db.update(clubeRevista).set({ data: artigoA.data }).where(eq(clubeRevista.id, idB));

      return { success: true, dataA: artigoB.data, dataB: artigoA.data };
    }),

  /**
   * Anos disponíveis no cronograma
   */
  availableYears: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [new Date().getFullYear()];

    const rows = await db
      .select({ data: clubeRevista.data })
      .from(clubeRevista)
      .where(eq(clubeRevista.ativo, 1))
      .orderBy(desc(clubeRevista.data));

    const years = new Set<number>();
    for (const row of rows) {
      if (row.data) {
        const year = new Date(row.data).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    }

    const currentYear = new Date().getFullYear();
    years.add(currentYear);

    return Array.from(years).sort((a, b) => b - a);
  }),
});
