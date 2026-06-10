# Como retomar este projeto (em qualquer computador)

> Guia que vive dentro do projeto e vai junto pro GitHub. **Atualizado a cada deploy.**

## O que é

**brunomassa.online** — site "currículo vivo" do Bruno + um **CMS próprio ("Painel")** sendo construído para substituir o TinaCMS. Objetivo: administrar todo o conteúdo e a estrutura do site como num "WordPress pessoal", com módulos de IA no futuro (gerar conteúdo para redes sociais, analytics com sugestões).

## Onde mora (IMPORTANTE)

- **Casa do projeto = GitHub:** `github.com/brunomassa01/site-principal` (sua conta). É de lá que se abre em qualquer computador.
- **Deploy:** Vercel publica automático no push da `main`. Site no ar: **brunomassa.online**.
- **Cópia de trabalho = pasta LOCAL** (hoje em `C:\dev\site-principal`). É descartável — pode apagar quando quiser; o projeto está salvo no GitHub.
- **NÃO usar o Google Drive para rodar o projeto.** Foi testado: o sistema de arquivos do Drive **corrompe o `node_modules`** (erros de escrita) e não aceita atalhos. O Drive serve só para material de apoio (pasta `referencias/`).

## Setup numa máquina nova

1. Instalar **Node 20.x** e **Git**.
2. Clonar e entrar na pasta:
   ```
   git clone https://github.com/brunomassa01/site-principal.git
   cd site-principal
   ```
3. Instalar dependências:
   ```
   npm install --legacy-peer-deps
   ```
4. Criar um arquivo `.env` (copiando de `.env.example`) com:
   - `DATABASE_URL` (Neon, string **pooled** — host com `-pooler`)
   - `DATABASE_URL_UNPOOLED` (Neon, string **direta**)
   - `SESSION_SECRET` (string longa aleatória)

   > Os valores estão no **Vercel → Settings → Environment Variables**, ou no painel da **Neon**.
5. Rodar local: `npm run dev`.

## Comandos úteis

| Ação | Comando |
|---|---|
| Rodar local | `npm run dev` |
| Conferir conexão + tabelas | `node scripts/verify-db.mjs` |
| Gerar migration do banco | `npx drizzle-kit generate` |
| Aplicar migration no banco | `npx drizzle-kit migrate` |
| Build de produção | `npm run build` |
| Salvar no GitHub | `git add -A && git commit -m "..." && git push` |

## Roadmap (8 fases) — conteúdo primeiro

0. **Infra** — banco Neon + schema. ✅ COMPLETA
1. **Acesso + Blog** — login no `/painel` e publicar posts.
2. **Demais conteúdos** — Trajetória, Projetos, Skills, Agora, Identidade.
3. **Mídia + editor rico** — biblioteca de arquivos + Tiptap.
4. **Páginas + Menus + remover Tina.**
5. **Home em blocos** (hero, slider, seções, vídeo, botões).
6. **Design** (logo, cores, fontes).
7. **Analytics + IA** (GA4 + sugestões).
8. **Redes Sociais** — IA gera texto p/ copiar e imagem/vídeo p/ baixar.

## Status atual (2026-06-10)

- **Fase 0 COMPLETA:** banco Neon criado (região São Paulo); **9 tabelas** criadas (users, sessions, timeline, projetos, skills, posts, atualizacoes, identidade, agora); variáveis no Vercel; build local OK.
- Admin antigo (Tina) ainda funciona em `/admin` (será removido na Fase 4).
- **Próximo passo:** Fase 1 — Acesso (login no `/painel`) + Blog.
