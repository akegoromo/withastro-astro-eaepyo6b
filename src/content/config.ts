// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// blog コレクションの定義
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    // 必須フィールド
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    // オプショナルフィールド
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// コレクションをエクスポート
export const collections = { blog };
