import { useEffect, useState } from 'react';
import MediaPicker from './MediaPicker';

export default function DesignEditor() {
  const [logoUrl, setLogoUrl] = useState('');
  const [logoAltura, setLogoAltura] = useState(32);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [biblioteca, setBiblioteca] = useState(false);

  useEffect(() => {
    fetch('/api/painel/design')
      .then((r) => r.json())
      .then((d) => { setLogoUrl(d.logoUrl ?? ''); setLogoAltura(d.logoAltura ?? 32); setNome(d.nome ?? ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function salvar(over?: { logoUrl?: string; logoAltura?: number }) {
    const body = { logoUrl: over?.logoUrl ?? logoUrl, logoAltura: over?.logoAltura ?? logoAltura };
    const r = await fetch('/api/painel/design', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || 'Erro ao salvar.'); }
  }
  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setEnviando(true);
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/painel/upload', { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    setEnviando(false);
    if (j.url) { setLogoUrl(j.url); await salvar({ logoUrl: j.url }); }
    else alert(j.error || 'Falha ao enviar.');
  }
  async function excluir() {
    if (!confirm('Remover o logotipo? O site volta a mostrar o seu nome.')) return;
    setLogoUrl('');
    await salvar({ logoUrl: '' });
  }

  if (loading) return <p className="text-apple-secondary text-[14px]">Carregando…</p>;

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
        <h2 className="text-[16px] font-semibold text-apple-label">Logotipo do site</h2>

        <div className="rounded-xl border border-apple-separator bg-apple-fill px-4 flex items-center" style={{ minHeight: 88 }}>
          {logoUrl
            ? <img src={logoUrl} alt="logotipo" style={{ height: logoAltura }} className="w-auto" />
            : <span className="text-[18px] font-semibold text-apple-label">{nome}</span>}
        </div>

        <div className="flex gap-2 flex-wrap">
          <label className="px-4 py-2 rounded-full bg-apple-label text-white text-[13px] font-medium hover:bg-black cursor-pointer">
            {enviando ? 'Enviando…' : (logoUrl ? 'Trocar logo' : 'Enviar logo')}
            <input type="file" accept="image/*" hidden onChange={enviar} />
          </label>
          <button onClick={() => setBiblioteca(true)} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-apple-accent hover:bg-apple-fill">📁 Da biblioteca</button>
          {logoUrl && <button onClick={excluir} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-red-600 hover:bg-red-50">Excluir logo</button>}
        </div>

        {logoUrl && (
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Tamanho (altura): {logoAltura}px</label>
            <input type="range" min={16} max={72} value={logoAltura} onChange={(e) => setLogoAltura(Number(e.target.value))} onMouseUp={() => salvar()} onTouchEnd={() => salvar()} className="w-full accent-apple-accent" />
          </div>
        )}

        <p className="text-[12px] text-apple-tertiary">Sem logotipo, o site mostra o seu nome ("{nome}"). As mudanças aplicam no site na hora.</p>
      </div>

      {biblioteca && <MediaPicker onPick={(url) => { setLogoUrl(url); setBiblioteca(false); salvar({ logoUrl: url }); }} onClose={() => setBiblioteca(false)} />}
    </div>
  );
}
