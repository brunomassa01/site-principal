import type { APIRoute } from 'astro';
import { bufferGraphQL, camposEscalares, inputFields, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// Backend do PLANEJAMENTO (Fase 1 - leitura). Traz os canais conectados no Buffer e,
// junto, descobre o formato dos inputs de métricas (pra finalizar a leitura de analytics).
// Retorna _schema/_erros temporariamente pra eu ajustar; depois enxugo.
export const GET: APIRoute = async () => {
  if (!temBuffer()) return resp({ erro: 'BUFFER_ACCESS_TOKEN ausente no ambiente.' });

  // 1) descobre os campos escalares de Channel e monta a query real
  const campos = await camposEscalares('Channel');
  const usar = campos.length ? campos : ['id', 'service', 'name'];
  const qChannels = `{ channels { ${usar.join(' ')} } }`;
  const ch = await bufferGraphQL<{ channels: any[] }>(qChannels);

  // 2) descobre o que os inputs de métricas/canais pedem (pra finalizar o próximo passo)
  const [inMetrics, inChannels, inPosts] = await Promise.all([
    inputFields('AggregatedPostMetricsInput'),
    inputFields('ChannelsInput'),
    inputFields('PostsInput'),
  ]);

  return resp({
    ok: !ch.errors,
    canais: ch.data?.channels ?? [],
    _erros: ch.errors ?? null,
    _schema: { channelCampos: campos, inMetrics, inChannels, inPosts },
  });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
