// Geração de conteúdo social na voz do Bruno (Claude API).
// Persona + filtro humanizer + discrição + gabarito (os modelos da semana 1).

import Anthropic from '@anthropic-ai/sdk';
import { getInstrucoesIA } from '../content/config';

// Bloco de instruções extras do Bruno (editável no painel), com prioridade.
async function blocoInstrucoes(): Promise<string> {
  const extra = (await getInstrucoesIA()).trim();
  return extra ? `\n\nINSTRUÇÕES ADICIONAIS DO BRUNO (têm PRIORIDADE máxima, siga à risca):\n${extra}` : '';
}

const MODELO = 'claude-sonnet-4-6';

// Pós-processador determinístico do humanizer: mata travessão (muleta de IA nº1) e limpa pontuação.
function humanizar(t: string): string {
  if (!t) return t;
  return t
    .replace(/^[ \t]*[—–][ \t]*/gm, '• ') // travessão de bullet no começo da linha → vira bullet
    .replace(/\s*[—–]\s*/g, ', ') // travessão no meio da frase → vírgula
    .replace(/,\s*,/g, ',')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
// Aplica o humanizar em todas as strings de um objeto/array gerado.
function humanizarTudo<T>(v: T): T {
  if (typeof v === 'string') return humanizar(v) as unknown as T;
  if (Array.isArray(v)) return v.map((x) => humanizarTudo(x)) as unknown as T;
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>)) o[k] = humanizarTudo((v as Record<string, unknown>)[k]);
    return o as unknown as T;
  }
  return v;
}

const PERSONA = `Você é o ghostwriter do Bruno Massa e escreve EXATAMENTE na voz dele. O texto precisa passar como escrito de próprio punho — se soar como IA, falhou.

QUEM É O BRUNO
- Gerente de marketing há 20 anos; autor; cursando MBA de IA para Negócios na FIAP. Ele é "o tradutor do marketing": explica como a área funciona por dentro.
- Teses (use como assinatura, sem repetir toda hora): "Se não vira receita, não é marketing, é decoração." e "IA não vai substituir o gestor de marketing. Vai expor quem nunca teve método."
- Audiência: CMO/head e gestor de marketing que precisa de método. NÃO escreve para iniciante nem para caçador de "renda extra com IA".
- Anti-avatar (NUNCA soar como): guru de marketing digital, entusiasta de IA de listinha de ferramentas, influenciador de lifestyle, ressentido de ex-empregador.

VOZ E ESTRUTURA
- Português brasileiro, primeira pessoa, direto, sem cerimônia.
- Abre com uma cena ou caso real do MUNDO (uma vaga, uma frase de reunião, um caso público) → liga ao argumento → fecha com uma provocação de MÉTODO, nunca de pessoa ou empresa.
- Frase curta depois de parágrafo longo. Didático. Gratidão pela trajetória aparece no tom.

FILTRO HUMANIZER — a regra mais importante, NUNCA viole:
- Sem inflar importância (nada de "revolucionário", "game-changing", "poderoso").
- Sem trio de adjetivos.
- Sem gerúndio de profundidade falsa ("desbloqueando", "potencializando", "alavancando").
- Sem conclusão genérica e animadora ("e é assim que você vence").
- ZERO travessão (— ou –). É proibido. Use ponto ou vírgula, ou reescreva a frase.
- Não use a fórmula "Não é X. É Y." nem variações dela.
- PROIBIDAS estas muletas de IA e clichês de copy: "a verdade é que", "vamos ser honestos", "no fim do dia", "mais do que nunca", "em um mundo cada vez mais", "o segredo é", "a chave para", "isso muda tudo", "spoiler:", "plot twist", "a real é que", "bora?", "aqui vai um", "pode parecer clichê, mas". Se uma frase soa como legenda motivacional genérica, troque pela experiência concreta do Bruno.
- ANTES de devolver, releia e corte qualquer frase que você não diria em voz alta numa conversa real.

DISCRIÇÃO (regra de ouro): NUNCA cite número, resultado ou caso identificável do empregador atual (Grupo Quali). Pode usar: histórias anonimizadas, casos públicos, o método e as ideias próprias, os SaaS próprios e a experiência antiga.

REGRA EDITORIAL: a matéria-prima é o MUNDO. Os conceitos e o método do Bruno entram como LENTE pra interpretar o caso, apresentados como o JEITO DELE de pensar. ⛔ PROIBIDO citar, mencionar ou aludir a "meu livro", "no meu livro", "no livro", títulos de livro ou qualquer obra publicada. O momento é de POSICIONAMENTO e crescimento de audiência, NÃO de venda. Apresente as ideias como pensamento próprio, sem apontar pra um produto.`;

