import { drizzle } from "drizzle-orm/mysql2";
import { residents, stages, rotations, rotationAssignments, weeklyActivities, activityAudiences } from "../drizzle/schema.ts";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed completo do banco de dados...");

  try {
    // Limpar dados existentes
    console.log("🗑️  Limpando dados existentes...");
    await db.delete(activityAudiences);
    await db.delete(weeklyActivities);
    await db.delete(rotationAssignments);
    await db.delete(rotations);
    await db.delete(stages);
    await db.delete(residents);

    // ========== RESIDENTES ==========
    console.log("👥 Inserindo residentes...");
    
    // R2
    const [r2a] = await db.insert(residents).values({ nomeCompleto: "Guilherme Lamas", apelido: "Guilherme L.", anoResidencia: "R2", ativo: 1 });
    const [r2b] = await db.insert(residents).values({ nomeCompleto: "Guilherme Coelho", apelido: "Guilherme C.", anoResidencia: "R2", ativo: 1 });
    const [r2c] = await db.insert(residents).values({ nomeCompleto: "João Pedro", apelido: "JP", anoResidencia: "R2", ativo: 1 });
    
    // R3
    const [r3a] = await db.insert(residents).values({ nomeCompleto: "Mariana Moraes", apelido: "Mariana", anoResidencia: "R3", ativo: 1 });
    const [r3b] = await db.insert(residents).values({ nomeCompleto: "Henrique Goulart", apelido: "Henrique", anoResidencia: "R3", ativo: 1 });
    const [r3c] = await db.insert(residents).values({ nomeCompleto: "Jéssica Américo", apelido: "Jéssica", anoResidencia: "R3", ativo: 1 });
    
    // R1 (genéricos para demonstração)
    const [r1a] = await db.insert(residents).values({ nomeCompleto: "Residente R1-A", apelido: "R1-A", anoResidencia: "R1", ativo: 1 });
    const [r1b] = await db.insert(residents).values({ nomeCompleto: "Residente R1-B", apelido: "R1-B", anoResidencia: "R1", ativo: 1 });

    console.log("✅ 8 residentes inseridos");

    // ========== ESTÁGIOS ==========
    console.log("📍 Inserindo estágios...");
    await db.insert(stages).values([
      { nome: "Bloco A", descricao: "Ombro, Pé e Mão (R2/R3)", ativo: 1 },
      { nome: "Bloco B", descricao: "Coluna e Quadril (R2/R3)", ativo: 1 },
      { nome: "Bloco C", descricao: "Joelho e Tumor (R2/R3)", ativo: 1 },
      { nome: "Enfermaria", descricao: "Enfermaria de Ortopedia (R1)", ativo: 1 },
      { nome: "CC1", descricao: "Centro Cirúrgico 1 (R1)", ativo: 1 },
      { nome: "CC2", descricao: "Centro Cirúrgico 2 (R1)", ativo: 1 },
    ]);
    console.log("✅ 6 estágios inseridos");

    // ========== ATIVIDADES SEMANAIS - BLOCO A (Ombro, Pé e Mão) ==========
    console.log("📚 Inserindo atividades semanais - Bloco A...");
    
    // Segunda-feira
    const [a1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a1.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a1.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "09:00", horaFim: "11:00", titulo: "CC HU SC Ombro", descricao: "Centro Cirúrgico - Ombro (Mota)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a2.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a2.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "13:00", horaFim: "15:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório de Ombro (Mota)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a3.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a3.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a4] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "16:00", horaFim: "18:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a4.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a4.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a5] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "19:00", horaFim: "23:00", titulo: "R2 - HPS", descricao: "Plantão HPS (Daniel)", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a5.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }]);

    // Terça-feira
    const [a6] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "09:00", titulo: "CC HU DB Ombro", descricao: "Centro Cirúrgico Dom Bosco - Ombro (Adriano)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a6.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a6.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a7] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "11:00", horaFim: "13:00", titulo: "CC HU DB Pé", descricao: "Centro Cirúrgico Dom Bosco - Pé (Tônio)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a7.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a7.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a8] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Pé", descricao: "Ambulatório de Pé (Tônio)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a8.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a8.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);

    // Quarta-feira
    const [a9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a9.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a9.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "10:00", titulo: "CC HU SC Mão", descricao: "Centro Cirúrgico Santa Casa - Mão (Breno)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a10.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a10.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a11] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "12:00", horaFim: "14:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório de Ombro (Adriano)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a11.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a11.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a12] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "17:00", horaFim: "19:00", titulo: "Estudo Dirigido R3", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a12.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);

    // Quinta-feira
    const [a13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "07:00", horaFim: "08:15", titulo: "Reunião Clínica SOT HU UFJF", descricao: "Reunião Clínica do Serviço de Ortopedia e Traumatologia", local: "Anfiteatro HU", recorrente: 1 });
    await db.insert(activityAudiences).values([
      { activityId: a13.insertId, anoResidencia: "R1", opcional: 0 },
      { activityId: a13.insertId, anoResidencia: "R2", opcional: 0 },
      { activityId: a13.insertId, anoResidencia: "R3", opcional: 0 }
    ]);
    
    const [a14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Mão", descricao: "Ambulatório de Mão (Arnaldo)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a14.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a14.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a15] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "11:00", horaFim: "13:00", titulo: "CC HU DB Ombro", descricao: "Centro Cirúrgico Dom Bosco - Ombro (Mota)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a15.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a15.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a16] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "13:00", horaFim: "16:00", titulo: "CC HU DB Mão", descricao: "Centro Cirúrgico Dom Bosco - Mão (Arnaldo)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a16.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a16.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a17] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "16:00", horaFim: "18:00", titulo: "CC Externo Pé", descricao: "Centro Cirúrgico Externo - Pé (Tônio)", local: "CC Externo", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a17.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a17.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);

    // Sexta-feira
    const [a18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "07:00", horaFim: "08:00", titulo: "Clube da Revista", descricao: "Discussão de artigos científicos", local: "Sala de Reuniões", recorrente: 1 });
    await db.insert(activityAudiences).values([
      { activityId: a18.insertId, anoResidencia: "R1", opcional: 0 },
      { activityId: a18.insertId, anoResidencia: "R2", opcional: 0 },
      { activityId: a18.insertId, anoResidencia: "R3", opcional: 0 }
    ]);
    
    const [a19] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a19.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a19.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a20] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório de Ombro (Adriano)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a20.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a20.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a21] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "13:00", horaFim: "15:00", titulo: "CC HU DB Mão", descricao: "Centro Cirúrgico Dom Bosco - Mão (Breno)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a21.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a21.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);
    
    const [a22] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Mão", descricao: "Ambulatório de Mão (Breno)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: a22.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 }, { activityId: a22.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 }]);

    // ========== ATIVIDADES SEMANAIS - BLOCO B (Coluna e Quadril) ==========
    console.log("📚 Inserindo atividades semanais - Bloco B...");
    
    // Segunda-feira
    const [b1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b1.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b1.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Coluna", descricao: "Ambulatório de Coluna (Vitor)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b2.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b2.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "15:00", horaFim: "17:00", titulo: "CC HU SC Coluna", descricao: "Centro Cirúrgico Santa Casa - Coluna (Vitor)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b3.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b3.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);

    // Terça-feira
    const [b4] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "10:00", titulo: "CC HPS Trauma", descricao: "Centro Cirúrgico HPS - Trauma (João Paulo)", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b4.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b4.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b5] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "19:00", horaFim: "23:00", titulo: "R2 - HPS", descricao: "Plantão HPS (Marcus)", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b5.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }]);

    // Quarta-feira
    const [b6] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b6.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b6.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b7] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "08:00", horaFim: "10:00", titulo: "CC HU SC Quadril", descricao: "Centro Cirúrgico Santa Casa - Quadril (Igor)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b7.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b7.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b8] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "12:00", horaFim: "14:00", titulo: "CC HU SC Coluna", descricao: "Centro Cirúrgico Santa Casa - Coluna (Jair)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b8.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b8.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Quadril", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b9.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b9.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b10.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b10.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);

    // Quinta-feira
    const [b11] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Coluna", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b11.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b11.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b12] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "15:00", horaFim: "17:00", titulo: "CC HU DB Coluna", descricao: "Centro Cirúrgico Dom Bosco - Coluna (Marcus)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b12.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b12.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b13.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b13.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);

    // Sexta-feira
    const [b14] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b14.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b14.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b15] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "13:00", titulo: "Estudo Dirigido R3", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b15.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b16] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "15:00", horaFim: "18:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Daniel)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b16.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b16.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);
    
    const [b17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "19:00", horaFim: "22:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Igor)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b17.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b17.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);

    // Sábado
    const [b18] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "07:00", horaFim: "10:00", titulo: "CC HU SC Quadril", descricao: "Centro Cirúrgico Santa Casa - Quadril (Daniel)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: b18.insertId, anoResidencia: "R2", bloco: "B", opcional: 0 }, { activityId: b18.insertId, anoResidencia: "R3", bloco: "B", opcional: 0 }]);

    // ========== ATIVIDADES SEMANAIS - BLOCO C (Joelho e Tumor) ==========
    console.log("📚 Inserindo atividades semanais - Bloco C...");
    
    // Segunda-feira
    const [c1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c1.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c1.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "09:00", horaFim: "12:00", titulo: "CC HPS Trauma", descricao: "Centro Cirúrgico HPS - Trauma (Bruno)", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c2.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c2.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "15:00", horaFim: "17:00", titulo: "CC HTO Trauma", descricao: "Centro Cirúrgico HTO - Trauma (Breno)", local: "HTO", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c3.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c3.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);

    // Terça-feira
    const [c4] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "09:00", titulo: "Ambulatório Joelho e Tumor", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c4.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c4.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c5] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "11:00", horaFim: "13:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c5.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c5.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c6] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "15:00", horaFim: "17:00", titulo: "CC HU SC Joelho", descricao: "Centro Cirúrgico Santa Casa - Joelho (Bruno)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c6.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c6.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);

    // Quarta-feira
    const [c7] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "10:00", titulo: "CC HU DB Joelho", descricao: "Centro Cirúrgico Dom Bosco - Joelho (Sávio)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c7.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c7.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c8] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "15:00", horaFim: "17:00", titulo: "CC HU SC Trauma", descricao: "Centro Cirúrgico Santa Casa - Trauma (Daniel)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c8.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c8.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);

    // Quinta-feira
    const [c9] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "12:00", titulo: "CC HU DB Joelho", descricao: "Centro Cirúrgico Dom Bosco - Joelho (Bruno)", local: "HU Dom Bosco", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c9.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c9.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c10] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "15:00", horaFim: "17:00", titulo: "CC HTO Trauma", descricao: "Centro Cirúrgico HTO - Trauma (Igor)", local: "HTO", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c10.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c10.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);

    // Sexta-feira
    const [c11] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c11.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c11.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c12] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "09:00", horaFim: "12:00", titulo: "CC HU SC Tumor", descricao: "Centro Cirúrgico Santa Casa - Tumor (Sávio)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c12.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c12.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);
    
    const [c13] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "13:00", horaFim: "15:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: c13.insertId, anoResidencia: "R2", bloco: "C", opcional: 0 }, { activityId: c13.insertId, anoResidencia: "R3", bloco: "C", opcional: 0 }]);

    // ========== ATIVIDADES SEMANAIS - R1 ENFERMARIA ==========
    console.log("📚 Inserindo atividades semanais - R1 Enfermaria...");
    
    const [e1] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e1.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e2] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "08:00", horaFim: "12:00", titulo: "Enfermaria", descricao: "Atividades na Enfermaria de Ortopedia", local: "Enfermaria", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e2.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e3] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Coluna", descricao: "Ambulatório de Coluna (Vitor)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e3.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e4] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "13:00", horaFim: "15:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório de Ombro (Mota)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e4.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e5] = await db.insert(weeklyActivities).values({ diaSemana: 1, horaInicio: "16:00", horaFim: "18:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e5.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

    const [e6] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "07:00", horaFim: "09:00", titulo: "Ambulatório Joelho e Tumor", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e6.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e7] = await db.insert(weeklyActivities).values({ diaSemana: 2, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Pé", descricao: "Ambulatório de Pé (Tonio)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e7.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

    const [e8] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "07:00", horaFim: "08:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e8.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e9] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "09:00", horaFim: "12:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e9.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e10] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "13:00", horaFim: "15:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e10.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e11] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Quadril", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e11.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e12] = await db.insert(weeklyActivities).values({ diaSemana: 3, horaInicio: "18:00", horaFim: "19:00", titulo: "Estudo Dirigido", local: "Sala de Estudos", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e12.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

    const [e13] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Coluna", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e13.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e14] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "15:00", horaFim: "17:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e14.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e15] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "18:00", horaFim: "19:00", titulo: "Visita HU SC", descricao: "Visita HU SC (Marcus)", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e15.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e16] = await db.insert(weeklyActivities).values({ diaSemana: 4, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e16.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

    const [e17] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "08:00", horaFim: "10:00", titulo: "Visita HU SC", local: "HU Santa Casa", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e17.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e18] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "10:00", horaFim: "12:00", titulo: "Ambulatório Ombro", descricao: "Ambulatório de Ombro (Adriano)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e18.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e19] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "13:00", horaFim: "15:00", titulo: "Enfermaria", local: "Enfermaria", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e19.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e20] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "16:00", horaFim: "18:00", titulo: "Ambulatório Mão", descricao: "Ambulatório de Mão (Breno)", local: "Ambulatório", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e20.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e21] = await db.insert(weeklyActivities).values({ diaSemana: 5, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e21.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);
    
    const [e22] = await db.insert(weeklyActivities).values({ diaSemana: 6, horaInicio: "19:00", horaFim: "23:00", titulo: "R1 - HPS", descricao: "Plantão HPS", local: "HPS", recorrente: 1 });
    await db.insert(activityAudiences).values([{ activityId: e22.insertId, anoResidencia: "R1", bloco: "Enfermaria", opcional: 0 }]);

    console.log("✅ Atividades semanais inseridas");

    // ========== RODÍZIOS ==========
    console.log("📅 Inserindo rodízios de janeiro/2026...");
    
    // Rodízio Bloco A - Janeiro (R2a + R3c)
    const [rot1] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Bloco A",
      mesReferencia: "2026-01",
      descricao: "Rodízio Bloco A - Ombro, Pé e Mão",
    });
    await db.insert(rotationAssignments).values([
      { rotationId: rot1.insertId, residentId: r2c.insertId, papel: "TITULAR", duplaId: 1 },
      { rotationId: rot1.insertId, residentId: r3c.insertId, papel: "TITULAR", duplaId: 1 },
    ]);
    
    // Rodízio Bloco B - Janeiro (R2a + R3a)
    const [rot2] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Bloco B",
      mesReferencia: "2026-01",
      descricao: "Rodízio Bloco B - Coluna e Quadril",
    });
    await db.insert(rotationAssignments).values([
      { rotationId: rot2.insertId, residentId: r2a.insertId, papel: "TITULAR", duplaId: 2 },
      { rotationId: rot2.insertId, residentId: r3a.insertId, papel: "TITULAR", duplaId: 2 },
    ]);
    
    // Rodízio Bloco C - Janeiro (R2b + R3b)
    const [rot3] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Bloco C",
      mesReferencia: "2026-01",
      descricao: "Rodízio Bloco C - Joelho e Tumor",
    });
    await db.insert(rotationAssignments).values([
      { rotationId: rot3.insertId, residentId: r2b.insertId, papel: "TITULAR", duplaId: 3 },
      { rotationId: rot3.insertId, residentId: r3b.insertId, papel: "TITULAR", duplaId: 3 },
    ]);
    
    // Rodízio R1 Enfermaria
    const [rot4] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Enfermaria",
      mesReferencia: "2026-01",
      descricao: "Rodízio R1 - Enfermaria",
    });
    await db.insert(rotationAssignments).values([
      { rotationId: rot4.insertId, residentId: r1a.insertId, papel: "TITULAR", duplaId: 4 },
    ]);
    
    // Rodízio R1 CC1
    const [rot5] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "CC1",
      mesReferencia: "2026-01",
      descricao: "Rodízio R1 - Centro Cirúrgico 1",
    });
    await db.insert(rotationAssignments).values([
      { rotationId: rot5.insertId, residentId: r1b.insertId, papel: "TITULAR", duplaId: 5 },
    ]);

    console.log("✅ 5 rodízios inseridos");

    console.log("✨ Seed completo concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante seed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("👋 Finalizando...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Falha no seed:", error);
    process.exit(1);
  });
