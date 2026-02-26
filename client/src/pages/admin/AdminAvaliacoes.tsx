import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, Users, TrendingUp, FileText, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminAvaliacoes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: modelos, isLoading: loadingModelos } = trpc.avaliacoes.modelos.list.useQuery();

  if (!user || user.role !== 'admin') {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie modelos de prova, questões e acompanhe o desempenho dos residentes
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modelos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Modelos de prova</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Questões</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.044</div>
            <p className="text-xs text-muted-foreground">Questões cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">Áreas de Ortopedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Residentes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="modelos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="modelos">Modelos de Prova</TabsTrigger>
          <TabsTrigger value="questoes">Questões</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Modelos de Prova */}
        <TabsContent value="modelos" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Modelos de Prova</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie os modelos de prova disponíveis para os residentes
              </p>
            </div>
            <Link href="/admin/avaliacoes/modelos">
              <Button>
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Modelos
              </Button>
            </Link>
          </div>

          {loadingModelos ? (
            <div className="text-center py-8 text-muted-foreground">Carregando modelos...</div>
          ) : modelos && modelos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {modelos.map((modelo: any) => (
                <Card key={modelo.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {modelo.nome}
                    </CardTitle>
                    {modelo.descricao && (
                      <CardDescription>{modelo.descricao}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Total de questões:</span>{' '}
                        {JSON.parse(modelo.configuracao || '{}') &&
                          Object.values(JSON.parse(modelo.configuracao || '{}')).reduce(
                            (sum: number, val: any) => sum + val,
                            0
                          )}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Duração:</span> {modelo.duracaoMinutos} minutos
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Criado em:</span>{' '}
                        {new Date(modelo.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum modelo de prova cadastrado.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Questões */}
        <TabsContent value="questoes" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Banco de Questões</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie as questões cadastradas no sistema
            </p>
          </div>

          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <ClipboardCheck className="h-16 w-16 text-muted-foreground/50 mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">2.044 Questões Cadastradas</p>
                <p className="text-sm text-muted-foreground">
                  13 especialidades de Ortopedia e Traumatologia
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade de visualização e edição de questões em desenvolvimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estatísticas */}
        <TabsContent value="estatisticas" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Estatísticas Gerais</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o desempenho geral dos residentes e estatísticas do sistema
            </p>
          </div>

          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <TrendingUp className="h-16 w-16 text-muted-foreground/50 mx-auto" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Dashboard Agregado</p>
                <p className="text-sm text-muted-foreground">
                  Visualização de estatísticas consolidadas, ranking de residentes e análise de questões mais erradas
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Em breve você poderá visualizar:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Ranking de desempenho dos residentes</li>
                  <li>• Questões com maior taxa de erro</li>
                  <li>• Especialidades com maior dificuldade</li>
                  <li>• Evolução temporal do grupo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
