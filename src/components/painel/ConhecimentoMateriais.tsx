import { useEffect, useState } from 'react';
import { upload } from '@vercel/blob/client';

type Mat = {
  id: string; nome: string; url: string;
  ext: string | null; tamanho: number | null; fase: number | null; disciplina: string | null;
};

function fmtTam(n: number | null): string {
  if (!n) return '';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' GB';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' MB';
  if (n >= 1e3) return Math.round(n / 1e3) + ' KB';
  return n + ' B';
}
function extDe(nome: string): string {
  const m = nome.match(/\.(\w+)$/);
  return m ? m[1].toLowerCase() : '';
}
const EXT_COR: Record<string, string> = {
  pdf: 'bg-red-500', docx: 'bg-blue-600', doc: 'bg-blue-600',
  mp4: 'bg-violet-600', mkv: 'bg-violet-600', mov: 'bg-violet-600', webm: 'bg-violet-600',
  png: 'bg-emerald-600', jpg: 'bg-emerald-600', jpeg: 'bg-emerald-600', webp: 'bg-emerald-600',
  xlsx: 'bg-green-700', pptx: 'bg-orange-600',
};

export default function ConhecimentoMateriais() {
  const [itens, setItens] = useState<Mat[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [fase, setFase] = useState('1');
  const [disciplina, setDisciplina] = useState('');
  const [enviando, setEnviando] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  async function load() {
    setCarregando(true);
    const r = await fetch('/api/painel/conhecimento-materiais');
    setItens(r.ok ? await r.json() : []);
    setCarregando(false);
  }
  useEffect(() => { load(); }, []);

  async function enviar(files: FileList | null) {
    if (!files || !files.length) return;
    setErro('');
    for (const file of Array.from(files)) {
      setEnviando(file.name);
      try {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/painel/conhecimento-materiais/upload-token',
          multipart: true,
          contentType: file.type || undefined,
        });
        await fetch('/api/painel/conhecimento-materiais', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ nome: file.name, url: blob.url, ext: extDe(file.name), tamanho: file.size, fase: fase || null, disciplina: disciplina || null }),
        });
      } catch (e) {
        setErro(`Falha ao enviar "${file.name}": ${(e as Error).message}`);
      }
    }
    setEnviando(null);
    setDisciplina('');
    load();
  }

  async function remover(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}" do acervo? O arquivo é apagado de vez.`)) return;
    await fetch(`/api/painel/conhecimento-materiais/${id}`, { method: 'DELETE' });
    load();
  }

  const grupos: Record<string, Mat[]> = {};
  for (const m of itens) {
    const k = `Fase ${m.fase ?? '—'}${m.disciplina ? ' · ' + m.disciplina : ''}`;
    (grupos[k] ??= []).push(m);
  }

  const input = 'px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';

  return (
    <div className="space-y-5">
      {erro && <div className="rounded-lg bg-red-50 text-red-700 text-[13px] px-3 py-2">{erro}</div>}

      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[12px] font-medium text-apple-secondary mb-1">Fase</label>
            <select className={input} value={fase} onChange={(e) => setFase(e.target.value)}>
              {['1', '2', '3', '4', '5'].map((n) => <option key={n} value={n}>Fase {n}</option>)}
              <option value="">— sem fase —</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[12px] font-medium text-apple-secondary mb-1">Disciplina (opcional)</label>
            <input className={`${input} w-full`} value={disciplina} onChange={(e) => setDisciplina(e.target.value)} placeholder="Ex.: Planejamento & Gestão Estratégica" />
          </div>
          <label className={`px-4 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium cursor-pointer hover:bg-black ${enviando ? 'opacity-60 pointer-events-none' : ''}`}>
            {enviando ? `Enviando ${enviando}…` : '+ Enviar material'}
            <input type="file" multiple hidden onChange={(e) => { enviar(e.target.files); e.currentTarget.value = ''; }} />
          </label>
        </div>
        <p className="text-[12px] text-apple-tertiary mt-3">🔒 Tudo aqui é privado — só no CMS, nunca no site. Aceita qualquer arquivo (PDF, DOCX, vídeo…), de qualquer tamanho. Pode selecionar vários de uma vez.</p>
      </div>

      {carregando ? (
        <p className="text-apple-secondary text-[14px]">Carregando…</p>
      ) : itens.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-apple-secondary text-[14px]">Nenhum material ainda. Envie o primeiro acima — escolha a Fase, a Disciplina e mande os arquivos.</div>
      ) : (
        Object.entries(grupos).map(([titulo, mats]) => (
          <div key={titulo} className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-3 border-b border-apple-separator/40 flex items-center justify-between">
              <span className="text-[14px] font-semibold text-apple-label">{titulo}</span>
              <span className="text-[12px] text-apple-tertiary">{mats.length} {mats.length === 1 ? 'arquivo' : 'arquivos'}</span>
            </div>
            <div className="divide-y divide-apple-separator/40">
              {mats.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`text-white text-[10px] font-medium px-1.5 py-1 rounded text-center ${EXT_COR[m.ext ?? ''] ?? 'bg-gray-400'}`} style={{ minWidth: '44px' }}>{(m.ext || '?').toUpperCase()}</span>
                  <a href={m.url} target="_blank" rel="noopener" className="flex-1 min-w-0 text-[14px] text-apple-label truncate hover:text-apple-accent">{m.nome}</a>
                  <span className="text-[11px] text-apple-tertiary font-mono shrink-0">{fmtTam(m.tamanho)}</span>
                  <button onClick={() => remover(m.id, m.nome)} className="text-[13px] text-red-600 hover:bg-red-50 px-2 py-1 rounded-md shrink-0">Excluir</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
