// Configuração declarativa das coleções do Painel (Fase 2).
// Um único lugar define campos, tipos e rótulos; a API e a UI são genéricas.

export type FieldType =
  | 'text' | 'textarea' | 'date' | 'datetime' | 'number'
  | 'boolean' | 'select' | 'tags' | 'list' | 'image';

export type Field = {
  name: string;        // = coluna do banco (camelCase)
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  required?: boolean;
};

export type Collection = {
  name: string;        // chave da coleção (= rota /painel/<name>)
  label: string;       // plural, menu
  singular: string;
  singleton?: boolean; // registro único (Identidade, Agora)
  titleField: string;  // campo usado como título na lista e para o slug
  subField?: string;   // campo secundário mostrado na lista
  slug?: boolean;      // tem slug
  situacao?: boolean;  // tem rascunho/publicado/arquivado
  body?: boolean;      // tem texto rico (body_html/body_json)
  fields: Field[];
};

const TIPO_CONTRATO = [
  { value: '', label: '—' },
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'socio', label: 'Sócio' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'voluntario', label: 'Voluntário' },
];

export const collections: Record<string, Collection> = {
  timeline: {
    name: 'timeline', label: 'Trajetória', singular: 'Experiência',
    titleField: 'cargo', subField: 'empresa', slug: true, situacao: true, body: true,
    fields: [
      { name: 'cargo', label: 'Cargo', type: 'text', required: true },
      { name: 'empresa', label: 'Empresa', type: 'text', required: true },
      { name: 'empresaUrl', label: 'URL da empresa', type: 'text' },
      { name: 'inicio', label: 'Início', type: 'date', required: true },
      { name: 'fim', label: 'Fim (vazio = atual)', type: 'date' },
      { name: 'local', label: 'Local', type: 'text', placeholder: 'São Paulo / Remoto' },
      { name: 'tipo', label: 'Tipo de contrato', type: 'select', options: TIPO_CONTRATO },
      { name: 'resumo', label: 'Resumo', type: 'textarea', help: '1-2 frases — aparece no card' },
      { name: 'destaques', label: 'Destaques (um por linha)', type: 'list' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'destaque', label: 'Destaque na home', type: 'boolean' },
    ],
  },
  projetos: {
    name: 'projetos', label: 'Projetos', singular: 'Projeto',
    titleField: 'titulo', subField: 'cliente', slug: true, situacao: true, body: true,
    fields: [
      { name: 'titulo', label: 'Título', type: 'text', required: true },
      { name: 'subtitulo', label: 'Subtítulo', type: 'text' },
      {
        name: 'status', label: 'Status do projeto', type: 'select', required: true, options: [
          { value: 'em-andamento', label: 'Em andamento' },
          { value: 'concluido', label: 'Concluído' },
          { value: 'em-pausa', label: 'Em pausa' },
          { value: 'arquivado', label: 'Arquivado' },
        ],
      },
      { name: 'inicio', label: 'Início', type: 'date', required: true },
      { name: 'fim', label: 'Fim', type: 'date' },
      { name: 'cliente', label: 'Cliente / Empresa', type: 'text' },
      { name: 'papel', label: 'Papel', type: 'text', placeholder: 'Líder, Consultor…' },
      { name: 'resumo', label: 'Resumo', type: 'textarea', required: true, help: '1-3 frases — aparece no card' },
      { name: 'problema', label: 'Problema', type: 'textarea' },
      { name: 'abordagem', label: 'Abordagem', type: 'textarea' },
      { name: 'resultado', label: 'Resultado', type: 'textarea', help: 'Resultados concretos com números' },
      { name: 'link', label: 'Link externo', type: 'text' },
      { name: 'repo', label: 'Repositório', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'destaque', label: 'Destaque na home', type: 'boolean' },
    ],
  },
  skills: {
    name: 'skills', label: 'Skills', singular: 'Skill',
    titleField: 'nome', subField: 'area', slug: true, situacao: true, body: true,
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      {
        name: 'categoria', label: 'Categoria', type: 'select', required: true, options: [
          { value: 'habilidade', label: 'Habilidade' },
          { value: 'certificacao', label: 'Certificação' },
          { value: 'formacao', label: 'Formação' },
          { value: 'idioma', label: 'Idioma' },
        ],
      },
      { name: 'area', label: 'Área', type: 'text', required: true, placeholder: 'Gestão, Dados…' },
      {
        name: 'nivel', label: 'Nível', type: 'select', options: [
          { value: '', label: '—' },
          { value: 'basico', label: 'Básico' },
          { value: 'intermediario', label: 'Intermediário' },
          { value: 'avancado', label: 'Avançado' },
          { value: 'especialista', label: 'Especialista' },
        ],
      },
      { name: 'instituicao', label: 'Instituição', type: 'text' },
      { name: 'instituicaoUrl', label: 'URL da instituição', type: 'text' },
      { name: 'ano', label: 'Ano', type: 'number' },
      { name: 'credencialUrl', label: 'URL da credencial', type: 'text' },
      { name: 'descricao', label: 'Descrição', type: 'textarea' },
      { name: 'destaque', label: 'Destaque', type: 'boolean' },
    ],
  },
  agora: {
    name: 'agora', label: 'Agora', singular: 'Página Agora', singleton: true,
    titleField: 'id', body: true,
    fields: [
      { name: 'atualizadoEm', label: 'Atualizado em', type: 'date', required: true },
    ],
  },
  identidade: {
    name: 'identidade', label: 'Identidade', singular: 'Identidade', singleton: true,
    titleField: 'nome',
    fields: [
      { name: 'nome', label: 'Nome', type: 'text', required: true },
      { name: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Marketing · Produto · Negócios' },
      { name: 'slogan', label: 'Frase de efeito', type: 'textarea' },
      { name: 'bioCurta', label: 'Bio curta', type: 'textarea', help: 'Subtítulo no hero da home' },
      { name: 'descricaoMeta', label: 'Descrição (SEO)', type: 'textarea' },
      { name: 'email', label: 'E-mail', type: 'text' },
      { name: 'linkedinUrl', label: 'URL do LinkedIn', type: 'text' },
      { name: 'ogImage', label: 'Imagem de compartilhamento', type: 'image' },
    ],
  },
};

export function getCollection(name: string): Collection | undefined {
  return collections[name];
}
