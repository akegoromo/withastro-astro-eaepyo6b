import { createClient } from 'microcms-js-sdk';

const isProduction = import.meta.env.MODE === 'production';

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

export async function getBlogPosts() {
  const queries = isProduction
    ? { filters: 'status[equals]published' } // Production: 公開のみ
    : {}; // Staging: 下書き含む全て

  const response = await client.get({
    endpoint: 'blog',
    queries,
  });

  return response.contents;
}
