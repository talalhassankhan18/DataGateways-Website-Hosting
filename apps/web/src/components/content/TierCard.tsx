import { Check } from 'lucide-react';
import type { TierCard as TierCardContent } from '@datagateways/shared';
import { IndexNumber } from '@/components/primitives/IndexNumber';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { RevealItem } from '@/components/primitives/Reveal';

export interface TierCardProps {
  card: TierCardContent;
}

/** A capability tier: index, title, one summary sentence, four bullets. */
export function TierCard({ card }: TierCardProps) {
  return (
    <RevealItem
      as="li"
      className="flex h-full flex-col rounded-sm border border-hairline/10 bg-bg-surface/50 p-6 transition-[border-color] duration-hover hover:border-accent/30"
    >
      <IndexNumber value={card.index} />
      <h3 className="mt-6 text-h3 font-medium text-ink-primary">{card.title}</h3>
      <p className="mt-3 text-body-sm text-ink-secondary">{card.sentence}</p>

      <ul className="mt-8 flex flex-col gap-3 border-t border-hairline/10 pt-6">
        {card.bullets.map((bullet) => (
          <li key={bullet.value} className="flex items-start gap-3 text-body-sm text-ink-secondary">
            <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent-ink" />
            <PlaceholderBadge item={bullet}>{bullet.value}</PlaceholderBadge>
          </li>
        ))}
      </ul>
    </RevealItem>
  );
}
