/**
 * Expande a tag-sentinela <video-embed src="" legenda=""> no HTML salvo
 * para o markup do componente VideoEmbed (figure + video).
 */
export function renderBody(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(
    /<video-embed\b([^>]*)>\s*(?:<\/video-embed>)?/gi,
    (_m, attrs: string) => {
      const src = (attrs.match(/src=["']([^"']*)["']/i) || [])[1] || '';
      const legenda = (attrs.match(/legenda=["']([^"']*)["']/i) || [])[1] || '';
      if (!src) return '';
      const caption = legenda
        ? `<figcaption class="mt-2 text-center text-[13px] text-apple-tertiary">${legenda}</figcaption>`
        : '';
      return `<figure class="my-8"><video controls playsinline preload="metadata" class="w-full rounded-2xl shadow-card bg-black" style="max-height:540px;"><source src="${src}" type="video/mp4" /></video>${caption}</figure>`;
    },
  );
}
