import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Image,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Eye,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export default function GerenciarImagensQuestoes() {
  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroFonte, setFiltroFonte] = useState<string>("todas");
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "com_imagem" | "sem_imagem">("todas");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // Dialogs
  const [questaoSelecionada, setQuestaoSelecionada] = useState<any>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewQuestao, setPreviewQuestao] = useState<any>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do formulário de edição
  const [editEnunciado, setEditEnunciado] = useState("");
  const [editFonte, setEditFonte] = useState("");
  const [editAno, setEditAno] = useState("");
  const [editEspecialidadeId, setEditEspecialidadeId] = useState<string>("");
  const [editAlternativas, setEditAlternativas] = useState<any[]>([]);

  // Queries
  const queryInput = {
    fonte: filtroFonte !== "todas" ? filtroFonte : undefined,
    ano: filtroAno !== "todos" ? parseInt(filtroAno) : undefined,
    especialidadeId: filtroEspecialidade !== "todas" ? parseInt(filtroEspecialidade) : undefined,
    statusImagem: filtroStatus,
    busca: busca || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { data: questoesData, isLoading, refetch } = trpc.avaliacoes.questoes.listComImagem.useQuery(queryInput);
  const { data: fontes } = trpc.avaliacoes.questoes.listFontes.useQuery();
  const { data: anos } = trpc.avaliacoes.questoes.listAnos.useQuery();
  const { data: especialidades } = trpc.avaliacoes.especialidades.list.useQuery();

  // Queries separadas para os totais reais dos cards (ignoram o filtro de statusImagem)
  const baseFilters = {
    fonte: filtroFonte !== "todas" ? filtroFonte : undefined,
    ano: filtroAno !== "todos" ? parseInt(filtroAno) : undefined,
    especialidadeId: filtroEspecialidade !== "todas" ? parseInt(filtroEspecialidade) : undefined,
    busca: busca || undefined,
    pageSize: 1,
    page: 1,
  };
  const { data: totalTodasData } = trpc.avaliacoes.questoes.listComImagem.useQuery(
    { ...baseFilters, statusImagem: "todas" }
  );
  const { data: totalComImagemData } = trpc.avaliacoes.questoes.listComImagem.useQuery(
    { ...baseFilters, statusImagem: "com_imagem" }
  );
  const { data: totalSemImagemData } = trpc.avaliacoes.questoes.listComImagem.useQuery(
    { ...baseFilters, statusImagem: "sem_imagem" }
  );

  // Buscar alternativas ao abrir edição
  const { data: questaoComAlts, isLoading: loadingAlts } = trpc.avaliacoes.questoes.getWithAlternativas.useQuery(
    { questaoId: questaoSelecionada?.id ?? 0 },
    { enabled: editDialogOpen && !!questaoSelecionada }
  );

  const questoes = questoesData?.questoes ?? [];
  const totalQuestoes = questoesData?.total ?? 0;
  const totalPages = questoesData?.totalPages ?? 1;
  // Totais reais vindos do backend (não da página atual)
  const totalComImagem = totalComImagemData?.total ?? 0;
  const totalSemImagem = totalSemImagemData?.total ?? 0;
  const totalTodas = totalTodasData?.total ?? 0;

  const uploadMutation = trpc.avaliacoes.questoes.uploadImagem.useMutation({
    onSuccess: () => {
      toast.success("Imagem adicionada com sucesso!");
      setUploadDialogOpen(false);
      setQuestaoSelecionada(null);
      setImagemPreview(null);
      refetch();
    },
    onError: (error) => toast.error(error.message || "Erro ao fazer upload da imagem"),
  });

  const removeMutation = trpc.avaliacoes.questoes.removeImagem.useMutation({
    onSuccess: () => {
      toast.success("Imagem removida com sucesso!");
      refetch();
    },
    onError: (error) => toast.error(error.message || "Erro ao remover imagem"),
  });

  const editarMutation = trpc.avaliacoes.questoes.editar.useMutation({
    onSuccess: () => {
      toast.success("Questão atualizada com sucesso!");
      setEditDialogOpen(false);
      setQuestaoSelecionada(null);
      refetch();
    },
    onError: (error) => toast.error(error.message || "Erro ao editar questão"),
  });

  // Processar arquivo de imagem
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
    reader.onload = (e) => setImagemPreview(e.target?.result as string);
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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = () => {
    if (!imagemPreview || !questaoSelecionada) return;
    const mimeMatch = imagemPreview.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    uploadMutation.mutate({ questaoId: questaoSelecionada.id, imageBase64: imagemPreview, mimeType });
  };

  const handleOpenUpload = (questao: any) => {
    setQuestaoSelecionada(questao);
    setImagemPreview(questao.imageUrl || null);
    setUploadDialogOpen(true);
  };

  const handleOpenEdit = (questao: any) => {
    setQuestaoSelecionada(questao);
    setEditEnunciado(questao.enunciado);
    setEditFonte(questao.fonte || "");
    setEditAno(questao.ano ? String(questao.ano) : "");
    setEditEspecialidadeId(questao.especialidadeId ? String(questao.especialidadeId) : "");
    setEditAlternativas([]);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!questaoSelecionada || !questaoComAlts) return;
    const alts = editAlternativas.length > 0 ? editAlternativas : questaoComAlts.alternativas;
    editarMutation.mutate({
      questaoId: questaoSelecionada.id,
      enunciado: editEnunciado,
      fonte: editFonte || undefined,
      ano: editAno ? parseInt(editAno) : undefined,
      especialidadeId: editEspecialidadeId ? parseInt(editEspecialidadeId) : undefined,
      alternativas: alts.map((a: any) => ({
        id: a.id,
        texto: a.texto,
        isCorreta: a.isCorreta,
      })),
    });
  };

  // Inicializar alternativas quando carregadas
  const currentAlts = editAlternativas.length > 0
    ? editAlternativas
    : (questaoComAlts?.alternativas ?? []);

  const handleAltChange = (idx: number, field: "texto" | "isCorreta", value: any) => {
    const base = editAlternativas.length > 0 ? editAlternativas : (questaoComAlts?.alternativas ?? []);
    const updated = base.map((a: any, i: number) => {
      if (field === "isCorreta") {
        return { ...a, isCorreta: i === idx ? 1 : 0 };
      }
      return i === idx ? { ...a, texto: value } : a;
    });
    setEditAlternativas(updated);
  };

  const handleFiltroChange = () => setPage(1);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Gerenciar Questões
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edite enunciados, alternativas e imagens de qualquer questão do banco.
          </p>
        </div>
        <Link href="/admin/avaliacoes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Cards de resumo com totais reais do banco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all ${filtroStatus === "todas" ? "ring-2 ring-primary" : "hover:shadow-md"}`}
          onClick={() => { setFiltroStatus("todas"); handleFiltroChange(); }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Questões</p>
                <p className="text-2xl font-bold">{totalTodas}</p>
              </div>
              <Image className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${filtroStatus === "com_imagem" ? "ring-2 ring-green-500" : "hover:shadow-md"}`}
          onClick={() => { setFiltroStatus("com_imagem"); handleFiltroChange(); }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Com Imagem</p>
                <p className="text-2xl font-bold text-green-600">{totalComImagem}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${filtroStatus === "sem_imagem" ? "ring-2 ring-orange-500" : "hover:shadow-md"}`}
          onClick={() => { setFiltroStatus("sem_imagem"); handleFiltroChange(); }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente de Imagem</p>
                <p className="text-2xl font-bold text-orange-600">{totalSemImagem}</p>
                <p className="text-xs text-muted-foreground mt-1">Marcadas na planilha, sem upload</p>
              </div>
              <AlertCircle className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {/* Busca por texto */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no enunciado..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); handleFiltroChange(); }}
            className="pl-9"
          />
        </div>

        {/* Filtro por Prova/Fonte */}
        <Select value={filtroFonte} onValueChange={(v) => { setFiltroFonte(v); handleFiltroChange(); }}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Prova" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as provas</SelectItem>
            {(fontes ?? []).map((f: string) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Ano */}
        <Select value={filtroAno} onValueChange={(v) => { setFiltroAno(v); handleFiltroChange(); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {(anos ?? []).map((a: number) => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por Especialidade */}
        <Select value={filtroEspecialidade} onValueChange={(v) => { setFiltroEspecialidade(v); handleFiltroChange(); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as especialidades</SelectItem>
            {(especialidades ?? []).map((esp: any) => (
              <SelectItem key={esp.id} value={String(esp.id)}>{esp.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de questões */}
      <Card>
        <CardHeader>
          <CardTitle>Questões</CardTitle>
          <CardDescription>
            {totalQuestoes} questão(ões) encontrada(s) — página {page} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando questões...</div>
          ) : questoes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Nenhuma questão encontrada.</div>
          ) : (
            <div className="space-y-3">
              {questoes.map((questao: any) => (
                <div
                  key={questao.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  {/* Miniatura ou placeholder */}
                  <div className="mt-1 flex-shrink-0">
                    {questao.imageUrl ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden border">
                        <img src={questao.imageUrl} alt="Miniatura" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/30">
                        <Image className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">#{questao.id}</span>
                      {questao.fonte && (
                        <Badge variant="outline" className="text-xs">
                          {questao.fonte}{questao.ano ? ` ${questao.ano}` : ""}
                        </Badge>
                      )}
                      {questao.imageUrl ? (
                        <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-200">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Com imagem
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Sem imagem
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2 text-foreground">{questao.enunciado}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 flex-shrink-0">
                    {questao.imageUrl && (
                      <Button variant="outline" size="sm" onClick={() => { setPreviewQuestao(questao); setPreviewDialogOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(questao)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={questao.imageUrl ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleOpenUpload(questao)}
                    >
                      <Upload className="mr-1 h-4 w-4" />
                      {questao.imageUrl ? "Alterar" : "Imagem"}
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalQuestoes)} de {totalQuestoes}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Upload de Imagem */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        if (!open) { setUploadDialogOpen(false); setQuestaoSelecionada(null); setImagemPreview(null); }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{questaoSelecionada?.imageUrl ? "Alterar Imagem" : "Adicionar Imagem"}</DialogTitle>
            <DialogDescription>
              Questão #{questaoSelecionada?.id}
              {questaoSelecionada?.fonte ? ` — ${questaoSelecionada.fonte}${questaoSelecionada.ano ? ` ${questaoSelecionada.ano}` : ""}` : ""}
            </DialogDescription>
          </DialogHeader>

          {questaoSelecionada && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm max-h-32 overflow-y-auto">
              <p className="font-medium text-xs text-muted-foreground mb-1">Enunciado:</p>
              <p>{questaoSelecionada.enunciado}</p>
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagemPreview ? (
              <div className="relative">
                <img src={imagemPreview} alt="Preview" className="max-h-64 mx-auto rounded-md object-contain" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => { e.stopPropagation(); setImagemPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Arraste uma imagem ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, GIF — máximo 5MB</p>
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); setQuestaoSelecionada(null); setImagemPreview(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={!imagemPreview || uploadMutation.isPending}>
              {uploadMutation.isPending ? "Enviando..." : "Salvar Imagem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição da Questão */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) { setEditDialogOpen(false); setQuestaoSelecionada(null); setEditAlternativas([]); }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Questão #{questaoSelecionada?.id}</DialogTitle>
            <DialogDescription>
              Altere o enunciado, as alternativas ou os metadados da questão.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Metadados */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prova / Fonte</Label>
                <Input
                  value={editFonte}
                  onChange={(e) => setEditFonte(e.target.value)}
                  placeholder="Ex.: TARO, TEOT, SBOT 1000"
                />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={editAno}
                  onChange={(e) => setEditAno(e.target.value)}
                  placeholder="Ex.: 2023"
                />
              </div>
            </div>

            {/* Especialidade */}
            <div className="space-y-2">
              <Label>Especialidade / Área de Conhecimento</Label>
              <Select
                value={editEspecialidadeId}
                onValueChange={setEditEspecialidadeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade..." />
                </SelectTrigger>
                <SelectContent>
                  {(especialidades ?? []).map((esp: any) => (
                    <SelectItem key={esp.id} value={String(esp.id)}>
                      {esp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enunciado */}
            <div className="space-y-2">
              <Label>Enunciado</Label>
              <Textarea
                value={editEnunciado}
                onChange={(e) => setEditEnunciado(e.target.value)}
                rows={5}
                className="resize-y"
                placeholder="Texto completo da questão..."
              />
            </div>

            {/* Alternativas */}
            <div className="space-y-3">
              <Label>Alternativas</Label>
              {loadingAlts ? (
                <p className="text-sm text-muted-foreground">Carregando alternativas...</p>
              ) : currentAlts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma alternativa encontrada.</p>
              ) : (
                currentAlts.map((alt: any, idx: number) => (
                  <div key={alt.id} className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-2 flex-shrink-0">
                      <input
                        type="radio"
                        name="correta"
                        checked={alt.isCorreta === 1}
                        onChange={() => handleAltChange(idx, "isCorreta", 1)}
                        className="w-4 h-4 accent-primary"
                        title="Marcar como correta"
                      />
                      <span className="text-sm font-semibold w-5">{String.fromCharCode(65 + idx)}.</span>
                    </div>
                    <Textarea
                      value={alt.texto}
                      onChange={(e) => handleAltChange(idx, "texto", e.target.value)}
                      rows={2}
                      className={`resize-y flex-1 text-sm ${alt.isCorreta === 1 ? "border-green-500 bg-green-50 dark:bg-green-900/10" : ""}`}
                    />
                  </div>
                ))
              )}
              <p className="text-xs text-muted-foreground">Selecione o botão de rádio ao lado da alternativa correta.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setQuestaoSelecionada(null); setEditAlternativas([]); }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={editarMutation.isPending || loadingAlts || currentAlts.length === 0}>
              {editarMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Questão #{previewQuestao?.id} — Visualização</DialogTitle>
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
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
