import { useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  RefreshCw,
  ImagePlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Unlock,
  Lock,
} from "lucide-react";
import { Link } from "wouter";

export default function SimuladoRevisao() {
  const { user } = useAuth();
  const [, params] = useRoute("/admin/avaliacoes/:modeloId/revisao");
  const [, setLocation] = useLocation();
  const modeloId = params?.modeloId ? parseInt(params.modeloId) : null;

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [liberarDialogOpen, setLiberarDialogOpen] = useState(false);
  const [revogarDialogOpen, setRevogarDialogOpen] = useState(false);
  const [trocandoId, setTrocandoId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetQuestaoId, setUploadTargetQuestaoId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: modelo } = trpc.avaliacoes.modelos.list.useQuery(undefined, {
    select: (list: any[]) => list.find((m: any) => m.id === modeloId),
  });

  const { data: template, isLoading } = trpc.avaliacoes.template.get.useQuery(
    { modeloId: modeloId! },
    { enabled: !!modeloId }
  );

  const trocarMutation = trpc.avaliacoes.template.trocarQuestao.useMutation({
    onSuccess: () => {
      utils.avaliacoes.template.get.invalidate({ modeloId: modeloId! });
      toast.success("Questão substituída com sucesso!");
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

  const handleTrocar = async (tq: any) => {
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
    // Limpar input para permitir re-upload do mesmo arquivo
    e.target.value = "";
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Acesso Restrito</h1>
      </div>
    );
  }

  if (!modeloId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Modelo não encontrado</h1>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
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
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">
              Revise as questões sorteadas, troque as que precisar e adicione imagens antes de liberar.
            </p>
            {modelo && (
              <Badge
                variant="outline"
                className={`shrink-0 ${statusColor[modeloStatus]}`}
              >
                {statusLabel[modeloStatus]}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {modeloStatus === "liberado" ? (
            <Button
              variant="outline"
              onClick={() => setRevogarDialogOpen(true)}
              disabled={revogarMutation.isPending}
            >
              <Lock className="mr-2 h-4 w-4" />
              Revogar Liberação
            </Button>
          ) : (
            <Button
              onClick={() => setLiberarDialogOpen(true)}
              disabled={!template || liberarMutation.isPending}
            >
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

          {template.questoes.map((tq: any, index: number) => {
            const isExpanded = expandedId === tq.id;
            const isTrocando = trocandoId === tq.id;
            const isUploading = uploadingId === tq.questaoId;

            return (
              <Card key={tq.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Q{tq.ordem}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {tq.especialidadeNome}
                        </Badge>
                        {tq.temImagem === 1 && tq.imageUrl && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                            Com imagem
                          </Badge>
                        )}
                        {tq.temImagem === 1 && !tq.imageUrl && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                            Imagem pendente
                          </Badge>
                        )}
                        {tq.fonte && (
                          <span className="text-xs text-muted-foreground">
                            {tq.fonte}{tq.ano ? ` (${tq.ano})` : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{tq.enunciado}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadClick(tq.questaoId)}
                        disabled={isUploading || modeloStatus === "liberado"}
                        title="Adicionar/substituir imagem"
                      >
                        {isUploading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <ImagePlus className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrocar(tq)}
                        disabled={isTrocando || modeloStatus === "liberado"}
                        title="Sortear outra questão desta especialidade"
                      >
                        {isTrocando ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : tq.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 px-4 pb-4 space-y-3 border-t">
                    {/* Enunciado completo */}
                    <p className="text-sm">{tq.enunciado}</p>

                    {/* Imagem */}
                    {tq.imageUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Imagem:</p>
                        <img
                          src={tq.imageUrl}
                          alt={`Imagem da questão ${tq.ordem}`}
                          className="max-h-64 rounded border object-contain"
                        />
                      </div>
                    )}

                    {/* Alternativas */}
                    {tq.alternativas && tq.alternativas.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Alternativas:</p>
                        {tq.alternativas.map((alt: any) => (
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
                            {alt.isCorreta === 1 && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            )}
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dialog de confirmação de liberação */}
      <AlertDialog open={liberarDialogOpen} onOpenChange={setLiberarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar modelo para os residentes?</AlertDialogTitle>
            <AlertDialogDescription>
              Após liberar, os residentes poderão iniciar avaliações com este modelo. Você poderá
              revogar a liberação a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => liberarMutation.mutate({ modeloId: modeloId! })}
              disabled={liberarMutation.isPending}
            >
              Liberar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de revogação */}
      <AlertDialog open={revogarDialogOpen} onOpenChange={setRevogarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar liberação?</AlertDialogTitle>
            <AlertDialogDescription>
              O modelo voltará para o status "Em Revisão" e novos residentes não poderão iniciar
              avaliações. Avaliações já em andamento não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revogarMutation.mutate({ modeloId: modeloId! })}
              disabled={revogarMutation.isPending}
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
