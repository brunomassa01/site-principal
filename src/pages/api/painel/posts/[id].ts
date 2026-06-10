import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { posts } from '../../../../lib/db/schema';
import { mdToHtml, slugify } from '../../../../lib/content/markdown';
import { json } from '../../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const [row] = await db.select().from(posts).where(eq(posts.id, params.id!));
  return row ? json(row) : json({ error: 'Não encontrado' }, 404);
};

export const PUT: APIRoute = async ({ params, request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const titulo = String(b.titulo ?? '').trim();
  const resumo = String(b.resumo ?? '').trim();
  if (!titulo) return json({ error: 'Título é obrigatório.' }, 400);
  if (!resumo) return json({ error: 'Resumo é obrigatório.' }, 400);

  const md = String(b.body_markdown ?? '');
  const tags = Array.isArray(b.tags)
    ? (b.tags as string[])
    : String(b.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);

  const values = {
    slug: String(b.slug ?? '').trim() || slugify(titulo),
    titulo,
    resumo,
    data: b.data ? new Date(String(b.data)) : new Date(),
    publicarEm: b.publicar_em ? new Date(String(b.publicar_em)) : null,
    capaUrl: (b.capa_url as string) || null,
    tags,
    fonteExternaUrl: (b.fonte_externa_url as string) || null,
    fonteExternaNome: (b.fonte_externa_nome as string) || null,
    idioma: (b.idioma as string) || 'pt',
    bodyHtml: mdToHtml(md),
    bodyJson: { markdown: md },
    situacao: (b.situacao as string) || 'rascunho',
    updatedAt: new Date(),
  };

  const [row] = await db.update(posts).set(values).where(eq(posts.id, params.id!)).returning();
  return row ? json(row) : json({ error: 'Não encontrado' }, 404);
};

// Atualização rápida de situação (publicar / arquivar / restaurar)
export const PATCH: APIRoute = async ({ params, request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof b.situacao === 'string') patch.situacao = b.situacao;
  const [row] = await db.update(posts).set(patch).where(eq(posts.id, params.id!)).returning();
  return row ? json(row) : json({ error: 'Não encontrado' }, 404);
};

export const DELETE: APIRoute = async ({ params }) => {
  await db.delete(posts).where(eq(posts.id, params.id!));
  return json({ ok: true });
};
