import type { APIRoute } from 'astro';

export const prerender = false;

// Sondagem diagnóstica do Buffer (TEMPORÁRIA — remover ao terminar a integração).
// Introspecta o schema GraphQL do Buffer pra mapear o que dá pra ler. NÃO retorna o token.
const VERSAO = 'v3-schema';

export const GET: APIRoute = async () => {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return resp({ erro: 'BUFFER_ACCESS_TOKEN ausente no ambiente.' });

  const gql = async (query: string) => {
    try {
      const r = await fetch('https://api.buffer.com/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      return await r.json().catch(() => null);
    } catch { return null; }
  };
  const tn = (t: any): string => {
    if (!t) return '?';
    if (t.name) return t.name;
    if (t.ofType) return t.kind === 'LIST' ? `[${tn(t.ofType)}]` : tn(t.ofType);
    return t.kind ?? '?';
  };

  // 1) campos da raiz + args + tipo de retorno; + mutations
  const a = await gql(`{ __schema {
    queryType { fields { name args { name type { name kind ofType { name kind ofType { name } } } } type { name kind ofType { name kind ofType { name } } } } }
    mutationType { fields { name } }
  } }`);
  const qfields = a?.data?.__schema?.queryType?.fields ?? [];
  const queryFields = qfields.map((f: any) => ({
    nome: f.name,
    args: (f.args ?? []).map((ar: any) => `${ar.name}:${tn(ar.type)}`),
    retorna: tn(f.type),
  }));
  const mutations = (a?.data?.__schema?.mutationType?.fields ?? []).map((m: any) => m.name);

  // 2) introspecta tipos-chave (resolve o nome do tipo de retorno dos campos importantes)
  const retDe = (n: string) => queryFields.find((f: any) => f.nome === n)?.retorna?.replace(/[[\]]/g, '');
  const introType = async (name?: string) => {
    if (!name || name === '?') return null;
    const r = await gql(`{ __type(name:"${name}"){ name kind fields { name type { name kind ofType { name kind ofType { name } } } } } }`);
    const t = r?.data?.__type;
    if (!t) return { tipo: name, achou: false };
    return { tipo: t.name, kind: t.kind, campos: (t.fields ?? []).map((f: any) => `${f.name}:${tn(f.type)}`) };
  };

  const tipos: Record<string, unknown> = {};
  for (const n of ['channels', 'aggregatedPostMetrics', 'posts', 'account']) {
    tipos[n] = await introType(retDe(n));
  }

  return resp({ versao: VERSAO, queryFields, mutations, tipos });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
