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
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          HU UFJF Residência Médica Ortopedia e Traumatologia
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistema de gerenciamento de rodízios e cronogramas para o Serviço de Ortopedia e
          Traumatologia
        </p>
      </div>

      {/* Boas-vindas / CTA de login */}
      {!isAuthenticated ? (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Button size="default" asChild>
            <a href="/login">
              Fazer Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Bem-vindo, <span className="font-semibold text-foreground">{user?.name}</span>
          {" — "}
          {user?.role === "admin" ? "Administrador" : "Visualizador"}
        </p>
      )}

      {/* Grade de funcionalidades */}
      {isAuthenticated && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Funcionalidades</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse os recursos disponíveis na plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <section className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Sobre o Sistema</h2>
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
            <h3 className="font-medium text-foreground mb-1">Gerenciamento de Residentes</h3>
            <p>
              Cadastre e gerencie informações dos residentes, incluindo nome, apelido, ano de
              residência e status. Visualize o histórico de rodízios de cada residente.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">Importação de Dados</h3>
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
