import ReactGA from 'react-ga4';
import { analyticsAllowed, hydrateConsent, subscribeToConsent } from '@/lib/consent';

/**
 * Google Analytics 4, via react-ga4, under Consent Mode v2.
 *
 * Three properties this module is built to hold, in order of how badly each one breaks if it
 * slips:
 *
 * 1. **Inert without a measurement ID.** `VITE_GA_MEASUREMENT_ID` unset or malformed means no
 *    script tag, no dataLayer, no request. Every exported function stays callable and does
 *    nothing, so call sites never guard and tests never stub. This is the default state of the
 *    repo, and of anyone's local checkout.
 *
 * 2. **Consent before storage.** The default consent state is denied, and it is pushed onto the
 *    dataLayer *before* the gtag.js tag is injected — Consent Mode reads defaults at load, so a
 *    default pushed afterwards is a default that never applied. Until consent is granted GA runs
 *    cookieless: no _ga cookie, no client ID, pings only.
 *
 * 3. **No personal data, ever.** Event parameters are a closed set defined in this file. Nothing
 *    a visitor types reaches it — not the contact message, not their name or email, not the
 *    partner-directory search box. Where a form is tracked, what is sent is that it happened and
 *    which branch it took.
 *
 * react-ga4 owns initialisation, page views and events. It is a thin typed wrapper over gtag.js:
 * `event(name, params)` becomes `gtag('event', name, params)` with unmapped keys passed through
 * untouched, and `send({hitType:'pageview'})` becomes `gtag('event','page_view', …)` with exactly
 * the page_path / page_title / page_location shape this file already used. So the wire format is
 * unchanged and the taxonomy below still describes what GA receives.
 *
 * **What react-ga4 is deliberately NOT allowed to do is the consent handshake.** Its `initialize`
 * injects the gtag.js script *before* it pushes anything, and any `ReactGA.gtag()` call made
 * beforehand is queued and flushed *after* `config`. Routing the Consent Mode defaults through it
 * would therefore place them after the tag had already loaded, which is the one ordering that
 * silently does nothing: the integration looks correct and sets cookies anyway. The defaults are
 * pushed directly onto the dataLayer first, and `initialize` is called second — react-ga4 reuses
 * an existing `window.dataLayer`, so the queue it inherits already has consent at the front.
 *
 * Why not Google Tag Manager: every event this site sends is declared below, in the repository,
 * where it is reviewed alongside the code that fires it. A GTM container moves that out to a web
 * console — the right trade when marketing must ship tags without a deploy, the wrong one for a
 * site with nine events and a security vendor's review burden.
 */

/* ------------------------------------------------------------------ configuration */

/* A GA4 measurement ID is "G-" followed by an alphanumeric stream token. Validating the shape is
   not pedantry: the common failure is a GTM container ID (GTM-...) or a Universal Analytics
   property (UA-...) pasted into the variable, which gtag accepts without complaint and silently
   reports nothing against. Better to stay inert than to look configured and measure nothing. */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,15}$/;

const RAW_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim();

export const measurementId: string | null = MEASUREMENT_ID_PATTERN.test(RAW_ID) ? RAW_ID : null;

/** True when a usable measurement ID is configured. Everything below no-ops when this is false. */
export const analyticsConfigured = measurementId !== null;

/* ------------------------------------------------------------------ gtag plumbing */

declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The canonical gtag shim, written the way Google's own snippet writes it.
 *
 * It pushes the `arguments` object rather than a rest array on purpose. gtag.js and GTM both
 * inspect what lands on the dataLayer to tell a positional gtag command from an object-shaped
 * dataLayer event, and an `arguments` object is what the library is specified against. A plain
 * array is array-like enough to work today and is not what the contract says.
 */
function gtagShim(..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer!.push(arguments);
}

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? gtagShim;
};

/* ------------------------------------------------------------------ consent mode */

/* The full Consent Mode v2 signal set. Google treats an unmentioned signal as granted, so all
   seven are named: omitting ad_user_data and ad_personalization is the single most common way an
   integration that believes it denies everything by default turns out not to.

   security_storage stays granted throughout. It covers fraud prevention and authentication and is
   classed as strictly necessary; denying it is not more private, it only breaks things. */
