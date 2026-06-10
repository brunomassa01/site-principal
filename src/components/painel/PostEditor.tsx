import { useEffect, useState } from 'react';

type Props = { id?: string };

type Form = {
  titulo: string;
  slug: string;
  resumo: string;
  data: string; // yyyy-mm-dd
  publicar_em: string; // datetime-local ou ''
  capa_url: string;
  tags: string; // separadas por vírgula
  idioma: string;
  fonte_externa_url: string;
  fonte_externa_nome: string;
  situacao: string;
  body_markdown: string;
};

const vazio: Form = {
  titulo: '',
  slug: '',
  resumo: '',
  data: new Date().toISOString().slice(0, 10),
  publicar_em: '',
  capa_url: '',
  tags: '',
  idioma: 'pt',
  fonte_externa_url: '',
  fonte_externa_nome: '',
  situacao: 'rascunho',
  body_markdown: '',
};

function paraInputDate(v: string | null): string {
  return v ? new Date(v).toISOString().slice(0, 10) : '';
}
function paraInputDateTime(v: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  // yyyy-mm-ddThh:mm no horário local
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

export default function PostEditor({ id }: Props) {
  const editando = Boolean(id);
  const [f, setF] = useState<Form>(vazio);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const r = await fetch(`/api/painel/posts/${id}`);
      if (!r.ok) {
        setErro('Não foi possível carregar o post.');
        setCarregando(false);
        return;
      }
      const p = await r.json();
      setF({
        titulo: p.titulo ?? '',
        slug: p.slug ?? '',
        resumo: p.resumo ?? '',
        data: paraInputDate(p.data),
        publicar_em: paraInputDateTime(p.publicarEm),
        capa_url: p.capaUrl ?? '',
        tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
        idioma: p.idioma ?? 'pt',
        fonte_externa_url: p.fonteExternaUrl ?? '',
        fonte_externa_nome: p.fonteExternaNome ?? '',
        situacao: p.situacao ?? 'rascunho',
        body_markdown: p.bodyJson?.markdown ?? '',
      });
      setCarregando(false);
    })();
  }, [id]);

  function upd(campo: keyof Form, valor: string) {
    setF((prev) => ({ ...prev, [campo]: valor }));
  }

  async function salvar(situacao?: string) {
    setErro('');
    setSalvando(true);
    const payload = {
      ...f,
      situacao: situacao ?? f.situacao,
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    const url = editando ? `/api/painel/posts/${id}` : '/api/painel/posts';
    const method = editando ? 'PUT' : 'POST';
    const r = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) {
      setErro(data.error ?? 'Erro ao salvar.');
      setSalvando(false);
      return;
    }
    window.location.href = '/painel/posts';
  }

  if (carregando) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';
  const labelCls = 'block text-[13px] font-medium text-apple-label mb-1';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna principal */}
      <div className="lg:col-span-2 space-y-4">
        {erro && <div className="rounded-lg bg-red-50 text-red-700 text-[13px] px-3 py-2">{erro}</div>}

        <div>
          <label className={labelCls}>Título *</label>
          <input className={inputCls} value={f.titulo} onChange={(e) => upd('titulo', e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Resumo *</label>
          <textarea className={`${inputCls} min-h-[70px]`} value={f.resumo} onChange={(e) => upd('resumo', e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Conteúdo (Markdown)</label>
          <textarea
            className={`${inputCls} min-h-[420px] font-mono text-[13px] leading-relaxed`}
            value={f.body_markdown}
            onChange={(e) => upd('body_markdown', e.target.value)}
            placeholder={'Escreva em Markdown.\n\n## Subtítulo\n\nParágrafo com **negrito** e [link](https://...).'}
          />
          <p className="text-[12px] text-apple-tertiary mt-1">
            Markdown: <code>## título</code>, <code>**negrito**</code>, <code>[link](url)</code>, listas com <code>-</code>. Vídeo: <code>&lt;VideoEmbed src="/videos/x.mp4" legenda="..." /&gt;</code>
          </p>
        </div>
      </div>

      {/* Coluna lateral */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div>
            <label className={labelCls}>Situação</label>
            <select className={inputCls} value={f.situacao} onChange={(e) => upd('situacao', e.target.value)}>
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Data</label>
            <input type="date" className={inputCls} value={f.data} onChange={(e) => upd('data', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Agendar publicação (opcional)</label>
            <input type="datetime-local" className={inputCls} value={f.publicar_em} onChange={(e) => upd('publicar_em', e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => salvar('publicado')}
              disabled={salvando}
              className="flex-1 py-2.5 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black disabled:opacity-60"
            >
              {salvando ? 'Salvando…' : 'Publicar'}
            </button>
            <button
              onClick={() => salvar('rascunho')}
              disabled={salvando}
              className="px-4 py-2.5 rounded-full border border-apple-separator text-[14px] text-apple-secondary hover:bg-apple-fill disabled:opacity-60"
            >
              Rascunho
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input className={inputCls} value={f.slug} onChange={(e) => upd('slug', e.target.value)} placeholder="gerado do título" />
          </div>
          <div>
            <label className={labelCls}>Tags (separadas por vírgula)</label>
            <input className={inputCls} value={f.tags} onChange={(e) => upd('tags', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Imagem de capa (URL)</label>
            <input className={inputCls} value={f.capa_url} onChange={(e) => upd('capa_url', e.target.value)} placeholder="/images/posts/..." />
          </div>
          <div>
            <label className={labelCls}>Idioma</label>
            <select className={inputCls} value={f.idioma} onChange={(e) => upd('idioma', e.target.value)}>
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Fonte externa — URL (opcional)</label>
            <input className={inputCls} value={f.fonte_externa_url} onChange={(e) => upd('fonte_externa_url', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Fonte externa — nome</label>
            <input className={inputCls} value={f.fonte_externa_nome} onChange={(e) => upd('fonte_externa_nome', e.target.value)} placeholder="LinkedIn, Medium…" />
          </div>
        </div>
      </div>
    </div>
  );
}
