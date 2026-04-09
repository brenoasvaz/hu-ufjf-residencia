import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL não encontrada");
  process.exit(1);
}

// Cronograma completo extraído do PDF "Reunião HU — Artigos 2026"
// Nota: item 10 (12/JUN) é Cochrane Review do Clube da Revista
const artigos = [
  // ABRIL
  { data: new Date("2026-04-02T08:00:00Z"), titulo: "Osteotomia MICA vs ORIF no Hálux Valgo" },
  { data: new Date("2026-04-09T08:00:00Z"), titulo: "Pé Plano do Adulto com Colapso" },
  { data: new Date("2026-04-16T08:00:00Z"), titulo: "Laser vs Ondas de Choque (ECSWT) na Fasceíte Plantar" },
  { data: new Date("2026-04-23T08:00:00Z"), titulo: "Mortalidade por Infecção Pós-Artroplastia Total de Joelho" },
  { data: new Date("2026-04-30T08:00:00Z"), titulo: "Fios de Kirschner vs Parafusos na Lesão de Lisfranc" },
  // MAIO
  { data: new Date("2026-05-07T08:00:00Z"), titulo: "Aspiração de Artrite Séptica do Quadril no Leito" },
  { data: new Date("2026-05-14T08:00:00Z"), titulo: "Avaliação por RM de Infecção Osteoarticular Infantil" },
  { data: new Date("2026-05-21T08:00:00Z"), titulo: "Manejo do Ombro Pós-Paralisia Obstétrica" },
  { data: new Date("2026-05-28T08:00:00Z"), titulo: "Pé Torto Congênito Idiopático vs Artrogripose" },
  // JUNHO
  { data: new Date("2026-06-12T08:00:00Z"), titulo: "Pé Torto Congênito — Cochrane Review", obs: "Clube da Revista — Cochrane Review discutida exclusivamente no Clube da Revista (12/jun), conforme nota do cronograma original." },
  { data: new Date("2026-06-11T08:00:00Z"), titulo: "Comparação de Ferramentas Prognósticas em Metástases Ósseas" },
  { data: new Date("2026-06-18T08:00:00Z"), titulo: "Deep Learning no Tratamento do Osteossarcoma" },
  { data: new Date("2026-06-25T08:00:00Z"), titulo: "Denosumabe Pré-Operatório no Tumor de Células Gigantes" },
  // JULHO
  { data: new Date("2026-07-02T08:00:00Z"), titulo: "Agonistas de GLP-1 Sem Efeito Adverso na Cirurgia do Ombro" },
  { data: new Date("2026-07-09T08:00:00Z"), titulo: "Prótese vs RAFI na Fratura de Cabeça do Rádio (Mason 3)" },
  { data: new Date("2026-07-16T08:00:00Z"), titulo: "Ácido Tranexâmico vs Epinefrina no Sangramento em Artroscopia de Ombro" },
  { data: new Date("2026-07-23T08:00:00Z"), titulo: "Latarjet vs J-Bone para Instabilidade Anterior do Ombro" },
  { data: new Date("2026-07-30T08:00:00Z"), titulo: "Fisioterapia Domiciliar vs Profissional Pós-Artroplastia Reversa do Ombro" },
  // AGOSTO
  { data: new Date("2026-08-06T08:00:00Z"), titulo: "Pseudartrose do Escafoide — Tratamento Artroscópico" },
  { data: new Date("2026-08-13T08:00:00Z"), titulo: "Síndrome do Túnel do Carpo — Cirurgia Aberta vs Endoscópica" },
  { data: new Date("2026-08-20T08:00:00Z"), titulo: "Manejo do Polegar em Gatilho" },
  { data: new Date("2026-08-27T08:00:00Z"), titulo: "Dedo em Martelo — Cirurgia vs Tratamento Conservador" },
  // SETEMBRO
  { data: new Date("2026-09-03T08:00:00Z"), titulo: "Fratura do Rádio Distal — Cirurgia vs Tratamento Conservador" },
  { data: new Date("2026-09-10T08:00:00Z"), titulo: "GLP-1 e Complicações Pós-Artroplastia Total do Quadril" },
  { data: new Date("2026-09-17T08:00:00Z"), titulo: "Artroplastia Total do Quadril vs Musculação na Coxartrose Grave" },
  { data: new Date("2026-09-24T08:00:00Z"), titulo: "Classificação por Modelo 3D da Lesão do Anel Pélvico" },
  // OUTUBRO
  { data: new Date("2026-10-01T08:00:00Z"), titulo: "Atraso na ATQ Pós-Fratura do Colo Femoral Geriátrico" },
  { data: new Date("2026-10-08T08:00:00Z"), titulo: "Carga Precoce em Geriátricos com Fratura do Acetábulo" },
  { data: new Date("2026-10-15T08:00:00Z"), titulo: "Exercícios Físicos para Escoliose" },
  { data: new Date("2026-10-22T08:00:00Z"), titulo: "Posição de Parafusos Pediculares na Fratura por Explosão Vertebral" },
  { data: new Date("2026-10-29T08:00:00Z"), titulo: "Prevenção de Lacerações Cervicais no Hóquei" },
  // NOVEMBRO
  { data: new Date("2026-11-05T08:00:00Z"), titulo: "Alterações de Modic e Placa Terminal na Ressonância Magnética" },
  { data: new Date("2026-11-12T08:00:00Z"), titulo: "Bifosfonatos e Redução da Mortalidade Geral" },
  { data: new Date("2026-11-26T08:00:00Z"), titulo: "Suplementação de Testosterona Pré-Op e Melhora de Desfechos" },
];

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("Conectado ao banco de dados.");

  // Verificar se já existem registros para 2026 para evitar duplicatas
  const [existing] = await conn.execute(
    "SELECT COUNT(*) as count FROM clube_revista WHERE YEAR(data) = 2026"
  );
  const count = existing[0].count;
  if (count > 0) {
    console.log(`Já existem ${count} artigos de 2026 no banco. Pulando inserção para evitar duplicatas.`);
    await conn.end();
    return;
  }

  let inserted = 0;
  for (const artigo of artigos) {
    await conn.execute(
      `INSERT INTO clube_revista (data, titulo_artigo, observacao, ativo, created_at, updated_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [artigo.data, artigo.titulo, artigo.obs ?? null]
    );
    inserted++;
    console.log(`[${inserted}/${artigos.length}] Inserido: ${artigo.titulo}`);
  }

  console.log(`\n✅ ${inserted} artigos inseridos com sucesso!`);
  await conn.end();
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
