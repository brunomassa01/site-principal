import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Nó Tiptap para o componente de vídeo do site (<video-embed src="" legenda="">).
 * Garante que os vídeos existentes sobrevivam à edição (round-trip) e renderiza
 * uma prévia dentro do editor.
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attrs: { src: string; legenda?: string }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      legenda: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'video-embed' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video-embed', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.contentEditable = 'false';
      dom.style.cssText = 'margin:1em 0;';
      const src = (node.attrs.src as string) || '';
      const yt = src.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
      const vm = src.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
      const embed = yt ? `https://www.youtube.com/embed/${yt[1]}` : vm ? `https://player.vimeo.com/video/${vm[1]}` : '';
      if (embed) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;padding-bottom:56.25%;height:0;border-radius:12px;overflow:hidden;background:#000;';
        const ifr = document.createElement('iframe');
        ifr.src = embed;
        ifr.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
        ifr.setAttribute('allowfullscreen', 'true');
        wrap.appendChild(ifr);
        dom.appendChild(wrap);
      } else {
        const v = document.createElement('video');
        v.src = src;
        v.controls = true;
        v.style.cssText = 'max-width:100%;border-radius:12px;background:#000;';
        dom.appendChild(v);
      }
      if (node.attrs.legenda) {
        const cap = document.createElement('div');
        cap.textContent = node.attrs.legenda as string;
        cap.style.cssText = 'text-align:center;font-size:13px;color:#6e6e73;margin-top:4px;';
        dom.appendChild(cap);
      }
      return { dom };
    };
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export default VideoEmbed;
