import type { APIRoute } from 'astro';
import { apagarNoBuffer, bufferGraphQL, getCanais, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// TEMP: lista canais (pra ver IG) + posts recentes do LinkedIn (pra achar o de 27/06 e ver status/data).
const VERSAO = 'debug-v5';

export const GET: APIRoute = async ({ url }) => {
  if (!temBuffer()) return resp({ erro: 'sem token' });
  const cancelar = url.searchParams.get('cancelar');
  if (cancelar) return resp({ cancelar, ...(await apagarNoBuffer(cancelar)) });

  const acc = await bufferGraphQL<{ account: { organizations: { id: string }[] } }>('{ account { organizations { id } } }');
  const orgId = acc.data?.account?.organizations?.[0]?.id;

  // todos os canais (cru), pra entender o IG
  const chAll = await bufferGraphQL<{ channels: any[] }>(
    'query($in: ChannelsInput!){ channels(input:$in){ id service name displayName isDisconnected isLocked } }',
    { in: { organizationId: orgId } },
  );
  const canais = (chAll.data?.channels ?? []).map((c) => ({ service: c.service, name: c.displayName || c.name, isDisconnected: c.isDisconnected, isLocked: c.isLocked }));
  const canaisLib = await getCanais();

  // posts recentes do LinkedIn (todos os status) pra achar o de 27/06
  const li = canaisLib.find((c) => c.service === 'linkedin');
  let postsLi: any[] = [];
  if (li) {
    const r = await bufferGraphQL<{ posts: { edges: { node: any }[] } }>(
      'query($in: PostsInput!){ posts(input:$in, first: 15){ edges { node { id status dueAt text channelService } } } }',
      { in: { organizationId: orgId, filter: { channelIds: [li.id], status: ['scheduled', 'draft', 'needs_approval', 'sending', 'error'] } } },
    );
    postsLi = (r.data?.posts?.edges ?? []).map((e) => ({ status: e.node.status, dueAt: e.node.dueAt, txt: (e.node.text || '').slice(0, 45) }));
    if (r.errors) postsLi = [{ erro: r.errors.map((x) => x.message).join('; ') }];
  }

  return resp({ versao: VERSAO, canaisCru: canais, canaisLib: canaisLib.map((c) => ({ service: c.service, name: c.name })), linkedinPosts: postsLi });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
