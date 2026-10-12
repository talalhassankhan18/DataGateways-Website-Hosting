import { useParams } from 'react-router-dom';
import { Container } from '@/components/primitives/Container';
import { DividedGrid } from '@/components/primitives/DividedGrid';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { ComparisonTable } from '@/components/content/ComparisonTable';
import { CtaBand } from '@/components/content/CtaBand';
import { MediaSplit } from '@/components/content/MediaSplit';
import { ModuleCard } from '@/components/content/ModuleCard';
import { SectionHeading } from '@/components/content/SectionHeading';
import { StatCallout } from '@/components/content/StatCallout';
import { StepCard } from '@/components/content/StepCard';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { capabilities, isCapabilitySlug } from '@/content/capabilities';
import { cn } from '@/lib/cn';
import NotFoundPage from './NotFoundPage';

/**
 * Governance, DSPM and DLP — the three capabilities nested under DataNerve in the nav.
 *
 * Same spine as the product pages, and the same rule about optional sections: a capability that is
 * shipping carries its full detail, and one still on the roadmap is not padded out to match it.
 */
export default function CapabilityPage() {
  const { capability } = useParams();

  if (!isCapabilitySlug(capability)) return <NotFoundPage />;

  const page = capabilities[capability];
  const isDlp = page.slug === 'dlp';

  return (
    <PageShell seo={page.seo} path={`/products/datanerve/${page.slug}`} anchors={page.anchors}>
      <ImageHero
        id={page.hero.id}
        eyebrow={page.hero.eyebrow}
        heading={page.hero.heading}
        media={page.hero.media}
        compact
        className={cn(
          page.slug === 'dspm' &&
            '[&_.max-w-container]:pb-32 [&_h1]:max-w-[36ch]',
        )}
        scrollCueTarget={page.lead.id}
      />

      <Section id={page.lead.id} tone="light">
        <Container>
          {/* The availability status, stated before the copy rather than buried in it. Three
              capabilities at three different stages of delivery is exactly the situation where a
              visitor deserves to know which one they are reading about. */}
          {!isDlp ? (
            <Reveal>
              <p className="mb-8 inline-flex items-center gap-2.5 rounded-sm border border-accent/30 px-3.5 py-1.5 text-eyebrow uppercase tracking-[0.16em] text-accent-ink">
                {page.status}
              </p>
            </Reveal>
          ) : null}

          {page.lead.text ? <ScrollFillBody paragraphs={[page.lead.text]} size="lead" /> : null}

          {page.stats ? (
            <Reveal
              as="div"
              className="mt-14 grid gap-x-8 gap-y-10 border-t border-hairline/15 pt-12 sm:grid-cols-2 lg:grid-cols-4"
            >
              {page.stats.map((stat) => (
                <dl key={stat.label} className="text-center">
                  <dd className="font-display text-[clamp(2rem,3.4vw,2.75rem)] font-bold leading-none tracking-[-0.03em] text-accent-ink">
                    {stat.value}
                  </dd>
                  <dt className="mt-3 text-body-sm text-ink-secondary">{stat.label}</dt>
                </dl>
              ))}
            </Reveal>
          ) : null}

          {page.interpreterDomains ? (
            <div className="mt-16">
              <p className="mb-7 text-eyebrow font-semibold uppercase tracking-[0.18em] text-accent-ink">
                Predefined interpreter domains
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {page.interpreterDomains.map((domain) => (
                  <div
                    key={domain.title}
                    className="rounded-md bg-bg-surface px-7 py-7 shadow-sm"
                  >
                    <h3 className="text-h4 font-bold text-ink-primary">{domain.title}</h3>
                    <p className="mt-6 text-body-sm text-ink-secondary">{domain.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {page.callout ? (
            <StatCallout
              figure={page.callout.figure}
              claim={page.callout.claim}
              source={page.callout.source}
              dateOnly={page.slug === 'dlp'}
              className="mt-16"
            />
          ) : null}
        </Container>
      </Section>

      {!isDlp ? (
        <>
      <Section
        id={page.modules.id}
        tone={page.flow ? 'grey' : 'white'}
        labelledBy="capability-modules-heading"
      >
        <Container>
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <SectionHeading
              id="capability-modules-heading"
              heading={page.modules.heading}
              className="lg:col-span-5"
            />
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-measure text-body text-ink-secondary">{page.modules.intro}</p>
            </Reveal>
          </div>

          <DividedGrid
            columns={page.slug === 'governance' ? 'sm:grid-cols-2 lg:grid-cols-4' : undefined}
          >
            {page.modules.cards.map((card) => (
              <ModuleCard key={card.title} card={card} compact={page.slug === 'governance'} />
            ))}
          </DividedGrid>
        </Container>
      </Section>

      {page.management ? (
        <Section id={page.management.id} tone="light" labelledBy="capability-management-heading">
          <Container>
            <div className="mb-14">
              <SectionHeading
                id="capability-management-heading"
                heading={page.management.heading}
                eyebrow={page.management.eyebrow}
                lead={page.management.intro}
                className="max-w-3xl"
              />
            </div>

            <DividedGrid columns="sm:grid-cols-2 lg:grid-cols-3">
              {page.management.cards.map((card) => (
                <StepCard key={card.title} card={card} />
              ))}
            </DividedGrid>

            <div className="mt-8 rounded-md bg-transparent px-8 py-7 text-ink-primary lg:flex lg:items-start lg:gap-12">
              <p className="shrink-0 text-h4 font-bold uppercase leading-[1.15]">
                Program Outcome
              </p>
              <p className="mt-3 max-w-3xl text-body lg:mt-0">{page.management.outcome}</p>
            </div>
          </Container>
        </Section>
      ) : null}

      {page.dataQuality ? (
        <Section
          id={page.dataQuality.id}
          tone="light"
          labelledBy="capability-quality-heading"
          className="-mt-16 lg:-mt-24"
        >
          <Container>
            <div className="mb-14">
              <SectionHeading
                id="capability-quality-heading"
                heading={page.dataQuality.heading}
                eyebrow={page.dataQuality.eyebrow}
                lead={page.dataQuality.intro}
                className="max-w-4xl"
              />
            </div>

            <DividedGrid columns="sm:grid-cols-2 lg:grid-cols-3">
              {page.dataQuality.cards.map((card) => (
                <StepCard key={card.title} card={card} />
              ))}
            </DividedGrid>

            <div className="mt-8 rounded-md bg-transparent px-8 py-7 text-ink-primary">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-ink-secondary">
                Management outcome:
              </p>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-body">
                {page.dataQuality.outcome.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Container>
        </Section>
      ) : null}

      {page.flow ? (
        <Section id={page.flow.id} tone="white" labelledBy="capability-flow-heading">
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="capability-flow-heading"
                heading={page.flow.heading}
                className="lg:col-span-5"
              />
              <Reveal className="lg:col-span-6 lg:col-start-7">
                <p className="max-w-measure text-body text-ink-secondary">{page.flow.intro}</p>
              </Reveal>
            </div>

            {/* `ol`, because a pipeline read out of order is not a pipeline. */}
            <DividedGrid as="ol" columns="sm:grid-cols-2 lg:grid-cols-5" className="dspm-flow-grid">
              {page.flow.steps.map((step) => (
                <StepCard key={step.title} card={step} />
              ))}
            </DividedGrid>

            {page.flow.example ? (
              <Reveal className="dspm-flow-example mt-10">
                <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-accent-ink">
                  Example chain
                </p>
                <p className="mt-5 text-body text-ink-primary">{page.flow.example}</p>
              </Reveal>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {page.maturity ? (
        <Section id={page.maturity.id} tone="light" labelledBy="capability-maturity-heading">
          <Container>
            <SectionHeading
              id="capability-maturity-heading"
              heading={page.maturity.heading}
              eyebrow={page.maturity.eyebrow}
              className="mb-14 max-w-3xl"
            />

            <DividedGrid columns="sm:grid-cols-2 lg:grid-cols-3">
              {page.maturity.cards.map((card) => (
                <StepCard key={card.title} card={card} />
              ))}
            </DividedGrid>

            <p className="mx-auto mt-8 max-w-5xl rounded-full bg-accent-ink/10 px-8 py-5 text-center text-body text-ink-primary">
              {page.maturity.statement}
            </p>

            <div className="relative mt-14 grid gap-8 sm:grid-cols-5">
              <span
                aria-hidden="true"
                className="absolute left-[10%] right-[10%] top-5 hidden h-px bg-accent/30 sm:block"
              />
              {page.maturity.levels.map((level, index) => (
                <div key={level} className="relative text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-body-sm font-bold text-white shadow-sm">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-body-sm font-semibold text-ink-primary">{level}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {page.comparison && page.slug !== 'governance' ? (
        <Section id={page.comparison.id} tone="white" labelledBy="capability-comparison-heading">
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="capability-comparison-heading"
                heading={page.comparison.heading}
                className="lg:col-span-5"
              />
              <Reveal className="lg:col-span-6 lg:col-start-7">
                <p className="max-w-measure text-body text-ink-secondary">
                  {page.comparison.intro}
                </p>
              </Reveal>
            </div>

            <ComparisonTable
              labelledBy="capability-comparison-heading"
              columns={page.comparison.columns}
              rows={page.comparison.rows}
            />
          </Container>
        </Section>
      ) : null}

      {page.grid ? (
        <Section id={page.grid.id} tone="white" labelledBy="capability-grid-heading">
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="capability-grid-heading"
                heading={page.grid.heading}
                className="lg:col-span-5"
              />
              <Reveal className="lg:col-span-6 lg:col-start-7">
                <p className="max-w-measure text-body text-ink-secondary">{page.grid.intro}</p>
              </Reveal>
            </div>

            <DividedGrid
              columns={page.slug === 'governance' ? 'sm:grid-cols-2 lg:grid-cols-2' : undefined}
            >
              {page.grid.cards.map((card) => (
                <StepCard key={card.title} card={card} />
              ))}
            </DividedGrid>
          </Container>
        </Section>
      ) : null}

      {page.showcase ? (
        <Section id={page.showcase.id} tone="light" labelledBy="capability-showcase-heading">
          <Container>
            <MediaSplit
              id="capability-showcase-heading"
              heading={page.showcase.heading}
              body={page.showcase.body}
              image={page.showcase.image}
              points={page.showcase.points}
              reverse
            />
          </Container>
        </Section>
      ) : null}

      </>
      ) : null}

      {!isDlp ? <CtaBand content={page.cta} /> : null}
    </PageShell>
  );
}
