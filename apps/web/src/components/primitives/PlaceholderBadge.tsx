import type { ReactNode } from 'react';
import type { ContentValue } from '@datagateways/shared';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface PlaceholderBadgeProps {
  item: ContentValue<unknown>;
  children: ReactNode;
  className?: string;
  as?: 'span' | 'div';
}

/**
 * Development-only outline around any value the copy deck marked [PLACEHOLDER] or [CONFIRM].
 * Compiled out of the production bundle, so it costs nothing at runtime — its whole job is to make
 * unverified security and compliance claims impossible to miss while the site is being reviewed.
 *
 * The register of every one of these lives in docs/PLACEHOLDERS.md (`npm run docs:placeholders`).
 *
 * NOT A LAYOUT ELEMENT. For a verified value — and for every value in a production build — this
 * renders its children and nothing else: no wrapper, and so no `as` and no `className`. Anything
 * positional has to come from the caller's own markup, or it will be there in development, absent
 * in production, and absent for exactly the content that was signed off. The two address lines in
 * the mobile menu ran together for that reason.
 */
export function PlaceholderBadge({ item, children, className, as: Tag = 'span' }: PlaceholderBadgeProps) {
  if (!import.meta.env.DEV || item.status === 'verified') {
    return <>{children}</>;
  }

  const label = item.status === 'placeholder' ? 'PLACEHOLDER' : 'CONFIRM';

  return (
    <Tag
      data-placeholder={item.status}
      title={item.note ? `${site.ui.placeholderBadgeTitle}: ${item.note}` : site.ui.placeholderBadgeTitle}
      className={cn(
        'relative outline outline-1 outline-offset-2 outline-dashed outline-accent-ink/60',
        Tag === 'span' ? 'inline-block' : 'block',
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 right-0 translate-x-1/2 rounded-sm bg-accent-solid px-1 font-mono text-[9px] leading-4 tracking-widest text-ink-on-accent"
      >
        {label}
      </span>
    </Tag>
  );
}
