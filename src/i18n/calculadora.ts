import type { Lang } from './index';

/**
 * Textos da Calculadora INK.
 *
 * Fica separado porque quem consome é um componente React (ilha), que não
 * enxerga `Astro.locals` — a página passa o idioma por propriedade.
 *
 * Os valores monetários seguem em REAL nos dois idiomas: o instrumento é
 * calibrado para o mercado brasileiro, e converter moeda mudaria o diagnóstico.
 */

export type TextosCalc = {
  titulo: string;
  subtitulo: string;
  autor: string;
  intro: string;
  compR: string; compRDesc: string;
  compC: string; compCDesc: string;
  compP: string; compPDesc: string;
  seuInk: string;
  formula: string;
  revelar: string;
  reguaTitulo: string;
  reguaAusente: string; reguaTransicao: string; reguaVirou: string; reguaPleno: string;
  estagio: string;
  estagios: { nome: string; diagnostico: string }[];
  diagBloqueado: string;
  mapaTitulo: string;
  mapaLegenda: string;
  radar: { r: string; c: string; p: string };
  baixarPdf: string;
  abrirDerivadas: string;
  cacLabel: string; cacHelp: string;
  investLabel: string; investHelp: string;
  cacNarrativo: string; cacNarrativoDesc: string; cacNarrativoFormula: string;
  friccao: string; friccaoDesc: string; friccaoFormula: string;
  derivadasNota: string;
  rodape1a: string; rodape1b: string; rodape2: string; politica: string;
  modalTitulo: string; modalSub: string;
  campoNome: string; campoNomePh: string;
  campoEmail: string; campoEmailPh: string;
  consentimento1: string; consentimentoLink: string; consentimento2: string;
  erroNome: string; erroEmail: string; erroConsent: string; erroEnvio: string;
  cancelar: string; verResultado: string; enviando: string; lgpd: string;
  pdf: {
    componentes: string; geradoEm: (d: string) => string;
    estagio: string; mapa: string; derivados: string;
    cacInformado: (v: string) => string; investInformado: (v: string) => string;
    rodape1: string; rodape2: string; arquivo: string;
  };
};

