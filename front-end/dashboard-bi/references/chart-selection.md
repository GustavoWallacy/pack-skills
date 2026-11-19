# Seleção de gráficos

> Cada gráfico responde a um tipo específico de pergunta. Escolher o gráfico errado é o erro mais comum em dashboards iniciantes — e o mais fácil de evitar com uma tabela de referência.

## Princípio guia: hierarquia perceptual de Cleveland-McGill

Em ordem decrescente de precisão com que o olho humano decodifica o valor codificado:

1. **Posição em escala comum** (eixos compartilhados) — máxima precisão
2. **Posição em escalas não-alinhadas** — alta
3. **Comprimento** (barras) — alta
4. **Inclinação/ângulo** — média
5. **Área** (bolhas, treemap) — baixa
6. **Volume / 3D** — muito baixa
7. **Tonalidade de cor / saturação** — baixa, melhor para categórico

**Implicação prática:** sempre que possível, codifique a métrica principal em **posição** ou **comprimento**. Use cor e área só como dimensão secundária. É por isso que barras vencem pizzas: barras codificam em comprimento (3), pizzas em ângulo (4) e área (5).

## Tabela de decisão

| Pergunta de negócio | Gráfico recomendado | Quando NÃO usar |
|---|---|---|
| Como X evoluiu ao longo do tempo? | **Line chart** (1-5 séries) | Mais de 5 séries vira espaguete — use small multiples |
| Como X evoluiu, e o volume importa? | **Area chart** | Não use stacked area se as séries oscilam muito (confunde) |
| Como Y se compara entre categorias? | **Bar horizontal**, ordenado por valor | Mais de 20 categorias — use ranking top N + "outros" |
| Quais são os top N? | **Bar horizontal ordenada decrescente** | — |
| Qual a composição (parte do todo) numa categoria? | **Stacked bar** ou **100% stacked bar** | Pizza só com ≤4-5 fatias e diferenças óbvias |
| Como a composição evolui no tempo? | **Stacked area** ou **stacked bar por período** | Stream graph é elegante mas difícil de ler |
| Há correlação entre X e Y? | **Scatter plot** | Tendência forte óbvia — use line. Muitos pontos — use heatmap de densidade |
| Como X se distribui? | **Histograma** ou **box plot** | — |
| Onde estão os outliers? | **Box plot** ou **scatter** | — |
| Métrica única, em destaque, com contexto | **KPI card** com delta + sparkline | Métrica isolada sem comparação não vale a tela |
| Comparação de várias métricas pequenas no tempo | **Small multiples** (grid de mini-line charts) | — |
| Geo (vendas por estado/cidade) | **Choropleth** (mapa) | Se a geografia não importa, prefira bar ordenada |
| Funil de conversão | **Funnel chart** | — |
| Progresso vs meta | **Bullet chart** ou **bar com linha de target** | Gauges/velocímetros são bonitos mas ineficientes |
| Tabela de detalhe com muitos atributos | **Tabela** com sorting, formatação, mini-bars inline | — |

## Exemplos comentados

### Exemplo 1 — "Quero ver receita por região"

❌ **Errado:** pizza chart com 8 fatias coloridas. O olho não consegue comparar fatias de tamanhos próximos, e legendas afastadas exigem ida-e-volta visual.

✅ **Certo:** bar chart horizontal, ordenado por receita decrescente, com valores no fim das barras. O ranking fica óbvio e a comparação de tamanhos é direta.

### Exemplo 2 — "Quero comparar a evolução de 8 produtos no ano"

❌ **Errado:** line chart com 8 linhas coloridas — vira espaguete. Mesmo com cores diferentes, é impossível seguir uma linha específica.

✅ **Certo:** **small multiples** — uma grade de 8 mini-line charts pequenos, cada um com sua linha + uma linha cinza de referência (média geral). Padrão usado por NYT, FT, Bloomberg.

Alternativa se o usuário quer ver na mesma tela: line chart com **highlighting on hover** — todas as linhas em cinza, exceto a destacada que vira colorida.

### Exemplo 3 — "Mostre a participação de cada categoria nas vendas"

❌ **Errado:** pizza com 6 fatias quase iguais. Imposível dizer qual é maior.

✅ **Certo:** **bar horizontal ordenada com %** ao lado. Ou **100% stacked bar horizontal** se quiser preservar a noção de "soma 100%".

### Exemplo 4 — "Como anda o NPS este mês?"

❌ **Errado:** velocímetro/gauge de 0 a 100 mostrando 72. Ocupa espaço enorme para codificar um único número.

✅ **Certo:** **KPI card** com:
- Número grande: `72`
- Label: `NPS`
- Delta: `↑ 4 pontos vs mês anterior` (verde se melhorou)
- Sparkline pequena de 12 meses embaixo

## Casos especiais e nuances

**Pizza chart — quando aceitar?** Apenas com:
- 2-4 fatias no máximo
- Diferenças de tamanho claramente visíveis (não 30/28/25/17)
- Quando o significado de "parte do todo" é central à mensagem

Caso contrário, sempre prefira bar.

**Eixo Y começando em zero — quando obrigatório?** Em **barras**, sim, sempre. Cortar o eixo distorce a percepção do comprimento, que é justamente a codificação visual da barra. Em **linhas**, não é obrigatório — linhas codificam em posição relativa, e cortar pode revelar variação importante. Mas indique claramente o range.

**Dual axis (dois eixos Y) — perigoso.** Permite manipulação visual: dá pra "criar correlação" só ajustando escalas. Use só quando as duas métricas têm relação semântica clara (ex.: receita e margem %, ambas no tempo) e prefira escalas que façam sentido naturalmente.

**Heatmap — quando brilha?** Para matrizes densas: cohort retention, calendar heatmap (atividade por dia/hora), correlação entre múltiplas variáveis. Não use para 5x5 onde uma tabela colorida resolve.

**Treemap — quando usar?** Hierarquia parte-do-todo com muitos elementos (>10) onde pizza/barras quebrariam. Útil mas exige rótulo claro, pois área é codificação imprecisa.

## Combinações poderosas

Dashboards BI fortes raramente usam um tipo só. Combinações que funcionam:

- **KPI cards no topo + line chart abaixo** — visão executiva clássica
- **Bar ranking + tabela de detalhe** — usuário clica numa barra, tabela filtra
- **Line chart de tendência + bar de composição lado a lado** — "como evoluiu" + "do que é feito"
- **Mapa + bar ordenada** — geo + ranking, ambos cross-filtrados
- **Scatter + histograma marginal** — distribuição com contexto

Boas referências externas: Storytelling with Data (Knaflic), The Visual Display of Quantitative Information (Tufte), Show Me the Numbers (Few).
