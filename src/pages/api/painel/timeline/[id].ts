import { timeline } from '../../../../lib/db/schema';
import { collections } from '../../../../lib/painel/config';
import { itemRoutes } from '../../../../lib/painel/crud';

export const prerender = false;
const r = itemRoutes(timeline, collections.timeline);
export const GET = r.GET;
export const PUT = r.PUT;
export const PATCH = r.PATCH;
export const DELETE = r.DELETE;
