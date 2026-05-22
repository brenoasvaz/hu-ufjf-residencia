import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX } from "lucide-react";

type UserStatus = "pending" | "approved" | "rejected";

interface User {
  id: number;
  openId: string | null;
  email: string;
  name: string | null;
  role: string;
  accountStatus: UserStatus;
  createdAt: Date;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<UserStatus>("pending");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject";
    user: User | null;
  }>({ open: false, action: "approve", user: null });

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const { data: pendingCount } = trpc.auth.pendingCount.useQuery();

  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.auth.pendingCount.invalidate();
    },
    onError: (error) => alert(`Erro ao aprovar: ${error.message}`),
  });

  const rejectMutation = trpc.users.reject.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.auth.pendingCount.invalidate();
    },
    onError: (error) => alert(`Erro ao rejeitar: ${error.message}`),
  });

  const confirmAction = () => {
    if (!confirmDialog.user) return;
    if (confirmDialog.action === "approve") {
      approveMutation.mutate({ userId: confirmDialog.user.id });
    } else {
      rejectMutation.mutate({ userId: confirmDialog.user.id });
    }
    setConfirmDialog({ open: false, action: "approve", user: null });
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 gap-1 shrink-0">
            <Clock className="w-3 h-3" /> Pendente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 gap-1 shrink-0">
            <CheckCircle className="w-3 h-3" /> Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 gap-1 shrink-0">
            <XCircle className="w-3 h-3" /> Rejeitado
          </Badge>
        );
    }
  };

  const filteredUsers = users?.filter((u) => u.accountStatus === activeTab) ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aprove ou rejeite solicitações de acesso ao sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pendentes</CardTitle>
            <Clock className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{pendingCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Aprovados</CardTitle>
            <UserCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">
              {users?.filter((u) => u.accountStatus === "approved").length ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium text-muted-foreground">Rejeitados</CardTitle>
            <UserX className="h-3.5 w-3.5 text-red-500 shrink-0" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">
              {users?.filter((u) => u.accountStatus === "rejected").length ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserStatus)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-1.5 text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            Pendentes
            {pendingCount && pendingCount > 0 ? (
              <Badge variant="destructive" className="ml-0.5 h-4 min-w-4 px-1 text-[10px]">
                {pendingCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5 text-xs sm:text-sm">
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            Aprovados
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5 text-xs sm:text-sm">
            <UserX className="w-3.5 h-3.5 shrink-0" />
            Rejeitados
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Carregando usuários...
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    {/* Linha 1: nome + badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-semibold text-sm leading-tight">
                        {user.name || "Sem nome"}
                      </span>
                      {getStatusBadge(user.accountStatus)}
                      {user.role === "admin" && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Admin
                        </Badge>
                      )}
                    </div>

                    {/* Linha 2: email + data */}
                    <p className="text-xs text-muted-foreground truncate mb-0.5">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Cadastrado em {formatDate(user.createdAt)}
                    </p>

                    {/* Linha 3: botões de ação — largura total no mobile */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                      {user.accountStatus === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => setConfirmDialog({ open: true, action: "approve", user })}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => setConfirmDialog({ open: true, action: "reject", user })}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {user.accountStatus === "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => setConfirmDialog({ open: true, action: "approve", user })}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                          Aprovar
                        </Button>
                      )}
                      {user.accountStatus === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto text-red-700 border-red-300 hover:bg-red-50"
                          onClick={() => setConfirmDialog({ open: true, action: "reject", user })}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Revogar Acesso
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {activeTab === "pending" && "Nenhuma solicitação pendente"}
                  {activeTab === "approved" && "Nenhum usuário aprovado"}
                  {activeTab === "rejected" && "Nenhum usuário rejeitado"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "approve" ? "Aprovar Usuário" : "Rejeitar Usuário"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "approve"
                ? `Tem certeza que deseja aprovar o acesso de "${confirmDialog.user?.name || confirmDialog.user?.email}"?`
                : `Tem certeza que deseja rejeitar o acesso de "${confirmDialog.user?.name || confirmDialog.user?.email}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                confirmDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {confirmDialog.action === "approve" ? "Aprovar" : "Rejeitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
