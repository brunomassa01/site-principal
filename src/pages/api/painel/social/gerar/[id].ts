import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialPecas, socialSemanas } from '../../../../../lib/db/schema';
import { json } from '../../../../../lib/http';
import { gerarConteudo } from '../../../../../lib/social/ia';
import { logUso } from '../../../../../lib/social/uso';

export const prerender = false;

export const POST: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return json({ error: 'ID ausente.' }, 400);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'IA não configurada (falta ANTHROPIC_API_KEY).' }, 500);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, id));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);
  const [semana] = await db.select().from(socialSemanas).where(eq(socialSemanas.id, peca.semanaId));

  try {
    const { conteudo, legenda, usage } = await gerarConteudo(peca as never, (semana ?? { cluster: null, ponteIa: false }) as never);
    await logUso('claude-sonnet-4-6', `gerar-${peca.formato}`, usage);
    const novoConteudo = { ...((peca.conteudo as Record<string, unknown>) ?? {}), ...conteudo };
    const set: Record<string, unknown> = { conteudo: novoConteudo, status: 'escrito', updatedAt: new Date() };
    if (legenda !== undefined) set.legenda = legenda;

    const [row] = await db.update(socialPecas).set(set).where(eq(socialPecas.id, id)).returning();
    return json({ ok: true, conteudo: row.conteudo, legenda: row.legenda, status: row.status });
  } catch (e) {
    return json({ error: 'Falha ao gerar com IA.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
