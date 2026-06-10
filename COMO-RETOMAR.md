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
   - `BLOB_READ_WRITE_TOKEN` (só p/ testar upload de imagem local — copie da aba `.env.local` do store no Vercel)

   > Os valores estão no **Vercel → Settings → Environment Variables**, ou nos painéis da **Neon** / **Blob**.
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

## Acesso ao Painel

- URL: **brunomassa.online/painel** · login inicial: `brunobrm@gmail.com` (troque a senha em **Conta**).
- Edições aparecem no site na hora (Blog, /posts, /agora leem do banco; SSR).

## Dev local (Windows) — armadilhas conhecidas

- Se o `npm run dev` der **`MiddlewareCantBeLoaded` / "sequence is not a function"**: é cache corrompido do Vite. Pare tudo e limpe:
  `Stop-Process -Name node -Force; Remove-Item -Recurse -Force node_modules\.vite,.astro` e rode `npx astro dev` de novo.
- Cuidado com **servidores zumbis**: se a porta 4321 estiver ocupada, o dev sobe em outra porta (4322+). Mate os `node` antes.
- **NUNCA** criar uma pasta `api/` na raiz: a Vercel a trata como funções nativas e quebra as rotas `/api/painel/*` do Astro.
- **Vercel Blob:** ao conectar o store, a Vercel NÃO cria `BLOB_READ_WRITE_TOKEN` sozinha (só `BLOB_STORE_ID` + webhook). Adicione manual em Settings → Environment Variables (copie da aba `.env.local` do store).
- **2 projetos Vercel** ligados ao repo: `site-principal` é quem tem o domínio brunomassa.online; `site-principal-omp4` é duplicado órfão — limpar quando der.

## Roadmap (8 fases) — conteúdo primeiro

0. **Infra** — banco Neon + schema. ✅ COMPLETA
1. **Acesso + Blog** — login no `/painel` e publicar posts. ✅ COMPLETA
2. **Demais conteúdos** — Trajetória, Projetos, Skills, Agora, Identidade.
3. **Mídia + editor rico** — biblioteca de arquivos + Tiptap.
4. **Páginas + Menus + remover Tina.**
5. **Home em blocos** (hero, slider, seções, vídeo, botões).
6. **Design** (logo, cores, fontes).
7. **Analytics + IA** (GA4 + sugestões).
8. **Redes Sociais** — IA gera texto p/ copiar e imagem/vídeo p/ baixar.

## Status atual (2026-06-10)

- **Fases 0 e 1 COMPLETAS e no ar.** Login em `/painel`; Blog com **editor visual** (barra de formatação, sem markdown), **upload de imagem** (capa + dentro do texto, otimizada → Vercel Blob), capa exibida na listagem e no topo do post, ordenação por mais recente. `/posts` e `/agora` leem do banco (SSR). Tudo verificado em produção.
- **Pendente no Blog:** filtro/busca na lista (palavras, data, com vídeo/imagem, mais visitados).
- Admin antigo (Tina) ainda em `/admin` (será removido na Fase 4).
- **Próximo:** Fase 2 — Trajetória, Projetos, Skills, Agora e Identidade no Painel.
