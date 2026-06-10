import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/db';
import { timeline, projetos, skills, agora, identidade } from '../src/lib/db/schema';
import { mdToHtml } from '../src/lib/content/markdown';

// Conteudo v2 — reescrito a partir do CV 2026 + persona (voz do Bruno, filtro humanizer).
// REGRA: nenhum numero/resultado confidencial do empregador atual (Quali). "A historia se conta, o numero nao."
// Idempotente: upsert por slug nas colecoes; update nos singletons; arquiva o que saiu do CV.
// OBS: comentarios em ASCII; o CONTEUDO em portugues correto (UTF-8).

const D = (s: string | null) => (s ? new Date(s) : null);
const body = (md: string) => ({ bodyHtml: mdToHtml(md), bodyJson: { markdown: md } });

async function upsertBySlug(table: any, slug: string, values: Record<string, unknown>) {
  const [ex] = await db.select().from(table).where(eq(table.slug, slug));
  if (ex) {
    await db.update(table).set({ ...values, updatedAt: new Date() }).where(eq(table.slug, slug));
    console.log('  ~', slug);
  } else {
    await db.insert(table).values({ slug, ...values });
    console.log('  +', slug);
  }
}

async function arquivar(table: any, slug: string) {
  const [ex] = await db.select().from(table).where(eq(table.slug, slug));
  if (ex) {
    await db.update(table).set({ situacao: 'arquivado', updatedAt: new Date() }).where(eq(table.slug, slug));
    console.log('  arquivado', slug);
  }
}

// ====================== IDENTIDADE ======================
async function migrarIdentidade() {
  console.log('IDENTIDADE');
  const values = {
    nome: 'Bruno Massa',
    tagline: 'Estratégia, conteúdo e IA aplicada ao negócio',
    slogan: 'Se não vira receita, não é marketing, é decoração.',
    bioCurta: 'Vinte anos traduzindo marketing para quem decide. Autor de dois livros, construo produtos com IA. Este site é meu currículo vivo — em movimento, não em PDF.',
    descricaoMeta: 'Bruno Massa — gerente de marketing há 20 anos e autor de dois livros sobre marketing e IA. Estratégia, conteúdo e IA aplicada ao negócio.',
    email: 'brunobrm@gmail.com',
    linkedinUrl: 'https://linkedin.com/in/brunormassa',
  };
  const [ex] = await db.select().from(identidade).where(eq(identidade.id, 'identidade'));
  if (ex) await db.update(identidade).set({ ...values, updatedAt: new Date() }).where(eq(identidade.id, 'identidade'));
  else await db.insert(identidade).values({ id: 'identidade', ...values });
  console.log('  ok');
}

