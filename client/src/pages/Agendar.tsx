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
import type { AdicionalDisponivel, BarbeirosDetalhesResponse, ServicoDetalhesResponse } from "@/lib/types";
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

const STEPS = ["Barbeiro", "Serviço", "Adicionais", "Data", "Dados", "Confirmar"];

/** Formata Date como "YYYY-MM-DD" usando horário local (evita bug de fuso com toISOString) */
const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Retorna data máxima permitida para agendamento com base no tipo de agenda do barbeiro */
const getMaxDate = (agenda: string | undefined): Date => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  switch (agenda?.toLowerCase()) {
    case "semanal":
      return new Date(hoje.getTime() + 7 * 86400000);
    case "quinzenal":
      return new Date(hoje.getTime() + 15 * 86400000);
    case "mensal":
      return new Date(hoje.getTime() + 30 * 86400000);
    default:
      return new Date(hoje.getTime() + 30 * 86400000); // padrão: mensal
  }
};

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
  const [selectedTimeEtapa2, setSelectedTimeEtapa2] = useState<string | null>(null);
  const [nome, setNome] = useState(user?.nome || "");
  const [numero, setNumero] = useState(user?.numero || "");
  const [tokenSent, setTokenSent] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Adicionais state
  const [querAdicional, setQuerAdicional] = useState<boolean | null>(null);
  const [adicionaisDisponiveis, setAdicionaisDisponiveis] = useState<AdicionalDisponivel[]>([]);
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<AdicionalDisponivel[]>([]);

  // Multi-slot state
  const [horariosEtapa2, setHorariosEtapa2] = useState<string[]>([]);
  const [loadingEtapa2, setLoadingEtapa2] = useState(false);

  useEffect(() => {
    usuarioApi.listarBarbeiros().then((r) => {
      const data = r.data;
      setBarbeiros(Array.isArray(data) ? data : []);
    }).catch(() => {});
    servicoApi.listar(1, 50).then((r) => setServicos(r.data.items || [])).catch(() => {});
    agendamentoApi.adicionaisDisponiveis().then((r) => {
      setAdicionaisDisponiveis(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {
      // Fallback: hardcode defaults if endpoint not available
      setAdicionaisDisponiveis([
        { nome: "Barba", valor: 15 },
        { nome: "Sobrancelha", valor: 10 },
        { nome: "Hidratação", valor: 25 },
      ]);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setNumero(user.numero);
    }
  }, [user]);

  // Fetch horarios disponiveis when barbeiro and date change
  // Uses service-aware endpoint for multi-slot services
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [barbeariaAberta, setBarbeariaAberta] = useState(true);

  /** Check if the selected service needs multi-slot handling */
  const isMultiSlotService = selectedServico
    ? selectedServico.requerDuasEtapas || selectedServico.tempoEstimado === "01:20:00"
    : false;

  const isDuasEtapas = selectedServico?.requerDuasEtapas || false;

  useEffect(() => {
    if (selectedBarbeiro && selectedDate) {
      const dateStr = toLocalDateStr(selectedDate);

      // Reset etapa2 selections when date changes
      setSelectedTimeEtapa2(null);
      setHorariosEtapa2([]);

      if (selectedServico && isMultiSlotService) {
        // Use service-aware endpoint
        horarioApi
          .disponiveisPorServico(selectedBarbeiro.id, dateStr, selectedServico.id)
          .then((r) => {
            const data = r.data;
            setBarbeariaAberta(data.aberto);
            setHorariosDisponiveis(data.horariosDisponiveis || []);
            setHorariosOcupados(data.horariosOcupados || []);
          })
          .catch(() => {
            // Fallback to normal endpoint
            horarioApi.disponiveis(selectedBarbeiro.id, dateStr).then((r) => {
              setBarbeariaAberta(r.data.aberto);
              setHorariosDisponiveis(r.data.horariosDisponiveis || []);
              setHorariosOcupados(r.data.horariosOcupados || []);
            }).catch(() => {});
          });
      } else {
        // Normal service: use standard endpoint
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
    }
  }, [selectedBarbeiro, selectedDate, selectedServico, isMultiSlotService]);

  // Fetch etapa2 slots when user picks stage 1 time for RequerDuasEtapas services
  useEffect(() => {
    if (isDuasEtapas && selectedBarbeiro && selectedDate && selectedTime && selectedServico) {
      setLoadingEtapa2(true);
      setSelectedTimeEtapa2(null);
      const dateStr = toLocalDateStr(selectedDate);
      horarioApi
        .disponiveisEtapa2(selectedBarbeiro.id, dateStr, selectedServico.id, selectedTime)
        .then((r) => {
          setHorariosEtapa2(r.data.horariosDisponiveisEtapa2 || []);
        })
        .catch(() => setHorariosEtapa2([]))
        .finally(() => setLoadingEtapa2(false));
    } else {
      setHorariosEtapa2([]);
    }
  }, [isDuasEtapas, selectedBarbeiro, selectedDate, selectedTime, selectedServico]);

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
    if (isDuasEtapas && !selectedTimeEtapa2) {
      toast.error("Selecione o horário da segunda etapa");
      return;
    }
    if (!codigoConfirmacao) {
      toast.error("Informe o código de confirmação");
      return;
    }

    const [h, m] = selectedTime.split(":");
    const dtStr = `${toLocalDateStr(selectedDate)}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;

    let dtEtapa2Str: string | undefined;
    if (isDuasEtapas && selectedTimeEtapa2) {
      const [h2, m2] = selectedTimeEtapa2.split(":");
      dtEtapa2Str = `${toLocalDateStr(selectedDate)}T${h2.padStart(2, "0")}:${m2.padStart(2, "0")}:00`;
    }

    setLoading(true);
    try {
      await agendamentoApi.criar({
        barbeiroId: selectedBarbeiro.id,
        servicoId: selectedServico.id,
        dtAgendamento: dtStr,
        dtAgendamentoEtapa2: dtEtapa2Str,
        numero: numero.replace(/\D/g, ""),
        nome,
        codigoConfirmacao: parseInt(codigoConfirmacao),
        adicionais: adicionaisSelecionados.length > 0 ? adicionaisSelecionados.map(a => ({ nome: a.nome, valor: a.valor })) : undefined,
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
    if (step === 2) return querAdicional !== null;
    if (step === 3) {
      if (!selectedDate || !selectedTime) return false;
      if (isDuasEtapas && !selectedTimeEtapa2) return false;
      return true;
    }
    if (step === 4) return !!nome && numero.replace(/\D/g, "").length === 11 && tokenSent && !!codigoConfirmacao;
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
                    {b.foto ? (
                      <img
                        src={`data:image/jpeg;base64,${b.foto}`}
                        alt={b.nome}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-primary/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold text-lg shrink-0">
                        {b.nome.charAt(0)}
                      </div>
                    )}
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

          {/* Step 2: Adicionais */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Serviços Adicionais</h2>
              <p className="text-sm text-muted-foreground mb-4">Deseja adicionar serviços adicionais?</p>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    setQuerAdicional(false);
                    setAdicionaisSelecionados([]);
                  }}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    querAdicional === false
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  Não, obrigado
                </button>
                <button
                  onClick={() => setQuerAdicional(true)}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    querAdicional === true
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  Sim, quero!
                </button>
              </div>

              {querAdicional && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <p className="text-xs text-muted-foreground mb-2">Selecione os adicionais desejados:</p>
                  {adicionaisDisponiveis.map((ad) => {
                    const isSelected = adicionaisSelecionados.some(s => s.nome === ad.nome);
                    return (
                      <button
                        key={ad.nome}
                        onClick={() => {
                          if (isSelected) {
                            setAdicionaisSelecionados(prev => prev.filter(s => s.nome !== ad.nome));
                          } else {
                            setAdicionaisSelecionados(prev => [...prev, ad]);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-background" />}
                          </div>
                          <span className="text-sm font-medium">{ad.nome}</span>
                        </div>
                        <span className="text-sm font-display font-bold text-primary">
                          + R$ {ad.valor.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                  {adicionaisSelecionados.length > 0 && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground">Total adicionais:</p>
                      <p className="text-sm font-display font-bold text-primary">
                        R$ {adicionaisSelecionados.reduce((sum, a) => sum + a.valor, 0).toFixed(2)}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Step 3: Data e Hora */}
          {step === 3 && (
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
                    const maxDate = selectedBarbeiro ? getMaxDate(selectedBarbeiro.agenda) : new Date(today.getTime() + 30 * 86400000);
                    const isBeyondAgenda = date > maxDate;
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();
                    const isDisabled = isPast || isSunday || isBeyondAgenda;

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

              {/* Multi-slot info banner */}
              {isMultiSlotService && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-primary">
                    {isDuasEtapas
                      ? `Este serviço requer 2 horários com ${selectedServico?.intervaloMinimoHoras}h de intervalo`
                      : "Este serviço ocupa 2 horários consecutivos"}
                  </p>
                  {isDuasEtapas && selectedServico && (
                    <p className="text-xs text-muted-foreground mt-1">
                      1º horário: {selectedServico.descricaoEtapa1 || "Etapa 1"} | 2º horário: {selectedServico.descricaoEtapa2 || "Etapa 2"}
                    </p>
                  )}
                </div>
              )}

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
                    {isDuasEtapas
                      ? `1º Horário - ${selectedServico?.descricaoEtapa1 || "Etapa 1"}`
                      : "Horários disponíveis"}
                  </p>
                  {horariosDisponiveis.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {horariosDisponiveis.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => {
                              setSelectedTime(slot);
                              setSelectedTimeEtapa2(null);
                            }}
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
                      {isMultiSlotService
                        ? "Não há horários com disponibilidade para este serviço neste dia"
                        : "Todos os horários estão ocupados para este dia"}
                    </p>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Carregando horários...
                    </p>
                  )}

                  {/* Stage 2 time picker for RequerDuasEtapas services */}
                  {isDuasEtapas && selectedTime && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        2º Horário - {selectedServico?.descricaoEtapa2 || "Etapa 2"}
                        <span className="text-xs text-muted-foreground">
                          (mín. {selectedServico?.intervaloMinimoHoras}h após o 1º)
                        </span>
                      </p>
                      {loadingEtapa2 ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="ml-2 text-xs text-muted-foreground">Carregando horários...</span>
                        </div>
                      ) : horariosEtapa2.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {horariosEtapa2.map((slot) => {
                            const isSelected = selectedTimeEtapa2 === slot;
                            return (
                              <button
                                key={slot}
                                onClick={() => setSelectedTimeEtapa2(slot)}
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
                      ) : (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          Nenhum horário disponível para a 2ª etapa neste dia
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Dados pessoais + Token */}
          {step === 4 && (
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

          {/* Step 5: Resumo */}
          {step === 5 && (
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
                    {adicionaisSelecionados.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-muted-foreground">Adicionais:</p>
                        {adicionaisSelecionados.map(a => (
                          <p key={a.nome} className="text-xs text-primary">+ {a.nome} (R$ {a.valor.toFixed(2)})</p>
                        ))}
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          Total: R$ {((selectedServico?.valor || 0) + adicionaisSelecionados.reduce((s, a) => s + a.valor, 0)).toFixed(2)}
                        </p>
                      </div>
                    )}
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
                      {isDuasEtapas && selectedServico && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({selectedServico.descricaoEtapa1 || "Etapa 1"})
                        </span>
                      )}
                    </p>
                    {isDuasEtapas && selectedTimeEtapa2 && selectedServico && (
                      <p className="font-semibold text-sm text-primary mt-0.5">
                        2º horário: {selectedTimeEtapa2}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({selectedServico.descricaoEtapa2 || "Etapa 2"})
                        </span>
                      </p>
                    )}
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
      {step < 5 && (
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
