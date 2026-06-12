import { neon } from '@neondatabase/serverless';

export type MenuItem = { id: string; label: string; url: string; ordem: number };

// Itens de menu de um local (topo | rodape), publicados, em ordem.
export async function getMenu(local = 'topo'): Promise<MenuItem[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, label, url, ordem FROM menu_items
      WHERE local = ${local} AND situacao = 'publicado' ORDER BY ordem, created_at`;
    return rows as MenuItem[];
  } catch {
    return [];
  }
}
