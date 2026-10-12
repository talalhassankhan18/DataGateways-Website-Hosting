import { useSyncExternalStore } from 'react';

/**
 * Analytics consent: one decision, stored on the device, readable by React and by the analytics
 * module without either owning the other.
 *
 * Three states, and the difference between two of them matters. `unset` means nobody has been
 * asked yet, so the banner shows. `denied` means they were asked and said no, so it does not —
 * a banner that reappears on every visit is not a choice, it is attrition. `granted` is the only
 * state that unlocks `analytics_storage`.
 *
 * The decision lives in localStorage rather than a cookie precisely because it is a decision
 * *about* cookies: storing it in one would mean writing the thing being consented to before
 * consent exists. localStorage here is first-party, strictly functional, and carries no
 * identifier — a single enum and a timestamp.
 */

export type ConsentState = 'unset' | 'granted' | 'denied';

/**
 * Bump when the purposes being consented to change. An older stored version reads back as `unset`,
 * which re-asks rather than silently carrying a decision made about a different question forward.
 */
const STORAGE_VERSION = 1;
const STORAGE_KEY = 'dg.consent.analytics';

interface StoredConsent {
  readonly state: 'granted' | 'denied';
  /** ISO timestamp. Kept so an expiry policy can be added later without re-prompting everyone. */
  readonly at: string;
  readonly version: number;
}

/**
 * Global Privacy Control — the browser-level opt-out signal, legally binding under the CPRA and
 * recognised by several EU regulators. Honoured as a standing `denied`: the banner never appears
 * and nothing is ever granted, because asking again for something already refused at the browser
 * level is exactly the dark pattern the signal exists to stop.
 *
 * Not persisted. It is the browser's position, not ours to cache — if the visitor turns it off, we
 * should fall back to asking rather than hold them to a setting they have since changed.
 */
export const hasGlobalPrivacyControl = (): boolean =>
  typeof navigator !== 'undefined' &&
  (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;

/* localStorage throws rather than returning null in a handful of real configurations — Safari's
   private mode historically, and any browser where the user has blocked site data. Every access
   is guarded, and a failure degrades to `unset`, which is the privacy-preserving direction: the
   visitor is asked, and nothing is granted. */
const readStored = (): StoredConsent | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed.version !== STORAGE_VERSION) return null;
    if (parsed.state !== 'granted' && parsed.state !== 'denied') return null;

    return parsed as StoredConsent;
  } catch {
    return null;
  }
};

const writeStored = (state: 'granted' | 'denied') => {
  try {
    const value: StoredConsent = { state, at: new Date().toISOString(), version: STORAGE_VERSION };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* Blocked storage. The decision still holds for this page via `decision` below — there is
       nothing useful to tell the visitor, and nothing they could do about it. */
  }
};

/**
 * The decision made during *this* page load, held independently of storage.
 *
 * Without it, a visitor whose browser blocks site data — private browsing, or site data turned
 * off, which is not a rare configuration among the people who read a page about data security —
 * clicks Accept, the write throws, the state recomputes from empty storage as `unset`, and the
 * banner never goes away. They cannot dismiss it, and their acceptance is silently discarded.
 *
 * So the resolution order is: the browser's standing signal, then this page's decision, then
 * whatever was stored on a previous visit.
 */
let decision: 'granted' | 'denied' | null = null;

const listeners = new Set<() => void>();

/* The store is read through a cached snapshot rather than hitting localStorage on every render:
   useSyncExternalStore calls getSnapshot during render and after every notification, and returning
   a freshly parsed object each time would loop forever on reference inequality. */
let snapshot: ConsentState = 'unset';
let hydrated = false;

const compute = (): ConsentState => {
  if (hasGlobalPrivacyControl()) return 'denied';
  return decision ?? readStored()?.state ?? 'unset';
};

const refresh = () => {
  const next = compute();
  if (next === snapshot) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
};

/** Reads the stored decision into memory. Idempotent; called by `initAnalytics` on boot. */
export const hydrateConsent = () => {
  hydrated = true;
  refresh();
};

export const getConsent = (): ConsentState => {
  if (!hydrated) hydrateConsent();
  return snapshot;
};

export const subscribeToConsent = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setConsent = (state: 'granted' | 'denied') => {
  /* A GPC visitor cannot be moved to `granted` — not by the banner, which they never see, and not
     by a stray call from anywhere else. The signal outranks the UI. */
  if (state === 'granted' && hasGlobalPrivacyControl()) return;

  decision = state;
  writeStored(state);
  refresh();
};

/**
 * Clears the decision so the banner returns. Backs the footer's "Cookie settings" link, which is
 * the withdrawal mechanism GDPR Article 7(3) requires consent to have — withdrawing has to be as
 * easy as giving.
 */
export const resetConsent = () => {
  decision = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Nothing was stored to begin with. */
  }
  refresh();
};

/* Server snapshot: this app has no SSR, but useSyncExternalStore demands the argument and jsdom
   test renders go through the same path. `unset` matches what a first paint shows. */
const getServerSnapshot = (): ConsentState => 'unset';

export const useConsent = (): ConsentState =>
  useSyncExternalStore(subscribeToConsent, getConsent, getServerSnapshot);
