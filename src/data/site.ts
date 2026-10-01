// Site-wide settings. Edit these instead of hunting through components.

// Build-time settings come from Cloudflare Pages variables or a local .env file.
const env = (key: string): string | undefined => process.env[key] ?? (import.meta.env as Record<string, string | undefined>)[key];

export const WP_URL = (env('WP_URL') || 'https://techvibesit.com').replace(/\/$/, '');

export const company = {
  name: 'TechVibes IT',
  legalName: 'TechVibes IT Ltd',
  companyNo: '16538075',
  email: 'hello@techvibesit.com',
  tagline: 'UK-based technology company specialising in AI, eCommerce, web applications, and digital transformation.',
  address: 'Innovation Centre and Business Base, 110 Great Marlings, Butterfield, Luton, LU2 8DL, United Kingdom',
  linkedin: 'https://www.linkedin.com/company/techvibesit',
  facebook: 'https://www.facebook.com/techvibesit/',
  github: 'https://github.com/TechVibes-IT-Ltd',
  trustpilot: 'https://www.trustpilot.com/review/techvibesit.com',
  // Meetings are booked through Calendly, embedded on /schedule-a-meeting/.
  scheduleUrl: '/schedule-a-meeting/',
  calendlyUrl: 'https://calendly.com/muntasiraumio/30min',
};

// Search engines are kept away from the test subdomain until cutover.
// Set SITE_NOINDEX=false in Cloudflare Pages when this becomes the live site.
export const NOINDEX = (env('SITE_NOINDEX') ?? 'true') !== 'false';

// Cloudflare Turnstile site key (public) for the contact form's spam check.
// Leave empty to hide the check. The matching secret key is a Worker secret, see README.
export const TURNSTILE_SITE_KEY = (env('PUBLIC_TURNSTILE_SITE_KEY') || '').trim();

export const services = [
  {
    slug: 'ai-automation',
    title: 'AI & Automation',
    short: 'AI & Automation',
    bullets: ['AI agents', 'Workflow automation', 'Business process optimisation', 'AI-powered insights'],
  },
  {
    slug: 'shopify-development',
    title: 'Shopify Development',
    short: 'Shopify',
    bullets: ['Store development', 'Custom Shopify apps', 'Theme customisation', 'Integrations', 'Maintenance'],
  },
  {
    slug: 'wordpress-development',
    title: 'WordPress & WooCommerce',
    short: 'WordPress',
    bullets: ['Custom websites', 'WooCommerce', 'Custom plugins', 'Custom themes', 'Performance and security'],
  },
  {
    slug: 'saas-app-development',
    title: 'SaaS Development',
    short: 'SaaS',
    bullets: ['Platform development', 'AI-powered SaaS', 'APIs', 'Dashboards', 'Automation'],
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    short: 'Mobile Apps',
    bullets: ['iOS', 'Android', 'Cross-platform applications', 'Deployment and optimisation'],
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Growth',
    short: 'Digital Marketing',
    bullets: ['AI-powered SEO', 'Content', 'Conversion optimisation', 'Email marketing', 'Social media'],
  },
] as const;

// Same structure as the live site's main menu.
export const nav = [
  { label: 'About', href: '/about/' },
  { label: 'Work', href: '/work/' },
  {
    label: 'Services',
    href: '/#services',
    children: [
      { label: 'WordPress Development', href: '/wordpress-development/' },
      { label: 'Shopify Development', href: '/shopify-development/' },
      { label: 'SaaS App Development', href: '/saas-app-development/' },
      { label: 'Mobile App Development', href: '/mobile-app-development/' },
      { label: 'AI & Automation', href: '/ai-automation/' },
      { label: 'Digital Marketing', href: '/digital-marketing/' },
    ],
  },
  { label: 'Career', href: '/career/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];

export const legal = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms & Conditions', href: '/terms-conditions/' },
  { label: 'Cookie Policy', href: '/cookie-policy-uk/' },
  { label: 'Accessibility', href: '/accessibility-statement/' },
];

export const testimonials = [
  { quote: 'Muntasir was super responsive and informative! He got my site running super fast in just one day – I really appreciate his work.', name: 'Maria D.', role: 'Co-Founder' },
  { quote: "I'm very satisfied with the work overall. The pace and detail of our communication was excellent. Responded to all my questions quickly and completely.", name: 'Susannah F.', role: 'Founder' },
  { quote: "Great to work with and helped get the job done. Couldn't have asked for me really.", name: 'Dustin O.', role: 'Co-Founder' },
  { quote: 'Excellent communication and got everything needed done quickly!', name: 'Philia K.', role: 'Food Blogger' },
  { quote: 'Quick, responsive and knowledgable! Did a fantastic job. Highly recommend.', name: 'Yasmine R.', role: 'Marketing Head' },
  { quote: 'Muntasir did a fantastic job. I highly recommend him!', name: 'Scott L.', role: 'Founder & CEO' },
];
