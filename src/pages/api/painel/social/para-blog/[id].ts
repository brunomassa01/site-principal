import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialPecas, socialSemanas, posts } from '../../../../../lib/db/schema';
import { slugify, mdToHtml } from '../../../../../lib/content/markdown';
import { sanitizeBody } from '../../../../../lib/content/sanitize';
import { json } from '../../../../../lib/http';

export const prerender = false;

type Slide = { titulo?: string; subtitulo?: string; texto?: string; tag?: string };
type Cena = { fala?: string };
type Conteudo = { texto?: string; slides?: Slide[]; capa?: string; roteiro?: string; cenas?: Cena[]; tag?: string; titulo?: string; subtitulo?: string };

function transformar(peca: { formato: string; gancho: string | null; manychat: string | null; legenda: string | null; conteudo: Conteudo | null }, cluster: string | null) {
  const c = peca.conteudo ?? {};
  const tags = [cluster, peca.manychat, 'Redes sociais'].filter(Boolean) as string[];
  const limpa = (s: string) => s.replace(/\s*\[[^\]]*\]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  let titulo = '', resumo = '', md = '';

  if (peca.formato === 'linkedin') {
    const texto = (c.texto ?? '').trim();
    const paras = texto.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    titulo = limpa(peca.gancho || paras[0] || 'Post').slice(0, 120);
    resumo = (paras[0] ?? '').slice(0, 240);
    md = texto;
  } else if (peca.formato === 'carrossel') {
    const slides = c.slides ?? [];
    const capa = slides[0] ?? {};
    titulo = limpa((capa.titulo || peca.gancho || 'Carrossel').replace(/["]/g, '')).slice(0, 120);
    resumo = (capa.subtitulo || peca.gancho || '').slice(0, 240);
    md = slides
      .map((s, i) => {
        if (i === 0) return s.subtitulo ?? '';
        const h = s.titulo ? `## ${s.titulo}` : '';
        return [h, s.texto ?? ''].filter(Boolean).join('\n\n');
      })
      .filter(Boolean)
      .join('\n\n');
  } else if (peca.formato === 'post') {
    titulo = limpa((c.titulo || peca.gancho || 'Post').replace(/["]/g, '')).slice(0, 120);
    resumo = (c.subtitulo || peca.gancho || '').slice(0, 240);
    md = [c.titulo ? `## ${c.titulo}` : '', c.subtitulo ?? '', peca.legenda ?? ''].filter(Boolean).join('\n\n');
  } else {
    // reel
    titulo = limpa(c.capa || peca.gancho || 'Reel').slice(0, 120);
    resumo = (peca.gancho || '').slice(0, 240);
    md = c.roteiro && c.roteiro.trim() ? c.roteiro.trim() : (c.cenas ?? []).map((s) => s.fala).filter(Boolean).join('\n\n');
  }
  return { titulo, resumo: resumo || titulo, md, tags };
}

export const POST: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) return json({ error: 'ID ausente.' }, 400);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, id));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);
  const [semana] = await db.select().from(socialSemanas).where(eq(socialSemanas.id, peca.semanaId));

  const { titulo, resumo, md, tags } = transformar(peca as never, semana?.cluster ?? null);
  if (!md.trim()) return json({ error: 'Esta peça ainda não tem conteúdo para enviar ao blog.' }, 400);

  // slug único (evita colisão acrescentando um sufixo do id da peça)
  let slug = slugify(titulo) || `social-${peca.formato}`;
  const [existe] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
  if (existe) slug = `${slug}-${id.slice(0, 4)}`;

  try {
    const [row] = await db
      .insert(posts)
      .values({
        slug,
        titulo,
        resumo,
        data: new Date(),
        tags,
        idioma: 'pt',
        bodyHtml: sanitizeBody(mdToHtml(md)),
        bodyJson: { markdown: md },
        situacao: 'rascunho', // rascunho: você revisa e publica
      })
      .returning();
    return json({ ok: true, id: row.id, slug: row.slug });
  } catch (e) {
    return json({ error: 'Erro ao criar o rascunho.', detail: String((e as Error)?.message ?? e) }, 400);
  }
};
