import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Testa a string POOLED (a que o app usa em produção)
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  select table_name
  from information_schema.tables
  where table_schema = 'public'
  order by table_name
`;
console.log('Conexão POOLED OK. Tabelas no Neon:');
for (const r of rows) console.log('  -', r.table_name);
