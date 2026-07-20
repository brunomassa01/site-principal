import type { APIRoute } from 'astro';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { sanitizeBody } from '../content/sanitize';
import { slugify } from '../content/markdown';
import { json } from '../http';
import type { Collection, FieldType } from './config';

function coerce(type: FieldType, raw: unknown): unknown {
  switch (type) {
    case 'number': return raw === '' || raw == null ? null : Number(raw);
    case 'boolean': return Boolean(raw);
    case 'date':
    case 'datetime': return raw ? new Date(String(raw)) : null;
    case 'tags': return Array.isArray(raw) ? raw : String(raw ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    case 'list': return Array.isArray(raw) ? raw : String(raw ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
    default: return raw === '' ? null : (raw ?? null);
  }
}

function buildValues(cfg: Collection, b: Record<string, unknown>): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of cfg.fields) {
    v[f.name] = coerce(f.type, b[f.name]);
    // Tradução: campo marcado como traduzível grava também a coluna `<campo>En`.
    // Vazio continua vazio de propósito — é assim que o site cai no português.
    if (f.traduzivel) v[`${f.name}En`] = coerce(f.type, b[`${f.name}En`]);
  }
  if (cfg.body) {
    v.bodyHtml = sanitizeBody(String(b.body_html ?? ''));
    v.bodyJson = b.body_json ?? null;
    if (cfg.traduzivel) {
      v.bodyHtmlEn = sanitizeBody(String(b.body_html_en ?? ''));
      v.bodyJsonEn = b.body_json_en ?? null;
    }
  }
  if (cfg.situacao) v.situacao = (b.situacao as string) || 'rascunho';
  if (cfg.slug) v.slug = String(b.slug ?? '').trim() || slugify(String(b[cfg.titleField] ?? cfg.singular));
  return v;
}

function strip(row: Record<string, unknown>) {
  const { bodyHtml, bodyJson, bodyHtmlEn, bodyJsonEn, ...rest } = row;
  return rest;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function collectionRoutes(table: any, cfg: Collection) {
  const GET: APIRoute = async () => {
    const rows = await db.select().from(table).orderBy(desc(table.createdAt));
    return json((rows as Record<string, unknown>[]).map(strip));
  };
  const POST: APIRoute = async ({ request }) => {
    const b = await request.json().catch(() => ({} as Record<string, unknown>));
    if (!String(b[cfg.titleField] ?? '').trim()) return json({ error: 'Preencha o campo principal.' }, 400);
    try {
      const [row] = await db.insert(table).values(buildValues(cfg, b)).returning();
      return json(row, 201);
    } catch (e) {
      return json({ error: 'Erro ao salvar (talvez o endereço já exista).', detail: String((e as Error)?.message ?? e) }, 400);
    }
  };
  return { GET, POST };
}

export function itemRoutes(table: any, cfg: Collection) {
  const GET: APIRoute = async ({ params }) => {
    const [r] = await db.select().from(table).where(eq(table.id, params.id!));
    return r ? json(r) : json({ error: 'Não encontrado' }, 404);
  };
  const PUT: APIRoute = async ({ params, request }) => {
    const b = await request.json().catch(() => ({} as Record<string, unknown>));
    if (!String(b[cfg.titleField] ?? '').trim()) return json({ error: 'Preencha o campo principal.' }, 400);
    const [r] = await db.update(table).set({ ...buildValues(cfg, b), updatedAt: new Date() }).where(eq(table.id, params.id!)).returning();
    return r ? json(r) : json({ error: 'Não encontrado' }, 404);
  };
  const PATCH: APIRoute = async ({ params, request }) => {
    const b = await request.json().catch(() => ({} as Record<string, unknown>));
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof b.situacao === 'string') patch.situacao = b.situacao;
    const [r] = await db.update(table).set(patch).where(eq(table.id, params.id!)).returning();
    return r ? json(r) : json({ error: 'Não encontrado' }, 404);
  };
  const DELETE: APIRoute = async ({ params }) => {
    await db.delete(table).where(eq(table.id, params.id!));
    return json({ ok: true });
  };
  return { GET, PUT, PATCH, DELETE };
}

export function singletonRoutes(table: any, cfg: Collection, id: string) {
  const GET: APIRoute = async () => {
    const [r] = await db.select().from(table).where(eq(table.id, id));
    return json(r ?? {});
  };
  const PUT: APIRoute = async ({ request }) => {
    const b = await request.json().catch(() => ({} as Record<string, unknown>));
    const values = { ...buildValues(cfg, b), updatedAt: new Date() };
    const [existing] = await db.select().from(table).where(eq(table.id, id));
    if (existing) {
      const [r] = await db.update(table).set(values).where(eq(table.id, id)).returning();
      return json(r);
    }
    const [r] = await db.insert(table).values({ ...values, id }).returning();
    return json(r);
  };
  return { GET, PUT };
}
