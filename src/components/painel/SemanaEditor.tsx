import { useState } from 'react';

// ---- tipos (peças vêm serializadas da página Astro) ----
type Slide = { n?: number; tipo?: string; tag?: string; titulo?: string; subtitulo?: string; texto?: string; assinatura?: string };
type Cena = { n?: number; titulo?: string; fala?: string; legenda?: string };
type Conteudo = {
  texto?: string;
  formato?: string;
  referencia?: string;
  slides?: Slide[];
  capa?: string;
  duracao?: string;
  cenas?: Cena[];
  roteiro?: string;
  notas?: string;
};

// monta um roteiro corrido (pra ler e gravar) a partir das cenas estruturadas
function montarRoteiro(c: Conteudo): string {
  const linhas: string[] = [];
  if (c.capa) linhas.push(`CAPA: ${c.capa}`, '');
  (c.cenas ?? []).forEach((s) => {
    linhas.push((s.titulo ?? `Cena ${s.n ?? ''}`).toUpperCase());
    if (s.fala) linhas.push(s.fala);
    if (s.legenda) linhas.push(`   [legenda na tela: ${s.legenda}]`);
    linhas.push('');
  });
  return linhas.join('\n').trim();
}
type Peca = {
  id: string; formato: string; gancho: string | null; lente: string | null;
  conteudo: Conteudo | null; legenda: string | null; manychat: string | null;
  diaPublicacao: string | null; status: string;
};
type Semana = {
  numero: number; inicio: string | null; cluster: string | null;
  ponteIa: boolean; coringa: boolean; slotReativo: boolean;
  observacoes: string | null; status: string; pecas: Peca[];
};

const FMT: Record<string, { label: string; icon: string }> = {
  linkedin: { label: 'LinkedIn', icon: 'in' },
  carrossel: { label: 'Carrossel Instagram', icon: '▦' },
  reel: { label: 'Reel', icon: '►' },
};
const STATUS = ['planejado', 'escrito', 'aprovado', 'publicado'];
const STATUS_LABEL: Record<string, string> = { planejado: 'Planejado', escrito: 'Escrito', aprovado: 'Aprovado', publicado: 'Publicado' };
const STATUS_CLS: Record<string, string> = {
  planejado: 'bg-gray-100 text-gray-500 border-gray-200',
  escrito: 'bg-amber-50 text-amber-700 border-amber-200',
  aprovado: 'bg-blue-50 text-blue-700 border-blue-200',
  publicado: 'bg-green-50 text-green-700 border-green-200',
};
const fmtData = (s: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '');

