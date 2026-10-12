import { motion, useReducedMotion } from 'framer-motion';
import { RevealGroup } from '@/components/primitives/Reveal';
import { cardVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';

export interface ComparisonTableProps {
  columns: readonly [string, string];
  rows: readonly (readonly [string, string])[];
  /** id of the heading this table is described by. */
  labelledBy?: string;
  className?: string;
}

/**
 * Two columns of the same statements, answered the old way and this way.
 *
 * A real `table`, not a pair of stacked lists: these are row-wise comparisons, and the association
 * between "Excel files spread across teams" and its replacement is the entire content. A screen
 * reader reading two unrelated lists loses it completely.
 *
 * At phone width the table collapses to stacked pairs — the `th` scope keeps the header
 * association intact once the visual columns are gone, and each pair keeps its own rule so the
 * boundary between rows survives the collapse.
 */
export function ComparisonTable({ columns, rows, labelledBy, className }: ComparisonTableProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <RevealGroup
      as="div"
      amount={0.1}
      className={cn('overflow-hidden rounded-sm border border-hairline/15', className)}
    >
      <table aria-labelledby={labelledBy} className="w-full border-collapse text-left">
        <caption className="sr-only">
          {columns[0]} compared with {columns[1]}
        </caption>

        <thead className="hidden md:table-header-group">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  'w-1/2 bg-bg-elevated px-6 py-5 text-eyebrow uppercase tracking-[0.18em] lg:px-8',
                  index === 0
                    ? 'text-ink-dim'
                    : 'border-l border-hairline/15 text-accent-ink',
                )}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map(([before, after]) => (
            <motion.tr
              key={before}
              variants={cardVariants(reduced)}
              className="block border-t border-hairline/15 md:table-row"
            >
              <td className="block px-6 pb-3 pt-6 align-top text-body-sm text-ink-secondary md:table-cell md:w-1/2 md:py-6 lg:px-8">
                {/* Visible only while the columns are stacked, where nothing else says which
                    answer this is. */}
                <span className="mb-1.5 block text-eyebrow uppercase tracking-[0.18em] text-ink-dim md:hidden">
                  {columns[0]}
                </span>
                {before}
              </td>

              <td className="block px-6 pb-6 pt-3 align-top text-body-sm font-medium text-ink-primary md:table-cell md:w-1/2 md:border-l md:border-hairline/15 md:py-6 lg:px-8">
                <span className="mb-1.5 block text-eyebrow uppercase tracking-[0.18em] text-accent-ink md:hidden">
                  {columns[1]}
                </span>
                {after}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </RevealGroup>
  );
}
