import { defineCollection, z } from 'astro:content';

const timeline = defineCollection({
  type: 'content',
  schema: z.object({
    cargo: z.string(),
    empresa: z.string(),
    empresa_url: z.string().url().optional(),
    inicio: z.coerce.date(),
    fim: z.coerce.date().optional(),
    local: z.string().optional(),
    tipo: z.enum(['clt', 'pj', 'socio', 'consultoria', 'freelancer', 'voluntario', '']).optional(),
    resumo: z.string(),
    destaques: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    destaque: z.boolean().default(false),
  }),
});

const projetos = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string().optional(),
    status: z.enum(['em-andamento', 'concluido', 'em-pausa', 'arquivado']),
    inicio: z.coerce.date(),
    fim: z.coerce.date().optional(),
    cliente: z.string().optional(),
    papel: z.string(),
    resumo: z.string(),
    problema: z.string().optional(),
    abordagem: z.string().optional(),
    resultado: z.string().optional(),
    link: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    destaque: z.boolean().default(false),
  }),
});

const skills = defineCollection({
  type: 'content',
  schema: z.object({
    nome: z.string(),
    categoria: z.enum(['habilidade', 'certificacao', 'formacao', 'idioma']),
    area: z.string(),
    nivel: z.enum(['basico', 'intermediario', 'avancado', 'especialista', '']).optional(),
    instituicao: z.string().optional(),
    instituicao_url: z.string().url().optional(),
    ano: z.number().optional(),
    credencial_url: z.string().url().optional(),
    descricao: z.string().optional(),
    destaque: z.boolean().default(false),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    resumo: z.string(),
    data: z.coerce.date(),
    publicar_em: z.coerce.date().optional(),
    capa_url: z.string().optional(),
    tags: z.array(z.string()).optional(),
    fonte_externa_url: z.string().url().optional(),
    fonte_externa_nome: z.string().optional(),
    idioma: z.enum(['pt', 'en']).default('pt'),
    rascunho: z.boolean().default(false),
  }),
});

const agora = defineCollection({
  type: 'content',
  schema: z.object({
    atualizado_em: z.coerce.date(),
  }),
});

const atualizacoes = defineCollection({
  type: 'content',
  schema: z.object({
    data: z.coerce.date(),
    tipo: z.enum(['projeto', 'certificacao', 'cargo', 'post', 'marco', 'outro']),
    titulo: z.string(),
    referencia_slug: z.string().optional(),
  }),
});

export const collections = {
  timeline,
  projetos,
  skills,
  posts,
  agora,
  atualizacoes,
};
