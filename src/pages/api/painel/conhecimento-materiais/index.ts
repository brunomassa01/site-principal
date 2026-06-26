import type { APIRoute } from 'astro';
import { asc, desc } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { conhecimentoMateriais } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';

export const prerender = false;

export const GET: APIRoute = async () => {
  const rows = await db
    .select()
    .from(conhecimentoMateriais)
    .orderBy(asc(conhecimentoMateriais.fase), asc(conhecimentoMateriais.disciplina), desc(conhecimentoMateriais.createdAt));
  return json(rows);
};

// Registra um material já enviado ao Blob (o upload em si é feito direto pelo cliente).
export const POST: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const url = String(b.url ?? '').trim();
  const nome = String(b.nome ?? '').trim();
  if (!url || !nome) return json({ error: 'Arquivo inválido.' }, 400);
  const [row] = await db
    .insert(conhecimentoMateriais)
    .values({
      nome,
      url,
      ext: b.ext ? String(b.ext) : null,
      tamanho: b.tamanho ? Number(b.tamanho) : null,
      fase: b.fase ? Number(b.fase) : null,
      disciplina: b.disciplina ? String(b.disciplina) : null,
    })
    .returning();
  return json(row, 201);
};
