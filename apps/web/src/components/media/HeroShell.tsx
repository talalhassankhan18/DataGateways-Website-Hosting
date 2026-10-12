import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import type { Heading } from '@datagateways/shared';
import { Container } from '@/components/primitives/Container';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { HeroHeading } from '@/components/primitives/HeroHeading';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { chromeVariants, heroKickerVariants, heroLeadVariants, SCROLL_CUE_AWAY_AT } from '@/lib/motion';
import { useScrolledPast } from '@/lib/hooks';
import { scrollToElement } from '@/lib/useSmoothScroll';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface HeroShellProps {
  id: string;
  heading: Heading;
  /** The background layer — a video, an image, or the authored canvas backdrop. */
  media: ReactNode;
  eyebrow?: string;
  subhead?: Heading;
  lead?: string;
  children?: ReactNode;
  /** Home page hero is full height; inner pages are shorter so the content starts sooner. */
  compact?: boolean;
  /** Renders the scroll cue, linking to the next section on the page. */
  scrollCueTarget?: string;
  className?: string;
}

export function HeroShell({
  id,
  heading,
  media,
  eyebrow,
  subhead,
  lead,
  children,
  compact = false,
  scrollCueTarget,
  className,
}: HeroShellProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const cueAway = useScrolledPast(SCROLL_CUE_AWAY_AT);

  /*
   * Hero parallax, scrubbed to scroll rather than played on a timer.
   *
   * Reference: the hero's inner content travels 18% down and fades to 0.25 opacity between
   * `top top` and `bottom 35%`. It is what makes the next section feel like it slides over the
   * hero instead of merely following it.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end 0.35'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        // ink-on-dark, not a tone: the hero's background is the media itself, but everything on
        // top of it — including the canvas backdrop, which reads --ink-primary — needs the
        // light-on-dark ink set.
        'ink-on-dark relative isolate flex overflow-hidden',
        compact ? 'items-end' : 'items-center',
        compact ? 'min-h-[62svh]' : 'min-h-[92svh]',
        className,
      )}
    >
      <div className="absolute inset-0 -z-20">{media}</div>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative w-full"
      >
        <Container className={cn(compact ? 'pb-16 pt-36 lg:pb-24' : 'py-24 lg:py-32')}>
          {eyebrow ? (
            <motion.div variants={heroKickerVariants(reduced)} initial="hidden" animate="visible">
              <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
            </motion.div>
          ) : null}

          {/* The measure has to sit on the heading itself: `ch` resolves against the element's own
              font-size, so on a wrapper it would use body size and wrap the hero far too early. */}
          <HeroHeading roman={heading.roman} accent={heading.accent} className="max-w-[12ch]" />

          {subhead ? (
            <motion.div variants={heroLeadVariants(reduced)} initial="hidden" animate="visible">
              <SplitHeading
                as="p"
                size="h3"
                roman={subhead.roman}
                accent={subhead.accent}
                className="hero-ink mt-8 max-w-measure-sm"
              />
            </motion.div>
          ) : null}

          {lead ? (
            <motion.p
              variants={heroLeadVariants(reduced)}
              initial="hidden"
              animate="visible"
              className="hero-ink mt-8 max-w-measure text-lead text-ink-secondary"
            >
              {lead}
            </motion.p>
          ) : null}

          {children}
        </Container>
      </motion.div>

      {scrollCueTarget ? (
        <motion.a
          href={`#${scrollCueTarget}`}
          variants={chromeVariants(reduced)}
          initial="hidden"
          animate="visible"
          onClick={(event) => {
            const target = document.getElementById(scrollCueTarget);
            if (!target) return;
            event.preventDefault();
            scrollToElement(target);
          }}
          className={cn(
            'absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-eyebrow uppercase text-ink-dim transition-[color,opacity] duration-hover hover:text-ink-primary md:flex',
            // Reference: the cue retires as soon as you have started scrolling.
            cueAway && 'pointer-events-none !opacity-0',
          )}
        >
          {site.ui.scrollCue}
          <span
            aria-hidden="true"
            className="block h-10 w-px animate-scroll-cue bg-gradient-to-b from-accent to-transparent"
          />
        </motion.a>
      ) : null}
    </section>
  );
}
