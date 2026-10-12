import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Wraps a callback so that it cannot be re-entered while it is already running.
 *
 * This exists for one specific and non-obvious reason. Lenis attaches its own `onNativeScroll`
 * listener to the same window we re-publish onto, so a bare `dispatchEvent(new Event('scroll'))`
 * feeds straight back into Lenis, which emits another Lenis scroll event, which re-dispatches —
 * recursing until the stack blows with `Maximum call stack size exceeded` on the first wheel
 * gesture. The guard cuts that cycle at the first turn.
 *
 * It stays synchronous rather than deferring to rAF: the consumers are all idempotent
 * rAF-throttled reads already, and coalescing here would only add a frame of lag to the header
 * and the statement fill.
 *
 * `finally` matters as much as the flag. If a listener throws, a bare assignment would leave the
 * flag stuck true and silently kill every scroll update for the rest of the session.
 */
export const reentrantSafe = (fn: () => void): (() => void) => {
  let running = false;

  return () => {
    if (running) return;
    running = true;
    try {
      fn();
    } finally {
      running = false;
    }
  };
};

/**
 * Smooth scrolling, matching the reference's feel.
 *
 * The reference runs Lenis at `duration: 1.1` with `smoothWheel`, and — importantly — only when
 * `(hover: hover)` matches. That gate is not cosmetic: hijacking scroll on a touch device fights
 * the platform's own momentum and makes the page feel broken, so phones and tablets keep native
 * scrolling. Reduced-motion users keep it too.
 *
 * The instance is exposed on `window.__lenis` so anchor navigation can hand it a target rather than
 * calling `scrollIntoView`, which Lenis would otherwise fight.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (reduced || !canHover) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.__lenis = lenis;

    /*
     * Lenis emits its own scroll event and does not reliably produce a native one. Every scroll
     * consumer on this site — the header state, the anchor rail's scroll-spy, the scroll cue, the
     * statement's fill — listens for the native event, so rather than rewiring each of them to know
     * about Lenis, the Lenis event is re-published as the native one. They keep working unchanged,
     * and nothing else has to care which library owns the scroll position.
     */
    const republish = reentrantSafe(() => window.dispatchEvent(new Event('scroll')));
    lenis.on('scroll', republish);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.off('scroll', republish);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [enabled]);
}

/**
 * Scrolls to an element through Lenis when it is running, and natively when it is not.
 *
 * Anchor links must go through this: with Lenis active, a plain `scrollIntoView` and Lenis's own
 * animation both try to own the scroll position and the page stutters between them.
 */
export const scrollToElement = (element: HTMLElement) => {
  if (window.__lenis) {
    window.__lenis.scrollTo(element, { duration: 1.2 });
    return;
  }
  element.scrollIntoView({ behavior: 'smooth' });
};
