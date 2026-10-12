import { describe, expect, it, vi } from 'vitest';
import { reentrantSafe } from './useSmoothScroll';

/**
 * These lock the fix for a crash that only ever appeared in a real browser: Lenis listens for the
 * native `scroll` event on the same window we re-publish onto, so re-publishing without a guard
 * recursed until the stack blew on the first wheel gesture.
 *
 * The guard is tested here rather than through the hook because the hook needs a live Lenis and a
 * running requestAnimationFrame, neither of which jsdom provides usefully.
 */
describe('reentrantSafe', () => {
  it('calls through on a normal invocation', () => {
    const fn = vi.fn();
    reentrantSafe(fn)();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores a call made from inside the callback', () => {
    const inner = vi.fn();
    let guarded: () => void = () => {};

    guarded = reentrantSafe(() => {
      inner();
      // Exactly what Lenis does: the dispatch lands back on its own listener, which emits again.
      guarded();
    });

    guarded();

    expect(inner).toHaveBeenCalledTimes(1);
  });

  it('survives an unbounded recursion rather than exhausting the stack', () => {
    let depth = 0;
    let guarded: () => void = () => {};

    guarded = reentrantSafe(() => {
      depth += 1;
      guarded();
      guarded();
    });

    expect(() => guarded()).not.toThrow();
    expect(depth).toBe(1);
  });

  it('re-arms after a later, separate call', () => {
    const fn = vi.fn();
    const guarded = reentrantSafe(fn);

    guarded();
    guarded();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('re-arms even when the callback throws', () => {
    const fn = vi.fn(() => {
      throw new Error('a listener blew up');
    });
    const guarded = reentrantSafe(fn);

    // Without the finally, one throwing scroll listener would wedge the flag true and silently
    // kill every scroll-driven effect on the page for the rest of the session.
    expect(() => guarded()).toThrow('a listener blew up');
    expect(() => guarded()).toThrow('a listener blew up');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
