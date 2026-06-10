import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Cliente do banco (Neon HTTP + Drizzle).
 * Inicialização preguiçosa: só conecta no primeiro uso, evitando erro durante o
 * build do Astro (páginas estáticas não tocam o banco).
 *
 * Lê DATABASE_URL de process.env (Vercel / scripts) ou import.meta.env (Astro dev).
 */

let _db: NeonHttpDatabase<typeof schema> | null = null;

function init(): NeonHttpDatabase<typeof schema> {
  if (_db) return _db;
  const url =
    process.env.DATABASE_URL ??
    (typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env?.DATABASE_URL : undefined);
  if (!url) {
    throw new Error('DATABASE_URL não definida (configure no .env local ou nas variáveis do Vercel).');
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const real = init() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

export { schema };
