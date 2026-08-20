import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function ContaSeguranca() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { data: passwordStatus, isLoading: isLoadingStatus } = trpc.auth.passwordStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const setPasswordMutation = trpc.auth.setPassword.useMutation({
    onSuccess: () => {
      toast.success(passwordStatus?.hasPassword ? "Senha atualizada com sucesso." : "Senha definida com sucesso. Você já pode entrar com e-mail e senha.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => setFormError(error.message || "Não foi possível atualizar a senha."),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (newPassword.length < 8) {
      setFormError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("A confirmação não corresponde à nova senha.");
      return;
    }
    if (passwordStatus?.hasPassword && !currentPassword) {
      setFormError("Informe a senha atual para alterá-la.");
      return;
    }

    setPasswordMutation.mutate({
      newPassword,
      ...(passwordStatus?.hasPassword ? { currentPassword } : {}),
    });
  };

  if (loading || isLoadingStatus) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Carregando dados da conta...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/">
          <Button variant="outline" size="icon" title="Voltar ao início">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Segurança da conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Defina ou altere a senha de acesso associada ao seu e-mail.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Sua conta
          </CardTitle>
          <CardDescription>O e-mail, as permissões e o histórico existentes serão preservados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Nome:</span> {user?.name || "Não informado"}</p>
          <p><span className="font-medium">E-mail:</span> {passwordStatus?.email || user?.email}</p>
          <p className="text-muted-foreground">
            {passwordStatus?.hasPassword
              ? "Esta conta já possui uma senha configurada."
              : "Esta conta não possui senha configurada. Ao definir uma, você poderá entrar com e-mail e senha além do OAuth."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5 text-primary" />
            {passwordStatus?.hasPassword ? "Alterar senha" : "Definir senha"}
          </CardTitle>
          <CardDescription>Nunca compartilhe sua senha com outras pessoas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>
            )}

            {passwordStatus?.hasPassword && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
              <p className="text-xs text-muted-foreground">Use pelo menos 8 caracteres.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={setPasswordMutation.isPending}>
              {setPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {passwordStatus?.hasPassword ? "Atualizar senha" : "Definir senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
