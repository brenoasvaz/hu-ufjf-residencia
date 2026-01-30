import { getDb } from './db.ts';
import { weeklyActivities, activityAudiences } from '../drizzle/schema.ts';

console.log('🌱 Inserindo atividades com horários corretos...');

const db = await getDb();

// ========== BLOCO A: Ombro, Pé e Mão (R2/R3) ==========
console.log('📚 Bloco A...');

// Segunda-feira
const [a1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a1.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a1.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "08:00", horaFim: "13:00", titulo: "CC HU SC Ombro", descricao: "Centro Cirúrgico Santa Casa - Ombro", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a2.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a2.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "13:00", horaFim: "17:00", titulo: "Ambulatório Ombro", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a3.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a3.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a4] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "17:00", horaFim: "18:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a4.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a4.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a5] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "19:00", horaFim: "23:00", titulo: "R2 - HPS", descricao: "Plantão HPS (apenas R2)", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: a5.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }]);

// Terça-feira
const [a6] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "11:00", titulo: "CC HU DB Ombro", descricao: "Centro Cirúrgico Dom Bosco - Ombro", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a6.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a6.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a7] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "11:00", horaFim: "16:00", titulo: "CC HU DB Pé", descricao: "Centro Cirúrgico Dom Bosco - Pé", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a7.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a7.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a8] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "16:00", horaFim: "19:00", titulo: "Ambulatório Pé", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a8.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a8.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

// Quarta-feira
const [a9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a9.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a9.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "12:00", titulo: "CC HU SC Mão", descricao: "Centro Cirúrgico Santa Casa - Mão", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a10.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a10.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a11] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "12:00", horaFim: "16:00", titulo: "Ambulatório Ombro", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a11.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a11.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a12] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "16:00", horaFim: "20:00", titulo: "Estudo Dirigido", descricao: "Apenas R3", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: a12.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);

// Quinta-feira
const [a13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:00", horaFim: "10:00", titulo: "Reunião Clínica SOT HU UFJF", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a13.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a13.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "13:00", titulo: "Ambulatório Mão / CC HU DB Ombro", descricao: "Ambulatório Mão ou Centro Cirúrgico Dom Bosco Ombro", local: "Ambulatório / HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a14.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a14.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a15] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "13:00", horaFim: "19:00", titulo: "CC HU DB Mão / CC Externo Pé", descricao: "Centro Cirúrgico Dom Bosco Mão ou CC Externo Pé", local: "HU Dom Bosco / CC Externo", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a15.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a15.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

// Sexta-feira
const [a16] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a16.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a16.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a17.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a17.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "13:00", titulo: "Ambulatório Ombro", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a18.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a18.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a19] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "13:00", horaFim: "16:00", titulo: "CC HU DB Mão", descricao: "Centro Cirúrgico Dom Bosco - Mão", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a19.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a19.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

const [a20] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "16:00", horaFim: "19:00", titulo: "Ambulatório Mão", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: a20.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
  { activityId: a20.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }
]);

// ========== BLOCO B: Coluna e Quadril (R2/R3) ==========
console.log('📚 Bloco B...');

// Segunda-feira
const [b1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b1.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b1.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Coluna", descricao: "Ambulatório Coluna (Vitor)", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b2.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b2.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "16:00", horaFim: "18:00", titulo: "CC HU SC Coluna", descricao: "Centro Cirúrgico Santa Casa - Coluna (Vitor)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b3.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b3.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

// Terça-feira
const [b4] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "13:00", titulo: "CC HPS Trauma", descricao: "Centro Cirúrgico HPS Trauma (João Paulo)", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b4.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b4.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b5] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "19:00", horaFim: "23:00", titulo: "R2 - HPS", descricao: "Plantão HPS (Marcus) - apenas R2", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: b5.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }]);

// Quarta-feira
const [b6] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b6.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b6.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b7] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "12:00", titulo: "CC HU SC Quadril", descricao: "Centro Cirúrgico Santa Casa - Quadril (Igor)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b7.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b7.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b8] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "12:00", horaFim: "16:00", titulo: "CC HU SC Coluna", descricao: "Centro Cirúrgico Santa Casa - Coluna (Jair)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b8.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b8.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Quadril", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b9.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b9.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b10.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b10.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

// Quinta-feira
const [b11] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:15", horaFim: "10:00", titulo: "Reunião Clínica SOT HU UFJF", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b11.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b11.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b12] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "13:00", titulo: "Ambulatório Coluna", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b12.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b12.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "13:00", horaFim: "18:00", titulo: "CC HU DB Coluna", descricao: "Centro Cirúrgico Dom Bosco - Coluna (Marcus)", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b13.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b13.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b14.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b14.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

// Sexta-feira
const [b15] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b15.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b15.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b16] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b16.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b16.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "15:00", titulo: "Estudo Dirigido do R3", descricao: "Apenas R3", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([{ activityId: b17.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);

const [b18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "15:00", horaFim: "19:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Daniel)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b18.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b18.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

// Sábado
const [b19] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "07:00", horaFim: "19:00", titulo: "CC HU SC Quadril", descricao: "Centro Cirúrgico Santa Casa - Quadril (Daniel)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b19.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b19.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

const [b20] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "19:00", horaFim: "23:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Igor)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: b20.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 },
  { activityId: b20.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }
]);

// ========== BLOCO C: Joelho e Tumor (R2/R3) ==========
console.log('📚 Bloco C...');

// Segunda-feira
const [c1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c1.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c1.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "09:00", horaFim: "13:00", titulo: "CC HPS Trauma", descricao: "Centro Cirúrgico HPS Trauma (Bruno)", local: "HPS", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c2.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c2.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

// Terça-feira
const [c3] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "11:00", titulo: "Ambulatório Joelho e Tumor", local: "Ambulatório", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c3.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c3.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c4] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "11:00", horaFim: "13:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c4.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c4.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c5] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "13:00", horaFim: "19:00", titulo: "CC HU SC Joelho", descricao: "Centro Cirúrgico Santa Casa - Joelho (Bruno)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c5.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c5.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

// Quarta-feira
const [c6] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "13:00", titulo: "CC HU DB Joelho", descricao: "Centro Cirúrgico Dom Bosco - Joelho (Sávio)", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c6.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c6.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c7] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "13:00", horaFim: "19:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Daniel)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c7.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c7.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

// Quinta-feira
const [c8] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:00", horaFim: "10:00", titulo: "Reunião Clínica SOT HU UFJF", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c8.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c8.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c9] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "13:00", titulo: "CC HU DB Joelho", descricao: "Centro Cirúrgico Dom Bosco - Joelho (Bruno)", local: "HU Dom Bosco", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c9.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c9.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c10] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "13:00", horaFim: "19:00", titulo: "CC HTO Trauma", descricao: "Centro Cirúrgico HTO Trauma (Igor)", local: "HTO", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c10.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c10.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

// Sexta-feira
const [c11] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", local: "HU UFJF", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c11.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c11.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c12] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "09:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c12.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c12.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c13] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "09:00", horaFim: "13:00", titulo: "CC HU SC Tumor", descricao: "Centro Cirúrgico Santa Casa - Tumor (Sávio)", local: "HU Santa Casa", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c13.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c13.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

const [c14] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "13:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
await db.insert(activityAudiences).values([
  { activityId: c14.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 },
  { activityId: c14.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }
]);

console.log('✅ Blocos A, B, C inseridos');
console.log('📝 Continuando com R1...');
process.exit(0);
