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
