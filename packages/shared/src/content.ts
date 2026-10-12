/**
 * Every user-visible string on the site carries a verification status. `placeholder` and `confirm`
 * mirror the [PLACEHOLDER] and [CONFIRM] markers in docs/copy-deck.md — they are unverified
 * security and compliance claims and must be impossible to ship by accident.
 */
export type ContentStatus = 'verified' | 'placeholder' | 'confirm';

export interface ContentValue<T = string> {
  readonly value: T;
  readonly status: ContentStatus;
  /** Why it is unverified, and who owes us the real answer. */
  readonly note?: string;
}

const verified = <T>(value: T): ContentValue<T> => ({ value, status: 'verified' });

/** A number or fact invented to fill the layout. Never ships. */
const placeholder = <T>(value: T, note?: string): ContentValue<T> =>
  note === undefined ? { value, status: 'placeholder' } : { value, status: 'placeholder', note };

/** A factual claim only the client can stand behind. Never ships unchecked. */
const confirm = <T>(value: T, note?: string): ContentValue<T> =>
  note === undefined ? { value, status: 'confirm' } : { value, status: 'confirm', note };

export const flag = { verified, placeholder, confirm } as const;

export const isUnverified = (item: ContentValue<unknown>): boolean => item.status !== 'verified';

export interface Heading {
  /** Rendered in the UI face, text.primary. */
  readonly roman: string;
  /** Rendered in the display serif italic, accent colour. */
  readonly accent: string;
}

export interface SeoMeta {
  readonly title: string;
  readonly description: string;
}

export interface LinkItem {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

/**
 * A primary-nav entry, which may open a dropdown and — for DataNerve — a second level beneath it.
 * `href` is always present even on a node with children: a parent that cannot be followed strands
 * anyone navigating by keyboard or on touch, where there is no hover to open the panel with.
 */
export interface NavNode extends LinkItem {
  readonly children?: readonly NavNode[];
  /** Draws a hairline above this entry, separating "View All" and "Login" from the list proper. */
  readonly separated?: boolean;
  /** Shown under the label in the dropdown, where there is room to say what the destination is. */
  readonly summary?: string;
}

/**
 * A fullscreen-menu entry: a primary nav node plus its place in the numbered list.
 *
 * It extends NavNode rather than LinkItem because the menu carries the whole tree. It used to
 * carry a flat hand-written copy of the top level, which meant the mobile menu silently lost every
 * child — eight destinations, including all three products.
 */
export interface MenuNode extends NavNode {
  readonly index: string;
}

export interface IndexedCard {
  readonly index: string;
  readonly tag?: string;
  readonly title: string;
  readonly blurb: string;
  readonly href?: string;
  /** Set when the blurb contains a claim only the client can stand behind. */
  readonly unverified?: ContentValue<string>;
}

export interface CounterItem {
  /** Carries its own suffix, e.g. "40+", "99.99+". */
  readonly value: ContentValue<string>;
  readonly label: string;
}

/**
 * One capability group on a product page.
 *
 * Bigger than an `IndexedCard` and smaller than a page: a summary line that says what the group is
 * for, a paragraph that says how it works, and the named features underneath. DataNerve ships
 * seven of these, which is the level of detail the client's own product page carries.
 */
export interface ProductModule {
  readonly index: string;
  readonly title: string;
  /** One line, sentence case. What this group is for. */
  readonly summary: string;
  readonly body: string;
  readonly features: readonly string[];
}

export interface TierCard {
  readonly index: string;
  readonly title: string;
  readonly sentence: string;
  readonly bullets: readonly ContentValue<string>[];
}

export interface FilterTab {
  readonly id: string;
  readonly label: string;
}

export interface CtaBandContent {
  readonly heading: Heading;
  readonly action: LinkItem;
}

export interface SectionIntro {
  readonly id: string;
  readonly eyebrow: string;
  readonly heading: Heading;
}
