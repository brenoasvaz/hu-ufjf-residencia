import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setLocation("/");
    },
    onError: (error) => {
      setLoginError(error.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setRegisterSuccess(true);
    },
    onError: (error) => {
      setRegisterError(error.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    loginMutation.mutate({
      email: loginEmail,
      password: loginPassword,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("As senhas não coincidem");
      return;
    }
    
    if (registerPassword.length < 6) {
      setRegisterError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    registerMutation.mutate({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
  };

  const handleOAuthLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">HU</span>
          </div>
          <CardTitle className="text-2xl">HU UFJF Residência</CardTitle>
          <CardDescription>
            Plataforma de Residência Médica em Ortopedia
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Entrar
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              {registerSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-700">Cadastro realizado com sucesso!</h3>
                  <p className="text-sm text-muted-foreground">
                    Sua solicitação de acesso foi enviada e está aguardando aprovação de um administrador.
                    Você receberá acesso assim que sua conta for aprovada.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRegisterSuccess(false);
                      setActiveTab("login");
                    }}
                  >
                    Voltar para Login
                  </Button>
                </div>
              ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {registerError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Repita a senha"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Cadastrar
                </Button>
              </form>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleOAuthLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Entrar com Manus
          </Button>
        </CardContent>
        
        <CardFooter className="text-center text-sm text-muted-foreground">
          <p className="w-full">
            Hospital Universitário da UFJF - Serviço de Ortopedia e Traumatologia
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
