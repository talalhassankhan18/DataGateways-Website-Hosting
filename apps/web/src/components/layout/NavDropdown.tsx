import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { NavNode } from '@datagateways/shared';
import { useEscapeKey } from '@/lib/hooks';
import { dropdownVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface NavDropdownProps {
  node: NavNode;
  /** Only one panel in the bar may be open; the bar owns that decision. */
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/** Hover close is delayed so a diagonal mouse path into the panel does not dismiss it. */
const CLOSE_DELAY_MS = 140;

/**
 * One primary-nav entry that opens a panel, plus the second level DataNerve needs.
 *
 * Built as a disclosure — a button with `aria-expanded` over a plain list of links — rather than
 * with the `menu`/`menuitem` roles. Those roles promise application-style arrow-key semantics that
 * a site nav does not implement, and screen readers then stop announcing the links as links.
 *
 * The trigger is a button and not the destination link, because the destination is in the panel:
 * "Product" opens, "View All" navigates. Any parent whose panel has no such entry keeps its own
 * href on the first child, so no destination is reachable only by hovering.
 */
export function NavDropdown({ node, open, onOpen, onClose }: NavDropdownProps) {
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>();
  const reduced = useReducedMotion() ?? false;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  /** Which second-level entry has its own panel showing. */
  const [openChild, setOpenChild] = useState<string | null>(null);

  const children = node.children ?? [];
  const active =
    pathname === node.href || children.some((child) => pathname.startsWith(child.href));

  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      onClose();
      setOpenChild(null);
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => cancelClose, []);

  // Collapse the second level whenever the panel itself closes, so reopening starts clean.
  useEffect(() => {
    if (!open) setOpenChild(null);
  }, [open]);

  /*
   * Escape closes and hands focus back to the trigger. The hand-back matters: without it focus is
   * left on a node that has just unmounted, and the browser drops it to the top of the document.
   *
   * It listens at the document rather than on the wrapper so it still fires when the panel was
   * opened by hover and focus is elsewhere entirely — and so the wrapper stays a plain div with no
   * keyboard handler on it.
   */
  useEscapeKey(open, () => {
    onClose();
    setOpenChild(null);
    triggerRef.current?.focus();
  });

  return (
    <li>
      {/*
        The handlers sit on this wrapper rather than on the <li> itself. Partly that is what
        jsx-a11y/no-noninteractive-element-interactions asks for — a list item is a semantic
        element and should not be behaving like a control — and partly it keeps the list markup
        clean: everything interactive is the button and the links inside.
      */}
      <div
        ref={wrapRef}
        className="relative"
        onMouseEnter={() => {
          cancelClose();
          onOpen();
        }}
        onMouseLeave={scheduleClose}
        // A panel left open behind departing focus is the classic keyboard trap-adjacent bug: the
        // links stay in the tab order while invisible to the mouse user who opened them.
        onBlur={(event) => {
          if (!wrapRef.current?.contains(event.relatedTarget as Node)) {
            onClose();
            setOpenChild(null);
          }
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (node.label === 'Services') {
              navigate(node.href);
              return;
            }
            open ? onClose() : onOpen();
          }}
          // Down-arrow opens without following anything, the usual disclosure shortcut.
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && !open) {
              event.preventDefault();
              onOpen();
            }
          }}
          className={cn(
            'flex items-center gap-1.5 py-2 text-body-sm transition-colors duration-hover hover:text-ink-primary',
            active || open ? 'text-ink-primary' : 'text-ink-secondary',
          )}
        >
          {node.label}
          <ChevronDown
            aria-hidden="true"
            className={cn('h-3.5 w-3.5 transition-transform duration-hover', open && '-rotate-180')}
          />
        </button>

        {open ? (
          <motion.div
            id={panelId}
            variants={dropdownVariants(reduced)}
            initial="hidden"
            animate="visible"
            className="absolute left-0 top-full pt-3"
          >
            <div className="tone-navy min-w-[15rem] rounded-md border border-hairline/15 p-2 shadow-[0_28px_60px_-24px_rgb(4_30_66_/_0.55)]">
              <ul>
                {children.map((child) => (
                  <NavDropdownItem
                    key={child.href + child.label}
                    child={child}
                    open={openChild === child.label}
                    onOpen={() => setOpenChild(child.label)}
                    onClose={() =>
                      setOpenChild((current) => (current === child.label ? null : current))
                    }
                    onNavigate={() => {
                      onClose();
                      setOpenChild(null);
                    }}
                  />
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </div>
    </li>
  );
}

interface NavDropdownItemProps {
  child: NavNode;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onNavigate: () => void;
}

/**
 * A row in the panel. When it has its own children (DataNerve) the row stays a link to the product
 * and a separate chevron button toggles the second level — one control per job, so the row can be
 * followed and expanded independently. Hover opens it too, for the mouse.
 */
function NavDropdownItem({ child, open, onOpen, onClose, onNavigate }: NavDropdownItemProps) {
  const subId = useId();
  const reduced = useReducedMotion() ?? false;
  const grandchildren = child.children ?? [];

  return (
    <li
      className={cn('relative', child.separated && 'mt-2 border-t border-hairline/15 pt-2')}
      onMouseEnter={grandchildren.length > 0 ? onOpen : undefined}
      onMouseLeave={grandchildren.length > 0 ? onClose : undefined}
    >
      <div className="flex items-stretch">
        <NavLink
          to={child.href}
          end={child.href === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex-1 rounded-sm px-4 py-3 transition-colors duration-hover hover:bg-bg-elevated',
              isActive ? 'text-accent-ink' : 'text-ink-primary',
            )
          }
        >
          <span className="block text-body-sm font-semibold">{child.label}</span>
        </NavLink>

        {grandchildren.length > 0 ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={subId}
            aria-label={`${child.label} ${site.ui.submenuHint}`}
            onClick={() => (open ? onClose() : onOpen())}
            className="flex w-10 shrink-0 items-center justify-center rounded-sm text-ink-secondary transition-colors duration-hover hover:bg-bg-elevated hover:text-ink-primary"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn('h-3.5 w-3.5 -rotate-90 transition-transform duration-hover', open && 'rotate-0')}
            />
          </button>
        ) : null}
      </div>

      {open && grandchildren.length > 0 ? (
        <motion.div
          id={subId}
          variants={dropdownVariants(reduced)}
          initial="hidden"
          animate="visible"
          // Sits beside the parent panel on desktop and tucks underneath where there is no room,
          // which is the only place this second level appears at all.
          className="lg:absolute lg:left-full lg:top-0 lg:pl-3"
        >
          <ul className="tone-navy mt-1 rounded-md border border-hairline/15 p-2 lg:mt-0 lg:min-w-[11rem] lg:shadow-[0_28px_60px_-24px_rgb(4_30_66_/_0.55)]">
            {grandchildren.map((grandchild) => (
              <li key={grandchild.href}>
                <NavLink
                  to={grandchild.href}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-sm px-4 py-2.5 text-body-sm font-semibold transition-colors duration-hover hover:bg-bg-elevated',
                      isActive ? 'text-accent-ink' : 'text-ink-primary',
                    )
                  }
                >
                  {grandchild.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}
    </li>
  );
}
