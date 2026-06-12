import type { APIRoute } from 'astro';
import { put } from '@vercel/blob';
import { json } from '../../../lib/http';
import { catalogarMidia } from '../../../lib/media';

export const prerender = false;

const MAX = 4.4 * 1024 * 1024; // limite do corpo de uma function da Vercel (~4.5MB)

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return json({ error: 'Não autenticado' }, 401);
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({ error: 'Armazenamento de mídia ainda não configurado (crie um Blob store no Vercel).' }, 500);
  }

  let file: FormDataEntryValue | null = null;
  try {
    const form = await request.formData();
    file = form.get('file');
  } catch {
    return json({ error: 'Envio inválido.' }, 400);
  }
  if (!(file instanceof File)) return json({ error: 'Arquivo ausente.' }, 400);
  if (file.size > MAX) return json({ error: 'Arquivo muito grande (máx ~4MB após otimização).' }, 413);

  const base = (file.name || 'arquivo').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-60) || 'arquivo';
  try {
    const blob = await put(`posts/${base}`, file, { access: 'public', addRandomSuffix: true });
    await catalogarMidia({ url: blob.url, nome: base, tamanho: file.size, tipo: file.type?.startsWith('video') ? 'video' : 'imagem', origem: 'upload' });
    return json({ url: blob.url });
  } catch (e) {
    return json({ error: 'Falha ao enviar: ' + (e as Error).message }, 500);
  }
};
