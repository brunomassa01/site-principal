import type { Lang } from './index';

/**
 * Rótulos do hub "Conhecimento Compartilhado".
 * O conteúdo (fases, vídeos, referências, artigos) vem do banco já traduzido;
 * aqui ficam só os textos da interface.
 */

type Hub = {
  metaDesc: string;
  heroTag: string;
  h1Linha1: string;
  h1Linha2: string;
  intro: string;
  chipDisciplinas: string;
  chipVideos: string;
  chipReferencias: string;
  chipEmbarque: string;
  embarqueData: string;
  ariaGrafo: (p: number) => string;
  trajetoriaTag: string;
  trajetoriaTitulo: (n: number) => string;
  trajetoriaNota: (n: number) => string;
  status: Record<string, string>;
  painelDisciplinas: (n: number) => string;
  disciplinasVazio: string;
  painelSaidas: string;
  artigosVazio: string;
  ler: string;
  videosTag: string;
  videosTitulo: string;
  itens: (n: number) => string;
  videosVazio: string;
  fonte: Record<string, string>;
  refTag: string;
  refTitulo: string;
  refNota: string;
  refVazio: string;
  filtros: { f: string; label: string }[];
  tipo: Record<string, string>;
  abrir: string;
  rodape1: string;
  rodape2: string;
};

export const hub: Record<Lang, Hub> = {
  pt: {
    metaDesc: 'A jornada do MBA de Bruno Massa em IA para Negócios — aprender em voz alta: disciplinas, vídeos, referências e os artigos que escrevo a partir do que estudo.',
    heroTag: 'MBA 7IGETT · FIAP · IA para Negócios',
    h1Linha1: 'Conhecimento',
    h1Linha2: 'Compartilhado',
    intro: 'Meu aprendizado tratado como um sistema: cada disciplina é um nó, cada conexão é um tema, cada conteúdo é uma saída. O que entendo de verdade, eu escrevo — e publico.',
    chipDisciplinas: 'disciplinas',
    chipVideos: 'vídeos',
    chipReferencias: 'referências',
    chipEmbarque: 'embarque',
    embarqueData: 'jun/2026',
    ariaGrafo: (p) => `Constelação de disciplinas com progresso de ${p}%`,
    trajetoriaTag: 'Trajetória',
    trajetoriaTitulo: (n) => `${n} fases · 10 meses`,
    trajetoriaNota: (n) => `fase 0${n} em curso`,
    status: { 'em-curso': 'em curso', concluida: 'concluída', bloqueada: 'bloqueada', planejada: 'planejada' },
    painelDisciplinas: (n) => `Fase 0${n} · Disciplinas (nós do sistema)`,
    disciplinasVazio: 'Disciplinas em breve.',
    painelSaidas: 'Saídas · Conteúdos',
    artigosVazio: 'Nenhum artigo publicado ainda — em produção.',
    ler: 'ler ↗',
    videosTag: 'Vídeos',
    videosTitulo: 'Gravados na FIAP + curadoria',
    itens: (n) => (n === 1 ? 'item' : 'itens'),
    videosVazio: 'Os primeiros vídeos chegam em breve — gravo na FIAP e curo por aqui.',
    fonte: { fiap: 'gravado na FIAP', curadoria: 'curadoria', podcast: 'podcast', youtube: 'youtube' },
    refTag: 'Referências',
    refTitulo: 'O que me ajudou a entender',
    refNota: '🇬🇧 = leitura em inglês',
    refVazio: 'As referências (livros, artigos, filmes, vídeos) aparecem aqui conforme eu avanço.',
    filtros: [
      { f: 'todos', label: 'todos' },
      { f: 'livro', label: 'livros' },
      { f: 'artigo', label: 'artigos' },
      { f: 'filme', label: 'filmes' },
      { f: 'video', label: 'vídeos / ted' },
    ],
    tipo: { livro: 'livro', artigo: 'artigo', filme: 'filme', doc: 'doc', ted: 'ted', video: 'vídeo' },
    abrir: 'abrir ↗',
    rodape1: 'CURRÍCULO_VIVO · <b>BRUNO MASSA</b> · o tradutor do marketing',
    rodape2: 'material oficial FIAP = privado · este painel = o que tornei público',
  },

  en: {
    metaDesc: "Bruno Massa's MBA journey in AI for Business — learning out loud: courses, videos, references and the articles he writes from what he studies.",
    heroTag: 'MBA 7IGETT · FIAP · AI for Business',
    h1Linha1: 'Shared',
    h1Linha2: 'Knowledge',
    intro: 'My learning treated as a system: every course is a node, every connection is a theme, every piece of content is an output. What I truly understand, I write down — and publish.',
    chipDisciplinas: 'courses',
    chipVideos: 'videos',
    chipReferencias: 'references',
    chipEmbarque: 'started',
    embarqueData: 'Jun 2026',
    ariaGrafo: (p) => `Constellation of courses with ${p}% progress`,
    trajetoriaTag: 'Journey',
    trajetoriaTitulo: (n) => `${n} phases · 10 months`,
    trajetoriaNota: (n) => `phase 0${n} in progress`,
    status: { 'em-curso': 'in progress', concluida: 'completed', bloqueada: 'locked', planejada: 'planned' },
    painelDisciplinas: (n) => `Phase 0${n} · Courses (nodes of the system)`,
    disciplinasVazio: 'Courses coming soon.',
    painelSaidas: 'Outputs · Content',
    artigosVazio: 'No article published yet — in production.',
    ler: 'read ↗',
    videosTag: 'Videos',
    videosTitulo: 'Recorded at FIAP + curation',
    itens: (n) => (n === 1 ? 'item' : 'items'),
    videosVazio: 'The first videos arrive soon — I record at FIAP and curate here.',
    fonte: { fiap: 'recorded at FIAP', curadoria: 'curated', podcast: 'podcast', youtube: 'youtube' },
    refTag: 'References',
    refTitulo: 'What helped me understand',
    refNota: '🇧🇷 = reading in Portuguese',
    refVazio: 'References (books, articles, films, videos) show up here as I go.',
    filtros: [
      { f: 'todos', label: 'all' },
      { f: 'livro', label: 'books' },
      { f: 'artigo', label: 'articles' },
      { f: 'filme', label: 'films' },
      { f: 'video', label: 'videos / ted' },
    ],
    tipo: { livro: 'book', artigo: 'article', filme: 'film', doc: 'doc', ted: 'ted', video: 'video' },
    abrir: 'open ↗',
    rodape1: 'LIVING_RESUME · <b>BRUNO MASSA</b> · the translator of marketing',
    rodape2: 'official FIAP material = private · this panel = what I made public',
  },
};
