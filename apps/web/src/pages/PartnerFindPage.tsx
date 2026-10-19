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
import { SearchableSelect } from '@/components/content/SearchableSelect';

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
      /* Exact again: the control hands back a whole option or the empty string, never a
         half-typed word, so there is nothing to be forgiving about. Empty means no filter. */
      const matchesRegion =
        !normalizedRegion || partner.region.trim().toLowerCase() === normalizedRegion;
      const matchesCountry =
        !normalizedCountry || (partner.country?.trim().toLowerCase() ?? '') === normalizedCountry;
      return matchesQuery && matchesRegion && matchesCountry;
    });
  }, [activeCountry, activeRegion, partners, query]);

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

  const captionId = useId();
  const regionCaptionId = `${captionId}-region`;
  const countryCaptionId = `${captionId}-country`;

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
        A dropdown with a search field inside it, not a bare text input.

        The datalist version read as an empty text box rather than as a control with a current
        value, which is what management asked to have back on 19 Oct. A native <select> cannot
        carry a search, and 249 countries is not a list to scroll — so the closed state looks and
        announces like a select, and the open panel puts a search above the options. See
        SearchableSelect for the keyboard and screen-reader behaviour a native select would
        otherwise have given for free.
      */}
      {/* A div, not a label: the control is a button and a <label> cannot be associated with
          one. The caption carries an id and the trigger points at it instead. */}
      <div>
        <span id={regionCaptionId} className={filterLabelClassName}>
          Region
        </span>
        <SearchableSelect
          labelledBy={regionCaptionId}
          label="Filter partners by region"
          allLabel="All regions"
          options={partnerRegions}
          value={activeRegion}
          onChange={(next) => onFilterChange('region', next)}
          searchPlaceholder="Search regions"
        />
      </div>
      <div>
        <span id={countryCaptionId} className={filterLabelClassName}>
          Country
        </span>
        <SearchableSelect
          labelledBy={countryCaptionId}
          label="Filter partners by country"
          allLabel="All countries"
          options={countries}
          value={activeCountry}
          onChange={(next) => onFilterChange('country', next)}
          searchPlaceholder="Search countries"
        />
      </div>
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
