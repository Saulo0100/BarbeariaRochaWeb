/*
 * Design: Vintage Barbershop — Gestão de Usuários (Admin)
 */
import { useEffect, useState, useCallback } from "react";
import { usuarioApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { UsuarioListarResponse, UsuarioCriarRequest } from "@/lib/types";
import { Perfil, TipoAgenda, PeriodoTrabalho } from "@/lib/types";
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
import {
  Users,
  Plus,
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const perfilLabels: Record<number, string> = {
  1: "Cliente",
  2: "Barbeiro",
  3: "Administrador",
  4: "Barbeiro Administrador",
};

const perfilColors: Record<number, string> = {
  1: "bg-blue-500/10 text-blue-400",
  2: "bg-amber-500/10 text-amber-400",
  3: "bg-purple-500/10 text-purple-400",
  4: "bg-emerald-500/10 text-emerald-400",
};

export default function Usuarios() {
  const { isPerfil } = useAuth();
  const isAdministrador = isPerfil("administrador");
  const [usuarios, setUsuarios] = useState<UsuarioListarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [filtroNome, setFiltroNome] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UsuarioListarResponse | null>(null);
  const [pctDialogOpen, setPctDialogOpen] = useState(false);
  const [pctTarget, setPctTarget] = useState<UsuarioListarResponse | null>(null);
  const [pctValue, setPctValue] = useState("");
  const [pctSaving, setPctSaving] = useState(false);

  const [form, setForm] = useState<UsuarioCriarRequest>({
    nome: "",
    numero: "",
    email: "",
    perfil: Perfil.Cliente,
    descricao: "",
    senha: "",
  });

  const itensPorPagina = 10;

  const formatNumero = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

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
      await usuarioApi.criarComoAdmin(form);
      toast.success("Usuário criado com sucesso!");
      setForm({ nome: "", numero: "", email: "", perfil: Perfil.Cliente, descricao: "", senha: "" });
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar usuário");
    } finally {
      setCreating(false);
      setDialogOpen(false);
    }
  };

  const handleEditarPorcentagem = async () => {
    if (!pctTarget) return;
    const valor = Number(pctValue);
    if (isNaN(valor) || valor < 0 || valor > 100) {
      toast.error("Porcentagem deve estar entre 0 e 100");
      return;
    }
    setPctSaving(true);
    try {
      await usuarioApi.editarPorcentagem(pctTarget.id, valor);
      toast.success("Porcentagem atualizada!");
      setPctDialogOpen(false);
      setPctTarget(null);
      setPctValue("");
      fetchUsuarios();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao atualizar porcentagem");
    } finally {
      setPctSaving(false);
    }
  };

  const handleExcluir = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      await usuarioApi.excluir(deleteTarget.id);
      toast.success("Usuário excluído");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
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
                <Input
                  type="tel"
                  value={formatNumero(form.numero)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setForm((prev) => ({ ...prev, numero: digits }));
                  }}
                  className="h-10 bg-input border-border text-sm"
                  placeholder="(11) 99999-9999"
                />
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
                    {isAdministrador && <SelectItem value="3">Barbeiro Administrador</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              {(form.perfil === Perfil.Barbeiro || form.perfil === Perfil.Administrador) && (
                <>
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
                  {form.perfil === Perfil.Barbeiro && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Porcentagem do Admin (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={form.porcentagem || ""}
                          onChange={(e) => setForm({ ...form, porcentagem: e.target.value ? Number(e.target.value) : undefined })}
                          className="h-10 bg-input border-border text-sm"
                          placeholder="Ex: 50"
                        />
                        <p className="text-[10px] text-muted-foreground">Porcentagem que o admin recebe sobre o faturamento deste barbeiro</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Período de Trabalho</Label>
                        <Select value={String(form.periodoTrabalho || PeriodoTrabalho.DiaTodo)} onValueChange={(v) => setForm({ ...form, periodoTrabalho: parseInt(v) })}>
                          <SelectTrigger className="h-10 bg-input border-border text-sm">
                            <SelectValue placeholder="Período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={String(PeriodoTrabalho.DiaTodo)}>Dia Todo</SelectItem>
                            <SelectItem value={String(PeriodoTrabalho.Manha)}>Manhã</SelectItem>
                            <SelectItem value={String(PeriodoTrabalho.Tarde)}>Tarde</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground">Manhã: horários até o almoço. Tarde: a partir do almoço.</p>
                      </div>
                    </>
                  )}
                </>
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
              {u.foto ? (
                <img
                  src={`data:image/jpeg;base64,${u.foto}`}
                  alt={u.nome}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-primary/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold shrink-0">
                  {u.nome.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{u.nome}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${perfilColors[u.perfil] || ""}`}>
                  {perfilLabels[u.perfil] || u.perfil}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(u.perfil.toString() === "Barbeiro") || (u.perfil.toString() === "BarbeiroAdministrador") && (
                  <button
                    onClick={() => {
                      setPctTarget(u);
                      setPctValue("");
                      setPctDialogOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition-colors border border-primary/20 text-xs font-semibold"
                    title="Editar porcentagem"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>%</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setDeleteTarget(u);
                    setDeleteDialogOpen(true);
                  }}
                  disabled={deleting === u.id}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  {deleting === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
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

      {/* Edit Porcentagem Dialog */}
      <Dialog open={pctDialogOpen} onOpenChange={setPctDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Porcentagem</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Alterar a porcentagem de comissão do barbeiro <strong>{pctTarget?.nome}</strong>.
              A alteração só afeta agendamentos futuros.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label className="text-xs">Nova Porcentagem (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={pctValue}
                onChange={(e) => setPctValue(e.target.value)}
                className="h-10 bg-input border-border text-sm"
                placeholder="Ex: 50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEditarPorcentagem}
                disabled={pctSaving}
                className="flex-1 h-10 gold-gradient text-background text-sm"
              >
                {pctSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPctDialogOpen(false)}
                className="h-10 text-sm border-border"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Excluir Usuário</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Deseja realmente excluir o usuário <strong>{deleteTarget?.nome}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleExcluir}
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
