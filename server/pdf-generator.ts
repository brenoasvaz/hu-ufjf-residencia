/**
 * Helper para geração de PDFs de avaliações
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface AvaliacaoPDFData {
  simuladoId: number;
  residenteNome: string;
  residenteEmail: string;
  dataInicio: Date;
  dataFim: Date | null;
  duracaoMinutos: number;
  totalQuestoes: number;
  totalAcertos: number;
  percentual: number;
  questoes: Array<{
    numero: number;
    enunciado: string;
    especialidade: string;
    alternativas: Array<{
      letra: string;
      texto: string;
      correta: boolean;
    }>;
    respostaUsuario: string | null;
    acertou: boolean;
  }>;
}

export async function gerarPDFAvaliacao(data: AvaliacaoPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).font('Helvetica-Bold').text('HU UFJF - Residência Médica', { align: 'center' });
      doc.fontSize(16).text('Relatório de Avaliação', { align: 'center' });
      doc.moveDown(1.5);

      // Informações do Residente
      doc.fontSize(12).font('Helvetica-Bold').text('Dados do Residente', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nome: ${data.residenteNome}`);
      doc.text(`Email: ${data.residenteEmail}`);
      doc.moveDown(0.5);

      // Informações da Avaliação
      doc.fontSize(12).font('Helvetica-Bold').text('Dados da Avaliação', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Avaliação ID: #${data.simuladoId}`);
      doc.text(`Data de Início: ${new Date(data.dataInicio).toLocaleString('pt-BR')}`);
      if (data.dataFim) {
        doc.text(`Data de Conclusão: ${new Date(data.dataFim).toLocaleString('pt-BR')}`);
      }
      doc.text(`Duração Prevista: ${data.duracaoMinutos} minutos`);
      doc.moveDown(0.5);

      // Resultado
      doc.fontSize(12).font('Helvetica-Bold').text('Resultado', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total de Questões: ${data.totalQuestoes}`);
      doc.text(`Acertos: ${data.totalAcertos}`);
      doc.text(`Erros: ${data.totalQuestoes - data.totalAcertos}`);
      doc.fontSize(14).font('Helvetica-Bold');
      doc.fillColor(data.percentual >= 70 ? 'green' : data.percentual >= 50 ? 'orange' : 'red');
      doc.text(`Aproveitamento: ${data.percentual}%`);
      doc.fillColor('black');
      doc.moveDown(1);

      // Questões e Respostas
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('Questões e Respostas', { align: 'center' });
      doc.moveDown(1);

      data.questoes.forEach((questao, index) => {
        // Verificar se precisa de nova página
        if (doc.y > 650) {
          doc.addPage();
        }

        // Número e especialidade
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`Questão ${questao.numero}`, { continued: true });
        doc.fontSize(9).font('Helvetica').fillColor('gray');
        doc.text(` (${questao.especialidade})`, { align: 'left' });
        doc.fillColor('black');
        doc.moveDown(0.3);

        // Enunciado
        doc.fontSize(10).font('Helvetica');
        doc.text(questao.enunciado, { align: 'justify' });
        doc.moveDown(0.5);

        // Alternativas
        questao.alternativas.forEach((alt) => {
          const isRespostaUsuario = alt.letra === questao.respostaUsuario;
          const isCorreta = alt.correta;
          
          doc.fontSize(9);
          
          if (isCorreta) {
            doc.font('Helvetica-Bold').fillColor('green');
            doc.text(`${alt.letra}) ${alt.texto} ✓ (CORRETA)`, { indent: 10 });
          } else if (isRespostaUsuario) {
            doc.font('Helvetica-Bold').fillColor('red');
            doc.text(`${alt.letra}) ${alt.texto} ✗ (SUA RESPOSTA)`, { indent: 10 });
          } else {
            doc.font('Helvetica').fillColor('black');
            doc.text(`${alt.letra}) ${alt.texto}`, { indent: 10 });
          }
          
          doc.fillColor('black');
        });

        doc.moveDown(0.5);

        // Status da resposta
        doc.fontSize(9).font('Helvetica-Bold');
        if (questao.acertou) {
          doc.fillColor('green').text('✓ ACERTOU', { indent: 10 });
        } else {
          doc.fillColor('red').text('✗ ERROU', { indent: 10 });
        }
        doc.fillColor('black');

        doc.moveDown(1);

        // Linha separadora
        if (index < data.questoes.length - 1) {
          doc.strokeColor('#cccccc').lineWidth(0.5);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
          doc.moveDown(0.5);
        }
      });

      // Rodapé final
      doc.addPage();
      doc.fontSize(10).font('Helvetica').fillColor('gray');
      doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
      doc.text('HU UFJF - Hospital Universitário da Universidade Federal de Juiz de Fora', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ─── Relatório Consolidado (todos os residentes de um modelo) ─────────────────

interface ResidenteResultado {
  simuladoId: number;
  residenteNome: string;
  residenteEmail: string;
  dataInicio: Date;
  dataFim: Date | null;
  totalQuestoes: number;
  totalAcertos: number;
  percentual: number;
}

interface RelatorioConsolidadoData {
  modeloNome: string;
  modeloDescricao?: string;
  geradoEm: Date;
  residentes: ResidenteResultado[];
}

export async function gerarRelatorioConsolidado(data: RelatorioConsolidadoData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Cabeçalho ──────────────────────────────────────────────────────────
      doc.fontSize(18).font('Helvetica-Bold').text('HU UFJF — Residência Médica em Ortopedia', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text('Relatório Consolidado de Avaliação', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold').text(data.modeloNome, { align: 'center' });
      if (data.modeloDescricao) {
        doc.fontSize(10).font('Helvetica').fillColor('gray').text(data.modeloDescricao, { align: 'center' });
        doc.fillColor('black');
      }
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').fillColor('gray')
        .text(`Gerado em: ${data.geradoEm.toLocaleString('pt-BR')}`, { align: 'right' });
      doc.fillColor('black');
      doc.moveDown(1);

      // ── Linha separadora ───────────────────────────────────────────────────
      doc.strokeColor('#333333').lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // ── Resumo estatístico ─────────────────────────────────────────────────
      const total = data.residentes.length;
      const mediaPercentual = total > 0
        ? Math.round(data.residentes.reduce((s, r) => s + r.percentual, 0) / total)
        : 0;
      const aprovados = data.residentes.filter(r => r.percentual >= 70).length;

      doc.fontSize(12).font('Helvetica-Bold').text('Resumo Geral', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total de residentes avaliados: ${total}`);
      doc.text(`Média geral de aproveitamento: ${mediaPercentual}%`);
      doc.text(`Aprovados (≥ 70%): ${aprovados} de ${total}`);
      doc.moveDown(1.5);

      // ── Tabela de resultados ───────────────────────────────────────────────
      doc.fontSize(12).font('Helvetica-Bold').text('Resultados por Residente', { underline: true });
      doc.moveDown(0.5);

      // Cabeçalho da tabela
      const colX = [50, 220, 310, 380, 440, 510];
      const rowH = 18;
      const tableTop = doc.y;

      doc.fontSize(9).font('Helvetica-Bold');
      doc.rect(50, tableTop, 495, rowH).fill('#2d3748');
      doc.fillColor('white');
      doc.text('Residente', colX[0] + 3, tableTop + 5, { width: 165, lineBreak: false });
      doc.text('Acertos', colX[2] + 3, tableTop + 5, { width: 65, lineBreak: false });
      doc.text('Erros', colX[3] + 3, tableTop + 5, { width: 55, lineBreak: false });
      doc.text('Nota (%)', colX[4] + 3, tableTop + 5, { width: 65, lineBreak: false });
      doc.fillColor('black');

      let rowY = tableTop + rowH;

      // Ordenar por percentual decrescente
      const sorted = [...data.residentes].sort((a, b) => b.percentual - a.percentual);

      sorted.forEach((res, i) => {
        if (rowY > 720) {
          doc.addPage();
          rowY = 50;
        }

        const bgColor = i % 2 === 0 ? '#f7fafc' : '#ffffff';
        doc.rect(50, rowY, 495, rowH).fill(bgColor);

        const erros = res.totalQuestoes - res.totalAcertos;
        const notaColor = res.percentual >= 70 ? '#276749' : res.percentual >= 50 ? '#7b341e' : '#9b2c2c';

        doc.fontSize(9).font('Helvetica').fillColor('#1a202c');
        doc.text(res.residenteNome, colX[0] + 3, rowY + 5, { width: 165, lineBreak: false });
        doc.text(`${res.totalAcertos}/${res.totalQuestoes}`, colX[2] + 3, rowY + 5, { width: 65, lineBreak: false });
        doc.text(`${erros}`, colX[3] + 3, rowY + 5, { width: 55, lineBreak: false });

        doc.font('Helvetica-Bold').fillColor(notaColor);
        doc.text(`${res.percentual}%`, colX[4] + 3, rowY + 5, { width: 65, lineBreak: false });
        doc.fillColor('black');

        // Borda inferior da linha
        doc.strokeColor('#e2e8f0').lineWidth(0.5)
          .moveTo(50, rowY + rowH).lineTo(545, rowY + rowH).stroke();

        rowY += rowH;
      });

      // Borda da tabela
      doc.strokeColor('#718096').lineWidth(0.5)
        .rect(50, tableTop, 495, rowY - tableTop).stroke();

      doc.moveDown(2);

      // ── Rodapé ─────────────────────────────────────────────────────────────
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').fillColor('gray');
        doc.text(
          `HU UFJF — Residência Médica em Ortopedia  |  Página ${i - range.start + 1} de ${range.count}`,
          50, 790, { align: 'center', width: 495 }
        );
      }

      doc.flushPages();
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
