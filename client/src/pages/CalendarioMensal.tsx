import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, MapPin, Clock, ExternalLink, UserCheck, Pencil, Check, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// Cores para diferentes blocos/estágios
const getStageColor = (stage: string) => {
  if (stage === "Bloco A" || stage === "A") return "bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/50";
  if (stage === "Bloco B" || stage === "B") return "bg-green-100 border-green-300 text-green-900 hover:bg-green-200 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200 dark:hover:bg-green-900/50";
  if (stage === "Bloco C" || stage === "C") return "bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200 dark:hover:bg-purple-900/50";
  if (stage === "Enfermaria") return "bg-cyan-100 border-cyan-300 text-cyan-900 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-200 dark:hover:bg-cyan-900/50";
  if (stage === "CC1") return "bg-orange-100 border-orange-300 text-orange-900 hover:bg-orange-200 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200 dark:hover:bg-orange-900/50";
  if (stage === "CC2") return "bg-rose-100 border-rose-300 text-rose-900 hover:bg-rose-200 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/50";
  return "bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";
};

const getStageBadgeColor = (stage: string) => {
  if (stage === "Bloco A" || stage === "A") return "bg-blue-100 text-blue-800 border-blue-300";
  if (stage === "Bloco B" || stage === "B") return "bg-green-100 text-green-800 border-green-300";
  if (stage === "Bloco C" || stage === "C") return "bg-purple-100 text-purple-800 border-purple-300";
  if (stage === "Enfermaria") return "bg-cyan-100 text-cyan-800 border-cyan-300";
  if (stage === "CC1") return "bg-orange-100 text-orange-800 border-orange-300";
  if (stage === "CC2") return "bg-rose-100 text-rose-800 border-rose-300";
  return "bg-slate-100 text-slate-800 border-slate-300";
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
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedResident, setSelectedResident] = useState<string>("all");

  // Painel lateral
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRotation, setSelectedRotation] = useState<any>(null);

  // Edição de preceptor inline
  const [editingPreceptor, setEditingPreceptor] = useState(false);
  const [preceptorInput, setPreceptorInput] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Buscar rodízios do mês
  const { data: rotations, isLoading: loadingRotations, refetch: refetchRotations } = trpc.rotations.getByDateRange.useQuery({
    dataInicio: monthStart,
    dataFim: monthEnd,
  });

  // Buscar residentes para filtro
  const { data: residents } = trpc.residents.list.useQuery();

  // Buscar estágios para filtro
  const { data: stages } = trpc.stages.list.useQuery({ activeOnly: true });

  // Mutation para atualizar preceptor
  const updateRotationMutation = trpc.rotations.update.useMutation({
    onSuccess: () => {
      toast.success("Preceptor atualizado com sucesso!");
      setEditingPreceptor(false);
      refetchRotations();
      // Atualizar o rodízio selecionado localmente
      if (selectedRotation) {
        setSelectedRotation({ ...selectedRotation, preceptor: preceptorInput || null });
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar preceptor.");
    },
  });

  // Gerar dias do mês com padding para alinhar ao domingo
  const daysInMonth = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfWeek = getDay(monthStart);
    const paddedDays: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedDays.push(null);
    }
    return [...paddedDays, ...days];
  }, [monthStart, monthEnd]);

  // Filtrar estágios por ano de residência
  const filteredStages = useMemo(() => {
    if (!stages) return [];
    if (selectedYear === "all") return stages;
    if (selectedYear === "R1") return stages.filter((s: any) => ["Enfermaria", "CC1", "CC2"].includes(s.nome));
    if (selectedYear === "R2" || selectedYear === "R3") return stages.filter((s: any) => ["Bloco A", "Bloco B", "Bloco C"].includes(s.nome));
    return stages;
  }, [stages, selectedYear]);

  // Filtrar rodízios
  const filteredRotations = useMemo(() => {
    if (!rotations) return [];
    return rotations.filter((rotation: any) => {
      if (selectedResident !== "all") {
        const residentId = parseInt(selectedResident);
        const hasResident = rotation.residents?.some((r: any) => r.id === residentId);
        if (!hasResident) return false;
      }
      if (selectedStage !== "all" && rotation.localEstagio !== selectedStage) return false;
      if (selectedYear !== "all") {
        const isR1Stage = ["Enfermaria", "CC1", "CC2"].includes(rotation.localEstagio);
        const isR2R3Stage = ["Bloco A", "Bloco B", "Bloco C"].includes(rotation.localEstagio);
        if (selectedYear === "R1" && !isR1Stage) return false;
        if ((selectedYear === "R2" || selectedYear === "R3") && !isR2R3Stage) return false;
      }
      return true;
    });
  }, [rotations, selectedStage, selectedYear, selectedResident]);

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Abrir painel lateral ao clicar num rodízio
  const openRotationSheet = (rotation: any, day?: Date) => {
    setSelectedRotation(rotation);
    setSelectedDay(day ?? null);
    setPreceptorInput(rotation.preceptor ?? "");
    setEditingPreceptor(false);
    setSheetOpen(true);
  };

  // Abrir painel lateral ao clicar num dia (mostra todos os rodízios do dia)
  const openDaySheet = (day: Date, dayRotations: any[]) => {
    if (dayRotations.length === 1) {
      openRotationSheet(dayRotations[0], day);
    } else if (dayRotations.length > 1) {
      setSelectedDay(day);
      setSelectedRotation(null);
      setSheetOpen(true);
    }
  };

  const goToWeeklySchedule = (stage: string) => {
    const bloco = getBlocoFilter(stage);
    navigate(`/calendario-semanal?bloco=${bloco}`);
  };

  const handleSavePreceptor = () => {
    if (!selectedRotation) return;
    updateRotationMutation.mutate({
      id: selectedRotation.id,
      preceptor: preceptorInput || undefined,
    });
  };

  // Rodízios do dia selecionado (quando há múltiplos)
  const dayRotationsForSheet = useMemo(() => {
    if (!selectedDay || !filteredRotations) return [];
    return filteredRotations.filter((rotation: any) => {
      const rotationStart = new Date(rotation.dataInicio);
      const rotationEnd = new Date(rotation.dataFim);
      return selectedDay >= rotationStart && selectedDay <= rotationEnd;
    });
  }, [selectedDay, filteredRotations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendário Mensal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
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
              <Label className="mb-2 block">Ano de Residência</Label>
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
              <Label className="mb-2 block">Estágio/Local</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filteredStages?.map((stage: any) => (
                    <SelectItem key={stage.id} value={stage.nome}>
                      {stage.nome} {stage.descricao ? `- ${stage.descricao}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Residente</Label>
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
                    } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""} ${
                      dayRotations.length > 0 ? "cursor-pointer hover:bg-muted/30" : ""
                    }`}
                    onClick={() => dayRotations.length > 0 && openDaySheet(day, dayRotations)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayRotations.slice(0, 3).map((rotation: any) => (
                        <button
                          key={rotation.id}
                          onClick={(e) => { e.stopPropagation(); openRotationSheet(rotation, day); }}
                          className={`text-xs w-full text-left px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${getStageColor(rotation.localEstagio)}`}
                        >
                          <div className="font-medium truncate">
                            {rotation.stage?.descricao ? `${rotation.localEstagio} - ${rotation.stage.descricao}` : rotation.localEstagio}
                          </div>
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
            {filteredRotations.length} rodízio(s) encontrado(s) — Clique para ver detalhes
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
                  onClick={() => openRotationSheet(rotation)}
                  className={`flex flex-col p-4 border rounded-lg transition-all cursor-pointer text-left ${getStageColor(rotation.localEstagio)}`}
                >
                  <div className="font-semibold text-lg mb-2">
                    {rotation.stage?.descricao ? `${rotation.localEstagio} - ${rotation.stage.descricao}` : rotation.localEstagio}
                  </div>
                  <div className="text-sm flex items-center gap-1 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(rotation.dataInicio), "dd/MM", { locale: ptBR })} —{" "}
                    {format(new Date(rotation.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  {rotation.preceptor && (
                    <div className="text-sm flex items-center gap-1 mb-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      {rotation.preceptor}
                    </div>
                  )}
                  {rotation.residents && rotation.residents.length > 0 && (
                    <div className="text-sm flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {rotation.residents.map((r: any) => r.nomeCompleto).join(" + ")}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legenda de Cores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Legenda de Cores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Bloco A", color: "bg-blue-100 border-blue-300" },
              { label: "Bloco B", color: "bg-green-100 border-green-300" },
              { label: "Bloco C", color: "bg-purple-100 border-purple-300" },
              { label: "Enfermaria", color: "bg-cyan-100 border-cyan-300" },
              { label: "CC1", color: "bg-orange-100 border-orange-300" },
              { label: "CC2", color: "bg-rose-100 border-rose-300" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${color}`} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Painel Lateral de Detalhes */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {/* Múltiplos rodízios no dia */}
          {selectedDay && !selectedRotation && dayRotationsForSheet.length > 1 && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </SheetTitle>
                <SheetDescription>
                  {dayRotationsForSheet.length} rodízios neste dia
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-3">
                {dayRotationsForSheet.map((rotation: any) => (
                  <button
                    key={rotation.id}
                    onClick={() => { setSelectedRotation(rotation); setPreceptorInput(rotation.preceptor ?? ""); setEditingPreceptor(false); }}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${getStageColor(rotation.localEstagio)}`}
                  >
                    <p className="font-semibold">{rotation.stage?.descricao ? `${rotation.localEstagio} - ${rotation.stage.descricao}` : rotation.localEstagio}</p>
                    {rotation.preceptor && (
                      <p className="text-sm mt-1 flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" />{rotation.preceptor}</p>
                    )}
                    {rotation.residents && rotation.residents.length > 0 && (
                      <p className="text-sm mt-1 flex items-center gap-1"><Users className="h-3.5 w-3.5" />{rotation.residents.map((r: any) => r.nomeCompleto).join(", ")}</p>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Detalhes de um rodízio específico */}
          {selectedRotation && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-sm px-3 py-1 font-semibold ${getStageBadgeColor(selectedRotation.localEstagio)}`}>
                    {selectedRotation.localEstagio}
                  </Badge>
                  {selectedRotation.stage?.descricao && (
                    <span className="text-sm text-muted-foreground">{selectedRotation.stage.descricao}</span>
                  )}
                </div>
                <SheetTitle className="text-lg mt-2">
                  {selectedDay
                    ? format(selectedDay, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : "Detalhes do Rodízio"}
                </SheetTitle>
                <SheetDescription>
                  Informações completas do estágio
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5">
                {/* Período */}
                <div className="rounded-lg border p-4 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Período</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(selectedRotation.dataInicio), "dd 'de' MMMM", { locale: ptBR })}
                    {" — "}
                    {format(new Date(selectedRotation.dataFim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>

                {/* Preceptor */}
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" />
                      Preceptor Responsável
                    </p>
                    {isAdmin && !editingPreceptor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingPreceptor(true)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                  {editingPreceptor ? (
                    <div className="flex gap-2">
                      <Input
                        value={preceptorInput}
                        onChange={(e) => setPreceptorInput(e.target.value)}
                        placeholder="Nome do preceptor..."
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePreceptor();
                          if (e.key === "Escape") setEditingPreceptor(false);
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-8 px-2"
                        onClick={handleSavePreceptor}
                        disabled={updateRotationMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => { setEditingPreceptor(false); setPreceptorInput(selectedRotation.preceptor ?? ""); }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <p className={`text-sm font-medium ${selectedRotation.preceptor ? "" : "text-muted-foreground italic"}`}>
                      {selectedRotation.preceptor || (isAdmin ? "Nenhum preceptor definido — clique em Editar" : "Não informado")}
                    </p>
                  )}
                </div>

                {/* Residentes */}
                {selectedRotation.residents && selectedRotation.residents.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Residentes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRotation.residents.map((r: any) => (
                        <Badge key={r.id} variant="secondary" className="text-sm">
                          {r.nomeCompleto}
                          {r.anoResidencia && <span className="ml-1 opacity-60">({r.anoResidencia})</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assignments com papel na dupla */}
                {selectedRotation.assignments && selectedRotation.assignments.length > 0 && (
                  <div className="rounded-lg border p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dupla / Papel</p>
                    <div className="space-y-1">
                      {selectedRotation.assignments.map((a: any) => (
                        <div key={a.assignment?.id ?? a.id} className="flex items-center justify-between text-sm">
                          <span>{a.resident?.nomeCompleto || "Residente"}</span>
                          {(a.assignment?.papelNaDupla || a.papelNaDupla) && (
                            <Badge variant="outline" className="text-xs">
                              {a.assignment?.papelNaDupla || a.papelNaDupla}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descrição */}
                {selectedRotation.descricao && (
                  <div className="rounded-lg border p-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição</p>
                    <p className="text-sm">{selectedRotation.descricao}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="pt-2 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSheetOpen(false);
                      goToWeeklySchedule(selectedRotation.localEstagio);
                    }}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Ver Escala Semanal Completa
                  </Button>
                  {selectedDay && dayRotationsForSheet.length > 1 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedRotation(null)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Ver todos os rodízios do dia
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
