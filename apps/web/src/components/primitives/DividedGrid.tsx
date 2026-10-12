import { Children, isValidElement, cloneElement, type ReactNode, type ReactElement } from 'react';
import { RevealGroup, type RevealTag } from './Reveal';
import { spansFor } from '@/lib/gridLayout';
import { cn } from '@/lib/cn';

export interface DividedGridProps {
  children: ReactNode;
  /** `ol` where the cells are genuinely a sequence — a five-step method, an engagement timeline. */
  as?: Extract<RevealTag, 'ul' | 'ol'>;
  /**
   * Explicit column classes, for the few grids whose shape carries meaning — a five-step method
   * reads as a progression at five across and as nothing in particular at three. Everything else
   * should leave this alone and let the grid work its own layout out.
   */
  columns?: string;
  className?: string;
  amount?: number;
  /** Set false where the grid already butts onto another ruled block. */
  bordered?: boolean;
  /** Use standalone cards instead of flush cells separated by shared hairlines. */
  separated?: boolean;
}

/**
 * A card grid whose cells are separated by hairlines rather than floated apart by a gap.
 *
 * The rules are drawn by the grid, not by the cells: the container paints an inked backdrop and
 * leaves a 1px gap between cells, so what shows through the gap *is* the divider. Every child must
 * therefore paint its own opaque background, or the backdrop shows through the whole cell. The
 * container carries its own top and bottom border, because the gap only rules BETWEEN cells and
 * without it a grid trails off into the section padding with nothing under the last row.
 *
 * The alternative — a border on each cell, suppressed on the first of each row — needs a different
 * set of `nth-child` rules for every breakpoint and silently breaks the moment the column count
 * changes.
 *
 * ---- Why the layout is computed rather than passed in ----
 *
 * Every call site used to name its own column class, and six of them named one that did not divide
 * into the number of cards they had: five modules in a four-column grid left three empty cells, and
 * because an empty cell shows the inked backdrop rather than a card, the hole was not white space —
 * it was a grey block. On the AINerve page that grey block was a quarter of the section.
 *
 * So the grid counts its children and works it out. It lays out on a twelve-column base, picks
 * three or four across, and hands any short final row to the cards that are in it: two leftover
 * cards take six columns each, three take four each. There is no hole to show through, at any card
 * count, without anyone having to notice.
 *
 * The spans travel as custom properties rather than classes because they are per-child and
 * per-breakpoint, which is exactly what an inline style cannot express and a custom property can —
 * the media queries live in `.divided-grid` in styles/index.css.
 */
export function DividedGrid({
  children,
  as = 'ul',
  columns,
  className,
  amount = 0.1,
  bordered = true,
  separated = true,
}: DividedGridProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const auto = columns === undefined;

  const spans = spansFor(items.length);

  const laid = !auto || separated
    ? children
    : items.map((child, index) => {
        const span = spans[index];
        const element = child as ReactElement<{ style?: React.CSSProperties }>;
        return cloneElement(element, {
          style: {
            ...element.props.style,
            '--col-span': span,
            /* Two across at tablet; an odd card at the end takes the full width rather than
               leaving half a row of backdrop. */
            '--col-span-md': index === items.length - 1 && items.length % 2 === 1 ? 6 : 3,
          } as React.CSSProperties,
        });
      });

  return (
    <RevealGroup
      as={as}
      amount={amount}
      className={cn(
        'grid',
        separated ? 'auto-rows-fr gap-5' : 'gap-px bg-hairline/15',
        !separated && bordered && 'border-y border-hairline/15',
        separated && '[&>li]:rounded-md [&>li]:border [&>li]:border-hairline/30 [&>li]:shadow-sm',
        auto ? (separated ? 'sm:grid-cols-2 lg:grid-cols-3' : 'divided-grid') : columns,
        className,
      )}
    >
      {laid}
    </RevealGroup>
  );
}
