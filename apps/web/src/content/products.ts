import {
  flag,
  type CtaBandContent,
  type Heading,
  type IndexedCard,
  type ProductModule,
  type SeoMeta,
  type TierCard,
} from '@datagateways/shared';
import type { AnchorDef } from './home';

export const PRODUCT_SLUGS = ['datanerve', 'ainerve', 'socmint'] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export const isProductSlug = (value: string | undefined): value is ProductSlug =>
  value !== undefined && (PRODUCT_SLUGS as readonly string[]).includes(value);

/**
 * The three product pages share one template, but not one shape.
 *
 * DataNerve is a seven-module platform with three sub-pages beneath it; AINerve is four defence
 * pillars; SOCMINT is a five-step investigation method. Forcing all three through the
 * same fixed run of sections is what produced the previous draft, where two of them carried an
 * invented integrations grid purely because the template had a slot for one.
 *
 * So the detail sections are optional and each product declares only what it actually has. The
 * fixed spine is hero → lead + stats → (detail) → CTA.
 */
export interface ProductPage {
  readonly slug: ProductSlug;
  readonly name: string;
  readonly seo: SeoMeta;
  readonly anchors: readonly AnchorDef[];
  readonly hero: {
    readonly id: string;
    readonly eyebrow: string;
    readonly heading: Heading;
    readonly media: { readonly image: string; readonly generative: 'cipher' | 'signal' | 'circuit' };
  };
  readonly lead: { readonly id: string; readonly text: string };
  /** The headline figures for this product, shown as a row beneath the lead. */
  readonly stats: readonly { readonly value: string; readonly label: string }[];
  /** Capability groups. DataNerve's eight modules, AINerve's gateway surface, SOCMINT's sources. */
  readonly modules?: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro?: string;
    readonly cards: readonly ProductModule[];
  };
  /** A numbered process. Only SOCMINT has one, and its whole credibility rests on it. */
  readonly method?: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly steps: readonly IndexedCard[];
  };
  /** Three wide cards. Used where a product divides into pillars rather than modules. */
  readonly tiers?: {
    readonly id: string;
    readonly heading: Heading;
    readonly cards: readonly TierCard[];
  };
  /** The next level of the tree. DataNerve only. */
  readonly subPages?: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly cards: readonly IndexedCard[];
  };
  readonly cta: CtaBandContent;
}

/* ------------------------------------------------------------------------ DataNerve */

