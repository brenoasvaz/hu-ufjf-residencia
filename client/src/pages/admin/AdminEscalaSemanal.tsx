import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

// ─── Constantes ────────────────────────────────────────────────────────────────
const DIAS_SEMANA = [
  { index: 1, nome: "Segunda-feira", abrev: "Seg" },
  { index: 2, nome: "Terça-feira", abrev: "Ter" },
  { index: 3, nome: "Quarta-feira", abrev: "Qua" },
  { index: 4, nome: "Quinta-feira", abrev: "Qui" },
  { index: 5, nome: "Sexta-feira", abrev: "Sex" },
];

const HORARIOS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

const ANOS_RESIDENCIA = ["R1", "R2", "R3"] as const;
const BLOCOS_R1 = ["Enfermaria", "CC1", "CC2"];
const BLOCOS_R2_R3 = ["A", "B", "C"];

const getActivityColor = (titulo: string) => {
  if (titulo.includes("CC HU") || titulo.includes("Centro Cirúrgico")) return "bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-900/40 dark:border-rose-600 dark:text-rose-200";
  if (titulo.includes("Ambulatório")) return "bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-200";
  if (titulo.includes("Visita")) return "bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-900/40 dark:border-emerald-600 dark:text-emerald-200";
  if (titulo.includes("Estudo")) return "bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900/40 dark:border-amber-600 dark:text-amber-200";
  if (titulo.includes("Reunião") || titulo.includes("Clube")) return "bg-violet-100 border-violet-400 text-violet-900 dark:bg-violet-900/40 dark:border-violet-600 dark:text-violet-200";
  if (titulo.includes("HPS") || titulo.includes("Plantão")) return "bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-900/40 dark:border-orange-600 dark:text-orange-200";
  if (titulo.includes("Enfermaria")) return "bg-cyan-100 border-cyan-400 text-cyan-900 dark:bg-cyan-900/40 dark:border-cyan-600 dark:text-cyan-200";
  return "bg-slate-100 border-slate-400 text-slate-900 dark:bg-slate-800/60 dark:border-slate-500 dark:text-slate-200";
};

// ─── Componente de atividade arrastável ────────────────────────────────────────
function DraggableActivity({
  activity,
  onEdit,
  onDelete,
}: {
  activity: any;
  onEdit: (a: any) => void;
  onDelete: (a: any) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(activity.id),
    data: { activity },
  });

  const colorClass = getActivityColor(activity.titulo);

  // Calcular altura baseada na duração
  const [hIni, mIni] = activity.horaInicio.split(":").map(Number);
  const [hFim, mFim] = activity.horaFim.split(":").map(Number);
  const duracaoMin = (hFim * 60 + mFim) - (hIni * 60 + mIni);
  const slots = Math.max(1, Math.round(duracaoMin / 30));

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.4 : 1, gridRow: `span ${slots}` }}
      className={`relative rounded-md border-l-4 p-2 text-xs cursor-pointer select-none group transition-shadow hover:shadow-md ${colorClass}`}
      onClick={() => onEdit(activity)}
    >
      {/* Handle de arraste */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3" />
      </div>

      <div className="font-semibold leading-tight pr-4 truncate">{activity.titulo}</div>
      <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-75">
        <Clock className="h-2.5 w-2.5" />
        {activity.horaInicio}–{activity.horaFim}
      </div>
      {activity.local && (
        <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-75 truncate">
          <MapPin className="h-2.5 w-2.5" />
          {activity.local}
        </div>
      )}
      {activity.audiences?.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {activity.audiences.map((aud: any, i: number) => (
            <span key={i} className="bg-black/10 dark:bg-white/10 rounded px-1 text-[9px]">
              {aud.anoResidencia ?? "Todos"}{aud.bloco ? `/${aud.bloco}` : ""}
            </span>
          ))}
        </div>
      )}

      {/* Botão excluir */}
      <button
        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-60 hover:opacity-100 text-red-600 dark:text-red-400"
        onClick={(e) => { e.stopPropagation(); onDelete(activity); }}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Célula droppable ──────────────────────────────────────────────────────────
