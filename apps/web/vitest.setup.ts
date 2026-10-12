import * as matchers from '@testing-library/jest-dom/matchers';
import { afterEach, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Registered by hand rather than via '@testing-library/jest-dom/vitest'.
 *
 * vitest installs per workspace while jest-dom hoists to the root node_modules, so jest-dom's own
 * vitest entry tries to `import 'vitest'` from a directory that cannot see it. Extending `expect`
 * here resolves vitest from this workspace instead, where it exists.
 */
expect.extend(matchers);

afterEach(cleanup);

/**
 * jsdom implements neither of these, and both are load-bearing across this site:
 * IntersectionObserver drives every section entrance, the counters and the anchor rail;
 * matchMedia backs useReducedMotion() and the 768px video gate.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];
  constructor(private readonly callback: IntersectionObserverCallback) {
    observers.add(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn(() => observers.delete(this));
  takeRecords = vi.fn(() => []);

  /** Test helper: drive an intersection by hand. */
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 } as IntersectionObserverEntry],
      this,
    );
  }
}

const observers = new Set<MockIntersectionObserver>();

export const triggerIntersection = (isIntersecting = true) => {
  observers.forEach((observer) => observer.trigger(isIntersecting));
};

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

/** Default: no reduced-motion preference. Individual tests override with setPrefersReducedMotion. */
let reducedMotion = false;

export const setPrefersReducedMotion = (value: boolean) => {
  reducedMotion = value;
};

vi.stubGlobal(
  'matchMedia',
  vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

afterEach(() => {
  observers.clear();
  reducedMotion = false;
});
