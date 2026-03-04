/*
 * Design: Vintage Barbershop — Mensalistas (Admin)
 * Gerenciar clientes mensalistas + controle de cortes
 */
import { useEffect, useState, useCallback } from "react";
import { mensalistaApi } from "@/lib/api";
import type { MensalistaResponse, MensalistaCorteResponse } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TrendingUp, Plus, Loader2, Trash2, DollarSign, Calendar, Scissors, ChevronDown, ChevronUp, Phone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Mensalistas() {
  const [mensalistas, setMensalistas] = useState<MensalistaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [canceling, setCanceling] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [corteDialogOpen, setCorteDialogOpen] = useState(false);
  const [corteTarget, setCorteTarget] = useState<MensalistaResponse | null>(null);
  const [corteDate, setCorteDate] = useState(new Date().toISOString().split("T")[0]);
  const [corteObs, setCorteObs] = useState("");
  const [registrandoCorte, setRegistrandoCorte] = useState(false);
  const [deletandoCorte, setDeletandoCorte] = useState<number | null>(null);

  const [form, setForm] = useState({
    nome: "",
    numero: "",
    valor: "",
    dia: "",
    tipo: "1",
  });

  const fetchMensalistas = useCallback(() => {
    setLoading(true);
    mensalistaApi
      .listar()
      .then((r) => {
        const data = r.data;
        setMensalistas(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMensalistas();
  }, [fetchMensalistas]);

  const handleCriar = async () => {
    if (!form.nome || !form.numero || !form.valor || !form.dia) {
      toast.error("Preencha todos os campos");
      return;
    }
    setCreating(true);
    try {
      await mensalistaApi.cadastrar({
        nome: form.nome,
        numero: form.numero.replace(/\D/g, ""),
        valor: parseFloat(form.valor),
        dia: parseInt(form.dia),
        tipo: parseInt(form.tipo) as 1 | 2,
      });
      toast.success("Mensalista cadastrado!");
      setDialogOpen(false);
      setForm({ nome: "", numero: "", valor: "", dia: "", tipo: "1" });
      fetchMensalistas();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao cadastrar mensalista");
    } finally {
      setCreating(false);
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm("Deseja cancelar este mensalista?")) return;
    setCanceling(id);
    try {
      await mensalistaApi.cancelar(id);
      toast.success("Mensalista cancelado");
      fetchMensalistas();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao cancelar");
    } finally {
      setCanceling(null);
    }
  };

  const handleRegistrarCorte = async () => {
    if (!corteTarget || !corteDate) return;
    setRegistrandoCorte(true);
    try {
      await mensalistaApi.registrarCorte({
        mensalistaId: corteTarget.id,
        dataCorte: `${corteDate}T00:00:00`,
        observacao: corteObs || undefined,
      });
      toast.success("Corte registrado!");
      setCorteDialogOpen(false);
      setCorteObs("");
      setCorteDate(new Date().toISOString().split("T")[0]);
      fetchMensalistas();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao registrar corte");
    } finally {
      setRegistrandoCorte(false);
    }
  };

  const handleDeletarCorte = async (corteId: number) => {
    if (!confirm("Deseja remover este registro de corte?")) return;
    setDeletandoCorte(corteId);
    try {
      await mensalistaApi.deletarCorte(corteId);
      toast.success("Corte removido");
      fetchMensalistas();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao remover corte");
    } finally {
      setDeletandoCorte(null);
    }
  };

  const statusColor = (status: string) => {
    if (status === "Ativo") return "bg-emerald-500/10 text-emerald-400";
    return "bg-red-500/10 text-red-400";
  };

  const formatCorteDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long" });

  const formatNumero = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Filter cortes for current month
  const cortesDoMes = (cortes: MensalistaCorteResponse[]) => {
    const now = new Date();
    const inicio = new Date(now.getFullYear(), now.getMonth(), 1);
    const fim = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return cortes.filter((c) => {
      const d = new Date(c.dataCorte);
      return d >= inicio && d < fim;
    });
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Mensalistas
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-background text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Mensalista</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Telefone</Label>
                <Input
                  value={formatNumero(form.numero)}
                  onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, "") })}
                  placeholder="(41) 99999-9999"
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    className="h-10 bg-input border-border text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dia da semana</Label>
                  <Select value={form.dia} onValueChange={(v) => setForm({ ...form, dia: v })}>
                    <SelectTrigger className="h-10 bg-input border-border text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Segunda-feira</SelectItem>
                      <SelectItem value="2">Terça-feira</SelectItem>
                      <SelectItem value="3">Quarta-feira</SelectItem>
                      <SelectItem value="4">Quinta-feira</SelectItem>
                      <SelectItem value="5">Sexta-feira</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                      <SelectItem value="0">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger className="h-10 bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mensal</SelectItem>
                    <SelectItem value="2">Quinzenal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCriar} disabled={creating} className="w-full h-10 gold-gradient text-background text-sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar Mensalista"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Registrar Corte Dialog */}
      <Dialog open={corteDialogOpen} onOpenChange={setCorteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Registrar Corte</DialogTitle>
          </DialogHeader>
          {corteTarget && (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">
                Registrar corte para <span className="text-foreground font-medium">{corteTarget.nome}</span>
              </p>
              <div className="space-y-1">
                <Label className="text-xs">Data do corte</Label>
                <Input
                  type="date"
                  value={corteDate}
                  onChange={(e) => setCorteDate(e.target.value)}
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Observação (opcional)</Label>
                <Input
                  value={corteObs}
                  onChange={(e) => setCorteObs(e.target.value)}
                  placeholder="Ex: corte + barba"
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <Button
                onClick={handleRegistrarCorte}
                disabled={registrandoCorte}
                className="w-full h-10 gold-gradient text-background text-sm"
              >
                {registrandoCorte ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Corte"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : mensalistas.length > 0 ? (
        <div className="space-y-3">
          {mensalistas.map((m, i) => {
            const isExpanded = expandedId === m.id;
            const cortesNoMesAtual = cortesDoMes(m.cortes);

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{m.nome}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(m.status)}`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-primary" />
                          R$ {m.valor.toFixed(2)} • {m.tipo}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-primary" />
                          {m.dia.charAt(0).toUpperCase() + m.dia.slice(1)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-primary" />
                          {formatNumero(m.numero)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Scissors className="w-3 h-3 text-primary" />
                          <span className="font-medium text-foreground">
                            {m.atendimentosNoMes} atendimento{m.atendimentosNoMes !== 1 ? "s" : ""} em {mesAtual}
                          </span>
                          {m.cortesNoMes > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              +{m.cortesNoMes} manual{m.cortesNoMes !== 1 ? "is" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {m.status === "Ativo" && (
                        <button
                          onClick={() => {
                            setCorteTarget(m);
                            setCorteDialogOpen(true);
                          }}
                          className="p-1.5 text-primary hover:text-primary/80 transition-colors shrink-0"
                          title="Registrar corte"
                        >
                          <Scissors className="w-4 h-4" />
                        </button>
                      )}
                      {m.status === "Ativo" && (
                        <button
                          onClick={() => handleCancelar(m.id)}
                          disabled={canceling === m.id}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                        >
                          {canceling === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Toggle history */}
                  {m.cortes.length > 0 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : m.id)}
                      className="flex items-center gap-1 mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Ocultar histórico" : `Ver histórico (${m.cortes.length})`}
                    </button>
                  )}
                </div>

                {/* Cortes History */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 py-3 space-y-2">
                        <p className="text-xs text-muted-foreground font-medium mb-2">Histórico de cortes</p>
                        {m.cortes.map((corte) => {
                          const isCurrentMonth = cortesNoMesAtual.some((c) => c.id === corte.id);
                          return (
                            <div
                              key={corte.id}
                              className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${
                                isCurrentMonth ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Scissors className="w-3 h-3 text-primary" />
                                <span>{formatCorteDate(corte.dataCorte)}</span>
                                {corte.observacao && (
                                  <span className="text-muted-foreground">— {corte.observacao}</span>
                                )}
                                {isCurrentMonth && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                    mês atual
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeletarCorte(corte.id)}
                                disabled={deletandoCorte === corte.id}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                {deletandoCorte === corte.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum mensalista cadastrado
        </div>
      )}
    </div>
  );
}
