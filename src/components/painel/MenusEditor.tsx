import { useEffect, useState } from 'react';

type Item = { id: string; label: string; url: string; ordem: number };
const inp = 'px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';

export default function MenusEditor() {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoLabel, setNovoLabel] = useState('');
  const [novoUrl, setNovoUrl] = useState('');

  async function load() {
    setLoading(true);
    const r = await fetch('/api/painel/menus?local=topo');
    setItens(r.ok ? await r.json() : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function upd(id: string, patch: Partial<Item>) {
    setItens((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  async function salvar(it: Item) {
    await fetch(`/api/painel/menus/${it.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label: it.label, url: it.url, ordem: it.ordem }) });
  }
  async function excluir(id: string) {
    if (!confirm('Remover este item do menu?')) return;
    setItens((xs) => xs.filter((x) => x.id !== id));
    await fetch(`/api/painel/menus/${id}`, { method: 'DELETE' });
  }
  async function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= itens.length) return;
    const a = itens[i], b = itens[j];
    const na = { ...a, ordem: b.ordem }, nb = { ...b, ordem: a.ordem };
    const arr = [...itens]; arr[i] = nb; arr[j] = na; arr.sort((x, y) => x.ordem - y.ordem);
    setItens(arr);
    await Promise.all([salvar(na), salvar(nb)]);
  }
  async function adicionar() {
    if (!novoLabel.trim() || !novoUrl.trim()) return;
    const r = await fetch('/api/painel/menus', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label: novoLabel, url: novoUrl, local: 'topo' }) });
    if (r.ok) { const it = await r.json(); setItens((xs) => [...xs, it]); setNovoLabel(''); setNovoUrl(''); }
    else { const j = await r.json().catch(() => ({})); alert(j.error || 'Não foi possível adicionar.'); }
  }

  if (loading) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-card divide-y divide-apple-separator/40 overflow-hidden">
        {itens.map((it, i) => (
          <div key={it.id} className="flex items-center gap-2 px-3 sm:px-4 py-3 flex-wrap">
            <div className="flex flex-col gap-0.5 flex-none">
              <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-[12px] text-apple-secondary disabled:opacity-30 leading-none hover:text-apple-label">▲</button>
              <button onClick={() => mover(i, 1)} disabled={i === itens.length - 1} className="text-[12px] text-apple-secondary disabled:opacity-30 leading-none hover:text-apple-label">▼</button>
            </div>
            <input className={`${inp} w-32`} value={it.label} onChange={(e) => upd(it.id, { label: e.target.value })} onBlur={() => salvar(it)} placeholder="Nome" />
            <input className={`${inp} flex-1 min-w-[140px]`} value={it.url} onChange={(e) => upd(it.id, { url: e.target.value })} onBlur={() => salvar(it)} placeholder="/link" />
            <button onClick={() => excluir(it.id)} className="text-[13px] text-red-600 hover:underline flex-none">Excluir</button>
          </div>
        ))}
        {itens.length === 0 && <p className="px-4 py-6 text-center text-apple-secondary text-[14px]">Sem itens. Adicione abaixo.</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4 flex items-end gap-2 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-apple-tertiary">Nome</label>
          <input className={`${inp} w-40`} value={novoLabel} onChange={(e) => setNovoLabel(e.target.value)} placeholder="Ex.: Blog" />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className="text-[12px] text-apple-tertiary">Link</label>
          <input className={`${inp} w-full`} value={novoUrl} onChange={(e) => setNovoUrl(e.target.value)} placeholder="/posts" />
        </div>
        <button onClick={adicionar} className="px-4 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black">+ Adicionar</button>
      </div>
      <p className="text-[12px] text-apple-tertiary">As edições salvam ao clicar fora do campo. O menu aparece atualizado no site na hora.</p>
    </div>
  );
}
