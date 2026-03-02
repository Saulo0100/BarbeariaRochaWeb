# Brainstorm de Design - Barbearia Rocha

<response>
<text>
## Ideia 1: "Vintage Barbershop" — Estética Retrô Industrial

**Design Movement**: Inspirado no estilo vintage de barbearias clássicas americanas dos anos 1950-60, com toques de tipografia industrial e texturas envelhecidas.

**Core Principles**:
1. Contraste dramático entre tons escuros e dourados/âmbar
2. Texturas de couro, madeira e metal oxidado como referência visual
3. Tipografia com serifa pesada para títulos, evocando cartazes antigos
4. Hierarquia clara com espaçamento generoso

**Color Philosophy**: Fundo escuro (quase preto com tons quentes) transmite sofisticação masculina. Dourado/âmbar como cor de destaque evoca luxo acessível e tradição. Branco creme para textos secundários mantém legibilidade sem ser frio.
- Background: #1A1714 (marrom muito escuro)
- Primary: #C8A96E (dourado âmbar)
- Surface: #2A2520 (marrom escuro)
- Text: #F5F0E8 (creme)
- Accent: #8B4513 (marrom couro)

**Layout Paradigm**: Layout vertical mobile-first com cards empilhados e navegação bottom-tab. Seções divididas por linhas finas douradas. Conteúdo principal ocupa largura total no mobile com padding lateral mínimo.

**Signature Elements**:
1. Ícone de navalha estilizada como separador de seções
2. Bordas com cantos levemente arredondados e sombra dourada sutil
3. Pattern de listras de barbearia (vermelho/azul/branco) como detalhe decorativo

**Interaction Philosophy**: Transições suaves e elegantes. Botões com efeito de "pressionar" (scale down). Feedback tátil visual em cada ação.

**Animation**: Fade-in suave de baixo para cima nos cards ao entrar na tela. Transição de página com slide horizontal. Shimmer dourado em elementos de loading.

**Typography System**:
- Display: "Playfair Display" (serif bold) para títulos
- Body: "Source Sans 3" (sans-serif) para corpo de texto
- Monospace: Para horários e códigos de confirmação
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Ideia 2: "Brutalist Barber" — Minimalismo Cru e Direto

**Design Movement**: Neo-brutalismo digital com influências de design editorial suíço. Tipografia oversized, bordas duras, e uso ousado de espaço negativo.

**Core Principles**:
1. Tipografia como elemento visual principal — letras gigantes e impactantes
2. Bordas duras (sem border-radius) e sombras sólidas offset
3. Paleta restrita a 3 cores com alto contraste
4. Grid assimétrico que quebra expectativas

**Color Philosophy**: Preto absoluto como base transmite autoridade. Amarelo elétrico como accent chama atenção imediata para CTAs. O contraste extremo garante legibilidade e impacto.
- Background: #000000
- Primary: #FFD600 (amarelo elétrico)
- Surface: #111111
- Text: #FFFFFF
- Border: #333333

**Layout Paradigm**: Cards com bordas grossas (3px solid) e sombras offset sólidas (4px 4px 0 cor). Navegação lateral colapsável. Conteúdo em blocos retangulares sem arredondamento.

**Signature Elements**:
1. Sombras sólidas offset (sem blur) em todos os cards interativos
2. Texto rotacionado 90° como labels laterais decorativos
3. Linhas grossas horizontais como divisores

**Interaction Philosophy**: Respostas instantâneas e exageradas. Hover com deslocamento do card na direção da sombra. Cliques com inversão de cores.

**Animation**: Entradas com slide rápido e bounce sutil. Transições de estado com morph de cor instantâneo. Loading com barra de progresso brutalista.

**Typography System**:
- Display: "Space Grotesk" (sans-serif, bold 700) para títulos oversized
- Body: "IBM Plex Sans" para texto corrido
- Accent: "Space Mono" para dados numéricos e horários
</text>
<probability>0.05</probability>
</response>

<response>
<text>
## Ideia 3: "Clean Craft" — Elegância Contemporânea com Calor

**Design Movement**: Design contemporâneo escandinavo com influências de craft/artesanal. Limpo mas com personalidade, usando tons terrosos quentes e formas orgânicas sutis.

**Core Principles**:
1. Espaço branco generoso com toques de cor terrosa que transmitem acolhimento
2. Formas suavemente arredondadas mas não excessivamente — border-radius moderado
3. Profundidade através de sombras suaves e camadas de superfície
4. Microinterações que dão vida sem distrair

**Color Philosophy**: Base clara com tons de off-white quente evita a frieza do branco puro. Verde-musgo escuro como cor primária transmite confiança e conexão com natureza/tradição. Terracota como accent adiciona calor e energia.
- Background: #FAF8F5 (off-white quente)
- Primary: #2D4A3E (verde musgo escuro)
- Surface: #FFFFFF
- Text: #1C1C1C (quase preto)
- Accent: #C4704B (terracota)
- Muted: #E8E4DF (bege claro)

**Layout Paradigm**: Layout vertical com seções de largura total alternando entre fundo claro e cards elevados. Bottom navigation com 4 tabs. Header compacto com logo e avatar. Cards com sombra suave e espaçamento interno generoso.

**Signature Elements**:
1. Ícones com traço fino (stroke) e estilo line-art
2. Badges e tags com fundo suave (cor com 10% opacidade)
3. Dividers sutis com gradiente fade nas pontas

**Interaction Philosophy**: Toque suave e responsivo. Estados de hover com elevação sutil. Feedback visual imediato mas discreto. Toasts informativos não intrusivos.

**Animation**: Fade-in com micro-slide (8px) ao entrar na viewport. Transições de 200-300ms com ease-out. Skeleton loading com shimmer suave. Ripple effect sutil em botões.

**Typography System**:
- Display: "DM Serif Display" para títulos — serif elegante mas moderna
- Body: "DM Sans" para texto — limpa e legível
- Numerais: Tabular numbers para horários e valores
</text>
<probability>0.07</probability>
</response>
