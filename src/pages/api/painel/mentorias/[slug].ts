import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { landingPages } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';

export const prerender = false;

// Campos de `dados` editáveis pelo Painel (as alavancas comerciais). O resto do
// conteúdo longo continua vindo do doc → seed, como combinado.
const CAMPOS_TEXTO = ['selo', 'headline', 'subheadline', 'preco', 'precoNota', 'parcelamento', 'ctaTexto', 'ctaNota', 'fotoUrl', 'checkoutUrl'];

export const PATCH: APIRoute = async ({ params, request }) => {
  const slug = params.slug!;
  const b = await request.json().catch(() => ({} as Record<string, unknown>));

  const [lp] = await db.select().from(landingPages).where(eq(landingPages.slug, slug));
  if (!lp) return json({ error: 'Landing page não encontrada' }, 404);

  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof b.status === 'string' && ['rascunho', 'publicado'].includes(b.status)) {
    patch.status = b.status;
  }

  // Merge raso de campos de texto em `dados`.
  if (b.dados && typeof b.dados === 'object') {
    const atual = (lp.dados ?? {}) as Record<string, unknown>;
    const entrada = b.dados as Record<string, unknown>;
    const merge: Record<string, unknown> = { ...atual };
    for (const k of CAMPOS_TEXTO) {
      if (k in entrada) merge[k] = typeof entrada[k] === 'string' ? String(entrada[k]).trim() : entrada[k];
    }
    if (Array.isArray(entrada.infoLinha)) {
      merge.infoLinha = (entrada.infoLinha as unknown[]).map((s) => String(s).trim()).filter(Boolean);
    }
    patch.dados = merge;
  }

  const [row] = await db.update(landingPages).set(patch).where(eq(landingPages.slug, slug)).returning();
  return json({ ok: true, status: row.status });
};
