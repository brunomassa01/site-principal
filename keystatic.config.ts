import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },

  cloud: {
    project: 'bruno-massa/site-principal',
  },

  ui: {
    brand: { name: 'Bruno Massa' },
  },

  collections: {
    timeline: collection({
      label: 'Trajetória',
      slugField: 'cargo',
      path: 'src/content/timeline/*',
      format: { contentField: 'body' },
      schema: {
        cargo: fields.text({ label: 'Cargo' }),
        empresa: fields.text({ label: 'Empresa' }),
        empresa_url: fields.text({ label: 'URL da Empresa', validation: { length: { min: 0 } } }),
        inicio: fields.date({ label: 'Início' }),
        fim: fields.date({ label: 'Fim (vazio = atual)' }),
        local: fields.text({ label: 'Local', description: 'Ex: São Paulo / Remoto', validation: { length: { min: 0 } } }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: '—', value: '' },
            { label: 'CLT', value: 'clt' },
            { label: 'PJ', value: 'pj' },
            { label: 'Sócio', value: 'socio' },
            { label: 'Consultoria', value: 'consultoria' },
            { label: 'Freelancer', value: 'freelancer' },
            { label: 'Voluntário', value: 'voluntario' },
          ],
          defaultValue: '',
        }),
        resumo: fields.text({ label: 'Resumo', description: '1-2 frases', multiline: true }),
        destaques: fields.array(
          fields.text({ label: 'Item' }),
          { label: 'Destaques', description: 'Bullets de entregas e conquistas', itemLabel: props => props.value ?? 'Item' }
        ),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value ?? 'Tag' }
        ),
        destaque: fields.checkbox({ label: 'Destaque na home', defaultValue: false }),
        body: fields.document({
          label: 'Texto longo (opcional)',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),

    projetos: collection({
      label: 'Projetos',
      slugField: 'titulo',
      path: 'src/content/projetos/*',
      format: { contentField: 'body' },
      schema: {
        titulo: fields.text({ label: 'Título' }),
        subtitulo: fields.text({ label: 'Subtítulo', validation: { length: { min: 0 } } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Em andamento', value: 'em-andamento' },
            { label: 'Concluído', value: 'concluido' },
            { label: 'Em pausa', value: 'em-pausa' },
            { label: 'Arquivado', value: 'arquivado' },
          ],
          defaultValue: 'em-andamento',
        }),
        inicio: fields.date({ label: 'Início' }),
        fim: fields.date({ label: 'Fim' }),
        cliente: fields.text({ label: 'Cliente', validation: { length: { min: 0 } } }),
        papel: fields.text({ label: 'Papel', description: 'Ex: Líder de projeto, Consultor, Idealizador' }),
        resumo: fields.text({ label: 'Resumo', description: '1-3 frases (aparece no card)', multiline: true }),
        problema: fields.text({ label: 'Problema', multiline: true, validation: { length: { min: 0 } } }),
        abordagem: fields.text({ label: 'Abordagem', multiline: true, validation: { length: { min: 0 } } }),
        resultado: fields.text({ label: 'Resultado', multiline: true, validation: { length: { min: 0 } } }),
        link: fields.text({ label: 'Link', validation: { length: { min: 0 } } }),
        repo: fields.text({ label: 'Repositório', validation: { length: { min: 0 } } }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value ?? 'Tag' }
        ),
        destaque: fields.checkbox({ label: 'Destaque', defaultValue: false }),
        body: fields.document({
          label: 'Case completo',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),

    skills: collection({
      label: 'Skills',
      slugField: 'nome',
      path: 'src/content/skills/*',
      schema: {
        nome: fields.text({ label: 'Nome' }),
        categoria: fields.select({
          label: 'Categoria',
          options: [
            { label: 'Habilidade', value: 'habilidade' },
            { label: 'Certificação', value: 'certificacao' },
            { label: 'Formação', value: 'formacao' },
            { label: 'Idioma', value: 'idioma' },
          ],
          defaultValue: 'habilidade',
        }),
        area: fields.text({ label: 'Área', description: 'Ex: Gestão, Dados, Finanças, Tecnologia' }),
        nivel: fields.select({
          label: 'Nível',
          options: [
            { label: '—', value: '' },
            { label: 'Básico', value: 'basico' },
            { label: 'Intermediário', value: 'intermediario' },
            { label: 'Avançado', value: 'avancado' },
            { label: 'Especialista', value: 'especialista' },
          ],
          defaultValue: '',
        }),
        instituicao: fields.text({ label: 'Instituição', validation: { length: { min: 0 } } }),
        instituicao_url: fields.text({ label: 'URL da Instituição', validation: { length: { min: 0 } } }),
        ano: fields.integer({ label: 'Ano' }),
        credencial_url: fields.text({ label: 'URL da Credencial', validation: { length: { min: 0 } } }),
        descricao: fields.text({ label: 'Descrição', multiline: true, validation: { length: { min: 0 } } }),
        destaque: fields.checkbox({ label: 'Destaque', defaultValue: false }),
      },
    }),

    posts: collection({
      label: 'Posts',
      slugField: 'titulo',
      path: 'src/content/posts/*',
      format: { contentField: 'body' },
      schema: {
        titulo: fields.text({ label: 'Título' }),
        resumo: fields.text({ label: 'Resumo', multiline: true }),
        data: fields.date({ label: 'Data' }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value ?? 'Tag' }
        ),
        fonte_externa_url: fields.text({ label: 'URL Externa', description: 'Se for republicação de LinkedIn/Medium', validation: { length: { min: 0 } } }),
        fonte_externa_nome: fields.text({ label: 'Nome da Fonte', validation: { length: { min: 0 } } }),
        idioma: fields.select({
          label: 'Idioma',
          options: [
            { label: 'Português', value: 'pt' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'pt',
        }),
        rascunho: fields.checkbox({ label: 'Rascunho', defaultValue: false }),
        body: fields.document({
          label: 'Conteúdo',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),

    atualizacoes: collection({
      label: 'Atualizações',
      slugField: 'titulo',
      path: 'src/content/atualizacoes/*',
      schema: {
        data: fields.date({ label: 'Data' }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Projeto', value: 'projeto' },
            { label: 'Certificação', value: 'certificacao' },
            { label: 'Cargo', value: 'cargo' },
            { label: 'Post', value: 'post' },
            { label: 'Marco', value: 'marco' },
            { label: 'Outro', value: 'outro' },
          ],
          defaultValue: 'outro',
        }),
        titulo: fields.text({ label: 'Título' }),
        referencia_slug: fields.text({ label: 'Referência (slug)', validation: { length: { min: 0 } } }),
      },
    }),
  },

  singletons: {
    agora: singleton({
      label: 'Página Agora',
      path: 'src/content/agora/index',
      format: { contentField: 'body' },
      schema: {
        atualizado_em: fields.date({ label: 'Atualizado em' }),
        body: fields.document({
          label: 'Conteúdo',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),
  },
});
