// scripts/fetch-microcms.js - ESモジュール形式
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
 * microCMSからコンテンツを取得してMarkdownファイルを生成
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

    // 出力ディレクトリの確認・作成
    const outputDir = path.join(__dirname, '../src/content/blog');
    await fs.mkdir(outputDir, { recursive: true });

    // 各記事をMarkdownファイルとして保存
    for (const post of data.contents) {
      const markdown = generateMarkdown(post);
      const fileName = `${post.id}.md`;
      const filePath = path.join(outputDir, fileName);
      
      await fs.writeFile(filePath, markdown, 'utf-8');
      console.log(`   ✓ Generated: ${fileName}`);
    }
    console.log('🎉 All content fetched and saved successfully!');
  } catch (error) {
    console.error('❌ Error fetching from microCMS:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

/**
 * microCMSの記事データからMarkdownファイルを生成
 * @param {Object} post - microCMSの記事データ
 * @returns {string} Markdown形式の文字列
 */
function generateMarkdown(post) {
  const title = post.title || 'Untitled';
  const description = post.description || '';
  const pubDate = post.publishedAt || post.createdAt;
  const updatedDate = post.updatedAt || post.revisedAt;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  
  // 🔧 修正: post.body (HTML形式) を使用
  const body = post.body || '';  // ← 追加
  
  return `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: "${pubDate}"
${updatedDate ? `updatedDate: "${updatedDate}"` : ''}
${tags.length > 0 ? `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]` : 'tags: []'}
---

${body}
`;
}

// スクリプト実行
fetchMicroCMSContent();
