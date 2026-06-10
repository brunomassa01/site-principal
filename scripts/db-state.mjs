import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
for (const t of ['posts','timeline','projetos','skills','agora','identidade']) {
  try { const r = await sql.query(`SELECT count(*)::int AS n FROM ${t}`); console.log(`  ${t}: ${r[0].n} linhas`); }
  catch (e) { console.log(`  ${t}: ERRO ${e.message}`); }
}
process.exit(0);
