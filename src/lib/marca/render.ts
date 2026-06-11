// Render das artes de social na marca do Bruno (satori -> SVG -> resvg -> PNG).
// Sem navegador. Tokens e fontes do brand kit (monocromatico + 1 acento lime).
// Fontes servidas em /fonts/*.woff (CDN) — a função busca por URL e cacheia.

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const W = 1080;
export const H = 1350; // 4:5 Instagram
export const INK = '#0A0A0B';
export const LIME = '#C2F03C';
export const WHITE = '#FFFFFF';
export const INK300 = '#BFBFC6';
export const INK400 = '#9A9AA2';
export const MENUBG = '#2B2B2E';

type El = { type: string; props: Record<string, unknown> };
const div = (style: Record<string, unknown>, children: unknown): El => ({ type: 'div', props: { style, children } });
const img = (src: string, style: Record<string, unknown>): El => ({ type: 'img', props: { src, style } });

type Slide = { n?: number; tipo?: string; tag?: string; titulo?: string; subtitulo?: string; texto?: string; assinatura?: string };
type Conteudo = { slides?: Slide[]; capa?: string; bg?: string; cenas?: { titulo?: string; legenda?: string }[] };

const HANDLE = '@brunormassa';
const SITE = 'brunomassa.online';

// ---- elementos por tipo de slide ----
function topo(esq: string, dir: string, cor = WHITE): El {
  return div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }, [
    div({ display: 'flex', fontFamily: 'Mono', fontSize: 23, letterSpacing: 4, color: cor, textTransform: 'uppercase' }, [esq || '']),
    div({ display: 'flex', fontFamily: 'Mono', fontSize: 21, letterSpacing: 2, color: INK300 }, [dir]),
  ]);
}
function rodape(cor = WHITE): El {
  return div({ display: 'flex', alignItems: 'center' }, [
    div({ display: 'flex', fontFamily: 'Mono', fontSize: 24, letterSpacing: 2, color: cor }, [HANDLE]),
  ]);
}

