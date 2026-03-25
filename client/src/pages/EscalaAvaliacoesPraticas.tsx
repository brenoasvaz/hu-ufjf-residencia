import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, User, Calendar, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AvaliacaoRow {
  id: number;
  ano: number;
  anoResidencia: "R1" | "R2" | "R3";
  codigoResidente: string;
  nomeResidente: string;
  quadrimestre: "1" | "2" | "3";
  preceptorHabilidades: string;
  preceptorAtendimento: string;
  dataLimite: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUAD_LABEL: Record<string, string> = {
  "1": "1º Quadrimestre",
  "2": "2º Quadrimestre",
  "3": "3º Quadrimestre",
};

const QUAD_MESES: Record<string, string> = {
  "1": "Março – Junho",
  "2": "Julho – Outubro",
  "3": "Novembro – Fevereiro",
};

const QUAD_COLORS: Record<string, string> = {
  "1": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "2": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "3": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
};

/** Retorna o quadrimestre atual ("1" | "2" | "3") */
function getCurrentQuad(): string {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 6) return "1";
  if (m >= 7 && m <= 10) return "2";
  return "3";
}

/** Converte "DD/MM/YYYY" → Date */
function parseDataLimite(s: string): Date {
  const [d, mo, y] = s.split("/").map(Number);
  return new Date(y, mo - 1, d);
}

/** Dias restantes até a data limite (negativo = vencida) */
function diasRestantes(dataLimite: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = parseDataLimite(dataLimite);
  return Math.round((limite.getTime() - hoje.getTime()) / 86400000);
}

// ─── Subcomponente: Cartão de Residente ───────────────────────────────────────

