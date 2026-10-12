import { defineConfig } from 'vitest/config';

/**
 * Without an explicit `include`, vitest's default glob also picks up the compiled copies of these
 * tests under dist/, so the suite runs twice — the second time against whatever was last built
 * rather than the current source. Restricting it to src/ is what keeps a run honest.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    restoreMocks: true,
  },
});
