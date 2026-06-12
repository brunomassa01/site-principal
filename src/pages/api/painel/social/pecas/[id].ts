import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialPecas } from '../../../../../lib/db/schema';
import { json } from '../../../../../lib/http';

export const prerender = false;

const upd: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) return json({ error: 'ID ausente.' }, 400);
  const b = await request.json().catch(() => ({} as Record<string, unknown>));

  const set: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of ['gancho', 'lente', 'legenda', 'manychat', 'diaPublicacao', 'status', 'urlPublicada', 'midiaUrls'] as const) {
    if (k in b) set[k] = b[k];
  }
  if ('conteudo' in b) set.conteudo = b.conteudo;
  if (b.status === 'publicado') set.publicadoEm = new Date();

  try {
    const [row] = await db.update(socialPecas).set(set).where(eq(socialPecas.id, id)).returning();
    if (!row) return json({ error: 'Peça não encontrada.' }, 404);
    return json(row);
  } catch (e) {
    return json({ error: 'Erro ao salvar.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};

export const PUT = upd;
export const PATCH = upd;

export const DELETE: APIRoute = async ({ params }) => {
  await db.delete(socialPecas).where(eq(socialPecas.id, params.id!));
  return json({ ok: true });
};
