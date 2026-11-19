-- =============================================================================
-- introspection-queries.sql
-- Queries canônicas de PostgreSQL para mapear o schema e fazer profiling.
-- Copie e adapte os nomes de schema/tabela/coluna. Tudo aqui é SOMENTE LEITURA.
-- Substitua 'public' pelo schema alvo e '<tabela>' / '<coluna>' conforme o caso.
-- =============================================================================


-- =============================================================================
-- PARTE A — MAPEAR O SCHEMA (Fase 1)
-- =============================================================================

-- A1. Teste de conexão.
SELECT version();

-- A2. Schemas disponíveis (ignore os de sistema).
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
  AND schema_name NOT LIKE 'pg_%'
ORDER BY schema_name;

-- A3. Tabelas com estimativa de linhas e tamanho (barato — usa o catálogo).
--     reltuples é uma ESTIMATIVA (atualizada por ANALYZE/autovacuum), ideal pra
--     tabelas grandes onde COUNT(*) seria caro.
SELECT
    n.nspname                                   AS schema,
    c.relname                                   AS tabela,
    CASE c.relkind WHEN 'r' THEN 'table'
                   WHEN 'p' THEN 'partitioned'
                   WHEN 'v' THEN 'view'
                   WHEN 'm' THEN 'matview'
                   WHEN 'f' THEN 'foreign' END   AS tipo,
    c.reltuples::bigint                          AS linhas_estimadas,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS tamanho_total
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
ORDER BY pg_total_relation_size(c.oid) DESC;

-- A4. Colunas, tipos, nulabilidade e default de UMA tabela.
SELECT
    column_name      AS coluna,
    data_type        AS tipo,
    character_maximum_length AS tam_max,
    is_nullable      AS aceita_null,
    column_default   AS valor_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = '<tabela>'
ORDER BY ordinal_position;

-- A5. Chaves primárias de todas as tabelas do schema.
SELECT
    tc.table_name    AS tabela,
    kcu.column_name  AS coluna_pk
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name
 AND kcu.table_schema    = tc.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema    = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- A6. Chaves estrangeiras = o MAPA DAS RELAÇÕES do domínio. Leia com atenção.
SELECT
    tc.table_name        AS tabela_origem,
    kcu.column_name      AS coluna_origem,
    ccu.table_name       AS tabela_destino,
    ccu.column_name      AS coluna_destino
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema    = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- A7. Índices (ajudam a entender o que já é consultado e o que é barato filtrar).
SELECT
    tablename AS tabela,
    indexname AS indice,
    indexdef  AS definicao
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- A8. Views e materialized views já existentes (não reinvente o que já existe).
SELECT table_name AS view, view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- A9. Funções e procedures — costumam codificar REGRAS DE NEGÓCIO. Liste e leia
--     as relevantes (atribuição, consolidação, filas, triggers etc.).
SELECT
    p.proname                         AS funcao,
    pg_get_function_arguments(p.oid)  AS argumentos,
    pg_get_function_result(p.oid)     AS retorno
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- A9b. Corpo de UMA função específica (pra ler a regra embutida).
SELECT pg_get_functiondef('public.<nome_funcao>'::regprocedure);

-- A10. Colunas de data/timestamp em todo o schema — candidatas a eixo temporal
--      das métricas. Saber quais existem orienta toda análise de tendência/coorte.
SELECT table_name AS tabela, column_name AS coluna, data_type AS tipo
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type IN ('timestamp without time zone', 'timestamp with time zone',
                    'date', 'time without time zone', 'time with time zone')
ORDER BY table_name, column_name;


-- =============================================================================
-- PARTE B — PROFILING DOS DADOS (Fase 2) — o que REALMENTE está lá dentro
-- =============================================================================

-- B1. Contagem exata (use só em tabelas pequenas/médias).
--     Em tabelas grandes, use reltuples da query A3 em vez desta.
SELECT COUNT(*) AS linhas FROM public."<tabela>";

-- B2. Janela temporal: período coberto pela tabela. Define a granularidade viável.
SELECT
    MIN("<coluna_data>") AS primeiro_registro,
    MAX("<coluna_data>") AS ultimo_registro,
    COUNT(*)             AS total
FROM public."<tabela>";

