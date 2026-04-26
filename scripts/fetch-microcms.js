// scripts/fetch-microcms.js - Phase 4 修正版（実際のフィールド構造に対応）
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESモジュールでは __dirname が使えないため代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の取得
const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;

// 環境変数の検証
if (!MICROCMS_SERVICE_DOMAIN || !MICROCMS_API_KEY) {
  console.error('❌ Error: Required environment variables are missing');
  console.error('   MICROCMS_SERVICE_DOMAIN:', MICROCMS_SERVICE_DOMAIN ? '✓' : '✗');
  console.error('   MICROCMS_API_KEY:', MICROCMS_API_KEY ? '✓' : '✗');
  process.exit(1);
}

/**
 * microCMSからコンテンツを取得してMarkdownファイルを生成（多言語対応）
 */
async function fetchMicroCMSContent() {
  try {
    console.log('📡 Fetching content from microCMS...');
    console.log(`   Service: ${MICROCMS_SERVICE_DOMAIN}`);
    
    // microCMS API呼び出し（Node.js 18+の組み込みfetchを使用）
    const response = await fetch(
      `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/blog`,
      {
        headers: {
          'X-MICROCMS-API-KEY': MICROCMS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`microCMS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.contents.length} posts from microCMS`);

    // 出力ディレクトリの確認・作成（日本語・英語）
    const jaOutputDir = path.join(__dirname, '../src/content/blog/ja');
    const enOutputDir = path.join(__dirname, '../src/content/blog/en');
    await fs.mkdir(jaOutputDir, { recursive: true });
    await fs.mkdir(enOutputDir, { recursive: true });

    let jaCount = 0;
    let enCount = 0;
    let skippedCount = 0;

    // 各記事を日本語・英語のMarkdownファイルとして保存
    for (const post of data.contents) {
      // 日本語記事の生成（title と content が存在する場合）
      if (post.title && post.content) {
        const jaMarkdown = generateMarkdown(post, 'ja');
        const jaFileName = `${post.id}.md`;
        const jaFilePath = path.join(jaOutputDir, jaFileName);
        
        await fs.writeFile(jaFilePath, jaMarkdown, 'utf-8');
        console.log(`   ✓ Generated (JA): ${jaFileName}`);
        jaCount++;
      }

      // 英語記事の生成（title_en と content_en が存在する場合）
      if (post.title_en && post.content_en) {
        const enMarkdown = generateMarkdown(post, 'en');
        const enFileName = `${post.id}.md`;
        const enFilePath = path.join(enOutputDir, enFileName);
        
        await fs.writeFile(enFilePath, enMarkdown, 'utf-8');
        console.log(`   ✓ Generated (EN): ${enFileName}`);
        enCount++;
      }

      // 日本語・英語どちらも存在しない場合
      if ((!post.title || !post.content) && (!post.title_en || !post.content_en)) {
        console.warn(`   ⚠️  Skipped: ${post.id} (no content in any language)`);
        skippedCount++;
      }
    }

    console.log('');
    console.log('🎉 All content fetched and saved successfully!');
    console.log(`   📝 Japanese posts: ${jaCount}`);
    console.log(`   📝 English posts: ${enCount}`);
    if (skippedCount > 0) {
      console.log(`   ⚠️  Skipped posts: ${skippedCount}`);
    }
  } catch (error) {
    console.error('❌ Error fetching from microCMS:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

/**
 * microCMSの記事データからMarkdownファイルを生成（多言語対応・修正版）
 * @param {Object} post - microCMSの記事データ
 * @param {string} lang - 言語コード ('ja' or 'en')
 * @returns {string} Markdown形式の文字列
 */
function generateMarkdown(post, lang) {
  // 言語に応じたフィールドを取得
  const title = lang === 'ja' ? post.title : post.title_en;
  const content = lang === 'ja' ? post.content : post.content_en;
  
  // 概要フィールドの取得（フォールバック付き）
  // 日本語: description → summary_ja → 空文字
  // 英語: summary_en → description → 空文字
  const description = post.description || '';
  
  const pubDate = post.publishedAt || post.createdAt;
  const updatedDate = post.updatedAt || post.revisedAt;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  
  // サムネイル画像の処理（修正: eyecatch → thumbnail）
  const thumbnail = post.thumbnail?.url || '';
  
  return `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${pubDate}"
${updatedDate ? `updatedDate: "${updatedDate}"` : ''}
${thumbnail ? `image: "${thumbnail}"` : ''}
${tags.length > 0 ? `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]` : 'tags: []'}
isDraft: false
---

${content}
`;
}

// スクリプト実行
fetchMicroCMSContent();
