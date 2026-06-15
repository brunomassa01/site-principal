import { neon } from '@neondatabase/serverless';

// Config simples chave→valor (tabela app_config). Usada p/ as "Instruções da IA" editáveis, etc.
const sql = neon(process.env.DATABASE_URL!);

export async function getConfig(chave: string, fallback = ''): Promise<string> {
  try {
    const rows = (await sql`SELECT valor FROM app_config WHERE chave = ${chave}`) as { valor: string | null }[];
    return rows[0]?.valor ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setConfig(chave: string, valor: string): Promise<void> {
  await sql`INSERT INTO app_config (chave, valor, updated_at) VALUES (${chave}, ${valor}, now())
    ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = now()`;
}

export const CHAVE_INSTRUCOES_IA = 'social_instrucoes_ia';
/** Instruções extras do Bruno pra IA de conteúdo social (editável no painel). */
export const getInstrucoesIA = () => getConfig(CHAVE_INSTRUCOES_IA, '');
