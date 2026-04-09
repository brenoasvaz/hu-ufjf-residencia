import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileText,
  X,
  User,
  Calendar,
  BookMarked,
  Loader2,
  Search,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i);

type Artigo = {
  id: number;
  data: Date;
  tituloArtigo: string;
  autores: string | null;
  revista: string | null;
  anoPublicacao: number | null;
  residenteApresentador: string | null;
  preceptor: string | null;
  observacao: string | null;
  pdfUrl: string | null;
  pdfKey: string | null;
  pdfNome: string | null;
  ativo: number;
  createdAt: Date;
  updatedAt: Date;
};

type FormData = {
  data: string;
  tituloArtigo: string;
  autores: string;
  revista: string;
  anoPublicacao: string;
  residenteApresentador: string;
  preceptor: string;
  observacao: string;
};

const emptyForm: FormData = {
  data: "",
  tituloArtigo: "",
  autores: "",
  revista: "",
  anoPublicacao: "",
  residenteApresentador: "",
  preceptor: "",
  observacao: "",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function toDateInputValue(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function groupByDate(artigos: Artigo[]): Map<string, Artigo[]> {
  const map = new Map<string, Artigo[]>();
  for (const artigo of artigos) {
    const key = toDateInputValue(artigo.data);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(artigo);
  }
  return map;
}

export default function ClubeRevista() {
  const currentDate = new Date();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";

  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [showForm, setShowForm] = useState(false);
  const [editingArtigo, setEditingArtigo] = useState<Artigo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [removingPdfId, setRemovingPdfId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadId, setPendingUploadId] = useState<number | null>(null);

  // Estados para troca de datas
  const [swapMode, setSwapMode] = useState(false);
  const [swapIdA, setSwapIdA] = useState<number | null>(null);
  const [swapIdB, setSwapIdB] = useState<number | null>(null);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);

  // Queries
  const { data: artigos, isLoading } = trpc.clubeRevista.list.useQuery({
    year: selectedYear,
    month: selectedMonth,
  });

  // Mutations
  const createMutation = trpc.clubeRevista.create.useMutation({
    onSuccess: () => {
      utils.clubeRevista.list.invalidate();
      toast.success("Artigo adicionado ao cronograma!");
      setShowForm(false);
      setFormData(emptyForm);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateMutation = trpc.clubeRevista.update.useMutation({
    onSuccess: () => {
      utils.clubeRevista.list.invalidate();
      toast.success("Artigo atualizado!");
      setEditingArtigo(null);
      setFormData(emptyForm);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteMutation = trpc.clubeRevista.delete.useMutation({
    onSuccess: () => {
      utils.clubeRevista.list.invalidate();
      toast.success("Artigo removido do cronograma.");
      setDeletingId(null);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const uploadPDFMutation = trpc.clubeRevista.uploadPDF.useMutation({
    onSuccess: () => {
      utils.clubeRevista.list.invalidate();
      toast.success("PDF enviado com sucesso!");
      setUploadingId(null);
      setPendingUploadId(null);
    },
    onError: (e) => {
      toast.error(`Erro ao enviar PDF: ${e.message}`);
      setUploadingId(null);
    },
  });

  const removePDFMutation = trpc.clubeRevista.removePDF.useMutation({
    onSuccess: () => {
      utils.clubeRevista.list.invalidate();
      toast.success("PDF removido.");
      setRemovingPdfId(null);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const swapDatesMutation = trpc.clubeRevista.swapDates.useMutation({
    onSuccess: () => {
      utils.clubeRevista.list.invalidate();
      toast.success("Datas trocadas com sucesso!");
      setSwapMode(false);
      setSwapIdA(null);
      setShowSwapConfirm(false);
    },
    onError: (e) => {
      toast.error(`Erro ao trocar datas: ${e.message}`);
      setShowSwapConfirm(false);
    },
  });

  // Handler para seleção de artigo no modo troca
  const handleSwapSelect = (id: number) => {
    if (!swapMode) return;
    if (swapIdA === null) {
      setSwapIdA(id);
    } else if (swapIdA === id) {
      // Deselecionar o primeiro
      setSwapIdA(null);
    } else {
      // Segundo artigo selecionado — abrir confirmação
      setSwapIdB(id);
      setShowSwapConfirm(true);
    }
  };

  // Artigos selecionados para troca
  const swapArtigoA = artigos?.find((a) => a.id === swapIdA) ?? null;
  const swapArtigoB = artigos?.find((a) => a.id === swapIdB) ?? null;

  const handleCancelSwap = () => {
    setSwapMode(false);
    setSwapIdA(null);
    setSwapIdB(null);
    setShowSwapConfirm(false);
  };

  // Handlers
  const handleOpenCreate = () => {
    setFormData({
      ...emptyForm,
      data: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`,
    });
    setEditingArtigo(null);
    setShowForm(true);
  };

  const handleOpenEdit = (artigo: Artigo) => {
    setFormData({
      data: toDateInputValue(artigo.data),
      tituloArtigo: artigo.tituloArtigo,
      autores: artigo.autores ?? "",
      revista: artigo.revista ?? "",
      anoPublicacao: artigo.anoPublicacao ? String(artigo.anoPublicacao) : "",
      residenteApresentador: artigo.residenteApresentador ?? "",
      preceptor: artigo.preceptor ?? "",
      observacao: artigo.observacao ?? "",
    });
    setEditingArtigo(artigo);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.tituloArtigo.trim()) {
      toast.error("O título do artigo é obrigatório.");
      return;
    }
    if (!formData.data) {
      toast.error("A data é obrigatória.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        data: formData.data,
        tituloArtigo: formData.tituloArtigo.trim(),
        autores: formData.autores.trim() || undefined,
        revista: formData.revista.trim() || undefined,
        anoPublicacao: formData.anoPublicacao ? parseInt(formData.anoPublicacao) : undefined,
        residenteApresentador: formData.residenteApresentador.trim() || undefined,
        preceptor: formData.preceptor.trim() || undefined,
        observacao: formData.observacao.trim() || undefined,
      };
      if (editingArtigo) {
        await updateMutation.mutateAsync({ id: editingArtigo.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadId) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 20 MB.");
      return;
    }

    setUploadingId(pendingUploadId);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      await uploadPDFMutation.mutateAsync({
        id: pendingUploadId,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type || "application/pdf",
      });
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = (id: number) => {
    setPendingUploadId(id);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  // Filtro de busca client-side
  const filteredArtigos = useMemo(() => {
    if (!artigos) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return artigos;
    return artigos.filter((a) => {
      return (
        a.tituloArtigo.toLowerCase().includes(q) ||
        (a.autores?.toLowerCase().includes(q) ?? false) ||
        (a.revista?.toLowerCase().includes(q) ?? false) ||
        (a.residenteApresentador?.toLowerCase().includes(q) ?? false) ||
        (a.preceptor?.toLowerCase().includes(q) ?? false) ||
        (a.observacao?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [artigos, searchQuery]);

  const grouped = groupByDate(filteredArtigos);
  const sortedDates = Array.from(grouped.keys()).sort();

  return (
    <div className="container py-6 max-w-4xl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-emerald-600" />
              Clube de Revista
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Cronograma de apresentações de artigos científicos
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 w-full sm:w-auto">
              {swapMode ? (
                <Button
                  onClick={handleCancelSwap}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none border-amber-400 text-amber-700 hover:bg-amber-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar Troca
                </Button>
              ) : (
                <Button
                  onClick={() => setSwapMode(true)}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-1" />
                  Trocar Datas
                </Button>
              )}
              <Button onClick={handleOpenCreate} size="sm" className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-1" />
                Novo Artigo
              </Button>
            </div>
          )}
        </div>

        {/* Busca */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por título, autor, revista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Ano</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Mês</Label>
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Banner modo troca de datas */}
      {swapMode && (
        <div className="mb-4 p-3 rounded-lg border border-amber-300 bg-amber-50 flex items-start gap-3">
          <ArrowLeftRight className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              Modo Troca de Datas ativo
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {swapIdA === null
                ? "Clique no primeiro artigo cuja data deseja trocar."
                : `"${swapArtigoA?.tituloArtigo}" selecionado. Agora clique no segundo artigo.`}
            </p>
          </div>
          {swapIdA !== null && (
            <button
              onClick={() => setSwapIdA(null)}
              className="text-amber-600 hover:text-amber-800 transition-colors shrink-0"
              title="Deselecionar primeiro artigo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Conteúdo */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground font-medium">
                  Nenhum artigo encontrado para &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo;.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente buscar por outro termo ou limpe a busca para ver todos os artigos.
                </p>
                <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Limpar busca
                </Button>
              </>
            ) : (
              <>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground font-medium">
                  Nenhum artigo agendado para{" "}
                  {MONTHS.find((m) => m.value === selectedMonth)?.label} de {selectedYear}.
                </p>
                {isAdmin && (
                  <Button onClick={handleOpenCreate} variant="outline" className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar primeiro artigo
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dayArtigos = grouped.get(dateKey)!;
            const firstArtigo = dayArtigos[0];
            const dateLabel = formatDate(firstArtigo.data);

            return (
              <div key={dateKey}>
                {/* Data header */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-foreground capitalize">{dateLabel}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3">
                  {dayArtigos.map((artigo) => {
                    const isSwapSelected = artigo.id === swapIdA;
                    return (
                    <Card
                      key={artigo.id}
                      className={[
                        "border transition-all",
                        swapMode
                          ? isSwapSelected
                            ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300 cursor-pointer"
                            : "border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer"
                          : "border-border hover:border-emerald-200",
                      ].join(" ")}
                      onClick={() => swapMode && handleSwapSelect(artigo.id)}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          {/* Info principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                              <FileText className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              <p className="font-semibold text-sm leading-snug flex-1">
                                {artigo.tituloArtigo}
                              </p>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {artigo.autores && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {artigo.autores}
                                </span>
                              )}
                              {artigo.revista && (
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {artigo.revista}
                                  {artigo.anoPublicacao && `, ${artigo.anoPublicacao}`}
                                </span>
                              )}
                              {artigo.residenteApresentador && (
                                <Badge variant="secondary" className="text-xs h-5">
                                  Apresentador: {artigo.residenteApresentador}
                                </Badge>
                              )}
                              {artigo.preceptor && (
                                <Badge variant="outline" className="text-xs h-5">
                                  {artigo.preceptor}
                                </Badge>
                              )}
                            </div>

                            {artigo.observacao && (
                              <p className="mt-2 text-xs text-muted-foreground italic border-l-2 border-emerald-200 pl-2">
                                {artigo.observacao}
                              </p>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                            {/* Download PDF */}
                            {artigo.pdfUrl ? (
                              <a
                                href={artigo.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={artigo.pdfNome ?? "artigo.pdf"}
                                title={artigo.pdfNome ? `Baixar: ${artigo.pdfNome}` : "Baixar PDF"}
                              >
                                <Button
                                  size="sm"
                                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Baixar PDF
                                </Button>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 rounded border border-dashed border-muted-foreground/30">
                                <FileText className="h-3 w-3" />
                                Sem PDF
                              </span>
                            )}

                            {/* Admin actions */}
                            {isAdmin && (
                              <>
                                {/* Upload PDF */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleUploadClick(artigo.id)}
                                  disabled={uploadingId === artigo.id}
                                >
                                  {uploadingId === artigo.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {artigo.pdfUrl ? "Trocar PDF" : "Enviar PDF"}
                                  </span>
                                </Button>

                                {/* Remove PDF */}
                                {artigo.pdfUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => setRemovingPdfId(artigo.id)}
                                    disabled={removePDFMutation.isPending && removingPdfId === artigo.id}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                )}

                                {/* Edit */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEdit(artigo)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>

                                {/* Delete */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setDeletingId(artigo.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog: Criar / Editar */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false);
            setEditingArtigo(null);
            setFormData(emptyForm);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArtigo ? "Editar Artigo" : "Novo Artigo no Cronograma"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do artigo científico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="data">Data da Apresentação *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData((f) => ({ ...f, data: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="titulo">Título do Artigo *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Artroscopia do joelho: revisão sistemática..."
                  value={formData.tituloArtigo}
                  onChange={(e) => setFormData((f) => ({ ...f, tituloArtigo: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="autores">Autores</Label>
                <Input
                  id="autores"
                  placeholder="Ex: Silva JA, Costa MB, et al."
                  value={formData.autores}
                  onChange={(e) => setFormData((f) => ({ ...f, autores: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="revista">Revista / Journal</Label>
                <Input
                  id="revista"
                  placeholder="Ex: JBJS, Arthroscopy..."
                  value={formData.revista}
                  onChange={(e) => setFormData((f) => ({ ...f, revista: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ano">Ano de Publicação</Label>
                <Input
                  id="ano"
                  type="number"
                  placeholder="Ex: 2024"
                  min={1900}
                  max={2100}
                  value={formData.anoPublicacao}
                  onChange={(e) => setFormData((f) => ({ ...f, anoPublicacao: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="residente">Residente Apresentador</Label>
                <Input
                  id="residente"
                  placeholder="Ex: R2 - João Silva"
                  value={formData.residenteApresentador}
                  onChange={(e) => setFormData((f) => ({ ...f, residenteApresentador: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="preceptor">Preceptor</Label>
                <Input
                  id="preceptor"
                  placeholder="Ex: Dr. Igor Bonato"
                  value={formData.preceptor}
                  onChange={(e) => setFormData((f) => ({ ...f, preceptor: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="obs">Observação</Label>
                <Textarea
                  id="obs"
                  placeholder="Informações adicionais..."
                  value={formData.observacao}
                  onChange={(e) => setFormData((f) => ({ ...f, observacao: e.target.value }))}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingArtigo(null);
                setFormData(emptyForm);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editingArtigo ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar exclusão */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover artigo do cronograma?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O artigo será removido permanentemente do cronograma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId && deleteMutation.mutate({ id: deletingId })}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Confirmar troca de datas */}
      <Dialog
        open={showSwapConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowSwapConfirm(false);
            setSwapIdB(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-amber-600" />
              Confirmar Troca de Datas
            </DialogTitle>
            <DialogDescription>
              As datas dos dois artigos abaixo serão trocadas entre si.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Artigo A */}
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Artigo 1</p>
              <p className="text-sm font-medium leading-snug">{swapArtigoA?.tituloArtigo}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Data atual: <span className="font-medium">{swapArtigoA ? formatDate(swapArtigoA.data) : ""}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Artigo B */}
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Artigo 2</p>
              <p className="text-sm font-medium leading-snug">{swapArtigoB?.tituloArtigo}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Data atual: <span className="font-medium">{swapArtigoB ? formatDate(swapArtigoB.data) : ""}</span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-1">
              Após a troca: o Artigo 1 passará para a data do Artigo 2 e vice-versa.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSwapConfirm(false);
                setSwapIdB(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={swapDatesMutation.isPending}
              onClick={() => {
                if (swapIdA !== null && swapIdB !== null) {
                  swapDatesMutation.mutate({ idA: swapIdA, idB: swapIdB });
                }
              }}
            >
              {swapDatesMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Confirmar Troca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Confirmar remoção de PDF */}
      <AlertDialog open={removingPdfId !== null} onOpenChange={(open) => !open && setRemovingPdfId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover PDF?</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo PDF será desvinculado deste artigo. O artigo continuará no cronograma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingPdfId && removePDFMutation.mutate({ id: removingPdfId })}
            >
              Remover PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
