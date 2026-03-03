/*
 * Design: Vintage Barbershop — Exceções (Admin/Barbeiro)
 * Gerenciar dias de exceção (folgas, feriados, etc.)
 */
import { useEffect, useState, useCallback } from "react";
import { excecaoApi, usuarioApi } from "@/lib/api";
import type { ExcecaoDetalhesResponse, BarbeirosDetalhesResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  AlertTriangle,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Excecoes() {
  const { isPerfil } = useAuth();
  const isAdmin = isPerfil("administrador") || isPerfil("barbeiroadministrador");

  const [excecoes, setExcecoes] = useState<ExcecaoDetalhesResponse[]>([]);
  const [barbeiros, setBarbeiros] = useState<BarbeirosDetalhesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const [form, setForm] = useState({
    data: "",
    descricao: "",
    barbeiroId: "",
  });

  const itensPorPagina = 10;

  const fetchExcecoes = useCallback(() => {
    setLoading(true);
    excecaoApi
      .listar(pagina, itensPorPagina)
      .then((r) => {
        setExcecoes(r.data.items || []);
        setTotalRegistros(r.data.totalRegistros || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pagina]);

  useEffect(() => {
    fetchExcecoes();
  }, [fetchExcecoes]);

  useEffect(() => {
    if (isAdmin) {
      usuarioApi.listarBarbeiros().then((r) => {
        const data = r.data;
        setBarbeiros(Array.isArray(data) ? data : []);
      }).catch(() => {});
    }
  }, [isAdmin]);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  const handleCriar = async () => {
    if (!form.data || !form.descricao) {
      toast.error("Preencha data e descrição");
      return;
    }
    setCreating(true);
    try {
      await excecaoApi.criar({
        data: form.data,
        descricao: form.descricao,
        barbeiroId: form.barbeiroId ? parseInt(form.barbeiroId) : undefined,
      });
      toast.success("Exceção criada!");
      setDialogOpen(false);
      setForm({ data: "", descricao: "", barbeiroId: "" });
      fetchExcecoes();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar exceção");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm("Deseja excluir esta exceção?")) return;
    setDeleting(id);
    try {
      await excecaoApi.deletar(id);
      toast.success("Exceção excluída");
      fetchExcecoes();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao excluir");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Exceções
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-background text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Nova
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Nova Exceção</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Feriado, Folga, etc."
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              {isAdmin && barbeiros.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Barbeiro (opcional)</Label>
                  <Select value={form.barbeiroId} onValueChange={(v) => setForm({ ...form, barbeiroId: v })}>
                    <SelectTrigger className="h-10 bg-input border-border text-sm">
                      <SelectValue placeholder="Todos (geral)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos (geral)</SelectItem>
                      {barbeiros.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleCriar} disabled={creating} className="w-full h-10 gold-gradient text-background text-sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Exceção"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : excecoes.length > 0 ? (
        <div className="space-y-3">
          {excecoes.map((exc, i) => (
            <motion.div
              key={exc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg p-4 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{formatDate(exc.data)}</span>
                </div>
                <p className="text-sm font-medium">{exc.descricao}</p>
                {exc.nomeBarbeiro && (
                  <p className="text-xs text-muted-foreground mt-1">Barbeiro: {exc.nomeBarbeiro}</p>
                )}
              </div>
              <button
                onClick={() => handleDeletar(exc.id)}
                disabled={deleting === exc.id}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                {deleting === exc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button onClick={() => setPagina(Math.max(1, pagina - 1))} disabled={pagina === 1} className="p-2 text-muted-foreground hover:text-primary disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-muted-foreground">{pagina} de {totalPaginas}</span>
              <button onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))} disabled={pagina === totalPaginas} className="p-2 text-muted-foreground hover:text-primary disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhuma exceção cadastrada
        </div>
      )}
    </div>
  );
}
