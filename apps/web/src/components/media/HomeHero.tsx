import { motion, useReducedMotion } from 'framer-motion';
import type { Heading, IndexedCard } from '@datagateways/shared';
import { HeroHeading } from '@/components/primitives/HeroHeading';
import { HeroCard } from '@/components/content/HeroCard';
import { chromeVariants, SCROLL_CUE_AWAY_AT } from '@/lib/motion';
import { useScrolledPast } from '@/lib/hooks';
import { scrollToElement } from '@/lib/useSmoothScroll';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';
import { HeroMedia, type HeroMediaSpec } from './HeroMedia';

export interface HomeHeroProps {
  id: string;
  heading: Heading;
  media: HeroMediaSpec;
  cards: readonly IndexedCard[];
  /** Id of the section the scroll cue jumps to. */
  scrollCueTarget?: string;
}

/**
 * The landing hero, laid out as the reference lays its own out: full-bleed footage, one centred
 * headline that never wraps, and the five pathway cells overlaid along the floor as an accordion
 * rather than stacked in a band underneath.
 *
 * This is deliberately not `HeroShell`. The shell puts its content in a bottom-left column and
 * scrubs a parallax over the whole block, which is right for the inner pages and wrong here —
 * the headline is centred in its own space and the cards are pinned to the floor, so the two
 * cannot travel together.
 */
export function HomeHero({ id, heading, media, cards, scrollCueTarget }: HomeHeroProps) {
  const reduced = useReducedMotion() ?? false;
  const cueAway = useScrolledPast(SCROLL_CUE_AWAY_AT);

  return (
    <section
      id={id}
      // ink-on-dark, not a tone: the background is the footage itself, but everything over it —
      // including the canvas backdrop, which reads --ink-primary — needs the light-on-dark set.
      /*
       * The top padding is what holds the media and the centred headline open above the stacked
       * cards below lg; from lg the cards become an overlay pinned to the floor and it goes.
       *
       * It has to be padding on the section, not a margin on the list. A margin there collapses
       * straight through the section — `overflow: clip` does not open a block formatting context
       * the way `hidden` does — and drags the whole hero down the page, leaving a band of bare
       * background above it.
       */
      className="hero-cards-host ink-on-dark relative isolate min-h-[100svh] overflow-clip pt-[68svh] lg:min-h-[max(100svh,40rem)] lg:pt-0"
    >
      <div className="absolute inset-0 -z-20">
        <HeroMedia media={media} />
      </div>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <HeroHeading variant="giant" roman={heading.roman} accent={heading.accent} />

      <ul className="hero-cards">
        {cards.map((card, index) => (
          <HeroCard key={card.title} card={card} index={index} />
        ))}
      </ul>

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
            'hero-scroll-cue absolute bottom-[calc(var(--cards-peek)+1.5rem)] left-1/2 z-[5] hidden -translate-x-1/2 flex-col items-center gap-3 text-eyebrow uppercase text-ink-dim transition-[color,opacity] duration-hover hover:text-ink-primary lg:flex',
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
