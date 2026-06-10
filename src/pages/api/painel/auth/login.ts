import type { APIRoute } from 'astro';
import { verifyLogin, createSession, SESSION_COOKIE } from '../../../../lib/auth';
import { json } from '../../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  let email = '';
  let password = '';
  try {
    const b = await request.json();
    email = String(b.email ?? '');
    password = String(b.password ?? '');
  } catch {
    return json({ error: 'Requisição inválida.' }, 400);
  }
  if (!email || !password) return json({ error: 'Informe e-mail e senha.' }, 400);

  const user = await verifyLogin(email, password);
  if (!user) return json({ error: 'E-mail ou senha incorretos.' }, 401);

  const { token, expiresAt } = await createSession(user.id);
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
  return json({ ok: true, user: { nome: user.nome, email: user.email } });
};
