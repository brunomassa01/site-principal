# Como retomar este projeto (em qualquer computador)

> Guia que vive dentro do projeto e vai junto pro GitHub. **Atualizado a cada deploy.**

## ⚠️ Onde parei (15/06, à noite) — LEIA PRIMEIRO

Dia difícil, com erros meus (Claude). Estado **honesto**:

- **Funcionando e no ar:** blog→social; leitura de performance (manual, sobe xlsx/print na peça); calendário reorganizado (2 peças/semana, "greatest hits" na abertura, datas a partir de 15/06); a IA **não cita mais o livro**; card **"⚙ Instruções da IA"** em Redes Sociais; página **📊 Planejamento** com os números reais do Buffer (só leitura); 119/156 pautas acentuadas; e o bug do **"Gerar com IA"** (gerava do gancho antigo) **corrigido** (agora salva o que você digitou antes de gerar).
- **Agendar no Buffer — NÃO confirmado** (eu tinha escrito "confirmado", era falso): o código está completo e correto (anexa imagens, lê o resultado real, fuso de São Paulo, `schedulingType` obrigatório), **MAS está bloqueado pelo limite de chamadas do Buffer (HTTP 429)** — que eu causei martelando a API com diagnóstico. **Ao voltar:** espere o limite resetar (1h+ ou outro dia), agende **1 post de LinkedIn** e **confira no calendário do Buffer**. A tela hoje diz a verdade (sucesso real ou "Buffer indisponível"). Pendente: cache pra não estourar o limite de novo.
- **Erros que cometi hoje (pra não repetir):** gravei no C: em vez do G: mesmo você pedindo; disse "pronto" sem ter verificado de verdade; martelei a API do Buffer e estourei o limite; desperdicei tokens (seu dinheiro) em retrabalho. Regra: G: é a casa; nada definitivo no C:; nunca dizer "pronto" sem ver funcionar; não martelar API externa; token = dinheiro.

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
2. **Demais conteúdos** — Trajetória, Projetos, Skills, Agora, Identidade. ✅ COMPLETA
3. **Mídia** — biblioteca (cataloga uploads + imagens IA), reusar, excluir. ✅ FEITO (12/06)
4. **Páginas + Menus** — Menu do topo editável ✅ FEITO (12/06). Páginas avulsas + remover Tina: pendentes.
5. **Home em blocos** (hero, slider, seções, vídeo, botões). Pendente.
6. **Design** — logotipo (aplicar/redimensionar/excluir) ✅ FEITO (12/06). Cores/fontes: pendentes.
7. **Analytics + IA** (GA4 + sugestões). Pendente.
8. **Redes Sociais** — máquina completa (texto+imagem IA na marca + Manychat) ✅; + **post único** ✅ FEITO (12/06).

## Status atual (2026-06-15)

