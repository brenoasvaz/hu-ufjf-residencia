import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExecucaoSimulado() {
  const { user } = useAuth();
  const [, params] = useRoute("/avaliacoes/:id");
  const [, setLocation] = useLocation();
  const simuladoId = params?.id ? parseInt(params.id) : null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: simulado, isLoading: loadingSimulado } = trpc.avaliacoes.simulados.get.useQuery(
    { simuladoId: simuladoId! },
    { enabled: !!simuladoId }
  );

  const { data: questoes, isLoading: loadingQuestoes } = trpc.avaliacoes.simulados.getQuestoes.useQuery(
    { simuladoId: simuladoId! },
    { enabled: !!simuladoId }
  );

  const submitMutation = trpc.avaliacoes.simulados.submeter.useMutation();

  // Inicializar cronômetro
  useEffect(() => {
    if (simulado && simulado.duracaoMinutos && simulado.concluido === 0) {
      const startTime = new Date(simulado.dataInicio).getTime();
      const durationMs = simulado.duracaoMinutos * 60 * 1000;
      const endTime = startTime + durationMs;
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleAutoSubmit();
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [simulado]);

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    toast.warning("Tempo esgotado! Enviando respostas...");
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!simuladoId || !questoes || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const respostas = questoes.map((q: any) => ({
        questaoId: q.questaoId,
        alternativaId: answers[q.questaoId] || null,
      }));
      
      await submitMutation.mutateAsync({
        simuladoId,
        respostas,
      });
      
      toast.success("Simulado finalizado com sucesso!");
      setLocation(`/avaliacoes/${simuladoId}/resultado`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao finalizar simulado");
      setIsSubmitting(false);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
            <CardTitle>Simulado não encontrado</CardTitle>
            <CardDescription>ID do simulado inválido.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loadingSimulado || loadingQuestoes) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando simulado...</p>
        </div>
      </div>
    );
  }

  if (!simulado || !questoes || questoes.length === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Simulado não encontrado</CardTitle>
            <CardDescription>Não foi possível carregar as questões deste simulado.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (simulado.concluido === 1) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Simulado já concluído</CardTitle>
            <CardDescription>Este simulado já foi finalizado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation(`/avaliacoes/${simuladoId}/resultado`)}>
              Ver Resultado
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questoes[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questoes.length) * 100;
  const answeredCount = Object.values(answers).filter(a => a !== null).length;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header com Timer e Progresso */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Simulado #{simuladoId}</h2>
              <p className="text-sm text-muted-foreground">
                Questão {currentQuestionIndex + 1} de {questoes.length}
              </p>
            </div>
            
            {timeRemaining !== null && (
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300000 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className={`text-2xl font-mono font-bold ${timeRemaining < 300000 ? 'text-red-500' : ''}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{answeredCount} / {questoes.length} respondidas</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Questão Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-muted-foreground">
            Questão {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{currentQuestion.enunciado}</p>
          </div>

          <RadioGroup
            value={answers[currentQuestion.questaoId]?.toString() || ""}
            onValueChange={(value) => {
              setAnswers({
                ...answers,
                [currentQuestion.questaoId]: parseInt(value),
              });
            }}
          >
            <div className="space-y-3">
              {currentQuestion.alternativas?.map((alt: any) => (
                <div
                  key={alt.id}
                  className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <RadioGroupItem value={alt.id.toString()} id={`alt-${alt.id}`} className="mt-1" />
                  <Label htmlFor={`alt-${alt.id}`} className="flex-1 cursor-pointer leading-relaxed">
                    <span className="font-medium mr-2">{alt.letra})</span>
                    {alt.texto}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === questoes.length - 1 ? (
            <Button
              onClick={() => setShowFinishDialog(true)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Flag className="h-4 w-4" />
              Finalizar Simulado
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(questoes.length - 1, currentQuestionIndex + 1))}
            >
              Próxima
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mapa de Questões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Navegação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questoes.map((q: any, index: number) => {
              const isAnswered = answers[q.questaoId] !== undefined && answers[q.questaoId] !== null;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={q.questaoId}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    aspect-square rounded-md text-sm font-medium transition-colors
                    ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''}
                    ${!isCurrent && isAnswered ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                    ${!isCurrent && !isAnswered ? 'bg-muted text-muted-foreground hover:bg-accent' : ''}
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alerta de questões não respondidas */}
      {answeredCount < questoes.length && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Você ainda tem {questoes.length - answeredCount} questão(ões) não respondida(s)
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Questões não respondidas serão consideradas incorretas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmação */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Simulado?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Você respondeu {answeredCount} de {questoes.length} questões.</p>
              {answeredCount < questoes.length && (
                <p className="text-amber-600 font-medium">
                  Atenção: {questoes.length - answeredCount} questão(ões) não respondida(s) serão consideradas incorretas.
                </p>
              )}
              <p>Deseja realmente finalizar o simulado? Esta ação não pode ser desfeita.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Finalizando..." : "Finalizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
