import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../../../../lib/db';
import { socialPecas, socialSemanas } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';
import { logUso } from '../../../../lib/social/uso';

export const prerender = false;

const ACC = /[áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/;
const norm = (s: string) =>
  Array.from(s.normalize('NFD')).filter((c) => { const n = c.charCodeAt(0); return n < 0x300 || n > 0x36f; }).join('').toLowerCase();

// Re-acentua o texto importado do calendário (que veio sem acento da planilha).
// Usa a Claude só para adicionar diacríticos; trava: só aplica se as palavras forem idênticas
// ignorando acento (impede a IA de trocar palavras).
export const POST: APIRoute = async ({ request }) => {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'IA não configurada.' }, 500);
  const LIM = 25;

  const pecas = await db.select().from(socialPecas);
  const semanas = await db.select().from(socialSemanas);
  type Item = { tab: 'p' | 's'; id: string; campo: 'gancho' | 'lente' | 'observacoes'; texto: string };
  const itens: Item[] = [];
  for (const p of pecas) {
    if (p.gancho && !ACC.test(p.gancho)) itens.push({ tab: 'p', id: p.id, campo: 'gancho', texto: p.gancho });
    if (p.lente && !ACC.test(p.lente)) itens.push({ tab: 'p', id: p.id, campo: 'lente', texto: p.lente });
  }
  for (const s of semanas) {
    if (s.observacoes && !ACC.test(s.observacoes)) itens.push({ tab: 's', id: s.id, campo: 'observacoes', texto: s.observacoes });
  }

  const restantesAntes = itens.length;
  const lote = itens.slice(0, LIM);
  if (!lote.length) return json({ ok: true, processados: 0, restantes: 0 });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let frases: unknown[] = [];
  try {
    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      tools: [{ name: 'acentuar', description: 'Devolve as frases com a acentuação correta.', input_schema: { type: 'object', properties: { frases: { type: 'array', items: { type: 'string' } } }, required: ['frases'] } }],
      tool_choice: { type: 'tool', name: 'acentuar' },
      messages: [{
        role: 'user',
        content: `Tarefa: CORRIGIR a acentuação. As ${lote.length} frases abaixo foram digitadas SEM acentos e estão ERRADAS. Reescreva cada uma com os acentos e a cedilha corretos do português brasileiro. ATENÇÃO: quase todas VÃO MUDAR ao ganhar acento — não devolva uma frase idêntica se ela precisa de acento. Exemplos do que corrigir: "funcoes"→"funções", "nao"→"não", "lingua"→"língua", "negocio"→"negócio", "relatorio"→"relatório", "midia"→"mídia", "metricas"→"métricas", "estrategia"→"estratégia", "ninguem"→"ninguém", "voce"→"você", "ja"→"já", "ate"→"até", "organograma"→"organograma" (sem acento), "e"→"é" quando for o verbo ser. Mantenha as MESMAS palavras, ordem, pontuação, números e caixa. Frases:\n${JSON.stringify(lote.map((x) => x.texto))}`,
      }],
    });
    const block = resp.content.find((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
    frases = (block?.input as { frases?: unknown[] })?.frases ?? [];
    await logUso('claude-sonnet-4-6', 'reacentuar', resp.usage);
  } catch (e) {
    return json({ error: 'Falha na IA.', detail: String((e as Error)?.message ?? e) }, 500);
  }

  let processados = 0;
  for (let i = 0; i < lote.length; i++) {
    const novo = frases[i];
    if (typeof novo !== 'string' || !novo) continue;
    if (novo === lote[i].texto) continue;
    if (norm(novo) !== norm(lote[i].texto)) continue; // trava: só mudou acento
    if (lote[i].tab === 'p') {
      await db.update(socialPecas).set({ [lote[i].campo]: novo, updatedAt: new Date() }).where(eq(socialPecas.id, lote[i].id));
    } else {
      await db.update(socialSemanas).set({ observacoes: novo, updatedAt: new Date() }).where(eq(socialSemanas.id, lote[i].id));
    }
    processados++;
  }
  return json({ ok: true, processados, restantes: restantesAntes - processados, amostra: lote.slice(0, 3).map((x, i) => ({ orig: x.texto, novo: frases[i] ?? null })) });
};
