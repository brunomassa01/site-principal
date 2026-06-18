/**
 * Expande a tag-sentinela <video-embed src="" legenda=""> no HTML salvo para o markup final.
 * - YouTube / Vimeo  -> iframe responsivo (16:9)
 * - arquivo / .mp4    -> <video> nativo (componente VideoEmbed)
 */

// Detecta o tipo do vídeo a partir da URL e devolve a URL de embed quando for iframe.
export function videoEmbedDe(url: string): { tipo: 'iframe' | 'video'; src: string } {
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  if (m) return { tipo: 'iframe', src: `https://www.youtube.com/embed/${m[1]}` };
  m = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (m) return { tipo: 'iframe', src: `https://player.vimeo.com/video/${m[1]}` };
  return { tipo: 'video', src: url };
}

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
      const { tipo, src: embedSrc } = videoEmbedDe(src);
      if (tipo === 'iframe') {
        return `<figure class="my-8"><div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;background:#000;"><iframe src="${embedSrc}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>${caption}</figure>`;
      }
      return `<figure class="my-8"><video controls playsinline preload="metadata" class="w-full rounded-2xl shadow-card bg-black" style="max-height:540px;"><source src="${embedSrc}" /></video>${caption}</figure>`;
    },
  );
}
