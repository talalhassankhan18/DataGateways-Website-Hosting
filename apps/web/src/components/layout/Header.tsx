import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Container } from '@/components/primitives/Container';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/cn';
import { useHeaderState } from '@/lib/hooks';
import { HEADER_HIDE_AT, HEADER_SOLID_AT } from '@/lib/motion';
import { site } from '@/content/site';
import { FullscreenMenu } from './FullscreenMenu';
import { NavDropdown } from './NavDropdown';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  /** Label of the primary-nav panel currently open, so only ever one is. */
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const menuId = useId();
  const { solid, hidden } = useHeaderState(HEADER_SOLID_AT, HEADER_HIDE_AT);
  const { pathname } = useLocation();

  // A panel left open across a route change hangs over the new page.
  useEffect(() => setOpenPanel(null), [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-header transition-[background-color,border-color,transform] duration-header',
          // Transparent over the dark hero, so it borrows the light-on-dark ink set; once it has
          // scrolled onto the off-white page it takes the page's own ink back. An open panel
          // forces the solid treatment early — a navy panel hanging off transparent chrome has
          // nothing to sit against.
          solid || openPanel
            ? 'border-b border-hairline/10 bg-bg-base/95 backdrop-blur-sm'
            : 'ink-on-dark bg-transparent',
          // The reference hides the nav while you scroll down and returns it the instant you
          // scroll up, which hands the page back its full height while reading. Never while a
          // panel is open, which would take the panel with it.
          hidden && !openPanel && '-translate-y-full',
        )}
      >
        <Container className="flex h-[var(--header-height)] items-center justify-between gap-6">
          <Link
            to="/"
            aria-label={site.ui.homeLink}
            className="tap-target flex shrink-0 items-center gap-3 text-ink-primary"
          >
            <img src={site.logo.src} alt={site.logo.alt} className="h-8 w-8" width={32} height={32} />
            <span className="text-body-sm font-semibold tracking-[0.2em]">{site.wordmark}</span>
          </Link>

          <nav aria-label={site.ui.primaryNavLandmark} className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {site.nav.primary.map((item) =>
                item.children ? (
                  <NavDropdown
                    key={item.label}
                    node={item}
                    open={openPanel === item.label}
                    onOpen={() => setOpenPanel(item.label)}
                    onClose={() =>
                      setOpenPanel((current) => (current === item.label ? null : current))
                    }
                  />
                ) : (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      onMouseEnter={() => setOpenPanel(null)}
                      className={({ isActive }) =>
                        cn(
                          'block py-2 text-body-sm transition-colors duration-hover hover:text-ink-primary',
                          isActive ? 'text-ink-primary' : 'text-ink-secondary',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Button to={site.cta.primary.href} className="hidden sm:inline-flex">
              {site.cta.primary.label}
            </Button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              className="flex items-center gap-2 rounded-md border border-hairline/15 px-4 py-3 text-body-sm text-ink-primary transition-colors duration-hover hover:border-accent/50 hover:bg-bg-elevated lg:hidden"
            >
              {site.ui.menuOpen}
              <span aria-hidden="true" className="text-accent-ink">
                {site.ui.menuOpenSuffix}
              </span>
            </button>
          </div>
        </Container>
      </header>

      <FullscreenMenu id={menuId} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
