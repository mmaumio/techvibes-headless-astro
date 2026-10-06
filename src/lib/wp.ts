// Build-time WordPress client. Everything here runs during `astro build`,
// so visitors never hit WordPress: they get static HTML from Cloudflare.
import { WP_URL } from '../data/site';

const API = `${WP_URL}/wp-json`;

// Slugs that are rebuilt as hand-made Astro pages (their WordPress versions
// are Elementor layouts) or that still need WordPress plugins to work.
export const ASTRO_OWNED_SLUGS = new Set([
  'home', 'about', 'contact', 'work', 'career', 'blog',
  'wordpress-development', 'shopify-development', 'saas-app-development',
  'mobile-app-development', 'ai-automation', 'webflow-framer-design',
  'digital-marketing', // retired service, now redirects to /webflow-framer-design/
  'customer-cabinet', 'schedule-a-meeting',
]);

const cache = new Map<string, Promise<any[]>>();

/** Fetch every item of a collection, following WordPress pagination. */
export function wpCollection(path: string): Promise<any[]> {
  if (!cache.has(path)) cache.set(path, load(path));
  return cache.get(path)!;
}

// Some hosts and firewalls (Hostinger, Wordfence, Cloudflare bot rules) block
// requests that arrive with a bare "node" user agent, so identify the build.
const HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; TechVibesAstroBuild/1.0; +https://techvibesit.com)',
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET a WordPress URL as JSON, retrying brief outages and rate limits. */
async function getJson(url: string): Promise<{ data: any; res: Response }> {
  let lastError: Error = new Error('no attempt made');
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
      const type = res.headers.get('content-type') ?? '';
      const body = await res.text();
      // A firewall or challenge page comes back as HTML, not JSON.
      if (!type.includes('json')) {
        throw Object.assign(new Error(`HTTP ${res.status}, expected JSON but got "${type || 'no content type'}": ${body.replace(/\s+/g, ' ').slice(0, 160)}`), { retry: res.status >= 429 });
      }
      const data = JSON.parse(body);
      if (!res.ok) {
        throw Object.assign(new Error(`HTTP ${res.status} ${data?.code ?? ''} ${data?.message ?? ''}`.trim()), {
          retry: res.status === 429 || res.status >= 500,
          code: data?.code,
          status: res.status,
        });
      }
      return { data, res };
    } catch (err: any) {
      lastError = err;
      const retry = err?.retry ?? true; // network errors and timeouts: retry
      if (!retry || attempt === 4) break;
      await sleep(1000 * 2 ** (attempt - 1)); // 1s, 2s, 4s
    }
  }
  throw lastError;
}

// Collections that are allowed not to exist (the job listings route only
// exists while WP Job Manager is active).
const OPTIONAL = ['job-listings'];

