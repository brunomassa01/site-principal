import type { APIRoute } from 'astro';
import { desc } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { posts } from '../../../../lib/db/schema';
import { slugify } from '../../../../lib/content/markdown';
import { sanitizeBody } from '../../../../lib/content/sanitize';
import { json } from '../../../../lib/http';

export const prerender = false;

// Lista TODOS os posts (inclui rascunho/arquivado) — visão do Painel, com flags de mídia e views.
export const GET: APIRoute = async () => {
  const rows = await db.select().from(posts).orderBy(desc(posts.data), desc(posts.createdAt));
  return json(
    rows.map((r) => {
      const html = r.bodyHtml ?? '';
      return {
        id: r.id, slug: r.slug, titulo: r.titulo, situacao: r.situacao, publicarEm: r.publicarEm,
        data: r.data, idioma: r.idioma, capaUrl: r.capaUrl, views: r.views, tags: r.tags,
        temVideo: /<video-embed|<video[\s>]/i.test(html),
        temImagem: Boolean(r.capaUrl) || /<img[\s>]/i.test(html),
      };
    }),
  );
};

export const POST: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const titulo = String(b.titulo ?? '').trim();
  const resumo = String(b.resumo ?? '').trim();
  if (!titulo) return json({ error: 'Título é obrigatório.' }, 400);
  if (!resumo) return json({ error: 'Resumo é obrigatório.' }, 400);

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
    mbaFase: b.mba_fase === '' || b.mba_fase == null ? null : Number(b.mba_fase),
    mbaDisciplina: b.mba_disciplina ? String(b.mba_disciplina).trim() || null : null,
    bodyHtml: sanitizeBody(String(b.body_html ?? '')),
    bodyJson: (b.body_json ?? null) as unknown,
    situacao: (b.situacao as string) || 'rascunho',
  };

  try {
    const [row] = await db.insert(posts).values(values).returning();
    return json(row, 201);
  } catch (e) {
    return json({ error: 'Erro ao salvar (talvez o slug já exista).', detail: String((e as Error)?.message ?? e) }, 400);
  }
};
