// ===========================
// 言語ごとの URL パターン定義
// ===========================

export const routes = {
    // 日本語（デフォルト言語）
    ja: {
      blog: "blog",         // /blog/any-post/
    },
    // 英語
    en: {
      blog: "blog",         // /en/blog/any-post/
    },
  };
  
  // ===========================
  // 型定義
  // ===========================
  
  export type Language = keyof typeof routes;
  
  // ===========================
  // デフォルト言語
  // ===========================
  
  export const defaultLang: Language = "ja";
  
  // ===========================
  // サポートする言語一覧
  // ===========================
  
  export const languages = Object.keys(routes) as Language[];
  
  // ===========================
  // 言語名のラベル
  // ===========================
  
  export const languageLabels: Record<Language, string> = {
    ja: "日本語",
    en: "English",
  };
  