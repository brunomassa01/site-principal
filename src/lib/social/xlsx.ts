// Leitor mínimo de .xlsx (sem dependência pesada): xlsx é um zip de XMLs.
// Cobre o export de analytics do LinkedIn (1 planilha, sharedStrings + sheet1).
import { unzipSync, strFromU8 } from 'fflate';

const decodeXml = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const colIndex = (ref: string) => {
  let n = 0;
  for (const ch of ref.replace(/[0-9]/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

/** Lê o primeiro sheet de um .xlsx e devolve as linhas como matriz de strings. */
export function lerXlsx(buf: Uint8Array): string[][] {
  const files = unzipSync(buf);
  const ssXml = files['xl/sharedStrings.xml'] ? strFromU8(files['xl/sharedStrings.xml']) : '';
  const strings: string[] = [];
  for (const m of ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    const ts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]);
    strings.push(decodeXml(ts.join('')));
  }
  // acha o primeiro worksheet
  const sheetKey = Object.keys(files).find((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k));
  if (!sheetKey) return [];
  const sheet = strFromU8(files[sheetKey]);
  const rows: string[][] = [];
  for (const r of sheet.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    for (const c of r[1].matchAll(/<c r="([A-Z]+)\d+"(?:[^>]*t="([^"]*)")?[^>]*>(?:<v>([\s\S]*?)<\/v>|<is>([\s\S]*?)<\/is>)?/g)) {
      const col = colIndex(c[1]);
      const t = c[2];
      let v = c[3] ?? '';
      if (c[4] !== undefined) v = decodeXml((c[4].match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1]) ?? '');
      else if (t === 's') v = strings[parseInt(v, 10)] ?? '';
      else v = decodeXml(v);
      cells[col] = v;
    }
    rows.push(cells);
  }
  return rows;
}

/** Vira as linhas num texto corrido legível (pra mandar pro Claude analisar). */
export function xlsxParaTexto(rows: string[][], limite = 4000): string {
  const linhas = rows
    .map((r) => r.map((c) => (c ?? '').toString().trim()).filter(Boolean).join(' | '))
    .filter(Boolean);
  return linhas.join('\n').slice(0, limite);
}
