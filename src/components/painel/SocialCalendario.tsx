import { useMemo, useState } from 'react';

type PecaMini = { formato: string; status: string; gancho: string | null };
type Semana = {
  numero: number; inicio: string | null; cluster: string | null;
  ponteIa: boolean; coringa: boolean; slotReativo: boolean; status: string;
  pecas: PecaMini[];
};

const STATUS_DOT: Record<string, string> = {
  planejado: 'bg-gray-300', escrito: 'bg-amber-400', aprovado: 'bg-blue-500', publicado: 'bg-green-500',
};
const FMT_LABEL: Record<string, string> = { linkedin: 'in', carrossel: '▦', reel: '►' };
const fmtData = (s: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—');
const selCls = 'px-3 py-2 rounded-lg border border-apple-separator text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-apple-accent/40';

export default function SocialCalendario({ semanas, destaque }: { semanas: Semana[]; destaque: number }) {
  const [q, setQ] = useState('');
  const [fCluster, setFCluster] = useState('todos');
  const [fStatus, setFStatus] = useState('todos');

  const clusters = useMemo(() => Array.from(new Set(semanas.map((s) => s.cluster).filter(Boolean))) as string[], [semanas]);

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();
    return semanas.filter((sm) => {
      if (fCluster !== 'todos' && sm.cluster !== fCluster) return false;
      if (fStatus !== 'todos' && !sm.pecas.some((p) => p.status === fStatus)) return false;
      if (s) {
        const hay = `${sm.numero} ${sm.cluster ?? ''} ${sm.pecas.map((p) => p.gancho ?? '').join(' ')}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [semanas, q, fCluster, fStatus]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Buscar por pauta, cluster, número…"
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40" />
        <select className={selCls} value={fCluster} onChange={(e) => setFCluster(e.target.value)}>
          <option value="todos">Todos os clusters</option>
          {clusters.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={selCls} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="todos">Qualquer status</option>
          <option value="planejado">Tem planejado</option>
          <option value="escrito">Tem escrito</option>
          <option value="aprovado">Tem aprovado</option>
          <option value="publicado">Tem publicado</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-apple-separator/40 overflow-hidden">
        {filtradas.map((sm) => (
          <a key={sm.numero} href={`/painel/social/${sm.numero}`}
            className={`flex items-center gap-4 px-5 py-3 hover:bg-apple-fill transition-colors ${sm.numero === destaque ? 'bg-apple-accent/5' : ''}`}>
            <div className="w-10 text-center flex-none">
              <span className="text-[15px] font-bold text-apple-label">{sm.numero}</span>
            </div>
            <div className="w-16 flex-none text-[12px] text-apple-tertiary">{fmtData(sm.inicio)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {sm.numero === destaque && <span className="text-[10px] font-bold uppercase tracking-wide text-apple-accent">Atual</span>}
                <span className="text-[13px] text-apple-secondary truncate">{sm.cluster ?? '—'}</span>
                {sm.ponteIa && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700">PONTE</span>}
                {sm.coringa && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">Coringa</span>}
                {sm.slotReativo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">Reativo</span>}
              </div>
              <p className="text-[12px] text-apple-tertiary truncate mt-0.5">
                {sm.pecas.find((p) => p.formato === 'linkedin')?.gancho ?? ''}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {['linkedin', 'carrossel', 'reel'].map((f) => {
                const p = sm.pecas.find((x) => x.formato === f);
                return (
                  <span key={f} className="flex items-center gap-1" title={`${f}: ${p?.status ?? '—'}`}>
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[p?.status ?? 'planejado']}`} />
                    <span className="text-[11px] text-apple-tertiary w-3">{FMT_LABEL[f]}</span>
                  </span>
                );
              })}
            </div>
            <span className="text-apple-tertiary text-[13px] flex-none">→</span>
          </a>
        ))}
        {filtradas.length === 0 && <p className="px-5 py-8 text-center text-[14px] text-apple-secondary">Nenhuma semana com esses filtros.</p>}
      </div>
    </div>
  );
}
