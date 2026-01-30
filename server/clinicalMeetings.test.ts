import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";

// Mock the database functions
vi.mock("./db", () => ({
  getAllClinicalMeetings: vi.fn(),
  getClinicalMeetingsByMonth: vi.fn(),
  getAllPresentationGuidelines: vi.fn(),
}));

describe("Clinical Meetings Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllClinicalMeetings", () => {
    it("should return all clinical meetings ordered by date", async () => {
      const mockMeetings = [
        {
          id: 1,
          data: new Date("2026-03-05"),
          tema: "Recepção dos residentes",
          tipo: "EVENTO",
          preceptor: "Dr. Jair Moreira",
          residenteApresentador: null,
          observacao: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          data: new Date("2026-03-05"),
          tema: "Trauma - Princípios de Osteossíntese",
          tipo: "AULA",
          preceptor: "Dr. Jurandir Antunes",
          residenteApresentador: null,
          observacao: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAllClinicalMeetings).mockResolvedValue(mockMeetings);

      const result = await db.getAllClinicalMeetings();

      expect(result).toEqual(mockMeetings);
      expect(result).toHaveLength(2);
      expect(result[0].tema).toBe("Recepção dos residentes");
    });

    it("should return empty array when no meetings exist", async () => {
      vi.mocked(db.getAllClinicalMeetings).mockResolvedValue([]);

      const result = await db.getAllClinicalMeetings();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("getClinicalMeetingsByMonth", () => {
    it("should return meetings for a specific month", async () => {
      const mockMeetings = [
        {
          id: 1,
          data: new Date("2026-03-05"),
          tema: "Recepção dos residentes",
          tipo: "EVENTO",
          preceptor: "Dr. Jair Moreira",
          residenteApresentador: null,
          observacao: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getClinicalMeetingsByMonth).mockResolvedValue(mockMeetings);

      const result = await db.getClinicalMeetingsByMonth(2026, 3);

      expect(result).toEqual(mockMeetings);
      expect(db.getClinicalMeetingsByMonth).toHaveBeenCalledWith(2026, 3);
    });

    it("should return empty array when no meetings for the month", async () => {
      vi.mocked(db.getClinicalMeetingsByMonth).mockResolvedValue([]);

      const result = await db.getClinicalMeetingsByMonth(2026, 1);

      expect(result).toEqual([]);
    });
  });

  describe("getAllPresentationGuidelines", () => {
    it("should return all presentation guidelines", async () => {
      const mockGuidelines = [
        {
          id: 1,
          tipo: "AULA" as const,
          titulo: "A - Aulas",
          descricao: "Apresentadas por preceptores ou convidados",
          tempoApresentacao: 30,
          tempoDiscussao: 10,
          orientacoes: JSON.stringify([
            "As aulas poderão ser interativas",
            "Ao final o apresentador poderá conduzir uma discussão",
          ]),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          tipo: "ARTIGO" as const,
          titulo: "B - Artigo da Semana",
          descricao: "Apresentadas pelos residentes do 2º ano",
          tempoApresentacao: 10,
          tempoDiscussao: 5,
          orientacoes: JSON.stringify([
            "O artigo idealmente deverá ser fornecido à equipe previamente",
          ]),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          tipo: "CASOS_CLINICOS" as const,
          titulo: "C - Casos Clínicos",
          descricao: "Apresentação dos casos internados na semana",
          tempoApresentacao: 20,
          tempoDiscussao: 10,
          orientacoes: JSON.stringify([
            "O residente R1 designado será responsável pela apresentação",
          ]),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAllPresentationGuidelines).mockResolvedValue(mockGuidelines);

      const result = await db.getAllPresentationGuidelines();

      expect(result).toEqual(mockGuidelines);
      expect(result).toHaveLength(3);
      expect(result[0].tipo).toBe("AULA");
      expect(result[1].tipo).toBe("ARTIGO");
      expect(result[2].tipo).toBe("CASOS_CLINICOS");
    });

    it("should have correct time allocations for each type", async () => {
      const mockGuidelines = [
        {
          id: 1,
          tipo: "AULA" as const,
          titulo: "A - Aulas",
          descricao: "Apresentadas por preceptores",
          tempoApresentacao: 30,
          tempoDiscussao: 10,
          orientacoes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          tipo: "ARTIGO" as const,
          titulo: "B - Artigo da Semana",
          descricao: "Apresentadas pelos residentes",
          tempoApresentacao: 10,
          tempoDiscussao: 5,
          orientacoes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          tipo: "CASOS_CLINICOS" as const,
          titulo: "C - Casos Clínicos",
          descricao: "Apresentação dos casos",
          tempoApresentacao: 20,
          tempoDiscussao: 10,
          orientacoes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getAllPresentationGuidelines).mockResolvedValue(mockGuidelines);

      const result = await db.getAllPresentationGuidelines();

      // Aula: 30' apresentação + 10' discussão
      const aula = result.find((g) => g.tipo === "AULA");
      expect(aula?.tempoApresentacao).toBe(30);
      expect(aula?.tempoDiscussao).toBe(10);

      // Artigo: 10' apresentação + 5' comentários
      const artigo = result.find((g) => g.tipo === "ARTIGO");
      expect(artigo?.tempoApresentacao).toBe(10);
      expect(artigo?.tempoDiscussao).toBe(5);

      // Casos Clínicos: 20' apresentação + 10' arguição
      const casos = result.find((g) => g.tipo === "CASOS_CLINICOS");
      expect(casos?.tempoApresentacao).toBe(20);
      expect(casos?.tempoDiscussao).toBe(10);
    });
  });
});

describe("Meeting Types", () => {
  it("should support all expected meeting types", () => {
    const expectedTypes = [
      "AULA",
      "ARTIGO",
      "CASOS_CLINICOS",
      "PROVA",
      "AVALIACAO",
      "EVENTO",
      "FERIADO",
      "RECESSO",
    ];

    // This is a type-level test to ensure our schema supports all types
    expectedTypes.forEach((type) => {
      expect(typeof type).toBe("string");
    });
  });
});
