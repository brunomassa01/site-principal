import { and, asc, desc, eq, isNotNull, isNull, lte, or } from 'drizzle-orm';
import { db } from '../db';
import {
  conhecimentoFases,
  conhecimentoVideos,
  conhecimentoReferencias,
  posts,
  type ConhecimentoFase,
  type ConhecimentoVideo,
  type ConhecimentoReferencia,
} from '../db/schema';

/** Camada de leitura do hub "Conhecimento Compartilhado" (parte pública). */

export async function getFases(): Promise<ConhecimentoFase[]> {
  return db
    .select()
    .from(conhecimentoFases)
    .where(eq(conhecimentoFases.situacao, 'publicado'))
    .orderBy(asc(conhecimentoFases.numero));
}

export async function getVideos(): Promise<ConhecimentoVideo[]> {
  return db
    .select()
    .from(conhecimentoVideos)
    .where(eq(conhecimentoVideos.situacao, 'publicado'))
    .orderBy(asc(conhecimentoVideos.ordem), desc(conhecimentoVideos.createdAt));
}

export async function getReferencias(): Promise<ConhecimentoReferencia[]> {
  return db
    .select()
    .from(conhecimentoReferencias)
    .where(eq(conhecimentoReferencias.situacao, 'publicado'))
    .orderBy(asc(conhecimentoReferencias.ordem), desc(conhecimentoReferencias.createdAt));
}

export type ArtigoMba = {
  slug: string;
  titulo: string;
  resumo: string;
  data: Date;
  fase: number;
  disciplina: string | null;
};

/** Artigos do MBA = posts de blog marcados com mbaFase, publicados e dentro da data. */
export async function getArtigos(): Promise<ArtigoMba[]> {
  const now = new Date();
  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        isNotNull(posts.mbaFase),
        eq(posts.situacao, 'publicado'),
        or(isNull(posts.publicarEm), lte(posts.publicarEm, now)),
      ),
    )
    .orderBy(desc(posts.data));
  return rows.map((r) => ({
    slug: r.slug,
    titulo: r.titulo,
    resumo: r.resumo,
    data: r.data,
    fase: r.mbaFase as number,
    disciplina: r.mbaDisciplina,
  }));
}

/** Tudo que a página pública precisa, numa chamada. */
export async function getConhecimento() {
  const [fases, videos, referencias, artigos] = await Promise.all([
    getFases(),
    getVideos(),
    getReferencias(),
    getArtigos(),
  ]);
  return { fases, videos, referencias, artigos };
}
