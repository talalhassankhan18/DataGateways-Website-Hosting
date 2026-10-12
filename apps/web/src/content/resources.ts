import { flag, type FilterTab, type Heading, type SeoMeta } from '@datagateways/shared';
import type { AnchorDef } from './home';

export const resourcesAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'listing', label: 'Articles' },
];

export const resources = {
  seo: {
    title: 'Resources | DataGateways',
    description:
      'Guides, briefings and release notes on securing enterprise data and governing AI in regulated environments.',
  } satisfies SeoMeta,

  anchors: resourcesAnchors,

  hero: {
    id: 'hero',
    eyebrow: 'Resources',
    heading: {
      roman: 'Written for the people',
      accent: 'who have to answer for it',
    } satisfies Heading,
    lead: 'Briefings, implementation guides and release notes for security, data and compliance teams working under real regulatory pressure rather than theoretical threat models.',
  },

  listing: {
    id: 'listing',
    heading: { roman: 'Everything', accent: 'we have published' } satisfies Heading,
    tabs: [
      { id: 'all', label: 'All' },
      { id: 'briefing', label: 'Briefings' },
      { id: 'guide', label: 'Guides' },
      { id: 'release-note', label: 'Release Notes' },
      { id: 'press', label: 'Press' },
    ] satisfies readonly FilterTab[],
    readLabel: 'Read article',
    /* The copy deck cuts this page unless four real articles exist. `features.resources` is the
       switch; this is what shows if the page is on but the list comes back short. */
    emptyState: flag.verified('Nothing is published here yet.'),
    errorState: 'The article list could not be loaded. Refresh, or try again shortly.',
    loadingState: 'Loading articles',
  },
} as const;

export type Resources = typeof resources;
