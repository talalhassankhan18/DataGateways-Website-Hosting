import type { CounterItem } from '@datagateways/shared';
import { RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { Counter } from './Counter';

export interface CounterRowProps {
  items: readonly CounterItem[];
}

export function CounterRow({ items }: CounterRowProps) {
  return (
    <RevealGroup as="ul" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <RevealItem
          as="li"
          key={item.label}
          // Divided by hairlines rather than gaps, so the row reads as one band.
          className="border-t border-hairline/20 py-8 sm:[&:nth-child(2n+2)]:border-l sm:[&:nth-child(2n+2)]:pl-8 lg:border-t-0 lg:py-0 lg:pl-8 lg:[&:first-child]:pl-0 lg:[&:not(:first-child)]:border-l"
        >
          <Counter item={item} index={index} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
