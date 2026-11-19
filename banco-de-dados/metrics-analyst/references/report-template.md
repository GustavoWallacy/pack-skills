# Template do relatório de métricas

Use esta estrutura na **fase 7**. Adapte os nomes/temas ao projeto real. O relatório
vai em Markdown; o SQL pode vir embutido no relatório (em blocos por métrica) ou em
arquivo separado, conforme o usuário preferir. Mantenha o idioma do usuário (PT-BR).

---

## Estrutura

```markdown
# Proposta de métricas — <nome do projeto/sistema>

## Resumo executivo
2–4 frases: o que foi analisado (quais tabelas/escopo), o que os dados permitem
medir hoje, e a recomendação principal (as 2–3 métricas de maior impacto). Sem
enrolação — quem ler só isto já sabe o essencial.

## O que os dados mostram
Achados rápidos do profiling que JUSTIFICAM as escolhas adiante. Ex.: período
coberto, volume, qualidade encontrada, etapas reais do funil, surpresas. Isto é o
que torna a proposta confiável — você viu os dados, não chutou.

## Métricas priorizadas
Tabela ranqueada por impacto × viabilidade.

| # | Métrica | O que mede / decisão que informa | Impacto | Viabilidade | Status |
|---|---------|----------------------------------|---------|-------------|--------|
| 1 | Taxa de conversão lead→venda por canal | Onde investir aquisição | Alto | Alta | Pronta |
| 2 | Tempo de resposta ao lead (mediano) | Priorizar SLA de atendimento | Alto | Alta | Pronta |
| 3 | % de leads sem vendedor | Furo no rodízio de atribuição | Médio | Alta | Pronta |
| … | … | … | … | … | … |

Status = **Pronta** (SQL definitivo) ou **Pendente** (depende de uma resposta da
seção "Perguntas em aberto").

## Detalhamento por tema
Para cada tema (Aquisição/Funil, Conversão, Performance de vendedor, Receita,
Saúde operacional...), liste as métricas com:

### <Tema>
**<Nome da métrica>**
- **Mede:** ...
- **Por que importa:** que decisão/ação ela informa.
- **Viabilidade:** o que nos dados a sustenta (ou o que falta).
- **Definição:** a regra exata de cálculo (numerador/denominador, filtros, janela).
- **SQL:**
  ```sql
  CREATE OR REPLACE VIEW vw_<nome> AS
  ...
  ```
  (marque [PRONTA] ou [PENDENTE — depende de Q<n>])

## Recomendações de instrumentação
Métricas de alto valor que NÃO dá pra medir hoje por falta de dado. Para cada uma:
o que precisaria ser capturado e por quê. Isto vira backlog de produto/dados.

## Apêndice — métricas secundárias
Candidatas de menor prioridade, listadas brevemente, pra não perder ideias.

## Perguntas em aberto
3–7 perguntas, cada uma amarrada a uma decisão de métrica. Formato:

**Q1. <pergunta específica>**
- *Por quê:* o que a resposta destrava (qual métrica/definição muda).
- *Default sugerido:* o que assumo se não houver resposta.
```

---

## Princípios de redação do relatório

- **Resumo executivo primeiro, sempre.** Quem decide lê só ele.
- **Toda métrica conecta a uma decisão.** Se você não consegue escrever a linha "por que importa", a métrica provavelmente não deveria estar na lista.
- **Honestidade sobre viabilidade.** "Não dá pra medir hoje" é uma resposta válida e útil — melhor que uma métrica frágil.
- **SQL pronto pra colar.** Respeite as convenções observadas no projeto (prefixos `vw_`/`fn_`, nomes em português, schema). Marque o que é definitivo vs. pendente.
- **Não despeje tudo.** Curadoria é o valor. O apêndice existe pra guardar o resto sem poluir a proposta principal.
