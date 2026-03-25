import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ClipboardList, Pencil, Loader2, Save, X, Plus, Trash2, ChevronLeft, ChevronRight, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AvaliacaoRow {
  id: number;
  ano: number;
  anoResidencia: "R1" | "R2" | "R3";
  codigoResidente: string;
  nomeResidente: string;
  quadrimestre: "1" | "2" | "3";
  preceptorHabilidades: string;
  preceptorAtendimento: string;
  dataLimite: string | null;
}

const QUAD_LABEL: Record<string, string> = {
  "1": "1º Quadrimestre",
  "2": "2º Quadrimestre",
  "3": "3º Quadrimestre",
};

const QUAD_COLORS: Record<string, string> = {
  "1": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  "2": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "3": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
};

const ANO_RESIDENCIA_OPTIONS = ["R1", "R2", "R3"] as const;
const QUAD_OPTIONS = ["1", "2", "3"] as const;

// ─── Modal de Edição ──────────────────────────────────────────────────────────

function EditModal({
  row,
  onClose,
  onSaved,
}: {
  row: AvaliacaoRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nomeResidente: row.nomeResidente,
    preceptorHabilidades: row.preceptorHabilidades,
    preceptorAtendimento: row.preceptorAtendimento,
    dataLimite: row.dataLimite ?? "",
  });

  const updateMutation = trpc.escalaAvaliacoes.update.useMutation({
    onSuccess: () => {
      toast.success("Avaliação atualizada com sucesso");
      onSaved();
      onClose();
    },
    onError: (err) => toast.error("Erro ao atualizar: " + err.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Editar Avaliação — {row.codigoResidente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={QUAD_COLORS[row.quadrimestre]}>
              {QUAD_LABEL[row.quadrimestre]}
            </Badge>
            <span className="text-sm text-muted-foreground">Ano {row.ano}</span>
          </div>

          <div className="space-y-2">
            <Label>Nome do Residente</Label>
            <Input
              value={form.nomeResidente}
              onChange={(e) => setForm((f) => ({ ...f, nomeResidente: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Preceptor — Habilidades Cirúrgicas</Label>
            <Input
              value={form.preceptorHabilidades}
              onChange={(e) => setForm((f) => ({ ...f, preceptorHabilidades: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Preceptor — Atendimento Clínico</Label>
            <Input
              value={form.preceptorAtendimento}
              onChange={(e) => setForm((f) => ({ ...f, preceptorAtendimento: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Data Limite (DD/MM/AAAA)</Label>
            <Input
              placeholder="Ex: 28/05/2026"
              value={form.dataLimite}
              onChange={(e) => setForm((f) => ({ ...f, dataLimite: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
          <Button
            onClick={() => updateMutation.mutate({ id: row.id, ...form, dataLimite: form.dataLimite || undefined })}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal de Novo Residente ──────────────────────────────────────────────────

function NovoResidenteModal({
  ano,
  onClose,
  onSaved,
}: {
  ano: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nomeResidente: "",
    codigoResidente: "",
    anoResidencia: "R1" as "R1" | "R2" | "R3",
    // 3 quadrimestres
    q1_habilidades: "",
    q1_atendimento: "",
    q1_dataLimite: "",
    q2_habilidades: "",
    q2_atendimento: "",
    q2_dataLimite: "",
    q3_habilidades: "",
    q3_atendimento: "",
    q3_dataLimite: "",
  });

  const createMutation = trpc.escalaAvaliacoes.create.useMutation();

  const handleSave = async () => {
    if (!form.nomeResidente.trim() || !form.codigoResidente.trim()) {
      toast.error("Preencha o nome e o código do residente");
      return;
    }

    const quads = [
      { q: "1" as const, hab: form.q1_habilidades, ate: form.q1_atendimento, dl: form.q1_dataLimite },
      { q: "2" as const, hab: form.q2_habilidades, ate: form.q2_atendimento, dl: form.q2_dataLimite },
      { q: "3" as const, hab: form.q3_habilidades, ate: form.q3_atendimento, dl: form.q3_dataLimite },
    ];

    for (const { q, hab, ate, dl } of quads) {
      if (!hab.trim() || !ate.trim()) {
        toast.error(`Preencha os preceptores do ${QUAD_LABEL[q]}`);
        return;
      }
      await createMutation.mutateAsync({
        ano,
        anoResidencia: form.anoResidencia,
        codigoResidente: form.codigoResidente.trim(),
        nomeResidente: form.nomeResidente.trim(),
        quadrimestre: q,
        preceptorHabilidades: hab.trim(),
        preceptorAtendimento: ate.trim(),
        dataLimite: dl.trim() || undefined,
      });
    }

    toast.success(`Residente ${form.nomeResidente} cadastrado com sucesso`);
    onSaved();
    onClose();
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Residente — {ano}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Dados do residente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input placeholder="Ex: João Silva" value={form.nomeResidente} onChange={set("nomeResidente")} />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input placeholder="Ex: R1d" value={form.codigoResidente} onChange={set("codigoResidente")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ano de Residência</Label>
            <Select
              value={form.anoResidencia}
              onValueChange={(v) => setForm((f) => ({ ...f, anoResidencia: v as "R1" | "R2" | "R3" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANO_RESIDENCIA_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quadrimestres */}
          {([
            { q: "1", habKey: "q1_habilidades", ateKey: "q1_atendimento", dlKey: "q1_dataLimite" },
            { q: "2", habKey: "q2_habilidades", ateKey: "q2_atendimento", dlKey: "q2_dataLimite" },
            { q: "3", habKey: "q3_habilidades", ateKey: "q3_atendimento", dlKey: "q3_dataLimite" },
          ] as const).map(({ q, habKey, ateKey, dlKey }) => (
            <div key={q} className="rounded-lg border p-3 space-y-3">
              <Badge variant="secondary" className={QUAD_COLORS[q]}>
                {QUAD_LABEL[q]}
              </Badge>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Habilidades Cirúrgicas</Label>
                  <Input
                    placeholder="Nome do preceptor"
                    value={(form as Record<string, string>)[habKey]}
                    onChange={set(habKey)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Atendimento Clínico</Label>
                  <Input
                    placeholder="Nome do preceptor"
                    value={(form as Record<string, string>)[ateKey]}
                    onChange={set(ateKey)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data Limite (DD/MM/AAAA) — opcional</Label>
                <Input
                  placeholder="Ex: 28/05/2026"
                  value={(form as Record<string, string>)[dlKey]}
                  onChange={set(dlKey)}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tabela por grupo de ano ───────────────────────────────────────────────────

function TabelaAno({
  rows,
  onEdit,
  onDelete,
}: {
  rows: AvaliacaoRow[];
  onEdit: (row: AvaliacaoRow) => void;
  onDelete: (row: AvaliacaoRow) => void;
}) {
  const residentes = Array.from(new Set(rows.map((r) => r.codigoResidente))).sort();

  if (residentes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">Nenhum residente cadastrado para este ano.</p>
        <p className="text-xs mt-1">Use o botão "Novo Residente" para adicionar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {residentes.map((codigo) => {
        const avaliacoes = rows
          .filter((r) => r.codigoResidente === codigo)
          .sort((a, b) => Number(a.quadrimestre) - Number(b.quadrimestre));
        const nome = avaliacoes[0]?.nomeResidente ?? codigo;

        return (
          <Card key={codigo}>
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{nome}</span>
                  <span className="text-xs text-muted-foreground font-normal">({codigo})</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Excluir residente (todos os quadrimestres)"
                  onClick={() => onDelete(avaliacoes[0])}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/10">
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Quadrimestre</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Habilidades</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Atendimento</th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Data Limite</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {avaliacoes.map((av) => (
                      <tr key={av.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-2">
                          <Badge variant="secondary" className={`text-xs ${QUAD_COLORS[av.quadrimestre]}`}>
                            {QUAD_LABEL[av.quadrimestre]}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{av.preceptorHabilidades}</td>
                        <td className="px-4 py-2">{av.preceptorAtendimento}</td>
                        <td className="px-4 py-2 text-muted-foreground">{av.dataLimite ?? "—"}</td>
                        <td className="px-4 py-2">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(av)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminEscalaAvaliacoes() {
  const currentYear = new Date().getFullYear();
  const [ano, setAno] = useState(currentYear);
  const [editRow, setEditRow] = useState<AvaliacaoRow | null>(null);
  const [deleteRow, setDeleteRow] = useState<AvaliacaoRow | null>(null);
  const [showNovo, setShowNovo] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  const utils = trpc.useUtils();
  const { data: rows = [], isLoading } = trpc.escalaAvaliacoes.list.useQuery({ ano });

  const copyMutation = trpc.escalaAvaliacoes.copyYear.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Escala copiada: ${result.copiados} registro(s) copiado(s)` +
        (result.ignorados > 0 ? ` (${result.ignorados} já existiam ou eram R3 formados)` : "")
      );
      utils.escalaAvaliacoes.list.invalidate();
      setShowCopy(false);
    },
    onError: (err) => toast.error("Erro ao copiar: " + err.message),
  });

  const deleteMutation = trpc.escalaAvaliacoes.delete.useMutation({
    onSuccess: () => {
      toast.success("Residente excluído com sucesso");
      utils.escalaAvaliacoes.list.invalidate();
      setDeleteRow(null);
    },
    onError: (err) => toast.error("Erro ao excluir: " + err.message),
  });

  const handleSaved = () => utils.escalaAvaliacoes.list.invalidate();

  const rowsByAno = (a: "R1" | "R2" | "R3") => rows.filter((r) => r.anoResidencia === a);

  // Ao excluir, remove todos os registros do residente (3 quadrimestres)
  const handleConfirmDelete = () => {
    if (!deleteRow) return;
    const toDelete = rows.filter((r) => r.codigoResidente === deleteRow.codigoResidente);
    Promise.all(toDelete.map((r) => deleteMutation.mutateAsync({ id: r.id }))).then(() => {
      utils.escalaAvaliacoes.list.invalidate();
      setDeleteRow(null);
    });
  };

  // Anos disponíveis: 2 anos atrás até 3 anos à frente
  const anos = useMemo(() => {
    const base = currentYear;
    return Array.from({ length: 6 }, (_, i) => base - 2 + i);
  }, [currentYear]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Gerenciar Escala de Avaliações Práticas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edite preceptores, datas limite e cadastre novos residentes.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setShowCopy(true)}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar de outro ano
          </Button>
          <Button onClick={() => setShowNovo(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Residente
          </Button>
        </div>
      </div>

      {/* Seletor de ano */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setAno((a) => a - 1)}
          disabled={ano <= anos[0]}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setAno((a) => a + 1)}
          disabled={ano >= anos[anos.length - 1]}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground ml-1">
          {rows.length > 0
            ? `${new Set(rows.map((r) => r.codigoResidente)).size} residente(s) cadastrado(s)`
            : "Nenhum residente para este ano"}
        </span>
      </div>

      {/* Tabelas por ano de residência */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="R1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-xs">
            {ANO_RESIDENCIA_OPTIONS.map((a) => (
              <TabsTrigger key={a} value={a}>
                {a}
                {rowsByAno(a).length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/15 text-primary rounded-full px-1.5 py-0.5">
                    {new Set(rowsByAno(a).map((r) => r.codigoResidente)).size}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {ANO_RESIDENCIA_OPTIONS.map((a) => (
            <TabsContent key={a} value={a}>
              <TabelaAno rows={rowsByAno(a)} onEdit={setEditRow} onDelete={setDeleteRow} />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Modais */}
      {editRow && (
        <EditModal row={editRow} onClose={() => setEditRow(null)} onSaved={handleSaved} />
      )}

      {showNovo && (
        <NovoResidenteModal ano={ano} onClose={() => setShowNovo(false)} onSaved={handleSaved} />
      )}

      {/* Diálogo de cópia de escala */}
      <AlertDialog open={showCopy} onOpenChange={setShowCopy}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copiar escala para {ano}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Esta ação copia todos os residentes do ano de origem para <strong>{ano}</strong>,
                  aplicando a progressão automática:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2"><span className="font-medium">R1</span><ArrowRight className="h-3 w-3" /><span className="font-medium">R2</span></li>
                  <li className="flex items-center gap-2"><span className="font-medium">R2</span><ArrowRight className="h-3 w-3" /><span className="font-medium">R3</span></li>
                  <li className="flex items-center gap-2 text-muted-foreground"><span className="font-medium">R3</span><ArrowRight className="h-3 w-3" /><span>Formados — não copiados</span></li>
                </ul>
                <p className="text-muted-foreground">
                  As datas limite não são copiadas e devem ser redefinidas. Registros já existentes em {ano} não serão sobrescritos.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Label className="text-xs shrink-0">Copiar de:</Label>
                  <Select
                    value={String(copyMutation.variables?.anoOrigem ?? (ano - 1))}
                    onValueChange={() => {}}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.filter((a) => a !== ano).map((a) => (
                        <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const anoOrigem = ano - 1;
                copyMutation.mutate({ anoOrigem, anoDestino: ano });
              }}
              disabled={copyMutation.isPending}
            >
              {copyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              Copiar de {ano - 1} para {ano}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir residente?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os registros de <strong>{deleteRow?.nomeResidente}</strong> ({deleteRow?.codigoResidente}) para{" "}
              <strong>{ano}</strong> serão excluídos permanentemente (3 quadrimestres). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
