import { useEffect, useState } from 'react';

type Media = { id: string; url: string; nome: string | null; origem: string };

// Modal pra escolher uma imagem já salva na biblioteca de mídia.
export default function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/painel/media')
      .then((r) => r.json())
      .then((d) => { setMedia(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-apple-separator/40 flex-none">
          <span className="text-[15px] font-semibold text-apple-label">Escolher da biblioteca</span>
          <button onClick={onClose} className="text-[13px] text-apple-secondary hover:text-apple-label">Fechar ✕</button>
        </div>
        <div className="p-4 overflow-y-auto">
          {loading ? (
            <p className="text-apple-secondary text-[14px]">Carregando…</p>
          ) : media.length === 0 ? (
            <p className="text-apple-secondary text-[14px] text-center py-8">Sua biblioteca está vazia ainda. Suba ou gere uma imagem que ela aparece aqui.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {media.map((m) => (
                <button key={m.id} onClick={() => onPick(m.url)} title={m.nome ?? ''}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-apple-accent">
                  <img src={m.url} alt={m.nome ?? ''} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
