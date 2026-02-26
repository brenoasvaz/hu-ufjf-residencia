import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) - now optional for internal auth */
  openId: varchar("openId", { length: 64 }).unique(),
  /** Email for internal authentication - required and unique */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Password hash for internal authentication */
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }).default("internal"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Residentes - Tabela de residentes de ortopedia
 */
export const residents = mysqlTable("residents", {
  id: int("id").autoincrement().primaryKey(),
  nomeCompleto: varchar("nome_completo", { length: 255 }).notNull(),
  apelido: varchar("apelido", { length: 100 }),
  anoResidencia: mysqlEnum("ano_residencia", ["R1", "R2", "R3"]).notNull(),
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Resident = typeof residents.$inferSelect;
export type InsertResident = typeof residents.$inferInsert;

/**
 * Rodízios - Períodos de estágio em locais específicos
 */
export const rotations = mysqlTable("rotations", {
  id: int("id").autoincrement().primaryKey(),
  dataInicio: timestamp("data_inicio").notNull(),
  dataFim: timestamp("data_fim").notNull(),
  mesReferencia: varchar("mes_referencia", { length: 7 }).notNull(), // YYYY-MM
  localEstagio: varchar("local_estagio", { length: 255 }).notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Rotation = typeof rotations.$inferSelect;
export type InsertRotation = typeof rotations.$inferInsert;

/**
 * Atribuições de Rodízio - Vincula residentes a rodízios (duplas)
 */
export const rotationAssignments = mysqlTable("rotation_assignments", {
  id: int("id").autoincrement().primaryKey(),
  rotationId: int("rotation_id").notNull(),
  residentId: int("resident_id").notNull(),
  papelNaDupla: varchar("papel_na_dupla", { length: 10 }), // A/B ou 1/2
  duplaId: varchar("dupla_id", { length: 100 }).notNull(), // UUID para agrupar dupla
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RotationAssignment = typeof rotationAssignments.$inferSelect;
export type InsertRotationAssignment = typeof rotationAssignments.$inferInsert;

/**
 * Atividades Semanais - Cronograma recorrente de aulas/atividades
 */
export const weeklyActivities = mysqlTable("weekly_activities", {
  id: int("id").autoincrement().primaryKey(),
  diaSemana: int("dia_semana").notNull(), // 0-6 (Domingo a Sábado)
  horaInicio: varchar("hora_inicio", { length: 5 }).notNull(), // HH:MM
  horaFim: varchar("hora_fim", { length: 5 }).notNull(), // HH:MM
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  local: varchar("local", { length: 255 }),
  recorrente: int("recorrente").default(1).notNull(), // 1 = sim, 0 = não
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyActivity = typeof weeklyActivities.$inferSelect;
export type InsertWeeklyActivity = typeof weeklyActivities.$inferInsert;

/**
 * Público-alvo das Atividades - Define quais residentes devem participar
 */
export const activityAudiences = mysqlTable("activity_audiences", {
  id: int("id").autoincrement().primaryKey(),
  activityId: int("activity_id").notNull(),
  anoResidencia: mysqlEnum("ano_residencia", ["R1", "R2", "R3"]),
  bloco: varchar("bloco", { length: 50 }), // A/B/C ou Enfermaria/CC1/CC2
  opcional: int("opcional").default(0).notNull(), // 1 = opcional, 0 = obrigatório
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ActivityAudience = typeof activityAudiences.$inferSelect;
export type InsertActivityAudience = typeof activityAudiences.$inferInsert;

/**
 * Imports - Histórico de importações de PDFs
 */
export const imports = mysqlTable("imports", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["RODIZIO", "CRONOGRAMA"]).notNull(),
  arquivoNome: varchar("arquivo_nome", { length: 255 }).notNull(),
  arquivoUrl: text("arquivo_url").notNull(), // URL do S3
  arquivoKey: varchar("arquivo_key", { length: 500 }).notNull(), // Key do S3
  usuarioAdminId: int("usuario_admin_id").notNull(),
  status: mysqlEnum("status", ["PENDENTE", "PROCESSANDO", "CONCLUIDO", "ERRO"]).notNull(),
  logValidacao: text("log_validacao"),
  registrosCriados: int("registros_criados").default(0),
  registrosAtualizados: int("registros_atualizados").default(0),
  registrosIgnorados: int("registros_ignorados").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Import = typeof imports.$inferSelect;
export type InsertImport = typeof imports.$inferInsert;

/**
 * Estágios/Locais - Lista de valores para padronização
 */
export const stages = mysqlTable("stages", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull().unique(),
  descricao: text("descricao"),
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Stage = typeof stages.$inferSelect;
export type InsertStage = typeof stages.$inferInsert;

/**
 * Reuniões Clínicas - Programação científica semanal
 */
export const clinicalMeetings = mysqlTable("clinical_meetings", {
  id: int("id").autoincrement().primaryKey(),
  data: timestamp("data").notNull(),
  tema: varchar("tema", { length: 500 }).notNull(),
  tipo: mysqlEnum("tipo", ["AULA", "ARTIGO", "CASOS_CLINICOS", "PROVA", "AVALIACAO", "EVENTO", "FERIADO", "RECESSO"]).notNull(),
  preceptor: varchar("preceptor", { length: 255 }),
  residenteApresentador: varchar("residente_apresentador", { length: 50 }), // R1, R2, R3 ou combinações
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ClinicalMeeting = typeof clinicalMeetings.$inferSelect;
export type InsertClinicalMeeting = typeof clinicalMeetings.$inferInsert;

/**
 * Orientações de Apresentação - Regras e tempos para cada tipo de apresentação
 */
export const presentationGuidelines = mysqlTable("presentation_guidelines", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["AULA", "ARTIGO", "CASOS_CLINICOS"]).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  tempoApresentacao: int("tempo_apresentacao").notNull(), // em minutos
  tempoDiscussao: int("tempo_discussao").notNull(), // em minutos
  orientacoes: text("orientacoes"), // JSON com lista de orientações
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PresentationGuideline = typeof presentationGuidelines.$inferSelect;
export type InsertPresentationGuideline = typeof presentationGuidelines.$inferInsert;

/**
 * ========================================
 * MÓDULO DE AVALIAÇÕES/SIMULADOS
 * ========================================
 */

/**
 * Especialidades Ortopédicas - Categorias das questões
 */
export const especialidades = mysqlTable("especialidades", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 128 }).notNull().unique(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Especialidade = typeof especialidades.$inferSelect;
export type InsertEspecialidade = typeof especialidades.$inferInsert;

/**
 * Questões - Banco de questões de ortopedia
 */
export const questoes = mysqlTable("questoes", {
  id: int("id").autoincrement().primaryKey(),
  especialidadeId: int("especialidade_id").notNull(),
  enunciado: text("enunciado").notNull(),
  fonte: varchar("fonte", { length: 64 }), // 'TARO' | 'TEOT' | 'SBOT 1000'
  ano: int("ano"),
  subcategoria: varchar("subcategoria", { length: 255 }),
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Questao = typeof questoes.$inferSelect;
export type InsertQuestao = typeof questoes.$inferInsert;

/**
 * Alternativas - Opções de resposta para cada questão (sempre 4: A, B, C, D)
 */
export const alternativas = mysqlTable("alternativas", {
  id: int("id").autoincrement().primaryKey(),
  questaoId: int("questao_id").notNull(),
  letra: varchar("letra", { length: 1 }).notNull(), // 'A' | 'B' | 'C' | 'D'
  texto: text("texto").notNull(),
  isCorreta: int("is_correta").default(0).notNull(), // 1 = correta, 0 = incorreta
});

export type Alternativa = typeof alternativas.$inferSelect;
export type InsertAlternativa = typeof alternativas.$inferInsert;

/**
 * Modelos de Prova - Templates criados pelo preceptor
 */
export const modelosProva = mysqlTable("modelos_prova", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 256 }).notNull(),
  descricao: text("descricao"),
  duracaoMinutos: int("duracao_minutos").default(60).notNull(),
  configuracao: text("configuracao").notNull(), // JSON: { "Coluna": 10, "Joelho": 5, ... }
  ativo: int("ativo").default(1).notNull(), // 1 = ativo, 0 = inativo
  criadoPorId: int("criado_por_id").notNull(), // FK → users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ModeloProva = typeof modelosProva.$inferSelect;
export type InsertModeloProva = typeof modelosProva.$inferInsert;

/**
 * Simulados - Instâncias de prova geradas para um residente
 */
export const simulados = mysqlTable("simulados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // FK → users.id
  modeloId: int("modelo_id").notNull(), // FK → modelos_prova.id
  dataInicio: timestamp("data_inicio").notNull(),
  dataFim: timestamp("data_fim"),
  duracaoMinutos: int("duracao_minutos").notNull(),
  totalQuestoes: int("total_questoes").notNull(),
  totalAcertos: int("total_acertos").default(0).notNull(),
  concluido: int("concluido").default(0).notNull(), // 1 = concluído, 0 = em andamento
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Simulado = typeof simulados.$inferSelect;
export type InsertSimulado = typeof simulados.$inferInsert;

/**
 * Simulado Questões - Questões sorteadas para cada simulado
 */
export const simuladoQuestoes = mysqlTable("simulado_questoes", {
  id: int("id").autoincrement().primaryKey(),
  simuladoId: int("simulado_id").notNull(), // FK → simulados.id
  questaoId: int("questao_id").notNull(), // FK → questoes.id
  ordem: int("ordem").notNull(),
});

export type SimuladoQuestao = typeof simuladoQuestoes.$inferSelect;
export type InsertSimuladoQuestao = typeof simuladoQuestoes.$inferInsert;

/**
 * Respostas do Usuário - Respostas do residente em cada simulado
 */
export const respostasUsuario = mysqlTable("respostas_usuario", {
  id: int("id").autoincrement().primaryKey(),
  simuladoId: int("simulado_id").notNull(), // FK → simulados.id
  questaoId: int("questao_id").notNull(), // FK → questoes.id
  alternativaId: int("alternativa_id"), // FK → alternativas.id (nullable se não respondeu)
  isCorreta: int("is_correta").default(0).notNull(), // 1 = correta, 0 = incorreta
  respondidaEm: timestamp("respondida_em").notNull(),
});

export type RespostaUsuario = typeof respostasUsuario.$inferSelect;
export type InsertRespostaUsuario = typeof respostasUsuario.$inferInsert;
