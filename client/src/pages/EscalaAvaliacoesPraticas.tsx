import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, User, GraduationCap, Calendar, AlertTriangle } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Avaliacao {
  trimestre: string;
  meses: string;
  habilidades: string;
  atendimento: string;
}

interface Residente {
  nome: string;
  codigo: string; // R1a, R2b, etc.
  avaliacoes: Avaliacao[];
}

// ─── Dados extraídos do PDF ───────────────────────────────────────────────────

const QUADRIMESTRES: Avaliacao["trimestre"][] = [
  "1º Quadrimestre",
  "2º Quadrimestre",
  "3º Quadrimestre",
];

const MESES: Record<string, string> = {
  "1º Quadrimestre": "Março, Abril, Maio, Junho",
  "2º Quadrimestre": "Julho, Agosto, Setembro, Outubro",
  "3º Quadrimestre": "Novembro, Dezembro, Janeiro, Fevereiro",
};

const R1: Residente[] = [
  {
    nome: "Bernardo Arantes",
    codigo: "R1a",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Breno Vaz", atendimento: "Jair Moreira" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "José da Mota", atendimento: "Igor Gerdi" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Adriano Mendes", atendimento: "Marcus Vinicius" },
    ],
  },
  {
    nome: "Samuel Tenório",
    codigo: "R1b",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Daniel Loures", atendimento: "Arnaldo Gonçalves" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Sávio Mourão", atendimento: "Bruno Fajardo" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Vitor Groppo", atendimento: "Tônio Reis" },
    ],
  },
  {
    nome: "Matheus Silva",
    codigo: "R1c",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "João Paulo", atendimento: "José da Mota" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Igor Gerdi", atendimento: "Adriano Mendes" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Marcus Vinicius", atendimento: "Daniel Loures" },
    ],
  },
];

const R2: Residente[] = [
  {
    nome: "Guilherme Lamas",
    codigo: "R2a",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Arnaldo Gonçalves", atendimento: "Sávio Mourão" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Bruno Fajardo", atendimento: "Vitor Groppo" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Tônio Reis", atendimento: "João Paulo" },
    ],
  },
  {
    nome: "Guilherme Coelho",
    codigo: "R2b",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Adriano Mendes", atendimento: "Marcus Vinicius" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Daniel Loures", atendimento: "Arnaldo Gonçalves" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Sávio Mourão", atendimento: "Bruno Fajardo" },
    ],
  },
  {
    nome: "João Pedro",
    codigo: "R2c",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Vitor Groppo", atendimento: "Tônio Reis" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "João Paulo", atendimento: "Breno Vaz" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Jair Moreira", atendimento: "José da Mota" },
    ],
  },
];

