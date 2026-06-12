import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../../lib/http';

export const prerender = false;

// Reações de 1 clique nos posts (público, anônimo). Conta por tipo no jsonb posts.reactions.
const TIPOS = ['aplausos', 'aprendi', 'top'] as const;
type Tipo = (typeof TIPOS)[number];

function limpa(r: unknown): Record<string, number> {
  const obj = (r ?? {}) as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const t of TIPOS) out[t] = Math.max(0, Math.floor(Number(obj[t]) || 0));
  return out;
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`SELECT reactions FROM posts WHERE slug = ${params.slug}`) as { reactions: unknown }[];
    return json({ reactions: limpa(rows[0]?.reactions) });
  } catch {
    return json({ reactions: limpa({}) });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  let body: { tipo?: string; op?: string } = {};
  try { body = await request.json(); } catch { /* corpo vazio */ }
  const tipo = body.tipo as Tipo;
  const op = body.op === 'remove' ? 'remove' : 'add';
  if (!TIPOS.includes(tipo)) return json({ error: 'Tipo de reação inválido.' }, 400);

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`SELECT reactions FROM posts WHERE slug = ${params.slug}`) as { reactions: unknown }[];
    if (!rows.length) return json({ error: 'Post não encontrado.' }, 404);
    const atual = limpa(rows[0].reactions);
    atual[tipo] = Math.max(0, atual[tipo] + (op === 'add' ? 1 : -1));
    await sql`UPDATE posts SET reactions = ${JSON.stringify(atual)}::jsonb WHERE slug = ${params.slug}`;
    return json({ reactions: atual });
  } catch (e) {
    return json({ error: 'Falha ao registrar a reação.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
