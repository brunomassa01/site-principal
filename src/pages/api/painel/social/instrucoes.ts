import type { APIRoute } from 'astro';
import { json } from '../../../../lib/http';
import { CHAVE_INSTRUCOES_IA, getConfig, setConfig } from '../../../../lib/content/config';

export const prerender = false;

// Instruções da IA (prompt editável pelo Bruno) aplicadas a toda geração de conteúdo social.
export const GET: APIRoute = async () => {
  return json({ texto: await getConfig(CHAVE_INSTRUCOES_IA, '') });
};

export const PUT: APIRoute = async ({ request }) => {
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const texto = String(b.texto ?? '').slice(0, 4000);
  try {
    await setConfig(CHAVE_INSTRUCOES_IA, texto);
    return json({ ok: true, texto });
  } catch (e) {
    return json({ error: 'Falha ao salvar.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
