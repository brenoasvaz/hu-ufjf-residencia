import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Calendar, CalendarDays, Presentation, BookMarked, ArrowRight, Bell, Sparkles, BookOpen, PlayCircle, Eye } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // Busca alertas de avaliações/gabaritos pendentes (apenas para residentes logados)
  const { data: alertas } = trpc.avaliacoes.alertas.useQuery(undefined, {
    enabled: !!isAuthenticated && user?.role !== 'admin',
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const novasAvaliacoes = alertas?.novasAvaliacoes ?? [];
  const gaboritosDisponiveis = alertas?.gaboritosDisponiveis ?? [];
  const totalAlertas = novasAvaliacoes.length + gaboritosDisponiveis.length;

  const features = [
    {
      icon: Calendar,
      title: "Calendário Mensal",
      description: "Visualize os rodízios de residentes por mês com filtros avançados",
      href: "/calendario-mensal",
      color: "text-blue-600",
    },
    {
      icon: CalendarDays,
      title: "Calendário Semanal",
      description: "Acompanhe as atividades semanais por ano e bloco de residência",
      href: "/calendario-semanal",
      color: "text-purple-600",
    },
    {
      icon: Presentation,
      title: "Reuniões Clínicas",
      description: "Cronograma de reuniões, apresentações e atividades clínicas do serviço",
      href: "/reunioes-clinicas",
      color: "text-rose-600",
    },
    {
      icon: BookMarked,
      title: "Clube de Revista",
      description: "Cronograma de apresentações de artigos científicos com download dos PDFs",
      href: "/clube-de-revista",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero centralizado */}
      <div className="flex flex-col items-center text-center py-8 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight max-w-xl">
          HU UFJF Residência Médica Ortopedia e Traumatologia
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Sistema de gerenciamento de rodízios e cronogramas para o Serviço de Ortopedia e
          Traumatologia
        </p>

        {!isAuthenticated ? (
          <Button size="default" asChild className="mt-2">
            <a href="/login">
              Fazer Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bem-vindo, <span className="font-semibold text-foreground">{user?.name}</span>
            {" — "}
            {user?.role === "admin" ? "Administrador" : "Visualizador"}
          </p>
        )}
      </div>

      {/* ===== CARD DE NOTIFICAÇÕES (apenas para residentes) ===== */}
      {isAuthenticated && user?.role !== 'admin' && totalAlertas > 0 && (
        <div className="max-w-2xl mx-auto w-full">
          <Card className="border-2 border-primary/30 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {totalAlertas === 1 ? "Você tem 1 notificação" : `Você tem ${totalAlertas} notificações`}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0">
                    Ações pendentes em Avaliações
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Novas avaliações */}
              {novasAvaliacoes.map((av) => (
                <div
                  key={av.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                        {av.nome}
                      </p>
                      <p className="text-xs text-blue-500 dark:text-blue-400">
                        Nova avaliação disponível • {av.totalQuestoes} questões
                        {av.duracaoMinutos ? ` • ${av.duracaoMinutos} min` : ""}
                      </p>
                    </div>
                  </div>
                  <Link href="/avaliacoes">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 h-7 text-xs px-3"
                    >
                      <PlayCircle className="mr-1 h-3 w-3" />
                      Iniciar
                    </Button>
                  </Link>
                </div>
              ))}

              {/* Gabaritos disponíveis */}
              {gaboritosDisponiveis.map((g) => (
                <div
                  key={g.simuladoId}
                  className="flex items-center justify-between gap-3 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                      <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200 truncate">
                        {g.modeloNome}
                      </p>
                      <p className="text-xs text-amber-500 dark:text-amber-400">
                        Gabarito disponível • {g.percentual}% de acertos • visualização única
                      </p>
                    </div>
                  </div>
                  <Link href={`/avaliacoes/${g.simuladoId}/resultado?gabarito=1`}>
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 h-7 text-xs px-3"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Ver
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade de funcionalidades */}
      {isAuthenticated && (
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Funcionalidades</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse os recursos disponíveis na plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <Link href={feature.href}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-background ${feature.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <CardTitle className="mt-4">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção informativa */}
      <section className="bg-muted/50 rounded-lg p-6 space-y-4 max-w-2xl mx-auto w-full">
        <h2 className="text-lg font-semibold text-center">Sobre o Sistema</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-medium text-foreground mb-1">Calendário Mensal</h3>
            <p>
              Visualize os rodízios dos residentes organizados por mês, com informações sobre
              estágios, duplas e locais de atuação. Filtre por residente, ano (R1/R2/R3) ou
              estágio específico.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Calendário Semanal</h3>
            <p>
              Acompanhe as atividades semanais (aulas, reuniões clínicas, ambulatórios) com
              horários detalhados. Filtre por ano de residência e bloco de atuação.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Reuniões Clínicas</h3>
            <p>
              Cronograma de reuniões, apresentações de casos e atividades clínicas do serviço.
              Exporte o calendário em PDF ou adicione ao Google Calendar.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Clube de Revista</h3>
            <p>
              Cronograma de apresentações de artigos científicos com título, autores, revista e
              residente apresentador. Faça download dos PDFs diretamente pela plataforma.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
