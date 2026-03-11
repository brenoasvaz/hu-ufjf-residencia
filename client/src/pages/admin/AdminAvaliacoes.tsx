import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, Users, TrendingUp, FileText, Settings, Trash2, Download, Search, ChevronLeft, ChevronRight, Image, ChevronDown, ChevronUp, CheckCircle2, Eye, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

export default function AdminAvaliacoes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simuladoToDelete, setSimuladoToDelete] = useState<number | null>(null);

  const [questoesPage, setQuestoesPage] = useState(1);
  const [questoesBusca, setQuestoesBusca] = useState("");
  const [questoesEspecialidade, setQuestoesEspecialidade] = useState<number | undefined>(undefined);
  const [questoesFonte, setQuestoesFonte] = useState<string>("todas");
  const [questoesAno, setQuestoesAno] = useState<string>("todos");
  const [expandedQuestaoId, setExpandedQuestaoId] = useState<number | null>(null);
  const [gerandoTemplateId, setGerandoTemplateId] = useState<number | null>(null);

  const { data: modelos, isLoading: loadingModelos } = trpc.avaliacoes.modelos.list.useQuery();
  const { data: allSimulados, isLoading: loadingSimulados, refetch: refetchSimulados } = trpc.avaliacoes.simulados.list.useQuery();
  const { data: totalQuestoes } = trpc.avaliacoes.questoes.count.useQuery();
  const { data: especialidades } = trpc.avaliacoes.especialidades.list.useQuery();
  const { data: fontes } = trpc.avaliacoes.questoes.listFontes.useQuery();
  const { data: anosDisponiveis } = trpc.avaliacoes.questoes.listAnos.useQuery();
  const { data: questoesData, isLoading: loadingQuestoes } = trpc.avaliacoes.questoes.list.useQuery({
    page: questoesPage,
    pageSize: 20,
    especialidadeId: questoesEspecialidade,
    busca: questoesBusca || undefined,
  });
  const utils = trpc.useUtils();
  const deleteMutation = trpc.avaliacoes.simulados.delete.useMutation();
  const gerarPDFMutation = trpc.avaliacoes.simulados.gerarPDF.useMutation();
  const gerarTemplateMutation = trpc.avaliacoes.template.gerar.useMutation({
    onSuccess: (data: any, variables: any) => {
      utils.avaliacoes.modelos.list.invalidate();
      toast.success("Simulado de revisão gerado! Redirecionando...");
      setLocation(`/admin/avaliacoes/${variables.modeloId}/revisao`);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao gerar simulado de revisão"),
  });

  // Buscar alternativas da questão expandida
  const { data: questaoExpandida, isLoading: loadingAlternativas } = trpc.avaliacoes.questoes.getWithAlternativas.useQuery(
    { questaoId: expandedQuestaoId! },
    { enabled: expandedQuestaoId !== null }
  );
  const especialidadesMap = useMemo(() => {
    if (!especialidades) return {};
    return Object.fromEntries(especialidades.map((e: any) => [e.id, e.nome]));
  }, [especialidades]);

  const handleGerarPDF = async (simuladoId: number) => {
    try {
      toast.info("Gerando PDF...");
      const result = await gerarPDFMutation.mutateAsync({ simuladoId });
      
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar PDF");
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Avaliações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie modelos de prova, questões e acompanhe o desempenho dos residentes
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Modelos de prova</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestoes?.total?.toLocaleString('pt-BR') ?? '...'}</div>
            <p className="text-xs text-muted-foreground">Questões cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">Áreas de Ortopedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residentes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="modelos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modelos">Modelos de Prova</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="questoes">Questões</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Modelos de Prova */}
        <TabsContent value="modelos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Modelos de Prova</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie os modelos de prova disponíveis para os residentes
              </p>
            </div>
            <Link href="/admin/avaliacoes/modelos">
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Modelos
              </Button>
            </Link>
          </div>

          {loadingModelos ? (
            <div className="text-center py-8 text-muted-foreground">Carregando modelos...</div>
          ) : modelos && modelos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {modelos.map((modelo: any) => (
                <Card key={modelo.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {modelo.nome}
                    </CardTitle>
                    {modelo.descricao && (
                      <CardDescription>{modelo.descricao}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Total de questões:</span>{' '}
                        {JSON.parse(modelo.configuracao || '{}') &&
                          Object.values(JSON.parse(modelo.configuracao || '{}')).reduce(
                            (sum: number, val: any) => sum + val,
                            0
                          )}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Duração:</span> {modelo.duracaoMinutos} minutos
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Criado em:</span>{' '}
                        {new Date(modelo.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {/* Badges de status */}
                    <div className="flex gap-2 flex-wrap">
                      {modelo.status === 'rascunho' && (
                        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                          Rascunho
                        </Badge>
                      )}
                      {modelo.status === 'em_revisao' && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                          Em Revisão
                        </Badge>
                      )}
                      {modelo.status === 'liberado' && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                          Liberado
                        </Badge>
                      )}
                    </div>
                    {/* Ações de revisão */}
                    <div className="flex gap-2">
                      {modelo.status === 'rascunho' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={gerandoTemplateId === modelo.id}
                          onClick={async () => {
                            setGerandoTemplateId(modelo.id);
                            try {
                              await gerarTemplateMutation.mutateAsync({ modeloId: modelo.id });
                            } finally {
                              setGerandoTemplateId(null);
                            }
                          }}
                        >
                          {gerandoTemplateId === modelo.id ? (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-3 w-3" />
                          )}
                          Gerar Simulado para Revisão
                        </Button>
                      ) : (
                        <Link href={`/admin/avaliacoes/${modelo.id}/revisao`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="mr-2 h-3 w-3" />
                            {modelo.status === 'liberado' ? 'Ver / Revogar' : 'Revisar Simulado'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum modelo de prova cadastrado.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Avaliações */}
        <TabsContent value="avaliacoes" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Gerenciar Avaliações</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie todas as avaliações realizadas pelos residentes
            </p>
          </div>

          {loadingSimulados ? (
            <div className="text-center py-8 text-muted-foreground">Carregando avaliações...</div>
          ) : allSimulados && allSimulados.length > 0 ? (
            <div className="space-y-3">
              {allSimulados
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((simulado: any) => (
                  <Card key={simulado.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">
                              {simulado.modeloNome
                                ? `${simulado.modeloNome} — ${simulado.userName || 'Usuário desconhecido'}`
                                : `Avaliação #${simulado.id}${simulado.userName ? ` — ${simulado.userName}` : ''}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Criada em {new Date(simulado.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {simulado.concluido === 1 ? (
                              <span className="text-green-600 font-medium">
                                Concluída • {Math.round((simulado.totalAcertos / simulado.totalQuestoes) * 100)}%
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">
                                Em andamento
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {simulado.concluido === 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGerarPDF(simulado.id)}
                              disabled={gerarPDFMutation.isPending}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Exportar PDF
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSimuladoToDelete(simulado.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma avaliação realizada ainda.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Questões */}
        <TabsContent value="questoes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Banco de Questões</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalQuestoes?.total?.toLocaleString('pt-BR') ?? '...'} questões cadastradas em {especialidades?.length ?? '...'} especialidades
              </p>
            </div>
            <Link href="/admin/questoes/imagens">
              <Button variant="outline">
                <Image className="mr-2 h-4 w-4" />
                Gerenciar Questões
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por enunciado..."
                className="pl-9"
                value={questoesBusca}
                onChange={(e) => { setQuestoesBusca(e.target.value); setQuestoesPage(1); }}
              />
            </div>
            <Select
              value={questoesEspecialidade?.toString() ?? "all"}
              onValueChange={(v) => { setQuestoesEspecialidade(v === "all" ? undefined : Number(v)); setQuestoesPage(1); }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as especialidades</SelectItem>
                {especialidades?.map((e: any) => (
                  <SelectItem key={e.id} value={e.id.toString()}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Filtro por Prova/Fonte */}
            <Select value={questoesFonte} onValueChange={(v) => { setQuestoesFonte(v); setQuestoesPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prova" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as provas</SelectItem>
                {fontes?.map((f: string) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Filtro por Ano */}
            <Select value={questoesAno} onValueChange={(v) => { setQuestoesAno(v); setQuestoesPage(1); }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os anos</SelectItem>
                {anosDisponiveis?.map((a: number) => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de questões */}
          {loadingQuestoes ? (
            <div className="text-center py-8 text-muted-foreground">Carregando questões...</div>
          ) : questoesData && questoesData.questoes.length > 0 ? (
            <div className="space-y-2">
              {questoesData.questoes.map((q: any) => (
                <Card
                  key={q.id}
                  className={`transition-shadow cursor-pointer ${expandedQuestaoId === q.id ? 'ring-1 ring-primary shadow-md' : 'hover:shadow-sm'}`}
                  onClick={() => setExpandedQuestaoId(expandedQuestaoId === q.id ? null : q.id)}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs shrink-0">
                            {especialidadesMap[q.especialidadeId] ?? `Esp. ${q.especialidadeId}`}
                          </Badge>
                          {q.fonte && <span className="text-xs text-muted-foreground">{q.fonte}{q.ano ? ` (${q.ano})` : ''}</span>}
                          {q.temImagem === 1 && (
                            <Badge variant={q.imageUrl ? "default" : "secondary"} className="text-xs">
                              <Image className="h-3 w-3 mr-1" />
                              {q.imageUrl ? "Imagem OK" : "Aguarda imagem"}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed ${expandedQuestaoId === q.id ? '' : 'line-clamp-2'}`}>{q.enunciado}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">#{q.id}</span>
                        {expandedQuestaoId === q.id
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Painel de alternativas expandido */}
                    {expandedQuestaoId === q.id && (
                      <div className="mt-3 pt-3 border-t space-y-2" onClick={e => e.stopPropagation()}>
                        {loadingAlternativas ? (
                          <p className="text-xs text-muted-foreground text-center py-2">Carregando alternativas...</p>
                        ) : questaoExpandida ? (
                          <>
                            {q.imageUrl && (
                              <div className="mb-3">
                                <img src={q.imageUrl} alt="Imagem da questão" className="max-h-48 rounded border object-contain" />
                              </div>
                            )}
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Alternativas</p>
                            {(questaoExpandida as any).alternativas?.map((alt: any, idx: number) => (
                              <div
                                key={alt.id}
                                className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                                  alt.isCorreta
                                    ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                                    : 'bg-muted/40'
                                }`}
                              >
                                <span className="font-semibold shrink-0 w-5">{String.fromCharCode(65 + idx)})</span>
                                <span className="flex-1">{alt.texto}</span>
                                {alt.isCorreta && (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                                )}
                              </div>
                            ))}
                          </>
                        ) : null}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Paginação */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((questoesPage - 1) * 20) + 1}–{Math.min(questoesPage * 20, questoesData.total)} de {questoesData.total.toLocaleString('pt-BR')} questões
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline" size="sm"
                    disabled={questoesPage === 1}
                    onClick={() => setQuestoesPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2 py-1">{questoesPage} / {questoesData.totalPages}</span>
                  <Button
                    variant="outline" size="sm"
                    disabled={questoesPage >= questoesData.totalPages}
                    onClick={() => setQuestoesPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma questão encontrada com os filtros aplicados.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Estatísticas */}
        <TabsContent value="estatisticas" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Estatísticas Gerais</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o desempenho geral dos residentes e estatísticas do sistema
            </p>
          </div>

          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Dashboard Agregado</p>
                <p className="text-sm text-muted-foreground">
                  Visualização de estatísticas consolidadas, ranking de residentes e análise de questões mais erradas
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Em breve você poderá visualizar:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Ranking de desempenho dos residentes</li>
                  <li>• Questões com maior taxa de erro</li>
                  <li>• Especialidades com maior dificuldade</li>
                  <li>• Evolução temporal do grupo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta avaliação? Esta ação não pode ser desfeita e todos os dados relacionados (respostas e questões) serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!simuladoToDelete) return;
                try {
                  await deleteMutation.mutateAsync({ simuladoId: simuladoToDelete });
                  toast.success("Avaliação deletada com sucesso!");
                  await refetchSimulados();
                  setDeleteDialogOpen(false);
                  setSimuladoToDelete(null);
                } catch (error: any) {
                  toast.error(error.message || "Erro ao deletar avaliação");
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
