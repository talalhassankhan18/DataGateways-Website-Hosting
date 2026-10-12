import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { analyticsConfigured, trackConsentDecision } from '@/lib/analytics';
import { closeConsentBanner, setConsent, useConsentBannerOpen } from '@/lib/consent';
import { EXPO_OUT } from '@/lib/motion';
import { consent as copy } from '@/content/consent';

/**
 * The consent banner.
 *
 * Four decisions in here are about compliance rather than looks, and each one is the reason the
 * obvious simpler version is wrong:
 *
 * **Accept and Decline are the same size, in the same row, one click each.** Not a bright accept
 * button beside a grey text link. The GDPR requires consent to be freely given, and the EDPB and
 * CNIL both read a refusal that is harder to find or operate than an acceptance as no consent at
 * all. For a company that sells data governance, getting this wrong would be worse than the
 * fine.
 *
 * **There is no close button and no "X".** Dismissing without choosing is not consent, so the
 * only exits are the two that state a position. The banner is non-modal and does not trap focus,
 * so it blocks nothing in the meantime — you can read the whole site with it on screen.
 *
 * **It is rendered early in the DOM**, right after the skip link, so a keyboard or screen-reader
 * user meets it before the navigation rather than after the footer. It is painted at the bottom
 * of the viewport, which is where people look for it.
 *
 * **It does not steal focus.** An unexpected focus jump on load is disorienting and, for a
 * visitor who has no intention of engaging with it, hostile. The `region` role and label let a
 * screen reader find it on demand instead.
 */
export function CookieBanner() {
  const open = useConsentBannerOpen();
  const reduced = useReducedMotion() ?? false;

  const decide = (next: 'granted' | 'denied') => {
    closeConsentBanner();
    setConsent(next);
    /* Order matters: the store update flips gtag's consent state first, so an acceptance is
       recorded under the consent it just granted rather than against the denied default. */
    trackConsentDecision(next);
  };

  const { banner } = copy;

  /*
   * No measurement ID, no banner.
   *
   * Without this the site asks every visitor to consent to Google Analytics in a build that
   * loads no analytics at all — which is both a worse first impression than no banner and, more
   * to the point, untrue. It is the shipping state of this repo until the client supplies an ID,
   * and it would have been the state of the live site on day one.
   *
   * Nothing is stored either way, so adding the ID later brings the banner back for everyone,
   * which is the correct order: the question only becomes real once the answer does.
   */
  if (!analyticsConfigured) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="region"
          aria-label={banner.landmark}
          className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reduced ? 0.01 : 0.6, ease: EXPO_OUT }}
        >
          <div className="mx-auto max-w-3xl rounded-md border border-hairline/15 bg-bg-base p-5 shadow-[0_12px_40px_rgb(4_30_66/0.18)] sm:p-6">
            <SplitHeading as="p" size="h3" roman={banner.heading.roman} accent={banner.heading.accent} />

            <p className="mt-3 max-w-measure text-body-sm text-ink-secondary">{banner.body}</p>

            {/* Equal weight, equal size, same row. See the note above — this is the compliance
                surface, not a styling preference. */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => decide('granted')}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-accent-solid px-6 py-3 text-body-sm font-medium text-ink-on-accent transition-colors duration-hover hover:bg-accent-hover sm:flex-none sm:min-w-[11rem]"
              >
                {banner.accept}
              </button>

              <button
                type="button"
                onClick={() => decide('denied')}
                className="inline-flex flex-1 items-center justify-center rounded-md border border-ink-primary/70 px-6 py-3 text-body-sm font-medium text-ink-primary transition-colors duration-hover hover:bg-bg-elevated sm:flex-none sm:min-w-[11rem]"
              >
                {banner.reject}
              </button>

              <p className="text-body-sm text-ink-secondary sm:ml-auto">
                {banner.policyPrefix}{' '}
                <Link
                  to={banner.policyHref}
                  className="text-accent-ink underline underline-offset-4 transition-colors duration-hover hover:text-ink-primary"
                >
                  {banner.policyLabel}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
