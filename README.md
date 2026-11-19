# claude-skills

As skills de Claude Code que eu mais uso, separadas por assunto. É a base
de referência do template
[`claude-start-project`](https://github.com/GustavoWallacy/claude-start-project):
na entrevista do `/start-project`, cada categoria daqui vira uma pergunta.

## Categorias

| Pasta | Assunto | Skills |
|---|---|---|
| [`front-end/`](front-end/) | telas, dashboards, direção visual | dashboard-bi 📁 · apple-hig-designer 📁 · frontend-design 🔗 · ui-ux-pro-max 🔗 |
| [`banco-de-dados/`](banco-de-dados/) | SQL, schema, métricas do banco | metrics-analyst 📁 · supabase-postgres-best-practices 🔗 |
| [`seguranca/`](seguranca/) | escrever e revisar código sensível | security-and-hardening 🔗 · security-review 🔗 |
| [`fluxo/`](fluxo/) | pensar, planejar, manter o CLAUDE.md | brainstorm 📁 · gsd-core 🔗 · find-skills 🔗 · claude-md-improver 🔗 · agent-md-refactor 🔗 |
| [`marketing/`](marketing/) | texto de página, preço, SEO | copywriting 🔗 · marketing-psychology 🔗 · pricing 🔗 · seo-audit 🔗 |

📁 **a skill está neste repositório** · 🔗 **só o endereço**: instala direto
da origem, sempre na versão mais nova.

## Como instalar uma skill

Precisa de [Node.js](https://nodejs.org). Na raiz do projeto:

```bash
# skill que está aqui (📁)
npx skills add GustavoWallacy/claude-skills --skill brainstorm -a claude-code

# skill de terceiros (🔗): o comando de cada uma está no README da categoria
npx skills add coreyhaines31/marketingskills --skill copywriting -a claude-code
```

A skill vai para `.claude/skills/<nome>/` do projeto. Acrescente `-g` para
instalar no seu usuário (vale para todos os projetos).

Sem Node: baixe o repositório (**Code → Download ZIP**) e copie a pasta da
skill para `.claude/skills/` do projeto.

## Estrutura

```
<categoria>/
  README.md        o que tem na categoria e o comando de cada skill
  externas.yaml    endereço das skills de terceiros (repositório + pasta)
  <skill>/         skill guardada aqui, com SKILL.md
```

O `/start-project` lê os `externas.yaml` para instalar as 🔗 — mantenha os
campos do modelo em [`front-end/externas.yaml`](front-end/externas.yaml).

## Adicionar uma skill

1. Escolha a categoria (ou crie uma pasta nova com `README.md` e
   `externas.yaml`).
2. **Sua?** Coloque a pasta da skill dentro da categoria.
   **De terceiros?** Acrescente no `externas.yaml` e confira a licença da
   origem.
3. Atualize o `README.md` da categoria e a tabela acima.
4. Branch + pull request.

## Licença

[MIT](LICENSE) para as skills deste repositório. `apple-hig-designer` tem a
licença do autor na própria pasta. As 🔗 seguem a licença de cada origem.
