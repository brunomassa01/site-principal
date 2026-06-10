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
      const v = document.createElement('video');
      v.src = (node.attrs.src as string) || '';
      v.controls = true;
      v.style.cssText = 'max-width:100%;border-radius:12px;background:#000;';
      dom.appendChild(v);
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
