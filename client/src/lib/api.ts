import axios from "axios";
import type {
  AgendamentoCriarRequest,
  AgendamentoCompletarRequest,
  AgendamentoEditarRequest,
  AgendamentoDetalheResponse,
  AgendamentoFiltroRequest,
  BarbeirosDetalhesResponse,
  ClienteFrequenteResponse,
  ExcecaoCriarRequest,
  ExcecaoDetalhesResponse,
  ExcecaoFiltroRequest,
  FaturamentoPorMetodoResponse,
  FaturamentoPorPeriodoResponse,
  HorariosDisponiveisResponse,
  HorariosOcupadosResponse,
  LoginRequest,
  EsqueceuSenhaRequest,
  MensalistaCriarRequest,
  MensalistaResponse,
  PaginacaoResultado,
  RelatorioBarbeiroResponse,
  RelatorioFiltroRequest,
  RelatorioGeralResponse,
  ServicoCriarRequest,
  ServicoDetalhesResponse,
  ServicoFiltroRequest,
  ServicoMaisPedidoResponse,
  UsuarioCriarRequest,
  UsuarioDetalhesResponse,
  UsuarioEditarRequest,
  UsuarioFiltroRequest,
  UsuarioListarResponse,
} from "./types";

// A URL base da API deve ser configurada aqui
// O usuário vai precisar ajustar para apontar ao backend real
const API_BASE_URL = localStorage.getItem("apiBaseUrl") || "https://sua-api.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros (inclui tratativa do ExceptionMiddleware da API)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Tratativa de erros do ExceptionMiddleware: { status, message }
    if (error.response?.data && typeof error.response.data === "object" && error.response.data.message) {
      error.response.data = error.response.data.message;
    }

    return Promise.reject(error);
  }
);

export function setApiBaseUrl(url: string) {
  localStorage.setItem("apiBaseUrl", url);
  api.defaults.baseURL = url;
}

export function getApiBaseUrl(): string {
  return api.defaults.baseURL || "";
}

// ===== AUTENTICAÇÃO =====
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<string>("/api/Autenticacao/Login", data),

  esqueceuSenha: (data: EsqueceuSenhaRequest) =>
    api.post("/api/Autenticacao/EsqueceuSenha", data),

  novaSenha: (novaSenha: string) =>
    api.patch(`/api/Autenticacao/NovaSenha?novaSenha=${encodeURIComponent(novaSenha)}`),
};

// ===== TOKEN (Código de Confirmação) =====
export const tokenApi = {
  gerarToken: (numero: string) =>
    api.post("/Token", JSON.stringify(numero), {
      headers: { "Content-Type": "application/json" },
    }),
};

// ===== USUÁRIO =====
export const usuarioApi = {
  criar: (data: UsuarioCriarRequest) =>
    api.post("/api/Usuario", data),

  editar: (id: number, data: UsuarioEditarRequest) =>
    api.put(`/api/Usuario/${id}`, data),

  excluir: (id: number) =>
    api.delete(`/api/Usuario/${id}`),

  obterPorId: (id: number) =>
    api.get<UsuarioDetalhesResponse>(`/api/Usuario/${id}`),

  listar: (pagina = 1, itensPorPagina = 10, filtro?: UsuarioFiltroRequest) =>
    api.get<PaginacaoResultado<UsuarioListarResponse>>("/api/Usuario", {
      params: {
        Pagina: pagina,
        ItensPorPagina: itensPorPagina,
        "Filtro.Nome": filtro?.nome || undefined,
        "Filtro.Perfil": filtro?.perfil || undefined,
      },
    }),

  me: () =>
    api.get<UsuarioDetalhesResponse>("/api/Usuario/me"),

  listarBarbeiros: () =>
    api.get<BarbeirosDetalhesResponse[]>("/Barbeiro/Listar"),
};

// ===== AGENDAMENTO =====
export const agendamentoApi = {
  horariosOcupados: (idBarbeiro: number, data: string) =>
    api.get<HorariosOcupadosResponse[]>("/api/agendamento/HorariosOcupados", {
      params: { IdBarbeiro: idBarbeiro, Data: data },
    }),

  criar: (data: AgendamentoCriarRequest) =>
    api.post("/api/agendamento", data),

  obterPorId: (id: number) =>
    api.get<AgendamentoDetalheResponse>(`/api/agendamento/${id}`),

  obterAtual: () =>
    api.get<AgendamentoDetalheResponse>("/api/agendamento/Atual"),

  editarECompletar: (id: number, data: AgendamentoEditarRequest) =>
    api.put(`/api/agendamento/${id}/EditarEcompletar`, data),

  completar: (id: number, data: AgendamentoCompletarRequest) =>
    api.patch(`/api/agendamento/${id}/Completar`, data),

  cancelar: (id: number) =>
    api.delete(`/api/agendamento/${id}`),

  listar: (pagina = 1, itensPorPagina = 10, filtro?: AgendamentoFiltroRequest) =>
    api.get<PaginacaoResultado<AgendamentoDetalheResponse>>("/api/agendamento", {
      params: {
        Pagina: pagina,
        ItensPorPagina: itensPorPagina,
        "Filtro.BarbeiroId": filtro?.barbeiroId || undefined,
        "Filtro.DtAgendamento": filtro?.dtAgendamento || undefined,
      },
    }),
};

