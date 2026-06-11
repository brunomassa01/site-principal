import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../../lib/http';

export const prerender = false;

// Lista os fundos da biblioteca (fotos P&B curadas) para o seletor de capa.
export const GET: APIRoute = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, url, rotulo FROM social_fundos ORDER BY ordem, criado_em`;
    return json(rows);
  } catch {
    return json([]);
  }
};
