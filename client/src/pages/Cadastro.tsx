/*
 * Design: Vintage Barbershop — Cadastro
 * Formulário de registro para clientes
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usuarioApi } from "@/lib/api";
import { Perfil } from "@/lib/types";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { appConfig } from "@/config";

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    numero: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const formatNumero = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.numero || !form.email || !form.senha) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (form.numero.replace(/\D/g, "").length !== 11) {
      toast.error("O número deve ter 11 dígitos");
      return;
    }
    if (form.senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await usuarioApi.criar({
        nome: form.nome,
        numero: form.numero.replace(/\D/g, ""),
        email: form.email,
        perfil: Perfil.Cliente,
        descricao: "",
        senha: form.senha,
      });
      setSucesso(true);
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-sm mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>

        <div className="flex justify-center mb-4">
          <img src={appConfig.logo} alt={appConfig.nome} className="w-14 h-14 rounded-full object-contain" />
        </div>

        {sucesso ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Verifique seu Email</h1>
            <p className="text-muted-foreground text-sm">
              Enviamos um link de confirmação para <strong className="text-foreground">{form.email}</strong>. Clique no link para ativar sua conta.
            </p>
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique a pasta de spam.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full h-12 gold-gradient text-background font-semibold"
            >
              Ir para Login
            </Button>
          </div>
        ) : (
          <>
        <h1 className="font-display text-2xl font-bold text-center mb-1">Criar Conta</h1>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Cadastre-se para agendar seus cortes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="h-12 bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Telefone (WhatsApp)</Label>
            <Input
              id="numero"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formatNumero(form.numero)}
              onChange={(e) => setForm({ ...form, numero: e.target.value.replace(/\D/g, "") })}
              className="h-12 bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-12 bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="h-12 bg-input border-border pr-12"
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
            <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
            <Input
              id="confirmarSenha"
              type="password"
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
              className="h-12 bg-input border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 gold-gradient text-background font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Conta"}
          </Button>
        </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
