import { and, desc, eq, isNull, lte, or } from 'drizzle-orm';
import { db } from '../db';
import { posts, type Post } from '../db/schema';

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
  };
};

function toView(r: Post): PostView {
  return {
    slug: r.slug,
    bodyHtml: r.bodyHtml,
    data: {
      titulo: r.titulo,
      resumo: r.resumo,
      data: r.data,
      publicar_em: r.publicarEm,
      capa_url: r.capaUrl,
      tags: (r.tags ?? []) as string[],
      fonte_externa_url: r.fonteExternaUrl,
      fonte_externa_nome: r.fonteExternaNome,
      idioma: r.idioma,
    },
  };
}

/** Posts visíveis no site: publicados e dentro da data de publicação. */
export async function getPostsPublicados(): Promise<PostView[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.situacao, 'publicado'), or(isNull(posts.publicarEm), lte(posts.publicarEm, now))))
    .orderBy(desc(posts.data));
  return rows.map(toView);
}

export async function getPostBySlug(slug: string): Promise<PostView | null> {
  const [r] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!r || r.situacao !== 'publicado') return null;
  if (r.publicarEm && r.publicarEm.getTime() > Date.now()) return null;
  return toView(r);
}
