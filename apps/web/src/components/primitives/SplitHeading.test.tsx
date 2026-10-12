import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitHeading } from './SplitHeading';

describe('SplitHeading', () => {
  it('renders both halves inside one element so it is read as a single heading', () => {
    render(<SplitHeading as="h1" roman="Zero Trust" accent="Starts Here" />);

    const heading = screen.getByRole('heading', { level: 1 });
    // Not two fragments: assistive tech must announce one continuous heading.
    expect(heading).toHaveTextContent('Zero Trust Starts Here');
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('carries emphasis with colour, never a slant', () => {
    render(<SplitHeading as="h2" roman="Trusted by" accent="global leaders" />);

    const accent = screen.getByText('global leaders');
    expect(accent.className).toContain('text-accent');
    // Neither family ships a true italic; a synthesised oblique on a grotesque reads as a
    // rendering fault rather than as emphasis. See the component's own note.
    expect(accent.className).not.toContain('italic');
  });

  it('sets the whole heading in the uppercase display face', () => {
    render(<SplitHeading as="h2" roman="Latest from" accent="DataGateways" />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('font-display');
    expect(heading.className).toContain('uppercase');
  });

  it('uses the full accent at display sizes', () => {
    render(<SplitHeading as="h1" roman="Zero Trust" accent="Starts Here" />);
    expect(screen.getByText('Starts Here').className).toContain('text-accent');
  });

  it('drops to the lifted accent below 24px, where #0E70F7 fails AA at 4.37:1', () => {
    render(<SplitHeading as="p" size="lead" roman="One control plane for" accent="data and AI" />);

    // See docs/design-reference.md, "Accessibility corrections".
    expect(screen.getByText('data and AI').className).toContain('text-accent-ink');
  });

  it('honours the requested tag', () => {
    render(<SplitHeading as="h3" roman="Find us" accent="here" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });
});

/**
 * The signature pattern is load-bearing: docs/design-reference.md says a heading that bypasses
 * SplitHeading is a bug, not a style choice. A rendering test cannot catch a heading added to a page
 * nobody thought to test, so this walks the source instead.
 */
describe('the split-heading invariant', () => {
  const srcRoot = join(__dirname, '..', '..');

  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) return walk(path);
      return /\.tsx$/.test(path) && !/\.test\.tsx$/.test(path) ? [path] : [];
    });

  it('has no h1 or h2 in any component outside SplitHeading itself', () => {
    const offenders = walk(srcRoot)
      .filter((path) => !path.endsWith(join('primitives', 'SplitHeading.tsx')))
      .flatMap((path) => {
        const lines = readFileSync(path, 'utf8').split('\n');
        return lines
          .map((line, index) => ({ line, number: index + 1 }))
          .filter(({ line }) => /<h[12][\s>]/.test(line))
          .map(({ number, line }) => `${path.slice(srcRoot.length + 1)}:${number}  ${line.trim()}`);
      });

    expect(offenders).toEqual([]);
  });
});
