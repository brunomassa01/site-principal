# Como retomar este projeto (em qualquer computador)

> Guia que vive **dentro do projeto** (no Google Drive), para abrir o trabalho de qualquer máquina.
> A memória do Claude fica salva localmente em cada PC — este arquivo é o que viaja junto.

## O que é

**brunomassa.online** — site "currículo vivo" do Bruno + um **CMS próprio ("Painel")** sendo construído para substituir o TinaCMS. Objetivo: administrar todo o conteúdo e a estrutura do site como num "WordPress pessoal", com módulos de IA no futuro (gerar conteúdo para redes sociais, analytics com sugestões).

## Onde mora

- **Pasta única:** `G:\Meu Drive\2026 - Trabalhos\Bruno-Massa\Carreira Bruno Massa\site-principal\` (Google Drive).
- **NÃO** manter cópia em `C:\dev` (máquina da empresa).
- **Backup + deploy:** GitHub `github.com/brunomassa01/site-principal` → Vercel publica automático no push da `main`.
- **Regra de ouro do Drive:** esperar o ícone verde (sincronizado) antes de desligar/trocar de PC.

## Setup numa máquina nova

1. Instalar **Node 20.x** e **Git**.
2. Abrir a pasta do projeto no Drive (esperar sincronizar 100%).
3. No terminal, dentro da pasta:
   ```
   npm install --legacy-peer-deps
   ```
4. Criar um arquivo `.env` copiando de `.env.example` e preencher:
   - `DATABASE_URL` (Neon, string **pooled** — host com `-pooler`)
   - `DATABASE_URL_UNPOOLED` (Neon, string **direta**)
   - `SESSION_SECRET` (string longa aleatória)
5. Rodar o site local: `npm run dev`.

## Stack

Astro 4.16 (`hybrid`) · Tailwind · React (islands) · Vercel · Drizzle ORM · Neon (Postgres) · bcryptjs (login) · Tiptap (editor) · Vercel Blob (mídia).

## Comandos úteis

| Ação | Comando |
|---|---|
| Rodar local | `npm run dev` |
| Gerar migration do banco | `npx drizzle-kit generate` |
| Aplicar migration no banco | `npx drizzle-kit migrate` |
| Build de produção | `npm run build` |
| Salvar no GitHub | `git add -A && git commit -m "..." && git push` |

## Roadmap (8 fases) — conteúdo primeiro

0. **Infra** — banco Neon + schema (em andamento).
1. **Acesso + Blog** — login no `/painel` e publicar posts.
2. **Demais conteúdos** — Trajetória, Projetos, Skills, Agora, Identidade.
3. **Mídia + editor rico** — biblioteca de arquivos + Tiptap.
4. **Páginas + Menus + remover Tina.**
5. **Home em blocos** (hero, slider, seções, vídeo, botões).
6. **Design** (logo, cores, fontes).
7. **Analytics + IA** (GA4 + sugestões).
8. **Redes Sociais** — IA gera texto p/ copiar e imagem/vídeo p/ baixar.

## Status atual (2026-06-10)

- Admin antigo (Tina) ainda funciona em `/admin` (será removido na Fase 4).
- **Fase 0 em andamento:** dependências instaladas; schema do banco escrito (`src/lib/db/schema.ts`); config pronta.
- **Próximo passo:** criar o banco Neon e preencher o `.env`; depois aplicar as migrations.
