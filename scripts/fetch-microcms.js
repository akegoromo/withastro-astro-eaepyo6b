const fs = require('fs').promises;
const path = require('path');

const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;
const API_ENDPOINT = `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/blog`;

async function fetchMicroCMSContent() {
  const response = await fetch(API_ENDPOINT, {
    headers: {
      'X-MICROCMS-API-KEY': MICROCMS_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error(`microCMS API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.contents;
}

async function saveAsMarkdown(articles) {
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  
  // ディレクトリ作成
  await fs.mkdir(blogDir, { recursive: true });

  for (const article of articles) {
    const { slug, title, pubDate, description, tags, body } = article;
    
    // Frontmatter生成
    const frontmatter = `---
title: "${title}"
pubDate: ${pubDate}
description: "${description || ''}"
tags: [${tags ? tags.map(t => `"${t}"`).join(', ') : ''}]
---

${body}
`;

    const filePath = path.join(blogDir, `${slug}.md`);
    await fs.writeFile(filePath, frontmatter, 'utf-8');
    console.log(`✅ Saved: ${slug}.md`);
  }
}

(async () => {
  try {
    console.log('📥 Fetching content from microCMS...');
    const articles = await fetchMicroCMSContent();
    
    console.log(`📝 Found ${articles.length} articles`);
    await saveAsMarkdown(articles);
    
    console.log('✅ All content saved successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
