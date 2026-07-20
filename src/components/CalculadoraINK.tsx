import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { calc } from '../i18n/calculadora';
import type { Lang } from '../i18n';

// Destino dos cadastros (Google Apps Script da Selo7 — mesmo do calculador original).
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzgaI21c41kMPGWjAgLINosd2jeS4i-2Jrzj1A0HZ6Hk_YLl4p64DrYKb9K8_cXT9k/exec';

function RadarINK({ r, c, p, labels }: { r: number; c: number; p: number; labels: { r: string; c: string; p: string } }) {
  const cx = 150, cy = 148, raio = 96;
  const angulos = [-90, 30, 150]; // R topo, C baixo-direita, P baixo-esquerda
  const ponto = (angulo: number, dist: number): [number, number] => {
    const rad = (angulo * Math.PI) / 180;
    return [cx + dist * Math.cos(rad), cy + dist * Math.sin(rad)];
  };
  const poligono = (dist: number) => angulos.map((a) => ponto(a, dist).join(',')).join(' ');
  const valores = [r, c, p];
  const dados = angulos.map((a, i) => ponto(a, (valores[i] / 100) * raio));
  const rotulos = [
    { letra: 'R', nome: labels.r, valor: r },
    { letra: 'C', nome: labels.c, valor: c },
    { letra: 'P', nome: labels.p, valor: p },
  ];
  return (
    <svg viewBox="0 0 300 240" className="w-full max-w-sm mx-auto" role="img"
      aria-label={`Gráfico aranha: Reconhecimento ${r}, Coerência ${c}, Permanência ${p}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={poligono(raio * f)} fill="none" stroke="#d4d4d4" strokeWidth={f === 1 ? 1.2 : 0.7} />
      ))}
      {angulos.map((a) => {
        const [x, y] = ponto(a, raio);
        return <line key={a} x1={cx} y1={cy} x2={x} y2={y} stroke="#d4d4d4" strokeWidth="0.7" />;
      })}
      {[25, 50, 75, 100].map((v) => (
        <text key={v} x={cx + 5} y={cy - (raio * v) / 100 + 3} fontSize="7" fill="#a3a3a3">{v}</text>
      ))}
      <polygon points={dados.map((d) => d.join(',')).join(' ')}
        fill="rgba(0,0,0,0.08)" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
      {dados.map((d, i) => <circle key={i} cx={d[0]} cy={d[1]} r="4" fill="#000" />)}
      {rotulos.map((rot, i) => {
        const [x, y] = ponto(angulos[i], raio + 24);
        return (
          <text key={rot.letra} x={x} y={y} textAnchor="middle" fontFamily="Georgia, serif">
            <tspan x={x} dy="-2" fontSize="13" fontWeight="bold" fill="#000">{rot.letra} {rot.valor}</tspan>
            <tspan x={x} dy="11" fontSize="8" fill="#737373" fontStyle="italic">{rot.nome}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

export default function CalculadoraINK({ lang = 'pt' }: { lang?: Lang }) {
  const tx = calc[lang];
  const locale = lang === 'en' ? 'en' : 'pt-BR';

  const [r, setR] = useState(50);
  const [c, setC] = useState(50);
  const [p, setP] = useState(50);
  const [showDerivadas, setShowDerivadas] = useState(false);
  const [cac, setCac] = useState(1000);
  const [investimento, setInvestimento] = useState(100000);

  const [unlocked, setUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const ink = Math.round((r + c + p) / 3);

  const getEstagio = (valor: number) => {
    if (valor <= 30) return { ...tx.estagios[0], bg: 'bg-black', text: 'text-white' };
    if (valor <= 60) return { ...tx.estagios[1], bg: 'bg-neutral-700', text: 'text-white' };
    if (valor <= 80) return { ...tx.estagios[2], bg: 'bg-neutral-300', text: 'text-black' };
    return { ...tx.estagios[3], bg: 'bg-white border-2 border-black', text: 'text-black' };
  };

  const estagio = getEstagio(ink);
  const cacNarrativo = Math.round(cac * (1 - ink / 100));
  const custoFriccao = Math.round(investimento * (1 - ink / 100));
  // Moeda segue em real nos dois idiomas: o índice é calibrado no mercado brasileiro.
  const formatBRL = (n: number) => n.toLocaleString(locale, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const markerPosition = `${ink}%`;

  useEffect(() => {
    try {
      const cadastro = localStorage.getItem('ink_cadastro');
      if (cadastro) {
        const dados = JSON.parse(cadastro);
        if (dados.email) {
          setUnlocked(true);
          setNome(dados.nome || '');
          setEmail(dados.email);
        }
      }
    } catch { /* ignora */ }
  }, []);

  const enviarParaGoogleSheets = async (dados: { nome: string; email: string; ink: number; r: number; c: number; p: number; estagio: string; consentimento: boolean }) => {
    if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.includes('COLE_AQUI')) return;
    const formData = new FormData();
    formData.append('nome', dados.nome);
    formData.append('email', dados.email);
    formData.append('ink', String(dados.ink));
    formData.append('r', String(dados.r));
    formData.append('coerencia', String(dados.c)); // 'c' é reservado pelo Google
    formData.append('p', String(dados.p));
    formData.append('estagio', dados.estagio);
    formData.append('consentimento', dados.consentimento ? 'sim' : 'nao');
    await fetch(GOOGLE_SHEETS_URL, { method: 'POST', body: formData, mode: 'no-cors' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!nome.trim()) { setSubmitError(tx.erroNome); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setSubmitError(tx.erroEmail); return; }
    if (!consentimento) { setSubmitError(tx.erroConsent); return; }
    setSubmitting(true);
    try {
      await enviarParaGoogleSheets({ nome: nome.trim(), email: email.trim().toLowerCase(), ink, r, c, p, estagio: estagio.nome, consentimento });
      localStorage.setItem('ink_cadastro', JSON.stringify({ nome: nome.trim(), email: email.trim().toLowerCase(), data: new Date().toISOString() }));
      setUnlocked(true);
      setShowModal(false);
    } catch {
      setSubmitError(tx.erroEnvio);
    } finally {
      setSubmitting(false);
    }
  };

  const baixarPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFont('times', 'bold'); doc.setFontSize(22); doc.text(tx.titulo, margin, y); y += 7;
    doc.setFont('times', 'italic'); doc.setFontSize(12); doc.setTextColor(80); doc.text(tx.subtitulo, margin, y); y += 5;
    doc.setFont('times', 'normal'); doc.setFontSize(9); doc.setTextColor(120); doc.text(tx.autor, margin, y); y += 8;
    doc.setDrawColor(180); doc.setLineWidth(0.2); doc.line(margin, y, pageWidth - margin, y); y += 8;

    doc.setFont('times', 'normal'); doc.setFontSize(10); doc.setTextColor(80);
    const dataFormatada = new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(tx.pdf.geradoEm(dataFormatada), margin, y); y += 10;

    doc.setTextColor(40); doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(tx.pdf.componentes, margin, y); y += 6;
    const componentes = [
      { letra: 'R', nome: tx.compR, valor: r },
      { letra: 'C', nome: tx.compC, valor: c },
      { letra: 'P', nome: tx.compP, valor: p },
    ];
    componentes.forEach((comp) => {
      doc.setFont('times', 'bold'); doc.setFontSize(11); doc.text(`${comp.letra}`, margin, y);
      doc.setFont('times', 'normal'); doc.text(comp.nome, margin + 10, y);
      doc.setFont('times', 'bold'); doc.text(`${comp.valor}`, pageWidth - margin, y, { align: 'right' }); y += 6;
    });

    y += 4; doc.setDrawColor(0); doc.setLineWidth(0.5); doc.line(margin, y, pageWidth - margin, y); y += 10;
    doc.setFont('times', 'normal'); doc.setFontSize(10); doc.setTextColor(100); doc.text(tx.seuInk.toUpperCase(), pageWidth / 2, y, { align: 'center' }); y += 12;
    doc.setFont('times', 'bold'); doc.setFontSize(54); doc.setTextColor(0); doc.text(`${ink}`, pageWidth / 2, y, { align: 'center' }); y += 6;
    doc.setFont('times', 'italic'); doc.setFontSize(9); doc.setTextColor(120); doc.text(tx.formula, pageWidth / 2, y, { align: 'center' }); y += 12;
    doc.setDrawColor(0); doc.line(margin, y, pageWidth - margin, y); y += 10;

    doc.setFont('times', 'normal'); doc.setFontSize(10); doc.setTextColor(100); doc.text(tx.pdf.estagio, margin, y); y += 7;
    doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(0); doc.text(estagio.nome, margin, y); y += 8;
    doc.setFont('times', 'normal'); doc.setFontSize(10); doc.setTextColor(50);
    const linhasDiag = doc.splitTextToSize(estagio.diagnostico, contentWidth);
    doc.text(linhasDiag, margin, y); y += linhasDiag.length * 5 + 8;

    if (y > 190) { doc.addPage(); y = margin; }
    doc.setDrawColor(180); doc.setLineWidth(0.2); doc.line(margin, y, pageWidth - margin, y); y += 8;
    doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(40); doc.text(tx.pdf.mapa, margin, y); y += 4;

    const cxRadar = pageWidth / 2;
    const cyRadar = y + 34;
    const raioRadar = 26;
    const angulosRadar = [-90, 30, 150];
    const pontoRadar = (angulo: number, dist: number): [number, number] => {
      const rad = (angulo * Math.PI) / 180;
      return [cxRadar + dist * Math.cos(rad), cyRadar + dist * Math.sin(rad)];
    };
    doc.setDrawColor(200); doc.setLineWidth(0.2);
    [0.25, 0.5, 0.75, 1].forEach((f) => {
      const [gx1, gy1] = pontoRadar(angulosRadar[0], raioRadar * f);
      const [gx2, gy2] = pontoRadar(angulosRadar[1], raioRadar * f);
      const [gx3, gy3] = pontoRadar(angulosRadar[2], raioRadar * f);
      doc.triangle(gx1, gy1, gx2, gy2, gx3, gy3, 'S');
    });
    angulosRadar.forEach((a) => { const [ax, ay] = pontoRadar(a, raioRadar); doc.line(cxRadar, cyRadar, ax, ay); });
    const [vx1, vy1] = pontoRadar(angulosRadar[0], (r / 100) * raioRadar);
    const [vx2, vy2] = pontoRadar(angulosRadar[1], (c / 100) * raioRadar);
    const [vx3, vy3] = pontoRadar(angulosRadar[2], (p / 100) * raioRadar);
    doc.setDrawColor(0); doc.setLineWidth(0.5); doc.setFillColor(225, 225, 225);
    doc.triangle(vx1, vy1, vx2, vy2, vx3, vy3, 'FD');
    doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(0);
    [{ letra: 'R', valor: r }, { letra: 'C', valor: c }, { letra: 'P', valor: p }].forEach((comp, i) => {
      const [lx, ly] = pontoRadar(angulosRadar[i], raioRadar + 7);
      doc.text(`${comp.letra} ${comp.valor}`, lx, ly, { align: 'center' });
    });
    y = cyRadar + raioRadar / 2 + 16;

    if (showDerivadas) {
      if (y > 195) { doc.addPage(); y = margin; }
      doc.setDrawColor(180); doc.setLineWidth(0.2); doc.line(margin, y, pageWidth - margin, y); y += 8;
      doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(40); doc.text(tx.pdf.derivados, margin, y); y += 8;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.text(tx.pdf.cacInformado(formatBRL(cac)), margin, y); y += 5;
      doc.text(tx.pdf.investInformado(formatBRL(investimento)), margin, y); y += 8;
      doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(100); doc.text(tx.cacNarrativo.toUpperCase(), margin, y); y += 6;
      doc.setFontSize(18); doc.setTextColor(0); doc.text(formatBRL(cacNarrativo), margin, y); y += 6;
      doc.setFont('times', 'italic'); doc.setFontSize(9); doc.setTextColor(100); doc.text(tx.cacNarrativoDesc, margin, y); y += 8;
      doc.setFont('times', 'bold'); doc.setFontSize(10); doc.text(tx.friccao.toUpperCase(), margin, y); y += 6;
      doc.setFontSize(18); doc.setTextColor(0); doc.text(formatBRL(custoFriccao), margin, y); y += 6;
      doc.setFont('times', 'italic'); doc.setFontSize(9); doc.setTextColor(100); doc.text(tx.friccaoDesc, margin, y); y += 10;
    }

    const rodapeY = 280;
    doc.setDrawColor(180); doc.setLineWidth(0.2); doc.line(margin, rodapeY, pageWidth - margin, rodapeY);
    doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
    doc.text(tx.pdf.rodape1, pageWidth / 2, rodapeY + 5, { align: 'center' });
    doc.text(tx.pdf.rodape2, pageWidth / 2, rodapeY + 10, { align: 'center' });
    doc.save(`${tx.pdf.arquivo}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 font-serif">
      <div className="max-w-3xl mx-auto bg-white shadow-sm border border-neutral-200 p-8 md:p-12">
        <header className="border-b border-neutral-300 pb-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black">{tx.titulo}</h1>
          <p className="text-base text-neutral-600 mt-1 italic">{tx.subtitulo}</p>
          <p className="text-xs text-neutral-500 mt-3">Bruno Massa &nbsp;|&nbsp; Narrativa em KPI</p>
        </header>

        <div className="mb-8 text-sm text-neutral-700 leading-relaxed">
          <p>{tx.intro}</p>
        </div>

        <div className="space-y-7 mb-10">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="font-bold text-base"><span className="text-xl">R</span> &nbsp; {tx.compR}</label>
              <span className="font-bold text-2xl tabular-nums">{r}</span>
            </div>
            <p className="text-xs text-neutral-600 italic mb-2">{tx.compRDesc}</p>
            <input type="range" min="0" max="100" value={r} onChange={(e) => setR(parseInt(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-none appearance-none cursor-pointer accent-black" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="font-bold text-base"><span className="text-xl">C</span> &nbsp; {tx.compC}</label>
              <span className="font-bold text-2xl tabular-nums">{c}</span>
            </div>
            <p className="text-xs text-neutral-600 italic mb-2">{tx.compCDesc}</p>
            <input type="range" min="0" max="100" value={c} onChange={(e) => setC(parseInt(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-none appearance-none cursor-pointer accent-black" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <label className="font-bold text-base"><span className="text-xl">P</span> &nbsp; {tx.compP}</label>
              <span className="font-bold text-2xl tabular-nums">{p}</span>
            </div>
            <p className="text-xs text-neutral-600 italic mb-2">{tx.compPDesc}</p>
            <input type="range" min="0" max="100" value={p} onChange={(e) => setP(parseInt(e.target.value))} className="w-full h-1 bg-neutral-200 rounded-none appearance-none cursor-pointer accent-black" />
          </div>
        </div>

        <div className="border-t border-b border-black py-8 mb-8 text-center relative">
          <p className="text-xs uppercase tracking-widest text-neutral-600 mb-2">{tx.seuInk}</p>
          {unlocked ? (
            <div className="fade-in-ink">
              <p className="text-7xl md:text-8xl font-bold tabular-nums leading-none">{ink}</p>
              <p className="text-xs text-neutral-500 mt-2 italic">{tx.formula}</p>
            </div>
          ) : (
            <div className="relative">
              <p className="text-7xl md:text-8xl font-bold tabular-nums leading-none select-none" style={{ filter: 'blur(14px)', color: '#888' }}>{ink}</p>
              <p className="text-xs text-neutral-500 mt-2 italic select-none" style={{ filter: 'blur(4px)' }}>{tx.formula}</p>
              <div className="absolute inset-0 flex items-center justify-center">
                <button onClick={() => setShowModal(true)} className="bg-black text-white px-6 py-3 text-sm font-bold tracking-wide hover:bg-neutral-800 transition-colors shadow-lg">{tx.revelar}</button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3 text-center">{tx.reguaTitulo}</p>
          <div className="relative h-16 flex border border-neutral-400">
            <div className="bg-black flex items-center justify-center" style={{ width: '30%' }}><span className="text-[10px] text-white font-bold tracking-wide">{tx.reguaAusente}</span></div>
            <div className="bg-neutral-700 flex items-center justify-center" style={{ width: '30%' }}><span className="text-[10px] text-white font-bold tracking-wide">{tx.reguaTransicao}</span></div>
            <div className="bg-neutral-300 flex items-center justify-center" style={{ width: '20%' }}><span className="text-[10px] text-black font-bold tracking-wide">{tx.reguaVirou}</span></div>
            <div className="bg-white flex items-center justify-center" style={{ width: '20%' }}><span className="text-[10px] text-black font-bold tracking-wide">{tx.reguaPleno}</span></div>
            {unlocked && (
              <div className="absolute top-0 bottom-0 w-1 bg-red-600 transition-all duration-200 fade-in-ink" style={{ left: markerPosition, transform: 'translateX(-50%)' }}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45"></div>
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs text-neutral-600 mt-1 font-bold">
            <span>0</span><span style={{ marginLeft: '24%' }}>30</span><span style={{ marginLeft: '24%' }}>60</span><span style={{ marginLeft: '14%' }}>80</span><span>100</span>
          </div>
        </div>

        {unlocked ? (
          <div className={`${estagio.bg} ${estagio.text} p-6 mb-8 fade-in-ink`}>
            <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{tx.estagio}</p>
            <p className="text-2xl font-bold mb-3">{estagio.nome}</p>
            <p className="text-sm leading-relaxed">{estagio.diagnostico}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 p-6 mb-8 text-center">
            <p className="text-sm text-neutral-600 italic">{tx.diagBloqueado}</p>
          </div>
        )}

        {unlocked && (
          <div className="mb-8 fade-in-ink">
            <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3 text-center">{tx.mapaTitulo}</p>
            <RadarINK r={r} c={c} p={p} labels={tx.radar} />
            <p className="text-xs text-neutral-500 italic text-center mt-2">{tx.mapaLegenda}</p>
          </div>
        )}

        {unlocked && (
          <div className="mb-8 text-center fade-in-ink">
            <button onClick={baixarPDF} className="border-2 border-black px-6 py-3 text-sm font-bold tracking-wide hover:bg-black hover:text-white transition-colors">{tx.baixarPdf}</button>
          </div>
        )}

        {unlocked && (
          <div className="border-t border-neutral-300 pt-6 fade-in-ink">
            <button onClick={() => setShowDerivadas(!showDerivadas)} className="flex items-center gap-2 text-sm font-bold text-black hover:text-neutral-700 transition-colors">
              <span className="text-lg leading-none">{showDerivadas ? '−' : '+'}</span>{tx.abrirDerivadas}
            </button>
            {showDerivadas && (
              <div className="mt-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-neutral-700 font-bold mb-1">{tx.cacLabel}</label>
                    <input type="number" value={cac} onChange={(e) => setCac(parseInt(e.target.value) || 0)} className="w-full border border-neutral-400 px-3 py-2 text-base font-bold tabular-nums focus:outline-none focus:border-black" min="0" />
                    <p className="text-xs text-neutral-500 italic mt-1">{tx.cacHelp}</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-neutral-700 font-bold mb-1">{tx.investLabel}</label>
                    <input type="number" value={investimento} onChange={(e) => setInvestimento(parseInt(e.target.value) || 0)} className="w-full border border-neutral-400 px-3 py-2 text-base font-bold tabular-nums focus:outline-none focus:border-black" min="0" />
                    <p className="text-xs text-neutral-500 italic mt-1">{tx.investHelp}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5 pt-4">
                  <div className="border border-neutral-300 p-5">
                    <p className="text-xs uppercase tracking-widest text-neutral-600 mb-1">{tx.cacNarrativo}</p>
                    <p className="text-3xl font-bold tabular-nums mb-1">{formatBRL(cacNarrativo)}</p>
                    <p className="text-xs text-neutral-600 italic">{tx.cacNarrativoDesc}</p>
                    <p className="text-[10px] text-neutral-400 mt-2 font-mono">{tx.cacNarrativoFormula}</p>
                  </div>
                  <div className="border border-neutral-300 p-5">
                    <p className="text-xs uppercase tracking-widest text-neutral-600 mb-1">{tx.friccao}</p>
                    <p className="text-3xl font-bold tabular-nums mb-1">{formatBRL(custoFriccao)}</p>
                    <p className="text-xs text-neutral-600 italic">{tx.friccaoDesc}</p>
                    <p className="text-[10px] text-neutral-400 mt-2 font-mono">{tx.friccaoFormula}</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-200">{tx.derivadasNota}</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-neutral-300 text-center">
          <p className="text-xs text-neutral-500 italic">{tx.rodape1a} <span className="font-bold not-italic">Narrativa em KPI</span>{tx.rodape1b}</p>
          <p className="text-[10px] text-neutral-400 mt-1">{tx.rodape2}</p>
          <p className="text-[10px] text-neutral-400 mt-2"><a href={lang === 'en' ? '/en/privacidade' : '/privacidade'} className="underline hover:text-neutral-600">{tx.politica}</a></p>
        </footer>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white max-w-md w-full p-8 fade-in-ink">
            <h2 className="text-2xl font-bold mb-1">{tx.modalTitulo}</h2>
            <p className="text-sm text-neutral-600 italic mb-6">{tx.modalSub}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide font-bold mb-1">{tx.campoNome}</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-neutral-400 px-3 py-2 text-base focus:outline-none focus:border-black" placeholder={tx.campoNomePh} autoFocus />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide font-bold mb-1">{tx.campoEmail}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-neutral-400 px-3 py-2 text-base focus:outline-none focus:border-black" placeholder={tx.campoEmailPh} />
              </div>
              <label className="flex items-start gap-2 text-xs text-neutral-700 cursor-pointer">
                <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} className="mt-0.5 cursor-pointer" />
                <span>{tx.consentimento1}<a href={lang === 'en' ? '/en/privacidade' : '/privacidade'} target="_blank" rel="noopener noreferrer" className="underline font-bold">{tx.consentimentoLink}</a>{tx.consentimento2}</span>
              </label>
              {submitError && <p className="text-xs text-red-600 font-bold">{submitError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-neutral-400 px-4 py-3 text-sm font-bold hover:bg-neutral-100 transition-colors" disabled={submitting}>{tx.cancelar}</button>
                <button type="submit" className="flex-1 bg-black text-white px-4 py-3 text-sm font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50" disabled={submitting}>{submitting ? tx.enviando : tx.verResultado}</button>
              </div>
              <p className="text-[10px] text-neutral-500 italic pt-2 border-t border-neutral-200">{tx.lgpd}</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
