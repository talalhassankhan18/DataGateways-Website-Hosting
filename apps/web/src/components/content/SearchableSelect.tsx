import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SearchableSelectProps {
  label: string;
  /** Shown as the trigger's text when nothing is chosen, and as the "no filter" option. */
  allLabel: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Placeholder for the search field inside the panel. */
  searchPlaceholder: string;
  /**
   * Id of the visible caption above the control.
   *
   * The trigger is a button, so it cannot be the target of a `<label>`. Pointing at the caption
   * means the accessible name is the words on screen rather than a second string that has to be
   * kept in step with them.
   */
  labelledBy?: string;
}

/**
 * A dropdown that can be searched.
 *
 * The partner directory briefly used a text input backed by a `<datalist>`, which is searchable
 * but does not look or behave like a dropdown — management asked for the dropdown back, with a
 * search. A native `<select>` cannot have one: it has no room for a text field, and the country
 * list is 249 entries long, which is not a list anyone should be asked to scroll.
 *
 * So the closed state is a button that reads like a select, and the open state is a panel with a
 * search field above the options. The behaviour a `<select>` gives for free has to be rebuilt,
 * and the parts that matter are:
 *
 *  - **It is a button, not an input.** Closed, it announces the current choice rather than
 *    looking like an empty text field the way the datalist version did.
 *  - **Escape closes it and returns focus to the trigger**, and a click outside closes it, so it
 *    cannot be left open and orphaned.
 *  - **The search field takes focus on open**, because searching is the reason it exists.
 *  - **`listbox`/`option` roles with `aria-selected`**, so a screen reader is told this is a
 *    choice between options and which one is active — a bare `<div>` of buttons would not say
 *    either.
 */
export function SearchableSelect({
  label,
  allLabel,
  options,
  value,
  onChange,
  searchPlaceholder,
  labelledBy,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const listId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  /* The search is scoped to one opening of the panel. Carrying the last search back in would
     show a list already narrowed by something the visitor typed minutes ago. */
  useEffect(() => {
    if (open) {
      setQuery('');
      searchRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      // Back to the trigger, or focus is stranded on an element that no longer exists.
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const control =
    'h-12 w-full rounded-sm border border-hairline/15 bg-bg-surface px-4 text-body-sm text-ink-primary';

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...(labelledBy ? { 'aria-labelledby': labelledBy } : { 'aria-label': label })}
        className={cn(
          control,
          'flex items-center justify-between gap-3 text-left transition-colors duration-hover',
          open ? 'border-accent/50' : 'hover:border-accent/30',
        )}
      >
        <span className={cn('truncate', !value && 'text-ink-muted')}>{value || allLabel}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-hover',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-20 overflow-hidden rounded-sm border border-hairline/15 bg-bg-base shadow-[0_12px_40px_rgb(4_30_66/0.14)]">
          <div className="relative border-b border-hairline/10">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listId}
              className="h-11 w-full bg-transparent pl-10 pr-3 text-body-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <ul id={listId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === ''}
                onClick={() => choose('')}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-body-sm transition-colors duration-hover hover:bg-bg-elevated',
                  value === '' ? 'font-semibold text-accent-ink' : 'text-ink-secondary',
                )}
              >
                {allLabel}
                {value === '' ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
              </button>
            </li>

            {filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === option}
                  onClick={() => choose(option)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-body-sm transition-colors duration-hover hover:bg-bg-elevated',
                    value === option ? 'font-semibold text-accent-ink' : 'text-ink-primary',
                  )}
                >
                  <span className="truncate">{option}</span>
                  {value === option ? (
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                  ) : null}
                </button>
              </li>
            ))}

            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-body-sm text-ink-muted">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
