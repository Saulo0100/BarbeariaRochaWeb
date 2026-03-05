/*
 * Design: Vintage Barbershop — Relatórios / BI do Barbeiro
 * Dashboard com métricas detalhadas: atendimentos, faturamento, serviços mais pedidos, clientes frequentes
 */
import { useEffect, useState } from "react";
import { relatorioApi, usuarioApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type {
  RelatorioGeralResponse,
  ServicoMaisPedidoResponse,
  ClienteFrequenteResponse,
  FaturamentoPorPeriodoResponse,
  FaturamentoPorMetodoResponse,
  RelatorioBarbeiroResponse,
  RelatorioFiltroRequest,
  BarbeirosDetalhesResponse,
} from "@/lib/types";
import {
  Scissors,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Crown,
  XCircle,
  UserX,
  CheckCircle,
  Percent,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#D4A855", "#C49B47", "#B48E39", "#A4812B", "#94741D", "#847710", "#746A02"];
const PERIODO_OPTIONS = [
  { label: "Hoje", value: "hoje" },
  { label: "7 dias", value: "semana" },
  { label: "30 dias", value: "mes" },
  { label: "Mês", value: "mes-especifico" },
  { label: "Todos", value: "todos" },
];

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function Relatorios() {
  const { user, isPerfil } = useAuth();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("mes");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedBarbeiroId, setSelectedBarbeiroId] = useState<number | undefined>(undefined);
  const [barbeiros, setBarbeiros] = useState<BarbeirosDetalhesResponse[]>([]);

  const [geral, setGeral] = useState<RelatorioGeralResponse | null>(null);
  const [topServicos, setTopServicos] = useState<ServicoMaisPedidoResponse[]>([]);
  const [topClientes, setTopClientes] = useState<ClienteFrequenteResponse[]>([]);
  const [faturamentoDiario, setFaturamentoDiario] = useState<FaturamentoPorPeriodoResponse[]>([]);
  const [faturamentoMetodo, setFaturamentoMetodo] = useState<FaturamentoPorMetodoResponse[]>([]);
  const [relatorioBarbeiros, setRelatorioBarbeiros] = useState<RelatorioBarbeiroResponse[]>([]);

  const isAdmin = isPerfil("administrador") || isPerfil("barbeiroadministrador");
  const isBarbeiroAdmin = isPerfil("barbeiroadministrador");
  const isBarbeiro = isPerfil("barbeiro") || isPerfil("barbeiroadministrador");

  useEffect(() => {
    if (isAdmin) {
      usuarioApi.listarBarbeiros().then((r) => {
        setBarbeiros(Array.isArray(r.data) ? r.data : []);
      }).catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchData();
  }, [periodo, selectedBarbeiroId, selectedMonth, selectedYear]);

  const buildFiltro = (): RelatorioFiltroRequest => {
    const filtro: RelatorioFiltroRequest = {};
    const now = new Date();

    if (periodo === "hoje") {
      filtro.dataInicio = now.toISOString().split("T")[0];
      filtro.dataFim = now.toISOString().split("T")[0];
    } else if (periodo === "semana") {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      filtro.dataInicio = start.toISOString().split("T")[0];
      filtro.dataFim = now.toISOString().split("T")[0];
    } else if (periodo === "mes") {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      filtro.dataInicio = start.toISOString().split("T")[0];
      filtro.dataFim = now.toISOString().split("T")[0];
    } else if (periodo === "mes-especifico") {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 0); // último dia do mês
      filtro.dataInicio = start.toISOString().split("T")[0];
      filtro.dataFim = end.toISOString().split("T")[0];
    } else if (periodo === "todos") {
      // Sem filtro de data — retorna todos os registros
    }

    // If barber is selected from dropdown, use it
    if (selectedBarbeiroId) {
      filtro.barbeiroId = selectedBarbeiroId;
    } else if (isBarbeiro && !isAdmin && user?.id) {
      // Barbeiro regular vê apenas seus próprios dados
      filtro.barbeiroId = user.id;
    }

    return filtro;
  };

  const fetchData = async () => {
    setLoading(true);
    const filtro = buildFiltro();

    try {
      const [geralRes, servicosRes, clientesRes, diarioRes, metodoRes] = await Promise.allSettled([
        relatorioApi.geral(filtro),
        relatorioApi.servicosMaisPedidos(filtro, 5),
        relatorioApi.clientesFrequentes(filtro, 5),
        relatorioApi.faturamentoDiario(filtro),
        relatorioApi.faturamentoPorMetodo(filtro),
      ]);

      if (geralRes.status === "fulfilled") setGeral(geralRes.value.data);
      if (servicosRes.status === "fulfilled") setTopServicos(servicosRes.value.data);
      if (clientesRes.status === "fulfilled") setTopClientes(clientesRes.value.data);
      if (diarioRes.status === "fulfilled") setFaturamentoDiario(diarioRes.value.data);
      if (metodoRes.status === "fulfilled") setFaturamentoMetodo(metodoRes.value.data);

      // BarbeiroAdmin also fetches per-barber report with commission data
      if (isBarbeiroAdmin) {
        try {
          const barbeiroRes = await relatorioApi.porBarbeiro(filtro);
          setRelatorioBarbeiros(barbeiroRes.data);
        } catch {
          // silently handle
        }
      }
    } catch {
      // silently handle errors
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (loading && !geral) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-sm mx-auto py-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Métricas detalhadas {isBarbeiro && !isAdmin ? "do seu trabalho" : "da barbearia"}
        </p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {PERIODO_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriodo(opt.value)}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              periodo === opt.value
                ? "gold-gradient text-background font-bold"
                : "bg-card border border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Month/Year Selector */}
      {periodo === "mes-especifico" && (
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="flex-1 h-10 px-3 text-sm bg-card border border-border rounded-md text-foreground"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-24 h-10 px-3 text-sm bg-card border border-border rounded-md text-foreground"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      {/* Barber Filter (admin only) */}
      {isAdmin && barbeiros.length > 0 && (
        <select
          value={selectedBarbeiroId || ""}
          onChange={(e) => setSelectedBarbeiroId(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full h-10 px-3 text-sm bg-card border border-border rounded-md text-foreground"
        >
          <option value="">Todos os barbeiros</option>
          {barbeiros.map((b) => (
            <option key={b.id} value={b.id}>{b.nome}</option>
          ))}
        </select>
      )}

      {/* Stats Cards */}
      {geral && (
        <>
          {/* Row 1: Atendimentos e Faturamento do período */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Scissors}
              label="Atendimentos"
              value={String(geral.totalAtendimentos)}
              delay={0}
            />
            <StatCard
              icon={DollarSign}
              label="Faturamento"
              value={formatCurrency(geral.faturamentoTotal)}
              delay={0.05}
            />
          </div>

          {/* Row 2: Pendentes, Cancelamentos */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Calendar}
              label="Pendentes"
              value={String(geral.agendamentosPendentes)}
              delay={0.1}
            />
            <StatCard
              icon={XCircle}
              label="Cancelamentos"
              value={String(geral.cancelamentosTotal)}
              delay={0.15}
            />
          </div>

          {/* Row 3: Faltas e Taxas */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={UserX}
              label="Faltas"
              value={String(geral.clientesFaltaram)}
              delay={0.25}
            />
            <StatCard
              icon={CheckCircle}
              label="Taxa de Conclusão"
              value={`${geral.taxaConclusao.toFixed(1)}%`}
              delay={0.3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={UserX}
              label="Taxa de Faltas"
              value={`${geral.taxaFaltas.toFixed(1)}%`}
              delay={0.35}
            />
            <StatCard
              icon={Percent}
              label="Taxa Cancelamento"
              value={`${geral.taxaCancelamento.toFixed(1)}%`}
              delay={0.4}
            />
          </div>
        </>
      )}

      {/* Revenue Chart */}
      {faturamentoDiario.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Faturamento Diário
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={faturamentoDiario}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.02 65)" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 10, fill: "oklch(0.60 0.03 75)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.60 0.03 75)" }}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.13 0.01 60)",
                    border: "1px solid oklch(0.24 0.02 65)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.92 0.02 75)" }}
                  formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  stroke="#D4A855"
                  strokeWidth={2}
                  dot={{ fill: "#D4A855", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Top Services */}
      {topServicos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Serviços Mais Pedidos
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServicos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.24 0.02 65)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "oklch(0.60 0.03 75)" }} />
                <YAxis
                  type="category"
                  dataKey="nomeServico"
                  tick={{ fontSize: 10, fill: "oklch(0.60 0.03 75)" }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.13 0.01 60)",
                    border: "1px solid oklch(0.24 0.02 65)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, "Pedidos"]}
                />
                <Bar dataKey="quantidade" fill="#D4A855" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Payment Methods */}
      {faturamentoMetodo.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary" />
            Métodos de Pagamento
          </h3>
          <div className="h-44 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={faturamentoMetodo}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  dataKey="quantidade"
                  nameKey="metodoPagamento"
                >
                  {faturamentoMetodo.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.13 0.01 60)",
                    border: "1px solid oklch(0.24 0.02 65)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {faturamentoMetodo.map((m, idx) => (
                <div key={m.metodoPagamento} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-muted-foreground flex-1 truncate">{m.metodoPagamento}</span>
                  <span className="font-medium">{m.percentual}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Frequent Clients */}
      {topClientes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Clientes Mais Frequentes
          </h3>
          <div className="space-y-3">
            {topClientes.map((c, idx) => (
              <div key={c.numeroCliente} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{idx + 1}º</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.nomeCliente}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.totalAtendimentos} atendimentos • {formatCurrency(c.totalGasto)}
                  </p>
                </div>
                {c.ultimoAtendimento && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    Último: {new Date(c.ultimoAtendimento).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Admin Commission Total (BarbeiroAdmin only) */}
      {isBarbeiroAdmin && relatorioBarbeiros.length > 0 && (() => {
        const totalComissao = relatorioBarbeiros.reduce((sum, b) => sum + (b.valorComissaoAdmin ?? 0), 0);
        return totalComissao > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="bg-card border border-primary/30 rounded-lg p-4 text-center"
          >
            <Crown className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="font-display text-xl font-bold text-primary">{formatCurrency(totalComissao)}</p>
            <p className="text-[10px] text-muted-foreground">Total de Comissões do Admin</p>
          </motion.div>
        ) : null;
      })()}

      {/* Per-Barber Commission Report (BarbeiroAdmin only) */}
      {isBarbeiroAdmin && relatorioBarbeiros.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Relatório por Barbeiro
          </h3>
          <div className="space-y-4">
            {relatorioBarbeiros.map((b) => (
              <div key={b.barbeiroId} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-semibold">{b.nomeBarbeiro}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div className="text-xs text-muted-foreground">Atendimentos:</div>
                  <div className="text-xs font-medium text-right">{b.totalAtendimentos}</div>
                  <div className="text-xs text-muted-foreground">Faturamento Bruto:</div>
                  <div className="text-xs font-medium text-right">
                    {formatCurrency(b.faturamentoBruto ?? b.faturamento)}
                  </div>
                  {b.porcentagemAdmin != null && (
                    <>
                      <div className="text-xs text-muted-foreground">Comissão Admin:</div>
                      <div className="text-xs font-medium text-primary text-right">
                        {formatCurrency(b.valorComissaoAdmin ?? 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Faturamento Líquido:</div>
                      <div className="text-xs font-bold text-right">
                        {formatCurrency(b.faturamentoLiquido ?? b.faturamento)}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-muted-foreground">Cancelamentos:</div>
                  <div className="text-xs font-medium text-right">{b.cancelamentosTotal}</div>
                  <div className="text-xs text-muted-foreground">Taxa Conclusão:</div>
                  <div className="text-xs font-medium text-right">{b.taxaConclusao}%</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && geral && geral.totalAtendimentos === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum dado encontrado para o período selecionado
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: number;
  small?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-lg p-3 text-center"
    >
      <Icon className={`${small ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary mx-auto mb-1`} />
      <p className={`font-display ${small ? "text-sm" : "text-lg"} font-bold truncate`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  );
}
