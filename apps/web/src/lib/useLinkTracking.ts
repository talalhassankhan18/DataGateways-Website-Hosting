import { useEffect } from 'react';
import { analyticsConfigured, classifyLink, trackEvent } from '@/lib/analytics';

/**
 * One delegated listener for every link that leaves the site.
 *
 * Outbound, mailto and tel links are tracked here rather than at each call site because they are
 * not all call sites we control: the footer's social icons, the contact block's email and phone,
 * and the address block are plain anchors, and wrapping each one in a tracked primitive would mean
 * editing markup across the site to measure something the document can observe for free.
 *
 * The split with the primitives is deliberate and is what keeps counts honest. `Button` and
 * `ArrowLink` fire `cta_click` for *internal* destinations only; this listener fires
 * `outbound_click` and `contact_channel_click` for *external* ones. No href is seen by both.
 *
 * Mounted once, in the router layout, so it survives route changes.
 */
export const useLinkTracking = () => {
  useEffect(() => {
    if (!analyticsConfigured) return;

    const onClick = (event: MouseEvent) => {
      /* A handler earlier in the bubble already cancelled the navigation, so nothing left. */
      if (event.defaultPrevented) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      /* getAttribute rather than .href: the property resolves mailto and relative values into an
         absolute URL, which throws away exactly the distinction being tested for. */
      const href = anchor.getAttribute('href') ?? '';
      const link = classifyLink(href);

      if (link.kind === 'email' || link.kind === 'phone') {
        /* The address itself is not sent. Which channel was used is the useful signal; who was
           written to is personal data that has no business in an analytics property. */
        trackEvent('contact_channel_click', { channel: link.kind });
        return;
      }

      if (link.kind !== 'outbound') return;

      trackEvent('outbound_click', {
        link_url: link.url,
        link_domain: link.domain,
        /* aria-label first: the social icons are unlabelled anchors wrapping an SVG, so their
           textContent is empty and only the label says which network was clicked. */
        link_text: (anchor.getAttribute('aria-label') || anchor.textContent || '')
          .trim()
          .slice(0, 100),
      });
    };

    /* Capture phase. React attaches its own handlers at the root, and a component that calls
       stopPropagation on a click would otherwise hide that click from a listener on document. */
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);
};
