# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto do projeto

Site pessoal "currículo vivo" de Bruno Massa (brunomassa.online). Substitui o "Sobre Mim" estático do LinkedIn — trajetória profissional em tempo real. O dono **não é programador**: priorize caminhos seguros, alerte riscos, e nunca execute ação irreversível sem confirmação explícita.

## Comandos

```bash
npm run dev       # servidor local em http://localhost:4321
npm run build     # gera HTML estático em dist/
npm run preview   # serve a build local para inspeção
```

Não há testes automatizados nem linter configurado. Verificação é visual via `npm run dev`.

## Arquitetura

**Stack:** Astro 4.16 (estático) + Tailwind 3.4. Deploy na Vercel via push no GitHub. Conteúdo editável pelo Decap CMS em `/admin` (ainda a configurar).

**Fluxo de dados:** todo conteúdo vive em `src/content/` como arquivos Markdown com frontmatter tipado. As páginas leem as coleções com `getCollection()` do Astro e geram HTML estático no build. Não há banco de dados nem API em runtime.

**Coleções (`src/content/config.ts`):**

| Coleção | Arquivo | Uso |
|---|---|---|
| `timeline` | um por cargo/marco | Trajetória profissional em `/timeline` |
| `projetos` | um por projeto | Cases com status, papel, resultados em `/projetos` |
| `skills` | um por item | Habilidades, certificações, formações em `/skills` |
| `posts` | um por artigo | Conteúdo autoral longo em `/posts` |
| `atualizacoes` | um por nota | Feed cronológico curto exibido na home |
| `agora` | `index.md` único | Página /agora (now page), atualizada mensalmente |

**Páginas (`src/pages/`):**

- `index.astro` — home: projetos ativos + feed de atualizações recentes
- `timeline.astro` — todos os itens de `timeline`, ordenados por `inicio` desc
- `projetos/index.astro` e `projetos/[slug].astro` — listagem e detalhe
- `posts/index.astro` e `posts/[slug].astro` — listagem e detalhe
- `skills.astro` e `agora.astro` — páginas únicas
- `contato.astro` — esqueleto

**Layout:** `BaseLayout.astro` recebe `title` e `descricao` opcionais; monta `<head>` com meta tags OG e canonical. Header e Footer são componentes separados injetados em cada página.

## Convenções de conteúdo

- Datas no frontmatter em formato `YYYY-MM-DD`
- Campos `destaque: true` aparecem em destaque na home (filtro a implementar)
- `projetos` com `status: 'em-andamento'` aparecem na seção "Acontecendo agora" da home
- `agora` tem arquivo único — editar `src/content/agora/index.md` e atualizar `atualizado_em`
- Seeds de exemplo em `src/content/*/01-exemplo.md` — podem ser apagados quando conteúdo real for adicionado

## Estado atual e próximas etapas

- **Funcional:** estrutura de coleções, páginas em esqueleto, build funcionando
- **A fazer (em ordem):** Decap CMS em `/admin`, deploy Vercel + DNS Hostinger, identidade visual
- **Design:** intencionalmente adiado — Tailwind sem customizações ainda. Não adicionar estilos visuais antes do dono aprovar a fase de design
- **i18n:** configurado no `astro.config.mjs` (`pt` default, `en` previsto) mas páginas ainda são somente PT

## Regras de operação

- Autenticação GitHub: sempre `gh auth login`, nunca PAT colado no terminal
- Antes de qualquer comando que afeta o sistema, explicar em 1 linha o que vai acontecer
- Repo: `github.com/Bruno-Massa-Online/site-principal` — branch `main`
