import { conhecimentoFases } from '../../../../lib/db/schema';
import { collections } from '../../../../lib/painel/config';
import { collectionRoutes } from '../../../../lib/painel/crud';

export const prerender = false;
const r = collectionRoutes(conhecimentoFases, collections['conhecimento-fases']);
export const GET = r.GET;
export const POST = r.POST;
