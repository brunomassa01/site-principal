import type { APIRoute } from 'astro';
import { bufferGraphQL, inputFields, temBuffer } from '../../../../lib/social/buffer';

export const prerender = false;

// TEMP: mapeia a mutation createPost (args + input) pra construir o "Enviar pro Buffer" (rascunho).
// Remover quando o envio estiver pronto. GET só introspecta — NÃO cria post.
const VERSAO = 'send-introspect-v1';

const tn = (t: any): string => {
  if (!t) return '?';
  if (t.name) return t.name;
  if (t.ofType) return t.kind === 'LIST' ? `[${tn(t.ofType)}]` : tn(t.ofType);
  return t.kind ?? '?';
};

export const GET: APIRoute = async () => {
  if (!temBuffer()) return resp({ erro: 'sem token' });
  const a = await bufferGraphQL<{ __schema: { mutationType: { fields: any[] } } }>(
    '{ __schema { mutationType { fields { name args { name type { name kind ofType { name kind ofType { name } } } } } } } }',
  );
  const cp = a.data?.__schema?.mutationType?.fields?.find((f: any) => f.name === 'createPost');
  const args = (cp?.args ?? []).map((x: any) => `${x.name}:${tn(x.type)}`);
  const inputTypeName = cp?.args?.[0] ? tn(cp.args[0].type).replace(/[![\]]/g, '') : null;
  const campos = inputTypeName ? await inputFields(inputTypeName) : [];
  // tenta enums comuns de status
  const enumQ = async (n: string) => {
    const r = await bufferGraphQL<{ __type: { enumValues: { name: string }[] } }>(`{ __type(name:"${n}"){ enumValues { name } } }`);
    return r.data?.__type?.enumValues?.map((e) => e.name) ?? null;
  };
  return resp({ versao: VERSAO, createPostArgs: args, inputType: inputTypeName, inputFields: campos, PostStatus: await enumQ('PostStatus') });
};

function resp(obj: unknown) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
