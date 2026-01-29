import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarioMensal() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedResident, setSelectedResident] = useState<string>("all");

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

  // Gerar dias do mês
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  // Filtrar rodízios
  const filteredRotations = useMemo(() => {
    if (!rotations) return [];

    return rotations.filter((rotation: any) => {
      if (selectedStage !== "all" && rotation.localEstagio !== selectedStage) return false;
      // TODO: Adicionar filtro por residente quando tivermos assignments
      return true;
    });
  }, [rotations, selectedStage]);

  // Navegar entre meses
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

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
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine a visualização dos rodízios</CardDescription>
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
                  <SelectItem value="R1">R1</SelectItem>
                  <SelectItem value="R2">R2</SelectItem>
                  <SelectItem value="R3">R3</SelectItem>
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
            <CardTitle className="text-2xl">
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
            <div className="grid grid-cols-7 gap-2">
              {/* Cabeçalho dos dias da semana */}
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {/* Dias do mês */}
              {daysInMonth.map((day) => {
                const dayRotations = filteredRotations.filter((rotation: any) => {
                  const rotationStart = new Date(rotation.dataInicio);
                  const rotationEnd = new Date(rotation.dataFim);
                  return day >= rotationStart && day <= rotationEnd;
                });

                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-2 border rounded-lg ${
                      isToday ? "border-primary bg-primary/5" : "border-border"
                    } ${!isSameMonth(day, currentDate) ? "opacity-50" : ""}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayRotations.slice(0, 2).map((rotation: any) => (
                        <Badge
                          key={rotation.id}
                          variant="secondary"
                          className="text-xs truncate w-full justify-start"
                        >
                          {rotation.localEstagio}
                        </Badge>
                      ))}
                      {dayRotations.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayRotations.length - 2} mais
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
            {filteredRotations.length} rodízio(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum rodízio encontrado para este mês
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRotations.map((rotation: any) => (
                <div
                  key={rotation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{rotation.localEstagio}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(rotation.dataInicio), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                      {format(new Date(rotation.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    {rotation.descricao && (
                      <div className="text-sm text-muted-foreground">{rotation.descricao}</div>
                    )}
                  </div>
                  <Badge>{rotation.mesReferencia}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
