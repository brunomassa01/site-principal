import { identidade } from '../../../lib/db/schema';
import { collections } from '../../../lib/painel/config';
import { singletonRoutes } from '../../../lib/painel/crud';

export const prerender = false;
const r = singletonRoutes(identidade, collections.identidade, 'identidade');
export const GET = r.GET;
export const PUT = r.PUT;
