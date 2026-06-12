import { useEffect, useState } from 'react';
import RichTextEditor from './RichTextEditor';

type Props = { id?: string };

type Form = {
  titulo: string;
  slug: string;
  resumo: string;
  data: string;
  publicar_em: string;
  capa_url: string;
  tags: string;
  idioma: string;
  fonte_externa_url: string;
  fonte_externa_nome: string;
  situacao: string;
  bodyHtml: string;
  bodyJson: unknown;
};

const vazio: Form = {
  titulo: '', slug: '', resumo: '',
  data: new Date().toISOString().slice(0, 10),
  publicar_em: '', capa_url: '', tags: '', idioma: 'pt',
  fonte_externa_url: '', fonte_externa_nome: '', situacao: 'rascunho',
  bodyHtml: '', bodyJson: null,
};

function paraInputDate(v: string | null): string {
  return v ? new Date(v).toISOString().slice(0, 10) : '';
}
function paraInputDateTime(v: string | null): string {
  if (!v) return '';
  const d = new Date(v);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

// Otimiza a imagem no navegador (reduz dimensão e converte p/ webp) antes de enviar.
async function otimizar(file: File): Promise<File> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const maxW = 1600;
    const scale = Math.min(1, maxW / bmp.width);
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
    if (!blob) return file;
    const nome = file.name.replace(/\.\w+$/, '') + '.webp';
    return new File([blob], nome, { type: 'image/webp' });
  } catch {
    return file;
  }
}

async function enviarImagem(file: File): Promise<string | null> {
  try {
    const otimizada = await otimizar(file);
    const fd = new FormData();
    fd.append('file', otimizada);
    const r = await fetch('/api/painel/upload', { method: 'POST', body: fd });
    const d = await r.json();
    if (!r.ok) {
      alert(d.error || 'Falha ao enviar a imagem.');
      return null;
    }
    return d.url as string;
  } catch (e) {
    alert('Falha ao enviar a imagem: ' + (e as Error).message);
    return null;
  }
}