// capa: foto (se houver) + motivo "texto selecionado" do iOS
function capaEl(s: Slide, bg?: string): El {
  const menu = ['Recortar', 'Copiar', 'Pesquisar', 'Compartilhar'];
  const filhos: unknown[] = [];
  if (bg) {
    filhos.push(img(bg, { position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover' }));
    filhos.push(div({ position: 'absolute', top: 0, left: 0, width: W, height: H, display: 'flex', backgroundImage: 'linear-gradient(to bottom, rgba(10,10,11,0.30) 0%, rgba(10,10,11,0.0) 32%, rgba(10,10,11,0.55) 74%, rgba(10,10,11,0.90) 100%)' }, []));
  }
  filhos.push(
    div({ position: 'relative', width: W, height: H, display: 'flex', flexDirection: 'column', padding: 72, justifyContent: 'space-between' }, [
      topo(s.tag || '', SITE),
      div({ display: 'flex', flexDirection: 'column' }, [
        // menu de contexto iOS
        div({ display: 'flex', alignSelf: 'flex-start', backgroundColor: MENUBG, borderRadius: 14, padding: '8px 4px', marginBottom: 22, boxShadow: '0 12px 34px rgba(0,0,0,0.40)' },
          menu.map((t, i) => div({ display: 'flex', color: WHITE, fontSize: 25, fontWeight: 500, padding: '6px 24px', borderRight: i < menu.length - 1 ? '1px solid rgba(255,255,255,0.16)' : '0px solid transparent' }, [t]))),
        // headline selecionado: barra lime + alças
        div({ display: 'flex', position: 'relative', alignSelf: 'flex-start' }, [
          div({ position: 'absolute', left: -9, top: -16, width: 20, height: 20, borderRadius: 10, backgroundColor: LIME, display: 'flex' }, []),
          div({ position: 'absolute', right: -9, bottom: -16, width: 20, height: 20, borderRadius: 10, backgroundColor: LIME, display: 'flex' }, []),
          div({ display: 'flex', backgroundColor: LIME, color: INK, fontWeight: 900, fontSize: 76, lineHeight: 1.0, letterSpacing: -2, padding: '8px 20px', maxWidth: 900 }, [s.titulo || '']),
        ]),
        s.subtitulo ? div({ display: 'flex', marginTop: 30, maxWidth: 800, fontWeight: 300, fontSize: 33, lineHeight: 1.35, color: WHITE }, [s.subtitulo]) : div({ display: 'flex' }, []),
      ]),
      rodape(),
    ]),
  );
  return div({ width: W, height: H, display: 'flex', position: 'relative', fontFamily: 'Hanken', backgroundColor: INK }, filhos);
}

// slide de afirmação: fundo tinta, declaração grande em branco + barra lime + texto de apoio
function statementEl(s: Slide, n: number, total: number): El {
  return div({ width: W, height: H, display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'Hanken', backgroundColor: INK, color: WHITE, padding: 72, justifyContent: 'space-between' }, [
    topo(s.tag || `FRASE ${String(n).padStart(2, '0')}`, `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`),
    div({ display: 'flex', flexDirection: 'column', maxWidth: 880 }, [
      div({ display: 'flex', width: 70, height: 10, backgroundColor: LIME, marginBottom: 34 }, []),
      div({ display: 'flex', fontWeight: 900, fontSize: 70, lineHeight: 1.04, letterSpacing: -2, color: WHITE }, [s.titulo || s.texto || '']),
      s.titulo && s.texto ? div({ display: 'flex', marginTop: 30, fontWeight: 300, fontSize: 34, lineHeight: 1.4, color: INK300 }, [s.texto]) : div({ display: 'flex' }, []),
    ]),
    rodape(),
  ]);
}

// CTA: fundo tinta, chamada + palavra Manychat numa pílula lime
function ctaEl(s: Slide, manychat?: string): El {
  const palavra = manychat || '';
  const texto = (s.texto || '').replace(palavra, '').trim();
  return div({ width: W, height: H, display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'Hanken', backgroundColor: INK, color: WHITE, padding: 72, justifyContent: 'space-between' }, [
    topo('', SITE),
    div({ display: 'flex', flexDirection: 'column', maxWidth: 880 }, [
      div({ display: 'flex', fontWeight: 900, fontSize: 60, lineHeight: 1.08, letterSpacing: -1.5, color: WHITE }, [texto || s.texto || '']),
      palavra ? div({ display: 'flex', alignSelf: 'flex-start', marginTop: 34, backgroundColor: LIME, color: INK, fontWeight: 800, fontSize: 44, letterSpacing: 1, padding: '12px 28px', borderRadius: 14 }, [palavra]) : div({ display: 'flex' }, []),
    ]),
    rodape(),
  ]);
}

export function carrosselElements(conteudo: Conteudo, manychat?: string): El[] {
  const slides = conteudo.slides ?? [];
  const total = slides.length;
  return slides.map((s, i) => {
    const tipo = s.tipo || (i === 0 ? 'capa' : i === total - 1 ? 'cta' : 'statement');
    if (tipo === 'capa') return capaEl(s, conteudo.bg);
    if (tipo === 'cta') return ctaEl(s, manychat);
    return statementEl(s, i, total);
  });
}

export function reelCoverElement(conteudo: Conteudo): El {
  // a capa do reel = headline selecionado sobre tinta/foto
  return capaEl({ tag: 'REEL', titulo: conteudo.capa || '', subtitulo: '' }, conteudo.bg);
}

// ---- fontes (cacheadas) ----
let _fontes: { name: string; data: ArrayBuffer; weight: number; style: 'normal' }[] | null = null;
export async function loadFontes(base: string) {
  if (_fontes) return _fontes;
  const f = async (file: string, name: string, weight: number) => {
    const r = await fetch(`${base}/fonts/${file}`);
    if (!r.ok) throw new Error(`fonte ${file}: ${r.status}`);
    return { name, data: await r.arrayBuffer(), weight, style: 'normal' as const };
  };
  _fontes = await Promise.all([
    f('hanken-900.woff', 'Hanken', 900),
    f('hanken-700.woff', 'Hanken', 700),
    f('hanken-400.woff', 'Hanken', 400),
    f('hanken-300.woff', 'Hanken', 300),
    f('mono-400.woff', 'Mono', 400),
    f('mono-700.woff', 'Mono', 700),
  ]);
  return _fontes;
}

export async function renderPng(element: El, fontes: { name: string; data: ArrayBuffer; weight: number; style: 'normal' }[], w = W, h = H): Promise<Buffer> {
  const svg = await satori(element as never, { width: w, height: h, fonts: fontes as never });
  return new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
}

// capa de post de blog (16:9, 1280x720): fundo tinta + barra lime + título grande
export function capaPostElement(titulo: string, kicker = 'BLOG'): El {
  const CW = 1280, CH = 720;
  return div({ width: CW, height: CH, display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'Hanken', backgroundColor: INK, color: WHITE, padding: 72, justifyContent: 'space-between' }, [
    topo(kicker, SITE),
    div({ display: 'flex', flexDirection: 'column', maxWidth: 1040 }, [
      div({ display: 'flex', width: 80, height: 12, backgroundColor: LIME, marginBottom: 30 }, []),
      div({ display: 'flex', fontWeight: 900, fontSize: titulo.length > 70 ? 56 : 68, lineHeight: 1.03, letterSpacing: -2, color: WHITE }, [titulo]),
    ]),
    rodape(),
  ]);
}
