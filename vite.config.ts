import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import devtools from 'solid-devtools/vite';
import { defineConfig, mergeConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { defineConfig as defineVitestConfig } from 'vitest/config';

const viteConfig = defineConfig({
  plugins: [devtools(), solidPlugin(), tailwindcss()],
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
