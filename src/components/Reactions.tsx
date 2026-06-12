import { useEffect, useState } from 'react';

// Reações de 1 clique no post (anônimo). Lembra a escolha no localStorage; troca/desfaz com um toque.
const OPCOES = [
  { tipo: 'aplausos', emoji: '👏', label: 'Mandou bem' },
  { tipo: 'aprendi', emoji: '💡', label: 'Aprendi algo' },
  { tipo: 'top', emoji: '🔥', label: 'Quero mais' },
];

export default function Reactions({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [escolha, setEscolha] = useState<string | null>(null);
  const chave = `reacao:${slug}`;

  useEffect(() => {
    try { setEscolha(localStorage.getItem(chave)); } catch { /* ignore */ }
    fetch(`/api/posts/${slug}/react`)
      .then((r) => r.json())
      .then((d) => d?.reactions && setCounts(d.reactions))
      .catch(() => {});
  }, [slug]);

  async function reagir(tipo: string) {
    const anterior = escolha;
    const nova = anterior === tipo ? null : tipo; // clicar na mesma desfaz

    // atualização otimista
    setCounts((c) => {
      const n = { ...c };
      if (anterior) n[anterior] = Math.max(0, (n[anterior] ?? 0) - 1);
      if (nova) n[nova] = (n[nova] ?? 0) + 1;
      return n;
    });
    setEscolha(nova);
    try {
      if (nova) localStorage.setItem(chave, nova);
      else localStorage.removeItem(chave);
    } catch { /* ignore */ }

    // servidor: remove a anterior, adiciona a nova
    try {
      if (anterior) {
        await fetch(`/api/posts/${slug}/react`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tipo: anterior, op: 'remove' }) });
      }
      if (nova) {
        const r = await fetch(`/api/posts/${slug}/react`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ tipo: nova, op: 'add' }) });
        const d = await r.json();
        if (d?.reactions) setCounts(d.reactions);
      }
    } catch { /* mantém o otimista */ }
  }

  return (
    <div className="mt-8 pt-6 border-t border-apple-separator-light">
      <p className="text-[14px] text-apple-secondary mb-3">Curtiu? Reage aí — é um toque:</p>
      <div className="flex flex-wrap gap-2">
        {OPCOES.map((o) => {
          const ativo = escolha === o.tipo;
          return (
            <button
              key={o.tipo}
              onClick={() => reagir(o.tipo)}
              aria-pressed={ativo}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[14px] transition-colors ${
                ativo
                  ? 'border-apple-accent bg-apple-accent/10 text-apple-label font-medium'
                  : 'border-apple-separator text-apple-secondary hover:bg-apple-fill'
              }`}
            >
              <span className="text-[16px] leading-none">{o.emoji}</span>
              <span>{o.label}</span>
              {(counts[o.tipo] ?? 0) > 0 && <span className="text-[12px] text-apple-tertiary tabular-nums">{counts[o.tipo]}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
