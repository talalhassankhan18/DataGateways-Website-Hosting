import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Meta } from './Meta';
import { trackPageView } from '@/lib/analytics';

vi.mock('@/lib/analytics', () => ({ trackPageView: vi.fn() }));

const seo = { title: 'AINerve | DataGateways', description: 'Real-time AI governance.' };

describe('Meta, as the page-view seam', () => {
  beforeEach(() => {
    vi.mocked(trackPageView).mockClear();
  });

  it('sends one page view with the route path and its title', () => {
    render(<Meta seo={seo} path="/products/ainerve" />);

    expect(trackPageView).toHaveBeenCalledTimes(1);
    expect(trackPageView).toHaveBeenCalledWith('/products/ainerve', seo.title);
  });

  it('does not send a second view when only the title changes', () => {
    const { rerender } = render(<Meta seo={seo} path="/products/ainerve" />);
    rerender(<Meta seo={{ ...seo, title: 'Something else' }} path="/products/ainerve" />);

    // Same page. A title that is rewritten in place is not a navigation, and counting it as one
    // inflates every page on the site that updates its own heading.
    expect(trackPageView).toHaveBeenCalledTimes(1);
  });

  it('sends a view for each route change, which a client-side router does not do by itself', () => {
    const { rerender } = render(<Meta seo={seo} path="/products/ainerve" />);
    rerender(<Meta seo={seo} path="/products/socmint" />);

    expect(trackPageView).toHaveBeenCalledTimes(2);
    expect(trackPageView).toHaveBeenLastCalledWith('/products/socmint', seo.title);
  });

  it('writes the canonical and og:url from the same path it reports', () => {
    render(<Meta seo={seo} path="/about" />);

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    // If these ever disagree, the page GA reports and the page Google indexes are different
    // pages, and no amount of cross-referencing the two will line up.
    expect(canonical?.href).toContain('/about');
    expect(
      document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content,
    ).toContain('/about');
  });
});

/**
 * Page views are sent from Meta, which pages reach through PageShell. That makes "every page
 * renders PageShell" the thing that guarantees every page is measured — so it is checked the same
 * way the split-heading invariant is, by reading the source rather than by rendering, because a
 * render test cannot catch a page nobody thought to write a test for.
 */
describe('the page-view invariant', () => {
  const pagesDir = join(__dirname, '..', '..', 'pages');

  it('has no page that renders without PageShell', () => {
    const offenders = readdirSync(pagesDir)
      .filter((entry) => entry.endsWith('.tsx') && !entry.endsWith('.test.tsx'))
      .filter((entry) => !readFileSync(join(pagesDir, entry), 'utf8').includes('<PageShell'));

    expect(offenders).toEqual([]);
  });
});
