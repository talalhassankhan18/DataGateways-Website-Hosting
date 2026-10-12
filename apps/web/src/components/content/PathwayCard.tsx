import { Link } from 'react-router-dom';
import type { IndexedCard } from '@datagateways/shared';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { IndexNumber } from '@/components/primitives/IndexNumber';
import { motion, useReducedMotion } from 'framer-motion';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { cardVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface PathwayCardProps {
  card: IndexedCard;
  className?: string;
  /**
   * Set by `DividedGrid`, which writes this cell's column span here as a custom property. Must be
   * forwarded to the rendered element or the cell falls back to a whole row.
   */
  style?: React.CSSProperties;
}

/**
 * One cell of the numbered strip that runs directly beneath the hero, as the reference lays it out:
 * a flush row of cells divided by hairlines rather than a gapped grid of filled cards. The index
 * sits above a large uppercase title, and the blurb carries the detail the reference leaves out —
 * these cells name real products, so they have to say more than a single word.
 *
 * When the cell links somewhere the title holds the only anchor, stretched across the whole cell
 * with an ::after overlay. The arrow is then decorative — five cells each containing a second link
 * reading "Explore" is the kind of thing that passes an automated audit and fails a real one.
 */
export function PathwayCard({ card, className, style }: PathwayCardProps) {
  const reduced = useReducedMotion() ?? false;

  const body = (
    <>
      <div>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <IndexNumber value={card.index} />
          {card.tag ? (
            <span className="text-eyebrow uppercase tracking-[0.18em] text-ink-dim">{card.tag}</span>
          ) : null}
        </div>

        <h3 className="mt-6 text-h3 font-bold uppercase text-ink-primary">
          {card.href ? (
            <Link
              to={card.href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {card.title}
            </Link>
          ) : (
            card.title
          )}
        </h3>

        <p className="mt-3 text-body-sm text-ink-secondary">{card.blurb}</p>
      </div>

      {card.href ? <ArrowLink asText label={site.ui.explore} className="mt-6" /> : null}
    </>
  );

  return (
    <motion.li
      variants={cardVariants(reduced)}
      style={style}
      className={cn(
        // The cell paints its own background and draws no rules of its own: DividedGrid rules
        // between the cells by showing an inked backdrop through a 1px gap, and closes the block
        // top and bottom. The previous approach — a top rule on every cell plus a left rule from
        // the second column on — needed a different set of nth-child rules per breakpoint, left
        // the last row unruled, and came apart whenever a grid changed its column count.
        'group/card relative flex h-full flex-col justify-between bg-bg-surface p-6 transition-colors duration-hover lg:px-8 lg:py-10',
        card.href && 'hover:bg-bg-elevated/60 focus-within:bg-bg-elevated/60',
        className,
      )}
    >
      {card.unverified ? (
        <PlaceholderBadge as="div" item={card.unverified} className="h-full">
          {body}
        </PlaceholderBadge>
      ) : (
        body
      )}
    </motion.li>
  );
}
