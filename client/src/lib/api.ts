import axios from "axios";
import type {
  AdicionalDisponivel,
  AgendamentoCancelarPorNumeroRequest,
  AgendamentoCriarRequest,
  AgendamentoCriarParaClienteRequest,
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
  HorariosDisponiveisServicoResponse,
  HorariosOcupadosResponse,
  LoginRequest,
  EsqueceuSenhaRequest,
  MensalistaCriarRequest,
  MensalistaCorteResponse,
  MensalistaRegistrarCorteRequest,
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

// A URL base da API é lida da variável de ambiente VITE_API_BASE_URL (configurada no Render)
// O localStorage permite sobrescrever em tempo de execução via página de Configurações
const API_BASE_URL =
  localStorage.getItem("apiBaseUrl") ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://localhost:44396";

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
      // Só redireciona para login se o usuário tinha token (sessão expirada).
      // Não redireciona usuários sem login que estão navegando em páginas públicas.
      const hadToken = localStorage.getItem("token");
      if (hadToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
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

  criarComoAdmin: (data: UsuarioCriarRequest) =>
    api.post("/api/Usuario/CriarComoAdmin", data),

  editar: (id: number, data: UsuarioEditarRequest) =>
    api.put(`/api/Usuario/${id}`, data),

  excluir: (id: number) =>
    api.delete(`/api/Usuario/${id}`),

  editarPorcentagem: (id: number, porcentagem: number) =>
    api.patch(`/api/Usuario/${id}/Porcentagem`, porcentagem, {
      headers: { "Content-Type": "application/json" },
    }),

  obterPorId: (id: number) =>
    api.get<UsuarioDetalhesResponse>(`/api/Usuario/${id}`),

  listar: (pagina = 1, itensPorPagina = 10, filtro?: UsuarioFiltroRequest) =>
    api.get<PaginacaoResultado<UsuarioListarResponse>>("/api/Usuario", {
      params: {
        pagina,
        itensPorPagina,
        nome: filtro?.nome || undefined,
        perfil: filtro?.perfil || undefined,
      },
    }),

  me: () =>
    api.get<UsuarioDetalhesResponse>("/api/Usuario/me"),

  confirmarEmail: (token: string) =>
    api.get<string>("/api/Usuario/ConfirmarEmail", { params: { token } }),

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

  criarParaCliente: (data: AgendamentoCriarParaClienteRequest) =>
    api.post("/api/agendamento/CriarParaCliente", data),

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

  marcarClienteFaltou: (id: number) =>
    api.post(`/api/agendamento/${id}/ClienteFaltou`),

  gerarTokenCancelamento: (numero: string) =>
    api.post("/api/agendamento/GerarTokenCancelamento", JSON.stringify(numero), {
      headers: { "Content-Type": "application/json" },
    }),

  pendentesPorNumero: (numero: string, codigo: number) =>
    api.get<AgendamentoDetalheResponse[]>("/api/agendamento/PendentesPorNumero", {
      params: { numero, codigo },
    }),

  cancelarPorNumero: (data: AgendamentoCancelarPorNumeroRequest) =>
    api.post("/api/agendamento/CancelarPorNumero", data),

  cancelarComoCliente: (id: number) =>
    api.delete(`/api/agendamento/${id}/CancelarComoCliente`),

  meusAgendamentos: () =>
    api.get<AgendamentoDetalheResponse[]>("/api/agendamento/MeusAgendamentos"),

  adicionaisDisponiveis: () =>
    api.get<AdicionalDisponivel[]>("/api/agendamento/AdicionaisDisponiveis"),

  proximoAgendamentoPorNumero: (numero: string, codigo: number) =>
    api.get<AgendamentoDetalheResponse>("/api/agendamento/ProximoAgendamentoPorNumero", {
      params: { numero, codigo },
    }),

  listar: (pagina = 1, itensPorPagina = 10, filtro?: AgendamentoFiltroRequest) =>
    api.get<PaginacaoResultado<AgendamentoDetalheResponse>>("/api/agendamento", {
      params: {
        pagina,
        itensPorPagina,
        barbeiroId: filtro?.barbeiroId || undefined,
        usuarioId: filtro?.usuarioId || undefined,
        dtAgendamento: filtro?.dtAgendamento || undefined,
        status: filtro?.status || undefined,
        todosBarbeiros: filtro?.todosBarbeiros || undefined,
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

  registrarCorte: (data: MensalistaRegistrarCorteRequest) =>
    api.post("/api/Mensalista/corte", data),

  listarCortes: (mensalistaId: number, mes?: number, ano?: number) =>
    api.get<MensalistaCorteResponse[]>(`/api/Mensalista/${mensalistaId}/cortes`, {
      params: { mes, ano },
    }),

  deletarCorte: (corteId: number) =>
    api.delete(`/api/Mensalista/corte/${corteId}`),
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

  disponiveisPorServico: (barbeiroId: number, data: string, servicoId: number) =>
    api.get<HorariosDisponiveisServicoResponse>("/api/horario/disponiveis-servico", {
      params: { barbeiroId, data, servicoId },
    }),

  disponiveisEtapa2: (barbeiroId: number, data: string, servicoId: number, horaEtapa1: string) =>
    api.get<HorariosDisponiveisServicoResponse>("/api/horario/disponiveis-etapa2", {
      params: { barbeiroId, data, servicoId, horaEtapa1 },
    }),

  todos: (data: string) =>
    api.get<string[]>("/api/horario/todos", {
      params: { data },
    }),
};

export default api;
