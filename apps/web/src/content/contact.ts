import type { ContactBranch, Heading, LinkItem, SeoMeta } from '@datagateways/shared';
import type { AnchorDef } from './home';

/** One reason for getting in touch. Four of these, as chips at the top of the form. */
export interface EnquiryBranch {
  readonly id: ContactBranch;
  readonly index: string;
  readonly title: string;
  readonly line: string;
}

/** An optional refinement of a branch, offered as a select once the branch is chosen. */
export interface EnquiryRefinement {
  readonly label: string;
  readonly placeholder: string;
  readonly options: readonly { readonly id: string; readonly title: string }[];
}

/** What the page says once it knows which team the enquiry is for. */
export interface BranchNote {
  readonly body: string;
  readonly secondary: LinkItem;
}

export const contactAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'location', label: 'Location' },
];

export const contact = {
  seo: {
    title: 'Contact DataGateways',
    description: 'Tell us what you’re protecting and we’ll route you to the right team.',
  } satisfies SeoMeta,

  anchors: contactAnchors,

  hero: {
    id: 'hero',
    eyebrow: 'Contact',
    heading: { roman: 'Tell us what', accent: 'you’re protecting' } satisfies Heading,
    media: { image: '/media/hero-contact.svg', generative: 'architecture' as const },
  },

  /**
   * One screen, not three.
   *
   * This was a three-step wizard: choose an intent, choose a refinement, and only then see the
   * form. Three screens and two full-page transitions before a visitor on a contact page could
   * type their name — on the one page where the whole job is to lower the barrier to writing to
   * you.
   *
   * The two questions were worth asking; making them gates was not. The intent is now four chips
   * at the top of the form, and the refinement is an optional select that appears beside them
   * once a chip is picked. Same routing information, one screen, one required click.
   */
  enquiry: {
    id: 'enquiry',
    heading: { roman: 'Tell us what', accent: 'you need' } satisfies Heading,
    intro:
      'One form, and it reaches a person. Pick what this is about so it lands with the right team, and tell us as much or as little as you like.',

    branchLabel: 'What brings you here?',
    branchLegend: 'Choose the closest match so your message is routed to the right team',

    branches: [
      {
        id: 'evaluate',
        index: '01',
        title: 'Evaluate the platform',
        line: 'See DataNerve, AINerve or SOCMINT against your own environment',
      },
      {
        id: 'partner',
        index: '02',
        title: 'Partner with us',
        line: 'Integrations, resale and joint delivery',
      },
      {
        id: 'support',
        index: '03',
        title: 'Get support',
        line: 'Existing deployment, account or security question',
      },
      {
        id: 'careers',
        index: '04',
        title: 'Join the team',
        line: 'Open roles and speculative applications',
      },
    ] satisfies readonly EnquiryBranch[],

    /**
     * Optional throughout. The API requires a qualifier, so where one is not chosen the form
     * sends the branch title instead — routing still works and nobody is stopped by a question
     * they did not want to answer.
     */
    refine: {
      evaluate: {
        label: 'What are you protecting?',
        placeholder: 'Optional',
        options: [
          { id: 'data-pipelines', title: 'Data across the estate' },
          { id: 'ai-usage', title: 'AI and model usage' },
          { id: 'digital-surface', title: 'Public digital surface' },
          { id: 'all', title: 'All of it' },
        ],
      },
      partner: {
        label: 'What kind of partnership?',
        placeholder: 'Optional',
        options: [
          { id: 'technology', title: 'Technology integration' },
          { id: 'reseller', title: 'Reseller or channel' },
          { id: 'delivery', title: 'Delivery partner' },
        ],
      },
      support: {
        label: 'What do you need?',
        placeholder: 'Optional',
        options: [
          { id: 'technical', title: 'Technical issue' },
          { id: 'billing', title: 'Account or billing' },
          { id: 'vulnerability', title: 'Report a vulnerability' },
        ],
      },
      careers: {
        label: 'Where do you fit?',
        placeholder: 'Optional',
        options: [
          { id: 'engineering', title: 'Engineering' },
          { id: 'go-to-market', title: 'Go to market' },
          { id: 'other', title: 'Something else' },
        ],
      },
    } satisfies Record<ContactBranch, EnquiryRefinement>,

    /**
     * Shown beside the form once a branch is chosen.
     *
     * No per-branch mailbox. There were four -- sales@, partners@, support@ and careers@ -- all on
     * `data-gateways.com`, a domain the client does not own; the live site is datagateways.net and
     * the one address it publishes is info@. Four addresses that reach nobody, each marked
     * verified. The page now shows the real one, and the branch is carried in the message instead.
     */
    notes: {
      evaluate: {
        body: 'Our solutions engineers would rather show you the product against your own data than run a slide deck. Tell us what you are protecting and where it lives.',
        secondary: { label: 'See the products', href: '/products' },
      },
      partner: {
        body: 'We work with a small number of integration and delivery partners. A line about your organisation and what you have in mind is enough to start.',
        secondary: { label: 'Partner programme', href: '/partners/become-partner' },
      },
      support: {
        body: 'For anything time-sensitive in a running deployment, say so in the message and it will be escalated. Vulnerability reports are handled seriously and acknowledged.',
        secondary: { label: 'Find a partner', href: '/partners/find' },
      },
      careers: {
        body: 'We hire slowly and keep teams small. If nothing open matches you, send us what you would want to work on. We read every one.',
        secondary: { label: 'About DataGateways', href: '/about' },
      },
    } satisfies Record<ContactBranch, BranchNote>,
  },

  form: {
    legend: 'Your details',
    fields: {
      name: { label: 'Your name', autoComplete: 'name' },
      email: { label: 'Work email', autoComplete: 'email' },
      organisation: { label: 'Organisation', autoComplete: 'organization' },
      message: {
        label: 'Anything we should know first?',
        hint: 'A couple of lines is plenty.',
        autoComplete: 'off',
      },
      /** Honeypot. Visually hidden and hidden from assistive tech; a human never sees it. */
      website: { label: 'Website' },
    },
    submit: 'Write to us',
    submitting: 'Sending',
    success: {
      heading: { roman: 'Got it,', accent: 'that is with the right team' } satisfies Heading,
      body: 'Your message is routed and logged. Keep the reference below if you need to follow it up.',
      referenceLabel: 'Reference',
      again: 'Send another',
    },
    mailtoPrefix: 'Or email us directly:',
    errors: {
      branch: 'Choose what this is about so we can route it.',
      name: 'Tell us who you are.',
      email: 'Enter a work email address we can reply to.',
      organisation: 'Tell us which organisation you are with.',
      message: 'Add a line or two so we can route this properly.',
      tooLong: 'That is longer than we can accept.',
      generic: 'That did not send. Try again, or email us directly.',
      rateLimited: 'That is a lot of messages from one place. Try again later, or email us directly.',
    },
  },

  location: {
    id: 'location',
    heading: { roman: 'Find us', accent: 'here' } satisfies Heading,
    body: 'Visits by appointment. For anything urgent, call during working hours and we’ll point you to the right team.',
  },
} as const;

export type Contact = typeof contact;
