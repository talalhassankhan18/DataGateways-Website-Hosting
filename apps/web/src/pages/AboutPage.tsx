import { Container } from '@/components/primitives/Container';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { VideoHero } from '@/components/media/VideoHero';
import { about } from '@/content/about';

/*
 * Both bands use the same twelve-column split — heading in the left five, body in the right six
 * — which is the structure every other section on this site already uses. The page previously
 * centred one band and stacked two headings in the other, so it read as a different site to the
 * pages either side of it. That mismatch was the 19 Oct note about inconsistent heading styles,
 * sizes and alignment.
 *
 * The grid collapses to a single column below `lg`, so the two-column treatment is a desktop
 * refinement rather than something a phone has to squeeze into.
 */
const COLUMNS = 'grid gap-x-12 gap-y-8 lg:grid-cols-12';
const HEADING_COLUMN = 'lg:col-span-5';
const BODY_COLUMN = 'lg:col-span-6 lg:col-start-7';

export default function AboutPage() {
  return (
    <PageShell seo={about.seo} path="/about" anchors={about.anchors}>
      <VideoHero
        id={about.hero.id}
        eyebrow={about.hero.eyebrow}
        heading={about.hero.heading}
        subhead={about.hero.subhead}
        media={about.hero.media}
        scrollCueTarget={about.story.id}
      />

      <Section id={about.story.id} tone="light" labelledBy="about-story-heading">
        <Container>
          <div className={COLUMNS}>
            <SectionHeading
              id="about-story-heading"
              eyebrow={about.story.eyebrow}
              heading={about.story.heading}
              className={HEADING_COLUMN}
              /* The body beside it carries a scroll-driven fill; two things animating on the
                 same scroll compete and read as jitter. The heading holds still. */
              animate={false}
            />

            <ScrollFillBody
              paragraphs={about.story.paragraphs.map((paragraph) => paragraph.value)}
              size="lead"
              className={BODY_COLUMN}
            />
          </div>
        </Container>
      </Section>

      {/*
        The vision keeps the navy band — it is a statement of intent rather than a description of
        a product, and setting it as another body column would bury it. What it loses is the
        second heading: an h2 reading "Our Vision" sat directly above an h3 saying much the same
        thing, with the eyebrow the content already carried going unused. One eyebrow, one
        heading, same as every other section.
      */}
      <Section id={about.vision.id} tone="navy" labelledBy="about-vision-heading">
        <Container>
          <div className={COLUMNS}>
            <SectionHeading
              id="about-vision-heading"
              eyebrow={about.vision.eyebrow}
              heading={about.vision.heading}
              className={HEADING_COLUMN}
            />

            <div className={BODY_COLUMN}>
              <Reveal>
                <p className="text-[clamp(1.25rem,1.9vw,1.625rem)] font-bold leading-[1.4] tracking-[-0.015em] text-ink-primary">
                  {about.vision.statement}
                </p>
              </Reveal>

              <Reveal>
                <div className="mt-8 space-y-5 border-t border-hairline/20 pt-8">
                  {about.vision.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-body text-ink-secondary">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
