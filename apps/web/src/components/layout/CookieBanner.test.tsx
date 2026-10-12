import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CookieBanner } from './CookieBanner';
import { CookieSettingsLink } from './CookieSettingsLink';
import { getConsent, resetConsent, setConsent } from '@/lib/consent';
import { consent as copy } from '@/content/consent';
import type * as AnalyticsModule from '@/lib/analytics';

/* The banner is gated on a measurement ID being configured, which depends on the environment the
   suite happens to run in. Held in a mutable flag so both sides of that gate are testable. */
const analyticsState = vi.hoisted(() => ({ configured: true }));

vi.mock('@/lib/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof AnalyticsModule>();
  return {
    ...actual,
    get analyticsConfigured() {
      return analyticsState.configured;
    },
    trackConsentDecision: vi.fn(),
  };
});

const withGlobalPrivacyControl = (value: boolean | undefined) => {
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    value,
    configurable: true,
    writable: true,
  });
};

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>,
  );

describe('CookieBanner', () => {
  beforeEach(() => {
    analyticsState.configured = true;
    window.localStorage.clear();
    withGlobalPrivacyControl(undefined);
    resetConsent();
  });

  afterEach(() => {
    analyticsState.configured = true;
    window.localStorage.clear();
    withGlobalPrivacyControl(undefined);
    resetConsent();
  });

  it('does not ask when there is no measurement ID to ask about', () => {
    analyticsState.configured = false;
    renderBanner();

    // The shipping state of the repo until the client supplies an ID. Asking a visitor to
    // consent to analytics that cannot load is both a worse first impression than silence and
    // simply untrue.
    expect(screen.queryByRole('region', { name: copy.banner.landmark })).not.toBeInTheDocument();
  });

  it('hides the footer control too when there is nothing to configure', () => {
    analyticsState.configured = false;
    render(
      <MemoryRouter>
        <CookieSettingsLink />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: copy.settings.label })).not.toBeInTheDocument();
  });

  it('asks a visitor who has not been asked', () => {
    renderBanner();

    expect(screen.getByRole('region', { name: copy.banner.landmark })).toBeInTheDocument();
  });

  it('stays away once a decision exists', () => {
    setConsent('denied');
    renderBanner();

    // A banner that reappears after a refusal is not asking, it is wearing someone down.
    expect(screen.queryByRole('region', { name: copy.banner.landmark })).not.toBeInTheDocument();
  });

  it('never appears for a browser sending Global Privacy Control', () => {
    withGlobalPrivacyControl(true);
    resetConsent();
    renderBanner();

    expect(screen.queryByRole('region', { name: copy.banner.landmark })).not.toBeInTheDocument();
    expect(getConsent()).toBe('denied');
  });

  describe('the two choices', () => {
    it('offers refusal in one click, exactly like acceptance', async () => {
      const user = userEvent.setup();
      renderBanner();

      // One click each, both buttons, both visible without opening anything. The EDPB and CNIL
      // both read a refusal that is harder to reach than an acceptance as no consent at all.
      await user.click(screen.getByRole('button', { name: copy.banner.reject }));

      expect(getConsent()).toBe('denied');
    });

    it('grants analytics on acceptance', async () => {
      const user = userEvent.setup();
      renderBanner();

      await user.click(screen.getByRole('button', { name: copy.banner.accept }));

      expect(getConsent()).toBe('granted');
    });

    it('gives both buttons the same size and the same row', () => {
      renderBanner();

      const accept = screen.getByRole('button', { name: copy.banner.accept });
      const reject = screen.getByRole('button', { name: copy.banner.reject });

      // Not a pixel comparison -- jsdom has no layout. This asserts the padding, text size and
      // minimum width that make them equal, which is the thing a restyle would quietly break.
      for (const className of ['px-6', 'py-3', 'text-body-sm', 'sm:min-w-[11rem]']) {
        expect(accept.className).toContain(className);
        expect(reject.className).toContain(className);
      }

      expect(accept.parentElement).toBe(reject.parentElement);
    });

    it('offers no way out that is not a decision', () => {
      renderBanner();

      const region = screen.getByRole('region', { name: copy.banner.landmark });
      const buttons = Array.from(region.querySelectorAll('button')).map((button) =>
        button.textContent?.trim(),
      );

      // No close, no X, no "continue without choosing". Dismissal is not consent, so the only
      // exits state a position.
      expect(buttons).toEqual([copy.banner.accept, copy.banner.reject]);
    });
  });

  it('points at the privacy policy', () => {
    renderBanner();

    expect(screen.getByRole('link', { name: copy.banner.policyLabel })).toHaveAttribute(
      'href',
      copy.banner.policyHref,
    );
  });

  it('does not take focus when it appears', () => {
    renderBanner();

    // An unexpected focus jump on load is disorienting, and hostile to a visitor with no
    // intention of engaging with it. The labelled region is how a screen reader finds it instead.
    expect(document.activeElement).toBe(document.body);
  });

  it('comes back after the footer control clears the decision', async () => {
    const user = userEvent.setup();
    setConsent('granted');

    render(
      <MemoryRouter>
        <CookieBanner />
        <CookieSettingsLink />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('region', { name: copy.banner.landmark })).not.toBeInTheDocument();

    // GDPR Article 7(3): withdrawing has to be as easy as giving.
    await user.click(screen.getByRole('button', { name: copy.settings.label }));

    expect(screen.getByRole('region', { name: copy.banner.landmark })).toBeInTheDocument();
    expect(getConsent()).toBe('unset');
  });

  it('explains itself rather than doing nothing when GPC is on', async () => {
    const user = userEvent.setup();
    withGlobalPrivacyControl(true);

    render(
      <MemoryRouter>
        <CookieSettingsLink />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: copy.settings.label }));

    // There is nothing to reset -- the browser's standing refusal outranks anything the control
    // could store -- so it says so instead of looking broken.
    expect(screen.getByRole('status')).toHaveTextContent(copy.globalPrivacyControl.body);
  });
});
