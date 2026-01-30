import { drizzle } from "drizzle-orm/mysql2";
import { residents, rotations, rotationAssignments, stages } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

console.log("🌱 Iniciando seed de rodízios anuais...");

// Primeiro, vamos buscar os IDs dos residentes e estágios
const allResidents = await db.select().from(residents);
const allStages = await db.select().from(stages);

console.log(`✅ Encontrados ${allResidents.length} residentes e ${allStages.length} estágios`);

// Mapear residentes por nome
const residentMap = {};
allResidents.forEach(r => {
  residentMap[r.nomeCompleto] = r.id;
});

// Mapear estágios por nome (stages tem unique constraint no nome)
const stageMap = {};
allStages.forEach(s => {
  stageMap[s.nome] = s.id;
});

// Criar residentes se não existirem
const residentsToCreate = [
  { nomeCompleto: "Guilherme Lamas", anoResidencia: "R2" },
  { nomeCompleto: "Guilherme Coelho", anoResidencia: "R2" },
  { nomeCompleto: "João Pedro", anoResidencia: "R2" },
  { nomeCompleto: "Mariana Moraes", anoResidencia: "R3" },
  { nomeCompleto: "Henrique Goulart", anoResidencia: "R3" },
  { nomeCompleto: "Jéssica Américo", anoResidencia: "R3" },
];

for (const resData of residentsToCreate) {
  if (!residentMap[resData.nomeCompleto]) {
    const [inserted] = await db.insert(residents).values(resData);
    residentMap[resData.nomeCompleto] = Number(inserted.insertId);
    console.log(`✅ Residente criado: ${resData.nomeCompleto} (ID: ${residentMap[resData.nomeCompleto]})`);
  }
}

// Criar estágios se não existirem (stages tem unique constraint no nome)
const stagesToCreate = [
  { nome: "Bloco A", descricao: "Ombro, Pé e Mão" },
  { nome: "Bloco B", descricao: "Coluna e Quadril" },
  { nome: "Bloco C", descricao: "Joelho e Tumor" },
];

for (const stageData of stagesToCreate) {
  if (!stageMap[stageData.nome]) {
    const [inserted] = await db.insert(stages).values(stageData);
    stageMap[stageData.nome] = Number(inserted.insertId);
    console.log(`✅ Estágio criado: ${stageData.nome} (ID: ${stageMap[stageData.nome]})`);
  }
}

// Limpar rodízios existentes
await db.delete(rotationAssignments);
await db.delete(rotations);
console.log("🗑️  Rodízios anteriores removidos");

