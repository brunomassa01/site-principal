import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);

await sql`CREATE TABLE IF NOT EXISTS social_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem integer NOT NULL DEFAULT 0,
  nome text NOT NULL,
  capitulo text,
  semana_inicio integer,
  semana_fim integer,
  palavras_chave jsonb DEFAULT '[]'::jsonb,
  lead_magnet_url text,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS social_semanas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL UNIQUE,
  inicio date,
  cluster text,
  cluster_id uuid REFERENCES social_clusters(id),
  tema text,
  ponte_ia boolean NOT NULL DEFAULT false,
  slot_reativo boolean NOT NULL DEFAULT false,
  coringa boolean NOT NULL DEFAULT false,
  observacoes text,
  status text NOT NULL DEFAULT 'planejado',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS social_pecas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semana_id uuid NOT NULL REFERENCES social_semanas(id) ON DELETE CASCADE,
  formato text NOT NULL,
  gancho text,
  lente text,
  conteudo jsonb,
  legenda text,
  manychat text,
  dia_publicacao text,
  status text NOT NULL DEFAULT 'planejado',
  publicado_em timestamptz,
  url_publicada text,
  midia_urls jsonb DEFAULT '[]'::jsonb,
  metricas jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

const t = await sql`SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'social_%' ORDER BY table_name`;
console.log('tabelas social criadas:', t.map(x => x.table_name).join(', '));
process.exit(0);
