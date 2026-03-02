/*
 * Design: Vintage Barbershop — Mensalistas (Admin)
 * Gerenciar clientes mensalistas
 */
import { useEffect, useState, useCallback } from "react";
import { mensalistaApi } from "@/lib/api";
import type { MensalistaResponse } from "@/lib/types";
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
import { TrendingUp, Plus, Loader2, Trash2, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Mensalistas() {
  const [mensalistas, setMensalistas] = useState<MensalistaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [canceling, setCanceling] = useState<number | null>(null);

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

  const statusColor = (status: string) => {
    if (status === "Ativo") return "bg-emerald-500/10 text-emerald-400";
    return "bg-red-500/10 text-red-400";
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
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, "") })}
                  placeholder="11999999999"
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
                  <Label className="text-xs">Dia do mês</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dia}
                    onChange={(e) => setForm({ ...form, dia: e.target.value })}
                    className="h-10 bg-input border-border text-sm"
                  />
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : mensalistas.length > 0 ? (
        <div className="space-y-3">
          {mensalistas.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
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
                      Dia {m.dia}
                    </div>
                  </div>
                </div>
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
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhum mensalista cadastrado
        </div>
      )}
    </div>
  );
}
