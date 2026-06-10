import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/db';
import { users, posts } from '../src/lib/db/schema';
import { hashPassword } from '../src/lib/auth';
import { mdToHtml } from '../src/lib/content/markdown';

const SEED_EMAIL = (process.env.SEED_EMAIL ?? 'brunobrm@gmail.com').toLowerCase();
const SEED_PASSWORD = process.env.SEED_PASSWORD;
const SEED_NOME = process.env.SEED_NOME ?? 'Bruno Massa';

if (!SEED_PASSWORD) {
  console.error('ERRO: defina SEED_PASSWORD (ex.: $env:SEED_PASSWORD="suasenha"; npx tsx scripts/seed.ts)');
  process.exit(1);
}

// 1) Usuário admin (cria ou atualiza a senha)
const [existente] = await db.select().from(users).where(eq(users.email, SEED_EMAIL));
const passwordHash = await hashPassword(SEED_PASSWORD);
if (existente) {
  await db
    .update(users)
    .set({ passwordHash, nome: SEED_NOME, situacao: 'publicado', updatedAt: new Date() })
    .where(eq(users.id, existente.id));
  console.log('Usuário ATUALIZADO:', SEED_EMAIL);
} else {
  await db.insert(users).values({ email: SEED_EMAIL, passwordHash, nome: SEED_NOME, role: 'admin' });
  console.log('Usuário CRIADO:', SEED_EMAIL);
}

// 2) Migra o post existente (se ainda não estiver no banco)
const slug = 'avatar-ia-marketing-treino-antes-aplicar';
const [jaExiste] = await db.select().from(posts).where(eq(posts.slug, slug));
if (jaExiste) {
  console.log('Post já existe no banco, pulando:', slug);
} else {
  const arquivo = resolve(process.cwd(), 'src/content/posts', `${slug}.mdx`);
  const raw = readFileSync(arquivo, 'utf-8');
  const { data: fm, content } = matter(raw);
  await db.insert(posts).values({
    slug,
    titulo: String(fm.titulo ?? ''),
    resumo: String(fm.resumo ?? ''),
    data: fm.data ? new Date(fm.data as string) : new Date(),
    publicarEm: fm.publicar_em ? new Date(fm.publicar_em as string) : null,
    capaUrl: (fm.capa_url as string) ?? null,
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
    fonteExternaUrl: (fm.fonte_externa_url as string) ?? null,
    fonteExternaNome: (fm.fonte_externa_nome as string) ?? null,
    idioma: (fm.idioma as string) ?? 'pt',
    bodyHtml: mdToHtml(content),
    bodyJson: { markdown: content },
    situacao: fm.rascunho ? 'rascunho' : 'publicado',
  });
  console.log('Post MIGRADO:', slug);
}

console.log('Seed concluído.');
process.exit(0);
