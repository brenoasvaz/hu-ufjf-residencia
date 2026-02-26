/**
 * Página de Gestão de Modelos de Prova (Admin)
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Plus, Edit, Trash2, Clock } from "lucide-react";

export default function ModelosProva() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<any>(null);
  
  // Form state
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState(60);
  const [configuracao, setConfiguracao] = useState<Record<string, number>>({});

  const utils = trpc.useUtils();
  
  // Queries
  const { data: modelos, isLoading } = trpc.avaliacoes.modelos.list.useQuery();
  const { data: especialidades } = trpc.avaliacoes.especialidades.list.useQuery();
  
  // Mutations
  const createMutation = trpc.avaliacoes.modelos.create.useMutation({
    onSuccess: () => {
      utils.avaliacoes.modelos.list.invalidate();
      handleCloseDialog();
      alert("Modelo criado com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.avaliacoes.modelos.update.useMutation({
    onSuccess: () => {
      utils.avaliacoes.modelos.list.invalidate();
      handleCloseDialog();
      alert("Modelo atualizado com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.avaliacoes.modelos.delete.useMutation({
    onSuccess: () => {
      utils.avaliacoes.modelos.list.invalidate();
      alert("Modelo excluído com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const handleOpenDialog = (modelo?: any) => {
    if (modelo) {
      setEditingModelo(modelo);
      setNome(modelo.nome);
      setDescricao(modelo.descricao || "");
      setDuracaoMinutos(modelo.duracaoMinutos);
      setConfiguracao(JSON.parse(modelo.configuracao));
    } else {
      setEditingModelo(null);
      setNome("");
      setDescricao("");
      setDuracaoMinutos(60);
      setConfiguracao({});
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingModelo(null);
    setNome("");
    setDescricao("");
    setDuracaoMinutos(60);
    setConfiguracao({});
  };

  const handleSubmit = () => {
    if (!nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }
    
    const totalQuestoes = Object.values(configuracao).reduce((a, b) => a + b, 0);
    if (totalQuestoes === 0) {
      alert("Configure pelo menos uma especialidade");
      return;
    }

    if (editingModelo) {
      updateMutation.mutate({
        modeloId: editingModelo.id,
        nome,
        descricao: descricao || null,
        duracaoMinutos,
        configuracao,
      });
    } else {
      createMutation.mutate({
        nome,
        descricao: descricao || null,
        duracaoMinutos,
        configuracao,
      });
    }
  };

  const handleDelete = (modeloId: number) => {
    if (confirm("Tem certeza que deseja excluir este modelo?")) {
      deleteMutation.mutate({ modeloId });
    }
  };

  const handleEspecialidadeChange = (espNome: string, quantidade: string) => {
    const num = parseInt(quantidade) || 0;
    if (num === 0) {
      const newConfig = { ...configuracao };
      delete newConfig[espNome];
      setConfiguracao(newConfig);
    } else {
      setConfiguracao({ ...configuracao, [espNome]: num });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando modelos...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Modelos de Prova</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie modelos de prova para geração de simulados
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modelos?.map((modelo) => {
          const config = JSON.parse(modelo.configuracao) as Record<string, number>;
          const totalQuestoes = Object.values(config).reduce((a, b) => a + b, 0);
          
          return (
            <Card key={modelo.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{modelo.nome}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(modelo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(modelo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                {modelo.descricao && (
                  <CardDescription>{modelo.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{modelo.duracaoMinutos} minutos</span>
                  </div>
                  <div className="text-sm">
                    <strong>Total de questões:</strong> {totalQuestoes}
                  </div>
                  <div className="text-sm">
                    <strong>Distribuição:</strong>
                    <ul className="ml-4 mt-1">
                      {Object.entries(config).map(([esp, qtd]) => (
                        <li key={esp}>
                          {esp}: {qtd} questões
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modelos?.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum modelo cadastrado. Clique em "Novo Modelo" para criar o primeiro.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModelo ? "Editar Modelo" : "Novo Modelo"}
            </DialogTitle>
            <DialogDescription>
              Configure o modelo de prova com a distribuição de questões por especialidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Modelo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Prova SBOT 2024"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do modelo..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duracao">Duração (minutos)</Label>
              <Input
                id="duracao"
                type="number"
                value={duracaoMinutos}
                onChange={(e) => setDuracaoMinutos(parseInt(e.target.value) || 60)}
                min={10}
                max={300}
              />
            </div>

            <div>
              <Label>Distribuição de Questões por Especialidade</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {especialidades?.map((esp) => (
                  <div key={esp.id} className="flex items-center gap-2">
                    <Label htmlFor={`esp-${esp.id}`} className="flex-1">
                      {esp.nome}
                    </Label>
                    <Input
                      id={`esp-${esp.id}`}
                      type="number"
                      value={configuracao[esp.nome] || 0}
                      onChange={(e) => handleEspecialidadeChange(esp.nome, e.target.value)}
                      className="w-20"
                      min={0}
                      max={100}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total: {Object.values(configuracao).reduce((a, b) => a + b, 0)} questões
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingModelo ? "Salvar Alterações" : "Criar Modelo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
