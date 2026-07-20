import { defineMiddleware } from 'astro:middleware';

// IMPORTANTE: nada de imports estáticos pesados aqui (banco, bcrypt).
// No dev, o Astro gera um wrapper do middleware e dependências CJS/Node no
// grafo estático quebram esse wrapper ("sequence is not a function").
// Por isso a sessão é carregada via import() dinâmico dentro do request.
export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals, redirect } = context;
  const path = url.pathname;

  // ───── Idioma ─────
  // O site é bilíngue sem duplicar páginas: '/en/algo' serve exatamente a mesma
  // rota '/algo', só que com locals.lang = 'en'. As páginas leem esse idioma e
  // escolhem o texto. Português continua na raiz (nenhuma URL antiga muda).
  const isEn = path === '/en' || path.startsWith('/en/');
  locals.lang = isEn ? 'en' : 'pt';

  const isPainel = path === '/painel' || path.startsWith('/painel/');
  const isPainelApi = path.startsWith('/api/painel/');

  if (!isPainel && !isPainelApi) {
    locals.user = null;
    if (isEn) {
      // next(caminho) reescreve SEM re-executar o middleware (não gera loop).
      const destino = path.slice(3) || '/';
      return next(destino + url.search);
    }
    return next();
  }

  const isLoginPage = path === '/painel/login';
  const isAuthApi = path === '/api/painel/auth/login' || path === '/api/painel/auth/logout';

  const { validateSession, SESSION_COOKIE } = await import('./lib/auth/session');
  const token = cookies.get(SESSION_COOKIE)?.value;
  const user = await validateSession(token);
  locals.user = user;

  if (!user && !isLoginPage && !isAuthApi) {
    if (isPainelApi) {
      const { json } = await import('./lib/http');
      return json({ error: 'Não autenticado' }, 401);
    }
    return redirect('/painel/login');
  }
  if (user && isLoginPage) {
    return redirect('/painel');
  }

  return next();
});
