// config/sitemap.config.js
/**
 * Astro サイトマップ設定 (動的 siteUrl 対応)
 */

// ===========================
// A. カスタムページ生成
// ===========================

/**
 * 外部生成ページを追加
 * @param {string} siteUrl - サイトのベース URL
 * @returns {string[]} - カスタムページの配列
 */
export function getCustomPages(siteUrl) {
    return [
      // 外部サービスで生成されたページ
      `${siteUrl}/external-blog-post`,
      `${siteUrl}/api-documentation`,
      
      // microCMS で生成されたページ
      `${siteUrl}/blog/microcms-article-1`,
      `${siteUrl}/blog/microcms-article-2`,
      
      // 手動で作成したランディングページ
      `${siteUrl}/special-landing-page`,
      `${siteUrl}/campaign-2024`,
    ];
  }
  
  // ===========================
  // B. 除外パターン
  // ===========================
  
  export const excludePatterns = [
    '/admin',       // 管理画面
    '/draft',       // 下書き
    '/test',        // テスト
    '/private',     // プライベート
    '/api/',        // API エンドポイント
    '/login',       // 認証
    '/logout',
    '/signup',
    '/404',         // エラーページ
    '/500',
  ];
  
  export const excludeRegexPatterns = [
    /\/draft-\d{4}-\d{2}-\d{2}/,      // /draft-2024-01-01
    /\/user\/\d+\/private/,            // /user/123/private
    /\/[a-z]{2}\/admin/,               // /en/admin, /ja/admin
    /\?.*preview=true/,                // プレビューページ
  ];
  
  // ===========================
  // C. フィルター関数
  // ===========================
  
  /**
   * サイトマップに含めるページを判定
   * @param {string} siteUrl - サイトのベース URL
   * @returns {Function} - フィルター関数
   */
  export function createSitemapFilter(siteUrl) {
    return (page) => {
      // 1. 完全一致での除外
      for (const pattern of excludePatterns) {
        if (page.includes(pattern)) {
          console.log(`❌ 除外: ${page} (パターン: ${pattern})`);
          return false;
        }
      }
      
      // 2. 正規表現での除外
      for (const regex of excludeRegexPatterns) {
        if (regex.test(page)) {
          console.log(`❌ 除外: ${page} (正規表現: ${regex})`);
          return false;
        }
      }
      
      // 3. 自サイト以外の URL を除外
      if (!page.startsWith(siteUrl)) {
        console.log(`❌ 除外: ${page} (外部 URL)`);
        return false;
      }
      
      // 4. すべてのチェックをパス
      return true;
    };
  }
  
  // ===========================
  // D. 環境変数からカスタムページを追加
  // ===========================
  
  /**
   * 環境変数から追加のカスタムページを取得
   * @param {string} siteUrl - サイトのベース URL
   * @returns {string[]} - 追加ページの配列
   */
  export function getExtraCustomPages(siteUrl) {
    const pages = [];
    
    // EXTRA_SITEMAP_PAGES 環境変数からパスを取得
    if (process.env.EXTRA_SITEMAP_PAGES) {
      const extraPaths = process.env.EXTRA_SITEMAP_PAGES.split(',');
      pages.push(...extraPaths.map(path => `${siteUrl}${path.trim()}`));
      console.log(`✅ 環境変数から ${pages.length} 件のページを追加`);
    }
    
    return pages;
  }
  
  // ===========================
  // E. デフォルトエクスポート
  // ===========================
  
  export default {
    getCustomPages,
    getExtraCustomPages,
    excludePatterns,
    excludeRegexPatterns,
    createSitemapFilter,
  };
  