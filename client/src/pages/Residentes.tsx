import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Plus, Edit, Trash2, ArrowRight, Loader2 } from "lucide-react";
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
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Residentes() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<any>(null);
  const [showProgressao, setShowProgressao] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    apelido: "",
    anoResidencia: "R1" as "R1" | "R2" | "R3",
    ativo: 1,
  });

  const utils = trpc.useUtils();
  const { data: residents, isLoading } = trpc.residents.list.useQuery({
    search: searchTerm || undefined,
  });

  const createMutation = trpc.residents.create.useMutation({
    onSuccess: () => {
      toast.success("Residente criado com sucesso");
      utils.residents.list.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar residente: ${error.message}`);
    },
  });

  const updateMutation = trpc.residents.update.useMutation({
    onSuccess: () => {
      toast.success("Residente atualizado com sucesso");
      utils.residents.list.invalidate();
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar residente: ${error.message}`);
    },
  });

  const progressaoMutation = trpc.residents.progressaoAnual.useMutation({
    onSuccess: (result) => {
      toast.success(
        `Progressão aplicada: ${result.r1ToR2} R1→R2, ${result.r2ToR3} R2→R3, ${result.r3Inativados} R3 inativados`
      );
      utils.residents.list.invalidate();
      setShowProgressao(false);
    },
    onError: (err) => toast.error("Erro na progressão: " + err.message),
  });

  const deleteMutation = trpc.residents.delete.useMutation({
    onSuccess: () => {
      toast.success("Residente removido com sucesso");
      utils.residents.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover residente: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      nomeCompleto: "",
      apelido: "",
      anoResidencia: "R1",
      ativo: 1,
    });
    setEditingResident(null);
  };

  const handleOpenDialog = (resident?: any) => {
    if (resident) {
      setEditingResident(resident);
      setFormData({
        nomeCompleto: resident.nomeCompleto,
        apelido: resident.apelido || "",
        anoResidencia: resident.anoResidencia,
        ativo: resident.ativo,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingResident) {
      updateMutation.mutate({
        id: editingResident.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este residente?")) {
      deleteMutation.mutate({ id });
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Residentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie informações dos residentes de ortopedia
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowProgressao(true)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Progressão Anual
            </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Residente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingResident ? "Editar Residente" : "Novo Residente"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do residente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeCompleto: e.target.value })
                    }
                    placeholder="Nome completo do residente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apelido">Apelido</Label>
                  <Input
                    id="apelido"
                    value={formData.apelido}
                    onChange={(e) =>
                      setFormData({ ...formData, apelido: e.target.value })
                    }
                    placeholder="Apelido (opcional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anoResidencia">Ano de Residência *</Label>
                  <Select
                    value={formData.anoResidencia}
                    onValueChange={(value: "R1" | "R2" | "R3") =>
                      setFormData({ ...formData, anoResidencia: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R1">R1 - Primeiro Ano</SelectItem>
                      <SelectItem value="R2">R2 - Segundo Ano</SelectItem>
                      <SelectItem value="R3">R3 - Terceiro Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ativo">Status</Label>
                  <Select
                    value={formData.ativo.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ativo: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ativo</SelectItem>
                      <SelectItem value="0">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.nomeCompleto}>
                  {editingResident ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        )}
      </div>  {/* fim flex flex-col md:flex-row */}

      {/* Diálogo de progressão anual */}
      <AlertDialog open={showProgressao} onOpenChange={setShowProgressao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Progressão Anual de Residência
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Esta ação aplica a progressão de ano para <strong>todos os residentes ativos</strong>:
                </p>
                <ul className="space-y-1 ml-4 list-none">
                  <li className="flex items-center gap-2"><span className="font-medium">R1</span><ArrowRight className="h-3 w-3" /><span className="font-medium">R2</span></li>
                  <li className="flex items-center gap-2"><span className="font-medium">R2</span><ArrowRight className="h-3 w-3" /><span className="font-medium">R3</span></li>
                  <li className="flex items-center gap-2 text-muted-foreground"><span className="font-medium">R3</span><ArrowRight className="h-3 w-3" /><span>Inativados (formados)</span></li>
                </ul>
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  ⚠ Esta ação é irreversível. Recomenda-se realizar em 28 de fevereiro de cada ano, após o término do ciclo.
                </p>
                <p className="text-muted-foreground">
                  Os rodízios mensais existentes não são alterados. Novos R1 devem ser cadastrados manualmente após a progressão.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => progressaoMutation.mutate()}
              disabled={progressaoMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {progressaoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ArrowRight className="h-4 w-4 mr-1" />}
              Aplicar Progressão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Residentes</CardTitle>
          <CardDescription>Pesquise por nome ou apelido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite o nome ou apelido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Residentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Residentes</CardTitle>
          <CardDescription>
            {residents?.length || 0} residente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : residents && residents.length > 0 ? (
            <div className="space-y-3">
              {residents.map((resident: any) => (
                <div
                  key={resident.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{resident.nomeCompleto}</span>
                      {resident.apelido && (
                        <span className="text-sm text-muted-foreground">
                          ({resident.apelido})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{resident.anoResidencia}</Badge>
                      <Badge variant={resident.ativo ? "default" : "outline"}>
                        {resident.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(resident)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(resident.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum residente encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