const DENIED_BY_DEFAULT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
} as const;

/* Granting analytics grants exactly analytics. The three advertising signals stay denied in every
   state this site can reach, because this site runs no advertising tags — if that ever changes,
   it changes here, in a diff, rather than by a container edit nobody in the repo can see. */
const GRANTED_ON_ACCEPT = {
  analytics_storage: 'granted',
  functionality_storage: 'granted',
} as const;

const DENIED_ON_REJECT = {
  analytics_storage: 'denied',
  functionality_storage: 'denied',
} as const;

/* ------------------------------------------------------------------ event taxonomy */

export type FormName = 'contact' | 'partner_application';
export type FormErrorKind = 'validation' | 'rate_limited' | 'generic';

/**
 * Every event this site is allowed to send.
 *
 * `page_view` and `generate_lead` are GA4's own recommended names, so they populate the standard
 * reports with no configuration. The rest are custom, and their parameters only appear in reports
 * once registered as custom dimensions in the GA4 property — docs/ANALYTICS.md lists which.
 */
export type AnalyticsEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string; page_location: string } }
  | { name: 'generate_lead'; params: { form_name: FormName; enquiry_branch?: string } }
  | { name: 'form_start'; params: { form_name: FormName } }
  | { name: 'form_error'; params: { form_name: FormName; error_kind: FormErrorKind } }
  | {
      name: 'cta_click';
      params: { cta_label: string; cta_destination: string; cta_location: string };
    }
  | { name: 'outbound_click'; params: { link_url: string; link_domain: string; link_text: string } }
  | { name: 'contact_channel_click'; params: { channel: 'email' | 'phone' } }
  | { name: 'partner_filter'; params: { filter_type: 'region' | 'country'; filter_value: string } }
  | { name: 'consent_update'; params: { consent_state: 'granted' | 'denied' } };

type EventName = AnalyticsEvent['name'];
type ParamsFor<TName extends EventName> = Extract<AnalyticsEvent, { name: TName }>['params'];

/* ------------------------------------------------------------------ initialisation */

let initialised = false;
let lastAppliedConsent: boolean | null = null;

/* GA4's own cookies. _ga holds the client ID, _ga_<STREAM> the session; _gid and _gat are
   Universal Analytics leftovers that gtag can still set through some configurations. */
const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_gat'];

/**
 * Deletes the analytics cookies when consent is withdrawn.
 *
 * Consent Mode stops gtag *using* the cookie, but it does not remove one already written. So a
 * visitor who accepts and later declines keeps a `_ga` client ID on their device indefinitely —
 * the identifier that withdrawal was supposed to be the end of. Under the GDPR, withdrawal has
 * to actually stop the processing, and for this client in particular, leaving the identifier
 * behind would be the kind of detail that undermines everything the site claims to sell.
 *
 * A cookie can only be deleted from the scope that set it, and GA sets its own on the registrable
 * domain. The host is not known here, so each parent domain is tried in turn — expiring a cookie
 * that does not exist at a given scope is a no-op, so the shotgun is safe and the alternative is
 * guessing wrong on exactly one of them.
 */
const clearAnalyticsCookies = () => {
  const names = document.cookie
    .split('; ')
    .map((pair) => pair.split('=')[0])
    .filter((name) => ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix)));

  if (names.length === 0) return;

  const labels = window.location.hostname.split('.');
  const parents = labels
    .map((_, index) => labels.slice(index).join('.'))
    .filter((domain) => domain.includes('.'));

  /* One attempt per scope, each as its own write: a cookie string carries a single `domain`, so
     the host-only form and the dotted form cannot be combined into one. `undefined` is the
     host-only cookie, which is what GA sets on localhost. */
  const scopes: (string | undefined)[] = [
    undefined,
    ...parents,
    ...parents.map((domain) => `.${domain}`),
  ];

  for (const name of names) {
    for (const domain of scopes) {
      const attributes = ['path=/', 'expires=Thu, 01 Jan 1970 00:00:00 GMT'];
      if (domain) attributes.push(`domain=${domain}`);
      document.cookie = `${name}=; ${attributes.join('; ')}`;
    }
  }
};

