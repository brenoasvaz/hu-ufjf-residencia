import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link as LinkIcon, Plus, Pencil, Trash2, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GerenciarLinks() {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [linkToDelete, setLinkToDelete] = useState<any>(null);
  
  const [editTitulo, setEditTitulo] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editOrdem, setEditOrdem] = useState(0);

  const { data: links, isLoading, refetch } = trpc.links.listAll.useQuery();
  const createMutation = trpc.links.create.useMutation();
  const updateMutation = trpc.links.update.useMutation();
  const deleteMutation = trpc.links.delete.useMutation();

  if (!user || user.role !== 'admin') {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleNewClick = () => {
    setSelectedLink(null);
    setEditTitulo("");
    setEditUrl("");
    setEditDescricao("");
    setEditOrdem(0);
    setEditDialogOpen(true);
  };

  const handleEditClick = (link: any) => {
    setSelectedLink(link);
    setEditTitulo(link.titulo || "");
    setEditUrl(link.url || "");
    setEditDescricao(link.descricao || "");
    setEditOrdem(link.ordem || 0);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedLink) {
        // Atualizar
        await updateMutation.mutateAsync({
          id: selectedLink.id,
          titulo: editTitulo,
          url: editUrl,
          descricao: editDescricao,
          ordem: editOrdem,
        });
        toast.success("Link atualizado com sucesso!");
      } else {
        // Criar novo
        await createMutation.mutateAsync({
          titulo: editTitulo,
          url: editUrl,
          descricao: editDescricao,
          ordem: editOrdem,
        });
        toast.success("Link criado com sucesso!");
      }
      
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar link");
    }
  };

  const handleDeleteClick = (link: any) => {
    setLinkToDelete(link);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        id: linkToDelete.id,
      });

      toast.success("Link deletado com sucesso!");
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar link");
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Links Úteis</h1>
          <p className="text-muted-foreground">
            Adicione e organize links úteis para os residentes
          </p>
        </div>
        <Button onClick={handleNewClick}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Link
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando links...</p>
        </div>
      ) : !links || links.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Nenhum link cadastrado</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Novo Link" para adicionar o primeiro link útil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{link.titulo}</h3>
                      {link.ativo === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                          Inativo
                        </span>
                      )}
                    </div>
                    
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {link.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    
                    {link.descricao && (
                      <p className="text-sm text-muted-foreground">{link.descricao}</p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Ordem: {link.ordem}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(link)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(link)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Editar/Criar */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedLink ? "Editar Link" : "Novo Link"}</DialogTitle>
            <DialogDescription>
              {selectedLink ? "Atualize as informações do link" : "Adicione um novo link útil"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={editTitulo}
                onChange={(e) => setEditTitulo(e.target.value)}
                placeholder="Ex: Avaliações Práticas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                placeholder="Breve descrição do link..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem de Exibição</Label>
              <Input
                id="ordem"
                type="number"
                value={editOrdem}
                onChange={(e) => setEditOrdem(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Links com menor número aparecem primeiro
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!editTitulo || !editUrl || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Deletar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o link <strong>{linkToDelete?.titulo}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deletando..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
