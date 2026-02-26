import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Target, Award, ClipboardCheck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";

export default function DashboardAvaliacoes() {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = trpc.avaliacoes.dashboard.stats.useQuery();
  const { data: simulados, isLoading: loadingSimulados } = trpc.avaliacoes.simulados.list.useQuery();

  // Calcular evolução temporal
  const evolutionData = useMemo(() => {
    if (!simulados) return [];
    
    const concluidos = simulados
      .filter((s: any) => s.concluido === 1)
      .sort((a: any, b: any) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime());
    
    return concluidos.map((s: any, index: number) => ({
      simulado: index + 1,
      score: Math.round((s.totalAcertos / s.totalQuestoes) * 100),
      data: new Date(s.dataFim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));
  }, [simulados]);

  // Calcular tendência (últimos 3 vs primeiros 3)
  const trend = useMemo(() => {
    if (evolutionData.length < 2) return null;
    
    const recent = evolutionData.slice(-3);
    const old = evolutionData.slice(0, 3);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length;
    const oldAvg = old.reduce((sum, d) => sum + d.score, 0) / old.length;
    
    return recentAvg - oldAvg;
  }, [evolutionData]);

  if (!user) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loadingStats || loadingSimulados) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Desempenho</h1>
          <p className="text-muted-foreground">
            Acompanhe sua evolução e estatísticas de desempenho
          </p>
        </div>
        <Link href="/avaliacoes">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Estatísticas Principais */}
      {stats && stats.totalSimulados > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSimulados}</div>
                <p className="text-xs text-muted-foreground">Avaliações concluídas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mediaAcertos}%</div>
                <p className="text-xs text-muted-foreground">Desempenho médio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Resultado</CardTitle>
                <Award className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.melhorDesempenho}%</div>
                <p className="text-xs text-muted-foreground">Maior pontuação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pior Resultado</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.piorDesempenho}%</div>
                <p className="text-xs text-muted-foreground">Menor pontuação</p>
              </CardContent>
            </Card>
          </div>

          {/* Tendência */}
          {trend !== null && (
            <Card className={trend >= 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
              <CardContent className="py-4 flex items-center gap-3">
                {trend >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-amber-600" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${trend >= 0 ? "text-green-900" : "text-amber-900"}`}>
                    {trend >= 0 ? "Tendência de Melhora" : "Atenção: Desempenho Oscilante"}
                  </p>
                  <p className={`text-xs mt-1 ${trend >= 0 ? "text-green-700" : "text-amber-700"}`}>
                    {trend >= 0
                      ? `Seu desempenho melhorou ${Math.abs(trend).toFixed(1)}% nas últimas avaliações. Continue assim!`
                      : `Seu desempenho variou ${Math.abs(trend).toFixed(1)}% recentemente. Revise os conceitos e pratique mais.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Evolução Temporal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Temporal</CardTitle>
              <CardDescription>Desempenho ao longo das avaliações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionData.length > 0 ? (
                <div className="space-y-4">
                  {/* Gráfico de barras simples */}
                  <div className="h-64 flex items-end justify-between gap-2">
                    {evolutionData.map((point, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                          <div
                            className={`w-full rounded-t transition-all ${
                              point.score >= 70
                                ? 'bg-green-500'
                                : point.score >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ height: `${(point.score / 100) * 200}px` }}
                            title={`${point.score}%`}
                          >
                            <div className="text-xs font-bold text-white text-center pt-2">
                              {point.score}%
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          <div className="font-medium">#{point.simulado}</div>
                          <div>{point.data}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legenda */}
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-green-500" />
                      <span className="text-muted-foreground">≥ 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-amber-500" />
                      <span className="text-muted-foreground">50-69%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-red-500" />
                      <span className="text-muted-foreground">{'< 50%'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum simulado concluído ainda.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico Detalhado</CardTitle>
              <CardDescription>Todas as avaliações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {simulados
                  ?.filter((s: any) => s.concluido === 1)
                  .sort((a: any, b: any) => new Date(b.dataFim).getTime() - new Date(a.dataFim).getTime())
                  .map((simulado: any, index: number) => {
                    const score = Math.round((simulado.totalAcertos / simulado.totalQuestoes) * 100);
                    return (
                      <div
                        key={simulado.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-muted-foreground">#{index + 1}</div>
                            <div className="text-lg font-bold">{score}%</div>
                          </div>
                          <div>
                            <p className="font-medium">Avaliação #{simulado.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(simulado.dataFim).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {simulado.totalAcertos} / {simulado.totalQuestoes}
                            </p>
                            <p className="text-xs text-muted-foreground">acertos</p>
                          </div>
                          <Link href={`/avaliacoes/${simulado.id}/resultado`}>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <ClipboardCheck className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Nenhuma avaliação realizada ainda</p>
              <p className="text-sm text-muted-foreground">
                Comece fazendo sua primeira avaliação para ver suas estatísticas aqui.
              </p>
            </div>
            <Link href="/avaliacoes">
              <Button>
                Fazer Primeira Avaliação
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
