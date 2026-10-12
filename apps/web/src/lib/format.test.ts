import { describe, expect, it } from 'vitest';
import { formatCounter, parseCounter } from './format';

describe('parseCounter', () => {
  it('splits a plain figure from its suffix', () => {
    expect(parseCounter('400+')).toMatchObject({ numeric: 400, suffix: '+', decimals: 0 });
  });

  it('keeps the decimal places the value was written with', () => {
    expect(parseCounter('99.99+')).toMatchObject({ numeric: 99.99, suffix: '+', decimals: 2 });
  });

  it('reports no number for a value that has none', () => {
    expect(parseCounter('—').numeric).toBeNull();
  });

  /*
   * The client's response-time and cost-efficiency figures are spans, and the counter animates
   * whatever `numeric` comes back as. Returning 30 for "30–50%" would render "17–50%" halfway
   * through the count — a number that never existed, shown on a page whose whole argument is that
   * its numbers are evidenced.
   */
  it.each(['30–50%', '30 to 50%', '2–5s', '1-3s', '2 – 5 seconds'])(
    'renders %s as a static range',
    (value) => {
      const parsed = parseCounter(value);
      expect(parsed.numeric).toBeNull();
      expect(parsed.raw).toBe(value);
    },
  );

  it('still animates a value whose suffix merely contains a dash', () => {
    expect(parseCounter('500M+').numeric).toBe(500);
    expect(parseCounter('24104+').numeric).toBe(24104);
  });
});

describe('formatCounter', () => {
  it('groups thousands so a large interpreter count stays readable', () => {
    expect(formatCounter(24104, 0)).toBe('24,104');
  });

  it('holds the decimal places rather than rounding them away', () => {
    expect(formatCounter(99.987, 2)).toBe('99.99');
  });
});
