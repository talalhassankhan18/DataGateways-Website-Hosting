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
          // No rules between figures — removed 19 Oct at management's request, here as well as
          // in the slider, so the two counter presentations still match each other.
          className="py-8 sm:pl-8 sm:[&:nth-child(2n+1)]:pl-0 lg:py-0 lg:pl-8 lg:[&:first-child]:pl-0"
        >
          <Counter item={item} index={index} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
