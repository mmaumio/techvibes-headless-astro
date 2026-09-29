// Case studies used on the homepage ("Selected work") and the Work page.
// Fill in stack, outcome, url and image as you confirm each project.
// Empty fields are simply not shown, so nothing half-finished appears on the site.
// For images, drop files into /public/work/ and set image: '/work/swiglife.jpg'.

export type Project = {
  name: string;
  category?: string;
  stack?: string;
  outcome?: string;
  url?: string;
  image?: string;
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
