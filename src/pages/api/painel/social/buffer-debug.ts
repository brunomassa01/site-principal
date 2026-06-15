import type { APIRoute } from 'astro';
import { bufferGraphQL, camposEscalares, inputFields, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// TEMP: diagnostica o que o createPost gerou no Buffer (status/dueAt dos posts recentes) + shape dos inputs.
const VERSAO = 'debug-v1';

export const GET: APIRoute = async () => {
  if (!temBuffer()) return resp({ erro: 'sem token' });
  const acc = await bufferGraphQL<{ account: { organizations: { id: string }[] } }>('{ account { organizations { id } } }');
  const orgId = acc.data?.account?.organizations?.[0]?.id;

  const campos = await camposEscalares('Post');
  const usar = campos.filter((c) => /id|status|due|created|updated|text|scheduling|mode|via|sentAt|channelId/i.test(c));
  const sel = (usar.length ? usar : ['id', 'status']).join(' ');

  // tenta listar posts recentes (com e sem filtro de status)
  const q = `query($in: PostsInput!){ posts(input:$in, first: 25){ edges { node { ${sel} } } } }`;
  const r = await bufferGraphQL<{ posts: { edges: { node: any }[] } }>(q, { in: { organizationId: orgId } });
  const posts = (r.data?.posts?.edges ?? []).map((e) => e.node);

  return resp({
    versao: VERSAO,
    orgId,
    postFields: campos,
    postsFiltersInput: await inputFields('PostsFiltersInput'),
    createPostInput: await inputFields('CreatePostInput'),
    totalPosts: posts.length,
    posts,
    _erros: r.errors ?? null,
  });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
