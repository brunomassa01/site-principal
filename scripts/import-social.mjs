import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);

// ---------- helpers ----------
const unesc = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
const parseDt = (s) => {
  const m = (s || '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null; // ISO date string p/ coluna date
};
function splitLente(s) {
  const m = (s || '').match(/\[lente:\s*([^\]]+)\]/i);
  const lente = m ? m[1].trim() : null;
  const gancho = (s || '')
    .replace(/\[lente:[^\]]*\]/gi, '')
    .replace(/\[PONTE IA\]/gi, '')
    .trim();
  return { gancho, lente };
}

// ---------- 1) parse do calendário (sheet1.xml já descompactado) ----------
const xml = readFileSync('scripts/_sheet1.xml', 'utf-8');
const COL = { A: 'numero', B: 'inicio', C: 'cluster', D: 'linkedin', E: 'carrossel', F: 'reel', G: 'manychat', H: 'obs', I: 'status' };
const rows = [];
for (const rm of xml.matchAll(/<row r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
  const cells = {};
  for (const cm of rm[2].matchAll(/<c r="([A-Z]+)\d+"[^>]*?(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const col = cm[1];
    const inner = cm[2] || '';
    let val = '';
    const t = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/);
    const v = inner.match(/<v>([\s\S]*?)<\/v>/);
    if (t) val = unesc(t[1]);
    else if (v) val = v[1];
    cells[COL[col] ?? col] = val.trim();
  }
  if (cells.numero && /^\d+$/.test(cells.numero)) rows.push(cells);
}
console.log('linhas de semana lidas do xlsx:', rows.length);

// ---------- 2) clusters (do plano editorial) ----------
const CLUSTERS = [
  { ordem: 1, nome: 'Cap. 1 — O currículo do marketing', capitulo: 'Capítulo 1', semanaInicio: 1, semanaFim: 6, palavras: ['NARRATIVA', 'DIAGNOSTICO'] },
  { ordem: 2, nome: 'Cap. 2 — Onde a narrativa nasce', capitulo: 'Capítulo 2', semanaInicio: 7, semanaFim: 12, palavras: ['ORIGEM', 'TESTE5'] },
  { ordem: 3, nome: 'Coringa: bastidor MBA FIAP', capitulo: 'Coringa', semanaInicio: 13, semanaFim: 13, palavras: [] },
  { ordem: 4, nome: 'Cap. 3 — Onde a narrativa quebra', capitulo: 'Capítulo 3', semanaInicio: 14, semanaFim: 19, palavras: ['QUEBRA', 'PONTE'] },
  { ordem: 5, nome: 'Cap. 4 — Tradutor, não autor', capitulo: 'Capítulo 4', semanaInicio: 20, semanaFim: 25, palavras: ['TRADUTOR', 'METODO'] },
  { ordem: 6, nome: 'Coringa: balanço de meio de ano', capitulo: 'Coringa', semanaInicio: 26, semanaFim: 26, palavras: [] },
  { ordem: 7, nome: 'Cap. 5 — O custo invisível', capitulo: 'Capítulo 5', semanaInicio: 27, semanaFim: 32, palavras: ['CUSTO', 'MAPA'] },
  { ordem: 8, nome: 'Cap. 6 — Sistema de decisão', capitulo: 'Capítulo 6', semanaInicio: 33, semanaFim: 38, palavras: ['SISTEMA', 'FERIAS'] },
  { ordem: 9, nome: 'Coringa: prévia do INK', capitulo: 'Coringa', semanaInicio: 39, semanaFim: 39, palavras: ['INK'] },
  { ordem: 10, nome: 'Cap. 7 — INK (cluster principal)', capitulo: 'Capítulo 7', semanaInicio: 40, semanaFim: 46, palavras: ['INK', 'ESTAGIO', 'CAC'] },
  { ordem: 11, nome: 'Epílogo + manifesto', capitulo: 'Epílogo', semanaInicio: 47, semanaFim: 50, palavras: ['LIVRO'] },
  { ordem: 12, nome: 'Recap do ano + convite newsletter', capitulo: 'Recap', semanaInicio: 51, semanaFim: 52, palavras: ['LIVRO', 'NEWS'] },
];

// ---------- 3) conteúdo completo da semana 1 (dos 3 modelos) ----------
const SEMANA1 = {
  linkedin: {
    status: 'escrito',
    conteudo: {
      texto: `Semana passada fiz um teste: li as primeiras 20 vagas de marketing que o LinkedIn me mostrou.

Uma delas pedia gestão de tráfego, edição de vídeo, social media, organização de eventos, CRM e "apoio ao time comercial". Tudo na mesma vaga. Salário de analista júnior.

Eu não vejo aí uma vaga. Vejo um raio-X de como aquela empresa enxerga marketing.

Quem escreve uma descrição assim não está contratando uma pessoa, está terceirizando uma indefinição. Ninguém na empresa decidiu o que o marketing precisa gerar, então a vaga pede tudo. O profissional que entrar vai executar sete funções sem eixo, e em 18 meses a diretoria vai concluir que "não era o que precisávamos". E abrir a mesma vaga de novo.

Trabalho com marketing há 20 anos e vi esse ciclo se repetir em empresas de todo tamanho. Quase nunca é problema de gente. É um problema de estrutura que ninguém nomeia, e que nenhuma contratação resolve.

Eu dei um nome a esse eixo ausente: narrativa. Não a do storytelling, a outra — o critério que define o que o marketing faz e, principalmente, o que recusa.

Antes de abrir a próxima vaga, teste: o que essa função precisa gerar para o negócio em 12 meses? Se a resposta interna for "depende do dia", o problema não está no candidato.

Já viu (ou ocupou) uma vaga dessas? Me conta como terminou.`,
      notas: 'Texto puro, sem imagem; primeira linha é o gancho do "ver mais". Terça ou quarta, 8h–10h; responder os primeiros comentários em até 1h.',
    },
  },
  carrossel: {
    status: 'escrito',
    legenda: 'Cinco frases, um padrão: todas falam do que produzir, nenhuma do que gerar. Comenta NARRATIVA que te mando o diagnóstico no direct.',
    conteudo: {
      formato: '9 slides · 1080x1350',
      referencia: 'estilo editorial @estevaosoares — fundo creme, título serifado, tag, assinatura',
      slides: [
        { n: 1, tipo: 'capa', tag: 'GESTÃO DE MARKETING', titulo: '"Faz uma arte rapidinho?"', subtitulo: '5 frases que entregam como a sua empresa enxerga o marketing.' },
        { n: 2, titulo: 'Frase 1: "Faz uma arte rapidinho."', texto: 'Rapidinho para quem? O pedido chega com pressa e sem objetivo. A peça vai existir, o resultado ninguém combinou.' },
        { n: 3, titulo: 'Frase 2: "Posta alguma coisa essa semana."', texto: 'Alguma coisa. O conteúdo virou obrigação de presença, não instrumento de negócio.' },
        { n: 4, titulo: 'Frase 3: "A diretoria quer um vídeo."', texto: 'Quer um vídeo ou quer um resultado que talvez nem precise de vídeo? Ninguém perguntou.' },
        { n: 5, titulo: 'Frase 4: "Depois a gente mede."', texto: 'Depois nunca chega. O que não nasce com meta não morre com análise.' },
        { n: 6, titulo: 'Frase 5: "Era bom, mas não era o que precisávamos."', texto: 'A frase de demissão de quem nunca disse o que precisava.' },
        { n: 7, texto: 'Repare no padrão: nenhuma das cinco frases fala do que GERAR. Todas falam do que PRODUZIR. Marketing operado assim vira o que eu chamo de gráfica digital interna.' },
        { n: 8, texto: 'O antídoto começa com uma troca simples: antes de pedir a peça, declarar o resultado. Quem não consegue declarar o resultado não deveria poder pedir a peça.' },
        { n: 9, tipo: 'cta', texto: 'Quantas dessas frases circulam na sua empresa? Comenta NARRATIVA que eu te mando o diagnóstico em 3 perguntas para aplicar no seu time hoje.', assinatura: '@brunormassa' },
      ],
    },
  },
  reel: {
    status: 'escrito',
    legenda: 'Relatório que só mede esforço esconde a pergunta que importa.',
    conteudo: {
      capa: 'Relatório bonito, caixa vazio',
      duracao: '~60s · 8 cenas de até 8s',
      referencia: '@estevaosoares — talking head frontal, legendas queimadas com palavra destacada',
      cenas: [
        { n: 1, titulo: 'Gancho (0–8s)', fala: 'Me mostra o relatório do seu marketing que eu te digo se ele gera dinheiro ou só gera trabalho.', legenda: 'ME MOSTRA O RELATÓRIO' },
        { n: 2, titulo: 'A cena (8–16s)', fala: 'Se o relatório lista alcance, curtidas, seguidores e posts entregues, ele está medindo uma coisa só: esforço.', legenda: 'ISSO É ESFORÇO' },
        { n: 3, titulo: 'O problema (16–24s)', fala: 'E esforço importa. Mas esforço não paga boleto.', legenda: 'ESFORÇO NÃO PAGA BOLETO' },
        { n: 4, titulo: 'O que falta (24–32s)', fala: 'Falta a linha que conecta tudo isso ao negócio. E em 20 anos de marketing, eu vi pouquíssimos relatórios com essa linha.', legenda: 'FALTA UMA LINHA' },
        { n: 5, titulo: 'A lente (32–40s)', fala: 'Eu chamo isso de a pergunta que muda a conversa: quantos clientes novos vieram disso?', legenda: 'QUANTOS CLIENTES VIERAM DISSO?' },
        { n: 6, titulo: 'A intenção (40–48s)', fala: 'Não é pra humilhar o time. É pra dar eixo. Sem essa pergunta, todo o resto é esforço solto.', legenda: 'NÃO É HUMILHAR. É DAR EIXO.' },
        { n: 7, titulo: 'O teste (48–56s)', fala: 'Faz o teste hoje: pega a última campanha e tenta responder. O silêncio também é resposta.', legenda: 'O SILÊNCIO TAMBÉM É RESPOSTA' },
        { n: 8, titulo: 'CTA (56–62s)', fala: 'Comenta NARRATIVA que eu te mando o diagnóstico completo pra aplicar no seu relatório ainda essa semana.', legenda: 'COMENTA "NARRATIVA"' },
      ],
    },
  },
};

const DIA = { linkedin: 'terca', carrossel: 'terca', reel: 'quinta' };

// ---------- 4) limpa e reinsere (import-base; depois edita-se no Painel) ----------
await sql`DELETE FROM social_pecas`;
await sql`DELETE FROM social_semanas`;
await sql`DELETE FROM social_clusters`;

const clusterIdByWeek = {};
for (const c of CLUSTERS) {
  const [row] = await sql`INSERT INTO social_clusters (ordem, nome, capitulo, semana_inicio, semana_fim, palavras_chave)
    VALUES (${c.ordem}, ${c.nome}, ${c.capitulo}, ${c.semanaInicio}, ${c.semanaFim}, ${JSON.stringify(c.palavras)}::jsonb)
    RETURNING id`;
  for (let w = c.semanaInicio; w <= c.semanaFim; w++) clusterIdByWeek[w] = row.id;
}
console.log('clusters inseridos:', CLUSTERS.length);

let nPecas = 0;
for (const r of rows) {
  const numero = parseInt(r.numero, 10);
  const ponteIa = /\[PONTE IA\]/i.test(`${r.linkedin} ${r.carrossel} ${r.reel}`);
  const coringa = /coringa/i.test(r.cluster || '');
  const slotReativo = numero === 21 || numero === 34 || /reativo/i.test(r.obs || '');
  const statusSem = numero === 1 ? 'em-producao' : 'planejado';
  const [sem] = await sql`INSERT INTO social_semanas
    (numero, inicio, cluster, cluster_id, ponte_ia, slot_reativo, coringa, observacoes, status)
    VALUES (${numero}, ${parseDt(r.inicio)}, ${r.cluster || null}, ${clusterIdByWeek[numero] ?? null},
            ${ponteIa}, ${slotReativo}, ${coringa}, ${r.obs || null}, ${statusSem})
    RETURNING id`;

  for (const fmt of ['linkedin', 'carrossel', 'reel']) {
    const { gancho, lente } = splitLente(r[fmt]);
    const w1 = numero === 1 ? SEMANA1[fmt] : null;
    await sql`INSERT INTO social_pecas
      (semana_id, formato, gancho, lente, conteudo, legenda, manychat, dia_publicacao, status)
      VALUES (${sem.id}, ${fmt}, ${gancho || null}, ${lente || null},
              ${w1 ? JSON.stringify(w1.conteudo) : null}::jsonb,
              ${w1?.legenda ?? null}, ${r.manychat || null}, ${DIA[fmt]}, ${w1?.status ?? 'planejado'})`;
    nPecas++;
  }
}
console.log('semanas inseridas:', rows.length, '| peças inseridas:', nPecas);
process.exit(0);
