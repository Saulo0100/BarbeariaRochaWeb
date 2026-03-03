// ===== ENUMS =====
export enum Perfil {
  Cliente = 1,
  Barbeiro = 2,
  Administrador = 3,
  BarbeiroAdministrador = 4,
}

export enum AgendamentoStatus {
  Concluido = 1,
  Pendente = 2,
  LembreteEnviado = 3,
  CanceladoPeloCliente = 4,
  CanceladoPeloBarbeiro = 5,
  Confirmado = 6,
  VouAtrasar = 7,
  SlotReservado = 8,
  ClienteFaltou = 9,
}

export enum CategoriaServico {
  Cabelo = 1,
  Barba = 2,
  Sobrancelha = 3,
}

export enum MetodoPagamento {
  Dinheiro = 1,
  Credito = 2,
  Debito = 3,
  Pix = 4,
}

export enum TipoAgenda {
  Diaria = 1,
  Semanal = 2,
  Quinzenal = 3,
  Mensal = 4,
  Fechada = 5,
}

export enum MensalistaStatus {
  Ativo = 1,
  Inativo = 2,
}

export enum MensalistaTipo {
  Mensal = 1,
  Quinzenal = 2,
}

// ===== RESPONSE MODELS =====
export interface UsuarioDetalhesResponse {
  id: number;
  nome: string;
  numero: string;
  email: string;
  perfil: string;
  foto?: string | null;
  descricao?: string | null;
  agenda?: string | null;
  servicos?: ServicoDetalhesResponse[];
}

export interface UsuarioListarResponse {
  id: number;
  nome: string;
  numero: string;
  email: string;
  perfil: number;
}

export interface BarbeirosDetalhesResponse {
  id: number;
  nome: string;
  descricao?: string | null;
  agenda: string;
}

export interface AgendamentoDetalheResponse {
  id: number;
  nomeCliente: string;
  nomeBarbeiro: string;
  numeroCliente: string;
  status: string;
  data: string;
  servico: string;
  descricaoEtapa?: string | null;
  agendamentoPrincipalId?: number | null;
}

export interface HorariosOcupadosResponse {
  data: string;
  horarios: string[];
}

export interface ServicoDetalhesResponse {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  tempoEstimado: string;
  categoria: string;
  requerDuasEtapas: boolean;
  intervaloMinimoHoras: number;
  descricaoEtapa1?: string | null;
  descricaoEtapa2?: string | null;
}

export interface ExcecaoDetalhesResponse {
  id: number;
  data: string;
  descricao: string;
  barbeiroId?: number | null;
  nomeBarbeiro?: string | null;
}

export interface MensalistaResponse {
  id: number;
  nome: string;
  tipo: string;
  status: string;
  dia: string;
  valor: number;
}

export interface PaginacaoResultado<T> {
  items: T[];
  totalRegistros: number;
  paginaAtual: number;
  itensPorPagina: number;
}

// ===== REQUEST MODELS =====
export interface LoginRequest {
  numero: string;
  senha: string;
}

export interface EsqueceuSenhaRequest {
  numero: string;
  email: string;
}

export interface AgendamentoCriarRequest {
  barbeiroId: number;
  usuarioId?: number;
  servicoId: number;
  dtAgendamento: string;
  dtAgendamentoEtapa2?: string;
  numero: string;
  nome: string;
  codigoConfirmacao: number;
}

export interface AgendamentoCompletarRequest {
  metodoPagamento: MetodoPagamento;
}

export interface AgendamentoEditarRequest {
  metodoPagamento: MetodoPagamento;
  servicoId: number;
}

export interface HorarioRequest {
  idBarbeiro: number;
  data: string;
}

export interface UsuarioCriarRequest {
  nome: string;
  numero: string;
  email: string;
  perfil: Perfil;
  agenda?: TipoAgenda;
  descricao: string;
  senha: string;
}

export interface UsuarioEditarRequest {
  id: number;
  nome?: string;
  email?: string;
  numero?: string;
  descricao?: string;
  agenda?: TipoAgenda;
}

export interface ServicoCriarRequest {
  nome: string;
  valor: number;
  tempoEstimado: number;
  descricao: string;
  categoria: CategoriaServico;
}

export interface ExcecaoCriarRequest {
  data: string;
  descricao: string;
  barbeiroId?: number;
}

