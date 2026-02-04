import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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


type UserStatus = 'pending' | 'approved' | 'rejected';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  accountStatus: UserStatus;
  loginMethod: string | null;
  createdAt: Date;
  lastSignedIn: Date;
}

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<UserStatus>('pending');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject';
    user: User | null;
  }>({ open: false, action: 'approve', user: null });

  const utils = trpc.useUtils();
  
  const { data: users, isLoading } = trpc.users.list.useQuery({ status: activeTab });
  const { data: pendingCount } = trpc.auth.pendingCount.useQuery();

  const approveMutation = trpc.users.approve.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.auth.pendingCount.invalidate();
    },
    onError: (error) => {
      alert(`Erro ao aprovar: ${error.message}`);
    },
  });

  const rejectMutation = trpc.users.reject.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      utils.auth.pendingCount.invalidate();
    },
    onError: (error) => {
      alert(`Erro ao rejeitar: ${error.message}`);
    },
  });

  const handleApprove = (user: User) => {
    setConfirmDialog({ open: true, action: 'approve', user });
  };

  const handleReject = (user: User) => {
    setConfirmDialog({ open: true, action: 'reject', user });
  };

  const confirmAction = () => {
    if (!confirmDialog.user) return;
    
    if (confirmDialog.action === 'approve') {
      approveMutation.mutate({ userId: confirmDialog.user.id });
    } else {
      rejectMutation.mutate({ userId: confirmDialog.user.id });
    }
    setConfirmDialog({ open: false, action: 'approve', user: null });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground mt-2">
          Aprove ou rejeite solicitações de acesso ao sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">com acesso ativo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">sem acesso</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserStatus)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingCount && pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Aprovados
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <UserX className="w-4 h-4" />
            Rejeitados
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando usuários...
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{user.name || 'Sem nome'}</h3>
                          {getStatusBadge(user.accountStatus)}
                          {user.role === 'admin' && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span>Cadastro: {formatDate(user.createdAt)}</span>
                          <span>Método: {user.loginMethod || 'interno'}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {user.accountStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(user)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleReject(user)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {user.accountStatus === 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(user)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {user.accountStatus === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(user)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Revogar Acesso
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'pending' && 'Nenhuma solicitação pendente'}
                  {activeTab === 'approved' && 'Nenhum usuário aprovado'}
                  {activeTab === 'rejected' && 'Nenhum usuário rejeitado'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve' ? 'Aprovar Usuário' : 'Rejeitar Usuário'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'approve' 
                ? `Tem certeza que deseja aprovar o acesso de "${confirmDialog.user?.name || confirmDialog.user?.email}"? O usuário poderá acessar o sistema imediatamente.`
                : `Tem certeza que deseja rejeitar o acesso de "${confirmDialog.user?.name || confirmDialog.user?.email}"? O usuário não poderá acessar o sistema.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmDialog.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
