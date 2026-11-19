# Layout e composição

> O layout é o que faz um dashboard parecer "profissional" antes mesmo do usuário ler qualquer número. Densidade, ritmo visual e hierarquia bem feitos comunicam autoridade.

## Anatomia padrão de um dashboard BI

A grande maioria dos dashboards BI bem-sucedidos seguem alguma variação desta estrutura, organizada em **zonas verticais** com propósitos distintos:

```
┌─────────────────────────────────────────────────────────────┐
│  ZONA 1 — HEADER                                            │
│  Título + subtítulo (esquerda)  ·  Slicers globais (direita)│
├─────────────────────────────────────────────────────────────┤
│  ZONA 2 — KPIs (linha de cards)                             │
│  4 a 6 cards lado a lado, cada um com número + delta + spark│
├─────────────────────────────────────────────────────────────┤
│  ZONA 3 — VISÃO MACRO                                       │
│  Um gráfico grande de tendência (line ou area), full-width  │
├─────────────────────────────────────────────────────────────┤
│  ZONA 4 — BREAKDOWN                                         │
│  Dois gráficos lado a lado: ranking + composição            │
├─────────────────────────────────────────────────────────────┤
│  ZONA 5 — DETALHE (opcional)                                │
│  Tabela com sorting/formatação, ou heatmap, ou small mults  │
└─────────────────────────────────────────────────────────────┘
```

A leitura natural é de cima para baixo: número agregado → tendência → breakdown → detalhe. O usuário entende a história antes mesmo de pensar em interagir.

## Grid system

Use Tailwind grid de 12 colunas como espinha dorsal:

```jsx
<div className="grid grid-cols-12 gap-4">
  {/* KPI cards: 4 cards de 3 colunas cada */}
  <KpiCard className="col-span-3" />
  <KpiCard className="col-span-3" />
  <KpiCard className="col-span-3" />
  <KpiCard className="col-span-3" />

  {/* Tendência: full width */}
  <ChartCard className="col-span-12" />

  {/* Dois gráficos lado a lado: 7 + 5 (assimétrico fica elegante) */}
  <ChartCard className="col-span-7" />
  <ChartCard className="col-span-5" />

  {/* Tabela: full width */}
  <TableCard className="col-span-12" />
</div>
```

**Por que assimétrico (7+5) muitas vezes vence simétrico (6+6):** quebra o ritmo visual e dá hierarquia — o gráfico maior tem mais peso. Use simétrico quando os dois lados têm peso semântico igual.

## Espaçamento

- **Gap entre cards** — `gap-4` (16px) é o ideal. `gap-6` (24px) se tem muito espaço, `gap-3` se está apertado.
- **Padding interno dos cards** — `p-5` ou `p-6`. Nunca `p-2` — fica claustrofóbico.
- **Margem ao redor do dashboard** — `p-6` ou `p-8` no container raiz.
- **Linhas separadoras** — `border-t border-gray-200` (claro) ou `border-gray-800` (escuro). Use só onde a hierarquia precisa ser explícita, não entre todos os elementos.

## Card padrão

Todo gráfico vive dentro de um "card" com estrutura consistente:

```jsx
function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>
  );
}
```

Pontos:
- **`rounded-xl`** (12px) — radius médio, soft mas não bebê.
- **`border border-gray-200`** — borda fina e clara, suficiente para delimitar sem competir.
- **NUNCA `shadow-lg` ou maior.** Sombras pesadas são chartjunk. Se quiser elevação, use `shadow-sm` discreto.
- **Altura fixa do gráfico (`h-64` = 256px)** — todos os cards de gráfico com mesma altura criam ritmo. Evite gráficos esticarem desigualmente.

## KPI cards

Os KPIs são o "headline" do dashboard. Feitos errado, banalizam todo o resto.

### Estrutura de um KPI card

