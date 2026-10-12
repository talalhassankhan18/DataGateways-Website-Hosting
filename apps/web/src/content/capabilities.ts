import type {
  CtaBandContent,
  Heading,
  IndexedCard,
  ProductModule,
  SeoMeta,
} from '@datagateways/shared';
import type { AnchorDef } from './home';

export const CAPABILITY_SLUGS = ['governance', 'dspm', 'dlp'] as const;
export type CapabilitySlug = (typeof CAPABILITY_SLUGS)[number];

export const isCapabilitySlug = (value: string | undefined): value is CapabilitySlug =>
  value !== undefined && (CAPABILITY_SLUGS as readonly string[]).includes(value);

/**
 * The three capabilities beneath DataNerve. They share one page template because they are three
 * facets of one product rather than three products — giving each its own layout would imply
 * otherwise, which is precisely the impression the client does not want to give.
 *
 * Every section after the lead is optional, so a capability that is shipping carries its full
 * detail and one that is still on the roadmap is not padded out to match it.
 */
export interface CapabilityPage {
  readonly slug: CapabilitySlug;
  readonly name: string;
  readonly status: string;
  readonly seo: SeoMeta;
  readonly anchors: readonly AnchorDef[];
  readonly hero: {
    readonly id: string;
    readonly eyebrow: string;
    readonly heading: Heading;
    readonly media: { readonly image: string; readonly generative: 'cipher' | 'circuit' | 'signal' };
  };
  readonly lead: { readonly id: string; readonly text: string };
  readonly stats?: readonly { readonly value: string; readonly label: string }[];
  readonly interpreterDomains?: readonly { readonly title: string; readonly description: string }[];
  /** A single sourced market statistic. Carries its citation, or it does not go on the page. */
  readonly callout?: { readonly figure: string; readonly claim: string; readonly source: string };
  /** Two columns of the same six questions, answered the old way and this way. */
  readonly comparison?: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly columns: readonly [string, string];
    readonly rows: readonly (readonly [string, string])[];
  };
  /** An ordered pipeline. Rendered as numbered steps, not as a card grid. */
  readonly flow?: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly steps: readonly IndexedCard[];
    readonly example?: string;
  };
  readonly modules: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly cards: readonly ProductModule[];
  };
  readonly management?: {
    readonly id: string;
    readonly eyebrow: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly cards: readonly IndexedCard[];
    readonly outcome: string;
  };
  readonly dataQuality?: {
    readonly id: string;
    readonly eyebrow: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly cards: readonly IndexedCard[];
    readonly outcome: readonly string[];
  };
  readonly maturity?: {
    readonly id: string;
    readonly eyebrow: string;
    readonly heading: Heading;
    readonly cards: readonly IndexedCard[];
    readonly statement: string;
    readonly levels: readonly string[];
  };
  /** A lighter grid than `modules`: a name and a sentence, for coverage lists. */
  readonly grid?: {
    readonly id: string;
    readonly heading: Heading;
    readonly intro: string;
    readonly cards: readonly IndexedCard[];
  };
  readonly showcase?: {
    readonly id: string;
    readonly heading: Heading;
    readonly body: string;
    readonly image: string;
    readonly points: readonly string[];
  };
  readonly cta: CtaBandContent;
}

/* ---------------------------------------------------------------------- Governance */

