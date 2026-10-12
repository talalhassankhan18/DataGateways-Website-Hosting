import type { ContentValue } from '@datagateways/shared';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { RevealGroup, RevealItem } from '@/components/primitives/Reveal';

export interface TrustBandProps {
  marks: readonly ContentValue<string>[];
}

/**
 * The copy deck's replacement for the counter row when no real metrics exist: certification marks
 * instead of invented numbers. Every mark is [CONFIRM] — an unearned certification mark on a
 * security site is a legal problem, not a copy problem.
 */
export function TrustBand({ marks }: TrustBandProps) {
  return (
    <RevealGroup as="ul" className="flex flex-wrap items-center gap-4">
      {marks.map((mark) => (
        <RevealItem as="li" key={mark.value}>
          <PlaceholderBadge item={mark}>
            <span className="inline-flex items-center rounded-sm border border-hairline/15 px-5 py-3 text-body-sm text-ink-secondary">
              {mark.value}
            </span>
          </PlaceholderBadge>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
