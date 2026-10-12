import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The five bands the whole site is composed from. Matching the reference, a page alternates
 * between them rather than running one background end to end.
 *
 * A tone sets its own surface and redefines the ink tokens for everything inside it (see the
 * `.tone-*` rules in styles/tokens.css), so a card or heading works on any band without being told
 * which one it is sitting on.
 */
export type SectionTone = 'light' | 'white' | 'grey' | 'band' | 'navy';

export interface SectionProps {
  /** Doubles as the anchor-rail target, so it must match an entry in the page's anchors list. */
  id: string;
  children: ReactNode;
  tone?: SectionTone;
  className?: string;
  /** Section headings are the accessible name for the landmark when one is present. */
  labelledBy?: string;
  as?: 'section' | 'div';
}

const TONE_CLASS: Record<SectionTone, string> = {
  light: 'tone-light',
  white: 'tone-white',
  grey: 'tone-grey',
  band: 'tone-band',
  navy: 'tone-navy',
};

/**
 * Vertical rhythm, the band tone, plus the scroll offset that stops the sticky header covering a
 * section heading when the anchor rail jumps to it.
 */
export function Section({
  id,
  children,
  tone = 'light',
  className,
  labelledBy,
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag
      id={id}
      data-tone={tone}
      aria-labelledby={labelledBy}
      className={cn('scroll-mt-[var(--header-height)] py-section', TONE_CLASS[tone], className)}
    >
      {children}
    </Tag>
  );
}
