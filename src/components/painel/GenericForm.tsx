import { useEffect, useState } from 'react';
import type { Collection, Field } from '../../lib/painel/config';
import RichTextEditor from './RichTextEditor';
import { enviarImagem } from '../../lib/painel/uploadImage';

type Props = { colecao: string; cfg: Collection; id?: string };

function toDate(v: unknown): string {
  return v ? new Date(String(v)).toISOString().slice(0, 10) : '';
}
function toDateTime(v: unknown): string {
  if (!v) return '';
  const d = new Date(String(v));
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function initField(f: Field, item: Record<string, unknown> | null): string | boolean {
  const v = item?.[f.name];
  switch (f.type) {
    case 'date': return toDate(v);
    case 'datetime': return toDateTime(v);
    case 'tags': return Array.isArray(v) ? (v as string[]).join(', ') : String(v ?? '');
    case 'list': return Array.isArray(v) ? (v as string[]).join('\n') : String(v ?? '');
    case 'boolean': return Boolean(v);
    case 'number': return v == null ? '' : String(v);
    default: return v == null ? '' : String(v);
  }
}

const FULL = new Set(['textarea', 'list', 'image']);
const inputCls = 'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';
const labelCls = 'block text-[13px] font-medium text-apple-label mb-1';

export default function GenericForm({ colecao, cfg, id }: Props) {
  const carregar = Boolean(id) || Boolean(cfg.singleton);
  const traduziveis = cfg.fields.filter((f) => f.traduzivel);
  const temTraducao = Boolean(cfg.traduzivel) && (traduziveis.length > 0 || Boolean(cfg.body));

  const [aba, setAba] = useState<'pt' | 'en'>('pt');
  const [vals, setVals] = useState<Record<string, string | boolean>>(() => {
    const o: Record<string, string | boolean> = {};
    for (const f of cfg.fields) {
      o[f.name] = initField(f, null);
      if (f.traduzivel) o[`${f.name}En`] = initField(f, null);
    }
    return o;
  });
  const [bodyHtml, setBodyHtml] = useState('');
  const [bodyJson, setBodyJson] = useState<unknown>(null);
  const [bodyHtmlEn, setBodyHtmlEn] = useState('');
  const [bodyJsonEn, setBodyJsonEn] = useState<unknown>(null);
  const [situacao, setSituacao] = useState('rascunho');
  const [slug, setSlug] = useState('');
  const [carregando, setCarregando] = useState(carregar);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    if (!carregar) return;
    const url = cfg.singleton ? `/api/painel/${colecao}` : `/api/painel/${colecao}/${id}`;
    (async () => {
      const r = await fetch(url);
      if (!r.ok) { setErro('Não foi possível carregar.'); setCarregando(false); return; }
      const item = await r.json();
      const o: Record<string, string | boolean> = {};
      for (const f of cfg.fields) {
        o[f.name] = initField(f, item);
        if (f.traduzivel) o[`${f.name}En`] = initField({ ...f, name: `${f.name}En` }, item);
      }
      setVals(o);
      setBodyHtml(item.bodyHtml ?? '');
      setBodyJson(item.bodyJson ?? null);
      setBodyHtmlEn(item.bodyHtmlEn ?? '');
      setBodyJsonEn(item.bodyJsonEn ?? null);
      setSituacao(item.situacao ?? 'rascunho');
      setSlug(item.slug ?? '');
      setCarregando(false);
    })();
  }, [id]);

  function set(name: string, v: string | boolean) {
    setVals((p) => ({ ...p, [name]: v }));
  }

  async function salvar(novaSituacao?: string) {
    setErro(''); setOk(''); setSalvando(true);
    const payload: Record<string, unknown> = { ...vals };
    if (cfg.body) {
      payload.body_html = bodyHtml; payload.body_json = bodyJson;
      if (cfg.traduzivel) { payload.body_html_en = bodyHtmlEn; payload.body_json_en = bodyJsonEn; }
    }
    if (cfg.situacao) payload.situacao = novaSituacao ?? situacao;
    if (cfg.slug) payload.slug = slug;

    let url = `/api/painel/${colecao}`;
    let method = 'POST';
    if (cfg.singleton) { method = 'PUT'; }
    else if (id) { url = `/api/painel/${colecao}/${id}`; method = 'PUT'; }

    const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const d = await r.json();
    setSalvando(false);
    if (!r.ok) { setErro(d.error ?? 'Erro ao salvar.'); return; }
    if (cfg.singleton) { setOk('Salvo!'); return; }
    window.location.href = `/painel/${colecao}`;
  }

  if (carregando) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {cfg.situacao ? (
          <>
            <button onClick={() => salvar('publicado')} disabled={salvando} className="px-5 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black disabled:opacity-60">
              {salvando ? 'Salvando…' : 'Publicar'}
            </button>
            <button onClick={() => salvar('rascunho')} disabled={salvando} className="px-4 py-2 rounded-full border border-apple-separator text-[14px] text-apple-secondary hover:bg-apple-fill disabled:opacity-60">Rascunho</button>
          </>
        ) : (
          <button onClick={() => salvar()} disabled={salvando} className="px-5 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black disabled:opacity-60">
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        )}
        {ok && <span className="text-[13px] text-green-700">{ok}</span>}
        {erro && <span className="text-[13px] text-red-700">{erro}</span>}
      </div>

      {temTraducao && (
        <div className="flex items-center gap-1 border-b border-apple-separator">
          {(['pt', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setAba(l)}
              className={`px-4 py-2 text-[14px] font-medium border-b-2 -mb-px transition-colors ${
                aba === l
                  ? 'border-apple-accent text-apple-label'
                  : 'border-transparent text-apple-secondary hover:text-apple-label'
              }`}
            >
              {l === 'pt' ? '🇧🇷 Português' : '🇬🇧 English'}
            </button>
          ))}
          <span className="ml-auto text-[12px] text-apple-tertiary pr-1">
            {aba === 'en' ? 'Campo em branco = o site mostra o português' : 'Idioma original'}
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-6">
        {aba === 'pt' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cfg.fields.map((f) => (
              <div key={f.name} className={FULL.has(f.type) ? 'sm:col-span-2' : ''}>
                {f.type !== 'boolean' && <label className={labelCls}>{f.label}{f.required ? ' *' : ''}</label>}
                {renderField(f, vals[f.name], set)}
                {f.help && <p className="text-[12px] text-apple-tertiary mt-1">{f.help}</p>}
              </div>
            ))}
            {cfg.slug && (
              <div className="sm:col-span-2">
                <label className={labelCls}>Endereço (URL)</label>
                <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="gerado automaticamente" />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {traduziveis.length === 0 && (
              <p className="sm:col-span-2 text-[14px] text-apple-secondary">Só o conteúdo desta ficha tem versão em inglês.</p>
            )}
            {traduziveis.map((f) => {
              const original = String(vals[f.name] ?? '');
              return (
                <div key={f.name} className={FULL.has(f.type) ? 'sm:col-span-2' : ''}>
                  <label className={labelCls}>{f.label}</label>
                  {renderField({ ...f, name: `${f.name}En`, required: false }, vals[`${f.name}En`], set)}
                  {original && (
                    <p className="text-[12px] text-apple-tertiary mt-1 line-clamp-2">
                      <span className="font-medium">PT:</span> {original}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cfg.body && aba === 'pt' && (
        <div>
          <label className={labelCls}>Conteúdo (opcional)</label>
          <RichTextEditor value={bodyHtml} onChange={(h, j) => { setBodyHtml(h); setBodyJson(j); }} onImageUpload={enviarImagem} />
        </div>
      )}

      {cfg.body && cfg.traduzivel && aba === 'en' && (
        <div>
          <label className={labelCls}>Content in English (optional)</label>
          <RichTextEditor value={bodyHtmlEn} onChange={(h, j) => { setBodyHtmlEn(h); setBodyJsonEn(j); }} onImageUpload={enviarImagem} />
        </div>
      )}
    </div>
  );
}

function renderField(f: Field, value: string | boolean, set: (n: string, v: string | boolean) => void) {
  const v = value as string;
  if (f.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer mt-1">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => set(f.name, e.target.checked)} className="w-4 h-4" />
        <span className="text-[14px] text-apple-label">{f.label}</span>
      </label>
    );
  }
  if (f.type === 'textarea') return <textarea className={`${inputCls} min-h-[70px]`} value={v} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />;
  if (f.type === 'list') return <textarea className={`${inputCls} min-h-[70px]`} value={v} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder ?? 'Um item por linha'} />;
  if (f.type === 'select') return (
    <select className={inputCls} value={v} onChange={(e) => set(f.name, e.target.value)}>
      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  if (f.type === 'date') return <input type="date" className={inputCls} value={v} onChange={(e) => set(f.name, e.target.value)} />;
  if (f.type === 'datetime') return <input type="datetime-local" className={inputCls} value={v} onChange={(e) => set(f.name, e.target.value)} />;
  if (f.type === 'number') return <input type="number" className={inputCls} value={v} onChange={(e) => set(f.name, e.target.value)} />;
  if (f.type === 'image') return <ImageField value={v} onChange={(url) => set(f.name, url)} />;
  return <input className={inputCls} value={v} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />;
}

function ImageField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [enviando, setEnviando] = useState(false);
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEnviando(true);
    const url = await enviarImagem(file);
    setEnviando(false);
    if (url) onChange(url);
  }
  return value ? (
    <div>
      <img src={value} alt="" className="w-full max-w-xs h-32 object-cover rounded-lg border border-apple-separator" />
      <div className="flex gap-3 mt-2 text-[13px]">
        <label className="text-apple-accent cursor-pointer hover:underline">Trocar<input type="file" accept="image/*" hidden onChange={pick} /></label>
        <button onClick={() => onChange('')} className="text-red-600 hover:underline">Remover</button>
      </div>
    </div>
  ) : (
    <label className="flex items-center justify-center h-20 max-w-xs rounded-lg border-2 border-dashed border-apple-separator text-[13px] text-apple-secondary cursor-pointer hover:bg-apple-fill">
      {enviando ? 'Enviando…' : '+ Enviar imagem'}
      <input type="file" accept="image/*" hidden onChange={pick} />
    </label>
  );
}
