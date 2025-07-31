import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// import { remarkInteractiveChecklist } from './src/lib/remark-interactive-checklist.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://60-day-web-development-course.vercel.app',
  integrations: [
    mdx(),
    sitemap()
  ],
  markdown: {
    // remarkPlugins: [remarkInteractiveChecklist],
    shikiConfig: {
      // Disable default theme to allow custom CSS
      theme: 'css-variables',
      langs: [],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
      // Allow custom CSS to take precedence
      transformers: [
        {
          name: 'remove-theme-colors',
          pre(node) {
            // Remove inline styles that conflict with our CSS
            if (node.properties && node.properties.style) {
              delete node.properties.style;
            }
          }
        }
      ]
    },
  },
  // Enable server-side rendering
  output: 'static',
  // Force cache refresh - modern code block styling deployed
  // Customize build output
  build: {
    format: 'directory',
  },
});