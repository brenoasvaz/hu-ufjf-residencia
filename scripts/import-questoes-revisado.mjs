/**
 * Script de importação do banco de questões revisado
 * Atualiza especialidades e questões com dados da planilha revisada
 * Inclui marcação de questões que requerem imagem
 */

import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Carregar .env
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../.env');
let dbUrl = '';

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) dbUrl = match[1].trim();
} catch (e) {
  dbUrl = process.env.DATABASE_URL || '';
}

if (!dbUrl) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}

// Parsear DATABASE_URL
function parseDbUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error('URL inválida: ' + url);
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5].split('?')[0],
    ssl: url.includes('ssl') ? { rejectUnauthorized: false } : undefined,
  };
}

async function main() {
  console.log('=== Importação do Banco de Questões Revisado ===\n');

  // Carregar planilha
  const xlsxFiles = [
    '/tmp/banco_revisado.xlsx',
    '/home/ubuntu/upload/banco_revisado.xlsx',
  ];

  let wb;
  for (const f of xlsxFiles) {
    try {
      wb = XLSX.readFile(f);
      console.log(`Planilha carregada: ${f}`);
      break;
    } catch (e) {
      // tentar próximo
    }
  }

  if (!wb) {
    // Tentar com glob
    const { globSync } = await import('glob').catch(() => ({ globSync: null }));
    if (globSync) {
      const files = globSync('/home/ubuntu/upload/*.xlsx');
      const revisado = files.find(f => f.toLowerCase().includes('revisado'));
      if (revisado) {
        wb = XLSX.readFile(revisado);
        console.log(`Planilha carregada: ${revisado}`);
      }
    }
  }

  if (!wb) {
    console.error('Não foi possível carregar a planilha');
    process.exit(1);
  }

  const ws = wb.Sheets['Ordem Original'];
  if (!ws) {
    console.error('Aba "Ordem Original" não encontrada');
    process.exit(1);
  }

  // Ler dados da planilha
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  console.log(`Total de linhas na planilha: ${rows.length}`);

  // Processar questões (linha 2 = cabeçalho, linha 3 em diante = dados)
  const questoesData = [];
  const especialidadesSet = new Set();

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 11) continue;

    const [fonte, ano, num, especialidade, subcategoria, enunciado, a, b, c, d, gabarito, imagem] = row;

    // Pular linhas de separador/cabeçalho
    if (!fonte || typeof fonte !== 'string') continue;
    if (fonte.includes('▌') || fonte === 'Fonte') continue;
    if (!enunciado || typeof enunciado !== 'string') continue;
    if (!gabarito || !['A', 'B', 'C', 'D'].includes(String(gabarito).trim().toUpperCase())) continue;

    const esp = especialidade ? String(especialidade).trim() : 'Temas Gerais';
    especialidadesSet.add(esp);

    questoesData.push({
      fonte: String(fonte).trim(),
      ano: ano ? parseInt(ano) : null,
      num: num ? parseInt(num) : null,
      especialidade: esp,
      subcategoria: subcategoria ? String(subcategoria).trim() : null,
      enunciado: String(enunciado).trim(),
      alternativas: {
        A: a ? String(a).trim() : '',
        B: b ? String(b).trim() : '',
        C: c ? String(c).trim() : '',
        D: d ? String(d).trim() : '',
      },
      gabarito: String(gabarito).trim().toUpperCase(),
      temImagem: imagem === '✓' ? 1 : 0,
    });
  }

  console.log(`\nQuestões válidas encontradas: ${questoesData.length}`);
  console.log(`Especialidades: ${[...especialidadesSet].sort().join(', ')}`);
  console.log(`Questões com imagem: ${questoesData.filter(q => q.temImagem).length}`);

  // Conectar ao banco
  const dbConfig = parseDbUrl(dbUrl);
  const conn = await createConnection(dbConfig);
  console.log('\nConectado ao banco de dados.');

  try {
    // 1. Garantir que todas as especialidades existem
    console.log('\n[1/4] Sincronizando especialidades...');
    const espMap = {};

    for (const nome of especialidadesSet) {
      const [existing] = await conn.execute(
        'SELECT id FROM especialidades WHERE nome = ?',
        [nome]
      );
      if (existing.length > 0) {
        espMap[nome] = existing[0].id;
      } else {
        const [result] = await conn.execute(
          'INSERT INTO especialidades (nome, created_at) VALUES (?, NOW())',
          [nome]
        );
        espMap[nome] = result.insertId;
        console.log(`  + Especialidade criada: ${nome} (id=${result.insertId})`);
      }
    }
    console.log(`  ✓ ${Object.keys(espMap).length} especialidades sincronizadas`);

    // 2. Limpar banco atual (questões e alternativas)
    console.log('\n[2/4] Limpando banco atual...');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    await conn.execute('TRUNCATE TABLE alternativas');
    await conn.execute('TRUNCATE TABLE questoes');
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('  ✓ Banco limpo');

    // 3. Inserir questões em lotes
    console.log('\n[3/4] Inserindo questões...');
    let inserted = 0;
    let comImagem = 0;
    const BATCH = 100;

    for (let i = 0; i < questoesData.length; i += BATCH) {
      const batch = questoesData.slice(i, i + BATCH);

      for (const q of batch) {
        const espId = espMap[q.especialidade];
        if (!espId) continue;

        // Inserir questão
        const [qResult] = await conn.execute(
          `INSERT INTO questoes 
           (especialidade_id, enunciado, fonte, ano, subcategoria, tem_imagem, image_url, image_key, ativo, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, 1, NOW(), NOW())`,
          [espId, q.enunciado, q.fonte, q.ano, q.subcategoria, q.temImagem]
        );
        const questaoId = qResult.insertId;

        if (q.temImagem) comImagem++;

        // Inserir alternativas
        for (const [letra, texto] of Object.entries(q.alternativas)) {
          if (!texto) continue;
          const isCorreta = letra === q.gabarito ? 1 : 0;
          await conn.execute(
            'INSERT INTO alternativas (questao_id, letra, texto, is_correta) VALUES (?, ?, ?, ?)',
            [questaoId, letra, texto, isCorreta]
          );
        }

        inserted++;
      }

      if ((i + BATCH) % 500 === 0 || i + BATCH >= questoesData.length) {
        console.log(`  Progresso: ${Math.min(i + BATCH, questoesData.length)}/${questoesData.length}`);
      }
    }

    console.log(`\n  ✓ ${inserted} questões inseridas`);
    console.log(`  ✓ ${comImagem} questões marcadas como requerem imagem`);

    // 4. Verificação final
    console.log('\n[4/4] Verificação final...');
    const [countQ] = await conn.execute('SELECT COUNT(*) as total FROM questoes');
    const [countA] = await conn.execute('SELECT COUNT(*) as total FROM alternativas');
    const [countImg] = await conn.execute('SELECT COUNT(*) as total FROM questoes WHERE tem_imagem = 1');
    const [countEsp] = await conn.execute('SELECT nome, COUNT(*) as total FROM questoes q JOIN especialidades e ON q.especialidade_id = e.id GROUP BY e.nome ORDER BY e.nome');

    console.log(`\n  Total de questões: ${countQ[0].total}`);
    console.log(`  Total de alternativas: ${countA[0].total}`);
    console.log(`  Questões com imagem: ${countImg[0].total}`);
    console.log('\n  Por especialidade:');
    for (const row of countEsp) {
      console.log(`    ${row.nome}: ${row.total}`);
    }

    console.log('\n✅ Importação concluída com sucesso!');

  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
