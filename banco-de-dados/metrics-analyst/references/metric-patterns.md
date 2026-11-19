# Catálogo de arquétipos de métricas

Use este catálogo na **fase 4** como checklist: percorra cada arquétipo e pergunte
"isto se aplica e é mensurável com os dados que perfilei?". O objetivo é não
esquecer categorias inteiras de métrica. Cada arquétipo traz o que responde, a
fórmula e um esboço de SQL em PostgreSQL pra adaptar.

## Índice
1. Volume / contagem
2. Taxas e razões
3. Funil / progressão de etapas
4. Velocidade / tempo em etapa
5. Tendência / crescimento
6. Coorte / retenção
7. Atribuição
8. Concentração / Pareto / per-entidade
9. Distribuição / outliers
10. Qualidade de dado
11. Seção específica: vendas / marketing / CRM

---

## 1. Volume / contagem
**Responde:** "quanto de X aconteceu?" A base de quase tudo.
**Fórmula:** `COUNT(*)`, geralmente quebrado por período e/ou segmento.
```sql
SELECT DATE_TRUNC('month', created_at) AS mes,
       COUNT(*) AS qtd
FROM leads
GROUP BY 1 ORDER BY 1;
```
**Quando vale:** sempre como linha de base, mas sozinha é fraca — combine com taxas e tendência.

## 2. Taxas e razões
**Responde:** "que fração de X virou Y?" Conversão, win rate, churn, aproveitamento.
**Fórmula:** `numerador / denominador`. **O ponto crítico é definir os dois corretamente** — é onde a definição de negócio entra (ver perguntas da fase 6).
```sql
SELECT
    COUNT(*) FILTER (WHERE status = 'ganho')           AS ganhos,
    COUNT(*)                                           AS total,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status='ganho')
          / NULLIF(COUNT(*),0), 2)                     AS taxa_conversao_pct
FROM negocios;
```
**Cuidado:** sempre `NULLIF(denominador, 0)` pra não dividir por zero.

## 3. Funil / progressão de etapas
**Responde:** "onde os registros caem entre uma etapa e a próxima?" Mostra o gargalo.
**Fórmula:** contagem por etapa + taxa de passagem entre etapas consecutivas.
As **etapas você lê do profiling** (B4), não inventa.
```sql
WITH por_etapa AS (
    SELECT etapa, COUNT(*) AS qtd
    FROM negocios GROUP BY etapa
)
SELECT etapa, qtd,
       ROUND(100.0 * qtd / NULLIF(LAG(qtd) OVER (ORDER BY ordem_etapa),0), 1)
         AS passagem_da_etapa_anterior_pct
FROM por_etapa
JOIN dim_etapas USING (etapa)   -- ou um CASE pra ordenar as etapas
ORDER BY ordem_etapa;
```
**Quando vale:** quase sempre em CRM/vendas — é a métrica que aponta o que consertar.

## 4. Velocidade / tempo em etapa
**Responde:** "quanto tempo leva entre dois eventos?" Tempo de resposta a lead, ciclo de venda, tempo até primeiro contato.
**Fórmula:** diferença entre dois timestamps, agregada (mediana é melhor que média — robusta a outliers).
```sql
SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (data_fechamento - data_criacao))/86400
    ) AS ciclo_mediano_dias
FROM negocios
WHERE data_fechamento IS NOT NULL;
```
**Quando vale:** tempo de resposta a lead é um dos maiores preditores de conversão — quase sempre vale medir.

## 5. Tendência / crescimento
**Responde:** "está subindo ou descendo?" MoM, WoW, média móvel.
**Fórmula:** valor do período vs período anterior (`LAG`), ou média móvel (`AVG OVER`).
```sql
SELECT mes, qtd,
       ROUND(100.0 * (qtd - LAG(qtd) OVER (ORDER BY mes))
             / NULLIF(LAG(qtd) OVER (ORDER BY mes),0), 1) AS variacao_mom_pct
FROM (
    SELECT DATE_TRUNC('month', created_at) AS mes, COUNT(*) AS qtd
    FROM vendas GROUP BY 1
) t
ORDER BY mes;
```
**Cuidado:** período corrente incompleto distorce a comparação — exclua ou anote.

## 6. Coorte / retenção
**Responde:** "grupos que entraram juntos se comportam diferente ao longo do tempo?"
**Fórmula:** agrupar entidades pela data de entrada (coorte) e medir atividade nos períodos seguintes.
```sql
SELECT
    DATE_TRUNC('month', primeira_compra) AS coorte,
    COUNT(DISTINCT cliente_id)           AS clientes_na_coorte
FROM (
    SELECT cliente_id, MIN(data) AS primeira_compra
    FROM vendas GROUP BY cliente_id
) t
GROUP BY 1 ORDER BY 1;
```
**Quando vale:** se houver entidade recorrente (cliente, conta) e eventos repetidos. Pode não se aplicar a funil puramente transacional.