const GABARITO: Record<string, string> = {
  linkedin: `EXEMPLO de post de LinkedIn dele (gabarito de TOM e ESTRUTURA, não copie o assunto):
"""
Semana passada fiz um teste: li as primeiras 20 vagas de marketing que o LinkedIn me mostrou.

Uma delas pedia gestão de tráfego, edição de vídeo, social media, organização de eventos, CRM e "apoio ao time comercial". Tudo na mesma vaga. Salário de analista júnior.

Eu não vejo aí uma vaga. Vejo um raio-X de como aquela empresa enxerga marketing.

(...desenvolve o argumento em parágrafos curtos e médios...)

Antes de abrir a próxima vaga, teste: o que essa função precisa gerar para o negócio em 12 meses?

Já viu (ou ocupou) uma vaga dessas? Me conta como terminou.
"""`,
  carrossel: `EXEMPLO de carrossel dele (gabarito de estrutura): 9 slides. Slide 1 é a CAPA (tag curta em caixa-alta + título-gancho curto entre aspas + subtítulo explicando). Slides 2 a 7-8 são as ideias, cada um com um título curto e 1-2 frases de texto. O penúltimo amarra o conceito-chave (o método do Bruno, sem citar livro). O último é a CTA com a pergunta + "Comenta {PALAVRA} que eu te mando...". Frases curtas, afiadas, uma ideia por slide.`,
  reel: `EXEMPLO de reel dele (gabarito): vídeo de ~60s, 8 cenas curtas. Capa com frase-gancho. Cada cena tem uma FALA (como ele diria, natural, falada) e uma LEGENDA destacada de 2-4 palavras em caixa-alta. Abre com gancho forte, desenvolve, fecha com a CTA "Comenta {PALAVRA}...". Também entregue um "roteiro" em texto corrido (as falas em sequência, pra ele ler e gravar).`,
  post: `EXEMPLO de post único dele (gabarito): UMA imagem só, não é carrossel. Uma tag curta em caixa-alta, um título-gancho curto e afiado (a tese da imagem, no estilo dele), um subtítulo de uma linha que explica, e a legenda pro feed. É o formato mais direto: uma ideia, uma imagem, uma legenda.`,
};

type Peca = { formato: string; gancho: string | null; lente: string | null; manychat: string | null };
type Semana = { cluster: string | null; ponteIa: boolean };

const TOOLS: Record<string, Anthropic.Tool> = {
  linkedin: {
    name: 'post_linkedin',
    description: 'Entrega o post de LinkedIn pronto.',
    input_schema: { type: 'object', properties: { texto: { type: 'string', description: 'O texto completo do post, com quebras de parágrafo.' } }, required: ['texto'] },
  },
  carrossel: {
    name: 'carrossel',
    description: 'Entrega o carrossel pronto (9 slides + legenda).',
    input_schema: {
      type: 'object',
      properties: {
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', description: "'capa', 'cta' ou vazio" },
              tag: { type: 'string' }, titulo: { type: 'string' }, subtitulo: { type: 'string' }, texto: { type: 'string' }, assinatura: { type: 'string' },
            },
          },
        },
        legenda: { type: 'string' },
      },
      required: ['slides', 'legenda'],
    },
  },
  reel: {
    name: 'reel',
    description: 'Entrega o reel pronto (capa, roteiro corrido, cenas e legenda).',
    input_schema: {
      type: 'object',
      properties: {
        capa: { type: 'string', description: 'frase-gancho da capa' },
        roteiro: { type: 'string', description: 'roteiro em texto corrido, as falas em sequência, pra ler e gravar' },
        cenas: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, fala: { type: 'string' }, legenda: { type: 'string' } } } },
        legenda: { type: 'string' },
      },
      required: ['capa', 'roteiro', 'cenas', 'legenda'],
    },
  },
  post: {
    name: 'post_unico',
    description: 'Entrega um post único do Instagram (uma imagem só + legenda).',
    input_schema: {
      type: 'object',
      properties: {
        tag: { type: 'string', description: 'kicker curto em caixa-alta (ex.: GESTÃO DE MARKETING)' },
        titulo: { type: 'string', description: 'a frase-gancho forte e curta que vai grande na imagem, no estilo do Bruno' },
        subtitulo: { type: 'string', description: 'uma linha curta de apoio que explica o gancho' },
        legenda: { type: 'string', description: 'a legenda do post pro Instagram, na voz do Bruno' },
      },
      required: ['titulo', 'legenda'],
    },
  },
};

