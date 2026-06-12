import { useEffect, useState } from 'react';

type Media = { id: string; url: string; tipo: string; nome: string | null; tamanho: number | null; origem: string; created_at: string };
const ORIGEM_LABEL: Record<string, string> = { upload: 'Enviada', ia: 'IA (fundo)', 'ia-capa': 'IA (capa)' };

export default function MediaGrid() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [fOrigem, setFOrigem] = useState('todos');

  async function load() {
    setLoading(true);
    const r = await fetch('/api/painel/media');
    setMedia(r.ok ? await r.json() : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function excluir(id: string) {
    if (!confirm('Excluir esta mídia? Some da biblioteca e do armazenamento. Não dá pra desfazer.')) return;
    setMedia((m) => m.filter((x) => x.id !== id));
    await fetch(`/api/painel/media/${id}`, { method: 'DELETE' });
  }
  function copiar(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 1500);
  }

  const filtrada = fOrigem === 'todos' ? media : media.filter((m) => m.origem === fOrigem);

  if (loading) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[13px] text-apple-tertiary">{media.length} mídias</span>
        <select value={fOrigem} onChange={(e) => setFOrigem(e.target.value)} className="px-3 py-1.5 rounded-lg border border-apple-separator text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-apple-accent/40">
          <option value="todos">Todas as origens</option>
          <option value="upload">Enviadas</option>
          <option value="ia">IA (fundos)</option>
          <option value="ia-capa">IA (capas)</option>
        </select>
      </div>

      {filtrada.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-apple-secondary text-[14px]">
          Nenhuma mídia ainda. Suba uma imagem ou gere uma com IA que ela aparece aqui.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtrada.map((m) => (
            <div key={m.id} className="group relative bg-white rounded-xl overflow-hidden border border-apple-separator/60">
              <a href={m.url} target="_blank" rel="noopener" className="block aspect-square bg-apple-fill">
                <img src={m.url} alt={m.nome ?? ''} className="w-full h-full object-cover" loading="lazy" />
              </a>
              <span className="absolute top-1 left-1 text-[9px] bg-black/55 text-white rounded px-1.5 py-0.5">{ORIGEM_LABEL[m.origem] ?? m.origem}</span>
              <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => copiar(m.url, m.id)} className="flex-1 text-[11px] text-white bg-black/50 hover:bg-black/70 rounded px-2 py-1 backdrop-blur-sm">{copiado === m.id ? 'Copiado ✓' : 'Copiar link'}</button>
                <button onClick={() => excluir(m.id)} title="Excluir" className="text-[11px] text-white bg-red-600/70 hover:bg-red-600 rounded px-2 py-1 backdrop-blur-sm">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
