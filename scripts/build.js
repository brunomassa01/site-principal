import { execSync } from 'child_process';

if (process.env.TINA_CLIENT_ID && process.env.TINA_TOKEN) {
  console.log('[build] Gerando admin do Tina CMS...');
  execSync('npx tinacms build --skip-cloud-checks', { stdio: 'inherit' });
} else {
  console.log('[build] TINA_CLIENT_ID / TINA_TOKEN não definidos — pulando geração do admin.');
}

execSync('npx astro build', { stdio: 'inherit' });
