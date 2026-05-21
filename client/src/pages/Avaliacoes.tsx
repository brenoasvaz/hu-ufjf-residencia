import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  ClipboardCheck,
  Clock,
  FileText,
  TrendingUp,
  Lock,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Avaliacoes() {
  const { user } = useAuth();
  const [generatingExamId, setGeneratingExamId] = useState<number | null>(null);

  const { data: templates, isLoading: loadingTemplates } = trpc.avaliacoes.modelos.list.useQuery();
  const { data: myExams, isLoading: loadingExams, refetch: refetchExams } = trpc.avaliacoes.simulados.list.useQuery();
  const generateExamMutation = trpc.avaliacoes.simulados.gerar.useMutation();

  const handleGenerateExam = async (templateId: number) => {
    if (!user) return;
    setGeneratingExamId(templateId);
    try {
      const result = await generateExamMutation.mutateAsync({ modeloId: templateId });
      toast.success("Avaliação gerada com sucesso!");
      await refetchExams();
      window.location.href = `/avaliacoes/${result.simuladoId}`;
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar avaliação");
    } finally {
      setGeneratingExamId(null);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const concluidos = myExams?.filter((e: any) => e.concluido === 1) ?? [];
  const emAndamento = myExams?.filter((e: any) => e.concluido === 0) ?? [];
  const mediaGeral = concluidos.length > 0
    ? Math.round(
        concluidos
          .filter((e: any) => e.totalAcertos !== null)
          .reduce((sum: number, e: any) => sum + ((e.totalAcertos / e.totalQuestoes) * 100), 0) /
        concluidos.filter((e: any) => e.totalAcertos !== null).length
      )
    : null;

  // Modelos já realizados pelo usuário
  const modelosJaRealizados = new Set(myExams?.map((e: any) => e.modeloId) ?? []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          Realize as avaliações liberadas e acompanhe seu desempenho
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Realizadas</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{concluidos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {emAndamento.length > 0 ? `${emAndamento.length} em andamento` : "Nenhuma em andamento"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emAndamento.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {emAndamento.length > 0 ? "Clique para continuar" : "Nenhuma pendente"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaGeral !== null ? `${mediaGeral}%` : "—"}</div>
            {mediaGeral !== null && (
              <Progress value={mediaGeral} className="mt-2 h-1.5" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Dashboard de Desempenho</CardTitle>
              <CardDescription>
                Visualize sua evolução temporal e desempenho por especialidade
              </CardDescription>
            </div>
            <Link href="/avaliacoes/dashboard">
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Dashboard
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Available Templates */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Avaliações Disponíveis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um modelo para iniciar uma nova avaliação
          </p>
        </div>

        {loadingTemplates ? (
          <div className="text-center py-8 text-muted-foreground">Carregando avaliações...</div>
        ) : templates && templates.filter((t: any) => t.status === 'liberado').length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {templates
              .filter((t: any) => t.status === 'liberado')
              .map((template: any) => {
                const jaRealizado = modelosJaRealizados.has(template.id);
                const totalQuestoes = Object.values(JSON.parse(template.configuracao || '{}')).reduce(
                  (sum: number, val: any) => sum + val, 0
                ) as number;
                return (
                  <Card key={template.id} className={`transition-colors ${jaRealizado ? 'opacity-70' : 'hover:border-primary/50'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileText className="h-5 w-5 shrink-0" />
                          {template.nome}
                        </CardTitle>
                        {jaRealizado && (
                          <Badge variant="outline" className="shrink-0 text-xs bg-green-50 text-green-700 border-green-300">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Realizada
                          </Badge>
                        )}
                      </div>
                      {template.descricao && (
                        <CardDescription>{template.descricao}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p><span className="font-medium text-foreground">Questões:</span> {totalQuestoes}</p>
                        {template.duracaoMinutos && (
                          <p><span className="font-medium text-foreground">Tempo limite:</span> {template.duracaoMinutos} minutos</p>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        variant={jaRealizado ? "outline" : "default"}
                        onClick={() => handleGenerateExam(template.id)}
                        disabled={generatingExamId === template.id}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        {generatingExamId === template.id
                          ? "Gerando..."
                          : jaRealizado
                          ? "Realizar Novamente"
                          : "Iniciar Avaliação"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhuma avaliação disponível no momento</p>
              <p className="text-sm text-muted-foreground mt-1">
                Aguarde a liberação pelo preceptor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* My Exams History */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Histórico de Avaliações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Todas as avaliações realizadas e em andamento
          </p>
        </div>

        {loadingExams ? (
          <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
        ) : myExams && myExams.length > 0 ? (
          <div className="space-y-3">
            {myExams.map((exam: any) => {
              const percentual = exam.concluido === 1 && exam.totalQuestoes > 0
                ? Math.round((exam.totalAcertos / exam.totalQuestoes) * 100)
                : null;
              const aprovado = percentual !== null && percentual >= 70;
              const gabaritoDisponivel = exam.concluido === 1 && exam.gabaritoVisualizado === 0;
              const gabaritoJaVisto = exam.concluido === 1 && exam.gabaritoVisualizado === 1;

              return (
                <Card key={exam.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">
                            {exam.modeloNome ?? `Avaliação #${exam.id}`}
                          </p>
                        </div>
                        {user?.name && (
                          <p className="text-xs text-muted-foreground -mt-1">
                            {user.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {exam.concluido === 1 ? (
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${
                                aprovado
                                  ? "bg-green-50 text-green-700 border-green-300"
                                  : "bg-red-50 text-red-700 border-red-300"
                              }`}
                            >
                              {aprovado ? "Aprovado" : "Reprovado"} • {percentual}%
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs shrink-0 bg-amber-50 text-amber-700 border-amber-300">
                              <Clock className="mr-1 h-3 w-3" />
                              Em andamento
                            </Badge>
                          )}
                          {gabaritoDisponivel && (
                            <Badge variant="outline" className="text-xs shrink-0 bg-blue-50 text-blue-700 border-blue-300 animate-pulse">
                              <BookOpen className="mr-1 h-3 w-3" />
                              Gabarito disponível
                            </Badge>
                          )}
                          {gabaritoJaVisto && (
                            <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                              <EyeOff className="mr-1 h-3 w-3" />
                              Gabarito visualizado
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>
                            {new Date(exam.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {exam.concluido === 1 && (
                            <span>
                              {exam.totalAcertos}/{exam.totalQuestoes} acertos
                            </span>
                          )}
                        </div>

                        {percentual !== null && (
                          <Progress
                            value={percentual}
                            className={`h-1.5 w-full max-w-xs ${aprovado ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
                          />
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {exam.concluido === 1 ? (
                          <>
                            <Link href={`/avaliacoes/${exam.id}/resultado`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-1 h-3 w-3" />
                                Resultado
                              </Button>
                            </Link>
                            {gabaritoDisponivel && (
                              <Link href={`/avaliacoes/${exam.id}/resultado?gabarito=1`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  Ver Gabarito
                                </Button>
                              </Link>
                            )}
                          </>
                        ) : (
                          <Link href={`/avaliacoes/${exam.id}`}>
                            <Button size="sm">
                              <PlayCircle className="mr-1 h-3 w-3" />
                              Continuar
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhuma avaliação realizada ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione um modelo acima para começar!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
