// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import sitemapConfig from './config/sitemap.config.js';

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

  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      // ✅ siteUrl を使用して動的に生成
      customPages: allCustomPages,
      
      // ✅ siteUrl を渡してフィルター生成
      filter: sitemapConfig.createSitemapFilter(siteUrl),
      
      // オプション設定
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    partytown({  // ← GA4 統合のための Partytown 設定
      config: {
        debug: process.env.NODE_ENV === 'development',  // 開発時のみデバッグモード
        forward: ['dataLayer.push'],  // GA4 の dataLayer をメインスレッドに転送
      },
    }),
  ],
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