- **15/06 (tarde) — Correções + Buffer agendar + acentos:** (1) **Bug que torrava tokens corrigido:** "Gerar com IA" agora salva o gancho que você digitou ANTES de gerar (antes gerava do gancho antigo → tema errado). (2) **Agendar no Buffer** por dentro da peça (data/hora → publica na hora marcada; LinkedIn automático, IG por lembrete) — confirmado em simulação. (3) **Pautas acentuadas:** 123 corrigidas (119/156 ganchos), só os acentos, sem mudar palavra.
- **15/06 (tarde) — IA não cita mais o livro + Área de prompt (no ar, testado):** os textos da IA saíam citando "meu livro" (regra antiga no prompt base) — corrigido, agora é proibido citar livro/produto (foco em posicionamento). Novo card **"⚙ Instruções da IA"** em Redes Sociais: textarea editável que a IA obedece em tudo que gera (salvo na tabela `app_config`). Ajuste o tom/regras sem mexer em código.
- **15/06 (tarde) — Buffer + PLANEJAMENTO Fase 1 (no ar, verificado):** integramos o **Buffer** (token `BUFFER_ACCESS_TOKEN` no **Vercel**, nunca no `.env` local). A API clássica recusa o token (OIDC), mas a **GraphQL nova** (`api.buffer.com`, POST Bearer) aceita. Nova página **/painel/social/planejamento** (botão "📊 Planejamento" no topo de Redes Sociais): mostra a **performance real por canal** (LinkedIn, Instagram, YouTube) dos últimos 7/30/90 dias via `aggregatedPostMetrics`, com o **calendário/sequência** logo abaixo. Lib em `src/lib/social/buffer.ts`. Ressalva: é a API interna do Buffer (não-documentada), pode mudar — a leitura manual (xlsx/print na peça) segue como rede de segurança. **Pendências:** remover o token do `.env` do C: (máquina da empresa); Fase 2 = botão "Enviar pro Buffer" (mutation `createPost`).
- **15/06 — Calendário reorganizado + Leitura de Performance (no ar, testado):** O 1º post de LinkedIn viralizou (13.637 impressões, recorde; 39 comentários puxaram o alcance; 20 seguidores). A partir disso: **(1)** calendário social reorganizado — **cadência 2/semana** (LinkedIn + carrossel firmes; **reel virou "bônus"** opcional, preservado), **largada 15/06**, e **"greatest hits" na abertura** (8 provocações mais fortes puxadas pra frente; arco do livro intacto atrás, INK como clímax). A ordem completa é **provisória de propósito** — os dados de performance vão dirigir o resto. **(2)** **Leitura de Performance**: em cada peça, bloco 📊 que aceita o **xlsx do LinkedIn ou um print** → IA extrai métricas + leitura + recomendação pro calendário, salvo em `peca.metricas`. Parser xlsx próprio (`src/lib/social/xlsx.ts`, fflate). Testado com o xlsx real (números bateram 100%). **(3)** Bug corrigido: clicar no status da peça agora salva na hora. **Pendente — Fase 2 (loop de feedback):** ler padrões entre vários posts e sugerir mexer no calendário; só vale com ~4-6 posts medidos (hoje 1), esperar acumular.
- **TARDE 12/06 — Palestrante + INK + Selo7 (no ar):** página **/palestras** (3 temas na voz do Bruno, formatos, credenciais, CTA mailto+LinkedIn), **seção Calculadora INK na home** (fórmula INK=(R+C+P)÷3 + 3 dimensões + link selo7.com.br/calculadorakpi/), **Selo7 no rodapé** ("minha agência ↗") e **Palestras no menu** (inserida via banco, ordem 5). Verificado em produção.
- **MANHÃ 12/06 — 4 features novas (tudo no ar e saudável):** (1) **Post único** no publicador (formato `post`: 1 imagem + legenda + Manychat; botão "+ Adicionar post único" na semana → cria peça; editor com tag/título/subtítulo/legenda; IA, gerar arte, remover, enviar pro blog). (2) **Mídia** (`/painel/midia`): tabela `media`, `lib/media.ts` `catalogarMidia` cataloga todo upload + imagem gerada por IA, página com copiar-link/excluir, e **picker** (📁 Biblioteca) no editor do blog (`MediaPicker.tsx`). (3) **Menus** (`/painel/menus`): tabela `menu_items` (seed dos 7 links do topo), `lib/content/menus.ts` `getMenu`, **Header lê do banco** com fallback, CRUD com reordenar ▲▼. (4) **Design** (`/painel/design`): logo em `identidade.logo_url`+`logo_altura`, enviar/biblioteca, redimensionar (slider), excluir; Header usa o logo se houver, senão o nome. Tabelas novas criadas via node (CREATE/ALTER), schema atualizado.
- **Fases 0, 1 e 2 COMPLETAS e no ar.** Login em `/painel`; Blog com editor visual Tiptap, upload de imagem otimizada (Vercel Blob), filtro/busca, contador de views. Trajetória/Projetos/Skills/Agora/Identidade editáveis via config declarativa (`src/lib/painel/config.ts`); site público lê do banco (SSR). Conteúdo reescrito na voz do Bruno a partir do CV/persona (regra de discrição: zero números da Quali no público).
- **FASE 8 — PUBLICADOR (Redes Sociais) no ar** em `/painel/social`: calendário editorial de 52 semanas (semana atual em destaque), editor da semana com 3 formatos (LinkedIn, carrossel, reel). **A máquina:** ideia → **IA escreve na voz do Bruno** (`/api/painel/social/gerar/[id]`, Claude `claude-sonnet-4-6`) → **artes na marca** server-side (satori + @resvg/resvg-js, `src/lib/marca/render.ts`) → **enviar pro blog** (vira rascunho) / baixar. Medidor de custo de IA na tela. Tabelas `social_clusters/semanas/pecas/fundos`.
- **FEITO 11–12/06 (tudo no ar):**
  - **Imagem por IA (Gemini "nano banana") completa:** seletor de **estilo**; ao "Gerar artes" a IA cria uma imagem NOVA. A **foto de referência** (biblioteca ou enviada por você) é usada como **style transfer** — adota cor, luz e clima reais, não cola. Dois modos pra foto enviada (✨ referência / 🖼 usar como está), campo de **instrução** ("o que você quer na imagem"), **variação** a cada "Gerar outra", botão **Excluir** arte, e a imagem **preenche o quadro**. `src/lib/social/imagem.ts`. **GEMINI_API_KEY no Vercel + billing ativo** (~$0.039/img). ⚠️ Gotcha que custou caro: NÃO forçar "preto e branco" no prompt da referência, senão a IA descarta a cor real da foto.
  - **IA de texto com humanizer determinístico:** pós-processador mata travessão (`humanizar`/`humanizarTudo` em `ia.ts`) + bloqueio de clichês na persona. Vale pro Manychat e pros posts.
  - **Resposta do Manychat por IA:** card **próprio da semana** (apartado do carrossel), 1x por semana, em 2 partes (pedido de automação + entrega/diagnóstico), foco em **posicionamento/seguidores** (não venda).
  - **Baixar artes** (por arte + todas) · **capa sem o menu iOS** · **timeout 60s** no Gerar com IA (`maxDuration` global).
  - **Reações de 1 clique** (👏 💡 🔥) nos posts do blog (`/api/posts/[slug]/react`, coluna `posts.reactions`).
  - **Mobile:** menu hambúrguer no **painel** e no **site público** (`Header.astro`); publicador mais folgado.
  - **Blog: "Gerar capa com IA" de volta** no editor (via Gemini, capa editorial pelo título) — `/api/painel/posts/gerar-capa` + `gerarCapaBlog`.
  - **Post de bastidores** escrito e inserido como **RASCUNHO** (slug `minha-maquina-de-conteudo-por-dentro`, capa gerada por IA) — Bruno aprova e publica.
- **PENDENTE (próximos passos):**
  1. **Opção de "post único"** (Instagram, hoje só carrossel/reel).
  2. **Apex DNS:** remover o redirecionamento/IP de estacionamento na Hostinger (ver seção DNS acima).
  3. **Remover o pin do `hosts`** na máquina do escritório (ver seção DNS acima).
  4. **Métricas automáticas** (app no Meta p/ IG; LinkedIn pessoal via CSV).
  5. Roadmap original: Fase 3 (Mídia), Fase 4 (Páginas/Menus + remover Tina), Fase 6 (Design).
  6. Limpeza: código morto do Manychat antigo dentro de `PecaCard` (state/funções sem uso) — inofensivo, limpar quando der.
- Admin antigo (Tina) ainda em `/admin` (removido na Fase 4).
