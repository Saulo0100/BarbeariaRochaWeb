/*
 * Design: Vintage Barbershop — Gestão de Usuários (Admin)
 */
import { useEffect, useState, useCallback } from "react";
import { usuarioApi } from "@/lib/api";
import type { UsuarioListarResponse, UsuarioCriarRequest } from "@/lib/types";
import { Perfil, TipoAgenda } from "@/lib/types";
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
  Users,
  Plus,
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const perfilLabels: Record<number, string> = {
  1: "Cliente",
  2: "Barbeiro",
  3: "Administrador",
};

const perfilColors: Record<number, string> = {
  1: "bg-blue-500/10 text-blue-400",
  2: "bg-amber-500/10 text-amber-400",
  3: "bg-purple-500/10 text-purple-400",
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioListarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filtroNome, setFiltroNome] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const [form, setForm] = useState<UsuarioCriarRequest>({
    nome: "",
    numero: "",
    email: "",
    perfil: Perfil.Cliente,
    descricao: "",
    senha: "",
  });

  const itensPorPagina = 10;

  const fetchUsuarios = useCallback(() => {
    setLoading(true);
    usuarioApi
      .listar(pagina, itensPorPagina, { nome: filtroNome || undefined })
      .then((r) => {
        setUsuarios(r.data.items || []);
        setTotalRegistros(r.data.totalRegistros || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pagina, filtroNome]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

  const handleCriar = async () => {
    if (!form.nome || !form.numero || !form.email || !form.senha) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setCreating(true);
    try {
      await usuarioApi.criar(form);
      toast.success("Usuário criado com sucesso!");
      setDialogOpen(false);
      setForm({ nome: "", numero: "", email: "", perfil: Perfil.Cliente, descricao: "", senha: "" });
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Deseja excluir este usuário?")) return;
    setDeleting(id);
    try {
      await usuarioApi.excluir(id);
      toast.success("Usuário excluído");
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao excluir");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Usuários
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gold-gradient text-background text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="h-10 bg-input border-border text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Telefone</Label>
                <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, "") })} className="h-10 bg-input border-border text-sm" placeholder="11999999999" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 bg-input border-border text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Senha</Label>
                <Input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="h-10 bg-input border-border text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Perfil</Label>
                <Select value={String(form.perfil)} onValueChange={(v) => setForm({ ...form, perfil: parseInt(v) as Perfil })}>
                  <SelectTrigger className="h-10 bg-input border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cliente</SelectItem>
                    <SelectItem value="2">Barbeiro</SelectItem>
                    <SelectItem value="3">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.perfil === Perfil.Barbeiro && (
                <div className="space-y-1">
                  <Label className="text-xs">Agenda</Label>
                  <Select value={String(form.agenda || "")} onValueChange={(v) => setForm({ ...form, agenda: parseInt(v) as TipoAgenda })}>
                    <SelectTrigger className="h-10 bg-input border-border text-sm">
                      <SelectValue placeholder="Tipo de agenda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Diária</SelectItem>
                      <SelectItem value="2">Semanal</SelectItem>
                      <SelectItem value="3">Quinzenal</SelectItem>
                      <SelectItem value="4">Mensal</SelectItem>
                      <SelectItem value="5">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="h-10 bg-input border-border text-sm" />
              </div>
              <Button onClick={handleCriar} disabled={creating} className="w-full h-10 gold-gradient text-background text-sm">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={filtroNome}
          onChange={(e) => {
            setFiltroNome(e.target.value);
            setPagina(1);
          }}
          className="h-10 pl-9 bg-input border-border text-sm"
        />
      </div>

      <p className="text-xs text-muted-foreground mb-3">{totalRegistros} usuário{totalRegistros !== 1 ? "s" : ""}</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : usuarios.length > 0 ? (
        <div className="space-y-2">
          {usuarios.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold shrink-0">
                {u.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.nome}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${perfilColors[u.perfil] || ""}`}>
                  {perfilLabels[u.perfil] || u.perfil}
                </span>
              </div>
              <button
                onClick={() => handleExcluir(u.id)}
                disabled={deleting === u.id}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
        <div className="text-center py-12 text-muted-foreground text-sm">Nenhum usuário encontrado</div>
      )}
    </div>
  );
}
