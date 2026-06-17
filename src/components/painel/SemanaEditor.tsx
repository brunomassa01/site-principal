import { useEffect, useState } from 'react';

// ---- tipos (peças vêm serializadas da página Astro) ----
type Slide = { n?: number; tipo?: string; tag?: string; titulo?: string; subtitulo?: string; texto?: string; assinatura?: string };
type Cena = { n?: number; titulo?: string; fala?: string; legenda?: string };
type Conteudo = {
  texto?: string;
  formato?: string;
  referencia?: string;
  slides?: Slide[];
  capa?: string;
  duracao?: string;
  cenas?: Cena[];
  roteiro?: string;
  notas?: string;
  tag?: string;
  titulo?: string;
  subtitulo?: string;
  bg?: string;
  estilo?: string;
  refUpload?: string;
  refNota?: string;
  manychatPedido?: string;
  manychatEntrega?: string;
};

// monta um roteiro corrido (pra ler e gravar) a partir das cenas estruturadas
function montarRoteiro(c: Conteudo): string {
  const linhas: string[] = [];
  if (c.capa) linhas.push(`CAPA: ${c.capa}`, '');
  (c.cenas ?? []).forEach((s) => {
    linhas.push((s.titulo ?? `Cena ${s.n ?? ''}`).toUpperCase());
    if (s.fala) linhas.push(s.fala);
    if (s.legenda) linhas.push(`   [legenda na tela: ${s.legenda}]`);
    linhas.push('');
  });
  return linhas.join('\n').trim();
}
type Metricas = {
  impressoes?: number; alcance?: number; reacoes?: number; comentarios?: number;
  compartilhamentos?: number; salvamentos?: number; envios?: number; cliques?: number;
  visualizacoesPerfil?: number; seguidoresGanhos?: number; taxaEngajamento?: number;
  analise?: string; recomendacao?: string; fonte?: string; atualizadoEm?: string;
};
type Peca = {
  id: string; formato: string; gancho: string | null; lente: string | null;
  conteudo: Conteudo | null; legenda: string | null; manychat: string | null;
  diaPublicacao: string | null; status: string; midiaUrls: string[] | null;
  opcional?: boolean; metricas?: Metricas | null; agendadoPara?: string | null;
};
type Semana = {
  numero: number; inicio: string | null; cluster: string | null;
  ponteIa: boolean; coringa: boolean; slotReativo: boolean;
  observacoes: string | null; status: string; pecas: Peca[];
};

const FMT: Record<string, { label: string; icon: string }> = {
  linkedin: { label: 'LinkedIn', icon: 'in' },
  carrossel: { label: 'Carrossel Instagram', icon: '▦' },
  reel: { label: 'Reel', icon: '►' },
  post: { label: 'Post único Instagram', icon: '◻' },
};
const STATUS = ['planejado', 'escrito', 'aprovado', 'publicado'];
const STATUS_LABEL: Record<string, string> = { planejado: 'Planejado', escrito: 'Escrito', aprovado: 'Aprovado', agendado: 'Agendado', publicado: 'Publicado' };
const STATUS_CLS: Record<string, string> = {
  planejado: 'bg-gray-100 text-gray-500 border-gray-200',
  escrito: 'bg-amber-50 text-amber-700 border-amber-200',
  aprovado: 'bg-blue-50 text-blue-700 border-blue-200',
  agendado: 'bg-violet-50 text-violet-700 border-violet-200',
  publicado: 'bg-green-50 text-green-700 border-green-200',
};
const fmtData = (s: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '');
// formata um ISO (UTC) no horário de São Paulo, ex.: "22/06/2026 08:00"
const fmtAgendado = (iso: string) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
// ISO (UTC) -> string do datetime-local em horário de SP (UTC-3): "YYYY-MM-DDTHH:MM"
const isoParaSpLocal = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600 * 1000).toISOString().slice(0, 16);

// monta o texto para copiar, por formato
function textoParaCopiar(p: Peca): string {
  const c = p.conteudo ?? {};
  if (p.formato === 'linkedin') return c.texto ?? '';
  if (p.formato === 'carrossel') {
    const slides = (c.slides ?? []).map((s) => {
      const cab = [s.tag, s.titulo].filter(Boolean).join(' · ');
      return [`— Slide ${s.n ?? ''} —`, cab, s.subtitulo, s.texto, s.assinatura].filter(Boolean).join('\n');
    }).join('\n\n');
    return [slides, p.legenda ? `\n\nLegenda:\n${p.legenda}` : ''].join('');
  }
  if (p.formato === 'post') {
    const cab = [c.tag, c.titulo].filter(Boolean).join(' · ');
    return [cab, c.subtitulo, p.legenda ? `\n\nLegenda:\n${p.legenda}` : ''].filter(Boolean).join('\n');
  }
  if (p.formato === 'reel') {
    const base = c.roteiro && c.roteiro.trim() ? c.roteiro.trim() : montarRoteiro(c);
    return base + (p.legenda ? `\n\nLegenda:\n${p.legenda}` : '');
  }
  return '';
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-apple-separator text-[14px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40';

// Otimiza a imagem no navegador (reduz dimensão e converte p/ webp) antes de enviar — espelha o otimizador do blog.
async function otimizarImagem(file: File): Promise<File> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 1600 / bmp.width);
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

// Baixa uma imagem do Blob (CORS liberado) forçando o download, com a extensão certa.
async function baixarImagem(url: string, nomeBase: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp'
      : blob.type.includes('jpeg') ? 'jpg' : (url.split('?')[0].split('.').pop() || 'png');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nomeBase}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch {
    window.open(url, '_blank');
  }
}

