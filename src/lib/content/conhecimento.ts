import { and, asc, desc, eq, isNotNull, isNull, lte, or } from 'drizzle-orm';
import { db } from '../db';
import {
  conhecimentoFases,
  conhecimentoVideos,
  conhecimentoReferencias,
  posts,
} from '../db/schema';
import { campo, type Lang } from '../../i18n';

/**
 * Camada de leitura do hub "Conhecimento Compartilhado" (parte pública).
 * Cada função recebe o idioma e já devolve o texto traduzido quando existe.
 */

export type FaseView = {
  numero: number;
  titulo: string;
  subtitulo: string | null;
  status: string;
  progresso: number;
  disciplinas: { nome: string; sub?: string }[];
};

export async function getFases(lang: Lang = 'pt'): Promise<FaseView[]> {
  const rows = await db
    .select()
    .from(conhecimentoFases)
    .where(eq(conhecimentoFases.situacao, 'publicado'))
    .orderBy(asc(conhecimentoFases.numero));
  return rows.map((r) => ({
    numero: r.numero,
    titulo: campo<string>(r, 'titulo', lang),
    subtitulo: campo<string | null>(r, 'subtitulo', lang),
    status: r.status,
    progresso: r.progresso,
    disciplinas: (campo<{ nome: string; sub?: string }[]>(r, 'disciplinas', lang) ?? []) as { nome: string; sub?: string }[],
  }));
}

export type VideoView = {
  titulo: string;
  url: string;
  fonte: string;
  autor: string | null;
  duracao: string | null;
  thumbnailUrl: string | null;
  fase: number | null;
};

export async function getVideos(lang: Lang = 'pt'): Promise<VideoView[]> {
  const rows = await db
    .select()
    .from(conhecimentoVideos)
    .where(eq(conhecimentoVideos.situacao, 'publicado'))
    .orderBy(asc(conhecimentoVideos.ordem), desc(conhecimentoVideos.createdAt));
  return rows.map((r) => ({
    titulo: campo<string>(r, 'titulo', lang),
    url: r.url,
    fonte: r.fonte,
    autor: r.autor,
    duracao: r.duracao,
    thumbnailUrl: r.thumbnailUrl,
    fase: r.fase,
  }));
}

export type ReferenciaView = {
  titulo: string;
  fonte: string | null;
  tipo: string;
  url: string | null;
  idioma: string;
  fase: number | null;
};

export async function getReferencias(lang: Lang = 'pt'): Promise<ReferenciaView[]> {
  const rows = await db
    .select()
    .from(conhecimentoReferencias)
    .where(eq(conhecimentoReferencias.situacao, 'publicado'))
    .orderBy(asc(conhecimentoReferencias.ordem), desc(conhecimentoReferencias.createdAt));
  return rows.map((r) => ({
    titulo: campo<string>(r, 'titulo', lang),
    fonte: r.fonte,
    tipo: r.tipo,
    url: r.url,
    idioma: r.idioma, // idioma da OBRA referenciada, não da página
    fase: r.fase,
  }));
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
export async function getArtigos(lang: Lang = 'pt'): Promise<ArtigoMba[]> {
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
    titulo: campo<string>(r, 'titulo', lang),
    resumo: campo<string>(r, 'resumo', lang),
    data: r.data,
    fase: r.mbaFase as number,
    disciplina: r.mbaDisciplina,
  }));
}

/** Tudo que a página pública precisa, numa chamada. */
export async function getConhecimento(lang: Lang = 'pt') {
  const [fases, videos, referencias, artigos] = await Promise.all([
    getFases(lang),
    getVideos(lang),
    getReferencias(lang),
    getArtigos(lang),
  ]);
  return { fases, videos, referencias, artigos };
}
