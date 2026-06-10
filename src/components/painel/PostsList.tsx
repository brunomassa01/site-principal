import { useEffect, useMemo, useState } from 'react';

type Post = {
  id: string; slug: string; titulo: string; situacao: string;
  data: string; idioma: string; views: number; tags: string[];
  temVideo: boolean; temImagem: boolean;
};

const LABEL: Record<string, string> = { rascunho: 'Rascunho', publicado: 'Publicado', arquivado: 'Arquivado' };
const BADGE: Record<string, string> = {
  rascunho: 'bg-amber-50 text-amber-700 border-amber-200',
  publicado: 'bg-green-50 text-green-700 border-green-200',
  arquivado: 'bg-gray-100 text-gray-500 border-gray-200',
};

const selCls = 'px-3 py-2 rounded-lg border border-apple-separator text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-apple-accent/40';

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [fSit, setFSit] = useState('todos');
  const [fMidia, setFMidia] = useState('todos');
  const [fIdioma, setFIdioma] = useState('todos');
  const [sort, setSort] = useState('recentes');

  async function load() {
    setLoading(true);
    const r = await fetch('/api/painel/posts');
    setPosts(r.ok ? await r.json() : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, situacao: string) {
    await fetch(`/api/painel/posts/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ situacao }) });
    load();
  }
  async function remove(id: string, titulo: string) {
    if (!confirm(`Excluir "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`/api/painel/posts/${id}`, { method: 'DELETE' });
    load();
  }

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = posts.filter((p) => {
      if (fSit !== 'todos' && p.situacao !== fSit) return false;
      if (fIdioma !== 'todos' && p.idioma !== fIdioma) return false;
      if (fMidia === 'video' && !p.temVideo) return false;
      if (fMidia === 'imagem' && !p.temImagem) return false;
      if (s) {
        const hay = `${p.titulo} ${(p.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    return [...r].sort((a, b) => {
      if (sort === 'vistos') return (b.views || 0) - (a.views || 0);
      if (sort === 'antigos') return new Date(a.data).getTime() - new Date(b.data).getTime();
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }, [posts, q, fSit, fMidia, fIdioma, sort]);

  if (loading) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  return (
    <div className="space-y-4">
      {/* Barra de filtros */}
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Buscar por palavra ou tag…"
          className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40"
        />
        <select className={selCls} value={fSit} onChange={(e) => setFSit(e.target.value)}>
          <option value="todos">Todas situações</option>
          <option value="publicado">Publicados</option>
          <option value="rascunho">Rascunhos</option>
          <option value="arquivado">Arquivados</option>
        </select>
        <select className={selCls} value={fMidia} onChange={(e) => setFMidia(e.target.value)}>
          <option value="todos">Toda mídia</option>
          <option value="imagem">Com imagem</option>
          <option value="video">Com vídeo</option>
        </select>
        <select className={selCls} value={fIdioma} onChange={(e) => setFIdioma(e.target.value)}>
          <option value="todos">Idioma</option>
          <option value="pt">Português</option>
          <option value="en">English</option>
        </select>
        <select className={selCls} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recentes">Mais recentes</option>
          <option value="antigos">Mais antigos</option>
          <option value="vistos">Mais visitados</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <p className="text-apple-label font-semibold mb-1">{posts.length ? 'Nenhum post com esses filtros' : 'Nenhum post ainda'}</p>
          {!posts.length && <a href="/painel/posts/novo" className="inline-block mt-3 px-4 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium">+ Novo post</a>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-apple-separator/40 overflow-hidden">
          {filtrados.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-apple-label truncate">{p.titulo}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${BADGE[p.situacao] ?? ''}`}>{LABEL[p.situacao] ?? p.situacao}</span>
                  <span className="text-[12px] text-apple-tertiary">{new Date(p.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-[12px] text-apple-tertiary">👁 {p.views ?? 0}</span>
                  {p.temImagem && <span className="text-[12px]" title="Com imagem">🖼</span>}
                  {p.temVideo && <span className="text-[12px]" title="Com vídeo">🎬</span>}
                  {p.idioma === 'en' && <span className="text-[11px] text-apple-tertiary">EN</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[13px] flex-none">
                <a href={`/painel/posts/${p.id}`} className="px-2.5 py-1 rounded-md text-apple-accent hover:bg-apple-fill">Editar</a>
                {p.situacao !== 'publicado' && <button onClick={() => setStatus(p.id, 'publicado')} className="px-2.5 py-1 rounded-md text-green-700 hover:bg-green-50">Publicar</button>}
                {p.situacao !== 'arquivado' ? (
                  <button onClick={() => setStatus(p.id, 'arquivado')} className="px-2.5 py-1 rounded-md text-apple-secondary hover:bg-apple-fill">Arquivar</button>
                ) : (
                  <button onClick={() => setStatus(p.id, 'rascunho')} className="px-2.5 py-1 rounded-md text-apple-secondary hover:bg-apple-fill">Restaurar</button>
                )}
                <button onClick={() => remove(p.id, p.titulo)} className="px-2.5 py-1 rounded-md text-red-600 hover:bg-red-50">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
