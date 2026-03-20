import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Link as LinkIcon, ExternalLink, Plus, Pencil, Trash2,
  FolderOpen, Folder, ChevronDown, ChevronRight, FolderPlus,
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

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Categoria = {
  id: number;
  nome: string;
  descricao?: string | null;
  icone?: string | null;
  parentId?: number | null;
  ordem: number;
  ativo: number;
};

type LinkItem = {
  id: number;
  titulo: string;
  url: string;
  descricao?: string | null;
  categoriaId?: number | null;
  ordem: number;
  ativo: number;
  categoriaNome?: string | null;
  categoriaIcone?: string | null;
  categoriaOrdem?: number | null;
  categoriaParentId?: number | null;
};

type GroupNode = {
  cat: Categoria;
  links: LinkItem[];
  children: GroupNode[];
};

// ── Componente de subpasta ─────────────────────────────────────────────────────
function SubpastaRow({
  node,
  isAdmin,
  openCategories,
  toggleCategory,
  inlineEditId,
  inlineEditNome,
  inlineInputRef,
  setInlineEditNome,
  handleInlineEdit,
  handleInlineSave,
  setInlineEditId,
  handleEditCat,
  setCatToDelete,
  setDeleteCatDialogOpen,
  handleNewLink,
  handleNewSubCat,
  handleEditLink,
  setLinkToDelete,
  setDeleteLinkDialogOpen,
}: {
  node: GroupNode;
  isAdmin: boolean;
  openCategories: Set<string>;
  toggleCategory: (k: string) => void;
  inlineEditId: number | null;
  inlineEditNome: string;
  inlineInputRef: React.RefObject<HTMLInputElement | null>;
  setInlineEditNome: (v: string) => void;
  handleInlineEdit: (e: React.MouseEvent, g: Categoria) => void;
  handleInlineSave: (id: number) => void;
  setInlineEditId: (id: number | null) => void;
  handleEditCat: (g: Categoria) => void;
  setCatToDelete: (g: Categoria) => void;
  setDeleteCatDialogOpen: (v: boolean) => void;
  handleNewLink: (catId?: number | null) => void;
  handleNewSubCat: (parentId: number) => void;
  handleEditLink: (l: LinkItem) => void;
  setLinkToDelete: (l: LinkItem) => void;
  setDeleteLinkDialogOpen: (v: boolean) => void;
}) {
  const key = String(node.cat.id);
  const isOpen = openCategories.has(key);
  const totalLinks = countLinks(node);

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Cabeçalho da subpasta */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left bg-muted/20"
        onClick={() => toggleCategory(key)}
      >
        <div className="flex items-center gap-2">
          {isOpen
            ? <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
            : <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          }
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {isAdmin && inlineEditId === node.cat.id ? (
              <input
                ref={inlineInputRef}
                className="font-medium text-sm border-b border-primary bg-transparent outline-none min-w-[100px] max-w-[180px] px-1"
                value={inlineEditNome}
                onChange={e => setInlineEditNome(e.target.value)}
                onBlur={() => handleInlineSave(node.cat.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleInlineSave(node.cat.id);
                  if (e.key === 'Escape') setInlineEditId(null);
                }}
                autoFocus
              />
            ) : (
              <span
                className={`font-medium text-sm${isAdmin ? ' cursor-text hover:underline decoration-dotted' : ''}`}
                title={isAdmin ? 'Clique para editar o nome' : undefined}
                onClick={e => isAdmin ? handleInlineEdit(e, node.cat) : undefined}
              >
                {node.cat.nome}
              </span>
            )}
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {totalLinks} {totalLinks === 1 ? "link" : "links"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditCat(node.cat)} title="Editar subpasta">
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => { setCatToDelete(node.cat); setDeleteCatDialogOpen(true); }} title="Excluir subpasta">
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); handleNewLink(node.cat.id); }} title="Adicionar link">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {/* Links da subpasta */}
      {isOpen && (
        <div className="divide-y border-t">
          {node.links.map(link => (
            <LinkRow key={link.id} link={link} isAdmin={isAdmin} handleEditLink={handleEditLink} setLinkToDelete={setLinkToDelete} setDeleteLinkDialogOpen={setDeleteLinkDialogOpen} indent />
          ))}
          {node.links.length === 0 && (
            <div className="px-6 py-2 text-xs text-muted-foreground italic">Nenhum link nesta subpasta</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente de linha de link ────────────────────────────────────────────────
function LinkRow({ link, isAdmin, handleEditLink, setLinkToDelete, setDeleteLinkDialogOpen, indent = false }: {
  link: LinkItem;
  isAdmin: boolean;
  handleEditLink: (l: LinkItem) => void;
  setLinkToDelete: (l: LinkItem) => void;
  setDeleteLinkDialogOpen: (v: boolean) => void;
  indent?: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 ${indent ? 'px-6' : 'px-5'} py-3 hover:bg-muted/20 transition-colors`}>
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
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditLink(link)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { setLinkToDelete(link); setDeleteLinkDialogOpen(true); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Helper: contar links recursivamente ───────────────────────────────────────
function countLinks(node: GroupNode): number {
  return node.links.length + node.children.reduce((acc, c) => acc + countLinks(c), 0);
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function LinksUteis() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // ── Estado de acordeão ─────────────────────────────────────────────────────
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = trpc.links.list.useQuery();
  const { data: categorias, refetch: refetchCategorias } = trpc.links.listCategorias.useQuery();
  const links = data?.links ?? [];
  const allCategorias = data?.categorias ?? [];

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
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<LinkItem | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editOrdem, setEditOrdem] = useState(0);
  const [editCategoriaId, setEditCategoriaId] = useState<string>("__none__");

  // ── Estado de diálogos de categoria ───────────────────────────────────────
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [deleteCatDialogOpen, setDeleteCatDialogOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Categoria | null>(null);
  const [catToDelete, setCatToDelete] = useState<Categoria | null>(null);
  const [catNome, setCatNome] = useState("");
  const [catDescricao, setCatDescricao] = useState("");
  const [catOrdem, setCatOrdem] = useState(0);
  const [catParentId, setCatParentId] = useState<string>("__none__");

  // ── Edição inline do nome da pasta ────────────────────────────────────────
  const [inlineEditId, setInlineEditId] = useState<number | null>(null);
  const [inlineEditNome, setInlineEditNome] = useState("");
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const handleInlineEdit = useCallback((e: React.MouseEvent, cat: Categoria) => {
    e.stopPropagation();
    setInlineEditId(cat.id);
    setInlineEditNome(cat.nome);
    setTimeout(() => inlineInputRef.current?.select(), 50);
  }, []);

  const handleInlineSave = useCallback(async (catId: number) => {
    if (!inlineEditNome.trim()) { setInlineEditId(null); return; }
    try {
      await updateCategoriaMutation.mutateAsync({ id: catId, nome: inlineEditNome.trim() });
      toast.success("Nome atualizado!");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar nome");
    } finally {
      setInlineEditId(null);
    }
  }, [inlineEditNome, updateCategoriaMutation, refetch]);

  // ── Construção da árvore de pastas ────────────────────────────────────────
  const tree = useMemo(() => {
    // Mapa de links por categoriaId
    const linksByCat = new Map<number | null, LinkItem[]>();
    links.forEach(link => {
      const catId = link.categoriaId ?? null;
      if (!linksByCat.has(catId)) linksByCat.set(catId, []);
      linksByCat.get(catId)!.push(link);
    });

    // Construir nós para cada categoria
    const nodeMap = new Map<number, GroupNode>();
    allCategorias.forEach(cat => {
      nodeMap.set(cat.id, {
        cat,
        links: linksByCat.get(cat.id) ?? [],
        children: [],
      });
    });

    // Montar hierarquia
    const roots: GroupNode[] = [];
    allCategorias.forEach(cat => {
      const node = nodeMap.get(cat.id)!;
      if (cat.parentId != null && nodeMap.has(cat.parentId)) {
        nodeMap.get(cat.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Ordenar filhos
    roots.forEach(r => r.children.sort((a, b) => a.cat.ordem - b.cat.ordem));
    roots.sort((a, b) => a.cat.ordem - b.cat.ordem);

    // Links sem categoria (fallback)
    const orphanLinks = linksByCat.get(null) ?? [];

    return { roots, orphanLinks };
  }, [links, allCategorias]);

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

  const handleEditLink = (link: LinkItem) => {
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
      refetch();
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
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover link");
    }
  };

  // ── Handlers de categoria ──────────────────────────────────────────────────
  const handleNewCat = (parentId?: number) => {
    setSelectedCat(null);
    setCatNome("");
    setCatDescricao("");
    setCatOrdem(0);
    setCatParentId(parentId != null ? String(parentId) : "__none__");
    setCatDialogOpen(true);
  };

  const handleNewSubCat = (parentId: number) => handleNewCat(parentId);

  const handleEditCat = (cat: Categoria) => {
    setSelectedCat(cat);
    setCatNome(cat.nome || "");
    setCatDescricao(cat.descricao || "");
    setCatOrdem(cat.ordem || 0);
    setCatParentId(cat.parentId != null ? String(cat.parentId) : "__none__");
    setCatDialogOpen(true);
  };

  const handleSaveCat = async () => {
    try {
      const parentId = catParentId === "__none__" ? null : parseInt(catParentId);
      if (selectedCat) {
        await updateCategoriaMutation.mutateAsync({
          id: selectedCat.id,
          nome: catNome,
          descricao: catDescricao,
          ordem: catOrdem,
          parentId,
        });
        toast.success("Pasta atualizada!");
      } else {
        await createCategoriaMutation.mutateAsync({
          nome: catNome,
          descricao: catDescricao,
          ordem: catOrdem,
          parentId,
        });
        toast.success("Pasta criada!");
        setOpenCategories(prev => new Set(Array.from(prev).concat(catNome)));
      }
      setCatDialogOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar pasta");
    }
  };

  const handleConfirmDeleteCat = async () => {
    if (!catToDelete) return;
    try {
      await deleteCategoriaMutation.mutateAsync({ id: catToDelete.id });
      toast.success("Pasta removida.");
      setDeleteCatDialogOpen(false);
      setCatToDelete(null);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover pasta");
    }
  };

  // ── Pastas raiz (sem parentId) para o select de "Pasta pai" ───────────────
  const rootCategorias = useMemo(() =>
    allCategorias.filter(c => c.parentId == null),
    [allCategorias]
  );

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
            <Button variant="outline" onClick={() => handleNewCat()}>
              <FolderPlus className="mr-2 h-4 w-4" />
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
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando links...</div>
      ) : tree.roots.length === 0 && tree.orphanLinks.length === 0 ? (
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
          {/* Pastas raiz */}
          {tree.roots.map(node => {
            const key = String(node.cat.id);
            const isOpen = openCategories.has(key);
            const total = countLinks(node);

            return (
              <Card key={key} className="overflow-hidden">
                {/* Cabeçalho da pasta raiz */}
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
                      {isAdmin && inlineEditId === node.cat.id ? (
                        <input
                          ref={inlineInputRef}
                          className="font-semibold text-sm border-b border-primary bg-transparent outline-none min-w-[120px] max-w-[220px] px-1"
                          value={inlineEditNome}
                          onChange={e => setInlineEditNome(e.target.value)}
                          onBlur={() => handleInlineSave(node.cat.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleInlineSave(node.cat.id);
                            if (e.key === 'Escape') setInlineEditId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`font-semibold text-sm${isAdmin ? ' cursor-text hover:underline decoration-dotted' : ''}`}
                          title={isAdmin ? 'Clique para editar o nome' : undefined}
                          onClick={e => isAdmin ? handleInlineEdit(e, node.cat) : undefined}
                        >
                          {node.cat.nome}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {total} {total === 1 ? "link" : "links"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCat(node.cat)} title="Editar pasta">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { setCatToDelete(node.cat); setDeleteCatDialogOpen(true); }} title="Excluir pasta">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleNewSubCat(node.cat.id); }} title="Nova subpasta">
                          <FolderPlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); handleNewLink(node.cat.id); }} title="Adicionar link nesta pasta">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {isOpen
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </button>

                {/* Conteúdo da pasta raiz */}
                {isOpen && (
                  <div className="border-t">
                    {/* Links diretos */}
                    {node.links.length > 0 && (
                      <div className="divide-y">
                        {node.links.map(link => (
                          <LinkRow key={link.id} link={link} isAdmin={isAdmin} handleEditLink={handleEditLink} setLinkToDelete={setLinkToDelete} setDeleteLinkDialogOpen={setDeleteLinkDialogOpen} />
                        ))}
                      </div>
                    )}

                    {/* Subpastas */}
                    {node.children.length > 0 && (
                      <div className={`space-y-2 p-3${node.links.length > 0 ? ' border-t' : ''}`}>
                        {node.children.map(child => (
                          <SubpastaRow
                            key={child.cat.id}
                            node={child}
                            isAdmin={isAdmin}
                            openCategories={openCategories}
                            toggleCategory={toggleCategory}
                            inlineEditId={inlineEditId}
                            inlineEditNome={inlineEditNome}
                            inlineInputRef={inlineInputRef}
                            setInlineEditNome={setInlineEditNome}
                            handleInlineEdit={handleInlineEdit}
                            handleInlineSave={handleInlineSave}
                            setInlineEditId={setInlineEditId}
                            handleEditCat={handleEditCat}
                            setCatToDelete={setCatToDelete}
                            setDeleteCatDialogOpen={setDeleteCatDialogOpen}
                            handleNewLink={handleNewLink}
                            handleNewSubCat={handleNewSubCat}
                            handleEditLink={handleEditLink}
                            setLinkToDelete={setLinkToDelete}
                            setDeleteLinkDialogOpen={setDeleteLinkDialogOpen}
                          />
                        ))}
                      </div>
                    )}

                    {/* Pasta vazia */}
                    {node.links.length === 0 && node.children.length === 0 && (
                      <div className="px-5 py-3 text-xs text-muted-foreground italic">
                        Nenhum link ou subpasta nesta pasta
                        {isAdmin && <span className="ml-1">— use os botões acima para adicionar</span>}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Links sem pasta (órfãos) */}
          {tree.orphanLinks.length > 0 && (
            <Card className="overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/20">
                <span className="font-semibold text-sm text-muted-foreground">Sem pasta</span>
              </div>
              <div className="divide-y">
                {tree.orphanLinks.map(link => (
                  <LinkRow key={link.id} link={link} isAdmin={isAdmin} handleEditLink={handleEditLink} setLinkToDelete={setLinkToDelete} setDeleteLinkDialogOpen={setDeleteLinkDialogOpen} />
                ))}
              </div>
            </Card>
          )}
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
                  <SelectValue placeholder="Sem pasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem pasta</SelectItem>
                  {allCategorias.map(cat => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.parentId != null ? `  └ ${cat.nome}` : cat.nome}
                    </SelectItem>
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
              <Input id="catNome" value={catNome} onChange={e => setCatNome(e.target.value)} placeholder="Ex: Formulários" />
            </div>
            <div className="space-y-2">
              <Label>Pasta pai (opcional)</Label>
              <Select value={catParentId} onValueChange={setCatParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (pasta raiz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhuma (pasta raiz)</SelectItem>
                  {rootCategorias
                    .filter(c => !selectedCat || c.id !== selectedCat.id)
                    .map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Selecione uma pasta raiz para criar uma subpasta dentro dela</p>
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
              {catToDelete?.parentId == null
                ? " Os links e subpastas serão movidos para 'Sem pasta'."
                : " Os links serão movidos para a pasta pai."}
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
