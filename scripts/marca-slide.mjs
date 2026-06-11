import { readFileSync, writeFileSync } from 'node:fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Render de UM slide de carrossel (1080x1350) com a marca do Bruno:
// fundo fotografico P&B (IA) + motivo "texto selecionado" do iOS (menu + barra lime + alcas)
// + tag mono + assinatura. Tokens e fontes do brand kit (marca/).

const FF = 'node_modules/@fontsource';
const font = (p, family, weight) => ({ name: family, data: readFileSync(`${FF}/${p}`), weight, style: 'normal' });
const fonts = [
  font('hanken-grotesk/files/hanken-grotesk-latin-900-normal.woff', 'Hanken', 900),
  font('hanken-grotesk/files/hanken-grotesk-latin-700-normal.woff', 'Hanken', 700),
  font('hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff', 'Hanken', 400),
  font('hanken-grotesk/files/hanken-grotesk-latin-300-normal.woff', 'Hanken', 300),
  font('space-mono/files/space-mono-latin-400-normal.woff', 'Mono', 400),
  font('space-mono/files/space-mono-latin-700-normal.woff', 'Mono', 700),
];

const INK = '#0A0A0B', LIME = '#C2F03C', WHITE = '#FFFFFF', INK300 = '#BFBFC6', MENUBG = '#2B2B2E';
const bg = 'data:image/png;base64,' + readFileSync('.tmp-marca/bg-capa.png').toString('base64');

const TAG = 'GESTÃO DE MARKETING';
const HEADLINE = 'Faz uma arte rapidinho?';
const SUB = '5 frases que entregam como a sua empresa enxerga o marketing.';
const HANDLE = '@brunormassa';
const MENU = ['Recortar', 'Copiar', 'Pesquisar', 'Compartilhar'];

const div = (style, children) => ({ type: 'div', props: { style, children } });

const tree = div(
  { width: 1080, height: 1350, display: 'flex', position: 'relative', fontFamily: 'Hanken' },
  [
    { type: 'img', props: { src: bg, style: { position: 'absolute', top: 0, left: 0, width: 1080, height: 1350, objectFit: 'cover' } } },
    // scrim para legibilidade
    div({ position: 'absolute', top: 0, left: 0, width: 1080, height: 1350, display: 'flex',
      backgroundImage: 'linear-gradient(to bottom, rgba(10,10,11,0.30) 0%, rgba(10,10,11,0.0) 32%, rgba(10,10,11,0.55) 74%, rgba(10,10,11,0.88) 100%)' }, []),
    // conteudo
    div(
      { position: 'relative', width: 1080, height: 1350, display: 'flex', flexDirection: 'column', padding: 72, justifyContent: 'space-between' },
      [
        // topo: tag mono + site
        div({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, [
          div({ display: 'flex', fontFamily: 'Mono', fontSize: 23, letterSpacing: 4, color: WHITE }, [TAG]),
          div({ display: 'flex', fontFamily: 'Mono', fontSize: 21, letterSpacing: 2, color: INK300 }, ['brunomassa.online']),
        ]),
        // bloco do headline (motivo selecao)
        div({ display: 'flex', flexDirection: 'column' }, [
          // menu de contexto iOS
          div({ display: 'flex', alignSelf: 'flex-start', backgroundColor: MENUBG, borderRadius: 14, padding: '8px 4px', marginBottom: 22, boxShadow: '0 12px 34px rgba(0,0,0,0.40)' },
            MENU.map((t, i) => div({ display: 'flex', color: WHITE, fontSize: 25, fontWeight: 500, padding: '6px 24px',
              borderRight: i < MENU.length - 1 ? '1px solid rgba(255,255,255,0.16)' : '0px solid transparent' }, [t]))),
          // headline "selecionado": barra lime + alcas
          div({ display: 'flex', position: 'relative', alignSelf: 'flex-start' }, [
            div({ position: 'absolute', left: -9, top: -16, width: 20, height: 20, borderRadius: 10, backgroundColor: LIME, display: 'flex' }, []),
            div({ position: 'absolute', right: -9, bottom: -16, width: 20, height: 20, borderRadius: 10, backgroundColor: LIME, display: 'flex' }, []),
            div({ display: 'flex', backgroundColor: LIME, color: INK, fontWeight: 900, fontSize: 78, lineHeight: 1.0, letterSpacing: -2, padding: '8px 20px' }, [HEADLINE]),
          ]),
          // subtitulo
          div({ display: 'flex', marginTop: 30, maxWidth: 780, fontWeight: 300, fontSize: 33, lineHeight: 1.35, color: WHITE }, [SUB]),
        ]),
        // rodape: assinatura
        div({ display: 'flex', alignItems: 'center' }, [
          div({ display: 'flex', fontFamily: 'Mono', fontSize: 24, letterSpacing: 2, color: WHITE }, [HANDLE]),
        ]),
      ]
    ),
  ]
);

const svg = await satori(tree, { width: 1080, height: 1350, fonts });
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } }).render().asPng();
writeFileSync('.tmp-marca/slide-capa.png', png);
console.log('slide gerado: .tmp-marca/slide-capa.png');
process.exit(0);
