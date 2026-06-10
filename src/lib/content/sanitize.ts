import sanitizeHtml from 'sanitize-html';

/** Limpa o HTML vindo do editor antes de salvar no banco. Mantém só o que o editor produz. */
export function sanitizeBody(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h2', 'h3', 'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'figure', 'figcaption', 'video', 'source', 'video-embed',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'class', 'width', 'height'],
      'video-embed': ['src', 'legenda'],
      video: ['controls', 'playsinline', 'preload', 'class', 'style'],
      source: ['src', 'type'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // permite a tag custom <video-embed> não-padrão
    allowVulnerableTags: false,
  });
}
