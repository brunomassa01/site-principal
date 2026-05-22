import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://brunomassa.online',
  output: 'hybrid',
  adapter: vercel(),
  server: { host: true },
  integrations: [tailwind(), react(), keystatic()],
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
