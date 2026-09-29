// Build-time WordPress client. Everything here runs during `astro build`,
// so visitors never hit WordPress: they get static HTML from Cloudflare.
import { WP_URL } from '../data/site';

const API = `${WP_URL}/wp-json`;

// Slugs that are rebuilt as hand-made Astro pages (their WordPress versions
// are Elementor layouts) or that still need WordPress plugins to work.
export const ASTRO_OWNED_SLUGS = new Set([
  'home', 'about', 'contact', 'work', 'career', 'blog',
  'wordpress-development', 'shopify-development', 'saas-app-development',
  'mobile-app-development', 'ai-automation', 'digital-marketing',
  'customer-cabinet', 'schedule-a-meeting',
]);

const cache = new Map<string, Promise<any[]>>();

/** Fetch every item of a collection, following WordPress pagination. */
export function wpCollection(path: string): Promise<any[]> {
  if (!cache.has(path)) cache.set(path, load(path));
  return cache.get(path)!;
}

async function load(path: string): Promise<any[]> {
  const items: any[] = [];
  let page = 1;
  let total = 1;
  try {
    do {
      const sep = path.includes('?') ? '&' : '?';
      const res = await fetch(`${API}/wp/v2/${path}${sep}per_page=100&page=${page}`);
      if (res.status === 404) return items; // e.g. no job listings route
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      total = Number(res.headers.get('X-WP-TotalPages') ?? 1);
      items.push(...(await res.json()));
      page++;
    } while (page <= total);
    return items;
  } catch (err) {
    const msg = `[wp] Could not load "${path}" from ${API}: ${(err as Error).message}`;
    // On Cloudflare Pages, fail the build rather than deploy a site with
    // missing blog posts. Locally, carry on so the design can be worked on.
    if (process.env.CF_PAGES) throw new Error(msg);
    console.warn(msg);
    return [];
  }
}

export const getPosts = () => wpCollection('posts?_embed=author,wp:featuredmedia,wp:term&status=publish');
export const getPages = () => wpCollection('pages?status=publish');
export const getJobs = () => wpCollection('job-listings?_embed=wp:term&status=publish');

/** Block-editor pages (legal pages etc.). Elementor pages are left out. */
export async function getContentPages() {
  const pages = await getPages();
  return pages.filter(
    (p) => !ASTRO_OWNED_SLUGS.has(p.slug) && !String(p.content?.rendered ?? '').includes('data-elementor-type'),
  );
}

/** Rank Math head (title, meta, schema). Needs "Headless CMS Support" enabled in Rank Math. */
export async function getSeoHead(link: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/rankmath/v1/getHead?url=${encodeURIComponent(link)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success && typeof data.head === 'string' ? data.head : null;
  } catch {
    return null;
  }
}

const ENTITIES: Record<string, string> = {
  amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
  hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
};

/** WordPress titles arrive HTML-encoded (&#8217; etc.). */
export function decode(s = ''): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

export const featuredImage = (item: any) => item?._embedded?.['wp:featuredmedia']?.[0] ?? null;
export const authorName = (item: any) => item?._embedded?.author?.[0]?.name ?? '';
export const termNames = (item: any): string[] =>
  (item?._embedded?.['wp:term'] ?? []).flat().filter((t: any) => t?.taxonomy !== 'post_tag').map((t: any) => decode(t.name));

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Links to pages on the WordPress domain become site-relative, so readers
 * stay on this site. Files (wp-content uploads) keep pointing at WordPress.
 */
export function localiseLinks(html = ''): string {
  const base = WP_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`href="${base}/(?!wp-content/|wp-admin/|wp-json/)`, 'g'), 'href="/');
}
