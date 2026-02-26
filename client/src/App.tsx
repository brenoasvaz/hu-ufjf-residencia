import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CalendarioMensal from "./pages/CalendarioMensal";
import CalendarioSemanal from "./pages/CalendarioSemanal";
import Residentes from "./pages/Residentes";
import Admin from "./pages/Admin";
import AdminImports from "./pages/AdminImports";
import ClinicalMeetings from "./pages/ClinicalMeetings";
import Login from "./pages/Login";
import UserManagement from "./pages/UserManagement";
import Avaliacoes from "./pages/Avaliacoes";
import ExecucaoSimulado from "./pages/ExecucaoSimulado";
import ResultadoSimulado from "./pages/ResultadoSimulado";
import DashboardAvaliacoes from "./pages/DashboardAvaliacoes";
import AdminAvaliacoes from "./pages/admin/AdminAvaliacoes";
import ModelosProva from "./pages/ModelosProva";
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import LinksUteis from "./pages/LinksUteis";
import GerenciarLinks from "./pages/admin/GerenciarLinks";
import MainLayout from "./components/MainLayout";

function Router() {
  return (
    <Switch>
      {/* Login page without MainLayout */}
      <Route path="/login" component={Login} />
      
      {/* All other routes with MainLayout */}
      <Route>
        <MainLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/calendario-mensal" component={CalendarioMensal} />
            <Route path="/calendario-semanal" component={CalendarioSemanal} />
            <Route path="/residentes" component={Residentes} />
            <Route path="/admin" component={Admin} />
            <Route path="/admin/imports" component={AdminImports} />
            <Route path="/reunioes-clinicas" component={ClinicalMeetings} />
            <Route path="/avaliacoes" component={Avaliacoes} />
            <Route path="/avaliacoes/:id" component={ExecucaoSimulado} />
            <Route path="/avaliacoes/:id/resultado" component={ResultadoSimulado} />
            <Route path="/avaliacoes/dashboard" component={DashboardAvaliacoes} />
            <Route path="/admin/avaliacoes" component={AdminAvaliacoes} />
            <Route path="/admin/avaliacoes/modelos" component={ModelosProva} />
            <Route path="/admin/usuarios-legado" component={UserManagement} />
            <Route path="/admin/usuarios" component={GerenciarUsuarios} />
            <Route path="/links-uteis" component={LinksUteis} />
            <Route path="/admin/links" component={GerenciarLinks} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
