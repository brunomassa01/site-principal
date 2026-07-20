import { neon } from '@neondatabase/serverless';
import { campo, type Lang } from '../../i18n';

export type MenuItem = { id: string; label: string; url: string; ordem: number };

// Itens de menu de um local (topo | rodape), publicados, em ordem.
// O rótulo sai traduzido quando existe `label_en`; senão, fica em português.
export async function getMenu(local = 'topo', lang: Lang = 'pt'): Promise<MenuItem[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, label, label_en, url, ordem FROM menu_items
      WHERE local = ${local} AND situacao = 'publicado' ORDER BY ordem, created_at`;
    return (rows as Record<string, any>[]).map((r) => ({
      id: r.id,
      label: campo<string>(r, 'label', lang),
      url: r.url,
      ordem: r.ordem,
    }));
  } catch {
    return [];
  }
}
