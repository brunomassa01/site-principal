import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialSemanas } from '../../../../../lib/db/schema';
import { json } from '../../../../../lib/http';

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const numero = parseInt(params.numero ?? '', 10);
  if (!Number.isFinite(numero)) return json({ error: 'Número inválido.' }, 400);
  const b = await request.json().catch(() => ({} as Record<string, unknown>));

  const set: Record<string, unknown> = { updatedAt: new Date() };
  for (const k of ['status', 'tema', 'observacoes'] as const) {
    if (k in b) set[k] = b[k];
  }

  try {
    const [row] = await db.update(socialSemanas).set(set).where(eq(socialSemanas.numero, numero)).returning();
    if (!row) return json({ error: 'Semana não encontrada.' }, 404);
    return json(row);
  } catch (e) {
    return json({ error: 'Erro ao salvar.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};
