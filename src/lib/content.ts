/**
 * 環境判定
 * - MODE === 'production' → 本番環境
 * - それ以外 → Staging 環境
 */
const isProduction = import.meta.env.MODE === 'production';

export const newtClient = createClient({
  spaceUid: import.meta.env.NEWT_SPACE_UID,
  token: isProduction
    ? import.meta.env.NEWT_PRODUCTION_API_TOKEN  // CDN API Token
    : import.meta.env.NEWT_PREVIEW_API_TOKEN,     // API Token (下書き含む)
  apiType: isProduction ? 'cdn' : 'api',
});