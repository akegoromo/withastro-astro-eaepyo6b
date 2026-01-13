// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// ✅ Cloudflare Pages の環境変数を自動検出
const siteUrl = 
  process.env.CF_PAGES_URL ||           // Cloudflare Pages プレビュー URL
  process.env.PUBLIC_SITE_URL ||        // カスタム環境変数 (本番用)
  'https://example.com/';               // フォールバック

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  
  integrations: [sitemap()],
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
