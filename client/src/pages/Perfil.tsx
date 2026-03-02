/*
 * Design: Vintage Barbershop — Perfil do Usuário
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usuarioApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit3, Save, Loader2, Mail, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Perfil() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: user?.nome || "",
    email: user?.email || "",
    numero: user?.numero || "",
    descricao: user?.descricao || "",
  });

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await usuarioApi.editar(user.id, {
        id: user.id,
        nome: form.nome,
        email: form.email,
        numero: form.numero,
        descricao: form.descricao,
      });
      await refreshUser();
      setEditing(false);
      toast.success("Perfil atualizado!");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold text-3xl mb-3">
            {user.nome.charAt(0)}
          </div>
          <h1 className="font-display text-xl font-bold">{user.nome}</h1>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary mt-1">
            {user.perfil}
          </span>
        </div>

        {/* Info / Edit */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Informações Pessoais</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-primary text-xs flex items-center gap-1 hover:underline"
              >
                <Edit3 className="w-3 h-3" /> Editar
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Telefone</Label>
                <Input
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, "") })}
                  className="h-10 bg-input border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="h-10 bg-input border-border text-sm"
                  placeholder="Uma breve descrição"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 h-10 gold-gradient text-background text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Salvar</>}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="h-10 text-sm border-border"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm">{user.numero}</p>
                </div>
              </div>
              {user.descricao && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Descrição</p>
                    <p className="text-sm">{user.descricao}</p>
                  </div>
                </div>
              )}
              {user.agenda && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Agenda</p>
                    <p className="text-sm">{user.agenda}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Serviços do barbeiro */}
        {user.servicos && user.servicos.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 mt-4">
            <h2 className="font-semibold text-sm mb-3">Meus Serviços</h2>
            <div className="space-y-2">
              {user.servicos.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span>{s.nome}</span>
                  <span className="text-primary font-semibold">R$ {s.valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
