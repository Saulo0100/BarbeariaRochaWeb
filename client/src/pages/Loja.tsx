import { useEffect, useState } from "react";
import { produtoApi } from "@/lib/api";
import type { ProdutoDetalhesResponse } from "@/lib/types";
import { ShoppingBag, Loader2, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function Loja() {
  const [produtos, setProdutos] = useState<ProdutoDetalhesResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    produtoApi
      .listarPublico()
      .then((r) => setProdutos(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container max-w-lg mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2 mb-1">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Produtos
        </h1>
        <p className="text-sm text-muted-foreground">
          Produtos disponíveis para compra
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {produtos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{p.nome}</p>
                  {p.descricao && (
                    <p className="text-xs text-muted-foreground truncate">{p.descricao}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {p.quantidadeEstoque} disponível{p.quantidadeEstoque !== 1 ? "is" : ""}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-bold text-primary">
                  R$ {p.preco.toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
