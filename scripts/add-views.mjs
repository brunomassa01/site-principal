import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);
await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0`;
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='posts' AND column_name='views'`;
console.log('posts.views existe agora?', cols.length > 0);
process.exit(0);
