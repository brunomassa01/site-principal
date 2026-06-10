import type { APIRoute } from 'astro';
import { destroySession, SESSION_COOKIE } from '../../../../lib/auth';
import { json } from '../../../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  await destroySession(cookies.get(SESSION_COOKIE)?.value);
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return json({ ok: true });
};