const datanerve: ProductPage = {
  slug: 'datanerve',
  name: 'DataNerve',

  seo: {
    title: 'DataNerve | Data Governance, Security and Quality Platform',
    description:
      'A unified data governance, security and quality platform built on international frameworks, with scoping, discovery, classification, maturity, risk and reporting in one operating model, deployed on-premise or in sovereign cloud.',
  },

  anchors: [
    { id: 'hero', label: 'Intro' },
    { id: 'lead', label: 'Summary' },
    { id: 'modules', label: 'Modules' },
    { id: 'capabilities', label: 'Capabilities' },
  ],

  hero: {
    id: 'hero',
    eyebrow: 'Data Security Core: DataNerve',
    heading: { roman: 'Data governance and security,', accent: 'in full control' },
    media: { image: '/media/img-datanerve.jpg', generative: 'cipher' },
  },

  lead: {
    id: 'lead',
    text: 'DataNerve governs your data estate on-premise or in sovereign cloud. It connects scope, ownership, taxonomy and maturity goals to real evidence, then turns gaps into assigned work.',
  },

  stats: [
    { value: '24,104+', label: 'Predefined interpreters' },
    { value: '250', label: 'Countries & territories' },
    { value: '90+', label: 'Data quality detectors' },
    { value: '400+', label: 'Dashboard widgets' },
  ],

  modules: {
    id: 'modules',
    heading: { roman: 'Product', accent: 'Modules' },
    intro:
      'Each licensable module writes to one shared record, so a classification decision carries across the full governance programme.',
    cards: [
      {
        index: '01',
        title: 'Data Scoping',
        summary: 'Define the boundary before anyone starts scanning.',
        body: 'Set business and regulatory boundaries, select capabilities and record why they are in scope. Keep those decisions in a managed implementation plan.',
        features: ['Scope records and rationale', 'Module selection', 'Implementation guidance'],
      },
      {
        index: '02',
        title: 'Data Discovery',
        summary: 'Capture the processes, data types and flows that make up the real estate.',
        body: 'Record each process, its owner, the data it handles and how that data is shared, connecting governance intent to technical evidence.',
        features: ['Process register', 'Data types and formats', 'Owners, stewards, custodians'],
      },
      {
        index: '03',
        title: 'Data Asset Inventory',
        summary: 'A living register of critical assets and who answers for them.',
        body: 'Link each asset to its source, owner, criticality and retention, alongside related discovery, classification, quality, risk and roadmap records.',
        features: ['Asset records and lineage', 'Criticality and retention', 'Linked evidence'],
      },
      {
        index: '04',
        title: 'Classification & Referencing',
        summary: 'Turn data categories into enforceable handling decisions.',
        body: 'Apply a five-level taxonomy—from Public to Highly Restricted—using sensitivity, regulatory impact and business criticality, with confidence scores and review history.',
        features: ['Classification taxonomy', 'Handling rules', 'Documented exceptions'],
      },
      {
        index: '05',
        title: 'Governance',
        summary: 'Ownership, maturity and a roadmap that actually moves.',
        body: 'Assess evidence across five maturity levels, compare current and target states, then assign improvement initiatives with owners and priorities.',
        features: ['Maturity assessment', 'Ownership and RACI', 'Transformation roadmap'],
      },
      {
        index: '06',
        title: 'Data Quality',
        summary: 'Quality issues tied to evidence, business impact and a named owner.',
        body: 'Track six quality dimensions through detector results and remediation evidence, with issues managed from discovery through validation.',
        features: ['90+ built-in detectors', 'Issue lifecycle', 'Root cause and impact'],
      },
      {
        index: '07',
        title: 'Data Security',
        summary: 'Risk, mitigation and controls in one defensible posture.',
        body: 'Assess risk, assign mitigation owners and dates, and map controls to your frameworks. Link each risk to maturity gaps and roadmap actions.',
        features: ['Risk assessment', 'Mitigation planning', 'Controls mapping'],
      },
      {
        index: '08',
        title: 'Reports',
        summary: 'Four report depths, all grounded in project data.',
        body: 'Generate executive summaries or detailed reports from project evidence, risks, controls and roadmap actions, with human review before release.',
        features: ['Executive to deep-dive', 'Dashboards and widgets', 'Audit logs and syslog'],
      },
    ],
  },

  subPages: {
    id: 'capabilities',
    heading: { roman: 'Where DataNerve', accent: 'goes next' },
    intro:
      'Governance is available today. DSPM extends the same taxonomy and handling rules into automated discovery and policy-driven protection, and DLP carries them out to the endpoint and the network.',
    cards: [
      {
        index: '01',
        tag: 'Available now',
        title: 'Governance',
        blurb:
          'Scope, discovery, inventory, taxonomy, maturity, quality, risk and reporting form the operating model every other capability writes into.',
        href: '/products/datanerve/governance',
      },
      {
        index: '02',
        tag: 'Coming soon',
        title: 'DSPM',
        blurb:
          'Data security posture management: automated discovery, classification, access posture and exposure evidence across files, endpoints, databases, object storage and cloud.',
        href: '/products/datanerve/dspm',
      },
      {
        index: '03',
        tag: 'On the roadmap',
        title: 'DLP',
        blurb:
          'Endpoint and network discovery with masking, anonymization, encryption and NLP/ML contextualization, extending protection to where data leaves.',
        href: '/products/datanerve/dlp',
      },
    ],
  },

  cta: {
    heading: { roman: 'See it against', accent: 'your own estate' },
    action: { label: 'Request a Demo', href: '/contact' },
  },
};

/* -------------------------------------------------------------------------- AINerve */

