---
name: dashboard-bi
description: Cria dashboards de Business Intelligence interativos e profissionais em React + Recharts, com cross-filtering (clicar num gráfico filtra os outros), slicers globais no topo, KPI cards, tooltips ricos com comparações e boas práticas visuais (Cleveland-McGill, data-ink ratio, hierarquia tipográfica). Use sempre que o usuário pedir "dashboard", "painel", "BI", "visualização de métricas", "KPIs", "relatório interativo", "painel de indicadores", "dashboard de vendas/marketing/financeiro/operacional/RH", ou quando entregar um conjunto de dados que pede múltiplas visualizações coordenadas — mesmo que ele não diga as palavras "BI" ou "dashboard" explicitamente. Também aplica quando o pedido for "transformar esses dados num painel", "quero ver isso visualmente", "monta uma tela tipo Power BI/Tableau/Looker", ou refinamentos do tipo "deixa mais interativo", "quero clicar e filtrar", "adiciona um card de total".
---

# Dashboard BI

> **Projeto com Design System próprio:** o DS manda no visual. Cor, tema,
> fonte, espaçamento, raio e componentes vêm dele (veja o `CLAUDE.md` e
> `.claude/rules/` do projeto); a paleta, o tema e a tipografia desta skill
> (`references/visual-design.md`, `assets/starter-template.jsx`) só valem
> quando o projeto não tem DS. Desta skill valem sempre: escolha do tipo de
> gráfico, slicers, cross-filter, tooltips e formatação de números. Dentro de
> um app, a entrega é uma tela do app, não um artifact `.jsx` único.

Esta skill ensina o Claude a montar dashboards de Business Intelligence com a mesma sensação de uso de ferramentas profissionais (Power BI, Tableau, Looker, Metabase): layout denso mas legível, gráficos coordenados por cross-filtering, slicers globais que afetam tudo, KPI cards no topo, tooltips informativos e visual limpo (sem chartjunk).

A entrega é sempre um **artifact React (.jsx) único** usando **Recharts + Tailwind**, pois é a stack que o ambiente de artifacts da Claude.ai roda nativamente e que dá o melhor equilíbrio entre poder de interatividade e simplicidade.

## Princípios fundamentais

Antes de escrever qualquer linha de código, internalize estas cinco ideias — elas guiam todas as decisões do resto da skill:

1. **Hierarquia de Cleveland-McGill.** O olho humano compara posições e comprimentos com muito mais precisão do que ângulos, áreas, volumes ou tonalidades de cor. Por isso barras vencem pizzas, e linhas vencem áreas empilhadas para tendências. Quando estiver em dúvida sobre que gráfico usar, escolha o que codifica a informação na posição ou no comprimento.

2. **Data-ink ratio (Tufte).** Toda tinta que não representa dado deve ser questionada: bordas pesadas, gridlines escuras, sombras 3D, legendas redundantes, eixos duplicados, fundos texturizados. Remova ou suavize. Um dashboard BI bom parece "calmo" — o dado salta porque o resto recua.

3. **A pergunta vem antes do gráfico.** Cada visualização responde a uma pergunta de negócio específica ("como minha receita evoluiu?", "quem são meus top clientes?", "onde está o gargalo?"). Se você não consegue formular a pergunta em uma frase, o gráfico provavelmente é supérfluo.

4. **Coordenação é o que diferencia BI de "um monte de gráficos".** O usuário precisa sentir que clicar em qualquer elemento muda o resto da tela. Sem cross-filtering e slicers globais, não é um dashboard BI — é um relatório estático.

5. **Densidade com respiro.** Ferramentas BI são densas (muita informação por pixel) mas não apertadas. Use grid consistente, espaçamento (gap) generoso entre cards, e deixe os números respirarem. Aperto demais lê como planilha; espaço demais lê como apresentação.

## Workflow de criação

Siga estas etapas em ordem. Pular etapas (especialmente as 1 e 2) é a causa #1 de dashboards genéricos.

### 1. Entender o objetivo e a audiência

