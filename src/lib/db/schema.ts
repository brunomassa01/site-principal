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
  idioma: text('idioma').notNull().default('pt'), // pt | en
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
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
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  ogImage: text('og_image'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

export const agora = pgTable('agora', {
  id: text('id').primaryKey().default('agora'),
  atualizadoEm: date('atualizado_em', { mode: 'date' }),
  bodyHtml: text('body_html'),
  bodyJson: jsonb('body_json'),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ───────────────────────── Tipos inferidos ─────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
