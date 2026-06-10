import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Remove posts de teste deixados por validações
const del = await sql`delete from posts where titulo like 'Post de teste%' returning slug`;
console.log('Posts de teste removidos:', del.length ? del.map((r) => r.slug).join(', ') : '(nenhum)');

console.log('\nPosts no banco:');
const all = await sql`select titulo, situacao, slug from posts order by data desc`;
for (const r of all) console.log(`  - [${r.situacao}] ${r.titulo}  (${r.slug})`);

console.log('\nUsuários:');
const u = await sql`select email, nome, role, situacao from users`;
for (const r of u) console.log(`  - ${r.email} (${r.nome}, ${r.role})`);
