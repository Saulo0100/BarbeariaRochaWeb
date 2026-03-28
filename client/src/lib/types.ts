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

export enum PeriodoTrabalho {
  DiaTodo = 1,
  Manha = 2,
  Tarde = 3,
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
  foto?: string | null;
}

export interface BarbeirosDetalhesResponse {
  id: number;
  nome: string;
  descricao?: string | null;
  agenda: string;
  foto?: string | null;
}

export interface AdicionalResponse {
  id: number;
  nome: string;
  valor: number;
}

export interface AdicionalRequest {
  nome: string;
  valor: number;
}

export interface AdicionalDisponivel {
  id?: number;
  nome: string;
  valor: number;
}

export interface AdicionalCriarRequest {
  nome: string;
  valor: number;
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
  adicionais?: AdicionalResponse[] | null;
  valorServico?: number | null;
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

export interface MensalistaCorteResponse {
  id: number;
  dataCorte: string;
  observacao?: string | null;
}

export interface MensalistaResponse {
  id: number;
  nome: string;
  numero: string;
  tipo: string;
  status: string;
  dia: string;
  valor: number;
  cortesNoMes: number;
  atendimentosNoMes: number;
  cortes: MensalistaCorteResponse[];
  horario?: string | null;
  barbeiroId?: number | null;
  nomeBarbeiro?: string | null;
  servicoId?: number | null;
  nomeServico?: string | null;
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

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
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
  adicionais?: AdicionalRequest[];
}

export interface AgendamentoCompletarRequest {
  metodoPagamento: MetodoPagamento;
}

export interface AgendamentoEditarRequest {
  metodoPagamento: MetodoPagamento;
  servicoId: number;
  adicionais?: AdicionalRequest[];
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
  porcentagem?: number;
  periodoTrabalho?: number;
}

export interface UsuarioEditarRequest {
  id: number;
  nome?: string;
  email?: string;
  numero?: string;
  descricao?: string;
  agenda?: TipoAgenda;
  foto?: string;
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
  dia?: number;
  tipo: MensalistaTipo;
  horario?: string;
  barbeiroId?: number;
  servicoId?: number;
  agendamentosAutomaticos?: boolean;
}

export interface MensalistaRegistrarCorteRequest {
  mensalistaId: number;
  dataCorte: string;
  observacao?: string;
}

export interface AgendamentoCriarParaClienteRequest {
  barbeiroId: number;
  servicoId: number;
  dtAgendamento: string;
  numero: string;
  nome: string;
  dtAgendamentoEtapa2?: string;
  adicionais?: AdicionalRequest[];
}

export interface AgendamentoCancelarPorNumeroRequest {
  agendamentoId: number;
  numero: string;
  codigoConfirmacao: number;
}

// ===== RELATORIO RESPONSE MODELS =====
export interface RelatorioGeralResponse {
  totalAtendimentos: number;
  atendimentosHoje: number;
  atendimentosSemana: number;
  atendimentosMes: number;
  faturamentoTotal: number;
  faturamentoHoje: number;
  faturamentoSemana: number;
  faturamentoMes: number;
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
  totalAtendimentos: number;
  ultimoAtendimento?: string;
  totalGasto: number;
}

export interface FaturamentoPorPeriodoResponse {
  periodo: string;
  totalAtendimentos: number;
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
  totalAtendimentos: number;
  faturamento: number;
  cancelamentosTotal: number;
  clientesFaltaram: number;
  taxaConclusao: number;
  porcentagemAdmin?: number | null;
  faturamentoBruto?: number | null;
  faturamentoLiquido?: number | null;
  valorComissaoAdmin?: number | null;
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
  usuarioId?: number;
  dtAgendamento?: string;
  servicos?: number[];
  status?: string;
  todosBarbeiros?: boolean;
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

// ===== CONFIGURAÇÃO BARBEARIA =====
export interface ConfiguracaoBarbeariaResponse {
  id: number;
  numeroCelular: string | null;
  rua: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}

export interface ConfiguracaoBarbeariaRequest {
  numeroCelular: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

// ===== CONFIGURAÇÃO HORÁRIO =====
export interface ConfiguracaoHorarioResponse {
  id: number;
  diaSemana: number;
  nomeDia: string;
  aberto: boolean;
  horaInicio: string;
  almocoInicio: string;
  almocoFim: string;
  horaFim: string;
  intervaloMinutos: number;
}

export interface ConfiguracaoHorarioSalvarRequest {
  diaSemana: number;
  aberto: boolean;
  horaInicio: string;
  almocoInicio: string;
  almocoFim: string;
  horaFim: string;
  intervaloMinutos: number;
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