const ainerve: ProductPage = {
  slug: 'ainerve',
  name: 'AINerve',

  seo: {
    title: 'AINerve | Real-Time AI Governance and Prompt Firewall',
    description:
      'Governance for enterprise AI: agentic guardrails, prompt firewalling, hallucination controls and model alignment filters across hosted and on-premise models, with a full audit trail.',
  },

  anchors: [
    { id: 'hero', label: 'Intro' },
    { id: 'lead', label: 'Summary' },
    { id: 'tiers', label: 'Defence' },
    { id: 'modules', label: 'Gateway' },
  ],

  hero: {
    id: 'hero',
    eyebrow: 'AI Governance Engine: AINerve',
    heading: { roman: 'Your AI, Your Data,', accent: 'On‑Prem' },
    media: { image: '/media/img-ainerve.jpg', generative: 'signal' },
  },

  lead: {
    id: 'lead',
    text: 'Intelligence is easy to buy. Control is not. AINerve puts one governed gateway between your people and every model they use.',
  },

  stats: [
    { value: '5+', label: 'Governance modules' },
    { value: '15+', label: 'Agentic workflows' },
    { value: '30 to 50%', label: 'Cost efficiency gain' },
    { value: '<3s', label: 'Response time' },
  ],

  tiers: {
    id: 'tiers',
    heading: { roman: 'Defence across', accent: 'the whole AI lifecycle' },
    cards: [
      {
        index: '01',
        title: 'Keep It Private',
        sentence: 'Your data stays yours, even inside the AI.',
        bullets: [
          flag.verified('Sensitive values are stripped from the response stream as it’s generated'),
          flag.verified('PII is masked by default, and every answer is scanned before delivery'),
          flag.verified('Each company gets its own schema, vector store and encryption keys'),
          flag.verified('Hosted or fully on-premise, your choice'),
        ],
      },
      {
        index: '02',
        title: 'One Rulebook',
        sentence: 'Every model. Every app. The same rules.',
        bullets: [
          flag.verified('One governed endpoint in front of every hosted and self-hosted model'),
          flag.verified('Add or swap a model without rewriting a single policy'),
          flag.verified('Fallback, load balancing and rate limits are built in'),
          flag.verified('Requests are routed by capability and budget, so small jobs don’t hit oversized models'),
        ],
      },
      {
        index: '03',
        title: 'Trusted Agents',
        sentence: 'AI that acts, within limits you set.',
        bullets: [
          flag.verified('15+ prebuilt workflows, each with its own permission scope and tool allow-list'),
          flag.verified('Access follows role and department, so unauthorised documents never reach the model'),
          flag.verified('If access can’t be confirmed, the answer is no'),
          flag.verified('An immutable log records who accessed what, when and why'),
        ],
      },
    ],
  },

  modules: {
    id: 'modules',
    heading: { roman: 'One gateway,', accent: 'every model' },
    intro:
      'AINerve presents a single governed endpoint in front of the models your teams already use, so policy does not have to be rewritten per provider and a change of model is not a change of control.',
    cards: [
      {
        index: '01',
        title: 'Grounded Document Intelligence',
        summary: '',
        body: "Answers are generated from an organization's own uploaded material — policies, contracts, reports, and files — with each response citing the source document and section it was drawn from.",
        features: [],
      },
      {
        index: '02',
        title: 'Database Abstraction Layer',
        summary: '',
        body: "Connects directly to a client's existing SQL, NoSQL, or data-warehouse systems through a secure, outbound-only connector, allowing the platform to reason over live business data without migration.",
        features: [],
      },
      {
        index: '03',
        title: 'Configurable Agent Library',
        summary: '',
        body: 'Fifteen pre-built agents are available at launch, covering document review, report drafting, contract and compliance review, invoice processing, resume screening, support triage, and related tasks.',
        features: [],
      },
      {
        index: '04',
        title: 'No-Code Workflow Automation',
        summary: '',
        body: 'Individual agents can be composed into multi-step workflows through a visual builder, with manual, scheduled, or event-based triggers and optional human-approval checkpoints.',
        features: [],
      },
    ],
  },

  cta: {
    heading: { roman: 'Put your own prompts', accent: 'through it' },
    action: { label: 'Request a Demo', href: '/contact' },
  },
};

/* -------------------------------------------------------------------------- SOCMINT */

