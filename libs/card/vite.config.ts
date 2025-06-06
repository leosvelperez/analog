/// <reference types="vitest" />

import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    plugins: [angular()],
    test: {
      reporters: ['default'],
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      cacheDir: '../../node_modules/.vitest',
      pool: 'vmForks',
      fileParallelism: false,
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
