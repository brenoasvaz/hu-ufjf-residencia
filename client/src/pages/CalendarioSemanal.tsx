import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDays, Clock, MapPin, Info } from "lucide-react";

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

// Cores para diferentes tipos de atividades
const getActivityColor = (titulo: string) => {
  if (titulo.includes("CC HU") || titulo.includes("Centro Cirúrgico")) return "bg-rose-100 border-rose-300 text-rose-900";
  if (titulo.includes("Ambulatório")) return "bg-blue-100 border-blue-300 text-blue-900";
  if (titulo.includes("Visita")) return "bg-emerald-100 border-emerald-300 text-emerald-900";
  if (titulo.includes("Estudo")) return "bg-amber-100 border-amber-300 text-amber-900";
  if (titulo.includes("Reunião") || titulo.includes("Clube")) return "bg-violet-100 border-violet-300 text-violet-900";
  if (titulo.includes("HPS") || titulo.includes("Plantão")) return "bg-orange-100 border-orange-300 text-orange-900";
  if (titulo.includes("Enfermaria")) return "bg-cyan-100 border-cyan-300 text-cyan-900";
  return "bg-slate-100 border-slate-300 text-slate-900";
};

export default function CalendarioSemanal() {
  const searchString = useSearch();
  const [selectedYear, setSelectedYear] = useState<string>("R1");
  const [selectedBloco, setSelectedBloco] = useState<string>("Enfermaria");

  // Ler parâmetros da URL ao carregar
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const blocoParam = params.get("bloco");
    const yearParam = params.get("ano");
    
    if (blocoParam) {
      setSelectedBloco(blocoParam);
      // Auto-selecionar ano baseado no bloco
      if (["A", "B", "C"].includes(blocoParam)) {
        setSelectedYear("R2");
      } else if (["Enfermaria", "CC1", "CC2"].includes(blocoParam)) {
        setSelectedYear("R1");
      }
    }
    if (yearParam) {
      setSelectedYear(yearParam);
    }
  }, [searchString]);

  // Buscar atividades semanais
  const { data: activities, isLoading } = trpc.weeklyActivities.list.useQuery({
    anoResidencia: selectedYear !== "all" ? (selectedYear as "R1" | "R2" | "R3") : undefined,
    bloco: selectedBloco !== "all" ? selectedBloco : undefined,
  });

  // Buscar estágios para obter descrições
  const { data: stages } = trpc.stages.list.useQuery({ activeOnly: true });

  // Agrupar atividades por dia e horário
  const activitiesGrid = useMemo(() => {
    if (!activities) return {};

    const grid: Record<number, Record<string, any[]>> = {};
    
    DIAS_SEMANA.forEach(dia => {
      grid[dia.index] = {};
      HORARIOS.forEach(hora => {
        grid[dia.index][hora] = [];
      });
    });

    // Helper para converter hora em minutos
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
      
      // Preencher todos os horários ocupados pela atividade
      HORARIOS.forEach(hora => {
        const horaMinutes = timeToMinutes(hora);
        
        // Se o horário está dentro do intervalo da atividade
        if (horaMinutes >= startMinutes && horaMinutes < endMinutes) {
          if (grid[dayIndex] && grid[dayIndex][hora]) {
            grid[dayIndex][hora].push({
              ...activity,
              isFirstBlock,
            });
            isFirstBlock = false; // Próximos blocos não são o primeiro
          }
        }
      });
    });

    return grid;
  }, [activities]);

  // Blocos disponíveis baseado no ano selecionado
  const availableBlocks = useMemo(() => {
    if (selectedYear === "all") return [...BLOCOS_R1, ...BLOCOS_R2_R3];
    if (selectedYear === "R1") return BLOCOS_R1;
    return BLOCOS_R2_R3;
  }, [selectedYear]);

  // Função para obter descrição do bloco
  const getBlocoDescription = (bloco: string) => {
    const blocoMap: Record<string, string> = {
      "A": "Bloco A",
      "B": "Bloco B",
      "C": "Bloco C",
      "Enfermaria": "Enfermaria",
      "CC1": "CC1",
      "CC2": "CC2",
    };
    const blocoNome = blocoMap[bloco] || bloco;
    const stage = stages?.find((s: any) => s.nome === blocoNome);
    return stage?.descricao || null;
  };

  // Calcular altura do bloco baseado na duração
  const getActivityHeight = (activity: any) => {
    const start = activity.horaInicio?.split(":").map(Number) || [7, 0];
    const end = activity.horaFim?.split(":").map(Number) || [8, 0];
    const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
    return Math.max(duration / 60, 1); // Mínimo 1 hora
  };

  // Título do bloco selecionado
  const getBlocoTitle = () => {
    if (selectedBloco === "A") return "Bloco A - Ombro, Pé e Mão";
    if (selectedBloco === "B") return "Bloco B - Coluna e Quadril";
    if (selectedBloco === "C") return "Bloco C - Joelho e Tumor";
    if (selectedBloco === "Enfermaria") return "Enfermaria";
    if (selectedBloco === "CC1") return "Centro Cirúrgico 1";
    if (selectedBloco === "CC2") return "Centro Cirúrgico 2";
    return selectedBloco;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Escala Semanal
          </h1>
          <p className="text-muted-foreground mt-1">
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
              <label className="text-sm font-medium mb-2 block">Ano de Residência</label>
              <Select value={selectedYear} onValueChange={(value) => {
                setSelectedYear(value);
                // Auto-selecionar primeiro bloco do ano
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
              <label className="text-sm font-medium mb-2 block">Bloco / Estágio</label>
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
                    
                    return (
                      <SelectItem key={bloco} value={bloco}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Título do Bloco */}
      <div className="text-center py-2">
        <h2 className="text-xl font-semibold text-primary">{getBlocoTitle()}</h2>
        {selectedYear !== "all" && (
          <p className="text-muted-foreground">{selectedYear}</p>
        )}
      </div>

      {/* Grade Semanal em Colunas */}
      <Card className="overflow-hidden">
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
                      <span className="hidden md:inline">{dia.nome}</span>
                      <span className="md:hidden">{dia.abrev}</span>
                    </div>
                  ))}
                </div>

                {/* Grid de horários */}
                <div className="divide-y">
                  {HORARIOS.map((hora) => (
                    <div key={hora} className="grid grid-cols-8 min-h-[80px]">
                      {/* Coluna de horário */}
                      <div className="p-2 border-r bg-muted/30 flex items-start justify-center">
                        <span className="text-sm font-medium text-muted-foreground">{hora}</span>
                      </div>

                      {/* Colunas dos dias */}
                      {DIAS_SEMANA.map((dia) => {
                        const dayActivities = activitiesGrid[dia.index]?.[hora] || [];
                        
                        return (
                          <div 
                            key={`${dia.index}-${hora}`} 
                            className="p-1 border-r last:border-r-0 relative"
                          >
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
                                        style={{
                                          minHeight: activity.isFirstBlock ? `${Math.min(getActivityHeight(activity) * 60, 120)}px` : '60px'
                                        }}
                                      >
                                        {activity.isFirstBlock ? (
                                          <>
                                            <div className="font-bold line-clamp-2 mb-1">
                                              {activity.titulo}
                                            </div>
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
                                            <div className="w-1 h-8 bg-current opacity-30 rounded"></div>
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
                                                {aud.anoResidencia}
                                                {aud.bloco && ` - ${aud.bloco}`}
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
              <div className="w-4 h-4 rounded bg-rose-100 border border-rose-300" />
              <span className="text-sm">Centro Cirúrgico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
              <span className="text-sm">Ambulatório</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300" />
              <span className="text-sm">Visita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
              <span className="text-sm">Estudo Dirigido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-100 border border-violet-300" />
              <span className="text-sm">Reunião / Clube</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
              <span className="text-sm">Plantão HPS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-100 border border-cyan-300" />
              <span className="text-sm">Enfermaria</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Blocos de Residência:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <strong>R1:</strong> Enfermaria, CC1 (Centro Cirúrgico 1), CC2 (Centro Cirúrgico 2)
              </div>
              <div>
                <strong>R2/R3:</strong> Bloco A (Ombro/Pé/Mão), Bloco B (Coluna/Quadril), Bloco C (Joelho/Tumor)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
