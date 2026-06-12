import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../../lib/http';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const label = String(b.label ?? '').trim();
  const link = String(b.url ?? '').trim();
  const ordem = Number(b.ordem ?? 0);
  if (!label || !link) return json({ error: 'Nome e link são obrigatórios.' }, 400);
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [row] = await sql`UPDATE menu_items SET label = ${label}, url = ${link}, ordem = ${ordem}, updated_at = now() WHERE id = ${params.id} RETURNING id, local, label, url, ordem`;
    return row ? json(row) : json({ error: 'Não encontrado' }, 404);
  } catch (e) {
    return json({ error: 'Erro ao salvar.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM menu_items WHERE id = ${params.id}`;
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Erro ao excluir.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
