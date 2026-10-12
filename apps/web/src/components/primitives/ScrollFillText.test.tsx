import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollFillText } from './ScrollFillText';
import { END_AT, fillProgress, START_AT } from '@/lib/scrollFill';

const VIEWPORT = 800;
const HEIGHT = 200;

describe('fillProgress', () => {
  it('is 0 while the block is still below the start line', () => {
    // Top sitting exactly at 82% of the viewport is the moment the fill begins.
    expect(fillProgress(START_AT * VIEWPORT, HEIGHT, VIEWPORT)).toBe(0);
    expect(fillProgress(VIEWPORT, HEIGHT, VIEWPORT)).toBe(0);
  });

  it('is 1 once the block bottom has reached the end line', () => {
    // bottom === 45% of viewport  =>  top === 0.45 * vh - height
    expect(fillProgress(END_AT * VIEWPORT - HEIGHT, HEIGHT, VIEWPORT)).toBeCloseTo(1, 5);
    expect(fillProgress(-VIEWPORT, HEIGHT, VIEWPORT)).toBe(1);
  });

  it('rises monotonically as the block travels up the viewport', () => {
    const samples = [700, 600, 500, 400, 300, 200, 100].map((top) =>
      fillProgress(top, HEIGHT, VIEWPORT),
    );

    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
    }
    expect(samples[0]).toBeLessThan(samples[samples.length - 1]);
  });

  it('never leaves the 0..1 range', () => {
    for (const top of [-5000, -1, 0, 400, 5000]) {
      const value = fillProgress(top, HEIGHT, VIEWPORT);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('does not divide by zero when the viewport is degenerate', () => {
    expect(fillProgress(0, 0, 0)).toBe(1);
  });
});

describe('ScrollFillText', () => {
  const SENTENCE = 'Zero trust starts here';

  it('keeps the sentence readable as one string despite the character split', () => {
    render(<ScrollFillText>{SENTENCE}</ScrollFillText>);

    const block = screen.getByLabelText(SENTENCE);
    // Real space text nodes, not margins: this is what anyone copying the sentence gets.
    expect(block.textContent).toBe(SENTENCE);
  });

  it('hides the generated spans from assistive tech', () => {
    const { container } = render(<ScrollFillText>{SENTENCE}</ScrollFillText>);

    const words = container.querySelectorAll('span[aria-hidden="true"]');
    expect(words.length).toBe(SENTENCE.split(' ').length);
  });

  it('indexes every character so CSS can stagger the fill', () => {
    const { container } = render(<ScrollFillText>{SENTENCE}</ScrollFillText>);

    const chars = container.querySelectorAll('span[style*="--i"]');
    expect(chars.length).toBe(SENTENCE.replace(/\s/g, '').length);
  });
});