Antes de codar, identifique:
- **Quem vai olhar?** Executivo (quer KPIs e tendências), analista (quer detalhe e drill), operacional (quer estado atual e alertas).
- **Qual a decisão que esse dashboard apoia?** Se não há decisão, é só um relatório bonito.
- **Quais são as 3-5 perguntas-chave?** Cada uma vira tipicamente um gráfico ou um KPI.

Se o usuário não deixou isso claro e os dados são ambíguos, faça **uma** pergunta curta antes de codar (não cinco). Exemplo: "Esse dashboard é mais para acompanhamento mensal executivo ou exploração diária do time comercial?".

### 2. Escolher as visualizações certas

Para cada pergunta-chave, selecione a visualização adequada. Consulte `references/chart-selection.md` para o mapa completo de "tipo de pergunta → tipo de gráfico". Resumo dos casos mais comuns:

- Tendência ao longo do tempo → **Line chart** (várias séries) ou **Area chart** (uma série com volume)
- Comparação entre categorias → **Bar chart horizontal** ordenado por valor (não pizza)
- Composição (parte do todo) → **Stacked bar** ou **Treemap**, raramente pizza
- Métrica única em destaque → **KPI card** com delta vs período anterior
- Correlação entre duas variáveis → **Scatter plot**
- Densidade/distribuição → **Histograma** ou **Box plot**
- Ranking → **Bar horizontal ordenado** com top N
- Tabela de detalhe → **Tabela** com sorting e formatação numérica

### 3. Definir o layout

Use a anatomia padrão BI (detalhes em `references/layout-composition.md`):

```
┌──────────────────────────────────────────────────────────┐
│  Título · Subtítulo            [Slicers globais aqui]    │  ← header
├──────────────────────────────────────────────────────────┤
│  [KPI 1]   [KPI 2]   [KPI 3]   [KPI 4]                  │  ← linha de KPIs (4-6)
├──────────────────────────────────────────────────────────┤
│  [ Gráfico principal — tendência         ]              │  ← visão macro
├────────────────────────┬─────────────────────────────────┤
│  [ Bar / ranking ]    │  [ Composição / breakdown ]    │  ← duas colunas
├────────────────────────┴─────────────────────────────────┤
│  [ Tabela de detalhe (opcional) ]                       │  ← drill final
└──────────────────────────────────────────────────────────┘
```

A leitura natural ocidental é em F (de cima para baixo, esquerda para direita), então o que mais importa fica em cima e à esquerda.

### 4. Implementar com cross-filtering e slicers

Esta é a parte que diferencia um dashboard BI de slides do PowerPoint. Padrão obrigatório:

- **Slicers globais** no header — Select / chips que setam filtros que afetam **todos** os componentes abaixo.
- **Cross-filtering** — clicar numa barra/fatia/ponto define um filtro temporário; clicar de novo (ou em "Limpar") remove.
- **Estado centralizado** num `useState` no componente raiz, passado como prop para os filhos. Não use Redux/Zustand para um dashboard único — exagero.
- **Feedback visual** — elementos selecionados ficam realçados, não-selecionados ficam com `opacity` reduzido (`opacity-30`), assim o usuário vê o que está filtrando.

A implementação técnica completa, com snippets de Recharts (`onClick`, `Custom Tooltip`, `Cell` colorido condicionalmente, etc.), está em `references/interactivity-patterns.md`. Leia esse arquivo antes de codar a interatividade.

### 5. Aplicar o visual

Detalhes em `references/visual-design.md`. Pontos não-negociáveis:

- **Tema** — Por padrão, **claro** para contextos executivos/corporativos/finanças/relatórios formais; **escuro** para contextos de monitoramento/operação/dados em tempo real/produto interno tech. Se o usuário não disse, escolha pelo contexto e deixe um toggle no canto superior direito (custa pouco e dá controle).
- **Cores** — Uma cor primária para a métrica principal + neutros (cinzas) para o resto. Evite arco-íris. Para categorias, use paleta categórica de no máximo 6 cores distinguíveis para daltônicos.
- **Tipografia** — Use `font-variant-numeric: tabular-nums` em todos os números (alinha as colunas naturalmente). Hierarquia clara: título 24px, KPI 32-40px, labels 12-14px, valores de tabela 14px.
- **Sem chartjunk** — Sem 3D, sem sombras pesadas, sem gradientes decorativos, sem bordas grossas. Gridlines em cinza muito claro (`#E5E7EB` no claro, `#374151` no escuro) ou ausentes.

