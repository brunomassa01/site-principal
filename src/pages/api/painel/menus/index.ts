import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const local = url.searchParams.get('local') ?? 'topo';
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, local, label, url, ordem FROM menu_items WHERE local = ${local} ORDER BY ordem, created_at`;
    return json(rows);
  } catch (e) {
    return json({ error: 'Erro ao listar.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const label = String(b.label ?? '').trim();
  const link = String(b.url ?? '').trim();
  const local = String(b.local ?? 'topo').trim();
  if (!label || !link) return json({ error: 'Nome e link são obrigatórios.' }, 400);
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [m] = (await sql`SELECT COALESCE(MAX(ordem), -1) + 1 AS proxima FROM menu_items WHERE local = ${local}`) as { proxima: number }[];
    const [row] = await sql`INSERT INTO menu_items (local, label, url, ordem) VALUES (${local}, ${label}, ${link}, ${m.proxima}) RETURNING id, local, label, url, ordem`;
    return json(row, 201);
  } catch (e) {
    return json({ error: 'Erro ao criar.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};
