import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { HeroSlide } from '@/content/home';
import { Container } from '@/components/primitives/Container';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { HeroHeading } from '@/components/primitives/HeroHeading';
import { HeroCard } from '@/components/content/HeroCard';
import { chromeVariants, heroLeadVariants, SCROLL_CUE_AWAY_AT } from '@/lib/motion';
import { useDocumentVisible, useScrolledPast } from '@/lib/hooks';
import { scrollToElement } from '@/lib/useSmoothScroll';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface HeroSliderProps {
  id: string;
  slides: readonly HeroSlide[];
  welcome: string;
  lead: string;
  /** Background layer — the footage, its poster, or the authored canvas. */
  media: ReactNode;
  scrollCueTarget?: string;
}

/** How long each headline holds before the next capability area takes over. */
const DWELL_MS = 6000;

/**
 * The landing hero: the reference's own layout, carrying five capability areas instead of one.
 *
 * This is deliberately NOT a generic carousel. It keeps dtv.sa's hero grammar intact — one giant
 * centred line that never wraps, arriving word by word; five cells along the hero floor clipped to
 * a peek and opening on hover or focus; the headline stepping back to 0.14 opacity while a cell is
 * open; the scroll cue retiring at the same moment. The only thing added is that the headline now
 * rotates through the five areas rather than stating one.
 *
 * The cells are the same `HeroCard` the strip always used, so the accordion behaviour, the peek
 * height and the borders all come from the existing `.hero-card` rules rather than a second
 * implementation that would drift from them.
 *
 * Rotation stops while the tab is hidden, while a cell is hovered or focused (you are reading that
 * cell, not waiting for the next headline), and permanently under reduced motion — where the first
 * area simply renders and the cells remain the way through.
 */
export function HeroSlider({ id, slides, welcome, lead, media, scrollCueTarget }: HeroSliderProps) {
  const reduced = useReducedMotion() ?? false;
  const visible = useDocumentVisible();
  const cueAway = useScrolledPast(SCROLL_CUE_AWAY_AT);

  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  const playing = !reduced && visible && !held && slides.length > 1;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % slides.length), DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active, slides.length]);

  const slide = slides[active];

  return (
    <section
      id={id}
      // ink-on-dark rather than a tone: the background is the media itself, but everything over
      // it — including the canvas backdrop, which reads --ink-primary — needs the light-on-dark set.
      className="hero-cards-host ink-on-dark relative isolate min-h-[100svh] overflow-clip pt-[68svh] lg:min-h-[max(100svh,40rem)] lg:pt-0"
      // Holding on hover covers the cells too, so reading one does not race the rotation.
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setHeld(false);
      }}
    >
      <div className="absolute inset-0 -z-20">{media}</div>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      {/* The standing welcome line sits above the rotating headline so the page always says who
          this is, whichever area is showing. */}
      <Container className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)+4rem)] z-[3]">
        <motion.div
          variants={heroLeadVariants(reduced)}
          initial="hidden"
          animate="visible"
          className="hero-ink text-center"
        >
          <Eyebrow
            className="justify-center whitespace-nowrap font-display !text-[clamp(1.3rem,2.4vw,2.1rem)] font-bold"
            showRule={false}
          >
            {welcome}
          </Eyebrow>
          <p className="mx-auto mt-12 max-w-measure font-display text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-ink-secondary">
            {lead}
          </p>
        </motion.div>
      </Container>

      {/*
        Keyed on the slide, so the per-word entrance replays as each area arrives. A live region,
        because the heading changes under the reader without any action from them.

        No AnimatePresence: `mode="wait"` would hold the incoming headline until the outgoing one
        finished exiting, and an exit that never runs strands the hero — the same hazard lib/motion
        already documents for the contact wizard.
      */}
      <div aria-live="polite" aria-atomic="true">
        <HeroHeading
          key={slide.id}
          variant="giant"
          roman={slide.heading.roman}
          accent={slide.heading.accent}
        />
      </div>

      <ul className="hero-cards">
        {slides.map((item, index) => (
          <HeroCard
            key={item.id}
            index={index}
            active={index === active}
            progress={playing && index === active ? DWELL_MS : 0}
            card={{
              index: item.index,
              tag: item.eyebrow,
              title: item.shortTitle,
              blurb: item.blurb,
              href: item.href,
            }}
          />
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
