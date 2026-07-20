/**
 * Dicionário de textos de INTERFACE (rótulos, botões, títulos de seção).
 *
 * Aqui NÃO entra conteúdo — conteúdo vem do banco, com as colunas `*_en`.
 * Chaves são planas ('secao.chave') para o TypeScript reclamar quando faltar tradução.
 * Toda chave que existe em `pt` precisa existir em `en`.
 */

export const ui = {
  pt: {
    // navegação / geral
    'nav.pular': 'Pular para o conteúdo',
    'nav.menu': 'Menu',
    'nav.fechar': 'Fechar',
    'nav.inicio': 'Início',
    'nav.livro': 'Livro',
    'nav.palestras': 'Palestras',
    'nav.blog': 'Blog',
    'nav.conhecimento': 'Conhecimento',
    'idioma.trocar': 'Ver em inglês',
    'idioma.atual': 'Português',
    'idioma.outro': 'English',

    // rodapé
    'rodape.direitos': 'Todos os direitos reservados.',
    'rodape.feito': 'Feito por mim, do zero.',
    'rodape.assinatura': 'Currículo vivo, sempre em construção.',
    'rodape.agencia': 'Selo7 · minha agência',
    'rodape.privacidade': 'Privacidade',
    'rodape.termos': 'Termos',

    // comuns
    'comum.voltar': 'Voltar',
    'comum.leiaMais': 'Ler mais',
    'comum.verTodos': 'Ver todos',
    'comum.atualizadoEm': 'Atualizado em',
    'comum.publicadoEm': 'Publicado em',
    'comum.minLeitura': 'min de leitura',
    'comum.vazio': 'Nada por aqui ainda.',
    'comum.presente': 'Atual',
    'comum.compartilhar': 'Compartilhar',

    // blog
    'blog.titulo': 'Blog',
    'blog.subtitulo': 'O que ando pensando sobre marketing, dados e negócio.',
    'blog.vazio': 'Nenhum artigo publicado ainda.',
    'blog.todosOsArtigos': 'Todos os artigos',
    'blog.tempoLeitura': 'de leitura',
    'blog.original': 'Este artigo foi escrito originalmente em português.',
    'blog.traduzido': 'Traduzido do português.',

    // trajetória
    'timeline.titulo': 'Trajetória',
    'timeline.subtitulo': 'Onde passei e o que construí.',

    // projetos
    'projetos.titulo': 'Projetos',
    'projetos.subtitulo': 'Trabalhos que saíram do papel.',
    'projetos.problema': 'Problema',
    'projetos.abordagem': 'Abordagem',
    'projetos.resultado': 'Resultado',
    'projetos.cliente': 'Cliente',
    'projetos.papel': 'Papel',
    'projetos.status.em-andamento': 'Em andamento',
    'projetos.status.concluido': 'Concluído',
    'projetos.status.em-pausa': 'Em pausa',
    'projetos.status.arquivado': 'Arquivado',

    // skills
    'skills.titulo': 'Skills',
    'skills.subtitulo': 'O que eu sei fazer, e o quanto.',
    'skills.categoria.habilidade': 'Habilidades',
    'skills.categoria.certificacao': 'Certificações',
    'skills.categoria.formacao': 'Formação',
    'skills.categoria.idioma': 'Idiomas',
    'skills.nivel.basico': 'Básico',
    'skills.nivel.intermediario': 'Intermediário',
    'skills.nivel.avancado': 'Avançado',
    'skills.nivel.especialista': 'Especialista',

    // contrato (trajetória)
    'contrato.clt': 'CLT',
    'contrato.pj': 'PJ',
    'contrato.socio': 'Sócio',
    'contrato.consultoria': 'Consultoria',
    'contrato.freelancer': 'Freelancer',
    'contrato.voluntario': 'Voluntário',

    // agora
    'agora.titulo': 'Agora',
    'agora.subtitulo': 'No que estou focado neste momento.',

    // contato
    'contato.titulo': 'Contato',
    'contato.email': 'E-mail',
    'contato.linkedin': 'LinkedIn',

    // home
    'home.heroTrajetoria': 'Ver trajetória',
    'home.heroProjetos': 'Ver projetos',
    'home.empresas': 'Empresas onde trabalhei',
    'home.trajetoriaTitulo': 'Passagens em destaque',
    'home.trajetoriaVer': 'Ver completa →',
    'home.trajetoriaVerMobile': 'Ver trajetória completa →',
    'home.projetosTitulo': 'Trabalhos selecionados',
    'home.projetosVer': 'Ver todos →',
    'home.projetosVerMobile': 'Ver todos os projetos →',
    'home.conteudo': 'Conteúdo',
    'home.blogTitulo': 'Escrevo por aqui',
    'home.blogVer': 'Ver tudo →',
    'home.blogVerMobile': 'Ver todo o conteúdo →',
    'home.blogRecente': 'Mais recente',
    'home.blogLer': 'Ler artigo →',
    'home.inkTitulo': 'Quanto vale a narrativa da sua marca?',
    'home.inkTexto': 'No livro Narrativa em KPI eu criei um índice pra medir o que a marca constrói antes do clique. Três dimensões viram um número, e o número vira diagnóstico: do estágio da sua narrativa ao custo invisível da incoerência.',
    'home.inkCta': 'Calcular o INK →',
    'home.inkPalestra': 'Levar o método pro seu evento →',
    'home.inkNota': 'Instrumento autoral, aberto e gratuito. Desenvolvido na',
    'home.inkNotaFim': ', minha agência.',
    'home.inkR': 'Reconhecimento prévio',
    'home.inkRDesc': 'quantos chegam já sabendo quem você é',
    'home.inkC': 'Coerência percebida',
    'home.inkCDesc': 'se a promessa e a entrega contam a mesma história',
    'home.inkP': 'Permanência espontânea',
    'home.inkPDesc': 'o que fica na memória sem mídia empurrando',
    'home.inkFormulaAria': 'Fórmula do índice INK',
    'home.livroTexto': 'Os movimentos práticos que estão redesenhando o marketing corporativo. Disponível na Amazon.',
    'home.livroCta': 'Comprar na Amazon ↗',
    'home.competencias': 'Competências',
    'home.skillsTitulo': 'Skills & Formação',
    'home.skillsDesc': 'Habilidades, certificações, idiomas e formação acadêmica.',
    'home.skillsCta': 'Ver skills →',
    'home.agoraTitulo': 'Agora & Publicações',
    'home.agoraDesc': 'Foco atual, publicações e anotações sobre marketing, narrativa e IA.',
    'home.agoraCta': 'Ver agora →',
    'home.contatoTitulo': 'Vamos conversar',
    'home.contatoDesc': 'E-mail, LinkedIn ou uma conversa sobre projetos e oportunidades.',
    'home.contatoCta': 'Entrar em contato →',

    // blog: lista
    'blogLista.eyebrow': 'Publicações',
    'blogLista.titulo': 'Conteúdo autoral',
    'blogLista.subtitulo': 'Artigos, reflexões e anotações sobre marketing, produto, gestão e carreira.',
    'blogLista.metaDesc': 'Artigos e reflexões de Bruno Massa sobre marketing, produto e negócios.',
    'blogLista.vazioTitulo': 'Em breve',
    'blogLista.vazioTexto': 'Os artigos serão publicados em breve.',
    'blogLista.republicacao': 'Republicação',

    // blog: artigo
    'post.voltar': '← Conteúdo',
    'post.voltarRodape': '← Voltar para conteúdo',
    'post.originalmente': 'Originalmente publicado em',
    'post.fonteExterna': 'fonte externa',
    'post.compartilhar': 'Compartilhar no LinkedIn',
    'post.badgeIngles': 'English',
    'post.semTraducao': '',

    // página: trajetória
    'timelinePg.eyebrow': 'Carreira',
    'timelinePg.titulo': 'Trajetória profissional',
    'timelinePg.subtitulo': 'Vinte anos traduzindo marketing para quem decide — da pesquisa de mercado à liderança de áreas inteiras. Em ordem cronológica inversa.',
    'timelinePg.metaDesc': 'Trajetória profissional de Bruno Massa — cargos, empresas e conquistas ao longo da carreira.',
    'timelinePg.vazio': 'Em construção.',

    // página: skills
    'skillsPg.titulo': 'Skills & Formação',
    'skillsPg.subtitulo': 'Habilidades, certificações, formação acadêmica e idiomas.',
    'skillsPg.metaDesc': 'Habilidades, certificações, formação e idiomas de Bruno Massa.',
    'skillsPg.credencial': 'Credencial ↗',
    'skillsPg.diploma': 'Ver diploma ↗',

    // página: agora
    'agoraPg.titulo': 'O que estou fazendo',
    'agoraPg.subtitulo': 'Foco atual, publicações e anotações.',
    'agoraPg.metaDesc': 'O que Bruno Massa está focando neste momento — e o que escreve sobre marketing, produto e negócios.',
    'agoraPg.publicacoes': 'Publicações',
    'agoraPg.momento': 'Momento atual',
    'agoraPg.atualizado': 'Atualizado em',

    // página: contato
    'contatoPg.titulo': 'Vamos conversar',
    'contatoPg.subtitulo': 'Aberto a oportunidades remotas, parcerias e boas conversas sobre marketing, narrativa e IA.',
    'contatoPg.metaDesc': 'Entre em contato com Bruno Massa.',
    'contatoPg.emailNota': 'Respondo em até 24h em dias úteis.',
    'contatoPg.linkedinNota': 'Conecte-se ou envie uma mensagem direta.',
    'contatoPg.texto': 'Prefiro uma conversa direta sobre o que você tem em mente — seja uma oportunidade de trabalho, uma parceria em projeto ou uma troca de ideias. Sem formulários, sem burocracia.',

    // página: projetos (lista)
    'projetosPg.eyebrow': 'Portfolio',
    'projetosPg.subtitulo': 'Produtos que construí, programas que desenhei e campanhas que liderei. Prova, não promessa.',
    'projetosPg.metaDesc': 'Projetos e trabalhos de Bruno Massa — cases, campanhas e iniciativas.',
    'projetosPg.destaque': 'Destaque',
    'projetosPg.grupo.em-andamento': 'Em andamento',
    'projetosPg.grupo.concluido': 'Concluídos',
    'projetosPg.grupo.em-pausa': 'Em pausa',
    'projetosPg.grupo.arquivado': 'Arquivados',

    // página: projeto (detalhe)
    'projetoDet.voltar': '← Projetos',
    'projetoDet.periodo': 'Período',
    'projetoDet.emAndamento': 'Em andamento',
    'projetoDet.resumo': 'Resumo',
    'projetoDet.acessar': 'Acessar projeto ↗',
    'projetoDet.repo': 'Repositório ↗',
    'projetoDet.tags': 'Tags',
  },

  en: {
    // navegação / geral
    'nav.pular': 'Skip to content',
    'nav.menu': 'Menu',
    'nav.fechar': 'Close',
    'nav.inicio': 'Home',
    'nav.livro': 'Book',
    'nav.palestras': 'Talks',
    'nav.blog': 'Blog',
    'nav.conhecimento': 'Learning',
    'idioma.trocar': 'View in Portuguese',
    'idioma.atual': 'English',
    'idioma.outro': 'Português',

    // rodapé
    'rodape.direitos': 'All rights reserved.',
    'rodape.feito': 'Built by me, from scratch.',
    'rodape.assinatura': 'A living résumé, always under construction.',
    'rodape.agencia': 'Selo7 · my agency',
    'rodape.privacidade': 'Privacy',
    'rodape.termos': 'Terms',

    // comuns
    'comum.voltar': 'Back',
    'comum.leiaMais': 'Read more',
    'comum.verTodos': 'See all',
    'comum.atualizadoEm': 'Updated on',
    'comum.publicadoEm': 'Published on',
    'comum.minLeitura': 'min read',
    'comum.vazio': 'Nothing here yet.',
    'comum.presente': 'Present',
    'comum.compartilhar': 'Share',

    // blog
    'blog.titulo': 'Blog',
    'blog.subtitulo': 'What I have been thinking about marketing, data and business.',
    'blog.vazio': 'No articles published yet.',
    'blog.todosOsArtigos': 'All articles',
    'blog.tempoLeitura': 'read',
    'blog.original': 'This article was originally written in Portuguese.',
    'blog.traduzido': 'Translated from Portuguese.',

    // trajetória
    'timeline.titulo': 'Career',
    'timeline.subtitulo': 'Where I have been and what I built.',

    // projetos
    'projetos.titulo': 'Projects',
    'projetos.subtitulo': 'Work that actually shipped.',
    'projetos.problema': 'Problem',
    'projetos.abordagem': 'Approach',
    'projetos.resultado': 'Outcome',
    'projetos.cliente': 'Client',
    'projetos.papel': 'Role',
    'projetos.status.em-andamento': 'In progress',
    'projetos.status.concluido': 'Completed',
    'projetos.status.em-pausa': 'On hold',
    'projetos.status.arquivado': 'Archived',

    // skills
    'skills.titulo': 'Skills',
    'skills.subtitulo': 'What I can do, and how well.',
    'skills.categoria.habilidade': 'Skills',
    'skills.categoria.certificacao': 'Certifications',
    'skills.categoria.formacao': 'Education',
    'skills.categoria.idioma': 'Languages',
    'skills.nivel.basico': 'Basic',
    'skills.nivel.intermediario': 'Intermediate',
    'skills.nivel.avancado': 'Advanced',
    'skills.nivel.especialista': 'Expert',

    // contrato (trajetória)
    'contrato.clt': 'Full-time',
    'contrato.pj': 'Contractor',
    'contrato.socio': 'Partner',
    'contrato.consultoria': 'Consulting',
    'contrato.freelancer': 'Freelance',
    'contrato.voluntario': 'Volunteer',

    // agora
    'agora.titulo': 'Now',
    'agora.subtitulo': 'What I am focused on right now.',

    // contato
    'contato.titulo': 'Contact',
    'contato.email': 'Email',
    'contato.linkedin': 'LinkedIn',

    // home
    'home.heroTrajetoria': 'View career',
    'home.heroProjetos': 'View projects',
    'home.empresas': "Companies I've worked for",
    'home.trajetoriaTitulo': 'Selected roles',
    'home.trajetoriaVer': 'See the full career →',
    'home.trajetoriaVerMobile': 'See the full career →',
    'home.projetosTitulo': 'Selected work',
    'home.projetosVer': 'See all →',
    'home.projetosVerMobile': 'See all projects →',
    'home.conteudo': 'Writing',
    'home.blogTitulo': 'This is where I write',
    'home.blogVer': 'See all →',
    'home.blogVerMobile': 'See all writing →',
    'home.blogRecente': 'Latest',
    'home.blogLer': 'Read article →',
    'home.inkTitulo': "What is your brand's narrative worth?",
    'home.inkTexto': 'In my book Narrativa em KPI I built an index to measure what a brand builds before the click. Three dimensions become a single number, and that number becomes a diagnosis: from the stage of your narrative to the invisible cost of incoherence.',
    'home.inkCta': 'Calculate your INK →',
    'home.inkPalestra': 'Bring the method to your event →',
    'home.inkNota': 'An original instrument, open and free. Built at',
    'home.inkNotaFim': ', my agency.',
    'home.inkR': 'Prior recognition',
    'home.inkRDesc': 'how many arrive already knowing who you are',
    'home.inkC': 'Perceived coherence',
    'home.inkCDesc': 'whether the promise and the delivery tell the same story',
    'home.inkP': 'Spontaneous permanence',
    'home.inkPDesc': 'what stays in memory with no media pushing it',
    'home.inkFormulaAria': 'INK index formula',
    'home.livroTexto': 'The practical shifts redrawing corporate marketing. Available on Amazon, in Portuguese.',
    'home.livroCta': 'Buy on Amazon ↗',
    'home.competencias': 'Expertise',
    'home.skillsTitulo': 'Skills & Education',
    'home.skillsDesc': 'Skills, certifications, languages and academic background.',
    'home.skillsCta': 'View skills →',
    'home.agoraTitulo': 'Now & Publications',
    'home.agoraDesc': 'Current focus, publications and notes on marketing, narrative and AI.',
    'home.agoraCta': 'View now →',
    'home.contatoTitulo': "Let's talk",
    'home.contatoDesc': 'Email, LinkedIn, or a conversation about projects and opportunities.',
    'home.contatoCta': 'Get in touch →',

    // blog: lista
    'blogLista.eyebrow': 'Publications',
    'blogLista.titulo': 'Original writing',
    'blogLista.subtitulo': 'Articles, essays and notes on marketing, product, management and career.',
    'blogLista.metaDesc': 'Articles and essays by Bruno Massa on marketing, product and business.',
    'blogLista.vazioTitulo': 'Coming soon',
    'blogLista.vazioTexto': 'Articles will be published shortly.',
    'blogLista.republicacao': 'Republished',

    // blog: artigo
    'post.voltar': '← Writing',
    'post.voltarRodape': '← Back to writing',
    'post.originalmente': 'Originally published at',
    'post.fonteExterna': 'external source',
    'post.compartilhar': 'Share on LinkedIn',
    'post.badgeIngles': 'English',
    'post.semTraducao': 'This article has not been translated yet. You are reading the Portuguese original.',

    // página: trajetória
    'timelinePg.eyebrow': 'Career',
    'timelinePg.titulo': 'Professional career',
    'timelinePg.subtitulo': 'Twenty years translating marketing for the people who decide — from market research to running entire departments. In reverse chronological order.',
    'timelinePg.metaDesc': 'The professional career of Bruno Massa — roles, companies and what he built along the way.',
    'timelinePg.vazio': 'Under construction.',

    // página: skills
    'skillsPg.titulo': 'Skills & Education',
    'skillsPg.subtitulo': 'Skills, certifications, academic background and languages.',
    'skillsPg.metaDesc': 'Skills, certifications, education and languages of Bruno Massa.',
    'skillsPg.credencial': 'Credential ↗',
    'skillsPg.diploma': 'View diploma ↗',

    // página: agora
    'agoraPg.titulo': 'What I am working on',
    'agoraPg.subtitulo': 'Current focus, publications and notes.',
    'agoraPg.metaDesc': 'What Bruno Massa is focused on right now — and what he writes about marketing, product and business.',
    'agoraPg.publicacoes': 'Publications',
    'agoraPg.momento': 'Right now',
    'agoraPg.atualizado': 'Updated on',

    // página: contato
    'contatoPg.titulo': "Let's talk",
    'contatoPg.subtitulo': 'Open to remote opportunities, partnerships and good conversations about marketing, narrative and AI.',
    'contatoPg.metaDesc': 'Get in touch with Bruno Massa.',
    'contatoPg.emailNota': 'I reply within 24h on business days.',
    'contatoPg.linkedinNota': 'Connect or send a direct message.',
    'contatoPg.texto': 'I prefer a direct conversation about what you have in mind — a role, a partnership on a project, or just an exchange of ideas. No forms, no bureaucracy.',

    // página: projetos (lista)
    'projetosPg.eyebrow': 'Portfolio',
    'projetosPg.subtitulo': 'Products I built, programmes I designed and campaigns I led. Proof, not promises.',
    'projetosPg.metaDesc': 'Projects and work by Bruno Massa — cases, campaigns and initiatives.',
    'projetosPg.destaque': 'Featured',
    'projetosPg.grupo.em-andamento': 'In progress',
    'projetosPg.grupo.concluido': 'Completed',
    'projetosPg.grupo.em-pausa': 'On hold',
    'projetosPg.grupo.arquivado': 'Archived',

    // página: projeto (detalhe)
    'projetoDet.voltar': '← Projects',
    'projetoDet.periodo': 'Period',
    'projetoDet.emAndamento': 'Ongoing',
    'projetoDet.resumo': 'Summary',
    'projetoDet.acessar': 'Visit project ↗',
    'projetoDet.repo': 'Repository ↗',
    'projetoDet.tags': 'Tags',
  },
} as const;

export type ChaveUI = keyof (typeof ui)['pt'];
