# CLAUDE.md — Diretrizes para IA

## Projeto

Sistema web mobile-first para barbearias. Frontend React 19 + TypeScript + Vite. Ver `.context` para mapeamento completo.

## Comandos

```bash
pnpm dev          # Dev server
pnpm build        # Build producao
pnpm check        # Type check
pnpm format       # Prettier
```

## Convencoes Obrigatorias

### Formatacao
- **Prettier com `semi: true`** — SEMPRE use ponto e virgula
- Aspas duplas (`"string"`, nao `'string'`)
- Trailing comma es5
- `arrowParens: "avoid"` — `x => x` nao `(x) => x`
- Indentacao: 2 espacos

### Estrutura de Codigo
- Componentes e paginas em **PascalCase** (`MeusCortes.tsx`)
- Hooks com prefixo `use` (`useMobile.tsx`)
- Toda chamada HTTP passa por `client/src/lib/api.ts` — NUNCA use fetch direto ou crie nova instancia Axios
- Todos os tipos vao em `client/src/lib/types.ts` — NUNCA defina interfaces de API em paginas/componentes
- Merge de classes via `cn()` de `@/lib/utils` — NUNCA concatene strings de classe manualmente quando houver condicional
- Path alias: `@/` = `client/src/`

### React Patterns
- State global via Context (`AuthContext`, `ThemeContext`) — nao ha Redux/Zustand
- Formularios com React Hook Form + Zod para validacao
- Toasts via `toast.success()` / `toast.error()` (Sonner) — nao use `alert()`
- Animacoes com Framer Motion (nao CSS transitions manuais para layouts)
- Roteamento via `wouter` (`Link`, `useLocation`, `Route`, `Switch`) — NAO use react-router

### API e Backend
- O backend e uma API .NET **externa** (nao esta neste repo)
- URL da API e configuravel em runtime via localStorage
- **NAO gere slots de horario no frontend** — sempre consulte `horarioApi.disponiveis()`
- Erros da API seguem pattern `{ status, message }` — interceptor ja extrai a message
- Para endpoints paginados, use `PaginacaoResultado<T>` como tipo de retorno

### Design
- **Tema escuro por padrao** (`ThemeProvider defaultTheme="dark"`)
- Cores em **oklch()** — nao use hex, rgb, ou hsl
- Componentes UI do **shadcn/ui** — prefira usar os existentes antes de criar novos
- Mobile-first: `max-w-sm` para conteudo principal
- Icones via **Lucide React** — nao adicione outra lib de icones

## Nao Faca

- NAO crie arquivos em `components/ui/` manualmente — use `npx shadcn@latest add <componente>`
- NAO adicione dependencias sem necessidade clara — o projeto ja tem 23+ pacotes Radix
- NAO modifique `patches/wouter@3.7.1.patch` sem entender que ele coleta rotas em `window.__WOUTER_ROUTES__`
- NAO mova ou renomeie `shared/const.ts` — embora pouco usado, e importado via path alias `@shared/*`
- NAO hardcode URLs de API — use `api.ts` e env vars
- NAO crie novas paginas sem adicionar a rota em `App.tsx` e o item de navegacao correspondente em `Layout.tsx`
