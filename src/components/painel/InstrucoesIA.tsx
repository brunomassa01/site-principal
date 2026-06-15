import { useState } from 'react';

// "Instruções da IA": prompt editável que o Bruno controla; aplicado a toda geração de conteúdo social.
export default function InstrucoesIA({ inicial }: { inicial: string }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState(inicial);
  const [salvo, setSalvo] = useState<string | null>(inicial);
  const [salvando, setSalvando] = useState(false);
  const mudou = texto !== salvo;

  async function salvar() {
    setSalvando(true);
    const r = await fetch('/api/painel/social/instrucoes', {
      method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ texto }),
    });
    setSalvando(false);
    if (r.ok) setSalvo(texto);
    else alert('Não consegui salvar as instruções.');
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
      <button onClick={() => setAberto((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 text-left">
        <span className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-apple-label">⚙ Instruções da IA</span>
          {salvo ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">ativas</span> : <span className="text-[11px] text-apple-tertiary">padrão</span>}
        </span>
        <span className="text-apple-tertiary text-[13px]">{aberto ? '▲' : '▼'}</span>
      </button>
      {aberto && (
        <div className="px-5 pb-5 space-y-2 border-t border-apple-separator/40 pt-4">
          <p className="text-[12px] text-apple-secondary">
            Regras que a IA segue em <strong>tudo</strong> que gera (posts, carrosséis, Manychat). Têm prioridade sobre o resto.
            Ex.: <em>“Não cite meu livro nem nada à venda. Foco em posicionamento. Tom mais direto.”</em>
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={5}
            placeholder="Escreva aqui as regras que a IA deve seguir…"
            className="w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40"
          />
          <div className="flex items-center gap-3">
            <button onClick={salvar} disabled={!mudou || salvando}
              className="px-4 py-2 rounded-full bg-apple-label text-white text-[13px] font-medium hover:bg-black disabled:opacity-50">
              {salvando ? 'Salvando…' : mudou ? '💾 Salvar instruções' : 'Salvo ✓'}
            </button>
            {texto && (
              <button onClick={() => setTexto('')} className="text-[12px] text-red-600 hover:underline">limpar</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
