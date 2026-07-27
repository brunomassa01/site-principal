import { useState } from 'react';

type Campos = {
  selo: string;
  headline: string;
  subheadline: string;
  preco: string;
  precoNota: string;
  parcelamento: string;
  ctaTexto: string;
  ctaNota: string;
  fotoUrl: string;
  checkoutUrl: string;
  infoLinha: string[];
};

type Candidatura = {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  empresa: string | null;
  cargo: string | null;
  desafio: string | null;
  situacao: string;
  createdAt: string;
};

type Props = {
  slug: string;
  statusInicial: string;
  campos: Campos;
  candidaturas: Candidatura[];
};

const SITUACOES: { v: string; label: string; cls: string }[] = [
  { v: 'novo', label: 'Novo', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { v: 'selecionado', label: 'Selecionado', cls: 'bg-green-50 text-green-700 border-green-200' },
  { v: 'inscrito', label: 'Inscrito', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  { v: 'descartado', label: 'Descartado', cls: 'bg-gray-50 text-gray-500 border-gray-200' },
];

const inputCls = 'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';
const labelCls = 'block text-[13px] font-medium text-apple-label mb-1';

export default function MentoriaAdmin({ slug, statusInicial, campos, candidaturas: candIniciais }: Props) {
  const [status, setStatus] = useState(statusInicial);
  const [mudandoStatus, setMudandoStatus] = useState(false);

  const [c, setC] = useState<Campos>(campos);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState('');

  const [cands, setCands] = useState<Candidatura[]>(candIniciais);
  const [aberto, setAberto] = useState<string | null>(null);

  const urlLp = `https://lp.brunomassa.online/${slug}`;
  const fmtData = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  async function alternarStatus() {
    const novo = status === 'publicado' ? 'rascunho' : 'publicado';
    if (novo === 'publicado' && !confirm('Publicar a LP? Ela fica indexável no Google e sem a barra de rascunho.')) return;
    setMudandoStatus(true);
    const r = await fetch(`/api/painel/mentorias/${slug}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: novo }),
    });
    setMudandoStatus(false);
    if (r.ok) setStatus(novo); else alert('Não foi possível mudar o status.');
  }

  async function salvarCampos() {
    setSalvando(true); setSalvo('');
    const r = await fetch(`/api/painel/mentorias/${slug}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dados: c }),
    });
    setSalvando(false);
    if (r.ok) { setSalvo('Salvo!'); setTimeout(() => setSalvo(''), 2500); }
    else alert('Não foi possível salvar.');
  }

  async function mudarSituacao(id: string, situacao: string) {
    setCands((p) => p.map((x) => (x.id === id ? { ...x, situacao } : x)));
    await fetch(`/api/painel/lp-leads/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ situacao }),
    });
  }

  async function excluir(id: string, nome: string) {
    if (!confirm(`Excluir a candidatura de ${nome}? Não dá pra desfazer.`)) return;
    setCands((p) => p.filter((x) => x.id !== id));
    await fetch(`/api/painel/lp-leads/${id}`, { method: 'DELETE' });
  }

  function exportarCsv() {
    const esc = (v: string | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const cab = ['Nome', 'E-mail', 'WhatsApp', 'Empresa', 'Cargo', 'Desafio', 'Situação', 'Data'];
    const linhas = cands.map((x) => [x.nome, x.email, x.whatsapp, x.empresa, x.cargo, x.desafio, x.situacao, fmtData(x.createdAt)].map(esc).join(','));
    const csv = '﻿' + [cab.join(','), ...linhas].join('\r\n'); // BOM p/ Excel abrir acento certo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `candidaturas-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-6">
      {/* Status + link */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold border ${
              status === 'publicado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {status === 'publicado' ? 'Publicado' : 'Rascunho'}
            </span>
            <a href={status === 'publicado' ? urlLp : `${urlLp}`} target="_blank" rel="noopener" className="text-[14px] text-apple-accent hover:underline">
              Ver a LP ↗
            </a>
          </div>
          <button onClick={alternarStatus} disabled={mudandoStatus}
            className={`px-4 py-2 rounded-full text-[14px] font-medium disabled:opacity-60 ${
              status === 'publicado' ? 'border border-apple-separator text-apple-secondary hover:bg-apple-fill' : 'bg-apple-label text-white hover:bg-black'
            }`}>
            {mudandoStatus ? '…' : status === 'publicado' ? 'Voltar a rascunho' : 'Publicar'}
          </button>
        </div>
        {status !== 'publicado' && (
          <p className="text-[12px] text-apple-tertiary mt-3">
            Em rascunho a LP fica visível só por link e com <code>noindex</code> (o Google não acha). Publique quando os pendentes (datas, parcelamento, bio/foto, jurídico) estiverem prontos.
          </p>
        )}
      </div>

      {/* Editar textos principais */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <button onClick={() => setEditando(!editando)} className="flex items-center gap-2 text-[15px] font-semibold text-apple-label">
          <span className="text-lg leading-none">{editando ? '−' : '+'}</span>
          Editar textos principais
        </button>
        <p className="text-[12px] text-apple-tertiary mt-1">Hero, preço e CTA. O conteúdo longo (encontros, FAQ, etc.) continua vindo do documento — me passe a versão final e eu atualizo.</p>

        {editando && (
          <div className="mt-5 space-y-4">
            <div><label className={labelCls}>Selo (acima do título)</label><input className={inputCls} value={c.selo} onChange={(e) => setC({ ...c, selo: e.target.value })} /></div>
            <div><label className={labelCls}>Título (headline)</label><textarea className={`${inputCls} min-h-[64px]`} value={c.headline} onChange={(e) => setC({ ...c, headline: e.target.value })} /></div>
            <div><label className={labelCls}>Subtítulo</label><textarea className={`${inputCls} min-h-[64px]`} value={c.subheadline} onChange={(e) => setC({ ...c, subheadline: e.target.value })} /></div>
            <div><label className={labelCls}>Linha de informações (uma por linha)</label><textarea className={`${inputCls} min-h-[80px]`} value={c.infoLinha.join('\n')} onChange={(e) => setC({ ...c, infoLinha: e.target.value.split('\n') })} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Preço</label><input className={inputCls} value={c.preco} onChange={(e) => setC({ ...c, preco: e.target.value })} /></div>
              <div><label className={labelCls}>Nota do preço</label><input className={inputCls} value={c.precoNota} onChange={(e) => setC({ ...c, precoNota: e.target.value })} /></div>
            </div>
            <div><label className={labelCls}>Parcelamento (opcional)</label><input className={inputCls} value={c.parcelamento} onChange={(e) => setC({ ...c, parcelamento: e.target.value })} placeholder="ex.: em até 12x no cartão" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Texto do botão (CTA)</label><input className={inputCls} value={c.ctaTexto} onChange={(e) => setC({ ...c, ctaTexto: e.target.value })} /></div>
              <div><label className={labelCls}>Nota abaixo do CTA</label><input className={inputCls} value={c.ctaNota} onChange={(e) => setC({ ...c, ctaNota: e.target.value })} /></div>
            </div>
            <div><label className={labelCls}>Foto (URL)</label><input className={inputCls} value={c.fotoUrl} onChange={(e) => setC({ ...c, fotoUrl: e.target.value })} placeholder="/images/bruno.jpg" /></div>
            <div><label className={labelCls}>Link do checkout (Hotmart)</label><input className={inputCls} value={c.checkoutUrl} onChange={(e) => setC({ ...c, checkoutUrl: e.target.value })} placeholder="https://pay.hotmart.com/..." /><p className="text-[12px] text-apple-tertiary mt-1">Aparece como botão "Garantir minha vaga" logo depois que a pessoa envia o formulário. Vazio = só mostra a mensagem de recebido.</p></div>
            <div className="flex items-center gap-3 pt-1">
              <button onClick={salvarCampos} disabled={salvando} className="px-5 py-2 rounded-full bg-apple-label text-white text-[14px] font-medium hover:bg-black disabled:opacity-60">
                {salvando ? 'Salvando…' : 'Salvar textos'}
              </button>
              {salvo && <span className="text-[13px] text-green-700">{salvo}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Candidaturas */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-[16px] font-semibold text-apple-label">Candidaturas <span className="text-apple-tertiary font-normal">({cands.length})</span></h2>
          {cands.length > 0 && (
            <button onClick={exportarCsv} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-apple-secondary hover:bg-apple-fill">
              ↓ Exportar CSV
            </button>
          )}
        </div>

        {cands.length === 0 ? (
          <p className="text-[14px] text-apple-secondary">Nenhuma candidatura ainda. Elas aparecem aqui assim que alguém preenche o formulário na LP.</p>
        ) : (
          <div className="space-y-2">
            {cands.map((x) => {
              const sit = SITUACOES.find((s) => s.v === x.situacao) ?? SITUACOES[0];
              const expandido = aberto === x.id;
              return (
                <div key={x.id} className="border border-apple-separator-light rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-apple-label">{x.nome}</p>
                      <p className="text-[13px] text-apple-secondary mt-0.5">
                        {x.empresa && <span>{x.empresa}</span>}{x.empresa && x.cargo && <span> · </span>}{x.cargo && <span>{x.cargo}</span>}
                      </p>
                      <p className="text-[13px] text-apple-tertiary mt-1 flex flex-wrap gap-x-3">
                        {x.email && <a href={`mailto:${x.email}`} className="text-apple-accent hover:underline">{x.email}</a>}
                        {x.whatsapp && <a href={`https://wa.me/55${x.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="text-apple-accent hover:underline">WhatsApp: {x.whatsapp}</a>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <select value={x.situacao} onChange={(e) => mudarSituacao(x.id, e.target.value)}
                        className={`text-[12px] font-medium border rounded-full px-2.5 py-1 ${sit.cls}`}>
                        {SITUACOES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                      </select>
                      <button onClick={() => excluir(x.id, x.nome)} className="text-apple-tertiary hover:text-red-600 text-[16px] px-1" title="Excluir">×</button>
                    </div>
                  </div>
                  {x.desafio && (
                    <div className="mt-2">
                      <button onClick={() => setAberto(expandido ? null : x.id)} className="text-[12px] text-apple-accent hover:underline">
                        {expandido ? 'ocultar desafio' : 'ver desafio'}
                      </button>
                      {expandido && <p className="text-[14px] text-apple-secondary mt-1.5 leading-relaxed bg-apple-fill rounded-lg p-3">{x.desafio}</p>}
                    </div>
                  )}
                  <p className="text-[11px] text-apple-tertiary mt-2">{fmtData(x.createdAt)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
