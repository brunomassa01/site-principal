import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { socialPecas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { agendarNoBuffer, BufferIndisponivel, getCanais, temBuffer } from '../../../../lib/social/buffer';
import { setConfig } from '../../../../lib/content/config';

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
  // o input vem como horário LOCAL do Bruno (São Paulo, UTC-3). Converte pra UTC corretamente.
  const m = dueAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return json({ error: 'Escolha a data e a hora do agendamento.' }, 400);
  const dueIso = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + 3, +m[5])).toISOString();
  if (Date.parse(dueIso) <= Date.now()) return json({ error: 'A data de agendamento precisa ser no futuro.' }, 400);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, pecaId));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);

  const texto = textoDaPeca(peca);
  if (!texto || texto.length < 5) return json({ error: 'Esta peça ainda não tem texto/legenda pra enviar.' }, 400);

  const servico = servicoDoFormato(peca.formato);
  let canais: { id: string; service: string; name: string; displayName?: string }[];
  try {
    canais = await getCanais();
  } catch (e) {
    if (e instanceof BufferIndisponivel) return json({ error: 'O Buffer não respondeu agora (instabilidade ou limite de chamadas). Espere 1-2 minutos e tente de novo.', detail: String((e as Error).message) }, 503);
    throw e;
  }
  const canal = canais.find((c) => c.service === servico);
  if (!canal) return json({ error: `Você não tem um canal de ${servico} conectado no Buffer. Canais que apareceram: ${canais.map((c) => c.service).join(', ') || 'nenhum'}.` }, 400);

  const imagens = Array.isArray(peca.midiaUrls) ? (peca.midiaUrls as string[]) : [];

  if (dry) {
    return json({ dry: true, canal: { service: canal.service, name: canal.displayName || canal.name }, dueAt, imagens: imagens.length, textoPreview: texto.slice(0, 280) });
  }

  const r = await agendarNoBuffer(canal.id, texto, dueIso, imagens, servico);
  if (!r.ok) {
    // grava o erro exato pra diagnóstico (lido depois, sem o Bruno transcrever)
    await setConfig('buffer_ultimo_erro', JSON.stringify({ erro: r.erro, formato: peca.formato, canal: servico, dueAt, imagens: imagens.length, em: new Date().toISOString() })).catch(() => {});
    return json({ error: 'O Buffer recusou o agendamento.', detail: r.erro }, 502);
  }
  return json({ ok: true, canal: canal.service, dueAt, imagens: imagens.length, postId: r.postId, status: r.status });
};
