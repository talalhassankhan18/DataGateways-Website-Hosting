import type { IndexedCard } from '@datagateways/shared';
import { IndexNumber } from '@/components/primitives/IndexNumber';
import { RevealItem } from '@/components/primitives/Reveal';

export interface DifferentiatorCardProps {
  card: IndexedCard;
}

/** Numbered card with no destination — used where the point is the claim, not a link. */
export function DifferentiatorCard({ card }: DifferentiatorCardProps) {
  return (
    <RevealItem as="li" className="border-t border-hairline/15 pt-6">
      <IndexNumber value={card.index} />
      <h3 className="mt-6 min-h-[2.5rem] whitespace-pre-line text-h3 font-medium text-ink-primary sm:min-h-[3.75rem]">
        {card.title}
      </h3>
      <p className="mt-3 text-body-sm text-ink-secondary">{card.blurb}</p>
    </RevealItem>
  );
}
