/*
 * Design: Vintage Barbershop — Agendamento
 * Fluxo: Escolher barbeiro -> Serviço -> Data/Hora -> Dados pessoais -> Token -> Confirmar
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { agendamentoApi, horarioApi, servicoApi, tokenApi, usuarioApi } from "@/lib/api";
import type { BarbeirosDetalhesResponse, ServicoDetalhesResponse } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Loader2,
  Scissors,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Barbeiro", "Serviço", "Data", "Dados", "Confirmar"];

export default function Agendar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data
  const [barbeiros, setBarbeiros] = useState<BarbeirosDetalhesResponse[]>([]);
  const [servicos, setServicos] = useState<ServicoDetalhesResponse[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  // Selections
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<BarbeirosDetalhesResponse | null>(null);
  const [selectedServico, setSelectedServico] = useState<ServicoDetalhesResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [nome, setNome] = useState(user?.nome || "");
  const [numero, setNumero] = useState(user?.numero || "");
  const [tokenSent, setTokenSent] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    usuarioApi.listarBarbeiros().then((r) => {
      const data = r.data;
      setBarbeiros(Array.isArray(data) ? data : []);
    }).catch(() => {});
    servicoApi.listar(1, 50).then((r) => setServicos(r.data.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setNumero(user.numero);
    }
  }, [user]);

  // Fetch horarios disponiveis when barbeiro and date change
  // Uses the new /api/horario/disponiveis endpoint that respects business rules
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [barbeariaAberta, setBarbeariaAberta] = useState(true);

  useEffect(() => {
    if (selectedBarbeiro && selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      horarioApi
        .disponiveis(selectedBarbeiro.id, dateStr)
        .then((r) => {
          const data = r.data;
          setBarbeariaAberta(data.aberto);
          setHorariosDisponiveis(data.horariosDisponiveis || []);
          setHorariosOcupados(data.horariosOcupados || []);
        })
        .catch(() => {
          // Fallback: use old endpoint if new one not available
          agendamentoApi
            .horariosOcupados(selectedBarbeiro.id, dateStr)
            .then((r) => {
              const data = r.data;
              if (Array.isArray(data) && data.length > 0) {
                const horarios = data[0].horarios || [];
                setHorariosOcupados(
                  horarios.map((h: string) => {
                    const parts = h.split(":");
                    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
                  })
                );
              } else {
                setHorariosOcupados([]);
              }
              setHorariosDisponiveis([]);
            })
            .catch(() => setHorariosOcupados([]));
        });
    }
  }, [selectedBarbeiro, selectedDate]);

  const formatNumero = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSendToken = async () => {
    const num = numero.replace(/\D/g, "");
    if (num.length !== 11) {
      toast.error("Informe um número válido com 11 dígitos");
      return;
    }
    setLoading(true);
    try {
      await tokenApi.gerarToken(num);
      setTokenSent(true);
      toast.success("Código de confirmação enviado para seu WhatsApp!");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao enviar código");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedBarbeiro || !selectedServico || !selectedDate || !selectedTime) return;
    if (!codigoConfirmacao) {
      toast.error("Informe o código de confirmação");
      return;
    }

    const dtAgendamento = new Date(selectedDate);
    const [h, m] = selectedTime.split(":");
    dtAgendamento.setHours(parseInt(h), parseInt(m), 0, 0);

    setLoading(true);
    try {
      await agendamentoApi.criar({
        barbeiroId: selectedBarbeiro.id,
        servicoId: selectedServico.id,
        dtAgendamento: dtAgendamento.toISOString(),
        numero: numero.replace(/\D/g, ""),
        nome,
        codigoConfirmacao: parseInt(codigoConfirmacao),
      });
      toast.success("Agendamento realizado com sucesso!");
      setLocation(isAuthenticated ? "/meus-cortes" : "/");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const daysInMonth = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays, year, month };
  }, [calendarMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canGoBack = step > 0;
  const canGoNext = () => {
    if (step === 0) return !!selectedBarbeiro;
    if (step === 1) return !!selectedServico;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return !!nome && numero.replace(/\D/g, "").length === 11 && tokenSent && !!codigoConfirmacao;
    return false;
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="container max-w-sm mx-auto py-4">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "gold-gradient" : "bg-muted"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={!canGoBack}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {STEPS[step]}
        </span>
        <div className="w-5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {/* Step 0: Barbeiro */}
          {step === 0 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Escolha o Barbeiro</h2>
              <p className="text-sm text-muted-foreground mb-4">Selecione quem vai cuidar do seu visual</p>
              <div className="space-y-3">
                {barbeiros.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarbeiro(b)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      selectedBarbeiro?.id === b.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold text-lg shrink-0">
                      {b.nome.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm">{b.nome}</p>
                      {b.descricao && <p className="text-xs text-muted-foreground">{b.descricao}</p>}
                      <p className="text-xs text-primary mt-0.5">Agenda: {b.agenda}</p>
                    </div>
                    {selectedBarbeiro?.id === b.id && (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
                {barbeiros.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    Nenhum barbeiro disponível. Verifique a configuração da API.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Serviço */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Escolha o Serviço</h2>
              <p className="text-sm text-muted-foreground mb-4">O que deseja fazer hoje?</p>
              <div className="space-y-3">
                {servicos.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedServico(s)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      selectedServico?.id === s.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-sm">{s.nome}</p>
                      <p className="text-xs text-muted-foreground">{s.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {s.tempoEstimado}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {s.categoria}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <span className="font-display text-lg font-bold text-primary">
                        R$ {s.valor.toFixed(2)}
                      </span>
                      {selectedServico?.id === s.id && (
                        <Check className="w-4 h-4 text-primary ml-auto mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Data e Hora */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Data e Horário</h2>
              <p className="text-sm text-muted-foreground mb-4">Quando deseja ser atendido?</p>

              {/* Mini Calendar */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() =>
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))
                    }
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold capitalize">
                    {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() =>
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))
                    }
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth.totalDays }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(daysInMonth.year, daysInMonth.month, day);
                    const isPast = date < today;
                    const isSunday = date.getDay() === 0;
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();
                    const isDisabled = isPast || isSunday;

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                        }}
                        className={`h-9 rounded-md text-xs font-medium transition-all ${
                          isSelected
                            ? "gold-gradient text-background font-bold"
                            : isDisabled
                            ? "text-muted-foreground/30"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && !barbeariaAberta && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Barbearia fechada neste dia</p>
                </div>
              )}
              {selectedDate && barbeariaAberta && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Horários disponíveis
                  </p>
                  {horariosDisponiveis.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {horariosDisponiveis.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 rounded-md text-xs font-medium transition-all ${
                              isSelected
                                ? "gold-gradient text-background font-bold"
                                : "bg-card border border-border hover:border-primary/30 text-foreground"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  ) : horariosOcupados.length > 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Todos os horários estão ocupados para este dia
                    </p>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Carregando horários...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Dados pessoais + Token */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Seus Dados</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Confirme seus dados e valide com o código enviado por WhatsApp
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-12 bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone (WhatsApp)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formatNumero(numero)}
                      onChange={(e) => setNumero(e.target.value.replace(/\D/g, ""))}
                      placeholder="(11) 99999-9999"
                      className="h-12 bg-input border-border flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSendToken}
                      disabled={loading || numero.replace(/\D/g, "").length !== 11}
                      className="h-12 px-4 gold-gradient text-background text-xs font-semibold shrink-0"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tokenSent ? "Reenviar" : "Enviar Código"}
                    </Button>
                  </div>
                </div>

                {tokenSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <Label>Código de Confirmação</Label>
                    <Input
                      value={codigoConfirmacao}
                      onChange={(e) => setCodigoConfirmacao(e.target.value.replace(/\D/g, ""))}
                      placeholder="Digite o código recebido"
                      className="h-12 bg-input border-border text-center text-lg tracking-widest font-mono"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Verifique seu WhatsApp para o código de confirmação
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Resumo */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Confirmar Agendamento</h2>
              <p className="text-sm text-muted-foreground mb-4">Revise os dados antes de confirmar</p>

              <div className="bg-card border border-border rounded-lg divide-y divide-border">
                <div className="p-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Barbeiro</p>
                    <p className="font-semibold text-sm">{selectedBarbeiro?.nome}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <Scissors className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Serviço</p>
                    <p className="font-semibold text-sm">{selectedServico?.nome}</p>
                    <p className="text-xs text-primary">R$ {selectedServico?.valor.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data e Hora</p>
                    <p className="font-semibold text-sm">
                      {selectedDate?.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}{" "}
                      às {selectedTime}
                    </p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="font-semibold text-sm">{nome}</p>
                    <p className="text-xs text-muted-foreground">{formatNumero(numero)}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full h-12 gold-gradient text-background font-semibold mt-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="mt-6">
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canGoNext()}
            className="w-full h-12 gold-gradient text-background font-semibold disabled:opacity-40"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
