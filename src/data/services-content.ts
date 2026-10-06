// Content of the six service pages, taken from the live WordPress pages
// (Webflow & Framer replaced the retired Digital Marketing page).

export type ServicePoint = { title?: string; text: string };
export type ServiceSection = { title: string; intro?: string; points: ServicePoint[] };
export type ServicePage = {
  slug: string;
  eyebrow: string;
  title: string;
  intro?: string;
  metaDescription: string;
  sections: ServiceSection[];
};

export const servicePages: Record<string, ServicePage> = {
  'wordpress-development': {
    slug: 'wordpress-development',
    eyebrow: 'WordPress Development',
    title: 'Your trusted WordPress partner for design, development, and continuous growth.',
    metaDescription: 'Custom WordPress websites, WooCommerce stores, custom plugins and themes from TechVibes IT.',
    sections: [
      {
        title: 'Complete Website Development',
        intro: 'Build a Stunning, High-Performing Website with WordPress.',
        points: [
          { title: 'Custom Design & Development', text: "Tailor your site's design to match your brand and ensure a seamless user experience across all devices." },
          { title: 'SEO & Performance Optimization', text: 'Ensure your website is fast, search engine-friendly, and ready to attract organic traffic.' },
          { title: 'Ongoing Support & Security', text: 'Provide continuous updates, security monitoring, and technical support to keep your site running smoothly.' },
        ],
      },
      {
        title: 'WooCommerce Store Development',
        intro: 'Launch a Robust Online Store with WooCommerce. Drive Sales, Boost Conversions, and Grow Your Brand.',
        points: [
          { title: 'Custom E-Commerce Design', text: 'Build a unique, visually appealing online store tailored to your brand and customer needs.' },
          { title: 'Secure Payment Integration', text: 'Set up reliable and secure payment gateways to ensure smooth, trustworthy transactions for your customers.' },
          { title: 'Scalable & Performance Optimized', text: 'Develop a fast, scalable store that grows with your business, ensuring smooth performance even as you expand.' },
        ],
      },
      {
        title: 'Custom Plugin Development',
        intro: 'Custom WordPress Plugin Development: Tailored Solutions for Your Unique Business Needs.',
        points: [
          { title: 'Tailored Solutions', text: 'We build custom plugins specifically for your business needs, ensuring your website performs exactly as required without limitations from generic plugins.' },
          { title: 'Enhanced Performance & Security', text: 'Our plugins are optimized for speed and security, reducing bloat and vulnerabilities while seamlessly integrating with your existing systems.' },
          { title: 'Ongoing Support & Scalability', text: 'We offer continuous support, updates, and scalability, so your plugins evolve with your business and stay compatible with every WordPress update.' },
        ],
      },
      {
        title: 'Custom Theme Development',
        intro: 'We provide custom WordPress theme development services that deliver:',
        points: [
          { title: 'Unique Brand Identity', text: "We craft bespoke themes that reflect your brand's personality and values, ensuring your website stands out with a distinctive, professional look and tailored user experience." },
          { title: 'Optimized Performance & Security', text: 'Our themes are built for speed, efficiency, and security, eliminating unnecessary code and vulnerabilities while providing a robust foundation for your site\'s growth.' },
          { title: 'Scalability & Seamless Integration', text: 'We design themes with your future needs in mind, allowing for easy expansion, integration with business systems, and smooth updates as your business evolves.' },
        ],
      },
    ],
  },

  'shopify-development': {
    slug: 'shopify-development',
    eyebrow: 'Shopify Development',
    title: 'Transform Your Shopify Store with AI and Expert Development',
    metaDescription: 'Shopify store development, custom Shopify apps, theme customisation and store maintenance from TechVibes IT.',
    sections: [
      {
        title: 'Complete Store Development',
        intro: 'Build a professional, conversion-ready Shopify store tailored to your brand and growth goals.',
        points: [
          { title: 'Custom Store Setup', text: 'Full store creation with pages, products, navigation, and checkout flow.' },
          { title: 'Responsive Design', text: 'Mobile-friendly layouts that look great and work flawlessly on any device.' },
          { title: 'Conversion-Focused Structure', text: 'Optimized product pages and user journey to drive sales from day one.' },
        ],
      },
      {
        title: 'Custom App Development',
        intro: 'Add powerful features to your Shopify store with bespoke apps built for your unique needs.',
        points: [
          { title: 'Private App Solutions', text: 'Build apps that solve your business challenges and automate workflows.' },
          { title: 'Third-Party Integrations', text: 'Connect CRM, ERP, shipping, or marketing tools seamlessly with Shopify.' },
          { title: 'AI-Driven Features', text: 'Smart product recommendations, chatbots, or automation to enhance user experience.' },
        ],
      },
      {
        title: 'Theme Customization',
        intro: 'Make your Shopify store stand out with a theme customized to your brand and customer experience.',
        points: [
          { title: 'Brand-Focused Design', text: 'Tailor colors, fonts, and layouts to reflect your unique identity.' },
          { title: 'Feature Enhancements', text: 'Add sections, sliders, and custom functionality beyond standard theme limits.' },
          { title: 'Speed & SEO Ready', text: 'Optimize your theme for fast loading and better search visibility.' },
        ],
      },
      {
        title: 'Store Maintenance',
        intro: 'Keep your Shopify store secure, updated, and performing at its best with ongoing expert care.',
        points: [
          { title: 'Regular Updates & Fixes', text: 'Apply theme and app updates while resolving technical issues promptly.' },
          { title: 'Performance Monitoring', text: 'Track site speed, SEO health, and conversion metrics to maintain growth.' },
          { title: 'Security & Backup', text: 'Protect your store with proactive security checks and reliable backups.' },
        ],
      },
    ],
  },

  'saas-app-development': {
    slug: 'saas-app-development',
    eyebrow: 'SaaS App Development',
    title: 'Design, Build, and Scale SaaS Apps with AI Integration',
    metaDescription: 'SaaS platform design and development, AI automation tools, predictive analytics and API integration from TechVibes IT.',
    sections: [
      {
        title: 'Platform Design & Development',
        intro: 'Create a powerful, scalable SaaS platform with a seamless user experience.',
        points: [
          { title: 'User-Centered Interface', text: 'Intuitive dashboards and clean navigation to boost engagement.' },
          { title: 'Cloud-Ready Architecture', text: 'Built for scalability, security, and long-term growth.' },
          { title: 'Subscription Management', text: 'Smooth onboarding, billing, and account management features.' },
        ],
      },
      {
        title: 'AI-Driven Automation Tools',
        points: [
          { title: 'Process Automation', text: 'Streamline repetitive tasks to save time and reduce costs.' },
          { title: 'Smart Recommendations', text: 'AI-driven suggestions that personalize user experience and increase retention.' },
          { title: 'Intelligent Chatbots', text: 'Provide instant support and self-service options for customers.' },
        ],
      },
      {
        title: 'Predictive Analytics & Reporting',
        intro: 'Turn data into actionable insights with advanced analytics and forecasting.',
        points: [
          { title: 'Data Dashboards', text: 'Visualize real-time metrics for better decision-making.' },
          { title: 'Predictive Models', text: 'Forecast trends and user behavior to guide strategy.' },
          { title: 'Custom Reports', text: 'Generate detailed insights tailored to business goals.' },
        ],
      },
      {
        title: 'API Development & Integration',
        intro: 'Seamlessly connect your SaaS platform with external tools and services.',
        points: [
          { title: 'Custom API Solutions', text: 'Build robust, secure APIs for smooth data exchange.' },
          { title: 'Third-Party Integration', text: 'Connect CRM, ERP, and marketing platforms effortlessly.' },
          { title: 'Scalable Connectivity', text: 'Support future integrations without compromising performance.' },
        ],
      },
    ],
  },

  'mobile-app-development': {
    slug: 'mobile-app-development',
    eyebrow: 'Mobile App Development',
    title: 'Build Powerful Android and iOS Apps That Drive Business Growth',
    metaDescription: 'Android, iOS and cross-platform app development, deployment and optimisation from TechVibes IT.',
    sections: [
      {
        title: 'Android App Development',
        intro: 'Build fast, reliable, and user-friendly Android apps tailored to your business needs.',
        points: [
          { title: 'Custom App Design', text: 'Intuitive, attractive interfaces that keep users engaged and returning.' },
          { title: 'Feature-Rich Development', text: 'Integrate advanced functionalities like payments, push notifications, and analytics.' },
          { title: 'Performance Optimization', text: 'Ensure smooth performance across devices and Android versions.' },
        ],
      },
      {
        title: 'iOS App Development',
        intro: 'Create elegant, high-performance iOS apps that deliver seamless experiences for Apple users.',
        points: [
          { title: 'Native iOS Expertise', text: 'Build apps optimized for iPhone and iPad with the latest iOS features.' },
          { title: 'User-Centric UI/UX', text: "Craft polished, intuitive designs that match Apple's design standards." },
          { title: 'Scalable Architecture', text: 'Prepare your app to grow as your business expands.' },
        ],
      },
      {
        title: 'Cross-Platform App Development',
        intro: 'Reach more customers with a single app that works across Android and iOS.',
        points: [
          { title: 'Unified Codebase', text: 'Faster development using frameworks like Flutter or React Native.' },
          { title: 'Consistent Experience', text: 'Smooth, responsive performance across multiple devices and platforms.' },
          { title: 'Cost-Effective Delivery', text: 'Save time and budget while maintaining high quality.' },
        ],
      },
      {
        title: 'App Deployment & Optimization',
        intro: 'Launch your app with confidence and keep it performing at its best.',
        points: [
          { title: 'App Store Submission', text: 'Manage publishing, approvals, and compliance for Google Play and App Store.' },
          { title: 'Performance Tuning', text: 'Optimize speed, battery use, and app stability for better user reviews.' },
          { title: 'Analytics & Updates', text: 'Track user behavior and release improvements to boost retention and growth.' },
        ],
      },
    ],
  },

  'ai-automation': {
    slug: 'ai-automation',
    eyebrow: 'AI & Automation',
    title: 'Transform your business with AI agents, automation, and data-driven insights.',
    metaDescription: 'AI agent development, predictive workflow automation, business process optimisation and AI-driven reporting from TechVibes IT.',
    sections: [
      {
        title: 'AI Agent Development',
        intro: 'Build intelligent AI agents to streamline operations, enhance customer experiences, and boost efficiency.',
        points: [
          { text: 'Develop custom AI agents tailored to your business needs' },
          { text: 'Automate customer interactions with personalized, intelligent virtual assistants' },
          { text: 'Enhance decision-making with data-driven AI-powered solutions' },
        ],
      },
      {
        title: 'Predictive Workflow Automation',
        intro: 'Automate workflows with predictive AI to optimize efficiency and minimize operational risks',
        points: [
          { text: 'Use predictive models to streamline and automate critical workflows' },
          { text: 'Enhance decision-making with real-time, data-driven insights for process optimization' },
          { text: 'Improve efficiency by anticipating bottlenecks and proactively addressing issues' },
        ],
      },
      {
        title: 'Business Process Optimization',
        intro: "Leverage AI to generate high-quality blog posts, captions, and marketing materials tailored to your brand's voice and audience.",
        points: [
          { title: 'Automated Blog Posts', text: 'AI-generated, SEO-friendly blog content tailored to your niche for maximum engagement' },
          { title: 'Captions & Social Media Content', text: 'Creative, attention-grabbing captions designed for Facebook, Instagram, and other platforms' },
          { title: 'Marketing Materials', text: 'AI-assisted copywriting for ads, emails, and promotional content to increase conversions and engagement' },
        ],
      },
      {
        title: 'AI-Driven Insights & Reporting',
        intro: 'Gain real-time insights into your marketing performance with automated reports and data-driven analytics that streamline decision-making.',
        points: [
          { title: 'Real-Time Data Monitoring', text: 'Track key metrics and campaign results instantly for timely adjustments' },
          { title: 'Customizable Reports', text: 'Tailor reports to your specific needs, focusing on the most relevant data for your business' },
          { title: 'Actionable Insights', text: 'Leverage analytics to uncover trends, opportunities, and areas for optimization in your marketing strategy' },
        ],
      },
    ],
  },

  'webflow-framer-design': {
    slug: 'webflow-framer-design',
    eyebrow: 'Webflow & Framer',
    title: 'Beautiful, fast websites in Webflow and Framer that your team can update without a developer.',
    intro: 'Your website is often the first impression of your brand. We design and build Webflow and Framer sites that look exactly as you imagined, load in a flash, and give your marketing team the freedom to publish, test, and grow on their own schedule.',
    metaDescription: 'Webflow and Framer website design and development for UK businesses. Custom builds, Figma to Webflow or Framer, migrations, CMS and SEO setup from TechVibes IT.',
    sections: [
      {
        title: 'Webflow Website Design & Development',
        intro: 'A pixel-perfect Webflow site built around your brand, your content, and the customers you want to win.',
        points: [
          { title: 'Bespoke Design, No Templates', text: 'Every layout is crafted for your brand and audience, so your site feels unmistakably yours on every screen size.' },
          { title: 'Powerful Webflow CMS', text: 'Blogs, case studies, team pages, and product collections set up so your team can add and edit content in minutes.' },
          { title: 'Clean, Scalable Build', text: 'A tidy class system and reusable components that keep your site fast today and easy to extend as you grow.' },
        ],
      },
      {
        title: 'Framer Website Design',
        intro: 'Striking, animation-rich Framer sites for launches, startups, and brands that want to stand out from the first scroll.',
        points: [
          { title: 'Motion That Tells Your Story', text: 'Smooth scroll effects, interactions, and micro-animations that guide visitors and make your brand memorable.' },
          { title: 'Launch-Ready in Weeks', text: 'Ideal for landing pages, product launches, and marketing sites where speed to market really matters.' },
          { title: 'Easy Visual Editing', text: 'Update copy, images, and pages yourself in Framer\'s visual editor, with no code and no waiting on a developer.' },
        ],
      },
      {
        title: 'Figma to Webflow & Framer',
        intro: 'Already have a design? We turn your Figma files into a live, fully responsive website that stays true to every detail.',
        points: [
          { title: 'Faithful to Your Design', text: 'Spacing, typography, colours, and interactions recreated precisely, so what you approved is exactly what goes live.' },
          { title: 'Responsive on Every Device', text: 'Thoughtful tablet and mobile layouts, even when the design file only covers desktop.' },
          { title: 'Smooth Hand-Off', text: 'A walkthrough and simple guide so your team feels confident managing the site from day one.' },
        ],
      },
      {
        title: 'Website Migration to Webflow or Framer',
        intro: 'Move from WordPress, Wix, or Squarespace to a modern no-code platform without losing traffic or content.',
        points: [
          { title: 'Content & CMS Migration', text: 'Pages, blog posts, and collections moved across carefully, with structure and formatting kept intact.' },
          { title: 'SEO Protected', text: '301 redirects, metadata, and URL mapping handled so your search rankings carry over to the new site.' },
          { title: 'Zero-Drama Launch', text: 'Domain, DNS, forms, and analytics configured and tested before the switch, so launch day feels effortless.' },
        ],
      },
      {
        title: 'SEO, Performance & Ongoing Support',
        intro: 'A great website keeps working for you long after launch. We help it rank, convert, and keep improving.',
        points: [
          { title: 'Technical SEO Foundations', text: 'Semantic structure, meta tags, schema, sitemaps, and Open Graph set up properly from the start.' },
          { title: 'Fast Core Web Vitals', text: 'Optimised images, fonts, and scripts for quick load times that visitors and search engines reward.' },
          { title: 'Integrations & Care Plans', text: 'Forms, CRM, analytics, and booking tools connected, plus ongoing updates and new pages whenever you need them.' },
        ],
      },
    ],
  },
};