const governance: CapabilityPage = {
  slug: 'governance',
  name: 'Governance',
  status: 'Available now',

  seo: {
    title: 'Data Governance | DataNerve by DataGateways',
    description:
      'Governance as an operating system: scope, discovery, inventory, taxonomy, handling rules, RACI, maturity and roadmap held in one evidenced structure rather than a folder of documents.',
  },

  anchors: [
    { id: 'hero', label: 'Intro' },
    { id: 'lead', label: 'Summary' },
    { id: 'comparison', label: 'Approach' },
    { id: 'management', label: 'Data governance' },
    { id: 'maturity', label: 'Maturity' },
    { id: 'modules', label: 'Capabilities' },
    { id: 'reporting', label: 'Reporting' },
  ],

  hero: {
    id: 'hero',
    eyebrow: 'DataNerve: Governance',
    heading: { roman: 'Governance as an', accent: 'operating system' },
    media: { image: '/media/art-governance.svg', generative: 'circuit' },
  },

  lead: {
    id: 'lead',
    text: 'We provide an integrated approach to govern data management, data quality, data discovery, data classification and maturity transformation. DataNerve operationalizes data governance frameworks by translating organizational data into measurable governance, quality, classification, security and compliance controls',
  },

  stats: [
    { value: '8', label: 'Licensable modules' },
    { value: '5', label: 'Maturity levels' },
    { value: '90+', label: 'Quality detectors' },
    { value: '400+', label: 'Dashboard widgets' },
  ],

  comparison: {
    id: 'comparison',
    heading: { roman: 'What actually', accent: 'changes' },
    intro:
      'Governance loses value when it stays a documentation exercise. DataNerve connects assessment, evidence and improvement in one operating model.',
    columns: ['Traditional approach', 'DataNerve approach'],
    rows: [
      ['Excel files spread across teams', 'A project workspace holding the full context'],
      ['Assessment answers disconnected from evidence', 'Data types, assets, taxonomy and controls connected'],
      ['Maturity scores that do not drive action', 'Maturity gaps mapped to a transformation roadmap'],
      ['Risks, controls and roadmap tracked separately', 'Governance, security and quality run as one programme'],
      ['Reports shallow and manually assembled', 'Reports grounded in project data, with narrative depth'],
      ['Unknown data exposure and weak accountability', 'Named owners, stewards and custodians against every asset'],
    ],
  },

  flow: {
    id: 'flow',
    heading: { roman: 'Data security', accent: 'program management' },
    intro:
      'Discovery, classification, risk, posture and remediation connected in one evidence-led operating flow.',
    steps: [
      {
        index: '01',
        title: 'Risk scenario',
        blurb: 'Threats, vulnerabilities, and data sensitivity.',
      },
      {
        index: '02',
        title: 'Risk assessment',
        blurb: 'Likelihood, impact, and CIA factors.',
      },
      {
        index: '03',
        title: 'Mitigation plan',
        blurb: 'Treatment, owner, and target date.',
      },
      {
        index: '04',
        title: 'Control mapping',
        blurb: 'NIST, ISO, CIS, COBIT, PCI, and HIPAA where configured.',
      },
      {
        index: '05',
        title: 'Roadmap action',
        blurb: 'Prioritised transformation activity.',
      },
    ],
    example:
      'Sensitive customer data in a poorly controlled process → risk scenario → mitigation plan → control mapping → maturity gap → roadmap action → management report',
  },

  modules: {
    id: 'modules',
    heading: { roman: 'Product', accent: 'Modules' },
    intro:
      'Each licensable module writes to one shared record, so a classification decision carries across the full governance programme.',
    cards: [
      {
        index: '01',
        title: 'Data Scoping',
        summary: 'Defining the scope for data governance',
        body: 'Set business and regulatory boundaries, select capabilities and record why they are in scope. Keep those decisions in a managed implementation plan.',
        features: ['Scope records and rationale', 'Module selection', 'Implementation guidance'],
      },
      {
        index: '02',
        title: 'Data Discovery',
        summary: 'Identify business processes, data types & formats',
        body: 'Record each process, its owner, the data it handles and how that data is shared, connecting governance intent to technical evidence.',
        features: ['Process register', 'Data types and formats', 'Owners, stewards, custodians'],
      },
      {
        index: '03',
        title: 'Data Asset Inventory',
        summary: 'Structured view of critical assets & ownership',
        body: 'Link each asset to its source, owner, criticality and retention, alongside related discovery, classification, quality, risk and roadmap records.',
        features: ['Asset records and lineage', 'Criticality and retention', 'Linked evidence'],
      },
      {
        index: '04',
        title: 'Classification & Referencing',
        summary: 'Classification rules, references & handling context',
        body: 'Apply a five-level taxonomy—from Public to Highly Restricted—using sensitivity, regulatory impact and business criticality, with confidence scores and review history.',
        features: ['Classification taxonomy', 'Handling rules', 'Documented exceptions'],
      },
      {
        index: '05',
        title: 'Governance',
        summary: 'Governance maturity, ownership, gaps & roadmap',
        body: 'Assess evidence across five maturity levels, compare current and target states, then assign improvement initiatives with owners and priorities.',
        features: ['Maturity assessment', 'Ownership and RACI', 'Transformation roadmap'],
      },
      {
        index: '06',
        title: 'Data Quality',
        summary: 'Track issues affecting trust & reporting confidence',
        body: 'Track six quality dimensions through detector results and remediation evidence, with issues managed from discovery through validation.',
        features: ['90+ built-in detectors', 'Issue lifecycle', 'Root cause and impact'],
      },
      {
        index: '07',
        title: 'Data Security',
        summary: 'Assess risks, maturity, controls & security roadmap',
        body: 'Assess risk, assign mitigation owners and dates, and map controls to your frameworks. Link each risk to maturity gaps and roadmap actions.',
        features: ['Risk assessment', 'Mitigation planning', 'Controls mapping'],
      },
      {
        index: '08',
        title: 'Reports',
        summary: 'Executive, management & deep-dive reporting engine',
        body: 'Generate executive summaries or detailed reports from project evidence, risks, controls and roadmap actions, with human review before release.',
        features: ['Executive to deep-dive', 'Dashboards and widgets', 'Audit logs and syslog'],
      },
    ],
  },

  management: {
    id: 'management',
    eyebrow: 'Data Governance',
    heading: { roman: 'Data governance and', accent: 'management' },
    intro: 'DataNerve is an operating system, and not a collection of documents only.',
    cards: [
      { index: '01', title: 'Project Workspace', blurb: 'Scope and operating context' },
      { index: '02', title: 'Business Discovery', blurb: 'Processes, data types, owners' },
      { index: '03', title: 'Inventory', blurb: 'Assets, sensitivity, retention' },
      { index: '04', title: 'Taxonomy', blurb: 'Classification and handling' },
      { index: '05', title: 'Maturity', blurb: 'Current and target state' },
      { index: '06', title: 'Roadmap', blurb: 'Actions, owners and evidence' },
    ],
    outcome:
      'Business teams can understand what data they own, how it should be handled, where gaps exist and what improvement work is assigned.',
  },

  dataQuality: {
    id: 'data-quality',
    eyebrow: 'Data Quality and Reporting',
    heading: { roman: 'Data', accent: 'quality' },
    intro:
      'Data quality is not only a technical issue. It affects reporting trust, risk decisions, operational efficiency and AI readiness.',
    cards: [
      { index: '01', title: 'Completeness', blurb: 'Tracked through maturity, detector results, issues and remediation evidence.' },
      { index: '02', title: 'Consistency', blurb: 'Tracked through maturity, detector results, issues and remediation evidence.' },
      { index: '03', title: 'Conformity', blurb: 'Tracked through maturity, detector results, issues and remediation evidence.' },
      { index: '04', title: 'Validity', blurb: 'Tracked through maturity, detector results, issues and remediation evidence.' },
      { index: '05', title: 'Uniqueness', blurb: 'Tracked through maturity, detector results, issues and remediation evidence.' },
      { index: '06', title: 'Timeliness', blurb: 'Tracked through maturity, detector results, issues and remediation evidence.' },
    ],
    outcome: [
      'Data quality findings are linked to owners, business impact, root cause and improvement actions.',
      '90+ Built-in Data Quality Detectors are available which can be directly converted into data Quality issues identification and remediation.',
    ],
  },

  maturity: {
    id: 'maturity',
    eyebrow: 'Data Governance',
    heading: { roman: 'Governance', accent: 'Maturity' },
    cards: [
      {
        index: '01',
        title: 'Assessment',
        blurb: 'Capture domains, questions, evidence, scores and review status.',
      },
      {
        index: '02',
        title: 'Gap Analysis',
        blurb: 'Compare current and target maturity, identify weaknesses and controls.',
      },
      {
        index: '03',
        title: 'Roadmap',
        blurb: 'Convert gaps into phased initiatives with owners, priority and dates.',
      },
    ],
    statement:
      'We used maturity as a managed improvement system rather than a one-time scoring exercise.',
    levels: ['Initial', 'Managed', 'Defined', 'Measured', 'Optimized'],
  },

  grid: {
    id: 'reporting',
    heading: { roman: 'Four report depths,', accent: 'one source of truth' },
    intro:
      'Human review stays in control. AI-assisted generation is grounded in the project’s own data, including maturity evidence, risks, controls and roadmap actions, rather than in a model’s general knowledge of governance.',
    cards: [
      {
        index: '01',
        tag: 'Level 1',
        title: 'Executive Snapshot',
        blurb: 'Topline posture, maturity, risks and the immediate recommendations.',
      },
      {
        index: '02',
        tag: 'Level 2',
        title: 'Management Report',
        blurb: 'Domain summaries, key gaps, risk posture and prioritised actions.',
      },
      {
        index: '03',
        tag: 'Level 3',
        title: 'Detailed Assessment',
        blurb: 'Methodology, maturity, risks, controls, roadmap and module findings in full.',
      },
      {
        index: '04',
        tag: 'Level 4',
        title: 'Deep-Dive Expert',
        blurb: 'Evidence-aware narrative, detailed analysis and transformation direction.',
      },
    ],
  },

  cta: {
    heading: { roman: 'Bring us your', accent: 'hardest data domain' },
    action: { label: 'Request a Demo', href: '/contact' },
  },
};

