import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ClipboardList, Pencil, Loader2, Save, X } from "lucide-react";
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
    onError: (err) => {
      toast.error("Erro ao atualizar: " + err.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: row.id,
      nomeResidente: form.nomeResidente,
      preceptorHabilidades: form.preceptorHabilidades,
      preceptorAtendimento: form.preceptorAtendimento,
      dataLimite: form.dataLimite || undefined,
    });
  };

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
            <Label htmlFor="nome">Nome do Residente</Label>
            <Input
              id="nome"
              value={form.nomeResidente}
              onChange={(e) => setForm((f) => ({ ...f, nomeResidente: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="habilidades">Preceptor — Habilidades Cirúrgicas</Label>
            <Input
              id="habilidades"
              value={form.preceptorHabilidades}
              onChange={(e) => setForm((f) => ({ ...f, preceptorHabilidades: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="atendimento">Preceptor — Atendimento Clínico</Label>
            <Input
              id="atendimento"
              value={form.preceptorAtendimento}
              onChange={(e) => setForm((f) => ({ ...f, preceptorAtendimento: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataLimite">Data Limite (DD/MM/AAAA)</Label>
            <Input
              id="dataLimite"
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
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Salvar
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
}: {
  rows: AvaliacaoRow[];
  onEdit: (row: AvaliacaoRow) => void;
}) {
  const residentes = Array.from(new Set(rows.map((r) => r.codigoResidente))).sort();

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
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span>{nome}</span>
                <span className="text-xs text-muted-foreground font-normal">({codigo})</span>
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
                      <th className="px-4 py-2"></th>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onEdit(av)}
                          >
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
  const ANO = 2026;
  const [editRow, setEditRow] = useState<AvaliacaoRow | null>(null);

  const utils = trpc.useUtils();
  const { data: rows = [], isLoading } = trpc.escalaAvaliacoes.list.useQuery({ ano: ANO });

  const rowsByAno = (ano: "R1" | "R2" | "R3") => rows.filter((r) => r.anoResidencia === ano);

  const handleSaved = () => {
    utils.escalaAvaliacoes.list.invalidate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Gerenciar Escala de Avaliações Práticas — {ANO}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edite os preceptores responsáveis e as datas limite de cada avaliação.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="R1" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-xs">
            <TabsTrigger value="R1">R1</TabsTrigger>
            <TabsTrigger value="R2">R2</TabsTrigger>
            <TabsTrigger value="R3">R3</TabsTrigger>
          </TabsList>

          {(["R1", "R2", "R3"] as const).map((ano) => (
            <TabsContent key={ano} value={ano}>
              <TabelaAno rows={rowsByAno(ano)} onEdit={setEditRow} />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
