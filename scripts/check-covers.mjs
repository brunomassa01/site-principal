import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`select slug, capa_url from posts order by data desc`;
for (const r of rows) console.log(`${r.slug}\n   capa: ${r.capa_url}`);
