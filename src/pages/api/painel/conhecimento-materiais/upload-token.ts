import type { APIRoute } from 'astro';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const prerender = false;

// Gera o token de upload direto pro Blob (client upload), contornando o limite de ~4,5MB da função.
// A auth do navegador (cookie) passa pelo middleware; o registro no banco é feito depois pelo cliente (POST autenticado).
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        // sem allowedContentTypes => aceita qualquer tipo de arquivo
      }),
      onUploadCompleted: async () => {
        /* registro é feito pelo cliente via POST autenticado em /api/painel/conhecimento-materiais */
      },
    });
    return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error)?.message ?? 'Falha no upload' }), { status: 400 });
  }
};
