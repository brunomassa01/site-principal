import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/db';
import { posts } from '../src/lib/db/schema';
import { mdToHtml } from '../src/lib/content/markdown';
import { sanitizeBody } from '../src/lib/content/sanitize';

// Post de bastidores: a construcao do proprio site/CMS vira conteudo.
// Salvo como RASCUNHO para o Bruno revisar e publicar. Idempotente por slug.

const slug = 'por-que-construi-o-meu-proprio-cms';
const titulo = 'Por que construí o meu próprio CMS (em vez de usar um pronto)';
const resumo = 'Para trocar uma frase no meu site, eu esperava quinze minutos. Aí construí outro. O conceito de um currículo vivo, os perrengues de construir com IA e o que ainda vem pela frente.';

const md = `Para trocar uma frase no meu site, eu levava quinze minutos.

Editar o arquivo, subir a alteração, esperar a publicação, torcer pra nada quebrar. Tudo isso pra mudar uma palavra. Um dia parei no meio desse processo e me toquei de uma incoerência: eu escrevo que a IA mudou a forma de construir, que dá pra sair do prompt e chegar no produto. Mas o meu próprio site dependia de um fluxo de programador pra trocar uma vírgula.

Então construí outro. Este aqui que você está lendo.

## A ideia: um currículo que está vivo

Currículo é documento morto. Você escreve, congela num PDF e ele já nasce desatualizado. Eu não queria isso. Queria um lugar onde adiciono uma experiência, publico um projeto ou corrijo um texto e está no ar em segundos, sem ninguém no meio do caminho.

Um "WordPress pessoal", só que meu. Do jeito que eu preciso, sem depender da ferramenta de ninguém.

E tinha um motivo a mais, talvez o principal. Eu falo de IA aplicada e de construir produto o tempo todo. Se o meu site não fosse prova disso, seria só mais uma promessa. E promessa eu já vi demais.

## Os desafios

Quando você abre o capô é que a coisa fica interessante.

**Construir ou comprar.** Existem ferramentas prontas de sobra. Escolhi construir do zero, e não por teimosia: por controle. Quando o sistema é seu, você não fica refém do roadmap de ninguém, e cada decisão vira aprendizado que eu levo pra mesa no dia seguinte.

**Editar tem que ser instantâneo.** Coloquei um banco de dados de verdade por trás de tudo. Mudou, apareceu. Parece detalhe técnico, mas é o que separa uma ferramenta que você usa de uma que você evita. Inclusive eu.

**Eu não escrevo em código.** Exigi um editor visual de verdade, com barra de formatação e imagem que entra arrastando, não colando link. Se publicar é chato, ninguém publica.

**A parte que mais me orgulha.** O sistema se monta sozinho. Em vez de programar cada tela na mão, descrevo cada seção numa única lista de campos e o painel inteiro se constrói a partir dali. Na prática: o que levaria um dia pra adicionar agora leva minutos. É isso que vai deixar esse sistema replicável, e um dia, vendável.

E teve um momento que resume a tese inteira que eu defendo. Na hora de reescrever o conteúdo, a IA fez um trabalho rápido e bem-feito. Mas ela quer te deixar impressionante: puxa todo número, todo resultado, tudo que brilha. Parte do meu trabalho foi cortar. O que não se publica, por discrição ou por respeito a quem confiou em você, a IA não tem como saber. Ela escreve. Decidir o que fica de fora é método. E método é humano.

## O que vem por aí

Isso aqui é o começo. O plano já está desenhado:

- Uma biblioteca de mídia, pra subir um arquivo uma vez e reusar em todo lugar.
- Um editor de páginas em blocos, pra montar a home como quem encaixa peças, sem tocar em código.
- Tema editável: trocar cor, fonte e logo sem abrir um arquivo sequer.
- E a parte que mais me anima: ligar IA nos lugares certos. Um painel de acessos que não só mostra o que aconteceu, mas sugere o que escrever. E um estúdio que pega um conteúdo qualquer (um post, um projeto, a própria evolução deste site) e devolve as peças prontas pra LinkedIn e Instagram.

O pulo do gato é que a base já foi feita pra receber tudo isso. Cada recurso novo entra sem reconstruir o que já existe.

## O ponto

Eu não construí esse site porque sou programador. Não sou. Construí porque parei de aceitar "não dá" como resposta.

A ferramenta de hoje deixa um gestor de marketing colocar de pé o que ontem dependia de um time inteiro de tecnologia. Então a pergunta mudou. Não é mais se você consegue construir. É se você tem método pra usar isso direito.

Vou documentar cada passo dessa construção por aqui. Este foi o primeiro.`;

const values = {
  titulo,
  resumo,
  data: new Date('2026-06-10'),
  publicarEm: null,
  capaUrl: null,
  tags: ['IA aplicada', 'Produto', 'Bastidores', 'Vibe coding'],
  fonteExternaUrl: null,
  fonteExternaNome: null,
  idioma: 'pt',
  bodyHtml: sanitizeBody(mdToHtml(md)),
  bodyJson: { markdown: md },
  situacao: 'rascunho', // Bruno revisa e publica
};

const [ex] = await db.select().from(posts).where(eq(posts.slug, slug));
if (ex) {
  await db.update(posts).set({ ...values, updatedAt: new Date() }).where(eq(posts.slug, slug));
  console.log('Post ATUALIZADO (rascunho):', slug);
} else {
  await db.insert(posts).values({ slug, ...values });
  console.log('Post CRIADO (rascunho):', slug);
}
process.exit(0);
