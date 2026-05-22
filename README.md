# brunomassa.online — Currículo Vivo

Site pessoal do Bruno Massa: trajetória profissional em tempo real, projetos, conteúdo autoral.

## Stack

- **Astro 5** — framework do site (gera HTML estático, rápido, ótimo para SEO)
- **Tailwind CSS** — estilização
- **Decap CMS** — painel `/admin` para editar conteúdo sem mexer em código
- **Vercel** — hospedagem (deploy automático a cada push no GitHub)
- **GitHub** — versionamento e armazenamento do conteúdo

## Estrutura de pastas

```
site-principal/
├── public/           # arquivos estáticos (imagens, favicon, /admin do Decap)
├── src/
│   ├── content/      # CONTEÚDO do currículo (markdown editado pelo painel ou aqui)
│   │   ├── timeline/        # cargos e marcos profissionais
│   │   ├── projetos/        # cases de projetos
│   │   ├── skills/          # habilidades, certificações, formações
│   │   ├── posts/           # conteúdo autoral (artigos do próprio site)
│   │   ├── atualizacoes/    # feed cronológico curto
│   │   └── agora/           # página /agora (now page)
│   ├── components/   # blocos reutilizáveis (Header, Footer, etc.)
│   ├── layouts/      # estruturas de página
│   └── pages/        # rotas do site (cada arquivo = uma URL)
├── astro.config.mjs
├── package.json
└── README.md
```

## Como rodar localmente (no seu PC)

Pré-requisitos: **Node.js 20+** (baixe em https://nodejs.org).

```bash
# 1. Entre na pasta
cd site-principal

# 2. Instale dependências (primeira vez apenas, ou quando o package.json muda)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# Abre em http://localhost:4321
```

## Como publicar a primeira versão

### 1. Inicializar git e subir para o GitHub

Abra o terminal **nesta pasta** (`site-principal`):

```bash
git init
git add .
git commit -m "primeiro commit: estrutura inicial"
git branch -M main
git remote add origin https://github.com/Bruno-Massa-Online/site-principal.git
git push -u origin main
```

> **Autenticação:** use `gh auth login` (GitHub CLI) ou GitHub Desktop. **Nunca cole tokens em mensagens.**

### 2. Conectar Vercel

1. Acesse https://vercel.com e logue com o GitHub
2. Import → escolha `Bruno-Massa-Online/site-principal`
3. Framework Preset: detecta Astro automaticamente
4. Deploy

Em ~1 minuto o site estará no ar em uma URL `xxx.vercel.app`.

### 3. Conectar domínio brunomassa.online

1. No painel da Vercel do projeto → Settings → Domains → Add → `brunomassa.online`
2. A Vercel mostra registros DNS que você precisa configurar
3. Acesse o painel da Hostinger → DNS de brunomassa.online → adicione os registros que a Vercel pediu
4. Aguarde 5-30 minutos para propagar

## Como editar conteúdo

### Opção A — Painel /admin (Decap CMS)

> _Em configuração — próxima etapa._

Quando estiver pronto, basta acessar `brunomassa.online/admin`, logar com GitHub e editar tudo numa interface visual.

### Opção B — Direto no GitHub

Cada item é um arquivo `.md` em `src/content/<coleção>/`. Você pode editar pelo GitHub web (abrir o arquivo, clicar no lápis) ou clonar o repo localmente.

### Opção C — Pedir para o Claude

No Cowork, é só falar "adicionei o projeto X" e eu atualizo o arquivo correspondente.

## Próximas etapas

- [ ] Páginas do site (home, timeline, projetos, skills, posts, /agora, contato) — em construção
- [ ] Configuração do Decap CMS em `/admin` com login GitHub
- [ ] Identidade visual (cores, tipografia, layout)
- [ ] Sync de posts do LinkedIn (via RSS pago ou cadastro manual)
- [ ] Geração automática do CV em PDF
- [ ] Versão bilíngue PT/EN
