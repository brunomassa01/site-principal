import type { APIRoute } from 'astro';
import { bufferGraphQL, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// TEMP: mapeia o que falta pra finalizar o agendar com imagem: formato do retorno (PostActionPayload)
// e o formato dos assets (imagens) no CreatePostInput.
const VERSAO = 'debug-v3';

const tn = (t: any): string => {
  if (!t) return '?';
  if (t.name) return t.name;
  if (t.ofType) return t.kind === 'LIST' ? `[${tn(t.ofType)}]` : tn(t.ofType);
  return t.kind ?? '?';
};

export const GET: APIRoute = async () => {
  if (!temBuffer()) return resp({ erro: 'sem token' });

  // 1) PostActionPayload (pra ler sucesso/erro/id do post criado)
  const pap = await bufferGraphQL<{ __type: any }>(
    '{ __type(name:"PostActionPayload"){ kind fields { name type { name kind ofType { name kind ofType { name } } } } possibleTypes { name kind fields { name type { name kind ofType { name } } } } } }',
  );
  const papT = pap.data?.__type;

  // 2) CreatePostInput.assets -> nome do tipo do elemento
  const cpi = await bufferGraphQL<{ __type: { inputFields: any[] } }>(
    '{ __type(name:"CreatePostInput"){ inputFields { name type { name kind ofType { name kind ofType { name kind ofType { name } } } } } } }',
  );
  const assetsField = cpi.data?.__type?.inputFields?.find((f: any) => f.name === 'assets');
  const assetTipo = assetsField ? tn(assetsField.type).replace(/[![\]]/g, '') : null;
  let assetCampos: string[] | null = null;
  if (assetTipo && assetTipo !== '?') {
    const at = await bufferGraphQL<{ __type: { inputFields: any[]; kind: string } }>(
      `{ __type(name:"${assetTipo}"){ kind inputFields { name type { name kind ofType { name kind ofType { name } } } } } }`,
    );
    assetCampos = (at.data?.__type?.inputFields ?? []).map((f: any) => `${f.name}:${tn(f.type)}`);
  }

  return resp({
    versao: VERSAO,
    postActionPayload: papT ? {
      kind: papT.kind,
      fields: (papT.fields ?? []).map((f: any) => `${f.name}:${tn(f.type)}`),
      possibleTypes: (papT.possibleTypes ?? []).map((p: any) => ({ nome: p.name, kind: p.kind, fields: (p.fields ?? []).map((f: any) => `${f.name}:${tn(f.type)}`) })),
    } : null,
    assetTipo,
    assetCampos,
  });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
