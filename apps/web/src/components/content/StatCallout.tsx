import { Reveal } from '@/components/primitives/Reveal';
import { cn } from '@/lib/cn';

export interface StatCalloutProps {
  figure: string;
  claim: string;
  /** Where the figure comes from. Required — a market statistic without a citation is a slogan. */
  source: string;
  dateOnly?: boolean;
  className?: string;
}

/**
 * One sourced market statistic, pulled out at display size.
 *
 * The citation is not optional and not a tooltip. A number this size on a security vendor's site
 * is the kind of thing a prospect's analyst will go looking for, and the difference between a
 * credible page and a brochure is whether they have to.
 */
export function StatCallout({ figure, claim, source, dateOnly = false, className }: StatCalloutProps) {
  return (
    <Reveal
      as="figure"
      className={cn(
        'mx-auto flex max-w-4xl flex-col items-center gap-5 border-y border-hairline/15 px-6 py-12 text-center lg:flex-row lg:items-baseline lg:gap-10 lg:text-left',
        className,
      )}
    >
      <span className="font-display text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-accent-ink">
        {figure}
      </span>

      {!dateOnly ? (
        <div className="lg:border-l lg:border-hairline/15 lg:pl-10">
          <p className="text-[clamp(1.0625rem,1.5vw,1.375rem)] leading-[1.5] text-ink-body">
            {claim}
          </p>
          <figcaption className="mt-4 text-eyebrow uppercase tracking-[0.18em] text-ink-dim">
            {source}
          </figcaption>
        </div>
      ) : (
        /* A date on its own says nothing — "April 2027" is only meaningful once you know what
           happens then. The source line still stays out: a planned date has no citation. */
        claim ? (
          <figcaption className="text-eyebrow uppercase tracking-[0.18em] text-ink-dim lg:border-l lg:border-hairline/15 lg:pl-10">
            {claim}
          </figcaption>
        ) : null
      )}
    </Reveal>
  );
}
