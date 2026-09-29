import type { APIRoute } from 'astro';
import { NOINDEX } from '../data/site';

// While SITE_NOINDEX is on, pages stay out of search results through their
// `noindex` meta tag. Crawling is still allowed on purpose: a robots.txt
// block would stop search engines from ever seeing that noindex tag.
export const GET: APIRoute = ({ site }) => {
  const body = NOINDEX
    ? 'User-agent: *\nAllow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
