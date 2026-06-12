import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { posts, socialPecas, socialSemanas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { gerarConteudo } from '../../../../lib/social/ia';
import { logUso } from '../../../../lib/social/uso';

export const prerender = false;

// Ponte inversa: transforma um post do BLOG em conteúdo de redes sociais.
// A peça nasce em "Conteúdos avulsos" (semana especial 0, fora do calendário editorial),
// pra NÃO misturar com as pautas planejadas das semanas. A IA usa o artigo como matéria-prima.
const FORMATOS = ['carrossel', 'post', 'linkedin', 'reel'];

const limparHtml = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

export const POST: APIRoute = async ({ request }) => {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'IA não configurada (falta ANTHROPIC_API_KEY).' }, 500);
  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const postId = String(b.postId ?? '');
  const formato = String(b.formato ?? '');
  if (!postId || !FORMATOS.includes(formato)) return json({ error: 'postId e formato válido são obrigatórios.' }, 400);

  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) return json({ error: 'Post não encontrado.' }, 404);
  const materia = `${post.titulo}\n\n${post.resumo}\n\n${limparHtml(post.bodyHtml ?? '')}`;
  if (materia.length < 80) return json({ error: 'Este post ainda não tem conteúdo suficiente para transformar.' }, 400);

  // destino: "Conteúdos avulsos" (semana 0), criada na primeira vez
  let [avulsos] = await db.select().from(socialSemanas).where(eq(socialSemanas.numero, 0));
  if (!avulsos) {
    [avulsos] = await db.insert(socialSemanas).values({
      numero: 0,
      cluster: 'Avulsos',
      tema: 'Conteúdos avulsos (a partir do blog)',
      status: 'em-producao',
    }).returning();
  }

  try {
    // cria a peça já apontando pro post de origem (sem palavra de Manychat: avulso não herda pauta)
    const [peca] = await db.insert(socialPecas).values({
      semanaId: avulsos.id,
      formato,
      gancho: post.titulo,
      lente: null,
      manychat: null,
      status: 'planejado',
      urlPublicada: null,
    }).returning();

    // gera com IA a partir do artigo
    const { conteudo, legenda, usage } = await gerarConteudo(
      peca as never,
      { cluster: 'Avulsos (do blog)', ponteIa: false } as never,
      materia,
    );
    await logUso('claude-sonnet-4-6', `blog-para-${formato}`, usage);

    const novoConteudo = { ...(conteudo ?? {}), origemPost: post.slug };
    const set: Record<string, unknown> = { conteudo: novoConteudo, status: 'escrito', updatedAt: new Date() };
    if (legenda !== undefined) set.legenda = legenda;
    await db.update(socialPecas).set(set).where(eq(socialPecas.id, peca.id));

    return json({ ok: true, pecaId: peca.id, semana: 0 });
  } catch (e) {
    return json({ error: 'Falha ao transformar o post.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
