import { cn } from '@/lib/cn';
import { useScrollSpy } from '@/lib/hooks';
import { scrollToElement } from '@/lib/useSmoothScroll';
import { site } from '@/content/site';
import type { AnchorDef } from '@/content/home';

export interface AnchorRailProps {
  anchors: readonly AnchorDef[];
}

/**
 * Scroll-spy dots on the right edge. Hidden below 1024px, where there is no room for it and the
 * page is short enough not to need it.
 *
 * The dots are real links with real text, visually hidden — a rail of unlabelled dots is a dead end
 * for anyone not using a mouse.
 */
/** Bands the rail has to invert over. The hero carries no tone but is always dark. */
const DARK_TONES = new Set(['band', 'navy']);

export function AnchorRail({ anchors }: AnchorRailProps) {
  const ids = anchors.map((anchor) => anchor.id);
  const active = useScrollSpy(ids);

  /*
   * The rail is fixed, so it floats over whichever band happens to be behind it — and this design
   * alternates between off-white and navy. Reading the active section's own tone is what keeps the
   * dots visible on both; a single fixed colour disappears against one or the other.
   */
  const activeTone =
    typeof document === 'undefined'
      ? undefined
      : (document.getElementById(active ?? '')?.dataset.tone ?? (active === 'hero' ? 'navy' : undefined));
  const overDark = DARK_TONES.has(activeTone ?? '');

  if (anchors.length < 2) return null;

  return (
    <nav
      aria-label={site.ui.sectionRailLandmark}
      className={cn(
        'fixed right-6 top-1/2 z-rail hidden -translate-y-1/2 lg:block',
        overDark && 'ink-on-dark',
      )}
    >
      <ul className="flex flex-col items-center gap-4">
        {anchors.map((anchor) => {
          const isActive = anchor.id === active;
          return (
            <li key={anchor.id}>
              <a
                href={`#${anchor.id}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={(event) => {
                  const target = document.getElementById(anchor.id);
                  if (!target) return;
                  // Lenis and scrollIntoView both try to own the scroll position; letting the
                  // browser do it while Lenis is running makes the jump stutter.
                  event.preventDefault();
                  scrollToElement(target);
                  history.replaceState(null, '', `#${anchor.id}`);
                }}
                className="group/dot flex h-6 w-6 items-center justify-center"
              >
                <span className="sr-only">{`${site.ui.sectionRailJump} ${anchor.label}`}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-2 w-2 rounded-full transition-all duration-hover',
                    isActive
                      ? 'scale-[1.4] bg-accent-ink'
                      : 'bg-ink-primary/40 group-hover/dot:bg-ink-primary/80',
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
