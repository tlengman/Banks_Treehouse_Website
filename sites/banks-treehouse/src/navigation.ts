import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
  ],
  actions: [
    {
      text: 'Book on Airbnb',
      href: 'https://www.airbnb.com/rooms/1110989650136663921',
      target: '_blank',
      icon: 'tabler:external-link',
    },
  ],
};

export const footerData = {
  links: [],
  secondaryLinks: [],
  socialLinks: [],
  footNote: `
    &copy; ${new Date().getFullYear()} Banks Treehouse. All rights reserved.
  `,
};
