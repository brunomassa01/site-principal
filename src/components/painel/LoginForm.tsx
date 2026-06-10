import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const r = await fetch('/api/painel/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErro(data.error ?? 'Erro ao entrar.');
        setCarregando(false);
        return;
      }
      window.location.href = '/painel';
    } catch {
      setErro('Falha de conexão.');
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
      <h1 className="text-[22px] font-bold text-apple-label tracking-tight mb-1">Painel</h1>
      <p className="text-[14px] text-apple-secondary mb-6">Entre para gerenciar o site.</p>

      {erro && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-[13px] px-3 py-2">{erro}</div>
      )}

      <label className="block text-[13px] font-medium text-apple-label mb-1">E-mail</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
        className="w-full mb-4 px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40"
      />

      <label className="block text-[13px] font-medium text-apple-label mb-1">Senha</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full mb-6 px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40"
      />

      <button
        type="submit"
        disabled={carregando}
        className="w-full py-2.5 rounded-full bg-apple-label text-white text-[14px] font-medium transition-colors hover:bg-black disabled:opacity-60"
      >
        {carregando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
