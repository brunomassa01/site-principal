import { conhecimentoVideos } from '../../../../lib/db/schema';
import { collections } from '../../../../lib/painel/config';
import { collectionRoutes } from '../../../../lib/painel/crud';

export const prerender = false;
const r = collectionRoutes(conhecimentoVideos, collections['conhecimento-videos']);
export const GET = r.GET;
export const POST = r.POST;
