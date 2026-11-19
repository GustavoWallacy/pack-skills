# Design visual

> Cor, tipografia e espaçamento mal escolhidos descaracterizam até o melhor dashboard. Esta referência traz as decisões já feitas para você não perder tempo: paletas testadas, formatação numérica em pt-BR e regras de tema claro/escuro.

## Tema: claro vs escuro

### Quando usar tema claro

- Dashboards executivos / boardroom
- Relatórios financeiros, contábeis, regulatórios
- Apresentações que vão ser projetadas (escuro reflete mal em projetor)
- Qualquer contexto formal, corporativo, "para o CEO ver"
- Default geral quando o contexto não é claro

### Quando usar tema escuro

- Dashboards de monitoramento operacional (SOC, NOC, devops)
- Telas que ficam ligadas 24/7 em monitor (escuro cansa menos)
- Produtos internos voltados a engenheiros/analistas técnicos
- Trading, dados em tempo real, alertas
- Estilo "Power BI dark" que o usuário pediu explicitamente

### Implementação de toggle

Use Tailwind dark mode com classe (`dark:`):

```jsx
const [theme, setTheme] = useState('light');

return (
  <div className={theme === 'dark' ? 'dark' : ''}>
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* ... resto */}
      <button
        onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        className="..."
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  </div>
);
```

Toggle pequeno e discreto no canto superior direito do header.

## Paleta de cores

### Princípio: poucas cores, propósito claro

Um dashboard BI não precisa de mais de **6 cores** ativas no total:
- **1 cor primária** (a "marca" do dashboard) — para a métrica principal
- **1 cor secundária** (opcional) — para comparação / segunda métrica
- **3 cores semânticas** — verde (positivo), vermelho (negativo), amarelo (atenção)
- **Tons de cinza** — para tudo o resto

### Paleta recomendada (tema claro)

```js
const lightTheme = {
  // Backgrounds
  bgPage: '#F9FAFB',         // gray-50
  bgCard: '#FFFFFF',
  border: '#E5E7EB',         // gray-200
  gridline: '#F3F4F6',       // gray-100

  // Texto
  textPrimary: '#111827',    // gray-900
  textSecondary: '#6B7280',  // gray-500
  textTertiary: '#9CA3AF',   // gray-400

  // Cor primária (azul corporativo, neutra e acessível)
  primary: '#2563EB',        // blue-600
  primaryLight: '#DBEAFE',   // blue-100
  primaryDimmed: '#BFDBFE',  // blue-200 (para itens não-selecionados em cross-filter)

  // Semânticas
  positive: '#059669',       // emerald-600
  negative: '#DC2626',       // red-600
  warning: '#D97706',        // amber-600

  // Categóricas (quando precisa diferenciar 3-6 categorias)
  categorical: ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2'],
};
```

### Paleta recomendada (tema escuro)

```js
const darkTheme = {
  bgPage: '#030712',         // gray-950
  bgCard: '#111827',         // gray-900
  border: '#1F2937',         // gray-800
  gridline: '#1F2937',       // gray-800

  textPrimary: '#F9FAFB',    // gray-50
  textSecondary: '#9CA3AF',  // gray-400
  textTertiary: '#6B7280',   // gray-500

  primary: '#60A5FA',        // blue-400 (mais claro que o claro pra contrastar com fundo escuro)
  primaryLight: '#1E3A8A',   // blue-900
  primaryDimmed: '#1E40AF',  // blue-800

  positive: '#34D399',       // emerald-400
  negative: '#F87171',       // red-400
  warning: '#FBBF24',        // amber-400

  categorical: ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#22D3EE'],
};
```

**Regra:** cores em tema escuro são **mais claras / saturadas** que no tema claro. Senão somem no fundo escuro.

### Tipos de paleta por tipo de dado

| Tipo de dado | Tipo de paleta | Exemplo |
|---|---|---|
| Categórico (regiões, produtos) | **Qualitativa** — cores distintas, sem ordenação implícita | Azul, verde, laranja, roxo |
| Sequencial (volume baixo→alto) | **Sequencial** — gradiente de uma cor | Azul claro → azul escuro |
| Divergente (negativo↔positivo, com zero central) | **Divergente** — duas cores em gradiente, neutro no meio | Vermelho ← cinza → verde |

Para escalas sequenciais e divergentes, use ColorBrewer ou Viridis (acessível para daltônicos).

### Acessibilidade para daltonismo

8% dos homens e 0,5% das mulheres têm algum tipo de daltonismo. Regras simples:
- **Nunca codifique informação só por cor.** Sempre acompanhe com label, posição ou ícone.
- **Verde + vermelho** é o caso pior (deuteranopia/protanopia). Em deltas, use também ↑/↓ ou +/-.
- **Paletas seguras:** Viridis, Cividis, ColorBrewer "colorblind safe".
- Teste rápido: passe o dashboard por um simulador (Coblis, ou DevTools do Chrome em "Emulate vision deficiencies").

