import minimist from 'minimist';
import { argv } from 'process';
import { type PluginOption } from 'vite';

export function vitePluginGhPagesBase(): PluginOption {
  const { base = '/' } = minimist(argv.slice(2));

  return {
    name: 'html-basehref',
    config: (current) => ({ ...current, base }),
    transformIndexHtml: () => [{ tag: 'base', attrs: { href: base }, injectTo: 'head-prepend' }],
  };
}
