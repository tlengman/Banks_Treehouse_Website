import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'The Treehouse',
      href: getPermalink('/the-treehouse'),
    },
    {
      text: 'Gallery',
      href: getPermalink('/gallery'),
    },
    {
      text: 'Experience',
      href: getPermalink('/experience'),
    },
    {
      text: 'FAQ',
      href: getPermalink('/faq'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [
    {
      text: 'Book on Airbnb',
      href: 'https://www.airbnb.com/rooms/1110989650136663921',
      target: '_blank',
      icon: 'tabler:brand-airbnb',
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Quick Links',
      links: [
        { text: 'The Treehouse', href: getPermalink('/the-treehouse') },
        { text: 'Gallery', href: getPermalink('/gallery') },
        { text: 'Experience', href: getPermalink('/experience') },
        { text: 'FAQ', href: getPermalink('/faq') },
      ],
    },
    {
      title: 'Contact',
      links: [
        { text: 'info@bankstreehouse.com', href: 'mailto:info@bankstreehouse.com' },
        {
          text: 'View on Airbnb',
          href: 'https://www.airbnb.com/rooms/1110989650136663921',
        },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    {
      ariaLabel: 'Airbnb',
      icon: 'tabler:brand-airbnb',
      href: 'https://www.airbnb.com/rooms/1110989650136663921',
    },
  ],
  footNote: `
    &copy; ${new Date().getFullYear()} Banks Treehouse. All rights reserved.
  `,
};
