/*
 * Design: Vintage Barbershop — Agendar para Cliente (Barbeiro/Admin)
 * Fluxo simplificado: Barbeiro -> Serviço -> Data/Hora -> Dados do cliente -> Confirmar
 * Sem necessidade de código de confirmação
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { agendamentoApi, horarioApi, servicoApi, usuarioApi } from "@/lib/api";
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
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Barbeiro", "Serviço", "Data", "Cliente", "Confirmar"];

const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

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
      return new Date(hoje.getTime() + 30 * 86400000);
  }
};

export default function AgendarParaCliente() {
  const { isPerfil } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data
  const [barbeiros, setBarbeiros] = useState<BarbeirosDetalhesResponse[]>([]);
  const [servicos, setServicos] = useState<ServicoDetalhesResponse[]>([]);

  // Selections
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<BarbeirosDetalhesResponse | null>(null);
  const [selectedServico, setSelectedServico] = useState<ServicoDetalhesResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTimeEtapa2, setSelectedTimeEtapa2] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Multi-slot state
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);
  const [barbeariaAberta, setBarbeariaAberta] = useState(true);
  const [horariosEtapa2, setHorariosEtapa2] = useState<string[]>([]);
  const [loadingEtapa2, setLoadingEtapa2] = useState(false);

  const isBarbeiro = isPerfil("barbeiro") || isPerfil("administrador") || isPerfil("barbeiroadministrador");

  useEffect(() => {
    if (!isBarbeiro) {
      setLocation("/");
      return;
    }
    usuarioApi.listarBarbeiros().then((r) => {
      setBarbeiros(Array.isArray(r.data) ? r.data : []);
    }).catch(() => {});
    servicoApi.listar(1, 50).then((r) => setServicos(r.data.items || [])).catch(() => {});
  }, [isBarbeiro, setLocation]);

  const isMultiSlotService = selectedServico
    ? selectedServico.requerDuasEtapas || selectedServico.tempoEstimado === "01:20:00"
    : false;

  const isDuasEtapas = selectedServico?.requerDuasEtapas || false;

  useEffect(() => {
    if (selectedBarbeiro && selectedDate) {
      const dateStr = toLocalDateStr(selectedDate);
      setSelectedTimeEtapa2(null);
      setHorariosEtapa2([]);

      if (selectedServico && isMultiSlotService) {
        horarioApi
          .disponiveisPorServico(selectedBarbeiro.id, dateStr, selectedServico.id)
          .then((r) => {
            setBarbeariaAberta(r.data.aberto);
            setHorariosDisponiveis(r.data.horariosDisponiveis || []);
            setHorariosOcupados(r.data.horariosOcupados || []);
          })
          .catch(() => {
            horarioApi.disponiveis(selectedBarbeiro.id, dateStr).then((r) => {
              setBarbeariaAberta(r.data.aberto);
              setHorariosDisponiveis(r.data.horariosDisponiveis || []);
              setHorariosOcupados(r.data.horariosOcupados || []);
            }).catch(() => {});
          });
      } else {
        horarioApi
          .disponiveis(selectedBarbeiro.id, dateStr)
          .then((r) => {
            setBarbeariaAberta(r.data.aberto);
            setHorariosDisponiveis(r.data.horariosDisponiveis || []);
            setHorariosOcupados(r.data.horariosOcupados || []);
          })
          .catch(() => {
            setHorariosDisponiveis([]);
            setHorariosOcupados([]);
          });
      }
    }
  }, [selectedBarbeiro, selectedDate, selectedServico, isMultiSlotService]);

  useEffect(() => {
    if (isDuasEtapas && selectedBarbeiro && selectedDate && selectedTime && selectedServico) {
      setLoadingEtapa2(true);
      setSelectedTimeEtapa2(null);
      const dateStr = toLocalDateStr(selectedDate);
      horarioApi
        .disponiveisEtapa2(selectedBarbeiro.id, dateStr, selectedServico.id, selectedTime)
        .then((r) => setHorariosEtapa2(r.data.horariosDisponiveisEtapa2 || []))
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

  const handleConfirm = async () => {
    if (!selectedBarbeiro || !selectedServico || !selectedDate || !selectedTime) return;
    if (isDuasEtapas && !selectedTimeEtapa2) {
      toast.error("Selecione o horário da segunda etapa");
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
      await agendamentoApi.criarParaCliente({
        barbeiroId: selectedBarbeiro.id,
        servicoId: selectedServico.id,
        dtAgendamento: dtStr,
        dtAgendamentoEtapa2: dtEtapa2Str,
        numero: numero.replace(/\D/g, ""),
        nome,
      });
      toast.success("Agendamento criado com sucesso!");
      setLocation("/agendamentos");
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

  const canGoNext = () => {
    if (step === 0) return !!selectedBarbeiro;
    if (step === 1) return !!selectedServico;
    if (step === 2) {
      if (!selectedDate || !selectedTime) return false;
      if (isDuasEtapas && !selectedTimeEtapa2) return false;
      return true;
    }
    if (step === 3) return !!nome && numero.replace(/\D/g, "").length === 11;
    return false;
  };

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="container max-w-sm mx-auto py-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-primary" />
        <h1 className="font-display text-lg font-bold">Agendar para Cliente</h1>
      </div>

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
          disabled={step === 0}
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
              <p className="text-sm text-muted-foreground mb-4">Quem vai atender o cliente?</p>
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
                    </div>
                    {selectedBarbeiro?.id === b.id && (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Serviço */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Escolha o Serviço</h2>
              <p className="text-sm text-muted-foreground mb-4">O que o cliente deseja?</p>
              <div className="space-y-3">
                {[...servicos].sort((a, b) => a.nome.localeCompare(b.nome)).map((s) => (
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
              <p className="text-sm text-muted-foreground mb-4">Quando será o atendimento?</p>

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
                  <span className="text-sm font-medium capitalize">
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
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth.totalDays }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(daysInMonth.year, daysInMonth.month, day);
                    date.setHours(0, 0, 0, 0);
                    const isPast = date < today;
                    const maxDate = selectedBarbeiro ? getMaxDate(selectedBarbeiro.agenda) : null;
                    const isBeyondMax = maxDate ? date > maxDate : false;
                    const isDisabled = isPast || isBeyondMax;
                    const isSelected = selectedDate && toLocalDateStr(selectedDate) === toLocalDateStr(date);
                    const isToday = toLocalDateStr(date) === toLocalDateStr(today);

                    return (
                      <button
                        key={day}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime(null);
                          setSelectedTimeEtapa2(null);
                        }}
                        className={`h-8 w-full rounded text-xs font-medium transition-all ${
                          isSelected
                            ? "gold-gradient text-background"
                            : isToday
                            ? "border border-primary text-primary"
                            : isDisabled
                            ? "text-muted-foreground/30"
                            : "hover:bg-primary/10 text-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div className="space-y-3">
                  {!barbeariaAberta ? (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Barbearia fechada neste dia
                    </p>
                  ) : horariosDisponiveis.length > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {isDuasEtapas ? "Horário da 1ª etapa:" : "Horários disponíveis:"}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {horariosDisponiveis.map((h) => (
                          <button
                            key={h}
                            onClick={() => {
                              setSelectedTime(h);
                              setSelectedTimeEtapa2(null);
                            }}
                            className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                              selectedTime === h
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Nenhum horário disponível
                    </p>
                  )}

                  {/* Etapa 2 slots */}
                  {isDuasEtapas && selectedTime && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Horário da 2ª etapa:</p>
                      {loadingEtapa2 ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      ) : horariosEtapa2.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {horariosEtapa2.map((h) => (
                            <button
                              key={h}
                              onClick={() => setSelectedTimeEtapa2(h)}
                              className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                                selectedTimeEtapa2 === h
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/30"
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground text-xs py-2">
                          Nenhum horário disponível para a 2ª etapa
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Dados do Cliente */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-1">Dados do Cliente</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Informe os dados do cliente
              </p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs">Nome do cliente</Label>
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    className="h-10 bg-input border-border text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Telefone</Label>
                  <Input
                    value={formatNumero(numero)}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="h-10 bg-input border-border text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Não é necessário código de confirmação para agendamentos feitos pelo barbeiro.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmar */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-xl font-bold mb-4">Confirmar Agendamento</h2>
              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Barbeiro</p>
                    <p className="text-sm font-medium">{selectedBarbeiro?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Scissors className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Serviço</p>
                    <p className="text-sm font-medium">
                      {selectedServico?.nome} — R$ {selectedServico?.valor.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data e Hora</p>
                    <p className="text-sm font-medium">
                      {selectedDate?.toLocaleDateString("pt-BR")} às {selectedTime}
                      {isDuasEtapas && selectedTimeEtapa2 && ` / 2ª etapa: ${selectedTimeEtapa2}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                    <p className="text-sm font-medium">{nome}</p>
                    <p className="text-xs text-muted-foreground">{formatNumero(numero)}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full mt-4 h-12 gold-gradient text-background font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Confirmar Agendamento"
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="mt-6">
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canGoNext()}
            className="w-full h-12 gold-gradient text-background font-semibold disabled:opacity-50"
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
