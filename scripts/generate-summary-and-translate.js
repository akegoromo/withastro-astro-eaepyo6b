// scripts/generate-summary-and-translate.js
const axios = require('axios');

// 環境変数
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;
const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const SAKURA_AI_TOKEN = process.env.SAKURA_AI_TOKEN;

// API エンドポイント
const MICROCMS_ENDPOINT = `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/blog`;
const DEEPL_ENDPOINT = 'https://api-free.deepl.com/v2/translate';
const SAKURA_AI_ENDPOINT = 'https://api.ai.sakura.ad.jp/v1/chat/completions';

/**
 * さくらのAI Engine で適応型要約生成
 * - 350文字超過: 180文字程度に要約
 * - 600文字超過: 200文字程度に要約
 * - それ以下: そのまま返す
 */
async function generateSummaryWithAI(content) {
    // HTMLタグ除去
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    const textLength = plainText.length;
    
    console.log(`Original text length: ${textLength} characters`);
    
    // 350文字以下の場合はそのまま返す
    if (textLength <= 350) {
      console.log('Text is short enough, no summarization needed');
      return plainText;
    }
    
    // 適応型要約: 文字数に応じて目標文字数を調整
    let targetLength;
    let systemPrompt;
    
    if (textLength > 600) {
      targetLength = 200;
      systemPrompt = `あなたは優秀な要約生成AIです。以下の記事本文を200文字程度に要約してください。
  
  【制約条件】
  - 200文字程度（±20文字）で要約
  - 記事の要点を3つ以内にまとめる
  - 読者が一目で理解できる簡潔な文章
  - 文の途中で終わらないよう、完全な文章で終える`;
    } else {
      targetLength = 180;
      systemPrompt = `あなたは優秀な要約生成AIです。以下の記事本文を180文字程度に要約してください。
  
  【制約条件】
  - 180文字程度（±20文字）で要約
  - 記事の要点を2-3つにまとめる
  - 読者が一目で理解できる簡潔な文章
  - 文の途中で終わらないよう、完全な文章で終える`;
    }
    
    console.log(`Target summary length: ${targetLength} characters`);
    
    try {
      const response = await axios.post(
        SAKURA_AI_ENDPOINT,
        {
          model: 'gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: plainText }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${SAKURA_AI_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const summary = response.data.choices[0].message.content.trim();
      console.log(`Generated summary length: ${summary.length} characters`);
      
      return summary;
    } catch (error) {
      console.error('Sakura AI Engine Error:', error.response?.data || error.message);
      
      // フォールバック: 簡易的な要約生成
      console.log('Falling back to simple summarization');
      return generateSimpleSummary(plainText, targetLength);
    }
  }
  
  /**
   * 簡易的な要約生成（フォールバック用）
   */
  function generateSimpleSummary(content, maxLength = 180) {
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    // 文の途中で切れないよう、句点で区切る
    const sentences = plainText.split(/[。.]/);
    let summary = '';
    
    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) break;
      summary += sentence + '。';
    }
    
    return summary || plainText.substring(0, maxLength) + '...';
  }
  
  /**
   * DeepL API 翻訳
   */
  async function translateText(text, targetLang = 'EN', sourceLang = 'JA') {
    try {
      const response = await axios.post(DEEPL_ENDPOINT, null, {
        params: {
          auth_key: DEEPL_API_KEY,
          text: text,
          target_lang: targetLang,
          source_lang: sourceLang,
          formality: 'default'
        }
      });
      
      return response.data.translations[0].text;
    } catch (error) {
      console.error('DeepL API Error:', error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * microCMS 記事取得
   */
  async function fetchPost(postId) {
    const response = await axios.get(`${MICROCMS_ENDPOINT}/${postId}`, {
      headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY }
    });
    return response.data;
  }
  
  /**
   * microCMS 記事更新
   * 注意: microCMS では読み取りと書き込みに同じ API キーを使用
   */
  async function updatePost(postId, data) {
    await axios.patch(`${MICROCMS_ENDPOINT}/${postId}`, data, {
      headers: {
        'X-MICROCMS-API-KEY': MICROCMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * メイン処理
   */
  async function main() {
    const postId = process.env.POST_ID;
    
    if (!postId) {
      console.error('POST_ID environment variable is required');
      process.exit(1);
    }
    
    console.log(`🚀 Processing post: ${postId}`);
    
    // 1. 記事取得
    console.log('\n📥 Step 1: Fetching post from microCMS...');
    const post = await fetchPost(postId);
    console.log(`Title: ${post.title}`);
    console.log(`Content length: ${post.content.replace(/<[^>]+>/g, '').length} characters`);
    
    // 2. さくらのAI Engine で適応型要約生成
    console.log('\n🤖 Step 2: Generating summary with Sakura AI Engine...');
    const summary_ja = post.summary_ja || await generateSummaryWithAI(post.content);
    console.log(`Summary (JA): ${summary_ja.substring(0, 80)}...`);
    console.log(`Summary length: ${summary_ja.length} characters`);
    
    // 3. 日本語要約を英語に翻訳
    console.log('\n🌐 Step 3: Translating summary to English...');
    const summary_en = await translateText(summary_ja, 'EN', 'JA');
    console.log(`Summary (EN): ${summary_en.substring(0, 80)}...`);
    
    // 4. タイトルを英語に翻訳
    console.log('\n🌐 Step 4: Translating title to English...');
    const title_en = post.title_en || await translateText(post.title, 'EN', 'JA');
    console.log(`Title (EN): ${title_en}`);
    
    // 5. 本文を英語に翻訳（content_en が空の場合のみ）
    let content_en = post.content_en;
    if (!content_en && post.content) {
      console.log('\n🌐 Step 5: Translating content to English...');
      content_en = await translateText(post.content, 'EN', 'JA');
      console.log(`Content (EN): ${content_en.substring(0, 80)}...`);
    } else {
      console.log('\n⏭️  Step 5: Content already translated, skipping');
    }
    
    // 6. microCMS 更新
    console.log('\n💾 Step 6: Updating microCMS...');
    await updatePost(postId, {
      title_en,
      content_en,
      summary_ja,
      summary_en
    });
    
    console.log('\n✅ Translation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Original content: ${post.content.replace(/<[^>]+>/g, '').length} characters`);
    console.log(`  - Summary (JA): ${summary_ja.length} characters`);
    console.log(`  - Summary (EN): ${summary_en.length} characters`);
  }
  
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
  