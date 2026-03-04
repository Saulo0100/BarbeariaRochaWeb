/*
 * Design: Vintage Barbershop — Cancelar Agendamento (sem login)
 * Fluxo: Informar número -> Receber código no WhatsApp -> Validar código -> Ver agendamentos -> Cancelar
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agendamentoApi } from "@/lib/api";
import type { AgendamentoDetalheResponse } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Phone,
  Scissors,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Step = "numero" | "codigo" | "agendamentos";

export default function CancelarAgendamento() {
  const [step, setStep] = useState<Step>("numero");
  const [numero, setNumero] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [agendamentos, setAgendamentos] = useState<AgendamentoDetalheResponse[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AgendamentoDetalheResponse | null>(null);
  const [canceling, setCanceling] = useState(false);

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
      const res = await agendamentoApi.pendentesPorNumero(numero, parseInt(codigo));
      setAgendamentos(res.data);
      if (res.data.length === 0) {
        toast.info("Nenhum agendamento pendente encontrado para este número");
      }
      setStep("agendamentos");
    } catch (err: any) {
      toast.error(err.response?.data || "Código inválido ou expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await agendamentoApi.cancelarPorNumero({
        agendamentoId: cancelTarget.id,
        numero,
        codigoConfirmacao: parseInt(codigo),
      });
      toast.success("Agendamento cancelado com sucesso!");
      setCancelDialogOpen(false);
      setCancelTarget(null);
      setAgendamentos((prev) => prev.filter((a) => a.id !== cancelTarget.id));
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao cancelar agendamento");
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-lg font-display font-bold text-center mb-6">
        Cancelar Agendamento
      </h1>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Cancelar Agendamento</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Tem certeza que deseja cancelar este agendamento?
              {cancelTarget && (
                <span className="block mt-2 text-foreground font-medium">
                  {cancelTarget.servico} com {cancelTarget.nomeBarbeiro} -{" "}
                  {formatDate(cancelTarget.data)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="h-10 text-sm border-border"
            >
              Voltar
            </Button>
            <Button
              onClick={handleCancelar}
              disabled={canceling}
              className="h-10 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {canceling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirmar Cancelamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        {step === "agendamentos" && (
          <motion.div
            key="agendamentos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                setStep("numero");
                setCodigo("");
                setAgendamentos([]);
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao início
            </button>

            {agendamentos.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento pendente encontrado.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selecione o agendamento que deseja cancelar:
                </p>
                {agendamentos.map((ag) => (
                  <div
                    key={ag.id}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Scissors className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {ag.servico}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3 shrink-0" />
                        <span>{ag.nomeBarbeiro}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatDate(ag.data)}</span>
                      </div>
                      {ag.descricaoEtapa && (
                        <p className="text-xs text-primary mt-1">
                          Etapa: {ag.descricaoEtapa}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCancelTarget(ag);
                        setCancelDialogOpen(true);
                      }}
                      className="shrink-0 text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
