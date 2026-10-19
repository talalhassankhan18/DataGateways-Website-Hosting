import { flag, type CounterItem, type Heading, type IndexedCard, type SeoMeta } from '@datagateways/shared';

export interface AnchorDef {
  readonly id: string;
  readonly label: string;
}

/** One rotation of the hero. Each names a capability area the client sells. */
export interface HeroSlide {
  readonly id: string;
  readonly index: string;
  /**
   * What the hero cell shows.
   *
   * There used to be an `eyebrow` beside this holding the full name, shown as a tag inside the
   * opened cell — but every slide set the two to the same string, so the cell printed its own
   * title twice. The eyebrow is gone and this is the single name for the area.
   *
   * The cells are held level by a line reservation on the title (`.hero-card__title`
   * `min-height` in styles/index.css), currently four lines, which is what the longest of these
   * needs at the narrowest desktop width. A longer title than those here would wrap past that
   * and leave the strip ragged along the top again.
   */
  readonly shortTitle: string;
  readonly heading: Heading;
  readonly blurb: string;
  readonly href: string;
}

/** One sector in the marquee. The note is what stops the row reading as six empty boxes. */
export interface SectorTile {
  readonly name: string;
  readonly icon: 'banking' | 'healthcare' | 'government' | 'energy' | 'telecom' | 'insurance';
  readonly note: string;
}

/**
 * One panel of the counter band: a product, its headline, and its figures.
 *
 * The headline belongs to the group rather than to the band, because the band has no tabs — the
 * headline changing is how you know the panel did.
 */
export interface CounterGroup {
  readonly id: string;
  readonly label: string;
  readonly heading: Heading;
  readonly items: readonly CounterItem[];
}

export const homeAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'products', label: 'Products' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'industries', label: 'Industries' },
];

