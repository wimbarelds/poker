import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import devtools from 'solid-devtools/vite';
import { defineConfig, mergeConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig as defineVitestConfig } from 'vitest/config';

import { vitePluginGhPagesBase } from './src/vite/vite-plugin-ghpages-base';

const viteConfig = defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss({ optimize: false }), vitePluginGhPagesBase()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  css: {
    lightningcss: {
      targets: { chrome: 140 },
      customAtRules: {
        function: {
          prelude: '*',
          body: 'style-block',
        },
        property: {
          prelude: '<custom-ident>',
          body: 'declaration-list',
        },
      },
    },
  },
});

export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      environment: 'node',
      globals: true,
    },
  }),
);
