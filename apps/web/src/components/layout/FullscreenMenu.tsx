import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import type { NavNode } from '@datagateways/shared';
import { Container } from '@/components/primitives/Container';
import { IndexNumber } from '@/components/primitives/IndexNumber';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from '@/lib/hooks';
import { overlayItemVariants, overlayVariants } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { site } from '@/content/site';

export interface FullscreenMenuProps {
  open: boolean;
  onClose: () => void;
  id: string;
}

/** Depth decides the type size and the indent; the behaviour is identical at every level. */
type Depth = 0 | 1 | 2;

const ROW_CLASS: Record<Depth, string> = {
  0: 'text-h2 font-medium',
  1: 'text-lead font-medium',
  2: 'text-body',
};

const INDENT_CLASS: Record<Depth, string> = {
  0: '',
  1: 'pl-8 sm:pl-[3.25rem]',
  2: 'pl-14 sm:pl-[5rem]',
};

/**
 * The mobile menu, as a disclosure tree.
 *
 * It used to render a flat list of six top-level destinations, which is how the whole second and
 * third levels of the site became unreachable on a phone: /products was there, DataNerve, AINerve
 * and SOCMINT were not, nor the three capability pages under DataNerve, nor AI Services, nor two
 * of the three partner pages. The header had them; the overlay was a separate hand-written list
 * that had drifted. It is now derived from the same tree — see `nav.menu` in content/site.
 *
 * Each row with children is a link AND a separate chevron button, never one control doing both.
 * Tapping the label follows the parent, tapping the chevron opens the branch, which is what makes
 * "Product" reachable on a touch device where the header's hover panel is not.
 *
 * The branch opens by transitioning `grid-template-rows` from 0fr to 1fr, the one way to animate
 * to a content-driven height in CSS — `height: auto` does not interpolate. `.menu-branch` also
 * flips `visibility` at the end of the collapse, which is what keeps the collapsed links out of
 * the tab order; `overflow: hidden` alone hides them from the eye and not from the keyboard.
 */
export function FullscreenMenu({ open, onClose, id }: FullscreenMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { pathname } = useLocation();

  /** Which branches are open, by href. Reset each time the menu is opened. */
  const [expanded, setExpanded] = useState<readonly string[]>([]);

  useLockBodyScroll(open);
  useEscapeKey(open, onClose);
  useFocusTrap(panelRef, open);

  /*
   * Open the branch containing the current page, so the menu shows where you are rather than
   * making you find it again. Runs on open rather than on mount: the overlay unmounts when closed,
   * but the branch state would otherwise survive a navigation within one open session.
   */
  useEffect(() => {
    if (!open) return;
    setExpanded(
      site.nav.menu
        .flatMap((node) => [node, ...(node.children ?? [])])
        .filter((node) => node.children && pathname.startsWith(node.href))
        .map((node) => node.href),
    );
  }, [open, pathname]);

  if (!open) return null;

  const toggle = (href: string) =>
    setExpanded((current) =>
      current.includes(href) ? current.filter((item) => item !== href) : [...current, href],
    );

  return (
    <motion.div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={site.ui.menuLandmark}
      className="tone-navy fixed inset-0 z-overlay overflow-hidden"
      variants={overlayVariants(reduced)}
      initial="hidden"
      animate="visible"
    >
      <Container className="flex h-full flex-col justify-between py-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={site.ui.menuClose}
            className="flex h-12 w-12 items-center justify-center rounded-md border border-hairline/15 text-ink-primary transition-colors duration-hover hover:border-accent/50 hover:bg-bg-elevated"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label={site.ui.menuLandmark} className="flex-1 overflow-y-auto py-8">
          <ul className="flex flex-col">
            {site.nav.menu.map((node, index) => (
              <motion.li
                key={node.href}
                custom={index}
                variants={overlayItemVariants(reduced)}
                initial="hidden"
                animate="visible"
              >
                <MenuRow
                  node={node}
                  depth={0}
                  number={node.index}
                  expanded={expanded}
                  onToggle={toggle}
                  onNavigate={onClose}
                />
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-6 border-t border-hairline/10 pt-8 text-body-sm sm:grid-cols-2">
          <address className="not-italic text-ink-secondary">
            <span className="block text-ink-primary">{site.contact.organisation}</span>
            {/* The block comes from this span, not from the badge. PlaceholderBadge renders
                nothing of its own for a verified value — these are verified, so both lines ran
                together as "Texas, USA". */}
            {site.contact.addressLines.map((line) => (
              <span key={line.value} className="mt-1 block">
                <PlaceholderBadge item={line}>{line.value}</PlaceholderBadge>
              </span>
            ))}
          </address>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <PlaceholderBadge item={site.contact.phone}>
              <a
                href={`tel:${site.contact.phone.value.replace(/\s/g, '')}`}
                className="text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
              >
                {site.contact.phone.value}
              </a>
            </PlaceholderBadge>
            <PlaceholderBadge item={site.contact.email}>
              <a
                href={`mailto:${site.contact.email.value}`}
                className="text-accent-ink transition-colors duration-hover hover:text-ink-primary"
              >
                {site.contact.email.value}
              </a>
            </PlaceholderBadge>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}

interface MenuRowProps {
  node: NavNode;
  depth: Depth;
  /** Only the top level is numbered; the list below it is a branch, not a sequence. */
  number?: string;
  expanded: readonly string[];
  onToggle: (href: string) => void;
  onNavigate: () => void;
}

function MenuRow({ node, depth, number, expanded, onToggle, onNavigate }: MenuRowProps) {
  const branchId = useId();
  const children = node.children ?? [];
  const isOpen = expanded.includes(node.href);
  const nextDepth = Math.min(depth + 1, 2) as Depth;

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between gap-4',
          node.separated && 'mt-2 border-t border-hairline/10 pt-2',
        )}
      >
        <Link
          to={node.href}
          onClick={onNavigate}
          className={cn(
            'flex flex-1 items-baseline gap-5 py-2 text-ink-primary transition-colors duration-hover hover:text-accent-ink',
            ROW_CLASS[depth],
            INDENT_CLASS[depth],
          )}
        >
          {number ? <IndexNumber value={number} className="w-8 shrink-0" /> : null}
          {node.label}
        </Link>

        {children.length > 0 ? (
          /* A second control, not a second job for the first one: the label goes to the parent
             page and this opens the branch. One control doing both means you cannot reach
             /products at all once it has children. */
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={branchId}
            aria-label={`${node.label} ${site.ui.menuSubmenu}`}
            onClick={() => onToggle(node.href)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline/15 text-ink-secondary transition-colors duration-hover hover:border-accent/50 hover:text-ink-primary"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn('h-4 w-4 transition-transform duration-300', isOpen && '-rotate-180')}
            />
          </button>
        ) : null}
      </div>

      {children.length > 0 ? (
        <div id={branchId} className="menu-branch" data-open={isOpen}>
          <div className="min-h-0 overflow-hidden">
            <ul className="flex flex-col pb-1">
              {children.map((child) => (
                <li key={child.href}>
                  <MenuRow
                    node={child}
                    depth={nextDepth}
                    expanded={expanded}
                    onToggle={onToggle}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
