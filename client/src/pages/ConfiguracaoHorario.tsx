/*
 * Configuração de Horário de Funcionamento
 * Exclusivo para barbeiroAdministrador
 */
import { useEffect, useState } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { configuracaoHorarioApi } from "@/lib/api";
import type { ConfiguracaoHorarioResponse } from "@/lib/types";

type DayState = ConfiguracaoHorarioResponse & { saving: boolean };

export default function ConfiguracaoHorario() {
  const [dias, setDias] = useState<DayState[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    configuracaoHorarioApi
      .listar()
      .then((r) => {
        // Ordenar: Seg(1)...Sáb(6), Dom(0)
        const order = [1, 2, 3, 4, 5, 6, 0];
        const sorted = order
          .map((d) => r.data.find((h) => h.diaSemana === d))
          .filter(Boolean) as ConfiguracaoHorarioResponse[];
        setDias(sorted.map((d) => ({ ...d, saving: false })));
      })
      .catch(() => toast.error("Erro ao carregar horários"))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="container py-6 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <h1 className="font-display text-xl font-bold">Horário de Funcionamento</h1>
            <p className="text-xs text-muted-foreground">Configure os horários de cada dia da semana</p>
          </div>
        </div>
        {!loading && dias.length > 0 && (
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
            <span className="ml-1.5 hidden sm:inline">Salvar Tudo</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {dias.map((dia) => (
            <div
              key={dia.diaSemana}
              className="bg-card border border-border rounded-lg p-4 space-y-4"
            >
              {/* Day header */}
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

              {/* Time fields */}
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
                    <Label className="text-xs text-muted-foreground">Intervalo entre agendamentos (min)</Label>
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={dia.intervaloMinutos}
                      onChange={(e) =>
                        updateDia(dia.diaSemana, {
                          intervaloMinutos: Number(e.target.value),
                        })
                      }
                      className="h-9 bg-input border-border text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Save button */}
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
    </div>
  );
}
