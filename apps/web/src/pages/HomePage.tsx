import { Container } from '@/components/primitives/Container';
import { DividedGrid } from '@/components/primitives/DividedGrid';
import { Section } from '@/components/primitives/Section';
import { CounterSlider } from '@/components/content/CounterSlider';
import { LogoMarquee } from '@/components/content/LogoMarquee';
import { PathwayCard } from '@/components/content/PathwayCard';
import { SectionHeading } from '@/components/content/SectionHeading';
import { TrustBand } from '@/components/content/TrustBand';
import { PageShell } from '@/components/layout/PageShell';
import { HeroMedia } from '@/components/media/HeroMedia';
import { HeroSlider } from '@/components/media/HeroSlider';
import { features } from '@/content/site';
import { home } from '@/content/home';

export default function HomePage() {
  return (
    <PageShell seo={home.seo} path="/" anchors={home.anchors}>
      <HeroSlider
        id={home.hero.id}
        slides={home.hero.slides}
        welcome={home.hero.welcome}
        lead={home.hero.lead}
        media={<HeroMedia media={home.hero.media} />}
        scrollCueTarget={home.products.id}
      />

      <Section id={home.products.id} tone="white" labelledBy="home-products-heading">
        <Container>
          <SectionHeading
            id="home-products-heading"
            heading={home.products.heading}
            className="mb-16"
          />

          <DividedGrid>
            {home.products.cards.map((card) => (
              <PathwayCard key={card.title} card={card} />
            ))}
          </DividedGrid>
        </Container>
      </Section>

      {features.counters ? (
        <Section id={home.counters.id} tone="band" labelledBy="home-counters-heading">
          <Container>
            {/* The slider renders its own heading, because the heading rotates with the panel —
                see CounterSlider. */}
            <CounterSlider
              headingId="home-counters-heading"
              label={home.counters.heading}
              groups={home.counters.groups}
            />
          </Container>
        </Section>
      ) : (
        <Section id={home.trustBand.id} tone="band" labelledBy="home-trust-heading">
          <Container>
            <SectionHeading
              id="home-trust-heading"
              heading={home.trustBand.heading}
              className="mb-12"
            />
            <TrustBand marks={home.trustBand.marks} />
          </Container>
        </Section>
      )}

      <Section id={home.marquee.id} tone="grey" labelledBy="home-marquee-heading">
        <Container>
          <SectionHeading
            id="home-marquee-heading"
            heading={home.marquee.heading}
            className="mb-12"
          />
        </Container>
        <LogoMarquee tiles={home.marquee.tiles} label={home.marquee.heading.roman} />
      </Section>

    </PageShell>
  );
}
