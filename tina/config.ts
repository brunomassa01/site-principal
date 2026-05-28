import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: process.env.HEAD ?? process.env.VERCEL_GIT_COMMIT_REF ?? 'main',
  clientId: process.env.TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'timeline',
        label: 'Trajetória',
        path: 'src/content/timeline',
        format: 'mdx',
        ui: {
          filename: {
            readonly: false,
            slugify: (v) =>
              `${v?.cargo ?? ''}-${v?.empresa ?? ''}`
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
          },
        },
        fields: [
          { type: 'string', name: 'cargo', label: 'Cargo', isTitle: true, required: true },
          { type: 'string', name: 'empresa', label: 'Empresa', required: true },
          { type: 'string', name: 'empresa_url', label: 'URL da Empresa' },
          { type: 'datetime', name: 'inicio', label: 'Início', required: true },
          { type: 'datetime', name: 'fim', label: 'Fim (vazio = atual)' },
          { type: 'string', name: 'local', label: 'Local', description: 'Ex: São Paulo / Remoto' },
          {
            type: 'string',
            name: 'tipo',
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
          },
          {
            type: 'string',
            name: 'resumo',
            label: 'Resumo',
            description: '1-2 frases — aparece no card da trajetória',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'destaques',
            label: 'Destaques',
            description: 'Entregas e conquistas em bullet points',
            list: true,
          },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          {
            type: 'boolean',
            name: 'destaque',
            label: 'Aparecer em destaque na home',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Texto longo (opcional)',
            isBody: true,
          },
        ],
      },

      {
        name: 'projetos',
        label: 'Projetos',
        path: 'src/content/projetos',
        format: 'mdx',
        ui: {
          filename: {
            readonly: false,
            slugify: (v) =>
              (v?.titulo ?? 'novo-projeto')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
          },
        },
        fields: [
          { type: 'string', name: 'titulo', label: 'Título', isTitle: true, required: true },
          { type: 'string', name: 'subtitulo', label: 'Subtítulo' },
          {
            type: 'string',
            name: 'status',
            label: 'Status',
            required: true,
            options: [
              { label: 'Em andamento', value: 'em-andamento' },
              { label: 'Concluído', value: 'concluido' },
              { label: 'Em pausa', value: 'em-pausa' },
              { label: 'Arquivado', value: 'arquivado' },
            ],
          },
          { type: 'datetime', name: 'inicio', label: 'Início', required: true },
          { type: 'datetime', name: 'fim', label: 'Fim' },
          { type: 'string', name: 'cliente', label: 'Cliente / Empresa' },
          {
            type: 'string',
            name: 'papel',
            label: 'Papel',
            description: 'Ex: Líder de projeto, Consultor, Idealizador',
            required: true,
          },
          {
            type: 'string',
            name: 'resumo',
            label: 'Resumo',
            description: '1-3 frases — aparece no card',
            ui: { component: 'textarea' },
            required: true,
          },
          {
            type: 'string',
            name: 'problema',
            label: 'Problema',
            description: 'Qual problema o projeto resolve',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'abordagem',
            label: 'Abordagem',
            description: 'Como foi executado',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'resultado',
            label: 'Resultado',
            description: 'Resultados concretos com números',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'link', label: 'Link externo' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          { type: 'boolean', name: 'destaque', label: 'Aparecer em destaque na home' },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Case completo',
            isBody: true,
            templates: [
              {
                name: 'VideoEmbed',
                label: 'Vídeo',
                fields: [
                  { type: 'string', name: 'src', label: 'Caminho do vídeo', required: true },
                  { type: 'string', name: 'legenda', label: 'Legenda' },
                ],
              },
            ],
          },
        ],
      },

      {
        name: 'skills',
        label: 'Skills',
        path: 'src/content/skills',
        format: 'mdx',
        ui: {
          filename: {
            readonly: false,
            slugify: (v) =>
              (v?.nome ?? 'nova-skill')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
          },
        },
        fields: [
          { type: 'string', name: 'nome', label: 'Nome', isTitle: true, required: true },
          {
            type: 'string',
            name: 'categoria',
            label: 'Categoria',
            required: true,
            options: [
              { label: 'Habilidade', value: 'habilidade' },
              { label: 'Certificação', value: 'certificacao' },
              { label: 'Formação', value: 'formacao' },
              { label: 'Idioma', value: 'idioma' },
            ],
          },
          {
            type: 'string',
            name: 'area',
            label: 'Área',
            description: 'Ex: Gestão, Dados, Performance, Tecnologia',
            required: true,
          },
          {
            type: 'string',
            name: 'nivel',
            label: 'Nível',
            options: [
              { label: '—', value: '' },
              { label: 'Básico', value: 'basico' },
              { label: 'Intermediário', value: 'intermediario' },
              { label: 'Avançado', value: 'avancado' },
              { label: 'Especialista', value: 'especialista' },
            ],
          },
          { type: 'string', name: 'instituicao', label: 'Instituição' },
          { type: 'string', name: 'instituicao_url', label: 'URL da Instituição' },
          { type: 'number', name: 'ano', label: 'Ano' },
          { type: 'string', name: 'credencial_url', label: 'URL da Credencial' },
          {
            type: 'string',
            name: 'descricao',
            label: 'Descrição',
            ui: { component: 'textarea' },
          },
          { type: 'boolean', name: 'destaque', label: 'Destaque' },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Notas adicionais',
            isBody: true,
          },
        ],
      },

      {
        name: 'posts',
        label: 'Posts',
        path: 'src/content/posts',
        format: 'mdx',
        ui: {
          filename: {
            readonly: false,
            slugify: (v) =>
              (v?.titulo ?? 'novo-post')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
          },
        },
        fields: [
          { type: 'string', name: 'titulo', label: 'Título', isTitle: true, required: true },
          {
            type: 'string',
            name: 'resumo',
            label: 'Resumo',
            description: 'Aparece no card e no meta description',
            ui: { component: 'textarea' },
            required: true,
          },
          { type: 'datetime', name: 'data', label: 'Data de publicação', required: true },
          {
            type: 'datetime',
            name: 'publicar_em',
            label: 'Agendar publicação',
            description: 'Se preenchido, o post só aparece a partir desta data',
          },
          { type: 'image', name: 'capa_url', label: 'Imagem de capa' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          {
            type: 'string',
            name: 'fonte_externa_url',
            label: 'URL da fonte externa',
            description: 'Se for republicação de LinkedIn, Medium etc.',
          },
          {
            type: 'string',
            name: 'fonte_externa_nome',
            label: 'Nome da fonte',
            description: 'Ex: LinkedIn, Medium',
          },
          {
            type: 'string',
            name: 'idioma',
            label: 'Idioma',
            options: [
              { label: 'Português', value: 'pt' },
              { label: 'English', value: 'en' },
            ],
          },
          { type: 'boolean', name: 'rascunho', label: 'Salvar como rascunho (não aparece no site)' },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Conteúdo',
            isBody: true,
            templates: [
              {
                name: 'VideoEmbed',
                label: 'Vídeo',
                fields: [
                  { type: 'string', name: 'src', label: 'Caminho do vídeo', required: true },
                  { type: 'string', name: 'legenda', label: 'Legenda' },
                ],
              },
            ],
          },
        ],
      },

      {
        name: 'atualizacoes',
        label: 'Atualizações',
        path: 'src/content/atualizacoes',
        format: 'mdx',
        ui: {
          filename: {
            readonly: false,
            slugify: (v) =>
              (v?.titulo ?? 'nova-atualizacao')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, ''),
          },
        },
        fields: [
          { type: 'datetime', name: 'data', label: 'Data', required: true },
          {
            type: 'string',
            name: 'tipo',
            label: 'Tipo',
            required: true,
            options: [
              { label: 'Projeto', value: 'projeto' },
              { label: 'Certificação', value: 'certificacao' },
              { label: 'Cargo', value: 'cargo' },
              { label: 'Post', value: 'post' },
              { label: 'Marco', value: 'marco' },
              { label: 'Outro', value: 'outro' },
            ],
          },
          { type: 'string', name: 'titulo', label: 'Título', isTitle: true, required: true },
          {
            type: 'string',
            name: 'referencia_slug',
            label: 'Referência (slug)',
            description: 'Slug do projeto, post ou cargo relacionado',
          },
          { type: 'rich-text', name: 'body', label: 'Detalhes', isBody: true },
        ],
      },

      {
        name: 'identidade',
        label: 'Identidade',
        path: 'src/content/identidade',
        format: 'json',
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          { type: 'string', name: 'nome', label: 'Nome', required: true },
          {
            type: 'string',
            name: 'tagline',
            label: 'Tagline',
            description: 'Ex: Marketing · Produto · Negócios',
          },
          {
            type: 'string',
            name: 'slogan',
            label: 'Frase de efeito',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'bio_curta',
            label: 'Bio curta',
            description: 'Subtítulo no hero da home',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'descricao_meta',
            label: 'Descrição (SEO)',
            description: 'Aparece nos resultados de busca e ao compartilhar o site',
            ui: { component: 'textarea' },
          },
          { type: 'string', name: 'email', label: 'E-mail' },
          { type: 'string', name: 'linkedin_url', label: 'URL do LinkedIn' },
          {
            type: 'image',
            name: 'og_image',
            label: 'Imagem OG (compartilhamento)',
            description: 'Imagem exibida ao compartilhar o site nas redes sociais',
          },
        ],
      },

      {
        name: 'agora',
        label: 'Página Agora',
        path: 'src/content/agora',
        format: 'mdx',
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          { type: 'datetime', name: 'atualizado_em', label: 'Atualizado em', required: true },
          { type: 'rich-text', name: 'body', label: 'Conteúdo', isBody: true },
        ],
      },
    ],
  },
});