### 6. Estados e refinamento

Antes de entregar, verifique:
- **Loading state** — Se houver dados assíncronos, esqueleto cinza pulsante.
- **Empty state** — Se um filtro zera os resultados, mostrar mensagem amigável ("Sem dados para essa combinação"), nunca um gráfico vazio.
- **Responsividade** — Em telas pequenas, KPIs viram 2x2, gráficos lado-a-lado empilham. Use `ResponsiveContainer` do Recharts sempre.
- **Acessibilidade básica** — Contraste mínimo AA, foco visível em interativos, `aria-label` em botões só-ícone.

## Stack técnica padrão

Sempre use:

```jsx
import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, BarChart, AreaChart, PieChart,
  Line, Bar, Area, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
```

Tailwind para o resto (layout, cards, tipografia). Não importe libs adicionais sem necessidade real — `lucide-react` para ícones é OK.

Um template inicial completo e funcional está em `assets/starter-template.jsx`. **Leia-o antes de começar do zero** — ele já tem cross-filtering, slicer, tema claro/escuro, KPI cards e custom tooltip implementados corretamente. Adapte-o ao caso do usuário em vez de reescrever do zero.

## Anti-padrões a evitar

Esses são erros recorrentes que descaracterizam o dashboard:

- **Pizza com >5 fatias.** Vira ilegível. Use bar horizontal ordenada.
- **3D em qualquer gráfico.** Distorce percepção de área e volume.
- **Eixo Y começando fora do zero em barras.** Engana visualmente. Em linhas pode, em barras nunca.
- **Cores quentes/frias misturadas sem semântica.** Vermelho deve significar algo (negativo, alerta), não "categoria 3".
- **Legendas longe do gráfico.** Coloque cores diretamente no rótulo da série quando possível.
- **Tooltips genéricos do Recharts.** O default é feio e pouco informativo. Sempre customize com `Custom Tooltip` mostrando valor formatado, contexto e comparação.
- **KPI sem comparação.** "Receita: R$ 1,2M" sozinho não diz nada. Sempre adicione delta ("+12% vs mês anterior").
- **Slicer que não afeta tudo.** Se um filtro global não filtra um dos componentes, o usuário perde a confiança no dashboard inteiro.
- **Dashboards que não cabem na tela sem scroll horizontal.** Use grid responsivo.

## Quando consultar quais referências

| Quando | Leia |
|---|---|
| Escolhendo qual gráfico encaixa em qual pergunta | `references/chart-selection.md` |
| Implementando clique em gráfico, slicer, tooltip rico, estado compartilhado | `references/interactivity-patterns.md` |
| Decidindo grid, espaçamento, ordem dos elementos, KPI cards | `references/layout-composition.md` |
| Definindo paleta, tema claro/escuro, tipografia, formatação numérica | `references/visual-design.md` |
| Precisa de snippets prontos de Recharts (eixos, formatação, cores condicionais) | `references/recharts-cookbook.md` |

## Checklist final antes de entregar

Marque mentalmente cada item antes de fechar o artifact:

- [ ] Há ao menos um slicer global no header que afeta todos os componentes
- [ ] Pelo menos um gráfico é clicável e cross-filtra os outros
- [ ] KPIs no topo têm delta/comparação, não só o número absoluto
- [ ] Tooltips são customizados (não o default do Recharts)
- [ ] Números estão formatados (R$, %, separador de milhar) — não "1234567.89" cru
- [ ] Datas estão formatadas em pt-BR quando aplicável ("jan/24" e não "2024-01-01")
- [ ] Tema claro ou escuro é coerente em todos os componentes
- [ ] Layout não quebra em viewport ~1024px
- [ ] Empty state existe (filtro que zera não mostra gráfico vazio)
- [ ] Nenhum gráfico está usando 3D, gradiente decorativo ou pizza com mais de 5 fatias
