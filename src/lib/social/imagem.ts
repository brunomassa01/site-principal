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

export async function gerarImagemEstilo(promptEstilo: string, tema: string): Promise<Resultado> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: 'Gerador de imagem não configurado (falta GEMINI_API_KEY no Vercel).' };

  // Prompt em inglês (modelos de imagem respondem melhor) — estilo manda, tema entra de forma sutil.
  const prompt = [
    promptEstilo,
    'Vertical 4:5 full-bleed social media cover background.',
    'Leave generous negative space and dark areas so white text can be overlaid on top.',
    'No text, no letters, no words, no logos, no watermark.',
    tema ? `Subtly evoke this theme without being literal: "${tema}".` : '',
  ].filter(Boolean).join(' ');

  let resp: Response;
  try {
    resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
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

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts
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
