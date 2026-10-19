import {
  flag,
  type ContentValue,
  type MenuNode,
  type NavNode,
  type LinkItem,
  type SeoMeta,
} from '@datagateways/shared';

export interface SocialLink {
  readonly label: string;
  readonly href: ContentValue<string>;
  readonly icon: 'linkedin' | 'instagram' | 'facebook';
}

export interface ContactBlock {
  readonly organisation: string;
  readonly addressLines: readonly ContentValue<string>[];
  readonly phone: ContentValue<string>;
  readonly email: ContentValue<string>;
}

/**
 * Switches the copy deck asks for by name. Each one exists because the deck says a section should
 * be cut or replaced rather than shipped with invented content.
 */
export const features = {
  /** Copy deck: "If fewer than four items exist, cut this page and drop the Resources nav item." */
  resources: false,
  /** false renders the TrustBand fallback instead of the four placeholder counters. */
  counters: true,
  /** Copy deck: "If no articles exist yet, cut this section at launch." */
  latest: true,
} as const;

/*
 * The information architecture of data-gateways.com, kept item for item: Home, Product (with
 * DataNerve opening a third level), Services, Partner Program, About Us. Only the presentation
 * is this design's — the labels and their nesting are the client's own.
 *
 * Every node carries an href, including the ones that open a panel. A parent that only opens on
 * hover is unreachable by keyboard and on touch, so "Product" resolves to the platform overview
 * and "DataNerve" to its own page.
 *
 * Resources stays behind its flag. The copy deck's instruction is "cut this page AND drop the
 * nav item", so both navs are derived from the flag rather than written out — listing them
 * separately is how one gets cut and the other does not, leaving a nav item that 404s.
 */
const PRIMARY_NAV: readonly NavNode[] = [
    { label: 'Home', href: '/' },
    {
      label: 'Product',
      href: '/products',
      children: [
        {
          label: 'DataNerve',
          href: '/products/datanerve',
          summary: 'Governance, quality and security as one operating model',
          children: [
            { label: 'Data Governance', href: '/products/datanerve/governance' },
            { label: 'Data Security Posture Management', href: '/products/datanerve/dspm' },
            { label: 'Data Loss Prevention', href: '/products/datanerve/dlp' },
          ],
        },
        {
          label: 'AINerve',
          href: '/products/ainerve',
          summary: 'Real-time governance for enterprise AI and LLMs',
        },
        {
          label: 'SOCMINT',
          href: '/products/socmint',
          summary: 'Public information turned into structured insight',
        },
      ],
    },
    {
      label: 'Services',
      href: '/services',
    },
    {
      label: 'Partner Program',
      href: '/partners/find',
      children: [
        { label: 'Find a Partner', href: '/partners/find', summary: 'Delivery and resale, by region' },
        { label: 'Become a Partner', href: '/partners/become-partner', summary: 'Apply to the programme' },
        { label: 'Login as Partner', href: '/partners/login', separated: true },
      ],
    },
    ...(features.resources ? [{ label: 'Resources', href: '/resources' }] : []),
    { label: 'About Us', href: '/about' },
];

