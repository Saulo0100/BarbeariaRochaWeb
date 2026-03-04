/*
 * Design: Vintage Barbershop — Perfil do Usuário
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usuarioApi, authApi } from "@/lib/api";
import { TipoAgenda } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Edit3, Save, Loader2, Mail, Phone, FileText, Calendar, Camera, Key } from "lucide-react";
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
    agenda: user?.agenda || "",
  });
  const [novaSenha, setNovaSenha] = useState("");
  const [savingSenha, setSavingSenha] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [savingFoto, setSavingFoto] = useState(false);

  const isBarbeiro = user?.perfil?.toLowerCase() === "barbeiro" || user?.perfil?.toLowerCase() === "barbeiroadministrador";

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const editData: any = {
        id: user.id,
        nome: form.nome,
        email: form.email,
        numero: form.numero,
        descricao: form.descricao,
      };
      if (isBarbeiro && form.agenda) {
        editData.agenda = parseInt(form.agenda) as TipoAgenda;
      }
      await usuarioApi.editar(user.id, editData);
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
        {/* Avatar + Foto */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {user.foto ? (
              <img
                src={`data:image/jpeg;base64,${user.foto}`}
                alt={user.nome}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary mb-3"
              />
            ) : fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-primary mb-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold text-3xl mb-3">
                {user.nome.charAt(0)}
              </div>
            )}
            <label
              htmlFor="foto-upload"
              className="absolute bottom-2 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-background" />
            </label>
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("A imagem deve ter no máximo 2MB");
                  return;
                }
                setFotoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setFotoPreview(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>
          {fotoFile && (
            <Button
              onClick={async () => {
                setSavingFoto(true);
                try {
                  const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
                    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
                    reader.readAsDataURL(fotoFile);
                  });
                  await usuarioApi.editar(user.id, { id: user.id, foto: base64 });
                  await refreshUser();
                  setFotoFile(null);
                  setFotoPreview(null);
                  toast.success("Foto atualizada!");
                } catch (err: any) {
                  toast.error(err.response?.data || "Erro ao atualizar foto");
                } finally {
                  setSavingFoto(false);
                }
              }}
              disabled={savingFoto}
              size="sm"
              className="mt-1 gold-gradient text-background text-xs h-8"
            >
              {savingFoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Camera className="w-3 h-3 mr-1" /> Salvar Foto</>}
            </Button>
          )}
          <h1 className="font-display text-xl font-bold mt-2">{user.nome}</h1>
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
              {isBarbeiro && (
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Agenda</Label>
                  <Select value={form.agenda} onValueChange={(v) => setForm({ ...form, agenda: v })}>
                    <SelectTrigger className="h-10 bg-input border-border text-sm">
                      <SelectValue placeholder="Selecione o tipo" />
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
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Agenda</p>
                    <p className="text-sm">{user.agenda}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alterar Senha */}
        <div className="bg-card border border-border rounded-lg p-4 mt-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Alterar Senha
          </h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Nova Senha</Label>
              <Input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="h-10 bg-input border-border text-sm"
              />
            </div>
            <Button
              onClick={async () => {
                if (novaSenha.length < 6) {
                  toast.error("A senha deve ter pelo menos 6 caracteres");
                  return;
                }
                setSavingSenha(true);
                try {
                  await authApi.novaSenha(novaSenha);
                  toast.success("Senha alterada com sucesso!");
                  setNovaSenha("");
                } catch (err: any) {
                  toast.error(err.response?.data || "Erro ao alterar senha");
                } finally {
                  setSavingSenha(false);
                }
              }}
              disabled={savingSenha}
              className="gold-gradient text-background text-sm h-10"
            >
              {savingSenha ? <Loader2 className="w-4 h-4 animate-spin" /> : "Alterar Senha"}
            </Button>
          </div>
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
