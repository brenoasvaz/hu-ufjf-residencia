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
}

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

export function EditClinicalMeetingDialog({ meeting, open, onOpenChange }: EditClinicalMeetingDialogProps) {
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState({
    data: "",
    tema: "",
    tipo: "AULA" as ClinicalMeeting["tipo"],
    preceptor: "",
    residenteApresentador: "",
    observacao: "",
  });

  useEffect(() => {
    if (meeting) {
      const dateStr = meeting.data instanceof Date 
        ? meeting.data.toISOString().split('T')[0]
        : new Date(meeting.data).toISOString().split('T')[0];
      
      setFormData({
        data: dateStr,
        tema: meeting.tema,
        tipo: meeting.tipo,
        preceptor: meeting.preceptor || "",
        residenteApresentador: meeting.residenteApresentador || "",
        observacao: meeting.observacao || "",
      });
    }
  }, [meeting]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;

    updateMutation.mutate({
      id: meeting.id,
      data: new Date(formData.data),
      tema: formData.tema,
      tipo: formData.tipo,
      preceptor: formData.preceptor || undefined,
      residenteApresentador: formData.residenteApresentador || undefined,
      observacao: formData.observacao || undefined,
    });
  };

  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Reunião Clínica</DialogTitle>
          <DialogDescription>
            Atualize as informações da reunião clínica
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
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
            <Label htmlFor="tema">Tema</Label>
            <Input
              id="tema"
              value={formData.tema}
              onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preceptor">Preceptor</Label>
            <Input
              id="preceptor"
              value={formData.preceptor}
              onChange={(e) => setFormData({ ...formData, preceptor: e.target.value })}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