export const site = {
  name: 'DataGateways',
  wordmark: 'DATAGATEWAYS',
  url: 'https://datagateways.net',

  logo: {
    src: '/logo/datagateways-mark.png',
    /* Empty by design: the wordmark beside it already carries the name, so alt text here would
       make a screen reader say "DataGateways" twice in the same link. */
    alt: '',
  },

  seoDefaults: {
    title: 'DataGateways | Data Security, Artificial Intelligence and Data Governance',
    description:
      'Securing data Powering AI Building tomorrow. DataNerve governs and secures enterprise data, AINerve governs how models consume it, and SOCMINT turns open-source signal into verified intelligence.',
  } satisfies SeoMeta,

  nav: {
    primary: PRIMARY_NAV,

    /**
     * The fullscreen overlay, derived from the same tree the header uses rather than repeated as a
     * flat list beside it. The flat version carried only the top level, so on a phone /products
     * was reachable and the three products under it were not — along with the capability pages,
     * AI Services and two of the three partner pages. Eight destinations, invisible on mobile,
     * because two nav definitions drifted apart.
     *
     * Contact is appended because it is the CTA's destination rather than a nav item, and the
     * overlay is the only place on a phone it is otherwise reachable from.
     */
    menu: [...PRIMARY_NAV, { label: 'Contact', href: '/contact' }].map((item, index) => ({
      ...item,
      index: String(index + 1).padStart(2, '0'),
    })) satisfies readonly MenuNode[],
  },

  cta: {
    primary: { label: 'Request a Demo', href: '/contact#enquiry' } satisfies LinkItem,
  },

  /*
   * Real, and taken from datagateways.net rather than drafted. These replace the invented London
   * address and the deliberately-unreachable Ofcom fiction number that stood in before the client
   * supplied the live site.
   */
  contact: {
    organisation: 'DataGateways Inc.',
    addressLines: [flag.verified('Texas'), flag.verified('USA')],
    phone: flag.verified('+1 (872) 284-2859'),
    email: flag.verified('info@datagateways.net'),
  } satisfies ContactBlock,

  /**
   * The client's own footer, column for column, as it stands on datagateways.net: Solutions,
   * Partner Program, Company, Contact, Follow Us, then the legal row.
   */
  footer: {
    locationLine:
      'Securing enterprise data infrastructure and powering autonomous AI governance with kernel-level zero-trust performance.',
    tagline: 'SECURING DATA • POWERING AI',

    solutions: [
      { label: 'DataNerve', href: '/products/datanerve' },
      { label: 'AINerve', href: '/products/ainerve' },
      { label: 'SOCMINT', href: '/products/socmint' },
    ] satisfies readonly LinkItem[],

    partner: [
      { label: 'Find a Partner', href: '/partners/find' },
      { label: 'Become a Partner', href: '/partners/become-partner' },
      { label: 'Partner Login', href: '/partners/login' },
    ] satisfies readonly LinkItem[],

    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Talk to Sales', href: '/contact#enquiry' },
    ] satisfies readonly LinkItem[],

    legal: [
      { label: 'Security Disclosure', href: '/security' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ] satisfies readonly LinkItem[],

    social: [
      {
        label: 'LinkedIn',
        icon: 'linkedin',
        href: flag.verified('https://www.linkedin.com/company/data-gateways/'),
      },
      {
        label: 'Instagram',
        icon: 'instagram',
        href: flag.verified('https://www.instagram.com/data.gateways/'),
      },
      {
        label: 'Facebook',
        icon: 'facebook',
        href: flag.verified('https://www.facebook.com/share/1DT1stik3W/'),
      },
    ] satisfies readonly SocialLink[],

    copyright: '© DataGateways Inc. All rights reserved.',
    groupLabels: {
      solutions: 'Solutions',
      partner: 'Partner Program',
      company: 'Company',
      contact: 'Contact',
      social: 'Follow Us',
    },
  },

  /**
   * Interface strings. These are still user-visible copy, so they live here rather than in JSX —
   * that is the rule the whole content layer exists to enforce.
   */
  ui: {
    skipToContent: 'Skip to content',
    menuOpen: 'Menu',
    menuOpenSuffix: '+',
    menuClose: 'Close menu',
    menuLandmark: 'Main menu',
    /* Names the disclosure buttons in the mobile menu: "Product submenu, collapsed". */
    menuSubmenu: 'submenu',
    primaryNavLandmark: 'Primary',
    footerNavLandmark: 'Footer',
    homeLink: 'DataGateways home',
    explore: 'Explore',
    readArticle: 'Read article',
    viewAll: 'View all',
    scrollCue: 'Scroll',
    sectionRailLandmark: 'Page sections',
    sectionRailJump: 'Jump to',
    backToTop: 'Back to top',
    loading: 'Loading',
    contactBlockHeading: 'Get in touch',
    placeholderBadge: 'Unverified',
    placeholderBadgeTitle: 'This value is not client-verified and must not ship',
    /** Appended to a dropdown trigger's accessible name so it does not read as a bare link. */
    submenuHint: 'submenu',
    heroCardsLandmark: 'What we do',
    heroCardExpand: 'Show more',
    heroSliderLandmark: 'What we do',
    /* The counter band has no tabs; these name its one control. */
    counterPause: 'Pause the changing figures',
    counterResume: 'Resume the changing figures',
    productSwitcherLandmark: 'Choose a product',
    learnMore: 'Learn more',
    /* Labels the outcome panel under the management grid on a capability page. */
    programOutcome: 'Program outcome',
  },
} as const;

export type Site = typeof site;
