# TechVibes IT website (Astro)

The TechVibes IT site rebuilt with [Astro](https://astro.build), in the new
design, deployed as a Cloudflare Worker that serves static HTML. WordPress stays on
`techvibesit.com` and acts as a headless CMS: blog posts, legal pages and job
listings are pulled from its REST API at build time.

## What comes from where

| Page | Source |
|---|---|
| Home, About, Contact, Work, Career, 6 service pages | Astro files in `src/pages/`, content in `src/data/` |
| Blog posts (`/post-slug/`) and `/blog/` | WordPress posts |
| Privacy, Terms, Cookie, Accessibility | WordPress pages (block editor) |
| Job listings (`/job/slug/`) | WP Job Manager (`/wp-json/wp/v2/job-listings`) |
| Schedule a meeting (`/schedule-a-meeting/`) | Calendly inline embed, link set in `src/data/site.ts` (`calendlyUrl`) |
| Customer Cabinet | Still on WordPress |

WordPress pages built with Elementor are skipped automatically. New
block-editor pages you publish in WordPress appear at the same URL here.

## Editing content

- **Case studies**: `src/data/work.ts` (add stack, outcome, url and image as you confirm them; empty fields are hidden)
- **Service pages**: `src/data/services-content.ts`
- **Menu, footer, email, address, testimonials**: `src/data/site.ts`
- **Images**: see Images below
- **Homepage**: `src/pages/index.astro` (converted from the Claude Design file)

## Images

Site images live in `src/assets/images/` and are matched by file name. Upload a
file with the right name (jpg, png, webp or avif, any size) and it appears in
that spot on the next build; Astro resizes it and converts it to WebP. Missing
files show the branded placeholder.

| File name | Where |
|---|---|
| `founder` | Homepage, Meet the founder |
| `product-exclusive-addons`, `product-darkify`, `product-stockpulse` | Homepage product cards (icons/logos) |
| `work-<project-name>` e.g. `work-swiglife`, `work-texas-school-alliance` | Selected work and Work page (logos; set `logo: false` in `src/data/work.ts` for screenshots) |
| `team-albab`, `team-muntasir`, `team-khairul` | About page team photos |

To replace an image, upload a new file with the same name (delete the old one
if the extension differs).

## Local development

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:4321
npm run build      # outputs to dist/
```

Node 22.12 or newer is required.

## Deploy: GitHub + Cloudflare Workers

The site runs as the Worker **techvibes-headless-astro** (see `wrangler.jsonc`;
the `name` there must match the Worker's name in Cloudflare). Every page is a
static file from `dist/`; only `/api/*` runs code (`worker/`).

Cloudflare > Workers & Pages > techvibes-headless-astro > Settings:

1. **Builds** (connected to this GitHub repo, branch `main`):
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - **Build variables** (used while building): `NODE_VERSION` = `22`,
     `WP_URL` = `https://techvibesit.com`, `SITE_NOINDEX` = `true` (until cutover)
2. **Variables and Secrets** (used by the running site, for the contact form):
   `RESEND_API_KEY` (secret), `CONTACT_TO`. See Contact form below.
   `keep_vars` in `wrangler.jsonc` stops deploys from wiping these.
3. **Domains & Routes**: `new.techvibesit.com` (test).

The build log lists what it pulled from WordPress, e.g.
`[wp] Loaded 3 item(s) from posts`. If WordPress can't be reached (or a
firewall returns a block page instead of JSON), the build retries, then
stops with `[wp] Could not load ...` and the reason, so the last good
deployment stays live. `npm run dev` only warns. Set `WP_ALLOW_EMPTY=true`
to deliberately build without WordPress content.

## Contact form

The form posts to `/api/contact` (`worker/contact.js`), which emails each
enquiry through [Resend](https://resend.com) (free up to 3,000 emails a month).
Reply-To is the visitor, so hitting Reply answers them.

(The Worker can't use Hostinger's SMTP directly: `smtp.hostinger.com` is on
Cloudflare's network, which Workers are not allowed to open connections to.)

Setup:
1. Resend > Domains > Add Domain: `techvibesit.com`. Add the DNS records it shows
   (on the `send` subdomain and `resend._domainkey`) in Cloudflare DNS, or use
   Resend's Cloudflare auto-configure. Hostinger email is not affected.
2. Resend > API Keys > Create, permission **Sending access**.
3. Worker > Settings > Variables and Secrets (runtime):

| Name | Value | Type |
|---|---|---|
| `RESEND_API_KEY` | the key from step 2 | Secret |
| `CONTACT_TO` | where enquiries arrive (default `hello@techvibesit.com`) | Text |
| `CONTACT_FROM` | optional, default `TechVibes Website <hello@techvibesit.com>`; must be on the verified domain | Text |

Troubleshooting:
- `/api/contact?check=1` shows whether the handler is live and which settings it can see.
- Submit the form from `/contact/?debug=1` to see why a send failed (Resend's own message).
- Resend > Emails lists every email sent and whether it was delivered.
- Logs: the Worker's **Observability** tab, look for `[contact]`.

## Rebuild automatically when WordPress changes

1. Worker > Settings > Builds > Deploy Hooks > create a hook for `main`, copy the URL.
2. In `wp-config.php` on WordPress:

   ```php
   define('ASTRO_DEPLOY_HOOK', 'https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/XXXX');
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
2. Set the build variables `WP_URL=https://cms.techvibesit.com` and `SITE_NOINDEX=false`.
3. Add `techvibesit.com` (and `www`) under the Worker's Domains & Routes.
4. Redeploy, then check the sitemap at `/sitemap-index.xml` and submit it in Search Console.
