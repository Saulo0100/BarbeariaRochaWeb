/*
 * Design: Vintage Barbershop — Confirmação de Email
 * Página que processa o token de confirmação da URL
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { usuarioApi } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { appConfig } from "@/config";

export default function ConfirmarEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMensagem("Token de confirmação não encontrado.");
      return;
    }

    usuarioApi
      .confirmarEmail(token)
      .then(() => {
        setStatus("success");
        setMensagem("Seu email foi confirmado com sucesso! Agora você pode fazer login.");
      })
      .catch((err) => {
        setStatus("error");
        setMensagem(err.response?.data || "Token inválido ou expirado.");
      });
  }, []);

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

        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground text-sm">Confirmando seu email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-display text-2xl font-bold">Email Confirmado!</h1>
            <p className="text-muted-foreground text-sm">{mensagem}</p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full h-12 gold-gradient text-background font-semibold"
            >
              Ir para Login
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-bold">Erro na Confirmação</h1>
            <p className="text-muted-foreground text-sm">{mensagem}</p>
            <Button
              onClick={() => setLocation("/cadastro")}
              variant="outline"
              className="w-full h-12 border-primary/30 text-primary"
            >
              Voltar ao Cadastro
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
