/*
 * Design: Vintage Barbershop — Gerenciar Serviços (Admin)
 */
import { useEffect, useState, useCallback } from "react";
import { servicoApi } from "@/lib/api";
import type { ServicoDetalhesResponse } from "@/lib/types";
import { CategoriaServico } from "@/lib/types";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { ClipboardList, Plus, Loader2, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ServicosAdmin() {
  const [servicos, setServicos] = useState<ServicoDetalhesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServicoDetalhesResponse | null>(null);

  const [form, setForm] = useState({
    nome: "",
    valor: "",
    tempoEstimado: "",
    descricao: "",
    categoria: "1",
  });

  const fetchServicos = useCallback(() => {
    setLoading(true);
    servicoApi
      .listar(1, 50)
      .then((r) => setServicos(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchServicos();
  }, [fetchServicos]);

  const handleCriar = async () => {
    if (!form.nome || !form.valor || !form.tempoEstimado) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setCreating(true);
    try {
      await servicoApi.criar({
        nome: form.nome,
        valor: parseFloat(form.valor),
        tempoEstimado: parseInt(form.tempoEstimado),
        descricao: form.descricao,
        categoria: parseInt(form.categoria) as CategoriaServico,
      });
      toast.success("Serviço criado!");
      setDialogOpen(false);
      setForm({ nome: "", valor: "", tempoEstimado: "", descricao: "", categoria: "1" });
      fetchServicos();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar serviço");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletar = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await servicoApi.deletar(deleteTarget.id);
      toast.success("Serviço excluído");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchServicos();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao excluir");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Serviços
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-background text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="h-10 bg-input border-border text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} className="h-10 bg-input border-border text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tempo (min)</Label>
                  <Input type="number" value={form.tempoEstimado} onChange={(e) => setForm({ ...form, tempoEstimado: e.target.value })} className="h-10 bg-input border-border text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger className="h-10 bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cabelo</SelectItem>
                    <SelectItem value="2">Barba</SelectItem>
                    <SelectItem value="3">Sobrancelha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="h-10 bg-input border-border text-sm" />
              </div>
              <Button onClick={handleCriar} disabled={creating} className="w-full h-10 gold-gradient text-background text-sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Serviço"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : servicos.length > 0 ? (
        <div className="space-y-3">
          {[...servicos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{s.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.descricao}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {s.tempoEstimado}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {s.categoria}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="font-display text-lg font-bold text-primary">
                    R$ {s.valor.toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      setDeleteTarget(s);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={deleting === s.id}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    {deleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum serviço cadastrado</div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Excluir Serviço</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Deseja realmente excluir o serviço <strong>{deleteTarget?.nome}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleDeletar}
              disabled={deleting !== null}
              className="flex-1 h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm"
            >
              {deleting !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-10 text-sm border-border"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
