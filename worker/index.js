// Cloudflare Worker entry point.
// Static pages from Astro's dist/ folder are served straight from Cloudflare's
// asset store. Only /api/* requests reach this code (see wrangler.jsonc).
import { onRequestGet, onRequestPost } from './contact.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      if (request.method === 'POST') return onRequestPost({ request, env, ctx });
      if (request.method === 'GET') return onRequestGet({ request, env, ctx });
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
    }

    // Anything else under /api/ that doesn't exist: hand back to the static site (404 page).
    return env.ASSETS.fetch(request);
  },
};
