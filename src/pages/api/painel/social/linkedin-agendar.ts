import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { socialPecas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';

export const prerender = false;

// Agenda uma peça de LinkedIn: guarda a data/hora (horário de São Paulo, UTC-3) e marca status 'agendado'.
// Quem publica na hora é o cron /api/cron/linkedin-agendados.
export const POST: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const pecaId = String(b.pecaId ?? '');
  const dueAt = String(b.dueAt ?? '');
  if (!pecaId) return json({ error: 'pecaId é obrigatório.' }, 400);

  // cancelar agendamento: volta pra 'aprovado' e limpa a data
  if (b.cancelar === true) {
    await db.update(socialPecas).set({ status: 'aprovado', agendadoPara: null, updatedAt: new Date() }).where(eq(socialPecas.id, pecaId));
    return json({ ok: true, cancelado: true });
  }

  const m = dueAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return json({ error: 'Escolha a data e a hora do agendamento.' }, 400);
  const quando = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] + 3, +m[5])); // SP (UTC-3) -> UTC
  if (quando.getTime() <= Date.now()) return json({ error: 'A data de agendamento precisa ser no futuro.' }, 400);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, pecaId));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);
  if (peca.formato !== 'linkedin') return json({ error: 'Por enquanto, agendar só pra peças de LinkedIn.' }, 400);

  await db.update(socialPecas).set({ status: 'agendado', agendadoPara: quando, updatedAt: new Date() }).where(eq(socialPecas.id, pecaId));
  return json({ ok: true, agendadoPara: quando.toISOString() });
};
