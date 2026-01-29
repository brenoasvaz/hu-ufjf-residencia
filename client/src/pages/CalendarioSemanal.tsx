import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock } from "lucide-react";

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const BLOCOS_R1 = ["Enfermaria", "CC1", "CC2"];
const BLOCOS_R2_R3 = ["A", "B", "C"];

export default function CalendarioSemanal() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedBloco, setSelectedBloco] = useState<string>("all");

  // Buscar atividades semanais
  const { data: activities, isLoading } = trpc.weeklyActivities.list.useQuery({
    anoResidencia: selectedYear !== "all" ? (selectedYear as "R1" | "R2" | "R3") : undefined,
    bloco: selectedBloco !== "all" ? selectedBloco : undefined,
  });

  // Agrupar atividades por dia da semana
  const activitiesByDay = useMemo(() => {
    if (!activities) return {};

    const grouped: Record<number, any[]> = {};
    
    activities.forEach((activity: any) => {
      if (!grouped[activity.diaSemana]) {
        grouped[activity.diaSemana] = [];
      }
      grouped[activity.diaSemana].push(activity);
    });

    // Ordenar atividades de cada dia por hora de início
    Object.keys(grouped).forEach((day) => {
      grouped[Number(day)].sort((a, b) => {
        return a.horaInicio.localeCompare(b.horaInicio);
      });
    });

    return grouped;
  }, [activities]);

  // Determinar blocos disponíveis baseado no ano selecionado
  const availableBlocks = useMemo(() => {
    if (selectedYear === "R1") return BLOCOS_R1;
    if (selectedYear === "R2" || selectedYear === "R3") return BLOCOS_R2_R3;
    return [...BLOCOS_R1, ...BLOCOS_R2_R3];
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Calendário Semanal
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize as atividades semanais por ano e bloco de residência
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine a visualização das atividades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ano de Residência</label>
              <Select value={selectedYear} onValueChange={(value) => {
                setSelectedYear(value);
                setSelectedBloco("all"); // Reset bloco ao mudar ano
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="R1">R1</SelectItem>
                  <SelectItem value="R2">R2</SelectItem>
                  <SelectItem value="R3">R3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bloco</label>
              <Select value={selectedBloco} onValueChange={setSelectedBloco}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableBlocks.map((bloco) => (
                    <SelectItem key={bloco} value={bloco}>
                      {bloco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Semanal */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          DIAS_SEMANA.map((dia, index) => {
            const dayActivities = activitiesByDay[index] || [];

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {dia}
                  </CardTitle>
                  <CardDescription>
                    {dayActivities.length} atividade(s) programada(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dayActivities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma atividade programada
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayActivities.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex flex-col md:flex-row md:items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                          {/* Horário */}
                          <div className="flex items-center gap-2 md:w-32 flex-shrink-0">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm font-medium">
                              {activity.horaInicio} - {activity.horaFim}
                            </div>
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 space-y-2">
                            <div className="font-medium">{activity.titulo}</div>
                            {activity.descricao && (
                              <div className="text-sm text-muted-foreground">
                                {activity.descricao}
                              </div>
                            )}
                            {activity.local && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                📍 {activity.local}
                              </div>
                            )}
                            {activity.observacao && (
                              <div className="text-xs text-muted-foreground italic">
                                {activity.observacao}
                              </div>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {activity.audiences?.map((audience: any) => (
                              <Badge key={audience.id} variant="secondary">
                                {audience.anoResidencia}
                                {audience.bloco && ` - ${audience.bloco}`}
                                {audience.opcional === 1 && " (Opcional)"}
                              </Badge>
                            ))}
                            {activity.recorrente === 1 && (
                              <Badge variant="outline">Recorrente</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Anos de Residência:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>R1:</strong> Primeiro ano</li>
                <li>• <strong>R2:</strong> Segundo ano</li>
                <li>• <strong>R3:</strong> Terceiro ano</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Blocos:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>R1:</strong> Enfermaria, CC1, CC2</li>
                <li>• <strong>R2/R3:</strong> A (Ombro/Pé/Mão), B (Coluna/Quadril), C (Joelho/Tumor)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
