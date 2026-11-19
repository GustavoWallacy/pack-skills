# Recharts Cookbook

> Snippets prontos para os padrões que mais aparecem em dashboards BI. Copie, ajuste o data e siga em frente.

## Setup base

```jsx
import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart, BarChart, AreaChart, ComposedChart, ScatterChart, PieChart,
  Line, Bar, Area, Scatter, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
```

Sempre embrulhe em `<ResponsiveContainer>` — sem isso o gráfico não responde a redimensionamento:

```jsx
<div className="h-64">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>...</BarChart>
  </ResponsiveContainer>
</div>
```

## Eixos formatados em pt-BR

```jsx
<XAxis
  dataKey="month"
  stroke="#9CA3AF"
  fontSize={12}
  tickLine={false}
  axisLine={false}
  tickFormatter={(v) => fmtMonthYear.format(new Date(v))}
/>
<YAxis
  stroke="#9CA3AF"
  fontSize={12}
  tickLine={false}
  axisLine={false}
  tickFormatter={(v) => fmtCompact(v)}  // "1.2 mi" em vez de "1200000"
  width={50}
/>
```

`tickLine={false}` e `axisLine={false}` removem ticks/linhas pesadas — pura aplicação de data-ink ratio.

## Grid sutil

```jsx
<CartesianGrid
  strokeDasharray="3 3"
  stroke="#F3F4F6"
  vertical={false}  // só horizontal — facilita leitura de valores
/>
```

`vertical={false}` é o padrão preferido em line/area/bar — gridlines verticais raramente ajudam.

## Custom Tooltip rico

```jsx
function CustomTooltip({ active, payload, label, formatter, comparator }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
        {label}
      </div>
      {payload.map((entry, i) => {
        const value = entry.value;
        const formatted = formatter ? formatter(value) : value;
        const compare = comparator ? comparator(entry) : null;

        return (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
            <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">
              {formatted}
            </span>
            {compare !== null && (
              <span className={`text-xs ml-1 ${compare >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {compare >= 0 ? '↑' : '↓'} {Math.abs(compare).toFixed(1)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Uso:
<Tooltip
  content={<CustomTooltip formatter={fmtCurrency.format} />}
  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
/>
```

`cursor={{ fill: 'rgba(0,0,0,0.04)' }}` substitui o fundo cinza escuro feio por um realce sutil.

Para line charts, use `cursor={{ stroke: '#9CA3AF', strokeDasharray: '3 3' }}`.

## Bar chart com cross-filtering

```jsx
function CrossFilterBarChart({ data, selectedKey, onSelect, valueKey, labelKey }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        onClick={(e) => {
          if (e?.activePayload) {
            const clicked = e.activePayload[0].payload[labelKey];
            onSelect(selectedKey === clicked ? null : clicked);
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={fmtCompact} />
        <YAxis type="category" dataKey={labelKey} stroke="#9CA3AF" fontSize={12} width={100} />
        <Tooltip content={<CustomTooltip formatter={fmtCurrency.format} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={!selectedKey || selectedKey === entry[labelKey] ? '#2563EB' : '#BFDBFE'}
              cursor="pointer"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

`layout="vertical"` faz barras horizontais (eixos invertidos no Recharts — confuso, mas é a sintaxe). `radius={[0, 4, 4, 0]}` arredonda só o lado direito da barra (canto externo).

## Line chart com múltiplas séries

```jsx
function MultiLineChart({ data, series, theme }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.gridline} vertical={false} />
        <XAxis dataKey="month" stroke={theme.textTertiary} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={theme.textTertiary} fontSize={12} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
        <Tooltip content={<CustomTooltip formatter={fmtCurrency.format} />} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={theme.categorical[i]}
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

`dot={{ r: 0 }}` esconde os dots por padrão (linhas mais limpas); `activeDot={{ r: 5 }}` os mostra no hover.

`type="monotone"` dá curva suave; `type="linear"` dá linhas retas (use linear quando os pontos têm significado discreto, ex.: dados mensais).

## Area chart com gradiente sutil

```jsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={fmtCompact} />
  <Tooltip content={<CustomTooltip formatter={fmtCurrency.format} />} />
  <Area
    type="monotone"
    dataKey="value"
    stroke="#2563EB"
    strokeWidth={2}
    fill="url(#fillPrimary)"
  />
</AreaChart>
```

Gradiente vertical sumindo para baixo dá sensação de "volume" sem usar fill sólido. Padrão moderno.

## Sparkline minimalista (para KPI cards)

```jsx
function Sparkline({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

Sem eixos, sem grid, sem tooltip. Só a forma da tendência.

## Tabela com formatação

Recharts não faz tabela. Use HTML puro com Tailwind:

```jsx
function DataTable({ rows, columns }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map(col => (
              <th
                key={col.key}
                className={`py-2 px-3 font-medium text-gray-600 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`py-2 px-3 tabular-nums ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Uso:
<DataTable
  rows={topProducts}
  columns={[
    { key: 'name', label: 'Produto' },
    { key: 'sales', label: 'Vendas', format: fmtCurrency.format, align: 'right' },
    { key: 'units', label: 'Unidades', format: fmtNumber.format, align: 'right' },
    { key: 'margin', label: 'Margem', format: fmtPercent.format, align: 'right' },
  ]}
/>
```

Números sempre `text-right` + `tabular-nums`. Texto sempre `text-left`.

Para sorting: adicione um estado `[sortBy, setSortBy]` e ordene `rows` num `useMemo`. Cabeçalho clicável com seta indicando direção.

## Mini-bar dentro de tabela (data bar)

Útil para mostrar magnitude relativa direto na linha:

```jsx
<td className="py-2 px-3">
  <div className="flex items-center gap-2">
    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
      <div
        className="bg-blue-600 h-1.5 rounded-full"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-xs tabular-nums text-gray-600 w-12 text-right">
      {fmtCurrency.format(value)}
    </span>
  </div>
</td>
```

Padrão usado no Excel "Conditional formatting → Data bars" — permite comparar visualmente sem ocupar coluna extra.

## Performance: dataset grande

Para >5k pontos, performance pode degradar. Otimizações:

1. **Sample / agregue antes de plotar.** Linha de 5 anos diários (1825 pontos) fica espaguete; agregue por semana (260 pontos) — fica legível e rápido.
2. **`isAnimationActive={false}`** em todos os componentes — animação de entrada é cara em datasets grandes.
3. **`useMemo` no data filtrado** — sem isso, cada render recalcula tudo.
4. **Lazy render em tabelas** — virtualize com `react-window` se >500 linhas.

## Pegadinhas frequentes

- **Recharts não rerenderiza ao mudar `dataKey` dinâmico.** Mude a `key` do componente (`<BarChart key={metric}>`) para forçar remount.
- **`<Cell>` precisa estar como filho direto de `<Bar>`/`<Pie>`.** Não embrulhe em fragment.
- **Em `BarChart` vertical (barras horizontais), o `dataKey` da Bar é o eixo X (number)**, e o eixo Y vira categoria. Confuso, mas é assim.
- **`Tooltip` com `content` customizado precisa que o componente seja JSX (`<MyTooltip />`), não função (`MyTooltip`).** Recharts faz cloneElement.
- **Eixos com datas como string vs Date object.** Recharts aceita string mas não ordena automaticamente — ordene o array antes.
- **Legenda padrão fica em cima, ocupando altura.** Geralmente queremos legenda customizada ou nenhuma. Use `<Legend wrapperStyle={{paddingTop: 8}} />` se manter, ou omita.