export const home = {
  seo: {
    title: 'DataGateways | Data Security, AI and Digital Intelligence',
    description:
      'Your trusted partner in Data Security and Artificial Intelligence. DataNerve governs and secures enterprise data, AINerve powers AI, SOCMINT turns open-source signal into intelligence.',
  } satisfies SeoMeta,

  anchors: homeAnchors,

  /**
   * The hero rotates through the five capability areas the client leads with. Each slide is a
   * destination in its own right, so the rotation is a summary of the offering rather than a
   * carousel of decoration.
   */
  hero: {
    id: 'hero',
    tagline: 'Securing Data Powering AI Building Tomorrow',
    welcome: 'Welcome to DataGateways',
    lead: 'Your trusted partner in Data Security and Artificial Intelligence.',

    media: {
      poster: '/media/hero-home-poster.jpg',
      sources: [
        { src: '/media/hero-home.webm', type: 'video/webm' },
        { src: '/media/hero-home.mp4', type: 'video/mp4' },
      ],
      generative: 'network' as const,
    },

    slides: [
      {
        id: 'governance',
        index: '01',
        shortTitle: 'Data Governance',
        heading: { roman: 'Convert frameworks into', accent: 'data Intelligence' } satisfies Heading,
        /* Management's wording, supplied 19 Oct. Replaces the sentence trimmed here on 12 Oct —
           that trim was made to level the card heights and is the reversion the 19 Oct email is
           about, so the copy is authoritative now and the layout accommodates it rather than the
           other way round. */
        blurb:
          'DataNerve operationalizes data governance frameworks by translating organizational data into measurable governance, quality, classification, security and compliance controls.',
        href: '/products/datanerve/governance',
      },
      {
        id: 'dspm',
        index: '02',
        shortTitle: 'Data Security Posture Management',
        heading: { roman: 'Discovery classification', accent: 'Posture management' } satisfies Heading,
        blurb:
          'Discovery,classififcation,access posture and exposure evidence with controlled remidiations through an agent and Ai based model with unified risk posture.',
        href: '/products/datanerve/dspm',
      },
      {
        id: 'ai',
        index: '03',
        shortTitle: 'Artificial Intelligence',
        heading: { roman: 'AI that keep data', accent: 'within your organization' } satisfies Heading,
        blurb:
          'On-prem AI Tool Which brings agentic workflows integrated into your organization with the policy.',
        href: '/products/ainerve',
      },
      {
        id: 'socmint',
        index: '04',
        shortTitle: 'Social Media Intelligence',
        heading: { roman: 'Open source signal', accent: 'turned into social media intelligence' } satisfies Heading,
        blurb:
          'More than fifteen platforms and half a billion records, returns a prioritised finding rather than a keyword firehose.',
        href: '/products/socmint',
      },
      {
        id: 'consultancy',
        index: '05',
        shortTitle: 'Consultancy',
        heading: { roman: 'Experience and knowledge', accent: 'to deliver' } satisfies Heading,
        blurb:
          'Your expert partner for delivering data security governance, AI and social media intelligence at your door step.',
        href: '/services/data',
      },
    ] satisfies readonly HeroSlide[],
  },

  /** The three products, in the client's own words from their site. */
  products: {
    id: 'products',
    heading: { roman: 'Our', accent: 'Products' } satisfies Heading,
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
   * The counter band, as a slider over the three products.
   *
   * No tabs. The panel advances on a five-second dwell and the headline advances with it, which is
   * both the client's brief and the thing that makes a band without controls legible — a set of
   * figures that changes under a fixed title reads as a glitch, and one that changes under its own
   * title reads as a new subject.
   *
   * `heading` here is the band's stable accessible name and is never shown; the visible headline is
   * whichever group is up. See CounterSlider, which also carries the full figure set for assistive
   * tech so nothing is gated behind a fifteen-second wait.
   *
   * Every figure is the client's own. Where one also appears in the product switcher above or on a
   * product page, the two must agree — they are the same claim in two places, and a visitor who
   * spots them disagreeing has no way to know which is true.
   */
  counters: {
    id: 'numbers',
    heading: { roman: 'The numbers', accent: 'behind DataGateways' } satisfies Heading,
    groups: [
      {
        id: 'datanerve',
        label: 'DataNerve',
        heading: { roman: 'Every identifier,', accent: 'every jurisdiction' } satisfies Heading,
        /* Order fixed by management, 19 Oct: detectors, regions, countries, interpreters. That
           also satisfies the separate instruction to list Regions before Countries. */
        items: [
          { value: flag.verified('90+'), label: 'Data Quality Detectors' },
          { value: flag.verified('9+'), label: 'Regions Covered' },
          { value: flag.verified('250'), label: 'Countries & Territories' },
          { value: flag.verified('24,000+'), label: 'Predefined\u00a0Interpreters' },
        ],
      },
      {
        id: 'ainerve',
        label: 'AINerve',
        heading: { roman: 'Governed,', accent: 'and still fast' } satisfies Heading,
        items: [
          { value: flag.verified('5+'), label: 'Governance Modules' },
          { value: flag.verified('15+'), label: 'Agentic Workflows' },
          /* Matches the AINerve page, where management replaced the cost-efficiency claim on
             19 Oct. Leaving it here would have the homepage and the product page stating
             different things about the same product. */
          { value: flag.verified('100%'), label: 'On\u2011Prem\u00a0Data\u00a0Processing' },
          { value: flag.verified('<3s'), label: 'Response Time' },
        ],
      },
      {
        id: 'socmint',
        label: 'SOCMINT',
        heading: { roman: 'Half a billion records,', accent: 'one subject' } satisfies Heading,
        items: [
          { value: flag.verified('15+'), label: 'Social Platforms' },
          { value: flag.verified('500M+'), label: 'Records Monitored' },
          { value: flag.verified('<3s'), label: 'Response Time' },
        ],
      },
    ] satisfies readonly CounterGroup[],
  },

  trustBand: {
    id: 'numbers',
    heading: { roman: 'Aligned to', accent: 'the frameworks you report on' } satisfies Heading,
    marks: [
      flag.verified('GDPR'),
      flag.verified('Saudi PDPL'),
      flag.verified('HIPAA'),
      flag.verified('PCI DSS'),
      flag.verified('ISO 27001'),
      flag.verified('NIST'),
    ],
  },

  marquee: {
    id: 'industries',
    heading: { roman: 'Built for', accent: 'regulated industries' } satisfies Heading,
    tiles: [
      { name: 'Banking', icon: 'banking', note: 'PCI DSS, SAMA, PDPL' },
      { name: 'Healthcare', icon: 'healthcare', note: 'PHI and HIPAA' },
      { name: 'Government', icon: 'government', note: 'Air-gapped and on-premise' },
      { name: 'Energy', icon: 'energy', note: 'OT and critical infrastructure' },
      { name: 'Telecommunications', icon: 'telecom', note: 'Subscriber data at scale' },
      { name: 'Insurance', icon: 'insurance', note: 'Claims and policyholder PII' },
    ] satisfies readonly SectorTile[],
  },

} as const;

export type Home = typeof home;
