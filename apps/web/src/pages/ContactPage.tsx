import { Container } from '@/components/primitives/Container';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { SectionHeading } from '@/components/content/SectionHeading';
import { ContactForm } from '@/components/contact/ContactForm';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { contact } from '@/content/contact';
import { site } from '@/content/site';

export default function ContactPage() {
  return (
    <PageShell seo={contact.seo} path="/contact" anchors={contact.anchors}>
      <ImageHero
        id={contact.hero.id}
        eyebrow={contact.hero.eyebrow}
        heading={contact.hero.heading}
        media={contact.hero.media}
        compact
        scrollCueTarget={contact.enquiry.id}
      />

      {/* The form, in full, immediately. It replaced a three-step wizard that put two
          transitions between arriving and typing your name. */}
      <Section id={contact.enquiry.id} tone="light" labelledBy="contact-enquiry-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            {/*
              The heading and its intro stick as one block. Sticking the heading alone left the
              paragraph below it in the same column free to scroll underneath — and a sticky
              element with no background of its own does not hide what passes behind it, so the
              two overlapped as soon as the column moved.
            */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-[calc(var(--header-height)+4rem)]">
                <SectionHeading
                  id="contact-enquiry-heading"
                  heading={contact.enquiry.heading}
                  animate={false}
                />
                <Reveal>
                  <p className="mt-6 max-w-measure text-body text-ink-secondary">
                    {contact.enquiry.intro}
                  </p>
                </Reveal>
              </div>
            </div>

            <Reveal className="lg:col-span-7 lg:col-start-6">
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id={contact.location.id} tone="grey" labelledBy="contact-location-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <SectionHeading
              id="contact-location-heading"
              heading={contact.location.heading}
              className="lg:col-span-5"
            />

            <Reveal className="lg:col-span-6 lg:col-start-7">
              <address className="not-italic text-body text-ink-secondary">
                <span className="block text-ink-primary">{site.contact.organisation}</span>
                {site.contact.addressLines.map((line) => (
                  <PlaceholderBadge key={line.value} item={line} as="div" className="mt-1">
                    {line.value}
                  </PlaceholderBadge>
                ))}
              </address>

              <p className="mt-8 max-w-measure text-body-sm text-ink-secondary">
                {contact.location.body}
              </p>

              {/* Padding rather than `tap-target`: stacked 12px apart, two 44px hit areas
                  overlap and a tap in the seam lands on whichever is later in the DOM. */}
              <div className="mt-6 flex flex-col items-start text-body-sm">
                <PlaceholderBadge item={site.contact.phone}>
                  <a
                    href={`tel:${site.contact.phone.value.replace(/\s/g, '')}`}
                    className="block py-2.5 text-ink-secondary transition-colors duration-hover hover:text-ink-primary"
                  >
                    {site.contact.phone.value}
                  </a>
                </PlaceholderBadge>
                <PlaceholderBadge item={site.contact.email}>
                  <a
                    href={`mailto:${site.contact.email.value}`}
                    className="block py-2.5 text-accent-ink transition-colors duration-hover hover:text-ink-primary"
                  >
                    {site.contact.email.value}
                  </a>
                </PlaceholderBadge>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
