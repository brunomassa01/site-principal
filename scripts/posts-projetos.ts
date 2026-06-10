import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/db';
import { posts } from '../src/lib/db/schema';
import { mdToHtml } from '../src/lib/content/markdown';
import { sanitizeBody } from '../src/lib/content/sanitize';

// Um post de bastidores por projeto do site. Salvos como RASCUNHO p/ o Bruno revisar e publicar.
// Voz do Bruno + filtro humanizer. Discricao: sem numeros/dados da Quali; programa de IA na versao construtiva.
// Idempotente por slug. NAO mexe em capa_url (setada depois, no passo das imagens).

type P = { slug: string; titulo: string; resumo: string; tags: string[]; md: string };

const POSTS: P[] = [
  {
    slug: 'odiava-pedir-orcamento-construi-a-vetly',
    titulo: 'Eu odiava pedir orçamento. Então construí uma IA pra resolver isso',
    resumo: 'A Vetly nasceu de uma irritação minha com propostas de fornecedor. Em vez de reclamar mais uma vez, construí a solução.',
    tags: ['Vetly', 'IA aplicada', 'Produto', 'Bastidores'],
    md: `Tem um tipo de trabalho que eu sempre detestei: comparar orçamento de fornecedor.

Você pede três propostas para o mesmo serviço e recebe três coisas diferentes. Formato diferente, escopo diferente, condição diferente. Pra comparar de verdade, você reescreve tudo numa tabela na mão, item por item. Eu perdia horas nisso, e cada minuto me irritava.

Um dia cansei. Em vez de reclamar de novo, construí a solução.

## O que é a Vetly

A Vetly é um SaaS que lê propostas comerciais e faz o trabalho chato por você. Você joga as três propostas, ela normaliza tudo no mesmo padrão e usa IA para apontar onde estão as diferenças, os riscos e o que está fora do lugar. O que me tomava uma tarde, ela resolve em minutos.

## Por que isso importa pra além de mim

Eu poderia ter escrito um post sobre "como a IA vai transformar a área de compras". Em vez disso, construí uma ferramenta que uso no meu próprio dia a dia.

É a diferença que eu defendo o tempo todo. Tem muita gente falando de IA por ouvir dizer. Eu prefiro apontar para algo que está rodando. Quando alguém duvida que dá pra um profissional de marketing colocar IA em produção, é pra Vetly que eu mostro.

Não falo de IA por teoria. Falo porque construí, usei, e doeu menos na próxima vez que precisei comparar orçamento.`,
  },
  {
    slug: 'construi-um-editor-pra-formatar-meu-livro',
    titulo: 'Construí um editor de livros — e formatei o meu próprio nele',
    resumo: 'Formatar um livro para publicação é um inferno de detalhe. Em vez de pagar por uma ferramenta presa a um formato, construí a minha.',
    tags: ['Livretto', 'Produto', 'Publicação', 'Bastidores'],
    md: `Quem nunca formatou um livro não sabe o tamanho da chatice.

Escrever é a parte boa. O problema vem depois: margem, espaçamento, quebra de capítulo, sumário, o livro inteiro precisa ficar redondo pra publicação. As ferramentas que existem ou são caras, ou prendem o seu texto num formato só, do jeito delas.

Eu estava no meio do meu segundo livro quando decidi que não passaria por isso de novo do jeito difícil.

## O Livretto

Construí meu próprio editor pra escrever e formatar livros. Do jeito que eu queria trabalhar, sem depender de ferramenta de ninguém.

A prova de que funciona é a mais direta possível: formatei o Narrativa em KPI, meu segundo livro, dentro dele.

## A régua

Tem um critério que uso pra tudo hoje: produto que se usa vale mais do que produto que se mostra.

O Livretto não é um print bonito num post. É uma ferramenta que resolveu um problema real meu, e que vai resolver de novo no próximo livro. Quando você constrói pra usar, e não pra impressionar, a qualidade aparece sozinha.`,
  },
  {
    slug: 'do-prompt-ao-produto-11-produtos-com-ia',
    titulo: 'Do prompt ao produto: como uma área de marketing construiu 11 produtos com IA',
    resumo: 'Quase toda empresa quer "fazer IA". Sem método, isso vira curso avulso. Foi assim que montei um programa que virou produto de verdade.',
    tags: ['IA aplicada', 'Liderança', 'Vibe coding', 'Bastidores'],
    md: `Quase toda empresa hoje quer "fazer IA". Faz um workshop, anima a equipe por duas semanas, e depois tudo volta ao normal.

Eu já tinha visto esse filme. Quando me pediram pra colocar IA pra rodar na liderança, eu sabia que curso avulso não ia ficar de pé. Precisava ser cultura, não evento.

## O método antes da ferramenta

Montei um programa de verdade. Evento de nivelamento, pra todo mundo partir do mesmo ponto. Um comitê permanente, dividido em quatro frentes, pra manter o tema vivo depois que o entusiasmo inicial passa. E governança de LGPD como portão obrigatório: nada vai ao ar sem passar por ali.

Dois princípios sustentaram tudo, e eu repito até hoje. Prova, não promessa. Cultura, não curso avulso.

## A prova

O resultado mais concreto não foi um relatório bonito. Foi produto rodando.

O próprio time de marketing construiu onze produtos internos, com vibe coding, e colocou em produção. Sites, ferramentas de gestão, simuladores. Marketing construindo software de verdade, em uso.

É a base de uma palestra que estou montando: do prompt ao produto. Porque a história não é sobre a ferramenta. É sobre o que acontece quando você dá método pra uma equipe que antes só pedia as coisas prontas.

## O que isso diz sobre o seu trabalho

Minha tese de sempre: a IA não vai substituir o gestor de marketing. Vai expor quem nunca teve método.

Onze produtos não saem de um prompt sortudo. Saem de estrutura, governança e direção. A ferramenta é a mesma pra todo mundo. A diferença é o método de quem segura o leme.`,
  },
  {
    slug: 'aproove-um-dos-quatro-produtos',
    titulo: 'Aproove: um dos quatro produtos que lancei pra provar um ponto',
    resumo: 'Lancei quatro produtos digitais por fora da empresa. Não pra vender curso sobre eles — pra ter o direito de falar de IA.',
    tags: ['Aproove', 'Produto', 'IA aplicada', 'Bastidores'],
    md: `Tem gente que fala de IA. Eu prefiro ter construído.

Lancei quatro produtos digitais por fora do meu trabalho: Vetly, Livretto, Aproove e BBrain. Cada um nasceu da mesma teimosia — não falar de tecnologia por teoria, e sim por ter colocado algo de pé. O Aproove é um deles.

## Por que quatro

Porque um pode ser sorte. Quatro é método.

Construir produto te obriga a entender o problema de verdade, não só a superfície. Te coloca no lugar de quem decide, erra, corrige e entrega. É a diferença entre opinar sobre IA e ter a cicatriz de quem usou.

## O ponto

Não lanço produto pra virar guru de produto. Lanço porque cada um deles é uma prova a mais de que eu não falo do que não faço.

Quando alguém me pergunta se eu coloco a mão na massa, eu não respondo com discurso. Respondo com o que está no ar.`,
  },
  {
    slug: 'construir-ensina-o-que-curso-nao-ensina',
    titulo: 'Construir um produto ensina o que nenhum curso ensina',
    resumo: 'O BBrain é um dos meus produtos digitais. O que aprendi construindo vale mais do que aprendi em qualquer aula sobre o tema.',
    tags: ['BBrain', 'Produto', 'IA aplicada', 'Bastidores'],
    md: `Dá pra fazer dez cursos de IA e continuar sem saber nada de verdade.

Eu sei porque já fiz cursos. Eles te dão o vocabulário, o mapa, a teoria. Mas tem uma camada de entendimento que só chega de um jeito: construindo e quebrando a cara.

O BBrain é um dos quatro produtos digitais que lancei. Como os outros, ele me ensinou coisas que nenhuma aula ensinou.

## O que construir te obriga a aprender

Quando você constrói, não dá pra fingir que entendeu. O produto ou funciona, ou não funciona. Você decide o escopo, sente onde a ferramenta falha, refaz o que ficou ruim. Isso vira conhecimento que cola, porque doeu.

É a diferença entre saber explicar IA e saber usar IA. As duas têm valor. Mas só a segunda te dá autoridade pra liderar uma equipe que vai usar de verdade.

## Por que entra no meu portfólio

Não mostro o BBrain pra vender o BBrain. Mostro porque ele é parte da minha resposta quando perguntam se eu realmente construo.

Construo. Quatro vezes, no mínimo.`,
  },
  {
    slug: 'relacao-b2b-se-constroi-na-estrada',
    titulo: 'Relação B2B não se constrói no anúncio. Se constrói na estrada',
    resumo: 'Campanha online sustenta volume. Mas confiança de parceiro se ganha olho no olho. Por isso levei a marca pra rede de parceiros país afora.',
    tags: ['Eventos', 'B2B', 'Relacionamento', 'Bastidores'],
    md: `Tem uma armadilha no marketing B2B: achar que dá pra resolver tudo com campanha online.

Mídia paga traz volume, lead, escala. Mas tem uma coisa que ela não compra: confiança de parceiro. E no B2B, é a relação que sustenta o negócio.

Foi por isso que montei um roadshow nacional.

## O que é um roadshow, por dentro

Não é só viajar e dar palestra. É curadoria de pauta — o que aquele parceiro precisa ouvir. É roteiro, produção, kit e logística de cada praça. E é o follow-up depois, pra a conversa não morrer no dia seguinte ao evento.

Levei a marca pra rede de parceiros país afora, com a mesma mensagem em todo canto. Padronização não é burocracia. É o parceiro de São Paulo e o do Recife entendendo a mesma coisa sobre quem você é.

## A lição

Marketing não é só o que escala. Às vezes é pegar a estrada, apertar a mão e fazer a pessoa lembrar de você.

O digital me dá alcance. A presença me dá relação. Quem trabalha com B2B e troca uma coisa pela outra perde nas duas.`,
  },
  {
    slug: 'o-marketing-que-as-pessoas-lembram',
    titulo: 'O marketing que as pessoas lembram anos depois',
    resumo: 'Premiar quem performou com uma viagem é marketing de relacionamento no grau mais alto. E uma operação que não pode ter nenhuma ponta solta.',
    tags: ['Eventos', 'Incentivo', 'Relacionamento', 'Bastidores'],
    md: `A maioria das ações de marketing é esquecida em uma semana. Uma viagem de incentivo, não. Essa a pessoa lembra e conta por anos.

Premiar quem bateu meta com uma experiência de verdade é marketing de relacionamento no grau mais alto. Você não está comprando atenção. Está construindo memória.

## A parte que ninguém vê

Por trás de uma viagem dessas tem uma operação inteira. Roteiro, logística, hospedagem, experiência, do embarque ao pós-viagem. Grupos de cerca de cinquenta pessoas, em destinos como Dubai e Punta Cana. Uma ponta solta, e a memória boa vira história de problema.

Planejei e produzi essas viagens cuidando exatamente disso: pra que a experiência fosse impecável e a única coisa que sobrasse fosse a lembrança boa.

## Por que isso é marketing, e não turismo

Porque o objetivo nunca foi a viagem. Foi o que ela faz com a relação.

Quem volta de uma experiência dessas trabalha diferente, fala diferente da empresa, vende diferente. Marketing que vira memória é dos poucos que continuam rendendo muito depois que a campanha acabou.`,
  },
  {
    slug: 'vender-o-que-nao-se-compra-por-impulso',
    titulo: 'Como se vende um produto que ninguém compra por impulso',
    resumo: 'Home equity é ticket alto e decisão demorada — o oposto da compra por impulso. Performance aqui é um jogo de funil e paciência.',
    tags: ['Performance', 'B2C', 'Aquisição', 'Bastidores'],
    md: `Tem produto que se vende no impulso. E tem produto que a pessoa pensa por semanas antes de decidir. Home equity é do segundo tipo: ticket alto, garantia de imóvel, decisão de gente grande.

Performance pra esse tipo de produto é um jogo diferente. Não adianta gritar oferta. Tem que construir confiança ao longo de um funil que demora.

## O trabalho de verdade

Oferta clara, porque ninguém arrisca o imóvel por algo confuso. Criativo testado, pra entender o que fala com quem está nesse momento de vida. E leitura constante do funil, pra cortar rápido o que não virava contrato e dobrar no que virava.

Não é mágica. É método e disciplina, todo dia.

## A lição que vale pra qualquer produto

Performance não é só apertar botão de mídia. É entender o ciclo de decisão de quem compra.

Quando você respeita o tempo do cliente em vez de empurrar, o retorno aparece. Nesse caso, ficou na casa dos dois dígitos sobre o investimento. Mas o número é consequência. A causa foi tratar um produto de decisão longa como ele é, e não como um impulso.`,
  },
  {
    slug: 'em-performance-eficiencia-e-o-jogo',
    titulo: 'Em performance, eficiência é o nome do jogo',
    resumo: 'Crescer volume é fácil quando se queima dinheiro. O difícil é crescer sem deixar o custo de aquisição escapar.',
    tags: ['Performance', 'B2C', 'Eficiência', 'Bastidores'],
    md: `Qualquer um cresce volume queimando dinheiro. A graça é crescer sem deixar o custo escapar.

No crédito consignado, o jogo é esse: eficiência. Mais contrato, sim, mas com o custo de aquisição sob controle. Senão você comemora o volume no relatório e chora o resultado no fim do mês.

## Onde a eficiência mora

Em três coisas, todo dia. Segmentação fina, pra falar com quem tem chance real de converter, e não com todo mundo. Criativo direto, sem rodeio, porque atenção é cara. E otimização diária de mídia, cortando o que não rende antes que ele coma o orçamento.

Não tem segredo nem atalho. Tem rotina.

## A diferença entre volume e resultado

Volume é vaidade. Eficiência é negócio.

A campanha fechou com retorno de dois dígitos sobre o investimento e custo por lead bem controlado. Mas o ponto não é o número. É que dá pra crescer e ser eficiente ao mesmo tempo, desde que você leia a mídia pelo resultado, e não pela métrica que faz bonito no slide.`,
  },
];

let criados = 0, atualizados = 0;
for (const p of POSTS) {
  const common = {
    titulo: p.titulo,
    resumo: p.resumo,
    tags: p.tags,
    idioma: 'pt',
    bodyHtml: sanitizeBody(mdToHtml(p.md)),
    bodyJson: { markdown: p.md },
    situacao: 'rascunho',
  };
  const [ex] = await db.select().from(posts).where(eq(posts.slug, p.slug));
  if (ex) {
    // NAO toca em capa_url (setada no passo das imagens)
    await db.update(posts).set({ ...common, updatedAt: new Date() }).where(eq(posts.slug, p.slug));
    atualizados++;
    console.log('  ~', p.slug);
  } else {
    await db.insert(posts).values({ slug: p.slug, data: new Date('2026-06-10'), publicarEm: null, capaUrl: null, ...common });
    criados++;
    console.log('  +', p.slug);
  }
}
console.log(`\nPosts de projeto: ${criados} criados, ${atualizados} atualizados (todos RASCUNHO).`);
process.exit(0);
