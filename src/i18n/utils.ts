// src/i18n/utils.ts

import { ui, defaultLang } from "./ui";
import { routes } from "./routes";

/**
 * URLから現在の言語を取得
 */
export function getLangFromUrl(url: URL): string {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang;
  return defaultLang;
}

/**
 * 翻訳関数を取得
 */
export function useTranslations(lang: keyof typeof ui) {
  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = ui[lang];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for language "${lang}"`);
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };
}

/**
 * パスを翻訳する関数を取得
 */
export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string): string {
    // ルート（ホーム）の処理
    if (path === "/" || path === "") {
      return lang === defaultLang ? "/" : `/${lang}`;
    }

    // パスの正規化（先頭と末尾のスラッシュを削除）
    const normalizedPath = path.replace(/^\/|\/$/g, "");
    
    // パスセグメントに分割
    const segments = normalizedPath.split("/");
    const firstSegment = segments[0];

    // routes に定義されているパスの場合、翻訳
    const langRoutes = routes[lang as keyof typeof routes];
    if (langRoutes && firstSegment in langRoutes) {
      const translatedSegment = langRoutes[firstSegment as keyof typeof langRoutes];
      segments[0] = translatedSegment;
    }

    const translatedPath = segments.join("/");
    
    // デフォルト言語の場合はプレフィックスなし
    if (lang === defaultLang) {
      return `/${translatedPath}`;
    }
    
    // それ以外の言語はプレフィックス付き
    return `/${lang}/${translatedPath}`;
  };
}

/**
 * 言語を切り替えたURLを生成
 */
export async function switchLanguageUrl(url: URL, targetLang: string): Promise<string> {
  const currentLang = getLangFromUrl(url);
  const currentPath = url.pathname;

  // 同じ言語の場合はそのまま返す
  if (currentLang === targetLang) {
    return currentPath;
  }

  // 現在のパスから言語プレフィックスを除去
  let pathWithoutLang = currentPath;
  if (currentLang !== defaultLang) {
    pathWithoutLang = currentPath.replace(new RegExp(`^/${currentLang}`), "");
  }

  // 空のパスの場合は "/" に正規化
  if (!pathWithoutLang || pathWithoutLang === "") {
    pathWithoutLang = "/";
  }

  // ターゲット言語がデフォルト言語の場合
  if (targetLang === defaultLang) {
    return pathWithoutLang;
  }

  // ターゲット言語のプレフィックスを追加
  if (pathWithoutLang === "/") {
    return `/${targetLang}`;
  }

  return `/${targetLang}${pathWithoutLang}`;
}

/**
 * 現在のパスが指定された言語かどうかをチェック
 */
export function isCurrentLang(url: URL, lang: string): boolean {
  return getLangFromUrl(url) === lang;
}
