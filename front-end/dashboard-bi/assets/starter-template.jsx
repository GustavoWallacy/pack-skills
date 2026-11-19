/**
 * STARTER TEMPLATE — Dashboard BI
 *
 * Template funcional pronto para adaptação. Já implementa:
 * - Tema claro/escuro com toggle
 * - Slicer global de período (segmented control)
 * - Slicer global de região (select)
 * - 4 KPI cards com delta e sparkline
 * - Line chart de tendência (recebe filtros)
 * - Bar chart com cross-filtering (clique seleciona, clique de novo desseleciona)
 * - Donut chart com cross-filtering
 * - Tabela de top items
 * - Custom tooltip rico em todos os gráficos
 * - Empty state quando filtros zeram resultados
 *
 * Adapte: substitua mockData pelos dados reais, ajuste labels/métricas ao domínio.
 */

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart, BarChart, PieChart,
  Line, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

// ============================================================================
// FORMATTERS — pt-BR
// ============================================================================
const fmtCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0
});
const fmtNumber = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const fmtPercent = (v) => `${(v * 100).toFixed(1)}%`;
function fmtCompact(value) {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)} bi`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)} mi`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)} mil`;
  return fmtNumber.format(value);
}

// ============================================================================
// THEMES
// ============================================================================
const THEMES = {
  light: {
    bgPage: '#F9FAFB',
    bgCard: '#FFFFFF',
    border: '#E5E7EB',
    gridline: '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    primary: '#2563EB',
    primaryDimmed: '#BFDBFE',
    positive: '#059669',
    negative: '#DC2626',
    categorical: ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777', '#0891B2'],
  },
  dark: {
    bgPage: '#030712',
    bgCard: '#111827',
    border: '#1F2937',
    gridline: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    primary: '#60A5FA',
    primaryDimmed: '#1E40AF',
    positive: '#34D399',
    negative: '#F87171',
    categorical: ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#22D3EE'],
  }
};

// ============================================================================
// MOCK DATA — substituir pelos dados reais
// ============================================================================
const RAW_DATA = [
  // Mês, Região, Categoria, Receita, Unidades
  { month: '2025-06', region: 'Sudeste', category: 'Bebidas', revenue: 420000, units: 1200 },
  { month: '2025-06', region: 'Sudeste', category: 'Alimentos', revenue: 380000, units: 950 },
  { month: '2025-06', region: 'Sul', category: 'Bebidas', revenue: 210000, units: 600 },
  { month: '2025-06', region: 'Sul', category: 'Alimentos', revenue: 190000, units: 480 },
  { month: '2025-06', region: 'Nordeste', category: 'Bebidas', revenue: 180000, units: 520 },
  { month: '2025-06', region: 'Nordeste', category: 'Alimentos', revenue: 160000, units: 410 },
  { month: '2025-07', region: 'Sudeste', category: 'Bebidas', revenue: 450000, units: 1280 },
  { month: '2025-07', region: 'Sudeste', category: 'Alimentos', revenue: 410000, units: 1010 },
  { month: '2025-07', region: 'Sul', category: 'Bebidas', revenue: 230000, units: 650 },
  { month: '2025-07', region: 'Sul', category: 'Alimentos', revenue: 200000, units: 500 },
  { month: '2025-07', region: 'Nordeste', category: 'Bebidas', revenue: 195000, units: 560 },
  { month: '2025-07', region: 'Nordeste', category: 'Alimentos', revenue: 175000, units: 440 },
  { month: '2025-08', region: 'Sudeste', category: 'Bebidas', revenue: 470000, units: 1340 },
  { month: '2025-08', region: 'Sudeste', category: 'Alimentos', revenue: 425000, units: 1050 },
  { month: '2025-08', region: 'Sul', category: 'Bebidas', revenue: 245000, units: 690 },
  { month: '2025-08', region: 'Sul', category: 'Alimentos', revenue: 215000, units: 540 },
  { month: '2025-08', region: 'Nordeste', category: 'Bebidas', revenue: 210000, units: 600 },
  { month: '2025-08', region: 'Nordeste', category: 'Alimentos', revenue: 185000, units: 470 },
  { month: '2025-09', region: 'Sudeste', category: 'Bebidas', revenue: 490000, units: 1400 },
  { month: '2025-09', region: 'Sudeste', category: 'Alimentos', revenue: 440000, units: 1090 },
  { month: '2025-09', region: 'Sul', category: 'Bebidas', revenue: 260000, units: 730 },
  { month: '2025-09', region: 'Sul', category: 'Alimentos', revenue: 225000, units: 565 },
  { month: '2025-09', region: 'Nordeste', category: 'Bebidas', revenue: 220000, units: 630 },
  { month: '2025-09', region: 'Nordeste', category: 'Alimentos', revenue: 195000, units: 495 },
];

const REGIONS = ['Todas', 'Sudeste', 'Sul', 'Nordeste'];
const PERIODS = ['3M', '6M', '12M', 'Tudo'];

// ============================================================================
// UI PRIMITIVES
// ============================================================================
function Card({ children, theme, className = '' }) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{ background: theme.bgCard, borderColor: theme.border }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, theme }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium" style={{ color: theme.textPrimary }}>{title}</h3>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label, theme, formatter }) {
  if (!active || !payload?.length) return null;
  const fmt = formatter || ((v) => v);
  return (
    <div
      className="rounded-lg shadow-lg p-3 text-sm border"
      style={{ background: theme.bgCard, borderColor: theme.border }}
    >
      <div className="font-medium mb-1.5" style={{ color: theme.textPrimary }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
          <span style={{ color: theme.textSecondary }}>{entry.name}:</span>
          <span className="font-medium tabular-nums" style={{ color: theme.textPrimary }}>
            {fmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// HEADER — título + slicers globais
// ============================================================================
function Header({ filters, setFilters, theme, onToggleTheme, themeMode, hasActiveFilters, onClearFilters }) {
  return (
    <header
      className="flex items-center justify-between p-6 border-b"
      style={{ borderColor: theme.border }}
    >
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: theme.textPrimary }}>
          Dashboard de Vendas
        </h1>
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Visão consolidada · atualizado agora
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Period slicer (segmented) */}
        <div
          className="inline-flex rounded-md p-1"
          style={{ background: theme.gridline }}
        >
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setFilters(f => ({ ...f, period: p }))}
              className="px-3 py-1 text-sm rounded transition"
              style={{
                background: filters.period === p ? theme.bgCard : 'transparent',
                color: filters.period === p ? theme.textPrimary : theme.textSecondary,
                fontWeight: filters.period === p ? 500 : 400,
                boxShadow: filters.period === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Region select */}
        <select
          value={filters.region}
          onChange={(e) => setFilters(f => ({ ...f, region: e.target.value }))}
          className="text-sm rounded-md border px-3 py-1.5"
          style={{
            background: theme.bgCard,
            borderColor: theme.border,
            color: theme.textPrimary
          }}
        >
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm hover:underline"
            style={{ color: theme.textSecondary }}
          >
            Limpar filtros
          </button>
        )}

        <button
          onClick={onToggleTheme}
          className="text-lg p-1.5 rounded-md hover:opacity-70 transition"
          aria-label="Alternar tema"
        >
          {themeMode === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// KPI CARD
// ============================================================================
function KpiCard({ label, value, delta, sparkline, theme }) {
  const isPositive = delta >= 0;
  return (
    <Card theme={theme}>
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: theme.textSecondary }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-semibold mt-2 tabular-nums"
        style={{ color: theme.textPrimary }}
      >
        {value}
      </p>
      {delta !== undefined && (
        <p
          className="text-xs mt-1 font-medium"
          style={{ color: isPositive ? theme.positive : theme.negative }}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
          <span className="ml-1 font-normal" style={{ color: theme.textSecondary }}>
            vs período anterior
          </span>
        </p>
      )}
      {sparkline && (
        <div className="h-8 mt-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={isPositive ? theme.positive : theme.negative}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Dashboard() {
  const [themeMode, setThemeMode] = useState('light');
  const theme = THEMES[themeMode];

  const initialFilters = { period: '12M', region: 'Todas', selectedCategory: null };
  const [filters, setFilters] = useState(initialFilters);

  // Filtragem central
  const filteredData = useMemo(() => {
    return RAW_DATA.filter(row => {
      if (filters.region !== 'Todas' && row.region !== filters.region) return false;
      if (filters.selectedCategory && row.category !== filters.selectedCategory) return false;
      return true;
    });
  }, [filters]);

  // Agregações para os componentes
  const kpis = useMemo(() => {
    const total = filteredData.reduce((sum, r) => sum + r.revenue, 0);
    const totalUnits = filteredData.reduce((sum, r) => sum + r.units, 0);
    const ticketMedio = totalUnits ? total / totalUnits : 0;
    const months = [...new Set(filteredData.map(r => r.month))].sort();

    // delta: último mês vs penúltimo
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];
    const lastTotal = filteredData.filter(r => r.month === lastMonth).reduce((s, r) => s + r.revenue, 0);
    const prevTotal = filteredData.filter(r => r.month === prevMonth).reduce((s, r) => s + r.revenue, 0);
    const deltaRevenue = prevTotal ? ((lastTotal - prevTotal) / prevTotal) * 100 : 0;

    return {
      revenue: total,
      units: totalUnits,
      ticketMedio,
      deltaRevenue,
      sparkline: months.map(m => ({
        v: filteredData.filter(r => r.month === m).reduce((s, r) => s + r.revenue, 0)
      }))
    };
  }, [filteredData]);

  const trendData = useMemo(() => {
    const byMonth = {};
    filteredData.forEach(r => {
      byMonth[r.month] = (byMonth[r.month] || 0) + r.revenue;
    });
    return Object.entries(byMonth)
      .sort()
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue
      }));
  }, [filteredData]);

  // Para o ranking de categorias, sempre usa dados sem o filtro de categoria
  // (senão clicar numa categoria some o ranking)
  const categoryData = useMemo(() => {
    const baseData = RAW_DATA.filter(r =>
      filters.region === 'Todas' || r.region === filters.region
    );
    const byCategory = {};
    baseData.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + r.revenue;
    });
    return Object.entries(byCategory)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filters.region]);

  const regionData = useMemo(() => {
    const baseData = RAW_DATA.filter(r =>
      !filters.selectedCategory || r.category === filters.selectedCategory
    );
    const byRegion = {};
    baseData.forEach(r => {
      byRegion[r.region] = (byRegion[r.region] || 0) + r.revenue;
    });
    return Object.entries(byRegion).map(([region, revenue]) => ({ region, revenue }));
  }, [filters.selectedCategory]);

  const hasActiveFilters = filters.region !== 'Todas'
    || filters.selectedCategory !== null
    || filters.period !== '12M';

  const isEmpty = filteredData.length === 0;

  // Cross-filter handler
  const handleCategoryClick = (e) => {
    if (e?.activePayload) {
      const clicked = e.activePayload[0].payload.category;
      setFilters(f => ({
        ...f,
        selectedCategory: f.selectedCategory === clicked ? null : clicked
      }));
    }
  };

  return (
    <div style={{ background: theme.bgPage, color: theme.textPrimary, minHeight: '100vh' }}>
      <Header
        filters={filters}
        setFilters={setFilters}
        theme={theme}
        themeMode={themeMode}
        onToggleTheme={() => setThemeMode(t => t === 'light' ? 'dark' : 'light')}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => setFilters(initialFilters)}
      />

      {/* Active filter chip */}
      {filters.selectedCategory && (
        <div
          className="px-6 py-2 border-b text-sm flex items-center gap-2"
          style={{ background: theme.gridline, borderColor: theme.border }}
        >
          <span style={{ color: theme.textSecondary }}>Filtrando por categoria:</span>
          <span
            className="rounded-full px-3 py-0.5 flex items-center gap-2 border"
            style={{ background: theme.bgCard, borderColor: theme.primary, color: theme.textPrimary }}
          >
            {filters.selectedCategory}
            <button
              onClick={() => setFilters(f => ({ ...f, selectedCategory: null }))}
              className="hover:opacity-70"
            >×</button>
          </span>
        </div>
      )}

      <div className="p-6 grid grid-cols-12 gap-4">
        {/* KPIs */}
        <div className="col-span-12 md:col-span-3">
          <KpiCard
            label="Receita Total"
            value={fmtCompact(kpis.revenue) === fmtNumber.format(kpis.revenue)
              ? fmtCurrency.format(kpis.revenue)
              : `R$ ${fmtCompact(kpis.revenue)}`}
            delta={kpis.deltaRevenue}
            sparkline={kpis.sparkline}
            theme={theme}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <KpiCard
            label="Unidades Vendidas"
            value={fmtCompact(kpis.units)}
            delta={8.2}
            theme={theme}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <KpiCard
            label="Ticket Médio"
            value={fmtCurrency.format(kpis.ticketMedio)}
            delta={-2.1}
            theme={theme}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <KpiCard
            label="Categorias Ativas"
            value={fmtNumber.format(new Set(filteredData.map(r => r.category)).size)}
            theme={theme}
          />
        </div>

        {/* Tendência (full width) */}
        <div className="col-span-12">
          <Card theme={theme}>
            <CardHeader
              title="Receita ao longo do tempo"
              subtitle="Evolução mensal"
              theme={theme}
            />
            <div className="h-64">
              {isEmpty ? (
                <EmptyState theme={theme} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.gridline} vertical={false} />
                    <XAxis dataKey="month" stroke={theme.textTertiary} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={theme.textTertiary} fontSize={12} tickLine={false} axisLine={false} tickFormatter={fmtCompact} width={50} />
                    <Tooltip
                      content={(props) => <CustomTooltip {...props} theme={theme} formatter={fmtCurrency.format} />}
                      cursor={{ stroke: theme.textTertiary, strokeDasharray: '3 3' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Receita"
                      stroke={theme.primary}
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Ranking de categorias (cross-filtering) */}
        <div className="col-span-12 md:col-span-7">
          <Card theme={theme}>
            <CardHeader
              title="Receita por categoria"
              subtitle="Clique numa barra para filtrar o dashboard"
              theme={theme}
            />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" onClick={handleCategoryClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.gridline} horizontal={false} />
                  <XAxis type="number" stroke={theme.textTertiary} fontSize={12} tickFormatter={fmtCompact} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" stroke={theme.textTertiary} fontSize={12} width={100} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={(props) => <CustomTooltip {...props} theme={theme} formatter={fmtCurrency.format} />}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="revenue" name="Receita" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          !filters.selectedCategory || filters.selectedCategory === entry.category
                            ? theme.primary
                            : theme.primaryDimmed
                        }
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Distribuição por região */}
        <div className="col-span-12 md:col-span-5">
          <Card theme={theme}>
            <CardHeader title="Distribuição por região" theme={theme} />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    dataKey="revenue"
                    nameKey="region"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {regionData.map((entry, i) => (
                      <Cell key={i} fill={theme.categorical[i % theme.categorical.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => <CustomTooltip {...props} theme={theme} formatter={fmtCurrency.format} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              {regionData.map((r, i) => (
                <div key={r.region} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: theme.categorical[i % theme.categorical.length] }}
                  />
                  <span style={{ color: theme.textSecondary }}>{r.region}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ theme }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <p className="text-sm" style={{ color: theme.textSecondary }}>
        Sem dados para essa combinação de filtros
      </p>
      <p className="text-xs mt-1" style={{ color: theme.textTertiary }}>
        Tente ajustar período ou região no topo
      </p>
    </div>
  );
}