function DroppableCell({
  dia,
  hora,
  children,
  onAddClick,
}: {
  dia: number;
  hora: string;
  children?: React.ReactNode;
  onAddClick: (dia: number, hora: string) => void;
}) {
  const id = `${dia}-${hora}`;
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] border-b border-r border-border/40 p-0.5 relative group/cell transition-colors ${
        isOver ? "bg-primary/10" : "hover:bg-muted/30"
      }`}
    >
      {children}
      {/* Botão + ao hover na célula vazia */}
      {!children && (
        <button
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-40 hover:!opacity-100 text-primary"
          onClick={() => onAddClick(dia, hora)}
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ─── Modal de edição ───────────────────────────────────────────────────────────
function ActivityModal({
  open,
  onClose,
  activity,
  defaultDia,
  defaultHora,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  activity?: any;
  defaultDia?: number;
  defaultHora?: string;
  onSave: (data: any) => void;
}) {
  const isEdit = !!activity;

  const [titulo, setTitulo] = useState(activity?.titulo ?? "");
  const [diaSemana, setDiaSemana] = useState<number>(activity?.diaSemana ?? defaultDia ?? 1);
  const [horaInicio, setHoraInicio] = useState(activity?.horaInicio ?? defaultHora ?? "08:00");
  const [horaFim, setHoraFim] = useState(activity?.horaFim ?? "09:00");
  const [local, setLocal] = useState(activity?.local ?? "");
  const [descricao, setDescricao] = useState(activity?.descricao ?? "");
  const [observacao, setObservacao] = useState(activity?.observacao ?? "");

  // Audiences: checkboxes por ano + bloco
  const [audienceR1, setAudienceR1] = useState<string[]>(
    activity?.audiences?.filter((a: any) => a.anoResidencia === "R1").map((a: any) => a.bloco ?? "__all__") ?? []
  );
  const [audienceR2, setAudienceR2] = useState<string[]>(
    activity?.audiences?.filter((a: any) => a.anoResidencia === "R2").map((a: any) => a.bloco ?? "__all__") ?? []
  );
  const [audienceR3, setAudienceR3] = useState<string[]>(
    activity?.audiences?.filter((a: any) => a.anoResidencia === "R3").map((a: any) => a.bloco ?? "__all__") ?? []
  );
  const [audienceTodos, setAudienceTodos] = useState<boolean>(
    !activity || activity.audiences?.length === 0
  );

  const buildAudiences = () => {
    if (audienceTodos) return [];
    const result: any[] = [];
    audienceR1.forEach((bloco) => result.push({ anoResidencia: "R1", bloco: bloco === "__all__" ? null : bloco }));
    audienceR2.forEach((bloco) => result.push({ anoResidencia: "R2", bloco: bloco === "__all__" ? null : bloco }));
    audienceR3.forEach((bloco) => result.push({ anoResidencia: "R3", bloco: bloco === "__all__" ? null : bloco }));
    return result;
  };

  const handleSave = () => {
    if (!titulo.trim()) { toast.error("Título é obrigatório"); return; }
    if (horaInicio >= horaFim) { toast.error("Hora de início deve ser anterior à hora de fim"); return; }
    onSave({
      id: activity?.id,
      titulo: titulo.trim(),
      diaSemana,
      horaInicio,
      horaFim,
      local: local.trim() || undefined,
      descricao: descricao.trim() || undefined,
      observacao: observacao.trim() || undefined,
      audiences: buildAudiences(),
    });
  };

  const toggleBloco = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    bloco: string
  ) => {
    setter(current.includes(bloco) ? current.filter((b) => b !== bloco) : [...current, bloco]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: CC HU, Ambulatório, Reunião..." />
          </div>

          {/* Dia + Horários */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Dia da Semana</Label>
              <Select value={String(diaSemana)} onValueChange={(v) => setDiaSemana(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d) => (
                    <SelectItem key={d.index} value={String(d.index)}>{d.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Select value={horaInicio} onValueChange={setHoraInicio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORARIOS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Select value={horaFim} onValueChange={setHoraFim}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {HORARIOS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Local */}
          <div className="space-y-1.5">
            <Label htmlFor="local">Local</Label>
            <Input id="local" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Ambulatório 3, Bloco C..." />
          </div>

          {/* Público-alvo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Público-alvo</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="todos" checked={audienceTodos} onCheckedChange={(v) => setAudienceTodos(!!v)} />
              <label htmlFor="todos" className="text-sm cursor-pointer">Todos os residentes</label>
            </div>

            {!audienceTodos && (
              <div className="space-y-3 pl-2 border-l-2 border-border ml-1">
                {/* R1 */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">R1 — Blocos</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Checkbox id="r1-all" checked={audienceR1.includes("__all__")} onCheckedChange={() => toggleBloco(setAudienceR1, audienceR1, "__all__")} />
                      <label htmlFor="r1-all" className="text-xs cursor-pointer">Todos R1</label>
                    </div>
                    {BLOCOS_R1.map((b) => (
                      <div key={b} className="flex items-center gap-1.5">
                        <Checkbox id={`r1-${b}`} checked={audienceR1.includes(b)} onCheckedChange={() => toggleBloco(setAudienceR1, audienceR1, b)} />
                        <label htmlFor={`r1-${b}`} className="text-xs cursor-pointer">{b}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* R2 */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">R2 — Blocos</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Checkbox id="r2-all" checked={audienceR2.includes("__all__")} onCheckedChange={() => toggleBloco(setAudienceR2, audienceR2, "__all__")} />
                      <label htmlFor="r2-all" className="text-xs cursor-pointer">Todos R2</label>
                    </div>
                    {BLOCOS_R2_R3.map((b) => (
                      <div key={b} className="flex items-center gap-1.5">
                        <Checkbox id={`r2-${b}`} checked={audienceR2.includes(b)} onCheckedChange={() => toggleBloco(setAudienceR2, audienceR2, b)} />
                        <label htmlFor={`r2-${b}`} className="text-xs cursor-pointer">{b}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* R3 */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">R3 — Blocos</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Checkbox id="r3-all" checked={audienceR3.includes("__all__")} onCheckedChange={() => toggleBloco(setAudienceR3, audienceR3, "__all__")} />
                      <label htmlFor="r3-all" className="text-xs cursor-pointer">Todos R3</label>
                    </div>
                    {BLOCOS_R2_R3.map((b) => (
                      <div key={b} className="flex items-center gap-1.5">
                        <Checkbox id={`r3-${b}`} checked={audienceR3.includes(b)} onCheckedChange={() => toggleBloco(setAudienceR3, audienceR3, b)} />
                        <label htmlFor={`r3-${b}`} className="text-xs cursor-pointer">{b}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Descrição / Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} placeholder="Informações adicionais..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="observacao">Observação</Label>
            <Input id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: Apenas quando não há cirurgia..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>{isEdit ? "Salvar Alterações" : "Criar Atividade"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function AdminEscalaSemanal() {
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroBloco, setFiltroBloco] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [defaultDia, setDefaultDia] = useState<number>(1);
  const [defaultHora, setDefaultHora] = useState<string>("08:00");
  const [activeId, setActiveId] = useState<string | null>(null);
  // Mobile: índice do dia selecionado (0 = Segunda, 4 = Sexta)
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const utils = trpc.useUtils();

  const { data: activitiesRaw = [], isLoading } = trpc.weeklyActivities.listWithAudiences.useQuery(
    filtroAno !== "todos" ? { anoResidencia: filtroAno as "R1" | "R2" | "R3" } : {}
  );

  // Filtrar por bloco no frontend (audiences)
  const activities = useMemo(() => {
    if (filtroBloco === "todos") return activitiesRaw as any[];
    return (activitiesRaw as any[]).filter((act) => {
      if (!act.audiences || act.audiences.length === 0) return true; // sem restrição = todos
      return act.audiences.some((a: any) => a.bloco === filtroBloco);
    });
  }, [activitiesRaw, filtroBloco]);

  const createMutation = trpc.weeklyActivities.createWithAudiences.useMutation({
    onSuccess: () => { utils.weeklyActivities.listWithAudiences.invalidate(); toast.success("Atividade criada"); setModalOpen(false); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.weeklyActivities.updateWithAudiences.useMutation({
    onSuccess: () => { utils.weeklyActivities.listWithAudiences.invalidate(); toast.success("Atividade atualizada"); setModalOpen(false); setEditingActivity(null); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.weeklyActivities.delete.useMutation({
    onSuccess: () => { utils.weeklyActivities.listWithAudiences.invalidate(); toast.success("Atividade removida"); setDeleteTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  // Sensores do DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Grade: { dia: { hora: activity[] } }
  const grid = useMemo(() => {
    const g: Record<number, Record<string, any[]>> = {};
    DIAS_SEMANA.forEach((d) => { g[d.index] = {}; HORARIOS.forEach((h) => { g[d.index][h] = []; }); });
    (activities as any[]).forEach((act) => {
      const dia = act.diaSemana;
      const hora = act.horaInicio;
      if (g[dia] && g[dia][hora] !== undefined) {
        g[dia][hora].push(act);
      }
    });
    return g;
  }, [activities]);

  const activeActivity = useMemo(
    () => activeId ? (activities as any[]).find((a) => String(a.id) === activeId) : null,
    [activeId, activities]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activity = (active.data.current as any)?.activity;
    if (!activity) return;

    // over.id = "dia-hora"
    const [diaStr, hora] = String(over.id).split("-");
    const dia = Number(diaStr);

    if (activity.diaSemana === dia && activity.horaInicio === hora) return;

    // Calcular nova horaFim mantendo a duração
    const [hIni, mIni] = activity.horaInicio.split(":").map(Number);
    const [hFim, mFim] = activity.horaFim.split(":").map(Number);
    const duracaoMin = (hFim * 60 + mFim) - (hIni * 60 + mIni);
    const [newH, newM] = hora.split(":").map(Number);
    const newFimMin = newH * 60 + newM + duracaoMin;
    const newHoraFim = `${String(Math.floor(newFimMin / 60)).padStart(2, "0")}:${String(newFimMin % 60).padStart(2, "0")}`;

    updateMutation.mutate({
      id: activity.id,
      diaSemana: dia,
      horaInicio: hora,
      horaFim: newHoraFim,
    });
  };

  const handleSave = (data: any) => {
    if (data.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (activity: any) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const handleAddClick = (dia: number, hora: string) => {
    setEditingActivity(null);
    setDefaultDia(dia);
    setDefaultHora(hora);
    setModalOpen(true);
  };

  // Swipe handlers para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0 && mobileDayIndex < DIAS_SEMANA.length - 1) setMobileDayIndex(prev => prev + 1);
      else if (dx > 0 && mobileDayIndex > 0) setMobileDayIndex(prev => prev - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Atividades do dia selecionado no mobile
  const mobileDayActivities = useMemo(() => {
    const dia = DIAS_SEMANA[mobileDayIndex];
    if (!dia) return [];
    const timeToMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return (activities as any[])
      .filter((a) => a.diaSemana === dia.index)
      .sort((a, b) => timeToMinutes(a.horaInicio || "07:00") - timeToMinutes(b.horaInicio || "07:00"));
  }, [activities, mobileDayIndex]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Escala Semanal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em uma atividade para editá-la ou arraste para mudar de horário/dia.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro por ano */}
          <Select value={filtroAno} onValueChange={(v) => { setFiltroAno(v); setFiltroBloco("todos"); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filtrar por ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              {ANOS_RESIDENCIA.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Filtro por bloco (só aparece quando um ano está selecionado) */}
          {filtroAno !== "todos" && (
            <Select value={filtroBloco} onValueChange={setFiltroBloco}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filtrar por bloco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os blocos</SelectItem>
                {(filtroAno === "R1" ? BLOCOS_R1 : BLOCOS_R2_R3).map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => { setEditingActivity(null); setDefaultDia(1); setDefaultHora("08:00"); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nova Atividade
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { label: "CC HU / Cirurgia", color: "bg-rose-100 border-rose-400 text-rose-900" },
          { label: "Ambulatório", color: "bg-blue-100 border-blue-400 text-blue-900" },
          { label: "Visita", color: "bg-emerald-100 border-emerald-400 text-emerald-900" },
          { label: "Estudo", color: "bg-amber-100 border-amber-400 text-amber-900" },
          { label: "Reunião / Clube", color: "bg-violet-100 border-violet-400 text-violet-900" },
          { label: "HPS / Plantão", color: "bg-orange-100 border-orange-400 text-orange-900" },
          { label: "Enfermaria", color: "bg-cyan-100 border-cyan-400 text-cyan-900" },
        ].map((item) => (
          <span key={item.label} className={`px-2 py-0.5 rounded border-l-2 ${item.color}`}>{item.label}</span>
        ))}
      </div>

      {/* ── MOBILE: lista por dia com swipe ── */}
      <div className="block md:hidden">
        {/* Navegação de dias */}
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileDayIndex(prev => Math.max(0, prev - 1))}
            disabled={mobileDayIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1">
            {DIAS_SEMANA.map((dia, i) => (
              <button
                key={dia.index}
                onClick={() => setMobileDayIndex(i)}
                className={`w-9 h-9 rounded-full text-xs font-semibold transition-colors ${
                  i === mobileDayIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {dia.abrev}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileDayIndex(prev => Math.min(DIAS_SEMANA.length - 1, prev + 1))}
            disabled={mobileDayIndex === DIAS_SEMANA.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Área com swipe */}
        <Card
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="overflow-hidden select-none"
        >
          <CardHeader className="pb-2 bg-muted/40 flex flex-row items-center justify-between">
            <CardTitle className="text-base">{DIAS_SEMANA[mobileDayIndex]?.nome}</CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingActivity(null);
                setDefaultDia(DIAS_SEMANA[mobileDayIndex]?.index ?? 1);
                setDefaultHora("08:00");
                setModalOpen(true);
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded" />)}
              </div>
            ) : mobileDayActivities.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhuma atividade neste dia
              </div>
            ) : (
              <div className="divide-y">
                {mobileDayActivities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className={`flex gap-3 p-3 ${getActivityColor(activity.titulo)}`}
                  >
                    {/* Horário */}
                    <div className="flex-shrink-0 text-center w-14">
                      <div className="text-xs font-bold">{activity.horaInicio?.substring(0, 5)}</div>
                      <div className="text-[10px] opacity-70">até</div>
                      <div className="text-xs font-bold">{activity.horaFim?.substring(0, 5)}</div>
                    </div>
                    <div className="w-px bg-current opacity-20 flex-shrink-0" />
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-tight">{activity.titulo}</div>
                      {activity.local && (
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{activity.local}</span>
                        </div>
                      )}
                      {activity.audiences?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activity.audiences.map((aud: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">
                              {aud.anoResidencia ?? "Todos"}{aud.bloco ? ` · ${aud.bloco}` : ""}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Ações */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                        onClick={() => handleEdit(activity)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        onClick={() => setDeleteTarget(activity)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-2">Deslize para navegar entre os dias</p>
      </div>

      {/* ── DESKTOP: grade semanal ── */}
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground hidden md:block">Carregando escala...</div>
      ) : (
        <div className="hidden md:block">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <div
                className="grid"
                style={{ gridTemplateColumns: `64px repeat(${DIAS_SEMANA.length}, minmax(140px, 1fr))` }}
              >
                {/* Cabeçalho dos dias */}
                <div className="sticky top-0 z-10 bg-muted border-b border-r border-border h-10 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Horário</span>
                </div>
                {DIAS_SEMANA.map((dia) => (
                  <div
                    key={dia.index}
                    className="sticky top-0 z-10 bg-muted border-b border-r border-border h-10 flex items-center justify-center"
                  >
                    <span className="text-sm font-semibold">{dia.abrev}</span>
                  </div>
                ))}

                {/* Linhas de horário */}
                {HORARIOS.map((hora) => (
                  <>
                    {/* Coluna de horário */}
                    <div
                      key={`h-${hora}`}
                      className="border-b border-r border-border/40 flex items-start justify-end pr-2 pt-1"
                    >
                      <span className="text-[10px] text-muted-foreground">{hora}</span>
                    </div>

                    {/* Células por dia */}
                    {DIAS_SEMANA.map((dia) => (
                      <DroppableCell
                        key={`${dia.index}-${hora}`}
                        dia={dia.index}
                        hora={hora}
                        onAddClick={handleAddClick}
                      >
                        {grid[dia.index]?.[hora]?.map((act: any) => (
                          <DraggableActivity
                            key={act.id}
                            activity={act}
                            onEdit={handleEdit}
                            onDelete={setDeleteTarget}
                          />
                        ))}
                      </DroppableCell>
                    ))}
                  </>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overlay durante o arraste */}
          <DragOverlay>
            {activeActivity && (
              <div className={`rounded-md border-l-4 p-2 text-xs shadow-xl opacity-90 w-36 ${getActivityColor(activeActivity.titulo)}`}>
                <div className="font-semibold truncate">{activeActivity.titulo}</div>
                <div className="text-[10px] opacity-75">{activeActivity.horaInicio}–{activeActivity.horaFim}</div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
        </div>
      )}

      {/* Modal de criação/edição */}
      {modalOpen && (
        <ActivityModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingActivity(null); }}
          activity={editingActivity}
          defaultDia={defaultDia}
          defaultHora={defaultHora}
          onSave={handleSave}
        />
      )}

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              A atividade <strong>{deleteTarget?.titulo}</strong> será removida permanentemente da escala semanal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
