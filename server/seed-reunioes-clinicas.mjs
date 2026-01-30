/**
 * Seed script para popular reuniões clínicas de 2026
 * Dados extraídos do PDF ReuniõesClínicasHUUFJF2026.pdf
 * TODAS AS DATAS SÃO QUINTAS-FEIRAS
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não definida");
  process.exit(1);
}

async function seed() {
  console.log("Conectando ao banco de dados...");
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("Limpando reuniões clínicas existentes...");
  await connection.execute("DELETE FROM clinical_meetings");
  await connection.execute("DELETE FROM presentation_guidelines");

  console.log("Inserindo orientações de apresentação...");
  
  // Orientações de apresentação
  const guidelines = [
    {
      tipo: "AULA",
      titulo: "A - Aulas",
      descricao: "Apresentadas por preceptores ou convidados, conforme programação a seguir.",
      tempo_apresentacao: 30,
      tempo_discussao: 10,
      orientacoes: JSON.stringify([
        "As aulas poderão ser interativas, baseadas na literatura da CET para o TEOT",
        "Ao final o apresentador poderá conduzir uma discussão pertinente ao tema exposto"
      ])
    },
    {
      tipo: "ARTIGO",
      titulo: "B - Artigo da Semana",
      descricao: "Apresentadas pelos residentes do 2º ano, conforme orientação do preceptor designado previamente.",
      tempo_apresentacao: 10,
      tempo_discussao: 5,
      orientacoes: JSON.stringify([
        "O artigo idealmente deverá ser fornecido à equipe previamente para possibilitar a leitura e avaliação do mesmo",
        "Ao final da apresentação, será realizada discussão do artigo e do tema pelo corpo de preceptores presentes, envolvendo os residentes"
      ])
    },
    {
      tipo: "CASOS_CLINICOS",
      titulo: "C - Casos Clínicos",
      descricao: "O residente designado (R1) será responsável pela apresentação dos casos internados naquela semana.",
      tempo_apresentacao: 20,
      tempo_discussao: 10,
      orientacoes: JSON.stringify([
        "Os casos serão apresentados pelo residente designado. Até o mês de julho, o R2 deverá auxiliar o R1 na organização e apresentação dos casos",
        "Após, um R3 será definido para arguição sobre um caso"
      ])
    }
  ];

  for (const g of guidelines) {
    await connection.execute(
      `INSERT INTO presentation_guidelines (tipo, titulo, descricao, tempo_apresentacao, tempo_discussao, orientacoes) VALUES (?, ?, ?, ?, ?, ?)`,
      [g.tipo, g.titulo, g.descricao, g.tempo_apresentacao, g.tempo_discussao, g.orientacoes]
    );
  }
  console.log(`✓ ${guidelines.length} orientações inseridas`);

  console.log("Inserindo reuniões clínicas de 2026...");
  
  // Reuniões clínicas de 2026 - TODAS AS QUINTAS-FEIRAS
  // Fevereiro 2026 a Fevereiro 2027
  const meetings = [
    // FEVEREIRO 2026 (quintas-feiras: 5, 12, 19, 26)
    { data: "2026-02-05", tema: "Abertura do ano letivo", tipo: "EVENTO", preceptor: "Dr. Jair Moreira", residente: null },
    { data: "2026-02-05", tema: "Apresentação das escalas e semana padrão", tipo: "EVENTO", preceptor: "Dr. Breno Vaz", residente: null },
    { data: "2026-02-05", tema: "Joelho - Lesões ligamentares do Joelho", tipo: "AULA", preceptor: "Dr. Bruno Fajardo", residente: null },
    { data: "2026-02-12", tema: "Instabilidade Patelar", tipo: "AULA", preceptor: "Dr. Sávio Mourão", residente: null },
    { data: "2026-02-12", tema: "Apresentação de artigo", tipo: "ARTIGO", preceptor: "Dr. Sávio Mourão", residente: "R2" },
    { data: "2026-02-12", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Sávio Mourão", residente: "R1, R3" },
    { data: "2026-02-19", tema: "Joelho - Lesões Meniscais", tipo: "AULA", preceptor: "Dr. Bruno Fajardo", residente: null },
    { data: "2026-02-19", tema: "Apresentação de artigo", tipo: "ARTIGO", preceptor: "Dr. Bruno Fajardo", residente: "R2" },
    { data: "2026-02-19", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Bruno Fajardo", residente: "R1, R3" },
    { data: "2026-02-26", tema: "Pé e Tornozelo - Pé Diabético", tipo: "AULA", preceptor: "Dr. João Paulo", residente: null },
    { data: "2026-02-26", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. João Paulo", residente: "R2" },
    { data: "2026-02-26", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. João Paulo", residente: "R1, R3" },
    
    // MARÇO 2026 (quintas-feiras: 5, 12, 19, 26)
    { data: "2026-03-05", tema: "Recepção dos residentes", tipo: "EVENTO", preceptor: "Dr. Jair Moreira", residente: null },
    { data: "2026-03-05", tema: "Trauma - Princípios de Osteossíntese", tipo: "AULA", preceptor: "Dr. Jurandir Antunes", residente: null },
    { data: "2026-03-05", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Igor Gerdi", residente: "R2" },
    { data: "2026-03-12", tema: "RECESSO PARA O TEOT", tipo: "RECESSO", preceptor: null, residente: null },
    { data: "2026-03-19", tema: "Geral - Osteomielite", tipo: "AULA", preceptor: "Dr. José da Mota", residente: null },
    { data: "2026-03-19", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. José da Mota", residente: "R2" },
    { data: "2026-03-19", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. José da Mota", residente: "R1, R3" },
    { data: "2026-03-26", tema: "Trauma - Fraturas Expostas / Controle de Danos", tipo: "AULA", preceptor: "Dr. Igor Gerdi", residente: null },
    { data: "2026-03-26", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Igor Gerdi", residente: "R2" },
    { data: "2026-03-26", tema: "Abordagem fisioterapêutica ambulatorial no paciente politraumatizado", tipo: "AULA", preceptor: "Equipe Fisioterapia", residente: null },
    
    // ABRIL 2026 (quintas-feiras: 2, 9, 16, 23, 30)
    { data: "2026-04-02", tema: "Pé e Tornozelo - Hálux Valgo", tipo: "AULA", preceptor: "Dr. Igor Bonato", residente: null },
    { data: "2026-04-02", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. João Paulo", residente: "R2" },
    { data: "2026-04-02", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Igor Bonato", residente: "R1, R3" },
    { data: "2026-04-09", tema: "Pé e Tornozelo - Pé Plano", tipo: "AULA", preceptor: "Dr. Thiago Resende", residente: null },
    { data: "2026-04-09", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. João Paulo", residente: "R2" },
    { data: "2026-04-09", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Thiago Resende", residente: "R1, R3" },
    { data: "2026-04-16", tema: "Feriado - Quinta Feira Santa", tipo: "FERIADO", preceptor: null, residente: null },
    { data: "2026-04-23", tema: "Joelho - Gonartrose / Princípios de artroplastia total do joelho", tipo: "AULA", preceptor: "Dr. Bruno Fajardo", residente: null },
    { data: "2026-04-23", tema: "Apresentação de artigo", tipo: "ARTIGO", preceptor: "Dr. Bruno Fajardo", residente: "R2" },
    { data: "2026-04-23", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Bruno Fajardo", residente: "R1, R3" },
    { data: "2026-04-30", tema: "Pé e Tornozelo - Fraturas dos Ossos do Tarso", tipo: "AULA", preceptor: "Dr. Tônio Reis", residente: null },
    { data: "2026-04-30", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Tônio Reis", residente: "R2" },
    { data: "2026-04-30", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Tônio Reis", residente: "R1, R3" },
    
    // MAIO 2026 (quintas-feiras: 7, 14, 21, 28)
    { data: "2026-05-07", tema: "Pediátrica - Mucopolissacaridoses", tipo: "AULA", preceptor: "Dra. Jordana Caiafa", residente: null },
    { data: "2026-05-07", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dra. Jordana Caiafa", residente: "R2" },
    { data: "2026-05-07", tema: "Apresentação representante", tipo: "EVENTO", preceptor: "Representante", residente: null },
    { data: "2026-05-14", tema: "Pediátrica - Fraturas do Cotovelo Infantil", tipo: "AULA", preceptor: "Dr. Leonardo de Castro", residente: null },
    { data: "2026-05-14", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Breno Vaz", residente: "R2" },
    { data: "2026-05-14", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Breno Vaz", residente: "R1, R3" },
    { data: "2026-05-21", tema: "Pediátrica - Paralisia Braquial Obstétrica", tipo: "AULA", preceptor: "Dr. Breno Vaz", residente: null },
    { data: "2026-05-21", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Breno Vaz", residente: "R2" },
    { data: "2026-05-21", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Breno Vaz", residente: "R1, R3" },
    { data: "2026-05-21", tema: "Primeira prova teórica R1, R2 E R3 (Joelho + Pé e Tornozelo + Pediátrica)", tipo: "PROVA", preceptor: null, residente: null, observacao: "Sexta-feira 22/05" },
    { data: "2026-05-28", tema: "Pediátrica - Pé Torto Congênito", tipo: "AULA", preceptor: "Dra. Jordana Caiaffa", residente: null },
    { data: "2026-05-28", tema: "Avaliação Quadrimestral dos Residentes (atitudes)", tipo: "AVALIACAO", preceptor: "Todos os preceptores", residente: null },
    { data: "2026-05-28", tema: "Discussão - Prova teórica dos R3", tipo: "EVENTO", preceptor: "Todos os preceptores", residente: null },
    
    // JUNHO 2026 (quintas-feiras: 4, 11, 18, 25)
    { data: "2026-06-04", tema: "Feriado - Corpus Christi", tipo: "FERIADO", preceptor: null, residente: null },
    { data: "2026-06-11", tema: "Tumor - Princípios Básicos dos Tumores Ósseos", tipo: "AULA", preceptor: "Dr. Sávio Mourão", residente: null },
    { data: "2026-06-11", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Sávio Mourão", residente: "R2" },
    { data: "2026-06-11", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Sávio Mourão", residente: "R1, R3" },
    { data: "2026-06-18", tema: "Tumor - Tumores malignos", tipo: "AULA", preceptor: "Dr. Sávio Mourão", residente: null },
    { data: "2026-06-18", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Sávio Mourão", residente: "R2" },
    { data: "2026-06-18", tema: "Reabilitação após amputação de membros", tipo: "AULA", preceptor: "Equipe Fisioterapia", residente: null },
    { data: "2026-06-25", tema: "Tumor - Tumores benignos", tipo: "AULA", preceptor: "Dr. Sávio Mourão", residente: null },
    { data: "2026-06-25", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Sávio Mourão", residente: "R2" },
    { data: "2026-06-25", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Sávio Mourão", residente: "R1, R3" },
    
    // JULHO 2026 (quintas-feiras: 2, 9, 16, 23, 30)
    { data: "2026-07-02", tema: "Ombro - Síndrome dolorosa do ombro", tipo: "AULA", preceptor: "Dr. Adriano Mendes", residente: null },
    { data: "2026-07-02", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Adriano Mendes", residente: "R2" },
    { data: "2026-07-02", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Adriano Mendes", residente: "R1, R3" },
    { data: "2026-07-09", tema: "Cotovelo - Fraturas e luxações do cotovelo", tipo: "AULA", preceptor: "Dr. José da Mota", residente: null },
    { data: "2026-07-09", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. José da Mota", residente: "R2" },
    { data: "2026-07-09", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. José da Mota", residente: "R1, R3" },
    { data: "2026-07-16", tema: "Ombro - Doença do manguito rotador", tipo: "AULA", preceptor: "Dr. Adriano Mendes", residente: null },
    { data: "2026-07-16", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Adriano Mendes", residente: "R2" },
    { data: "2026-07-16", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Adriano Mendes", residente: "R1, R3" },
    { data: "2026-07-23", tema: "Ombro - Instabilidade anterior do ombro", tipo: "AULA", preceptor: "Dr. Adriano Mendes", residente: null },
    { data: "2026-07-23", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Adriano Mendes", residente: "R2" },
    { data: "2026-07-23", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Adriano Mendes", residente: "R1, R3" },
    { data: "2026-07-30", tema: "Ombro - Fratura do terço proximal do úmero", tipo: "AULA", preceptor: "Dr. Thiago Trece", residente: null },
    { data: "2026-07-30", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Thiago Trece", residente: "R2" },
    { data: "2026-07-30", tema: "Tratamento fisioterápico das patologias do ombro", tipo: "AULA", preceptor: "Equipe Fisioterapia", residente: null },
    
    // AGOSTO 2026 (quintas-feiras: 6, 13, 20, 27)
    { data: "2026-08-06", tema: "Mão - Fraturas e luxações do carpo", tipo: "AULA", preceptor: "Dr. Breno Vaz", residente: null },
    { data: "2026-08-06", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Breno Vaz", residente: "R2" },
    { data: "2026-08-06", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Breno Vaz", residente: "R1, R3" },
    { data: "2026-08-13", tema: "Mão - Síndromes compressivas do membro superior", tipo: "AULA", preceptor: "Dr. Breno Vaz", residente: null },
    { data: "2026-08-13", tema: "Neurologia - ENMG/Doenças neuromusculares", tipo: "AULA", preceptor: "Dra. Jéssica Blanc", residente: null },
    { data: "2026-08-13", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Breno Vaz", residente: "R1, R3" },
    { data: "2026-08-13", tema: "Segunda prova teórica R1, R2 E R3 (Mão + Tumor + Ombro e Cotovelo)", tipo: "PROVA", preceptor: null, residente: null, observacao: "Sexta-feira 14/08" },
    { data: "2026-08-20", tema: "Mão - Deformidades congênitas do membro superior", tipo: "AULA", preceptor: "Dr. Arnaldo Gonçalves", residente: null },
    { data: "2026-08-20", tema: "Avaliação Quadrimestral dos Residentes (atitudes)", tipo: "AVALIACAO", preceptor: "Todos os preceptores", residente: null },
    { data: "2026-08-20", tema: "Discussão - Prova teórica dos R3", tipo: "EVENTO", preceptor: "Todos os preceptores", residente: null },
    { data: "2026-08-27", tema: "Mão - Lesões de tendões extensores", tipo: "AULA", preceptor: "Dr. Arnaldo Gonçalves", residente: null },
    { data: "2026-08-27", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Arnaldo Gonçalves", residente: "R2" },
    { data: "2026-08-27", tema: "Fisioterapia nas lesões tendíneas", tipo: "AULA", preceptor: "Equipe Fisioterapia", residente: null },
    
    // SETEMBRO 2026 (quintas-feiras: 3, 10, 17, 24)
    { data: "2026-09-03", tema: "Mão - Fraturas do terço distal do rádio", tipo: "AULA", preceptor: "Dr. Arnaldo Gonçalves", residente: null },
    { data: "2026-09-03", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Arnaldo Gonçalves", residente: "R2" },
    { data: "2026-09-03", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Arnaldo Gonçalves", residente: "R1, R3" },
    { data: "2026-09-10", tema: "Quadril - Impacto fêmoroacetabular", tipo: "AULA", preceptor: "Dr. Bruno Schröeder", residente: null },
    { data: "2026-09-10", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Daniel Loures", residente: "R2" },
    { data: "2026-09-10", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Daniel Loures", residente: "R1, R3" },
    { data: "2026-09-17", tema: "Quadril - Coxartrose e programação de artroplastia total de quadril (ATQ)", tipo: "AULA", preceptor: "Dr. Daniel Loures", residente: null },
    { data: "2026-09-17", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Daniel Loures", residente: "R2" },
    { data: "2026-09-17", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Daniel Loures", residente: "R1, R3" },
    { data: "2026-09-24", tema: "Quadril - Fraturas do anel pélvico", tipo: "AULA", preceptor: "Dr. Igor Gerdi", residente: null },
    { data: "2026-09-24", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Igor Gerdi", residente: "R2" },
    { data: "2026-09-24", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Igor Gerdi", residente: "R1, R3" },
    
    // OUTUBRO 2026 (quintas-feiras: 1, 8, 15, 22, 29)
    { data: "2026-10-01", tema: "Quadril - Osteonecrose da cabeça femoral", tipo: "AULA", preceptor: "Dr. Igor Gerdi", residente: null },
    { data: "2026-10-01", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Igor Gerdi", residente: "R3" },
    { data: "2026-10-01", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Igor Gerdi", residente: "R1, R3" },
    { data: "2026-10-08", tema: "Quadril - Fraturas do acetábulo", tipo: "AULA", preceptor: "Dr. Jurandir Antunes", residente: null },
    { data: "2026-10-08", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Jurandir Antunes", residente: "R2" },
    { data: "2026-10-08", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Igor Gerdi", residente: "R1, R3" },
    { data: "2026-10-15", tema: "Coluna - Escoliose Idiopática", tipo: "AULA", preceptor: "Dr. Valdeci Oliveira", residente: null },
    { data: "2026-10-15", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Valdeci Oliveira", residente: "R2" },
    { data: "2026-10-15", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Valdeci Oliveira", residente: "R1, R3" },
    { data: "2026-10-22", tema: "Coluna - Fraturas da coluna toracolombar", tipo: "AULA", preceptor: "Dr. Marcus Vinicius", residente: null },
    { data: "2026-10-22", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Marcus Vinicius", residente: "R2" },
    { data: "2026-10-22", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Marcus Vinicius", residente: "R1, R3" },
    { data: "2026-10-29", tema: "Coluna - Fraturas subaxiais da coluna cervical e trauma raquimedular", tipo: "AULA", preceptor: "Dr. Vitor Groppo", residente: null },
    { data: "2026-10-29", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Vitor Groppo", residente: "R2" },
    { data: "2026-10-29", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Vitor Groppo", residente: "R1, R3" },
    
    // NOVEMBRO 2026 (quintas-feiras: 5, 12, 19, 26)
    { data: "2026-11-05", tema: "Coluna - Hérnia discal", tipo: "AULA", preceptor: "Dr. Jair Moreira", residente: null },
    { data: "2026-11-05", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Jair Moreira", residente: "R2" },
    { data: "2026-11-05", tema: "Reabilitação em hérnias discais", tipo: "AULA", preceptor: "Equipe Fisioterapia", residente: null },
    { data: "2026-11-12", tema: "Osteoporose: diagnóstico e tratamento clínico atual", tipo: "AULA", preceptor: "Dra. Rafaela Breijão", residente: null },
    { data: "2026-11-12", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. Adriano Mendes", residente: "R2" },
    { data: "2026-11-12", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dra. Rafaela Breijão", residente: "R1, R3" },
    { data: "2026-11-19", tema: "Sem reunião - Feriado Consciência Negra (20/11)", tipo: "FERIADO", preceptor: null, residente: null },
    { data: "2026-11-26", tema: "Princípios de tratamento da dor", tipo: "AULA", preceptor: "Dra. Mariana Neves", residente: null },
    { data: "2026-11-26", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. José da Mota", residente: "R2" },
    { data: "2026-11-26", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. José da Mota", residente: "R1, R3" },
    { data: "2026-11-26", tema: "Terceira prova teórica R1, R2 E R3 (Quadril + Coluna + Ciência básica e Dor)", tipo: "PROVA", preceptor: null, residente: null, observacao: "Sexta-feira 27/11" },
    
    // DEZEMBRO 2026 (quintas-feiras: 3, 10, 17, 24, 31)
    { data: "2026-12-03", tema: "Avaliação Quadrimestral dos Residentes (atitudes)", tipo: "AVALIACAO", preceptor: "Todos os preceptores", residente: null },
    { data: "2026-12-03", tema: "Discussão - Prova teórica dos R3", tipo: "EVENTO", preceptor: "Todos os preceptores", residente: null },
    { data: "2026-12-03", tema: "Reunião Administrativa", tipo: "EVENTO", preceptor: "Todos os preceptores", residente: null },
    { data: "2026-12-10", tema: "Reunião SOT - Balanço e Encerramento das Reuniões Clínicas 2026", tipo: "EVENTO", preceptor: null, residente: null },
    { data: "2026-12-10", tema: "Discussão Simulado Prático", tipo: "EVENTO", preceptor: null, residente: null },
    { data: "2026-12-10", tema: "Simulado Prova Oral, Exame Físico e Habilidades (HU CAS)", tipo: "AVALIACAO", preceptor: null, residente: null, observacao: "Sábado 12/12" },
    { data: "2026-12-17", tema: "Recesso de fim de ano", tipo: "RECESSO", preceptor: null, residente: null },
    { data: "2026-12-24", tema: "Recesso de Natal", tipo: "RECESSO", preceptor: null, residente: null },
    { data: "2026-12-31", tema: "Recesso de Ano Novo", tipo: "RECESSO", preceptor: null, residente: null },
    
    // JANEIRO 2027 (quintas-feiras: 7, 14, 21, 28)
    { data: "2027-01-07", tema: "Recesso de início de ano", tipo: "RECESSO", preceptor: null, residente: null },
    { data: "2027-01-14", tema: "Recesso de início de ano", tipo: "RECESSO", preceptor: null, residente: null },
    { data: "2027-01-21", tema: "Recesso de início de ano", tipo: "RECESSO", preceptor: null, residente: null },
    { data: "2027-01-28", tema: "Recesso de início de ano", tipo: "RECESSO", preceptor: null, residente: null },
    
    // FEVEREIRO 2027 (quintas-feiras: 4, 11, 18, 25)
    { data: "2027-02-04", tema: "Abertura do ano letivo 2027", tipo: "EVENTO", preceptor: "Dr. Jair Moreira", residente: null },
    { data: "2027-02-04", tema: "Apresentação das escalas e semana padrão", tipo: "EVENTO", preceptor: "Dr. Breno Vaz", residente: null },
    { data: "2027-02-04", tema: "Joelho - Lesões ligamentares do Joelho", tipo: "AULA", preceptor: "Dr. Bruno Fajardo", residente: null },
    { data: "2027-02-11", tema: "Instabilidade Patelar", tipo: "AULA", preceptor: "Dr. Sávio Mourão", residente: null },
    { data: "2027-02-11", tema: "Apresentação de artigo", tipo: "ARTIGO", preceptor: "Dr. Sávio Mourão", residente: "R2" },
    { data: "2027-02-11", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Sávio Mourão", residente: "R1, R3" },
    { data: "2027-02-18", tema: "Joelho - Lesões Meniscais", tipo: "AULA", preceptor: "Dr. Bruno Fajardo", residente: null },
    { data: "2027-02-18", tema: "Apresentação de artigo", tipo: "ARTIGO", preceptor: "Dr. Bruno Fajardo", residente: "R2" },
    { data: "2027-02-18", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. Bruno Fajardo", residente: "R1, R3" },
    { data: "2027-02-25", tema: "Pé e Tornozelo - Pé Diabético", tipo: "AULA", preceptor: "Dr. João Paulo", residente: null },
    { data: "2027-02-25", tema: "Apresentação de Artigo", tipo: "ARTIGO", preceptor: "Dr. João Paulo", residente: "R2" },
    { data: "2027-02-25", tema: "Casos clínicos", tipo: "CASOS_CLINICOS", preceptor: "Dr. João Paulo", residente: "R1, R3" },
    { data: "2027-02-25", tema: "Reunião de apresentação dos novos residentes - auditório 2º andar 08:00h", tipo: "EVENTO", preceptor: null, residente: null, observacao: "Sexta-feira 26/02" },
  ];

  let insertCount = 0;
  for (const m of meetings) {
    await connection.execute(
      `INSERT INTO clinical_meetings (data, tema, tipo, preceptor, residente_apresentador, observacao) VALUES (?, ?, ?, ?, ?, ?)`,
      [m.data, m.tema, m.tipo, m.preceptor, m.residente, m.observacao || null]
    );
    insertCount++;
  }
  console.log(`✓ ${insertCount} reuniões clínicas inseridas`);

  await connection.end();
  console.log("✅ Seed de reuniões clínicas concluído com sucesso!");
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