## Tipografia

### Hierarquia padrão

| Elemento | Tamanho (px) | Peso | Uso |
|---|---|---|---|
| Título do dashboard | 24-28 | 600 (semibold) | Único na tela |
| Número de KPI | 32-40 | 600 (semibold) | Os 4-6 do topo |
| Título de card / gráfico | 14 | 500 (medium) | Acima de cada gráfico |
| Subtítulo / descrição | 12 | 400 (regular) | Abaixo de títulos |
| Eixos e labels de gráfico | 11-12 | 400 | Tudo dentro dos charts |
| Valores em tabelas | 14 | 400 (regular) ou 500 em destaques | Tabular sempre |
| Delta de KPI | 12 | 500 (medium) | "+12%" |

### Numbers tabulares — obrigatório

Números em colunas devem alinhar verticalmente. Sem isso, "1,234" e "987" desalinham e a tabela fica feia.

```css
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

No Tailwind: `tabular-nums`. **Aplique em TODOS os números do dashboard** — KPIs, eixos de gráfico, células de tabela, deltas. Sem exceção.

### Fonte

Use a default do Tailwind (Inter via system stack) ou explicitamente Inter:
```js
import '@fontsource/inter';
```

Inter foi desenhada pra UIs e tem excelente suporte a tabular-nums. Não use Roboto (legível mas anônima), Lato (anos 2010), ou — Deus me livre — Comic Sans.

## Formatação numérica em pt-BR

Dashboards profissionais não exibem `1234567.89`. Use `Intl.NumberFormat` sempre:

```js
const fmtCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,  // R$ 1.234.567 (sem centavos para valores grandes)
});

const fmtPercent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const fmtNumber = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

// Para valores grandes em KPIs, abrevie:
function fmtCompact(value) {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)} bi`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)} mi`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)} mil`;
  return fmtNumber.format(value);
}
```

### Datas

```js
const fmtDate = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});  // "07 mai 2026"

// Para eixos de gráfico, use formato compacto:
const fmtMonthYear = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit'
});  // "mai/26"
```

Em eixos de gráficos com muitas datas, formate compacto e considere mostrar só uma a cada N labels (`tickFormatter` + `interval` no XAxis do Recharts).

## Data-ink ratio (Tufte)

A "tinta" gasta no dashboard que **não** representa dados deve ser minimizada. Aplicação prática:

- **Gridlines** — cinza muito claro (`#F3F4F6` ou `gray-100`), nunca pretas/escuras. Em alguns casos, removíveis.
- **Eixos** — linha fina cinza, sem bold, sem ticks longos.
- **Bordas de gráficos** — geralmente desnecessárias (o card já delimita). Remova com `axisLine={false}` no Recharts.
- **Legendas** — coloque inline com a série quando possível (label direto na linha, não em legenda separada).
- **3D, sombras, gradientes decorativos** — sempre fora.
- **Backgrounds de cor sólida em cards** — fundo branco ou cinza-50. Cards azul-vibrante ou roxo-pastel comunicam "amador".

## Detalhes que diferenciam

Pequenos detalhes que separam um dashboard "OK" de um "uau":

- **Espaçamento entre o número do KPI e o delta** — `mt-1` (4px) cria respiro sem afastar.
- **Linha sutil acima do total numa tabela** — `border-t` no `tfoot` separa total dos itens.
- **Cor do delta usa o sinal, não só a magnitude** — verde para positivo, vermelho para negativo. Mas: verifique se "positivo" significa "bom" no contexto. Para "churn rate", subir é ruim — então a cor inverte.
- **Hover state nos cards** — sutil shadow lift (`hover:shadow-sm transition`).
- **Loading skeleton** — em vez de spinner. Bloco cinza pulsando no formato do conteúdo final (`animate-pulse bg-gray-200 h-32 rounded-xl`).
- **Empty state com ilustração simples** — ícone + frase. Nunca um gráfico vazio.

## Referência rápida: cor para Recharts

Recharts aceita cor por prop (`fill`, `stroke`). Use as variáveis do tema:

```jsx
<Bar dataKey="value" fill={theme.primary} />
<Line dataKey="value" stroke={theme.primary} strokeWidth={2} dot={false} />
<CartesianGrid stroke={theme.gridline} strokeDasharray="3 3" />
<XAxis stroke={theme.textTertiary} fontSize={12} />
```

Para cores condicionais (cross-filter), use `<Cell>`:

```jsx
{data.map((entry, i) => (
  <Cell
    key={i}
    fill={isSelected(entry) ? theme.primary : theme.primaryDimmed}
  />
))}
```
