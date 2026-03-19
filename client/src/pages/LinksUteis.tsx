import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Link as LinkIcon, ExternalLink, Plus, Pencil, Trash2,
  FolderOpen, Folder, ChevronDown, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function LinksUteis() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── Estado de acordeão ─────────────────────────────────────────────────────
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["__sem_categoria__"]));

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: links, isLoading: linksLoading, refetch: refetchLinks } = trpc.links.list.useQuery();
  const { data: categorias, refetch: refetchCategorias } = trpc.links.listCategorias.useQuery();
  const utils = trpc.useUtils();

  // ── Mutations de Links ─────────────────────────────────────────────────────
  const createLinkMutation = trpc.links.create.useMutation();
  const updateLinkMutation = trpc.links.update.useMutation();
  const deleteLinkMutation = trpc.links.delete.useMutation();

  // ── Mutations de Categorias ────────────────────────────────────────────────
  const createCategoriaMutation = trpc.links.createCategoria.useMutation();
  const updateCategoriaMutation = trpc.links.updateCategoria.useMutation();
  const deleteCategoriaMutation = trpc.links.deleteCategoria.useMutation();

  // ── Estado de diálogos de link ─────────────────────────────────────────────
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [deleteLinkDialogOpen, setDeleteLinkDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [linkToDelete, setLinkToDelete] = useState<any>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editOrdem, setEditOrdem] = useState(0);
  const [editCategoriaId, setEditCategoriaId] = useState<string>("__none__");

  // ── Estado de diálogos de categoria ───────────────────────────────────────────────
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [deleteCatDialogOpen, setDeleteCatDialogOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [catToDelete, setCatToDelete] = useState<any>(null);
  const [catNome, setCatNome] = useState("");
  const [catDescricao, setCatDescricao] = useState("");
  const [catOrdem, setCatOrdem] = useState(0);

  // ── Edição inline do nome da pasta ──────────────────────────────────────
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineEditNome, setInlineEditNome] = useState("");
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const handleInlineEdit = useCallback((e: React.MouseEvent, group: any) => {
    e.stopPropagation();
    setInlineEditId(group.id);
    setInlineEditNome(group.nome);
    setTimeout(() => inlineInputRef.current?.select(), 50);
  }, []);

  const handleInlineSave = useCallback(async (groupId: number) => {
    if (!inlineEditNome.trim()) { setInlineEditId(null); return; }
    try {
      await updateCategoriaMutation.mutateAsync({ id: groupId, nome: inlineEditNome.trim() });
      toast.success("Nome atualizado!");
      refetchCategorias();
      refetchLinks();
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar nome");
    } finally {
      setInlineEditId(null);
    }
  }, [inlineEditNome, updateCategoriaMutation, refetchCategorias, refetchLinks]);

  // ── Agrupamento de links por categoria ────────────────────────────────────
  const grouped = useMemo(() => {
    if (!links) return [];

    const catMap = new Map<number | null, { id: number | null; nome: string; icone?: string | null; ordem: number; links: any[] }>();

    // Inicializar categorias com links
    links.forEach(link => {
      const catId = link.categoriaId ?? null;
      if (!catMap.has(catId)) {
        catMap.set(catId, {
          id: catId,
          nome: catId === null ? "Geral" : (link.categoriaNome ?? "Sem categoria"),
          icone: catId === null ? null : link.categoriaIcone,
          ordem: catId === null ? 9999 : (link.categoriaOrdem ?? 0),
          links: [],
        });
      }
      catMap.get(catId)!.links.push(link);
    });

    return Array.from(catMap.values()).sort((a, b) => a.ordem - b.ordem);
  }, [links]);

  // ── Handlers de link ───────────────────────────────────────────────────────
  const handleNewLink = (defaultCatId?: number | null) => {
    setSelectedLink(null);
    setEditTitulo("");
    setEditUrl("");
    setEditDescricao("");
    setEditOrdem(0);
    setEditCategoriaId(defaultCatId != null ? String(defaultCatId) : "__none__");
    setLinkDialogOpen(true);
  };

  const handleEditLink = (link: any) => {
    setSelectedLink(link);
    setEditTitulo(link.titulo || "");
    setEditUrl(link.url || "");
    setEditDescricao(link.descricao || "");
    setEditOrdem(link.ordem || 0);
    setEditCategoriaId(link.categoriaId != null ? String(link.categoriaId) : "__none__");
    setLinkDialogOpen(true);
  };

  const handleSaveLink = async () => {
    try {
      const catId = editCategoriaId === "__none__" ? null : parseInt(editCategoriaId);
      if (selectedLink) {
        await updateLinkMutation.mutateAsync({
          id: selectedLink.id,
          titulo: editTitulo,
          url: editUrl,
          descricao: editDescricao,
          categoriaId: catId,
          ordem: editOrdem,
        });
        toast.success("Link atualizado!");
      } else {
        await createLinkMutation.mutateAsync({
          titulo: editTitulo,
          url: editUrl,
          descricao: editDescricao,
          categoriaId: catId,
          ordem: editOrdem,
        });
        toast.success("Link criado!");
      }
      setLinkDialogOpen(false);
      refetchLinks();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar link");
    }
  };

  const handleConfirmDeleteLink = async () => {
    if (!linkToDelete) return;
    try {
      await deleteLinkMutation.mutateAsync({ id: linkToDelete.id });
      toast.success("Link removido!");
      setDeleteLinkDialogOpen(false);
      setLinkToDelete(null);
      refetchLinks();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover link");
    }
  };

  // ── Handlers de categoria ──────────────────────────────────────────────────
  const handleNewCat = () => {
    setSelectedCat(null);
    setCatNome("");
    setCatDescricao("");
    setCatOrdem(0);
    setCatDialogOpen(true);
  };

  const handleEditCat = (cat: any) => {
    setSelectedCat(cat);
    setCatNome(cat.nome || "");
    setCatDescricao(cat.descricao || "");
    setCatOrdem(cat.ordem || 0);
    setCatDialogOpen(true);
  };

  const handleSaveCat = async () => {
    try {
      if (selectedCat) {
        await updateCategoriaMutation.mutateAsync({
          id: selectedCat.id,
          nome: catNome,
          descricao: catDescricao,
          ordem: catOrdem,
        });
        toast.success("Pasta atualizada!");
      } else {
        await createCategoriaMutation.mutateAsync({
          nome: catNome,
          descricao: catDescricao,
          ordem: catOrdem,
        });
        toast.success("Pasta criada!");
        // Abrir a nova categoria no acordeão
        setOpenCategories(prev => new Set(Array.from(prev).concat(catNome)));
      }
      setCatDialogOpen(false);
      refetchCategorias();
      refetchLinks();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar pasta");
    }
  };

  const handleConfirmDeleteCat = async () => {
    if (!catToDelete) return;
    try {
      await deleteCategoriaMutation.mutateAsync({ id: catToDelete.id });
      toast.success("Pasta removida. Os links foram movidos para 'Geral'.");
      setDeleteCatDialogOpen(false);
      setCatToDelete(null);
      refetchCategorias();
      refetchLinks();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover pasta");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links Úteis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recursos e ferramentas importantes para os residentes
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewCat}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Nova Pasta
            </Button>
            <Button onClick={() => handleNewLink()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Link
            </Button>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {linksLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando links...</div>
      ) : !links || links.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum link disponível</p>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? 'Crie uma pasta e adicione links úteis para os residentes'
                : 'Os links úteis aparecerão aqui quando forem adicionados'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(group => {
            const key = group.id === null ? "__sem_categoria__" : String(group.id);
            const isOpen = openCategories.has(key);

            return (
              <Card key={key} className="overflow-hidden">
                {/* Cabeçalho da pasta */}
                <button
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors text-left"
                  onClick={() => toggleCategory(key)}
                >
                  <div className="flex items-center gap-3">
                    {isOpen
                      ? <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                      : <Folder className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    }
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      {isAdmin && group.id !== null && inlineEditId === group.id ? (
                        <input
                          ref={inlineInputRef}
                          className="font-semibold text-sm border-b border-primary bg-transparent outline-none min-w-[120px] max-w-[220px] px-1"
                          value={inlineEditNome}
                          onChange={e => setInlineEditNome(e.target.value)}
                          onBlur={() => handleInlineSave(group.id!)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleInlineSave(group.id!);
                            if (e.key === 'Escape') setInlineEditId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`font-semibold text-sm${isAdmin && group.id !== null ? ' cursor-text hover:underline decoration-dotted' : ''}`}
                          title={isAdmin && group.id !== null ? 'Clique para editar o nome' : undefined}
                          onClick={e => isAdmin && group.id !== null ? handleInlineEdit(e, group) : undefined}
                        >
                          {group.nome}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {group.links.length} {group.links.length === 1 ? "link" : "links"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && group.id !== null && (
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditCat(group)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => { setCatToDelete(group); setDeleteCatDialogOpen(true); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={e => { e.stopPropagation(); handleNewLink(group.id); }}
                        title="Adicionar link nesta pasta"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {isOpen
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </button>

                {/* Links da pasta */}
                {isOpen && (
                  <div className="border-t divide-y">
                    {group.links.map(link => (
                      <div key={link.id} className="flex items-start gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                        <LinkIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {link.titulo}
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                          {link.descricao && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{link.descricao}</p>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditLink(link)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => { setLinkToDelete(link); setDeleteLinkDialogOpen(true); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Dialog: Criar/Editar Link ─────────────────────────────────────── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedLink ? "Editar Link" : "Novo Link"}</DialogTitle>
            <DialogDescription>
              {selectedLink ? "Atualize as informações do link" : "Adicione um novo link útil"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" value={editTitulo} onChange={e => setEditTitulo(e.target.value)} placeholder="Ex: Avaliações Práticas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input id="url" type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea id="descricao" value={editDescricao} onChange={e => setEditDescricao(e.target.value)} placeholder="Breve descrição..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Pasta</Label>
              <Select value={editCategoriaId} onValueChange={setEditCategoriaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem pasta (Geral)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem pasta (Geral)</SelectItem>
                  {categorias?.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem de Exibição</Label>
              <Input id="ordem" type="number" value={editOrdem} onChange={e => setEditOrdem(parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Menor número = aparece primeiro</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveLink} disabled={!editTitulo || !editUrl || createLinkMutation.isPending || updateLinkMutation.isPending}>
              {(createLinkMutation.isPending || updateLinkMutation.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar exclusão de link ───────────────────────────── */}
      <Dialog open={deleteLinkDialogOpen} onOpenChange={setDeleteLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Link</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{linkToDelete?.titulo}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLinkDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteLink} disabled={deleteLinkMutation.isPending}>
              {deleteLinkMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Criar/Editar Categoria ───────────────────────────────── */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCat ? "Editar Pasta" : "Nova Pasta"}</DialogTitle>
            <DialogDescription>
              {selectedCat ? "Atualize as informações da pasta" : "Crie uma nova pasta para organizar os links"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catNome">Nome da Pasta *</Label>
              <Input id="catNome" value={catNome} onChange={e => setCatNome(e.target.value)} placeholder="Ex: Avaliações Práticas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDescricao">Descrição (opcional)</Label>
              <Textarea id="catDescricao" value={catDescricao} onChange={e => setCatDescricao(e.target.value)} placeholder="Breve descrição da pasta..." rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catOrdem">Ordem de Exibição</Label>
              <Input id="catOrdem" type="number" value={catOrdem} onChange={e => setCatOrdem(parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Menor número = aparece primeiro</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCat} disabled={!catNome || createCategoriaMutation.isPending || updateCategoriaMutation.isPending}>
              {(createCategoriaMutation.isPending || updateCategoriaMutation.isPending) ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar exclusão de categoria ───────────────────────── */}
      <Dialog open={deleteCatDialogOpen} onOpenChange={setDeleteCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Pasta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover a pasta <strong>{catToDelete?.nome}</strong>?
              Os links desta pasta serão movidos para "Geral".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCatDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteCat} disabled={deleteCategoriaMutation.isPending}>
              {deleteCategoriaMutation.isPending ? "Removendo..." : "Remover Pasta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
