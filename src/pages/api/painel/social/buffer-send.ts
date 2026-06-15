import type { APIRoute } from 'astro';
import { bufferGraphQL, inputFields, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// TEMP: mapeia createPost (retorno) e deletePost (args) pra construir o "Enviar pro Buffer" (rascunho)
// com teste seguro (cria rascunho e apaga). GET só introspecta — NÃO cria post.
const VERSAO = 'send-introspect-v2';

const tn = (t: any): string => {
  if (!t) return '?';
  if (t.name) return t.name;
  if (t.ofType) return t.kind === 'LIST' ? `[${tn(t.ofType)}]` : tn(t.ofType);
  return t.kind ?? '?';
};

export const GET: APIRoute = async () => {
  if (!temBuffer()) return resp({ erro: 'sem token' });
  const a = await bufferGraphQL<{ __schema: { mutationType: { fields: any[] } } }>(
    '{ __schema { mutationType { fields { name args { name type { name kind ofType { name kind ofType { name } } } } type { name kind ofType { name kind ofType { name } } } } } } }',
  );
  const muts = a.data?.__schema?.mutationType?.fields ?? [];
  const cp = muts.find((f: any) => f.name === 'createPost');
  const dp = muts.find((f: any) => f.name === 'deletePost');

  const returnTypeName = cp ? tn(cp.type).replace(/[![\]]/g, '') : null;
  const introFields = async (n?: string | null) => {
    if (!n || n === '?') return null;
    const r = await bufferGraphQL<{ __type: { kind: string; fields: any[] } }>(`{ __type(name:"${n}"){ kind fields { name type { name kind ofType { name kind ofType { name } } } } } }`);
    return r.data?.__type?.fields?.map((f: any) => `${f.name}:${tn(f.type)}`) ?? null;
  };
  const enumQ = async (n: string) => {
    const r = await bufferGraphQL<{ __type: { enumValues: { name: string }[] } }>(`{ __type(name:"${n}"){ enumValues { name } } }`);
    return r.data?.__type?.enumValues?.map((e) => e.name) ?? null;
  };

  const dpInputType = dp?.args?.[0] ? tn(dp.args[0].type).replace(/[![\]]/g, '') : null;
  return resp({
    versao: VERSAO,
    createPostReturn: { tipo: returnTypeName, campos: await introFields(returnTypeName) },
    deletePost: { args: (dp?.args ?? []).map((x: any) => `${x.name}:${tn(x.type)}`), inputType: dpInputType, inputFields: dpInputType ? await inputFields(dpInputType) : null },
    SchedulingType: await enumQ('SchedulingType'),
    ShareMode: await enumQ('ShareMode'),
  });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
