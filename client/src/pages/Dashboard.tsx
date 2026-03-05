/*
 * Design: Vintage Barbershop — Dashboard Admin
 * Visão geral com estatísticas e atalhos rápidos
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { agendamentoApi, usuarioApi, servicoApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarCheck,
  Users,
  Scissors,
  Clock,
  TrendingUp,
  Calendar,
  ClipboardList,
  AlertTriangle,
  Loader2,
  PackagePlus,
} from "lucide-react";
import { motion } from "framer-motion";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663043062505/CjBWWVpcRtjqZnbfjVbFp8/hero-barber-jFG7MXqmkn5oqxDjr2BCDy.webp";

export default function Dashboard() {
  const { user, isPerfil } = useAuth();
  const [stats, setStats] = useState({
    agendamentosHoje: 0,
    totalUsuarios: 0,
    totalServicos: 0,
    loading: true,
  });
  const [agendamentosRecentes, setAgendamentosRecentes] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.allSettled([
      agendamentoApi.listar(1, 5, { dtAgendamento: today }),
      usuarioApi.listar(1, 1),
      servicoApi.listar(1, 1),
    ]).then(([agRes, usRes, svRes]) => {
      const agData = agRes.status === "fulfilled" ? agRes.value.data : null;
      const usData = usRes.status === "fulfilled" ? usRes.value.data : null;
      const svData = svRes.status === "fulfilled" ? svRes.value.data : null;

      setStats({
        agendamentosHoje: agData?.totalRegistros || 0,
        totalUsuarios: usData?.totalRegistros || 0,
        totalServicos: svData?.totalRegistros || 0,
        loading: false,
      });

      if (agData?.items) {
        setAgendamentosRecentes(agData.items);
      }
    });
  }, []);

  const isBarbeiroAdmin = isPerfil("barbeiroadministrador");

  const quickLinks = [
    ...(isBarbeiroAdmin ? [{ href: "/corte-atual", icon: Scissors, label: "Corte Atual", color: "text-yellow-400" }] : []),
    { href: "/agendamentos", icon: CalendarCheck, label: "Agendamentos", color: "text-emerald-400" },
    { href: "/relatorios", icon: TrendingUp, label: "Relatórios", color: "text-amber-400" },
    { href: "/usuarios", icon: Users, label: "Usuários", color: "text-blue-400" },
    { href: "/servicos-admin", icon: ClipboardList, label: "Serviços", color: "text-orange-400" },
    { href: "/excecoes", icon: AlertTriangle, label: "Exceções", color: "text-red-400" },
    { href: "/mensalistas", icon: Calendar, label: "Mensalistas", color: "text-purple-400" },
    { href: "/adicionais-admin", icon: PackagePlus, label: "Adicionais", color: "text-teal-400" },
  ];

  return (
    <div>
      {/* Welcome header */}
      <div className="relative h-36 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        <div className="relative container h-full flex items-end pb-4">
          <div>
            <p className="text-xs text-primary font-medium">Painel Administrativo</p>
            <h1 className="font-display text-xl font-bold">
              Olá, {user?.nome?.split(" ")[0]}
            </h1>
          </div>
        </div>
      </div>

      <div className="container max-w-sm mx-auto py-4">
        {/* Stats Cards */}
        {stats.loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Hoje", value: stats.agendamentosHoje, icon: Calendar },
              { label: "Usuários", value: stats.totalUsuarios, icon: Users },
              { label: "Serviços", value: stats.totalServicos, icon: Scissors },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-lg p-3 text-center"
              >
                <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="font-display text-xl font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <h2 className="font-semibold text-sm mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={link.href}
                className="bg-card border border-border rounded-lg p-3 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors"
              >
                <link.icon className={`w-5 h-5 ${link.color}`} />
                <span className="text-[10px] text-muted-foreground font-medium">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent appointments */}
        <h2 className="font-semibold text-sm mb-3">Agendamentos de Hoje</h2>
        {agendamentosRecentes.length > 0 ? (
          <div className="space-y-2">
            {agendamentosRecentes.map((ag: any) => (
              <div key={ag.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ag.nomeCliente}</p>
                  <p className="text-xs text-muted-foreground">
                    {ag.servico}{ag.descricaoEtapa ? ` (${ag.descricaoEtapa})` : ""} • {ag.nomeBarbeiro}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(ag.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Nenhum agendamento para hoje
          </div>
        )}
      </div>
    </div>
  );
}
