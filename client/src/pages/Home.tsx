/*
 * Design: Vintage Barbershop — Home / Landing Page
 * Hero com imagem da barbearia, CTA de agendamento, lista de serviços
 */
import { Link, useLocation } from "wouter";
import { Calendar, Scissors, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { servicoApi, usuarioApi } from "@/lib/api";
import type { ServicoDetalhesResponse, BarbeirosDetalhesResponse } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663043062505/CjBWWVpcRtjqZnbfjVbFp8/hero-barber-jFG7MXqmkn5oqxDjr2BCDy.webp";
const TOOLS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663043062505/CjBWWVpcRtjqZnbfjVbFp8/barber-tools-egZMLV4xZqTxnUdNH5xcDH.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

export default function Home() {
  const { isAuthenticated, isPerfil } = useAuth();
  const [, setLocation] = useLocation();
  const [servicos, setServicos] = useState<ServicoDetalhesResponse[]>([]);
  const [barbeiros, setBarbeiros] = useState<BarbeirosDetalhesResponse[]>([]);

  useEffect(() => {
    servicoApi.listar(1, 6).then((r) => setServicos(r.data.items || [])).catch(() => {});
    usuarioApi.listarBarbeiros().then((r) => {
      const data = r.data;
      setBarbeiros(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  // Redirect barbeiro/admin to their dashboards
  useEffect(() => {
    if (isAuthenticated && isPerfil("barbeiro")) {
      setLocation("/corte-atual");
    } else if (isAuthenticated && (isPerfil("administrador") || isPerfil("barbeiroadministrador"))) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isPerfil, setLocation]);

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

        <div className="relative h-full container flex flex-col justify-end pb-10">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={fadeUp} custom={0}>
              <div className="barber-stripe h-1 w-16 rounded-full mb-4" />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl sm:text-5xl font-bold leading-tight"
            >
              <span className="gold-text">Barbearia</span>
              <br />
              Rocha
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-muted-foreground text-base max-w-xs"
            >
              Tradição e estilo em cada corte. Agende seu horário de forma rápida e prática.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex gap-3 pt-2">
              <Link href="/agendar">
                <Button className="gold-gradient text-background font-semibold px-6 h-12 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Corte
                </Button>
              </Link>
              <Link href="/servicos">
                <Button variant="outline" className="border-primary/30 text-primary h-12 text-sm hover:bg-primary/10">
                  Ver Serviços
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container py-10">
        <div className="flex items-center gap-3 mb-6">
          <Scissors className="w-5 h-5 text-primary" />
          <h2 className="font-display text-2xl font-bold">Nossos Serviços</h2>
        </div>

        {servicos.length > 0 ? (
          <div className="grid gap-3">
            {servicos.map((servico, i) => (
              <motion.div
                key={servico.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{servico.nome}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{servico.descricao}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {servico.tempoEstimado}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {servico.categoria}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="font-display text-lg font-bold text-primary">
                    R$ {servico.valor.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>Configure a URL da API nas configurações para ver os serviços disponíveis.</p>
          </div>
        )}
      </section>

      {/* Barbers Section */}
      {barbeiros.length > 0 && (
        <section className="container py-10">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="font-display text-2xl font-bold">Nossos Barbeiros</h2>
          </div>

          <div className="grid gap-3">
            {barbeiros.map((barbeiro) => (
              <div
                key={barbeiro.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-background font-display font-bold text-lg shrink-0">
                  {barbeiro.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{barbeiro.nome}</h3>
                  {barbeiro.descricao && (
                    <p className="text-xs text-muted-foreground mt-0.5">{barbeiro.descricao}</p>
                  )}
                  <span className="text-xs text-primary mt-1 inline-block">
                    Agenda: {barbeiro.agenda}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About / CTA Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${TOOLS_IMG})` }}
        />
        <div className="relative container py-12 text-center">
          <h2 className="font-display text-2xl font-bold mb-3">
            Agende Agora
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Escolha seu barbeiro, selecione o serviço e horário. Você pode agendar com ou sem cadastro.
          </p>
          <Link href="/agendar">
            <Button className="gold-gradient text-background font-semibold px-8 h-12">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Meu Corte
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
