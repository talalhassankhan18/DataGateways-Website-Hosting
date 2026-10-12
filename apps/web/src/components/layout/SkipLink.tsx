import { site } from '@/content/site';

/**
 * Visible only once focused. Sits first in the DOM so it is the very first stop for a keyboard user.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-skip focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-md focus:bg-accent-solid focus:px-5 focus:py-3 focus:text-body-sm focus:font-medium focus:text-ink-on-accent"
    >
      {site.ui.skipToContent}
    </a>
  );
}
