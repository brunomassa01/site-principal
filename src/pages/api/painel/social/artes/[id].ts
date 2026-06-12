import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { db } from '../../../../../lib/db';
import { socialPecas } from '../../../../../lib/db/schema';
import { neon } from '@neondatabase/serverless';
import { json } from '../../../../../lib/http';
import { carrosselElements, reelCoverElement, loadFontes, renderPng } from '../../../../../lib/marca/render';
import { gerarImagemEstilo } from '../../../../../lib/social/imagem';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) return json({ error: 'ID ausente.' }, 400);
  if (!process.env.BLOB_READ_WRITE_TOKEN) return json({ error: 'Armazenamento de mídia não configurado.' }, 500);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, id));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);

  const conteudo = (peca.conteudo ?? {}) as { slides?: { titulo?: string }[]; capa?: string; bg?: string; estilo?: string; refUpload?: string };
  if (peca.formato === 'linkedin') return json({ error: 'LinkedIn é texto puro — não tem arte de imagem.' }, 400);
  if (peca.formato === 'carrossel' && !conteudo.slides?.length) return json({ error: 'Monte os slides antes de gerar as artes.' }, 400);
  if (peca.formato === 'reel' && !conteudo.capa) return json({ error: 'Defina a capa do reel antes de gerar a arte.' }, 400);

  const base = new URL(request.url).origin;
  try {
    // Estilo escolhido: a IA gera uma capa NOVA a partir de uma referência visual.
    // 'ref' = foto que o Bruno subiu (conteudo.refUpload). Senão, é um id de fundo da biblioteca.
    if (conteudo.estilo && conteudo.estilo !== 'upload') {
      const tema = (peca.gancho ?? conteudo.slides?.[0]?.titulo ?? '').toString();
      let refUrl = '';
      let rotulo = '';
      if (conteudo.estilo === 'ref') {
        refUrl = conteudo.refUpload ?? '';
      } else {
        const sql = neon(process.env.DATABASE_URL!);
        const linhas = (await sql`SELECT url, rotulo FROM social_fundos WHERE id = ${conteudo.estilo}`) as { url: string; rotulo: string }[];
        refUrl = linhas[0]?.url ?? '';
        rotulo = linhas[0]?.rotulo ?? '';
      }
      const img = await gerarImagemEstilo(refUrl, tema, rotulo);
      if ('error' in img) return json({ error: img.error }, 502);
      conteudo.bg = img.url;
      await db.update(socialPecas).set({ conteudo: conteudo as never, updatedAt: new Date() }).where(eq(socialPecas.id, id));
    }

    const fontes = await loadFontes(base);
    const els = peca.formato === 'carrossel'
      ? carrosselElements(conteudo as never, peca.manychat ?? undefined)
      : [reelCoverElement(conteudo as never)];

    const urls: string[] = [];
    for (let i = 0; i < els.length; i++) {
      const png = await renderPng(els[i], fontes);
      const blob = await put(`social/${peca.id}-${String(i + 1).padStart(2, '0')}.png`, png, {
        access: 'public', addRandomSuffix: true, contentType: 'image/png',
      });
      urls.push(blob.url);
    }
    await db.update(socialPecas).set({ midiaUrls: urls, updatedAt: new Date() }).where(eq(socialPecas.id, id));
    return json({ ok: true, urls });
  } catch (e) {
    return json({ error: 'Falha ao gerar as artes.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
