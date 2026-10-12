import type { Transition, Variants } from 'framer-motion';

/**
 * Motion constants.
 *
 * Every number here is taken from the reference site's own `main.js`, which drives its animation
 * with GSAP + ScrollTrigger. We run framer-motion instead, so the easings below are the cubic-bezier
 * equivalents of GSAP's named eases rather than the names themselves:
 *
 *   power3.out  ->  cubic-bezier(0.215, 0.61, 0.355, 1)
 *   power2.out  ->  cubic-bezier(0.25, 0.46, 0.45, 0.94)
 *   expo.out    ->  cubic-bezier(0.16, 1, 0.3, 1)
 *
 * `expo.out` is the one the reference reaches for most — it is what gives the cards their long,
 * decelerating settle — and it happens to be the curve this project already used.
 */
export const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
export const POWER3_OUT = [0.215, 0.61, 0.355, 1] as const;
export const POWER2_OUT = [0.25, 0.46, 0.45, 0.94] as const;

/** Kept as the project-wide name for the entrance curve. */
export const ENTRANCE_EASE = EXPO_OUT;

/** Reference: `.rv` reveals run 1s; card batches run 1.1s. */
export const ENTRANCE_DURATION = 1;
export const CARD_DURATION = 1.1;

/** Reference: `.pillar` batches stagger 0.14; content rows stagger 0.12; hero words stagger 0.18. */
export const STAGGER = 0.14;
export const NEWS_STAGGER = 0.12;
export const HERO_WORD_STAGGER = 0.18;

export const HOVER_DURATION = 0.2;

/** Reference: counters run 1.8s on power2.out, not the 1.2s the original brief specified. */
export const COUNTER_DURATION_MS = 1800;

/** Reference: nav goes solid past 40px and hides on downward scroll past 300px. */
export const HEADER_SOLID_AT = 40;
export const HEADER_HIDE_AT = 300;
/** Reference: the scroll cue fades out past 60px. */
export const SCROLL_CUE_AWAY_AT = 60;

export const entranceTransition: Transition = {
  duration: ENTRANCE_DURATION,
  ease: EXPO_OUT,
};

/**
 * Sections and single elements.
 *
 * Reference: `y: 60 -> 0`, 1s, expo.out, triggered at `top 86%` — a longer throw than the 24px the
 * original brief called for, which is most of why the reference feels the way it does.
 */
export const revealVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0 } : entranceTransition,
  },
});

/** Parent of a card stack: children arrive 140ms apart, down the stack. */
export const groupVariants = (reduced: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: reduced ? { staggerChildren: 0 } : { staggerChildren: STAGGER },
  },
});

/** Card batches: the same throw, held a touch longer. */
export const cardVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0 } : { duration: CARD_DURATION, ease: EXPO_OUT },
  },
});

/**
 * Hero headline, word by word.
 *
 * Reference: each word rises 26px and fades in over 0.9s on power3.out, 0.18s apart, after a 0.35s
 * hold. The words are separate elements only for the animation — the heading still carries its full
 * text as one accessible string.
 */
export const heroWordVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.9, ease: POWER3_OUT, delay: 0.35 + index * HERO_WORD_STAGGER },
  }),
});

/** Hero eyebrow: 0.9s, 0.2s delay — it lands just before the headline starts. */
export const heroKickerVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0 } : { duration: 0.9, ease: POWER3_OUT, delay: 0.2 },
  },
});

/** Hero lead paragraph: 1s, 0.6s delay — after the headline has begun. */
export const heroLeadVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0 } : { duration: 1, ease: POWER3_OUT, delay: 0.6 },
  },
});

/**
 * The numbered strip under the hero.
 *
 * Reference: `y: 56 -> 0`, 1.1s, expo.out, 0.45s hold then 0.09s per cell — the cells arrive while
 * the headline is still settling, which is what stops the hero feeling like two separate events.
 */
export const heroStripVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 56 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { duration: CARD_DURATION, ease: EXPO_OUT, delay: 0.45 + index * 0.09 },
  }),
});

/** Scroll cue and anchor rail: they fade in last, once the hero has resolved. */
export const chromeVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1 } : { opacity: 0 },
  visible: {
    opacity: 1,
    transition: reduced ? { duration: 0 } : { duration: 1, ease: POWER2_OUT, delay: 1.05 },
  },
});

/**
 * Nav dropdown panels. Short and close to the trigger — a panel that floats in slowly reads as a
 * modal rather than as part of the header. No `exit`: the panel unmounts on close, and an exit
 * animation there would keep its links focusable for the length of the fade.
 */
export const dropdownVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced ? { duration: 0 } : { duration: 0.18, ease: POWER2_OUT },
  },
});

/**
 * The menu overlay wipes in from the right, then its links stagger in.
 *
 * Deliberately a transform rather than a clip-path: framer-motion cannot interpolate
 * `inset(...)` strings, so a clip-path wipe silently never runs and leaves the panel stuck at its
 * initial value. There is no `exit` for the same reason the wizard has none — see wizardVariants.
 */
export const overlayVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { x: '100%' },
  visible: {
    ...(reduced ? { opacity: 1 } : { x: '0%' }),
    transition: reduced ? { duration: 0 } : { duration: 0.5, ease: EXPO_OUT },
  },
});

/** Reference: overlay links stagger `0.12 + i * 0.06`. */
export const overlayItemVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.45, ease: EXPO_OUT, delay: 0.12 + index * 0.06 },
  }),
});

/**
 * Wizard steps slide in from the direction of travel.
 *
 * There is deliberately no `exit` here and no AnimatePresence around it. Under React 18 StrictMode
 * an AnimatePresence in `mode="wait"` can be left holding a frozen outgoing child whose exit
 * animation never starts — which strands the wizard on the previous step forever. Animating only
 * the incoming step reads the same and cannot stall.
 */
export const wizardVariants = (reduced: boolean): Variants => ({
  enter: (direction: number) => (reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * 48 }),
  center: {
    opacity: 1,
    x: 0,
    transition: reduced ? { duration: 0 } : { duration: 0.4, ease: EXPO_OUT },
  },
});

/**
 * Shared viewport config.
 *
 * `once: false` on purpose: the reference uses `toggleActions: 'restart none none reverse'`, so its
 * reveals play again when you scroll back up. Matching that is most of why scrolling the reference
 * back and forth feels alive rather than spent.
 *
 * `amount: 0.15` approximates ScrollTrigger's `start: 'top 86%'`.
 */
export const VIEWPORT = { once: false, amount: 0.15, margin: '0px 0px -12% 0px' } as const;

/** Card batches trigger slightly earlier, matching `start: 'top 78%'`. */
export const CARD_VIEWPORT = { once: false, amount: 0.1, margin: '0px 0px -18% 0px' } as const;
