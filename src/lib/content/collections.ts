import { eq } from 'drizzle-orm';
import { db } from '../db';
import { timeline, projetos, skills, agora, identidade } from '../db/schema';

const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export async function getTimeline() {
  const rows = await db.select().from(timeline).where(eq(timeline.situacao, 'publicado'));
  return rows.map((r) => ({
    slug: r.slug,
    bodyHtml: r.bodyHtml,
    data: {
      cargo: r.cargo, empresa: r.empresa, empresa_url: r.empresaUrl,
      inicio: r.inicio, fim: r.fim, local: r.local, tipo: r.tipo,
      resumo: r.resumo, destaques: arr(r.destaques), tags: arr(r.tags), destaque: r.destaque,
    },
  }));
}

export async function getProjetos() {
  const rows = await db.select().from(projetos).where(eq(projetos.situacao, 'publicado'));
  return rows.map(mapProjeto);
}

export async function getProjetoBySlug(slug: string) {
  const [r] = await db.select().from(projetos).where(eq(projetos.slug, slug));
  if (!r || r.situacao !== 'publicado') return null;
  return mapProjeto(r);
}

function mapProjeto(r: typeof projetos.$inferSelect) {
  return {
    slug: r.slug,
    bodyHtml: r.bodyHtml,
    data: {
      titulo: r.titulo, subtitulo: r.subtitulo, status: r.status,
      inicio: r.inicio, fim: r.fim, cliente: r.cliente, papel: r.papel,
      resumo: r.resumo, problema: r.problema, abordagem: r.abordagem, resultado: r.resultado,
      link: r.link, repo: r.repo, tags: arr(r.tags), destaque: r.destaque,
    },
  };
}

export async function getSkills() {
  const rows = await db.select().from(skills).where(eq(skills.situacao, 'publicado'));
  return rows.map((r) => ({
    slug: r.slug,
    bodyHtml: r.bodyHtml,
    data: {
      nome: r.nome, categoria: r.categoria, area: r.area, nivel: r.nivel,
      instituicao: r.instituicao, instituicao_url: r.instituicaoUrl, ano: r.ano,
      credencial_url: r.credencialUrl, descricao: r.descricao, destaque: r.destaque,
    },
  }));
}

export async function getAgora() {
  const [r] = await db.select().from(agora).where(eq(agora.id, 'agora'));
  if (!r) return null;
  return { bodyHtml: r.bodyHtml, data: { atualizado_em: r.atualizadoEm } };
}

export async function getIdentidade() {
  const [r] = await db.select().from(identidade).where(eq(identidade.id, 'identidade'));
  const d = r ?? ({} as Partial<typeof identidade.$inferSelect>);
  return {
    data: {
      nome: d.nome ?? 'Bruno Massa',
      tagline: d.tagline ?? null,
      slogan: d.slogan ?? null,
      bio_curta: d.bioCurta ?? null,
      descricao_meta: d.descricaoMeta ?? null,
      email: d.email ?? null,
      linkedin_url: d.linkedinUrl ?? null,
      og_image: d.ogImage ?? null,
    },
  };
}
