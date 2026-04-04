import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Services',
      links: [
        {
          text: 'All Services',
          href: getPermalink('/services'),
        },
        {
          text: 'Handyman Services',
          href: getPermalink('/services/handyman'),
        },
        {
          text: 'Plumbing',
          href: getPermalink('/services/plumbing'),
        },
        {
          text: 'Electrical',
          href: getPermalink('/services/electrical'),
        },
        {
          text: 'Painting',
          href: getPermalink('/services/painting'),
        },
        {
          text: 'Remodeling',
          href: getPermalink('/services/remodeling'),
        },
        {
          text: 'Seasonal Maintenance',
          href: getPermalink('/services/seasonal-maintenance'),
        },
      ],
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'FAQ',
      href: getPermalink('/faq'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [{ text: 'Get Free Estimate', href: getPermalink('/get-estimate'), icon: 'tabler:clipboard-check' }],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'Handyman', href: getPermalink('/services/handyman') },
        { text: 'Plumbing', href: getPermalink('/services/plumbing') },
        { text: 'Electrical', href: getPermalink('/services/electrical') },
        { text: 'Painting', href: getPermalink('/services/painting') },
        { text: 'Remodeling', href: getPermalink('/services/remodeling') },
        { text: 'Seasonal Maintenance', href: getPermalink('/services/seasonal-maintenance') },
      ],
    },
    {
      title: 'Service Areas',
      links: [
        { text: 'Boise', href: getPermalink('/services') },
        { text: 'Meridian', href: getPermalink('/services') },
        { text: 'Eagle', href: getPermalink('/services') },
        { text: 'Nampa', href: getPermalink('/services') },
        { text: 'Caldwell', href: getPermalink('/services') },
        { text: 'Star', href: getPermalink('/services') },
        { text: 'Kuna', href: getPermalink('/services') },
      ],
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', href: getPermalink('/about') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Contact', href: getPermalink('/contact') },
        { text: 'FAQ', href: getPermalink('/faq') },
      ],
    },
    {
      title: 'Get Started',
      links: [
        { text: 'Get a Free Estimate', href: getPermalink('/get-estimate') },
        { text: 'Call Us: (208) XXX-XXXX', href: 'tel:+1208XXXXXXX' },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    { ariaLabel: 'Google Business', icon: 'tabler:brand-google', href: '#' },
    { ariaLabel: 'Nextdoor', icon: 'tabler:home-heart', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    &copy; 2026 Boise Home Services. Serving the Treasure Valley with pride. All rights reserved.
  `,
};
