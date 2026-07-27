import type { APIRoute } from 'astro';
import { json } from '../../../lib/http';
import { criarCandidatura, getLandingPage } from '../../../lib/content/lp';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));

  const lpSlug = String(b.lp_slug ?? '').trim();
  const nome = String(b.nome ?? '').trim();
  const email = String(b.email ?? '').trim();
  const whatsapp = String(b.whatsapp ?? '').trim();

  if (!lpSlug) return json({ error: 'Produto não identificado.' }, 400);
  // A LP precisa existir (evita lixo de candidatura para slug inventado).
  const lp = await getLandingPage(lpSlug);
  if (!lp) return json({ error: 'Produto não encontrado.' }, 404);

  if (!nome) return json({ error: 'Por favor, informe seu nome.' }, 400);
  if (!email && !whatsapp) return json({ error: 'Informe um e-mail ou WhatsApp para contato.' }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'E-mail inválido.' }, 400);

  try {
    await criarCandidatura({
      lpSlug,
      nome,
      email: email || null,
      whatsapp: whatsapp || null,
      empresa: String(b.empresa ?? '').trim() || null,
      cargo: String(b.cargo ?? '').trim() || null,
      desafio: String(b.desafio ?? '').trim() || null,
    });
    return json({ ok: true });
  } catch (e) {
    return json({ error: 'Não foi possível registrar sua candidatura. Tente de novo.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
