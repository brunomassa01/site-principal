import type { APIRoute } from 'astro';
import { and, eq, lte } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { socialPecas } from '../../../lib/db/schema';
import { json } from '../../../lib/http';
import { publicarTextoLinkedIn } from '../../../lib/social/linkedin';
import { setConfig } from '../../../lib/content/config';

export const prerender = false;

// Publica as peças de LinkedIn cujo horário já chegou. Cutucado por um cron externo a cada ~10 min.
// Protegido por CRON_SECRET (?key=...), pois fica fora da área autenticada do painel.
const textoDaPeca = (p: any): string => {
  const c = (p.conteudo ?? {}) as Record<string, any>;
  return (c.texto?.trim?.()) || (p.legenda?.trim?.()) || (p.gancho?.trim?.()) || '';
};

const handler: APIRoute = async ({ url }) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: 'CRON_SECRET não configurado no Vercel.' }, 500);
  if (url.searchParams.get('key') !== secret) return json({ error: 'não autorizado' }, 401);

  const agora = new Date();
  const devidas = await db.select().from(socialPecas).where(
    and(eq(socialPecas.formato, 'linkedin'), eq(socialPecas.status, 'agendado'), lte(socialPecas.agendadoPara, agora)),
  );

  const resultados: { id: string; ok: boolean; erro?: string; url?: string }[] = [];
  for (const p of devidas) {
    const texto = textoDaPeca(p);
    if (!texto || texto.length < 3) { resultados.push({ id: p.id, ok: false, erro: 'sem texto' }); continue; }
    const r = await publicarTextoLinkedIn(texto);
    if (r.ok) {
      await db.update(socialPecas).set({ status: 'publicado', publicadoEm: new Date(), urlPublicada: r.url ?? null, updatedAt: new Date() }).where(eq(socialPecas.id, p.id));
      resultados.push({ id: p.id, ok: true, url: r.url });
    } else {
      // token expirado: não adianta tentar as outras — para e registra
      await setConfig('linkedin_ultimo_erro', JSON.stringify({ erro: r.erro, tokenExpirado: !!r.tokenExpirado, pecaId: p.id, em: new Date().toISOString() })).catch(() => {});
      resultados.push({ id: p.id, ok: false, erro: r.erro });
      if (r.tokenExpirado) break;
    }
  }
  return json({ ok: true, processadas: devidas.length, publicadas: resultados.filter((r) => r.ok).length, resultados });
};

export const GET = handler;
export const POST = handler;
