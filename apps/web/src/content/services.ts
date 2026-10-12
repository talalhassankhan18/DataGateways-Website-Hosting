import type {
  CtaBandContent,
  Heading,
  ProductModule,
  SeoMeta,
} from '@datagateways/shared';
import type { AnchorDef } from './home';

export const SERVICE_SLUGS = ['data', 'ai'] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const isServiceSlug = (value: string | undefined): value is ServiceSlug =>
  value !== undefined && (SERVICE_SLUGS as readonly string[]).includes(value);

/**
 * One phase of an engagement: what happens, and what the client is holding at the end of it.
 *
 * `duration` is optional and currently unset on both pages. The previous draft carried week counts
 * against every phase, and nobody on the delivery side had ever quoted them — an invented timeline
 * is a commitment a prospect will hold you to on the first call.
 */
export interface EngagementPhase {
  readonly index: string;
  readonly title: string;
  readonly duration?: string;
  readonly blurb: string;
  readonly deliverable: string;
}

export interface ServicePage {
  readonly slug: ServiceSlug;
  readonly name: string;
  readonly seo: SeoMeta;
  readonly anchors: readonly AnchorDef[];
  readonly hero: {
    readonly id: string;
    readonly eyebrow: string;
    readonly heading: Heading;
    readonly media: { readonly image: string; readonly generative: 'lattice' | 'signal' };
  };
  readonly lead: { readonly id: string; readonly text: string };
  /**
   * The services themselves, in the client's own structure: an eyebrow naming what it is for, the
   * service name, a paragraph, and the four capabilities it covers.
   */
  readonly offerings: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly cards: readonly ProductModule[];
  };
  readonly engagement: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly phases: readonly EngagementPhase[];
  };
  readonly cta: CtaBandContent;
}

const serviceAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'lead', label: 'Summary' },
  { id: 'offerings', label: 'Services' },
  { id: 'engagement', label: 'Engagement' },
];

/* ---------------------------------------------------------------------- Data Services */

const dataServices: ServicePage = {
  slug: 'data',
  name: 'Data Services',

  seo: {
    title: 'Data Services | Consultancy, Discovery and DLP',
    description:
      'From strategy to enforcement: advisory engagements, sensitive-data discovery and classification, and data loss prevention, delivered by the engineers who build DataNerve.',
  },

  anchors: serviceAnchors,

  hero: {
    id: 'hero',
    eyebrow: 'Data Services',
    heading: { roman: 'Enterprise', accent: 'data services' },
    media: { image: '/media/art-discovery.svg', generative: 'lattice' },
  },

  lead: {
    id: 'lead',
    text: 'From strategy to enforcement, our team discovers, classifies and protects your data estate. Because DataNerve engineers deliver the work, your roadmap can move straight into the platform.',
  },

  offerings: {
    id: 'offerings',
    heading: { roman: 'Three services,', accent: 'one estate' },
    intro:
      'Take one or take all three. They are ordered the way the work usually runs. You cannot enforce a policy on data you have not found, and you should not go looking before you have agreed what matters.',
    cards: [
      {
        index: '01',
        title: 'Data Consultancy',
        summary: 'Strategy and roadmap.',
        body: 'Advisory engagements that turn a sprawling, ungoverned data estate into a prioritised roadmap, aligned to the frameworks your industry and your regulators actually expect.',
        features: [
          'Maturity assessment against DAMA-DMBOK, DCAM and SAMA-type frameworks',
          'Target operating model and governance charter',
          'Prioritised roadmap with owners and milestones',
          'Executive and board-level reporting support',
        ],
      },
      {
        index: '02',
        title: 'Discovery & Classification',
        summary: 'Find and tag sensitive data.',
        body: 'Locate and tag sensitive data across every source, including databases, file shares, SharePoint and cloud storage, so nothing sits ungoverned because nobody knew it was there.',
        features: [
          'Automated sensitive-data discovery at scale',
          'PII, PCI and PHI classification tagging',
          'Cross-cloud and on-premise source coverage',
          'Continuous re-scanning as data changes',
        ],
      },
      {
        index: '03',
        title: 'Data Loss Prevention',
        summary: 'Stop it leaving.',
        body: 'Active inline and endpoint controls that block sensitive data from leaving through email, cloud uploads, removable media or print, backed by real-time alerting.',
        features: [
          'Endpoint, email and cloud-upload enforcement policies',
          'Real-time blocking and quarantine of violations',
          'Removable media and print-channel controls',
          'Incident alerts routed to the owning data steward',
        ],
      },
    ],
  },

  /**
   * The five-stage programme model from the DataNerve customer deck, which is how the client
   * already describes this work internally. Phases are deliberately undated — see EngagementPhase.
   */
  engagement: {
    id: 'engagement',
    heading: { roman: 'An operating programme,', accent: 'not a static assessment' },
    intro:
      'Each stage ends in something you keep whether or not you continue to the next, and every stage writes into the same record. The assessment that produced a gap stays attached to the roadmap action that closes it.',
    phases: [
      {
        index: '01',
        title: 'Scope',
        blurb:
          'Define the business, regulatory and technical boundaries of the programme, and record why each area is in or out.',
        deliverable: 'Scope records and implementation structure',
      },
      {
        index: '02',
        title: 'Discover',
        blurb:
          'Capture the processes, data types, formats, owners, flows and business purpose that make up the real estate.',
        deliverable: 'Process register and data-type inventory',
      },
      {
        index: '03',
        title: 'Structure',
        blurb:
          'Build the asset inventory, taxonomy, handling rules, policies, RACI and documented exceptions.',
        deliverable: 'Inventory, taxonomy and handling model',
      },
      {
        index: '04',
        title: 'Assess',
        blurb:
          'Measure maturity, identify gaps, map controls to the frameworks you report on, and document the evidence behind each score.',
        deliverable: 'Maturity scores, gap analysis and control map',
      },
      {
        index: '05',
        title: 'Improve',
        blurb:
          'Convert the gaps into assigned roadmap actions with owners, priority and dates, and report against them.',
        deliverable: 'Transformation roadmap and programme reporting',
      },
    ],
  },

  cta: {
    heading: { roman: 'Start with', accent: 'what you already have' },
    action: { label: 'Talk to Sales', href: '/contact' },
  },
};

