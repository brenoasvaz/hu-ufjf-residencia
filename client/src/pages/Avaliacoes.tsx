import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, Clock, FileText, TrendingUp } from "lucide-react";
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
      toast.success("Simulado gerado com sucesso!");
      await refetchExams();
      window.location.href = `/avaliacoes/${result.simuladoId}`;
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar simulado");
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

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações e Simulados</h1>
        <p className="text-muted-foreground">
          Pratique com questões de Ortopedia e acompanhe seu desempenho
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Simulados Realizados</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myExams?.filter((e: any) => e.concluido === 1).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myExams?.filter((e: any) => e.concluido === 0).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myExams && myExams.filter((e: any) => e.concluido === 1).length > 0
                ? Math.round(
                    myExams
                      .filter((e: any) => e.concluido === 1 && e.totalAcertos !== null)
                      .reduce((sum: number, e: any) => sum + ((e.totalAcertos / e.totalQuestoes) * 100), 0) /
                    myExams.filter((e: any) => e.concluido === 1 && e.totalAcertos !== null).length
                  ) + "%"
                : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
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
          <h2 className="text-2xl font-semibold tracking-tight">Modelos de Prova Disponíveis</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um modelo para gerar um novo simulado
          </p>
        </div>

        {loadingTemplates ? (
          <div className="text-center py-8 text-muted-foreground">Carregando modelos...</div>
        ) : templates && templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template: any) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.nome}
                  </CardTitle>
                  {template.descricao && (
                    <CardDescription>{template.descricao}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Total de questões:</span> {JSON.parse(template.configuracao || '{}') && Object.values(JSON.parse(template.configuracao || '{}')).reduce((sum: number, val: any) => sum + val, 0)}
                    </p>
                    {template.duracaoMinutos && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Tempo limite:</span> {template.duracaoMinutos} minutos
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleGenerateExam(template.id)}
                    disabled={generatingExamId === template.id}
                  >
                    {generatingExamId === template.id ? "Gerando..." : "Iniciar Simulado"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum modelo de prova disponível no momento.
            </CardContent>
          </Card>
        )}
      </div>

      {/* My Exams History */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Meus Simulados</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico de simulados realizados e em andamento
          </p>
        </div>

        {loadingExams ? (
          <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
        ) : myExams && myExams.length > 0 ? (
          <div className="space-y-3">
            {myExams.map((exam: any) => (
              <Card key={exam.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Simulado #{exam.id}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(exam.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {exam.concluido === 1 ? (
                          <span className="text-green-600 font-medium">
                            Concluído • {Math.round((exam.totalAcertos / exam.totalQuestoes) * 100)}%
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium">
                            Em andamento
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {exam.concluido === 1 ? (
                        <Link href={`/avaliacoes/${exam.id}/resultado`}>
                          <Button variant="outline" size="sm">
                            Ver Resultado
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/avaliacoes/${exam.id}`}>
                          <Button size="sm">
                            Continuar
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Você ainda não realizou nenhum simulado. Selecione um modelo acima para começar!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
