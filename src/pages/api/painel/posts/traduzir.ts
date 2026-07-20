import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { json } from '../../../../lib/http';

export const prerender = false;

const MODELO = 'claude-sonnet-4-6';

const SISTEMA = `Você traduz textos do Bruno Massa do português para o inglês.

QUEM É O BRUNO: gerente de marketing há 20 anos, autor, "o tradutor do marketing" — explica como a área funciona por dentro. Escreve para CMO e gestor de marketing, não para iniciante.

A REGRA PRINCIPAL: isto NÃO é tradução literal. É reescrever em inglês o que ele diria se falasse inglês. O leitor precisa sentir a mesma voz: direta, sem cerimônia, com autoridade de quem operou a área.

COMO TRADUZIR
- Inglês natural (padrão internacional de negócios), primeira pessoa, frases curtas depois de parágrafo longo.
- Expressão idiomática vira expressão idiomática equivalente, nunca tradução ao pé da letra.
- Termo técnico de marketing fica no termo usado em inglês de verdade (CAC, brand, retention, pipeline).
- Nome próprio, marca e título de livro NÃO se traduzem: Narrativa em KPI, Selo7, FIAP, Marketing na Era da Inteligência Artificial.
- Se o texto citar dado ou número, mantenha exatamente igual.

FILTRO ANTI-IA — obrigatório, vale igual em inglês:
- ZERO travessão (— ou –). Use ponto ou vírgula, ou reescreva.
- Não use a fórmula "It's not X. It's Y." nem variações.
- Sem trio de adjetivos, sem inflar importância ("revolutionary", "game-changing", "powerful").
- Sem muleta de IA: "the truth is", "let's be honest", "at the end of the day", "in today's world", "the key is", "this changes everything", "here's the thing", "dive into", "unlock", "leverage" como verbo de efeito.
- Sem conclusão genérica animadora.
- Antes de devolver, releia e corte qualquer frase que soe como legenda motivacional.

FORMATO HTML: o corpo vem em HTML. Preserve EXATAMENTE as tags, atributos, links, imagens e a ordem. Traduza só o texto visível. Não acrescente nem remova tags.

Responda SOMENTE com um objeto JSON válido, sem cercas de código, no formato:
{"titulo_en": "...", "resumo_en": "...", "body_html_en": "..."}`;

export const POST: APIRoute = async ({ request }) => {
  const chave = import.meta.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!chave) return json({ error: 'ANTHROPIC_API_KEY não configurada.' }, 500);

  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const titulo = String(b.titulo ?? '').trim();
  const resumo = String(b.resumo ?? '').trim();
  const bodyHtml = String(b.body_html ?? '');

  if (!titulo) return json({ error: 'Escreva o título em português primeiro.' }, 400);

  try {
    const anthropic = new Anthropic({ apiKey: chave });
    const r = await anthropic.messages.create({
      model: MODELO,
      max_tokens: 8000,
      system: SISTEMA,
      messages: [
        {
          role: 'user',
          content: `Traduza para o inglês:

TÍTULO:
${titulo}

RESUMO:
${resumo}

CORPO (HTML):
${bodyHtml}`,
        },
      ],
    });

    const texto = r.content.map((c) => (c.type === 'text' ? c.text : '')).join('').trim();
    const limpo = texto.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

    let dados: Record<string, string>;
    try {
      dados = JSON.parse(limpo);
    } catch {
      return json({ error: 'A IA respondeu num formato inesperado. Tente de novo.' }, 502);
    }

    // Trava de segurança do humanizer: travessão não passa nem se o modelo insistir.
    const semTravessao = (s: string) => (s ?? '').replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',');

    return json({
      titulo_en: semTravessao(dados.titulo_en ?? ''),
      resumo_en: semTravessao(dados.resumo_en ?? ''),
      body_html_en: dados.body_html_en ?? '',
    });
  } catch (e) {
    return json({ error: 'Não foi possível traduzir.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
