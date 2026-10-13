import { useEffect, useMemo, useState } from 'react';
import type { PublicPartner } from '@/lib/api';
import { fetchPublicPartners } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { Container } from '@/components/primitives/Container';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { CtaBand } from '@/components/content/CtaBand';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { partnerRegions, partners } from '@/content/partners';
import { asset } from '@/lib/asset';
import { Search } from 'lucide-react';

const page = partners.find;

type Status = 'loading' | 'ready' | 'error';

export default function PartnerFindPage() {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('all');
  const [activeCountry, setActiveCountry] = useState('all');
  const [partners, setPartners] = useState<readonly PublicPartner[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;

    fetchPublicPartners()
      .then((result) => {
        if (cancelled) return;
        setPartners(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Only the countries that exist inside the chosen region.
   *
   * Built from every partner regardless of region before, which let the two filters contradict
   * each other: pick Europe, then Japan, and the directory is guaranteed to be empty with both
   * controls looking perfectly reasonable. Narrowing the options means a contradiction cannot be
   * expressed, which is better than explaining it afterwards.
   */
  const countries = useMemo(() => {
    const normalizedRegion = activeRegion.trim().toLowerCase();

    return [
      ...new Set(
        partners
          .filter(
            (partner) =>
              normalizedRegion === 'all' ||
              partner.region.trim().toLowerCase() === normalizedRegion,
          )
          .map((partner) => partner.country)
          .filter((country): country is string => Boolean(country)),
      ),
    ].sort();
  }, [activeRegion, partners]);
  const listings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedRegion = activeRegion.trim().toLowerCase();
    const normalizedCountry = activeCountry.trim().toLowerCase();
    return partners.filter((partner) => {
      const matchesQuery =
        !normalizedQuery ||
        partner.company.toLowerCase().includes(normalizedQuery) ||
        partner.focusArea.toLowerCase().includes(normalizedQuery);
      const matchesRegion =
        normalizedRegion === 'all' || partner.region.trim().toLowerCase() === normalizedRegion;
      const matchesCountry =
        normalizedCountry === 'all' ||
        (partner.country?.trim().toLowerCase() ?? '') === normalizedCountry;
      return matchesQuery && matchesRegion && matchesCountry;
    });
  }, [activeCountry, activeRegion, partners, query]);

  const selectClassName =
    'h-12 w-full rounded-sm border border-hairline/15 bg-bg-surface px-4 text-body-sm text-ink-primary focus:border-accent/50';

  const filterLabelClassName =
    'mb-2 block text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink-muted';

  const directoryFilters = (
    <div className="grid gap-4 rounded-sm border border-hairline/10 bg-bg-surface p-4 md:grid-cols-3 md:gap-3">
      <label>
        <span className={filterLabelClassName}>Partner name</span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            /* Deliberately not tracked. The two selects below report a value from a fixed list;
               this box reports whatever someone types, which is a free-text field being copied
               into a third-party analytics property. Which regions get searched is the useful
               signal, and the selects already carry it. */
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by company name"
            aria-label="Search partners by company name"
            className={`${selectClassName} pl-10 placeholder:text-ink-muted`}
          />
        </span>
      </label>
      <label>
        <span className={filterLabelClassName}>Region</span>
        <select
          value={activeRegion}
          onChange={(event) => {
            setActiveRegion(event.target.value);
            /* The country list is about to change under it, so a country chosen for the previous
               region would survive as an invisible filter the visitor cannot see or clear. */
            setActiveCountry('all');
            trackEvent('partner_filter', {
              filter_type: 'region',
              filter_value: event.target.value,
            });
          }}
          aria-label="Filter partners by region"
          className={selectClassName}
        >
          <option value="all">All regions</option>
          {partnerRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={filterLabelClassName}>Country</span>
        <select
          value={activeCountry}
          onChange={(event) => {
            setActiveCountry(event.target.value);
            trackEvent('partner_filter', {
              filter_type: 'country',
              filter_value: event.target.value,
            });
          }}
          aria-label="Filter partners by country"
          className={selectClassName}
        >
          <option value="all">All countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <PageShell seo={page.seo} path="/partners/find" anchors={page.anchors}>
      <ImageHero
        id={page.hero.id}
        eyebrow={page.hero.eyebrow}
        heading={page.hero.heading}
        media={page.hero.media}
        compact
        scrollCueTarget={page.lead.id}
      />

      <Section id={page.lead.id} tone="light">
        <Container>
          <ScrollFillBody paragraphs={[page.lead.text]} size="lead" />
        </Container>
      </Section>

      <Section id={page.directory.id} tone="white" labelledBy="partner-directory-heading">
        <Container>
          <div className="mb-12 flex flex-col gap-8">
            <SectionHeading id="partner-directory-heading" heading={page.directory.heading} />
            {directoryFilters}
          </div>

          {status === 'loading' ? (
            <p role="status" aria-live="polite" className="text-body-sm text-ink-muted">
              {page.directory.loadingState}
            </p>
          ) : null}

          {status === 'error' ? (
            <p role="alert" className="text-body-sm text-ink-secondary">
              {page.directory.errorState}
            </p>
          ) : null}

          {status === 'ready' && listings.length === 0 ? (
            <p className="rounded-sm border border-dashed border-hairline/15 px-6 py-10 text-center text-body-sm text-ink-secondary">
              {page.directory.emptyState}
            </p>
          ) : null}

            {/*
              Each card reveals itself rather than being orchestrated by a RevealGroup.

              The group variant is a one-shot: it animates its children from `hidden` to `visible`
              when the group scrolls into view, and a card added to the list AFTER that has
              happened mounts at `hidden` and is never told to move. Filtering to a region and
              back put the other partners straight back into the DOM at `opacity: 0`, so the
              directory appeared frozen on whatever the last narrower filter had shown — results
              that were present, correct and invisible.

              A self-observing Reveal cannot fail that way: a card that mounts already in the
              viewport gets an IntersectionObserver callback for its current state and animates
              in. Surviving cards are untouched, so only genuinely new ones fade.
            */}
          {status === 'ready' && listings.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <Reveal
                  as="li"
                  key={listing.id}
                  amount={0.1}
                  className="flex flex-col gap-4 rounded-sm border border-hairline/10 bg-bg-surface/50 p-6 transition-[border-color,box-shadow] duration-hover hover:border-accent/40 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-sm border border-accent/30 px-2.5 py-1 text-eyebrow uppercase tracking-[0.14em] text-accent-ink">
                      {listing.tier}
                    </span>
                    <span className="text-eyebrow uppercase tracking-[0.14em] text-ink-dim">
                      {listing.region}
                    </span>
                  </div>

                  <div className="flex h-12 items-center">
                    {listing.logoUrl ? (
                      <img
                        src={asset(listing.logoUrl)}
                        alt=""
                        loading="lazy"
                        className="h-12 max-w-40 object-contain object-left"
                      />
                    ) : null}
                  </div>
                  <h3 className="min-h-[2.4rem] text-h3 font-bold uppercase text-ink-primary">
                    {listing.company}
                  </h3>
                  <p className="text-body-sm text-ink-secondary">
                    {listing.focusArea}
                    {listing.country ? ` · ${listing.country}` : ''}
                  </p>
                </Reveal>
              ))}
            </ul>
          ) : null}
        </Container>
      </Section>

      <CtaBand content={page.cta} />
    </PageShell>
  );
}
