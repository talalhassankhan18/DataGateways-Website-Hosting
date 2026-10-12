import { motion, useReducedMotion } from 'framer-motion';
import type { ProductModule } from '@datagateways/shared';
import { cardVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';

export interface ModuleCardProps {
  card: ProductModule;
  className?: string;
  compact?: boolean;
  /**
   * Set by `DividedGrid`, which writes this cell's column span here as a custom property. Must be
   * forwarded to the rendered element or the cell falls back to a whole row.
   */
  style?: React.CSSProperties;
}

/**
 * One capability group: index, title, a summary line and a concise paragraph.
 *
 * The cell paints its own background rather than sitting transparent, because the grid around it
 * draws the dividers by showing an inked backdrop through a 1px gap — see `DividedGrid`. That is
 * the only reason this component has a background at all, and dropping it drops every rule in the
 * grid with it.
 *
 * Motion is variants-only, with no `initial`/`animate` of its own, so the stagger is driven by the
 * RevealGroup above rather than firing on mount whether or not anyone has scrolled here.
 */
export function ModuleCard({ card, className, compact = false, style }: ModuleCardProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.li
      variants={cardVariants(reduced)}
      style={style}
      className={cn(
        'group/module relative flex h-full flex-col bg-bg-surface p-7 transition-colors duration-hover lg:p-9',
        'hover:bg-bg-elevated/50',
        className,
      )}
    >
      {/* The accent rule along the top edge, drawn on hover only. It is the one moving part on an
          otherwise still card, and it marks which cell the pointer is in without the card itself
          lifting off a grid whose whole logic is that the cells are flush. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-entrance group-hover/module:scale-x-100"
      />

      <p
        aria-hidden="true"
        className="font-mono text-index tabular-nums text-accent-ink/70 transition-colors duration-hover group-hover/module:text-accent-ink"
      >
        {card.index}
      </p>

      <h3 className="mt-5 text-h4 font-bold uppercase leading-[1.15] tracking-[-0.005em] text-ink-primary">
        {card.title}
      </h3>

      {/* The summary is the one line someone skimming the grid will actually read, so it carries
          the weight and the paragraph below it does not compete for the same job. */}
      {card.summary ? (
        <p className="mt-3 text-body font-medium leading-[1.4] text-ink-primary/85">
          {card.summary}
        </p>
      ) : null}

      {!compact ? (
        <p className="mt-3.5 text-body-sm leading-[1.65] text-ink-secondary">{card.body}</p>
      ) : null}
    </motion.li>
  );
}
