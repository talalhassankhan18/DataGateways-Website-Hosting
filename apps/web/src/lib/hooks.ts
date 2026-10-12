import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Which section is currently under the reader. Drives the anchor rail.
 * rootMargin biases the "active" band towards the top third of the viewport so the rail changes
 * when a section becomes the thing you are reading, not when it first peeks into view.
 */
export const useScrollSpy = (ids: readonly string[]): string => {
  const [active, setActive] = useState(ids[0] ?? '');
  const key = ids.join('|');

  useEffect(() => {
    const sectionIds = key.split('|').filter(Boolean);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best = '';
        let bestRatio = 0;
        for (const id of sectionIds) {
          const ratio = ratios.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { threshold: [0, 0.2, 0.5, 0.8, 1], rootMargin: '-15% 0px -50% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
};

/**
 * True once the page has scrolled past `threshold`. State only flips at the boundary, so the
 * header re-renders twice per page rather than on every scroll frame.
 */
export const useScrolledPast = (threshold = 80): boolean => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      setPast(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return past;
};

/** Locks page scroll without the layout jump that removing the scrollbar normally causes. */
export const useLockBodyScroll = (locked: boolean): void => {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
};

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps Tab inside `container` while `active`, and returns focus to whatever was focused before.
 * Deliberately dependency-free — a focus trap is twenty lines, and this one is testable.
 */
export const useFocusTrap = (
  container: React.RefObject<HTMLElement | null>,
  active: boolean,
): void => {
  useEffect(() => {
    if (!active) return;
    const node = container.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === firstItem || !node.contains(current))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && current === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, container]);
};

/** Calls `handler` on Escape while `active`. */
export const useEscapeKey = (active: boolean, handler: () => void): void => {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') saved.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active]);
};

/** True while the document is visible. Used to park the canvas backdrop in background tabs. */
export const useDocumentVisible = (): boolean => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const read = () => setVisible(document.visibilityState === 'visible');
    read();
    document.addEventListener('visibilitychange', read);
    return () => document.removeEventListener('visibilitychange', read);
  }, []);

  return visible;
};

/** Matches a media query, kept in sync. Used for the 768px hero-video gate. */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const read = () => setMatches(list.matches);
    read();
    list.addEventListener?.('change', read);
    return () => list.removeEventListener?.('change', read);
  }, [query]);

  return matches;
};

/** A stable id for aria-labelledby wiring, without pulling in a polyfill. */
/**
 * Whether this visitor has asked to be spared a large download.
 *
 * Reads the Network Information API, which reports the browser's Data Saver setting and an
 * effective connection class. Only Chromium ships it, so an absent `connection` means no, not
 * unknown — the alternative is withholding the hero from every Safari and Firefox visitor on the
 * strength of a guess.
 *
 * Re-reads on `change`, because a phone moving from wifi to a weak cell signal changes its answer
 * and the page is not reloaded when it does.
 */
export const useSaveData = (): boolean => {
  const read = () => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (!connection) return false;
    if (connection.saveData) return true;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  };

  const [saveData, setSaveData] = useState(read);

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: EventTarget }
    ).connection;
    if (!connection) return;

    const onChange = () => setSaveData(read());
    connection.addEventListener('change', onChange);
    return () => connection.removeEventListener('change', onChange);
  }, []);

  return saveData;
};

export const useStableCallback = <T extends (...args: never[]) => unknown>(callback: T): T => {
  const ref = useRef(callback);
  ref.current = callback;
  return useCallback(((...args: never[]) => ref.current(...args)) as T, []);
};

/**
 * Header state, matching the reference's two-part nav behaviour: it gains its solid background
 * past `solidAt`, and it hides itself while you scroll *down* past `hideAt`, reappearing the
 * moment you scroll up.
 *
 * Both facts come from one scroll listener because they share a reading of `scrollY` — splitting
 * them into two hooks would mean two listeners racing on the same frame.
 */
export const useHeaderState = (solidAt: number, hideAt: number): { solid: boolean; hidden: boolean } => {
  const [state, setState] = useState({ solid: false, hidden: false });

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      // Only a downward move past the threshold hides it; any upward move brings it straight back.
      const hidden = y > hideAt && y > lastY;
      lastY = y;
      setState((current) =>
        current.solid === y > solidAt && current.hidden === hidden
          ? current
          : { solid: y > solidAt, hidden },
      );
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [solidAt, hideAt]);

  return state;
};
