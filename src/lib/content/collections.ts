import { eq } from 'drizzle-orm';
import { db } from '../db';
import { timeline, projetos, skills, agora, identidade } from '../db/schema';
import { campo, type Lang } from '../../i18n';

const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

/**
 * Camada de conteúdo do site público.
 *
 * Cada função recebe o idioma e já devolve o texto traduzido quando existe
 * (`campo` cai no português sozinho se a tradução estiver vazia). Assim as
 * páginas continuam lendo `data.cargo` sem saber que o site é bilíngue.
 * Nome próprio (empresa, cliente, instituição), URL e data não se traduzem.
 */

export async function getTimeline(lang: Lang = 'pt') {
  const rows = await db.select().from(timeline).where(eq(timeline.situacao, 'publicado'));
  return rows.map((r) => ({
    slug: r.slug,
    bodyHtml: campo<string | null>(r, 'bodyHtml', lang),
    data: {
      cargo: campo<string>(r, 'cargo', lang),
      empresa: r.empresa,
      empresa_url: r.empresaUrl,
      inicio: r.inicio,
      fim: r.fim,
      local: campo<string | null>(r, 'local', lang),
      tipo: r.tipo,
      resumo: campo<string | null>(r, 'resumo', lang),
      destaques: arr(campo(r, 'destaques', lang)),
      tags: arr(r.tags),
      destaque: r.destaque,
    },
  }));
}

export async function getProjetos(lang: Lang = 'pt') {
  const rows = await db.select().from(projetos).where(eq(projetos.situacao, 'publicado'));
  return rows.map((r) => mapProjeto(r, lang));
}

export async function getProjetoBySlug(slug: string, lang: Lang = 'pt') {
  const [r] = await db.select().from(projetos).where(eq(projetos.slug, slug));
  if (!r || r.situacao !== 'publicado') return null;
  return mapProjeto(r, lang);
}

function mapProjeto(r: typeof projetos.$inferSelect, lang: Lang = 'pt') {
  return {
    slug: r.slug,
    bodyHtml: campo<string | null>(r, 'bodyHtml', lang),
    data: {
      titulo: campo<string>(r, 'titulo', lang),
      subtitulo: campo<string | null>(r, 'subtitulo', lang),
      status: r.status,
      inicio: r.inicio,
      fim: r.fim,
      cliente: r.cliente,
      papel: campo<string | null>(r, 'papel', lang),
      resumo: campo<string>(r, 'resumo', lang),
      problema: campo<string | null>(r, 'problema', lang),
      abordagem: campo<string | null>(r, 'abordagem', lang),
      resultado: campo<string | null>(r, 'resultado', lang),
      link: r.link,
      repo: r.repo,
      tags: arr(r.tags),
      destaque: r.destaque,
    },
  };
}

export async function getSkills(lang: Lang = 'pt') {
  const rows = await db.select().from(skills).where(eq(skills.situacao, 'publicado'));
  return rows.map((r) => ({
    slug: r.slug,
    bodyHtml: campo<string | null>(r, 'bodyHtml', lang),
    data: {
      nome: campo<string>(r, 'nome', lang),
      categoria: r.categoria,
      area: campo<string>(r, 'area', lang),
      nivel: r.nivel,
      instituicao: r.instituicao,
      instituicao_url: r.instituicaoUrl,
      ano: r.ano,
      credencial_url: r.credencialUrl,
      descricao: campo<string | null>(r, 'descricao', lang),
      destaque: r.destaque,
    },
  }));
}

export async function getAgora(lang: Lang = 'pt') {
  const [r] = await db.select().from(agora).where(eq(agora.id, 'agora'));
  if (!r) return null;
  return {
    bodyHtml: campo<string | null>(r, 'bodyHtml', lang),
    data: { atualizado_em: r.atualizadoEm },
  };
}

export async function getIdentidade(lang: Lang = 'pt') {
  const [r] = await db.select().from(identidade).where(eq(identidade.id, 'identidade'));
  const d = r ?? ({} as Partial<typeof identidade.$inferSelect>);
  return {
    data: {
      nome: d.nome ?? 'Bruno Massa',
      tagline: campo<string | null>(d, 'tagline', lang) ?? null,
      slogan: campo<string | null>(d, 'slogan', lang) ?? null,
      bio_curta: campo<string | null>(d, 'bioCurta', lang) ?? null,
      descricao_meta: campo<string | null>(d, 'descricaoMeta', lang) ?? null,
      email: d.email ?? null,
      linkedin_url: d.linkedinUrl ?? null,
      og_image: d.ogImage ?? null,
      logo_url: d.logoUrl ?? null,
      logo_altura: d.logoAltura ?? null,
    },
  };
}
