import type { FilterTab } from '@datagateways/shared';
import { cn } from '@/lib/cn';

export interface FilterTabsProps {
  tabs: readonly FilterTab[];
  active: string;
  onChange: (id: string) => void;
  label: string;
}

/**
 * Filters, not tabs in the ARIA sense: there is no tabpanel here, just a list that shortens.
 * A group of toggle buttons with aria-pressed is the honest mapping, and it keeps the keyboard
 * model to plain Tab rather than the arrow-key behaviour a real tablist would owe the user.
 */
export function FilterTabs({ tabs, active, onChange, label }: FilterTabsProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-sm border px-5 py-2.5 text-body-sm transition-colors duration-hover',
              selected
                ? 'border-accent/50 bg-accent/10 text-ink-primary'
                : 'border-hairline/15 text-ink-secondary hover:border-accent/30 hover:text-ink-primary',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
