// Case studies used on the homepage ("Selected work") and the Work page.
// Fill in stack, outcome and url as you confirm each project.
// Empty fields are simply not shown, so nothing half-finished appears on the site.
// Images: add src/assets/images/work-<name>.png (e.g. work-swiglife.png).
// They are treated as logos; set logo: false for a screenshot that should fill the frame.

export type Project = {
  name: string;
  category?: string;
  stack?: string;
  outcome?: string;
  url?: string;
  logo?: boolean;
  featured?: boolean;
};

export const projects: Project[] = [
  { name: 'Swiglife', featured: true },
  { name: 'Texas School Alliance' },
  { name: 'Poem Analysis' },
  { name: 'Groove Grub' },
  { name: 'Play Wisconsin' },
  { name: 'Destash at the Mash', category: 'WooCommerce marketplace' },
];
