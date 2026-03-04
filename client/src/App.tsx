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
import Perfil from "./pages/Perfil";
import MeusCortes from "./pages/MeusCortes";
import CorteAtual from "./pages/CorteAtual";
import Agendamentos from "./pages/Agendamentos";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import ServicosAdmin from "./pages/ServicosAdmin";
import Excecoes from "./pages/Excecoes";
import Mensalistas from "./pages/Mensalistas";
import Relatorios from "./pages/Relatorios";
import ConfirmarEmail from "./pages/ConfirmarEmail";
import AgendarParaCliente from "./pages/AgendarParaCliente";
import CancelarAgendamento from "./pages/CancelarAgendamento";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/cadastro" component={Cadastro} />
        <Route path="/confirmar-email" component={ConfirmarEmail} />
        <Route path="/agendar" component={Agendar} />
        <Route path="/cancelar-agendamento" component={CancelarAgendamento} />
        <Route path="/servicos" component={Servicos} />
        {/* Cliente */}
        <Route path="/meus-cortes" component={MeusCortes} />
        <Route path="/perfil" component={Perfil} />

        {/* Barbeiro */}
        <Route path="/corte-atual" component={CorteAtual} />

        {/* Barbeiro + Admin */}
        <Route path="/agendamentos" component={Agendamentos} />
        <Route path="/agendar-cliente" component={AgendarParaCliente} />
        <Route path="/excecoes" component={Excecoes} />

        {/* Barbeiro + Admin */}
        <Route path="/relatorios" component={Relatorios} />

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
                  background: "oklch(0.13 0.01 60)",
                  border: "1px solid oklch(0.24 0.02 65)",
                  color: "oklch(0.92 0.02 75)",
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
