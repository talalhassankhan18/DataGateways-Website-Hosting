import { useState } from 'react';
import { analyticsConfigured } from '@/lib/analytics';
import { hasGlobalPrivacyControl, resetConsent } from '@/lib/consent';
import { consent as copy } from '@/content/consent';

/**
 * The permanent way back to the consent decision, in the footer's legal row.
 *
 * GDPR Article 7(3) says withdrawing consent must be as easy as giving it. A banner that never
 * returns once dismissed fails that outright, so this clears the stored decision and the banner
 * comes back.
 *
 * It announces the result because the only visible effect happens at the other end of a long
 * page: a sighted visitor at the footer sees a banner appear in the viewport, but a screen-reader
 * user gets no signal at all that the link did anything.
 *
 * With Global Privacy Control set, there is nothing to reset — the browser's standing refusal
 * outranks anything this control could store — so it says so instead of silently doing nothing.
 */
export function CookieSettingsLink() {
  const [announcement, setAnnouncement] = useState('');

  /* Hidden for the same reason the banner is: with no measurement ID there is no cookie to have
     a setting about, and a control that resets a decision nobody was asked to make is furniture.
     Hooks run first so the order stays stable whichever way this falls. */
  if (!analyticsConfigured) return null;

  const onClick = () => {
    if (hasGlobalPrivacyControl()) {
      setAnnouncement(copy.globalPrivacyControl.body);
      return;
    }

    resetConsent();
    setAnnouncement(copy.settings.reopened);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="block py-1.5 text-body-sm text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
      >
        {copy.settings.label}
      </button>

      {/* Polite, not assertive: this is a confirmation, and it should wait for whatever the
          reader is in the middle of. */}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
