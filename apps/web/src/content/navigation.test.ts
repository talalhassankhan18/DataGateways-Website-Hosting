import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { NavNode } from '@datagateways/shared';
import { CAPABILITY_SLUGS } from './capabilities';
import { PRODUCT_SLUGS } from './products';
import { SERVICE_SLUGS } from './services';
import { home } from './home';
import { features, site } from './site';

/**
 * The routes App.tsx actually registers, read from the source so this cannot drift from the router.
 *
 * Patterns are expanded against the slug lists their page validates with, rather than skipped:
 * `/products/socmint` and `/products/datanerve/dspm` are only reachable because `socmint` and
 * `dspm` are in those lists, so a nav item pointing at a slug nobody added should fail here rather
 * than render the 404 page in front of the client.
 */
const routerSource = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf8');

const PATTERN_SLUGS: Record<string, readonly string[]> = {
  ':slug': PRODUCT_SLUGS,
  ':capability': CAPABILITY_SLUGS,
  ':service': SERVICE_SLUGS,
};

const expand = (path: string): readonly string[] => {
  const param = path.split('/').find((segment) => segment.startsWith(':'));
  if (!param) return [path];

  const slugs = PATTERN_SLUGS[param];
  if (!slugs) return [];
  return slugs.map((slug) => path.replace(param, slug));
};

const registeredPaths = new Set(
  [...routerSource.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map(([, path]) => path)
    .filter((path) => path !== '*')
    .flatMap(expand)
    .map((path) => `/${path}`),
);
registeredPaths.add('/');

/**
 * Pages the copy deck says the client still owes us. They are linked from the footer on purpose —
 * the links are the record of what is outstanding — but they must never appear in a nav, and every
 * one has to be replaced before launch. See docs/PLACEHOLDERS.md.
 */
const PENDING_PAGES = new Set([
  '/careers',
  '/security',
  '/status',
  '/docs',
  '/privacy',
  '/terms',
]);

const isResolvable = (href: string) => {
  const [path] = href.split('#');
  return registeredPaths.has(path) || PENDING_PAGES.has(path) || href.startsWith('#');
};

/** Every node in the primary nav, at any depth. */
const flatten = (nodes: readonly NavNode[]): readonly NavNode[] =>
  nodes.flatMap((node) => [node, ...flatten(node.children ?? [])]);

const allPrimary = flatten(site.nav.primary);

describe('navigation', () => {
  it('registers a route for every primary nav link, at every level', () => {
    const dead = allPrimary.filter((item) => !registeredPaths.has(item.href));
    expect(dead.map((item) => `${item.label} -> ${item.href}`)).toEqual([]);
  });

  it('gives every nav node that opens a panel its own destination', () => {
    // A parent reachable only by hovering is unreachable on touch and by keyboard.
    const unreachable = allPrimary.filter((item) => item.children && !item.href);
    expect(unreachable.map((item) => item.label)).toEqual([]);
  });

  it('registers a route for every fullscreen-menu link, at every level', () => {
    const dead = flatten(site.nav.menu).filter((item) => !isResolvable(item.href));
    expect(dead.map((item) => `${item.label} -> ${item.href}`)).toEqual([]);
  });

  /*
   * The mobile menu used to be a second, hand-written list beside the header's tree, and it had
   * drifted: it carried the six top-level entries and none of their children, so on a phone eight
   * destinations were unreachable — all three products, all three capability pages, AI Services
   * and two partner pages. Both now derive from one tree. This is what stops them parting again.
   */
  it('reaches every primary destination from the mobile menu', () => {
    const inMenu = new Set(flatten(site.nav.menu).map((item) => item.href));
    const missing = allPrimary.filter((item) => !inMenu.has(item.href));
    expect(missing.map((item) => `${item.label} -> ${item.href}`)).toEqual([]);
  });

  it('keeps the numbered sequence to the top level, where it is a sequence', () => {
    // A branch is not a continuation of the count: numbering children 07, 08, 09 under Product
    // implies they follow About Us rather than sit inside Product.
    const numbered = site.nav.menu.filter((item) => 'index' in item);
    expect(numbered).toHaveLength(site.nav.menu.length);
    expect(flatten(site.nav.menu).filter((item) => 'index' in item)).toHaveLength(
      site.nav.menu.length,
    );
  });

  it('drops the Resources nav item whenever the page itself is cut', () => {
    // The copy deck's instruction is to cut the page AND the nav item together.
    const hrefs = [...allPrimary, ...flatten(site.nav.menu)].map((item) => item.href);

    if (features.resources) {
      expect(hrefs).toContain('/resources');
    } else {
      expect(hrefs).not.toContain('/resources');
    }
  });

  it('numbers the fullscreen menu 01..0n with no gap', () => {
    expect(site.nav.menu.map((item) => item.index)).toEqual(
      site.nav.menu.map((_, index) => String(index + 1).padStart(2, '0')),
    );
  });

  it('points every footer link at a real route or a page known to be outstanding', () => {
    // All four columns, not just two — the footer mirrors the client's own and a broken link in
    // Solutions is every bit as visible as one in the legal row.
    const links = [
      ...site.footer.solutions,
      ...site.footer.partner,
      ...site.footer.company,
      ...site.footer.legal,
    ];
    const unresolvable = links.filter((item) => !isResolvable(item.href));

    // A new footer link to a page nobody has built is either a typo or a missing PENDING_PAGES
    // entry. Both should fail here rather than 404 in front of the client.
    expect(unresolvable.map((item) => `${item.label} -> ${item.href}`)).toEqual([]);
  });

  it('gives the hero slider a destination for every slide', () => {
    const dead = home.hero.slides.filter((slide) => !isResolvable(slide.href));
    expect(dead.map((slide) => `${slide.eyebrow} -> ${slide.href}`)).toEqual([]);
  });

});
