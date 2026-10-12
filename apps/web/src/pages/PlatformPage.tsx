import { Container } from '@/components/primitives/Container';
import { DividedGrid } from '@/components/primitives/DividedGrid';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { ModuleCard } from '@/components/content/ModuleCard';
import { PathwayCard } from '@/components/content/PathwayCard';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { platform } from '@/content/platform';

/**
 * The top of the products tree: three products here, each leading to its own page, and DataNerve
 * leading on again to its capability pages. There is deliberately no "view all" — three is the
 * whole catalogue, and a link promising more than exists is worse than no link.
 */
export default function PlatformPage() {
  return (
    <PageShell seo={platform.seo} path="/products" anchors={platform.anchors}>
      <ImageHero
        id={platform.hero.id}
        eyebrow={platform.hero.eyebrow}
        heading={platform.hero.heading}
        media={platform.hero.media}
        compact
        scrollCueTarget={platform.overview.id}
      />

      <Section id={platform.overview.id} tone="light" labelledBy="platform-overview-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <SectionHeading
              id="platform-overview-heading"
              heading={platform.overview.heading}
              animate={false}
              className="lg:sticky lg:top-[calc(var(--header-height)+4rem)] lg:col-span-5 lg:self-start"
            />

            <ScrollFillBody
              paragraphs={platform.overview.paragraphs}
              size="lead"
              className="lg:col-span-6 lg:col-start-7"
            />
          </div>
        </Container>
      </Section>

      <Section id={platform.products.id} tone="white" labelledBy="platform-products-heading">
        <Container>
          <SectionHeading
            id="platform-products-heading"
            heading={platform.products.heading}
            className="mb-16"
          />

          <DividedGrid>
            {platform.products.cards.map((card) => (
              <PathwayCard key={card.title} card={card} />
            ))}
          </DividedGrid>
        </Container>
      </Section>

      <Section id={platform.deployment.id} tone="grey" labelledBy="platform-deployment-heading">
        <Container>
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
            <SectionHeading
              id="platform-deployment-heading"
              heading={platform.deployment.heading}
              className="lg:col-span-5"
            />
            <Reveal className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-measure text-body text-ink-secondary">
                {platform.deployment.intro}
              </p>
            </Reveal>
          </div>

          <DividedGrid>
            {platform.deployment.models.map((model) => (
              <ModuleCard key={model.title} card={model} />
            ))}
          </DividedGrid>
        </Container>
      </Section>
    </PageShell>
  );
}