export interface MensalistaCriarRequest {
  nome: string;
  numero: string;
  valor: number;
  dia: number;
  tipo: MensalistaTipo;
}

// ===== RELATORIO RESPONSE MODELS =====
export interface RelatorioGeralResponse {
  totalCortes: number;
  cortesHoje: number;
  cortesSemana: number;
  cortesMes: number;
  faturamentoTotal: number;
  faturamentoHoje: number;
  faturamentoSemana: number;
  faturamentoMes: number;
  ticketMedio: number;
  agendamentosPendentes: number;
  cancelamentosTotal: number;
  clientesFaltaram: number;
  taxaFaltas: number;
  taxaCancelamento: number;
  taxaConclusao: number;
}

export interface ServicoMaisPedidoResponse {
  servicoId: number;
  nomeServico: string;
  categoria?: string;
  quantidade: number;
  valorTotal: number;
  percentualTotal: number;
}

export interface ClienteFrequenteResponse {
  nomeCliente: string;
  numeroCliente: string;
  totalCortes: number;
  ultimoCorte?: string;
  totalGasto: number;
}

export interface FaturamentoPorPeriodoResponse {
  periodo: string;
  totalCortes: number;
  faturamento: number;
}

export interface FaturamentoPorMetodoResponse {
  metodoPagamento: string;
  quantidade: number;
  valorTotal: number;
  percentual: number;
}

export interface RelatorioBarbeiroResponse {
  barbeiroId: number;
  nomeBarbeiro: string;
  totalCortes: number;
  faturamento: number;
  ticketMedio: number;
  cancelamentosTotal: number;
  clientesFaltaram: number;
  taxaConclusao: number;
}

export interface RelatorioFiltroRequest {
  barbeiroId?: number;
  dataInicio?: string;
  dataFim?: string;
}

export interface HorariosDisponiveisResponse {
  data: string;
  aberto: boolean;
  diaSemana: string;
  horariosDisponiveis: string[];
  horariosOcupados: string[];
}

export interface HorariosDisponiveisServicoResponse {
  data: string;
  aberto: boolean;
  diaSemana: string;
  horariosDisponiveis: string[];
  horariosOcupados: string[];
  horariosDisponiveisEtapa2: string[];
  requerDuasEtapas: boolean;
  intervaloMinimoHoras: number;
}

// ===== FILTRO MODELS =====
export interface AgendamentoFiltroRequest {
  barbeiroId?: number;
  dtAgendamento?: string;
  servicos?: number[];
}

export interface UsuarioFiltroRequest {
  nome?: string;
  perfil?: string;
}

export interface ServicoFiltroRequest {
  nome?: string;
  categoria?: CategoriaServico;
}

export interface ExcecaoFiltroRequest {
  dataInicio?: string;
  dataFim?: string;
  barbeiroId?: number;
}

// ===== HELPER TYPES =====
export interface PaginacaoFiltro<T> {
  pagina: number;
  itensPorPagina: number;
  filtro: T;
}

// Status label helpers
export const statusLabels: Record<string, string> = {
  Concluido: "Concluído",
  Pendente: "Pendente",
  LembreteEnviado: "Lembrete Enviado",
  CanceladoPeloCliente: "Cancelado pelo Cliente",
  CanceladoPeloBarbeiro: "Cancelado pelo Barbeiro",
  Confirmado: "Confirmado",
  VouAtrasar: "Vou Atrasar",
  SlotReservado: "Slot Reservado",
  ClienteFaltou: "Cliente Faltou",
};

export const statusColors: Record<string, string> = {
  Concluido: "text-green-400",
  Pendente: "text-yellow-400",
  LembreteEnviado: "text-blue-400",
  CanceladoPeloCliente: "text-red-400",
  CanceladoPeloBarbeiro: "text-red-400",
  Confirmado: "text-emerald-400",
  VouAtrasar: "text-orange-400",
  SlotReservado: "text-purple-400",
  ClienteFaltou: "text-amber-400",
};

export const metodoPagamentoLabels: Record<number, string> = {
  1: "Dinheiro",
  2: "Crédito",
  3: "Débito",
  4: "Pix",
};

export const categoriaLabels: Record<string, string> = {
  Cabelo: "Cabelo",
  Barba: "Barba",
  Sobrancelha: "Sobrancelha",
};
