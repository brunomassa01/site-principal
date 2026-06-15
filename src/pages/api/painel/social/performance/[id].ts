import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '../../../../../lib/db';
import { socialPecas } from '../../../../../lib/db/schema';
import { json } from '../../../../../lib/http';
import { analisarPerformance } from '../../../../../lib/social/ia';
import { lerXlsx, xlsxParaTexto } from '../../../../../lib/social/xlsx';
import { logUso } from '../../../../../lib/social/uso';

export const prerender = false;

// Leitura de Performance: recebe o xlsx (export do LinkedIn) OU um print do painel,
// a IA extrai as métricas + faz a leitura + recomendação, e tudo é salvo em peca.metricas.
export const POST: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) return json({ error: 'ID ausente.' }, 400);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'IA não configurada (falta ANTHROPIC_API_KEY).' }, 500);

  const [peca] = await db.select().from(socialPecas).where(eq(socialPecas.id, id));
  if (!peca) return json({ error: 'Peça não encontrada.' }, 404);

  let file: File | null = null;
  try {
    const fd = await request.formData();
    file = fd.get('file') as File | null;
  } catch {
    return json({ error: 'Envie o arquivo (planilha .xlsx ou imagem do print).' }, 400);
  }
  if (!file) return json({ error: 'Nenhum arquivo recebido.' }, 400);

  const nome = (file.name || '').toLowerCase();
  const tipo = file.type || '';
  const buf = new Uint8Array(await file.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return json({ error: 'Arquivo grande demais (máx 8 MB).' }, 400);

  const ehPlanilha = nome.endsWith('.xlsx') || tipo.includes('spreadsheet') || tipo.includes('excel');
  const ehImagem = tipo.startsWith('image/') || /\.(png|jpe?g|webp)$/.test(nome);

  try {
    let resultado;
    if (ehPlanilha) {
      const rows = lerXlsx(buf);
      const texto = xlsxParaTexto(rows);
      if (!texto || texto.length < 20) return json({ error: 'Não consegui ler dados nessa planilha. Confira se é o export de analytics do post.' }, 400);
      resultado = await analisarPerformance({ gancho: peca.gancho, formato: peca.formato, lente: peca.lente, texto });
    } else if (ehImagem) {
      const base64 = Buffer.from(buf).toString('base64');
      const mime = tipo || 'image/png';
      resultado = await analisarPerformance({ gancho: peca.gancho, formato: peca.formato, lente: peca.lente, imagemBase64: base64, mime });
    } else {
      return json({ error: 'Formato não reconhecido. Envie a planilha .xlsx do LinkedIn ou um print (PNG/JPG).' }, 400);
    }

    await logUso('claude-sonnet-4-6', `performance-${ehPlanilha ? 'xlsx' : 'print'}`, resultado.usage);

    const metricas = {
      ...resultado.metricas,
      analise: resultado.analise,
      recomendacao: resultado.recomendacao,
      fonte: ehPlanilha ? 'planilha' : 'print',
      atualizadoEm: new Date().toISOString(),
    };
    const [row] = await db.update(socialPecas).set({ metricas, updatedAt: new Date() }).where(eq(socialPecas.id, id)).returning();
    return json({ ok: true, metricas: row.metricas });
  } catch (e) {
    return json({ error: 'Falha ao ler a performance.', detail: String((e as Error)?.message ?? e) }, 500);
  }
};
