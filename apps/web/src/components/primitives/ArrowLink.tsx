import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { classifyLink, currentRoutePath, trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/cn';

export interface ArrowLinkProps {
  label: string;
  to?: string;
  href?: string;
  className?: string;
  /**
   * When the link sits inside a card whose title already names the destination, pass the title so
   * the accessible name is "Explore, DataNerve" rather than four identical "Explore" links.
   */
  context?: string;
  /** Set when an ancestor already carries the click target, e.g. a card-wide stretched link. */
  asText?: boolean;
}

/*
 * `tap-target` expands the hit area to the 44px a finger needs without adding 19px of visible
 * height to every card footer on the site — see styles/index.css. The link itself is 25px tall,
 * which is fine to look at and small to hit.
 *
 * Not applied to the `asText` variant: there the whole card is already the target, and a second
 * overlapping hit area inside it would sit on top of the one that actually navigates.
 */
const CLASSES =
  'group/arrow inline-flex items-center gap-2 text-body-sm font-medium text-accent-ink transition-colors duration-hover hover:text-ink-primary';

const LINK_CLASSES = `${CLASSES} tap-target`;

const Inner = ({ label }: { label: string }) => (
  <>
    {label}
    <ArrowRight
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-hover group-hover/arrow:translate-x-1 group-hover/card:translate-x-1"
    />
  </>
);

export function ArrowLink({ label, to, href, className, context, asText }: ArrowLinkProps) {
  const accessibleName = context ? `${label}, ${context}` : undefined;

  /* Internal destinations only — see the matching note in Button. Outbound, mailto and tel are
     the delegated listener's, so a click is never counted by both. */
  const trackCta = (destination: string) => {
    trackEvent('cta_click', {
      /* The context, where a card passed one, is what distinguishes four identical "Explore"
         links from each other — the same reason it is in the accessible name. */
      cta_label: accessibleName ?? label,
      cta_destination: destination,
      cta_location: currentRoutePath(),
    });
  };

  if (asText) {
    return (
      <span aria-hidden="true" className={cn(CLASSES, className)}>
        <Inner label={label} />
      </span>
    );
  }

  if (to) {
    return (
      <Link
        to={to}
        className={cn(LINK_CLASSES, className)}
        aria-label={accessibleName}
        onClick={() => trackCta(to)}
      >
        <Inner label={label} />
      </Link>
    );
  }

  const internal = href ? classifyLink(href).kind === 'internal' : false;

  return (
    <a
      href={href}
      className={cn(LINK_CLASSES, className)}
      aria-label={accessibleName}
      onClick={internal && href ? () => trackCta(href) : undefined}
    >
      <Inner label={label} />
    </a>
  );
}
