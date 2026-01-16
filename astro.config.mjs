// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import sitemapConfig from './config/sitemap.config.js';

import partytown from '@astrojs/partytown';

// ===========================
// Cloudflare 環境変数から
// siteUrl を自動検出
// ===========================
const siteUrl = 
  process.env.CF_PAGES_URL ||           // Cloudflare Pages プレビュー URL
  process.env.PUBLIC_SITE_URL ||        // カスタム環境変数 (本番用)
  'https://example.com/';               // フォールバック

// デバッグ情報を出力
console.log('=== Astro Config ===');
console.log('Site URL:', siteUrl);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('===================');

// ===========================
// カスタムページを生成
// ===========================

// 基本のカスタムページ
const customPages = sitemapConfig.getCustomPages(siteUrl);
// 環境変数から追加のカスタムページ
const extraPages = sitemapConfig.getExtraCustomPages(siteUrl);
// すべてのカスタムページを結合
const allCustomPages = [...customPages, ...extraPages];
console.log(`✅ カスタムページ合計: ${allCustomPages.length} 件`);

// ===========================
// Astro 設定
// ===========================
export default defineConfig({
  site: siteUrl,
  
  integrations: [sitemap({
    // ✅ siteUrl を使用して動的に生成
    customPages: allCustomPages,
    
    // ✅ siteUrl を渡してフィルター生成
    filter: sitemapConfig.createSitemapFilter(siteUrl),
    
    // オプション設定
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date(),
  }), partytown()],
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