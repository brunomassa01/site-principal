import type { APIRoute } from 'astro';
import { json } from '../../../../lib/http';
import { gerarCapaBlog } from '../../../../lib/social/imagem';

export const prerender = false;

// Gera uma capa de blog com IA (Gemini) a partir do título do post.
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Não autenticado' }, 401);
  if (!process.env.GEMINI_API_KEY) return json({ error: 'Gerador de imagem não configurado (falta GEMINI_API_KEY).' }, 500);

  let body: { titulo?: string } = {};
  try { body = await request.json(); } catch { /* corpo vazio */ }

  const img = await gerarCapaBlog((body.titulo ?? '').trim());
  if ('error' in img) return json({ error: img.error }, 502);
  return json({ url: img.url });
};
