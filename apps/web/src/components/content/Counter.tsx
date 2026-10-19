import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import type { CounterItem } from '@datagateways/shared';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { formatCounter, parseCounter } from '@/lib/format';
import { COUNTER_DURATION_MS } from '@/lib/motion';
import { cn } from '@/lib/cn';

export interface CounterProps {
  item: CounterItem;
  /**
   * Position in the row. The suffix alternates between the two display accents, as the reference
   * does — it is what stops a row of four white numbers reading as a table.
   */
  index?: number;
  className?: string;
}

/**
 * Counts from zero to the target once, when it scrolls into view.
 *
 * Two details that are easy to get wrong: the number is sized by an invisible copy of its final
 * value so the row does not reflow as digits are added, and the animating digits are hidden from
 * assistive tech in favour of one static announcement — otherwise a screen reader reads a slot
 * machine.
 *
 * A value with no digits in it (the em dash the About row uses while it waits for real figures)
 * renders as-is and never animates.
 */
export function Counter({ item, index = 0, className }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  // `once: false` matches the reference's `toggleActions: 'restart none none reverse'` — the count
  // runs again when the row is scrolled back to, rather than sitting spent after one pass.
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const reduced = useReducedMotion() ?? false;

  const parsed = parseCounter(item.value.value);
  const target = parsed.numeric;

  const [display, setDisplay] = useState(() => (target === null || reduced ? (target ?? 0) : 0));

  useEffect(() => {
    if (target === null) return;

    if (reduced) {
      setDisplay(target);
      return;
    }

    if (!inView) {
      setDisplay(0);
      return;
    }

    let frame = 0;
    let start = 0;

    const tick = (time: number) => {
      if (start === 0) start = time;
      const progress = Math.min(1, (time - start) / COUNTER_DURATION_MS);
      // power2.out — the reference's curve. Cubic was noticeably snappier than the original.
      const eased = 1 - Math.pow(1 - progress, 2);
      setDisplay(target * eased);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [inView, reduced, target]);

  return (
    <div ref={ref} className={cn('flex flex-col items-center text-center', className)}>
      <span className="sr-only">{`${parsed.raw} ${item.label}`}</span>

      <PlaceholderBadge item={item.value} as="div">
        <p aria-hidden="true" className="relative font-display text-counter font-bold text-ink-primary">
          <span className="invisible tabular-nums">{parsed.raw}</span>
          <span className="absolute inset-0 tabular-nums">
            {target === null ? (
              parsed.raw
            ) : (
              <>
                {formatCounter(display, parsed.decimals)}
                {parsed.suffix ? (
                  <span className={index % 2 === 0 ? 'text-accent-teal' : 'text-accent-amber'}>
                    {parsed.suffix}
                  </span>
                ) : null}
              </>
            )}
          </span>
        </p>
      </PlaceholderBadge>

      {/*
        Two lines reserved for the label.

        "Data Quality Detectors" wraps to two lines in a quarter-width column while "Regions
        Covered" fits on one, so without a reservation the figures in a row sit over labels of
        different depths and the band ends on a ragged edge. It also stops the counter slider
        changing height as it rotates between a group whose labels wrap and one whose labels do
        not, which read as the whole band twitching.
      */}
      <p
        aria-hidden="true"
        className="mt-4 flex min-h-[2.8em] max-w-[18ch] items-start justify-center text-balance text-body-sm font-light leading-[1.4] text-ink-secondary"
      >
        {item.label}
      </p>
    </div>
  );
}
