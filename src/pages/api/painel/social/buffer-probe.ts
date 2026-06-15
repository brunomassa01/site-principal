import type { APIRoute } from 'astro';

export const prerender = false;

// Sondagem diagnóstica do Buffer (TEMPORÁRIA — remover ao terminar a integração).
// Introspecção COMPLETA do schema: devolve, compacto, os tipos OBJECT/INPUT/ENUM relevantes.
const VERSAO = 'v4-full';

export const GET: APIRoute = async () => {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return resp({ erro: 'BUFFER_ACCESS_TOKEN ausente no ambiente.' });

  const r = await fetch('https://api.buffer.com/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `{ __schema { types {
        name kind
        enumValues { name }
        fields { name type { name kind ofType { name kind ofType { name kind ofType { name } } } } }
        inputFields { name type { name kind ofType { name kind ofType { name kind ofType { name } } } } }
      } } }`,
    }),
  }).catch(() => null);
  const j = r ? await r.json().catch(() => null) : null;
  const all = j?.data?.__schema?.types ?? [];

  const tn = (t: any): string => {
    if (!t) return '?';
    if (t.name) return t.name;
    if (t.ofType) return t.kind === 'LIST' ? `[${tn(t.ofType)}]` : tn(t.ofType);
    return t.kind ?? '?';
  };
  // só o que interessa: tipos do domínio (Channel, métricas, Post, Account, e os *Input)
  const relevante = (n: string) =>
    !n.startsWith('__') && /channel|metric|post|account|idea|input|organization|service/i.test(n);

  const tipos = all
    .filter((t: any) => relevante(t.name) && ['OBJECT', 'INPUT_OBJECT', 'ENUM'].includes(t.kind))
    .map((t: any) => ({
      nome: t.name,
      kind: t.kind,
      valores: t.enumValues?.map((e: any) => e.name),
      campos: (t.fields ?? t.inputFields ?? []).map((f: any) => `${f.name}:${tn(f.type)}`),
    }));

  return resp({ versao: VERSAO, totalTipos: all.length, tipos });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
