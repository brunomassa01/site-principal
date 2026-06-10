import { marked } from 'marked';

/**
 * Converte o Markdown do editor em HTML para salvar no banco.
 * Antes, troca o componente <VideoEmbed .../> pela tag-sentinela <video-embed>,
 * que o renderBody() expande no site (mesmo caminho do editor rico da Fase 3).
 */
export function mdToHtml(md: string): string {
  const withSentinels = (md ?? '').replace(
    /<VideoEmbed\s+([^>]*?)\/?>/gi,
    (_m, attrs) => `\n<video-embed ${attrs}></video-embed>\n`,
  );
  return marked.parse(withSentinels, { async: false }) as string;
}

export function slugify(s: string): string {
  return (
    (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'post'
  );
}
