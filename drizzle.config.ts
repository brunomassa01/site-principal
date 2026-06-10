import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Migrations usam a conexão DIRETA (unpooled). O pooler do Neon não lida bem com DDL.
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
});
