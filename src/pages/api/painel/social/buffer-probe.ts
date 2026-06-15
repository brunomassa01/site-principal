import type { APIRoute } from 'astro';
import { json } from '../../../../lib/http';

export const prerender = false;

// Sondagem diagnóstica do Buffer: descobre o que o token (em BUFFER_ACCESS_TOKEN, no Vercel)
// consegue fazer. NÃO retorna o token. Endpoint temporário — remover depois de mapear a API.
export const GET: APIRoute = async () => {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return json({ erro: 'BUFFER_ACCESS_TOKEN não está no ambiente (Vercel).' }, 500);

  const tentativas: { nome: string; url: string; status: number; ok: boolean; amostra: string }[] = [];
  const tenta = async (nome: string, url: string, headers: Record<string, string>) => {
    try {
      const r = await fetch(url, { headers });
      const t = await r.text();
      tentativas.push({ nome, url: url.split('?')[0], status: r.status, ok: r.ok, amostra: t.slice(0, 220) });
      return { ok: r.ok, t };
    } catch (e) {
      tentativas.push({ nome, url: url.split('?')[0], status: 0, ok: false, amostra: String((e as Error)?.message ?? e).slice(0, 160) });
      return { ok: false, t: '' };
    }
  };

  // 1) API clássica, token como query
  await tenta('classica_query', `https://api.bufferapp.com/1/profiles.json?access_token=${encodeURIComponent(token)}`, {});
  // 2) API clássica, Bearer
  await tenta('classica_bearer', 'https://api.bufferapp.com/1/profiles.json', { Authorization: `Bearer ${token}` });
  // 3) base nova, Bearer
  await tenta('nova_bearer', 'https://api.buffer.com/1/profiles.json', { Authorization: `Bearer ${token}` });
  // 4) base nova sem versão
  await tenta('nova_channels', 'https://api.buffer.com/channels', { Authorization: `Bearer ${token}` });

  const sucesso = tentativas.find((x) => x.ok);
  return json({
    funcionou: !!sucesso,
    qual: sucesso?.nome ?? null,
    tentativas,
  });
};