export async function gerarConteudo(peca: Peca, semana: Semana, materia?: string): Promise<{ conteudo: Record<string, unknown>; legenda?: string; usage?: { input_tokens: number; output_tokens: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada.');
  const client = new Anthropic({ apiKey });
  const tool = TOOLS[peca.formato];
  if (!tool) throw new Error('Formato sem geração.');

  const ponte = semana.ponteIa
    ? '\nEsta pauta é [PONTE IA]: estenda o argumento para o universo de IA, como OPINIÃO e método do Bruno.'
    : '';
  const cta = peca.manychat ? `\nNa chamada final, convide a comentar a palavra "${peca.manychat}" para receber o material.` : '';
  const fonte = materia
    ? `\n\nMATÉRIA-PRIMA: o artigo abaixo já foi publicado no blog do Bruno e já está na voz dele. TRANSFORME o artigo no formato pedido: aproveite as ideias, as frases fortes e os exemplos dele. NÃO invente fatos que não estejam no artigo. NÃO copie parágrafos inteiros: adapte ao ritmo do formato.\n"""\n${materia.slice(0, 6000)}\n"""`
    : '';

  const system = `${PERSONA}\n\n${GABARITO[peca.formato]}${await blocoInstrucoes()}`;
  const user = `Cluster da semana: ${semana.cluster ?? '—'}.
Pauta (o ângulo desta peça): ${peca.gancho ?? '—'}.
Lente (conceito): ${peca.lente ?? '—'}.${ponte}${cta}${fonte}

Escreva o ${peca.formato === 'linkedin' ? 'post de LinkedIn' : peca.formato} no padrão e na voz do Bruno. Use a ferramenta para entregar.`;

  // Até 2 tentativas: a IA às vezes devolve arrays como texto JSON (com escape quebrado). Valida e re-tenta.
  let out: Record<string, unknown> | null = null;
  let resp: Anthropic.Message | null = null;
  for (let tentativa = 1; tentativa <= 2 && !out; tentativa++) {
    resp = await client.messages.create({
      model: MODELO,
      max_tokens: 3500,
      system,
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content: user }],
    });
    const block = resp.content.find((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
    if (!block) continue;
    let cand = block.input as Record<string, unknown> | string;
    try {
      if (typeof cand === 'string') cand = JSON.parse(cand) as Record<string, unknown>;
      for (const k of ['slides', 'cenas'] as const) {
        if (typeof cand[k] === 'string') cand[k] = JSON.parse(cand[k] as string);
      }
      if (peca.formato === 'carrossel' && !Array.isArray(cand.slides)) throw new Error('slides não é lista');
      if (peca.formato === 'reel' && !Array.isArray(cand.cenas)) throw new Error('cenas não é lista');
      out = cand;
    } catch {
      out = null; // formato quebrado: tenta de novo
    }
  }
  if (!out || !resp) throw new Error('A IA devolveu um formato inválido duas vezes. Clique em gerar novamente.');

  let conteudo: Record<string, unknown>;
  let legenda: string | undefined;
  if (peca.formato === 'linkedin') {
    conteudo = { texto: out.texto };
  } else if (peca.formato === 'carrossel') {
    conteudo = { formato: '9 slides · 1080x1350', slides: (out.slides as unknown[]) ?? [] };
    legenda = out.legenda as string;
  } else if (peca.formato === 'post') {
    conteudo = { tag: out.tag, titulo: out.titulo, subtitulo: out.subtitulo };
    legenda = out.legenda as string;
  } else {
    conteudo = { capa: out.capa, duracao: '~60s · 8 cenas', roteiro: out.roteiro, cenas: out.cenas };
    legenda = out.legenda as string;
  }
  return { conteudo: humanizarTudo(conteudo), legenda: legenda === undefined ? undefined : humanizar(legenda), usage: resp.usage };
}

// Gera a RESPOSTA AUTOMÁTICA do Manychat (DM disparado quando o seguidor comenta a palavra-chave).
// Duas partes: (1) pedido de automação — o gatilho; (2) entrega — o diagnóstico/material que o post prometeu.
export async function gerarRespostaManychat(
  peca: Peca,
): Promise<{ pedido: string; entrega: string; usage?: { input_tokens: number; output_tokens: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada.');
  const client = new Anthropic({ apiKey });
  const palavra = peca.manychat || 'a palavra-chave';

  const tool: Anthropic.Tool = {
    name: 'resposta_manychat',
    description: 'Entrega a resposta automática do Manychat em duas partes.',
    input_schema: {
      type: 'object',
      properties: {
        pedido: { type: 'string', description: 'O 1º DM, disparado quando o seguidor comenta a palavra: agradece de leve e pede UMA interação simples que destrava a sequência (ex.: "me responde FEITO", "toca no botão abaixo"). Curtíssimo. É o gatilho do fluxo.' },
        entrega: { type: 'string', description: 'O 2º DM: o diagnóstico / material que o post prometeu, no método e na voz do Bruno. É um BRINDE de valor real e AUTOSSUFICIENTE (passos ou pontos curtos) — sem venda e sem link de produto. Fecha com um convite leve a SEGUIR pra mais método.' },
      },
      required: ['pedido', 'entrega'],
    },
  };

  const system = `${PERSONA}

CONTEXTO: agora você escreve a RESPOSTA AUTOMÁTICA do Instagram via Manychat — o DM disparado quando o seguidor COMENTA a palavra-chave de um post. NÃO é um post. É conversa no direct: mais curta e calorosa que um post, mas 100% na voz do Bruno (nada de "Olá! Tudo bem? 😊" de robô de atendimento).

OBJETIVO ATUAL DO BRUNO: ele NÃO tem nada pra vender agora. A meta é AUMENTAR SEGUIDORES e SE POSICIONAR como autoridade de método. Então: nada de venda, nada de link de produto. A entrega é um BRINDE de valor real que prova o método e faz a pessoa querer seguir. As interações pedidas são as que o algoritmo premia (responder, salvar, seguir).

São DUAS partes:
1) PEDIDO DE AUTOMAÇÃO (1º DM): agradece de leve e pede UMA interação simples que destrava a entrega E ajuda o alcance (ex.: "me responde FEITO", "salva esse post", "toca no botão"). Curtíssimo. É o gatilho do fluxo.
2) ENTREGA (2º DM): o diagnóstico / material que o post prometeu — valor real e AUTOSSUFICIENTE, no método do Bruno, em pontos ou passos curtos. Sem venda, sem link de produto. Fecha com um convite leve a SEGUIR pra mais método.

Sem hashtags. No máximo 1-2 emojis e só se couber no tom. Quebras de linha curtas (é DM).${await blocoInstrucoes()}`;

  const user = `Palavra-chave que o seguidor comentou: "${palavra}".
Assunto do post (gancho): ${peca.gancho ?? '—'}.
Lente do livro: ${peca.lente ?? '—'}.
Formato do post: ${peca.formato}.

Escreva as duas partes do DM (pedido de automação + entrega). Use a ferramenta.`;

  const resp = await client.messages.create({
    model: MODELO,
    max_tokens: 1500,
    system,
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
    messages: [{ role: 'user', content: user }],
  });

  const block = resp.content.find((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
  if (!block) throw new Error('A IA não retornou a resposta.');
  const out = block.input as { pedido?: string; entrega?: string };
  return { pedido: humanizar(out.pedido ?? ''), entrega: humanizar(out.entrega ?? ''), usage: resp.usage };
}

// ───────────────────────── Leitura de Performance ─────────────────────────
// Lê os números de um post (planilha do LinkedIn em texto, OU print) e devolve métricas
// estruturadas + uma análise na cabeça do Bruno + uma recomendação que alimenta o calendário.
export type Metricas = {
  impressoes?: number; alcance?: number; reacoes?: number; comentarios?: number;
  compartilhamentos?: number; salvamentos?: number; envios?: number;
  cliques?: number; visualizacoesPerfil?: number; seguidoresGanhos?: number;
  taxaEngajamento?: number; // % sobre impressões
};

export async function analisarPerformance(args: {
  gancho?: string | null; formato?: string | null; lente?: string | null;
  texto?: string;             // conteúdo da planilha já convertido em texto
  imagemBase64?: string; mime?: string; // print do painel
}): Promise<{ metricas: Metricas; analise: string; recomendacao: string; usage?: { input_tokens: number; output_tokens: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada.');
  const client = new Anthropic({ apiKey });

  const tool: Anthropic.Tool = {
    name: 'leitura_performance',
    description: 'Extrai as métricas do post e devolve a análise e a recomendação.',
    input_schema: {
      type: 'object',
      properties: {
        impressoes: { type: 'number', description: 'total de impressões/visualizações' },
        alcance: { type: 'number', description: 'usuários únicos alcançados' },
        reacoes: { type: 'number', description: 'total de reações/curtidas' },
        comentarios: { type: 'number' },
        compartilhamentos: { type: 'number' },
        salvamentos: { type: 'number' },
        envios: { type: 'number', description: 'envios/compartilhamentos por DM' },
        cliques: { type: 'number' },
        visualizacoesPerfil: { type: 'number', description: 'visitas ao perfil a partir do post' },
        seguidoresGanhos: { type: 'number', description: 'seguidores ganhos com o post' },
        taxaEngajamento: { type: 'number', description: 'engajamento total dividido por impressões, em % (calcule)' },
        analise: { type: 'string', description: 'A LEITURA, em 3-5 frases, na cabeça do Bruno: o que puxou o alcance (comentário? salvamento?), quem foi atingido, o que converteu. Direto, sem floreio, sem travessão.' },
        recomendacao: { type: 'string', description: 'UMA recomendação acionável pro calendário: que tipo de gancho repetir/antecipar e por quê, ligado ao objetivo de crescer seguidores e se posicionar.' },
      },
      required: ['analise', 'recomendacao'],
    },
  };

  const system = `Você é o analista de conteúdo do Bruno Massa. Lê dados de desempenho de um post (LinkedIn ou Instagram) e devolve uma leitura afiada e prática, na cabeça dele.

O QUE O BRUNO SABE E PERSEGUE (use como lente da análise):
- Objetivo atual: CRESCER SEGUIDORES e SE POSICIONAR como autoridade de método. Não vende nada agora.
- Mecânica que funciona: provocação + pergunta gera COMENTÁRIO, e comentário é o que o algoritmo premia com alcance. Carrossel salvável (framework, lista, método) gera SALVAMENTO e autoridade, dá vida longa ao conteúdo.
- Sinais que importam: taxa de comentário sobre reação (alta = conversa de verdade), salvamentos+compartilhamentos (vida longa), seguidores ganhos (conversão do objetivo), e QUEM foi atingido (cargo/setor/empresa = se é o público-alvo).

REGRAS:
- Extraia os números que conseguir identificar (deixe em branco o que não aparecer). Calcule a taxa de engajamento (engajamento total ÷ impressões, em %).
- A análise é OBJETIVA e CURTA. Sem travessão, sem "neste artigo", sem elogio vazio. Aponte a CAUSA do resultado, não só o número.
- A recomendação é UMA, acionável, ligada ao calendário (que gancho repetir/antecipar).`;

  const instrucao = `Post analisado:
- Gancho: ${args.gancho ?? '—'}
- Formato: ${args.formato ?? '—'}
- Lente do livro: ${args.lente ?? '—'}

${args.texto ? `Dados de desempenho (exportados):\n"""\n${args.texto}\n"""` : 'Os dados estão na imagem anexada (print do painel de analytics). Leia os números da imagem.'}

Extraia as métricas, faça a leitura e dê a recomendação. Use a ferramenta.`;

  const content: Anthropic.ContentBlockParam[] = [];
  if (args.imagemBase64) {
    content.push({ type: 'image', source: { type: 'base64', media_type: (args.mime as 'image/png' | 'image/jpeg') || 'image/png', data: args.imagemBase64 } });
  }
  content.push({ type: 'text', text: instrucao });

  const resp = await client.messages.create({
    model: MODELO,
    max_tokens: 1500,
    system,
    tools: [tool],
    tool_choice: { type: 'tool', name: tool.name },
    messages: [{ role: 'user', content }],
  });

  const block = resp.content.find((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock | undefined;
  if (!block) throw new Error('A IA não conseguiu ler os dados.');
  const o = block.input as Record<string, unknown>;
  const num = (k: string) => (typeof o[k] === 'number' ? (o[k] as number) : undefined);
  const metricas: Metricas = {
    impressoes: num('impressoes'), alcance: num('alcance'), reacoes: num('reacoes'),
    comentarios: num('comentarios'), compartilhamentos: num('compartilhamentos'),
    salvamentos: num('salvamentos'), envios: num('envios'), cliques: num('cliques'),
    visualizacoesPerfil: num('visualizacoesPerfil'), seguidoresGanhos: num('seguidoresGanhos'),
    taxaEngajamento: num('taxaEngajamento'),
  };
  return {
    metricas,
    analise: humanizar(String(o.analise ?? '')),
    recomendacao: humanizar(String(o.recomendacao ?? '')),
    usage: resp.usage,
  };
}
