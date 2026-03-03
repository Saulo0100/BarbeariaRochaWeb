/*
 * Design: Vintage Barbershop — Meus Cortes (Cliente)
 * Lista de agendamentos do cliente logado
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { agendamentoApi } from "@/lib/api";
import type { AgendamentoDetalheResponse } from "@/lib/types";
import { statusLabels, statusColors } from "@/lib/types";
import { Calendar, Scissors, User, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MeusCortes() {
  const [, setLocation] = useLocation();
  const [agendamentos, setAgendamentos] = useState<AgendamentoDetalheResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<number | null>(null);

  const fetchAgendamentos = () => {
    setLoading(true);
    agendamentoApi
      .listar(1, 50)
      .then((r) => setAgendamentos(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const handleCancelar = async (id: number) => {
    setCancelando(id);
    try {
      await agendamentoApi.cancelar(id);
      toast.success("Agendamento cancelado");
      fetchAgendamentos();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao cancelar");
    } finally {
      setCancelando(null);
    }
  };

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

  const canCancel = (status: string) => {
    return ["Pendente", "Confirmado", "LembreteEnviado", "SlotReservado"].includes(status);
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <h1 className="font-display text-2xl font-bold flex items-center gap-2 mb-6">
        <Scissors className="w-5 h-5 text-primary" />
        Meus Cortes
      </h1>

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
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className={`text-xs font-medium ${statusColors[ag.status] || "text-muted-foreground"}`}>
                    {statusLabels[ag.status] || ag.status}
                  </span>
                  <h3 className="font-semibold text-sm mt-0.5">
                    {ag.servico}
                    {ag.descricaoEtapa && (
                      <span className="text-xs text-primary ml-1">({ag.descricaoEtapa})</span>
                    )}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">#{ag.id}</span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-primary" />
                  {formatDate(ag.data)}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-primary" />
                  Barbeiro: {ag.nomeBarbeiro}
                </div>
              </div>

              {canCancel(ag.status) && !ag.agendamentoPrincipalId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelar(ag.id)}
                  disabled={cancelando === ag.id}
                  className="mt-3 h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  {cancelando === ag.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" /> Cancelar
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Scissors className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum agendamento encontrado</p>
          <Button
            onClick={() => setLocation("/agendar")}
            className="mt-4 gold-gradient text-background text-sm"
          >
            Agendar um Corte
          </Button>
        </div>
      )}
    </div>
  );
}
