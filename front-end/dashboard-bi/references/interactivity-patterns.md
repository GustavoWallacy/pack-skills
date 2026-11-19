# Padrões de interatividade BI

> Esta é a referência mais importante para entregar a **sensação de ferramenta BI**. Sem cross-filtering, slicers globais e tooltips ricos, o resultado vira um relatório estático bonito — mas estático. Leia este arquivo antes de codar a interatividade.

## Modelo mental: estado central, componentes burros

Em um dashboard BI bem feito, **toda interatividade gira em torno de um único objeto de estado** que descreve "quais filtros estão ativos agora". Cada componente (gráfico, KPI, tabela) consome esse estado e renderiza dados filtrados. Cada componente também pode **escrever** nesse estado quando o usuário clica nele.

```jsx
// No componente raiz
const [filters, setFilters] = useState({
  region: null,        // slicer global
  period: '12m',       // slicer global
  selectedCategory: null,  // cross-filter de gráfico
  selectedProduct: null,   // cross-filter de outro gráfico
});
```

Esse padrão é simples, escalável e funciona para 95% dos dashboards. Não use Redux/Zustand para um dashboard único — overkill.

Os dados filtrados são derivados via `useMemo`:

```jsx
const filteredData = useMemo(() => {
  return rawData.filter(row => {
    if (filters.region && row.region !== filters.region) return false;
    if (filters.selectedCategory && row.category !== filters.selectedCategory) return false;
    // ... outros filtros
    return true;
  });
}, [rawData, filters]);
```

E aí cada gráfico recebe `filteredData` + a função `setFilters`.

## Cross-filtering — o coração do BI

**Comportamento esperado:** o usuário clica numa barra (digamos, "Região Sul"). Imediatamente, todos os outros gráficos e KPIs do dashboard atualizam para mostrar apenas dados da Região Sul. A barra clicada fica destacada (cor cheia); as outras barras ficam com `opacity-30` para indicar "não estou no filtro". Clicar na mesma barra de novo (ou num botão "Limpar filtros") remove o filtro.

### Implementação em Recharts

Recharts aceita `onClick` em quase todos os elementos. O handler recebe o data point clicado:

```jsx
<BarChart data={data} onClick={(e) => {
  if (e && e.activePayload) {
    const clicked = e.activePayload[0].payload.category;
    setFilters(f => ({
      ...f,
      selectedCategory: f.selectedCategory === clicked ? null : clicked
    }));
  }
}}>
  <Bar dataKey="value">
    {data.map((entry, i) => (
      <Cell
        key={i}
        fill={
          !filters.selectedCategory || filters.selectedCategory === entry.category
            ? PRIMARY_COLOR
            : DIMMED_COLOR
        }
        cursor="pointer"
      />
    ))}
  </Bar>
</BarChart>
```

Pontos importantes:
- O toggle (`f.selectedCategory === clicked ? null : clicked`) faz clicar de novo desselecionar — comportamento esperado em ferramentas BI.
- O `Cell` permite cor condicional por barra. Use `opacity-30` ou uma cor cinza-clara para os não-selecionados.
- `cursor="pointer"` deixa óbvio que é clicável.

Para line/area charts, o clique pode ser num data point (`<Line dot onClick>`), mas costuma ser menos útil — line charts geralmente são "passivos" no cross-filtering, recebendo o filtro de outros gráficos.

Para scatter plots, o `onClick` na `Scatter` funciona; cada ponto pode ser uma seleção.

### O que cross-filtrar e o que não cross-filtrar

| Componente | Geralmente clicável? | Por quê |
|---|---|---|
| Bar chart de categorias | **Sim** | Categorias são filtros naturais |
| Line/Area de tendência | Raramente | Pontos de tempo individuais raramente são filtros úteis |
| Pie/donut | Sim, mas evite pizzas | — |
| Scatter | Caso a caso | Filtrar um ponto único raramente faz sentido; útil para selecionar outliers |
| Mapa | Sim | Geo é filtro natural |
| KPI card | Não | KPIs são leitura, não entrada |
| Tabela | Linhas podem filtrar | Útil em tabelas de "drill-down" |

## Slicers globais

**Comportamento esperado:** controles no topo (geralmente direita do header) que sempre estão visíveis e afetam **todos** os componentes do dashboard. Tipicamente:

- **Período** — segmented control: `7D` `30D` `90D` `12M` `Tudo`
- **Região / Filial / Loja** — Select ou multi-select
- **Categoria de produto** — Select
- **Outros filtros relevantes ao domínio**

### Padrão visual

Slicers ficam num único `flex gap-2 items-center` no header, alinhados à direita:

