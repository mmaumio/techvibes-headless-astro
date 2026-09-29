# TechVibes IT website (Astro)

The TechVibes IT site rebuilt with [Astro](https://astro.build), in the new
design, deployed as static HTML on Cloudflare Pages. WordPress stays on
`techvibesit.com` and acts as a headless CMS: blog posts, legal pages and job
listings are pulled from its REST API at build time.

## What comes from where

| Page | Source |
|---|---|
| Home, About, Contact, Work, Career, 6 service pages | Astro files in `src/pages/`, content in `src/data/` |
| Blog posts (`/post-slug/`) and `/blog/` | WordPress posts |
| Privacy, Terms, Cookie, Accessibility | WordPress pages (block editor) |
| Job listings (`/job/slug/`) | WP Job Manager (`/wp-json/wp/v2/job-listings`) |
| Schedule a meeting, Customer Cabinet | Still on WordPress (need its plugins) |

WordPress pages built with Elementor are skipped automatically. New
block-editor pages you publish in WordPress appear at the same URL here.

## Editing content

- **Case studies**: `src/data/work.ts` (add stack, outcome, url and image as you confirm them; empty fields are hidden)
- **Service pages**: `src/data/services-content.ts`
- **Menu, footer, email, address, testimonials**: `src/data/site.ts`
- **Team photos**: put files in `public/team/` and set `photo` in `src/pages/about.astro`
- **Homepage**: `src/pages/index.astro` (converted from the Claude Design file)

## Local development

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

Node 22.12 or newer is required.

## Deploy: GitHub + Cloudflare Pages

1. Push this folder to a new GitHub repository.
2. Cloudflare dashboard > Workers & Pages > your Pages project (or Create > Pages > Connect to Git) and select the repo.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Settings > Variables and Secrets (Production and Preview):
   - `NODE_VERSION` = `22`
   - `WP_URL` = `https://techvibesit.com`
   - `SITE_NOINDEX` = `true` (until cutover)
   - Contact form: `RESEND_API_KEY` (secret), `CONTACT_FROM` (for example `TechVibes Website <website@techvibesit.com>`, on a domain verified in Resend), `CONTACT_TO` = `hello@techvibesit.com`
5. Custom domains: keep `astro.techvibesit.com` attached to the project.

If the build cannot reach WordPress on Cloudflare, it fails instead of
publishing a site with missing posts. Locally it only warns.

## Contact form

`functions/api/contact.js` is a Cloudflare Pages Function that emails each
enquiry through [Resend](https://resend.com) (free tier covers a small site).
Until `RESEND_API_KEY` and `CONTACT_FROM` are set, the form shows a message
asking visitors to email `hello@techvibesit.com`.

## Rebuild automatically when WordPress changes

1. Cloudflare Pages > Settings > Builds > Deploy hooks > add a hook, copy the URL.
2. In `wp-config.php` on WordPress:

   ```php
   define('ASTRO_DEPLOY_HOOK', 'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/XXXX');
   ```

3. Add as a small plugin or code snippet:

   ```php
   add_action('transition_post_status', function ($new, $old, $post) {
       if (!defined('ASTRO_DEPLOY_HOOK')) return;
       if (!in_array($post->post_type, ['post', 'page', 'job_listing'], true)) return;
       if ($new !== 'publish' && $old !== 'publish') return;
       if (wp_is_post_revision($post) || wp_is_post_autosave($post)) return;
       wp_remote_post(ASTRO_DEPLOY_HOOK, ['blocking' => false]);
   }, 10, 3);
   ```

If LiteSpeed Cache caches REST API responses, turn that off (LiteSpeed Cache >
Cache > REST API) so rebuilds get fresh content.

## SEO

- Enable **Rank Math > General Settings > Others > Headless CMS Support**.
  Blog posts, legal pages and jobs then use Rank Math's title, meta and schema.
- Canonical URLs always point at `https://techvibesit.com`, so the test
  subdomain never competes with the live site.
- While `SITE_NOINDEX=true`, every page has a `noindex` tag. `robots.txt` still allows crawling so search engines can see that tag.

## Cutover checklist (when this replaces WordPress on techvibesit.com)

1. Move WordPress to `cms.techvibesit.com` and set its Site URL there.
2. Set `WP_URL=https://cms.techvibesit.com` and `SITE_NOINDEX=false` in Cloudflare.
3. Update `company.scheduleUrl` in `src/data/site.ts` if booking stays on WordPress.
4. Add `techvibesit.com` as a custom domain on the Pages project.
5. Redeploy, then check the sitemap at `/sitemap-index.xml` and submit it in Search Console.
