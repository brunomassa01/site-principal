import type { APIRoute } from 'astro';
import { bufferGraphQL, getCanais, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// TEMP: acha os posts AGENDADOS/rascunho do LinkedIn pra ver em que estado o createPost deixou.
const VERSAO = 'debug-v2';

export const GET: APIRoute = async () => {
  if (!temBuffer()) return resp({ erro: 'sem token' });
  const acc = await bufferGraphQL<{ account: { organizations: { id: string }[] } }>('{ account { organizations { id } } }');
  const orgId = acc.data?.account?.organizations?.[0]?.id;
  const canais = await getCanais();
  const li = canais.find((c) => c.service === 'linkedin');

  const sel = 'id status dueAt createdAt text channelId channelService isCustomScheduled shareMode schedulingType notificationStatus';
  const q = `query($in: PostsInput!){ posts(input:$in, first: 25){ edges { node { ${sel} } } } }`;
  const r = await bufferGraphQL<{ posts: { edges: { node: any }[] } }>(q, {
    in: { organizationId: orgId, filter: { channelIds: li ? [li.id] : [], status: ['scheduled', 'draft', 'needs_approval', 'sending', 'error'] } },
  });
  const posts = (r.data?.posts?.edges ?? []).map((e) => e.node);

  return resp({ versao: VERSAO, linkedinId: li?.id, totalPosts: posts.length, posts, _erros: r.errors ?? null });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