// ====================== TRAJETORIA ======================
async function migrarTimeline() {
  console.log('TIMELINE');

  await upsertBySlug(timeline, 'gerente-de-marketing-grupo-quali', {
    cargo: 'Gerente de Marketing', empresa: 'Grupo Quali', empresaUrl: 'https://www.qualiconsig.com.br',
    inicio: D('2025-04-01'), fim: null, local: 'São Paulo', tipo: 'clt', destaque: true, situacao: 'publicado',
    resumo: 'Lidero o marketing de ponta a ponta da holding e das marcas do grupo, no crédito consignado B2B e B2C: estratégia, branding, conteúdo, performance, eventos e endomarketing.',
    destaques: [
      'Estruturei o time do zero — papéis, rotinas e governança de demandas no Monday.com, com priorização, SLAs e cadência semanal.',
      'Desenhei o programa de adoção de IA para a liderança do grupo (cerca de 40 líderes): comitê em quatro frentes e governança LGPD como portão obrigatório de publicação.',
      'Construí com o time, usando vibe coding, 11 produtos internos em produção — sites, CMS, DAM de marketing, simuladores de negócio e ferramentas de gestão.',
      'Conduzi a transição e a padronização da marca B2B junto a parceiros, com campanhas de aquisição que entregaram retorno de dois dígitos sobre o investimento.',
      'Planejei e produzi o roadshow nacional B2B e viagens de incentivo internacionais (Dubai, Punta Cana) para grupos de cerca de 50 pessoas.',
    ],
    tags: ['Liderança', 'Estratégia', 'IA aplicada', 'B2B', 'B2C', 'Performance'],
    ...body(`No Grupo Quali eu cuido do marketing inteiro — da holding e das duas marcas, em dois mercados que funcionam de formas bem diferentes: o consignado B2B, que vive de relação com parceiro, e o B2C, que vive de performance.

Quando cheguei, o marketing era execução solta. Estruturei como função estratégica: time com papéis claros, demanda governada no Monday.com, cadência semanal. Foi onde montei um dos melhores times da minha carreira.

A camada de IA veio depois. Desenhei um programa para colocar a liderança do grupo para usar IA com método, não com hype: comitê em quatro frentes e LGPD como portão de publicação. Dois princípios sustentam tudo — prova, não promessa; cultura, não curso avulso. Em paralelo, o time construiu 11 produtos internos que rodam em produção hoje, feitos com vibe coding.`),
  });

  await upsertBySlug(timeline, 'coordenador-de-marketing-seconci-sp', {
    cargo: 'Coordenador de Marketing', empresa: 'Seconci-SP', empresaUrl: 'https://www.seconci.org.br',
    inicio: D('2023-01-01'), fim: D('2025-03-01'), local: 'São Paulo', tipo: 'clt', destaque: false, situacao: 'publicado',
    resumo: 'Comunicação institucional, campanhas digitais e eventos corporativos com captação de patrocínio, numa entidade do setor de saúde da construção civil.',
    destaques: [
      'Comunicação institucional e campanhas digitais da entidade.',
      'Eventos corporativos com captação de patrocínio.',
      'Gestão do orçamento da área com otimização de custos.',
      'Estratégias de growth que elevaram a conversão de leads.',
    ],
    tags: ['Comunicação', 'Eventos', 'Growth', 'Patrocínio'],
    ...body(`No Seconci cuidei da comunicação institucional e das campanhas digitais de uma entidade do setor de saúde da construção civil.

A parte que mais gostei foi a de eventos com captação de patrocínio — onde o marketing precisa se pagar. E a de growth, onde dado vira conversão. Dois lados da mesma moeda que persigo desde sempre: marketing que sustenta o próprio custo.`),
  });

  await upsertBySlug(timeline, 'consultor-de-marketing-selo7', {
    cargo: 'Consultor de Marketing', empresa: 'Selo7 Consultoria', empresaUrl: null,
    inicio: D('2020-01-01'), fim: null, local: 'Remoto', tipo: 'pj', destaque: false, situacao: 'publicado',
    resumo: 'Estratégia, posicionamento e gestão de marketing para pequenas e médias empresas: diagnóstico, plano de ação, conteúdo e automação.',
    destaques: [
      'Diagnóstico, posicionamento e plano de ação para PMEs.',
      'Conteúdo e automação de marketing (parceiro Kommo CRM).',
      'Atuação contínua, em paralelo aos empregos — o laboratório onde testo o que escrevo.',
    ],
    tags: ['Consultoria', 'PME', 'CRM', 'Automação'],
    ...body(`A Selo7 é minha consultoria. Atende pequenas e médias empresas com a parte que elas mais erram: estratégia e posicionamento antes de sair gastando em anúncio.

E também é meu laboratório. É onde testo na prática o que escrevo nos livros e na newsletter — diagnóstico, plano de ação, conteúdo e automação, com um cliente real do outro lado.`),
  });

  await upsertBySlug(timeline, 'supervisor-de-negocios-digitais-sinduscon-sp', {
    cargo: 'Supervisor de Negócios Digitais', empresa: 'SindusCon-SP', empresaUrl: 'https://www.sindusconsp.com.br',
    inicio: D('2014-01-01'), fim: D('2020-12-01'), local: 'São Paulo', tipo: 'clt', destaque: true, situacao: 'publicado',
    resumo: 'Estruturei a área digital do sindicato. Quando a contribuição sindical compulsória acabou, transformei conteúdo e eventos em nova fonte de receita.',
    destaques: [
      'Estruturação da área digital do sindicato.',
      'Quando a contribuição compulsória acabou, conteúdo e eventos viraram receita.',
      'Coordenação de eventos do setor e comunicação digital.',
      'Negociação de parcerias estratégicas.',
    ],
    tags: ['Digital', 'Eventos', 'Receita', 'Pivot'],
    ...body(`Foi no SindusCon que aprendi na marra a tese que carrego até hoje: marketing ou vira receita, ou vira corte de custo.

A contribuição sindical compulsória acabou de um ano para o outro, e a entidade precisou aprender a ganhar dinheiro com o que antes chamava de "comunicação". Transformamos conteúdo e eventos em produto — plataforma de cursos, eventos pagos, conteúdo como ativo. Foi a primeira vez que vi, no resultado, que se não vira receita não é marketing.`),
  });

  await upsertBySlug(timeline, 'pesquisador-de-mercado-mcf', {
    cargo: 'Pesquisador de Mercado', empresa: 'MCF Consultoria', empresaUrl: null,
    inicio: D('2005-01-01'), fim: D('2011-01-01'), local: 'São Paulo', tipo: 'clt', destaque: false, situacao: 'publicado',
    resumo: 'Pesquisa de mercado e comportamento de consumo, com apresentação dos resultados em palestras e vídeos. O começo de tudo.',
    destaques: [
      'Pesquisa de mercado e comportamento de consumo.',
      'Apresentação dos resultados em palestras e vídeos.',
      'Foi aqui que aprendi o que faço até hoje: transformar dado em decisão.',
    ],
    tags: ['Pesquisa', 'Comportamento de consumo', 'Palestras', 'Origem'],
    ...body(`Comecei em 2005 fazendo pesquisa de mercado. Meu trabalho era entender por que as pessoas compram o que compram, e depois subir num palco e explicar isso para quem decide.

Descobri ali o que mais gosto de fazer, e que persigo até hoje: traduzir. Pegar o dado e transformar em decisão. Pegar o complexo e deixar claro. Vinte anos depois, é disso que ainda vivo.`),
  });

  // Saiu do CV reposicionado — arquiva (nao apaga; recuperavel no Painel)
  await arquivar(timeline, 'coordenador-de-marketing-astora');
  await arquivar(timeline, 'gerente-de-marketing-boucinhas-campos');
}

