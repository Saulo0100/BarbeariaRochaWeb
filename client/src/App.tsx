import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Agendar from "./pages/Agendar";
import Servicos from "./pages/Servicos";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import MeusCortes from "./pages/MeusCortes";
import CorteAtual from "./pages/CorteAtual";
import Agendamentos from "./pages/Agendamentos";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import ServicosAdmin from "./pages/ServicosAdmin";
import Excecoes from "./pages/Excecoes";
import Mensalistas from "./pages/Mensalistas";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/cadastro" component={Cadastro} />
        <Route path="/agendar" component={Agendar} />
        <Route path="/servicos" component={Servicos} />
        <Route path="/configuracoes" component={Configuracoes} />

        {/* Cliente */}
        <Route path="/meus-cortes" component={MeusCortes} />
        <Route path="/perfil" component={Perfil} />

        {/* Barbeiro */}
        <Route path="/corte-atual" component={CorteAtual} />

        {/* Barbeiro + Admin */}
        <Route path="/agendamentos" component={Agendamentos} />
        <Route path="/excecoes" component={Excecoes} />

        {/* Admin */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/usuarios" component={Usuarios} />
        <Route path="/servicos-admin" component={ServicosAdmin} />
        <Route path="/mensalistas" component={Mensalistas} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "oklch(0.19 0.015 55)",
                  border: "1px solid oklch(0.30 0.02 60)",
                  color: "oklch(0.93 0.01 80)",
                },
              }}
            />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
