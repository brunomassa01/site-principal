import { defineCollection, z } from 'astro:content';

/**
 * Coleções de conteúdo do currículo vivo.
 * Cada coleção tem um schema (validação) e um diretório em src/content/.
 * O Decap CMS edita esses arquivos via /admin.
 */

// Timeline da carreira — cada arquivo é um cargo ou marco profissional
const timeline = defineCollection({
  type: 'content',
  schema: z.object({
    cargo: z.string(),
    empresa: z.string(),
    empresa_url: z.string().url().optional(),
    inicio: z.date(),
    fim: z.date().optional(), // vazio = atual
    local: z.string().optional(), // ex: "São Paulo / Remoto"
    tipo: z.enum(['clt', 'pj', 'socio', 'consultoria', 'freelancer', 'voluntario']).optional(),
    resumo: z.string(), // 1-2 frases
    destaques: z.array(z.string()).optional(), // bullets de entregas/conquistas
    tags: z.array(z.string()).optional(),
    destaque: z.boolean().default(false), // aparece em destaque na home?
  }),
});

// Projetos — cada arquivo é um projeto com case completo
const projetos = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    titulo: z.string(),
    subtitulo: z.string().optional(),
    status: z.enum(['em-andamento', 'concluido', 'em-pausa', 'arquivado']),
    inicio: z.date(),
    fim: z.date().optional(),
    cliente: z.string().optional(),
    papel: z.string(), // ex: "Líder de projeto", "Consultor", "Idealizador"
    resumo: z.string(), // 1-3 frases (aparece em card)
    problema: z.string().optional(),
    abordagem: z.string().optional(),
    resultado: z.string().optional(),
    capa: image().optional(),
    galeria: z.array(image()).optional(),
    link: z.string().url().optional(),
    repo: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    destaque: z.boolean().default(false),
  }),
});

// Skills, certificações e formações
const skills = defineCollection({
  type: 'content',
  schema: z.object({
    nome: z.string(),
    categoria: z.enum(['habilidade', 'certificacao', 'formacao', 'idioma']),
    area: z.string(), // ex: "Gestão", "Dados", "Finanças", "Tecnologia"
    nivel: z.enum(['basico', 'intermediario', 'avancado', 'especialista']).optional(),
    instituicao: z.string().optional(),
    instituicao_url: z.string().url().optional(),
    ano: z.number().optional(),
    validade: z.date().optional(),
    credencial_url: z.string().url().optional(),
    descricao: z.string().optional(),
    destaque: z.boolean().default(false),
  }),
});

// Posts / conteúdo autoral — texto longo do próprio site
const posts = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    titulo: z.string(),
    resumo: z.string(),
    data: z.date(),
    autor: z.string().default('Bruno Massa'),
    capa: image().optional(),
    capa_url: z.string().optional(), // path público, ex: /images/posts/nome.jpg
    tags: z.array(z.string()).optional(),
    fonte_externa_url: z.string().url().optional(), // se for republicação de LinkedIn/Medium
    fonte_externa_nome: z.string().optional(),
    idioma: z.enum(['pt', 'en']).default('pt'),
    rascunho: z.boolean().default(false),
  }),
});

// Página /agora — apenas um arquivo único editado mensalmente
const agora = defineCollection({
  type: 'content',
  schema: z.object({
    atualizado_em: z.date(),
  }),
});

// Atualizações curtas — feed cronológico tipo "linha do tempo social"
// Cada arquivo é uma nota curta: "tirei certificação X", "lancei projeto Y"
const atualizacoes = defineCollection({
  type: 'content',
  schema: z.object({
    data: z.date(),
    tipo: z.enum(['projeto', 'certificacao', 'cargo', 'post', 'marco', 'outro']),
    titulo: z.string(),
    referencia_slug: z.string().optional(), // link interno para coleção relacionada
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