// ====================== PROJETOS ======================
async function migrarProjetos() {
  console.log('PROJETOS');

  await upsertBySlug(projetos, 'vetly', {
    titulo: 'Vetly', subtitulo: 'Análise de propostas comerciais com IA', status: 'em-andamento',
    inicio: D('2025-03-01'), fim: null, cliente: 'Produto próprio', papel: 'Criador',
    link: 'https://app.getvetly.com', repo: null, destaque: true, situacao: 'publicado',
    resumo: 'SaaS que lê propostas de fornecedores e mostra onde você está sendo enrolado. Construí porque eu odiava fazer isso na mão.',
    problema: 'Todo orçamento de fornecedor chega num formato diferente, e comparar três propostas de verdade dá um trabalho enorme. Eu perdia horas com isso, e detestava cada minuto.',
    abordagem: 'Em vez de reclamar, construí a solução. A Vetly recebe as propostas, normaliza tudo e usa IA para apontar diferenças, riscos e o que está fora do lugar.',
    resultado: 'Uso no meu dia a dia. É o melhor argumento que tenho quando digo que não falo de IA por ouvir dizer — falo porque coloco em produção.',
    tags: ['SaaS', 'IA', 'Produto próprio'],
    ...body(`A Vetly nasceu de uma irritação pessoal. Passei anos pedindo orçamento para fornecedor, e cada um chegava de um jeito: formato diferente, escopo diferente, condição diferente. Comparar de verdade dava um trabalho enorme.

Resolvi a dor construindo a solução. A Vetly lê as propostas, organiza tudo no mesmo padrão e usa IA para apontar onde estão as diferenças, os riscos e o que está fora do lugar.

Uso no meu dia a dia. Quando alguém duvida que eu coloco IA em produção, é para a Vetly que eu aponto.`),
  });

  await upsertBySlug(projetos, 'livretto', {
    titulo: 'Livretto', subtitulo: 'Editor e formatação de livros', status: 'em-andamento',
    inicio: D('2024-09-01'), fim: null, cliente: 'Produto próprio', papel: 'Criador',
    link: null, repo: null, destaque: true, situacao: 'publicado',
    resumo: 'Um editor para escrever e formatar livros. Construí a ferramenta, e formatei meu segundo livro nela.',
    problema: 'Formatar um livro para publicação é chato e cheio de detalhe. As ferramentas existentes ou são caras, ou travam o seu texto num formato só.',
    abordagem: 'Construí meu próprio editor, do jeito que eu queria escrever e formatar.',
    resultado: 'Formatei meu segundo livro, Narrativa em KPI, dentro dele. Prova de produto que se usa, não que se mostra.',
    tags: ['Produto próprio', 'Publicação', 'IA'],
    ...body(`O Livretto é um editor para escrever e formatar livros. Construí porque eu mesmo precisava de um, e não queria depender de ferramenta cara nem ficar preso a um formato único.

A melhor prova de que funciona: formatei meu segundo livro, Narrativa em KPI, dentro dele.`),
  });

  await upsertBySlug(projetos, 'programa-cultura-de-ia', {
    titulo: 'Programa de Cultura de IA', subtitulo: 'Adoção de IA na liderança de um grupo financeiro', status: 'concluido',
    inicio: D('2025-06-01'), fim: null, cliente: 'Grupo financeiro', papel: 'Desenho e liderança',
    link: null, repo: null, destaque: true, situacao: 'publicado',
    resumo: 'Desenhei e conduzi o programa que colocou a liderança de um grupo financeiro para usar IA com método — não com hype.',
    problema: 'A empresa queria "fazer IA", como todo mundo. Sem método, isso vira curso avulso e morre em duas semanas.',
    abordagem: 'Montei um programa de verdade: evento de nivelamento, comitê permanente em quatro frentes e governança LGPD como portão obrigatório de publicação. Dois princípios sustentam tudo — prova, não promessa; cultura, não curso avulso.',
    resultado: 'Onze produtos internos construídos pelo próprio marketing, com vibe coding, rodando em produção. A prova de que dá para sair do prompt e chegar no produto.',
    tags: ['IA aplicada', 'Liderança', 'Governança', 'LGPD'],
    ...body(`Quase toda empresa hoje quer "fazer IA". O problema é que, sem método, isso vira um curso avulso que anima a equipe por duas semanas e depois some.

Desenhei um programa para a liderança de um grupo financeiro tratar IA como cultura, não como evento: nivelamento, comitê permanente em quatro frentes e LGPD como portão obrigatório antes de qualquer coisa ir ao ar. Dois princípios guiaram tudo — prova, não promessa; cultura, não curso avulso.

O resultado mais concreto: onze produtos internos construídos pelo próprio time de marketing, com vibe coding, em produção. É a base da palestra que estou montando: do prompt ao produto.`),
  });

  await upsertBySlug(projetos, 'aproove', {
    titulo: 'Aproove', subtitulo: 'Produto digital', status: 'em-pausa',
    inicio: D('2024-03-01'), fim: null, cliente: 'Produto próprio', papel: 'Criador',
    link: null, repo: null, destaque: false, situacao: 'publicado',
    resumo: 'Um dos quatro produtos digitais que lancei fora da empresa.',
    problema: null, abordagem: null, resultado: null,
    tags: ['Produto próprio', 'IA'],
    ...body(`Aproove é um dos produtos digitais autorais que lancei fora da empresa. Faz parte do conjunto de quatro que uso como campo de prova das ideias que defendo sobre IA e produto.`),
  });

  await upsertBySlug(projetos, 'bbrain', {
    titulo: 'BBrain', subtitulo: 'Produto digital', status: 'em-pausa',
    inicio: D('2024-01-01'), fim: null, cliente: 'Produto próprio', papel: 'Criador',
    link: null, repo: null, destaque: false, situacao: 'publicado',
    resumo: 'Um dos quatro produtos digitais que lancei fora da empresa.',
    problema: null, abordagem: null, resultado: null,
    tags: ['Produto próprio', 'IA'],
    ...body(`BBrain é outro dos meus produtos digitais autorais. Cada um deles existe pelo mesmo motivo: não falar de IA por teoria, e sim por ter construído e colocado para rodar.`),
  });

  await upsertBySlug(projetos, 'roadshow-nacional-b2b', {
    titulo: 'Roadshow Nacional B2B', subtitulo: 'Programa presencial para a rede de parceiros', status: 'concluido',
    inicio: D('2025-05-01'), fim: D('2025-09-01'), cliente: 'Grupo Quali', papel: 'Planejamento e produção',
    link: null, repo: null, destaque: false, situacao: 'publicado',
    resumo: 'Roadshow nacional B2B para a rede de parceiros — curadoria de pauta, roteiro, produção, kits e acompanhamento pós-evento.',
    problema: 'Manter uma rede de parceiros B2B engajada exige presença, não só campanha online.',
    abordagem: 'Curadoria de pauta, roteiro, produção e kits, com follow-up estruturado depois de cada praça.',
    resultado: 'Relacionamento mais próximo com a rede e padronização da mensagem B2B em todo o país.',
    tags: ['Eventos', 'B2B', 'Relacionamento'],
    ...body(`Campanha online sustenta volume, mas relação B2B se constrói na presença. O roadshow levou a marca para a rede de parceiros país afora — com pauta curada, roteiro, produção e kits, e um follow-up estruturado depois de cada praça para a conversa não morrer no dia seguinte.`),
  });

  await upsertBySlug(projetos, 'viagens-de-incentivo-internacionais', {
    titulo: 'Viagens de Incentivo Internacionais', subtitulo: 'Eventos de incentivo para grupos de ~50 pessoas', status: 'concluido',
    inicio: D('2025-02-01'), fim: D('2025-11-01'), cliente: 'Grupo Quali', papel: 'Planejamento e produção',
    link: null, repo: null, destaque: false, situacao: 'publicado',
    resumo: 'Planejamento e produção de viagens de incentivo nacionais e internacionais (Dubai, Punta Cana) para grupos de cerca de 50 participantes.',
    problema: 'Premiar a performance da rede com uma experiência à altura, sem deixar nenhuma ponta solta na logística.',
    abordagem: 'Planejamento completo de roteiro, logística e experiência, do embarque ao pós-viagem.',
    resultado: 'Grupos de cerca de 50 pessoas em destinos como Dubai e Punta Cana, com operação redonda.',
    tags: ['Eventos', 'Incentivo', 'Produção'],
    ...body(`Viagem de incentivo é marketing de relacionamento no grau mais alto: você premia quem performou com uma experiência que ele vai lembrar e contar. Planejei e produzi essas viagens para grupos de cerca de 50 pessoas, em destinos como Dubai e Punta Cana, cuidando do roteiro à logística.`),
  });

  // Campanhas — mantidas como case, SEM numeros (regra de discricao)
  await upsertBySlug(projetos, 'campanha-home-equity', {
    titulo: 'Campanha de aquisição — Home Equity', subtitulo: 'Performance B2C', status: 'concluido',
    inicio: D('2025-07-01'), fim: D('2025-12-01'), cliente: 'Grupo Quali', papel: 'Liderança de marketing',
    link: null, repo: null, destaque: false, situacao: 'publicado',
    resumo: 'Campanha de aquisição para o produto de home equity, da oferta ao criativo ao acompanhamento de resultado.',
    problema: 'Gerar contratos qualificados para um produto de ticket alto e ciclo de decisão longo.',
    abordagem: 'Oferta clara, criativo testado e leitura constante de funil para cortar o que não convertia.',
    resultado: 'Retorno de dois dígitos sobre o investimento.',
    tags: ['Performance', 'B2C', 'Aquisição'],
    ...body(`Home equity é um produto de ticket alto e decisão demorada — o oposto de compra por impulso. A campanha foi um trabalho de funil: oferta clara, criativo testado e leitura constante do que convertia, para cortar rápido o que não trazia contrato. O retorno ficou na casa dos dois dígitos sobre o investimento.`),
  });

  await upsertBySlug(projetos, 'campanha-jan-2026', {
    titulo: 'Campanha de aquisição — Consignado', subtitulo: 'Performance B2C', status: 'concluido',
    inicio: D('2025-11-01'), fim: D('2026-01-01'), cliente: 'Grupo Quali', papel: 'Liderança de marketing',
    link: null, repo: null, destaque: false, situacao: 'publicado',
    resumo: 'Campanha de aquisição para o crédito consignado, com forte eficiência de mídia.',
    problema: 'Crescer o volume de contratos sem deixar o custo de aquisição fugir do controle.',
    abordagem: 'Segmentação fina, criativo direto e otimização diária de mídia.',
    resultado: 'Retorno de dois dígitos sobre o investimento, com custo por lead bem controlado.',
    tags: ['Performance', 'B2C', 'Aquisição'],
    ...body(`No consignado o jogo é eficiência: crescer contrato sem deixar o custo de aquisição escapar. A campanha juntou segmentação fina, criativo direto e otimização diária de mídia, e fechou com retorno de dois dígitos sobre o investimento.`),
  });
}

