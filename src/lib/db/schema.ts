import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';

/**
 * Schema do CMS "Painel" — banco Postgres (Neon).
 *
 * Convenções:
 * - `situacao`: ciclo de vida no CMS (rascunho | publicado | arquivado). É o "Arquivar"
 *   pedido em todos os módulos. NÃO confundir com `projetos.status` (campo de domínio).
 * - `body_html`: conteúdo rico renderizado direto no site (set:html).
 * - `body_json`: documento do editor (Tiptap) para reedição fiel e leitura pela IA.
 * - arrays (tags, destaques) ficam em colunas jsonb.
 * - sufixo `*_en`: tradução do campo para inglês (site bilíngue). Vazio = cai no
 *   português automaticamente. Nome próprio, URL, data e slug NÃO têm versão _en.
 */

// ───────────────────────── Auth / Usuários ─────────────────────────

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nome: text('nome').notNull(),
  role: text('role').notNull().default('admin'), // admin | editor
  situacao: text('situacao').notNull().default('publicado'), // publicado | arquivado
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(), // hash SHA-256 do token (o token cru fica só no cookie)
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Conteúdo: Trajetória ─────────────────────────

export const timeline = pgTable('timeline', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  cargo: text('cargo').notNull(),
  empresa: text('empresa').notNull(),
  empresaUrl: text('empresa_url'),
  inicio: date('inicio', { mode: 'date' }).notNull(),
  fim: date('fim', { mode: 'date' }),
  local: text('local'),
  tipo: text('tipo'), // clt | pj | socio | consultoria | freelancer | voluntario | ''
  resumo: text('resumo'),
  destaques: jsonb('destaques').$type<string[]>().default([]),
  tags: jsonb('tags').$type<string[]>().default([]),
  destaque: boolean('destaque').notNull().default(false),
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
  // tradução (empresa é nome próprio: não traduz)
  cargoEn: text('cargo_en'),
  localEn: text('local_en'),
  resumoEn: text('resumo_en'),
  destaquesEn: jsonb('destaques_en').$type<string[]>(),
  bodyHtmlEn: text('body_html_en'),
  bodyJsonEn: jsonb('body_json_en'),
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Conteúdo: Projetos ─────────────────────────

export const projetos = pgTable('projetos', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  titulo: text('titulo').notNull(),
  subtitulo: text('subtitulo'),
  status: text('status').notNull(), // domínio: em-andamento | concluido | em-pausa | arquivado
  inicio: date('inicio', { mode: 'date' }).notNull(),
  fim: date('fim', { mode: 'date' }),
  cliente: text('cliente'),
  papel: text('papel'),
  resumo: text('resumo').notNull(),
  problema: text('problema'),
  abordagem: text('abordagem'),
  resultado: text('resultado'),
  link: text('link'),
  repo: text('repo'),
  tags: jsonb('tags').$type<string[]>().default([]),
  destaque: boolean('destaque').notNull().default(false),
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
  // tradução (cliente é nome próprio: não traduz)
  tituloEn: text('titulo_en'),
  subtituloEn: text('subtitulo_en'),
  papelEn: text('papel_en'),
  resumoEn: text('resumo_en'),
  problemaEn: text('problema_en'),
  abordagemEn: text('abordagem_en'),
  resultadoEn: text('resultado_en'),
  bodyHtmlEn: text('body_html_en'),
  bodyJsonEn: jsonb('body_json_en'),
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Conteúdo: Skills ─────────────────────────

export const skills = pgTable('skills', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  categoria: text('categoria').notNull(), // habilidade | certificacao | formacao | idioma
  area: text('area').notNull(),
  nivel: text('nivel'), // basico | intermediario | avancado | especialista | ''
  instituicao: text('instituicao'),
  instituicaoUrl: text('instituicao_url'),
  ano: integer('ano'),
  credencialUrl: text('credencial_url'),
  descricao: text('descricao'),
  destaque: boolean('destaque').notNull().default(false),
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
  // tradução (instituição é nome próprio; categoria/nível são rótulos do dicionário de UI)
  nomeEn: text('nome_en'),
  areaEn: text('area_en'),
  descricaoEn: text('descricao_en'),
  bodyHtmlEn: text('body_html_en'),
  bodyJsonEn: jsonb('body_json_en'),
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Conteúdo: Blog (posts) ─────────────────────────

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  titulo: text('titulo').notNull(),
  resumo: text('resumo').notNull(),
  data: date('data', { mode: 'date' }).notNull(),
  publicarEm: timestamp('publicar_em', { withTimezone: true, mode: 'date' }), // agendamento
  capaUrl: text('capa_url'),
  tags: jsonb('tags').$type<string[]>().default([]),
  fonteExternaUrl: text('fonte_externa_url'),
  fonteExternaNome: text('fonte_externa_nome'),
  idioma: text('idioma').notNull().default('pt'), // idioma ORIGINAL em que o post foi escrito
  mbaFase: integer('mba_fase'),          // Conhecimento Compartilhado: fase do MBA (1..5); null = post normal de blog
  mbaDisciplina: text('mba_disciplina'), // disciplina dentro da fase (rótulo); só usado quando mbaFase != null
  views: integer('views').notNull().default(0),
  reactions: jsonb('reactions').$type<Record<string, number>>().default({}),
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
  // tradução: o mesmo post em inglês (mesmo slug, servido em /en/posts/<slug>)
  tituloEn: text('titulo_en'),
  resumoEn: text('resumo_en'),
  bodyHtmlEn: text('body_html_en'),
  bodyJsonEn: jsonb('body_json_en'),
  situacao: text('situacao').notNull().default('publicado'), // rascunho = não aparece no site
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Conteúdo: Atualizações ─────────────────────────

export const atualizacoes = pgTable('atualizacoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  data: date('data', { mode: 'date' }).notNull(),
  tipo: text('tipo').notNull(), // projeto | certificacao | cargo | post | marco | outro
  titulo: text('titulo').notNull(),
  tituloEn: text('titulo_en'),
  referenciaSlug: text('referencia_slug'),
  situacao: text('situacao').notNull().default('publicado'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Singletons ─────────────────────────

export const identidade = pgTable('identidade', {
  id: text('id').primaryKey().default('identidade'),
  nome: text('nome').notNull(),
  tagline: text('tagline'),
  slogan: text('slogan'),
  bioCurta: text('bio_curta'),
  descricaoMeta: text('descricao_meta'),
  // tradução (nome é nome próprio: não traduz)
  taglineEn: text('tagline_en'),
  sloganEn: text('slogan_en'),
  bioCurtaEn: text('bio_curta_en'),
  descricaoMetaEn: text('descricao_meta_en'),
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  ogImage: text('og_image'),
  logoUrl: text('logo_url'),
  logoAltura: integer('logo_altura'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const agora = pgTable('agora', {
  id: text('id').primaryKey().default('agora'),
  atualizadoEm: date('atualizado_em', { mode: 'date' }),
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
  bodyHtmlEn: text('body_html_en'),
  bodyJsonEn: jsonb('body_json_en'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Menus ─────────────────────────

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  local: text('local').notNull(), // topo | rodape
  label: text('label').notNull(),
  labelEn: text('label_en'),
  url: text('url').notNull(),
  ordem: integer('ordem'),
  situacao: text('situacao').notNull().default('publicado'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Redes Sociais (Publicador) ─────────────────────────
// Máquina editorial: calendário de 52 semanas, cada semana = 1 ideia → 3 formatos
// (LinkedIn, carrossel IG, reel). Status: planejado → escrito → aprovado → publicado.

export const socialClusters = pgTable('social_clusters', {
  id: uuid('id').defaultRandom().primaryKey(),
  ordem: integer('ordem').notNull().default(0),
  nome: text('nome').notNull(), // "Cap. 1 — O currículo do marketing"
  capitulo: text('capitulo'),   // "Capítulo 1" | "Coringa" | "Epílogo"
  semanaInicio: integer('semana_inicio'),
  semanaFim: integer('semana_fim'),
  palavrasChave: jsonb('palavras_chave').$type<string[]>().default([]),
  leadMagnetUrl: text('lead_magnet_url'),
  descricao: text('descricao'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const socialSemanas = pgTable('social_semanas', {
  id: uuid('id').defaultRandom().primaryKey(),
  numero: integer('numero').notNull().unique(), // 1..52
  inicio: date('inicio', { mode: 'date' }),      // segunda-feira da semana
  cluster: text('cluster'),                       // rótulo denormalizado (ex.: "Cap 1")
  clusterId: uuid('cluster_id').references(() => socialClusters.id),
  tema: text('tema'),
  ponteIa: boolean('ponte_ia').notNull().default(false),
  slotReativo: boolean('slot_reativo').notNull().default(false),
  coringa: boolean('coringa').notNull().default(false),
  observacoes: text('observacoes'),
  status: text('status').notNull().default('planejado'), // planejado | em-producao | concluido
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const socialPecas = pgTable('social_pecas', {
  id: uuid('id').defaultRandom().primaryKey(),
  semanaId: uuid('semana_id').notNull().references(() => socialSemanas.id, { onDelete: 'cascade' }),
  formato: text('formato').notNull(),  // linkedin | carrossel | reel
  gancho: text('gancho'),               // ideia/gancho da pauta
  lente: text('lente'),                 // conceito do livro usado como lente
  conteudo: jsonb('conteudo'),          // estrutura por formato: {texto} | {slides[]} | {cenas[]}
  legenda: text('legenda'),
  manychat: text('manychat'),           // palavra-chave do Manychat
  diaPublicacao: text('dia_publicacao'),// terca | quarta | quinta | sexta
  status: text('status').notNull().default('planejado'), // planejado | escrito | aprovado | agendado | publicado
  opcional: boolean('opcional').notNull().default(false), // peça bônus (ex.: reel na cadência 2/semana) — não conta na meta
  agendadoPara: timestamp('agendado_para', { withTimezone: true, mode: 'date' }), // quando publicar (status 'agendado')
  publicadoEm: timestamp('publicado_em', { withTimezone: true, mode: 'date' }),
  urlPublicada: text('url_publicada'),  // link do post no ar (p/ casar métricas)
  midiaUrls: jsonb('midia_urls').$type<string[]>().default([]),
  metricas: jsonb('metricas'),          // {impressoes,curtidas,comentarios,compartilhamentos,cliques,salvos,atualizadoEm}
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Conhecimento Compartilhado (MBA) ─────────────────────────
// Hub público da jornada do MBA. Os ARTIGOS são posts de blog comuns marcados com
// `posts.mbaFase`/`mbaDisciplina` — aqui ficam só os catálogos leves (fases, vídeos,
// referências) e o acervo PRIVADO de materiais da FIAP (nunca renderizado no site).

export const conhecimentoFases = pgTable('conhecimento_fases', {
  id: uuid('id').defaultRandom().primaryKey(),
  numero: integer('numero').notNull().unique(), // 1..5
  titulo: text('titulo').notNull(),
  subtitulo: text('subtitulo'),
  tituloEn: text('titulo_en'),
  subtituloEn: text('subtitulo_en'),
  status: text('status').notNull().default('bloqueada'), // em-curso | concluida | bloqueada | planejada
  progresso: integer('progresso').notNull().default(0),   // 0..100 (%)
  disciplinas: jsonb('disciplinas').$type<{ nome: string; sub?: string }[]>().default([]),
  disciplinasEn: jsonb('disciplinas_en').$type<{ nome: string; sub?: string }[]>(),
  inicio: date('inicio', { mode: 'date' }),
  fim: date('fim', { mode: 'date' }),
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const conhecimentoVideos = pgTable('conhecimento_videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: text('titulo').notNull(),
  tituloEn: text('titulo_en'),
  url: text('url').notNull(),
  fonte: text('fonte').notNull().default('curadoria'), // fiap | curadoria | podcast | youtube
  autor: text('autor'),
  duracao: text('duracao'),       // "4:12"
  thumbnailUrl: text('thumbnail_url'),
  fase: integer('fase'),          // fase do MBA (1..5)
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const conhecimentoReferencias = pgTable('conhecimento_referencias', {
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: text('titulo').notNull(),
  tituloEn: text('titulo_en'),
  fonte: text('fonte'),           // autor / veículo
  tipo: text('tipo').notNull().default('livro'), // livro | artigo | filme | doc | ted | video
  url: text('url'),
  idioma: text('idioma').notNull().default('pt'), // idioma da OBRA referenciada
  fase: integer('fase'),
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Acervo PRIVADO de materiais da FIAP — só aparece no CMS, NUNCA no site público.
export const conhecimentoMateriais = pgTable('conhecimento_materiais', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  url: text('url').notNull(),     // Vercel Blob
  ext: text('ext'),               // pdf | docx | mp4 | png ...
  tamanho: integer('tamanho'),    // bytes
  fase: integer('fase'),
  disciplina: text('disciplina'),
  privado: boolean('privado').notNull().default(true),
  situacao: text('situacao').notNull().default('publicado'),
  ordem: integer('ordem'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Landing Pages (mentorias/produtos) ─────────────────────────
// Reusável: 1 registro = 1 produto, servido em lp.brunomassa.online/<slug>.
// O conteúdo mora em `dados` (jsonb) porque uma página de venda tem estrutura
// própria, fora do CRUD genérico do Painel.

export const landingPages = pgTable('landing_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  status: text('status').notNull().default('rascunho'), // rascunho | publicado
  dados: jsonb('dados'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Candidaturas (fluxo escolhido): formulário na LP → lista no Painel → Bruno
// seleciona e cobra na mão.
export const lpLeads = pgTable('lp_leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  lpSlug: text('lp_slug').notNull(),
  nome: text('nome').notNull(),
  email: text('email'),
  whatsapp: text('whatsapp'),
  empresa: text('empresa'),
  cargo: text('cargo'),
  desafio: text('desafio'),
  situacao: text('situacao').notNull().default('novo'), // novo | selecionado | descartado | inscrito
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Tipos inferidos ─────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type SocialCluster = typeof socialClusters.$inferSelect;
export type SocialSemana = typeof socialSemanas.$inferSelect;
export type SocialPeca = typeof socialPecas.$inferSelect;
export type ConhecimentoFase = typeof conhecimentoFases.$inferSelect;
export type ConhecimentoVideo = typeof conhecimentoVideos.$inferSelect;
export type ConhecimentoReferencia = typeof conhecimentoReferencias.$inferSelect;
export type ConhecimentoMaterial = typeof conhecimentoMateriais.$inferSelect;
export type LandingPage = typeof landingPages.$inferSelect;
export type LpLead = typeof lpLeads.$inferSelect;
