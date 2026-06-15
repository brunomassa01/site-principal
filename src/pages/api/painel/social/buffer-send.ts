import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { socialPecas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { agendarNoBuffer, getCanais, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// Agenda a publicação de uma peça no Buffer (por dentro do painel). dry=true só simula (não posta).
const servicoDoFormato = (formato: string) => (formato === 'linkedin' ? 'linkedin' : 'instagram');

function textoDaPeca(p: any): string {
  const c = (p.conteudo ?? {}) as Record<string, any>;
  return (p.legenda?.trim()) || (c.texto?.trim?.()) || (p.gancho?.trim?.()) || '';
}

export const POST: APIRoute = async ({ request }) => {
  if (!temBuffer()) return json({ error: 'Buffer não conectado (falta BUFFER_ACCESS_TOKEN no Vercel).' }, 500);
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const pecaId = String(b.pecaId ?? '');
  const dueAt = String(b.dueAt ?? '');
  const dry = b.dry === true;
  if (!pecaId) return json({ error: 'pecaId é obrigatório.' }, 400);
  if (!dueAt || Number.isNaN(Date.parse(dueAt))) return json({ error: 'Escolha a data e a hora do agendamento.' }, 400);
  if (Date.parse(dueAt) <= Date.now()) return json({ error: 'A data de agendamento precisa ser no futuro.' }, 400);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, pecaId));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);

  const texto = textoDaPeca(peca);
  if (!texto || texto.length < 5) return json({ error: 'Esta peça ainda não tem texto/legenda pra enviar.' }, 400);

  const servico = servicoDoFormato(peca.formato);
  const canais = await getCanais();
  const canal = canais.find((c) => c.service === servico);
  if (!canal) return json({ error: `Você não tem um canal de ${servico} conectado no Buffer.` }, 400);

  if (dry) {
    return json({ dry: true, canal: { service: canal.service, name: canal.displayName || canal.name }, dueAt, textoPreview: texto.slice(0, 280) });
  }

  const r = await agendarNoBuffer(canal.id, texto, new Date(dueAt).toISOString(), servico);
  if (!r.ok) return json({ error: 'O Buffer recusou o agendamento.', detail: r.erro }, 502);
  return json({ ok: true, canal: canal.service, dueAt });
};
