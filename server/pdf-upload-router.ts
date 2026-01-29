import { router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { storagePut } from "./storage";
import { 
  downloadPDF, 
  extractRotationsFromPDF, 
  extractActivitiesFromPDF,
  extractTextFromPDF 
} from "./pdf-parser";
import * as importsDb from "./db-helpers/imports";

// Helper para procedures que requerem papel ADMIN
import { protectedProcedure } from "./_core/trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
    });
  }
  return next({ ctx });
});

export const pdfRouter = router({
  /**
   * Upload de PDF para S3 e criação de registro de import
   */
  uploadPDF: adminProcedure
    .input(z.object({
      tipo: z.enum(["RODIZIO", "CRONOGRAMA"]),
      fileName: z.string(),
      fileData: z.string(), // Base64
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Converter base64 para buffer
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Gerar key único para S3
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `imports/${ctx.user.id}/${timestamp}-${randomSuffix}-${input.fileName}`;
        
        // Upload para S3
        const { url } = await storagePut(fileKey, buffer, 'application/pdf');
        
        // Criar registro de import
        const importRecord = await importsDb.createImport({
          tipo: input.tipo,
          arquivoNome: input.fileName,
          arquivoUrl: url,
          arquivoKey: fileKey,
          usuarioAdminId: ctx.user.id,
          status: "PENDENTE",
        });
        
        return {
          importId: Number((importRecord as any).insertId),
          url,
          fileKey,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao fazer upload do PDF: ${error}`,
        });
      }
    }),

  /**
   * Extrai dados de um PDF já enviado
   */
  extractPDF: adminProcedure
    .input(z.object({
      importId: z.number(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Buscar registro de import
        const importRecord = await importsDb.getImportById(input.importId);
        
        if (!importRecord) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Import não encontrado',
          });
        }
        
        // Atualizar status para PROCESSANDO
        await importsDb.updateImport(input.importId, {
          status: "PROCESSANDO",
        });
        
        // Download do PDF do S3
        const pdfBuffer = await downloadPDF(importRecord.arquivoUrl);
        
        // Extrair dados baseado no tipo
        let extractedData: any;
        let logValidacao = "";
        
        if (importRecord.tipo === "RODIZIO") {
          extractedData = await extractRotationsFromPDF(pdfBuffer);
          logValidacao = `Extraídos ${extractedData.length} rodízios`;
        } else {
          extractedData = await extractActivitiesFromPDF(pdfBuffer);
          logValidacao = `Extraídas ${extractedData.length} atividades`;
        }
        
        // Atualizar status para CONCLUIDO
        await importsDb.updateImport(input.importId, {
          status: "CONCLUIDO",
          logValidacao,
        });
        
        return {
          success: true,
          data: extractedData,
          tipo: importRecord.tipo,
        };
      } catch (error) {
        // Atualizar status para ERRO
        await importsDb.updateImport(input.importId, {
          status: "ERRO",
          logValidacao: `Erro na extração: ${error}`,
        });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao extrair dados do PDF: ${error}`,
        });
      }
    }),

  /**
   * Pré-visualização do PDF (extrai apenas texto)
   */
  previewPDF: adminProcedure
    .input(z.object({
      importId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const importRecord = await importsDb.getImportById(input.importId);
        
        if (!importRecord) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Import não encontrado',
          });
        }
        
        // Download do PDF do S3
        const pdfBuffer = await downloadPDF(importRecord.arquivoUrl);
        
        // Extrair texto
        const parsed = await extractTextFromPDF(pdfBuffer);
        
        return {
          text: parsed.text.substring(0, 5000), // Primeiros 5000 caracteres
          pages: parsed.metadata.pages,
          tables: parsed.tables.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao visualizar PDF: ${error}`,
        });
      }
    }),
});
