// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://withastroastroeaepyo6b-0zzz--4321--365214aa.local-credentialless.webcontainer.io', // ← 実際のURLに置き換え
  
  integrations: [tailwind()],
  output: 'static',

  build: {
    format: 'directory',
  },
  
  server: {
    port: 3000,
    host: true,
  },
  
  vite: {
    plugins: [tailwindcss()]
  }
});