export const calc: Record<Lang, TextosCalc> = {
  pt: {
    titulo: 'Calculadora INK',
    subtitulo: 'Índice de Narrativa em KPI',
    autor: 'Bruno Massa  |  Narrativa em KPI',
    intro: 'Estime os três componentes da narrativa da sua empresa em escala de zero a cem. O INK é a média simples dos três, na mesma escala. Não precisa ser preciso. Precisa ser honesto.',
    compR: 'Reconhecimento prévio',
    compRDesc: '% de novos clientes que chegam à empresa já reconhecendo a marca',
    compC: 'Coerência percebida',
    compCDesc: '% de clientes que descrevem a empresa de forma convergente em pesquisa',
    compP: 'Permanência espontânea',
    compPDesc: '% de retenção orgânica, sem programa de fidelidade pesado',
    seuInk: 'Seu INK',
    formula: 'INK = ( R + C + P ) ÷ 3',
    revelar: 'REVELAR MEU RESULTADO →',
    reguaTitulo: 'A Régua do INK',
    reguaAusente: 'AUSENTE',
    reguaTransicao: 'TRANSIÇÃO',
    reguaVirou: 'VIROU ATIVO',
    reguaPleno: 'PLENO',
    estagio: 'Estágio',
    estagios: [
      {
        nome: 'NARRATIVA AUSENTE',
        diagnostico: 'A empresa opera por sentimento. Marketing decorativo, central de pedidos no lugar de marketing estratégico. Estágio em que a maioria absoluta das empresas brasileiras de pequeno e médio porte se encontra. Reconhecimento honesto deste estágio é o ponto de partida do trabalho.',
      },
      {
        nome: 'EM TRANSIÇÃO',
        diagnostico: 'Há eixo identificado, esforço de articulação em curso, mas a narrativa ainda não atravessou todos os pontos de contato da operação. É o estágio em que a maioria das empresas para por exaustão, antes que o esforço dê retorno visível. O trabalho aqui é sustentar a articulação por mais tempo.',
      },
      {
        nome: 'VIROU ATIVO',
        diagnostico: 'Os primeiros frutos visíveis aparecem aqui. Ciclo de venda mais curto, retenção mais alta, indicações espontâneas começando a chegar com regularidade. CAC Narrativo já baixo, indicadores tradicionais melhorando como consequência. A virada aconteceu.',
      },
      {
        nome: 'ATIVO PLENO',
        diagnostico: 'Marca opera com sistema próprio. Talento certo, parceiro certo e cliente certo chegam por reconhecimento, ficam por valor, indicam por convicção. A empresa atravessa férias da liderança, transições de gestão, mudanças de mercado, sem perder coerência. Patrimônio narrativo de longo prazo.',
      },
    ],
    diagBloqueado: 'Diagnóstico completo do seu estágio narrativo disponível após o cadastro acima.',
    mapaTitulo: 'Mapa da Narrativa',
    mapaLegenda: 'Quanto mais amplo e equilibrado o triângulo, mais a narrativa sustenta a operação.',
    radar: { r: 'Reconhecimento', c: 'Coerência', p: 'Permanência' },
    baixarPdf: '↓ BAIXAR DIAGNÓSTICO EM PDF',
    abrirDerivadas: 'Calcular CAC Narrativo e Custo de Fricção',
    cacLabel: 'CAC efetivo (R$)',
    cacHelp: 'custo médio para conquistar um novo cliente',
    investLabel: 'Investimento total (R$)',
    investHelp: 'verba mensal de aquisição (mídia + comercial)',
    cacNarrativo: 'CAC Narrativo',
    cacNarrativoDesc: 'parcela do CAC paga para compensar coerência ausente',
    cacNarrativoFormula: 'CAC × ( 1 − INK ÷ 100 )',
    friccao: 'Custo de Fricção',
    friccaoDesc: 'verba gasta para tapar buraco de coerência',
    friccaoFormula: 'Investimento × ( 1 − INK ÷ 100 )',
    derivadasNota: 'Quanto maior o INK, menor o CAC Narrativo e o Custo de Fricção. Subir o INK em vinte pontos significa, para essa operação, reduzir o CAC Narrativo e o Custo de Fricção em proporção direta. Esse é o ganho realocável que sustenta o investimento em articulação narrativa.',
    rodape1a: 'Instrumento autoral do livro',
    rodape1b: ', de Bruno Massa',
    rodape2: 'Marketing, coerência e o ativo invisível que sustenta empresas duradouras',
    politica: 'Política de Privacidade',
    modalTitulo: 'Quase lá.',
    modalSub: 'Preencha para revelar seu diagnóstico completo.',
    campoNome: 'Nome',
    campoNomePh: 'Seu nome',
    campoEmail: 'E-mail',
    campoEmailPh: 'seu@email.com',
    consentimento1: 'Concordo em receber comunicações sobre Narrativa em KPI e li a ',
    consentimentoLink: 'Política de Privacidade',
    consentimento2: '.',
    erroNome: 'Por favor, informe seu nome.',
    erroEmail: 'Por favor, informe um e-mail válido.',
    erroConsent: 'É necessário concordar com a Política de Privacidade.',
    erroEnvio: 'Houve um erro ao enviar. Tente novamente em instantes.',
    cancelar: 'Cancelar',
    verResultado: 'Ver resultado',
    enviando: 'Enviando...',
    lgpd: 'Seus dados são tratados conforme a LGPD. Não compartilhamos com terceiros.',
    pdf: {
      componentes: 'OS TRÊS COMPONENTES',
      geradoEm: (d) => `Diagnóstico gerado em ${d}`,
      estagio: 'ESTÁGIO',
      mapa: 'MAPA DA NARRATIVA',
      derivados: 'INDICADORES DERIVADOS',
      cacInformado: (v) => `CAC efetivo informado: ${v}`,
      investInformado: (v) => `Investimento total informado: ${v}`,
      rodape1: 'Instrumento autoral do livro "Narrativa em KPI", de Bruno Massa.',
      rodape2: 'brunomassa.online/calculadora',
      arquivo: 'Diagnostico-INK',
    },
  },

  en: {
    titulo: 'INK Calculator',
    subtitulo: 'Narrative in KPI Index',
    autor: 'Bruno Massa  |  Narrativa em KPI',
    intro: 'Estimate the three components of your company’s narrative on a scale of zero to one hundred. INK is the simple average of the three, on the same scale. It does not need to be precise. It needs to be honest.',
    compR: 'Prior recognition',
    compRDesc: '% of new customers who arrive already recognising the brand',
    compC: 'Perceived coherence',
    compCDesc: '% of customers who describe the company in converging terms in research',
    compP: 'Spontaneous permanence',
    compPDesc: '% of organic retention, with no heavy loyalty programme',
    seuInk: 'Your INK',
    formula: 'INK = ( R + C + P ) ÷ 3',
    revelar: 'REVEAL MY RESULT →',
    reguaTitulo: 'The INK Scale',
    reguaAusente: 'ABSENT',
    reguaTransicao: 'IN TRANSITION',
    reguaVirou: 'BECAME AN ASSET',
    reguaPleno: 'FULL ASSET',
    estagio: 'Stage',
    estagios: [
      {
        nome: 'NARRATIVE ABSENT',
        diagnostico: 'The company operates on gut feeling. Decorative marketing, an order desk in place of strategic marketing. This is the stage where the vast majority of small and mid-sized companies sit. Honestly recognising this stage is where the work starts.',
      },
      {
        nome: 'IN TRANSITION',
        diagnostico: 'There is an identified axis and articulation work under way, but the narrative has not yet crossed every touchpoint of the operation. This is the stage where most companies stop out of exhaustion, right before the effort shows visible return. The work here is to sustain the articulation for longer.',
      },
      {
        nome: 'BECAME AN ASSET',
        diagnostico: 'The first visible results appear here. Shorter sales cycle, higher retention, spontaneous referrals starting to arrive regularly. Narrative CAC already low, traditional indicators improving as a consequence. The turn has happened.',
      },
      {
        nome: 'FULL ASSET',
        diagnostico: 'The brand runs on a system of its own. The right talent, the right partner and the right client arrive through recognition, stay for value, and refer out of conviction. The company survives leadership holidays, management transitions and market shifts without losing coherence. Long-term narrative equity.',
      },
    ],
    diagBloqueado: 'The full diagnosis of your narrative stage is available after the form above.',
    mapaTitulo: 'Narrative Map',
    mapaLegenda: 'The wider and more balanced the triangle, the more the narrative sustains the operation.',
    radar: { r: 'Recognition', c: 'Coherence', p: 'Permanence' },
    baixarPdf: '↓ DOWNLOAD DIAGNOSIS AS PDF',
    abrirDerivadas: 'Calculate Narrative CAC and Friction Cost',
    cacLabel: 'Effective CAC (BRL)',
    cacHelp: 'average cost to win a new customer',
    investLabel: 'Total investment (BRL)',
    investHelp: 'monthly acquisition budget (media + sales)',
    cacNarrativo: 'Narrative CAC',
    cacNarrativoDesc: 'the share of CAC paid to compensate for missing coherence',
    cacNarrativoFormula: 'CAC × ( 1 − INK ÷ 100 )',
    friccao: 'Friction Cost',
    friccaoDesc: 'budget spent patching a hole in coherence',
    friccaoFormula: 'Investment × ( 1 − INK ÷ 100 )',
    derivadasNota: 'The higher the INK, the lower the Narrative CAC and the Friction Cost. Raising INK by twenty points means, for this operation, cutting Narrative CAC and Friction Cost in direct proportion. That is the reallocatable gain that pays for investing in narrative articulation.',
    rodape1a: 'An original instrument from the book',
    rodape1b: ', by Bruno Massa',
    rodape2: 'Marketing, coherence and the invisible asset that sustains lasting companies',
    politica: 'Privacy Policy',
    modalTitulo: 'Almost there.',
    modalSub: 'Fill this in to reveal your full diagnosis.',
    campoNome: 'Name',
    campoNomePh: 'Your name',
    campoEmail: 'Email',
    campoEmailPh: 'you@email.com',
    consentimento1: 'I agree to receive communications about Narrativa em KPI and I have read the ',
    consentimentoLink: 'Privacy Policy',
    consentimento2: '.',
    erroNome: 'Please enter your name.',
    erroEmail: 'Please enter a valid email address.',
    erroConsent: 'You need to agree with the Privacy Policy.',
    erroEnvio: 'Something went wrong. Please try again in a moment.',
    cancelar: 'Cancel',
    verResultado: 'See result',
    enviando: 'Sending...',
    lgpd: 'Your data is handled under the Brazilian LGPD. We do not share it with third parties.',
    pdf: {
      componentes: 'THE THREE COMPONENTS',
      geradoEm: (d) => `Diagnosis generated on ${d}`,
      estagio: 'STAGE',
      mapa: 'NARRATIVE MAP',
      derivados: 'DERIVED INDICATORS',
      cacInformado: (v) => `Effective CAC entered: ${v}`,
      investInformado: (v) => `Total investment entered: ${v}`,
      rodape1: 'An original instrument from the book "Narrativa em KPI", by Bruno Massa.',
      rodape2: 'brunomassa.online/en/calculadora',
      arquivo: 'INK-Diagnosis',
    },
  },
};