// monta o texto para copiar, por formato
function textoParaCopiar(p: Peca): string {
  const c = p.conteudo ?? {};
  if (p.formato === 'linkedin') return c.texto ?? '';
  if (p.formato === 'carrossel') {
    const slides = (c.slides ?? []).map((s) => {
      const cab = [s.tag, s.titulo].filter(Boolean).join(' · ');
      return [`— Slide ${s.n ?? ''} —`, cab, s.subtitulo, s.texto, s.assinatura].filter(Boolean).join('\n');
    }).join('\n\n');
    return [slides, p.legenda ? `\n\nLegenda:\n${p.legenda}` : ''].join('');
  }
  if (p.formato === 'reel') {
    const base = c.roteiro && c.roteiro.trim() ? c.roteiro.trim() : montarRoteiro(c);
    return base + (p.legenda ? `\n\nLegenda:\n${p.legenda}` : '');
  }
  return '';
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';

export default function SemanaEditor({ semana }: { semana: Semana }) {
  const [pecas, setPecas] = useState<Peca[]>(semana.pecas);
  const [statusSem, setStatusSem] = useState(semana.status);

  function patchPeca(id: string, patch: Partial<Peca>) {
    setPecas((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function patchConteudo(id: string, patch: Partial<Conteudo>) {
    setPecas((ps) => ps.map((p) => (p.id === id ? { ...p, conteudo: { ...(p.conteudo ?? {}), ...patch } } : p)));
  }

  async function setStatusSemana(s: string) {
    setStatusSem(s);
    await fetch(`/api/painel/social/semanas/${semana.numero}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: s }),
    });
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho da semana */}
      <div className="bg-white rounded-2xl shadow-card p-5 flex flex-wrap items-center gap-3">
        <a href="/painel/social" className="text-[13px] text-apple-accent hover:underline">← Calendário</a>
        <span className="text-apple-separator">|</span>
        <h1 className="text-[20px] font-bold text-apple-label">Semana {semana.numero}</h1>
        <span className="text-[13px] text-apple-tertiary">{fmtData(semana.inicio)}</span>
        {semana.cluster && <span className="text-[12px] px-2 py-0.5 rounded-full bg-apple-fill text-apple-secondary">{semana.cluster}</span>}
        {semana.ponteIa && <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">PONTE IA</span>}
        {semana.coringa && <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium">Coringa</span>}
        {semana.slotReativo && <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">Reativo</span>}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-apple-tertiary">Status da semana</span>
          <select className={`${inputCls} w-auto py-1.5`} value={statusSem} onChange={(e) => setStatusSemana(e.target.value)}>
            <option value="planejado">Planejado</option>
            <option value="em-producao">Em produção</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {semana.observacoes && (
        <p className="text-[13px] text-apple-secondary bg-apple-fill rounded-lg px-3 py-2">📌 {semana.observacoes}</p>
      )}

      {/* As 3 peças */}
      {pecas.map((p) => (
        <PecaCard key={p.id} peca={p} onPatch={patchPeca} onPatchConteudo={patchConteudo} />
      ))}
    </div>
  );
}

function PecaCard({ peca, onPatch, onPatchConteudo }: {
  peca: Peca;
  onPatch: (id: string, patch: Partial<Peca>) => void;
  onPatchConteudo: (id: string, patch: Partial<Conteudo>) => void;
}) {
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const meta = FMT[peca.formato] ?? { label: peca.formato, icon: '•' };

  async function salvar() {
    setSalvando(true); setSalvo(false);
    const r = await fetch(`/api/painel/social/pecas/${peca.id}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gancho: peca.gancho, lente: peca.lente, legenda: peca.legenda,
        status: peca.status, conteudo: peca.conteudo,
      }),
    });
    setSalvando(false);
    if (r.ok) { setSalvo(true); setTimeout(() => setSalvo(false), 2000); }
  }
  async function copiar() {
    await navigator.clipboard.writeText(textoParaCopiar(peca));
    setCopiado(true); setTimeout(() => setCopiado(false), 1500);
  }

  const c = peca.conteudo ?? {};

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* topo da peça */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-apple-separator/40 bg-apple-surface">
        <span className="text-[15px] font-semibold text-apple-label">{meta.label}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CLS[peca.status] ?? ''}`}>{STATUS_LABEL[peca.status] ?? peca.status}</span>
        {peca.manychat && <span className="text-[11px] px-2 py-0.5 rounded-full bg-apple-fill text-apple-tertiary">Manychat: {peca.manychat}</span>}
        {peca.diaPublicacao && <span className="text-[11px] text-apple-tertiary capitalize">{peca.diaPublicacao}-feira</span>}
        <div className="ml-auto flex items-center gap-1">
          {STATUS.map((s) => (
            <button key={s} onClick={() => onPatch(peca.id, { status: s })}
              className={`text-[11px] px-2 py-1 rounded-md ${peca.status === s ? 'bg-apple-label text-white' : 'text-apple-secondary hover:bg-apple-fill'}`}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* gancho + lente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Gancho / ideia</label>
            <textarea className={`${inputCls} min-h-[52px]`} value={peca.gancho ?? ''} onChange={(e) => onPatch(peca.id, { gancho: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Lente (conceito do livro)</label>
            <textarea className={`${inputCls} min-h-[52px]`} value={peca.lente ?? ''} onChange={(e) => onPatch(peca.id, { lente: e.target.value })} />
          </div>
        </div>

        {/* editor por formato */}
        {peca.formato === 'linkedin' && (
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Texto do post</label>
            <textarea className={`${inputCls} min-h-[220px] leading-relaxed`} placeholder="Escreva o post…" value={c.texto ?? ''} onChange={(e) => onPatchConteudo(peca.id, { texto: e.target.value })} />
          </div>
        )}

        {peca.formato === 'carrossel' && (
          <Slides slides={c.slides ?? []} onChange={(slides) => onPatchConteudo(peca.id, { slides })}
            legenda={peca.legenda} onLegenda={(v) => onPatch(peca.id, { legenda: v })} />
        )}

        {peca.formato === 'reel' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] font-medium text-apple-tertiary">Roteiro — texto corrido pra ler e gravar</label>
                {(c.cenas?.length ?? 0) > 0 && (
                  <button onClick={() => onPatchConteudo(peca.id, { roteiro: montarRoteiro(c) })} className="text-[12px] text-apple-accent hover:underline">↻ Montar a partir das cenas</button>
                )}
              </div>
              <textarea className={`${inputCls} min-h-[260px] leading-relaxed`} placeholder="Escreva o roteiro corrido, do jeito que você vai falar…" value={c.roteiro ?? ''} onChange={(e) => onPatchConteudo(peca.id, { roteiro: e.target.value })} />
            </div>
            <details className="rounded-lg border border-apple-separator/60 px-3 py-2">
              <summary className="text-[12px] font-medium text-apple-tertiary cursor-pointer select-none">Cenas, capa e legenda (estrutura — opcional, pra edição/artes)</summary>
              <div className="mt-3">
                <Cenas capa={c.capa ?? ''} onCapa={(v) => onPatchConteudo(peca.id, { capa: v })}
                  cenas={c.cenas ?? []} onChange={(cenas) => onPatchConteudo(peca.id, { cenas })}
                  legenda={peca.legenda} onLegenda={(v) => onPatch(peca.id, { legenda: v })} />
              </div>
            </details>
          </div>
        )}

        {/* ações */}
        <div className="flex items-center gap-2 pt-1">
          <button onClick={salvar} disabled={salvando} className="px-4 py-2 rounded-full bg-apple-label text-white text-[13px] font-medium hover:bg-black disabled:opacity-60">
            {salvando ? 'Salvando…' : salvo ? 'Salvo ✓' : 'Salvar'}
          </button>
          <button onClick={copiar} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-apple-secondary hover:bg-apple-fill">
            {copiado ? 'Copiado ✓' : 'Copiar texto'}
          </button>
          <span className="text-[12px] text-apple-tertiary ml-auto">Gerar com IA e artes — em breve</span>
        </div>
      </div>
    </div>
  );
}

function Slides({ slides, onChange, legenda, onLegenda }: {
  slides: Slide[]; onChange: (s: Slide[]) => void; legenda: string | null; onLegenda: (v: string) => void;
}) {
  const upd = (i: number, patch: Partial<Slide>) => onChange(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () => onChange([...slides, { n: slides.length + 1, texto: '' }]);
  const rm = (i: number) => onChange(slides.filter((_, j) => j !== i).map((s, j) => ({ ...s, n: j + 1 })));
  return (
    <div className="space-y-3">
      <label className="block text-[12px] font-medium text-apple-tertiary">Slides ({slides.length})</label>
      {slides.map((s, i) => (
        <div key={i} className="rounded-lg border border-apple-separator/60 p-3 bg-apple-surface">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-apple-tertiary">Slide {s.n ?? i + 1}{s.tipo ? ` · ${s.tipo}` : ''}</span>
            <button onClick={() => rm(i)} className="text-[11px] text-red-600 hover:underline">remover</button>
          </div>
          {(s.tipo === 'capa' || s.tag !== undefined) && (
            <input className={`${inputCls} mb-2 text-[12px]`} placeholder="Tag (ex.: GESTÃO DE MARKETING)" value={s.tag ?? ''} onChange={(e) => upd(i, { tag: e.target.value })} />
          )}
          <input className={`${inputCls} mb-2 font-medium`} placeholder="Título do slide" value={s.titulo ?? ''} onChange={(e) => upd(i, { titulo: e.target.value })} />
          {s.subtitulo !== undefined && (
            <input className={`${inputCls} mb-2`} placeholder="Subtítulo" value={s.subtitulo ?? ''} onChange={(e) => upd(i, { subtitulo: e.target.value })} />
          )}
          <textarea className={`${inputCls} min-h-[60px]`} placeholder="Texto do slide" value={s.texto ?? ''} onChange={(e) => upd(i, { texto: e.target.value })} />
        </div>
      ))}
      <button onClick={add} className="text-[13px] text-apple-accent hover:underline">+ Adicionar slide</button>
      <div>
        <label className="block text-[12px] font-medium text-apple-tertiary mb-1 mt-2">Legenda do post</label>
        <textarea className={`${inputCls} min-h-[60px]`} value={legenda ?? ''} onChange={(e) => onLegenda(e.target.value)} />
      </div>
    </div>
  );
}

function Cenas({ capa, onCapa, cenas, onChange, legenda, onLegenda }: {
  capa: string; onCapa: (v: string) => void; cenas: Cena[]; onChange: (c: Cena[]) => void; legenda: string | null; onLegenda: (v: string) => void;
}) {
  const upd = (i: number, patch: Partial<Cena>) => onChange(cenas.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () => onChange([...cenas, { n: cenas.length + 1, titulo: `Cena ${cenas.length + 1}`, fala: '', legenda: '' }]);
  const rm = (i: number) => onChange(cenas.filter((_, j) => j !== i).map((s, j) => ({ ...s, n: j + 1 })));
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Capa do reel (frase-gancho)</label>
        <input className={inputCls} value={capa} onChange={(e) => onCapa(e.target.value)} />
      </div>
      <label className="block text-[12px] font-medium text-apple-tertiary">Cenas ({cenas.length})</label>
      {cenas.map((s, i) => (
        <div key={i} className="rounded-lg border border-apple-separator/60 p-3 bg-apple-surface">
          <div className="flex items-center justify-between mb-2">
            <input className="text-[11px] font-semibold text-apple-tertiary bg-transparent focus:outline-none" value={s.titulo ?? `Cena ${s.n}`} onChange={(e) => upd(i, { titulo: e.target.value })} />
            <button onClick={() => rm(i)} className="text-[11px] text-red-600 hover:underline">remover</button>
          </div>
          <textarea className={`${inputCls} mb-2 min-h-[52px]`} placeholder="Fala" value={s.fala ?? ''} onChange={(e) => upd(i, { fala: e.target.value })} />
          <input className={`${inputCls} text-[12px] uppercase`} placeholder="Legenda destacada" value={s.legenda ?? ''} onChange={(e) => upd(i, { legenda: e.target.value })} />
        </div>
      ))}
      <button onClick={add} className="text-[13px] text-apple-accent hover:underline">+ Adicionar cena</button>
      <div>
        <label className="block text-[12px] font-medium text-apple-tertiary mb-1 mt-2">Legenda do post</label>
        <textarea className={`${inputCls} min-h-[60px]`} value={legenda ?? ''} onChange={(e) => onLegenda(e.target.value)} />
      </div>
    </div>
  );
}