// ===== SERVIÇO =====
export const servicoApi = {
  listar: (pagina = 1, itensPorPagina = 50, filtro?: ServicoFiltroRequest) =>
    api.get<PaginacaoResultado<ServicoDetalhesResponse>>("/api/Servico", {
      params: {
        Pagina: pagina,
        ItensPorPagina: itensPorPagina,
        "Filtro.Nome": filtro?.nome || undefined,
        "Filtro.Categoria": filtro?.categoria || undefined,
      },
    }),

  criar: (data: ServicoCriarRequest) =>
    api.post("/api/Servico", data),

  deletar: (id: number) =>
    api.delete(`/api/Servico/${id}`),
};

// ===== EXCEÇÃO =====
export const excecaoApi = {
  criar: (data: ExcecaoCriarRequest) =>
    api.post("/api/Excecao", data),

  deletar: (id: number) =>
    api.delete(`/api/Excecao/${id}`),

  obterPorId: (id: number) =>
    api.get<ExcecaoDetalhesResponse>(`/api/Excecao/${id}`),

  listar: (pagina = 1, itensPorPagina = 10, filtro?: ExcecaoFiltroRequest) =>
    api.get<PaginacaoResultado<ExcecaoDetalhesResponse>>("/api/Excecao/listar", {
      params: {
        Pagina: pagina,
        ItensPorPagina: itensPorPagina,
        "Filtro.DataInicio": filtro?.dataInicio || undefined,
        "Filtro.DataFim": filtro?.dataFim || undefined,
        "Filtro.BarbeiroId": filtro?.barbeiroId || undefined,
      },
    }),

  obterPorBarbeiro: (id: number) =>
    api.get<ExcecaoDetalhesResponse[]>(`/api/Excecao/Barbeiro/${id}`),
};

// ===== MENSALISTA =====
export const mensalistaApi = {
  cadastrar: (data: MensalistaCriarRequest) =>
    api.post("/api/Mensalista", data),

  cancelar: (idMensalista: number) =>
    api.delete("/api/Mensalista", { data: idMensalista }),

  listar: () =>
    api.get<MensalistaResponse[]>("/api/Mensalista"),
};

// ===== RELATÓRIO =====
export const relatorioApi = {
  geral: (filtro?: RelatorioFiltroRequest) =>
    api.get<RelatorioGeralResponse>("/api/relatorio/geral", {
      params: {
        BarbeiroId: filtro?.barbeiroId || undefined,
        DataInicio: filtro?.dataInicio || undefined,
        DataFim: filtro?.dataFim || undefined,
      },
    }),

  servicosMaisPedidos: (filtro?: RelatorioFiltroRequest, top = 10) =>
    api.get<ServicoMaisPedidoResponse[]>("/api/relatorio/servicos-mais-pedidos", {
      params: {
        BarbeiroId: filtro?.barbeiroId || undefined,
        DataInicio: filtro?.dataInicio || undefined,
        DataFim: filtro?.dataFim || undefined,
        top,
      },
    }),

  clientesFrequentes: (filtro?: RelatorioFiltroRequest, top = 10) =>
    api.get<ClienteFrequenteResponse[]>("/api/relatorio/clientes-frequentes", {
      params: {
        BarbeiroId: filtro?.barbeiroId || undefined,
        DataInicio: filtro?.dataInicio || undefined,
        DataFim: filtro?.dataFim || undefined,
        top,
      },
    }),

  faturamentoDiario: (filtro?: RelatorioFiltroRequest) =>
    api.get<FaturamentoPorPeriodoResponse[]>("/api/relatorio/faturamento-diario", {
      params: {
        BarbeiroId: filtro?.barbeiroId || undefined,
        DataInicio: filtro?.dataInicio || undefined,
        DataFim: filtro?.dataFim || undefined,
      },
    }),

  faturamentoPorMetodo: (filtro?: RelatorioFiltroRequest) =>
    api.get<FaturamentoPorMetodoResponse[]>("/api/relatorio/faturamento-por-metodo", {
      params: {
        BarbeiroId: filtro?.barbeiroId || undefined,
        DataInicio: filtro?.dataInicio || undefined,
        DataFim: filtro?.dataFim || undefined,
      },
    }),

  porBarbeiro: (filtro?: RelatorioFiltroRequest) =>
    api.get<RelatorioBarbeiroResponse[]>("/api/relatorio/por-barbeiro", {
      params: {
        DataInicio: filtro?.dataInicio || undefined,
        DataFim: filtro?.dataFim || undefined,
      },
    }),
};

// ===== HORÁRIO =====
export const horarioApi = {
  disponiveis: (barbeiroId: number, data: string) =>
    api.get<HorariosDisponiveisResponse>("/api/horario/disponiveis", {
      params: { barbeiroId, data },
    }),

  todos: (data: string) =>
    api.get<string[]>("/api/horario/todos", {
      params: { data },
    }),
};

export default api;
