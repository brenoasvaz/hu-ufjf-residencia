import { getDb } from './db.ts';
import { weeklyActivities, activityAudiences } from '../drizzle/schema.ts';

console.log('🌱 Inserindo atividades R1 com horários corretos...');

const db = await getDb();

// ========== R1 - ENFERMARIA ==========
console.log('📚 R1 Enfermaria...');

// Segunda-feira
const [e1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e1.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "08:00", horaFim: "10:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e2.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "10:00", horaFim: "13:00", titulo: "Ambulatório Coluna", descricao: "Ambulatório Coluna (Vitor)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e3.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e4] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "13:00", horaFim: "17:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório Ombro (Mota)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e4.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e5] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "17:00", horaFim: "18:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e5.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

// Terça-feira
const [e6] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "09:00", titulo: "Ambulatório Joelho e Tumor", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e6.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e7] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "09:00", horaFim: "13:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e7.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e8] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "16:00", horaFim: "19:00", titulo: "Ambulatório Pé", descricao: "Ambulatório Pé (Tonio)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e8.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

// Quarta-feira
const [e9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e9.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "14:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e10.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e11] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Quadril", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e11.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e12] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e12.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

// Quinta-feira
const [e13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:00", horaFim: "10:00", titulo: "Reunião Clínica SOT HU UFJF", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e13.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "16:00", titulo: "Ambulatório Coluna / Enfermaria", descricao: "Ambulatório Coluna ou Enfermaria", local: "Ambulatório / Enfermaria", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e14.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e15] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "16:00", horaFim: "19:00", titulo: "Visita HU SC", descricao: "Visita HU SC (Marcus)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e15.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

// Sexta-feira
const [e16] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e16.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e17.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "14:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório Ombro (Adriano)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e18.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e19] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "14:00", horaFim: "16:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e19.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e20] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "16:00", horaFim: "19:00", titulo: "Ambulatório Mão", descricao: "Ambulatório Mão (Breno)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e20.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

// Plantões HPS
const [e21] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e21.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e22] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e22.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

const [e23] = await db.insert(weeklyActivities).values({ diaSemana: 0, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: e23.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

// ========== R1 - CENTRO CIRÚRGICO 1 ==========
console.log('📚 R1 CC1...');

// Segunda-feira
const [cc1_1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_1.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "08:00", horaFim: "12:00", titulo: "CC HU SC Ombro", descricao: "Centro Cirúrgico Santa Casa - Ombro (Mota)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_2.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "15:00", horaFim: "18:00", titulo: "CC HU SC Coluna", descricao: "Centro Cirúrgico Santa Casa - Coluna (Vitor)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_3.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

// Terça-feira
const [cc1_4] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "09:00", titulo: "Ambulatório Joelho e Tumor", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_4.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_5] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "13:00", horaFim: "17:00", titulo: "CC HU SC Joelho", descricao: "Centro Cirúrgico Santa Casa - Joelho (Bruno)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_5.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

// Quarta-feira
const [cc1_6] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_6.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_7] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "10:00", titulo: "CC HU SC Quadril", descricao: "Centro Cirúrgico Santa Casa - Quadril (Igor)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_7.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_8] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "14:00", horaFim: "17:00", titulo: "CC HU SC Coluna/Quadril", descricao: "Centro Cirúrgico Santa Casa - Coluna/Quadril (Jair/Daniel)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_8.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_9.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

// Quinta-feira
const [cc1_10] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:00", horaFim: "10:00", titulo: "Reunião Clínica SOT HU UFJF", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_10.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_11] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "13:00", titulo: "Ambulatório Coluna", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_11.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_12] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "13:00", horaFim: "18:00", titulo: "CC HU DB Coluna", descricao: "Centro Cirúrgico Dom Bosco - Coluna (Marcus)", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_12.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_13.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_14.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

// Sexta-feira
const [cc1_15] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_15.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_16] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "09:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_16.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "09:00", horaFim: "12:00", titulo: "CC HU SC Tumor", descricao: "Centro Cirúrgico Santa Casa - Tumor (Sávio)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_17.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "15:00", horaFim: "18:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Daniel)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_18.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_19] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_19.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

// Sábado e Domingo
const [cc1_20] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_20.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

const [cc1_21] = await db.insert(weeklyActivities).values({ diaSemana: 0, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc1_21.insertId, anoResidencia: "R1", bloco: "CC1", opcional: 0 }]);

// ========== R1 - CENTRO CIRÚRGICO 2 ==========
console.log('📚 R1 CC2...');

// Segunda-feira
const [cc2_1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_1.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Coluna", descricao: "Ambulatório Coluna (Vitor)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_2.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "13:00", horaFim: "15:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório Ombro (Mota)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_3.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_4] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "16:00", horaFim: "18:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_4.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

// Terça-feira
const [cc2_5] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "09:00", titulo: "Ambulatório Joelho e Tumor", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_5.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_6] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "13:00", horaFim: "15:00", titulo: "CC Externo", descricao: "Centro Cirúrgico Externo (Arnaldo)", local: "CC Externo", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_6.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

// Quarta-feira
const [cc2_7] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_7.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_8] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "10:00", titulo: "CC HU SC Mão", descricao: "Centro Cirúrgico Santa Casa - Mão (Breno)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_8.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "12:00", horaFim: "14:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório Ombro (Adriano)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_9.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Quadril", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_10.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

// Quinta-feira
const [cc2_11] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:00", horaFim: "10:00", titulo: "Reunião Clínica SOT HU UFJF", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_11.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_12] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Mão", descricao: "Ambulatório Mão (Arnaldo)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_12.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "13:00", horaFim: "16:00", titulo: "CC HU DB Mão", descricao: "Centro Cirúrgico Dom Bosco - Mão (Arnaldo)", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_13.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_14.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

// Sexta-feira
const [cc2_15] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_15.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_16] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_16.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório Ombro (Adriano)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_17.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "13:00", horaFim: "15:00", titulo: "CC HU DB Mão", descricao: "Centro Cirúrgico Dom Bosco - Mão (Breno)", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_18.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_19] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Mão", descricao: "Ambulatório Mão (Breno)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_19.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_20] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_20.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

// Sábado
const [cc2_21] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "07:00", horaFim: "10:00", titulo: "CC HU SC Quadril", descricao: "Centro Cirúrgico Santa Casa - Quadril (Daniel)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_21.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

const [cc2_22] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_22.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

// Domingo
const [cc2_23] = await db.insert(weeklyActivities).values({ diaSemana: 0, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: cc2_23.insertId, anoResidencia: "R1", bloco: "CC2", opcional: 0 }]);

console.log('✅ R1 (Enfermaria, CC1, CC2) inseridos com sucesso!');
process.exit(0);
