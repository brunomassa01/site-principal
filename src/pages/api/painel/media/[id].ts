import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { del } from '@vercel/blob';
import { json } from '../../../../lib/http';

export const prerender = false;

// Exclui uma mídia: remove do Blob e do catálogo.
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`SELECT url FROM media WHERE id = ${params.id}`) as { url: string }[];
    if (rows[0]?.url) {
      try { await del(rows[0].url); } catch { /* o blob pode já não existir */ }
    }
    await sql`DELETE FROM media WHERE id = ${params.id}`;
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Erro ao excluir.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
