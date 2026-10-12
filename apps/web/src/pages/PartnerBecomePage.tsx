import { Container } from '@/components/primitives/Container';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { PartnerApplicationForm } from '@/components/content/PartnerApplicationForm';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { partners } from '@/content/partners';

const page = partners.become;

export default function PartnerBecomePage() {
  return (
    <PageShell seo={page.seo} path="/partners/become" anchors={page.anchors}>
      <ImageHero
        id={page.hero.id}
        eyebrow={page.hero.eyebrow}
        heading={page.hero.heading}
        media={page.hero.media}
        compact
        scrollCueTarget={page.form.id}
      />

      <Section id={page.form.id} tone="white" labelledBy="partner-form-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              {/* Sticky as one block. Sticking the heading alone leaves the paragraph below it
                  free to scroll underneath, and a sticky element with no background does not
                  hide what passes behind it. */}
              <div className="lg:sticky lg:top-[calc(var(--header-height)+4rem)]">
                <SectionHeading
                  id="partner-form-heading"
                  heading={page.form.heading}
                  animate={false}
                />
                <Reveal>
                  <p className="mt-6 max-w-measure text-body-sm text-ink-secondary">
                    {page.form.intro}
                  </p>
                </Reveal>
              </div>
            </div>

            <Reveal className="lg:col-span-7 lg:col-start-6">
              <PartnerApplicationForm />
            </Reveal>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