async function load(path: string): Promise<any[]> {
  const items: any[] = [];
  let page = 1;
  let total = 1;
  try {
    do {
      const sep = path.includes('?') ? '&' : '?';
      const { data, res } = await getJson(`${API}/wp/v2/${path}${sep}per_page=100&page=${page}`);
      if (!Array.isArray(data)) throw new Error('response was not a list');
      total = Number(res.headers.get('X-WP-TotalPages') ?? 1);
      items.push(...data);
      page++;
    } while (page <= total);
    console.log(`[wp] Loaded ${items.length} item(s) from ${path.split('?')[0]}`);
    return items;
  } catch (err: any) {
    if (err?.code === 'rest_no_route' && OPTIONAL.some((p) => path.startsWith(p))) {
      console.warn(`[wp] ${path.split('?')[0]} is not available (plugin inactive?), skipping.`);
      return [];
    }
    const msg = `[wp] Could not load "${path.split('?')[0]}" from ${API}: ${err?.message ?? err}`;
    // Never publish a site with missing posts or jobs: stop the build so the
    // last good deployment stays live. `astro dev` only warns, so the design
    // can be worked on offline. WP_ALLOW_EMPTY=true overrides this.
    const allowEmpty = import.meta.env.DEV || (process.env.WP_ALLOW_EMPTY ?? '') === 'true';
    if (!allowEmpty) throw new Error(msg);
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
let seoUnavailable = false;
export async function getSeoHead(link: string): Promise<string | null> {
  // If Rank Math's headless endpoint is off, stop asking after the first miss
  // so the build doesn't hammer WordPress with requests that can't succeed.
  if (seoUnavailable) return null;
  try {
    const res = await fetch(`${API}/rankmath/v1/getHead?url=${encodeURIComponent(link)}`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 404) {
      seoUnavailable = true;
      console.log('[wp] Rank Math headless endpoint not enabled, using built-in SEO tags.');
      return null;
    }
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null;
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

/* ---------------------------------------------------------------------------
 * Blog archives (categories, tags, authors) at the same URLs as WordPress
 * ------------------------------------------------------------------------- */

export const POSTS_PER_PAGE = 9;

export type Term = { id: number; name: string; slug: string; taxonomy: string; path: string };
export type Author = { id: number; name: string; slug: string; path: string; description: string; avatar: string };
export type Archive = {
  path: string; // e.g. /category/wordpress/
  kind: 'category' | 'tag' | 'author';
  name: string;
  description: string;
  avatar?: string;
  link: string; // the WordPress URL, for Rank Math SEO data
  posts: any[];
};

/** Path part of a WordPress URL: https://techvibesit.com/category/x/ -> /category/x/ */
const pathOf = (link?: string) => {
  try { return link ? new URL(link).pathname : ''; } catch { return ''; }
};

/** Categories and tags of a post (needs _embed=wp:term). */
export function postTerms(post: any, taxonomy?: 'category' | 'post_tag'): Term[] {
  return (post?._embedded?.['wp:term'] ?? [])
    .flat()
    .filter((t: any) => t && t.slug && (!taxonomy || t.taxonomy === taxonomy))
    .map((t: any) => ({
      id: t.id,
      name: decode(t.name),
      slug: t.slug,
      taxonomy: t.taxonomy,
      path: pathOf(t.link) || `/${t.taxonomy === 'post_tag' ? 'tag' : t.taxonomy}/${t.slug}/`,
    }));
}

/** Author of a post (needs _embed=author). */
export function postAuthor(post: any): Author | null {
  const a = post?._embedded?.author?.[0];
  if (!a || !a.slug) return null;
  return {
    id: a.id,
    name: a.name,
    slug: a.slug,
    path: pathOf(a.link) || `/author/${a.slug}/`,
    description: a.description ?? '',
    avatar: a.avatar_urls?.['96'] ?? '',
  };
}

let archivesCache: Promise<Archive[]> | null = null;

/** Every category, tag and author that has published posts. */
export function getArchives(): Promise<Archive[]> {
  archivesCache ??= (async () => {
    const [posts, cats, tags] = await Promise.all([
      getPosts(),
      wpCollection('categories?hide_empty=true'),
      wpCollection('tags?hide_empty=true'),
    ]);
    const termInfo = new Map<string, any>([...cats, ...tags].map((t) => [`${t.taxonomy}:${t.id}`, t]));
    const map = new Map<string, Archive>();
    const add = (key: string, make: () => Omit<Archive, 'posts'>, post: any) => {
      if (!map.has(key)) map.set(key, { ...make(), posts: [] });
      map.get(key)!.posts.push(post);
    };
    for (const post of posts) {
      for (const t of postTerms(post)) {
        if (t.taxonomy !== 'category' && t.taxonomy !== 'post_tag') continue;
        const info = termInfo.get(`${t.taxonomy}:${t.id}`);
        add(t.path, () => ({
          path: t.path,
          kind: t.taxonomy === 'category' ? 'category' : 'tag',
          name: t.name,
          description: decode(info?.description ?? ''),
          link: info?.link ?? '',
        }), post);
      }
      const author = postAuthor(post);
      if (author) {
        add(author.path, () => ({
          path: author.path,
          kind: 'author',
          name: author.name,
          description: author.description,
          avatar: author.avatar,
          link: post._embedded.author[0].link ?? '',
        }), post);
      }
    }
    return [...map.values()];
  })();
  return archivesCache;
}

/** Split a list into pages of POSTS_PER_PAGE. */
export function paginate<T>(items: T[], perPage = POSTS_PER_PAGE): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));
  return pages.length ? pages : [[]];
}

/** URL of page n of a listing: /blog/ -> /blog/page/2/ (like WordPress). */
export const pageUrl = (base: string, n: number) => (n <= 1 ? base : `${base}page/${n}/`);

export function excerptOf(post: any, max = 190): string {
  const text = decode(post?.excerpt?.rendered ?? '').replace(/\s+/g, ' ').replace(/\[…\]|\[&hellip;\]/g, '').trim();
  return text.length > max ? text.slice(0, max - 3).replace(/\s+\S*$/, '') + '…' : text;
}
