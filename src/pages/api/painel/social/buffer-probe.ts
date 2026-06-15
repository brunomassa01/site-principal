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

  // POST GraphQL (a base nova deu 400 "Unsupported Content-Type" no GET = quer JSON; cara de GraphQL)
  const gql = async (nome: string, url: string, query: string) => {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const t = await r.text();
      const ok = r.ok && !/unauthor|forbidden|invalid/i.test(t);
      tentativas.push({ nome, url, status: r.status, ok, amostra: t.slice(0, 1800) });
    } catch (e) {
      tentativas.push({ nome, url, status: 0, ok: false, amostra: String((e as Error)?.message ?? e).slice(0, 160) });
    }
  };
  const API = 'https://api.buffer.com/';
  // campos da raiz com argumentos (como chamar channels e aggregatedPostMetrics)
  await gql('query_fields_args', API, '{ __schema { queryType { fields { name args { name type { name kind ofType { name } } } } } } }');
  // operações de mutação (publicar/agendar?)
  await gql('mutations', API, '{ __schema { mutationType { fields { name args { name } } } } }');
  // campos do tipo Channel
  await gql('tipo_channel', API, '{ __type(name:"Channel"){ fields { name type { name kind ofType { name } } } } }');
  // dados reais: lista os canais conectados
  await gql('channels_reais', API, '{ channels { id service name serviceUsername } }');

  const sucesso = tentativas.find((x) => x.ok);
  return json({
    funcionou: !!sucesso,
    qual: sucesso?.nome ?? null,
    tentativas,
  });
};
