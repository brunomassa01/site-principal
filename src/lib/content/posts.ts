import { and, desc, eq, isNull, lte, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { posts, type Post } from '../db/schema';
import { campo, type Lang } from '../../i18n';

/** Formato compatível com o que as páginas Astro já esperavam do astro:content. */
export type PostView = {
  slug: string;
  bodyHtml: string | null;
  data: {
    titulo: string;
    resumo: string;
    data: Date;
    publicar_em: Date | null;
    capa_url: string | null;
    tags: string[];
    fonte_externa_url: string | null;
    fonte_externa_nome: string | null;
    idioma: string;
    /** Idioma em que o post foi escrito originalmente. */
    idioma_original: string;
    /** false = está sendo exibido em inglês caindo no texto em português. */
    tem_traducao: boolean;
  };
};

function toView(r: Post, lang: Lang = 'pt'): PostView {
  const temTraducao = Boolean(r.tituloEn && r.tituloEn.trim() && r.bodyHtmlEn && r.bodyHtmlEn.trim());
  return {
    slug: r.slug,
    bodyHtml: campo<string | null>(r, 'bodyHtml', lang),
    data: {
      titulo: campo<string>(r, 'titulo', lang),
      resumo: campo<string>(r, 'resumo', lang),
      data: r.data,
      publicar_em: r.publicarEm,
      capa_url: r.capaUrl,
      tags: (r.tags ?? []) as string[],
      fonte_externa_url: r.fonteExternaUrl,
      fonte_externa_nome: r.fonteExternaNome,
      idioma: lang,
      idioma_original: r.idioma,
      tem_traducao: temTraducao,
    },
  };
}

/** Posts visíveis no site: publicados e dentro da data de publicação. */
export async function getPostsPublicados(lang: Lang = 'pt'): Promise<PostView[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.situacao, 'publicado'), or(isNull(posts.publicarEm), lte(posts.publicarEm, now))))
    .orderBy(desc(posts.data), desc(posts.createdAt));
  return rows.map((r) => toView(r, lang));
}

export async function getPostBySlug(slug: string, lang: Lang = 'pt'): Promise<PostView | null> {
  const [r] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!r || r.situacao !== 'publicado') return null;
  if (r.publicarEm && r.publicarEm.getTime() > Date.now()) return null;
  return toView(r, lang);
}

/** Conta uma visita à página do post (para "mais visitados"). Não bloqueia a página. */
export async function incrementViews(slug: string): Promise<void> {
  try {
    await db.update(posts).set({ views: sql`${posts.views} + 1` }).where(eq(posts.slug, slug));
  } catch {
    /* silencioso */
  }
}
