// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The live domain. Canonical URLs and the sitemap use this, so the test
// subdomain never competes with the live WordPress site in search results.
const SITE = process.env.SITE_URL || 'https://techvibesit.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  // WordPress URLs end with a slash (/about/, /blog/...). Keeping the same
  // shape means no redirects are needed when this build replaces WordPress.
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
