// src/data/navigationData.ts

/**
 * ナビゲーションメニューのデータ定義
 * 
 * ラベルは i18n の翻訳キーを使用します
 * 実際の表示テキストは src/i18n/ui.ts で定義されます
 */

interface NavigationItem {
    href: string;
    label: string;
  }
  
  export const navigationData: NavigationItem[] = [
    {
      href: "/",
      label: "menu.home",
    },
    {
      href: "/blog",
      label: "menu.blog",
    },
    {
      href: "/about",
      label: "menu.about",
    },
  ];
  
  export default navigationData;
  