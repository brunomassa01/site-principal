import type { Lang } from './index';

/**
 * Conteúdo da página do programa corporativo "Cultura de IA para Empresas".
 * A escada de três degraus (palestra → treinamento → programa continuado).
 *
 * Regras que a cópia respeita, por decisão do produto:
 *  - Caso real SEMPRE anonimizado ("um grupo do setor financeiro"). Sem nome de
 *    empresa, sem número interno, sem ferramenta contratada, sem link.
 *  - Promessa responsável: método, nivelamento e organização. Nunca corte de
 *    custos, automação garantida ou resultado financeiro.
 *  - Segurança de dados é módulo inegociável em qualquer formato.
 *
 * Espelha o padrão de src/i18n/palestras.ts: PT completo, EN preserva o soco.
 */

type Degrau = { n: string; tag: string; nome: string; duracao: string; texto: string; quem: string; entrega: string };
type Passo = { nome: string; texto: string };
type Item = { t: string; d: string };

type Pagina = {
  metaDesc: string;
  selo: string;
  h1: string;
  subtitulo: string;
  ctaPrincipal: string;
  ctaWhats: string;
  assuntoEmail: string;
  whatsMsg: string;
  sobConsulta: string;

  problemaEyebrow: string;
  problemaTitulo: string;
  problemaTexto: string;

  escadaEyebrow: string;
  escadaTitulo: string;
  escadaIntro: string;
  degraus: Degrau[];
  degrauQuem: string;
  degrauEntrega: string;

  metodoEyebrow: string;
  metodoTitulo: string;
  metodoIntro: string;
  passos: Passo[];

  segEyebrow: string;
  segTitulo: string;
  segTexto: string;

  recebeEyebrow: string;
  recebeTitulo: string;
  recebeItens: string[];

  porqueEyebrow: string;
  porqueTitulo: string;
  porqueItens: Item[];

  naoEyebrow: string;
  naoTitulo: string;
  naoItens: string[];
  naoFecho: string;

  conduzEyebrow: string;
  conduzTitulo: string;
  conduzParagrafos: string[];

  ctaFinalTitulo: string;
  ctaFinalTexto: string;
};

