/*
 * Design: Vintage Barbershop — Login Page
 * Formulário de login com número e senha
 * Link para cadastro e esqueceu senha
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";

const LOGO_IMG = "/logo-rocha.png";

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [numero, setNumero] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      await login({ numero, senha });
      toast.success("Login realizado com sucesso!");
      setLocation("/");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero || !email) {
      toast.error("Preencha número e email");
      return;
    }
    setLoading(true);
    try {
      await authApi.esqueceuSenha({ numero, email });
      toast.success("Instruções enviadas para seu email/WhatsApp!");
      setMode("login");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao recuperar senha");
    } finally {
      setLoading(false);
    }
  };

  const formatNumero = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  return (
    <div className="min-h-[calc(100vh-7.5rem)]">
      {/* Top image accent */}
      <div className="relative h-40 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img src={LOGO_IMG} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <img src={LOGO_IMG} alt="Barbearia Rocha" className="w-16 h-16 rounded-full object-contain vintage-shadow" />
        </div>
      </div>

      <div className="container max-w-sm mx-auto pt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-2xl font-bold text-center mb-1">
            {mode === "login" ? "Bem-vindo de Volta" : "Recuperar Senha"}
          </h1>
          <p className="text-muted-foreground text-sm text-center mb-6">
            {mode === "login"
              ? "Entre com seu número e senha"
              : "Informe seu número e email cadastrado"}
          </p>

          <form onSubmit={mode === "login" ? handleLogin : handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-sm font-medium">
                Número de Telefone
              </Label>
              <Input
                id="numero"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formatNumero(numero)}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {mode === "login" ? (
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gold-gradient text-background font-semibold text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Recuperar Senha"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {mode === "login" ? (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
                <p className="text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <button
                    onClick={() => setLocation("/cadastro")}
                    className="text-primary hover:underline font-medium"
                  >
                    Cadastre-se
                  </button>
                </p>
              </>
            ) : (
              <button
                onClick={() => setMode("login")}
                className="text-sm text-primary hover:underline"
              >
                Voltar ao login
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
