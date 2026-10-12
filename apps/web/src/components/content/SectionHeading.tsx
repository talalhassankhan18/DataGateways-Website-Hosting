import type { Heading } from '@datagateways/shared';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { Reveal } from '@/components/primitives/Reveal';
import { cn } from '@/lib/cn';

export interface SectionHeadingProps {
  heading: Heading;
  id?: string;
  eyebrow?: string;
  lead?: string;
  className?: string;
  align?: 'start' | 'center';
  /**
   * Set false to render the heading without its entrance.
   *
   * Used where the body beside it carries a scroll-driven fill: two things animating on the same
   * scroll compete, and the heading moving while the text fills in underneath reads as jitter
   * rather than as sequence. The heading holds still and the copy does the moving.
   */
  animate?: boolean;
}

/** Eyebrow plus h2 plus optional lead — the opening of nearly every section on the site. */
export function SectionHeading({
  heading,
  id,
  eyebrow,
  lead,
  className,
  align = 'start',
  animate = true,
}: SectionHeadingProps) {
  const Wrapper = animate ? Reveal : 'div';

  return (
    <Wrapper className={cn(align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? <Eyebrow className={cn('mb-5', align === 'center' && 'justify-center')}>{eyebrow}</Eyebrow> : null}
      <SplitHeading
        id={id}
        as="h2"
        roman={heading.roman}
        accent={heading.accent}
        className="max-w-[18ch]"
      />
      {lead ? (
        <p className={cn('mt-6 max-w-measure text-lead text-ink-secondary', align === 'center' && 'mx-auto')}>
          {lead}
        </p>
      ) : null}
    </Wrapper>
  );
}
