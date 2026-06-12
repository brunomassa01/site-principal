import { put } from '@vercel/blob';

// Gera uma imagem de fundo NOVA com o Gemini 2.5 Flash Image (nano banana), no estilo escolhido.
// Recebe o prompt do estilo (descrição da estética) + o tema do post; devolve a URL no Blob.
const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

type Resultado = { url: string } | { error: string };

// Estética da marca (P&B editorial) — o estilo manda; a cena vem do rótulo do fundo escolhido.
const BASE_ESTILO =
  'Black and white editorial photograph, cinematic and moody, soft directional light, deep shadows, subtle 35mm film grain, minimalist composition, premium magazine aesthetic, monochrome, no people.';
const CENAS: Record<string, string> = {
  escritorio: 'a dim modern office at night, desk lamp glow, city lights bokeh through a window',
  reuniao: 'an empty minimalist meeting room, a long table, soft daylight through large windows',
  teclado: 'a close-up of hands typing on a laptop keyboard on a dark desk',
  persiana: 'abstract venetian blind shadow stripes cast across a plain wall',
};
const semAcento = (s: string) =>
  Array.from(s.normalize('NFD')).filter((c) => { const n = c.charCodeAt(0); return n < 0x300 || n > 0x36f; }).join('').toLowerCase();

// Monta o prompt do estilo a partir do rótulo do fundo (ex.: "Escritório à noite" → cena de escritório).
export function promptDoEstilo(rotulo: string): string {
  const k = semAcento(rotulo || '');
  const cena = Object.entries(CENAS).find(([key]) => k.includes(key))?.[1] ?? (rotulo || 'an abstract minimalist backdrop');
  return `${BASE_ESTILO} Scene: ${cena}.`;
}

// Baixa a imagem de referência e devolve base64 + mime (pra mandar pro Gemini como referência VISUAL).
async function carregarRef(url: string): Promise<{ data: string; mime: string } | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const mime = r.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await r.arrayBuffer());
    return { data: buf.toString('base64'), mime };
  } catch {
    return null;
  }
}

// refUrl = a foto de referência (o estilo escolhido). A IA OLHA essa foto e gera uma imagem NOVA no mesmo estilo.
// Se a referência não carregar, cai no prompt de texto (promptDoEstilo(rotulo)).
export async function gerarImagemEstilo(refUrl: string, tema: string, rotulo = ''): Promise<Resultado> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: 'Gerador de imagem não configurado (falta GEMINI_API_KEY no Vercel).' };

  const ref = refUrl ? await carregarRef(refUrl) : null;

  // varia a composição a cada chamada pra "Gerar outra" sair diferente (sem deixar escuro/vazio)
  const VARIACOES = ['wide full-frame view', 'eye-level establishing shot', 'soft even light across the whole frame', 'window light filling the room', 'clear foreground and background depth', 'practical lights spread across the scene', 'centered symmetrical composition', 'three-quarter angle that fills the frame'];
  const variacao = VARIACOES[Math.floor(Math.random() * VARIACOES.length)];

  const ENCHER = 'Vertical 4:5 portrait. The image must FILL THE ENTIRE FRAME edge to edge with clearly visible detail and texture, no empty bands. Reserve one calmer, less busy area (it can be a little darker or simpler) where white text can be overlaid.';

  const promptBase = ref
    ? [
        'You are given a STYLE REFERENCE photo. Create a BRAND-NEW, DIFFERENT photograph that looks like it was shot in the SAME place and SAME style as the reference: the SAME color palette and color treatment (warm, brown, colorful or black-and-white — exactly like the reference, do NOT desaturate it), the SAME lighting and brightness, the same mood, depth and overall aesthetic.',
        'Do NOT copy or reproduce the reference. Do NOT illustrate any concept, topic or text — it is a real photographic background, never a chart, diagram or graphic.',
        ENCHER,
        'No text, no letters, no words, no logos, no charts, no diagrams, no watermark.',
      ].filter(Boolean).join(' ')
    : [
        promptDoEstilo(rotulo),
        ENCHER,
        'No text, no letters, no words, no logos, no charts, no diagrams, no watermark.',
      ].filter(Boolean).join(' ');

  const prompt = `${promptBase} Composition variation: ${variacao}.`;

  const parts: any[] = [];
  if (ref) parts.push({ inlineData: { mimeType: ref.mime, data: ref.data } });
  parts.push({ text: prompt });

  let resp: Response;
  try {
    resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });
  } catch (e) {
    return { error: 'Falha de rede ao chamar o Gemini: ' + String((e as Error)?.message ?? e) };
  }

  if (!resp.ok) {
    const corpo = await resp.text().catch(() => '');
    return { error: `Gemini ${resp.status}: ${corpo.slice(0, 300)}` };
  }

  let data: any;
  try { data = await resp.json(); } catch { return { error: 'Resposta inválida do Gemini.' }; }

  const outParts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = outParts
    .map((p: any) => p?.inlineData ?? p?.inline_data)
    .find((d: any) => d?.data);
  if (!img?.data) {
    const motivo = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || 'sem imagem na resposta';
    return { error: `Gemini não devolveu imagem (${motivo}).` };
  }

  try {
    const buf = Buffer.from(img.data, 'base64');
    const blob = await put('social/bg-gemini.png', buf, {
      access: 'public',
      addRandomSuffix: true,
      contentType: img.mimeType ?? img.mime_type ?? 'image/png',
    });
    return { url: blob.url };
  } catch (e) {
    return { error: 'Imagem gerada, mas falhou ao salvar no Blob: ' + String((e as Error)?.message ?? e) };
  }
}
