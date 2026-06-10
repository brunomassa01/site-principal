import { useEffect, useState } from 'react';

type Post = {
  id: string;
  slug: string;
  titulo: string;
  situacao: string;
  data: string;
  idioma: string;
};

const LABEL: Record<string, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
};

const BADGE: Record<string, string> = {
  rascunho: 'bg-amber-50 text-amber-700 border-amber-200',
  publicado: 'bg-green-50 text-green-700 border-green-200',
  arquivado: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/painel/posts');
    setPosts(r.ok ? await r.json() : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, situacao: string) {
    await fetch(`/api/painel/posts/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ situacao }),
    });
    load();
  }

  async function remove(id: string, titulo: string) {
    if (!confirm(`Excluir "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`/api/painel/posts/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  if (!posts.length)
    return (
      <div className="bg-white rounded-2xl shadow-card p-10 text-center">
        <p className="text-apple-label font-semibold mb-1">Nenhum post ainda</p>
        <p className="text-apple-secondary text-[14px] mb-5">Crie sua primeira publicação.</p>
        <a href="/painel/posts/novo" className="inline-block px-4 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium">
          + Novo post
        </a>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-card divide-y divide-apple-separator/40 overflow-hidden">
      {posts.map((p) => (
        <div key={p.id} className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium text-apple-label truncate">{p.titulo}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${BADGE[p.situacao] ?? ''}`}>
                {LABEL[p.situacao] ?? p.situacao}
              </span>
              <span className="text-[12px] text-apple-tertiary">
                {new Date(p.data).toLocaleDateString('pt-BR')}
              </span>
              {p.idioma === 'en' && <span className="text-[11px] text-apple-tertiary">EN</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[13px] flex-none">
            <a href={`/painel/posts/${p.id}`} className="px-2.5 py-1 rounded-md text-apple-accent hover:bg-apple-fill">
              Editar
            </a>
            {p.situacao !== 'publicado' && (
              <button onClick={() => setStatus(p.id, 'publicado')} className="px-2.5 py-1 rounded-md text-green-700 hover:bg-green-50">
                Publicar
              </button>
            )}
            {p.situacao !== 'arquivado' ? (
              <button onClick={() => setStatus(p.id, 'arquivado')} className="px-2.5 py-1 rounded-md text-apple-secondary hover:bg-apple-fill">
                Arquivar
              </button>
            ) : (
              <button onClick={() => setStatus(p.id, 'rascunho')} className="px-2.5 py-1 rounded-md text-apple-secondary hover:bg-apple-fill">
                Restaurar
              </button>
            )}
            <button onClick={() => remove(p.id, p.titulo)} className="px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50">
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
