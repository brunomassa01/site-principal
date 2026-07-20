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
  },
} as const;

export type ChaveUI = keyof (typeof ui)['pt'];
