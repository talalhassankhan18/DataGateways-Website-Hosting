import { useParams } from 'react-router-dom';
import { Container } from '@/components/primitives/Container';
import { DividedGrid } from '@/components/primitives/DividedGrid';
import { Reveal, RevealItem } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { IndexNumber } from '@/components/primitives/IndexNumber';
import { CtaBand } from '@/components/content/CtaBand';
import { ModuleCard } from '@/components/content/ModuleCard';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { isServiceSlug, services } from '@/content/services';
import NotFoundPage from './NotFoundPage';

export default function ServicePage() {
  const { service } = useParams();

  const isCombined = service === undefined;
  if (!isCombined && !isServiceSlug(service)) return <NotFoundPage />;
  if (isCombined) return <ServicesLandingPage />;

  const page = services.data;
  const secondaryPage = isCombined ? services.ai : null;
  const anchors = isCombined
    ? page.anchors.map((anchor) =>
        anchor.id === 'offerings'
          ? { ...anchor, id: 'data-services', label: 'Data Services' }
          : anchor,
      ).concat({ id: 'ai-services', label: 'AI Services' })
    : page.anchors;

  return (
    <PageShell
      seo={isCombined ? { ...page.seo, title: 'Services | DataGateways' } : page.seo}
      path={isCombined ? '/services' : `/services/${page.slug}`}
      anchors={anchors}
    >
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

      <Section
        id={isCombined ? 'data-services' : page.offerings.id}
        tone="white"
        labelledBy="service-offerings-heading"
      >
        <Container>
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <SectionHeading
              id="service-offerings-heading"
              heading={page.offerings.heading}
              className="lg:col-span-5"
            />
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-measure text-body text-ink-secondary">{page.offerings.intro}</p>
            </Reveal>
          </div>

          {/* Three services on the data page and five on the AI page, so the column count follows
              the content rather than being fixed at four and leaving a ragged last row. */}
          <DividedGrid>
            {page.offerings.cards.map((card) => (
              <ModuleCard key={card.title} card={card} />
            ))}
          </DividedGrid>
        </Container>
      </Section>

      <Section id={page.engagement.id} tone="navy" labelledBy="service-engagement-heading">
        <Container>
          <div className="mb-16 grid gap-8 lg:grid-cols-12">
            <SectionHeading
              id="service-engagement-heading"
              heading={page.engagement.heading}
              className="lg:col-span-5"
            />
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-measure text-body text-ink-secondary">{page.engagement.intro}</p>
            </Reveal>
          </div>

          {/* A timeline rather than a card grid: the phases are sequential, and four equal boxes
              would not say so. The rule runs along the top of the row on wide screens and down the
              left of the stack on narrow ones. */}
          <DividedGrid
            as="ol"
            columns={page.engagement.phases.length > 4 ? 'sm:grid-cols-2 lg:grid-cols-5' : 'lg:grid-cols-4'}
          >
            {page.engagement.phases.map((phase) => (
              <RevealItem
                as="li"
                key={phase.index}
                className="flex flex-col gap-4 bg-bg-navy p-8"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <IndexNumber value={phase.index} />
                  {phase.duration ? (
                    <span className="text-eyebrow uppercase tracking-[0.18em] text-ink-dim">
                      {phase.duration}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-h3 font-bold uppercase text-ink-primary">{phase.title}</h3>
                <p className="text-body-sm text-ink-secondary">{phase.blurb}</p>
              </RevealItem>
            ))}
          </DividedGrid>
        </Container>
      </Section>

      {secondaryPage ? (
        <>
          <Section id="ai-services" tone="white" labelledBy="ai-service-offerings-heading">
            <Container>
              <div className="mb-14 grid gap-8 lg:grid-cols-12">
                <SectionHeading
                  id="ai-service-offerings-heading"
                  heading={secondaryPage.offerings.heading}
                  className="lg:col-span-5"
                />
                <Reveal className="lg:col-span-6 lg:col-start-7">
                  <p className="max-w-measure text-body text-ink-secondary">
                    {secondaryPage.offerings.intro}
                  </p>
                </Reveal>
              </div>
              <DividedGrid>
                {secondaryPage.offerings.cards.map((card) => (
                  <ModuleCard key={card.title} card={card} />
                ))}
              </DividedGrid>
            </Container>
          </Section>

          <Section id="ai-engagement" tone="navy" labelledBy="ai-service-engagement-heading">
            <Container>
              <div className="mb-16 grid gap-8 lg:grid-cols-12">
                <SectionHeading
                  id="ai-service-engagement-heading"
                  heading={secondaryPage.engagement.heading}
                  className="lg:col-span-5"
                />
                <Reveal className="lg:col-span-6 lg:col-start-7">
                  <p className="max-w-measure text-ink-secondary">
                    {secondaryPage.engagement.intro}
                  </p>
                </Reveal>
              </div>
              <DividedGrid
                as="ol"
                columns={
                  secondaryPage.engagement.phases.length > 4
                    ? 'sm:grid-cols-2 lg:grid-cols-5'
                    : 'lg:grid-cols-4'
                }

              >
                {secondaryPage.engagement.phases.map((phase) => (
                  <RevealItem
                    as="li"
                    key={phase.index}
                    className="flex flex-col gap-4 bg-bg-navy p-8"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <IndexNumber value={phase.index} />
                      {phase.duration ? (
                        <span className="text-eyebrow uppercase tracking-[0.18em] text-ink-dim">
                          {phase.duration}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-h3 font-bold uppercase text-ink-primary">{phase.title}</h3>
                    <p className="text-body-sm text-ink-secondary">{phase.blurb}</p>
                  </RevealItem>
                ))}
              </DividedGrid>
            </Container>
          </Section>
        </>
      ) : null}

      <CtaBand content={page.cta} />
    </PageShell>
  );
}

function ServicesLandingPage() {
  const cards = ['AI Service', 'Data Service', 'SOCMINT'];

  return (
    <PageShell
      seo={{
        title: 'Services | DataGateways',
        description: 'Data, AI and consultancy services from DataGateways.',
      }}
      path="/services"
      anchors={[
        { id: 'hero', label: 'Intro' },
        { id: 'services', label: 'Services' },
      ]}
    >
      <ImageHero
        id="hero"
        eyebrow="Services"
        heading={{ roman: 'Our', accent: 'services' }}
        media={services.data.hero.media}
        compact
        scrollCueTarget="services"
      />

      <Section id="services" tone="white" labelledBy="services-heading">
        <Container>
          <SectionHeading
            id="services-heading"
            heading={{ roman: 'Coming', accent: 'soon' }}
            className="mb-14"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((title) => (
              <div
                key={title}
                className="rounded-sm border border-hairline/10 bg-bg-surface p-8"
              >
                <span className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-accent-ink">
                  Coming soon
                </span>
                <h2 className="mt-6 text-h3 font-bold uppercase text-ink-primary">{title}</h2>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
