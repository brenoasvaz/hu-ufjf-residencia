import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, BookOpen, FileText, GraduationCap, AlertCircle } from "lucide-react";

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const MEETING_TYPE_COLORS: Record<string, string> = {
  AULA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ARTIGO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CASOS_CLINICOS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PROVA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  AVALIACAO: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  EVENTO: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  FERIADO: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  RECESSO: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
};

const MEETING_TYPE_LABELS: Record<string, string> = {
  AULA: "Aula",
  ARTIGO: "Artigo da Semana",
  CASOS_CLINICOS: "Casos Clínicos",
  PROVA: "Prova",
  AVALIACAO: "Avaliação",
  EVENTO: "Evento",
  FERIADO: "Feriado",
  RECESSO: "Recesso",
};

const MEETING_TYPE_ICONS: Record<string, React.ReactNode> = {
  AULA: <GraduationCap className="h-4 w-4" />,
  ARTIGO: <FileText className="h-4 w-4" />,
  CASOS_CLINICOS: <BookOpen className="h-4 w-4" />,
  PROVA: <AlertCircle className="h-4 w-4" />,
  AVALIACAO: <AlertCircle className="h-4 w-4" />,
  EVENTO: <Calendar className="h-4 w-4" />,
  FERIADO: <Calendar className="h-4 w-4" />,
  RECESSO: <Calendar className="h-4 w-4" />,
};

export default function ClinicalMeetings() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const { data: meetings, isLoading: meetingsLoading } = trpc.clinicalMeetings.list.useQuery({
    year: selectedYear,
    month: selectedMonth,
  });

  const { data: guidelines, isLoading: guidelinesLoading } = trpc.presentationGuidelines.list.useQuery();

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    if (!meetings) return {};
    
    const grouped: Record<string, typeof meetings> = {};
    meetings.forEach((meeting) => {
      const dateKey = new Date(meeting.data).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meeting);
    });
    return grouped;
  }, [meetings]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  const years = [2025, 2026, 2027];

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reuniões Clínicas</h1>
          <p className="text-muted-foreground">
            Programação científica semanal do Serviço de Ortopedia e Traumatologia
          </p>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Programação</TabsTrigger>
          <TabsTrigger value="guidelines">Orientações</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Ano</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Mês</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meetings List */}
          {meetingsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(meetingsByDate).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma reunião encontrada</h3>
                <p className="text-muted-foreground">
                  Não há reuniões clínicas programadas para {MONTHS.find(m => m.value === selectedMonth)?.label} de {selectedYear}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(meetingsByDate)
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([dateKey, dateMeetings]) => (
                  <Card key={dateKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {formatDate(dateKey)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dateMeetings.map((meeting) => (
                          <div
                            key={meeting.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className={MEETING_TYPE_COLORS[meeting.tipo]}>
                                <span className="flex items-center gap-1">
                                  {MEETING_TYPE_ICONS[meeting.tipo]}
                                  {MEETING_TYPE_LABELS[meeting.tipo]}
                                </span>
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{meeting.tema}</p>
                              {meeting.observacao && (
                                <p className="text-sm text-muted-foreground">{meeting.observacao}</p>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                              {meeting.residenteApresentador && (
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {meeting.residenteApresentador}
                                </span>
                              )}
                              {meeting.preceptor && (
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  {meeting.preceptor}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-4">
          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-sm text-muted-foreground">Auditório 2º andar, HU Dom Bosco</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-sm text-muted-foreground">Quintas-feiras, 07:15h</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4">
                A programação a seguir poderá sofrer alterações de acordo com as necessidades do serviço e andamento das atividades didático-científicas.
              </p>
            </CardContent>
          </Card>

          {/* Presentation Types */}
          {guidelinesLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Aulas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    A - Aulas
                  </CardTitle>
                  <CardDescription>
                    Apresentadas por preceptores ou convidados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      As aulas poderão ser interativas, baseadas na literatura da CET para o TEOT
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Ao final o apresentador poderá conduzir uma discussão pertinente ao tema exposto
                    </li>
                  </ul>
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Tempo máximo:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      30' de aula + 10' discussão
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Artigo da Semana */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    B - Artigo da Semana
                  </CardTitle>
                  <CardDescription>
                    Apresentadas pelos residentes do 2º ano
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      O artigo idealmente deverá ser fornecido à equipe previamente para possibilitar a leitura e avaliação
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Ao final, será realizada discussão do artigo e do tema pelo corpo de preceptores
                    </li>
                  </ul>
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Tempo máximo:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      10' apresentação + 5' comentários e críticas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Casos Clínicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    C - Casos Clínicos
                  </CardTitle>
                  <CardDescription>
                    Apresentação dos casos internados na semana
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      O residente R1 designado será responsável pela apresentação
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Até julho, o R2 deverá auxiliar o R1 na organização
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Após, um R3 será definido para arguição sobre um caso
                    </li>
                  </ul>
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Tempo máximo:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      20' apresentação dos casos + 10' arguição
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Evaluations Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Provas dos Módulos</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Avaliações teóricas quadrimestrais</li>
                    <li>• 50 questões de múltipla escolha</li>
                    <li>• Temas baseados no cronograma da SBOT MG</li>
                  </ul>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Módulos:</p>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1">
                      <li>Joelho, Pé e Tornozelo</li>
                      <li>Pediátrica, Ombro, Mão e Tumor</li>
                      <li>Coluna e Quadril, Ciência Básica</li>
                    </ol>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Avaliação de Dezembro</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Simulado nos moldes do TEOT</li>
                    <li>• Avaliação oral envolvendo casos clínicos</li>
                    <li>• Estações práticas para avaliação de habilidades e exame físico</li>
                  </ul>
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Avaliações de Competências:</p>
                    <ul className="text-sm text-muted-foreground mt-1">
                      <li>• Avaliação prática (cirurgia, clínica)</li>
                      <li>• Avaliação de atitudes e auto-avaliação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
