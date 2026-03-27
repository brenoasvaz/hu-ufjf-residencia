import { useState, useRef, useCallback, useMemo } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  RefreshCw,
  ImagePlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Unlock,
  Lock,
  Pencil,
  Search,
  X,
  Trash2,
  ArrowLeftRight,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

// ─────────────────────────────────────────────
// Tipos auxiliares
// ─────────────────────────────────────────────
interface Alternativa {
  id: number;
  letra: string;
  texto: string;
  isCorreta: number;
}

interface TemplateQuestao {
  id: number;
  questaoId: number;
  ordem: number;
  enunciado: string;
  fonte?: string;
  ano?: number;
  especialidadeId: number;
  especialidadeNome: string;
  temImagem: number;
  imageUrl?: string;
  alternativas: Alternativa[];
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export default function SimuladoRevisao() {
  const { user } = useAuth();
  const [, params] = useRoute("/admin/avaliacoes/:modeloId/revisao");
  const modeloId = params?.modeloId ? parseInt(params.modeloId) : null;

  // Expansão de cards
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Dialogs de liberação / revogação
  const [liberarDialogOpen, setLiberarDialogOpen] = useState(false);
  const [revogarDialogOpen, setRevogarDialogOpen] = useState(false);

  // Upload de imagem
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadTargetQuestaoId, setUploadTargetQuestaoId] = useState<number | null>(null);

  // Troca aleatória (mesma especialidade)
  const [trocandoId, setTrocandoId] = useState<number | null>(null);

  // Modal de troca específica
  const [trocaModalOpen, setTrocaModalOpen] = useState(false);
  const [trocaTarget, setTrocaTarget] = useState<TemplateQuestao | null>(null);
  const [trocaBusca, setTrocaBusca] = useState("");
  const [trocaBuscaInput, setTrocaBuscaInput] = useState("");
  const [trocaEspFiltro, setTrocaEspFiltro] = useState<string>("todas");
  const [trocaPage, setTrocaPage] = useState(1);
  const [questaoSelecionadaParaTroca, setQuestaoSelecionadaParaTroca] = useState<any>(null);
  const [confirmandoTroca, setConfirmandoTroca] = useState(false);

  // Edição de questão
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TemplateQuestao | null>(null);
  const [editEnunciado, setEditEnunciado] = useState("");
  const [editFonte, setEditFonte] = useState("");
  const [editAno, setEditAno] = useState("");
  const [editAlternativas, setEditAlternativas] = useState<Alternativa[]>([]);

  const utils = trpc.useUtils();

  // ── Queries ──────────────────────────────────
  const { data: modelo } = trpc.avaliacoes.modelos.list.useQuery(undefined, {
    select: (list: any[]) => list.find((m: any) => m.id === modeloId),
  });

  const { data: template, isLoading } = trpc.avaliacoes.template.get.useQuery(
    { modeloId: modeloId! },
    { enabled: !!modeloId }
  );

  const { data: especialidades } = trpc.avaliacoes.especialidades.list.useQuery();

  // Busca para troca específica
  const trocaQueryInput = useMemo(() => ({
    templateId: template?.id ?? 0,
    busca: trocaBusca || undefined,
    especialidadeId: trocaEspFiltro !== "todas" ? parseInt(trocaEspFiltro) : undefined,
    page: trocaPage,
    pageSize: 20,
  }), [template?.id, trocaBusca, trocaEspFiltro, trocaPage]);

  const { data: questoesParaTroca, isLoading: loadingTroca } = trpc.avaliacoes.template.buscarQuestoesParaTroca.useQuery(
    trocaQueryInput,
    { enabled: trocaModalOpen && !!template?.id }
  );

  // Alternativas da questão em edição
  const { data: questaoComAlts, isLoading: loadingAlts } = trpc.avaliacoes.questoes.getWithAlternativas.useQuery(
    { questaoId: editTarget?.questaoId ?? 0 },
    { enabled: editDialogOpen && !!editTarget }
  );

