import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link as LinkIcon, ExternalLink, Plus, Pencil, Trash2 } from "lucide-react";
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

export default function LinksUteis() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [linkToDelete, setLinkToDelete] = useState<any>(null);
  
  const [editTitulo, setEditTitulo] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editOrdem, setEditOrdem] = useState(0);

  const { data: links, isLoading, refetch } = trpc.links.list.useQuery();
  const createMutation = trpc.links.create.useMutation();
  const updateMutation = trpc.links.update.useMutation();
  const deleteMutation = trpc.links.delete.useMutation();

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
    <div className="container max-w-4xl py-8">
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Links Úteis</h1>
            <p className="text-muted-foreground">
              Recursos e ferramentas importantes para os residentes
            </p>
          </div>
          {isAdmin && (
            <Button onClick={handleNewClick}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Link
            </Button>
          )}
        </div>
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
                <p className="text-lg font-medium">Nenhum link disponível</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin 
                    ? 'Clique em "Novo Link" para adicionar o primeiro link útil'
                    : 'Os links úteis aparecerão aqui quando forem adicionados'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  {link.titulo}
                </CardTitle>
                {link.descricao && (
                  <CardDescription>{link.descricao}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  Acessar link
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                {isAdmin && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(link)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(link)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Deletar
                    </Button>
                  </div>
                )}
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
