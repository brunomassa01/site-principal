// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: process.env.HEAD ?? process.env.VERCEL_GIT_COMMIT_REF ?? "main",
  clientId: process.env.TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "timeline",
        label: "Trajet\xF3ria",
        path: "src/content/timeline",
        format: "mdx",
        ui: {
          filename: {
            readonly: false,
            slugify: (v) => `${v?.cargo ?? ""}-${v?.empresa ?? ""}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
          }
        },
        fields: [
          { type: "string", name: "cargo", label: "Cargo", isTitle: true, required: true },
          { type: "string", name: "empresa", label: "Empresa", required: true },
          { type: "string", name: "empresa_url", label: "URL da Empresa" },
          { type: "datetime", name: "inicio", label: "In\xEDcio", required: true },
          { type: "datetime", name: "fim", label: "Fim (vazio = atual)" },
          { type: "string", name: "local", label: "Local", description: "Ex: S\xE3o Paulo / Remoto" },
          {
            type: "string",
            name: "tipo",
            label: "Tipo de contrato",
            options: [
              { label: "\u2014", value: "" },
              { label: "CLT", value: "clt" },
              { label: "PJ", value: "pj" },
              { label: "S\xF3cio", value: "socio" },
              { label: "Consultoria", value: "consultoria" },
              { label: "Freelancer", value: "freelancer" },
              { label: "Volunt\xE1rio", value: "voluntario" }
            ]
          },
          {
            type: "string",
            name: "resumo",
            label: "Resumo",
            description: "1-2 frases \u2014 aparece no card da trajet\xF3ria",
            ui: { component: "textarea" }
          },
          {
            type: "string",
            name: "destaques",
            label: "Destaques",
            description: "Entregas e conquistas em bullet points",
            list: true
          },
          { type: "string", name: "tags", label: "Tags", list: true },
          {
            type: "boolean",
            name: "destaque",
            label: "Aparecer em destaque na home"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Texto longo (opcional)",
            isBody: true
          }
        ]
      },
      {
        name: "projetos",
        label: "Projetos",
        path: "src/content/projetos",
        format: "mdx",
        ui: {
          filename: {
            readonly: false,
            slugify: (v) => (v?.titulo ?? "novo-projeto").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
          }
        },
        fields: [
          { type: "string", name: "titulo", label: "T\xEDtulo", isTitle: true, required: true },
          { type: "string", name: "subtitulo", label: "Subt\xEDtulo" },
          {
            type: "string",
            name: "status",
            label: "Status",
            required: true,
            options: [
              { label: "Em andamento", value: "em-andamento" },
              { label: "Conclu\xEDdo", value: "concluido" },
              { label: "Em pausa", value: "em-pausa" },
              { label: "Arquivado", value: "arquivado" }
            ]
          },
          { type: "datetime", name: "inicio", label: "In\xEDcio", required: true },
          { type: "datetime", name: "fim", label: "Fim" },
          { type: "string", name: "cliente", label: "Cliente / Empresa" },
          {
            type: "string",
            name: "papel",
            label: "Papel",
            description: "Ex: L\xEDder de projeto, Consultor, Idealizador",
            required: true
          },
          {
            type: "string",
            name: "resumo",
            label: "Resumo",
            description: "1-3 frases \u2014 aparece no card",
            ui: { component: "textarea" },
            required: true
          },
          {
            type: "string",
            name: "problema",
            label: "Problema",
            description: "Qual problema o projeto resolve",
            ui: { component: "textarea" }
          },
          {
            type: "string",
            name: "abordagem",
            label: "Abordagem",
            description: "Como foi executado",
            ui: { component: "textarea" }
          },
          {
            type: "string",
            name: "resultado",
            label: "Resultado",
            description: "Resultados concretos com n\xFAmeros",
            ui: { component: "textarea" }
          },
          { type: "string", name: "link", label: "Link externo" },
          { type: "string", name: "tags", label: "Tags", list: true },
          { type: "boolean", name: "destaque", label: "Aparecer em destaque na home" },
          {
            type: "rich-text",
            name: "body",
            label: "Case completo",
            isBody: true,
            templates: [
              {
                name: "VideoEmbed",
                label: "V\xEDdeo",
                fields: [
                  { type: "string", name: "src", label: "Caminho do v\xEDdeo", required: true },
                  { type: "string", name: "legenda", label: "Legenda" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "skills",
        label: "Skills",
        path: "src/content/skills",
        format: "mdx",
        ui: {
          filename: {
            readonly: false,
            slugify: (v) => (v?.nome ?? "nova-skill").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
          }
        },
        fields: [
          { type: "string", name: "nome", label: "Nome", isTitle: true, required: true },
          {
            type: "string",
            name: "categoria",
            label: "Categoria",
            required: true,
            options: [
              { label: "Habilidade", value: "habilidade" },
              { label: "Certifica\xE7\xE3o", value: "certificacao" },
              { label: "Forma\xE7\xE3o", value: "formacao" },
              { label: "Idioma", value: "idioma" }
            ]
          },
          {
            type: "string",
            name: "area",
            label: "\xC1rea",
            description: "Ex: Gest\xE3o, Dados, Performance, Tecnologia",
            required: true
          },
          {
            type: "string",
            name: "nivel",
            label: "N\xEDvel",
            options: [
              { label: "\u2014", value: "" },
              { label: "B\xE1sico", value: "basico" },
              { label: "Intermedi\xE1rio", value: "intermediario" },
              { label: "Avan\xE7ado", value: "avancado" },
              { label: "Especialista", value: "especialista" }
            ]
          },
          { type: "string", name: "instituicao", label: "Institui\xE7\xE3o" },
          { type: "string", name: "instituicao_url", label: "URL da Institui\xE7\xE3o" },
          { type: "number", name: "ano", label: "Ano" },
          { type: "string", name: "credencial_url", label: "URL da Credencial" },
          {
            type: "string",
            name: "descricao",
            label: "Descri\xE7\xE3o",
            ui: { component: "textarea" }
          },
          { type: "boolean", name: "destaque", label: "Destaque" },
          {
            type: "rich-text",
            name: "body",
            label: "Notas adicionais",
            isBody: true
          }
        ]
      },
      {
        name: "posts",
        label: "Posts",
        path: "src/content/posts",
        format: "mdx",
        ui: {
          filename: {
            readonly: false,
            slugify: (v) => (v?.titulo ?? "novo-post").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
          }
        },
        fields: [
          { type: "string", name: "titulo", label: "T\xEDtulo", isTitle: true, required: true },
          {
            type: "string",
            name: "resumo",
            label: "Resumo",
            description: "Aparece no card e no meta description",
            ui: { component: "textarea" },
            required: true
          },
          { type: "datetime", name: "data", label: "Data de publica\xE7\xE3o", required: true },
          {
            type: "datetime",
            name: "publicar_em",
            label: "Agendar publica\xE7\xE3o",
            description: "Se preenchido, o post s\xF3 aparece a partir desta data"
          },
          { type: "image", name: "capa_url", label: "Imagem de capa" },
          { type: "string", name: "tags", label: "Tags", list: true },
          {
            type: "string",
            name: "fonte_externa_url",
            label: "URL da fonte externa",
            description: "Se for republica\xE7\xE3o de LinkedIn, Medium etc."
          },
          {
            type: "string",
            name: "fonte_externa_nome",
            label: "Nome da fonte",
            description: "Ex: LinkedIn, Medium"
          },
          {
            type: "string",
            name: "idioma",
            label: "Idioma",
            options: [
              { label: "Portugu\xEAs", value: "pt" },
              { label: "English", value: "en" }
            ]
          },
          { type: "boolean", name: "rascunho", label: "Salvar como rascunho (n\xE3o aparece no site)" },
          {
            type: "rich-text",
            name: "body",
            label: "Conte\xFAdo",
            isBody: true,
            templates: [
              {
                name: "VideoEmbed",
                label: "V\xEDdeo",
                fields: [
                  { type: "string", name: "src", label: "Caminho do v\xEDdeo", required: true },
                  { type: "string", name: "legenda", label: "Legenda" }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "atualizacoes",
        label: "Atualiza\xE7\xF5es",
        path: "src/content/atualizacoes",
        format: "mdx",
        ui: {
          filename: {
            readonly: false,
            slugify: (v) => (v?.titulo ?? "nova-atualizacao").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
          }
        },
        fields: [
          { type: "datetime", name: "data", label: "Data", required: true },
          {
            type: "string",
            name: "tipo",
            label: "Tipo",
            required: true,
            options: [
              { label: "Projeto", value: "projeto" },
              { label: "Certifica\xE7\xE3o", value: "certificacao" },
              { label: "Cargo", value: "cargo" },
              { label: "Post", value: "post" },
              { label: "Marco", value: "marco" },
              { label: "Outro", value: "outro" }
            ]
          },
          { type: "string", name: "titulo", label: "T\xEDtulo", isTitle: true, required: true },
          {
            type: "string",
            name: "referencia_slug",
            label: "Refer\xEAncia (slug)",
            description: "Slug do projeto, post ou cargo relacionado"
          },
          { type: "rich-text", name: "body", label: "Detalhes", isBody: true }
        ]
      },
      {
        name: "agora",
        label: "P\xE1gina Agora",
        path: "src/content/agora",
        format: "mdx",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          { type: "datetime", name: "atualizado_em", label: "Atualizado em", required: true },
          { type: "rich-text", name: "body", label: "Conte\xFAdo", isBody: true }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
