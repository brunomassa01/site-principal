import { defineMiddleware } from 'astro:middleware';

// IMPORTANTE: nada de imports estáticos pesados aqui (banco, bcrypt).
// No dev, o Astro gera um wrapper do middleware e dependências CJS/Node no
// grafo estático quebram esse wrapper ("sequence is not a function").
// Por isso a sessão é carregada via import() dinâmico dentro do request.
// Produto padrão servido na raiz do subdomínio lp. (por enquanto, um só).
const LP_PADRAO = 'bastidor';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals, redirect } = context;
  const path = url.pathname;

  // ───── Landing pages (subdomínio lp.) ─────
  // lp.brunomassa.online/<slug> serve a página src/pages/[produto].astro.
  // A raiz do subdomínio manda pro produto atual.
  if (url.host.startsWith('lp.') && path === '/') {
    return redirect(`/${LP_PADRAO}`, 302);
  }

  // ───── Idioma ─────
  // '/en/algo' é uma rota real (src/pages/en/*), mas de 4 linhas: ela só
  // reaproveita a página em português, que lê este `locals.lang` e escolhe o
  // texto. Um código só, dois idiomas.
  //
  // Por que não reescrever aqui em vez de criar as rotas: o adapter da Vercel
  // publica uma LISTA EXPLÍCITA de rotas conhecidas. O que não está na lista
  // vira 404 na borda e nunca chega neste middleware.
  //
  // Português continua na raiz: nenhuma URL antiga muda.
  locals.lang = path === '/en' || path.startsWith('/en/') ? 'en' : 'pt';

  const isPainel = path === '/painel' || path.startsWith('/painel/');
  const isPainelApi = path.startsWith('/api/painel/');

  if (!isPainel && !isPainelApi) {
    locals.user = null;
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
