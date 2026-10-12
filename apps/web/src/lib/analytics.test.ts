import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as analyticsModule from './analytics';

/**
 * `analyticsConfigured` is read from import.meta.env at module evaluation, which is the point —
 * it means a build with no measurement ID cannot be talked into sending anything at runtime. The
 * cost is that both states need a separately evaluated copy of the module, so the configured
 * tests stub the variable and re-import.
 */
const loadWith = async (measurementId: string | undefined) => {
  vi.resetModules();
  if (measurementId === undefined) vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
  else vi.stubEnv('VITE_GA_MEASUREMENT_ID', measurementId);

  return import('./analytics');
};

/** Everything gtag was asked to do, in order, as plain arrays. */
const commands = () => Array.from(window.dataLayer ?? [], (entry) => Array.from(entry));

const commandsOfType = (type: string) => commands().filter(([first]) => first === type);

const clearGtag = () => {
  delete window.dataLayer;
  delete window.gtag;
  document.getElementById('ga4-gtag')?.remove();
};

const clearCookies = () => {
  for (const pair of document.cookie.split('; ')) {
    const name = pair.split('=')[0];
    if (name) document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

beforeEach(() => {
  clearGtag();
  clearCookies();
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  clearGtag();
  clearCookies();
  window.localStorage.clear();
});

describe('without a measurement ID', () => {
  /* Loaded with the variable explicitly blank rather than relying on the ambient environment.
     A developer with a GA id in their own .env.local would otherwise see these three fail for a
     reason that has nothing to do with the code. */
  let analytics: typeof analyticsModule;

  beforeEach(async () => {
    analytics = await loadWith('');
  });

  it('reports itself as unconfigured', () => {
    // The repo default. A checkout with no .env measures nothing and says so.
    expect(analytics.analyticsConfigured).toBe(false);
    expect(analytics.measurementId).toBeNull();
  });

  it('injects no script and creates no dataLayer', () => {
    analytics.initAnalytics();

    expect(document.getElementById('ga4-gtag')).toBeNull();
    expect(window.dataLayer).toBeUndefined();
  });

  it('leaves every tracking call a safe no-op', () => {
    // The property that lets call sites stay unguarded: none of these throw, and none of them
    // conjure a dataLayer into existence.
    expect(() => {
      analytics.initAnalytics();
      analytics.trackPageView('/about', 'About');
      analytics.trackEvent('generate_lead', { form_name: 'contact' });
      analytics.trackConsentDecision('granted');
    }).not.toThrow();

    expect(window.dataLayer).toBeUndefined();
  });
});

describe('a malformed measurement ID', () => {
  it.each([
    ['GTM-ABCDEF', 'a Tag Manager container'],
    ['UA-12345-1', 'a Universal Analytics property'],
    ['G-short', 'too short to be a stream token'],
    ['g-lowercase1', 'the wrong case'],
    ['   ', 'whitespace'],
  ])('refuses %s (%s) and stays inert', async (id) => {
    const analytics = await loadWith(id);

    // gtag accepts all of these without complaint and reports against none of them. Staying
    // inert is louder than looking configured and measuring nothing.
    expect(analytics.analyticsConfigured).toBe(false);

    analytics.initAnalytics();
    expect(document.getElementById('ga4-gtag')).toBeNull();
  });

  it('trims surrounding whitespace rather than rejecting a pasted ID', async () => {
    const analytics = await loadWith('  G-ABC1234567  ');
    expect(analytics.measurementId).toBe('G-ABC1234567');
  });
});

describe('with a measurement ID', () => {
  const ID = 'G-TEST123456';

  it('denies every consent signal before the tag loads', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    const [defaults] = commands().filter(([type, scope]) => type === 'consent' && scope === 'default');
    expect(defaults).toBeDefined();

    const signals = defaults[2] as Record<string, string>;

    // All of them named explicitly. Google treats an unmentioned signal as granted, and the two
    // v2 additions are the ones most often left out of a "denied by default" integration.
    expect(signals).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
    });
    // Strictly necessary: denying it is not more private, it only breaks things.
    expect(signals.security_storage).toBe('granted');
  });

  it('pushes the consent default before the gtag script tag exists', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    // The ordering this whole module is built around. A default pushed after gtag.js has loaded
    // is a default that never applied, and the failure is invisible: the integration looks
    // correct and sets cookies anyway.
    const types = commands().map(([type]) => String(type));
    expect(types[0]).toBe('consent');
    expect(types).toContain('js');
    // The script tag is appended last, after every queued command.
    expect(document.getElementById('ga4-gtag')).not.toBeNull();

    const config = commands().find(([type]) => type === 'config');
    expect(config?.[1]).toBe(ID);
  });

  it('turns off gtag automatic page views, because the router sends them', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    const config = commands().find(([type]) => type === 'config');
    // Left on, a six-page visit reports as one view of the landing route.
    expect((config?.[2] as Record<string, unknown>).send_page_view).toBe(false);
  });

  it('loads gtag.js asynchronously, once', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();
    analytics.__resetAnalyticsForTests();
    analytics.initAnalytics();

    const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
    expect(scripts).toHaveLength(1);
    // The property, not the attribute: jsdom does not reflect this one, and the property is what
    // actually governs whether the tag blocks the parser.
    expect((scripts[0] as HTMLScriptElement).async).toBe(true);
    expect(scripts[0].getAttribute('src')).toContain(ID);
  });

  it('replays a grant stored on a previous visit', async () => {
    window.localStorage.setItem(
      'dg.consent.analytics',
      JSON.stringify({ state: 'granted', at: new Date().toISOString(), version: 1 }),
    );

    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    // Defaults are denied on every page load, so without the replay a visitor who accepted last
    // week is measured this week as having refused.
    const update = commandsOfType('consent').find(([, scope]) => scope === 'update');
    expect(update?.[2]).toMatchObject({ analytics_storage: 'granted' });
  });

  it('does not grant analytics for a visitor who has not been asked', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    const granted = commandsOfType('consent').filter(
      ([, scope, signals]) =>
        scope === 'update' && (signals as Record<string, string>).analytics_storage === 'granted',
    );
    expect(granted).toHaveLength(0);
  });

  it('deletes the analytics cookies when consent is withdrawn', async () => {
    document.cookie = '_ga=GA1.1.123.456; path=/';
    document.cookie = '_ga_TEST123456=GS2.1.s1; path=/';
    expect(document.cookie).toContain('_ga=');

    const analytics = await loadWith(ID);
    // No stored decision, so init applies the denied state and sweeps.
    analytics.initAnalytics();

    // Consent Mode stops gtag using the cookie but never removes one already written, so a
    // visitor who accepts and later withdraws would otherwise keep the client ID that
    // withdrawal was supposed to be the end of.
    expect(document.cookie).not.toContain('_ga=');
    expect(document.cookie).not.toContain('_ga_TEST123456=');
  });

  it('leaves non-analytics cookies alone', async () => {
    document.cookie = '_ga=GA1.1.123.456; path=/';
    document.cookie = 'session_hint=keep-me; path=/';

    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    expect(document.cookie).toContain('session_hint=keep-me');
  });

  it('sends a page view with the path and title it was given', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    analytics.trackPageView('/products/ainerve', 'AINerve | DataGateways');

    const [, name, params] = commands().find(([type]) => type === 'event')!;
    expect(name).toBe('page_view');
    expect(params).toMatchObject({
      page_path: '/products/ainerve',
      page_title: 'AINerve | DataGateways',
    });
    // The full URL goes too, so GA4 reads utm_* and gclid off it for attribution.
    expect((params as Record<string, string>).page_location).toContain('http');
  });

  it('does not report the same path twice when a component remounts', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    analytics.trackPageView('/about', 'About');
    analytics.trackPageView('/about', 'About');

    // StrictMode double-invokes effects in development, and a Suspense boundary resolving or a
    // key change does the same in production. Either way the visitor arrived once.
    expect(commands().filter(([type]) => type === 'event')).toHaveLength(1);
  });

  it('reports a path again after the visitor has been somewhere else', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    analytics.trackPageView('/about', 'About');
    analytics.trackPageView('/contact', 'Contact');
    analytics.trackPageView('/about', 'About');

    // Away and back is three views. Suppressing this one would make the dedupe a lie about
    // where people went.
    expect(commands().filter(([type]) => type === 'event')).toHaveLength(3);
  });

  it('sends a lead with its branch and nothing the visitor typed', async () => {
    const analytics = await loadWith(ID);
    analytics.initAnalytics();

    analytics.trackEvent('generate_lead', { form_name: 'contact', enquiry_branch: 'sales' });

    const [, name, params] = commands().find(([type]) => type === 'event')!;
    expect(name).toBe('generate_lead');
    expect(params).toEqual({ form_name: 'contact', enquiry_branch: 'sales' });
  });
});

