import { useState } from 'react';

export default function ContaForm() {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [nova2, setNova2] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; txt: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (nova !== nova2) {
      setMsg({ tipo: 'erro', txt: 'A nova senha e a confirmação não coincidem.' });
      return;
    }
    setSalvando(true);
    const r = await fetch('/api/painel/auth/change-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ atual, nova }),
    });
    const d = await r.json();
    setSalvando(false);
    if (!r.ok) {
      setMsg({ tipo: 'erro', txt: d.error ?? 'Erro ao alterar a senha.' });
      return;
    }
    setMsg({ tipo: 'ok', txt: 'Senha alterada com sucesso.' });
    setAtual('');
    setNova('');
    setNova2('');
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';
  const labelCls = 'block text-[13px] font-medium text-apple-label mb-1';

  return (
    <form onSubmit={submit} className="max-w-sm bg-white rounded-2xl shadow-card p-6 space-y-4">
      <h2 className="text-[16px] font-semibold text-apple-label">Trocar senha</h2>
      {msg && (
        <div
          className={`rounded-lg text-[13px] px-3 py-2 ${
            msg.tipo === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {msg.txt}
        </div>
      )}
      <div>
        <label className={labelCls}>Senha atual</label>
        <input type="password" className={inputCls} value={atual} onChange={(e) => setAtual(e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Nova senha</label>
        <input type="password" className={inputCls} value={nova} onChange={(e) => setNova(e.target.value)} required />
      </div>
      <div>
        <label className={labelCls}>Confirmar nova senha</label>
        <input type="password" className={inputCls} value={nova2} onChange={(e) => setNova2(e.target.value)} required />
      </div>
      <button
        type="submit"
        disabled={salvando}
        className="w-full py-2.5 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : 'Alterar senha'}
      </button>
    </form>
  );
}
