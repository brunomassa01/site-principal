import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { posts, socialPecas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { getSemanas, numeroSemanaDestaque } from '../../../../lib/content/social';
import { gerarConteudo } from '../../../../lib/social/ia';
import { logUso } from '../../../../lib/social/uso';

export const prerender = false;

// Ponte inversa: transforma um post do BLOG em conteúdo de redes sociais.
// Cria a peça na semana atual do publicador e já gera com IA usando o artigo como matéria-prima.
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

  // semana atual do calendário
  const semanas = await getSemanas();
  const numero = numeroSemanaDestaque(semanas);
  const semana = semanas.find((s) => s.numero === numero);
  if (!semana) return json({ error: 'Nenhuma semana encontrada no calendário.' }, 404);
  const manychat = semana.pecas.find((p) => p.manychat)?.manychat ?? null;

  try {
    // cria a peça já apontando pro post de origem
    const [peca] = await db.insert(socialPecas).values({
      semanaId: semana.id,
      formato,
      gancho: post.titulo,
      lente: null,
      manychat,
      status: 'planejado',
      urlPublicada: null,
    }).returning();

    // gera com IA a partir do artigo
    const { conteudo, legenda, usage } = await gerarConteudo(
      peca as never,
      { cluster: semana.cluster, ponteIa: false } as never,
      materia,
    );
    await logUso('claude-sonnet-4-6', `blog-para-${formato}`, usage);

    const novoConteudo = { ...(conteudo ?? {}), origemPost: post.slug };
    const set: Record<string, unknown> = { conteudo: novoConteudo, status: 'escrito', updatedAt: new Date() };
    if (legenda !== undefined) set.legenda = legenda;
    await db.update(socialPecas).set(set).where(eq(socialPecas.id, peca.id));

    return json({ ok: true, pecaId: peca.id, semana: numero });
  } catch (e) {
    return json({ error: 'Falha ao transformar o post.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
