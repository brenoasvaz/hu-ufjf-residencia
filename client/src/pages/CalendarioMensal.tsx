import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, MapPin, Clock, ExternalLink } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Cores para diferentes blocos/estágios
const getStageColor = (stage: string) => {
  if (stage === "Bloco A" || stage === "A") return "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200";
  if (stage === "Bloco B" || stage === "B") return "bg-green-100 border-green-300 text-green-900 hover:bg-green-200";
  if (stage === "Bloco C" || stage === "C") return "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200";
  if (stage === "Enfermaria") return "bg-cyan-100 border-cyan-300 text-cyan-900 hover:bg-cyan-200";
  if (stage === "CC1") return "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200";
  if (stage === "CC2") return "bg-rose-100 border-rose-300 text-rose-900 hover:bg-rose-200";
  return "bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200";
};

// Mapear bloco para filtro do calendário semanal
const getBlocoFilter = (stage: string) => {
  if (stage === "Bloco A") return "A";
  if (stage === "Bloco B") return "B";
  if (stage === "Bloco C") return "C";
  return stage;
};

export default function CalendarioMensal() {
  const [, navigate] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedResident, setSelectedResident] = useState<string>("all");
  const [selectedRotation, setSelectedRotation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Buscar rodízios do mês
  const { data: rotations, isLoading: loadingRotations } = trpc.rotations.getByDateRange.useQuery({
    dataInicio: monthStart,
    dataFim: monthEnd,
  });

  // Buscar residentes para filtro
  const { data: residents } = trpc.residents.list.useQuery();

  // Buscar estágios para filtro
  const { data: stages } = trpc.stages.list.useQuery({ activeOnly: true });

  // Gerar dias do mês com padding para alinhar ao domingo
  const daysInMonth = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = getDay(monthStart);
    
    // Adicionar dias vazios no início para alinhar
    const paddedDays: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedDays.push(null);
    }
    
    return [...paddedDays, ...days];
  }, [monthStart, monthEnd]);

  // Filtrar rodízios
  const filteredRotations = useMemo(() => {
    if (!rotations) return [];

    return rotations.filter((rotation: any) => {
      if (selectedStage !== "all" && rotation.localEstagio !== selectedStage) return false;
      if (selectedYear !== "all") {
        // Filtrar por ano baseado no estágio
        const isR1Stage = ["Enfermaria", "CC1", "CC2"].includes(rotation.localEstagio);
        const isR2R3Stage = ["Bloco A", "Bloco B", "Bloco C"].includes(rotation.localEstagio);
        
        if (selectedYear === "R1" && !isR1Stage) return false;
        if ((selectedYear === "R2" || selectedYear === "R3") && !isR2R3Stage) return false;
      }
      return true;
    });
  }, [rotations, selectedStage, selectedYear]);

  // Navegar entre meses
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Abrir modal com detalhes do rodízio
  const openRotationDetails = (rotation: any) => {
    setSelectedRotation(rotation);
    setDialogOpen(true);
  };

  // Navegar para escala semanal com filtro
  const goToWeeklySchedule = (stage: string) => {
    const bloco = getBlocoFilter(stage);
    navigate(`/calendario-semanal?bloco=${bloco}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Calendário Mensal
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize os rodízios de residentes organizados por mês
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ano de Residência</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
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
              <label className="text-sm font-medium mb-2 block">Estágio/Local</label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {stages?.map((stage: any) => (
                    <SelectItem key={stage.id} value={stage.nome}>
                      {stage.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Residente</label>
              <Select value={selectedResident} onValueChange={setSelectedResident}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {residents?.map((resident: any) => (
                    <SelectItem key={resident.id} value={resident.id.toString()}>
                      {resident.nomeCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={goToToday} className="w-full">
                Hoje
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação do Calendário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingRotations ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* Cabeçalho dos dias da semana */}
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {/* Dias do mês */}
              {daysInMonth.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="min-h-[100px]" />;
                }

                const dayRotations = filteredRotations.filter((rotation: any) => {
                  const rotationStart = new Date(rotation.dataInicio);
                  const rotationEnd = new Date(rotation.dataFim);
                  return day >= rotationStart && day <= rotationEnd;
                });

                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-1 md:p-2 border rounded-lg transition-colors ${
                      isToday ? "border-primary border-2 bg-primary/5" : "border-border"
                    } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayRotations.slice(0, 3).map((rotation: any) => (
                        <button
                          key={rotation.id}
                          onClick={() => openRotationDetails(rotation)}
                          className={`text-xs w-full text-left px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${getStageColor(rotation.localEstagio)}`}
                        >
                          <div className="font-medium truncate">{rotation.localEstagio}</div>
                          {rotation.residents && rotation.residents.length > 0 && (
                            <div className="text-[10px] opacity-75 truncate">
                              {rotation.residents.map((r: any) => r.nomeCompleto).join(", ")}
                            </div>
                          )}
                        </button>
                      ))}
                      {dayRotations.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayRotations.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Rodízios do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rodízios do Mês
          </CardTitle>
          <CardDescription>
            {filteredRotations.length} rodízio(s) encontrado(s) - Clique para ver detalhes e escala semanal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum rodízio encontrado para este mês
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRotations.map((rotation: any) => (
                <button
                  key={rotation.id}
                  onClick={() => openRotationDetails(rotation)}
                  className={`flex flex-col p-4 border rounded-lg transition-all cursor-pointer text-left ${getStageColor(rotation.localEstagio)}`}
                >
                  <div className="font-semibold text-lg mb-2">{rotation.localEstagio}</div>
                  <div className="text-sm flex items-center gap-1 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(rotation.dataInicio), "dd/MM", { locale: ptBR })} -{" "}
                    {format(new Date(rotation.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  {rotation.residents && rotation.residents.length > 0 && (
                    <div className="text-sm flex items-center gap-1 mb-1">
                      <Users className="h-3.5 w-3.5" />
                      {rotation.residents.map((r: any) => r.nomeCompleto).join(" + ")}
                    </div>
                  )}
                  {rotation.descricao && (
                    <div className="text-sm opacity-80 line-clamp-2">{rotation.descricao}</div>
                  )}
                  <div className="mt-2 text-xs flex items-center gap-1 opacity-70">
                    <ExternalLink className="h-3 w-3" />
                    Clique para ver escala semanal
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Rodízio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedRotation?.localEstagio}
            </DialogTitle>
            <DialogDescription>
              Detalhes do rodízio e acesso à escala semanal
            </DialogDescription>
          </DialogHeader>
          
          {selectedRotation && (
            <div className="space-y-4">
              {/* Período */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Período</div>
                <div className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {format(new Date(selectedRotation.dataInicio), "dd 'de' MMMM", { locale: ptBR })} a{" "}
                  {format(new Date(selectedRotation.dataFim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>

              {/* Descrição */}
              {selectedRotation.descricao && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Descrição</div>
                  <div>{selectedRotation.descricao}</div>
                </div>
              )}

              {/* Residentes atribuídos */}
              {selectedRotation.assignments && selectedRotation.assignments.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Residentes</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRotation.assignments.map((assignment: any) => (
                      <Badge key={assignment.id} variant="secondary">
                        {assignment.resident?.nomeCompleto || assignment.resident?.apelido || "Residente"}
                        {assignment.papel && ` (${assignment.papel})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão para escala semanal */}
              <div className="pt-4 border-t">
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setDialogOpen(false);
                    goToWeeklySchedule(selectedRotation.localEstagio);
                  }}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ver Escala Semanal Completa
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Visualize todas as atividades diárias deste bloco
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Legenda de Cores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
              <span className="text-sm">Bloco A</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
              <span className="text-sm">Bloco B</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300" />
              <span className="text-sm">Bloco C</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-100 border border-cyan-300" />
              <span className="text-sm">Enfermaria</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
              <span className="text-sm">CC1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-100 border border-rose-300" />
              <span className="text-sm">CC2</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
