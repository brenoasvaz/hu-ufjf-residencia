import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Shield, UserCog, ArrowLeft, Trash2, CheckCircle, XCircle, Clock, Ban } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GerenciarUsuarios() {
  const { user } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userToRevoke, setUserToRevoke] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user">("user");

  const { data: usuarios, isLoading, refetch } = trpc.users.list.useQuery();
  const updateMutation = trpc.users.update.useMutation();
  const deleteMutation = trpc.users.delete.useMutation();
  const approveMutation = trpc.users.approve.useMutation();
  const rejectMutation = trpc.users.reject.useMutation();

  if (!user || user.role !== "admin") {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleEditClick = (usuario: any) => {
    setSelectedUser(usuario);
    setEditName(usuario.name || "");
    setEditEmail(usuario.email || "");
    setEditRole(usuario.role || "user");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      await updateMutation.mutateAsync({
        userId: selectedUser.id,
        name: editName,
        email: editEmail,
        role: editRole,
      });
      toast.success("Usuário atualizado com sucesso!");
      setEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar usuário");
    }
  };

  const handleDeleteClick = (usuario: any) => {
    setUserToDelete(usuario);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync({ userId: userToDelete.id });
      toast.success("Usuário deletado com sucesso!");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar usuário");
    }
  };

  const handleRevokeClick = (usuario: any) => {
    setUserToRevoke(usuario);
    setRevokeDialogOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!userToRevoke) return;
    try {
      await rejectMutation.mutateAsync({ userId: userToRevoke.id });
      toast.success(`Acesso de ${userToRevoke.name || userToRevoke.email} revogado.`);
      setRevokeDialogOpen(false);
      setUserToRevoke(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao revogar acesso");
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await approveMutation.mutateAsync({ userId });
      toast.success("Acesso aprovado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao aprovar usuário");
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await rejectMutation.mutateAsync({ userId });
      toast.success("Usuário rejeitado.");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao rejeitar usuário");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 gap-1 shrink-0 text-xs">
            <Clock className="h-3 w-3" /> Pendente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 gap-1 shrink-0 text-xs">
            <CheckCircle className="h-3 w-3" /> Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 gap-1 shrink-0 text-xs">
            <XCircle className="h-3 w-3" /> Acesso Revogado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mt-0.5 shrink-0">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize e edite informações dos usuários, incluindo permissões de administrador.
          </p>
        </div>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Usuários Cadastrados
          </CardTitle>
          <CardDescription>{usuarios?.length || 0} usuários no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Carregando usuários...</div>
          ) : usuarios && usuarios.length > 0 ? (
            <div className="space-y-3">
              {usuarios.map((usuario: any) => (
                <Card key={usuario.id} className={usuario.accountStatus === "rejected" ? "opacity-70" : ""}>
                  <CardContent className="p-4">
                    {/* Linha 1: nome + badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-medium text-sm leading-tight">
                        {usuario.name || "Sem nome"}
                      </span>
                      {usuario.role === "admin" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 shrink-0 text-xs">
                          <Shield className="h-3 w-3" /> Administrador
                        </Badge>
                      )}
                      {usuario.id === user.id && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 shrink-0 text-xs">
                          Você
                        </Badge>
                      )}
                      {getStatusBadge(usuario.accountStatus)}
                    </div>

                    {/* Linha 2: email + data */}
                    <p className="text-xs text-muted-foreground truncate mb-0.5">{usuario.email}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Cadastrado em {new Date(usuario.createdAt).toLocaleDateString("pt-BR")}
                    </p>

                    {/* Botões de ação — coluna no mobile, linha no desktop */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {/* Pendente: Aprovar + Rejeitar */}
                      {usuario.accountStatus === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleApprove(usuario.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Aprovar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleReject(usuario.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Rejeitar
                          </Button>
                        </>
                      )}

                      {/* Aprovado: Editar + Revogar Acesso + Deletar */}
                      {usuario.accountStatus === "approved" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleEditClick(usuario)}
                          >
                            <UserCog className="mr-1.5 h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-orange-700 border-orange-300 hover:bg-orange-50"
                            onClick={() => handleRevokeClick(usuario)}
                            disabled={usuario.id === user.id}
                            title={usuario.id === user.id ? "Você não pode revogar seu próprio acesso" : "Revogar acesso do usuário"}
                          >
                            <Ban className="mr-1.5 h-3.5 w-3.5" />
                            Revogar Acesso
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleDeleteClick(usuario)}
                            disabled={usuario.id === user.id}
                            title={usuario.id === user.id ? "Você não pode deletar sua própria conta" : "Deletar usuário permanentemente"}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Deletar
                          </Button>
                        </>
                      )}

                      {/* Revogado: Restaurar Acesso + Deletar */}
                      {usuario.accountStatus === "rejected" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleApprove(usuario.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Restaurar Acesso
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleDeleteClick(usuario)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Deletar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum usuário encontrado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog: Editar Usuário ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Altere as informações do usuário e suas permissões.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Permissão</Label>
              <Select value={editRole} onValueChange={(v: "admin" | "user") => setEditRole(v)}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Administradores têm acesso completo ao sistema, incluindo gerenciamento de usuários e configurações.
              </p>
            </div>
            {selectedUser?.id === user.id && editRole === "user" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  ⚠️ Você não pode remover suas próprias credenciais de administrador.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending || (selectedUser?.id === user.id && editRole === "user")}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog: Revogar Acesso ── */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar Acesso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja revogar o acesso de{" "}
              <strong>{userToRevoke?.name || userToRevoke?.email}</strong>? O usuário não conseguirá mais
              fazer login no sistema. Você poderá restaurar o acesso a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-800">
            Os dados do usuário serão preservados. Esta ação pode ser desfeita.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Revogar Acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── AlertDialog: Deletar Usuário ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar{" "}
              <strong>{userToDelete?.name || userToDelete?.email}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            ⚠️ <strong>Atenção:</strong> Todos os dados associados a este usuário serão permanentemente removidos do sistema.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deletando..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
