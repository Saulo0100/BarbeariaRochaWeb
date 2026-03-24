/*
 * Design: Vintage Barbershop — Footer
 */
import { Scissors, MapPin, Phone, Clock, ExternalLink, MessageCircle } from "lucide-react";
import { appConfig } from "@/config";

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
            {appConfig.nome}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-xs">Horário de Funcionamento</p>
              <p className="text-xs">Seg: 13:20 - 20:00</p>
              <p className="text-xs">Ter - Sex: 10:00 - 20:00</p>
              <p className="text-xs">Sáb: 09:00 - 17:20</p>
              <p className="text-xs">Dom: Fechado</p>
            </div>
          </div>
          <a
            href="https://wa.me/554198254308"
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
              <p className="text-xs text-primary font-medium">(41) 99825-4308</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Toque para abrir o WhatsApp</p>
            </div>
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=R.+La%C3%A9rte+Fenelon,+670+-+Ip%C3%AA,+S%C3%A3o+Jos%C3%A9+dos+Pinhais+-+PR,+83055-050"
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
              <p className="text-xs">R. Laérte Fenelon, 670 - Ipê</p>
              <p className="text-xs">São José dos Pinhais - PR, 83055-050</p>
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