  // ── Mutations ─────────────────────────────────
  const trocarMutation = trpc.avaliacoes.template.trocarQuestao.useMutation({
    onSuccess: () => {
      utils.avaliacoes.template.get.invalidate({ modeloId: modeloId! });
      toast.success("Questão substituída com sucesso!");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao trocar questão"),
  });

  const trocarEspecificaMutation = trpc.avaliacoes.template.trocarQuestaoEspecifica.useMutation({
    onSuccess: () => {
      utils.avaliacoes.template.get.invalidate({ modeloId: modeloId! });
      toast.success("Questão substituída com sucesso!");
      setTrocaModalOpen(false);
      setTrocaTarget(null);
      setQuestaoSelecionadaParaTroca(null);
      setConfirmandoTroca(false);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao trocar questão"),
  });

  const liberarMutation = trpc.avaliacoes.template.liberar.useMutation({
    onSuccess: () => {
      utils.avaliacoes.modelos.list.invalidate();
      toast.success("Modelo liberado para os residentes!");
      setLiberarDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao liberar"),
  });

  const revogarMutation = trpc.avaliacoes.template.revogar.useMutation({
    onSuccess: () => {
      utils.avaliacoes.modelos.list.invalidate();
      toast.success("Liberação revogada. Modelo voltou para revisão.");
      setRevogarDialogOpen(false);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao revogar"),
  });

  const uploadImagemMutation = trpc.avaliacoes.template.uploadImagemQuestao.useMutation({
    onSuccess: () => {
      utils.avaliacoes.template.get.invalidate({ modeloId: modeloId! });
      toast.success("Imagem adicionada com sucesso!");
      setUploadingId(null);
      setUploadTargetQuestaoId(null);
    },
    onError: (e: any) => {
      toast.error(e.message || "Erro ao fazer upload da imagem");
      setUploadingId(null);
    },
  });

  const editarMutation = trpc.avaliacoes.questoes.editar.useMutation({
    onSuccess: () => {
      utils.avaliacoes.template.get.invalidate({ modeloId: modeloId! });
      toast.success("Questão atualizada com sucesso no banco de questões!");
      setEditDialogOpen(false);
      setEditTarget(null);
    },
    onError: (e: any) => toast.error(e.message || "Erro ao editar questão"),
  });

  // ── Handlers ──────────────────────────────────
  const handleTrocarAleatorio = async (tq: TemplateQuestao) => {
    setTrocandoId(tq.id);
    try {
      await trocarMutation.mutateAsync({
        templateId: template!.id,
        templateQuestaoId: tq.id,
        questaoAtualId: tq.questaoId,
        especialidadeId: tq.especialidadeId,
      });
    } finally {
      setTrocandoId(null);
    }
  };

  const handleAbrirTrocaEspecifica = (tq: TemplateQuestao) => {
    setTrocaTarget(tq);
    setTrocaBusca("");
    setTrocaBuscaInput("");
    setTrocaEspFiltro("todas");
    setTrocaPage(1);
    setQuestaoSelecionadaParaTroca(null);
    setConfirmandoTroca(false);
    setTrocaModalOpen(true);
  };

  const handleConfirmarTrocaEspecifica = () => {
    if (!trocaTarget || !questaoSelecionadaParaTroca) return;
    trocarEspecificaMutation.mutate({
      templateQuestaoId: trocaTarget.id,
      novaQuestaoId: questaoSelecionadaParaTroca.id,
    });
  };

  const handleUploadClick = (questaoId: number) => {
    setUploadTargetQuestaoId(questaoId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetQuestaoId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }
    setUploadingId(uploadTargetQuestaoId);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      uploadImagemMutation.mutate({
        questaoId: uploadTargetQuestaoId,
        imageBase64: base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAbrirEdicao = (tq: TemplateQuestao) => {
    setEditTarget(tq);
    setEditEnunciado(tq.enunciado);
    setEditFonte(tq.fonte || "");
    setEditAno(tq.ano ? String(tq.ano) : "");
    setEditAlternativas([]);
    setEditDialogOpen(true);
  };

  // Preencher alternativas quando carregadas
  const altsPreenchidas = useMemo(() => {
    if (questaoComAlts && editDialogOpen) {
      return questaoComAlts.alternativas ?? [];
    }
    return editAlternativas;
  }, [questaoComAlts, editDialogOpen]);

  const handleSalvarEdicao = () => {
    if (!editTarget) return;
    const alts = altsPreenchidas.length > 0 ? altsPreenchidas : editAlternativas;
    const corretas = alts.filter((a: Alternativa) => a.isCorreta === 1);
    if (corretas.length !== 1) {
      toast.error("Marque exatamente uma alternativa como correta.");
      return;
    }
    editarMutation.mutate({
      questaoId: editTarget.questaoId,
      enunciado: editEnunciado,
      fonte: editFonte || undefined,
      ano: editAno ? parseInt(editAno) : undefined,
      alternativas: alts.map((a: Alternativa) => ({
        id: a.id,
        texto: a.texto,
        isCorreta: a.isCorreta,
      })),
    });
  };

  const handleBuscarTroca = useCallback(() => {
    setTrocaBusca(trocaBuscaInput);
    setTrocaPage(1);
  }, [trocaBuscaInput]);

  // ── Guards ────────────────────────────────────
  if (!user || user.role !== "admin") {
    return <div className="space-y-6"><h1 className="text-2xl font-bold">Acesso Restrito</h1></div>;
  }
  if (!modeloId) {
    return <div className="space-y-6"><h1 className="text-2xl font-bold">Modelo não encontrado</h1></div>;
  }

  // ── Status helpers ────────────────────────────
  const statusColor: Record<string, string> = {
    rascunho: "bg-gray-100 text-gray-700 border-gray-300",
    em_revisao: "bg-amber-100 text-amber-700 border-amber-300",
    liberado: "bg-green-100 text-green-700 border-green-300",
  };
  const statusLabel: Record<string, string> = {
    rascunho: "Rascunho",
    em_revisao: "Em Revisão",
    liberado: "Liberado",
  };
  const modeloStatus = modelo?.status || "rascunho";
  const isLiberado = modeloStatus === "liberado";

  // ── Render ────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/avaliacoes">
              <Button variant="ghost" size="sm" className="gap-1 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Revisão — {modelo?.nome || `Modelo #${modeloId}`}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Revise, edite e troque questões antes de liberar para os residentes.
            </p>
            {modelo && (
              <Badge variant="outline" className={`shrink-0 ${statusColor[modeloStatus]}`}>
                {statusLabel[modeloStatus]}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {isLiberado ? (
            <Button variant="outline" onClick={() => setRevogarDialogOpen(true)} disabled={revogarMutation.isPending}>
              <Lock className="mr-2 h-4 w-4" />
              Revogar Liberação
            </Button>
          ) : (
            <Button onClick={() => setLiberarDialogOpen(true)} disabled={!template || liberarMutation.isPending}>
              <Unlock className="mr-2 h-4 w-4" />
              Liberar para Residentes
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando questões...</div>
      ) : !template ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-2">Nenhum simulado de revisão gerado para este modelo.</p>
            <p className="text-sm">Volte à lista de modelos e clique em "Gerar Simulado para Revisão".</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {template.questoes.length} questão(ões) sorteada(s)
          </p>

          {template.questoes.map((tq: TemplateQuestao) => {
            const isExpanded = expandedId === tq.id;
            const isTrocando = trocandoId === tq.id;
            const isUploading = uploadingId === tq.questaoId;

            return (
              <Card key={tq.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground">Q{tq.ordem}</span>
                        <Badge variant="outline" className="text-xs">{tq.especialidadeNome}</Badge>
                        {tq.temImagem === 1 && tq.imageUrl && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">Com imagem</Badge>
                        )}
                        {tq.temImagem === 1 && !tq.imageUrl && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">Imagem pendente</Badge>
                        )}
                        {tq.fonte && (
                          <span className="text-xs text-muted-foreground">{tq.fonte}{tq.ano ? ` (${tq.ano})` : ""}</span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{tq.enunciado}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                      {/* Editar conteúdo */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAbrirEdicao(tq)}
                        disabled={isLiberado}
                        title="Editar enunciado e alternativas"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>

                      {/* Upload de imagem */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadClick(tq.questaoId)}
                        disabled={isUploading || isLiberado}
                        title="Adicionar/substituir imagem"
                      >
                        {isUploading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
                      </Button>

                      {/* Trocar aleatório (mesma especialidade) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrocarAleatorio(tq)}
                        disabled={isTrocando || isLiberado}
                        title="Sortear outra questão desta especialidade"
                      >
                        {isTrocando ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      </Button>

                      {/* Trocar por questão específica */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAbrirTrocaEspecifica(tq)}
                        disabled={isLiberado}
                        title="Escolher questão substituta específica"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                      </Button>

                      {/* Expandir */}
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : tq.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 px-4 pb-4 space-y-3 border-t">
                    <p className="text-sm">{tq.enunciado}</p>

                    {tq.imageUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Imagem:</p>
                        <img src={tq.imageUrl} alt={`Imagem da questão ${tq.ordem}`} className="max-h-64 rounded border object-contain" />
                      </div>
                    )}

                    {tq.alternativas && tq.alternativas.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Alternativas:</p>
                        {tq.alternativas.map((alt: Alternativa) => (
                          <div
                            key={alt.id}
                            className={`flex items-start gap-2 text-sm p-2 rounded ${
                              alt.isCorreta === 1
                                ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700"
                                : "bg-muted/40"
                            }`}
                          >
                            <span className="font-semibold shrink-0 w-5">{alt.letra})</span>
                            <span className="flex-1">{alt.texto}</span>
                            {alt.isCorreta === 1 && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* ── Modal de Edição de Questão ─────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditTarget(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Questão #{editTarget?.questaoId}</DialogTitle>
            <DialogDescription>
              As alterações serão salvas no banco de questões e refletidas em todos os simulados futuros.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Enunciado */}
            <div className="space-y-1">
              <Label>Enunciado</Label>
              <Textarea
                value={editEnunciado}
                onChange={(e) => setEditEnunciado(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            {/* Fonte e Ano */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fonte</Label>
                <Input value={editFonte} onChange={(e) => setEditFonte(e.target.value)} placeholder="Ex: TARO" />
              </div>
              <div className="space-y-1">
                <Label>Ano</Label>
                <Input value={editAno} onChange={(e) => setEditAno(e.target.value)} placeholder="Ex: 2023" type="number" />
              </div>
            </div>

            {/* Alternativas */}
            <div className="space-y-2">
              <Label>Alternativas <span className="text-xs text-muted-foreground">(marque a correta)</span></Label>
              {loadingAlts ? (
                <p className="text-sm text-muted-foreground">Carregando alternativas...</p>
              ) : (
                altsPreenchidas.map((alt: Alternativa, idx: number) => (
                  <div key={alt.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    alt.isCorreta === 1 ? "border-green-400 bg-green-50 dark:bg-green-900/20" : "border-border bg-muted/20"
                  }`}>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = altsPreenchidas.map((a: Alternativa, i: number) => ({
                          ...a,
                          isCorreta: i === idx ? 1 : 0,
                        }));
                        // força re-render via editAlternativas
                        setEditAlternativas(updated);
                      }}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        alt.isCorreta === 1 ? "border-green-500 bg-green-500" : "border-muted-foreground hover:border-primary"
                      }`}
                      title="Marcar como correta"
                    >
                      {alt.isCorreta === 1 && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                    <span className="font-semibold text-sm w-5 shrink-0 mt-0.5">{alt.letra})</span>
                    <Textarea
                      value={alt.texto}
                      onChange={(e) => {
                        const updated = altsPreenchidas.map((a: Alternativa, i: number) =>
                          i === idx ? { ...a, texto: e.target.value } : a
                        );
                        setEditAlternativas(updated);
                      }}
                      rows={2}
                      className="flex-1 resize-none text-sm"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditTarget(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarEdicao} disabled={editarMutation.isPending || loadingAlts}>
              {editarMutation.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar no Banco
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal de Troca Específica ─────────────────── */}
      <Dialog open={trocaModalOpen} onOpenChange={(open) => { if (!open) { setTrocaModalOpen(false); setTrocaTarget(null); setQuestaoSelecionadaParaTroca(null); setConfirmandoTroca(false); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Escolher Questão Substituta</DialogTitle>
            <DialogDescription>
              Substituindo Q{trocaTarget?.ordem} — <span className="font-medium">{trocaTarget?.especialidadeNome}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Questão atual */}
          {trocaTarget && (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-1">Questão atual:</p>
              <p className="line-clamp-3">{trocaTarget.enunciado}</p>
            </div>
          )}

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Buscar por texto..."
                value={trocaBuscaInput}
                onChange={(e) => setTrocaBuscaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscarTroca()}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleBuscarTroca}>
                <Search className="h-4 w-4" />
              </Button>
              {trocaBusca && (
                <Button variant="ghost" size="sm" onClick={() => { setTrocaBusca(""); setTrocaBuscaInput(""); setTrocaPage(1); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select value={trocaEspFiltro} onValueChange={(v) => { setTrocaEspFiltro(v); setTrocaPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as especialidades</SelectItem>
                {especialidades?.map((esp: any) => (
                  <SelectItem key={esp.id} value={String(esp.id)}>{esp.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de questões */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-80">
            {loadingTroca ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Buscando questões...</div>
            ) : !questoesParaTroca?.questoes?.length ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma questão encontrada.</div>
            ) : (
              questoesParaTroca.questoes.map((q: any) => {
                const selecionada = questaoSelecionadaParaTroca?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setQuestaoSelecionadaParaTroca(selecionada ? null : q)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selecionada
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/30"
                    }`}
                  >
                    <div className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selecionada ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {selecionada && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">#{q.id}</span>
                        <Badge variant="outline" className="text-xs">{q.especialidadeNome}</Badge>
                        {q.fonte && <span className="text-xs text-muted-foreground">{q.fonte}{q.ano ? ` ${q.ano}` : ""}</span>}
                      </div>
                      <p className="text-sm line-clamp-2">{q.enunciado}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginação */}
          {questoesParaTroca && questoesParaTroca.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
              <span>Página {trocaPage} de {questoesParaTroca.totalPages} ({questoesParaTroca.total} questões)</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setTrocaPage(p => Math.max(1, p - 1))} disabled={trocaPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTrocaPage(p => Math.min(questoesParaTroca.totalPages, p + 1))} disabled={trocaPage === questoesParaTroca.totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setTrocaModalOpen(false); setTrocaTarget(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarTrocaEspecifica}
              disabled={!questaoSelecionadaParaTroca || trocarEspecificaMutation.isPending}
            >
              {trocarEspecificaMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowLeftRight className="mr-2 h-4 w-4" />
              )}
              Confirmar Troca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog de Liberação ─────────────────────── */}
      <AlertDialog open={liberarDialogOpen} onOpenChange={setLiberarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar modelo para os residentes?</AlertDialogTitle>
            <AlertDialogDescription>
              Após liberar, os residentes poderão iniciar avaliações com este modelo. Você poderá revogar a liberação a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => liberarMutation.mutate({ modeloId: modeloId! })} disabled={liberarMutation.isPending}>
              Liberar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialog de Revogação ─────────────────────── */}
      <AlertDialog open={revogarDialogOpen} onOpenChange={setRevogarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar liberação?</AlertDialogTitle>
            <AlertDialogDescription>
              O modelo voltará para o status "Em Revisão" e novos residentes não poderão iniciar avaliações. Avaliações já em andamento não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => revogarMutation.mutate({ modeloId: modeloId! })} disabled={revogarMutation.isPending}>
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
