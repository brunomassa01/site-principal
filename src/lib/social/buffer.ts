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

/** Canais conectados (leve: id + service + nome). */
export async function getCanais(): Promise<{ id: string; service: string; name: string; displayName?: string }[]> {
  if (!process.env.BUFFER_ACCESS_TOKEN) return [];
  const acc = await bufferGraphQL<{ account: { organizations: { id: string }[] } }>('{ account { organizations { id } } }');
  const orgId = acc.data?.account?.organizations?.[0]?.id;
  if (!orgId) return [];
  const ch = await bufferGraphQL<{ channels: any[] }>(
    'query($in: ChannelsInput!){ channels(input:$in){ id service name displayName isDisconnected } }',
    { in: { organizationId: orgId } },
  );
  return (ch.data?.channels ?? []).filter((c) => !c.isDisconnected);
}

/** Cria um RASCUNHO no Buffer (saveToDraft:true NUNCA publica direto). */
export async function criarRascunhoBuffer(channelId: string, text: string): Promise<{ ok: boolean; erro?: string }> {
  const M = 'mutation($in: CreatePostInput!){ createPost(input:$in){ __typename } }';
  const r = await bufferGraphQL(M, { in: { channelId, text, saveToDraft: true } });
  if (r.errors?.length) return { ok: false, erro: r.errors.map((e) => e.message).join('; ') };
  return { ok: true };
}

export type CanalBuffer = {
  id: string; service: string; name: string; displayName?: string; avatar?: string;
  serviceId?: string; type?: string;
  metricas: { type: string; name: string; description?: string; value: number; unit?: string }[];
  atualizadoEm?: string | null;
};

/** Dados do PLANEJAMENTO: organização + canais conectados, cada um com as métricas agregadas do período. */
export async function getPlanejamentoBuffer(dias = 30): Promise<{ canais: CanalBuffer[]; dias: number; erro?: string }> {
  if (!process.env.BUFFER_ACCESS_TOKEN) return { canais: [], dias, erro: 'sem-token' };
  const acc = await bufferGraphQL<{ account: { organizations: { id: string }[] } }>('{ account { organizations { id } } }');
  const orgId = acc.data?.account?.organizations?.[0]?.id;
  if (!orgId) return { canais: [], dias, erro: 'sem-organizacao' };

  const ch = await bufferGraphQL<{ channels: any[] }>(
    'query($in: ChannelsInput!){ channels(input:$in){ id service name displayName avatar serviceId type isDisconnected } }',
    { in: { organizationId: orgId } },
  );
  const canais = (ch.data?.channels ?? []).filter((c) => !c.isDisconnected);

  const end = new Date();
  const start = new Date(end.getTime() - dias * 86400000);
  const METQ = 'query($in: AggregatedPostMetricsInput!){ aggregatedPostMetrics(input:$in){ metrics { type name description value unit } metricsUpdatedAt } }';
  const comMetricas = await Promise.all(
    canais.map(async (c): Promise<CanalBuffer> => {
      const m = await bufferGraphQL<{ aggregatedPostMetrics: { metrics: any[]; metricsUpdatedAt: string } }>(METQ, {
        in: { organizationId: orgId, startDateTime: start.toISOString(), endDateTime: end.toISOString(), channelIds: [c.id] },
      });
      return {
        id: c.id, service: c.service, name: c.name, displayName: c.displayName, avatar: c.avatar,
        serviceId: c.serviceId, type: c.type,
        metricas: m.data?.aggregatedPostMetrics?.metrics ?? [],
        atualizadoEm: m.data?.aggregatedPostMetrics?.metricsUpdatedAt ?? null,
      };
    }),
  );
  return { canais: comMetricas, dias };
}

/** Nome do tipo de um campo dentro de um tipo (resolve LIST/NON_NULL). Ex.: AggregatedPostMetrics.metrics -> 'PostMetric'. */
export async function tipoDoCampo(tipoPai: string, campo: string): Promise<string | null> {
  const q = `{ __type(name:"${tipoPai}"){ fields { name type { name kind ofType { name kind ofType { name kind ofType { name } } } } } } }`;
  const r = await bufferGraphQL<{ __type: { fields: { name: string; type: any }[] } }>(q);
  const f = r.data?.__type?.fields?.find((x) => x.name === campo);
  if (!f) return null;
  return tn(f.type).replace(/[[\]]/g, '');
}
