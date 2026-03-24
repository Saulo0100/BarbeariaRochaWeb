/*
 * Design: Vintage Barbershop — Redefinir Senha
 * Página para redefinir senha usando token recebido por email
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { appConfig } from "@/config";

export default function RedefinirSenha() {
  const [, setLocation] = useLocation();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [mensagem, setMensagem] = useState("");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token de redefinição não encontrado.");
      setStatus("error");
      setMensagem("Token de redefinição não encontrado na URL.");
      return;
    }

    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await authApi.redefinirSenha({ token, novaSenha });
      setStatus("success");
      setMensagem("Sua senha foi redefinida com sucesso!");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao redefinir senha.");
      setStatus("error");
      setMensagem(err.response?.data || "Token inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container max-w-sm mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center mb-4">
            <img src={appConfig.logo} alt={appConfig.nome} className="w-16 h-16 rounded-full object-contain" />
          </div>
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold">Link Inválido</h1>
          <p className="text-muted-foreground text-sm">Token de redefinição não encontrado na URL.</p>
          <Button
            onClick={() => setLocation("/login")}
            variant="outline"
            className="w-full h-12 border-primary/30 text-primary"
          >
            Voltar ao Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)]">
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img src={appConfig.logo} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <img src={appConfig.logo} alt={appConfig.nome} className="w-16 h-16 rounded-full object-contain vintage-shadow" />
        </div>
      </div>

      <div className="container max-w-sm mx-auto pt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {status === "form" && (
            <>
              <h1 className="font-display text-2xl font-bold text-center mb-1">
                Redefinir Senha
              </h1>
              <p className="text-muted-foreground text-sm text-center mb-6">
                Digite sua nova senha abaixo
              </p>

              <form onSubmit={handleRedefinir} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha" className="text-sm font-medium">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="h-12 bg-input border-border text-foreground pr-12 placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha" className="text-sm font-medium">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmarSenha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 gold-gradient text-background font-semibold text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </form>
            </>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold">Senha Redefinida!</h1>
              <p className="text-muted-foreground text-sm">{mensagem}</p>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full h-12 gold-gradient text-background font-semibold"
              >
                Ir para Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="font-display text-2xl font-bold">Erro na Redefinição</h1>
              <p className="text-muted-foreground text-sm">{mensagem}</p>
              <Button
                onClick={() => setLocation("/login")}
                variant="outline"
                className="w-full h-12 border-primary/30 text-primary"
              >
                Voltar ao Login
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
