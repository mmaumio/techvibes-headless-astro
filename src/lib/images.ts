// Site images live in src/assets/images/ and are picked up by file name.
// Drop in a file with the right name (any of jpg, png, webp, avif) and the
// matching spot on the site uses it on the next build; Astro resizes and
// converts it to modern formats automatically. See README > Images.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const name = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  byName.set(name, mod.default);
}

/** Image for a slot name like "founder" or "work-swiglife", if uploaded. */
export const siteImage = (name: string): ImageMetadata | undefined => byName.get(name.toLowerCase());

/** "Texas School Alliance" -> "texas-school-alliance" */
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
