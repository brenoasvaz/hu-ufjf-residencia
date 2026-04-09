import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Presentation,
  UserCog,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  Link as LinkIcon,
  Sun,
  Moon,
  ChevronDown,
  BookOpen,
  BookMarked,
  Home,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  href?: string;
  items?: NavItem[];
  /** Se true, exibe o badge de pendentes neste grupo */
  showPendingBadge?: boolean;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Busca contagem de avaliações pendentes (só para usuários autenticados não-admin)
  const { data: pendingData } = trpc.avaliacoes.pendingCount.useQuery(undefined, {
    enabled: !!isAuthenticated,
    refetchInterval: 60_000, // atualiza a cada 1 minuto
    staleTime: 30_000,
  });
  const pendingCount = pendingData?.count ?? 0;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logout realizado com sucesso");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const isAdmin = user?.role === "admin";

  const navGroups: NavGroup[] = [
    { label: "Início", icon: Home, href: "/" },
    {
      label: "Calendários",
      icon: Calendar,
      items: [
        { href: "/calendario-mensal", label: "Calendário Mensal", icon: Calendar },
        { href: "/calendario-semanal", label: "Calendário Semanal", icon: CalendarDays },
      ],
    },
    { label: "Residentes", icon: Users, href: "/residentes" },
    { label: "Reuniões Clínicas", icon: Presentation, href: "/reunioes-clinicas" },
    {
      label: "Avaliações",
      icon: ClipboardCheck,
      showPendingBadge: true,
      items: [
        { href: "/avaliacoes", label: "Simulados", icon: ClipboardCheck },
        { href: "/escala-avaliacoes-praticas", label: "Escala Avaliações Práticas", icon: BookOpen },
      ],
    },
    { label: "Clube de Revista", icon: BookMarked, href: "/clube-de-revista" },
    { label: "Links Úteis", icon: LinkIcon, href: "/links-uteis" },
    ...(isAdmin
      ? [
          {
            label: "Administração",
            icon: Settings,
            items: [
              { href: "/admin", label: "Painel Admin", icon: Settings },
              { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
              { href: "/admin/avaliacoes", label: "Gestão de Avaliações", icon: BarChart3 },
              { href: "/admin/escala-avaliacoes", label: "Escala de Avaliações", icon: ClipboardList },
            ],
          } as NavGroup,
        ]
      : []),
  ];

  // Lista plana para menu mobile
  const allNavItems: NavItem[] = navGroups.flatMap((g) =>
    g.href ? [{ href: g.href, label: g.label, icon: g.icon }] : (g.items ?? [])
  );

  const linkClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  /** Badge vermelho com número */
  const PendingBadge = ({ count }: { count: number }) => {
    if (count <= 0) return null;
    return (
      <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base hidden sm:inline">HU UFJF</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {navGroups.map((group) => {
              const Icon = group.icon;
              const showBadge = group.showPendingBadge && pendingCount > 0;

              // Link direto
              if (group.href) {
                return (
                  <Link
                    key={group.href}
                    href={group.href}
                    className={linkClass(location === group.href)}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{group.label}</span>
                  </Link>
                );
              }

              // Dropdown
              const isGroupActive = group.items?.some((item) => location === item.href);
              return (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <button className={linkClass(!!isGroupActive)}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{group.label}</span>
                      {showBadge && <PendingBadge count={pendingCount} />}
                      <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52">
                    {group.items!.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = location === item.href;
                      // Mostra badge apenas no item "Simulados"
                      const itemShowBadge = group.showPendingBadge && item.href === "/avaliacoes" && pendingCount > 0;
                      return (
                        <DropdownMenuItem
                          key={item.href}
                          className={`gap-2.5 cursor-pointer ${isActive ? "bg-primary/10 text-primary font-medium" : ""}`}
                          onClick={() => navigate(item.href)}
                        >
                          <ItemIcon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {itemShowBadge && <PendingBadge count={pendingCount} />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-3 pl-2 border-l ml-1">
                <div className="text-sm text-right">
                  <p className="font-medium leading-tight">{user.name}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {user.role === "admin" ? "Administrador" : "Visualizador"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile hamburger — com badge se houver pendentes */}
            <div className="relative md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              {!mobileMenuOpen && pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none pointer-events-none">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container py-3 space-y-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                const itemShowBadge = item.href === "/avaliacoes" && pendingCount > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {itemShowBadge && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              {isAuthenticated && user && (
                <>
                  <div className="px-4 py-3 border-t mt-2">
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
          <p>HU UFJF - Serviço de Ortopedia e Traumatologia © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
