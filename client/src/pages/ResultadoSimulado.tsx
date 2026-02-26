import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Clock, TrendingUp, Home, BarChart3 } from "lucide-react";
import { useRoute, Link } from "wouter";

export default function ResultadoSimulado() {
  const { user } = useAuth();
  const [, params] = useRoute("/avaliacoes/:id/resultado");
  const simuladoId = params?.id ? parseInt(params.id) : null;

  const { data: simulado, isLoading: loadingSimulado } = trpc.avaliacoes.simulados.get.useQuery(
    { simuladoId: simuladoId! },
    { enabled: !!simuladoId }
  );

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

  if (!simuladoId) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Simulado não encontrado</CardTitle>
            <CardDescription>ID do simulado inválido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loadingSimulado) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (!simulado) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Simulado não encontrado</CardTitle>
            <CardDescription>Não foi possível carregar os dados deste simulado.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (simulado.concluido === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Simulado não concluído</CardTitle>
            <CardDescription>Este simulado ainda não foi finalizado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/avaliacoes/${simuladoId}`}>
              <Button>Continuar Simulado</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = Math.round((simulado.totalAcertos! / simulado.totalQuestoes) * 100);
  const tempoGasto = simulado.dataFim && simulado.dataInicio
    ? Math.round((new Date(simulado.dataFim).getTime() - new Date(simulado.dataInicio).getTime()) / 60000)
    : null;

  // Determinar cor e mensagem baseado no desempenho
  let scoreColor = "text-red-600";
  let scoreMessage = "Continue praticando!";
  let scoreBgColor = "bg-red-50 border-red-200";
  
  if (score >= 70) {
    scoreColor = "text-green-600";
    scoreMessage = "Excelente desempenho!";
    scoreBgColor = "bg-green-50 border-green-200";
  } else if (score >= 50) {
    scoreColor = "text-amber-600";
    scoreMessage = "Bom trabalho, mas há espaço para melhorar!";
    scoreBgColor = "bg-amber-50 border-amber-200";
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Resultado do Simulado</h1>
        <p className="text-muted-foreground">
          Simulado #{simuladoId} • Concluído em {new Date(simulado.dataFim!).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Score Principal */}
      <Card className={scoreBgColor}>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className={`text-7xl font-bold ${scoreColor}`}>
              {score}%
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{scoreMessage}</p>
              <p className="text-muted-foreground">
                {simulado.totalAcertos} acertos de {simulado.totalQuestoes} questões
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questões Corretas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{simulado.totalAcertos}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((simulado.totalAcertos! / simulado.totalQuestoes) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questões Incorretas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {simulado.totalQuestoes - simulado.totalAcertos!}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(((simulado.totalQuestoes - simulado.totalAcertos!) / simulado.totalQuestoes) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        {tempoGasto !== null && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Gasto</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tempoGasto} min</div>
              <p className="text-xs text-muted-foreground">
                de {simulado.duracaoMinutos} min disponíveis
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informação sobre Feedback Restrito */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Feedback Restrito
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Por questões pedagógicas, o gabarito detalhado não é disponibilizado. 
              Foque em estudar os temas das questões que você errou e tente novamente em futuros simulados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/avaliacoes">
          <Button variant="outline" className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Voltar para Avaliações
          </Button>
        </Link>
        
        <Link href="/avaliacoes/dashboard">
          <Button className="w-full sm:w-auto">
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Dashboard de Desempenho
          </Button>
        </Link>
      </div>

      {/* Motivação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Revise os conceitos</p>
              <p className="text-sm text-muted-foreground">
                Identifique os temas das questões que você errou e revise o conteúdo teórico.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Pratique regularmente</p>
              <p className="text-sm text-muted-foreground">
                Faça novos simulados periodicamente para consolidar o aprendizado.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Acompanhe sua evolução</p>
              <p className="text-sm text-muted-foreground">
                Use o dashboard para visualizar seu progresso ao longo do tempo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
