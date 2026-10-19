import { useEffect, useId, useMemo, useState } from 'react';
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
import { COUNTRIES } from '@/content/countries';
import { asset } from '@/lib/asset';
import { Search } from 'lucide-react';

const page = partners.find;

type Status = 'loading' | 'ready' | 'error';

export default function PartnerFindPage() {
  const [query, setQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('');
  const [activeCountry, setActiveCountry] = useState('');
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
   * Every country, not only the ones a partner currently sits in.
   *
   * It used to be derived from the directory, which meant the control offered a single country
   * and read as broken even though it was accurate. Management asked for the full list on
   * 19 Oct. A visitor looking for their own market can now look for it and be told plainly that
   * there is nobody there yet, which is a better answer than not being able to ask.
   *
   * Countries that do have a partner are floated to the top, so the common case is one keystroke
   * away and the long tail is still reachable.
   */
  const countries = useMemo(() => {
    const present = new Set(
      partners
        .map((partner) => partner.country?.trim())
        .filter((country): country is string => Boolean(country)),
    );

    return [
      ...[...present].sort((a, b) => a.localeCompare(b, 'en')),
      ...COUNTRIES.filter((country) => !present.has(country)),
    ];
  }, [partners]);

  const listings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedRegion = activeRegion.trim().toLowerCase();
    const normalizedCountry = activeCountry.trim().toLowerCase();
    return partners.filter((partner) => {
      const matchesQuery =
        !normalizedQuery ||
        partner.company.toLowerCase().includes(normalizedQuery) ||
        partner.focusArea.toLowerCase().includes(normalizedQuery);
      /*
       * Substring, not equality.
       *
       * Both controls are typed now rather than picked, so a half-finished word has to behave
       * sensibly: typing "ger" should narrow towards Germany, not empty the directory and leave
       * the visitor thinking there is nobody there. An empty box means no filter.
       */
      const matchesRegion =
        !normalizedRegion || partner.region.trim().toLowerCase().includes(normalizedRegion);
      const matchesCountry =
        !normalizedCountry ||
        (partner.country?.trim().toLowerCase() ?? '').includes(normalizedCountry);
      return matchesQuery && matchesRegion && matchesCountry;
    });
  }, [activeCountry, activeRegion, partners, query]);

  const filterListId = useId();
  const regionListId = `${filterListId}-regions`;
  const countryListId = `${filterListId}-countries`;

  /*
   * One handler for both typed filters.
   *
   * Only a value that exactly matches a known option is reported to analytics. The controls are
   * free text now, and sending every keystroke would put whatever somebody types into a
   * third-party property — the same reason the partner name box has never been tracked.
   */
  const onFilterChange = (filterType: 'region' | 'country', value: string) => {
    if (filterType === 'region') setActiveRegion(value);
    else setActiveCountry(value);

    const known = filterType === 'region' ? partnerRegions : countries;
    if (value && known.some((option) => option.toLowerCase() === value.trim().toLowerCase())) {
      trackEvent('partner_filter', { filter_type: filterType, filter_value: value.trim() });
    }
  };

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
      {/*
        Typed with a datalist rather than a <select>.

        A select cannot be searched, and the country list is 249 entries long — scrolling to
        Switzerland is not a reasonable thing to ask of anyone. A text input backed by a datalist
        is searchable in every current browser, needs no dependency, and still exposes the whole
        list to a keyboard and to assistive tech. Matching is by substring, so a partial entry
        narrows rather than emptying the directory.
      */}
      <label>
        <span className={filterLabelClassName}>Region</span>
        <input
          type="text"
          list={regionListId}
          value={activeRegion}
          onChange={(event) => onFilterChange('region', event.target.value)}
          placeholder="All regions"
          aria-label="Filter partners by region"
          className={selectClassName}
        />
        <datalist id={regionListId}>
          {partnerRegions.map((region) => (
            <option key={region} value={region} />
          ))}
        </datalist>
      </label>
      <label>
        <span className={filterLabelClassName}>Country</span>
        <input
          type="text"
          list={countryListId}
          value={activeCountry}
          onChange={(event) => onFilterChange('country', event.target.value)}
          placeholder="All countries"
          aria-label="Filter partners by country"
          className={selectClassName}
        />
        <datalist id={countryListId}>
          {countries.map((country) => (
            <option key={country} value={country} />
          ))}
        </datalist>
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
                  {/*
                    No tier badge. Management asked for Bronze off the cards on 19 Oct, and a
                    badge that only ever reads Bronze ranks your own partners in public for no
                    benefit to anyone. The region moves to the left, where the badge used to sit,
                    so the row still opens on something rather than on empty space.
                  */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-eyebrow uppercase tracking-[0.14em] text-accent-ink">
                      {listing.region}
                    </span>
                    {listing.country ? (
                      <span className="text-eyebrow uppercase tracking-[0.14em] text-ink-dim">
                        {listing.country}
                      </span>
                    ) : null}
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

                  {/* "General" is the placeholder the backend sends when no focus area has been
                      set, so printing it tells the reader nothing and makes every card look
                      identical. Shown only when it says something. */}
                  {listing.focusArea && listing.focusArea.trim().toLowerCase() !== 'general' ? (
                    <p className="text-body-sm text-ink-secondary">{listing.focusArea}</p>
                  ) : null}
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