/* --------------------------------------------------------------------------- DSPM */

const dspm: CapabilityPage = {
  slug: 'dspm',
  name: 'DSPM',
  status: 'Coming soon',

  seo: {
    title: 'DSPM | Data Security Posture Management by DataGateways',
    description:
      'Automated discovery, classification, access posture and exposure evidence across files, endpoints, databases, object storage and cloud, correlated into one evidence-aware risk posture.',
  },

  anchors: [
    { id: 'hero', label: 'Intro' },
    { id: 'lead', label: 'Summary' },
    { id: 'flow', label: 'Data security programme' },
    { id: 'modules', label: 'Coverage' },
    { id: 'controls', label: 'Remediation' },
  ],

  hero: {
    id: 'hero',
    eyebrow: 'DataNerve: DSPM',
    heading: { roman: 'Discovery, classification,', accent: 'risk, posture, and remediation' },
    media: { image: '/media/art-discovery.svg', generative: 'cipher' },
  },

  lead: {
    id: 'lead',
    text: 'DSPM finds overlooked data copies and shows who can reach them. It uses DataNerve taxonomy and handling rules, then feeds findings into inventory, quality, risk and reporting.',
  },

  stats: [
    { value: '24,104+', label: 'Predefined interpreters' },
    { value: '9', label: 'Regions covered' },
    { value: '250+', label: 'Countries & territories' },
    { value: '8', label: 'Sensitive data domains' },
  ],

  interpreterDomains: [
    { title: 'PII', description: 'National IDs, passports, phone, email' },
    { title: 'PHI', description: 'Medical IDs and health context' },
    { title: 'PCI', description: 'Cards and payment data' },
    { title: 'Financial', description: 'IBAN, SWIFT, account patterns' },
    { title: 'HR', description: 'Employees and workforce data' },
    { title: 'Credentials', description: 'API keys, tokens, secrets' },
    { title: 'Operational', description: 'Account IDs, references, UUIDs' },
    { title: 'Telemetry', description: 'IP, URL, device identifiers' },
  ],

  modules: {
    id: 'modules',
    heading: { roman: 'Where it', accent: 'looks' },
    intro:
      'Source support is validated during proof of value against your own environment, permissions and the provider’s API constraints, a limitation the platform makes visible rather than hiding behind a logo grid.',
    cards: [
      {
        index: '01',
        title: 'Files & Shares',
        summary: 'Local server paths, Windows shares and NFS-mounted locations.',
        body: 'The unstructured estate, where most forgotten copies live and where permissions drift fastest.',
        features: ['Local paths', 'SMB / Windows shares', 'NFS mounts'],
      },
      {
        index: '02',
        title: 'Endpoints',
        summary: 'Windows and Linux endpoint agent models.',
        body: 'A native service reporting discovery, telemetry and tagging evidence through an authenticated agent gateway.',
        features: ['Windows', 'Linux', 'Heartbeat and state'],
      },
      {
        index: '03',
        title: 'Databases',
        summary: 'Structured data and the privileges that reach it.',
        body: 'Map schemas, tables and collections, then flag excessive privileges, wildcard grants and service-account access.',
        features: ['SQL Server, PostgreSQL', 'MySQL / MariaDB, Oracle', 'MongoDB'],
      },
      {
        index: '04',
        title: 'Object Storage',
        summary: 'S3-compatible storage and the major cloud object stores.',
        body: 'Bucket and object metadata with exposure conditions, including public and anonymous access paths.',
        features: ['AWS S3 and S3-compatible', 'Azure Blob', 'Google Cloud Storage'],
      },
      {
        index: '05',
        title: 'Cloud & SaaS',
        summary: 'The collaboration surface, where sharing is the risk.',
        body: 'External and guest sharing, anonymous links and broad internal access mapped against the sensitivity of what is behind them.',
        features: ['SharePoint, OneDrive', 'Teams', 'Google Drive'],
      },
      {
        index: '06',
        title: 'API Sources',
        summary: 'Generic API mappings for explicit customer sources.',
        body: 'For the systems that matter to you and are not on anybody’s standard connector list, mapped explicitly rather than assumed.',
        features: ['Explicit source mapping', 'Read-only where supported', 'Source-health tracking'],
      },
    ],
  },

  grid: {
    id: 'controls',
    heading: { roman: 'Controlled', accent: 'remediation' },
    intro:
      'Our DSPM operates as an integrated operating model, enriching inventory, risk control, and compliance posture while distinguishing exact, correlated, and aggregate evidence.',
    cards: [
      {
        index: '01',
        title: 'Masking',
        blurb: 'Obscure detected sensitive values in eligible files.',
      },
      {
        index: '02',
        title: 'Anonymization',
        blurb: 'Replace detected values to lower re-identification risk.',
      },
      {
        index: '03',
        title: 'Redaction',
        blurb: 'Remove or cover sensitive content where the file type supports it.',
      },
      {
        index: '04',
        title: 'Encryption',
        blurb: 'Encrypt at rest, with agent-system readability controls where configured.',
      },
      {
        index: '05',
        title: 'Quarantine',
        blurb: 'Move eligible files to a controlled repository, with a restore workflow.',
      },
      {
        index: '06',
        title: 'Secure Deletion',
        blurb: 'Irreversible deletion for governed cases that require destruction.',
      },
    ],
  },

  cta: {
    heading: { roman: 'Find the copies', accent: 'you forgot about' },
    action: { label: 'Request a Demo', href: '/contact' },
  },
};