describe('classifyLink', () => {
  // jsdom serves these tests from localhost, which stands in for the site's own origin.
  it('calls a relative path internal', () => {
    expect(analyticsModule.classifyLink('/products').kind).toBe('internal');
  });

  it('calls an absolute URL on the same host internal', () => {
    expect(analyticsModule.classifyLink(`${window.location.origin}/about`).kind).toBe('internal');
  });

  it('calls another host outbound and keeps its domain', () => {
    const link = analyticsModule.classifyLink('https://www.linkedin.com/company/data-gateways/');

    expect(link.kind).toBe('outbound');
    expect(link.domain).toBe('www.linkedin.com');
  });

  it.each([
    ['mailto:info@datagateways.net', 'email'],
    ['tel:+18722842859', 'phone'],
  ])('recognises %s as a %s channel', (href, kind) => {
    expect(analyticsModule.classifyLink(href).kind).toBe(kind);
  });

  it.each([
    ['#enquiry', 'an in-page anchor, which the anchor rail is full of'],
    ['', 'an empty href'],
    ['javascript:void(0)', 'a pseudo-protocol'],
    ['http://', 'a scheme with no host, which the URL parser rejects outright'],
  ])('ignores %s (%s)', (href) => {
    expect(analyticsModule.classifyLink(href).kind).toBe('ignored');
  });

  it('treats a malformed relative href the way the browser does', () => {
    // "://nonsense" has no scheme the parser recognises, so it resolves against the current
    // document as a relative path and stays on this origin -- which is exactly what clicking it
    // would do. Calling it 'ignored' here would be this module disagreeing with the navigation
    // it is supposed to be describing.
    expect(analyticsModule.classifyLink('://nonsense').kind).toBe('internal');
  });
});
