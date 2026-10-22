// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { defineHastPlugin } from 'satteri';

import sitemap from '@astrojs/sitemap';

/** Wraps every Markdown table in <div class="table-wrap"> so wide tables scroll horizontally instead of overflowing the page. */
const tableWrap = defineHastPlugin({
  name: 'table-wrap',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      ctx.wrapNode(node, { type: 'element', tagName: 'div', properties: { className: ['table-wrap'] }, children: [] });
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.996workers.org',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({ hastPlugins: [tableWrap] }),
  },
});
