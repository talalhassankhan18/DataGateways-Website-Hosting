/**
 * jest-dom's matcher types.
 *
 * Normally these arrive with '@testing-library/jest-dom/vitest', but that entry cannot resolve
 * vitest from the hoisted root node_modules in this workspace layout — see vitest.setup.ts, which
 * registers the matchers by hand. Registering them at runtime does not tell TypeScript about them,
 * so the augmentation is declared here instead.
 */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  // Pure interface merging: the body is empty by design, because the whole point is to pull
  // jest-dom's matchers into vitest's own Matchers interface.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = unknown> extends TestingLibraryMatchers<T, void> {}
}

export {};
