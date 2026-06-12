import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialPecas } from '../../../../../lib/db/schema';
import { json } from '../../../../../lib/http';
import { gerarRespostaManychat } from '../../../../../lib/social/ia';
import { logUso } from '../../../../../lib/social/uso';

export const prerender = false;

// Gera a resposta automática do Manychat (pedido de automação + entrega) para a peça e persiste no conteúdo.
export const POST: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return json({ error: 'ID ausente.' }, 400);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'IA não configurada (falta ANTHROPIC_API_KEY).' }, 500);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, id));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);

  try {
    const { pedido, entrega, usage } = await gerarRespostaManychat(peca as never);
    await logUso('claude-sonnet-4-6', 'manychat', usage);
    const novoConteudo = { ...((peca.conteudo as Record<string, unknown>) ?? {}), manychatPedido: pedido, manychatEntrega: entrega };
    const [row] = await db.update(socialPecas).set({ conteudo: novoConteudo, updatedAt: new Date() }).where(eq(socialPecas.id, id)).returning();
    return json({ ok: true, pedido, entrega, conteudo: row.conteudo });
  } catch (e) {
    return json({ error: 'Falha ao gerar a resposta do Manychat.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
