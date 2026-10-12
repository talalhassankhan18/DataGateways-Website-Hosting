import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import type { Heading } from '@datagateways/shared';
import type { CounterGroup } from '@/content/home';
import { Counter } from './Counter';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { EXPO_OUT } from '@/lib/motion';
import { useDocumentVisible } from '@/lib/hooks';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface CounterSliderProps {
  groups: readonly CounterGroup[];
  /** The band's stable accessible name. Never shown — the visible headline rotates. */
  label: Heading;
  /** id the enclosing Section points its `aria-labelledby` at. */
  headingId: string;
}

/** Long enough to read four figures and watch them count up. */
const DWELL_MS = 5000;

/**
 * The blue band: three products, one after another, on a five-second dwell.
 *
 * There are no category tabs. That is the client's brief, and it costs the band its most obvious
 * affordance, so two things carry the load instead. The headline advances with the panel — a set of
 * figures that changes under a fixed title reads as a glitch, and one that changes under its own
 * title reads as a new subject. And a three-segment rule shows which panel is up and how long it
 * has left, so the change is expected rather than startling.
 *
 * ---- Why there is still one button ----
 *
 * WCAG 2.2.2 requires a way to pause anything that auto-updates for longer than five seconds
 * alongside other content, and this band runs for fifteen. Hovering pauses it, but a hover is not
 * available to a keyboard or a touch user. So the tabs are gone and a single pause control stays —
 * it is not a category button, it is the thing that makes removing them legal.
 *
 * ---- What assistive tech gets ----
 *
 * Not this. The rotating panel is `aria-hidden`, and every figure in every group is rendered once,
 * statically, in the visually hidden block at the end. A live region would announce twelve figures
 * three times over; hiding the rotation and stating the content once is both quieter and complete,
 * and nobody has to wait fifteen seconds for the third panel to come round. Same approach the hero
 * headline takes with its `aria-label`.
 *
 * Under reduced motion nothing rotates and every group renders stacked, because the alternative —
 * freezing on the first panel — silently drops two thirds of the content.
 */
export function CounterSlider({ groups, label, headingId }: CounterSliderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const visible = useDocumentVisible();
  const onScreen = useInView(ref, { amount: 0.4 });

  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);

  const playing = !reduced && visible && onScreen && !held && !paused && groups.length > 1;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % groups.length), DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active, groups.length]);

  const group = groups[active];

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setHeld(false);
      }}
    >
      {/* Never shown, but it is still the band's heading and still goes through SplitHeading —
          which is the invariant SplitHeading.test.tsx holds, and it caught this. */}
      <SplitHeading
        as="h2"
        id={headingId}
        roman={label.roman}
        accent={label.accent}
        className="sr-only"
      />

      {reduced ? (
        /* Everything at once, in order. Nothing rotates and nothing is hidden. */
        <div className="flex flex-col gap-16">
          {groups.map((item) => (
            <section key={item.id} aria-label={item.label}>
              <SplitHeading as="h3" size="h2" roman={item.heading.roman} accent={item.heading.accent} />
              <Figures group={item} className="mt-12" />
            </section>
          ))}
        </div>
      ) : (
        <>
          {/* Stacked at phone width. Sharing a row there squeezed the headline to 176px and wrapped
              it over four lines to make room for two controls that need about 120. */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/*
              Keyed on the group so the per-word entrance replays as each product arrives.

              `min-w-0` because a flex child defaults to `min-width: auto` and will not shrink below
              its own content: without it the headline sits at its max-content width and runs 149px
              past the viewport at 390px instead of wrapping.
            */}
            <div aria-hidden="true" className="min-h-[2.4em] min-w-0 lg:min-h-[2.2em] lg:flex-1">
              <SplitHeading
                key={group.id}
                as="p"
                size="h2"
                roman={group.heading.roman}
                accent={group.heading.accent}
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Position and dwell. Decorative: the pause control below states the same thing in
                  words, and a screen reader has the whole figure set regardless. */}
              <div aria-hidden="true" className="flex items-center gap-1.5">
                {groups.map((item, index) => (
                  <span
                    key={item.id}
                    className={cn(
                      'block h-0.5 w-8 overflow-hidden rounded-full',
                      index === active ? 'bg-ink-primary/25' : 'bg-ink-primary/15',
                    )}
                  >
                    {index === active ? (
                      <motion.span
                        key={`${item.id}-${String(playing)}`}
                        initial={{ scaleX: playing ? 0 : 1 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: playing ? DWELL_MS / 1000 : 0, ease: 'linear' }}
                        className="block h-full w-full origin-left bg-ink-primary"
                      />
                    ) : null}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="-mr-2.5 flex h-11 w-11 items-center justify-center rounded-sm text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
              >
                {paused ? (
                  <Play aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <Pause aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">
                  {paused ? site.ui.counterResume : site.ui.counterPause}
                </span>
              </button>
            </div>
          </div>

          {/*
            Clipped horizontally because the panel slides in from x:32. If that entrance is ever
            interrupted — a stalled frame loop, an interrupted transition — the panel would
            otherwise sit 32px to the right and give the whole page a horizontal scrollbar.

            Keyed remount with an entrance only, never AnimatePresence in `mode="wait"`: that mode
            withholds the incoming panel until the outgoing one has finished exiting, so an exit
            that cannot run strands the band on the previous product. Same reasoning as the hero
            and the contact wizard — see the note on wizardVariants in lib/motion.
          */}
          <div aria-hidden="true" className="mt-14 min-h-[13rem] overflow-x-clip">
            <motion.div
              key={group.id}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EXPO_OUT }}
            >
              <Figures group={group} />
            </motion.div>
          </div>

          {/* Every figure, once, for assistive tech. See the note above. */}
          <div className="sr-only">
            {groups.map((item) => (
              <section key={item.id} aria-label={item.label}>
                <h3>
                  {item.heading.roman} {item.heading.accent}
                </h3>
                <dl>
                  {item.items.map((figure) => (
                    <div key={figure.label}>
                      <dt>{figure.label}</dt>
                      <dd>{figure.value.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The figure row. Column count follows the figure count so a group of three spreads across the
 * band rather than leaving a quarter of it empty next to a group of four.
 */
function Figures({ group, className }: { group: CounterGroup; className?: string }) {
  return (
    <ul
      className={cn(
        'grid gap-x-8 gap-y-12 sm:grid-cols-2',
        group.items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
        className,
      )}
    >
      {group.items.map((item, index) => (
        <li key={item.label}>
          <Counter item={item} index={index} />
        </li>
      ))}
    </ul>
  );
}
