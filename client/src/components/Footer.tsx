/*
 * Design: Vintage Barbershop — Footer
 */
import { Scissors, MapPin, Clock, ExternalLink, MessageCircle } from "lucide-react";
import { appConfig } from "@/config";
import { useEffect, useState } from "react";
import { configuracaoHorarioApi, configuracaoBarbeariaApi } from "@/lib/api";
import type { ConfiguracaoHorarioResponse, ConfiguracaoBarbeariaResponse } from "@/lib/types";

const SHORT_DAY: Record<string, string> = {
  "Domingo": "Dom",
  "Segunda-feira": "Seg",
  "Terça-feira": "Ter",
  "Quarta-feira": "Qua",
  "Quinta-feira": "Qui",
  "Sexta-feira": "Sex",
  "Sábado": "Sáb",
};

function formatTime(time: string): string {
  return time ? time.substring(0, 5) : "";
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface HorarioGroup {
  label: string;
  aberto: boolean;
  horaInicio: string;
  horaFim: string;
}

function groupHorarios(horarios: ConfiguracaoHorarioResponse[]): HorarioGroup[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const sorted = order
    .map((d) => horarios.find((h) => h.diaSemana === d))
    .filter(Boolean) as ConfiguracaoHorarioResponse[];

  const groups: Array<{ nomes: string[]; aberto: boolean; horaInicio: string; horaFim: string }> = [];

  for (const h of sorted) {
    const key = h.aberto ? `${h.horaInicio}-${h.horaFim}` : "fechado";
    const last = groups[groups.length - 1];
    if (last) {
      const lastKey = last.aberto ? `${last.horaInicio}-${last.horaFim}` : "fechado";
      if (lastKey === key) {
        last.nomes.push(SHORT_DAY[h.nomeDia] ?? h.nomeDia);
        continue;
      }
    }
    groups.push({
      nomes: [SHORT_DAY[h.nomeDia] ?? h.nomeDia],
      aberto: h.aberto,
      horaInicio: h.horaInicio,
      horaFim: h.horaFim,
    });
  }

  return groups.map((g) => ({
    label:
      g.nomes.length === 1
        ? g.nomes[0]
        : `${g.nomes[0]} - ${g.nomes[g.nomes.length - 1]}`,
    aberto: g.aberto,
    horaInicio: g.horaInicio,
    horaFim: g.horaFim,
  }));
}

function buildWhatsAppUrl(numero: string): string {
  const digits = numero.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

function buildMapsUrl(barbearia: ConfiguracaoBarbeariaResponse): string {
  const parts = [barbearia.rua, barbearia.bairro, barbearia.cidade, barbearia.estado, barbearia.cep]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
}

export default function Footer() {
  const [grupos, setGrupos] = useState<HorarioGroup[]>([]);
  const [barbearia, setBarbearia] = useState<ConfiguracaoBarbeariaResponse | null>(null);

  useEffect(() => {
    configuracaoHorarioApi
      .listar()
      .then((r) => setGrupos(groupHorarios(r.data)))
      .catch(() => {});

    configuracaoBarbeariaApi
      .obter()
      .then((r) => setBarbearia(r.data))
      .catch(() => {});
  }, []);

  const whatsappUrl = barbearia?.numeroCelular
    ? buildWhatsAppUrl(barbearia.numeroCelular)
    : "https://wa.me/554198254308";

  const whatsappDisplay = barbearia?.numeroCelular
    ? maskPhone(barbearia.numeroCelular)
    : "Informação não cadastrada";

  const mapsUrl = barbearia
    ? buildMapsUrl(barbearia)
    : "https://www.google.com/maps/search/?api=1&query=R.+La%C3%A9rte+Fenelon,+670+-+Ip%C3%AA,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83055-050";

  const enderecoLinha1 = barbearia?.rua
    ? `${barbearia.rua}${barbearia.bairro ? ` - ${barbearia.bairro}` : ""}`
    : "Informação não cadastrada";

  const enderecoLinha2 = barbearia?.cidade
    ? `${barbearia.cidade}${barbearia.estado ? ` - ${barbearia.estado}` : ""}${barbearia.cep ? `, ${barbearia.cep}` : ""}`
    : "";

  return (
    <footer className="bg-card border-t border-border py-8 mb-16">
      <div className="container max-w-sm mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <Scissors className="w-4 h-4 text-background" />
          </div>
          <span className="font-display text-lg font-bold gold-text">
            {appConfig.nome}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Horário de Funcionamento</p>
              {grupos.length > 0 ? (
                grupos.map((g) => (
                  <p key={g.label} className="text-xs">
                    {g.label}:{" "}
                    {g.aberto
                      ? `${formatTime(g.horaInicio)} - ${formatTime(g.horaFim)}`
                      : "Fechado"}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-xs">Informação não cadastrada</p>
                </>
              )}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-2 -m-2 rounded-lg hover:bg-primary/10 transition-colors group cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground text-xs flex items-center gap-1">
                Contato via WhatsApp
                <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs text-primary font-medium">{whatsappDisplay}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Toque para abrir o WhatsApp</p>
            </div>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-2 -m-2 rounded-lg hover:bg-primary/10 transition-colors group cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground text-xs flex items-center gap-1">
                Localização
                <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs">{enderecoLinha1}</p>
              <p className="text-xs">{enderecoLinha2}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Toque para abrir no Google Maps</p>
            </div>
          </a>
        </div>

        {/* Divider */}
        <div className="barber-stripe h-0.5 rounded-full my-5 opacity-40" />

        {/* Copyright */}
        <p className="text-[10px] text-muted-foreground/60 text-center">
          {appConfig.nome} &copy; {new Date().getFullYear()} — Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
