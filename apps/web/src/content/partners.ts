import type { CtaBandContent, Heading, IndexedCard, SeoMeta } from '@datagateways/shared';
import type { AnchorDef } from './home';

export const partnerAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'lead', label: 'Summary' },
  { id: 'directory', label: 'Directory' },
  { id: 'showcase', label: 'Working together' },
];

export const becomeAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'apply', label: 'Apply' },
];

export const partnerRegions = [
  'Africa',
  'Asia',
  'Europe',
  'Global',
  'Latin America & Caribbean',
  'Middle East',
  'North America',
  'Oceania',
  'South America',
] as const;

export const partners = {
  /* ------------------------------------------------------------------ Find a Partner */
  find: {
    seo: {
      title: 'Find a Partner | DataGateways',
      description:
        'Delivery, technology and reseller partners certified to implement DataNerve and AINerve, listed by region and specialism.',
    } satisfies SeoMeta,

    anchors: partnerAnchors,

    hero: {
      id: 'hero',
      eyebrow: 'Partner Program',
      heading: { roman: 'Certified to', accent: 'deliver this properly' },
      media: { image: '/media/img-partners.jpg', generative: 'lattice' as const },
    },

    lead: {
      id: 'lead',
      text: 'Our directory lists partners with certified engineers and a DataGateways deployment in production not just a signed agreement.',
    },

    directory: {
      id: 'directory',
      heading: { roman: 'Our', accent: 'partners' },
      filterLabel: 'Filter partners by region',
      emptyState: 'No partners are listed in this region yet. Talk to us and we will route you directly.',
      loadingState: 'Loading partners…',
      errorState: 'Partner directory could not be loaded. Please try again later.',
    },

    showcase: {
      id: 'showcase',
      heading: { roman: 'Certified means', accent: 'something here' },
      body: 'Certification requires named, current engineers, a production reference and an annual review against the latest release.',
      image: '/media/img-partner-certified.jpg',
      points: [
        'Named certified engineers, not a company-level badge',
        'At least one production reference deployment',
        'Annual re-assessment against the current release',
        'Escalation path directly into our own engineering team',
      ],
    },

    cta: {
      heading: { roman: 'Not sure who', accent: 'fits your project?' },
      action: { label: 'Ask us directly', href: '/contact' },
    } satisfies CtaBandContent,
  },

  /* --------------------------------------------------------------- Become a Partner */
  become: {
    seo: {
      title: 'Become a Partner | DataGateways',
      description:
        'Apply to the DataGateways partner programme for delivery, technology and reseller tiers, with certification, margin and engineering access.',
    } satisfies SeoMeta,

    anchors: becomeAnchors,

    hero: {
      id: 'hero',
      eyebrow: 'Partner Program',
      heading: { roman: 'Build on', accent: 'the control plane' },
      media: { image: '/media/art-partners.svg', generative: 'circuit' as const },
    },

    lead: {
      id: 'lead',
      text: 'We invest in a focused partner network. If your team delivers data or security work in regulated sectors, tell us about your services and customers.',
    },

    tiers: {
      id: 'tiers',
      heading: { roman: 'Three ways', accent: 'to work with us' },
      cards: [
        {
          index: '01',
          tag: 'Deliver',
          title: 'Delivery Partner',
          blurb:
            'You implement DataNerve and AINerve for your own clients. We certify your engineers, give you a sandbox tenant and stay reachable for escalation.',
        },
        {
          index: '02',
          tag: 'Integrate',
          title: 'Technology Partner',
          blurb:
            'You build a supported integration between your platform and ours. Joint reference architecture, a named engineering contact throughout, and a listing in the partner directory.',
        },
        {
          index: '03',
          tag: 'Resell',
          title: 'Reseller',
          blurb:
            'You take DataGateways to your own market under a margin agreement, with deal registration, co-marketing support and pre-sales engineering on call.',
        },
      ] satisfies readonly IndexedCard[],
    },

    process: {
      id: 'process',
      heading: { roman: 'How applying', accent: 'works' },
      intro:
        'Four steps, roughly six weeks end to end. We would rather say no in week one than three months in, so the qualifying conversation comes first.',
      steps: [
        {
          index: '01',
          title: 'Introduction',
          blurb:
            'A short call about your practice, your market and the clients you already serve. We are honest at this point about whether there is a fit.',
        },
        {
          index: '02',
          title: 'Technical Fit',
          blurb:
            'A working session with your engineers and ours against a sandbox tenant, to see how the platform sits alongside what you already deliver.',
        },
        {
          index: '03',
          title: 'Certification',
          blurb:
            'Two named engineers complete the implementation certification through a build exercise against a live environment, not a multiple-choice test.',
        },
        {
          index: '04',
          title: 'Launch',
          blurb:
            'Agreement signed, directory listing published, deal registration opened and a first joint opportunity worked together.',
        },
      ] satisfies readonly IndexedCard[],
    },

    /**
     * The application form, field for field as the client's own become-partner page asks for it.
     *
     * It posts the partner-specific fields to the backend's public partner-request endpoint, which
     * stores the application for staff review.
     */
    form: {
      id: 'apply',
      heading: { roman: 'Become a', accent: 'DataGateways partner' } satisfies Heading,
      intro: 'Fields marked with an asterisk are required.',
      legend: 'Partner programme application',
      submit: 'Submit application',
      submitting: 'Sending',
      loginPrompt: 'Already a partner?',
      loginLabel: 'Sign in',
      loginHref: '/partners/login',
      fields: {
        company: { label: 'Company name *', autoComplete: 'organization' },
        website: { label: 'Company website', autoComplete: 'url' },
        region: { label: 'Region *', placeholder: 'Select a region…' },
        country: { label: 'Country *', autoComplete: 'country-name' },
        contact: { label: 'Contact name *', autoComplete: 'name' },
        email: { label: 'Work email *', autoComplete: 'email' },
        phone: { label: 'Phone *', autoComplete: 'tel' },
        size: { label: 'Company size *', placeholder: 'Select a size…' },
        about: {
          label: 'Tell us about your business',
          hint: 'What you deliver, in which sectors, and who you already serve.',
        },
        logo: { label: 'Company logo (optional)' },
      },
      regions: partnerRegions,
      sizes: [
        '1-10 employees',
        '11-50 employees',
        '51-200 employees',
        '201-1000 employees',
        '1000+ employees',
      ],
      errors: {
        company: 'Tell us which company is applying.',
        region: 'Choose the region you operate in.',
        country: 'Tell us which country you are based in.',
        contact: 'Tell us who we should reply to.',
        email: 'Enter a work email address we can reply to.',
        phone: 'Add a phone number we can reach you on.',
        size: 'Choose your company size.',
        website: 'Enter a valid website address.',
        tooLong: 'That is longer than we can accept.',
        generic: 'That did not send. Try again, or email us directly.',
        rateLimited: 'That is a lot of applications from one place. Try again later, or email us directly.',
      },
      success: {
        heading: { roman: 'Application', accent: 'received' } satisfies Heading,
        body: 'It is with the partner team. We reply to every application, and we would rather say no in week one than three months in, so expect a straight answer either way.',
        referenceLabel: 'Reference',
        again: 'Submit another',
      },
    },

    cta: {
      heading: { roman: 'Not sure which tier', accent: 'fits your practice?' },
      action: { label: 'Talk to the partner team', href: '/contact' },
    } satisfies CtaBandContent,
  },

  /* ------------------------------------------------------------------ Partner login */
  login: {
    seo: {
      title: 'Partner Login | DataGateways',
      description:
        'Sign in to the DataGateways partner portal for deal registration, certification records, sandbox tenants and release notes.',
    } satisfies SeoMeta,

    anchors: [{ id: 'hero', label: 'Sign in' }] as readonly AnchorDef[],

    hero: {
      id: 'hero',
      eyebrow: 'Partner Program',
      heading: { roman: 'Partner', accent: 'portal' } satisfies Heading,
    },

    intro:
      'Deal registration, certification records, sandbox tenants and pre-release notes. Access is provisioned by your partner manager. It is not self-service.',

    form: {
      emailLabel: 'Work email',
      emailPlaceholder: 'you@yourcompany.com',
      passwordLabel: 'Password',
      submitLabel: 'Sign in',
      ssoLabel: 'Continue with SSO',
      forgotLabel: 'Forgotten your password?',
      forgotHref: '/contact',
    },

    /*
     * There is no authentication behind this form, and it must not pretend otherwise. Submitting
     * shows this notice instead of a failed login, so nobody types a real credential into a page
     * that cannot check one. Wire it to the real identity provider before launch.
     */
    notice:
      'Portal authentication is not connected in this build. Your partner manager can reach the portal on your behalf in the meantime, or contact us and we will route you.',

    help: {
      heading: { roman: 'No access', accent: 'yet?' } satisfies Heading,
      body: 'Portal accounts are created for certified partners as part of onboarding. If your organisation is in the programme but you cannot sign in, your partner manager can add you.',
      actions: [
        { label: 'Become a partner', href: '/partners/become-partner' },
        { label: 'Contact us', href: '/contact' },
      ],
    },
  },
} as const;

export type Partners = typeof partners;
