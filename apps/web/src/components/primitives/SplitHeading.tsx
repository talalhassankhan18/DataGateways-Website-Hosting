import { cn } from '@/lib/cn';

export type SplitHeadingSize = 'hero' | 'h2' | 'statement' | 'h3' | 'lead';
export type SplitHeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p';

export interface SplitHeadingProps {
  /** The first half, in the band's primary ink. */
  roman: string;
  /** The emphasis half, in the accent colour. */
  accent: string;
  as?: SplitHeadingTag;
  size?: SplitHeadingSize;
  className?: string;
  id?: string;
  /** Focus target for the contact wizard, which moves focus to the step heading on change. */
  tabIndex?: number;
}

const SIZE_CLASS: Record<SplitHeadingSize, string> = {
  hero: 'text-hero',
  h2: 'text-h2',
  statement: 'text-statement',
  h3: 'text-h3',
  lead: 'text-lead',
};

/**
 * The accent blue is 4.33:1 on the light base — AA Large only. Anything rendered below 24px
 * therefore uses the darkened ink variant at 7.35:1 instead. Both tokens are redefined inside
 * `.tone-band` and `.tone-navy`, so the same classes stay legible on the blue and navy bands.
 * See docs/design-reference.md.
 */
const ACCENT_CLASS: Record<SplitHeadingSize, string> = {
  hero: 'text-accent',
  h2: 'text-accent',
  statement: 'text-accent',
  h3: 'text-accent-ink',
  lead: 'text-accent-ink',
};

const DEFAULT_SIZE: Record<SplitHeadingTag, SplitHeadingSize> = {
  h1: 'hero',
  h2: 'h2',
  h3: 'h3',
  h4: 'h3',
  p: 'lead',
};

/**
 * The entire visual signature of the site. Every h1 and h2 goes through this component — a heading
 * that bypasses it is a bug, not a style choice.
 *
 * Both halves are uppercase Space Grotesk 700 set tight, matching the reference. The emphasis is
 * carried by COLOUR, never by slant: neither family here ships a true italic, and a synthesised
 * oblique on a grotesque reads as a rendering fault rather than as emphasis.
 *
 * The two halves live inside a single element separated by a plain space, so assistive tech reads
 * one continuous heading rather than two fragments.
 */
export function SplitHeading({
  roman,
  accent,
  as: Tag = 'h2',
  size,
  className,
  id,
  tabIndex,
}: SplitHeadingProps) {
  const resolved = size ?? DEFAULT_SIZE[Tag];

  return (
    <Tag
      id={id}
      tabIndex={tabIndex}
      className={cn(
        'font-display font-bold uppercase',
        SIZE_CLASS[resolved],
        tabIndex !== undefined && 'outline-none',
        className,
      )}
    >
      <span className="text-ink-primary">{roman}</span>{' '}
      <span className={ACCENT_CLASS[resolved]}>{accent}</span>
    </Tag>
  );
}
