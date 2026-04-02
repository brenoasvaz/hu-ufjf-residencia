import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ClinicalMeeting {
  id: number;
  data: Date;
  tema: string;
  tipo: "AULA" | "ARTIGO" | "CASOS_CLINICOS" | "PROVA" | "AVALIACAO" | "EVENTO" | "FERIADO" | "RECESSO";
  preceptor: string | null;
  residenteApresentador: string | null;
  observacao: string | null;
}

interface EditClinicalMeetingDialogProps {
  meeting: ClinicalMeeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se fornecida, pré-preenche a data no modo criação */
  defaultDate?: string;
}

const EMPTY_FORM = {
  data: "",
  tema: "",
  tipo: "AULA" as ClinicalMeeting["tipo"],
  preceptor: "",
  residenteApresentador: "",
  observacao: "",
};

const MEETING_TYPES = [
  { value: "AULA", label: "Aula" },
  { value: "ARTIGO", label: "Artigo da Semana" },
  { value: "CASOS_CLINICOS", label: "Casos Clínicos" },
  { value: "PROVA", label: "Prova" },
  { value: "AVALIACAO", label: "Avaliação" },
  { value: "EVENTO", label: "Evento" },
  { value: "FERIADO", label: "Feriado" },
  { value: "RECESSO", label: "Recesso" },
];

export function EditClinicalMeetingDialog({ meeting, open, onOpenChange, defaultDate }: EditClinicalMeetingDialogProps) {
  const utils = trpc.useUtils();
  const isEditing = !!meeting;
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (meeting) {
      const dateStr = meeting.data instanceof Date
        ? meeting.data.toISOString().split("T")[0]
        : new Date(meeting.data).toISOString().split("T")[0];
      setFormData({
        data: dateStr,
        tema: meeting.tema,
        tipo: meeting.tipo,
        preceptor: meeting.preceptor || "",
        residenteApresentador: meeting.residenteApresentador || "",
        observacao: meeting.observacao || "",
      });
    } else {
      setFormData({ ...EMPTY_FORM, data: defaultDate || "" });
    }
  }, [meeting, open, defaultDate]);

  const createMutation = trpc.clinicalMeetings.create.useMutation({
    onSuccess: () => {
      toast.success("Atividade criada com sucesso!");
      utils.clinicalMeetings.list.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar atividade: ${error.message}`);
    },
  });

  const updateMutation = trpc.clinicalMeetings.update.useMutation({
    onSuccess: () => {
      toast.success("Reunião atualizada com sucesso!");
      utils.clinicalMeetings.list.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar reunião: ${error.message}`);
    },
  });

  const isPending = updateMutation.isPending || createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.data || !formData.tema) return;

    // Parse date as local noon to avoid UTC offset shifting the day
    const [y, m, d] = formData.data.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d, 12, 0, 0);

    if (isEditing) {
      updateMutation.mutate({
        id: meeting.id,
        data: dateObj,
        tema: formData.tema,
        tipo: formData.tipo,
        preceptor: formData.preceptor || undefined,
        residenteApresentador: formData.residenteApresentador || undefined,
        observacao: formData.observacao || undefined,
      });
    } else {
      createMutation.mutate({
        data: dateObj,
        tema: formData.tema,
        tipo: formData.tipo,
        preceptor: formData.preceptor || undefined,
        residenteApresentador: formData.residenteApresentador || undefined,
        observacao: formData.observacao || undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Reunião Clínica" : "Nova Atividade"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da reunião clínica"
              : "Preencha os dados para adicionar uma nova atividade à programação"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value as ClinicalMeeting["tipo"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema *</Label>
            <Input
              id="tema"
              value={formData.tema}
              onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
              placeholder="Ex: Fraturas do Fêmur Proximal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preceptor">Preceptor</Label>
            <Input
              id="preceptor"
              value={formData.preceptor}
              onChange={(e) => setFormData({ ...formData, preceptor: e.target.value })}
              placeholder="Nome do preceptor responsável"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="residenteApresentador">Residente Apresentador</Label>
            <Input
              id="residenteApresentador"
              value={formData.residenteApresentador}
              onChange={(e) => setFormData({ ...formData, residenteApresentador: e.target.value })}
              placeholder="Ex: R1, R2, R3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !formData.data || !formData.tema}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar Alterações" : "Criar Atividade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