const socmint: ProductPage = {
  slug: 'socmint',
  name: 'SOCMINT',

  seo: {
    title: 'SOCMINT | Social Media and Digital Footprint Intelligence',
    description:
      'A structured framework for collecting, verifying and reporting on publicly available digital information, supporting due diligence, fraud prevention, brand protection and risk assessment.',
  },

  anchors: [
    { id: 'hero', label: 'Intro' },
    { id: 'lead', label: 'Summary' },
    { id: 'method', label: 'Methodology' },
    { id: 'modules', label: 'Sources' },
  ],

  hero: {
    id: 'hero',
    eyebrow: 'Social Media & Digital Footprint Intelligence: SOCMINT',
    heading: { roman: 'Turn public information', accent: 'into structured insight' },
    media: { image: '/media/img-socmint.jpg', generative: 'circuit' },
  },

  lead: {
    id: 'lead',
    text: 'SOCMINT builds evidence-based profiles from public social media, records, public reports and other open sources. Used responsibly, it supports due diligence, fraud prevention, brand protection and risk assessment.',
  },

  stats: [
    { value: '<3s', label: 'Response time' },
    { value: '15+', label: 'Social platforms' },
    { value: '500M+', label: 'Records monitored' },
  ],

  method: {
    id: 'method',
    heading: { roman: 'The five-step', accent: 'methodology' },
    intro:
      'Findings are collected across different sources and organized into investigation-ready results, with a single interface from first identifier to final network map',
    steps: [
      {
        index: '01',
        title: 'Scope & Identify',
        blurb:
          'Define the subject and the lawful basis for the inquiry, then collect known identifiers such as name, username, email and phone.',
      },
      {
        index: '02',
        title: 'Collect',
        blurb:
          'Query open sources systematically: social platforms, public records, public reports, and technical or domain data.',
      },
      {
        index: '03',
        title: 'Correlate',
        blurb:
          'Cross-reference identifiers across sources to link accounts and data points to a single subject.',
      },
      {
        index: '04',
        title: 'Verify',
        blurb:
          'Corroborate each finding against at least two independent sources, and flag every single-source claim as such.',
      },
      {
        index: '05',
        title: 'Report',
        blurb:
          'Compile a consolidated, source-cited report with confidence ratings and clearly stated limitations.',
      },
    ],
  },

  modules: {
    id: 'modules',
    heading: { roman: 'Six capabilities,', accent: 'one investigation' },
    intro:
      'A connected investigation surface for profiling identities, tracing activity, mapping relationships and adding asset context.',
    cards: [
      {
        index: '01',
        title: 'Target Profiling',
        summary: 'Start with one identifier. End with a full digital identity.',
        body: 'Enter a username, email address or phone number. SOCMINT correlates it across supported platforms and surfaces related accounts, profiles and records, so you start with one lead and end with a structured picture of the target.',
        features: [],
      },
      {
        index: '02',
        title: 'Social Media Footprint',
        summary: 'Find the accounts people forget they have.',
        body: 'Coverage goes beyond Facebook, Twitter, Instagram, SnapChat and TikTok to services such as Fitbit, Dropbox, Quora, Medium, Adobe, Yelp and Trello. These often carry associations that main social profiles do not show.',
        features: [],
      },
      {
        index: '03',
        title: 'Tweetyzer',
        summary: 'See what a target does and what the crowd feels, as it happens.',
        body: 'Track recent activity and tweet feeds to spot changes over time. Classify public hashtag conversations as positive, negative or neutral to catch sentiment shifts and activity spikes, and link them to identified accounts where the data allows.',
        features: [],
      },
      {
        index: '04',
        title: 'Interactive Network Graph',
        summary: 'Do not just find accounts. See how they connect.',
        body: 'Targets, accounts and discovered entities appear as a drill-down relationship map. It reveals possible links and the wider network around a target that a list of results would hide.',
        features: [],
      },
      {
        index: '05',
        title: 'Historical Intelligence',
        summary: 'Recover what current profiles no longer show.',
        body: 'Historical records and breach-repository data like passwords, where available, help establish links and surface information that has been deleted or hidden from a target’s public profile.',
        features: [],
      },
      {
        index: '06',
        title: 'Asset Info',
        summary: 'From identity to ownership: the assets behind the name.',
        body: 'A standalone asset-intelligence capability that adds vehicle and property information to your investigation. It runs independently of the core identity workflow, so you can add asset context to a case or start from the asset itself.',
        features: [],
      },
    ],
  },

  cta: {
    heading: { roman: 'Scope an inquiry', accent: 'with our analysts' },
    action: { label: 'Request a Demo', href: '/contact' },
  },
};

export const products: Record<ProductSlug, ProductPage> = { datanerve, ainerve, socmint };
