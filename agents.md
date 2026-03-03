# Barbearia Rocha - Frontend (agents.md)

## Visao Geral
Sistema web mobile-first para barbearia com agendamento online, dashboard administrativo e relatorios BI para barbeiros. Frontend em React 19 + TypeScript com Vite, Tailwind CSS v4 e shadcn/ui.

## Regras de Negocio

### Agendamento
- Cliente pode agendar **sem login** (fluxo publico)
- Cliente logado tem dados pre-preenchidos
- Fluxo: Escolher Barbeiro -> Servico -> Data/Hora -> Dados Pessoais + Token -> Confirmar
- Horarios vem do backend via `/api/horario/disponiveis` (respeita regras de negocio)
- Domingos sao bloqueados no calendario (barbearia fechada)
- Confirmacao via codigo WhatsApp (4 digitos)

### Horarios de Funcionamento
- **Segunda a Sexta**: 09:00 as 20:00 (intervalo 12:20-13:20)
- **Sabado**: 10:00 as 20:00 (intervalo 12:00-13:00)
- **Domingo**: Fechado
- **Duracao do slot**: 40 minutos
- Horarios sao obtidos do backend; frontend nao gera slots localmente

### Perfis e Navegacao
| Perfil | Bottom Nav | Acesso |
|--------|-----------|--------|
| Visitante | Inicio, Agendar, Servicos, Entrar | Paginas publicas |
| Cliente | Inicio, Agendar, Cortes, Perfil | + Meus Cortes |
| Barbeiro | Atual, Agenda, Relatorios, Perfil | + Corte Atual, Agendamentos |
| BarbeiroAdmin | Atual, Agenda, Relatorios, Perfil | + Dashboard, Usuarios, Servicos Admin |
| Administrador | Painel, Agenda, Relatorios, Perfil | Acesso total |

### Relatorios (BI)
Disponivel para Barbeiro, BarbeiroAdmin e Administrador em `/relatorios`:
- Cards com metricas: cortes hoje/semana/mes, faturamento, ticket medio, cancelamentos
- Grafico de faturamento diario (LineChart)
- Servicos mais pedidos (BarChart horizontal)
- Metodos de pagamento (PieChart)
- Clientes mais frequentes (lista ranqueada)
- Filtro por periodo (hoje, 7 dias, 30 dias, todos)
- Filtro por barbeiro (admin apenas)

## Arquitetura

### Estrutura de Pastas
```
client/src/
├── App.tsx              # Router principal com todas as rotas
├── main.tsx             # Entry point
├── index.css            # Estilos globais (Tailwind + tema vintage)
├── components/
│   ├── Layout.tsx       # Layout mobile-first com bottom nav e header
│   ├── Footer.tsx       # Footer da pagina
│   ├── ErrorBoundary.tsx
│   └── ui/              # Componentes shadcn/ui
├── contexts/
│   ├── AuthContext.tsx   # Autenticacao JWT (login, logout, user, isPerfil)
│   └── ThemeContext.tsx  # Tema dark/light
├── lib/
│   ├── api.ts           # Cliente Axios com interceptors JWT + todos os endpoints
│   ├── types.ts         # Interfaces TypeScript (responses, requests, enums)
│   └── utils.ts         # Utilitarios (cn para classes)
└── pages/
    ├── Home.tsx          # Landing page publica
    ├── Login.tsx         # Login
    ├── Cadastro.tsx      # Cadastro de usuario
    ├── Agendar.tsx       # Fluxo de agendamento (5 etapas)
    ├── Servicos.tsx      # Lista de servicos (publico)
    ├── Configuracoes.tsx # Configuracoes (URL da API)
    ├── Perfil.tsx        # Perfil do usuario
    ├── MeusCortes.tsx    # Historico de cortes (cliente)
    ├── CorteAtual.tsx    # Corte atual do barbeiro
    ├── Agendamentos.tsx  # Lista de agendamentos (barbeiro/admin)
    ├── Dashboard.tsx     # Painel admin com stats e atalhos
    ├── Relatorios.tsx    # Dashboard BI com graficos e metricas
    ├── Usuarios.tsx      # Gerenciar usuarios (admin)
    ├── ServicosAdmin.tsx # Gerenciar servicos (admin)
    ├── Excecoes.tsx      # Gerenciar excecoes (dias bloqueados)
    └── Mensalistas.tsx   # Gerenciar mensalistas
```

### Tecnologias
- **React 19** + **TypeScript**
- **Vite** (build)
- **Tailwind CSS v4** (estilizacao)
- **shadcn/ui** (componentes)
- **Recharts** (graficos)
- **Framer Motion** (animacoes)
- **Wouter** (roteamento)
- **Axios** (HTTP client)
- **Sonner** (toasts)

### API
- URL base configuravel via localStorage (`apiBaseUrl`)
- JWT token armazenado em localStorage
- Interceptor automatico adiciona Bearer token
- Redirecionamento para /login em 401
- Endpoints organizados por recurso: authApi, tokenApi, usuarioApi, agendamentoApi, servicoApi, excecaoApi, mensalistaApi, relatorioApi, horarioApi

### Design
- **Tema**: Vintage Barbershop (fundo escuro, dourado ambar, creme)
- **Mobile-first**: max-w-sm, bottom navigation fixa
- **Fontes**: Playfair Display (titulos), Source Sans 3 (corpo)
- **Classe utilitaria**: `gold-gradient` (gradiente dourado), `gold-text` (texto dourado)
