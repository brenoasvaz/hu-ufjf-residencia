/**
 * Script de importação do Banco de Questões SBOT
 * 
 * Importa 2.044 questões do arquivo Excel para o banco de dados
 * Estrutura: Especialidades → Questões → Alternativas
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import XLSX from 'xlsx';
// Schema será referenciado diretamente nas queries SQL

// Configuração do banco de dados
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { mode: 'default' });

// Mapeamento de especialidades para IDs (será preenchido após inserção)
const especialidadeIds = {};

async function importarQuestoes() {
  console.log('🚀 Iniciando importação do Banco de Questões SBOT...\n');

  // Ler arquivo Excel
  const workbook = XLSX.readFile('/home/ubuntu/upload/Banco_Questoes_SBOT_Final.xlsx');
  const sheetName = 'Todas as Questões';
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 Total de questões no Excel: ${data.length}\n`);

  // Estatísticas
  const stats = {
    especialidades: 0,
    questoes: 0,
    alternativas: 0,
    erros: [],
  };

  // 1. Extrair especialidades únicas
  const especialidadesUnicas = [...new Set(data.map(row => row.Especialidade))].filter(Boolean);
  console.log(`📚 Especialidades encontradas: ${especialidadesUnicas.length}`);
  console.log(especialidadesUnicas.join(', '));
  console.log();

  // 2. Inserir especialidades
  console.log('📝 Inserindo especialidades...');
  for (const nomeEsp of especialidadesUnicas) {
    try {
      const [result] = await connection.execute(
        'INSERT INTO especialidades (nome, descricao, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        [nomeEsp, `Especialidade: ${nomeEsp}`]
      );
      const espId = result.insertId;
      especialidadeIds[nomeEsp] = espId;
      stats.especialidades++;
      console.log(`  ✓ ${nomeEsp} (ID: ${espId})`);
    } catch (error) {
      console.error(`  ✗ Erro ao inserir especialidade ${nomeEsp}:`, error.message);
      stats.erros.push(`Especialidade ${nomeEsp}: ${error.message}`);
    }
  }
  console.log();

  // 3. Inserir questões e alternativas
  console.log('📝 Inserindo questões e alternativas...');
  let contador = 0;

  for (const row of data) {
    contador++;
    if (contador % 100 === 0) {
      console.log(`  Processadas ${contador}/${data.length} questões...`);
    }

    try {
      const especialidadeId = especialidadeIds[row.Especialidade];
      if (!especialidadeId) {
        throw new Error(`Especialidade não encontrada: ${row.Especialidade}`);
      }

      // Validar campos obrigatórios
      if (!row.Enunciado || !row.A || !row.B || !row.C || !row.D || !row.Gabarito) {
        throw new Error(`Questão incompleta (linha ${contador + 1})`);
      }

      // Inserir questão
      const [questaoResult] = await connection.execute(
        'INSERT INTO questoes (especialidade_id, enunciado, fonte, ano, subcategoria, ativo, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())',
        [
          especialidadeId,
          row.Enunciado,
          row.Fonte || null,
          row.Ano || null,
          row.Subcategoria || null,
        ]
      );
      const questaoId = questaoResult.insertId;
      stats.questoes++;

      // Inserir alternativas (A, B, C, D)
      const alternativasData = [
        { letra: 'A', texto: row.A, isCorreta: row.Gabarito === 'A' ? 1 : 0 },
        { letra: 'B', texto: row.B, isCorreta: row.Gabarito === 'B' ? 1 : 0 },
        { letra: 'C', texto: row.C, isCorreta: row.Gabarito === 'C' ? 1 : 0 },
        { letra: 'D', texto: row.D, isCorreta: row.Gabarito === 'D' ? 1 : 0 },
      ];

      for (const alt of alternativasData) {
        await connection.execute(
          'INSERT INTO alternativas (questao_id, letra, texto, is_correta) VALUES (?, ?, ?, ?)',
          [questaoId, alt.letra, alt.texto, alt.isCorreta]
        );
        stats.alternativas++;
      }
    } catch (error) {
      console.error(`  ✗ Erro na questão ${contador}:`, error.message);
      stats.erros.push(`Questão ${contador}: ${error.message}`);
    }
  }

  console.log();
  console.log('✅ Importação concluída!\n');
  console.log('📊 Estatísticas:');
  console.log(`  Especialidades: ${stats.especialidades}`);
  console.log(`  Questões: ${stats.questoes}`);
  console.log(`  Alternativas: ${stats.alternativas}`);
  console.log(`  Erros: ${stats.erros.length}`);

  if (stats.erros.length > 0) {
    console.log('\n⚠️  Erros encontrados:');
    stats.erros.slice(0, 10).forEach(erro => console.log(`  - ${erro}`));
    if (stats.erros.length > 10) {
      console.log(`  ... e mais ${stats.erros.length - 10} erros`);
    }
  }

  // Validar distribuição por especialidade
  console.log('\n📊 Distribuição de questões por especialidade:');
  const [distribuicao] = await connection.execute(`
    SELECT e.nome, COUNT(q.id) as total
    FROM especialidades e
    LEFT JOIN questoes q ON e.id = q.especialidade_id
    GROUP BY e.id, e.nome
    ORDER BY total DESC
  `);
  
  distribuicao.forEach(row => {
    console.log(`  ${row.nome}: ${row.total} questões`);
  });

  await connection.end();
  console.log('\n🎉 Importação finalizada com sucesso!');
}

// Executar importação
importarQuestoes().catch(error => {
  console.error('❌ Erro fatal na importação:', error);
  process.exit(1);
});
