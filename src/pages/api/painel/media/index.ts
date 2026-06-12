import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../../lib/http';

export const prerender = false;

// Lista a biblioteca de mídia (uploads + imagens geradas por IA).
export const GET: APIRoute = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, url, tipo, nome, tamanho, origem, created_at
      FROM media WHERE situacao = 'publicado' ORDER BY created_at DESC LIMIT 500`;
    return json(rows);
  } catch (e) {
    return json({ error: 'Erro ao listar a mídia.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
