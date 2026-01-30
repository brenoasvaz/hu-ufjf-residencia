import { drizzle } from "drizzle-orm/mysql2";
import { weeklyActivities, activityAudiences } from "../drizzle/schema.ts";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  console.log("Limpando atividades existentes...");
  
  // Limpar tabelas
  await db.delete(activityAudiences);
  await db.delete(weeklyActivities);
  
  console.log("Inserindo atividades com horários corretos...");
  
  // ========== BLOCO A (R2/R3) ==========
  const blocoA = [
    // Segunda
    { diaSemana: 1, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 1, titulo: "CC HU SC Ombro", horaInicio: "08:00", horaFim: "13:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 1, titulo: "Ambulatório Ombro", horaInicio: "13:00", horaFim: "17:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 1, titulo: "Estudo Dirigido", horaInicio: "17:00", horaFim: "18:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    { diaSemana: 1, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao", apenasR2: true },
    // Terça
    { diaSemana: 2, titulo: "CC HU DB Ombro", horaInicio: "07:00", horaFim: "11:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 2, titulo: "CC HU DB Pé", horaInicio: "11:00", horaFim: "16:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 2, titulo: "Ambulatório Pé", horaInicio: "16:00", horaFim: "19:00", local: "Ambulatório", tipo: "ambulatorio" },
    // Quarta
    { diaSemana: 3, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 3, titulo: "CC HU SC Mão", horaInicio: "08:00", horaFim: "12:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "Ambulatório Ombro", horaInicio: "12:00", horaFim: "16:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 3, titulo: "Estudo Dirigido", horaInicio: "16:00", horaFim: "20:00", local: "Sala de Estudos", tipo: "estudo_dirigido", apenasR3: true },
    // Quinta
    { diaSemana: 4, titulo: "Reunião Clínica SOT HU UFJF", horaInicio: "07:00", horaFim: "10:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 4, titulo: "Ambulatório Mão / CC HU DB Ombro", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório / HU Dom Bosco", tipo: "ambulatorio" },
    { diaSemana: 4, titulo: "CC HU DB Mão / CC Externo Pé", horaInicio: "13:00", horaFim: "19:00", local: "HU Dom Bosco / Externo", tipo: "centro_cirurgico" },
    // Sexta
    { diaSemana: 5, titulo: "Clube da Revista", horaInicio: "07:00", horaFim: "08:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 5, titulo: "Visita HU SC", horaInicio: "08:00", horaFim: "10:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 5, titulo: "Ambulatório Ombro", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 5, titulo: "CC HU DB Mão", horaInicio: "13:00", horaFim: "16:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 5, titulo: "Ambulatório Mão", horaInicio: "16:00", horaFim: "19:00", local: "Ambulatório", tipo: "ambulatorio" },
  ];

  // ========== BLOCO B (R2/R3) ==========
  const blocoB = [
    // Segunda
    { diaSemana: 1, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 1, titulo: "Ambulatório Coluna", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 1, titulo: "CC HU SC Coluna", horaInicio: "13:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    // Terça
    { diaSemana: 2, titulo: "CC HPS Trauma", horaInicio: "07:00", horaFim: "14:00", local: "HPS", tipo: "centro_cirurgico" },
    { diaSemana: 2, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao", apenasR2: true },
    // Quarta
    { diaSemana: 3, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 3, titulo: "CC HU SC Quadril", horaInicio: "08:00", horaFim: "12:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "CC HU SC Coluna", horaInicio: "12:00", horaFim: "16:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "Ambulatório Quadril", horaInicio: "16:00", horaFim: "18:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 3, titulo: "Estudo Dirigido", horaInicio: "18:00", horaFim: "19:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Quinta
    { diaSemana: 4, titulo: "Reunião Clínica SOT HU UFJF", horaInicio: "07:00", horaFim: "10:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 4, titulo: "Ambulatório Coluna", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 4, titulo: "CC HU DB Coluna", horaInicio: "13:00", horaFim: "18:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 4, titulo: "Estudo Dirigido", horaInicio: "18:00", horaFim: "19:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Sexta
    { diaSemana: 5, titulo: "Clube da Revista", horaInicio: "07:00", horaFim: "08:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 5, titulo: "Visita HU SC", horaInicio: "08:00", horaFim: "10:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 5, titulo: "Estudo Dirigido", horaInicio: "10:00", horaFim: "15:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    { diaSemana: 5, titulo: "CC HU SC Trauma", horaInicio: "15:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 5, titulo: "CC HU SC Trauma Noturno", horaInicio: "19:00", horaFim: "22:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    // Sábado
    { diaSemana: 6, titulo: "CC HU SC Quadril", horaInicio: "07:00", horaFim: "13:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
  ];

  // ========== BLOCO C (R2/R3) ==========
  const blocoC = [
    // Segunda
    { diaSemana: 1, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 1, titulo: "CC HPS Trauma", horaInicio: "09:00", horaFim: "13:00", local: "HPS", tipo: "centro_cirurgico" },
    { diaSemana: 1, titulo: "CC HTO", horaInicio: "13:00", horaFim: "19:00", local: "HTO", tipo: "centro_cirurgico" },
    // Terça
    { diaSemana: 2, titulo: "Ambulatório Joelho e Tumor", horaInicio: "07:00", horaFim: "11:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 2, titulo: "Estudo Dirigido", horaInicio: "11:00", horaFim: "13:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    { diaSemana: 2, titulo: "CC HU SC Joelho", horaInicio: "13:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    // Quarta
    { diaSemana: 3, titulo: "CC HU DB Joelho", horaInicio: "07:00", horaFim: "13:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "CC HU SC Trauma", horaInicio: "13:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    // Quinta
    { diaSemana: 4, titulo: "Reunião Clínica SOT HU UFJF", horaInicio: "07:00", horaFim: "10:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 4, titulo: "CC HU DB Joelho", horaInicio: "10:00", horaFim: "13:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 4, titulo: "CC HTO Trauma", horaInicio: "13:00", horaFim: "19:00", local: "HTO", tipo: "centro_cirurgico" },
    // Sexta
    { diaSemana: 5, titulo: "Clube da Revista", horaInicio: "07:00", horaFim: "08:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 5, titulo: "Visita HU SC", horaInicio: "08:00", horaFim: "09:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 5, titulo: "CC HU SC Tumor", horaInicio: "09:00", horaFim: "13:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 5, titulo: "Estudo Dirigido", horaInicio: "13:00", horaFim: "15:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
  ];

  // ========== ENFERMARIA R1 ==========
  const enfermaria = [
    // Segunda
    { diaSemana: 1, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 1, titulo: "Enfermaria", horaInicio: "08:00", horaFim: "10:00", local: "HU UFJF", tipo: "enfermaria" },
    { diaSemana: 1, titulo: "Ambulatório Coluna", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 1, titulo: "Ambulatório Ombro", horaInicio: "13:00", horaFim: "17:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 1, titulo: "Estudo Dirigido", horaInicio: "17:00", horaFim: "18:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Terça
    { diaSemana: 2, titulo: "Ambulatório Joelho e Tumor", horaInicio: "07:00", horaFim: "10:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 2, titulo: "Enfermaria", horaInicio: "10:00", horaFim: "16:00", local: "HU UFJF", tipo: "enfermaria" },
    { diaSemana: 2, titulo: "Ambulatório Pé", horaInicio: "16:00", horaFim: "19:00", local: "Ambulatório", tipo: "ambulatorio" },
    // Quarta
    { diaSemana: 3, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 3, titulo: "Enfermaria", horaInicio: "08:00", horaFim: "12:00", local: "HU UFJF", tipo: "enfermaria" },
    { diaSemana: 3, titulo: "Enfermaria", horaInicio: "13:00", horaFim: "16:00", local: "HU UFJF", tipo: "enfermaria" },
    { diaSemana: 3, titulo: "Ambulatório Quadril", horaInicio: "16:00", horaFim: "18:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 3, titulo: "Estudo Dirigido", horaInicio: "18:00", horaFim: "19:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Quinta
    { diaSemana: 4, titulo: "Reunião Clínica SOT HU UFJF", horaInicio: "07:00", horaFim: "10:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 4, titulo: "Ambulatório Coluna", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 4, titulo: "Enfermaria", horaInicio: "13:00", horaFim: "18:00", local: "HU UFJF", tipo: "enfermaria" },
    { diaSemana: 4, titulo: "Visita HU SC", horaInicio: "18:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "visita" },
    // Sexta
    { diaSemana: 5, titulo: "Clube da Revista", horaInicio: "07:00", horaFim: "08:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 5, titulo: "Visita HU SC", horaInicio: "08:00", horaFim: "09:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 5, titulo: "Ambulatório Ombro", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 5, titulo: "Enfermaria", horaInicio: "13:00", horaFim: "16:00", local: "HU UFJF", tipo: "enfermaria" },
    { diaSemana: 5, titulo: "Ambulatório Mão", horaInicio: "16:00", horaFim: "19:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 5, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
    // Sábado
    { diaSemana: 6, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
    // Domingo
    { diaSemana: 0, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
  ];

  // ========== CC1 R1 ==========
  const cc1 = [
    // Segunda
    { diaSemana: 1, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 1, titulo: "CC HU SC Ombro", horaInicio: "08:00", horaFim: "13:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 1, titulo: "CC HU SC Coluna", horaInicio: "13:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    // Terça
    { diaSemana: 2, titulo: "Ambulatório Joelho e Tumor", horaInicio: "07:00", horaFim: "11:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 2, titulo: "CC HU SC Joelho", horaInicio: "13:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    // Quarta
    { diaSemana: 3, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 3, titulo: "CC HU SC Quadril", horaInicio: "08:00", horaFim: "12:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "CC HU SC Coluna/Quadril", horaInicio: "12:00", horaFim: "18:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "Estudo Dirigido", horaInicio: "18:00", horaFim: "19:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Quinta
    { diaSemana: 4, titulo: "Reunião Clínica SOT HU UFJF", horaInicio: "07:00", horaFim: "10:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 4, titulo: "Ambulatório Coluna", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 4, titulo: "CC HU DB Coluna", horaInicio: "13:00", horaFim: "18:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 4, titulo: "Estudo Dirigido", horaInicio: "18:00", horaFim: "19:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Sexta
    { diaSemana: 5, titulo: "Clube da Revista", horaInicio: "07:00", horaFim: "08:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 5, titulo: "Visita HU SC", horaInicio: "08:00", horaFim: "09:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 5, titulo: "CC HU SC Tumor", horaInicio: "09:00", horaFim: "13:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 5, titulo: "CC HU SC Trauma", horaInicio: "15:00", horaFim: "19:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 5, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
    // Sábado
    { diaSemana: 6, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
    // Domingo
    { diaSemana: 0, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
  ];

  // ========== CC2 R1 ==========
  const cc2 = [
    // Segunda
    { diaSemana: 1, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 1, titulo: "Ambulatório Coluna", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 1, titulo: "Ambulatório Ombro", horaInicio: "13:00", horaFim: "17:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 1, titulo: "Estudo Dirigido", horaInicio: "17:00", horaFim: "18:00", local: "Sala de Estudos", tipo: "estudo_dirigido" },
    // Terça
    { diaSemana: 2, titulo: "Ambulatório Joelho e Tumor", horaInicio: "07:00", horaFim: "10:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 2, titulo: "CC Externo", horaInicio: "13:00", horaFim: "17:00", local: "Externo", tipo: "centro_cirurgico" },
    // Quarta
    { diaSemana: 3, titulo: "Visita HU SC", horaInicio: "07:00", horaFim: "08:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 3, titulo: "CC HU SC Mão", horaInicio: "08:00", horaFim: "12:00", local: "HU Santa Casa", tipo: "centro_cirurgico" },
    { diaSemana: 3, titulo: "Ambulatório Ombro", horaInicio: "12:00", horaFim: "16:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 3, titulo: "Ambulatório Quadril", horaInicio: "16:00", horaFim: "18:00", local: "Ambulatório", tipo: "ambulatorio" },
    // Quinta
    { diaSemana: 4, titulo: "Reunião Clínica SOT HU UFJF", horaInicio: "07:00", horaFim: "10:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 4, titulo: "Ambulatório Mão", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 4, titulo: "CC HU DB Mão", horaInicio: "13:00", horaFim: "18:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    // Sexta
    { diaSemana: 5, titulo: "Clube da Revista", horaInicio: "07:00", horaFim: "08:00", local: "HU UFJF", tipo: "reuniao" },
    { diaSemana: 5, titulo: "Visita HU SC", horaInicio: "08:00", horaFim: "09:00", local: "HU Santa Casa", tipo: "visita" },
    { diaSemana: 5, titulo: "Ambulatório Ombro", horaInicio: "10:00", horaFim: "13:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 5, titulo: "CC HU DB Mão", horaInicio: "13:00", horaFim: "16:00", local: "HU Dom Bosco", tipo: "centro_cirurgico" },
    { diaSemana: 5, titulo: "Ambulatório Mão", horaInicio: "16:00", horaFim: "18:00", local: "Ambulatório", tipo: "ambulatorio" },
    { diaSemana: 5, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
    // Sábado
    { diaSemana: 6, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
    // Domingo
    { diaSemana: 0, titulo: "HPS", horaInicio: "19:00", horaFim: "23:00", local: "HPS", tipo: "plantao" },
  ];

  // Função para inserir atividades e audiências
  async function insertActivities(activities, blocos) {
    for (const act of activities) {
      const [result] = await db.insert(weeklyActivities).values({
        titulo: act.titulo,
        diaSemana: act.diaSemana,
        horaInicio: act.horaInicio,
        horaFim: act.horaFim,
        local: act.local,
        tipo: act.tipo,
        descricao: act.descricao || null,
      });
      
      const activityId = result.insertId;
      
      // Inserir audiências para cada bloco
      for (const bloco of blocos) {
        // Verificar se é atividade apenas para R2 ou R3
        if (act.apenasR2 && bloco.ano !== "R2") continue;
        if (act.apenasR3 && bloco.ano !== "R3") continue;
        
        await db.insert(activityAudiences).values({
          activityId: activityId,
          anoResidencia: bloco.ano,
          bloco: bloco.bloco,
        });
      }
    }
  }

  // Inserir atividades de cada bloco
  console.log("Inserindo Bloco A...");
  await insertActivities(blocoA, [{ ano: "R2", bloco: "A" }, { ano: "R3", bloco: "A" }]);
  
  console.log("Inserindo Bloco B...");
  await insertActivities(blocoB, [{ ano: "R2", bloco: "B" }, { ano: "R3", bloco: "B" }]);
  
  console.log("Inserindo Bloco C...");
  await insertActivities(blocoC, [{ ano: "R2", bloco: "C" }, { ano: "R3", bloco: "C" }]);
  
  console.log("Inserindo Enfermaria R1...");
  await insertActivities(enfermaria, [{ ano: "R1", bloco: "Enfermaria" }]);
  
  console.log("Inserindo CC1 R1...");
  await insertActivities(cc1, [{ ano: "R1", bloco: "CC1" }]);
  
  console.log("Inserindo CC2 R1...");
  await insertActivities(cc2, [{ ano: "R1", bloco: "CC2" }]);

  // Contar total de atividades e audiências
  const [actCount] = await db.execute(sql`SELECT COUNT(*) as count FROM weekly_activities`);
  const [audCount] = await db.execute(sql`SELECT COUNT(*) as count FROM activity_audiences`);
  
  console.log(`\n✅ Concluído!`);
  console.log(`Total de atividades: ${actCount[0].count}`);
  console.log(`Total de audiências: ${audCount[0].count}`);
  
  process.exit(0);
}

main().catch(console.error);
