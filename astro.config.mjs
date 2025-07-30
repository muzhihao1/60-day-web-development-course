import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkInteractiveChecklist } from './src/lib/remark-interactive-checklist.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://60-day-web-course.vercel.app',
  integrations: [
    mdx(),
    sitemap()
  ],
  markdown: {
    remarkPlugins: [remarkInteractiveChecklist],
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      theme: 'github-dark-default',
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
  },
  // Enable server-side rendering
  output: 'static',
  // Customize build output
  build: {
    format: 'directory',
  },
});