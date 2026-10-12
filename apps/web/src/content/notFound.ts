import { type Heading, type LinkItem, type SeoMeta } from '@datagateways/shared';

export const notFound = {
  seo: {
    title: 'Page not found | DataGateways',
    description: 'That link does not point at anything on this site.',
  } satisfies SeoMeta,

  eyebrow: 'Error 404',
  heading: { roman: 'This page', accent: 'doesn’t exist' } satisfies Heading,
  body: 'Nothing here was encrypted, redacted or blocked. The link is simply wrong.',
  action: { label: 'Back to home', href: '/' } satisfies LinkItem,
} as const;

export type NotFound = typeof notFound;