function ResidenteCard({
  nomeResidente,
  codigo,
  avaliacoes,
  quadAtivo,
}: {
  nomeResidente: string;
  codigo: string;
  avaliacoes: AvaliacaoRow[];
  quadAtivo: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold">{nomeResidente}</span>
            <span className="ml-2 text-xs text-muted-foreground font-normal">({codigo})</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Quadrimestre</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Habilidades Cirúrgicas</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground text-xs">Atendimento Clínico</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes
                .sort((a, b) => Number(a.quadrimestre) - Number(b.quadrimestre))
                .map((av) => {
                  const isAtivo = av.quadrimestre === quadAtivo;
                  const dias = av.dataLimite ? diasRestantes(av.dataLimite) : null;
                  const urgente = dias !== null && dias >= 0 && dias <= 30;
                  const vencida = dias !== null && dias < 0;

                  return (
                    <tr
                      key={av.quadrimestre}
                      className={`border-b last:border-0 transition-colors ${
                        isAtivo ? "bg-primary/5" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="secondary"
                            className={`w-fit text-xs ${QUAD_COLORS[av.quadrimestre]} ${
                              isAtivo ? "ring-2 ring-offset-1 ring-primary/40" : ""
                            }`}
                          >
                            {isAtivo && <span className="mr-1">●</span>}
                            {QUAD_LABEL[av.quadrimestre]}
                            {isAtivo && <span className="ml-1 font-semibold">(atual)</span>}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{QUAD_MESES[av.quadrimestre]}</span>
                          {av.dataLimite && (
                            <span
                              className={`text-xs font-medium ${
                                vencida
                                  ? "text-red-600 dark:text-red-400"
                                  : urgente
                                  ? "text-orange-600 dark:text-orange-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {vencida
                                ? `⚠ Vencida (${Math.abs(dias!)}d atrás)`
                                : urgente
                                ? `⏰ ${dias}d restantes`
                                : `Limite: ${av.dataLimite}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{av.preceptorHabilidades}</td>
                      <td className="px-4 py-3 font-medium">{av.preceptorAtendimento}</td>
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

// ─── Componente por grupo de ano ───────────────────────────────────────────────

function GrupoAno({
  anoResidencia,
  rows,
  quadAtivo,
}: {
  anoResidencia: "R1" | "R2" | "R3";
  rows: AvaliacaoRow[];
  quadAtivo: string;
}) {
  // Agrupar por residente
  const residentes = Array.from(new Set(rows.map((r) => r.codigoResidente))).sort();

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {residentes.map((codigo) => {
        const avaliacoes = rows.filter((r) => r.codigoResidente === codigo);
        const nome = avaliacoes[0]?.nomeResidente ?? codigo;
        return (
          <ResidenteCard
            key={codigo}
            nomeResidente={nome}
            codigo={codigo}
            avaliacoes={avaliacoes}
            quadAtivo={quadAtivo}
          />
        );
      })}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EscalaAvaliacoesPraticas() {
  const quadAtivo = getCurrentQuad();
  const currentYear = new Date().getFullYear();
  const [ano, setAno] = useState(currentYear);

  const anos = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
  }, [currentYear]);

  const { data: rows = [], isLoading } = trpc.escalaAvaliacoes.list.useQuery({ ano });

  // Datas limite únicas por quadrimestre (para o banner)
  const datasLimite: Record<string, string> = {};
  rows.forEach((r) => {
    if (r.dataLimite && !datasLimite[r.quadrimestre]) {
      datasLimite[r.quadrimestre] = r.dataLimite;
    }
  });

  // Fallback se não houver datas no banco (apenas para o ano atual)
  const isCurrent = ano === currentYear;
  const limites = [
    { quad: "1", label: "1º Quadrimestre", data: datasLimite["1"] ?? (isCurrent ? "28/05/2026" : null) },
    { quad: "2", label: "2º Quadrimestre", data: datasLimite["2"] ?? (isCurrent ? "20/08/2026" : null) },
    { quad: "3", label: "3º Quadrimestre", data: datasLimite["3"] ?? (isCurrent ? "03/12/2026" : null) },
  ].filter((l) => l.data !== null) as { quad: string; label: string; data: string }[];

  const rowsByAno = (ano: "R1" | "R2" | "R3") => rows.filter((r) => r.anoResidencia === ano);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Escala de Avaliações Práticas — {ano}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preceptores responsáveis pelas avaliações de Habilidades e Atendimento de cada residente por quadrimestre.
          </p>
        </div>
        {/* Seletor de ano */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setAno((a) => a - 1)}
            disabled={ano <= anos[0]}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setAno((a) => a + 1)}
            disabled={ano >= anos[anos.length - 1]}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Aviso de datas limite */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="space-y-2 w-full">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Datas limite para realização das avaliações práticas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {limites.map(({ quad, label, data }) => {
                const dias = diasRestantes(data);
                const urgente = dias >= 0 && dias <= 30;
                const vencida = dias < 0;
                return (
                  <div
                    key={quad}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${
                      vencida
                        ? "bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700"
                        : urgente
                        ? "bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-700"
                        : "bg-amber-100 dark:bg-amber-900/40"
                    }`}
                  >
                    <Calendar
                      className={`h-4 w-4 shrink-0 ${
                        vencida
                          ? "text-red-600 dark:text-red-400"
                          : urgente
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-xs font-medium ${
                          vencida
                            ? "text-red-700 dark:text-red-300"
                            : urgente
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          vencida
                            ? "text-red-900 dark:text-red-100"
                            : urgente
                            ? "text-orange-900 dark:text-orange-100"
                            : "text-amber-900 dark:text-amber-100"
                        }`}
                      >
                        {data}
                      </p>
                      {urgente && !vencida && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                          ⏰ {dias} dias restantes
                        </p>
                      )}
                      {vencida && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          ⚠ Prazo encerrado
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
            {["1", "2", "3"].map((q) => (
              <Badge
                key={q}
                variant="secondary"
                className={`${QUAD_COLORS[q]} ${q === quadAtivo ? "ring-2 ring-offset-1 ring-primary/40" : ""}`}
              >
                {q === quadAtivo && <span className="mr-1">●</span>}
                {QUAD_LABEL[q]} — {QUAD_MESES[q]}
                {q === quadAtivo && <span className="ml-1 font-semibold">(atual)</span>}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Abas por ano de residência */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="R1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-xs">
            <TabsTrigger value="R1">R1</TabsTrigger>
            <TabsTrigger value="R2">R2</TabsTrigger>
            <TabsTrigger value="R3">R3</TabsTrigger>
          </TabsList>

          {(["R1", "R2", "R3"] as const).map((ano) => (
            <TabsContent key={ano} value={ano} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Residentes do <strong>{ano === "R1" ? "1º" : ano === "R2" ? "2º" : "3º"} ano</strong> — {rowsByAno(ano).length / 3 || 0} residentes
              </p>
              <GrupoAno anoResidencia={ano} rows={rowsByAno(ano)} quadAtivo={quadAtivo} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
