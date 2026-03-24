/*
 * Design: Vintage Barbershop
 * Layout mobile-first com bottom navigation
 * Cores: fundo escuro #1A1714, dourado âmbar, creme
 * Font: Playfair Display (títulos), Source Sans 3 (corpo)
 */
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";
import { appConfig } from "@/config";
import {
  Home,
  Calendar,
  Scissors,
  User,
  Users,
  LogOut,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  Menu,
  X as XIcon,
  UserPlus,
  Ban,
  Search,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, isPerfil } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  // Navigation items based on profile
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { path: "/", icon: Home, label: "Início" },
        { path: "/agendar", icon: Calendar, label: "Agendar" },
        { path: "/proximo-agendamento", icon: Search, label: "Meus agendamentos" },
        { path: "/login", icon: User, label: "Entrar" },
      ];
    }

    if (isPerfil("administrador")) {
      return [
        { path: "/dashboard", icon: Home, label: "Painel" },
        { path: "/agendamentos", icon: CalendarCheck, label: "Agenda" },
        { path: "/agendar-cliente", icon: UserPlus, label: "Agendar" },
        { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
        { path: "/perfil", icon: User, label: "Perfil" },
      ];
    }

    if (isPerfil("barbeiroadministrador")) {
      return [
        { path: "/corte-atual", icon: Scissors, label: "Atual" },
        { path: "/agendamentos", icon: CalendarCheck, label: "Agenda" },
        { path: "/agendar-cliente", icon: UserPlus, label: "Agendar" },
        { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
        { path: "/perfil", icon: User, label: "Perfil" },
      ];
    }

    if (isPerfil("barbeiro")) {
      return [
        { path: "/corte-atual", icon: Scissors, label: "Atual" },
        { path: "/agendamentos", icon: CalendarCheck, label: "Agenda" },
        { path: "/agendar-cliente", icon: UserPlus, label: "Agendar" },
        { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
        { path: "/perfil", icon: User, label: "Perfil" },
      ];
    }

    // Cliente
    return [
      { path: "/", icon: Home, label: "Início" },
      { path: "/agendar", icon: Calendar, label: "Agendar" },
      { path: "/meus-cortes", icon: Scissors, label: "Cortes" },
      { path: "/perfil", icon: User, label: "Perfil" },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <img src={appConfig.logo} alt={appConfig.nome} className="w-8 h-8 rounded-full object-contain" />
            <span className="font-display text-lg font-bold gold-text">
              {appConfig.nome}
            </span>
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              {menuOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="container py-3 space-y-1">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{user?.nome}</p>
                  <p className="text-xs">{user?.perfil}</p>
                </div>
                <div className="h-px bg-border my-2" />

                {(isPerfil("administrador") || isPerfil("barbeiroadministrador")) && (
                  <>
                    <Link
                      href="/agendar-cliente"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agendar para Cliente
                    </Link>
                    <Link
                      href="/servicos-admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Gerenciar Serviços
                    </Link>
                    <Link
                      href="/excecoes"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Exceções
                    </Link>
                    <Link
                      href="/mensalistas"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Mensalistas
                    </Link>
                    <Link
                      href="/usuarios"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Usuários
                    </Link>
                  </>
                )}

                {isPerfil("barbeiro") && (
                  <>
                    <Link
                      href="/agendar-cliente"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Agendar para Cliente
                    </Link>
                    <Link
                      href="/excecoes"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Minhas Exceções
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive w-full text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
        {!isAuthenticated && location === "/" && <Footer />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="container flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-px left-0 right-0 h-0.5 gold-gradient mx-auto"
                    style={{ width: "60%" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
