import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CalendarDays,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Presentation,
  UserCog,
  ClipboardCheck,
  BarChart3,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logout realizado com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const navItems = [
    {
      href: "/",
      label: "Início",
      icon: CalendarDays,
    },
    {
      href: "/calendario-mensal",
      label: "Calendário Mensal",
      icon: Calendar,
    },
    {
      href: "/calendario-semanal",
      label: "Calendário Semanal",
      icon: CalendarDays,
    },
    {
      href: "/residentes",
      label: "Residentes",
      icon: Users,
    },
    {
      href: "/reunioes-clinicas",
      label: "Reuniões Clínicas",
      icon: Presentation,
    },
    {
      href: "/avaliacoes",
      label: "Avalia\u00e7\u00f5es",
      icon: ClipboardCheck,
    },
    {
      href: "/links-uteis",
      label: "Links \u00dateis",
      icon: LinkIcon,
    },
    ...(user?.role === "admin"
      ? [
          {
            href: "/admin",
            label: "Administra\u00e7\u00e3o",
            icon: Settings,
          },
          // {
          //   href: "/admin/imports",
          //   label: "Importa\u00e7\u00f5es",
          //   icon: FileText,
          // },
          {
            href: "/admin/usuarios",
            label: "Usu\u00e1rios",
            icon: UserCog,
          },
          {
            href: "/admin/avaliacoes",
            label: "Gestão de Avaliações",
            icon: BarChart3,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">HU UFJF Residência</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "admin" ? "Administrador" : "Visualizador"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                );
              })}
              {isAuthenticated && user && (
                <>
                  <div className="px-4 py-3 border-t mt-4">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role === "admin" ? "Administrador" : "Visualizador"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>
            HU UFJF - Serviço de Ortopedia e Traumatologia © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
