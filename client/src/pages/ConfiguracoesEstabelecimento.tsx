/*
 * Configurações do Estabelecimento
 * Exclusivo para barbeiroAdministrador
 * Seções: Informações (WhatsApp + endereço) e Horário de Funcionamento
 */
import { useEffect, useState } from "react";
import { Settings, Clock, Phone, MapPin, Loader2, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { configuracaoBarbeariaApi, configuracaoHorarioApi } from "@/lib/api";
import type {
  ConfiguracaoBarbeariaResponse,
  ConfiguracaoHorarioResponse,
} from "@/lib/types";

// ─── Masks ───────────────────────────────────────────────────────────────────

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function unmaskedPhone(value: string): string {
  return value.replace(/\D/g, "");
}

// ─── ViaCEP ──────────────────────────────────────────────────────────────────

interface ViaCepResponse {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

async function fetchViaCep(cep: string): Promise<ViaCepResponse> {
  const digits = cep.replace(/\D/g, "");
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) throw new Error("CEP não encontrado");
  const data: ViaCepResponse = await res.json();
  if (data.erro) throw new Error("CEP não encontrado");
  return data;
}

// ─── Horário helpers ──────────────────────────────────────────────────────────

type DayState = ConfiguracaoHorarioResponse & { saving: boolean };

const DEFAULT_DAYS: ConfiguracaoHorarioResponse[] = [
  { id: 0, diaSemana: 1, nomeDia: "Segunda-feira",  aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
  { id: 0, diaSemana: 2, nomeDia: "Terça-feira",    aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
  { id: 0, diaSemana: 3, nomeDia: "Quarta-feira",   aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
  { id: 0, diaSemana: 4, nomeDia: "Quinta-feira",   aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
  { id: 0, diaSemana: 5, nomeDia: "Sexta-feira",    aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
  { id: 0, diaSemana: 6, nomeDia: "Sábado",         aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
  { id: 0, diaSemana: 0, nomeDia: "Domingo",        aberto: false, horaInicio: "08:00", almocoInicio: "12:00", almocoFim: "13:00", horaFim: "18:00", intervaloMinutos: 30 },
];

const NAO_CADASTRADO = "Informação não cadastrada";

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfiguracoesEstabelecimento() {
  // --- Barbearia state ---
  const [barbearia, setBarbearia] = useState<ConfiguracaoBarbeariaResponse | null>(null);
  const [loadingBarbearia, setLoadingBarbearia] = useState(true);
  const [savingBarbearia, setSavingBarbearia] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [form, setForm] = useState({
    numeroCelular: "",
    logradouro: "",   // rua sem número (auto-preenchido pelo ViaCEP)
    numero: "",       // número do imóvel (digitado pelo usuário)
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  // --- Horário state ---
  const [dias, setDias] = useState<DayState[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  // --- Load data ---
  useEffect(() => {
    configuracaoBarbeariaApi
      .obter()
      .then((r) => {
        setBarbearia(r.data);

        // Separa rua + número: "R. Laérte Fenelon, 670" → logradouro + numero
        const ruaCompleta = r.data.rua ?? "";
        const lastComma = ruaCompleta.lastIndexOf(",");
        const logradouro =
          lastComma !== -1 ? ruaCompleta.slice(0, lastComma).trim() : ruaCompleta;
        const numero =
          lastComma !== -1 ? ruaCompleta.slice(lastComma + 1).trim() : "";

        setForm({
          numeroCelular: maskPhone(r.data.numeroCelular ?? ""),
          logradouro,
          numero,
          bairro: r.data.bairro ?? "",
          cidade: r.data.cidade ?? "",
          estado: r.data.estado ?? "",
          cep: maskCep(r.data.cep ?? ""),
        });
      })
      .catch(() => {
        // API retornou exception: preenche campos com mensagem padrão
        setForm({
          numeroCelular: NAO_CADASTRADO,
          logradouro: NAO_CADASTRADO,
          numero: "",
          bairro: NAO_CADASTRADO,
          cidade: NAO_CADASTRADO,
          estado: NAO_CADASTRADO,
          cep: NAO_CADASTRADO,
        });
      })
      .finally(() => setLoadingBarbearia(false));

    configuracaoHorarioApi
      .listar()
      .then((r) => {
        const source = r.data.length > 0 ? r.data : DEFAULT_DAYS;
        const order = [1, 2, 3, 4, 5, 6, 0];
        const sorted = order
          .map((d) => source.find((h) => h.diaSemana === d))
          .filter(Boolean) as ConfiguracaoHorarioResponse[];
        setDias(sorted.map((d) => ({ ...d, saving: false })));
      })
      .catch(() => {
        setDias(DEFAULT_DAYS.map((d) => ({ ...d, saving: false })));
        toast.error("Erro ao carregar horários — exibindo configuração padrão");
      })
      .finally(() => setLoadingHorario(false));
  }, []);

  // --- CEP auto-complete ---
  const handleBuscarCep = async () => {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      toast.error("Digite um CEP válido com 8 dígitos");
      return;
    }
    setBuscandoCep(true);
    try {
      const data = await fetchViaCep(digits);
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      }));
    } catch {
      toast.error("CEP não encontrado");
    } finally {
      setBuscandoCep(false);
    }
  };

  // Dispara busca automaticamente quando CEP atingir 8 dígitos
  const handleCepChange = async (value: string) => {
    const masked = maskCep(value);
    setForm((f) => ({ ...f, cep: masked }));
    if (masked.replace(/\D/g, "").length === 8) {
      setBuscandoCep(true);
      try {
        const data = await fetchViaCep(masked);
        setForm((f) => ({
          ...f,
          cep: masked,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }));
      } catch {
        toast.error("CEP não encontrado");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // --- Barbearia save ---
  const handleSalvarBarbearia = async () => {
    const ruaCompleta = form.numero
      ? `${form.logradouro}, ${form.numero}`
      : form.logradouro;

    const payload = {
      numeroCelular: unmaskedPhone(form.numeroCelular),
      rua: ruaCompleta,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
      cep: form.cep.replace(/\D/g, ""),
    };

    setSavingBarbearia(true);
    try {
      if (barbearia?.id) {
        const r = await configuracaoBarbeariaApi.atualizar(barbearia.id, payload);
        setBarbearia(r.data);
      } else {
        const r = await configuracaoBarbeariaApi.criar(payload);
        setBarbearia(r.data);
      }
      toast.success("Informações salvas com sucesso");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao salvar");
    } finally {
      setSavingBarbearia(false);
    }
  };

  // --- Horário handlers ---
  const updateDia = (diaSemana: number, changes: Partial<DayState>) => {
    setDias((prev) =>
      prev.map((d) => (d.diaSemana === diaSemana ? { ...d, ...changes } : d))
    );
  };

  const handleSalvarDia = async (dia: DayState) => {
    updateDia(dia.diaSemana, { saving: true });
    try {
      await configuracaoHorarioApi.salvar({
        diaSemana: dia.diaSemana,
        aberto: dia.aberto,
        horaInicio: dia.horaInicio,
        almocoInicio: dia.almocoInicio,
        almocoFim: dia.almocoFim,
        horaFim: dia.horaFim,
        intervaloMinutos: dia.intervaloMinutos,
      });
      toast.success(`${dia.nomeDia} salvo com sucesso`);
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao salvar");
    } finally {
      updateDia(dia.diaSemana, { saving: false });
    }
  };

  const handleSalvarTodos = async () => {
    setSavingAll(true);
    try {
      await configuracaoHorarioApi.salvarTodos(
        dias.map((d) => ({
          diaSemana: d.diaSemana,
          aberto: d.aberto,
          horaInicio: d.horaInicio,
          almocoInicio: d.almocoInicio,
          almocoFim: d.almocoFim,
          horaFim: d.horaFim,
          intervaloMinutos: d.intervaloMinutos,
        }))
      );
      toast.success("Todos os horários salvos com sucesso");
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao salvar");
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="container py-6 max-w-lg space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-primary" />
        <div>
          <h1 className="font-display text-xl font-bold">Configurações</h1>
          <p className="text-xs text-muted-foreground">Informações e horários do estabelecimento</p>
        </div>
      </div>

      {/* ── Seção: Informações do Estabelecimento ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Informações do Estabelecimento</h2>
        </div>

        {loadingBarbearia ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            {/* WhatsApp */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">WhatsApp</Label>
              <Input
                type="tel"
                placeholder="(41) 99999-9999"
                value={form.numeroCelular}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numeroCelular: maskPhone(e.target.value) }))
                }
                onFocus={(e) => {
                  if (e.target.value === NAO_CADASTRADO)
                    setForm((f) => ({ ...f, numeroCelular: "" }));
                }}
                className="h-9 bg-input border-border text-sm"
              />
            </div>

            {/* Endereço */}
            <div className="flex items-center gap-2 pt-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Endereço</span>
            </div>

            <div className="space-y-3">
              {/* CEP */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onFocus={(e) => {
                      if (e.target.value === NAO_CADASTRADO)
                        setForm((f) => ({ ...f, cep: "" }));
                    }}
                    className="h-9 bg-input border-border text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={handleBuscarCep}
                    disabled={buscandoCep}
                  >
                    {buscandoCep ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Logradouro + Número */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Rua</Label>
                  <Input
                    placeholder="Auto-preenchido pelo CEP"
                    value={form.logradouro}
                    onChange={(e) => setForm((f) => ({ ...f, logradouro: e.target.value }))}
                    onFocus={(e) => {
                      if (e.target.value === NAO_CADASTRADO)
                        setForm((f) => ({ ...f, logradouro: "" }));
                    }}
                    className="h-9 bg-input border-border text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Número</Label>
                  <Input
                    placeholder="Ex: 670"
                    value={form.numero}
                    onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                    className="h-9 bg-input border-border text-sm"
                  />
                </div>
              </div>

              {/* Bairro + Cidade */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bairro</Label>
                  <Input
                    placeholder="Auto-preenchido"
                    value={form.bairro}
                    onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                    onFocus={(e) => {
                      if (e.target.value === NAO_CADASTRADO)
                        setForm((f) => ({ ...f, bairro: "" }));
                    }}
                    className="h-9 bg-input border-border text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Cidade</Label>
                  <Input
                    placeholder="Auto-preenchido"
                    value={form.cidade}
                    onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                    onFocus={(e) => {
                      if (e.target.value === NAO_CADASTRADO)
                        setForm((f) => ({ ...f, cidade: "" }));
                    }}
                    className="h-9 bg-input border-border text-sm"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Estado (UF)</Label>
                <Input
                  placeholder="Auto-preenchido"
                  value={form.estado}
                  onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                  onFocus={(e) => {
                    if (e.target.value === NAO_CADASTRADO)
                      setForm((f) => ({ ...f, estado: "" }));
                  }}
                  className="h-9 bg-input border-border text-sm"
                />
              </div>
            </div>

            <Button
              className="w-full gold-gradient text-background font-semibold"
              onClick={handleSalvarBarbearia}
              disabled={savingBarbearia}
            >
              {savingBarbearia ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Informações
            </Button>
          </div>
        )}
      </section>

      {/* ── Seção: Horário de Funcionamento ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Horário de Funcionamento</h2>
          </div>
          {!loadingHorario && dias.length > 0 && (
            <Button
              size="sm"
              className="gold-gradient text-background font-semibold"
              onClick={handleSalvarTodos}
              disabled={savingAll}
            >
              {savingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="ml-1.5">Salvar Tudo</span>
            </Button>
          )}
        </div>

        {loadingHorario ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {dias.map((dia) => (
              <div
                key={dia.diaSemana}
                className="bg-card border border-border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{dia.nomeDia}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {dia.aberto ? "Aberto" : "Fechado"}
                    </span>
                    <Switch
                      checked={dia.aberto}
                      onCheckedChange={(checked) =>
                        updateDia(dia.diaSemana, { aberto: checked })
                      }
                    />
                  </div>
                </div>

                {dia.aberto && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Abertura</Label>
                        <Input
                          type="time"
                          value={dia.horaInicio?.substring(0, 5) ?? ""}
                          onChange={(e) =>
                            updateDia(dia.diaSemana, { horaInicio: e.target.value })
                          }
                          className="h-9 bg-input border-border text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Fechamento</Label>
                        <Input
                          type="time"
                          value={dia.horaFim?.substring(0, 5) ?? ""}
                          onChange={(e) =>
                            updateDia(dia.diaSemana, { horaFim: e.target.value })
                          }
                          className="h-9 bg-input border-border text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Início do almoço</Label>
                        <Input
                          type="time"
                          value={dia.almocoInicio?.substring(0, 5) ?? ""}
                          onChange={(e) =>
                            updateDia(dia.diaSemana, { almocoInicio: e.target.value })
                          }
                          className="h-9 bg-input border-border text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Fim do almoço</Label>
                        <Input
                          type="time"
                          value={dia.almocoFim?.substring(0, 5) ?? ""}
                          onChange={(e) =>
                            updateDia(dia.diaSemana, { almocoFim: e.target.value })
                          }
                          className="h-9 bg-input border-border text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Intervalo entre agendamentos (min)
                      </Label>
                      <Input
                        type="number"
                        min={5}
                        step={5}
                        value={dia.intervaloMinutos}
                        onChange={(e) =>
                          updateDia(dia.diaSemana, { intervaloMinutos: Number(e.target.value) })
                        }
                        className="h-9 bg-input border-border text-sm"
                      />
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10 text-xs"
                  onClick={() => handleSalvarDia(dia)}
                  disabled={dia.saving}
                >
                  {dia.saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Salvar {dia.nomeDia}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
