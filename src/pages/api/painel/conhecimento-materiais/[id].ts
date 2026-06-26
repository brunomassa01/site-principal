import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { del } from '@vercel/blob';
import { db } from '../../../../lib/db';
import { conhecimentoMateriais } from '../../../../lib/db/schema';
import { json } from '../../../../lib/http';

export const prerender = false;

export const DELETE: APIRoute = async ({ params }) => {
  const [row] = await db.select().from(conhecimentoMateriais).where(eq(conhecimentoMateriais.id, params.id!));
  if (row?.url) { try { await del(row.url); } catch { /* arquivo pode já não existir no Blob */ } }
  await db.delete(conhecimentoMateriais).where(eq(conhecimentoMateriais.id, params.id!));
  return json({ ok: true });
};
