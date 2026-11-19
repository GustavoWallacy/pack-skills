# Segurança

> **Já vêm no template [`claude-start-project`](https://github.com/GustavoWallacy/claude-start-project)**,
> junto com a regra e o hook que obrigam o uso. Listadas aqui para instalar
> em projeto que não usa o template.

| Skill | Para quê | Onde está | Licença |
|---|---|---|---|
| `security-and-hardening` | **antes de escrever** código sensível: modelo de ameaça + regras "sempre / pergunte antes / nunca" | 🔗 [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills/tree/main/skills/security-and-hardening) | MIT |
| `security-review` | **antes de entregar**: revisa o diff seguindo o dado e só reporta o que é explorável | 🔗 [getsentry/skills](https://github.com/getsentry/skills/tree/main/skills/security-review) | Apache-2.0 |

## Instalar

```bash
npx skills add addyosmani/agent-skills --skill security-and-hardening -a claude-code
npx skills add getsentry/skills --skill security-review -a claude-code
```

Links: [`externas.yaml`](externas.yaml).
