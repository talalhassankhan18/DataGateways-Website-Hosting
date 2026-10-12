import type { Heading, IndexedCard, ProductModule, SeoMeta } from '@datagateways/shared';
import type { AnchorDef } from './home';

export const platformAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'deployment', label: 'Deployment' },
];

export const platform = {
  seo: {
    title: 'Products | DataNerve, AINerve and SOCMINT',
    description:
      'Three products on one operating model: DataNerve governs and secures enterprise data, AINerve governs how models consume it, and SOCMINT turns open-source signal into verified intelligence.',
  } satisfies SeoMeta,

  anchors: platformAnchors,

  hero: {
    id: 'hero',
    eyebrow: 'Our Products',
    heading: { roman: 'Securing data', accent: 'Powering AI' } satisfies Heading,
    media: {
      image: '/media/img-platform.jpg',
      generative: 'circuit' as const,
    },
  },

  overview: {
    id: 'overview',
    heading: { roman: 'Three products,', accent: 'one operating model' } satisfies Heading,
    paragraphs: [
      'Many enterprises manage data security and AI separately, relying on spreadsheets to connect them. This can delay audits, hide exposure and leave AI use unsupervised.',
      'DataNerve governs enterprise data, AINerve applies policy to models and agents, and SOCMINT turns public digital signals into verified intelligence. One operating model connects the work.',
      'One platform, one control plane, one team accountable for how your organisation actually operates.',
    ],
  },

  /** The three products, in the client's own words from their site. */
  products: {
    id: 'products',
    heading: { roman: 'What you', accent: 'deploy' } satisfies Heading,
    cards: [
      {
        index: '01',
        tag: 'Data Governance & Security',
        title: 'DataNerve',
        blurb:
          ' Transforms enterprise data into governed, secure and trusted assets through intelligent data governance, security and compliance.',
        href: '/products/datanerve',
      },
      {
        index: '02',
        tag: 'Artificial Intelligence',
        title: 'AINerve',
        blurb:
          ' Enables organizations to harness Artificial Intelligence for intelligent automation, insights and business decision-making.',
        href: '/products/ainerve',
      },
      {
        index: '03',
        tag: 'Digital Intelligence',
        title: 'SOCMINT',
        blurb:
          ' Transforms social and open-source digital information into actionable intelligence for organizations and decision-makers.',
        href: '/products/socmint',
      },
    ] satisfies readonly IndexedCard[],
  },

  /**
   * The three deployment models from the customer deck. The claim that matters is the second
   * sentence of the intro: the model changes where it runs and nothing else.
   */
  deployment: {
    id: 'deployment',
    heading: { roman: 'One platform,', accent: 'three deployment models' } satisfies Heading,
    intro:
      'The experience and capabilities stay the same across all deployment models. Your choice changes where the software runs, not what it can do.',
    models: [
      {
        index: '01',
        title: 'Full On-Premises',
        summary: 'For banks, public sector and regulated enterprises.',
        body: 'Where local control of the application, the database, the reports and the evidential data is a condition of deployment rather than a preference.',
        features: ['Application and data on your infrastructure', 'Local control of reports and evidence'],
      },
      {
        index: '02',
        title: 'Air-Gapped',
        summary: 'For restricted environments with no internet access.',
        body: 'Operations remain isolated and locally administered, with no external dependency of any kind at run time.',
        features: ['No external internet dependency', 'Fully isolated, locally administered'],
      },
      {
        index: '03',
        title: 'Cloud / Private Cloud',
        summary: 'For hybrid and hosted rollouts.',
        body: 'Hybrid, private cloud and hosted models for centralised access across teams and faster expansion beyond the first business unit.',
        features: ['Centralised access across teams', 'Faster onboarding and scalable expansion'],
      },
    ] satisfies readonly ProductModule[],
  },
} as const;

export type Platform = typeof platform;