export default function PostEditor({ id }: Props) {
  const editando = Boolean(id);
  const [f, setF] = useState<Form>(vazio);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [gerandoCapaIA, setGerandoCapaIA] = useState(false);
  const [avancado, setAvancado] = useState(false);

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
        bodyHtml: p.bodyHtml ?? '',
        bodyJson: p.bodyJson ?? null,
      });
      setCarregando(false);
    })();
  }, [id]);

  function upd(campo: keyof Form, valor: string) {
    setF((p) => ({ ...p, [campo]: valor }));
  }

  async function trocarCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEnviandoCapa(true);
    const url = await enviarImagem(file);
    setEnviandoCapa(false);
    if (url) setF((p) => ({ ...p, capa_url: url }));
  }
  async function gerarCapaIA() {
    if (!f.titulo.trim()) { alert('Escreva o título primeiro — a IA usa ele como tema da capa.'); return; }
    setGerandoCapaIA(true);
    const r = await fetch('/api/painel/posts/gerar-capa', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ titulo: f.titulo }) });
    const j = await r.json().catch(() => ({}));
    setGerandoCapaIA(false);
    if (j.url) setF((p) => ({ ...p, capa_url: j.url }));
    else alert(j.error || 'Não foi possível gerar a capa.');
  }

  async function salvar(situacao?: string) {
    setErro('');
    setSalvando(true);
    const payload = {
      titulo: f.titulo,
      slug: f.slug,
      resumo: f.resumo,
      data: f.data,
      publicar_em: f.publicar_em,
      capa_url: f.capa_url,
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean),
      idioma: f.idioma,
      fonte_externa_url: f.fonte_externa_url,
      fonte_externa_nome: f.fonte_externa_nome,
      situacao: situacao ?? f.situacao,
      body_html: f.bodyHtml,
      body_json: f.bodyJson,
    };
    const url = editando ? `/api/painel/posts/${id}` : '/api/painel/posts';
    const r = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
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

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';
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
          <textarea className={`${inputCls} min-h-[64px]`} value={f.resumo} onChange={(e) => upd('resumo', e.target.value)} placeholder="1-2 frases — aparece no card e no Google." />
        </div>

        <div>
          <label className={labelCls}>Conteúdo</label>
          <RichTextEditor
            value={f.bodyHtml}
            onChange={(html, json) => setF((p) => ({ ...p, bodyHtml: html, bodyJson: json }))}
            onImageUpload={enviarImagem}
          />
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
            <button onClick={() => salvar('publicado')} disabled={salvando} className="flex-1 py-2.5 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black disabled:opacity-60">
              {salvando ? 'Salvando…' : 'Publicar'}
            </button>
            <button onClick={() => salvar('rascunho')} disabled={salvando} className="px-4 py-2.5 rounded-full border border-apple-separator text-[14px] text-apple-secondary hover:bg-apple-fill disabled:opacity-60">
              Rascunho
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
          <div>
            <label className={labelCls}>Imagem de capa</label>
            {f.capa_url ? (
              <div>
                <img src={f.capa_url} alt="capa" className="w-full h-36 object-cover rounded-lg border border-apple-separator" />
                <div className="flex gap-3 mt-2 text-[13px] flex-wrap">
                  <label className="text-apple-accent cursor-pointer hover:underline">
                    Trocar
                    <input type="file" accept="image/*" hidden onChange={trocarCapa} />
                  </label>
                  <button onClick={gerarCapaIA} disabled={gerandoCapaIA} className="text-violet-600 hover:underline disabled:opacity-60">{gerandoCapaIA ? 'Gerando…' : '✨ Gerar outra com IA'}</button>
                  <button onClick={() => setF((p) => ({ ...p, capa_url: '' }))} className="text-red-600 hover:underline">Remover</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={gerarCapaIA} disabled={gerandoCapaIA} className="w-full flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-violet-300 text-[13px] font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60">
                  {gerandoCapaIA ? 'Gerando capa com IA…' : '✨ Gerar capa com IA (usa o título)'}
                </button>
                <label className="flex items-center justify-center h-12 rounded-lg border-2 border-dashed border-apple-separator text-[13px] text-apple-secondary cursor-pointer hover:bg-apple-fill">
                  {enviandoCapa ? 'Enviando…' : '+ ou enviar imagem do computador'}
                  <input type="file" accept="image/*" hidden onChange={trocarCapa} />
                </label>
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Tags (separadas por vírgula)</label>
            <input className={inputCls} value={f.tags} onChange={(e) => upd('tags', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Idioma</label>
            <select className={inputCls} value={f.idioma} onChange={(e) => upd('idioma', e.target.value)}>
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {editando && f.slug && (
          <div className="bg-white rounded-2xl shadow-card p-5">
            <label className={labelCls}>Compartilhar</label>
            {f.situacao === 'publicado' ? (
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.brunomassa.online/posts/' + f.slug)}`}
                target="_blank"
                rel="noopener"
                className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#0A66C2] text-white text-[14px] font-medium hover:bg-[#004182] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
                </svg>
                Compartilhar no LinkedIn
              </a>
            ) : (
              <>
                <div className="mt-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-apple-fill text-apple-tertiary text-[14px] font-medium cursor-not-allowed select-none">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>
                  </svg>
                  Compartilhar no LinkedIn
                </div>
                <p className="text-[12px] text-apple-tertiary mt-2">Publique o post para liberar o compartilhamento.</p>
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-5">
          <button onClick={() => setAvancado((v) => !v)} className="w-full flex items-center justify-between text-[14px] font-medium text-apple-label">
            <span>Opções avançadas</span>
            <span className="text-apple-tertiary">{avancado ? '▲' : '▼'}</span>
          </button>
          {avancado && (
            <div className="space-y-4 mt-4">
              <div>
                <label className={labelCls}>Endereço (URL) no site</label>
                <input className={inputCls} value={f.slug} onChange={(e) => upd('slug', e.target.value)} placeholder="gerado do título" />
              </div>
              <div className="pt-2 border-t border-apple-separator/50">
                <p className="text-[12px] text-apple-tertiary mb-2">Republicação: se este texto saiu primeiro em outro lugar (LinkedIn, Medium…), o site mostra o crédito "Originalmente publicado em…".</p>
                <label className={labelCls}>Fonte original — onde saiu (nome)</label>
                <input className={inputCls} value={f.fonte_externa_nome} onChange={(e) => upd('fonte_externa_nome', e.target.value)} placeholder="LinkedIn, Medium…" />
                <label className={`${labelCls} mt-3`}>Fonte original — link</label>
                <input className={inputCls} value={f.fonte_externa_url} onChange={(e) => upd('fonte_externa_url', e.target.value)} placeholder="https://…" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
