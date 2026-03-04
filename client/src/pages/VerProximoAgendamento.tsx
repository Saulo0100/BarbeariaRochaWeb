/*
 * Design: Vintage Barbershop — Ver Próximo Agendamento (sem login)
 * Fluxo: Informar número -> Receber código no WhatsApp -> Validar código -> Ver próximo agendamento
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agendamentoApi } from "@/lib/api";
import type { AgendamentoDetalheResponse } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  Phone,
  Scissors,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Step = "numero" | "codigo" | "resultado";

export default function VerProximoAgendamento() {
  const [step, setStep] = useState<Step>("numero");
  const [numero, setNumero] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [agendamento, setAgendamento] = useState<AgendamentoDetalheResponse | null>(null);

  const formatNumero = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleEnviarCodigo = async () => {
    if (numero.length !== 11) {
      toast.error("Informe um número válido com 11 dígitos");
      return;
    }
    setLoading(true);
    try {
      await agendamentoApi.gerarTokenCancelamento(numero);
      toast.success("Código enviado para seu WhatsApp!");
      setStep("codigo");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao enviar código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo || codigo.length < 4) {
      toast.error("Informe o código de 4 dígitos");
      return;
    }
    setLoading(true);
    try {
      const res = await agendamentoApi.proximoAgendamentoPorNumero(numero, parseInt(codigo));
      // Check if response has 'mensagem' field (no appointment found)
      if (res.data && "mensagem" in res.data) {
        setAgendamento(null);
        toast.info("Nenhum agendamento pendente encontrado para este número");
      } else {
        setAgendamento(res.data);
      }
      setStep("resultado");
    } catch (err: any) {
      toast.error(err.response?.data || "Código inválido ou expirado");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularTotal = () => {
    if (!agendamento) return 0;
    const valorServico = agendamento.valorServico || 0;
    const valorAdicionais = agendamento.adicionais?.reduce((sum, a) => sum + a.valor, 0) || 0;
    return valorServico + valorAdicionais;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-lg font-display font-bold text-center mb-6">
        Próximo Agendamento
      </h1>

      <AnimatePresence mode="wait">
        {step === "numero" && (
          <motion.div
            key="numero"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Informe o número de telefone utilizado no momento do agendamento.
                Enviaremos um código de verificação via WhatsApp.
              </p>
              <div className="space-y-2">
                <Label htmlFor="numero" className="text-xs">
                  Número de Telefone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="numero"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formatNumero(numero)}
                    onChange={(e) =>
                      setNumero(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    className="h-12 pl-10 bg-input border-border text-foreground"
                  />
                </div>
              </div>
              <Button
                onClick={handleEnviarCodigo}
                disabled={loading || numero.length !== 11}
                className="w-full mt-4 gold-gradient text-background h-12"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Enviar Código"
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "codigo" && (
          <motion.div
            key="codigo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button
              onClick={() => setStep("numero")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-4">
                Informe o código de 4 dígitos enviado para seu WhatsApp.
              </p>
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-xs">
                  Código de Verificação
                </Label>
                <Input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  placeholder="0000"
                  maxLength={4}
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="h-12 bg-input border-border text-foreground text-center text-lg tracking-widest"
                />
              </div>
              <Button
                onClick={handleVerificarCodigo}
                disabled={loading || codigo.length < 4}
                className="w-full mt-4 gold-gradient text-background h-12"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verificar Código"
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === "resultado" && (
          <motion.div
            key="resultado"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                setStep("numero");
                setCodigo("");
                setAgendamento(null);
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </button>

            {!agendamento ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento pendente encontrado.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-display font-bold text-primary text-center">
                  Seu Próximo Agendamento
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Barbeiro</p>
                      <p className="text-sm font-medium">{agendamento.nomeBarbeiro}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Serviço</p>
                      <p className="text-sm font-medium">{agendamento.servico}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Data</p>
                      <p className="text-sm font-medium">{formatDate(agendamento.data)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Horário</p>
                      <p className="text-sm font-medium">{formatTime(agendamento.data)}</p>
                    </div>
                  </div>

                  {agendamento.descricaoEtapa && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Etapa</p>
                        <p className="text-sm font-medium">{agendamento.descricaoEtapa}</p>
                      </div>
                    </div>
                  )}

                  {agendamento.adicionais && agendamento.adicionais.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Adicionais</p>
                      <div className="space-y-1">
                        {agendamento.adicionais.map((a, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{a.nome}</span>
                            <span className="text-primary">R$ {a.valor.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        {agendamento.valorServico != null && (
                          <p className="text-xs text-muted-foreground">
                            Serviço: R$ {agendamento.valorServico.toFixed(2)}
                          </p>
                        )}
                        <p className="text-sm font-display font-bold text-primary">
                          Total: R$ {calcularTotal().toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
