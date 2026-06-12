import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://brunomassa.online',
  output: 'hybrid',
  adapter: vercel({ maxDuration: 60 }),
  server: { host: true },
  integrations: [tailwind(), react(), mdx()],
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
