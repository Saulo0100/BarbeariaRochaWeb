/*
 * Design: Vintage Barbershop — Lista de Serviços
 */
import { useEffect, useState } from "react";
import { servicoApi } from "@/lib/api";
import type { ServicoDetalhesResponse } from "@/lib/types";
import { Clock, Scissors, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const TOOLS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663043062505/CjBWWVpcRtjqZnbfjVbFp8/barber-tools-egZMLV4xZqTxnUdNH5xcDH.webp";

export default function Servicos() {
  const [servicos, setServicos] = useState<ServicoDetalhesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todos");

  useEffect(() => {
    servicoApi
      .listar(1, 50)
      .then((r) => setServicos(r.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...servicos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const categorias = ["Todos", ...Array.from(new Set(sorted.map((s) => s.categoria)))];
  const filtered =
    filtroCategoria === "Todos"
      ? sorted
      : sorted.filter((s) => s.categoria === filtroCategoria);

  return (
    <div>
      {/* Header */}
      <div className="relative h-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${TOOLS_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        <div className="relative container h-full flex items-end pb-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Scissors className="w-5 h-5 text-primary" />
              Serviços
            </h1>
            <p className="text-sm text-muted-foreground">Conheça nossos serviços e valores</p>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtroCategoria === cat
                  ? "gold-gradient text-background"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((servico, i) => (
              <motion.div
                key={servico.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{servico.nome}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{servico.descricao}</p>
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
                  <span className="font-display text-xl font-bold text-primary ml-4">
                    R$ {servico.valor.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum serviço encontrado. Configure a URL da API nas configurações.
          </div>
        )}
      </div>
    </div>
  );
}
