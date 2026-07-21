import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { json } from '../../../../lib/http';

export const prerender = false;

// Opus 4.8: modelo atual e um dos que suportam SAÍDA ESTRUTURADA (output_config.format).
// O sonnet-4-6 que eu usava aqui não suporta — era ele pedindo JSON "no texto" e às vezes
// devolvendo algo que o JSON.parse recusava. Agora quem garante o formato é a API.
const MODELO = 'claude-opus-4-8';

// A API valida a resposta contra este schema. Não é sugestão de prompt, é contrato.
const SCHEMA = {
  type: 'object',
  properties: {
    titulo_en: { type: 'string', description: 'Título em inglês.' },
    resumo_en: { type: 'string', description: 'Resumo em inglês.' },
    body_html_en: { type: 'string', description: 'Corpo em inglês, com o MESMO HTML do original.' },
  },
  required: ['titulo_en', 'resumo_en', 'body_html_en'],
  additionalProperties: false,
} as const;

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

FORMATO HTML: o corpo vem em HTML. Preserve EXATAMENTE as tags, atributos, links, imagens e a ordem. Traduza só o texto visível. Não acrescente nem remova tags.`;

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
      // 8000 truncava post longo, e JSON truncado quebra o parse (era o erro que aparecia).
      // 16000 é o teto seguro para requisição sem streaming, sem estourar timeout de HTTP.
      max_tokens: 16000,
      system: SISTEMA,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
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

    // Antes de ler o conteúdo: por que o modelo parou?
    if (r.stop_reason === 'max_tokens') {
      return json({ error: 'O artigo é longo demais para traduzir de uma vez. Traduza em partes ou me avise.' }, 502);
    }
    if (r.stop_reason === 'refusal') {
      return json({ error: 'A IA recusou traduzir este conteúdo.' }, 502);
    }

    const texto = r.content.map((c) => (c.type === 'text' ? c.text : '')).join('').trim();

    let dados: Record<string, string>;
    try {
      dados = JSON.parse(texto);
    } catch {
      // Com output_config isso não deveria acontecer. Se acontecer, devolvo uma
      // amostra do que veio — para não ficarmos cegos como da primeira vez.
      return json(
        {
          error: 'A IA respondeu num formato inesperado. Tente de novo.',
          detail: `stop_reason=${r.stop_reason} inicio=${texto.slice(0, 200)}`,
        },
        502,
      );
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