// Cronograma anual de rodízios
const cronograma = [
  {
    mes: "2026-03",
    blocoA: ["Guilherme Lamas", "Mariana Moraes"],
    blocoB: ["Guilherme Coelho", "Henrique Goulart"],
    blocoC: ["João Pedro", "Jéssica Américo"],
  },
  {
    mes: "2026-04",
    blocoA: ["João Pedro", "Jéssica Américo"],
    blocoB: ["Guilherme Lamas", "Mariana Moraes"],
    blocoC: ["Guilherme Coelho", "Henrique Goulart"],
  },
  {
    mes: "2026-05",
    blocoA: ["Guilherme Coelho", "Henrique Goulart"],
    blocoB: ["João Pedro", "Jéssica Américo"],
    blocoC: ["Guilherme Lamas", "Mariana Moraes"],
  },
  {
    mes: "2026-06",
    blocoA: ["Guilherme Lamas", "Henrique Goulart"],
    blocoB: ["Guilherme Coelho", "Jéssica Américo"],
    blocoC: ["João Pedro", "Mariana Moraes"],
  },
  {
    mes: "2026-07",
    blocoA: ["João Pedro", "Mariana Moraes"],
    blocoB: ["Guilherme Lamas", "Henrique Goulart"],
    blocoC: ["Guilherme Coelho", "Jéssica Américo"],
  },
  {
    mes: "2026-08",
    blocoA: ["Guilherme Coelho", "Jéssica Américo"],
    blocoB: ["João Pedro", "Mariana Moraes"],
    blocoC: ["Guilherme Lamas", "Henrique Goulart"],
  },
  {
    mes: "2026-09",
    blocoA: ["Guilherme Lamas", "Jéssica Américo"],
    blocoB: ["Guilherme Coelho", "Mariana Moraes"],
    blocoC: ["João Pedro", "Henrique Goulart"],
  },
  {
    mes: "2026-10",
    blocoA: ["João Pedro", "Henrique Goulart"],
    blocoB: ["Guilherme Lamas", "Jéssica Américo"],
    blocoC: ["Guilherme Coelho", "Mariana Moraes"],
  },
  {
    mes: "2026-11",
    blocoA: ["Guilherme Coelho", "Mariana Moraes"],
    blocoB: ["João Pedro", "Henrique Goulart"],
    blocoC: ["Guilherme Lamas", "Jéssica Américo"],
  },
  {
    mes: "2026-12",
    blocoA: ["Guilherme Lamas", "Mariana Moraes"],
    blocoB: ["Guilherme Coelho", "Henrique Goulart"],
    blocoC: ["João Pedro", "Jéssica Américo"],
  },
  {
    mes: "2027-01",
    blocoA: ["João Pedro", "Jéssica Américo"],
    blocoB: ["Guilherme Lamas", "Mariana Moraes"],
    blocoC: ["Guilherme Coelho", "Henrique Goulart"],
  },
  {
    mes: "2027-02",
    blocoA: ["Guilherme Coelho", "Henrique Goulart"],
    blocoB: ["João Pedro", "Jéssica Américo"],
    blocoC: ["Guilherme Lamas", "Mariana Moraes"],
  },
];

// Função helper para obter último dia do mês
function getLastDayOfMonth(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

// Criar rodízios e assignments
for (const periodo of cronograma) {
  const [year, month] = periodo.mes.split("-").map(Number);
  const lastDay = getLastDayOfMonth(periodo.mes);
  const dataInicio = new Date(year, month - 1, 1); // month - 1 porque Date usa 0-11
  const dataFim = new Date(year, month - 1, lastDay);

  // Processar cada bloco
  for (const [blocoNome, residentes] of Object.entries({
    blocoA: periodo.blocoA,
    blocoB: periodo.blocoB,
    blocoC: periodo.blocoC,
  })) {
    const blocoLabel = blocoNome === "blocoA" ? "Bloco A" : blocoNome === "blocoB" ? "Bloco B" : "Bloco C";
    
    // Criar dupla ID única
    const duplaId = `${periodo.mes}-${blocoLabel}`;
    
    // Criar rodízio para cada residente
    for (const residenteNome of residentes) {
      const residenteId = residentMap[residenteNome];
      
      if (!residenteId) {
        console.warn(`⚠️  Residente não encontrado: ${residenteNome}`);
        continue;
      }
      
      // Buscar estágio pelo nome do bloco
      const stageId = stageMap[blocoLabel];
      
      if (!stageId) {
        console.warn(`⚠️  Estágio não encontrado: ${blocoLabel}`);
        continue;
      }
      
      // Criar rodízio
      const [rotationResult] = await db.insert(rotations).values({
        dataInicio,
        dataFim,
        mesReferencia: periodo.mes,
        localEstagio: blocoLabel,
      });
      
      const rotationId = Number(rotationResult.insertId);
      
      // Criar assignment
      await db.insert(rotationAssignments).values({
        rotationId,
        residentId: residenteId,
        duplaId,
      });
      
      console.log(`✅ Rodízio criado: ${residenteNome} - ${blocoLabel} (${periodo.mes})`);
    }
  }
}

console.log("🎉 Seed de rodízios anuais concluído!");
process.exit(0);
