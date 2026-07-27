import { useState } from 'react';

type Props = {
  slug: string;
  ctaTexto: string;
  checkoutUrl?: string;
};

const VERDE = '#C2F03C';
const PRETO = '#0A0A0B';
const PAPEL = '#ECECEA';

export default function Candidatura({ slug, ctaTexto, checkoutUrl }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cargo, setCargo] = useState('');
  const [desafio, setDesafio] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState(false);

  const font = { fontFamily: "'Hanken Grotesk', system-ui, sans-serif" };
  const inputCls =
    'w-full px-4 py-3 bg-transparent border rounded-none text-[15px] outline-none transition-colors';

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!nome.trim()) { setErro('Por favor, informe seu nome.'); return; }
    if (!email.trim() && !whatsapp.trim()) { setErro('Informe um e-mail ou WhatsApp para contato.'); return; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setErro('E-mail inválido.'); return; }

    setEnviando(true);
    try {
      const r = await fetch('/api/lp/candidatura', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lp_slug: slug, nome, email, whatsapp, empresa, cargo, desafio }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.error || 'Não foi possível registrar. Tente de novo.'); return; }
      setOk(true);
    } catch {
      setErro('Falha de conexão. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (ok) {
    const primeiro = nome.split(' ')[0];
    return (
      <div style={{ ...font, background: PRETO, color: PAPEL }} className="p-8 md:p-10 border border-white/10">
        <div style={{ background: VERDE }} className="w-10 h-10 flex items-center justify-center text-black font-bold text-xl mb-5">✓</div>
        {checkoutUrl ? (
          <>
            <h3 className="text-[22px] md:text-[26px] font-bold tracking-tight mb-3">Falta um passo, {primeiro}.</h3>
            <p className="text-[15px] leading-relaxed text-white/70 max-w-md mb-6">
              Seus dados estão salvos. Para garantir sua vaga na turma-piloto — são apenas 10 —, conclua sua inscrição pelo checkout seguro:
            </p>
            <a href={checkoutUrl} style={{ background: VERDE, color: PRETO }} className="block w-full text-center py-4 font-bold text-[15px] uppercase tracking-wide hover:opacity-90 transition-opacity">
              Garantir minha vaga →
            </a>
            <p className="text-[12px] text-white/40 mt-3 text-center">Pagamento processado pela Hotmart. Vagas limitadas a 10 participantes.</p>
          </>
        ) : (
          <>
            <h3 className="text-[22px] md:text-[26px] font-bold tracking-tight mb-3">Candidatura recebida.</h3>
            <p className="text-[15px] leading-relaxed text-white/70 max-w-md">
              Obrigado, {primeiro}. Vou avaliar sua candidatura conforme a aderência ao perfil e o limite de 10 vagas. Se fizer sentido, entro em contato com o próximo passo.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} style={{ ...font, background: PRETO, color: PAPEL }} className="p-8 md:p-10 border border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-[12px] uppercase tracking-wide text-white/50 mb-1.5">Nome completo *</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} style={{ borderColor: 'rgba(255,255,255,0.2)', color: PAPEL }} onFocus={(e) => (e.target.style.borderColor = VERDE)} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')} />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wide text-white/50 mb-1.5">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={{ borderColor: 'rgba(255,255,255,0.2)', color: PAPEL }} onFocus={(e) => (e.target.style.borderColor = VERDE)} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')} placeholder="voce@email.com" />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wide text-white/50 mb-1.5">WhatsApp</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} style={{ borderColor: 'rgba(255,255,255,0.2)', color: PAPEL }} onFocus={(e) => (e.target.style.borderColor = VERDE)} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')} placeholder="(11) 90000-0000" />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wide text-white/50 mb-1.5">Empresa</label>
          <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={inputCls} style={{ borderColor: 'rgba(255,255,255,0.2)', color: PAPEL }} onFocus={(e) => (e.target.style.borderColor = VERDE)} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')} />
        </div>
        <div>
          <label className="block text-[12px] uppercase tracking-wide text-white/50 mb-1.5">Cargo</label>
          <input value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputCls} style={{ borderColor: 'rgba(255,255,255,0.2)', color: PAPEL }} onFocus={(e) => (e.target.style.borderColor = VERDE)} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')} placeholder="Coordenador(a), Gerente…" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[12px] uppercase tracking-wide text-white/50 mb-1.5">Qual seu principal desafio hoje na gestão do marketing?</label>
          <textarea value={desafio} onChange={(e) => setDesafio(e.target.value)} rows={3} className={inputCls} style={{ borderColor: 'rgba(255,255,255,0.2)', color: PAPEL, minHeight: 84 }} onFocus={(e) => (e.target.style.borderColor = VERDE)} onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.2)')} placeholder="Em uma ou duas frases — ajuda a avaliar se a mentoria é pra você." />
        </div>
      </div>

      {erro && <p className="text-[13px] mt-4" style={{ color: '#ff6b6b' }}>{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        style={{ background: VERDE, color: PRETO }}
        className="w-full mt-6 py-4 font-bold text-[15px] uppercase tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? 'Enviando…' : ctaTexto}
      </button>
      <p className="text-[12px] text-white/40 mt-3 text-center">
        Sem pagamento agora. Você se candidata; a participação é confirmada conforme o perfil e as vagas.
      </p>
    </form>
  );
}
