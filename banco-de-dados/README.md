# Banco de dados

SQL, schema, desempenho e métricas tiradas do banco.

| Skill | Para quê | Onde está | Licença |
|---|---|---|---|
| [`metrics-analyst`](metrics-analyst/) | lê o schema e os dados reais e propõe métricas/KPIs priorizados, com SQL pronto | 📁 aqui | MIT |
| `supabase-postgres-best-practices` | Postgres: queries, índices, schema, RLS e desempenho | 🔗 [supabase/agent-skills](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices) | MIT |

> Projeto do template `claude-start-project` com banco SQL: a
> `supabase-postgres-best-practices` é a skill padrão do hook `sql-skill`
> (SQL sem ela carregada é bloqueado).

## Instalar

```bash
npx skills add GustavoWallacy/claude-skills --skill metrics-analyst -a claude-code
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices -a claude-code
```

Links das skills de terceiros: [`externas.yaml`](externas.yaml).
