import PDFDocument from "pdfkit";
import { ClinicalMeeting } from "../drizzle/schema";
import https from "https";
import http from "http";

interface ExportOptions {
  year: number;
  month: number;
  meetings: ClinicalMeeting[];
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const TYPE_LABELS: Record<string, string> = {
  AULA: "Aula",
  ARTIGO: "Artigo",
  CASOS_CLINICOS: "Casos Clínicos",
  PROVA: "Prova",
  AVALIACAO: "Avaliação",
  EVENTO: "Evento",
  FERIADO: "Feriado",
  RECESSO: "Recesso",
};

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663108449732/KrCJog4rXRpMzt9GiEysge/logo-hu-ufjf-ebserh_3b01375d.jpg";

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

export async function generateClinicalMeetingsPDF(options: ExportOptions): Promise<Buffer> {
  const { year, month, meetings } = options;

  // Download logo
  let logoBuffer: Buffer | null = null;
  try {
    logoBuffer = await downloadImage(LOGO_URL);
  } catch (error) {
    console.warn("Failed to download logo for PDF:", error);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true, // Necessário para usar switchToPage no rodapé
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Logo no cabeçalho (se disponível)
    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 50, 40, { width: 180 });
      } catch (error) {
        console.warn("Failed to embed logo in PDF:", error);
      }
    }

    // Cabeçalho
    doc.fontSize(18).font("Helvetica-Bold").text("Ortopedia e Traumatologia", 250, 50, { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(14).font("Helvetica").text("Programação de Reuniões Clínicas", 250, 70, { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(12).text(`${MONTH_NAMES[month - 1]} de ${year}`, 250, 88, { align: "left" });
    
    // Linha separadora após cabeçalho
    doc.moveTo(50, 115).lineTo(545, 115).strokeColor("#d1d5db").lineWidth(1).stroke();
    doc.moveDown(2);

    // Agrupar por data
    const groupedByDate = new Map<string, ClinicalMeeting[]>();
    meetings.forEach((meeting) => {
      const dateKey = new Date(meeting.data).toISOString().split("T")[0];
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(meeting);
    });

    // Ordenar datas
    const sortedDates = Array.from(groupedByDate.keys()).sort();

    sortedDates.forEach((dateKey, index) => {
      const dateMeetings = groupedByDate.get(dateKey)!;
      
      // Ordenar por ordemNaData
      dateMeetings.sort((a, b) => (a.ordemNaData ?? 0) - (b.ordemNaData ?? 0));

      const date = new Date(dateKey + "T12:00:00");
      const dayOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][date.getDay()];
      const day = date.getDate();
      const monthName = MONTH_NAMES[date.getMonth()];

      // Verificar se precisa de nova página
      if (index > 0 && doc.y > 650) {
        doc.addPage();
      }

      // Data
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#1f2937");
      doc.text(`${dayOfWeek}, ${day} de ${monthName}`, { continued: false });
      doc.moveDown(0.5);

      // Atividades
      dateMeetings.forEach((meeting, idx) => {
        const typeLabel = TYPE_LABELS[meeting.tipo] || meeting.tipo;
        
        // Verificar quebra de página
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(10).font("Helvetica-Bold").fillColor("#3b82f6");
        doc.text(`${idx + 1}. ${typeLabel}`, { continued: false });
        
        doc.fontSize(9).font("Helvetica").fillColor("#374151");
        doc.text(`   Tema: ${meeting.tema}`, { continued: false });
        
        if (meeting.preceptor) {
          doc.text(`   Preceptor: ${meeting.preceptor}`, { continued: false });
        }
        
        if (meeting.residenteApresentador) {
          doc.text(`   Residente: ${meeting.residenteApresentador}`, { continued: false });
        }
        
        if (meeting.observacao) {
          doc.text(`   Observação: ${meeting.observacao}`, { continued: false, width: 500 });
        }
        
        doc.moveDown(0.7);
      });

      doc.moveDown(0.5);
      
      // Linha separadora
      if (index < sortedDates.length - 1) {
        doc.strokeColor("#d1d5db").lineWidth(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);
      }
    });

    // Rodapé
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i); // PDFKit usa índice 0-based para switchToPage
      doc.fontSize(8).fillColor("#6b7280").font("Helvetica");
      doc.text(
        `Página ${i + 1} de ${pageCount} - Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        50,
        doc.page.height - 40,
        { align: "center", width: doc.page.width - 100 }
      );
    }

    doc.end();
  });
}
