import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getConsent,
  hasGlobalPrivacyControl,
  hydrateConsent,
  resetConsent,
  setConsent,
  subscribeToConsent,
} from './consent';

const STORAGE_KEY = 'dg.consent.analytics';

/** Puts a GPC signal on navigator for one test, and takes it off again. */
const withGlobalPrivacyControl = (value: boolean | undefined) => {
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    value,
    configurable: true,
    writable: true,
  });
};

describe('the consent store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    withGlobalPrivacyControl(undefined);
    // resetConsent, not hydrateConsent: the store also holds this page's decision in memory, and
    // only a reset clears both halves back to a first-visit state.
    resetConsent();
  });

  afterEach(() => {
    window.localStorage.clear();
    withGlobalPrivacyControl(undefined);
  });

  it('starts unset, so a first-time visitor is asked', () => {
    expect(getConsent()).toBe('unset');
  });

  it('writes a grant to storage with its version, so the next visit can read it', () => {
    setConsent('granted');

    expect(getConsent()).toBe('granted');
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toMatchObject({
      state: 'granted',
      version: 1,
    });
  });

  it('writes a refusal too, so the banner does not come back on every visit', () => {
    setConsent('denied');

    // The distinction that matters: 'denied' is a decision, 'unset' is a question. Storing a
    // refusal as absence would re-ask on every page load, which is attrition, not a choice.
    expect(getConsent()).toBe('denied');
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toMatchObject({
      state: 'denied',
    });
  });

  it('reads a previous visit back on a genuinely fresh load', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: 'granted', at: new Date().toISOString(), version: 1 }),
    );

    // A real reload, not just a re-hydrate: the module is evaluated again from scratch, so the
    // in-memory decision from this page is gone and only storage can answer.
    vi.resetModules();
    const fresh = await import('./consent');

    expect(fresh.getConsent()).toBe('granted');
  });

  it('notifies subscribers when the decision changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToConsent(listener);

    setConsent('granted');
    expect(listener).toHaveBeenCalledTimes(1);

    // Same value again: nothing changed, so nothing is announced. This is what stops the
    // analytics module re-pushing an identical consent command on every notification.
    setConsent('granted');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setConsent('denied');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('clears the decision so the footer control can bring the banner back', () => {
    setConsent('granted');
    resetConsent();

    expect(getConsent()).toBe('unset');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('re-asks when the stored record is from an older consent version', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: 'granted', at: new Date().toISOString(), version: 0 }),
    );
    hydrateConsent();

    // A decision made about a different set of purposes is not a decision about this one.
    expect(getConsent()).toBe('unset');
  });

  it('re-asks when the stored record is corrupt rather than trusting it', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json');
    hydrateConsent();

    expect(getConsent()).toBe('unset');
  });

  it('falls back to unset when storage throws, which is the private-browsing case', () => {
    const getItem = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new DOMException('The operation is insecure.');
      });

    hydrateConsent();

    // Degrading towards 'unset' rather than 'granted' keeps a storage failure from becoming a
    // consent failure.
    expect(getConsent()).toBe('unset');
    getItem.mockRestore();
  });

  it('does not throw when a write is blocked', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    expect(() => setConsent('granted')).not.toThrow();
    // The choice still holds in memory for this page.
    expect(getConsent()).toBe('granted');
    setItem.mockRestore();
  });

  describe('Global Privacy Control', () => {
    it('is detected when the browser sets it', () => {
      withGlobalPrivacyControl(true);
      expect(hasGlobalPrivacyControl()).toBe(true);
    });

    it('reads as a standing refusal, so the banner never appears', () => {
      withGlobalPrivacyControl(true);
      hydrateConsent();

      expect(getConsent()).toBe('denied');
    });

    it('cannot be overridden by a grant', () => {
      withGlobalPrivacyControl(true);
      hydrateConsent();

      setConsent('granted');

      // The browser-level signal outranks the UI. Honouring a grant here would mean the site
      // could talk a visitor out of a setting they have already made once, globally.
      expect(getConsent()).toBe('denied');
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('is not cached, so turning it off returns the visitor to being asked', () => {
      withGlobalPrivacyControl(true);
      hydrateConsent();
      expect(getConsent()).toBe('denied');

      withGlobalPrivacyControl(false);
      hydrateConsent();

      expect(getConsent()).toBe('unset');
    });
  });
});
