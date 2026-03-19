import { useState, useMemo, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Clock, MapPin, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";

const DIAS_SEMANA = [
  { index: 1, nome: "Segunda", abrev: "Seg" },
  { index: 2, nome: "Terça", abrev: "Ter" },
  { index: 3, nome: "Quarta", abrev: "Qua" },
  { index: 4, nome: "Quinta", abrev: "Qui" },
  { index: 5, nome: "Sexta", abrev: "Sex" },
  { index: 6, nome: "Sábado", abrev: "Sáb" },
  { index: 0, nome: "Domingo", abrev: "Dom" },
];

const HORARIOS = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const BLOCOS_R1 = ["Enfermaria", "CC1", "CC2"];
const BLOCOS_R2_R3 = ["A", "B", "C"];

const getActivityColor = (titulo: string) => {
  if (titulo.includes("CC HU") || titulo.includes("Centro Cirúrgico")) return "bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200";
  if (titulo.includes("Ambulatório")) return "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200";
  if (titulo.includes("Visita")) return "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200";
  if (titulo.includes("Estudo")) return "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200";
  if (titulo.includes("Reunião") || titulo.includes("Clube")) return "bg-violet-100 border-violet-300 text-violet-900 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-200";
  if (titulo.includes("HPS") || titulo.includes("Plantão")) return "bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200";
  if (titulo.includes("Enfermaria")) return "bg-cyan-100 border-cyan-300 text-cyan-900 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-200";
  return "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-200";
};

export default function CalendarioSemanal() {
  const searchString = useSearch();
  const [selectedYear, setSelectedYear] = useState<string>("R1");
  const [selectedBloco, setSelectedBloco] = useState<string>("Enfermaria");
  // Mobile: índice do dia selecionado (0 = Segunda, 4 = Sexta)
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const blocoParam = params.get("bloco");
    const yearParam = params.get("ano");
    if (blocoParam) {
      setSelectedBloco(blocoParam);
      if (["A", "B", "C"].includes(blocoParam)) setSelectedYear("R2");
      else if (["Enfermaria", "CC1", "CC2"].includes(blocoParam)) setSelectedYear("R1");
    }
    if (yearParam) setSelectedYear(yearParam);
  }, [searchString]);

  const { data: activities, isLoading } = trpc.weeklyActivities.list.useQuery({
    anoResidencia: selectedYear !== "all" ? (selectedYear as "R1" | "R2" | "R3") : undefined,
    bloco: selectedBloco !== "all" ? selectedBloco : undefined,
  });

  const { data: stages } = trpc.stages.list.useQuery({ activeOnly: true });

  // Todos os dias para mobile (Seg–Dom)
  const DIAS_UTEIS = DIAS_SEMANA;

  const activitiesGrid = useMemo(() => {
    if (!activities) return {};
    const grid: Record<number, Record<string, any[]>> = {};
    DIAS_SEMANA.forEach(dia => {
      grid[dia.index] = {};
      HORARIOS.forEach(hora => { grid[dia.index][hora] = []; });
    });
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    activities.forEach((activity: any) => {
      const startTime = activity.horaInicio?.substring(0, 5) || "07:00";
      const endTime = activity.horaFim?.substring(0, 5) || "08:00";
      const dayIndex = activity.diaSemana;
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      let isFirstBlock = true;
      HORARIOS.forEach(hora => {
        const horaMinutes = timeToMinutes(hora);
        if (horaMinutes >= startMinutes && horaMinutes < endMinutes) {
          if (grid[dayIndex] && grid[dayIndex][hora]) {
            grid[dayIndex][hora].push({ ...activity, isFirstBlock });
            isFirstBlock = false;
          }
        }
      });
    });
    return grid;
  }, [activities]);

  // Atividades do dia selecionado no mobile (agrupadas por horário, sem duplicatas de bloco)
  const mobileDayActivities = useMemo(() => {
    if (!activities) return [];
    const dia = DIAS_UTEIS[mobileDayIndex];
    if (!dia) return [];
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const seen = new Set<number>();
    const result: any[] = [];
    activities.forEach((activity: any) => {
      if (activity.diaSemana === dia.index && !seen.has(activity.id)) {
        seen.add(activity.id);
        result.push(activity);
      }
    });
    return result.sort((a, b) =>
      timeToMinutes(a.horaInicio || "07:00") - timeToMinutes(b.horaInicio || "07:00")
    );
  }, [activities, mobileDayIndex]);

  const availableBlocks = useMemo(() => {
    if (selectedYear === "all") return [...BLOCOS_R1, ...BLOCOS_R2_R3];
    if (selectedYear === "R1") return BLOCOS_R1;
    return BLOCOS_R2_R3;
  }, [selectedYear]);

  const getBlocoDescription = (bloco: string) => {
    const blocoMap: Record<string, string> = { "A": "Bloco A", "B": "Bloco B", "C": "Bloco C", "Enfermaria": "Enfermaria", "CC1": "CC1", "CC2": "CC2" };
    const stage = stages?.find((s: any) => s.nome === (blocoMap[bloco] || bloco));
    return stage?.descricao || null;
  };

  const getActivityHeight = (activity: any) => {
    const start = activity.horaInicio?.split(":").map(Number) || [7, 0];
    const end = activity.horaFim?.split(":").map(Number) || [8, 0];
    const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    return Math.max(duration / 60, 1);
  };

  const getBlocoTitle = () => {
    if (selectedBloco === "A") return "Bloco A - Ombro, Pé e Mão";
    if (selectedBloco === "B") return "Bloco B - Coluna e Quadril";
    if (selectedBloco === "C") return "Bloco C - Joelho e Tumor";
    if (selectedBloco === "Enfermaria") return "Enfermaria";
    if (selectedBloco === "CC1") return "Centro Cirúrgico 1";
    if (selectedBloco === "CC2") return "Centro Cirúrgico 2";
    return selectedBloco;
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Só swipe horizontal (dx > dy em módulo)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0 && mobileDayIndex < DIAS_UTEIS.length - 1) {
        setMobileDayIndex(prev => prev + 1);
      } else if (dx > 0 && mobileDayIndex > 0) {
        setMobileDayIndex(prev => prev - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Escala Semanal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize todas as atividades da semana por horário e dia
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Ano de Residência</Label>
              <Select value={selectedYear} onValueChange={(value) => {
                setSelectedYear(value);
                if (value === "R1") setSelectedBloco("Enfermaria");
                else if (value === "R2" || value === "R3") setSelectedBloco("A");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="R1">R1 - Primeiro Ano</SelectItem>
                  <SelectItem value="R2">R2 - Segundo Ano</SelectItem>
                  <SelectItem value="R3">R3 - Terceiro Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Bloco / Estágio</Label>
              <Select value={selectedBloco} onValueChange={setSelectedBloco}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {availableBlocks.map((bloco) => {
                    const desc = getBlocoDescription(bloco);
                    let label = bloco;
                    if (bloco === "A") label = desc ? `Bloco A - ${desc}` : "Bloco A";
                    else if (bloco === "B") label = desc ? `Bloco B - ${desc}` : "Bloco B";
                    else if (bloco === "C") label = desc ? `Bloco C - ${desc}` : "Bloco C";
                    else if (bloco === "Enfermaria") label = "Enfermaria";
                    else if (bloco === "CC1") label = "Centro Cirúrgico 1";
                    else if (bloco === "CC2") label = "Centro Cirúrgico 2";
                    return <SelectItem key={bloco} value={bloco}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Título do Bloco */}
      <div className="text-center py-2">
        <h2 className="text-lg font-semibold text-primary">{getBlocoTitle()}</h2>
        {selectedYear !== "all" && (
          <p className="text-muted-foreground">{selectedYear}</p>
        )}
      </div>

      {/* ── MOBILE: lista por dia com swipe ── */}
      <div className="block md:hidden">
        {/* Navegação de dias */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileDayIndex(prev => Math.max(0, prev - 1))}
            disabled={mobileDayIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Pills de dias */}
          <div className="flex gap-1">
            {DIAS_UTEIS.map((dia, i) => (
              <button
                key={dia.index}
                onClick={() => setMobileDayIndex(i)}
                className={`w-9 h-9 rounded-full text-xs font-semibold transition-colors ${
                  i === mobileDayIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {dia.abrev}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileDayIndex(prev => Math.min(DIAS_UTEIS.length - 1, prev + 1))}
            disabled={mobileDayIndex === DIAS_UTEIS.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Área com swipe */}
        <Card
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="overflow-hidden select-none"
        >
          <CardHeader className="pb-2 bg-muted/40">
            <CardTitle className="text-base text-center">
              {DIAS_UTEIS[mobileDayIndex]?.nome}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : mobileDayActivities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhuma atividade neste dia
              </div>
            ) : (
              <div className="divide-y">
                {mobileDayActivities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className={`flex gap-3 p-3 ${getActivityColor(activity.titulo)}`}
                  >
                    {/* Horário */}
                    <div className="flex-shrink-0 text-center w-14">
                      <div className="text-xs font-bold">{activity.horaInicio?.substring(0, 5)}</div>
                      <div className="text-[10px] opacity-70">até</div>
                      <div className="text-xs font-bold">{activity.horaFim?.substring(0, 5)}</div>
                    </div>
                    {/* Separador */}
                    <div className="w-px bg-current opacity-20 flex-shrink-0" />
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-tight">{activity.titulo}</div>
                      {activity.local && (
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{activity.local}</span>
                        </div>
                      )}
                      {activity.descricao && (
                        <div className="text-xs opacity-70 mt-1 line-clamp-2">{activity.descricao}</div>
                      )}
                      {activity.audiences?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activity.audiences.map((aud: any) => (
                            <Badge key={aud.id} variant="secondary" className="text-[10px] px-1 py-0">
                              {aud.anoResidencia}{aud.bloco && ` · ${aud.bloco}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dica de swipe */}
        <p className="text-center text-xs text-muted-foreground mt-2">
          Deslize para navegar entre os dias
        </p>
      </div>

      {/* ── DESKTOP: grade semanal em colunas ── */}
      <Card className="overflow-hidden hidden md:block">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header com dias da semana */}
                <div className="grid grid-cols-8 border-b bg-muted/50">
                  <div className="p-3 font-medium text-center border-r text-sm">
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    Horário
                  </div>
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia.index} className="p-3 font-medium text-center border-r last:border-r-0">
                      {dia.nome}
                    </div>
                  ))}
                </div>

                {/* Grid de horários */}
                <div className="divide-y">
                  {HORARIOS.map((hora) => (
                    <div key={hora} className="grid grid-cols-8 min-h-[80px]">
                      <div className="p-2 border-r bg-muted/30 flex items-start justify-center">
                        <span className="text-sm font-medium text-muted-foreground">{hora}</span>
                      </div>
                      {DIAS_SEMANA.map((dia) => {
                        const dayActivities = activitiesGrid[dia.index]?.[hora] || [];
                        return (
                          <div key={`${dia.index}-${hora}`} className="p-1 border-r last:border-r-0 relative">
                            {dayActivities.length === 0 ? (
                              <div className="h-full" />
                            ) : (
                              <div className="space-y-1">
                                {dayActivities.map((activity: any, idx: number) => (
                                  <Tooltip key={`${activity.id}-${idx}`}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`rounded border text-xs cursor-pointer transition-all hover:shadow-md ${
                                          activity.isFirstBlock
                                            ? `p-2 ${getActivityColor(activity.titulo)}`
                                            : `p-1 ${getActivityColor(activity.titulo)} opacity-60`
                                        }`}
                                        style={{ minHeight: activity.isFirstBlock ? `${Math.min(getActivityHeight(activity) * 60, 120)}px` : '60px' }}
                                      >
                                        {activity.isFirstBlock ? (
                                          <>
                                            <div className="font-bold line-clamp-2 mb-1">{activity.titulo}</div>
                                            <div className="text-[10px] opacity-75 font-semibold">
                                              {activity.horaInicio} - {activity.horaFim}
                                            </div>
                                            {activity.local && (
                                              <div className="text-[10px] opacity-75 flex items-center gap-1 mt-1">
                                                <MapPin className="h-2.5 w-2.5" />
                                                <span className="truncate">{activity.local}</span>
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="h-full flex items-center justify-center">
                                            <div className="w-1 h-8 bg-current opacity-30 rounded" />
                                          </div>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-xs">
                                      <div className="space-y-2">
                                        <p className="font-semibold">{activity.titulo}</p>
                                        <p className="text-sm">
                                          <Clock className="h-3 w-3 inline mr-1" />
                                          {activity.horaInicio} - {activity.horaFim}
                                        </p>
                                        {activity.descricao && (
                                          <p className="text-sm text-muted-foreground">{activity.descricao}</p>
                                        )}
                                        {activity.local && (
                                          <p className="text-sm">
                                            <MapPin className="h-3 w-3 inline mr-1" />
                                            {activity.local}
                                          </p>
                                        )}
                                        {activity.audiences?.length > 0 && (
                                          <div className="flex flex-wrap gap-1 pt-1">
                                            {activity.audiences.map((aud: any) => (
                                              <Badge key={aud.id} variant="secondary" className="text-xs">
                                                {aud.anoResidencia}{aud.bloco && ` - ${aud.bloco}`}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda de cores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-100 border border-rose-300 flex-shrink-0" />
              <span className="text-sm">Centro Cirúrgico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300 flex-shrink-0" />
              <span className="text-sm">Ambulatório</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 flex-shrink-0" />
              <span className="text-sm">Visita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300 flex-shrink-0" />
              <span className="text-sm">Estudo Dirigido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-100 border border-violet-300 flex-shrink-0" />
              <span className="text-sm">Reunião / Clube</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300 flex-shrink-0" />
              <span className="text-sm">Plantão HPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-100 border border-cyan-300 flex-shrink-0" />
              <span className="text-sm">Enfermaria</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Blocos de Residência:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div><strong>R1:</strong> Enfermaria, CC1 (Centro Cirúrgico 1), CC2 (Centro Cirúrgico 2)</div>
              <div><strong>R2/R3:</strong> Bloco A (Ombro/Pé/Mão), Bloco B (Coluna/Quadril), Bloco C (Joelho/Tumor)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