// ====================== SKILLS / FORMACAO ======================
async function migrarSkills() {
  console.log('SKILLS');

  const items: Array<{ slug: string; v: Record<string, unknown> }> = [
    // ---- Formacao ----
    { slug: 'mba-ia-para-negocios-fiap', v: {
      nome: 'MBA em IA para Negócios', categoria: 'formacao', area: 'IA e Estratégia', nivel: null,
      instituicao: 'FIAP', instituicaoUrl: 'https://www.fiap.com.br', ano: 2026, destaque: true,
      descricao: 'Gestão Estratégica e Liderança, em andamento. Cada disciplina vira pauta de conteúdo.',
    }},
    { slug: 'mba-digital-business-fiap', v: {
      nome: 'MBA em Digital Business', categoria: 'formacao', area: 'Marketing e Negócios', nivel: null,
      instituicao: 'FIAP', instituicaoUrl: 'https://www.fiap.com.br', ano: 2019, destaque: false,
      descricao: 'Aplicado direto na operação enquanto cursava.',
    }},
    { slug: 'programacao-digital-house', v: {
      nome: 'Programação de Computadores', categoria: 'formacao', area: 'Tecnologia', nivel: null,
      instituicao: 'Digital House Brasil', instituicaoUrl: null, ano: 2022, destaque: false,
      descricao: 'HTML, CSS, JavaScript e bancos de dados. A base técnica que me deixou construir produto de verdade, não só pedir para alguém construir.',
    }},
    { slug: 'bacharelado-publicidade-faam', v: {
      nome: 'Bacharelado em Publicidade e Propaganda', categoria: 'formacao', area: 'Comunicação', nivel: null,
      instituicao: 'FIAM-FAAM', instituicaoUrl: null, ano: 2014, destaque: false,
      descricao: 'A formação de origem em comunicação.',
    }},

    // ---- Habilidades ----
    { slug: 'ia-aplicada-vibe-coding', v: {
      nome: 'IA aplicada e vibe coding', categoria: 'habilidade', area: 'IA e Produto', nivel: 'avancado', destaque: true,
      descricao: 'Desenho e implemento IA dentro de áreas de marketing e construo produtos com vibe coding. Onze produtos internos em produção são a prova.',
    }},
    { slug: 'branding-e-arquitetura-de-marca', v: {
      nome: 'Estratégia e narrativa de marca', categoria: 'habilidade', area: 'Marketing', nivel: 'especialista', destaque: true,
      descricao: 'Posicionamento, arquitetura de marca e a narrativa que faz a diretoria entender o que o marketing entrega.',
    }},
    { slug: 'conteudo-e-posicionamento', v: {
      nome: 'Conteúdo e posicionamento executivo', categoria: 'habilidade', area: 'Conteúdo', nivel: 'especialista', destaque: false,
      descricao: 'Conteúdo que posiciona quem assina — do post ao livro.',
    }},
    { slug: 'lideranca-de-times', v: {
      nome: 'Estruturação de times e governança', categoria: 'habilidade', area: 'Gestão', nivel: 'avancado', destaque: true,
      descricao: 'Montar time do zero e governar a demanda: papéis, RACI, SLAs e cadência no Monday.com.',
    }},
    { slug: 'crm-e-automacao', v: {
      nome: 'CRM e automação', categoria: 'habilidade', area: 'Marketing', nivel: 'avancado', destaque: false,
      descricao: 'Funil, automação e CRM (parceiro Kommo) ligando marketing à receita.',
    }},
    { slug: 'gestao-de-orcamento', v: {
      nome: 'Gestão de orçamento e fornecedores', categoria: 'habilidade', area: 'Gestão', nivel: 'avancado', destaque: false,
      descricao: 'Orçamento de marketing com otimização de custo e relação com fornecedor.',
    }},
    { slug: 'growth-marketing', v: {
      nome: 'Growth Marketing', categoria: 'habilidade', area: 'Marketing Digital', nivel: 'avancado', destaque: false,
      descricao: 'Experimentação de funil para crescer conversão com método.',
    }},
    { slug: 'gestao-de-trafego-pago', v: {
      nome: 'Gestão de Tráfego Pago', categoria: 'habilidade', area: 'Marketing Digital', nivel: 'avancado', destaque: false,
      descricao: 'Mídia paga lida pelo resultado: custo por aquisição e retorno, não vaidade.',
    }},
    { slug: 'planejamento-e-producao-de-eventos', v: {
      nome: 'Planejamento e Produção de Eventos', categoria: 'habilidade', area: 'Eventos', nivel: 'especialista', destaque: false,
      descricao: 'De roadshow nacional a viagem de incentivo internacional, do roteiro à logística.',
    }},
    { slug: 'seo', v: {
      nome: 'SEO', categoria: 'habilidade', area: 'Marketing Digital', nivel: 'intermediario', destaque: false,
      descricao: 'Conteúdo encontrável, pensado para busca desde a origem.',
    }},
    { slug: 'google-analytics', v: {
      nome: 'Google Analytics', categoria: 'habilidade', area: 'Dados', nivel: 'avancado', destaque: false,
      descricao: 'Leitura de dado para virar decisão — o que faço desde a pesquisa de mercado.',
    }},
    { slug: 'adobe-creative-suite', v: {
      nome: 'Adobe Creative Suite', categoria: 'habilidade', area: 'Design', nivel: 'intermediario', destaque: false,
      descricao: 'Direção e ajuste de peças quando preciso pôr a mão.',
    }},

    // ---- Certificacoes ----
    { slug: 'google-gerenciamento-de-projetos', v: {
      nome: 'Gerenciamento de Projetos', categoria: 'certificacao', area: 'Gestão', nivel: null,
      instituicao: 'Google', instituicaoUrl: null, ano: null, destaque: false,
      descricao: 'Método de projeto aplicado à rotina de marketing.',
    }},
    { slug: 'introducao-lgpd', v: {
      nome: 'Introdução à LGPD', categoria: 'certificacao', area: 'Governança', nivel: null,
      instituicao: 'Seconci-SP', instituicaoUrl: null, ano: null, destaque: false,
      descricao: 'A base que virou portão de publicação no programa de IA.',
    }},
    { slug: 'marketing-conteudo-rock-content', v: {
      nome: 'Marketing e Produção de Conteúdo', categoria: 'certificacao', area: 'Conteúdo', nivel: null,
      instituicao: 'Rock Content', instituicaoUrl: null, ano: null, destaque: false,
      descricao: 'Produção de conteúdo como disciplina, não como improviso.',
    }},
    { slug: 'vibe-coding-lovable', v: {
      nome: 'Vibe Coding', categoria: 'certificacao', area: 'IA e Produto', nivel: null,
      instituicao: 'Lovable', instituicaoUrl: null, ano: null, destaque: false,
      descricao: 'Construir software conversando com a IA. Foi assim que saíram os produtos internos e os meus.',
    }},
    { slug: 'google-ads-search-display', v: {
      nome: 'Google Ads — Pesquisa e Display', categoria: 'certificacao', area: 'Marketing Digital', nivel: null,
      instituicao: 'Google', instituicaoUrl: null, ano: null, destaque: false,
      descricao: 'Mídia de busca e display certificada na fonte.',
    }},

    // ---- Idiomas ----
    { slug: 'portugues', v: {
      nome: 'Português', categoria: 'idioma', area: 'Idiomas', nivel: 'especialista', destaque: false,
      descricao: 'Nativo.',
    }},
    { slug: 'ingles', v: {
      nome: 'Inglês', categoria: 'idioma', area: 'Idiomas', nivel: 'intermediario', destaque: false,
      descricao: 'Intermediário (EF SET B2), com prática diária de conversação.',
    }},
  ];

  for (const it of items) {
    await upsertBySlug(skills, it.slug, { ...it.v, situacao: 'publicado', ...body(String(it.v.descricao ?? '')) });
  }

  // Certificacoes que sairam do CV reposicionado — arquiva
  await arquivar(skills, 'marketing-no-linkedin');
  await arquivar(skills, 'planejamento-gestao-midia-online');
}

