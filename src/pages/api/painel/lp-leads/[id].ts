import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { lpLeads } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';

export const prerender = false;

const SITUACOES = ['novo', 'selecionado', 'descartado', 'inscrito'];

export const PATCH: APIRoute = async ({ params, request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  if (typeof b.situacao !== 'string' || !SITUACOES.includes(b.situacao)) {
    return json({ error: 'Situação inválida' }, 400);
  }
  const [r] = await db.update(lpLeads).set({ situacao: b.situacao }).where(eq(lpLeads.id, params.id!)).returning();
  return r ? json({ ok: true }) : json({ error: 'Não encontrado' }, 404);
};

export const DELETE: APIRoute = async ({ params }) => {
  await db.delete(lpLeads).where(eq(lpLeads.id, params.id!));
  return json({ ok: true });
};
