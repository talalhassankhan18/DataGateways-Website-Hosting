import { motion, useReducedMotion } from 'framer-motion';
import type { IndexedCard } from '@datagateways/shared';
import { IndexNumber } from '@/components/primitives/IndexNumber';
import { cardVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';

export interface StepCardProps {
  card: IndexedCard;
  className?: string;
  /**
   * Set by `DividedGrid`, which writes this cell's column span here as a custom property. Must be
   * forwarded to the rendered element or the cell falls back to a whole row.
   */
  style?: React.CSSProperties;
}

/**
 * One step of a numbered method, or one entry in a coverage list — sized for a row of four to seven
 * rather than a grid of three.
 *
 * Deliberately lighter than `ModuleCard`: a step is one move in a sequence, and giving each one a
 * summary line, a paragraph and a feature list would turn a five-step method into five products.
 * Paints its own background because `DividedGrid` rules between the cells.
 */
export function StepCard({ card, className, style }: StepCardProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.li
      variants={cardVariants(reduced)}
      style={style}
      className={cn('flex h-full flex-col bg-bg-surface p-7 lg:p-8', className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <IndexNumber value={card.index} />
        {card.tag ? (
          <span className="text-eyebrow uppercase tracking-[0.18em] text-ink-dim">{card.tag}</span>
        ) : null}
      </div>

      <h3 className="mt-5 text-h4 font-bold uppercase leading-[1.15] text-ink-primary">
        {card.title}
      </h3>
      <p className="mt-3 text-body-sm leading-[1.65] text-ink-secondary">{card.blurb}</p>
    </motion.li>
  );
}
