/*
 * Design: Vintage Barbershop — Footer
 */
import { Scissors, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 mb-16">
      <div className="container max-w-sm mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <Scissors className="w-4 h-4 text-background" />
          </div>
          <span className="font-display text-lg font-bold gold-text">
            Barbearia Rocha
          </span>
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Horário de Funcionamento</p>
              <p className="text-xs">Seg - Sáb: 08:00 - 20:00</p>
              <p className="text-xs">Dom: Fechado</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Contato</p>
              <p className="text-xs">WhatsApp disponível no agendamento</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Localização</p>
              <p className="text-xs">Configure o endereço nas configurações</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="barber-stripe h-0.5 rounded-full my-5 opacity-40" />

        {/* Copyright */}
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Barbearia Rocha &copy; {new Date().getFullYear()} — Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
