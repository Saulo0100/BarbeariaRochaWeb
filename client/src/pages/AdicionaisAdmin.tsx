/*
 * Design: Vintage Barbershop — Gerenciar Adicionais (Admin)
 */
import { useEffect, useState, useCallback } from "react";
import { adicionalApi } from "@/lib/api";
import type { AdicionalDisponivel } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { PackagePlus, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdicionaisAdmin() {
  const [adicionais, setAdicionais] = useState<AdicionalDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    valor: "",
  });

  const fetchAdicionais = useCallback(() => {
    setLoading(true);
    adicionalApi
      .listar()
      .then((r) => setAdicionais(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAdicionais();
  }, [fetchAdicionais]);

  const handleCriar = async () => {
    if (!form.nome || !form.valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setCreating(true);
    try {
      await adicionalApi.criar({
        nome: form.nome,
        valor: parseFloat(form.valor),
      });
      toast.success("Adicional criado!");
      setDialogOpen(false);
      setForm({ nome: "", valor: "" });
      fetchAdicionais();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar adicional");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletar = async () => {
    if (deletingId === null) return;
    setDeleting(true);
    try {
      await adicionalApi.deletar(deletingId);
      toast.success("Adicional excluído");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchAdicionais();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-primary" />
          Adicionais
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-background text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Adicional</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Barba, Sobrancelha, Hidratação"
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="0.00"
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <Button onClick={handleCriar} disabled={creating} className="w-full h-10 gold-gradient text-background text-sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Adicional"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : adicionais.length > 0 ? (
        <div className="space-y-3">
          {[...adicionais].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((a, i) => (
            <motion.div
              key={a.id ?? i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{a.nome}</h3>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="font-display text-lg font-bold text-primary">
                    R$ {a.valor.toFixed(2)}
                  </span>
                  {a.id !== undefined && (
                    <button
                      onClick={() => openDeleteDialog(a.id!)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum adicional cadastrado</div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Tem certeza que deseja excluir este adicional? Os agendamentos que já possuem este adicional não serão afetados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeletar} disabled={deleting} className="flex-1">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
