import { Fragment } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Heading } from '@datagateways/shared';
import { heroWordVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';

export interface HeroHeadingProps extends Heading {
  className?: string;
  id?: string;
  /**
   * `giant` is the reference's own hero treatment: one centred line that never wraps, sized off
   * the viewport width rather than a type scale, and letting the words run edge to edge. It is
   * only safe for a short headline — nothing here re-flows it if it stops fitting.
   */
  variant?: 'stacked' | 'giant';
}

/**
 * The hero headline, animated word by word.
 *
 * This is `SplitHeading`'s hero-only sibling. The reference splits its `h1` into per-word spans and
 * raises each one 26px with a 0.18s stagger, which is what makes the hero land in sequence rather
 * than as a single block — but splitting text into elements shreds it for assistive tech, so:
 *
 *  - the `h1` carries the full string as an `aria-label`, and
 *  - every generated span is `aria-hidden`.
 *
 * A screen reader therefore reads exactly one heading with the complete text, while the eye gets
 * the staggered entrance. The two halves keep the same roman/accent colour split as every other
 * heading on the site.
 */
export function HeroHeading({ roman, accent, className, id, variant = 'stacked' }: HeroHeadingProps) {
  const reduced = useReducedMotion() ?? false;

  const romanWords = roman.split(/\s+/).filter(Boolean);
  const accentWords = accent.split(/\s+/).filter(Boolean);
  const label = `${roman} ${accent}`;

  return (
    <h1
      id={id}
      aria-label={label}
      // The giant treatment holds one line, so its size has to come from how much there is to
      // say. `--hero-ch` hands the character count to the CSS, which works the font size back
      // from it — see `.hero-giant` in styles/index.css.
      style={variant === 'giant' ? ({ '--hero-ch': label.length } as React.CSSProperties) : undefined}
      className={cn(
        'font-display font-bold uppercase',
        variant === 'giant' ? 'hero-giant hero-ink' : 'text-h2 hero-ink',
        className,
      )}
    >
      {[
        ...romanWords.map((word) => ({ word, isAccent: false })),
        ...accentWords.map((word) => ({ word, isAccent: true })),
      ].map(({ word, isAccent }, index, all) => {
        /*
         * The accent half starts a new line.
         *
         * Stacked heroes used to wrap wherever the measure happened to run out, so the same
         * two-part headline broke after a different word on every page — "Turn public
         * information into structured insight" came out over three ragged lines. Breaking at the
         * roman/accent seam instead gives every inner hero the same two-line shape, which is the
         * split the whole type system is built around anyway.
         *
         * A flex break rather than a <br>: the words are inline-block so they can be animated
         * individually, and a zero-width flex-basis-100% spacer moves the next one to a new row
         * without putting an element inside the heading's text that would survive a copy-paste.
         */
        const startsAccentLine = isAccent && !all[index - 1]?.isAccent && index > 0;

        return (
          <Fragment key={`${word}-${index}`}>
            {startsAccentLine ? (
              <span aria-hidden="true" className="block h-0 w-full" />
            ) : null}
            <motion.span
              aria-hidden="true"
              custom={index}
              variants={heroWordVariants(reduced)}
              initial="hidden"
              animate="visible"
              className={cn('inline-block', isAccent ? 'text-accent' : 'text-ink-primary')}
            >
              {word}
            </motion.span>
            {/* A real space text node rather than a margin: a margin looks the same but leaves the
                heading's textContent as "ZeroTrustStartsHere", which is what anyone copying the
                headline would get. */}
            {index < all.length - 1 ? ' ' : null}
          </Fragment>
        );
      })}
    </h1>
  );
}
