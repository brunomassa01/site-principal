import { asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { socialSemanas, socialPecas, socialClusters, type SocialSemana, type SocialPeca, type SocialCluster } from '../db/schema';

export type SemanaComPecas = SocialSemana & { pecas: SocialPeca[] };

const ORDEM_FMT: Record<string, number> = { linkedin: 0, carrossel: 1, reel: 2 };
const ordenarPecas = (p: SocialPeca[]) =>
  [...p].sort((a, b) => (ORDEM_FMT[a.formato] ?? 9) - (ORDEM_FMT[b.formato] ?? 9));

export async function getSemanas(): Promise<SemanaComPecas[]> {
  const semanas = await db.select().from(socialSemanas).orderBy(asc(socialSemanas.numero));
  const pecas = await db.select().from(socialPecas);
  const byId = new Map<string, SocialPeca[]>();
  for (const p of pecas) {
    const arr = byId.get(p.semanaId) ?? [];
    arr.push(p);
    byId.set(p.semanaId, arr);
  }
  return semanas.map((s) => ({ ...s, pecas: ordenarPecas(byId.get(s.id) ?? []) }));
}

export async function getSemana(numero: number): Promise<SemanaComPecas | null> {
  const [s] = await db.select().from(socialSemanas).where(eq(socialSemanas.numero, numero));
  if (!s) return null;
  const pecas = await db.select().from(socialPecas).where(eq(socialPecas.semanaId, s.id));
  return { ...s, pecas: ordenarPecas(pecas) };
}

export async function getClusters(): Promise<SocialCluster[]> {
  return db.select().from(socialClusters).orderBy(asc(socialClusters.ordem));
}

/** Número da semana em destaque: a vigente hoje, ou a próxima se o calendário ainda não começou.
 *  A semana 0 ("Conteúdos avulsos", fora do calendário) nunca é destaque. */
export function numeroSemanaDestaque(semanas: SemanaComPecas[], hoje = new Date()): number {
  const validas = semanas.filter((s) => s.numero > 0);
  const t = hoje.getTime();
  const iniciadas = validas.filter((s) => s.inicio && new Date(s.inicio).getTime() <= t);
  if (iniciadas.length) return iniciadas[iniciadas.length - 1].numero;
  return validas[0]?.numero ?? 1;
}

/** Progresso de produção: quantas peças já estão escritas/aprovadas/publicadas.
 *  Conta só as peças firmes (ignora reels-bônus da cadência 2/semana). */
export function progresso(semanas: SemanaComPecas[]) {
  const pecas = semanas.flatMap((s) => s.pecas).filter((p) => !p.opcional);
  const conta = (st: string) => pecas.filter((p) => p.status === st).length;
  return {
    total: pecas.length,
    planejado: conta('planejado'),
    escrito: conta('escrito'),
    aprovado: conta('aprovado'),
    publicado: conta('publicado'),
  };
}
