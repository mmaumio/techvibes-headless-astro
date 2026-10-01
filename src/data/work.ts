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
  /** false keeps it off the homepage "Selected work" (still listed on the Work page). */
  home?: boolean;
};

// Order = display order. The homepage shows the featured project plus the next 4 with home !== false.
export const projects: Project[] = [
  {
    name: 'Continental Ventures',
    category: 'Metals trading and consultancy',
    stack: 'WordPress, Elementor',
    url: 'https://continentalventures.co.uk/',
    featured: true,
  },
  { name: 'Swiglife' },
  { name: 'Texas School Alliance' },
  { name: 'Poem Analysis' },
  { name: 'Destash at the Mash', category: 'WooCommerce marketplace' },
  { name: 'Groove Grub', home: false },
  { name: 'Play Wisconsin', home: false },
];
