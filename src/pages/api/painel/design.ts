import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`SELECT logo_url, logo_altura, nome FROM identidade WHERE id = 'identidade'`) as { logo_url: string | null; logo_altura: number | null; nome: string }[];
    const r = rows[0];
    return json({ logoUrl: r?.logo_url ?? '', logoAltura: r?.logo_altura ?? 32, nome: r?.nome ?? 'Bruno Massa' });
  } catch (e) {
    return json({ error: 'Erro ao ler.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const logoUrl = typeof b.logoUrl === 'string' && b.logoUrl.trim() ? b.logoUrl.trim() : null;
  const logoAltura = Number(b.logoAltura) || null;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`UPDATE identidade SET logo_url = ${logoUrl}, logo_altura = ${logoAltura}, updated_at = now() WHERE id = 'identidade'`;
    return json({ ok: true, logoUrl: logoUrl ?? '', logoAltura });
  } catch (e) {
    return json({ error: 'Erro ao salvar.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};
