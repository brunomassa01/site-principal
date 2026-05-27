export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const TimelinePartsFragmentDoc = gql`
    fragment TimelineParts on Timeline {
  __typename
  cargo
  empresa
  empresa_url
  inicio
  fim
  local
  tipo
  resumo
  destaques
  tags
  destaque
  body
}
    `;
export const ProjetosPartsFragmentDoc = gql`
    fragment ProjetosParts on Projetos {
  __typename
  titulo
  subtitulo
  status
  inicio
  fim
  cliente
  papel
  resumo
  problema
  abordagem
  resultado
  link
  tags
  destaque
  body
}
    `;
export const SkillsPartsFragmentDoc = gql`
    fragment SkillsParts on Skills {
  __typename
  nome
  categoria
  area
  nivel
  instituicao
  instituicao_url
  ano
  credencial_url
  descricao
  destaque
  body
}
    `;
export const PostsPartsFragmentDoc = gql`
    fragment PostsParts on Posts {
  __typename
  titulo
  resumo
  data
  publicar_em
  capa_url
  tags
  fonte_externa_url
  fonte_externa_nome
  idioma
  rascunho
  body
}
    `;
export const AtualizacoesPartsFragmentDoc = gql`
    fragment AtualizacoesParts on Atualizacoes {
  __typename
  data
  tipo
  titulo
  referencia_slug
  body
}
    `;
export const AgoraPartsFragmentDoc = gql`
    fragment AgoraParts on Agora {
  __typename
  atualizado_em
  body
}
    `;
export const TimelineDocument = gql`
    query timeline($relativePath: String!) {
  timeline(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...TimelineParts
  }
}
    ${TimelinePartsFragmentDoc}`;
export const TimelineConnectionDocument = gql`
    query timelineConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: TimelineFilter) {
  timelineConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...TimelineParts
      }
    }
  }
}
    ${TimelinePartsFragmentDoc}`;
export const ProjetosDocument = gql`
    query projetos($relativePath: String!) {
  projetos(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ProjetosParts
  }
}
    ${ProjetosPartsFragmentDoc}`;
export const ProjetosConnectionDocument = gql`
    query projetosConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ProjetosFilter) {
  projetosConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ProjetosParts
      }
    }
  }
}
    ${ProjetosPartsFragmentDoc}`;
export const SkillsDocument = gql`
    query skills($relativePath: String!) {
  skills(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SkillsParts
  }
}
    ${SkillsPartsFragmentDoc}`;
export const SkillsConnectionDocument = gql`
    query skillsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SkillsFilter) {
  skillsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SkillsParts
      }
    }
  }
}
    ${SkillsPartsFragmentDoc}`;
export const PostsDocument = gql`
    query posts($relativePath: String!) {
  posts(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostsParts
  }
}
    ${PostsPartsFragmentDoc}`;
export const PostsConnectionDocument = gql`
    query postsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PostsFilter) {
  postsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostsParts
      }
    }
  }
}
    ${PostsPartsFragmentDoc}`;
export const AtualizacoesDocument = gql`
    query atualizacoes($relativePath: String!) {
  atualizacoes(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AtualizacoesParts
  }
}
    ${AtualizacoesPartsFragmentDoc}`;
export const AtualizacoesConnectionDocument = gql`
    query atualizacoesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AtualizacoesFilter) {
  atualizacoesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AtualizacoesParts
      }
    }
  }
}
    ${AtualizacoesPartsFragmentDoc}`;
export const AgoraDocument = gql`
    query agora($relativePath: String!) {
  agora(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AgoraParts
  }
}
    ${AgoraPartsFragmentDoc}`;
export const AgoraConnectionDocument = gql`
    query agoraConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AgoraFilter) {
  agoraConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AgoraParts
      }
    }
  }
}
    ${AgoraPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    timeline(variables, options) {
      return requester(TimelineDocument, variables, options);
    },
    timelineConnection(variables, options) {
      return requester(TimelineConnectionDocument, variables, options);
    },
    projetos(variables, options) {
      return requester(ProjetosDocument, variables, options);
    },
    projetosConnection(variables, options) {
      return requester(ProjetosConnectionDocument, variables, options);
    },
    skills(variables, options) {
      return requester(SkillsDocument, variables, options);
    },
    skillsConnection(variables, options) {
      return requester(SkillsConnectionDocument, variables, options);
    },
    posts(variables, options) {
      return requester(PostsDocument, variables, options);
    },
    postsConnection(variables, options) {
      return requester(PostsConnectionDocument, variables, options);
    },
    atualizacoes(variables, options) {
      return requester(AtualizacoesDocument, variables, options);
    },
    atualizacoesConnection(variables, options) {
      return requester(AtualizacoesConnectionDocument, variables, options);
    },
    agora(variables, options) {
      return requester(AgoraDocument, variables, options);
    },
    agoraConnection(variables, options) {
      return requester(AgoraConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "https://content.tinajs.io/2.4/content/d2190664-7e6a-4cbe-b628-14fb41d87433/github/main",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
