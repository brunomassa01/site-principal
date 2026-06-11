import { neon } from '@neondatabase/serverless';

// Medidor de gasto de IA. Não dá pra ler o SALDO real da Anthropic via API (não existe
// endpoint público de balance), então registramos o uso (tokens) por geração e estimamos
// o custo. O saldo real fica no Console da Anthropic → Billing.

const cliente = () => neon(process.env.DATABASE_URL!);

// USD por token (estimativa — preços de tabela do Claude Sonnet).
const PRECO: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3 / 1_000_000, output: 15 / 1_000_000 },
};
const PADRAO = { input: 3 / 1_000_000, output: 15 / 1_000_000 };

export async function logUso(modelo: string, operacao: string, usage?: { input_tokens?: number; output_tokens?: number }) {
  if (!usage) return;
  try {
    await cliente()`INSERT INTO ia_uso (modelo, operacao, input_tokens, output_tokens)
      VALUES (${modelo}, ${operacao}, ${usage.input_tokens ?? 0}, ${usage.output_tokens ?? 0})`;
  } catch {
    /* best-effort: medição não pode quebrar a geração */
  }
}

function custo(modelo: string, inT: number, outT: number) {
  const p = PRECO[modelo] ?? PADRAO;
  return inT * p.input + outT * p.output;
}

export async function getUsoResumo() {
  try {
    const rows = await cliente()`SELECT modelo, input_tokens, output_tokens, criado_em FROM ia_uso`;
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    let totalUsd = 0, mesUsd = 0;
    for (const r of rows as { modelo: string; input_tokens: number; output_tokens: number; criado_em: string }[]) {
      const c = custo(r.modelo ?? '', r.input_tokens, r.output_tokens);
      totalUsd += c;
      if (new Date(r.criado_em) >= inicioMes) mesUsd += c;
    }
    return { totalUsd, mesUsd, geracoes: rows.length };
  } catch {
    return { totalUsd: 0, mesUsd: 0, geracoes: 0 };
  }
}
