import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests cover the pure helpers in utils/. Pages, stores and components are
// checked in a real browser instead (they depend on Nuxt's auto-imports).
export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    include: ['utils/**/*.spec.ts'],
  },
});
