import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Calendar, CalendarDays, FileText, MapPin, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Admin() {
  const { data: residents } = trpc.residents.list.useQuery();
  const { data: rotations } = trpc.rotations.list.useQuery();
  const { data: activities } = trpc.weeklyActivities.list.useQuery();
  const { data: imports } = trpc.imports.list.useQuery();

  const stats = [
    {
      title: "Residentes",
      value: residents?.length || 0,
      icon: Users,
      href: "/residentes",
      color: "text-blue-600",
    },
    {
      title: "Rodízios",
      value: rotations?.length || 0,
      icon: Calendar,
      href: "/calendario-mensal",
      color: "text-purple-600",
    },
    {
      title: "Atividades Semanais",
      value: activities?.length || 0,
      icon: CalendarDays,
      href: "/calendario-semanal",
      color: "text-green-600",
    },
    {
      title: "Importações",
      value: imports?.length || 0,
      icon: FileText,
      href: "/admin/imports",
      color: "text-orange-600",
    },
  ];

  const adminActions = [
    {
      title: "Gerenciar Residentes",
      description: "Adicionar, editar ou remover residentes do sistema",
      icon: Users,
      href: "/residentes",
    },
    {
      title: "Gerenciar Rodízios",
      description: "Criar e editar rodízios mensais de residentes",
      icon: Calendar,
      href: "/calendario-mensal",
    },
    {
      title: "Gerenciar Atividades",
      description: "Configurar cronograma semanal de atividades",
      icon: CalendarDays,
      href: "/calendario-semanal",
    },
    {
      title: "Importar PDFs",
      description: "Importar cronogramas e escalas a partir de arquivos PDF",
      icon: FileText,
      href: "/admin/imports",
    },
    {
      title: "Gerenciar Estágios",
      description: "Configurar locais e estágios disponíveis",
      icon: MapPin,
      href: "#",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todos os aspectos do sistema de residência
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Link href={stat.href}>
                  <a className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 mt-1">
                    Ver todos
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ações Administrativas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="mt-4">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={action.href}>
                    <Button variant="outline" className="w-full">
                      Acessar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Funcionalidades Disponíveis</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Gerenciamento de residentes</li>
                <li>✓ Calendário mensal de rodízios</li>
                <li>✓ Calendário semanal de atividades</li>
                <li>✓ Importação de PDFs</li>
                <li>✓ Controle de acesso (Admin/Viewer)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Próximas Implementações</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Exportação para PDF e ICS</li>
                <li>• Validação automática de conflitos</li>
                <li>• Notificações de mudanças</li>
                <li>• Histórico de alterações</li>
                <li>• Relatórios e estatísticas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