```jsx
function KpiCard({ label, value, delta, deltaLabel, sparkline }) {
  const isPositive = delta >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl font-semibold mt-2 tabular-nums">
        {value}
      </p>
      {delta !== undefined && (
        <p className={`text-xs mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          <span className="font-medium">
            {isPositive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-gray-500 ml-1">{deltaLabel || 'vs período anterior'}</span>
        </p>
      )}
      {sparkline && (
        <div className="h-8 mt-3 -mx-1">{sparkline}</div>
      )}
    </div>
  );
}
```

### O que NÃO fazer em KPI cards

- **Número sem comparação.** "Receita: R$ 1,2M" sozinho não diz se é bom ou ruim.
- **Ícones decorativos genéricos.** Um cifrão grande ao lado de uma receita é redundante. Se for usar ícone, que ele agregue informação (ex.: ícone de alerta quando KPI está fora da meta).
- **Cores fortes no fundo do card.** Cards coloridos chamam atenção mas competem entre si. Mantenha fundo neutro (branco ou cinza-50) e use cor só no delta.
- **Mais de 6 KPIs.** O olho desiste. Se tem mais de 6, agrupe em 2 linhas ou repense quais são os _realmente_ críticos.

### Sparkline em KPI

Mini line chart de altura ~32px mostrando a tendência dos últimos N períodos. Em Recharts:

```jsx
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={sparkData}>
    <Line
      type="monotone"
      dataKey="value"
      stroke="currentColor"
      strokeWidth={1.5}
      dot={false}
      isAnimationActive={false}
    />
  </LineChart>
</ResponsiveContainer>
```

Sem eixos, sem grid, sem tooltip — é puro contexto visual.

## Hierarquia visual

Em ordem de "peso" perceptual decrescente:

1. **Tamanho do número** — KPI grande (32-40px) > título de gráfico (14px)
2. **Peso da fonte** — `font-semibold` ou `font-bold` para o que importa
3. **Cor** — saturação alta vs cinza
4. **Posição** — topo-esquerda > resto
5. **Espaço ao redor** — elementos isolados ganham peso

Aplicação prática: o número-chefe do dashboard (o KPI mais importante) deve ser o **maior, mais escuro, mais destacado** elemento da tela. O resto se subordina.

## Padrão de leitura: F vs Z

- **F-pattern** (clássico em conteúdo denso) — lê de cima a esquerda, varre para direita, desce, varre de novo. **Use para dashboards com muito conteúdo.**
- **Z-pattern** — lê em zigue-zague, mais usado em landing pages. Menos relevante para BI.

Implicação: o KPI mais importante vai no canto superior esquerdo. O slicer global vai no canto superior direito (final da primeira "varredura").

## Responsividade

Em viewports menores que ~1024px, o grid de 4 KPIs vira 2x2, e os gráficos lado a lado empilham:

```jsx
<div className="col-span-12 md:col-span-3">  {/* mobile: full width, desktop: 1/4 */}
  <KpiCard />
</div>
```

Use sempre `<ResponsiveContainer>` do Recharts em volta dos gráficos — sem ele, eles não sabem se redimensionar.

## Densidade: o equilíbrio

Dashboards BI são **densos por natureza** — muita informação por pixel. O segredo para que isso não vire poluição é:

1. **Tipografia consistente** — apenas 3-4 tamanhos em toda a tela
2. **Paleta restrita** — cor primária + cinzas + 1 cor de alerta
3. **Espaçamento ritmado** — mesmos `gap` e `padding` em toda parte
4. **Linhas sutis** — borders `gray-200`, gridlines `gray-100`
5. **Sem elementos decorativos** — nada de divisórias enfeitadas, ícones grandes só pra preencher

Quando em dúvida sobre adicionar algo, pergunte: "isso ajuda a responder uma pergunta?" Se não, fora.

## Anti-padrões de layout

- **Cards de tamanhos aleatórios** — quebra ritmo. Use grid consistente.
- **Gráficos em altura `h-96` para uns e `h-48` para outros sem motivo** — padronize.
- **Header gigante** com banner colorido cheio de logo e descrição. Header é serviço, não decoração.
- **Tabelas dentro de cards minúsculos** com scroll vertical interno. Se a tabela é importante, dê espaço.
- **Footer com créditos/timestamp gigante.** Se tem timestamp ("atualizado há X minutos"), deixe pequeno e cinza no header.
- **Misturar fontes.** Use uma única fonte (a default do Tailwind, `Inter`, é excelente). Tipografia é parte do "calmo".