export default function SemanaEditor({ semana }: { semana: Semana }) {
  const [pecas, setPecas] = useState<Peca[]>(semana.pecas);
  const [statusSem, setStatusSem] = useState(semana.status);
  const [gerandoTodos, setGerandoTodos] = useState(false);
  const [fundos, setFundos] = useState<{ id: string; url: string; rotulo: string }[]>([]);
  useEffect(() => {
    fetch('/api/painel/social/fundos').then((r) => r.json()).then((d) => Array.isArray(d) && setFundos(d)).catch(() => {});
  }, []);

  function patchPeca(id: string, patch: Partial<Peca>) {
    setPecas((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function patchConteudo(id: string, patch: Partial<Conteudo>) {
    setPecas((ps) => ps.map((p) => (p.id === id ? { ...p, conteudo: { ...(p.conteudo ?? {}), ...patch } } : p)));
  }

  async function setStatusSemana(s: string) {
    setStatusSem(s);
    await fetch(`/api/painel/social/semanas/${semana.numero}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: s }),
    });
  }
  async function gerarTodos() {
    // só as peças firmes (não o reel-bônus): cadência 2/semana
    const firmes = pecas.filter((p) => !p.opcional);
    if (!confirm(`Gerar (ou regerar) as ${firmes.length} peças firmes desta semana com IA? Isso substitui o conteúdo atual delas. O reel-bônus você gera à parte, se quiser.`)) return;
    setGerandoTodos(true);
    for (const p of firmes) {
      try {
        // salva o gancho/lente atuais antes de gerar (senão usa o gancho antigo do banco)
        await fetch(`/api/painel/social/pecas/${p.id}`, {
          method: 'PUT', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ gancho: p.gancho, lente: p.lente }),
        });
        const r = await fetch(`/api/painel/social/gerar/${p.id}`, { method: 'POST' });
        const j = await r.json();
        if (r.ok && j.conteudo) patchPeca(p.id, { conteudo: j.conteudo, legenda: j.legenda ?? p.legenda, status: j.status ?? 'escrito' });
      } catch { /* segue */ }
    }
    setGerandoTodos(false);
  }
  async function adicionarPost() {
    const r = await fetch('/api/painel/social/pecas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ numero: semana.numero, formato: 'post' }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.id) {
      setPecas((ps) => [...ps, { id: j.id, formato: 'post', gancho: j.gancho ?? null, lente: j.lente ?? null, conteudo: j.conteudo ?? null, legenda: j.legenda ?? null, manychat: j.manychat ?? null, diaPublicacao: j.diaPublicacao ?? null, status: j.status ?? 'planejado', midiaUrls: j.midiaUrls ?? [] }]);
    } else alert(j.error || 'Não foi possível adicionar o post.');
  }
  async function removerPeca(id: string) {
    if (!confirm('Remover esta peça? Esta ação não pode ser desfeita.')) return;
    await fetch(`/api/painel/social/pecas/${id}`, { method: 'DELETE' });
    setPecas((ps) => ps.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho da semana */}
      <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <a href="/painel/social" className="text-[13px] text-apple-accent hover:underline">← Calendário</a>
        <span className="text-apple-separator">|</span>
        <h1 className="text-[20px] font-bold text-apple-label">{semana.numero === 0 ? 'Conteúdos avulsos' : `Semana ${semana.numero}`}</h1>
        {semana.numero === 0 && <span className="text-[12px] text-apple-tertiary">peças criadas a partir do blog, fora do calendário</span>}
        <span className="text-[13px] text-apple-tertiary">{fmtData(semana.inicio)}</span>
        {semana.cluster && <span className="text-[12px] px-2 py-0.5 rounded-full bg-apple-fill text-apple-secondary">{semana.cluster}</span>}
        {semana.ponteIa && <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">PONTE IA</span>}
        {semana.coringa && <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium">Coringa</span>}
        {semana.slotReativo && <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-medium">Reativo</span>}
        <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap items-center gap-2">
          {semana.numero > 0 && (
            <button onClick={gerarTodos} disabled={gerandoTodos} className="px-4 py-2 rounded-full bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 disabled:opacity-60">
              {gerandoTodos ? 'Gerando…' : `✨ Gerar as ${pecas.filter((p) => !p.opcional).length} com IA`}
            </button>
          )}
          <span className="text-[12px] text-apple-tertiary">Status</span>
          <select className={`${inputCls} w-auto py-1.5`} value={statusSem} onChange={(e) => setStatusSemana(e.target.value)}>
            <option value="planejado">Planejado</option>
            <option value="em-producao">Em produção</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {semana.observacoes && (
        <p className="text-[13px] text-apple-secondary bg-apple-fill rounded-lg px-3 py-2">📌 {semana.observacoes}</p>
      )}

      {/* As peças da semana */}
      {pecas.map((p) => (
        <PecaCard key={p.id} peca={p} fundos={fundos} onPatch={patchPeca} onPatchConteudo={patchConteudo} onRemove={removerPeca} podeRemover={semana.numero === 0 || p.formato === 'post'} />
      ))}

      <button onClick={adicionarPost} className="w-full py-3 rounded-2xl border-2 border-dashed border-apple-separator text-[14px] text-apple-secondary hover:bg-apple-fill hover:text-apple-label transition-colors">
        + Adicionar post único (Instagram)
      </button>

      {/* Resposta do Manychat — card próprio da semana (a palavra-chave é a mesma p/ todos os posts) */}
      {pecas.some((p) => p.formato === 'carrossel') && (
        <ManychatBloco peca={pecas.find((p) => p.formato === 'carrossel')!} onPatchConteudo={patchConteudo} />
      )}
    </div>
  );
}

function ManychatBloco({ peca, onPatchConteudo }: { peca: Peca; onPatchConteudo: (id: string, patch: Partial<Conteudo>) => void }) {
  const [gerando, setGerando] = useState(false);
  const [copiou, setCopiou] = useState<'p' | 'e' | null>(null);
  const c = peca.conteudo ?? {};
  async function persist(patch: Partial<Conteudo>) {
    onPatchConteudo(peca.id, patch);
    const novo = { ...(peca.conteudo ?? {}), ...patch };
    await fetch(`/api/painel/social/pecas/${peca.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conteudo: novo }) });
  }
  async function gerar() {
    setGerando(true);
    const r = await fetch(`/api/painel/social/manychat/${peca.id}`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setGerando(false);
    if (r.ok && (j.pedido || j.entrega)) onPatchConteudo(peca.id, { manychatPedido: j.pedido, manychatEntrega: j.entrega });
    else alert(j.error || (j.detail ? `Erro: ${j.detail}` : 'Não foi possível gerar a resposta do Manychat.'));
  }
  const copiar = (qual: 'p' | 'e', txt: string) => { navigator.clipboard.writeText(txt || ''); setCopiou(qual); setTimeout(() => setCopiou(null), 1500); };
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <div>
          <span className="text-[15px] font-semibold text-apple-label">Resposta do Manychat</span>
          {peca.manychat && <span className="text-[12px] text-apple-tertiary ml-2">palavra: <strong>{peca.manychat}</strong></span>}
        </div>
        <button onClick={gerar} disabled={gerando} className="px-4 py-2 rounded-full bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 disabled:opacity-60">
          {gerando ? 'Gerando…' : '✨ Gerar resposta'}
        </button>
      </div>
      <p className="text-[12px] text-apple-tertiary mb-4">O DM automático quando alguém comenta a palavra da semana. Vale pra todos os posts: o pedido de automação (1º DM) + o diagnóstico/entrega (2º DM).</p>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[12px] font-medium text-apple-tertiary">1) Pedido de automação <span className="opacity-70">(1º DM · o gatilho)</span></label>
        <button onClick={() => copiar('p', c.manychatPedido ?? '')} className="text-[11px] text-apple-accent hover:underline">{copiou === 'p' ? 'Copiado ✓' : 'Copiar'}</button>
      </div>
      <textarea className={`${inputCls} min-h-[64px] mb-4`} placeholder="O 1º DM que agradece e pede a interação…" value={c.manychatPedido ?? ''} onChange={(e) => onPatchConteudo(peca.id, { manychatPedido: e.target.value })} onBlur={(e) => persist({ manychatPedido: e.target.value })} />
      <div className="flex items-center justify-between mb-1">
        <label className="text-[12px] font-medium text-apple-tertiary">2) Diagnóstico / entrega <span className="opacity-70">(2º DM · o material)</span></label>
        <button onClick={() => copiar('e', c.manychatEntrega ?? '')} className="text-[11px] text-apple-accent hover:underline">{copiou === 'e' ? 'Copiado ✓' : 'Copiar'}</button>
      </div>
      <textarea className={`${inputCls} min-h-[130px]`} placeholder="O diagnóstico/material que o post prometeu…" value={c.manychatEntrega ?? ''} onChange={(e) => onPatchConteudo(peca.id, { manychatEntrega: e.target.value })} onBlur={(e) => persist({ manychatEntrega: e.target.value })} />
    </div>
  );
}