export const culturaIa: Record<Lang, Pagina> = {
  pt: {
    metaDesc:
      'Cultura de IA para Empresas: palestra, treinamento in-company e programa de implantação para nivelar lideranças no uso seguro e produtivo de inteligência artificial. Método, não hype.',
    selo: 'Palestra e treinamento in-company para lideranças',
    h1: 'Sua empresa já usa IA. O problema é como.',
    subtitulo:
      'A adoção de inteligência artificial já aconteceu nas empresas, com ou sem método. Sem direção, gera desperdício e risco. Com método, vira vantagem operacional. Este programa nivela suas lideranças e instala as bases para um uso seguro e produtivo de IA.',
    ctaPrincipal: 'Levar para minha empresa',
    ctaWhats: 'Chamar no WhatsApp',
    assuntoEmail: 'Cultura de IA para a minha empresa',
    whatsMsg: 'Oi, Bruno. Quero levar o programa de Cultura de IA para a minha empresa.',
    sobConsulta: 'Formatos e valores sob consulta.',

    problemaEyebrow: 'O problema',
    problemaTitulo: 'A adoção já aconteceu. A pergunta não é se, é como.',
    problemaTexto:
      'Times usam IA por conta própria, em contas pessoais, sem regra e sem treino. A empresa paga por ferramentas que captura pela metade, acumula risco de dados sem perceber e adia a organização porque a rotina não deixa. Quanto mais tarde, mais caro.',

    escadaEyebrow: 'A oferta',
    escadaTitulo: 'Um método, três profundidades',
    escadaIntro:
      'A palestra abre a porta. O treinamento instala a base. O programa continuado faz a cultura sobreviver ao evento. Cada degrau resolve um nível de compromisso e prepara o seguinte.',
    degraus: [
      {
        n: '01',
        tag: 'Porta de entrada',
        nome: 'Palestra',
        duracao: '60 a 90 minutos',
        texto:
          'A tese — IA sem método é risco pagando aluguel —, o caso real de implantação e uma demonstração ao vivo: um protótipo funcional construído em minutos, em linguagem natural, a partir de uma dor da plateia. Fecha com o checklist executivo do que fazer na segunda-feira de manhã.',
        quem: 'Convenções, kickoffs e encontros de liderança.',
        entrega: 'Urgência qualificada e vocabulário comum na liderança.',
      },
      {
        n: '02',
        tag: 'Produto principal',
        nome: 'Treinamento in-company',
        duracao: 'Meio dia ou dia inteiro',
        texto:
          'Diagnóstico do uso real da empresa, panorama de ferramentas, método de prompt, contexto de negócio, segurança de dados com a construção da primeira política "pode / não pode", vibe coding e workshop com casos das próprias áreas.',
        quem: 'Turmas de 15 a 40 líderes da mesma empresa.',
        entrega: 'Líderes nivelados, um caso começado por área, política inicial de segurança e relatório de continuidade.',
      },
      {
        n: '03',
        tag: 'Continuidade',
        nome: 'Programa de implantação',
        duracao: 'Acompanhamento mensal',
        texto:
          'Apoio na constituição das frentes permanentes, definição de governança com jurídico e TI, cadência mensal de acompanhamento e revisão a cada 90 dias. Ciclo inicial de três meses, renovável.',
        quem: 'Empresas que querem que a cultura sobreviva ao evento.',
        entrega: 'Estrutura funcionando sem depender do consultor — o programa se desenha para ser dispensável.',
      },
    ],
    degrauQuem: 'Para quem',
    degrauEntrega: 'Resultado',

    metodoEyebrow: 'O método',
    metodoTitulo: 'O mesmo ativo nos três degraus',
    metodoIntro:
      'Não é curso de ferramenta nem teoria de futurista. É o caminho que conduzi na prática, generalizado em quatro movimentos.',
    passos: [
      { nome: 'Diagnóstico', texto: 'Mapear o uso real que já existe, os riscos e os gargalos que valem o ataque.' },
      { nome: 'Nivelamento das lideranças', texto: 'Um evento comum de partida. Líderes multiplicam; comunicado não.' },
      {
        nome: 'Frentes permanentes',
        texto: 'Novos produtos, gargalos operacionais, apoio à decisão, engajamento e a frente guardiã: segurança de dados.',
      },
      {
        nome: 'Governança desde o início',
        texto: 'Regra clara do que pode e do que não pode. Nada vai a produção sem homologação de segurança.',
      },
    ],

    segEyebrow: 'Módulo inegociável',
    segTitulo: 'Segurança de dados desde o primeiro dia',
    segTexto:
      'Dado de cliente e informação sensível nunca em ferramenta não homologada. Conta corporativa, não pessoal. Revisão humana antes de publicar. Regra clara não trava o uso — dá segurança para usar sem medo, e protege a empresa de quem já usa sem regra.',

    recebeEyebrow: 'O que a empresa recebe',
    recebeTitulo: 'O treinamento não termina no aplauso',
    recebeItens: [
      'Diagnóstico de uso consolidado, anônimo',
      'Apostila digital dos módulos',
      'Kit inicial de prompts adaptado ao setor',
      'Modelo de política "pode / não pode" para validar com jurídico e TI',
      'Registro dos casos trabalhados no workshop',
      'Relatório pós-treinamento com recomendações de continuidade',
    ],

    porqueEyebrow: 'Por que funciona',
    porqueTitulo: 'Três razões, sem promessa vazia',
    porqueItens: [
      { t: 'Começa pelos líderes', d: 'São eles que multiplicam para os times. Cultura não se instala por comunicado.' },
      { t: 'Une produtividade e segurança', d: 'Regra clara não trava o uso: dá confiança para usar.' },
      {
        t: 'Testado em operação real',
        d: 'Método nascido na prática, adaptado ao setor e às ferramentas que a empresa já tem.',
      },
    ],

    naoEyebrow: 'Para não haver dúvida',
    naoTitulo: 'O que este programa não é',
    naoItens: [
      'Não é curso de ferramenta.',
      'Não é promessa de corte de custos.',
      'Não é substituição de julgamento profissional por IA.',
    ],
    naoFecho: 'É método de gestão para um uso que já está acontecendo.',

    conduzEyebrow: 'Quem conduz',
    conduzTitulo: 'Bruno Massa',
    conduzParagrafos: [
      'Executivo de marketing corporativo, autor e palestrante.',
      'Conduziu, na prática, a implantação de um programa de cultura de IA em um grupo do setor financeiro — incluindo a criação de mais de dez produtos digitais em produção, construídos sem programadores, com governança e segurança de dados desde o primeiro dia.',
      'O conteúdo vem dessa experiência real de operação, não de teoria.',
    ],

    ctaFinalTitulo: 'Leve o programa para a sua empresa.',
    ctaFinalTexto:
      'Me conte o formato, o porte da empresa e o momento do time. Eu respondo com a proposta.',
  },

  en: {
    metaDesc:
      'AI Culture for Companies: a talk, in-company training and an implementation programme to level up leadership on the safe, productive use of AI. Method, not hype.',
    selo: 'Talk and in-company training for leadership',
    h1: 'Your company already uses AI. The problem is how.',
    subtitulo:
      'AI adoption has already happened inside companies, with or without method. Without direction, it breeds waste and risk. With method, it becomes an operational edge. This programme levels your leadership and installs the foundations for safe, productive use of AI.',
    ctaPrincipal: 'Bring it to my company',
    ctaWhats: 'Message on WhatsApp',
    assuntoEmail: 'AI Culture for my company',
    whatsMsg: 'Hi Bruno. I want to bring the AI Culture programme to my company.',
    sobConsulta: 'Formats and pricing on request.',

    problemaEyebrow: 'The problem',
    problemaTitulo: 'Adoption already happened. The question is not whether, but how.',
    problemaTexto:
      'Teams use AI on their own, in personal accounts, with no rules and no training. The company pays for tools it captures halfway, quietly stacks data risk, and postpones getting organised because the routine never lets up. The later it starts, the more it costs.',

    escadaEyebrow: 'The offer',
    escadaTitulo: 'One method, three depths',
    escadaIntro:
      'The talk opens the door. The training installs the foundation. The ongoing programme makes the culture outlive the event. Each step resolves a level of commitment and sets up the next.',
    degraus: [
      {
        n: '01',
        tag: 'Entry point',
        nome: 'Talk',
        duracao: '60 to 90 minutes',
        texto:
          'The thesis — AI without method is risk paying rent —, the real implementation case and a live demo: a working prototype built in minutes, in plain language, from a pain raised by the audience. It closes with the executive checklist for Monday morning.',
        quem: 'Conventions, kickoffs and leadership gatherings.',
        entrega: 'Qualified urgency and a shared vocabulary across leadership.',
      },
      {
        n: '02',
        tag: 'Core product',
        nome: 'In-company training',
        duracao: 'Half or full day',
        texto:
          'Diagnosis of the company’s real usage, a tool landscape, a prompting method, business context, data security with the first "allowed / not allowed" policy drafted in the room, vibe coding and a workshop on the teams’ own cases.',
        quem: 'Groups of 15 to 40 leaders from the same company.',
        entrega: 'Leaders levelled, one case started per area, an initial security policy and a continuity report.',
      },
      {
        n: '03',
        tag: 'Continuity',
        nome: 'Implementation programme',
        duracao: 'Monthly support',
        texto:
          'Support in setting up the permanent fronts, governance defined with legal and IT, a monthly cadence and a review every 90 days. Initial cycle of three months, renewable.',
        quem: 'Companies that want the culture to outlive the event.',
        entrega: 'A structure that runs without the consultant — the programme is designed to make itself unnecessary.',
      },
    ],
    degrauQuem: 'For',
    degrauEntrega: 'Result',

    metodoEyebrow: 'The method',
    metodoTitulo: 'The same asset across all three steps',
    metodoIntro:
      'Not a tool course, not futurist theory. It is the path I ran in practice, generalised into four movements.',
    passos: [
      { nome: 'Diagnosis', texto: 'Map the real usage that already exists, the risks and the bottlenecks worth attacking.' },
      { nome: 'Levelling leadership', texto: 'A shared starting point. Leaders multiply; a memo does not.' },
      {
        nome: 'Permanent fronts',
        texto: 'New products, operational bottlenecks, decision support, engagement and the guardian front: data security.',
      },
      {
        nome: 'Governance from day one',
        texto: 'A clear rule of what is allowed and what is not. Nothing ships to production without a security sign-off.',
      },
    ],

    segEyebrow: 'Non-negotiable module',
    segTitulo: 'Data security from day one',
    segTexto:
      'Client data and sensitive information never in an unapproved tool. Corporate account, not personal. Human review before publishing. A clear rule does not block usage — it makes people safe to use it, and protects the company from whoever already uses it without rules.',

    recebeEyebrow: 'What the company gets',
    recebeTitulo: 'The training does not end with the applause',
    recebeItens: [
      'A consolidated, anonymous usage diagnosis',
      'A digital handbook of the modules',
      'An initial prompt kit adapted to the sector',
      'An "allowed / not allowed" policy template to validate with legal and IT',
      'A record of the cases worked in the workshop',
      'A post-training report with continuity recommendations',
    ],

    porqueEyebrow: 'Why it works',
    porqueTitulo: 'Three reasons, no empty promise',
    porqueItens: [
      { t: 'It starts with leaders', d: 'They are the ones who multiply it to the teams. Culture does not install by memo.' },
      { t: 'It pairs productivity and security', d: 'A clear rule does not block usage: it gives confidence to use it.' },
      {
        t: 'Tested in real operation',
        d: 'A method born in practice, adapted to the sector and to the tools the company already has.',
      },
    ],

    naoEyebrow: 'To be clear',
    naoTitulo: 'What this programme is not',
    naoItens: [
      'It is not a tool course.',
      'It is not a promise of cost cuts.',
      'It is not replacing professional judgement with AI.',
    ],
    naoFecho: 'It is a management method for a use that is already happening.',

    conduzEyebrow: 'Who leads it',
    conduzTitulo: 'Bruno Massa',
    conduzParagrafos: [
      'Corporate marketing executive, author and speaker.',
      'He ran, in practice, the rollout of an AI culture programme in a financial-sector group — including more than ten digital products shipped to production, built without programmers, with governance and data security from day one.',
      'The content comes from that real operating experience, not from theory.',
    ],

    ctaFinalTitulo: 'Bring the programme to your company.',
    ctaFinalTexto:
      'Tell me the format, the size of the company and where the team is. I reply with a proposal.',
  },
};
