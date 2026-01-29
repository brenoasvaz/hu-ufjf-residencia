import { drizzle } from "drizzle-orm/mysql2";
import { residents, stages, rotations, rotationAssignments, weeklyActivities, activityAudiences } from "../drizzle/schema.ts";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Limpar dados existentes (cuidado em produção!)
    console.log("🗑️  Limpando dados existentes...");
    await db.delete(activityAudiences);
    await db.delete(weeklyActivities);
    await db.delete(rotationAssignments);
    await db.delete(rotations);
    await db.delete(stages);
    await db.delete(residents);

    // Inserir residentes
    console.log("👥 Inserindo residentes...");
    const [residentR1_1] = await db.insert(residents).values({
      nomeCompleto: "João Silva Santos",
      apelido: "João",
      anoResidencia: "R1",
      ativo: 1,
    });

    const [residentR1_2] = await db.insert(residents).values({
      nomeCompleto: "Maria Oliveira Costa",
      apelido: "Maria",
      anoResidencia: "R1",
      ativo: 1,
    });

    const [residentR2_1] = await db.insert(residents).values({
      nomeCompleto: "Pedro Henrique Alves",
      apelido: "Pedro",
      anoResidencia: "R2",
      ativo: 1,
    });

    const [residentR2_2] = await db.insert(residents).values({
      nomeCompleto: "Ana Carolina Ferreira",
      apelido: "Carol",
      anoResidencia: "R2",
      ativo: 1,
    });

    const [residentR3_1] = await db.insert(residents).values({
      nomeCompleto: "Lucas Martins Souza",
      apelido: "Lucas",
      anoResidencia: "R3",
      ativo: 1,
    });

    const [residentR3_2] = await db.insert(residents).values({
      nomeCompleto: "Juliana Rodrigues Lima",
      apelido: "Ju",
      anoResidencia: "R3",
      ativo: 1,
    });

    console.log(`✅ ${6} residentes inseridos`);

    // Inserir estágios
    console.log("📍 Inserindo estágios...");
    const stagesData = [
      { nome: "Enfermaria", descricao: "Enfermaria de Ortopedia", ativo: 1 },
      { nome: "CC1", descricao: "Centro Cirúrgico 1", ativo: 1 },
      { nome: "CC2", descricao: "Centro Cirúrgico 2", ativo: 1 },
      { nome: "Bloco A", descricao: "Ombro, Pé e Mão (R2/R3)", ativo: 1 },
      { nome: "Bloco B", descricao: "Coluna e Quadril (R2/R3)", ativo: 1 },
      { nome: "Bloco C", descricao: "Joelho e Tumor (R2/R3)", ativo: 1 },
    ];

    for (const stage of stagesData) {
      await db.insert(stages).values(stage);
    }

    console.log(`✅ ${stagesData.length} estágios inseridos`);

    // Inserir rodízios (Janeiro 2026)
    console.log("📅 Inserindo rodízios...");
    const [rotation1] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Enfermaria",
      mesReferencia: "2026-01",
      descricao: "Rodízio R1 - Enfermaria",
    });

    const [rotation2] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Bloco A",
      mesReferencia: "2026-01",
      descricao: "Rodízio R2 - Bloco A (Ombro/Pé/Mão)",
    });

    const [rotation3] = await db.insert(rotations).values({
      dataInicio: new Date("2026-01-01"),
      dataFim: new Date("2026-01-31"),
      localEstagio: "Bloco B",
      mesReferencia: "2026-01",
      descricao: "Rodízio R3 - Bloco B (Coluna/Quadril)",
    });

    console.log(`✅ ${3} rodízios inseridos`);

    // Inserir assignments (duplas)
    console.log("👥 Inserindo assignments de duplas...");
    const duplaR1 = 1;
    await db.insert(rotationAssignments).values({
      rotationId: rotation1.insertId,
      residentId: residentR1_1.insertId,
      papel: "TITULAR",
      duplaId: duplaR1,
    });

    await db.insert(rotationAssignments).values({
      rotationId: rotation1.insertId,
      residentId: residentR1_2.insertId,
      papel: "TITULAR",
      duplaId: duplaR1,
    });

    const duplaR2 = 2;
    await db.insert(rotationAssignments).values({
      rotationId: rotation2.insertId,
      residentId: residentR2_1.insertId,
      papel: "TITULAR",
      duplaId: duplaR2,
    });

    await db.insert(rotationAssignments).values({
      rotationId: rotation2.insertId,
      residentId: residentR2_2.insertId,
      papel: "TITULAR",
      duplaId: duplaR2,
    });

    const duplaR3 = 3;
    await db.insert(rotationAssignments).values({
      rotationId: rotation3.insertId,
      residentId: residentR3_1.insertId,
      papel: "TITULAR",
      duplaId: duplaR3,
    });

    await db.insert(rotationAssignments).values({
      rotationId: rotation3.insertId,
      residentId: residentR3_2.insertId,
      papel: "TITULAR",
      duplaId: duplaR3,
    });

    console.log(`✅ ${6} assignments inseridos`);

    // Inserir atividades semanais
    console.log("📚 Inserindo atividades semanais...");
    
    // Segunda-feira - Reunião Clínica
    const [activity1] = await db.insert(weeklyActivities).values({
      diaSemana: 1, // Segunda
      horaInicio: "07:00",
      horaFim: "08:00",
      titulo: "Reunião Clínica",
      descricao: "Discussão de casos clínicos e apresentação de artigos",
      local: "Anfiteatro",
      recorrente: 1,
    });

    await db.insert(activityAudiences).values([
      { activityId: activity1.insertId, anoResidencia: "R1", opcional: 0 },
      { activityId: activity1.insertId, anoResidencia: "R2", opcional: 0 },
      { activityId: activity1.insertId, anoResidencia: "R3", opcional: 0 },
    ]);

    // Terça-feira - Ambulatório
    const [activity2] = await db.insert(weeklyActivities).values({
      diaSemana: 2, // Terça
      horaInicio: "13:00",
      horaFim: "17:00",
      titulo: "Ambulatório de Ombro",
      descricao: "Atendimento ambulatorial especializado",
      local: "Ambulatório",
      recorrente: 1,
    });

    await db.insert(activityAudiences).values([
      { activityId: activity2.insertId, anoResidencia: "R2", bloco: "A", opcional: 0 },
      { activityId: activity2.insertId, anoResidencia: "R3", bloco: "A", opcional: 0 },
    ]);

    // Quarta-feira - Centro Cirúrgico
    const [activity3] = await db.insert(weeklyActivities).values({
      diaSemana: 3, // Quarta
      horaInicio: "07:00",
      horaFim: "13:00",
      titulo: "Centro Cirúrgico",
      descricao: "Cirurgias eletivas",
      local: "Centro Cirúrgico",
      recorrente: 1,
    });

    await db.insert(activityAudiences).values([
      { activityId: activity3.insertId, anoResidencia: "R1", opcional: 0 },
      { activityId: activity3.insertId, anoResidencia: "R2", opcional: 1 },
    ]);

    // Quinta-feira - Aula Teórica
    const [activity4] = await db.insert(weeklyActivities).values({
      diaSemana: 4, // Quinta
      horaInicio: "18:00",
      horaFim: "19:30",
      titulo: "Aula Teórica - Fraturas do Fêmur",
      descricao: "Aula ministrada pelo Dr. Silva",
      local: "Sala de Aula",
      recorrente: 1,
    });

    await db.insert(activityAudiences).values([
      { activityId: activity4.insertId, anoResidencia: "R1", opcional: 0 },
    ]);

    // Sexta-feira - Visita Enfermaria
    const [activity5] = await db.insert(weeklyActivities).values({
      diaSemana: 5, // Sexta
      horaInicio: "07:00",
      horaFim: "09:00",
      titulo: "Visita à Enfermaria",
      descricao: "Visita aos pacientes internados",
      local: "Enfermaria",
      recorrente: 1,
    });

    await db.insert(activityAudiences).values([
      { activityId: activity5.insertId, anoResidencia: "R1", opcional: 0 },
      { activityId: activity5.insertId, anoResidencia: "R2", opcional: 1 },
      { activityId: activity5.insertId, anoResidencia: "R3", opcional: 1 },
    ]);

    console.log(`✅ ${5} atividades semanais inseridas`);

    console.log("✨ Seed concluído com sucesso!");
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
