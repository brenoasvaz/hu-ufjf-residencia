import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Image,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function GerenciarImagensQuestoes() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "com_imagem" | "sem_imagem">("todas");
  const [questaoSelecionada, setQuestaoSelecionada] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewQuestao, setPreviewQuestao] = useState<any>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: questoes, isLoading, refetch } = trpc.avaliacoes.questoes.listComImagem.useQuery();

  const uploadMutation = trpc.avaliacoes.questoes.uploadImagem.useMutation({
    onSuccess: () => {
      toast.success("Imagem adicionada com sucesso!");
      setUploadDialogOpen(false);
      setQuestaoSelecionada(null);
      setImagemPreview(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer upload da imagem");
    },
  });

  const removeMutation = trpc.avaliacoes.questoes.removeImagem.useMutation({
    onSuccess: () => {
      toast.success("Imagem removida com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao remover imagem");
    },
  });

  // Filtrar questões
  const questoesFiltradas = (questoes || []).filter((q: any) => {
    const matchBusca =
      !busca ||
      q.enunciado.toLowerCase().includes(busca.toLowerCase()) ||
      String(q.id).includes(busca) ||
      (q.fonte && q.fonte.toLowerCase().includes(busca.toLowerCase()));

    const matchStatus =
      filtroStatus === "todas" ||
      (filtroStatus === "com_imagem" && q.imageUrl) ||
      (filtroStatus === "sem_imagem" && !q.imageUrl);

    return matchBusca && matchStatus;
  });

  const totalComImagem = (questoes || []).filter((q: any) => q.imageUrl).length;
  const totalSemImagem = (questoes || []).filter((q: any) => !q.imageUrl).length;

  const processarArquivo = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagemPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processarArquivo(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = () => {
    if (!imagemPreview || !questaoSelecionada) return;

    const mimeMatch = imagemPreview.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    uploadMutation.mutate({
      questaoId: questaoSelecionada.id,
      imageBase64: imagemPreview,
      mimeType,
    });
  };

  const handleOpenUpload = (questao: any) => {
    setQuestaoSelecionada(questao);
    setImagemPreview(questao.imageUrl || null);
    setUploadDialogOpen(true);
  };

  const handlePreview = (questao: any) => {
    setPreviewQuestao(questao);
    setPreviewDialogOpen(true);
  };

  return (
    <div className="container max-w-6xl py-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/avaliacoes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Image className="h-8 w-8 text-primary" />
          Imagens das Questões
        </h1>
        <p className="text-muted-foreground">
          Gerencie as imagens das questões que requerem ilustração no enunciado.
          Adicione as imagens antes de liberar as avaliações para os residentes.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          className={`cursor-pointer transition-all ${filtroStatus === "todas" ? "ring-2 ring-primary" : "hover:shadow-md"}`}
          onClick={() => setFiltroStatus("todas")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total com Imagem</p>
                <p className="text-3xl font-bold">{questoes?.length || 0}</p>
              </div>
              <Image className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${filtroStatus === "com_imagem" ? "ring-2 ring-green-500" : "hover:shadow-md"}`}
          onClick={() => setFiltroStatus("com_imagem")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Imagem Adicionada</p>
                <p className="text-3xl font-bold text-green-600">{totalComImagem}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${filtroStatus === "sem_imagem" ? "ring-2 ring-orange-500" : "hover:shadow-md"}`}
          onClick={() => setFiltroStatus("sem_imagem")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Imagem</p>
                <p className="text-3xl font-bold text-orange-600">{totalSemImagem}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de busca */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, enunciado ou fonte..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de questões */}
      <Card>
        <CardHeader>
          <CardTitle>Questões que Requerem Imagem</CardTitle>
          <CardDescription>
            {questoesFiltradas.length} questão(ões) exibida(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando questões...
            </div>
          ) : questoesFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma questão encontrada.
            </div>
          ) : (
            <div className="space-y-3">
              {questoesFiltradas.map((questao: any) => (
                <div
                  key={questao.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  {/* Status da imagem */}
                  <div className="mt-1 flex-shrink-0">
                    {questao.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden border">
                        <img
                          src={questao.imageUrl}
                          alt="Miniatura"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md border-2 border-dashed border-orange-300 flex items-center justify-center bg-orange-50">
                        <Image className="h-5 w-5 text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">#{questao.id}</span>
                      {questao.fonte && (
                        <Badge variant="outline" className="text-xs">
                          {questao.fonte} {questao.ano}
                        </Badge>
                      )}
                      {questao.imageUrl ? (
                        <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Imagem adicionada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Aguardando imagem
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2 text-foreground">
                      {questao.enunciado}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 flex-shrink-0">
                    {questao.imageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(questao)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant={questao.imageUrl ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleOpenUpload(questao)}
                    >
                      <Upload className="mr-1 h-4 w-4" />
                      {questao.imageUrl ? "Alterar" : "Adicionar"}
                    </Button>
                    {questao.imageUrl && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMutation.mutate({ questaoId: questao.id })}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Upload */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setUploadDialogOpen(false);
          setQuestaoSelecionada(null);
          setImagemPreview(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {questaoSelecionada?.imageUrl ? "Alterar Imagem" : "Adicionar Imagem"}
            </DialogTitle>
            <DialogDescription>
              Questão #{questaoSelecionada?.id} — {questaoSelecionada?.fonte} {questaoSelecionada?.ano}
            </DialogDescription>
          </DialogHeader>

          {/* Enunciado */}
          {questaoSelecionada && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm max-h-32 overflow-y-auto">
              <p className="font-medium text-xs text-muted-foreground mb-1">Enunciado:</p>
              <p>{questaoSelecionada.enunciado}</p>
            </div>
          )}

          {/* Área de upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagemPreview ? (
              <div className="relative">
                <img
                  src={imagemPreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-md object-contain"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagemPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">
                  Arraste uma imagem ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG, GIF — máximo 5MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setQuestaoSelecionada(null);
                setImagemPreview(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!imagemPreview || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Enviando..." : "Salvar Imagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Questão #{previewQuestao?.id} — Visualização
            </DialogTitle>
          </DialogHeader>
          {previewQuestao && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p>{previewQuestao.enunciado}</p>
              </div>
              {previewQuestao.imageUrl && (
                <div className="text-center">
                  <img
                    src={previewQuestao.imageUrl}
                    alt="Imagem da questão"
                    className="max-h-96 mx-auto rounded-md object-contain border"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
