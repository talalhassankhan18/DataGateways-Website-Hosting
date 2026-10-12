import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CookieBanner } from './CookieBanner';
import { CookieSettingsLink } from './CookieSettingsLink';
import {
  __closeConsentBannerForTests,
  analyticsAllowed,
  getConsent,
  resetConsent,
  setConsent,
} from '@/lib/consent';
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

/** The banner and the control that opens it, which is now the only way to reach it. */
const renderBoth = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
      <CookieSettingsLink />
    </MemoryRouter>,
  );

const banner = () => screen.queryByRole('region', { name: copy.banner.landmark });

describe('CookieBanner', () => {
  beforeEach(() => {
    analyticsState.configured = true;
    window.localStorage.clear();
    withGlobalPrivacyControl(undefined);
    resetConsent();
    __closeConsentBannerForTests();
  });

  afterEach(() => {
    analyticsState.configured = true;
    window.localStorage.clear();
    withGlobalPrivacyControl(undefined);
    resetConsent();
    __closeConsentBannerForTests();
  });

  describe('on load', () => {
    it('does not appear, even for a visitor who has never chosen', () => {
      renderBoth();

      // The 12 October change: no popup on first load. This is the assertion that would catch
      // the banner coming back, which is the one thing the client asked not to happen.
      expect(getConsent()).toBe('unset');
      expect(banner()).not.toBeInTheDocument();
    });

    it('still lets analytics run while no decision exists', () => {
      // The flip side of not asking: an absent choice has to mean yes, or removing the banner
      // would have quietly switched collection off altogether.
      expect(analyticsAllowed()).toBe(true);
    });

    it('does not appear for a visitor who previously declined', () => {
      setConsent('denied');
      renderBoth();

      expect(banner()).not.toBeInTheDocument();
      expect(analyticsAllowed()).toBe(false);
    });
  });

  describe('opened from the footer', () => {
    it('appears when the Cookie settings control is used', async () => {
      const user = userEvent.setup();
      renderBoth();
      expect(banner()).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: copy.settings.label }));

      // GDPR Article 7(3): withdrawing has to be as easy as giving. With no banner on load this
      // control is the only route to a decision, so it has to actually produce one.
      expect(banner()).toBeInTheDocument();
    });

    it('announces itself, because the banner is at the other end of the page', async () => {
      const user = userEvent.setup();
      renderBoth();

      await user.click(screen.getByRole('button', { name: copy.settings.label }));

      expect(screen.getByRole('status')).toHaveTextContent(copy.settings.reopened);
    });

    it('records a refusal and closes', async () => {
      const user = userEvent.setup();
      renderBoth();
      await user.click(screen.getByRole('button', { name: copy.settings.label }));

      await user.click(screen.getByRole('button', { name: copy.banner.reject }));

      expect(getConsent()).toBe('denied');
      expect(analyticsAllowed()).toBe(false);
      /* The banner leaves through an AnimatePresence exit, so its removal lands a frame or two
         after the click rather than synchronously with it. */
      await waitFor(() => expect(banner()).not.toBeInTheDocument());
    });

    it('records an acceptance and closes', async () => {
      const user = userEvent.setup();
      renderBoth();
      await user.click(screen.getByRole('button', { name: copy.settings.label }));

      await user.click(screen.getByRole('button', { name: copy.banner.accept }));

      expect(getConsent()).toBe('granted');
      await waitFor(() => expect(banner()).not.toBeInTheDocument());
    });

    it('lets a refusal be reversed', async () => {
      const user = userEvent.setup();
      renderBoth();

      await user.click(screen.getByRole('button', { name: copy.settings.label }));
      await user.click(screen.getByRole('button', { name: copy.banner.reject }));
      expect(analyticsAllowed()).toBe(false);

      await user.click(screen.getByRole('button', { name: copy.settings.label }));
      await user.click(screen.getByRole('button', { name: copy.banner.accept }));

      expect(analyticsAllowed()).toBe(true);
    });
  });

  describe('the two choices', () => {
    const open = async () => {
      const user = userEvent.setup();
      renderBoth();
      await user.click(screen.getByRole('button', { name: copy.settings.label }));
      return user;
    };

    it('gives both buttons the same size and the same row', async () => {
      await open();

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

    it('offers no way out that is not a decision', async () => {
      await open();

      const region = screen.getByRole('region', { name: copy.banner.landmark });
      const buttons = Array.from(region.querySelectorAll('button')).map((button) =>
        button.textContent?.trim(),
      );

      // No close, no X, no "continue without choosing". Dismissal is not consent, so the only
      // exits state a position.
      expect(buttons).toEqual([copy.banner.accept, copy.banner.reject]);
    });

    it('points at the privacy policy', async () => {
      await open();

      expect(screen.getByRole('link', { name: copy.banner.policyLabel })).toHaveAttribute(
        'href',
        copy.banner.policyHref,
      );
    });

    it('does not take focus when it appears', () => {
      renderBoth();

      // An unexpected focus jump is disorienting. The labelled region is how a screen reader
      // finds it instead.
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('Global Privacy Control', () => {
    it('refuses analytics and cannot be opened', async () => {
      const user = userEvent.setup();
      withGlobalPrivacyControl(true);
      resetConsent();
      renderBoth();

      await user.click(screen.getByRole('button', { name: copy.settings.label }));

      // The browser's standing refusal outranks the UI, so there is nothing to decide — the
      // control says so instead of opening a banner that could not change anything.
      expect(banner()).not.toBeInTheDocument();
      expect(analyticsAllowed()).toBe(false);
      expect(screen.getByRole('status')).toHaveTextContent(copy.globalPrivacyControl.body);
    });
  });

  describe('without a measurement ID', () => {
    it('hides the footer control too, since there is nothing to configure', () => {
      analyticsState.configured = false;
      renderBoth();

      expect(screen.queryByRole('button', { name: copy.settings.label })).not.toBeInTheDocument();
      expect(banner()).not.toBeInTheDocument();
    });
  });
});
