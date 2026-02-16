// src/i18n/ui.ts

/**
 * 多言語対応の翻訳データ
 * 
 * 各言語の翻訳テキストを定義します
 * ネストした構造で整理し、ドット記法でアクセスします
 * 例: t("menu.home") → "ホーム" (ja) / "Home" (en)
 */

export const languages = {
    ja: "日本語",
    en: "English",
  };
  
  export const defaultLang = "ja";
  
  export const ui = {
    ja: {
      // メインタイトル
      main: {
        title: "緋衣堂",
      },
      
      // メニュー
      menu: {
        home: "ホーム",
        blog: "ブログ",
        about: "About",
        toggle: "メニューを開閉",
        mainNavigation: "メインナビゲーション",
      },
      
      // フッター
      footer: {
        description: "Astro で構築された多言語対応サイトです。",
        links: "リンク",
        navigation: "フッターナビゲーション",
        rights: "All rights reserved.",
        poweredBy: "Powered by",
      },
      
      // ブログ
      blog: {
        title: "緋衣堂",
        allPosts: "すべての記事",
        readMore: "続きを読む",
        publishedOn: "公開日",
        tags: "タグ",
      },
      
      // 共通
      common: {
        loading: "読み込み中...",
        error: "エラーが発生しました",
        notFound: "ページが見つかりません",
      },
    },
    
    en: {
      // Main title
      main: {
        title: "Your Site Name",
      },
      
      // Menu
      menu: {
        home: "Home",
        blog: "Blog",
        about: "About",
        toggle: "Toggle menu",
        mainNavigation: "Main navigation",
      },
      
      // Footer
      footer: {
        description: "A multilingual site built with Astro.",
        links: "Links",
        navigation: "Footer navigation",
        rights: "All rights reserved.",
        poweredBy: "Powered by",
      },
      
      // Blog
      blog: {
        title: "Blog",
        allPosts: "All Posts",
        readMore: "Read more",
        publishedOn: "Published on",
        tags: "Tags",
      },
      
      // Common
      common: {
        loading: "Loading...",
        error: "An error occurred",
        notFound: "Page not found",
      },
    },
  } as const;
  