-- B3. Perfil de UMA coluna: nulos, distintos e taxa de preenchimento.
--     Uma coluna muito nula ou pouco distinta limita as métricas possíveis.
SELECT
    COUNT(*)                                              AS total,
    COUNT("<coluna>")                                    AS preenchidos,
    COUNT(*) - COUNT("<coluna>")                          AS nulos,
    ROUND(100.0 * COUNT("<coluna>") / NULLIF(COUNT(*),0), 1) AS pct_preenchido,
    COUNT(DISTINCT "<coluna>")                            AS distintos
FROM public."<tabela>";

-- B4. Distribuição de coluna de BAIXA cardinalidade (status, tipo, canal, etapa,
--     origem...). É daqui que saem segmentações e as ETAPAS DO FUNIL.
--     Não invente as etapas — leia-as aqui.
SELECT
    "<coluna_categorica>"                                AS valor,
    COUNT(*)                                             AS qtd,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)   AS pct
FROM public."<tabela>"
GROUP BY "<coluna_categorica>"
ORDER BY qtd DESC;

-- B5. Top valores de coluna de ALTA cardinalidade (limite pra não despejar tudo).
SELECT "<coluna>" AS valor, COUNT(*) AS qtd
FROM public."<tabela>"
GROUP BY "<coluna>"
ORDER BY qtd DESC
LIMIT 25;

-- B6. Estatística de coluna numérica (faixa, média, mediana, dispersão).
SELECT
    MIN("<coluna_num>")                                       AS minimo,
    MAX("<coluna_num>")                                       AS maximo,
    ROUND(AVG("<coluna_num>")::numeric, 2)                    AS media,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "<coluna_num>") AS mediana,
    ROUND(STDDEV("<coluna_num>")::numeric, 2)                 AS desvio_padrao,
    COUNT(*) FILTER (WHERE "<coluna_num>" < 0)                AS negativos,
    COUNT(*) FILTER (WHERE "<coluna_num>" = 0)                AS zeros
FROM public."<tabela>";

-- B7. Volume por período (sanidade temporal + base pra métricas de tendência).
SELECT
    DATE_TRUNC('month', "<coluna_data>") AS mes,
    COUNT(*)                             AS qtd
FROM public."<tabela>"
GROUP BY 1
ORDER BY 1;


-- =============================================================================
-- PARTE C — SANIDADE E QUALIDADE DE DADO (Fase 2)
-- =============================================================================

-- C1. Duplicatas em uma chave natural (ex.: email, documento, id externo).
SELECT "<chave_natural>" AS valor, COUNT(*) AS ocorrencias
FROM public."<tabela>"
GROUP BY "<chave_natural>"
HAVING COUNT(*) > 1
ORDER BY ocorrencias DESC
LIMIT 25;

-- C2. Linhas órfãs: FK que aponta pra um pai inexistente (quebra de integridade).
SELECT COUNT(*) AS orfaos
FROM public."<tabela_filho>" f
LEFT JOIN public."<tabela_pai>" p
  ON p."<pk_pai>" = f."<fk_filho>"
WHERE f."<fk_filho>" IS NOT NULL
  AND p."<pk_pai>" IS NULL;

-- C3. Registros suspeitos: datas no futuro (possível erro de carga/migração).
SELECT COUNT(*) AS datas_no_futuro
FROM public."<tabela>"
WHERE "<coluna_data>" > NOW();

-- C4. Frescor: há quanto tempo entrou o último registro? (detecta pipeline parado.)
SELECT
    MAX("<coluna_data>")                  AS ultimo_registro,
    NOW() - MAX("<coluna_data>")          AS tempo_desde_ultimo
FROM public."<tabela>";


-- =============================================================================
-- DICAS DE PERFORMANCE (banco de produção)
-- - Tabela grande? Use reltuples (A3) no lugar de COUNT(*) (B1).
-- - Amostragem barata pra perfilar tabela enorme:
--       SELECT * FROM public."<tabela>" TABLESAMPLE SYSTEM (1) LIMIT 1000;
-- - Sempre LIMIT em exploração; agregue em vez de despejar linhas.
-- - Cheque o plano antes de rodar algo potencialmente caro: EXPLAIN <query>;
-- =============================================================================
