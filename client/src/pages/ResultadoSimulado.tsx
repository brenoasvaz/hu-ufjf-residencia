import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2, XCircle, Clock, TrendingUp, Home, BarChart3,
  BookOpen, AlertTriangle, ChevronDown, ChevronUp, Eye, EyeOff
} from "lucide-react";
import { useRoute, Link } from "wouter";
import { useState } from "react";

// ─── Sub-componente: card de questão com gabarito ─────────────────────────────
function QuestaoGabaritoCard({ questao, index }: { questao: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const letraCorreta = questao.alternativas.find((a: any) => a.correta)?.letra;
  const acertou = questao.acertou;

  return (
    <Card className={`border-l-4 ${acertou ? "border-l-green-500" : "border-l-red-500"}`}>
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 mt-0.5 ${acertou ? "text-green-600" : "text-red-600"}`}>
              {acertou ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-muted-foreground">Q{questao.numero}</span>
                <Badge variant="outline" className="text-xs">{questao.especialidade}</Badge>
                {!acertou && letraCorreta && (
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                    Correta: {letraCorreta}
                  </Badge>
                )}
                {questao.respostaUsuario && !acertou && (
                  <Badge variant="destructive" className="text-xs">
                    Sua resposta: {questao.respostaUsuario}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-foreground line-clamp-2">{questao.enunciado}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pb-4">
          {questao.imageUrl && (
            <img
              src={questao.imageUrl}
              alt="Imagem da questão"
              className="max-w-full rounded-md mb-4 border"
            />
          )}
          <div className="space-y-2">
            {questao.alternativas.map((alt: any) => {
              const isCorreta = alt.correta;
              const isEscolhida = alt.letra === questao.respostaUsuario;
              let cls = "flex items-start gap-2 p-2 rounded-md text-sm border ";
              if (isCorreta) cls += "bg-green-50 border-green-300 text-green-900 font-medium";
              else if (isEscolhida && !acertou) cls += "bg-red-50 border-red-300 text-red-900";
              else cls += "bg-muted/30 border-transparent text-muted-foreground";

              return (
                <div key={alt.id} className={cls}>
                  <span className="font-bold w-5 flex-shrink-0">{alt.letra}.</span>
                  <span className="flex-1">{alt.texto}</span>
                  {isCorreta && <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />}
                  {isEscolhida && !isCorreta && <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ResultadoSimulado() {
  const { user } = useAuth();
  const [, params] = useRoute("/avaliacoes/:id/resultado");
  const simuladoId = params?.id ? parseInt(params.id) : null;

  // Estado do gabarito
  const [gabarito, setGabarito] = useState<any>(null);
  const [gabaritoJaVisto, setGabaritoJaVisto] = useState(false);
  const [gabaritoError, setGabaritoError] = useState<string | null>(null);
  const [showGabarito, setShowGabarito] = useState(false);

  const { data: simulado, isLoading: loadingSimulado } = trpc.avaliacoes.simulados.get.useQuery(
    { simuladoId: simuladoId! },
    { enabled: !!simuladoId }
  );

  const getGabaritoMutation = trpc.avaliacoes.simulados.getGabarito.useMutation({
    onSuccess: (data) => {
      setGabarito(data);
      setShowGabarito(true);
      setGabaritoError(null);
    },
    onError: (err) => {
      if (err.message.includes("já foi visualizado")) {
        setGabaritoJaVisto(true);
      }
      setGabaritoError(err.message);
    },
  });

  const handleVerGabarito = () => {
    if (!simuladoId) return;
    getGabaritoMutation.mutate({ simuladoId });
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

  if (!simuladoId) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Avaliação não encontrada</CardTitle>
            <CardDescription>ID da avaliação inválido.</CardDescription>
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
            <CardTitle>Avaliação não encontrada</CardTitle>
            <CardDescription>Não foi possível carregar os dados desta avaliação.</CardDescription>
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
            <CardTitle>Avaliação não concluída</CardTitle>
            <CardDescription>Esta avaliação ainda não foi finalizada.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/avaliacoes/${simuladoId}`}>
              <Button>Continuar Avaliação</Button>
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

  // Verificar se gabarito já foi visualizado (campo do simulado)
  const gabaritoJaVisualizadoNoBanco = (simulado as any).gabaritoVisualizado === 1;
  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {(simulado as any).modeloNome ? `Resultado — ${(simulado as any).modeloNome}` : 'Resultado da Avaliação'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Concluída em {new Date(simulado.dataFim!).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>

      {/* Score Principal */}
      <Card className={scoreBgColor}>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className={`text-7xl font-bold ${scoreColor}`}>{score}%</div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{scoreMessage}</p>
              <p className="text-muted-foreground">
                {simulado.totalAcertos} acertos de {simulado.totalQuestoes} questões
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
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
              <p className="text-xs text-muted-foreground">de {simulado.duracaoMinutos} min disponíveis</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Seção Gabarito ── */}
      {!showGabarito && (
        <Card className={
          gabaritoJaVisualizadoNoBanco && !isAdmin
            ? "bg-muted/40 border-dashed"
            : "bg-blue-50 border-blue-200"
        }>
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                {gabaritoJaVisualizadoNoBanco && !isAdmin ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                ) : (
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  {gabaritoJaVisualizadoNoBanco && !isAdmin ? (
                    <>
                      <p className="text-sm font-medium text-muted-foreground">Gabarito já visualizado</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        O gabarito desta avaliação só pode ser acessado uma vez após a submissão.
                        O acesso já foi utilizado.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-blue-900">Gabarito disponível</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {isAdmin
                          ? "Como administrador, você pode visualizar o gabarito a qualquer momento."
                          : "Você pode visualizar o gabarito uma única vez. Após abrir, não será possível acessá-lo novamente."
                        }
                      </p>
                    </>
                  )}
                  {gabaritoError && !gabaritoJaVisto && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {gabaritoError}
                    </p>
                  )}
                </div>
              </div>
              {(!gabaritoJaVisualizadoNoBanco || isAdmin) && (
                <Button
                  onClick={handleVerGabarito}
                  disabled={getGabaritoMutation.isPending}
                  variant={gabaritoJaVisualizadoNoBanco && !isAdmin ? "outline" : "default"}
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {getGabaritoMutation.isPending ? "Carregando..." : "Ver Gabarito"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Lista de questões com gabarito ── */}
      {showGabarito && gabarito && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Gabarito Detalhado
            </h2>
            <Badge variant="outline" className="text-xs">
              {gabarito.questoes.filter((q: any) => q.acertou).length} / {gabarito.questoes.length} corretas
            </Badge>
          </div>

          {/* Aviso de acesso único (exibido após abrir) */}
          {!isAdmin && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Este é seu único acesso ao gabarito. Guarde as informações que precisar antes de sair da página.</span>
            </div>
          )}

          {gabarito.questoes.map((questao: any) => (
            <QuestaoGabaritoCard key={questao.numero} questao={questao} index={questao.numero} />
          ))}
        </div>
      )}

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

      {/* Próximos Passos */}
      {!showGabarito && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Revise os conceitos", desc: "Identifique os temas das questões que você errou e revise o conteúdo teórico." },
              { title: "Pratique regularmente", desc: "Faça novos simulados periodicamente para consolidar o aprendizado." },
              { title: "Acompanhe sua evolução", desc: "Use o dashboard para visualizar seu progresso ao longo do tempo." },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
