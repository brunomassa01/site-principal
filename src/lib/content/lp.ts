import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { landingPages, lpLeads, type LandingPage, type LpLead } from '../db/schema';

/** Uma landing page pelo slug (qualquer status — a página decide se indexa). */
export async function getLandingPage(slug: string): Promise<LandingPage | null> {
  const [r] = await db.select().from(landingPages).where(eq(landingPages.slug, slug));
  return r ?? null;
}

/** Todas as landing pages (para o Painel), mais recentes primeiro. */
export async function getLandingPages(): Promise<LandingPage[]> {
  return db.select().from(landingPages).orderBy(desc(landingPages.createdAt));
}

/** Registra uma candidatura. Campos mínimos: nome + (e-mail ou whatsapp). */
export async function criarCandidatura(dados: {
  lpSlug: string;
  nome: string;
  email?: string | null;
  whatsapp?: string | null;
  empresa?: string | null;
  cargo?: string | null;
  desafio?: string | null;
}): Promise<LpLead> {
  const [row] = await db
    .insert(lpLeads)
    .values({
      lpSlug: dados.lpSlug,
      nome: dados.nome.trim(),
      email: dados.email?.trim() || null,
      whatsapp: dados.whatsapp?.trim() || null,
      empresa: dados.empresa?.trim() || null,
      cargo: dados.cargo?.trim() || null,
      desafio: dados.desafio?.trim() || null,
    })
    .returning();
  return row;
}

/** Candidaturas de uma LP, mais recentes primeiro (para o Painel). */
export async function getCandidaturas(lpSlug: string): Promise<LpLead[]> {
  return db.select().from(lpLeads).where(eq(lpLeads.lpSlug, lpSlug)).orderBy(desc(lpLeads.createdAt));
}

/** Quantas candidaturas por LP (mapa slug → total), para a listagem do Painel. */
export async function contarCandidaturas(): Promise<Record<string, number>> {
  const rows = await db
    .select({ slug: lpLeads.lpSlug, n: sql<number>`count(*)::int` })
    .from(lpLeads)
    .groupBy(lpLeads.lpSlug);
  const mapa: Record<string, number> = {};
  for (const r of rows) mapa[r.slug] = r.n;
  return mapa;
}
