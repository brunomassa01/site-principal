import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/db';
import { timeline, projetos, skills, agora, identidade } from '../src/lib/db/schema';
import { mdToHtml } from '../src/lib/content/markdown';

const root = process.cwd();
const dir = (c: string) => resolve(root, 'src/content', c);
const files = (c: string) => readdirSync(dir(c)).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const D = (v: unknown) => (v ? new Date(v as string) : null);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
const parse = (c: string, f: string) => matter(readFileSync(resolve(dir(c), f), 'utf-8'));

async function migrarTimeline() {
  for (const file of files('timeline')) {
    const slug = file.replace(/\.mdx?$/, '');
    if ((await db.select().from(timeline).where(eq(timeline.slug, slug)))[0]) { console.log('  timeline pula', slug); continue; }
    const { data: fm, content } = parse('timeline', file);
    await db.insert(timeline).values({
      slug, cargo: fm.cargo, empresa: fm.empresa, empresaUrl: fm.empresa_url ?? null,
      inicio: D(fm.inicio)!, fim: D(fm.fim), local: fm.local ?? null, tipo: fm.tipo ?? null,
      resumo: fm.resumo ?? null, destaques: A(fm.destaques), tags: A(fm.tags), destaque: !!fm.destaque,
      bodyHtml: mdToHtml(content), bodyJson: { markdown: content }, situacao: 'publicado',
    });
    console.log('  timeline +', slug);
  }
}

async function migrarProjetos() {
  for (const file of files('projetos')) {
    const slug = file.replace(/\.mdx?$/, '');
    if ((await db.select().from(projetos).where(eq(projetos.slug, slug)))[0]) { console.log('  projetos pula', slug); continue; }
    const { data: fm, content } = parse('projetos', file);
    await db.insert(projetos).values({
      slug, titulo: fm.titulo, subtitulo: fm.subtitulo ?? null, status: fm.status,
      inicio: D(fm.inicio)!, fim: D(fm.fim), cliente: fm.cliente ?? null, papel: fm.papel ?? null,
      resumo: fm.resumo ?? '', problema: fm.problema ?? null, abordagem: fm.abordagem ?? null, resultado: fm.resultado ?? null,
      link: fm.link ?? null, repo: fm.repo ?? null, tags: A(fm.tags), destaque: !!fm.destaque,
      bodyHtml: mdToHtml(content), bodyJson: { markdown: content }, situacao: 'publicado',
    });
    console.log('  projetos +', slug);
  }
}

async function migrarSkills() {
  for (const file of files('skills')) {
    const slug = file.replace(/\.mdx?$/, '');
    if ((await db.select().from(skills).where(eq(skills.slug, slug)))[0]) { console.log('  skills pula', slug); continue; }
    const { data: fm, content } = parse('skills', file);
    await db.insert(skills).values({
      slug, nome: fm.nome, categoria: fm.categoria, area: fm.area, nivel: fm.nivel ?? null,
      instituicao: fm.instituicao ?? null, instituicaoUrl: fm.instituicao_url ?? null,
      ano: fm.ano ?? null, credencialUrl: fm.credencial_url ?? null, descricao: fm.descricao ?? null, destaque: !!fm.destaque,
      bodyHtml: mdToHtml(content), bodyJson: { markdown: content }, situacao: 'publicado',
    });
    console.log('  skills +', slug);
  }
}

async function migrarAgora() {
  const { data: fm, content } = parse('agora', 'index.mdx');
  const values = { atualizadoEm: D(fm.atualizado_em), bodyHtml: mdToHtml(content), bodyJson: { markdown: content } };
  if ((await db.select().from(agora).where(eq(agora.id, 'agora')))[0]) {
    await db.update(agora).set({ ...values, updatedAt: new Date() }).where(eq(agora.id, 'agora'));
  } else {
    await db.insert(agora).values({ id: 'agora', ...values });
  }
  console.log('  agora ok');
}

async function migrarIdentidade() {
  const fm = JSON.parse(readFileSync(resolve(dir('identidade'), 'index.json'), 'utf-8'));
  const values = {
    nome: fm.nome, tagline: fm.tagline ?? null, slogan: fm.slogan ?? null, bioCurta: fm.bio_curta ?? null,
    descricaoMeta: fm.descricao_meta ?? null, email: fm.email ?? null, linkedinUrl: fm.linkedin_url ?? null, ogImage: fm.og_image ?? null,
  };
  if ((await db.select().from(identidade).where(eq(identidade.id, 'identidade')))[0]) {
    await db.update(identidade).set({ ...values, updatedAt: new Date() }).where(eq(identidade.id, 'identidade'));
  } else {
    await db.insert(identidade).values({ id: 'identidade', ...values });
  }
  console.log('  identidade ok');
}

console.log('Migrando conteudo para o banco...');
await migrarTimeline();
await migrarProjetos();
await migrarSkills();
await migrarAgora();
await migrarIdentidade();
console.log('Migracao concluida.');
process.exit(0);
