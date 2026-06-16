// Publicação no LinkedIn (perfil pessoal) via API oficial. Token em LINKEDIN_ACCESS_TOKEN (Vercel).
// App self-serve, sem refresh token: o access token vale ~2 meses; ao expirar (401), avisamos pra regenerar.

export function temLinkedIn(): boolean {
  return !!process.env.LINKEDIN_ACCESS_TOKEN;
}

const TOKEN_EXPIRADO = 'TOKEN_EXPIRADO';

/** URN do membro (urn:li:person:{sub}) via /v2/userinfo. Read-only (escopo openid/profile). */
async function getPersonURN(token: string): Promise<{ urn?: string; erro?: string }> {
  const r = await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${token}` } });
  if (r.status === 401) return { erro: TOKEN_EXPIRADO };
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.sub) return { erro: `Não consegui identificar seu perfil no LinkedIn (HTTP ${r.status}). ${JSON.stringify(j).slice(0, 200)}` };
  return { urn: `urn:li:person:${j.sub}` };
}

const LINKEDIN_VERSION = '202505'; // ajustável se o LinkedIn reclamar de versão

/** Publica um texto no perfil pessoal. Tenta /rest/posts; se falhar, cai pro /v2/ugcPosts (legado, sem versão). */
export async function publicarTextoLinkedIn(text: string): Promise<{ ok: boolean; url?: string; erro?: string; tokenExpirado?: boolean }> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return { ok: false, erro: 'LINKEDIN_ACCESS_TOKEN ausente no Vercel.' };
  if (!text || text.trim().length < 3) return { ok: false, erro: 'Texto vazio.' };

  const u = await getPersonURN(token);
  if (u.erro === TOKEN_EXPIRADO) return { ok: false, tokenExpirado: true, erro: 'O token do LinkedIn expirou. Gere um novo no Token Generator e atualize LINKEDIN_ACCESS_TOKEN no Vercel.' };
  if (!u.urn) return { ok: false, erro: u.erro };
  const author = u.urn;

  const urlDoUrn = (urn: string) => `https://www.linkedin.com/feed/update/${urn}`;
  let erroRest = '';

  // tentativa 1: /rest/posts (atual)
  try {
    const r = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0', 'LinkedIn-Version': LINKEDIN_VERSION },
      body: JSON.stringify({
        author, commentary: text, visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: false,
      }),
    });
    if (r.status === 401) return { ok: false, tokenExpirado: true, erro: 'Token do LinkedIn expirou. Gere um novo e atualize no Vercel.' };
    if (r.ok || r.status === 201) {
      const id = r.headers.get('x-restli-id') || r.headers.get('x-linkedin-id') || '';
      return { ok: true, url: id ? urlDoUrn(id) : 'https://www.linkedin.com/in/me/recent-activity/all/' };
    }
    erroRest = `rest/posts HTTP ${r.status}: ${(await r.text().catch(() => '')).slice(0, 300)}`;
  } catch (e) {
    erroRest = `rest/posts falhou: ${String((e as Error)?.message ?? e)}`;
  }

  // tentativa 2 (fallback): /v2/ugcPosts (legado, sem header de versão)
  try {
    const r = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify({
        author, lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text }, shareMediaCategory: 'NONE' } },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    if (r.status === 401) return { ok: false, tokenExpirado: true, erro: 'Token do LinkedIn expirou. Gere um novo e atualize no Vercel.' };
    if (r.ok || r.status === 201) {
      const id = r.headers.get('x-restli-id') || '';
      return { ok: true, url: id ? urlDoUrn(id) : 'https://www.linkedin.com/in/me/recent-activity/all/' };
    }
    const erroUgc = `ugcPosts HTTP ${r.status}: ${(await r.text().catch(() => '')).slice(0, 300)}`;
    return { ok: false, erro: `${erroRest} | ${erroUgc}` };
  } catch (e) {
    return { ok: false, erro: `${erroRest} | ugcPosts falhou: ${String((e as Error)?.message ?? e)}` };
  }
}

/** Só verifica o token + resolve o perfil (sem postar). Pra checar que está tudo certo com segurança. */
export async function checarLinkedIn(): Promise<{ ok: boolean; urn?: string; erro?: string }> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return { ok: false, erro: 'LINKEDIN_ACCESS_TOKEN ausente.' };
  const u = await getPersonURN(token);
  if (u.urn) return { ok: true, urn: u.urn };
  return { ok: false, erro: u.erro === TOKEN_EXPIRADO ? 'Token expirado.' : u.erro };
}
