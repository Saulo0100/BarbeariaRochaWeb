/*
 * Design: Vintage Barbershop — Corte Atual (Barbeiro)
 * Tela que o barbeiro deixa aberta para ver o corte em andamento
 * Pode completar informando método de pagamento ou editar e completar
 */
import { useEffect, useState, useCallback } from "react";
import { agendamentoApi } from "@/lib/api";
import type { AgendamentoDetalheResponse } from "@/lib/types";
import { MetodoPagamento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Scissors,
  User,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
  RefreshCw,
  CreditCard,
  Edit3,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STRIPE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663043062505/CjBWWVpcRtjqZnbfjVbFp8/barbershop-stripe-TyfXqQsEdrfT38oC2k9bNd.webp";

const metodoPagamentoOptions = [
  { value: "1", label: "Dinheiro" },
  { value: "2", label: "Crédito" },
  { value: "3", label: "Débito" },
  { value: "4", label: "Pix" },
];

export default function CorteAtual() {
  const [corte, setCorte] = useState<AgendamentoDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<string>("");
  const [mode, setMode] = useState<"view" | "complete" | "edit">("view");
  const [markingNoShow, setMarkingNoShow] = useState(false);

  const fetchCorteAtual = useCallback(() => {
    setLoading(true);
    agendamentoApi
      .obterAtual()
      .then((r) => setCorte(r.data))
      .catch(() => setCorte(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCorteAtual();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCorteAtual, 30000);
    return () => clearInterval(interval);
  }, [fetchCorteAtual]);

  const handleClienteFaltou = async () => {
    if (!corte) return;
    setMarkingNoShow(true);
    try {
      await agendamentoApi.marcarClienteFaltou(corte.id);
      toast.success("Marcado como cliente faltou");
      fetchCorteAtual();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao marcar falta");
    } finally {
      setMarkingNoShow(false);
    }
  };

  const handleCompletar = async () => {
    if (!corte || !metodoPagamento) {
      toast.error("Selecione o método de pagamento");
      return;
    }
    setCompleting(true);
    try {
      await agendamentoApi.completar(corte.id, {
        metodoPagamento: parseInt(metodoPagamento) as MetodoPagamento,
      });
      toast.success("Corte finalizado com sucesso!");
      setMode("view");
      setMetodoPagamento("");
      fetchCorteAtual();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao finalizar corte");
    } finally {
      setCompleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Corte Atual
        </h1>
        <button
          onClick={fetchCorteAtual}
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !corte ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : corte ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Corte Card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header with stripe pattern */}
            <div className="relative h-20 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${STRIPE_IMG})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card" />
              <div className="absolute bottom-3 left-4">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                  Em Andamento
                </span>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Cliente */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-sm">{corte.nomeCliente}</p>
                  <p className="text-xs text-muted-foreground">{corte.numeroCliente}</p>
                </div>
              </div>

              {/* Serviço */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Serviço</p>
                  <p className="font-semibold text-sm">{corte.servico}</p>
                </div>
              </div>

              {/* Data */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agendado para</p>
                  <p className="font-semibold text-sm">{formatDate(corte.data)}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm">{corte.status}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border">
              {mode === "view" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setMode("complete")}
                      className="flex-1 h-11 gold-gradient text-background font-semibold text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finalizar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setMode("edit")}
                      className="h-11 border-primary/30 text-primary hover:bg-primary/10 text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleClienteFaltou}
                    disabled={markingNoShow}
                    className="w-full h-10 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-sm font-medium"
                  >
                    {markingNoShow ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserX className="w-4 h-4 mr-2" />
                        Cliente Faltou
                      </>
                    )}
                  </Button>
                </div>
              )}

              {mode === "complete" && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Método de Pagamento</p>
                    <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                      <SelectTrigger className="h-11 bg-input border-border">
                        <SelectValue placeholder="Selecione o pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodoPagamentoOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCompletar}
                      disabled={completing || !metodoPagamento}
                      className="flex-1 h-11 gold-gradient text-background font-semibold text-sm"
                    >
                      {completing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Confirmar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMode("view");
                        setMetodoPagamento("");
                      }}
                      className="h-11 text-sm border-border"
                    >
                      Voltar
                    </Button>
                  </div>
                </div>
              )}

              {mode === "edit" && (
                <EditarECompletar
                  corteId={corte.id}
                  onDone={() => {
                    setMode("view");
                    fetchCorteAtual();
                  }}
                  onCancel={() => setMode("view")}
                />
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h2 className="font-display text-lg font-bold text-muted-foreground mb-1">
            Nenhum Corte em Andamento
          </h2>
          <p className="text-sm text-muted-foreground/70">
            Quando houver um corte agendado, ele aparecerá aqui automaticamente.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-2">
            Atualiza automaticamente a cada 30 segundos
          </p>
        </div>
      )}
    </div>
  );
}

// Sub-component: Editar e Completar
function EditarECompletar({
  corteId,
  onDone,
  onCancel,
}: {
  corteId: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [servicos, setServicos] = useState<{ id: number; nome: string }[]>([]);
  const [servicoId, setServicoId] = useState<string>("");
  const [metodoPagamento, setMetodoPagamento] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import("@/lib/api").then(({ servicoApi }) => {
      servicoApi.listar(1, 50).then((r) => {
        const items = r.data.items || [];
        setServicos(items.map((s: any) => ({ id: s.id, nome: s.nome })));
      });
    });
  }, []);

  const handleSubmit = async () => {
    if (!servicoId || !metodoPagamento) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      await agendamentoApi.editarECompletar(corteId, {
        servicoId: parseInt(servicoId),
        metodoPagamento: parseInt(metodoPagamento) as MetodoPagamento,
      });
      toast.success("Corte editado e finalizado!");
      onDone();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao editar e completar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-primary">Editar e Finalizar</p>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Serviço</p>
        <Select value={servicoId} onValueChange={setServicoId}>
          <SelectTrigger className="h-11 bg-input border-border">
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent>
            {servicos.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Método de Pagamento</p>
        <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
          <SelectTrigger className="h-11 bg-input border-border">
            <SelectValue placeholder="Selecione o pagamento" />
          </SelectTrigger>
          <SelectContent>
            {metodoPagamentoOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 h-11 gold-gradient text-background font-semibold text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Editar e Finalizar"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="h-11 text-sm border-border"
        >
          Voltar
        </Button>
      </div>
    </div>
  );
}