const applyConsent = (granted: boolean) => {
  if (!analyticsConfigured || !window.gtag) return;
  /* Consent updates are idempotent to gtag, but re-pushing on every store notification would fill
     the dataLayer with identical commands and make a DebugView session unreadable. */
  if (granted === lastAppliedConsent) return;
  lastAppliedConsent = granted;

  /* Safe through react-ga4: by the time consent can change, initialize() has run, so its queue
     is drained and this reaches the dataLayer immediately rather than being deferred. */
  ReactGA.gtag('consent', 'update', granted ? GRANTED_ON_ACCEPT : DENIED_ON_REJECT);

  /* Also on a denied page load, not only on an explicit withdrawal: that sweeps up a cookie left
     behind by an acceptance that has since been reset, or by a GPC signal turned on afterwards. */
  if (!granted) clearAnalyticsCookies();
};

const pushConsentDefaults = () => {
  /*
   * Analytics starts granted unless the visitor has explicitly declined.
   *
   * It started denied until 12 October, when the client asked for the banner to stop appearing
   * while analytics kept working — and with nothing on screen to grant permission, a denied
   * default would simply mean no analytics at all. The three advertising signals stay denied in
   * every case; this site runs no advertising tags.
   *
   * The decision is read before this runs (initAnalytics hydrates first), so a returning visitor
   * who declined gets a denied default rather than a grant that is corrected a moment later.
   */
  window.gtag!('consent', 'default', {
    ...DENIED_BY_DEFAULT,
    ...(analyticsAllowed() ? GRANTED_ON_ACCEPT : {}),
    /* Keeps click-through attribution working without a cookie: with ad_storage denied, gtag
       passes the ad click ID through the URL for the session instead of storing it. Inert today,
       and already correct if advertising is ever added. */
    url_passthrough: true,
    /* Redacts ad click identifiers from outgoing requests while ad_storage is denied. */
    ads_data_redaction: true,
  });
};

/**
 * Boots analytics. Called once from `main.tsx`, before React renders.
 *
 * Order is the whole point of this function: dataLayer, then consent defaults, then `js`, then
 * `config`, then the script tag. Defaults pushed after the tag has loaded are too late to apply,
 * and that failure is invisible — the integration looks correct and sets cookies anyway.
 */
export const initAnalytics = () => {
  if (initialised || !analyticsConfigured || typeof window === 'undefined') return;
  initialised = true;

  hydrateConsent();
  ensureDataLayer();

  pushConsentDefaults();

  /* Second, and only now: this injects gtag.js and pushes `js` + `config`. The dataLayer it
     adopts already carries the consent defaults from the line above, so the tag reads them as it
     boots. Reversing these two statements is the whole failure mode described at the top. */
  ReactGA.initialize(measurementId!, {
    gtagOptions: {
      /* Page views are sent by hand from Meta, once per route. Left on, gtag would send one for
         the initial document load and then nothing for any client-side navigation, so a six-page
         visit would report as a single view of the landing route. */
      send_page_view: false,
      anonymize_ip: true,
    },
  });

  /* Keeps `lastAppliedConsent` in step with the default just pushed, so the first real change
     is what triggers an update rather than a no-op repeat of the default. */
  applyConsent(analyticsAllowed());

  /* Keeps gtag in step with the store for the rest of the session, whichever surface changed it:
     the banner, the footer's reset link, or a direct call. */
  subscribeToConsent(() => applyConsent(analyticsAllowed()));
};

/* ------------------------------------------------------------------ public API */

/**
 * Sends one event.
 *
 * Discriminated on `name`, so a parameter outside the taxonomy above is a type error at the call
 * site rather than a field that quietly never appears in a report.
 */
export const trackEvent = <TName extends EventName>(name: TName, params: ParamsFor<TName>) => {
  if (!analyticsConfigured) return;
  /* react-ga4 renames a fixed list of legacy camelCase analytics.js fields and passes everything
     else through unchanged. No parameter in the taxonomy above collides with that list, so what
     GA receives is exactly what is declared here. */
  ReactGA.event(name, params);
};

let lastPageViewPath: string | null = null;

