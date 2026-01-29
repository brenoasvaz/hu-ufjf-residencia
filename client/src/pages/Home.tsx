import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Calendar, CalendarDays, Users, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

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
      icon: Users,
      title: "Residentes",
      description: "Gerencie informações dos residentes e acompanhe seus rodízios",
      href: "/residentes",
      color: "text-green-600",
    },
    {
      icon: FileText,
      title: "Importações",
      description: "Importe cronogramas e escalas a partir de arquivos PDF",
      href: "/admin/imports",
      color: "text-orange-600",
      adminOnly: true,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          HU UFJF Residência Médica
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sistema de gerenciamento de rodízios e cronogramas para o Serviço de Ortopedia e
          Traumatologia
        </p>

        {!isAuthenticated ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>
                Fazer Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="pt-4">
            <p className="text-lg">
              Bem-vindo, <span className="font-semibold">{user?.name}</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.role === "admin" ? "Administrador" : "Visualizador"}
            </p>
          </div>
        )}
      </section>

      {/* Features Grid */}
      {isAuthenticated && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Funcionalidades</h2>
            <p className="text-muted-foreground mt-2">
              Acesse os recursos disponíveis na plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features
              .filter((feature) => !feature.adminOnly || user?.role === "admin")
              .map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <Link href={feature.href}>
                      <a className="block">
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
                      </a>
                    </Link>
                  </Card>
                );
              })}
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="bg-muted/50 rounded-lg p-8 space-y-4">
        <h3 className="text-2xl font-semibold">Sobre o Sistema</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-2">Calendário Mensal</h4>
            <p>
              Visualize os rodízios dos residentes organizados por mês, com informações sobre
              estágios, duplas e locais de atuação. Filtre por residente, ano (R1/R2/R3) ou
              estágio específico.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Calendário Semanal</h4>
            <p>
              Acompanhe as atividades semanais (aulas, reuniões clínicas, ambulatórios) com
              horários detalhados. Filtre por ano de residência e bloco de atuação.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Gerenciamento de Residentes</h4>
            <p>
              Cadastre e gerencie informações dos residentes, incluindo nome, apelido, ano de
              residência e status. Visualize o histórico de rodízios de cada residente.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">Importação de Dados</h4>
            <p>
              Importe cronogramas e escalas diretamente de arquivos PDF com extração automática de
              dados. Confira e valide as informações antes de salvar no sistema.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
