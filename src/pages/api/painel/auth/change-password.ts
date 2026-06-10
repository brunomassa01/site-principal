import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/db';
import { users } from '../../../../lib/db/schema';
import { hashPassword } from '../../../../lib/auth';
import { json } from '../../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Não autenticado' }, 401);

  const b = await request.json().catch(() => ({} as Record<string, unknown>));
  const atual = String(b.atual ?? '');
  const nova = String(b.nova ?? '');

  if (nova.length < 8) return json({ error: 'A nova senha precisa ter ao menos 8 caracteres.' }, 400);

  const ok = await bcrypt.compare(atual, user.passwordHash);
  if (!ok) return json({ error: 'Senha atual incorreta.' }, 400);

  await db.update(users).set({ passwordHash: await hashPassword(nova), updatedAt: new Date() }).where(eq(users.id, user.id));
  return json({ ok: true });
};
