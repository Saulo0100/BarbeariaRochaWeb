/*
 * Design: Vintage Barbershop — Configurações
 * Permite configurar a URL base da API
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiBaseUrl, getApiBaseUrl } from "@/lib/api";
import { Settings, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";

export default function Configuracoes() {
  const { user, isAuthenticated } = useAuth();
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [saving, setSaving] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [savingSenha, setSavingSenha] = useState(false);

  const handleSaveUrl = () => {
    if (!apiUrl) {
      toast.error("Informe a URL da API");
      return;
    }
    setSaving(true);
    setApiBaseUrl(apiUrl.replace(/\/$/, ""));
    setTimeout(() => {
      setSaving(false);
      toast.success("URL da API atualizada! Recarregue a página para aplicar.");
    }, 500);
  };

  const handleNovaSenha = async () => {
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
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <h1 className="font-display text-2xl font-bold flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        Configurações
      </h1>

      {/* API URL */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <h2 className="font-semibold text-sm mb-3">Conexão com a API</h2>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">URL Base da API</Label>
            <Input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://sua-api.com"
              className="h-10 bg-input border-border text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Informe a URL do backend da BarbeariaRocha (ex: https://api.barbearia.com)
            </p>
          </div>
          <Button
            onClick={handleSaveUrl}
            disabled={saving}
            className="gold-gradient text-background text-sm h-10"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </div>

      {/* Alterar Senha (logado) */}
      {isAuthenticated && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <h2 className="font-semibold text-sm mb-3">Alterar Senha</h2>
          <div className="space-y-3">
            <div className="space-y-2">
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
              onClick={handleNovaSenha}
              disabled={savingSenha}
              className="gold-gradient text-background text-sm h-10"
            >
              {savingSenha ? <Loader2 className="w-4 h-4 animate-spin" /> : "Alterar Senha"}
            </Button>
          </div>
        </div>
      )}

      {/* User Info */}
      {isAuthenticated && user && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-3">Informações da Conta</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome</span>
              <span>{user.nome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Perfil</span>
              <span className="text-primary">{user.perfil}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone</span>
              <span>{user.numero}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