// ====================== AGORA ======================
async function migrarAgora() {
  console.log('AGORA');
  const md = `## No trabalho
Sou Gerente de Marketing no **Grupo Quali**, onde lidero o marketing de ponta a ponta da holding e das duas marcas, no crédito consignado B2B e B2C. O trabalho é tratar marketing como função estratégica do negócio: posicionamento, performance, conteúdo, eventos e endomarketing funcionando com time, processo e resultado.

## Escrevendo
Estou finalizando meu segundo livro, **Narrativa em KPI** — sobre o que faz uma diretoria finalmente entender o que o marketing entrega. O primeiro, **Marketing na Era da IA**, já está na Amazon.

## Estudando
Comecei o **MBA em IA para Negócios na FIAP**, em Gestão Estratégica e Liderança. Uso cada disciplina como pauta de conteúdo.

## Construindo
Produtos com IA. A **Vetly**, que analisa propostas comerciais, é a que mais uso. Este site e o CMS por trás dele também são meus, construídos do zero.

## Newsletter
Escrevo sobre marketing, narrativa e IA na **Mentes do Mercado**, no LinkedIn.`;

  const values = { atualizadoEm: D('2026-06-10'), ...body(md) };
  const [ex] = await db.select().from(agora).where(eq(agora.id, 'agora'));
  if (ex) await db.update(agora).set({ ...values, updatedAt: new Date() }).where(eq(agora.id, 'agora'));
  else await db.insert(agora).values({ id: 'agora', ...values });
  console.log('  ok');
}

console.log('Reescrevendo conteudo (v2)...\n');
await migrarIdentidade();
await migrarTimeline();
await migrarProjetos();
await migrarSkills();
await migrarAgora();
console.log('\nConteudo v2 aplicado.');
process.exit(0);
