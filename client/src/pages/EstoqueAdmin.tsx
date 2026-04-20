import { useEffect, useState, useCallback } from "react";
import { produtoApi } from "@/lib/api";
import type {
  ProdutoDetalhesResponse,
  MovimentacaoEstoqueResponse,
  ProdutoCriarRequest,
  MovimentacaoCriarRequest,
} from "@/lib/types";
import { TipoMovimentacao } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  History,
  ArrowUpCircle,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function EstoqueAdmin() {
  const [produtos, setProdutos] = useState<ProdutoDetalhesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState<ProdutoDetalhesResponse | null>(null);
  const [modalMovimentacao, setModalMovimentacao] = useState<ProdutoDetalhesResponse | null>(null);
  const [modalHistorico, setModalHistorico] = useState<ProdutoDetalhesResponse | null>(null);
  const [historico, setHistorico] = useState<MovimentacaoEstoqueResponse[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);

  const estoqueBaixoCount = produtos.filter((p) => p.estoqueBaixo).length;

  const carregar = useCallback(() => {
    setLoading(true);
    produtoApi
      .listar()
      .then((r) => setProdutos(r.data))
      .catch(() => toast.error("Erro ao carregar produtos"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleExcluir = async (id: number) => {
    setDeletandoId(id);
    try {
      await produtoApi.excluir(id);
      toast.success("Produto removido");
      carregar();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao remover produto");
    } finally {
      setDeletandoId(null);
    }
  };

  const abrirHistorico = async (produto: ProdutoDetalhesResponse) => {
    setModalHistorico(produto);
    setLoadingHistorico(true);
    try {
      const r = await produtoApi.obterHistorico(produto.id);
      setHistorico(r.data);
    } catch {
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const formatarData = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="container max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Estoque de Produtos
        </h1>
        <Button
          onClick={() => setModalCriar(true)}
          className="h-9 gold-gradient text-background font-semibold text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Novo Produto
        </Button>
      </div>

      {estoqueBaixoCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg p-3 mb-4 text-sm"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {estoqueBaixoCount} produto{estoqueBaixoCount > 1 ? "s" : ""} com estoque baixo ou zerado!
          </span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-[1fr_80px_70px_70px_90px_auto] gap-2 px-4 py-2 text-xs text-muted-foreground border-b border-border bg-accent/30">
            <span>Produto</span>
            <span className="text-right">Preço</span>
            <span className="text-center">Estoque</span>
            <span className="text-center">Mínimo</span>
            <span className="text-center">Status</span>
            <span className="text-center">Ações</span>
          </div>

          {produtos.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[1fr_80px_70px_70px_90px_auto] gap-2 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-accent/10 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold">{p.nome}</p>
                {p.descricao && (
                  <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{p.descricao}</p>
                )}
              </div>
              <span className="text-sm text-right">R$ {p.preco.toFixed(2)}</span>
              <span
                className={`text-sm font-bold text-center ${
                  p.quantidadeEstoque <= 0
                    ? "text-red-400"
                    : p.estoqueBaixo
                    ? "text-amber-400"
                    : "text-foreground"
                }`}
              >
                {p.quantidadeEstoque}
              </span>
              <span className="text-sm text-center text-muted-foreground">{p.quantidadeMinima}</span>
              <div className="flex justify-center">
                {p.estoqueBaixo ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Baixo
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    Ativo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setModalMovimentacao(p)}
                  title="Registrar movimentação"
                  className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => abrirHistorico(p)}
                  title="Ver histórico"
                  className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModalEditar(p)}
                  title="Editar"
                  className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExcluir(p.id)}
                  disabled={deletandoId === p.id}
                  title="Remover"
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50"
                >
                  {deletandoId === p.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Criar */}
      {modalCriar && (
        <ModalProduto
          onClose={() => setModalCriar(false)}
          onSalvo={() => { setModalCriar(false); carregar(); }}
        />
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <ModalProduto
          produto={modalEditar}
          onClose={() => setModalEditar(null)}
          onSalvo={() => { setModalEditar(null); carregar(); }}
        />
      )}

      {/* Modal Movimentação */}
      {modalMovimentacao && (
        <ModalMovimentacao
          produto={modalMovimentacao}
          onClose={() => setModalMovimentacao(null)}
          onSalvo={() => { setModalMovimentacao(null); carregar(); }}
        />
      )}

      {/* Modal Histórico */}
      <Dialog open={!!modalHistorico} onOpenChange={() => setModalHistorico(null)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Histórico — {modalHistorico?.nome}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Movimentações de estoque registradas
            </DialogDescription>
          </DialogHeader>
          {loadingHistorico ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : historico.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma movimentação.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {historico.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-accent/30 border border-border"
                >
                  {m.tipo === "Entrada" ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          m.tipo === "Entrada" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {m.tipo === "Entrada" ? "+" : "-"}{m.quantidade} un.
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatarData(m.dataMovimentacao)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.motivo}</p>
                    {m.agendamentoId && (
                      <p className="text-[10px] text-primary/70">Agendamento #{m.agendamentoId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModalProduto({
  produto,
  onClose,
  onSalvo,
}: {
  produto?: ProdutoDetalhesResponse;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [descricao, setDescricao] = useState(produto?.descricao ?? "");
  const [preco, setPreco] = useState(produto?.preco?.toString() ?? "");
  const [quantidadeInicial, setQuantidadeInicial] = useState("0");
  const [quantidadeMinima, setQuantidadeMinima] = useState(produto?.quantidadeMinima?.toString() ?? "0");
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!nome || !preco) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    setLoading(true);
    try {
      if (produto) {
        await produtoApi.editar(produto.id, {
          nome,
          descricao: descricao || undefined,
          preco: parseFloat(preco),
          quantidadeMinima: parseInt(quantidadeMinima) || 0,
        });
        toast.success("Produto atualizado");
      } else {
        const req: ProdutoCriarRequest = {
          nome,
          descricao: descricao || undefined,
          preco: parseFloat(preco),
          quantidadeInicial: parseInt(quantidadeInicial) || 0,
          quantidadeMinima: parseInt(quantidadeMinima) || 0,
        };
        await produtoApi.criar(req);
        toast.success("Produto criado");
      }
      onSalvo();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">
            {produto ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nome *</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Gel Fixador 300g"
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição breve"
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Qtd. Mínima</label>
              <input
                type="number"
                min="0"
                value={quantidadeMinima}
                onChange={(e) => setQuantidadeMinima(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          {!produto && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Quantidade Inicial</label>
              <input
                type="number"
                min="0"
                value={quantidadeInicial}
                onChange={(e) => setQuantidadeInicial(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSalvar}
              disabled={loading}
              className="flex-1 h-10 gold-gradient text-background font-semibold text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
            <Button variant="outline" onClick={onClose} className="h-10 text-sm border-border">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModalMovimentacao({
  produto,
  onClose,
  onSalvo,
}: {
  produto: ProdutoDetalhesResponse;
  onClose: () => void;
  onSalvo: () => void;
}) {
  const [tipo, setTipo] = useState<TipoMovimentacao>(TipoMovimentacao.Entrada);
  const [quantidade, setQuantidade] = useState("1");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (!motivo || !quantidade) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      const req: MovimentacaoCriarRequest = {
        tipo,
        quantidade: parseInt(quantidade),
        motivo,
      };
      await produtoApi.registrarMovimentacao(produto.id, req);
      toast.success("Movimentação registrada");
      onSalvo();
    } catch (err: any) {
      toast.error(err.response?.data || "Erro ao registrar movimentação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">
            Movimentação — {produto.nome}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Estoque atual: <span className="font-semibold text-foreground">{produto.quantidadeEstoque} un.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTipo(TipoMovimentacao.Entrada)}
                className={`h-10 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  tipo === TipoMovimentacao.Entrada
                    ? "border-green-500 bg-green-500/10 text-green-400"
                    : "border-border text-muted-foreground hover:border-green-500/50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Entrada
              </button>
              <button
                onClick={() => setTipo(TipoMovimentacao.Saida)}
                className={`h-10 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  tipo === TipoMovimentacao.Saida
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-border text-muted-foreground hover:border-red-500/50"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Saída
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Motivo *</label>
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: Compra de fornecedor, uso interno..."
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSalvar}
              disabled={loading}
              className="flex-1 h-10 gold-gradient text-background font-semibold text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar"}
            </Button>
            <Button variant="outline" onClick={onClose} className="h-10 text-sm border-border">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