## 7. Atribuição
**Responde:** "qual canal/origem/vendedor recebe o crédito por um resultado?"
**Fórmula:** ligar o resultado (venda) ao toque relevante. **Modelos diferentes dão respostas diferentes** — first-touch, last-touch, multi-touch — e a escolha é decisão de negócio (pergunta da fase 6).
```sql
-- last-touch simples: crédito ao canal do último toque antes da venda
SELECT canal_origem, COUNT(*) AS vendas_atribuidas,
       SUM(valor)            AS receita_atribuida
FROM vendas
GROUP BY canal_origem
ORDER BY receita_atribuida DESC;
```
**Cuidado:** janela de atribuição (quantos dias o toque "conta") precisa ser definida.

## 8. Concentração / Pareto / per-entidade
**Responde:** "está concentrado em poucos?" Top-N vendedores/canais/produtos, regra 80/20, carga por vendedor.
**Fórmula:** ranquear entidades por uma métrica e olhar a participação acumulada.
```sql
SELECT vendedor_id,
       COUNT(*)                                            AS vendas,
       SUM(valor)                                          AS receita,
       ROUND(100.0 * SUM(valor) / SUM(SUM(valor)) OVER (), 1) AS pct_receita,
       SUM(SUM(valor)) OVER (ORDER BY SUM(valor) DESC)
         / SUM(SUM(valor)) OVER () * 100                   AS pct_acumulado
FROM vendas
GROUP BY vendedor_id
ORDER BY receita DESC;
```
**Quando vale:** em operações com fila/rodízio de vendedores, medir **balanceamento de carga** é muito relevante (ex.: detectar vendedor inativo recebendo leads, distribuição desigual).

## 9. Distribuição / outliers
**Responde:** "como os valores se espalham? há extremos?" Ticket médio vs mediana, valores anômalos.
**Fórmula:** percentis e contagem de extremos.
```sql
SELECT
    PERCENTILE_CONT(ARRAY[0.25,0.5,0.75,0.95]) WITHIN GROUP (ORDER BY valor) AS p25_p50_p75_p95
FROM vendas;
```
**Quando vale:** quando média esconde a realidade (poucos negócios enormes puxando a média).

## 10. Qualidade de dado
**Responde:** "dá pra confiar nos números?" É métrica E pré-requisito das outras.
**Fórmula:** % de nulos em campos-chave, duplicatas, órfãos, registros stale, datas inválidas (queries da PARTE C do SQL de introspecção).
```sql
SELECT
    ROUND(100.0 * COUNT(*) FILTER (WHERE vendedor_id IS NULL)
          / NULLIF(COUNT(*),0), 1) AS pct_leads_sem_vendedor
FROM leads;
```
**Quando vale:** sempre proponha pelo menos uma — métrica calculada sobre dado sujo engana. Costuma render as melhores perguntas pro negócio também.

---

## 11. Seção específica: vendas / marketing / CRM

Mapeamento dos arquétipos acima para entidades típicas deste domínio (leads,
vendedores, campanhas, atribuição, checkout/vendas, filas). Trate como sugestões
a validar contra o schema real, não como verdade.

**Aquisição / topo de funil**
- Leads novos por período, por origem/canal/campanha (arquétipo 1 + 2).
- Custo por lead / CAC — *só se houver dado de investimento* (senão, vira recomendação de instrumentação).
- Distribuição de leads por origem (arquétipo 4-B / 8).

**Conversão / funil**
- Taxa de conversão por etapa do funil (arquétipo 3) — o gargalo.
- Taxa lead→venda geral e por canal/vendedor/campanha (arquétipo 2 + 7).
- Win rate por vendedor (arquétipo 2 + 8).

**Velocidade**
- Tempo de resposta ao lead (criação → primeiro contato/atribuição) (arquétipo 4) — alto valor.
- Ciclo de venda (criação → fechamento), mediano (arquétipo 4).
- Tempo parado em cada etapa (detecta negócios "esquecidos").

**Performance de vendedor / fila**
- Receita e nº de vendas por vendedor (arquétipo 8).
- Balanceamento da fila/rodízio: leads recebidos por vendedor, e se vendedor inativo está recebendo (arquétipo 8 + 10) — relevante em sistemas de atribuição automática.
- Ticket médio por vendedor (arquétipo 9).

**Receita**
- Receita por período + tendência MoM (arquétipo 5).
- Receita por canal/campanha/produto (arquétipo 7 + 8).
- Ticket médio vs mediana (arquétipo 9).

**Atribuição**
- Vendas/receita por canal de origem, com modelo e janela definidos (arquétipo 7).
- Tratamento de casos especiais de afiliado/origem que fogem do fluxo padrão — confirme a regra no código/com o usuário.

**Saúde operacional / qualidade**
- % de leads sem vendedor atribuído (arquétipo 10).
- Duplicidade de leads (mesmo email/telefone/documento) (arquétipo 10).
- Frescor do pipeline: último lead/venda inserido (detecta automação/ingestão parada) (arquétipo 10).
- Linhas órfãs entre venda e lead/vendedor (integridade) (arquétipo 10).
