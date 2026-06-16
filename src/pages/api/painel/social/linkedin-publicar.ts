import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { socialPecas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { checarLinkedIn, publicarTextoLinkedIn, temLinkedIn } from '../../../../lib/social/linkedin';
import { setConfig } from '../../../../lib/content/config';

export const prerender = false;

function textoDaPeca(p: any): string {
  const c = (p.conteudo ?? {}) as Record<string, any>;
  return (c.texto?.trim?.()) || (p.legenda?.trim?.()) || (p.gancho?.trim?.()) || '';
}

// Publica uma peça de LinkedIn no perfil pessoal. dry=true só verifica o token (não posta).
export const POST: APIRoute = async ({ request }) => {
  if (!temLinkedIn()) return json({ error: 'LinkedIn não conectado (falta LINKEDIN_ACCESS_TOKEN no Vercel).' }, 500);
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const pecaId = String(b.pecaId ?? '');
  const dry = b.dry === true;
  if (!pecaId) return json({ error: 'pecaId é obrigatório.' }, 400);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, pecaId));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);
  if (peca.formato !== 'linkedin') return json({ error: 'Por enquanto, publicar direto só pra peças de LinkedIn.' }, 400);

  const texto = textoDaPeca(peca);
  if (!texto || texto.length < 3) return json({ error: 'Esta peça ainda não tem texto pra publicar.' }, 400);

  if (dry) {
    const c = await checarLinkedIn();
    return json({ dry: true, ok: c.ok, urn: c.urn, erro: c.erro, textoPreview: texto.slice(0, 200), chars: texto.length });
  }

  const r = await publicarTextoLinkedIn(texto);
  if (!r.ok) {
    await setConfig('linkedin_ultimo_erro', JSON.stringify({ erro: r.erro, tokenExpirado: !!r.tokenExpirado, em: new Date().toISOString() })).catch(() => {});
    return json({ error: r.tokenExpirado ? 'O token do LinkedIn expirou — gere um novo e atualize no Vercel.' : 'O LinkedIn recusou a publicação.', detail: r.erro }, 502);
  }
  await db.update(socialPecas).set({ status: 'publicado', publicadoEm: new Date(), urlPublicada: r.url ?? null, updatedAt: new Date() }).where(eq(socialPecas.id, pecaId));
  return json({ ok: true, url: r.url });
};
