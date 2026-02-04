// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import tailwindcss from '@tailwindcss/vite';
import sitemapConfig from './config/sitemap.config.js';

// ===========================
// ToC 対応: 必要なインポートを追加
// ===========================
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';

// ===========================
// カスタム Rehype プラグイン
// 見出しに view-timeline-name を付与
// ===========================
function rehypeScrollTimeline() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (['h2', 'h3', 'h4'].includes(node.tagName) && node.properties.id) {
        // CSS変数として安全な形式にIDを変換
        const safeId = node.properties.id.replace(/[^a-zA-Z0-9-_]/g, '-');
        // style属性にview-timeline-nameを追加
        const existingStyle = node.properties.style || '';
        node.properties.style = `${existingStyle}view-timeline-name: --heading-${safeId}; view-timeline-axis: block;`;
      }
    });
  };
}

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

  // ===========================
  // i18n 設定
  // ===========================
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
  },

    // ===========================
  // ToC 対応: Markdown 設定を追加
  // ===========================
  markdown: {
    rehypePlugins: [
      rehypeSlug,            // 見出しID生成（必須）
      rehypeScrollTimeline,  // タイムライン名付与（追加）
    ],
  },
  
});
