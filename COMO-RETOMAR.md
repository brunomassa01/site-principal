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
   - `ANTHROPIC_API_KEY` (IA de texto do Publicador — só roda em produção/preview)
   - `GEMINI_API_KEY` (IA de imagem "nano banana" do Publicador — só roda em produção/preview)

   > Os valores estão no **Vercel → Settings → Environment Variables**, ou nos painéis da **Neon** / **Blob**.
   > As chaves marcadas como **Sensitive** no Vercel não voltam no `vercel env pull` (vêm vazias) — só existem em runtime.
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
- **Projeto Vercel:** só `site-principal` (tem o domínio). O duplicado órfão `site-principal-omp4`, que errava todo push e poluía o dashboard, **foi deletado em 11/06**. Sempre `npm run build` local ANTES do push.

## DNS / acesso ao domínio (incidente de 11/06 — parcialmente resolvido)

- **Use sempre `www.brunomassa.online`** — está 100% saudável (CNAME `www → cname.vercel-dns.com`, faixa clássica viva da Vercel). De qualquer máquina nova, abre normal.
- O **apex `brunomassa.online` (sem www)** ainda é instável: a Hostinger injeta sozinha um IP de "estacionamento" morto (`172.64.53.70`) junto do bom (`76.76.21.21`). **Pendente:** checar a aba **Redirecionamentos** na Hostinger e remover regra do apex.
- Causa raiz do incidente: a faixa de IP **nova** da Vercel (`64.29.17.x`/`216.198.79.x`) tinha os nós `.1` **mortos**. Corrigido apontando o DNS na Hostinger pra faixa clássica (apex A `→ 76.76.21.21`, www CNAME `→ cname.vercel-dns.com`).
- **Só na máquina `C:\dev` (Windows do escritório):** há um pin temporário no `hosts` (`64.29.17.65 www.brunomassa.online`). **Pendente remover** (PowerShell admin): apagar essas linhas de `C:\Windows\System32\drivers\etc\hosts` + `ipconfig /flushdns`. Numa máquina nova não existe pin nem precisa.

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

## Status atual (2026-06-11)

- **Fases 0, 1 e 2 COMPLETAS e no ar.** Login em `/painel`; Blog com editor visual Tiptap, upload de imagem otimizada (Vercel Blob), filtro/busca, contador de views. Trajetória/Projetos/Skills/Agora/Identidade editáveis via config declarativa (`src/lib/painel/config.ts`); site público lê do banco (SSR). Conteúdo reescrito na voz do Bruno a partir do CV/persona (regra de discrição: zero números da Quali no público).
- **FASE 8 — PUBLICADOR (Redes Sociais) no ar** em `/painel/social`: calendário editorial de 52 semanas (semana atual em destaque), editor da semana com 3 formatos (LinkedIn, carrossel, reel). **A máquina:** ideia → **IA escreve na voz do Bruno** (`/api/painel/social/gerar/[id]`, Claude `claude-sonnet-4-6`) → **artes na marca** server-side (satori + @resvg/resvg-js, `src/lib/marca/render.ts`) → **enviar pro blog** (vira rascunho) / baixar. Medidor de custo de IA na tela. Tabelas `social_clusters/semanas/pecas/fundos`.
- **FEITO em 11/06 (no ar):** (a) **baixar artes** — botão por arte (⬇ Baixar) + "Baixar todas" na galeria. (b) **upload de foto de fundo corrigido** — agora otimiza no navegador antes de enviar (não estoura o limite de 4,4MB) e mostra miniatura.
- **FEITO em 11/06, no ar mas NÃO testado ao vivo ⚠️:** **seletor de ESTILO + geração de imagem com Gemini (nano banana)**. O seletor de capa virou escolha de **estilo** (não foto fixa); ao "Gerar artes", se a peça tem estilo escolhido, a IA gera uma **imagem de fundo nova** nesse estilo (`src/lib/social/imagem.ts`, modelo `gemini-2.5-flash-image`, `GEMINI_API_KEY` já no Vercel). **PRIMEIRO PASSO AO RETOMAR: testar isso ao vivo** — abrir uma peça carrossel, escolher um estilo (✨), "Gerar artes", e ver se a imagem vem. Se a chamada do Gemini falhar, o erro aparece no alerta (ajustar o formato do request em `imagem.ts` — endpoint/responseModalities/aspectRatio podem precisar de tweak; ~$0.039/imagem). Tinta e "Subir foto" (foto fixa) seguem funcionando como antes.
- **PENDENTE (próximos passos):**
  1. **Testar a geração de imagem Gemini** (acima) — prioridade.
  2. **Resposta do Manychat gerada por IA** (na voz/conteúdo do livro do Bruno) + **opção de "post único"** (Instagram, hoje só tem carrossel/reel).
  3. **Apex DNS:** remover o redirecionamento/IP de estacionamento na Hostinger (ver seção DNS acima).
  4. **Remover o pin do `hosts`** na máquina do escritório (ver seção DNS acima).
  5. Roadmap original: Fase 3 (Mídia), Fase 4 (Páginas/Menus + remover Tina), Fase 6 (Design) — Bruno pediu Mídia/Páginas-Menus/Design como próximas seções.
- Admin antigo (Tina) ainda em `/admin` (removido na Fase 4).
