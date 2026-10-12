import { Children, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { classifyLink, trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'ghost';

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  'aria-label'?: string;
}

interface AsLink extends BaseProps {
  to: string;
  href?: never;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface AsAnchor extends BaseProps {
  href: string;
  to?: never;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface AsButton extends BaseProps {
  to?: never;
  href?: never;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export type ButtonProps = AsLink | AsAnchor | AsButton;

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-body-sm font-medium transition-colors duration-hover disabled:cursor-not-allowed disabled:opacity-60';

const VARIANT: Record<ButtonVariant, string> = {
  /* Not bg-accent: white on the brand blue lands at exactly 4.50:1, which is on the AA line
     rather than over it. accent-solid sits at 5.9:1 and accent-hover at 4.7:1. */
  primary: 'bg-accent-solid text-ink-on-accent hover:bg-accent-hover',
  ghost: 'border border-hairline/15 text-ink-primary hover:border-accent/50 hover:bg-bg-elevated',
};

/**
 * The button's own words, for the `cta_label` parameter.
 *
 * Buttons on this site are given a plain string or a string beside an icon element, so flattening
 * one level of children and keeping the string parts covers every call site. An explicit
 * aria-label wins, because where one exists it is there precisely because the visible text is not
 * self-describing.
 */
const labelOf = (children: ReactNode, ariaLabel?: string): string => {
  if (ariaLabel) return ariaLabel;

  return Children.toArray(children)
    .filter((child) => typeof child === 'string' || typeof child === 'number')
    .join(' ')
    .trim()
    .slice(0, 100);
};

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', className } = props;
  const classes = cn(BASE, VARIANT[variant], className);
  const label = props['aria-label'];

  /*
   * Internal destinations only. Links that leave the site are counted by the delegated listener
   * in useLinkTracking as `outbound_click`, and firing here as well would have one click arrive
   * as two events that both claim to be the whole story.
   *
   * The AsButton variant is not tracked either: those are in-page controls — "Start over", a
   * filter reset — and a form that wants to report a submission says so itself, with the branch
   * and outcome that make the event worth having.
   */
  const trackCta = (destination: string) => {
    trackEvent('cta_click', {
      cta_label: labelOf(children, label),
      cta_destination: destination,
      cta_location: window.location.pathname,
    });
  };

  if ('to' in props && props.to) {
    const to = props.to;
    return (
      <Link to={to} className={classes} aria-label={label} onClick={() => trackCta(to)}>
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    const href = props.href;
    const external = href.startsWith('http');
    const internal = classifyLink(href).kind === 'internal';

    return (
      <a
        href={href}
        className={classes}
        aria-label={label}
        onClick={internal ? () => trackCta(href) : undefined}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {children}
      </a>
    );
  }

  const { onClick, type = 'button', disabled } = props as AsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={label}>
      {children}
    </button>
  );
}
