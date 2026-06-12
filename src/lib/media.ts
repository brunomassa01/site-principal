import { neon } from '@neondatabase/serverless';

// Cataloga uma mídia na biblioteca para reúso. Best-effort: nunca bloqueia o upload/geração.
export async function catalogarMidia(m: {
  url: string;
  tipo?: string;
  nome?: string;
  largura?: number;
  altura?: number;
  tamanho?: number;
  origem?: string; // upload | ia | ia-capa
}): Promise<void> {
  if (!m.url) return;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`INSERT INTO media (url, tipo, nome, largura, altura, tamanho, origem)
      VALUES (${m.url}, ${m.tipo ?? 'imagem'}, ${m.nome ?? null}, ${m.largura ?? null}, ${m.altura ?? null}, ${m.tamanho ?? null}, ${m.origem ?? 'upload'})`;
  } catch {
    /* catálogo é best-effort */
  }
}
