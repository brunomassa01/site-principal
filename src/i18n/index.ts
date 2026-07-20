import { ui, type ChaveUI } from './ui';

export type Lang = 'pt' | 'en';

export const IDIOMAS: Lang[] = ['pt', 'en'];
export const IDIOMA_PADRAO: Lang = 'pt';
export const PREFIXO_EN = '/en';

/** Locale completo, para datas e para o atributo <html lang>. */
export const LOCALE: Record<Lang, string> = { pt: 'pt-BR', en: 'en' };

/**
 * Tradutor de textos de INTERFACE.
 *   const t = usarT(lang);  t('blog.titulo')
 * Se faltar a chave em inglês, cai no português em vez de quebrar a página.
 */
export function usarT(lang: Lang) {
  return (chave: ChaveUI): string => (ui[lang] as Record<string, string>)[chave] ?? ui.pt[chave];
}

/**
 * Valor de um campo de CONTEÚDO no idioma pedido, com fallback pro português.
 *
 * Aceita registro em camelCase (Drizzle: `resumoEn`) e em snake_case (SQL cru:
 * `resumo_en`). Tradução vazia conta como ausente — melhor mostrar o português
 * do que um buraco na página.
 */
export function campo<T = any>(registro: Record<string, any> | null | undefined, nome: string, lang: Lang): T {
  if (!registro) return undefined as T;
  if (lang === 'en') {
    const camel = nome + 'En';
    const snake = paraSnake(nome) + '_en';
    const traduzido = registro[camel] ?? registro[snake];
    if (!vazio(traduzido)) return traduzido as T;
  }
  return (registro[nome] ?? registro[paraSnake(nome)]) as T;
}

/** true quando não há tradução utilizável (null, undefined, string em branco, array vazio). */
function vazio(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function paraSnake(s: string): string {
  return s.replace(/[A-Z]/g, (l) => '_' + l.toLowerCase());
}

/**
 * Prefixa um caminho interno com /en quando o idioma é inglês.
 * Deixa em paz link externo, âncora, mailto/tel e o que já está prefixado.
 */
export function localizar(href: string, lang: Lang): string {
  if (!href) return href;
  if (lang !== 'en') return href;
  if (!href.startsWith('/')) return href;                 // externo, âncora, mailto…
  if (href === PREFIXO_EN || href.startsWith(PREFIXO_EN + '/')) return href;
  return href === '/' ? PREFIXO_EN : PREFIXO_EN + href;
}

/** Caminho sem o prefixo de idioma ('/en/posts' -> '/posts'). */
export function semPrefixo(caminho: string): string {
  if (caminho === PREFIXO_EN || caminho.startsWith(PREFIXO_EN + '/')) {
    return caminho.slice(PREFIXO_EN.length) || '/';
  }
  return caminho;
}

/** O mesmo conteúdo no outro idioma — usado no seletor PT/EN do topo. */
export function caminhoNoIdioma(caminhoAtual: string, lang: Lang): string {
  return localizar(semPrefixo(caminhoAtual), lang);
}

/** Pares hreflang (pt-BR, en, x-default) para o <head>. */
export function alternativas(caminhoAtual: string, origem: string) {
  const base = semPrefixo(caminhoAtual);
  const url = (c: string) => new URL(c, origem).href;
  return [
    { hreflang: 'pt-BR', href: url(base) },
    { hreflang: 'en', href: url(localizar(base, 'en')) },
    { hreflang: 'x-default', href: url(base) },
  ];
}

/** Data por extenso no idioma certo ("20 de julho de 2026" / "July 20, 2026"). */
export function formatarData(data: Date | string | null | undefined, lang: Lang): string {
  if (!data) return '';
  const d = data instanceof Date ? data : new Date(data);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(d);
}

/** Só mês e ano ("jul 2026" / "Jul 2026") — usado na trajetória. */
export function formatarMesAno(data: Date | string | null | undefined, lang: Lang): string {
  if (!data) return '';
  const d = data instanceof Date ? data : new Date(data);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE[lang], { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export { ui };
export type { ChaveUI };
