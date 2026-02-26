import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as residentsDb from "./db-helpers/residents";
import * as rotationsDb from "./db-helpers/rotations";
import * as weeklyActivitiesDb from "./db-helpers/weeklyActivities";
import * as importsDb from "./db-helpers/imports";
import * as clinicalMeetingsDb from "./db";
import { pdfRouter } from "./pdf-upload-router";
import { registerUser, authenticateUser, getUserByEmail, getAllUsers, approveUser, rejectUser } from "./auth";
import { sdk } from "./_core/sdk";
import jwt from "jsonwebtoken";

// Helper para procedures que requerem papel ADMIN
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
    });
  }
  return next({ ctx });
});

// Helper para procedures que requerem qualquer usuário autenticado (ADMIN ou VIEWER)
const viewerProcedure = protectedProcedure;

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Get pending users count for admin badge
    pendingCount: adminProcedure.query(async () => {
      const pendingUsers = await getAllUsers('pending');
      return pendingUsers.length;
    }),
    
    // Generate SSO token for external platform integration
    generateSSOToken: protectedProcedure.query(({ ctx }) => {
      const ssoSecret = process.env.JWT_SSO_SECRET || process.env.JWT_SECRET;
      
      if (!ssoSecret) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'JWT_SSO_SECRET não configurado'
        });
      }
      
      const token = jwt.sign(
        {
          userId: ctx.user.id,
          email: ctx.user.email,
          name: ctx.user.name,
          role: ctx.user.role,
        },
        ssoSecret,
        { expiresIn: '5m' } // Token expires in 5 minutes
      );
      
      return { token };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    
    // Internal authentication - Register
    register: publicProcedure
      .input(z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await registerUser({
            email: input.email,
            password: input.password,
            name: input.name,
            role: 'user',
          });
          
          // Create session token for the new user
          const sessionToken = await sdk.createSessionToken(input.email, {
            name: input.name,
            expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
          });
          
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { 
            ...cookieOptions, 
            maxAge: 365 * 24 * 60 * 60 * 1000 
          });
          
          return { success: true, user };
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : 'Erro ao registrar usuário',
          });
        }
      }),
    
    // Internal authentication - Login
    login: publicProcedure
      .input(z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(1, 'Senha é obrigatória'),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await authenticateUser({
            email: input.email,
            password: input.password,
          });
          
          // Create session token
          const sessionToken = await sdk.createSessionToken(input.email, {
            name: user.name || '',
            expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 year
          });
          
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { 
            ...cookieOptions, 
            maxAge: 365 * 24 * 60 * 60 * 1000 
          });
          
          return { success: true, user };
        } catch (error) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: error instanceof Error ? error.message : 'Email ou senha inválidos',
          });
        }
      }),
  }),

  // ===== USER MANAGEMENT =====
  users: router({
    list: adminProcedure
      .input(z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
      }).optional())
      .query(async ({ input }) => {
        const users = await getAllUsers(input?.status);
        // Remove sensitive data
        return users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          accountStatus: u.accountStatus,
          loginMethod: u.loginMethod,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        }));
      }),
    
    approve: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await approveUser(input.userId);
        return { success: true };
      }),
    
    reject: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await rejectUser(input.userId);
        return { success: true };
      }),
  }),

  // ===== RESIDENTS =====
  residents: router({
    list: viewerProcedure
      .input(z.object({
        anoResidencia: z.enum(["R1", "R2", "R3"]).optional(),
        ativo: z.boolean().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return residentsDb.getAllResidents(input);
      }),
    
    getById: viewerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return residentsDb.getResidentById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        nomeCompleto: z.string(),
        apelido: z.string().optional(),
        anoResidencia: z.enum(["R1", "R2", "R3"]),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return residentsDb.createResident(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nomeCompleto: z.string().optional(),
        apelido: z.string().optional(),
        anoResidencia: z.enum(["R1", "R2", "R3"]).optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return residentsDb.updateResident(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return residentsDb.deleteResident(input.id);
      }),
  }),

  // ===== ROTATIONS =====
  rotations: router({
    list: viewerProcedure
      .input(z.object({
        mesReferencia: z.string().optional(),
        localEstagio: z.string().optional(),
        residentId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return rotationsDb.getAllRotations(input);
      }),
    
    getById: viewerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return rotationsDb.getRotationWithAssignments(input.id);
      }),
    
    getByDateRange: viewerProcedure
      .input(z.object({
        dataInicio: z.date(),
        dataFim: z.date(),
      }))
      .query(async ({ input }) => {
        return rotationsDb.getRotationsByDateRange(input.dataInicio, input.dataFim);
      }),
    
    create: adminProcedure
      .input(z.object({
        dataInicio: z.date(),
        dataFim: z.date(),
        mesReferencia: z.string(),
        localEstagio: z.string(),
        descricao: z.string().optional(),
        assignments: z.array(z.object({
          residentId: z.number(),
          papelNaDupla: z.string().optional(),
          duplaId: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { assignments, ...rotationData } = input;
        
        // Validar conflitos para cada residente
        if (assignments) {
          for (const assignment of assignments) {
            const conflicts = await rotationsDb.checkRotationConflicts(
              assignment.residentId,
              input.dataInicio,
              input.dataFim
            );
            
            if (conflicts.length > 0) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Conflito detectado: Residente ${assignment.residentId} já possui rodízio no período.`
              });
            }
          }
        }
        
        const result = await rotationsDb.createRotation(rotationData);
        const insertId = Number((result as any).insertId);
        
        // Criar assignments
        if (assignments) {
          for (const assignment of assignments) {
            await rotationsDb.assignResidentToRotation({
              rotationId: insertId,
              ...assignment,
            });
          }
        }
        
        return rotationsDb.getRotationWithAssignments(insertId);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        dataInicio: z.date().optional(),
        dataFim: z.date().optional(),
        mesReferencia: z.string().optional(),
        localEstagio: z.string().optional(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return rotationsDb.updateRotation(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return rotationsDb.deleteRotation(input.id);
      }),
    
    checkConflicts: adminProcedure
      .input(z.object({
        residentId: z.number(),
        dataInicio: z.date(),
        dataFim: z.date(),
        excludeRotationId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return rotationsDb.checkRotationConflicts(
          input.residentId,
          input.dataInicio,
          input.dataFim,
          input.excludeRotationId
        );
      }),
  }),

  // ===== WEEKLY ACTIVITIES =====
  weeklyActivities: router({
    list: viewerProcedure
      .input(z.object({
        diaSemana: z.number().min(0).max(6).optional(),
        anoResidencia: z.enum(["R1", "R2", "R3"]).optional(),
        bloco: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return weeklyActivitiesDb.getAllWeeklyActivities(input);
      }),
    
    getById: viewerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return weeklyActivitiesDb.getActivityWithAudiences(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        diaSemana: z.number().min(0).max(6),
        horaInicio: z.string(),
        horaFim: z.string(),
        titulo: z.string(),
        descricao: z.string().optional(),
        local: z.string().optional(),
        recorrente: z.number().optional(),
        observacao: z.string().optional(),
        audiences: z.array(z.object({
          anoResidencia: z.enum(["R1", "R2", "R3"]).optional(),
          bloco: z.string().optional(),
          opcional: z.number().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { audiences, ...activityData } = input;
        
        const result = await weeklyActivitiesDb.createWeeklyActivity(activityData);
        const insertId = Number((result as any).insertId);
        
        // Criar audiences
        if (audiences) {
          for (const audience of audiences) {
            await weeklyActivitiesDb.addActivityAudience({
              activityId: insertId,
              ...audience,
            });
          }
        }
        
        return weeklyActivitiesDb.getActivityWithAudiences(insertId);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        diaSemana: z.number().min(0).max(6).optional(),
        horaInicio: z.string().optional(),
        horaFim: z.string().optional(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        local: z.string().optional(),
        recorrente: z.number().optional(),
        observacao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return weeklyActivitiesDb.updateWeeklyActivity(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return weeklyActivitiesDb.deleteWeeklyActivity(input.id);
      }),
  }),

  // ===== IMPORTS =====
  imports: router({
    list: viewerProcedure
      .input(z.object({
        tipo: z.enum(["RODIZIO", "CRONOGRAMA"]).optional(),
        status: z.enum(["PENDENTE", "PROCESSANDO", "CONCLUIDO", "ERRO"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return importsDb.getAllImports(input);
      }),
    
    getById: viewerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return importsDb.getImportById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        tipo: z.enum(["RODIZIO", "CRONOGRAMA"]),
        arquivoNome: z.string(),
        arquivoUrl: z.string(),
        arquivoKey: z.string(),
        status: z.enum(["PENDENTE", "PROCESSANDO", "CONCLUIDO", "ERRO"]),
        logValidacao: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return importsDb.createImport({
          ...input,
          usuarioAdminId: ctx.user.id,
        });
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["PENDENTE", "PROCESSANDO", "CONCLUIDO", "ERRO"]).optional(),
        logValidacao: z.string().optional(),
        registrosCriados: z.number().optional(),
        registrosAtualizados: z.number().optional(),
        registrosIgnorados: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return importsDb.updateImport(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return importsDb.deleteImport(input.id);
      }),
  }),

  // ===== PDF UPLOAD & PARSING =====
  pdf: pdfRouter,

  // ===== CLINICAL MEETINGS =====
  clinicalMeetings: router({
    list: viewerProcedure
      .input(z.object({
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
      }).optional())
      .query(async ({ input }) => {
        if (input?.year && input?.month) {
          return clinicalMeetingsDb.getClinicalMeetingsByMonth(input.year, input.month);
        }
        return clinicalMeetingsDb.getAllClinicalMeetings();
      }),
    
    create: adminProcedure
      .input(z.object({
        data: z.date(),
        tema: z.string(),
        tipo: z.enum(["AULA", "ARTIGO", "CASOS_CLINICOS", "PROVA", "AVALIACAO", "EVENTO", "FERIADO", "RECESSO"]),
        preceptor: z.string().optional(),
        residenteApresentador: z.string().optional(),
        observacao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return clinicalMeetingsDb.createClinicalMeeting(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.date().optional(),
        tema: z.string().optional(),
        tipo: z.enum(["AULA", "ARTIGO", "CASOS_CLINICOS", "PROVA", "AVALIACAO", "EVENTO", "FERIADO", "RECESSO"]).optional(),
        preceptor: z.string().optional(),
        residenteApresentador: z.string().optional(),
        observacao: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return clinicalMeetingsDb.updateClinicalMeeting(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return clinicalMeetingsDb.deleteClinicalMeeting(input.id);
      }),
    
    exportICS: viewerProcedure
      .input(z.object({
        year: z.number().optional(),
        month: z.number().min(1).max(12).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { createEvents } = await import('ics');
        
        let meetings;
        if (input?.year && input?.month) {
          meetings = await clinicalMeetingsDb.getClinicalMeetingsByMonth(input.year, input.month);
        } else {
          meetings = await clinicalMeetingsDb.getAllClinicalMeetings();
        }
        
        const events = meetings.map(meeting => {
          const date = new Date(meeting.data);
          const startTime = [date.getFullYear(), date.getMonth() + 1, date.getDate(), 7, 15] as [number, number, number, number, number];
          const endTime = [date.getFullYear(), date.getMonth() + 1, date.getDate(), 8, 30] as [number, number, number, number, number];
          
          let description = `Tipo: ${meeting.tipo}\n`;
          if (meeting.preceptor) description += `Preceptor: ${meeting.preceptor}\n`;
          if (meeting.residenteApresentador) description += `Residente: ${meeting.residenteApresentador}\n`;
          if (meeting.observacao) description += `Observa\u00e7\u00e3o: ${meeting.observacao}`;
          
          return {
            start: startTime,
            end: endTime,
            title: meeting.tema,
            description,
            location: 'Audit\u00f3rio 2\u00ba andar, HU Dom Bosco',
            status: 'CONFIRMED' as const,
            busyStatus: 'BUSY' as const,
          };
        });
        
        const { error, value } = await createEvents(events);
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro ao gerar arquivo ICS',
          });
        }
        
        return { icsContent: value };
      }),
  }),

  // ===== PRESENTATION GUIDELINES =====
  presentationGuidelines: router({
    list: viewerProcedure
      .query(async () => {
        return clinicalMeetingsDb.getAllPresentationGuidelines();
      }),
    
    upsert: adminProcedure
      .input(z.object({
        tipo: z.enum(["AULA", "ARTIGO", "CASOS_CLINICOS"]),
        titulo: z.string(),
        descricao: z.string(),
        tempoApresentacao: z.number(),
        tempoDiscussao: z.number(),
        orientacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return clinicalMeetingsDb.upsertPresentationGuideline(input);
      }),
  }),

  // ===== STAGES =====
  stages: router({
    list: viewerProcedure
      .input(z.object({
        activeOnly: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return importsDb.getAllStages(input?.activeOnly);
      }),
    
    getById: viewerProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return importsDb.getStageById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return importsDb.createStage(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return importsDb.updateStage(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return importsDb.deleteStage(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
