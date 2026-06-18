import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useState } from 'react';
import VideoEmbed from './extensions/VideoEmbed';

type Props = {
  value: string;
  onChange: (html: string, json: unknown) => void;
  onImageUpload?: (file: File) => Promise<string | null>;
};

function Btn({
  onClick,
  active,
  title,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[34px] h-[34px] px-2 rounded-md text-[14px] font-medium transition-colors disabled:opacity-40 ${
        active ? 'bg-apple-label text-white' : 'text-apple-secondary hover:bg-apple-fill'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onPickImage, onAddVideo, enviando }: { editor: Editor; onPickImage: () => void; onAddVideo: () => void; enviando: boolean }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Endereço do link (URL):', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-apple-separator px-2 py-1.5 sticky top-0 bg-white rounded-t-lg z-10">
      <Btn title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><strong>B</strong></Btn>
      <Btn title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><em>I</em></Btn>
      <Btn title="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><span className="underline">U</span></Btn>
      <span className="w-px h-5 bg-apple-separator mx-1" />
      <Btn title="Título" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</Btn>
      <Btn title="Subtítulo" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</Btn>
      <span className="w-px h-5 bg-apple-separator mx-1" />
      <Btn title="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>•</Btn>
      <Btn title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1.</Btn>
      <Btn title="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>❝</Btn>
      <span className="w-px h-5 bg-apple-separator mx-1" />
      <Btn title="Link" onClick={setLink} active={editor.isActive('link')}>🔗</Btn>
      <Btn title="Inserir imagem" onClick={onPickImage} disabled={enviando}>{enviando ? '…' : '🖼'}</Btn>
      <Btn title="Inserir vídeo (link do YouTube/Vimeo/.mp4 ou arquivo)" onClick={onAddVideo} disabled={enviando}>🎬</Btn>
      <span className="flex-1" />
      <Btn title="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↶</Btn>
      <Btn title="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↷</Btn>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, onImageUpload }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
      VideoEmbed,
      Placeholder.configure({ placeholder: 'Escreva aqui… use a barra acima para formatar e inserir imagens.' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.getJSON()),
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor || !onImageUpload) return;
    setEnviando(true);
    try {
      const url = await onImageUpload(file);
      if (url) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } finally {
      setEnviando(false);
    }
  }

  function addVideo() {
    if (!editor) return;
    const url = window.prompt('Cole o link do vídeo (YouTube, Vimeo ou .mp4 direto).\n\nPara ENVIAR UM ARQUIVO de vídeo, deixe em branco e clique OK (máx ~4MB).');
    if (url === null) return;
    const u = url.trim();
    if (u) { editor.chain().focus().setVideoEmbed({ src: u }).run(); return; }
    videoFileRef.current?.click();
  }
  async function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor || !onImageUpload) return;
    setEnviando(true);
    try {
      const url = await onImageUpload(file);
      if (url) editor.chain().focus().setVideoEmbed({ src: url }).run();
      else alert('Não consegui enviar o vídeo (talvez grande demais — máx ~4MB; pra vídeo maior, use um link do YouTube/Vimeo).');
    } finally {
      setEnviando(false);
    }
  }

  if (!editor) return <div className="text-apple-secondary text-[14px] p-3">Carregando editor…</div>;

  return (
    <div className="painel-editor bg-white rounded-lg border border-apple-separator">
      <Toolbar editor={editor} onPickImage={() => fileRef.current?.click()} onAddVideo={addVideo} enviando={enviando} />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <input ref={videoFileRef} type="file" accept="video/*" hidden onChange={handleVideoFile} />
      <EditorContent editor={editor} />
      <style>{`
        .painel-editor .ProseMirror { min-height: 380px; padding: 16px 18px; outline: none; font-size: 16px; line-height: 1.7; color: #1d1d1f; }
        .painel-editor .ProseMirror p { margin: 0 0 1em; }
        .painel-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 1.2em 0 .5em; letter-spacing: -0.01em; }
        .painel-editor .ProseMirror h3 { font-size: 1.2em; font-weight: 700; margin: 1em 0 .4em; }
        .painel-editor .ProseMirror ul { list-style: disc; padding-left: 1.4em; margin: 0 0 1em; }
        .painel-editor .ProseMirror ol { list-style: decimal; padding-left: 1.4em; margin: 0 0 1em; }
        .painel-editor .ProseMirror blockquote { border-left: 3px solid #d2d2d7; padding-left: 1em; color: #6e6e73; margin: 0 0 1em; }
        .painel-editor .ProseMirror a { color: #0066cc; text-decoration: underline; }
        .painel-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 12px; margin: 1em 0; }
        .painel-editor .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #aeaeb2; float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  );
}
