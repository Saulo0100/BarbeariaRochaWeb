/*
 * Design: Vintage Barbershop — Agendamentos (Barbeiro/Admin)
 * Lista de agendamentos com filtros por data e barbeiro
 */
import { useEffect, useState, useCallback } from "react";
import { agendamentoApi, usuarioApi } from "@/lib/api";
import type { AgendamentoDetalheResponse, BarbeirosDetalhesResponse } from "@/lib/types";
import { statusLabels, statusColors } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck,
  User,
  Calendar,
  Scissors,
  Loader2,
  Phone,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Agendamentos() {
  const { isPerfil } = useAuth();
  const isAdmin = isPerfil("administrador") || isPerfil("barbeiroadministrador");

  const [agendamentos, setAgendamentos] = useState<AgendamentoDetalheResponse[]>([]);
  const [barbeiros, setBarbeiros] = useState<BarbeirosDetalhesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filtroBarbeiro, setFiltroBarbeiro] = useState<string>("all");
  const [filtroData, setFiltroData] = useState<string>("");

  const itensPorPagina = 10;

  const fetchAgendamentos = useCallback(() => {
    setLoading(true);
    const filtro: any = {};
    if (filtroBarbeiro && filtroBarbeiro !== "all") filtro.barbeiroId = parseInt(filtroBarbeiro);
    if (filtroData) filtro.dtAgendamento = filtroData;

    agendamentoApi
      .listar(pagina, itensPorPagina, filtro)
      .then((r) => {
        setAgendamentos(r.data.items || []);
        setTotalRegistros(r.data.totalRegistros || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pagina, filtroBarbeiro, filtroData]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  useEffect(() => {
    if (isAdmin) {
      usuarioApi.listarBarbeiros().then((r) => {
        const data = r.data;
        setBarbeiros(Array.isArray(data) ? data : []);
      }).catch(() => {});
    }
  }, [isAdmin]);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-primary" />
          Agendamentos
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-lg p-4 mb-4 space-y-3"
        >
          <div>
            <p className="text-xs text-muted-foreground mb-1">Data</p>
            <Input
              type="date"
              value={filtroData}
              onChange={(e) => {
                setFiltroData(e.target.value);
                setPagina(1);
              }}
              className="h-10 bg-input border-border text-sm"
            />
          </div>
          {isAdmin && barbeiros.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Barbeiro</p>
              <Select
                value={filtroBarbeiro}
                onValueChange={(v) => {
                  setFiltroBarbeiro(v);
                  setPagina(1);
                }}
              >
                <SelectTrigger className="h-10 bg-input border-border text-sm">
                  <SelectValue placeholder="Todos os barbeiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {barbeiros.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltroData("");
              setFiltroBarbeiro("all");
              setPagina(1);
            }}
            className="text-xs border-border"
          >
            Limpar Filtros
          </Button>
        </motion.div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        {totalRegistros} agendamento{totalRegistros !== 1 ? "s" : ""} encontrado{totalRegistros !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : agendamentos.length > 0 ? (
        <div className="space-y-3">
          {agendamentos.map((ag, i) => (
            <motion.div
              key={ag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-medium ${statusColors[ag.status] || "text-muted-foreground"}`}>
                  {statusLabels[ag.status] || ag.status}
                </span>
                <span className="text-xs text-muted-foreground">#{ag.id}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3 h-3 text-primary" />
                  <span className="font-medium text-foreground">{ag.nomeCliente}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3 text-primary" />
                  {ag.numeroCliente}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Scissors className="w-3 h-3 text-primary" />
                  {ag.servico}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3 h-3 text-primary" />
                  {formatDate(ag.data)}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-3 h-3 text-primary" />
                    Barbeiro: {ag.nomeBarbeiro}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="p-2 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground">
                {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="p-2 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado</p>
        </div>
      )}
    </div>
  );
}