```jsx
<header className="flex items-center justify-between p-6 border-b">
  <div>
    <h1 className="text-2xl font-semibold">Dashboard de Vendas</h1>
    <p className="text-sm text-gray-500">Visão consolidada — atualizado agora</p>
  </div>
  <div className="flex items-center gap-2">
    <PeriodSlicer value={filters.period} onChange={p => setFilters(f => ({...f, period: p}))} />
    <RegionSelect value={filters.region} onChange={r => setFilters(f => ({...f, region: r}))} />
    {hasActiveFilters && (
      <button onClick={() => setFilters(initialFilters)} className="text-sm text-gray-500 hover:text-gray-900">
        Limpar filtros
      </button>
    )}
  </div>
</header>
```

### Implementação de um Period Slicer (segmented control)

```jsx
function PeriodSlicer({ value, onChange }) {
  const options = ['7D', '30D', '90D', '12M', 'Tudo'];
  return (
    <div className="inline-flex rounded-md bg-gray-100 p-1">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 text-sm rounded transition ${
            value === opt
              ? 'bg-white shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
```

### Botão "Limpar filtros"

Aparece **apenas quando há filtros ativos** — caso contrário polui o header. Reseta o estado ao inicial.

## Tooltips ricos

O tooltip default do Recharts é genérico ("category: x, value: y"). Em BI, o tooltip é uma oportunidade de informação — não a desperdice.

### O que um bom tooltip mostra

1. **O que** está sendo visto (label da categoria, data formatada)
2. **O valor formatado** corretamente (R$, %, milhar)
3. **Comparação ou contexto** — % do total, vs período anterior, vs média
4. **Quando relevante**, breakdown por subcategoria

### Implementação

```jsx
function CustomTooltip({ active, payload, label, total }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const value = payload[0].value;
  const pct = total ? (value / total * 100).toFixed(1) : null;
  const delta = data.previousValue ? ((value - data.previousValue) / data.previousValue * 100) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-medium text-gray-900">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {formatCurrency(value)}
        </span>
        {pct && <span className="text-gray-500">({pct}%)</span>}
      </div>
      {delta !== null && (
        <div className={`text-xs mt-1 ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}% vs período anterior
        </div>
      )}
    </div>
  );
}

// Uso:
<Tooltip content={<CustomTooltip total={totalSales} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
```

`cursor={{ fill: ... }}` substitui a barra de fundo cinza-escuro feia que vem por padrão por algo sutil.

## Estados de seleção e feedback visual

Quando um filtro está ativo, **mostre claramente o que está filtrado** em três lugares:

1. **No próprio elemento clicado** — cor cheia
2. **Nos não-selecionados** — `opacity-30` ou cor cinza-clara
3. **Globalmente, no header** — chip/pill mostrando "Filtro: Região Sul × Categoria Bebidas" com X para remover

```jsx
{filters.selectedCategory && (
  <div className="px-6 py-2 bg-blue-50 border-b text-sm flex items-center gap-2">
    <span className="text-gray-600">Filtrando:</span>
    <span className="bg-white border border-blue-200 rounded-full px-3 py-1 flex items-center gap-1">
      Categoria: {filters.selectedCategory}
      <button onClick={() => setFilters(f => ({...f, selectedCategory: null}))}>×</button>
    </span>
  </div>
)}
```

## Animações: sutis, sempre

Recharts já anima transições por padrão. Para slicers e cross-filter, deixe a transição rolar — ela ajuda o usuário a ver o que mudou. Não desabilite com `isAnimationActive={false}` exceto se houver problema de performance.

Para hover em cards, use `transition-all duration-200` do Tailwind. Lift effect sutil (`hover:shadow-md hover:-translate-y-0.5`) é elegante; lift exagerado fica brega.

## Drill-down (opcional, avançado)

Se o usuário pediu drill-down (clicar abre detalhe), padrão recomendado:
- Clique simples → cross-filter (filtra os outros)
- Clique duplo → drill (abre modal/painel lateral com detalhe da seleção)

Ou, alternativamente, um botão "Ver detalhes" no card que abre painel lateral. Use `Sheet` / `Drawer` de shadcn ou um `<aside>` posicionado.

## Pegadinhas comuns

- **Não esqueça `useMemo` para `filteredData`.** Sem isso, todo re-render recalcula tudo e fica lento com >5k linhas.
- **Cuidado com `onClick` no `BarChart` vs no `Bar`.** O do `BarChart` te dá contexto do clique; o do `Bar` dá só o data point. Geralmente queremos o do `BarChart`.
- **`Cell` keys precisam ser estáveis.** Use `key={\`cell-${entry.id}\`}` ou similar.
- **Não anime cores em cross-filter.** Mude instantaneamente. Animar a transição de cor cheia para opaca confunde mais do que ajuda.
- **Tooltip sumindo durante hover** — geralmente é problema de re-render. Memoize o componente do tooltip ou estabilize a referência da função `content`.
