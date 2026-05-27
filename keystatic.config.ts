import { config, collection, singleton, fields } from '@keystatic/core';

const SITE = 'https://brunomassa.online';

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
      previewUrl: `${SITE}/timeline`,
      schema: {
        cargo: fields.text({ label: 'Cargo' }),
        empresa: fields.text({ label: 'Empresa' }),
        empresa_url: fields.url({
          label: 'URL da Empresa',
          validation: { isRequired: false },
        }),
        inicio: fields.date({ label: 'Início' }),
        fim: fields.date({ label: 'Fim (vazio = atual)' }),
        local: fields.text({
          label: 'Local',
          description: 'Ex: São Paulo / Remoto',
          validation: { length: { min: 0 } },
        }),
        tipo: fields.select({
          label: 'Tipo de contrato',
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
        resumo: fields.text({
          label: 'Resumo',
          description: '1-2 frases — aparece no card da trajetória',
          multiline: true,
        }),
        destaques: fields.array(
          fields.text({ label: 'Item' }),
          {
            label: 'Destaques',
            description: 'Entregas e conquistas em bullet points',
            itemLabel: props => props.value ?? 'Novo item',
          }
        ),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value ?? 'Tag' }
        ),
        destaque: fields.checkbox({
          label: 'Aparecer em destaque na home',
          defaultValue: false,
        }),
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
      previewUrl: `${SITE}/projetos/{slug}`,
      schema: {
        titulo: fields.text({ label: 'Título' }),
        subtitulo: fields.text({
          label: 'Subtítulo',
          validation: { length: { min: 0 } },
        }),
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
        cliente: fields.text({
          label: 'Cliente / Empresa',
          validation: { length: { min: 0 } },
        }),
        papel: fields.text({
          label: 'Papel',
          description: 'Ex: Líder de projeto, Consultor, Idealizador',
        }),
        resumo: fields.text({
          label: 'Resumo',
          description: '1-3 frases — aparece no card',
          multiline: true,
        }),
        problema: fields.text({
          label: 'Problema',
          description: 'Qual problema o projeto resolve',
          multiline: true,
          validation: { length: { min: 0 } },
        }),
        abordagem: fields.text({
          label: 'Abordagem',
          description: 'Como foi executado',
          multiline: true,
          validation: { length: { min: 0 } },
        }),
        resultado: fields.text({
          label: 'Resultado',
          description: 'Resultados concretos com números',
          multiline: true,
          validation: { length: { min: 0 } },
        }),
        link: fields.url({
          label: 'Link externo',
          validation: { isRequired: false },
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value ?? 'Tag' }
        ),
        destaque: fields.checkbox({
          label: 'Aparecer em destaque na home',
          defaultValue: false,
        }),
        body: fields.document({
          label: 'Case completo',
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),

    skills: collection({
      label: 'Skills',
      slugField: 'nome',
      path: 'src/content/skills/*',
      format: { contentField: 'body' },
      previewUrl: `${SITE}/skills`,
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
        area: fields.text({
          label: 'Área',
          description: 'Ex: Gestão, Dados, Performance, Tecnologia',
        }),
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
        instituicao: fields.text({
          label: 'Instituição',
          validation: { length: { min: 0 } },
        }),
        instituicao_url: fields.url({
          label: 'URL da Instituição',
          validation: { isRequired: false },
        }),
        ano: fields.integer({ label: 'Ano' }),
        credencial_url: fields.url({
          label: 'URL da Credencial',
          validation: { isRequired: false },
        }),
        descricao: fields.text({
          label: 'Descrição',
          multiline: true,
          validation: { length: { min: 0 } },
        }),
        destaque: fields.checkbox({
          label: 'Destaque',
          defaultValue: false,
        }),
        body: fields.document({
          label: 'Notas adicionais',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),

    posts: collection({
      label: 'Posts',
      slugField: 'titulo',
      path: 'src/content/posts/*',
      format: { contentField: 'body' },
      previewUrl: `${SITE}/posts/{slug}`,
      schema: {
        titulo: fields.text({ label: 'Título' }),
        resumo: fields.text({
          label: 'Resumo',
          description: 'Aparece no card e no meta description',
          multiline: true,
        }),
        data: fields.date({ label: 'Data de publicação' }),
        capa_url: fields.text({
          label: 'Imagem de capa',
          description: 'Caminho da imagem em /public — ex: /images/posts/nome.jpg',
          validation: { length: { min: 0 } },
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags', itemLabel: props => props.value ?? 'Tag' }
        ),
        fonte_externa_url: fields.url({
          label: 'URL da fonte externa',
          description: 'Se for republicação de LinkedIn, Medium etc.',
          validation: { isRequired: false },
        }),
        fonte_externa_nome: fields.text({
          label: 'Nome da fonte',
          description: 'Ex: LinkedIn, Medium',
          validation: { length: { min: 0 } },
        }),
        idioma: fields.select({
          label: 'Idioma',
          options: [
            { label: 'Português', value: 'pt' },
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'pt',
        }),
        rascunho: fields.checkbox({
          label: 'Salvar como rascunho (não aparece no site)',
          defaultValue: false,
        }),
        body: fields.document({
          label: 'Conteúdo',
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),

    atualizacoes: collection({
      label: 'Atualizações',
      slugField: 'titulo',
      path: 'src/content/atualizacoes/*',
      format: { contentField: 'body' },
      previewUrl: `${SITE}/agora`,
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
        referencia_slug: fields.text({
          label: 'Referência (slug)',
          description: 'Slug do projeto, post ou cargo relacionado',
          validation: { length: { min: 0 } },
        }),
        body: fields.document({
          label: 'Detalhes',
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),
  },

  singletons: {
    agora: singleton({
      label: 'Página Agora',
      path: 'src/content/agora/index',
      format: { contentField: 'body' },
      previewUrl: `${SITE}/agora`,
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
