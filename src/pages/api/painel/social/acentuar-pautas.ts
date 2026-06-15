import type { APIRoute } from 'astro';
import { between, eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { socialPecas, socialSemanas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { acentuar } from '../../../../lib/social/ia';

export const prerender = false;

// Acentua as pautas (gancho/lente) das semanas 1-52. Só aplica quando NADA além do acento muda
// (verificação: tirando os acentos, o texto tem que ficar idêntico). Processa em lotes (?limite=).
const semAcento = (s: string | null) => !!s && !/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(s) && /[a-z]/i.test(s);
// remove acentos/cedilha de forma robusta (qualquer marca combinante Unicode)
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').trim();

export const POST: APIRoute = async ({ url }) => {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'IA não configurada.' }, 500);
  const limite = Math.min(60, Math.max(5, Number(url.searchParams.get('limite')) || 40));

  const rows = await db
    .select({ id: socialPecas.id, gancho: socialPecas.gancho, lente: socialPecas.lente, numero: socialSemanas.numero })
    .from(socialPecas)
    .innerJoin(socialSemanas, eq(socialSemanas.id, socialPecas.semanaId))
    .where(between(socialSemanas.numero, 1, 52));

  type Item = { id: string; campo: 'gancho' | 'lente'; original: string };
  const fila: Item[] = [];
  for (const r of rows) {
    if (semAcento(r.gancho)) fila.push({ id: r.id, campo: 'gancho', original: r.gancho! });
    if (semAcento(r.lente)) fila.push({ id: r.id, campo: 'lente', original: r.lente! });
  }
  const totalPendente = fila.length;
  const lote = fila.slice(0, limite);
  if (!lote.length) return json({ ok: true, atualizados: 0, pulados: 0, restantes: 0, totalPendente: 0 });

  const corrigidos = await acentuar(lote.map((i) => i.original));

  let atualizados = 0;
  let pulados = 0;
  const exemplos: { de: string; para: string; ok: boolean }[] = [];
  const patchPorPeca: Record<string, Record<string, string>> = {};
  for (let i = 0; i < lote.length; i++) {
    const it = lote[i];
    const novo = (corrigidos[i] ?? '').trim();
    const seguro = !!novo && novo !== it.original && fold(novo) === fold(it.original);
    if (exemplos.length < 4) exemplos.push({ de: it.original.slice(0, 48), para: novo.slice(0, 48), ok: seguro });
    if (seguro) {
      (patchPorPeca[it.id] ??= {})[it.campo] = novo;
      atualizados++;
    } else {
      pulados++;
    }
  }
  for (const [id, patch] of Object.entries(patchPorPeca)) {
    await db.update(socialPecas).set({ ...patch, updatedAt: new Date() }).where(eq(socialPecas.id, id));
  }

  return json({ ok: true, atualizados, pulados, restantes: Math.max(0, totalPendente - lote.length), totalPendente, exemplos });
};
