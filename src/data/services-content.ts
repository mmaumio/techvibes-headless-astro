// Content of the six service pages, taken from the live WordPress pages.

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

  'digital-marketing': {
    slug: 'digital-marketing',
    eyebrow: 'Digital Marketing',
    title: 'Digital Marketing That Drives Traffic, Builds Trust, and Increases Sales',
    metaDescription: 'Blog writing, video marketing, visual content, content repurposing and AI-powered content generation from TechVibes IT.',
    sections: [
      {
        title: 'Blog Writing & Optimization',
        intro: 'Craft compelling, SEO-friendly blog content to boost organic traffic and engage your target audience effectively.',
        points: [
          { title: 'SEO Keyword Integration', text: 'Strategic placement of high-value keywords to enhance search visibility.' },
          { title: 'Engaging Content Creation', text: 'Well-researched and captivating blogs to keep readers hooked.' },
          { title: 'Performance Tracking & Refinement', text: 'Regular analysis and updates to maximize reach and impact.' },
        ],
      },
      {
        title: 'Video Marketing',
        intro: "Capture your audience's attention with engaging video content optimized for YouTube, TikTok, and social media platforms.",
        points: [
          { title: 'Creative Scripting & Storyboarding', text: 'Craft compelling narratives that resonate with your target audience.' },
          { title: 'Platform-Specific Optimization', text: 'Tailor videos for YouTube SEO, TikTok trends, and social media algorithms.' },
          { title: 'Analytics & Performance Tracking', text: 'Monitor views, engagement, and conversions to refine video strategies.' },
        ],
      },
      {
        title: 'Infographic & Visual Content Creation',
        intro: "Enhance your brand's visual presence with custom-designed infographics and shareable graphics optimized for social media and websites.",
        points: [
          { title: 'Custom Infographics', text: 'Tailored designs that simplify complex information and engage your audience.' },
          { title: 'Social Media Graphics', text: 'Eye-catching visuals that boost engagement and shareability across platforms.' },
          { title: 'Website Visual Content', text: "Professionally designed banners, headers, and graphics that align with your brand's messaging and aesthetic." },
        ],
      },
      {
        title: 'Content Repurposing',
        intro: "Maximize your content's reach by transforming blogs into engaging videos, podcasts, or social media posts to capture diverse audiences.",
        points: [
          { title: 'Video Creation', text: 'Convert written content into dynamic videos to engage visual learners and boost social media presence.' },
          { title: 'Podcast Production', text: "Turn blogs into podcasts for on-the-go listeners, expanding your content's reach through audio platforms." },
          { title: 'Social Media Posts', text: 'Extract key insights from blogs to create shareable posts, driving more engagement and interaction.' },
        ],
      },
      {
        title: 'AI-Powered Content Generation',
        intro: 'Leverage cutting-edge AI tools for efficient, automated content creation that aligns with your brand and engages your audience.',
        points: [
          { title: 'Automated Content Creation', text: 'AI-driven tools to generate high-quality, relevant content quickly and consistently.' },
          { title: 'Customization & Personalization', text: "Tailor content to fit your brand's voice and audience preferences for maximum impact." },
          { title: 'SEO Optimization', text: 'Ensure your content is optimized for search engines with automated keyword suggestions and structure adjustments.' },
        ],
      },
    ],
  },
};
