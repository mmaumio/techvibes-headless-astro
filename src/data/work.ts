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

// Order = display order. The homepage shows the featured project plus every other
// project without home: false (5 fit one row on desktop).
export const projects: Project[] = [
  {
    name: 'Continental Ventures',
    category: 'Metals trading and consultancy',
    stack: 'WordPress, Elementor',
    url: 'https://continentalventures.co.uk/',
    featured: true,
  },
  { name: 'Swiglife', stack: 'Shopify', url: 'https://www.swiglife.com/' },
  {
    name: 'Texas School Alliance',
    category: 'School Alliance of Texas',
    stack: 'WordPress, Elementor',
    url: 'https://texasschoolalliance.org/',
    home: false,
  },
  {
    name: 'Poem Analysis',
    category: 'Poetry analysis',
    stack: 'WordPress, Gutenberg',
    url: 'https://poemanalysis.com/',
  },
  {
    name: 'Destash at the Mash',
    category: 'WooCommerce marketplace',
    stack: 'WordPress, Dokan',
    url: 'https://destashatthemash.com/',
  },
  {
    name: 'FanalytIQs',
    category: 'Sports analytics',
    stack: 'WordPress, custom plugin',
    url: 'https://fanalytiqs.com/',
  },
  {
    name: 'Groove Grub',
    category: 'Food recipe blog',
    stack: 'WordPress, Genesis theme',
    url: 'https://groovegrub.com/',
    home: false,
  },
];