/**
 * One page view. Called from `Meta`, which every page reaches through `PageShell`.
 *
 * Deduplicated on the path, because "the effect ran" and "the visitor arrived somewhere new" are
 * not the same event. StrictMode double-invokes every effect in development, so without this the
 * first load of every page is reported twice and DebugView is unreadable — but the dev symptom is
 * not the reason it is here. A component that remounts for any reason at all (a Suspense boundary
 * resolving, a key changing, a parent re-keying on data) would do exactly the same thing in a
 * production build, silently, and the only evidence would be a bounce rate that looks wrong.
 *
 * What it suppresses is a repeat of the path already reported. Navigating away and back sends a
 * second view, because `lastPageViewPath` has moved on; clicking a link to the page you are
 * already on does not, which is correct — nothing was navigated to.
 */
export const trackPageView = (path: string, title: string) => {
  if (!analyticsConfigured) return;
  if (path === lastPageViewPath) return;
  lastPageViewPath = path;

  /* Emits gtag('event','page_view', { page_path, page_title, page_location }) — the same shape
     this file sent before react-ga4, so historical data stays comparable. */
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title,
    /* The full URL, so GA4 reads utm_* and gclid off it for attribution. No route on this site
       carries personal data in a query string; docs/ANALYTICS.md records that as a constraint on
       anyone adding one. */
    location: window.location.href,
  });
};

/** Records the banner decision itself, so acceptance rate is measurable. */
export const trackConsentDecision = (state: 'granted' | 'denied') => {
  trackEvent('consent_update', { consent_state: state });
};

/**
 * The current path as the router sees it, with any deployment base stripped.
 *
 * `window.location.pathname` on a GitHub Pages project site is
 * `/DataGateways-Website-Hosting/contact`, while `page_path` on the page_view is `/contact` —
 * the route. Reporting both shapes would put two different spellings of the same page in one
 * property, and nothing in GA could join them.
 */
export const currentRoutePath = (): string => {
  const base = import.meta.env.BASE_URL;
  const path = window.location.pathname;

  if (base && base !== '/' && path.startsWith(base)) return `/${path.slice(base.length)}`;
  return path;
};

/* ------------------------------------------------------------------ link helpers */

const WEB_PROTOCOLS = new Set(['http:', 'https:']);

export type LinkKind = 'internal' | 'outbound' | 'email' | 'phone' | 'ignored';

export interface LinkClassification {
  readonly kind: LinkKind;
  readonly url: string;
  readonly domain: string;
}

/**
 * Works out what a given href is, from the point of view of measurement.
 *
 * Shared by the Button and ArrowLink primitives and by the delegated document listener, so all
 * three agree. The alternative is three slightly different definitions of "external" and a click
 * that is counted twice or not at all.
 */
export const classifyLink = (href: string): LinkClassification => {
  if (!href) return { kind: 'ignored', url: href, domain: '' };
  if (href.startsWith('mailto:')) return { kind: 'email', url: href, domain: '' };
  if (href.startsWith('tel:')) return { kind: 'phone', url: href, domain: '' };
  /* Fragment-only links navigate within the current page; the anchor rail is full of them. */
  if (href.startsWith('#')) return { kind: 'ignored', url: href, domain: '' };

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return { kind: 'ignored', url: href, domain: '' };
  }

  if (!WEB_PROTOCOLS.has(url.protocol)) return { kind: 'ignored', url: url.href, domain: '' };

  return {
    kind: url.host === window.location.host ? 'internal' : 'outbound',
    url: url.href,
    domain: url.host,
  };
};

/* ------------------------------------------------------------------ test seam */

/**
 * Resets module state between tests. Not referenced by application code.
 *
 * The alternative is `vi.resetModules()` in every analytics test, which also resets the consent
 * store this module subscribes to and makes the two sets of tests interfere.
 */
export const __resetAnalyticsForTests = () => {
  /* react-ga4 is a module-level singleton that remembers isInitialized and _hasLoadedGA, so a
     second initialize() in the same test file is a no-op without this. */
  ReactGA.reset();
  initialised = false;
  lastAppliedConsent = null;
  lastPageViewPath = null;
};
