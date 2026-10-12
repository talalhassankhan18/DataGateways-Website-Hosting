import { Container } from '@/components/primitives/Container';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { VideoHero } from '@/components/media/VideoHero';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { about } from '@/content/about';

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
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              id="about-story-heading"
              heading={about.story.heading}
              animate={false}
              align="center"
              className="flex justify-center"
            />
            <ScrollFillBody
              paragraphs={about.story.paragraphs.map((paragraph) => paragraph.value)}
              size="lead"
              className="mx-auto mt-12 max-w-4xl"
            />
          </div>
        </Container>
      </Section>

      {/*
        The vision gets the navy band and the largest type on the page after the hero. It is the
        one paragraph on this site that is a statement of intent rather than a description of a
        product, and setting it as another body column would bury it.
      */}
      <Section id={about.vision.id} tone="navy" labelledBy="about-vision-heading">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <SplitHeading
                id="about-vision-heading"
                as="h2"
                roman="Our"
                accent="Vision"
                className="mx-auto text-balance"
              />
            </Reveal>

            <div className="mt-5">
              <Reveal>
                <SplitHeading
                  as="h3"
                  size="h3"
                  roman={about.vision.heading.roman}
                  accent={about.vision.heading.accent}
                  className="mx-auto max-w-[24ch] text-balance"
                />
              </Reveal>

              <Reveal>
                <p className="mx-auto mt-10 max-w-[54ch] text-balance text-[clamp(1.25rem,2vw,1.75rem)] font-bold leading-[1.45] tracking-[-0.015em] text-ink-primary">
                  {about.vision.statement}
                </p>
              </Reveal>

              <Reveal>
                <div className="mx-auto mt-10 max-w-measure space-y-5 border-t border-hairline/20 pt-10 text-left">
                  {about.vision.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-balance text-body text-ink-secondary">
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
