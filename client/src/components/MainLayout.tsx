import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
  Home,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

interface MainLayoutProps {
  children: ReactNode;
}

interface DropdownItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  href?: string; // link direto (sem dropdown)
  items?: DropdownItem[]; // dropdown
}

function DropdownMenu({
  group,
  location,
  onNavigate,
}: {
  group: NavGroup;
  location: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (group.href) {
    const isActive = location === group.href;
    const Icon = group.icon;
    return (
      <Link
        href={group.href}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
        onClick={onNavigate}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{group.label}</span>
      </Link>
    );
  }

  const isGroupActive = group.items?.some((item) => location === item.href);
  const Icon = group.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
          isGroupActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{group.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 rounded-md border bg-popover shadow-lg z-50 py-1">
          {group.items!.map((item) => {
            const ItemIcon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-popover-foreground hover:bg-accent"
                }`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                <ItemIcon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
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

  const isAdmin = user?.role === "admin";

  // Grupos de navegação — itens com href direto, grupos com dropdown
  const navGroups: NavGroup[] = [
    {
      label: "Início",
      icon: Home,
      href: "/",
    },
    {
      label: "Calendários",
      icon: Calendar,
      items: [
        { href: "/calendario-mensal", label: "Calendário Mensal", icon: Calendar },
        { href: "/calendario-semanal", label: "Calendário Semanal", icon: CalendarDays },
      ],
    },
    {
      label: "Residentes",
      icon: Users,
      href: "/residentes",
    },
    {
      label: "Reuniões Clínicas",
      icon: Presentation,
      href: "/reunioes-clinicas",
    },
    {
      label: "Avaliações",
      icon: ClipboardCheck,
      items: [
        { href: "/avaliacoes", label: "Simulados", icon: ClipboardCheck },
        { href: "/escala-avaliacoes-praticas", label: "Escala Prática", icon: BookOpen },
      ],
    },
    {
      label: "Links Úteis",
      icon: LinkIcon,
      href: "/links-uteis",
    },
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

  // Lista plana para o menu mobile
  const allNavItems: DropdownItem[] = navGroups.flatMap((g) =>
    g.href
      ? [{ href: g.href, label: g.label, icon: g.icon }]
      : (g.items ?? [])
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base hidden sm:inline">HU UFJF</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto">
            {navGroups.map((group) => (
              <DropdownMenu key={group.label} group={group} location={location} />
            ))}
          </nav>

          {/* Right side: theme + user */}
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

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container py-3 space-y-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
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
                    <span>{item.label}</span>
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
