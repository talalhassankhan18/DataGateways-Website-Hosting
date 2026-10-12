import { useEffect } from 'react';
import type { SeoMeta } from '@datagateways/shared';
import { trackPageView } from '@/lib/analytics';
import { site } from '@/content/site';

export interface MetaProps {
  seo: SeoMeta;
  /** Path of the current route, used for the canonical URL. */
  path: string;
}

/**
 * Per-route document metadata.
 *
 * This replaces react-helmet-async, which renders nothing at all under React 18 StrictMode — its
 * dispatcher deregisters on the simulated unmount and never re-registers, so titles, canonicals and
 * OG tags silently never appear. The library has been unmaintained since 2023 and does not support
 * React 19 either, so rather than drop StrictMode to accommodate it, this does the same job in
 * forty lines with no dependency.
 *
 * Every tag it writes is marked `data-meta="route"` so it only ever edits its own, never the static
 * tags in index.html.
 */

const upsert = (selector: string, create: () => HTMLElement, value: string) => {
  const head = document.head;
  let element = head.querySelector<HTMLElement>(`${selector}[data-meta="route"]`);

  if (!element) {
    element = create();
    element.setAttribute('data-meta', 'route');
    head.appendChild(element);
  }

  if (element instanceof HTMLLinkElement) element.href = value;
  else element.setAttribute('content', value);
};

const meta = (attribute: 'name' | 'property', key: string, value: string) =>
  upsert(`meta[${attribute}="${key}"]`, () => {
    const element = document.createElement('meta');
    element.setAttribute(attribute, key);
    return element;
  }, value);

export function Meta({ seo, path }: MetaProps) {
  useEffect(() => {
    const canonical = `${site.url}${path}`;

    document.title = seo.title;

    // The static description in index.html has no data-meta marker, so it would be left in place
    // alongside ours. Retire it the first time a route takes over.
    document.head.querySelector('meta[name="description"]:not([data-meta])')?.remove();

    meta('name', 'description', seo.description);
    meta('property', 'og:type', 'website');
    meta('property', 'og:site_name', site.name);
    meta('property', 'og:title', seo.title);
    meta('property', 'og:description', seo.description);
    meta('property', 'og:url', canonical);
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', seo.title);
    meta('name', 'twitter:description', seo.description);

    upsert('link[rel="canonical"]', () => {
      const element = document.createElement('link');
      element.rel = 'canonical';
      return element;
    }, canonical);
  }, [seo.title, seo.description, path]);

  /*
   * The analytics page view, from the same component for the same reason: this is per-route
   * document metadata, and every page in the app reaches it through PageShell. Putting it here
   * rather than in the router means a new page cannot be added without being measured — the one
   * in App.tsx would have to be remembered, and a route that renders its own shell would slip
   * past it.
   *
   * Keyed on `path` alone, not on the title. The title can change within a route — the capability
   * pages rewrite it as the slug changes, and the slug is in the path, so that case is covered —
   * and a dependency on it would send a second page view for the same page whenever it did.
   *
   * The title is passed explicitly rather than read from document.title. The effect above sets
   * the title, but these are two effects in one component and React runs them in order; relying
   * on that ordering to read a global is a footgun for whoever reorders them next.
   */
  useEffect(() => {
    trackPageView(path, seo.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see note: one view per path change.
  }, [path]);

  return null;
}
