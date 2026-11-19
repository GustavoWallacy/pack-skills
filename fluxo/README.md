# Fluxo de trabalho com o Claude

Pensar antes de construir, planejar, e manter o `CLAUDE.md` saudável.

| Skill | Para quê | Onde está | Licença |
|---|---|---|---|
| [`brainstorm`](brainstorm/) | questiona uma ideia (método socrático) antes de planejar | 📁 aqui | MIT |
| `gsd-core` | GSD (Get Shit Done): planeja em fases, executa com commits pequenos e verifica cada fase | 🔗 [open-gsd/gsd-core](https://github.com/open-gsd/gsd-core) | MIT |
| `find-skills` | procura e recomenda skills no ecossistema skills.sh | 🔗 [vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills) | MIT |
| `claude-md-improver` | audita o `CLAUDE.md` e propõe correções pontuais | 🔗 [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-md-management/skills/claude-md-improver) | Apache-2.0 |
| `agent-md-refactor` | divide `CLAUDE.md`/`AGENTS.md` inchado em arquivos por assunto | 🔗 [softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit/tree/main/skills/agent-md-refactor) | MIT |

## Instalar

```bash
npx skills add GustavoWallacy/claude-skills --skill brainstorm -a claude-code
npx skills add vercel-labs/skills --skill find-skills -a claude-code
npx skills add anthropics/claude-plugins-official --skill claude-md-improver -a claude-code
npx skills add softaworks/agent-toolkit --skill agent-md-refactor -a claude-code
```

**GSD tem instalador próprio** (o autor pede para não copiar os arquivos à
mão). Ele pergunta o agente (escolha Claude Code) e se instala no projeto ou
no usuário:

```bash
npx @opengsd/gsd-core@latest
```

Links das skills de terceiros: [`externas.yaml`](externas.yaml).
