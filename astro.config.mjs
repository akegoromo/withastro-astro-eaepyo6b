// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  
  SYNTAX_ERROR_HERE // ← 意図的なエラー

  vite: {
    plugins: [tailwindcss()]
  }
});