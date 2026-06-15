// Cliente da API GraphQL do Buffer (api.buffer.com). Token em BUFFER_ACCESS_TOKEN (Vercel).
// API interna/não-documentada do Buffer — pode mudar; tratar erros com tolerância.

const ENDPOINT = 'https://api.buffer.com/';

export function temBuffer(): boolean {
  return !!process.env.BUFFER_ACCESS_TOKEN;
}

export async function bufferGraphQL<T = any>(query: string, variables?: Record<string, unknown>): Promise<{ data?: T; errors?: { message: string }[] }> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) return { errors: [{ message: 'BUFFER_ACCESS_TOKEN ausente.' }] };
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return (await r.json().catch(() => ({ errors: [{ message: 'Resposta inválida do Buffer.' }] }))) as { data?: T; errors?: { message: string }[] };
}

const tn = (t: any): string => {
  if (!t) return '?';
  if (t.name) return t.name;
  if (t.ofType) return t.kind === 'LIST' ? `[${tn(t.ofType)}]` : tn(t.ofType);
  return t.kind ?? '?';
};
const ehEscalar = (t: any): boolean => {
  let x = t;
  while (x && !x.name && x.ofType) x = x.ofType;
  return x?.kind === 'SCALAR' || x?.kind === 'ENUM';
};

/** Introspecta os campos escalares de um tipo (pra montar query sem chutar campo aninhado). */
export async function camposEscalares(tipo: string): Promise<string[]> {
  const q = `{ __type(name:"${tipo}"){ fields { name type { name kind ofType { name kind ofType { name kind } } } } } }`;
  const r = await bufferGraphQL<{ __type: { fields: { name: string; type: any }[] } }>(q);
  const fields = r.data?.__type?.fields ?? [];
  return fields.filter((f) => ehEscalar(f.type)).map((f) => f.name);
}

/** Introspecta os inputFields de um INPUT_OBJECT (nome:tipo) — pra saber o que cada input pede. */
export async function inputFields(tipo: string): Promise<string[]> {
  const q = `{ __type(name:"${tipo}"){ inputFields { name type { name kind ofType { name kind ofType { name } } } } } }`;
  const r = await bufferGraphQL<{ __type: { inputFields: { name: string; type: any }[] } }>(q);
  return (r.data?.__type?.inputFields ?? []).map((f) => `${f.name}:${tn(f.type)}`);
}
