import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialPecas, socialSemanas } from '../../../../../lib/db/schema';
import { json } from '../../../../../lib/http';

export const prerender = false;

// Cria uma peça nova numa semana (ex.: post único). Herda a palavra-chave do Manychat da semana.
export const POST: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const numero = Number(b.numero);
  const formato = String(b.formato ?? '').trim();
  // Number.isInteger (e não !numero): a área "Conteúdos avulsos" é a semana 0, e 0 é falsy em JS
  if (!Number.isInteger(numero) || numero < 0 || !formato) return json({ error: 'numero e formato são obrigatórios.' }, 400);

  const [semana] = await db.select().from(socialSemanas).where(eq(socialSemanas.numero, numero));
  if (!semana) return json({ error: 'Semana não encontrada.' }, 404);
  const [outra] = await db.select().from(socialPecas).where(eq(socialPecas.semanaId, semana.id));

  try {
    const [row] = await db.insert(socialPecas).values({
      semanaId: semana.id, formato, manychat: outra?.manychat ?? null, status: 'planejado',
    }).returning();
    return json(row, 201);
  } catch (e) {
    return json({ error: 'Erro ao criar a peça.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};
