import type { APIRoute } from 'astro';
import { bufferGraphQL, camposEscalares, tipoDoCampo, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// Backend do PLANEJAMENTO (Fase 1 - leitura): organização, canais conectados e métricas agregadas
// dos últimos 30 dias, direto do Buffer. _erros/_meta temporários pra ajuste; depois enxugo.
export const GET: APIRoute = async ({ url }) => {
  if (!temBuffer()) return resp({ erro: 'BUFFER_ACCESS_TOKEN ausente no ambiente.' });
  const dias = Math.min(90, Math.max(1, Number(url.searchParams.get('dias')) || 30));

  // 1) organização
  const acc = await bufferGraphQL<{ account: { organizations: { id: string; name: string }[] } }>(
    '{ account { organizations { id name } } }',
  );
  const orgId = acc.data?.account?.organizations?.[0]?.id;
  if (!orgId) return resp({ erro: 'Não achei a organização no Buffer.', _erros: acc.errors });

  // 2) canais conectados
  const ch = await bufferGraphQL<{ channels: any[] }>(
    'query($in: ChannelsInput!){ channels(input:$in){ id service name displayName avatar serviceId type isDisconnected } }',
    { in: { organizationId: orgId } },
  );
  const canais = (ch.data?.channels ?? []).filter((c) => !c.isDisconnected);

  // 3) descobre os campos das métricas e busca os últimos N dias
  const metricTipo = await tipoDoCampo('AggregatedPostMetrics', 'metrics');
  const metricCampos = metricTipo ? await camposEscalares(metricTipo) : [];
  const end = new Date();
  const start = new Date(end.getTime() - dias * 86400000);
  let metricas: any = null;
  let errosMetricas: any = null;
  if (metricCampos.length) {
    const m = await bufferGraphQL<{ aggregatedPostMetrics: any }>(
      `query($in: AggregatedPostMetricsInput!){ aggregatedPostMetrics(input:$in){ metrics { ${metricCampos.join(' ')} } metricsUpdatedAt } }`,
      { in: { organizationId: orgId, startDateTime: start.toISOString(), endDateTime: end.toISOString(), channelIds: canais.map((c) => c.id) } },
    );
    metricas = m.data?.aggregatedPostMetrics ?? null;
    errosMetricas = m.errors ?? null;
  }

  return resp({
    ok: true,
    orgId,
    canais,
    metricas,
    periodoDias: dias,
    _meta: { metricTipo, metricCampos },
    _erros: { canais: ch.errors ?? null, metricas: errosMetricas },
  });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
