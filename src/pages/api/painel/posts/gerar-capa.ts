import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';
import { json } from '../../../../lib/http';
import { capaPostElement, loadFontes, renderPng } from '../../../../lib/marca/render';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: 'Armazenamento de mídia não configurado.' }, 500);
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const titulo = String(b.titulo ?? '').trim();
  if (!titulo) return json({ error: 'Preencha o título do post antes de gerar a capa.' }, 400);
  const kicker = String(b.kicker ?? 'BLOG').toUpperCase().slice(0, 28) || 'BLOG';

  const base = new URL(request.url).origin;
  try {
    const fontes = await loadFontes(base);
    const png = await renderPng(capaPostElement(titulo, kicker), fontes, 1280, 720);
    const blob = await put(`posts/capa-marca.png`, png, { access: 'public', addRandomSuffix: true, contentType: 'image/png' });
    return json({ ok: true, url: blob.url });
  } catch (e) {
    return json({ error: 'Falha ao gerar a capa.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
