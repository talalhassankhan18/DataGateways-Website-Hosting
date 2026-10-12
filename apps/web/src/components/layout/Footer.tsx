import type { ComponentType } from 'react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/primitives/Container';
import { CookieSettingsLink } from '@/components/layout/CookieSettingsLink';
import { site, type SocialLink } from '@/content/site';
import { asset } from '@/lib/asset';

const ICONS: Record<SocialLink['icon'], ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
};

const ICON_COLORS: Record<SocialLink['icon'], string> = {
  linkedin: 'text-[#0A66C2]',
  instagram: 'text-[#E4405F]',
  facebook: 'text-[#1877F2]',
};

/**
 * One column of footer links.
 *
 * `h3`, not `h2`: these label link groups inside the footer, so they belong below the page's own
 * section headings in the outline rather than beside them. `h1` and `h2` are reserved for
 * SplitHeading — see docs/design-reference.md.
 */
const LinkColumn = ({
  heading,
  items,
}: {
  heading: string;
  items: readonly { label: string; href: string }[];
}) => (
  <div className="text-center">
    <h3 className="text-body-sm font-bold uppercase tracking-[0.16em] text-ink-primary">
      {heading}
    </h3>
    <ul className="mt-2 flex flex-col">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            to={item.href}
            className="block py-1.5 text-body-sm text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * The client's own footer from datagateways.net, column for column: Solutions, Partner Program,
 * Company and Contact, with the social row and legal links beneath.
 */
export function Footer() {
  const { footer, contact, ui } = site;

  return (
    <footer className="tone-white relative overflow-hidden">
      <div className="py-12 sm:py-16">
        <Link
          to="/"
          aria-label={ui.homeLink}
          className="tap-target mx-auto flex w-fit items-center gap-4"
        >
          <img
            src={asset(site.logo.src)}
            alt={site.logo.alt}
            className="h-16 w-16 sm:h-20 sm:w-20"
            width={80}
            height={80}
          />
          <span className="text-2xl font-semibold tracking-[0.16em] text-ink-primary sm:text-3xl">
            {site.wordmark}
          </span>
        </Link>
      </div>

      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 select-none whitespace-nowrap text-[clamp(5rem,11vw,13rem)] font-bold leading-none tracking-[0.01em] text-[#F5F5F7] lg:block"
        >
          {site.wordmark}
        </span>

        <Container className="relative grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 lg:pb-14">
          <div className="text-center sm:col-span-2 lg:col-span-1">
            <h3 className="text-body-sm font-bold uppercase tracking-[0.16em] text-ink-primary">
              {footer.tagline}
            </h3>
            <p className="mx-auto mt-3 max-w-measure-sm text-body-sm leading-relaxed text-ink-secondary">
              {footer.locationLine}
            </p>
          </div>

          <nav
            aria-label={ui.footerNavLandmark}
            className="grid gap-10 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3 lg:gap-8"
          >
            <LinkColumn heading={footer.groupLabels.solutions} items={footer.solutions} />
            <LinkColumn heading={footer.groupLabels.partner} items={footer.partner} />
            <LinkColumn heading={footer.groupLabels.company} items={footer.company} />
          </nav>

          <div className="text-center">
            <h3 className="text-body-sm font-bold uppercase tracking-[0.16em] text-ink-dim">
              {footer.groupLabels.contact}
            </h3>

            <address className="mt-2 flex flex-col items-center text-body-sm not-italic">
              <span className="flex items-center gap-2 py-1.5 text-ink-secondary">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                {contact.addressLines.map((line) => line.value).join(', ')}
              </span>

              <a
                href={`mailto:${contact.email.value}`}
                className="flex items-center gap-2 py-1.5 text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
              >
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                {contact.email.value}
              </a>

              <a
                href={`tel:${contact.phone.value.replace(/[^\d+]/g, '')}`}
                className="flex items-center gap-2 py-1.5 text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
              >
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                {contact.phone.value}
              </a>
            </address>

            <h3 className="mt-4 text-body-sm font-bold uppercase tracking-[0.16em] text-ink-dim">
              {footer.groupLabels.social}
            </h3>

            <ul className="mt-2 flex items-center justify-center gap-2">
              {footer.social.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <li key={item.icon}>
                    <a
                      href={item.href.value}
                      aria-label={item.label}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex h-10 w-10 items-center justify-center rounded-md border border-hairline/15 bg-[#F7F7F7] transition-colors duration-hover hover:border-accent/50"
                    >
                      <Icon aria-hidden="true" className={`h-4 w-4 ${ICON_COLORS[item.icon]}`} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-5">
            <div className="rule-fade mb-5" />
            <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
              <p className="text-center text-body-sm text-ink-secondary sm:text-left">
                {footer.copyright}
              </p>

              <ul className="flex flex-wrap items-center justify-center gap-x-6">
                {footer.legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="block py-1.5 text-body-sm text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                {/* Not in site.footer.legal, because it is not a route — it is a control that
                    clears the stored consent decision and brings the banner back. It sits in the
                    legal row because that is the first place anyone looks for it. */}
                <li>
                  <CookieSettingsLink />
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