function PecaCard({ peca, fundos, onPatch, onPatchConteudo, onRemove, podeRemover }: {
  peca: Peca;
  fundos: { id: string; url: string; rotulo: string }[];
  onPatch: (id: string, patch: Partial<Peca>) => void;
  onPatchConteudo: (id: string, patch: Partial<Conteudo>) => void;
  onRemove: (id: string) => void;
  podeRemover: boolean;
}) {
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [artes, setArtes] = useState<string[]>(peca.midiaUrls ?? []);
  const [subindo, setSubindo] = useState(false);
  const [extras, setExtras] = useState<string[]>(() => {
    const r = peca.conteudo?.refUpload;
    if (r) return [r];
    return peca.conteudo?.estilo === 'upload' && peca.conteudo?.bg ? [peca.conteudo.bg] : [];
  });
  const [gerandoMc, setGerandoMc] = useState(false);
  const [copiouMc, setCopiouMc] = useState<'p' | 'e' | null>(null);
  const [metricas, setMetricas] = useState<Metricas | null>(peca.metricas ?? null);
  const [lendoPerf, setLendoPerf] = useState(false);
  const [erroPerf, setErroPerf] = useState('');
  const [agendarEm, setAgendarEm] = useState(peca.agendadoPara ? isoParaSpLocal(peca.agendadoPara) : '');
  const [agendandoBuffer, setAgendandoBuffer] = useState(false);
  const [msgBuffer, setMsgBuffer] = useState<{ texto: string; erro: boolean } | null>(null);
  const [publicandoLi, setPublicandoLi] = useState(false);
  const [msgLi, setMsgLi] = useState<{ texto: string; erro: boolean; url?: string } | null>(null);
  const meta = FMT[peca.formato] ?? { label: peca.formato, icon: '•' };

  async function publicarLinkedIn() {
    const corpo = (peca.conteudo?.texto || peca.legenda || peca.gancho || '').trim();
    if (!corpo) { setMsgLi({ texto: 'Sem texto pra publicar.', erro: true }); return; }
    if (!confirm('Publicar este post AGORA no seu LinkedIn pessoal? Vai pro ar público.')) return;
    setPublicandoLi(true); setMsgLi(null);
    const r = await fetch('/api/painel/social/linkedin-publicar', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pecaId: peca.id }),
    });
    const j = await r.json().catch(() => ({}));
    setPublicandoLi(false);
    if (r.ok && j.ok) {
      setMsgLi({ texto: 'Publicado no LinkedIn ✓', erro: false, url: j.url });
      onPatch(peca.id, { status: 'publicado' });
    } else {
      setMsgLi({ texto: `${j.error || 'Falha ao publicar.'}${j.detail ? ' — ' + j.detail : ''}`, erro: true });
    }
  }

  async function agendarLinkedIn() {
    if (!agendarEm) { setMsgLi({ texto: 'Escolha a data e a hora.', erro: true }); return; }
    setAgendandoBuffer(true); setMsgLi(null);
    const r = await fetch('/api/painel/social/linkedin-agendar', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pecaId: peca.id, dueAt: agendarEm }),
    });
    const j = await r.json().catch(() => ({}));
    setAgendandoBuffer(false);
    if (r.ok && j.ok) {
      setMsgLi({ texto: `Agendado ✓`, erro: false });
      onPatch(peca.id, { status: 'agendado', agendadoPara: j.agendadoPara });
    } else {
      setMsgLi({ texto: `${j.error || 'Falha ao agendar.'}${j.detail ? ' — ' + j.detail : ''}`, erro: true });
    }
  }

  async function cancelarAgendamento() {
    if (!confirm('Cancelar o agendamento deste post? Ele volta pra "aprovado" e não publica sozinho.')) return;
    setAgendandoBuffer(true); setMsgLi(null);
    const r = await fetch('/api/painel/social/linkedin-agendar', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pecaId: peca.id, cancelar: true }),
    });
    setAgendandoBuffer(false);
    if (r.ok) {
      setAgendarEm('');
      onPatch(peca.id, { status: 'aprovado', agendadoPara: null });
      setMsgLi({ texto: 'Agendamento cancelado.', erro: false });
    } else setMsgLi({ texto: 'Não consegui cancelar.', erro: true });
  }

  async function lerPerformance(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLendoPerf(true); setErroPerf('');
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch(`/api/painel/social/performance/${peca.id}`, { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    setLendoPerf(false);
    if (r.ok && j.metricas) { setMetricas(j.metricas); onPatch(peca.id, { metricas: j.metricas }); }
    else setErroPerf(j.error || 'Não consegui ler esse arquivo.');
  }

  // muda o status E persiste na hora (clicar no status precisa salvar sozinho)
  async function mudarStatus(s: string) {
    onPatch(peca.id, { status: s });
    await fetch(`/api/painel/social/pecas/${peca.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: s }),
    });
  }

  async function agendarBuffer() {
    if (!agendarEm) return;
    setAgendandoBuffer(true); setMsgBuffer(null);
    const r = await fetch('/api/painel/social/buffer-send', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pecaId: peca.id, dueAt: agendarEm }),
    });
    const j = await r.json().catch(() => ({}));
    setAgendandoBuffer(false);
    if (r.ok && j.ok) {
      const q = new Date(agendarEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      setMsgBuffer({ texto: `Agendado no Buffer (${j.canal}) para ${q} ✓`, erro: false });
      onPatch(peca.id, { status: 'aprovado' });
    } else {
      setMsgBuffer({ texto: `${j.error || 'Falha ao agendar.'}${j.detail ? ' — ' + j.detail : ''}`, erro: true });
    }
  }

  async function salvar() {
    setSalvando(true); setSalvo(false);
    const r = await fetch(`/api/painel/social/pecas/${peca.id}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        gancho: peca.gancho, lente: peca.lente, legenda: peca.legenda,
        status: peca.status, conteudo: peca.conteudo,
      }),
    });
    setSalvando(false);
    if (r.ok) { setSalvo(true); setTimeout(() => setSalvo(false), 2000); }
  }
  async function copiar() {
    await navigator.clipboard.writeText(textoParaCopiar(peca));
    setCopiado(true); setTimeout(() => setCopiado(false), 1500);
  }
  async function enviarBlog() {
    setEnviando(true);
    const r = await fetch(`/api/painel/social/para-blog/${peca.id}`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setEnviando(false);
    if (r.ok && j.id) {
      if (confirm('Rascunho criado no blog. Abrir para revisar e publicar?')) window.location.href = `/painel/posts/${j.id}`;
    } else {
      alert(j.error || 'Não foi possível enviar para o blog.');
    }
  }
  async function gerarArtes() {
    setGerando(true);
    // salva o conteúdo atual (estilo + instrução da referência) antes de gerar
    await fetch(`/api/painel/social/pecas/${peca.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conteudo: peca.conteudo }) });
    const r = await fetch(`/api/painel/social/artes/${peca.id}`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setGerando(false);
    if (r.ok && Array.isArray(j.urls)) setArtes(j.urls);
    else alert(j.error || 'Não foi possível gerar as artes.');
  }
  async function baixarTodas() {
    for (let i = 0; i < artes.length; i++) {
      await baixarImagem(artes[i], `arte-${peca.formato}-${String(i + 1).padStart(2, '0')}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  async function excluirArtes() {
    if (!confirm('Excluir as artes geradas? Você pode gerar de novo depois.')) return;
    setArtes([]);
    await fetch(`/api/painel/social/pecas/${peca.id}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ midiaUrls: [] }),
    });
  }
  // aplica um patch no conteúdo da capa e persiste na hora
  async function persistirConteudo(patch: Partial<Conteudo>) {
    onPatchConteudo(peca.id, patch);
    const novoConteudo = { ...(peca.conteudo ?? {}), ...patch };
    await fetch(`/api/painel/social/pecas/${peca.id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ conteudo: novoConteudo }) });
  }
  const escolherTinta = () => persistirConteudo({ estilo: '', bg: '' });
  // estilo = referência visual; a IA gera uma imagem NOVA nesse estilo ao "Gerar artes"
  const escolherEstilo = (id: string) => persistirConteudo({ estilo: id, bg: '' });
  // foto enviada usada como REFERÊNCIA visual (IA cria nova) — padrão ao subir
  const escolherFotoRef = (url: string) => persistirConteudo({ estilo: 'ref', refUpload: url, bg: '' });
  // foto enviada usada como está (sem IA)
  const usarFotoComoEsta = (url: string) => persistirConteudo({ estilo: 'upload', refUpload: url, bg: url });
  async function subirFundo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSubindo(true);
    const fd = new FormData();
    fd.append('file', await otimizarImagem(file));
    const r = await fetch('/api/painel/upload', { method: 'POST', body: fd });
    const j = await r.json().catch(() => ({}));
    setSubindo(false);
    if (j.url) { setExtras((x) => (x.includes(j.url) ? x : [...x, j.url])); escolherFotoRef(j.url); }
    else alert(j.error || 'Falha ao subir a foto.');
  }
  async function gerarIA() {
    const temConteudo = peca.conteudo && Object.keys(peca.conteudo).length > 0;
    if (temConteudo && !confirm('Isso substitui o conteúdo atual desta peça pela versão gerada pela IA. Continuar?')) return;
    setGerandoIA(true);
    // SALVA o gancho/lente atuais ANTES de gerar — senão a IA usa o gancho antigo do banco
    await fetch(`/api/painel/social/pecas/${peca.id}`, {
      method: 'PUT', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gancho: peca.gancho, lente: peca.lente }),
    });
    const r = await fetch(`/api/painel/social/gerar/${peca.id}`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setGerandoIA(false);
    if (r.ok && j.conteudo) {
      onPatch(peca.id, { conteudo: j.conteudo, legenda: j.legenda ?? peca.legenda, status: j.status ?? 'escrito' });
    } else {
      alert(j.error || (j.detail ? `Erro: ${j.detail}` : 'Não foi possível gerar com IA.'));
    }
  }
  async function gerarManychat() {
    setGerandoMc(true);
    const r = await fetch(`/api/painel/social/manychat/${peca.id}`, { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    setGerandoMc(false);
    if (r.ok && (j.pedido || j.entrega)) {
      onPatchConteudo(peca.id, { manychatPedido: j.pedido, manychatEntrega: j.entrega });
    } else {
      alert(j.error || (j.detail ? `Erro: ${j.detail}` : 'Não foi possível gerar a resposta do Manychat.'));
    }
  }
  const copiarMc = (qual: 'p' | 'e', txt: string) => {
    navigator.clipboard.writeText(txt || '');
    setCopiouMc(qual);
    setTimeout(() => setCopiouMc(null), 1500);
  };

  const c = peca.conteudo ?? {};

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* topo da peça */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-apple-separator/40 bg-apple-surface">
        <span className="text-[15px] font-semibold text-apple-label">{meta.label}</span>
        {peca.opcional && <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium" title="Peça bônus: não conta na meta da semana (cadência 2/semana). Gere quando sobrar fôlego.">bônus</span>}
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_CLS[peca.status] ?? ''}`}>{STATUS_LABEL[peca.status] ?? peca.status}</span>
        {peca.manychat && <span className="text-[11px] px-2 py-0.5 rounded-full bg-apple-fill text-apple-tertiary">Manychat: {peca.manychat}</span>}
        {peca.diaPublicacao && <span className="text-[11px] text-apple-tertiary capitalize">{peca.diaPublicacao}-feira</span>}
        <div className="ml-auto flex items-center gap-1">
          {STATUS.map((s) => (
            <button key={s} onClick={() => onPatch(peca.id, { status: s })}
              className={`text-[11px] px-2 py-1 rounded-md ${peca.status === s ? 'bg-apple-label text-white' : 'text-apple-secondary hover:bg-apple-fill'}`}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <button onClick={salvar} disabled={salvando} title="Salva o status e os textos desta peça"
          className="px-3 py-1.5 rounded-full bg-apple-label text-white text-[12px] font-medium hover:bg-black disabled:opacity-60">
          {salvando ? 'Salvando…' : salvo ? 'Salvo ✓' : '💾 Salvar'}
        </button>
        {podeRemover && (
          <button onClick={() => onRemove(peca.id)} title="Remover esta peça" className="text-[12px] text-red-600 hover:underline">✕ remover</button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* gancho + lente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Gancho / ideia</label>
            <textarea className={`${inputCls} min-h-[52px]`} value={peca.gancho ?? ''} onChange={(e) => onPatch(peca.id, { gancho: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Lente (conceito do livro)</label>
            <textarea className={`${inputCls} min-h-[52px]`} value={peca.lente ?? ''} onChange={(e) => onPatch(peca.id, { lente: e.target.value })} />
          </div>
        </div>

        {/* editor por formato */}
        {peca.formato === 'linkedin' && (
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Texto do post</label>
            <textarea className={`${inputCls} min-h-[220px] leading-relaxed`} placeholder="Escreva o post…" value={c.texto ?? ''} onChange={(e) => onPatchConteudo(peca.id, { texto: e.target.value })} />
          </div>
        )}

        {peca.formato === 'carrossel' && (
          <Slides slides={c.slides ?? []} onChange={(slides) => onPatchConteudo(peca.id, { slides })}
            legenda={peca.legenda} onLegenda={(v) => onPatch(peca.id, { legenda: v })} />
        )}

        {peca.formato === 'reel' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] font-medium text-apple-tertiary">Roteiro — texto corrido pra ler e gravar</label>
                {(c.cenas?.length ?? 0) > 0 && (
                  <button onClick={() => onPatchConteudo(peca.id, { roteiro: montarRoteiro(c) })} className="text-[12px] text-apple-accent hover:underline">↻ Montar a partir das cenas</button>
                )}
              </div>
              <textarea className={`${inputCls} min-h-[260px] leading-relaxed`} placeholder="Escreva o roteiro corrido, do jeito que você vai falar…" value={c.roteiro ?? ''} onChange={(e) => onPatchConteudo(peca.id, { roteiro: e.target.value })} />
            </div>
            <details className="rounded-lg border border-apple-separator/60 px-3 py-2">
              <summary className="text-[12px] font-medium text-apple-tertiary cursor-pointer select-none">Cenas, capa e legenda (estrutura — opcional, pra edição/artes)</summary>
              <div className="mt-3">
                <Cenas capa={c.capa ?? ''} onCapa={(v) => onPatchConteudo(peca.id, { capa: v })}
                  cenas={c.cenas ?? []} onChange={(cenas) => onPatchConteudo(peca.id, { cenas })}
                  legenda={peca.legenda} onLegenda={(v) => onPatch(peca.id, { legenda: v })} />
              </div>
            </details>
          </div>
        )}

        {peca.formato === 'post' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Tag (kicker, opcional)</label>
              <input className={inputCls} placeholder="Ex.: GESTÃO DE MARKETING" value={c.tag ?? ''} onChange={(e) => onPatchConteudo(peca.id, { tag: e.target.value })} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Título da imagem (o gancho grande)</label>
              <textarea className={`${inputCls} min-h-[70px] font-medium`} placeholder="A frase forte que vai grande na imagem…" value={c.titulo ?? ''} onChange={(e) => onPatchConteudo(peca.id, { titulo: e.target.value })} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Subtítulo (linha de apoio, opcional)</label>
              <input className={inputCls} placeholder="Uma linha que explica o gancho" value={c.subtitulo ?? ''} onChange={(e) => onPatchConteudo(peca.id, { subtitulo: e.target.value })} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Legenda do post</label>
              <textarea className={`${inputCls} min-h-[100px]`} placeholder="A legenda pro feed…" value={peca.legenda ?? ''} onChange={(e) => onPatch(peca.id, { legenda: e.target.value })} />
            </div>
          </div>
        )}

        {/* seletor de modelo visual (capa) — carrossel/reel/post */}
        {(peca.formato === 'carrossel' || peca.formato === 'reel' || peca.formato === 'post') && (
          <div>
            <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Estilo visual da capa</label>
            <p className="text-[11px] text-apple-tertiary mb-2">Escolha um <strong>estilo</strong> (✨): a IA cria uma imagem nova ao "Gerar artes". <strong>Sua própria foto também vira referência</strong> — ou use ela como está. Ou Tinta (preto).</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={escolherTinta} title="Tinta (fundo preto, sem foto)"
                className={`w-16 h-20 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-apple-label ${!c.estilo && !c.bg ? 'border-apple-accent' : 'border-transparent'}`}>
                <span className="text-[9px] text-white/70">Tinta</span>
              </button>
              {fundos.map((f) => (
                <button key={f.id} onClick={() => escolherEstilo(f.id)} title={`Estilo: ${f.rotulo} (IA gera nova)`}
                  className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 ${c.estilo === f.id ? 'border-apple-accent' : 'border-transparent'}`}>
                  <img src={f.url} alt={f.rotulo} className="w-full h-full object-cover" />
                  <span className="absolute top-0.5 right-0.5 text-[9px] bg-black/60 text-white rounded px-1 leading-tight">✨</span>
                </button>
              ))}
              {extras.filter((u) => u && !fundos.some((f) => f.url === u)).map((url) => (
                <button key={url} onClick={() => escolherFotoRef(url)} title="Sua foto (referência de estilo)"
                  className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 ${c.refUpload === url ? 'border-apple-accent' : 'border-transparent'}`}>
                  <img src={url} alt="foto enviada" className="w-full h-full object-cover" />
                  <span className="absolute top-0.5 right-0.5 text-[9px] bg-black/60 text-white rounded px-1 leading-tight">✨</span>
                </button>
              ))}
              <label className={`w-16 h-20 rounded-lg border-2 border-dashed border-apple-separator flex items-center justify-center text-[10px] text-center px-1 ${subindo ? 'opacity-60' : 'text-apple-secondary cursor-pointer hover:bg-apple-fill'}`}>
                {subindo ? 'Subindo…' : '+ Subir foto'}
                <input type="file" accept="image/*" hidden disabled={subindo} onChange={subirFundo} />
              </label>
            </div>
            {c.refUpload && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] text-apple-tertiary">Sua foto:</span>
                <button onClick={() => escolherFotoRef(c.refUpload!)} className={`text-[11px] px-2.5 py-1 rounded-full border ${c.estilo === 'ref' ? 'border-apple-accent bg-apple-accent/10 text-apple-label font-medium' : 'border-apple-separator text-apple-secondary hover:bg-apple-fill'}`}>✨ Como referência (IA cria nova)</button>
                <button onClick={() => usarFotoComoEsta(c.refUpload!)} className={`text-[11px] px-2.5 py-1 rounded-full border ${c.estilo === 'upload' ? 'border-apple-accent bg-apple-accent/10 text-apple-label font-medium' : 'border-apple-separator text-apple-secondary hover:bg-apple-fill'}`}>🖼 Usar a foto como está</button>
              </div>
            )}
            {c.estilo && c.estilo !== 'upload' && (
              <div className="mt-3">
                <label className="block text-[11px] font-medium text-apple-tertiary mb-1">O que você quer nessa imagem? <span className="opacity-70">(opcional — guia a IA)</span></label>
                <textarea className={`${inputCls} min-h-[44px] text-[13px]`} placeholder="Ex.: mantém o clima da foto mas num escritório; tom mais quente; menos pessoas…" value={c.refNota ?? ''} onChange={(e) => onPatchConteudo(peca.id, { refNota: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {/* ações */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={gerarIA} disabled={gerandoIA} className="px-4 py-2 rounded-full bg-violet-600 text-white text-[13px] font-medium hover:bg-violet-700 disabled:opacity-60">
            {gerandoIA ? 'Gerando…' : `✨ Gerar ${peca.formato === 'linkedin' ? 'post' : peca.formato} com IA`}
          </button>
          <button onClick={salvar} disabled={salvando} className="px-4 py-2 rounded-full bg-apple-label text-white text-[13px] font-medium hover:bg-black disabled:opacity-60">
            {salvando ? 'Salvando…' : salvo ? 'Salvo ✓' : 'Salvar'}
          </button>
          <button onClick={copiar} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-apple-secondary hover:bg-apple-fill">
            {copiado ? 'Copiado ✓' : 'Copiar texto'}
          </button>
          <button onClick={enviarBlog} disabled={enviando} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-apple-secondary hover:bg-apple-fill disabled:opacity-60">
            {enviando ? 'Enviando…' : '↗ Enviar para o blog'}
          </button>
          {(peca.formato === 'carrossel' || peca.formato === 'reel' || peca.formato === 'post') && (
            <button onClick={gerarArtes} disabled={gerando} className="px-4 py-2 rounded-full border border-apple-separator text-[13px] text-apple-secondary hover:bg-apple-fill disabled:opacity-60">
              {gerando ? 'Gerando…' : artes.length ? '🎨 Gerar outra' : '🎨 Gerar artes'}
            </button>
          )}
        </div>

        {/* Publicar no LinkedIn (perfil pessoal, via API oficial, direto do CMS) */}
        {peca.formato === 'linkedin' && (
          <div className="pt-1 flex flex-wrap items-center gap-2">
            {peca.status === 'agendado' && peca.agendadoPara && (
              <div className="w-full flex items-center gap-2 text-[13px] text-violet-800 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
                <span>📅 <strong>Agendado</strong> para {fmtAgendado(peca.agendadoPara)} (horário de SP)</span>
                <button onClick={cancelarAgendamento} disabled={agendandoBuffer} className="ml-auto text-red-600 hover:underline">✕ cancelar</button>
              </div>
            )}
            <button onClick={publicarLinkedIn} disabled={publicandoLi || agendandoBuffer}
              className="px-4 py-2 rounded-full bg-[#0A66C2] text-white text-[13px] font-medium hover:bg-[#004182] disabled:opacity-60">
              {publicandoLi ? 'Publicando…' : '▶ Publicar agora'}
            </button>
            <span className="text-apple-separator">ou</span>
            <input type="datetime-local" value={agendarEm} onChange={(e) => setAgendarEm(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-apple-separator text-[13px] focus:outline-none focus:ring-2 focus:ring-apple-accent/40" />
            <button onClick={agendarLinkedIn} disabled={agendandoBuffer || publicandoLi || !agendarEm}
              className="px-4 py-2 rounded-full bg-[#1d2433] text-white text-[13px] font-medium hover:bg-black disabled:opacity-50">
              {agendandoBuffer ? 'Agendando…' : '📅 Agendar'}
            </button>
            {msgLi && (
              <span className={`text-[12px] w-full ${msgLi.erro ? 'text-red-600' : 'text-green-700'}`}>
                {msgLi.texto}{msgLi.url && <> · <a href={msgLi.url} target="_blank" rel="noopener" className="underline">ver no LinkedIn ↗</a></>}
              </span>
            )}
          </div>
        )}

        {artes.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-apple-tertiary">Artes geradas ({artes.length})</p>
              <div className="flex items-center gap-3">
                <button onClick={baixarTodas} className="text-[12px] font-medium text-apple-accent hover:underline">⬇ Baixar todas</button>
                <button onClick={excluirArtes} className="text-[12px] font-medium text-red-600 hover:underline">🗑 Excluir</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {artes.map((url, i) => (
                <div key={i} className="group relative rounded-lg overflow-hidden border border-apple-separator/60">
                  <img src={url} alt={`arte ${i + 1}`} className="w-full aspect-[4/5] object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1.5 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => baixarImagem(url, `arte-${peca.formato}-${String(i + 1).padStart(2, '0')}`)}
                      className="flex-1 text-[11px] text-white bg-black/50 hover:bg-black/70 rounded px-2 py-1 backdrop-blur-sm">⬇ Baixar</button>
                    <a href={url} target="_blank" rel="noopener" title="Abrir em nova aba"
                      className="text-[11px] text-white bg-black/50 hover:bg-black/70 rounded px-2 py-1 backdrop-blur-sm">↗</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leitura de Performance: sobe a planilha do LinkedIn ou um print, a IA lê e guarda */}
        <div className="pt-3 mt-1 border-t border-apple-separator/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[12px] font-semibold text-apple-tertiary">📊 Performance {metricas?.atualizadoEm && <span className="font-normal">· lida em {new Date(metricas.atualizadoEm).toLocaleDateString('pt-BR')}</span>}</p>
            <label className={`text-[12px] font-medium cursor-pointer ${lendoPerf ? 'text-apple-tertiary' : 'text-apple-accent hover:underline'}`}>
              {lendoPerf ? 'Lendo… (~15s)' : metricas ? '↻ Atualizar (planilha ou print)' : '⬆ Subir planilha ou print'}
              <input type="file" accept=".xlsx,image/png,image/jpeg,image/webp" className="hidden" onChange={lerPerformance} disabled={lendoPerf} />
            </label>
          </div>
          {erroPerf && <p className="text-[12px] text-red-600 mt-1">{erroPerf}</p>}
          {!metricas && !erroPerf && (
            <p className="text-[11px] text-apple-tertiary mt-1">Exporte o xlsx de analytics do post (LinkedIn) ou tire um print do painel. A IA lê os números e te entrega a leitura.</p>
          )}
          {metricas && (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {([
                  ['Impressões', metricas.impressoes], ['Alcance', metricas.alcance],
                  ['Reações', metricas.reacoes], ['Comentários', metricas.comentarios],
                  ['Compart.', metricas.compartilhamentos], ['Salvos', metricas.salvamentos],
                  ['Seguidores', metricas.seguidoresGanhos], ['Engaj. %', metricas.taxaEngajamento],
                ] as [string, number | undefined][]).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => (
                  <span key={k} className="text-[11px] px-2 py-1 rounded-lg bg-apple-fill text-apple-secondary">
                    <span className="font-semibold text-apple-label">{typeof v === 'number' ? v.toLocaleString('pt-BR') : v}</span> {k}
                  </span>
                ))}
              </div>
              {metricas.analise && <p className="text-[12px] text-apple-secondary leading-relaxed">{metricas.analise}</p>}
              {metricas.recomendacao && (
                <p className="text-[12px] text-violet-800 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2"><span className="font-semibold">↪ Pro calendário:</span> {metricas.recomendacao}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Slides({ slides, onChange, legenda, onLegenda }: {
  slides: Slide[]; onChange: (s: Slide[]) => void; legenda: string | null; onLegenda: (v: string) => void;
}) {
  const upd = (i: number, patch: Partial<Slide>) => onChange(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () => onChange([...slides, { n: slides.length + 1, texto: '' }]);
  const rm = (i: number) => onChange(slides.filter((_, j) => j !== i).map((s, j) => ({ ...s, n: j + 1 })));
  return (
    <div className="space-y-3">
      <label className="block text-[12px] font-medium text-apple-tertiary">Slides ({slides.length})</label>
      {slides.map((s, i) => (
        <div key={i} className="rounded-lg border border-apple-separator/60 p-3 bg-apple-surface">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-apple-tertiary">Slide {s.n ?? i + 1}{s.tipo ? ` · ${s.tipo}` : ''}</span>
            <button onClick={() => rm(i)} className="text-[11px] text-red-600 hover:underline">remover</button>
          </div>
          {(s.tipo === 'capa' || s.tag !== undefined) && (
            <input className={`${inputCls} mb-2 text-[12px]`} placeholder="Tag (ex.: GESTÃO DE MARKETING)" value={s.tag ?? ''} onChange={(e) => upd(i, { tag: e.target.value })} />
          )}
          <input className={`${inputCls} mb-2 font-medium`} placeholder="Título do slide" value={s.titulo ?? ''} onChange={(e) => upd(i, { titulo: e.target.value })} />
          {s.subtitulo !== undefined && (
            <input className={`${inputCls} mb-2`} placeholder="Subtítulo" value={s.subtitulo ?? ''} onChange={(e) => upd(i, { subtitulo: e.target.value })} />
          )}
          <textarea className={`${inputCls} min-h-[60px]`} placeholder="Texto do slide" value={s.texto ?? ''} onChange={(e) => upd(i, { texto: e.target.value })} />
        </div>
      ))}
      <button onClick={add} className="text-[13px] text-apple-accent hover:underline">+ Adicionar slide</button>
      <div>
        <label className="block text-[12px] font-medium text-apple-tertiary mb-1 mt-2">Legenda do post</label>
        <textarea className={`${inputCls} min-h-[60px]`} value={legenda ?? ''} onChange={(e) => onLegenda(e.target.value)} />
      </div>
    </div>
  );
}

function Cenas({ capa, onCapa, cenas, onChange, legenda, onLegenda }: {
  capa: string; onCapa: (v: string) => void; cenas: Cena[]; onChange: (c: Cena[]) => void; legenda: string | null; onLegenda: (v: string) => void;
}) {
  const upd = (i: number, patch: Partial<Cena>) => onChange(cenas.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () => onChange([...cenas, { n: cenas.length + 1, titulo: `Cena ${cenas.length + 1}`, fala: '', legenda: '' }]);
  const rm = (i: number) => onChange(cenas.filter((_, j) => j !== i).map((s, j) => ({ ...s, n: j + 1 })));
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-apple-tertiary mb-1">Capa do reel (frase-gancho)</label>
        <input className={inputCls} value={capa} onChange={(e) => onCapa(e.target.value)} />
      </div>
      <label className="block text-[12px] font-medium text-apple-tertiary">Cenas ({cenas.length})</label>
      {cenas.map((s, i) => (
        <div key={i} className="rounded-lg border border-apple-separator/60 p-3 bg-apple-surface">
          <div className="flex items-center justify-between mb-2">
            <input className="text-[11px] font-semibold text-apple-tertiary bg-transparent focus:outline-none" value={s.titulo ?? `Cena ${s.n}`} onChange={(e) => upd(i, { titulo: e.target.value })} />
            <button onClick={() => rm(i)} className="text-[11px] text-red-600 hover:underline">remover</button>
          </div>
          <textarea className={`${inputCls} mb-2 min-h-[52px]`} placeholder="Fala" value={s.fala ?? ''} onChange={(e) => upd(i, { fala: e.target.value })} />
          <input className={`${inputCls} text-[12px] uppercase`} placeholder="Legenda destacada" value={s.legenda ?? ''} onChange={(e) => upd(i, { legenda: e.target.value })} />
        </div>
      ))}
      <button onClick={add} className="text-[13px] text-apple-accent hover:underline">+ Adicionar cena</button>
      <div>
        <label className="block text-[12px] font-medium text-apple-tertiary mb-1 mt-2">Legenda do post</label>
        <textarea className={`${inputCls} min-h-[60px]`} value={legenda ?? ''} onChange={(e) => onLegenda(e.target.value)} />
      </div>
    </div>
  );
}
