import { describe, expect, it } from 'vitest';
import { columnsFor, spansFor } from './gridLayout';

/**
 * The property that matters is that no row ever comes out short. An incomplete row in this grid is
 * not white space — the cells paint over an inked backdrop, so a missing cell shows as a grey
 * block. Five modules in a four-column grid put one across a quarter of the AINerve page.
 */
describe('DividedGrid layout arithmetic', () => {
  it.each([3, 4, 5, 6, 7, 8])('fills every row for %i cards', (count) => {
    const spans = spansFor(count);
    expect(spans).toHaveLength(count);

    // Walk the spans, closing a row each time twelve columns are used.
    let row = 0;
    for (const span of spans) {
      row += span;
      expect(row).toBeLessThanOrEqual(12);
      if (row === 12) row = 0;
    }
    expect(row).toBe(0);
  });

  it('prefers a count that divides, so no row needs repairing at all', () => {
    expect(new Set(spansFor(6)).size).toBe(1);
    expect(new Set(spansFor(8)).size).toBe(1);
    expect(new Set(spansFor(3)).size).toBe(1);
  });

  it('widens the cards in a short final row rather than leaving a hole', () => {
    // Five at three across: three of four columns, then two of six.
    expect(spansFor(5)).toEqual([4, 4, 4, 6, 6]);
    // Seven at four across: four of three columns, then three of four.
    expect(spansFor(7)).toEqual([3, 3, 3, 3, 4, 4, 4]);
  });

  it('keeps cards wide enough to carry a paragraph', () => {
    // Four across is only reached once there are enough cards to justify the narrower cell.
    expect(columnsFor(5)).toBe(3);
    expect(columnsFor(6)).toBe(3);
    expect(columnsFor(7)).toBe(4);
    expect(columnsFor(8)).toBe(4);
  });
});