/* ---------------------------------------------------------------------------- DLP */

const dlp: CapabilityPage = {
  slug: 'dlp',
  name: 'DLP',
  status: 'On the roadmap',

  seo: {
    title: 'DLP | Data Loss Prevention by DataGateways',
    description:
      'Endpoint and network discovery with masking, anonymization, encryption and NLP/ML contextualization, extending DataNerve protection to where data leaves.',
  },

  anchors: [
    { id: 'hero', label: 'Intro' },
    { id: 'lead', label: 'Summary' },
    { id: 'modules', label: 'Scope' },
    { id: 'architecture', label: 'Agent model' },
  ],

  hero: {
    id: 'hero',
    eyebrow: 'DataNerve: DLP',
    heading: { roman: 'Protection and', accent: 'Control' },
    media: { image: '/media/art-dlp.svg', generative: 'signal' },
  },

  lead: {
    id: 'lead',
    text: '',
  },

  callout: {
    figure: 'Coming soon',
    claim: '',
    source: '',
  },

  modules: {
    id: 'modules',
    heading: { roman: 'What the module', accent: 'adds' },
    intro:
      'DLP extends coverage outward from the repositories DSPM already sees, to the endpoint and the network, and adds contextual detection on top of pattern matching.',
    cards: [
      {
        index: '01',
        title: 'Endpoint Discovery',
        summary: 'Linux and Windows discovery and classification at the device.',
        body: 'The endpoint agent enumerates local storage and metadata and applies tagging where the file type and operating environment support it, reporting through an authenticated gateway.',
        features: ['Windows and Linux', 'Local storage enumeration', 'Metadata tagging'],
      },
      {
        index: '02',
        title: 'Network Location',
        summary: 'Data movement and location-aware scanning.',
        body: 'Coverage of the paths data takes between systems, so location becomes part of the risk picture rather than an assumption.',
        features: ['Movement visibility', 'Location-aware scanning'],
      },
      {
        index: '03',
        title: 'Protection Actions',
        summary: 'Masking, anonymization and encryption as policy outcomes.',
        body: 'The same controlled remediation families DSPM uses, triggered by policy at the point of egress rather than by an analyst after the fact.',
        features: ['Masking', 'Anonymization', 'Encryption policies'],
      },
      {
        index: '04',
        title: 'NLP / ML Contextualization',
        summary: 'Model-based contextual detection of sensitive data.',
        body: 'Contextual classification for the cases a pattern cannot settle, such as when the same string is sensitive in one document and meaningless in another.',
        features: ['Contextual detection', 'Beyond regex matching'],
      },
      {
        index: '05',
        title: 'Cloud & SaaS Expansion',
        summary: 'Wider coverage with privacy automation.',
        body: 'Extension of discovery, classification and enforcement across cloud and SaaS estates, with privacy workflow automation alongside.',
        features: ['Cloud and SaaS estates', 'Privacy automation'],
      },
      {
        index: '06',
        title: 'Policy Enforcement',
        summary: 'Automated, policy-driven remediation workflows.',
        body: 'Enforcement driven by the handling rules already recorded in governance, so the policy that is enforced is the policy that was approved.',
        features: ['Policy-driven workflows', 'Handling-rule alignment'],
      },
    ],
  },

  grid: {
    id: 'architecture',
    heading: { roman: 'A controlled', accent: 'agent task model' },
    intro:
      'The endpoint agent does not provide arbitrary command execution. It operates through fixed task families, which makes agent activity auditable, repeatable and acceptable to a security team that has to sign for it.',
    cards: [
      {
        index: '01',
        title: 'Server Policy',
        blurb: 'The authorized task and target scope are set centrally, not by the agent.',
      },
      {
        index: '02',
        title: 'Agent Pickup',
        blurb: 'Work is collected over an authenticated task channel.',
      },
      {
        index: '03',
        title: 'Fixed Action',
        blurb: 'Discovery, tagging or remediation, one of a fixed set of families.',
      },
      {
        index: '04',
        title: 'Result Evidence',
        blurb: 'Status, logs, affected files and errors are returned per object.',
      },
      {
        index: '05',
        title: 'Review',
        blurb: 'Dashboards, reports and audit history retain the full action record.',
      },
    ],
  },

  cta: {
    heading: { roman: 'Plan the rollout', accent: 'before the module lands' },
    action: { label: 'Talk to Sales', href: '/contact' },
  },
};

export const capabilities: Record<CapabilitySlug, CapabilityPage> = { governance, dspm, dlp };