const R3: Residente[] = [
  {
    nome: "Mariana",
    codigo: "R3a",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Igor Gerdi", atendimento: "Adriano Mendes" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Marcus Vinicius", atendimento: "Daniel Loures" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Arnaldo Gonçalves", atendimento: "Sávio Mourão" },
    ],
  },
  {
    nome: "Henrique",
    codigo: "R3b",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "Bruno Fajardo", atendimento: "Vitor Groppo" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Tônio Reis", atendimento: "João Paulo" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Breno Vaz", atendimento: "Jair Moreira" },
    ],
  },
  {
    nome: "Jéssica",
    codigo: "R3c",
    avaliacoes: [
      { trimestre: "1º Quadrimestre", meses: MESES["1º Quadrimestre"], habilidades: "José da Mota", atendimento: "Igor Gerdi" },
      { trimestre: "2º Quadrimestre", meses: MESES["2º Quadrimestre"], habilidades: "Adriano Mendes", atendimento: "Marcus Vinicius" },
      { trimestre: "3º Quadrimestre", meses: MESES["3º Quadrimestre"], habilidades: "Daniel Loures", atendimento: "Arnaldo Gonçalves" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentQuadrimestre(): string {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 6) return "1º Quadrimestre";
  if (month >= 7 && month <= 10) return "2º Quadrimestre";
  return "3º Quadrimestre";
}

const QUADRIMESTRE_COLORS: Record<string, string> = {
  "1º Quadrimestre": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "2º Quadrimestre": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "3º Quadrimestre": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
};

// ─── Subcomponente: Cartão de Residente ───────────────────────────────────────

function ResidenteCard({ residente, quadrimestreAtivo }: { residente: Residente; quadrimestreAtivo: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold">{residente.nome}</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">({residente.codigo.toUpperCase()})</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground w-[38%]">Período</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Habilidades</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Atendimento</th>
              </tr>
            </thead>
            <tbody>
              {residente.avaliacoes.map((av) => {
                const isAtivo = av.trimestre === quadrimestreAtivo;
                return (
                  <tr
                    key={av.trimestre}
                    className={`border-b last:border-0 transition-colors ${
                      isAtivo ? "bg-primary/5 font-medium" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant="secondary"
                          className={`w-fit text-xs ${QUADRIMESTRE_COLORS[av.trimestre]}`}
                        >
                          {isAtivo && <span className="mr-1">●</span>}
                          {av.trimestre}
                        </Badge>
                        <span className="text-xs text-muted-foreground leading-tight">{av.meses}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        {av.habilidades}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        {av.atendimento}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Subcomponente: Grade de Residentes ───────────────────────────────────────

function GradeResidentes({ residentes, quadrimestreAtivo }: { residentes: Residente[]; quadrimestreAtivo: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {residentes.map((r) => (
        <ResidenteCard key={r.codigo} residente={r} quadrimestreAtivo={quadrimestreAtivo} />
      ))}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function EscalaAvaliacoesPraticas() {
  const quadrimestreAtual = getCurrentQuadrimestre();
  const [filtroQuadrimestre, setFiltroQuadrimestre] = useState<string>("todos");

  // Visão consolidada: todos os residentes filtrados por quadrimestre
  const todosResidentes = [...R1, ...R2, ...R3];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Escala de Avaliações Práticas — 2026
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preceptores responsáveis pelas avaliações de Habilidades e Atendimento de cada residente por quadrimestre.
        </p>
      </div>

      {/* Aviso de datas limite */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Datas limite para realização das avaliações práticas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { quad: "1º Quadrimestre", data: "28/05/2026" },
                { quad: "2º Quadrimestre", data: "20/08/2026" },
                { quad: "3º Quadrimestre", data: "03/12/2026" },
              ].map(({ quad, data }) => (
                <div
                  key={quad}
                  className="flex items-center gap-2 rounded-md bg-amber-100 dark:bg-amber-900/40 px-3 py-2"
                >
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">{quad}</p>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-100">{data}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legenda de quadrimestres */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Quadrimestres:
            </span>
            {QUADRIMESTRES.map((q) => (
              <Badge
                key={q}
                variant="secondary"
                className={`${QUADRIMESTRE_COLORS[q]} ${q === quadrimestreAtual ? "ring-2 ring-offset-1 ring-primary/40" : ""}`}
              >
                {q === quadrimestreAtual && <span className="mr-1">●</span>}
                {q} — {MESES[q]}
                {q === quadrimestreAtual && <span className="ml-1 font-semibold">(atual)</span>}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Abas por ano de residência */}
      <Tabs defaultValue="R1" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-xs">
          <TabsTrigger value="R1">R1</TabsTrigger>
          <TabsTrigger value="R2">R2</TabsTrigger>
          <TabsTrigger value="R3">R3</TabsTrigger>
        </TabsList>

        <TabsContent value="R1" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Residentes do <strong>1º ano</strong> — 3 residentes
          </p>
          <GradeResidentes residentes={R1} quadrimestreAtivo={quadrimestreAtual} />
        </TabsContent>

        <TabsContent value="R2" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Residentes do <strong>2º ano</strong> — 3 residentes
          </p>
          <GradeResidentes residentes={R2} quadrimestreAtivo={quadrimestreAtual} />
        </TabsContent>

        <TabsContent value="R3" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Residentes do <strong>3º ano</strong> — 3 residentes
          </p>
          <GradeResidentes residentes={R3} quadrimestreAtivo={quadrimestreAtual} />
        </TabsContent>
      </Tabs>

      {/* Nota de rodapé */}
      <p className="text-xs text-muted-foreground italic border-l-4 border-primary/30 pl-4">
        A escala poderá sofrer alterações de acordo com as necessidades do serviço. O quadrimestre em destaque (●) corresponde ao período atual.
      </p>
    </div>
  );
}
