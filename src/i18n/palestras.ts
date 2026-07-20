import type { Lang } from './index';

/**
 * Conteúdo da página de palestras.
 *
 * Fica fora de `ui.ts` porque são listas estruturadas (temas, formatos) e
 * texto de posicionamento, não rótulo de interface. As teses são as frases de
 * efeito do Bruno: a versão em inglês preserva o soco, não a literalidade.
 */

type Tema = { tag: string; titulo: string; tese: string; leva: string; quem: string };
type Formato = { nome: string; desc: string };

type Pagina = {
  metaDesc: string;
  eyebrow: string;
  h1: string;
  subtitulo: string;
  ctaConvite: string;
  ctaLinkedin: string;
  assuntoEmail: string;
  cred: { valor: string; desc: string }[];
  temasEyebrow: string;
  temasTitulo: string;
  praQuem: string;
  temas: Tema[];
  formatosEyebrow: string;
  formatosTitulo: string;
  formatos: Formato[];
  formatosNota: string;
  inkEyebrow: string;
  inkTexto: string;
  inkCta: string;
  ctaFinalTitulo: string;
  ctaFinalTexto: string;
};

export const palestras: Record<Lang, Pagina> = {
  pt: {
    metaDesc: 'Palestras e treinamentos de Bruno Massa sobre marketing, narrativa e IA. Método pra quem lidera, sem hype.',
    eyebrow: 'Palestras e treinamentos',
    h1: 'O marketing explicado por dentro',
    subtitulo: 'Vinte anos operando marketing, dois livros publicados e uma obsessão: traduzir a área pra quem decide. Método no palco, sem hype.',
    ctaConvite: 'Convidar para um evento',
    ctaLinkedin: 'Chamar no LinkedIn ↗',
    assuntoEmail: 'Convite para palestra',
    cred: [
      { valor: '20 anos', desc: 'liderando marketing em saúde, construção, serviços e tecnologia' },
      { valor: '2 livros', desc: 'Narrativa em KPI e Marketing na Era da IA' },
      { valor: '1 método', desc: 'o INK, índice autoral pra medir narrativa de marca' },
      { valor: 'Selo7', desc: 'minha agência de marketing, onde o método roda na prática' },
    ],
    temasEyebrow: 'Temas',
    temasTitulo: 'Três conversas que eu levo pro palco',
    praQuem: 'Pra quem:',
    temas: [
      {
        tag: 'IA e gestão',
        titulo: 'Marketing na Era da IA',
        tese: 'IA não vai substituir o gestor de marketing. Vai expor quem nunca teve método.',
        leva: 'Como times reais estão usando IA no dia a dia, o que muda na operação e no orçamento, e por onde começar sem cair no teatro de inovação.',
        quem: 'Lideranças, times de marketing e eventos corporativos.',
      },
      {
        tag: 'Narrativa e medição',
        titulo: 'Narrativa em KPI',
        tese: 'Narrativa de marca é ativo de negócio. E ativo se mede.',
        leva: 'O método INK: Reconhecimento, Coerência e Permanência num índice único, o que a marca constrói antes do clique, e quanto custa a incoerência.',
        quem: 'Branding, comunicação, conselhos e diretoria.',
      },
      {
        tag: 'Estrutura e receita',
        titulo: 'Marketing que vira receita',
        tese: 'Se não vira receita, não é marketing, é decoração.',
        leva: 'Como estruturar a área pra responder por resultado: papel do marketing no organograma, indicadores que a diretoria respeita e a conversa certa com o financeiro.',
        quem: 'CEOs, CFOs e gestores de marketing.',
      },
    ],
    formatosEyebrow: 'Formatos',
    formatosTitulo: 'Do palco à sala do time',
    formatos: [
      { nome: 'Palestra', desc: '45 a 60 minutos, presencial ou online. Abertura de evento, convenção ou encontro de lideranças.' },
      { nome: 'Workshop', desc: 'Meio período, mão na massa. O time sai com o método aplicado ao próprio contexto.' },
      { nome: 'Treinamento in-company', desc: 'Programa sob medida pra dentro da empresa, no ritmo e na realidade do time.' },
    ],
    formatosNota: 'Conteúdo sempre adaptado ao contexto: setor, momento do time e o que o evento precisa provocar.',
    inkEyebrow: 'Instrumento do método',
    inkTexto: 'O índice do livro Narrativa em KPI, aberto pra qualquer marca usar. Três dimensões, um número, um diagnóstico. O público costuma sair da palestra direto pra ela.',
    inkCta: 'Calcular o INK →',
    ctaFinalTitulo: 'Quer levar um desses temas pro seu evento?',
    ctaFinalTexto: 'Me conta o formato, a data e quem estará na plateia. Eu respondo com a proposta.',
  },

  en: {
    metaDesc: 'Talks and training by Bruno Massa on marketing, narrative and AI. Method for people who lead, no hype.',
    eyebrow: 'Talks and training',
    h1: 'Marketing explained from the inside',
    subtitulo: 'Twenty years running marketing, two published books and one obsession: translating the field for the people who decide. Method on stage, no hype.',
    ctaConvite: 'Invite me to an event',
    ctaLinkedin: 'Message me on LinkedIn ↗',
    assuntoEmail: 'Speaking invitation',
    cred: [
      { valor: '20 years', desc: 'leading marketing in healthcare, construction, services and technology' },
      { valor: '2 books', desc: 'Narrativa em KPI and Marketing na Era da IA' },
      { valor: '1 method', desc: 'INK, an original index to measure brand narrative' },
      { valor: 'Selo7', desc: 'my marketing agency, where the method runs in practice' },
    ],
    temasEyebrow: 'Topics',
    temasTitulo: 'Three conversations I take to the stage',
    praQuem: 'For:',
    temas: [
      {
        tag: 'AI and management',
        titulo: 'Marketing in the AI era',
        tese: "AI won't replace the marketing manager. It will expose whoever never had a method.",
        leva: 'How real teams are using AI day to day, what changes in operations and budget, and where to start without falling into innovation theatre.',
        quem: 'Leadership, marketing teams and corporate events.',
      },
      {
        tag: 'Narrative and measurement',
        titulo: 'Narrative in KPI',
        tese: 'Brand narrative is a business asset. And assets get measured.',
        leva: 'The INK method: Recognition, Coherence and Permanence in a single index, what the brand builds before the click, and how much incoherence costs.',
        quem: 'Branding, communications, boards and executives.',
      },
      {
        tag: 'Structure and revenue',
        titulo: 'Marketing that turns into revenue',
        tese: "If it doesn't turn into revenue, it isn't marketing. It's decoration.",
        leva: 'How to structure the function so it answers for results: where marketing sits in the org chart, the indicators executives respect, and the right conversation with finance.',
        quem: 'CEOs, CFOs and marketing leaders.',
      },
    ],
    formatosEyebrow: 'Formats',
    formatosTitulo: "From the stage to the team's room",
    formatos: [
      { nome: 'Talk', desc: '45 to 60 minutes, in person or online. Event opening, convention or leadership gathering.' },
      { nome: 'Workshop', desc: 'Half a day, hands on. The team leaves with the method applied to their own context.' },
      { nome: 'In-company training', desc: 'A programme built for the company, at the pace and reality of the team.' },
    ],
    formatosNota: 'Content is always adapted to the context: sector, where the team is, and what the event needs to provoke.',
    inkEyebrow: 'Instrument of the method',
    inkTexto: 'The index from the book Narrativa em KPI, open for any brand to use. Three dimensions, one number, one diagnosis. Audiences tend to go straight to it after the talk.',
    inkCta: 'Calculate your INK →',
    ctaFinalTitulo: 'Want one of these topics at your event?',
    ctaFinalTexto: 'Tell me the format, the date and who will be in the audience. I reply with a proposal.',
  },
};