/* ------------------------------------------------------------------------ AI Services */

const aiServices: ServicePage = {
  slug: 'ai',
  name: 'AI Services',

  seo: {
    title: 'AI Services | Gap Assessment, Agentic Models and RAG',
    description:
      'Find the gaps AI can close, then design, deploy and govern the solution safely and under your control through assessment, leak prevention, agents, retrieval and integration.',
  },

  anchors: serviceAnchors,

  hero: {
    id: 'hero',
    eyebrow: 'AI Services',
    heading: { roman: 'Enterprise', accent: 'AI services' },
    media: { image: '/media/art-ainerve.svg', generative: 'signal' },
  },

  lead: {
    id: 'lead',
    text: 'Find where AI can help, then design, deploy and govern a solution under your control. We address the two common blockers: pilots that fail on real data and systems that lack the evidence needed for approval.',
  },

  offerings: {
    id: 'offerings',
    heading: { roman: 'Five services,', accent: 'assessment first' },
    intro:
      'The order is deliberate. A gap assessment before a build is the cheapest thing on this page and the only one that can tell you not to spend the rest.',
    cards: [
      {
        index: '01',
        title: 'AI Gap Assessment',
        summary: 'Find where AI adds value before you commit to a build.',
        body: 'We identify where AI can meaningfully improve your operations, and where current processes and tooling fall short, so the business case exists before the budget does.',
        features: [
          'Process and workflow audit for AI opportunity',
          'Benchmark against industry AI adoption',
          'Risk and readiness scoring',
          'Prioritised roadmap of solutions',
        ],
      },
      {
        index: '02',
        title: 'No Data Leakage',
        summary: 'Leak prevention built into the AI layer itself.',
        body: 'Block sensitive data in prompts, model outputs and third-party API calls by enforcing policy directly in the AI traffic path.',
        features: [
          'Prompt and output inspection for sensitive data',
          'Policy-based blocking before data leaves your perimeter',
          'Third-party model call governance',
          'Full audit trail of every AI interaction',
        ],
      },
      {
        index: '03',
        title: 'Agentic Models',
        summary: 'Autonomous task agents, under governance.',
        body: 'Design and deploy task-specific agents that plan, use tools and execute multi-step workflows, with the scope, sandbox and escalation points agreed before anything is allowed to act.',
        features: [
          'Custom agent design for your workflows',
          'Tool-use and multi-step task orchestration',
          'Sandboxed execution with guardrails',
          'Human-in-the-loop checkpoints where needed',
        ],
      },
      {
        index: '04',
        title: 'RAG Pipelines',
        summary: 'Ground answers in your own governed data.',
        body: 'Retrieval-augmented generation over your own sources provides accurate and current answers instead of a model’s frozen training data, with a citation on each one so an answer can be checked.',
        features: [
          'Retrieval pipelines over your governed data',
          'Reduced hallucination via grounded responses',
          'Source citations on every generated answer',
          'Continuous re-indexing as data updates',
        ],
      },
      {
        index: '05',
        title: 'Custom AI Integration',
        summary: 'From plan to production.',
        body: 'A tailored implementation built from your assessment results, with hands-on rollout, integration into the systems you already run, and enablement so your own team owns it afterwards.',
        features: [
          'Solution architecture tailored to your stack',
          'Integration with existing systems and data',
          'Deployment and hands-on enablement',
          'Ongoing tuning as needs evolve',
        ],
      },
    ],
  },

  engagement: {
    id: 'engagement',
    heading: { roman: 'Assess, design,', accent: 'deploy, govern' },
    intro:
      'Four stages, and the first one is allowed to end the engagement. An assessment that can only ever recommend a build is a sales process with a report attached.',
    phases: [
      {
        index: '01',
        title: 'Assess',
        blurb:
          'Audit the processes and workflows where AI might help, benchmark against sector adoption, and score risk and readiness honestly.',
        deliverable: 'Prioritised opportunity roadmap with risk scoring',
      },
      {
        index: '02',
        title: 'Design',
        blurb:
          'Architect the solution against your own stack and data, and agree the policy boundary, the tool scope and the human checkpoints up front.',
        deliverable: 'Solution architecture and governance boundary',
      },
      {
        index: '03',
        title: 'Deploy',
        blurb:
          'Build and integrate against the systems you already run, with hands-on enablement so your team can operate it without us.',
        deliverable: 'Running system and team enablement',
      },
      {
        index: '04',
        title: 'Govern',
        blurb:
          'Bring the deployment under AINerve: prompt and output inspection, policy enforcement and an audit trail of every interaction.',
        deliverable: 'Enforced policy set and full interaction audit trail',
      },
    ],
  },

  cta: {
    heading: { roman: 'Start with the', accent: 'gap assessment' },
    action: { label: 'Talk to Sales', href: '/contact' },
  },
};

export const services: Record<ServiceSlug, ServicePage> = { data: dataServices, ai: aiServices };
