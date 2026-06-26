import { conhecimentoVideos } from '../../../../lib/db/schema';
import { collections } from '../../../../lib/painel/config';
import { itemRoutes } from '../../../../lib/painel/crud';

export const prerender = false;
const r = itemRoutes(conhecimentoVideos, collections['conhecimento-videos']);
export const GET = r.GET;
export const PUT = r.PUT;
export const PATCH = r.PATCH;
export const DELETE = r.DELETE;
