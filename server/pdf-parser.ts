import axios from "axios";

export interface ParsedTableRow {
  [key: string]: string;
}

export interface ParsedPDFResult {
  text: string;
  tables: ParsedTableRow[][];
  metadata: {
    pages: number;
  };
}

/**
 * Faz download de PDF de uma URL e retorna o buffer
 */
export async function downloadPDF(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

/**
 * Extrai texto de um PDF (placeholder - será implementado com biblioteca adequada)
 * Por enquanto, retorna estrutura vazia para não bloquear desenvolvimento
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<ParsedPDFResult> {
  // TODO: Implementar extração real de PDF
  // Por enquanto, retorna estrutura vazia
  return {
    text: "Extração de PDF será implementada",
    tables: [],
    metadata: {
      pages: 1,
    },
  };
}

/**
 * Extrai informações específicas de rodízios de um PDF
 */
export interface ExtractedRotation {
  dataInicio?: string;
  dataFim?: string;
  mesReferencia?: string;
  localEstagio?: string;
  residente1?: string;
  residente2?: string;
  observacoes?: string;
  confidence: "high" | "medium" | "low";
}

export async function extractRotationsFromPDF(pdfBuffer: Buffer): Promise<ExtractedRotation[]> {
  // TODO: Implementar extração real
  return [];
}

/**
 * Extrai informações específicas de atividades semanais de um PDF
 */
export interface ExtractedActivity {
  diaSemana?: string;
  horaInicio?: string;
  horaFim?: string;
  titulo?: string;
  descricao?: string;
  local?: string;
  anoResidencia?: string;
  bloco?: string;
  observacao?: string;
  confidence: "high" | "medium" | "low";
}

export async function extractActivitiesFromPDF(pdfBuffer: Buffer): Promise<ExtractedActivity[]> {
  // TODO: Implementar extração real
  return [];
}

/**
 * Valida formato de data (dd/mm/aaaa ou dd/mm)
 */
export function validateDateFormat(dateStr: string): boolean {
  const patterns = [
    /^\d{2}\/\d{2}\/\d{4}$/,  // dd/mm/aaaa
    /^\d{2}\/\d{2}$/,          // dd/mm
  ];
  
  return patterns.some(pattern => pattern.test(dateStr));
}

/**
 * Converte string de data para Date
 */
export function parseDateString(dateStr: string, year?: number): Date | null {
  try {
    const parts = dateStr.split('/');
    
    if (parts.length === 3) {
      // dd/mm/aaaa
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Mês é 0-indexed
      const yearNum = parseInt(parts[2]);
      return new Date(yearNum, month, day);
    } else if (parts.length === 2 && year) {
      // dd/mm (precisa do ano)
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      return new Date(year, month, day);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
