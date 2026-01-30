// Script para recriar todas as atividades semanais com horários corretos do PDF
import { drizzle } from "drizzle-orm/mysql2";
import { weeklyActivities, activityAudiences, stages } from "../drizzle/schema.ts";
import { eq, sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  console.log("🗑️ Limpando atividades existentes...");
  
  // Limpar tabelas
  await db.delete(activityAudiences);
  await db.delete(weeklyActivities);
  
  console.log("✅ Tabelas limpas");
  
  // Buscar IDs dos estágios
  const stagesData = await db.select().from(stages);
  const stageMap = {};
  for (const s of stagesData) {
    stageMap[s.nome] = s.id;
  }
  
  console.log("📋 Estágios encontrados:", Object.keys(stageMap));
  
  // Função helper para inserir atividade
  async function insertActivity(titulo, diaSemana, horaInicio, horaFim, tipo, local, preceptor, blocos) {
    const descricao = preceptor ? `Preceptor: ${preceptor}` : null;
    const observacao = tipo ? `Tipo: ${tipo}` : null;
    const [result] = await db.insert(weeklyActivities).values({
      titulo,
      diaSemana,
      horaInicio,
      horaFim,
      descricao,
      local,
      observacao,
      recorrente: 1
    });
    
    const activityId = result.insertId;
    
    // Inserir audiências
    for (const bloco of blocos) {
      const [ano, blocoNome] = bloco.split("-");
      await db.insert(activityAudiences).values({
        activityId: Number(activityId),
        anoResidencia: ano,
        bloco: blocoNome
      });
    }
    
    return activityId;
  }
  
  console.log("\n📅 Inserindo atividades do BLOCO A (Ombro, Pé e Mão)...");
  
  // BLOCO A - Segunda
  await insertActivity("Visita HU SC", 1, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R2-A", "R3-A"]);
  await insertActivity("CC HU SC Ombro", 1, "09:00", "11:00", "centro_cirurgico", "HU Santa Casa", "Mota", ["R2-A", "R3-A"]);
  await insertActivity("Ambulatório Ombro", 1, "13:00", "15:00", "ambulatorio", "Ambulatório", "Mota", ["R2-A", "R3-A"]);
  await insertActivity("Estudo Dirigido", 1, "17:00", "18:00", "estudo_dirigido", "Sala de Estudos", null, ["R2-A", "R3-A"]);
  await insertActivity("R2 - HPS", 1, "19:00", "23:00", "plantao_hps", "HPS", "Daniel", ["R2-A"]);
  
  // BLOCO A - Terça
  await insertActivity("CC HU DB Ombro", 2, "07:00", "13:00", "centro_cirurgico", "HU Dom Bosco", "Adriano", ["R2-A", "R3-A"]);
  await insertActivity("CC HU DB Pé", 2, "12:00", "16:00", "centro_cirurgico", "HU Dom Bosco", "Tônio", ["R2-A", "R3-A"]);
  await insertActivity("Ambulatório Pé", 2, "16:00", "19:00", "ambulatorio", "Ambulatório", "Tônio", ["R2-A", "R3-A"]);
  
  // BLOCO A - Quarta
  await insertActivity("Visita HU SC", 3, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R2-A", "R3-A"]);
  await insertActivity("CC HU SC Mão", 3, "08:00", "12:00", "centro_cirurgico", "HU Santa Casa", "Breno", ["R2-A", "R3-A"]);
  await insertActivity("Ambulatório Ombro", 3, "12:00", "16:00", "ambulatorio", "Ambulatório", "Adriano", ["R2-A", "R3-A"]);
  await insertActivity("Estudo Dirigido R3", 3, "16:00", "20:00", "estudo_dirigido", "Sala de Estudos", null, ["R3-A"]);
  
  // BLOCO A - Quinta
  await insertActivity("Reunião Clínica SOT HU UFJF", 4, "07:00", "10:00", "reuniao", "HU UFJF", null, ["R2-A", "R3-A"]);
  await insertActivity("Ambulatório Mão", 4, "08:00", "11:00", "ambulatorio", "Ambulatório", "Arnaldo", ["R2-A"]);
  await insertActivity("CC HU DB Ombro", 4, "11:00", "13:00", "centro_cirurgico", "HU Dom Bosco", "Mota", ["R3-A"]);
  await insertActivity("CC HU DB Mão", 4, "12:00", "16:00", "centro_cirurgico", "HU Dom Bosco", "Arnaldo", ["R2-A"]);
  await insertActivity("CC Externo Pé", 4, "16:00", "19:00", "centro_cirurgico", "Externo", "Tônio", ["R3-A"]);
  
  // BLOCO A - Sexta
  await insertActivity("Clube da Revista", 5, "07:00", "08:00", "reuniao", "HU UFJF", null, ["R2-A", "R3-A"]);
  await insertActivity("Visita HU SC", 5, "08:00", "10:00", "visita", "HU Santa Casa", null, ["R2-A", "R3-A"]);
  await insertActivity("Ambulatório Ombro", 5, "10:00", "13:00", "ambulatorio", "Ambulatório", "Adriano", ["R2-A", "R3-A"]);
  await insertActivity("CC HU DB Mão", 5, "13:00", "16:00", "centro_cirurgico", "HU Dom Bosco", "Breno", ["R2-A", "R3-A"]);
  await insertActivity("Ambulatório Mão", 5, "16:00", "19:00", "ambulatorio", "Ambulatório", "Breno", ["R2-A", "R3-A"]);
  
  console.log("✅ Bloco A inserido");
  
  console.log("\n📅 Inserindo atividades do BLOCO B (Coluna e Quadril)...");
  
  // BLOCO B - Segunda
  await insertActivity("Visita HU SC", 1, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R2-B", "R3-B"]);
  await insertActivity("Ambulatório Coluna", 1, "10:00", "12:00", "ambulatorio", "Ambulatório", "Vitor", ["R2-B", "R3-B"]);
  await insertActivity("CC HU SC Coluna", 1, "15:00", "18:00", "centro_cirurgico", "HU Santa Casa", "Vitor", ["R2-B", "R3-B"]);
  
  // BLOCO B - Terça
  await insertActivity("CC HPS Trauma", 2, "07:00", "13:00", "centro_cirurgico", "HPS", "João Paulo", ["R2-B", "R3-B"]);
  await insertActivity("R2 - HPS", 2, "19:00", "23:00", "plantao_hps", "HPS", "Marcus", ["R2-B"]);
  
  // BLOCO B - Quarta
  await insertActivity("Visita HU SC", 3, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R2-B", "R3-B"]);
  await insertActivity("CC HU SC Quadril", 3, "08:00", "12:00", "centro_cirurgico", "HU Santa Casa", "Igor", ["R2-B", "R3-B"]);
  await insertActivity("CC HU SC Coluna", 3, "12:00", "16:00", "centro_cirurgico", "HU Santa Casa", "Jair", ["R2-B", "R3-B"]);
  await insertActivity("Ambulatório Quadril", 3, "16:00", "18:00", "ambulatorio", "Ambulatório", null, ["R2-B", "R3-B"]);
  await insertActivity("Estudo Dirigido", 3, "18:00", "19:00", "estudo_dirigido", "Sala de Estudos", null, ["R2-B", "R3-B"]);
  
  // BLOCO B - Quinta
  await insertActivity("Reunião Clínica SOT HU UFJF", 4, "07:00", "10:00", "reuniao", "HU UFJF", null, ["R2-B", "R3-B"]);
  await insertActivity("Ambulatório Coluna", 4, "10:00", "13:00", "ambulatorio", "Ambulatório", null, ["R2-B", "R3-B"]);
  await insertActivity("CC HU DB Coluna", 4, "13:00", "18:00", "centro_cirurgico", "HU Dom Bosco", "Marcus", ["R2-B", "R3-B"]);
  await insertActivity("Estudo Dirigido", 4, "18:00", "19:00", "estudo_dirigido", "Sala de Estudos", null, ["R2-B", "R3-B"]);
  
  // BLOCO B - Sexta
  await insertActivity("Clube da Revista", 5, "07:00", "08:00", "reuniao", "HU UFJF", null, ["R2-B", "R3-B"]);
  await insertActivity("Visita HU SC", 5, "08:00", "10:00", "visita", "HU Santa Casa", null, ["R2-B", "R3-B"]);
  await insertActivity("CC HU SC Trauma", 5, "15:00", "19:00", "centro_cirurgico", "HU Santa Casa", "Daniel", ["R2-B", "R3-B"]);
  await insertActivity("CC HU SC Trauma Noturno", 5, "19:00", "23:00", "centro_cirurgico", "HU Santa Casa", "Igor", ["R2-B", "R3-B"]);
  
  // BLOCO B - Sábado
  await insertActivity("CC HU SC Quadril", 6, "07:00", "11:00", "centro_cirurgico", "HU Santa Casa", "Daniel", ["R2-B", "R3-B"]);
  await insertActivity("Estudo Dirigido R3", 6, "11:00", "14:00", "estudo_dirigido", "Sala de Estudos", null, ["R3-B"]);
  
  console.log("✅ Bloco B inserido");
  
  console.log("\n📅 Inserindo atividades do BLOCO C (Joelho e Tumor)...");
  
  // BLOCO C - Segunda
  await insertActivity("Visita HU SC", 1, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R2-C", "R3-C"]);
  
  // BLOCO C - Terça
  await insertActivity("Ambulatório Joelho e Tumor", 2, "07:00", "09:00", "ambulatorio", "Ambulatório", null, ["R2-C", "R3-C"]);
  await insertActivity("CC HPS Trauma", 2, "09:00", "13:00", "centro_cirurgico", "HPS", "Bruno", ["R2-C", "R3-C"]);
  await insertActivity("Estudo Dirigido", 2, "11:00", "12:00", "estudo_dirigido", "Sala de Estudos", null, ["R2-C", "R3-C"]);
  await insertActivity("CC HTO Trauma", 2, "15:00", "17:00", "centro_cirurgico", "HTO", "Breno", ["R2-C", "R3-C"]);
  
  // BLOCO C - Quarta
  await insertActivity("CC HU DB Joelho", 3, "07:00", "10:00", "centro_cirurgico", "HU Dom Bosco", "Sávio", ["R2-C", "R3-C"]);
  await insertActivity("CC HU SC Joelho", 3, "13:00", "17:00", "centro_cirurgico", "HU Santa Casa", "Bruno", ["R2-C", "R3-C"]);
  
  // BLOCO C - Quinta
  await insertActivity("Reunião Clínica SOT HU UFJF", 4, "07:00", "10:00", "reuniao", "HU UFJF", null, ["R2-C", "R3-C"]);
  await insertActivity("CC HU DB Joelho", 4, "10:00", "12:00", "centro_cirurgico", "HU Dom Bosco", "Bruno", ["R2-C", "R3-C"]);
  await insertActivity("CC HU SC Trauma", 4, "13:00", "17:00", "centro_cirurgico", "HU Santa Casa", "Daniel", ["R2-C", "R3-C"]);
  await insertActivity("CC HTO Trauma", 4, "15:00", "17:00", "centro_cirurgico", "HTO", "Igor", ["R2-C", "R3-C"]);
  
  // BLOCO C - Sexta
  await insertActivity("Clube da Revista", 5, "07:00", "08:00", "reuniao", "HU UFJF", null, ["R2-C", "R3-C"]);
  await insertActivity("Visita HU SC", 5, "08:00", "09:00", "visita", "HU Santa Casa", null, ["R2-C", "R3-C"]);
  await insertActivity("CC HU SC Tumor", 5, "09:00", "13:00", "centro_cirurgico", "HU Santa Casa", "Sávio", ["R2-C", "R3-C"]);
  await insertActivity("Estudo Dirigido", 5, "13:00", "15:00", "estudo_dirigido", "Sala de Estudos", null, ["R2-C", "R3-C"]);
  
  console.log("✅ Bloco C inserido");
  
  console.log("\n📅 Inserindo atividades da ENFERMARIA (R1)...");
  
  // ENFERMARIA - Segunda
  await insertActivity("Visita HU SC", 1, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R1-Enfermaria"]);
  await insertActivity("Enfermaria", 1, "08:00", "12:00", "enfermaria", "HU UFJF", null, ["R1-Enfermaria"]);
  
  // ENFERMARIA - Terça
  await insertActivity("Ambulatório Joelho e Tumor", 2, "07:00", "09:00", "ambulatorio", "Ambulatório", null, ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Coluna", 2, "10:00", "12:00", "ambulatorio", "Ambulatório", "Vitor", ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Ombro", 2, "13:00", "15:00", "ambulatorio", "Ambulatório", "Mota", ["R1-Enfermaria"]);
  await insertActivity("Estudo Dirigido", 2, "17:00", "18:00", "estudo_dirigido", "Sala de Estudos", null, ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Pé", 2, "16:00", "18:00", "ambulatorio", "Ambulatório", "Tonio", ["R1-Enfermaria"]);
  
  // ENFERMARIA - Quarta
  await insertActivity("Visita HU SC", 3, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R1-Enfermaria"]);
  await insertActivity("Enfermaria", 3, "09:00", "12:00", "enfermaria", "HU UFJF", null, ["R1-Enfermaria"]);
  await insertActivity("Enfermaria", 3, "14:00", "16:00", "enfermaria", "HU UFJF", null, ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Quadril", 3, "16:00", "17:00", "ambulatorio", "Ambulatório", null, ["R1-Enfermaria"]);
  await insertActivity("Estudo Dirigido", 3, "18:00", "19:00", "estudo_dirigido", "Sala de Estudos", null, ["R1-Enfermaria"]);
  
  // ENFERMARIA - Quinta
  await insertActivity("Reunião Clínica SOT HU UFJF", 4, "07:00", "10:00", "reuniao", "HU UFJF", null, ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Coluna", 4, "10:00", "12:00", "ambulatorio", "Ambulatório", null, ["R1-Enfermaria"]);
  await insertActivity("Enfermaria", 4, "14:00", "16:00", "enfermaria", "HU UFJF", null, ["R1-Enfermaria"]);
  await insertActivity("Visita HU SC", 4, "18:00", "19:00", "visita", "HU Santa Casa", "Marcus", ["R1-Enfermaria"]);
  
  // ENFERMARIA - Sexta
  await insertActivity("Clube da Revista", 5, "07:00", "08:00", "reuniao", "HU UFJF", null, ["R1-Enfermaria"]);
  await insertActivity("Visita HU SC", 5, "08:00", "10:00", "visita", "HU Santa Casa", null, ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Ombro", 5, "10:00", "12:00", "ambulatorio", "Ambulatório", "Adriano", ["R1-Enfermaria"]);
  await insertActivity("Enfermaria", 5, "14:00", "17:00", "enfermaria", "HU UFJF", null, ["R1-Enfermaria"]);
  await insertActivity("Ambulatório Mão", 5, "16:00", "18:00", "ambulatorio", "Ambulatório", "Breno", ["R1-Enfermaria"]);
  
  // ENFERMARIA - Sábado/Domingo (Plantão)
  await insertActivity("R1 - HPS", 5, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-Enfermaria"]);
  await insertActivity("R1 - HPS", 6, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-Enfermaria"]);
  await insertActivity("R1 - HPS", 0, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-Enfermaria"]);
  
  console.log("✅ Enfermaria inserida");
  
  console.log("\n📅 Inserindo atividades do CENTRO CIRÚRGICO 1 (R1)...");
  
  // CC1 - Segunda
  await insertActivity("Visita HU SC", 1, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R1-CC1"]);
  await insertActivity("CC HU SC Ombro", 1, "08:00", "10:00", "centro_cirurgico", "HU Santa Casa", "Mota", ["R1-CC1"]);
  await insertActivity("CC HU SC Coluna", 1, "15:00", "18:00", "centro_cirurgico", "HU Santa Casa", "Vitor", ["R1-CC1"]);
  
  // CC1 - Terça
  await insertActivity("Ambulatório Joelho e Tumor", 2, "07:00", "09:00", "ambulatorio", "Ambulatório", null, ["R1-CC1"]);
  await insertActivity("CC HU SC Joelho", 2, "13:00", "17:00", "centro_cirurgico", "HU Santa Casa", "Bruno", ["R1-CC1"]);
  
  // CC1 - Quarta
  await insertActivity("Visita HU SC", 3, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R1-CC1"]);
  await insertActivity("CC HU SC Quadril", 3, "08:00", "10:00", "centro_cirurgico", "HU Santa Casa", "Igor", ["R1-CC1"]);
  await insertActivity("CC HU SC Coluna/Quadril", 3, "14:00", "18:00", "centro_cirurgico", "HU Santa Casa", "Jair/Daniel", ["R1-CC1"]);
  await insertActivity("Estudo Dirigido", 3, "19:00", "20:00", "estudo_dirigido", "Sala de Estudos", null, ["R1-CC1"]);
  
  // CC1 - Quinta
  await insertActivity("Reunião Clínica SOT HU UFJF", 4, "07:00", "10:00", "reuniao", "HU UFJF", null, ["R1-CC1"]);
  await insertActivity("Ambulatório Coluna", 4, "10:00", "12:00", "ambulatorio", "Ambulatório", null, ["R1-CC1"]);
  await insertActivity("CC HU DB Coluna", 4, "13:00", "16:00", "centro_cirurgico", "HU Dom Bosco", "Marcus", ["R1-CC1"]);
  await insertActivity("Estudo Dirigido", 4, "19:00", "20:00", "estudo_dirigido", "Sala de Estudos", null, ["R1-CC1"]);
  
  // CC1 - Sexta
  await insertActivity("Clube da Revista", 5, "07:00", "08:00", "reuniao", "HU UFJF", null, ["R1-CC1"]);
  await insertActivity("Visita HU SC", 5, "08:00", "09:00", "visita", "HU Santa Casa", null, ["R1-CC1"]);
  await insertActivity("CC HU SC Tumor", 5, "09:00", "12:00", "centro_cirurgico", "HU Santa Casa", "Sávio", ["R1-CC1"]);
  await insertActivity("CC HU SC Trauma", 5, "15:00", "18:00", "centro_cirurgico", "HU Santa Casa", "Daniel", ["R1-CC1"]);
  
  // CC1 - Sábado/Domingo (Plantão)
  await insertActivity("R1 - HPS", 5, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-CC1"]);
  await insertActivity("R1 - HPS", 6, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-CC1"]);
  await insertActivity("R1 - HPS", 0, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-CC1"]);
  
  console.log("✅ Centro Cirúrgico 1 inserido");
  
  console.log("\n📅 Inserindo atividades do CENTRO CIRÚRGICO 2 (R1)...");
  
  // CC2 - Segunda
  await insertActivity("Visita HU SC", 1, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R1-CC2"]);
  await insertActivity("Ambulatório Coluna", 1, "10:00", "12:00", "ambulatorio", "Ambulatório", "Vitor", ["R1-CC2"]);
  await insertActivity("Ambulatório Ombro", 1, "13:00", "15:00", "ambulatorio", "Ambulatório", "Mota", ["R1-CC2"]);
  await insertActivity("Estudo Dirigido", 1, "17:00", "18:00", "estudo_dirigido", "Sala de Estudos", null, ["R1-CC2"]);
  
  // CC2 - Terça
  await insertActivity("Ambulatório Joelho e Tumor", 2, "07:00", "09:00", "ambulatorio", "Ambulatório", null, ["R1-CC2"]);
  await insertActivity("CC Externo", 2, "13:00", "15:00", "centro_cirurgico", "Externo", "Arnaldo", ["R1-CC2"]);
  
  // CC2 - Quarta
  await insertActivity("Visita HU SC", 3, "07:00", "08:00", "visita", "HU Santa Casa", null, ["R1-CC2"]);
  await insertActivity("CC HU SC Mão", 3, "08:00", "10:00", "centro_cirurgico", "HU Santa Casa", "Breno", ["R1-CC2"]);
  await insertActivity("Ambulatório Ombro", 3, "12:00", "16:00", "ambulatorio", "Ambulatório", "Adriano", ["R1-CC2"]);
  await insertActivity("Ambulatório Quadril", 3, "16:00", "18:00", "ambulatorio", "Ambulatório", null, ["R1-CC2"]);
  
  // CC2 - Quinta
  await insertActivity("Reunião Clínica SOT HU UFJF", 4, "07:00", "10:00", "reuniao", "HU UFJF", null, ["R1-CC2"]);
  await insertActivity("Ambulatório Mão", 4, "10:00", "12:00", "ambulatorio", "Ambulatório", "Arnaldo", ["R1-CC2"]);
  await insertActivity("CC HU DB Mão", 4, "13:00", "16:00", "centro_cirurgico", "HU Dom Bosco", "Arnaldo", ["R1-CC2"]);
  await insertActivity("Ambulatório Mão", 4, "17:00", "19:00", "ambulatorio", "Ambulatório", "Breno", ["R1-CC2"]);
  
  // CC2 - Sexta
  await insertActivity("Clube da Revista", 5, "07:00", "08:00", "reuniao", "HU UFJF", null, ["R1-CC2"]);
  await insertActivity("Visita HU SC", 5, "08:00", "10:00", "visita", "HU Santa Casa", null, ["R1-CC2"]);
  await insertActivity("Ambulatório Ombro", 5, "10:00", "12:00", "ambulatorio", "Ambulatório", "Adriano", ["R1-CC2"]);
  await insertActivity("CC HU DB Mão", 5, "13:00", "16:00", "centro_cirurgico", "HU Dom Bosco", "Breno", ["R1-CC2"]);
  await insertActivity("Ambulatório Mão", 5, "16:00", "19:00", "ambulatorio", "Ambulatório", "Breno", ["R1-CC2"]);
  
  // CC2 - Sábado
  await insertActivity("CC HU SC Quadril", 6, "07:00", "11:00", "centro_cirurgico", "HU Santa Casa", "Daniel", ["R1-CC2"]);
  
  // CC2 - Sábado/Domingo (Plantão)
  await insertActivity("R1 - HPS", 5, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-CC2"]);
  await insertActivity("R1 - HPS", 6, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-CC2"]);
  await insertActivity("R1 - HPS", 0, "19:00", "23:00", "plantao_hps", "HPS", null, ["R1-CC2"]);
  
  console.log("✅ Centro Cirúrgico 2 inserido");
  
  // Contar total de atividades
  const totalActivities = await db.select({ count: sql`COUNT(*)` }).from(weeklyActivities);
  const totalAudiences = await db.select({ count: sql`COUNT(*)` }).from(activityAudiences);
  
  console.log(`\n📊 Total de atividades inseridas: ${totalActivities[0].count}`);
  console.log(`📊 Total de audiências inseridas: ${totalAudiences[0].count}`);
  
  console.log("\n✅ Todas as atividades foram recriadas com sucesso!");
  
  process.exit(0);
}

main().catch(console.error);
