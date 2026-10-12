import { Button } from '@/components/primitives/Button';
import { Container } from '@/components/primitives/Container';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { PageShell } from '@/components/layout/PageShell';
import { GenerativeBackdrop } from '@/components/media/GenerativeBackdrop';
import { notFound } from '@/content/notFound';

export default function NotFoundPage() {
  return (
    <PageShell seo={notFound.seo} path="/404">
      <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden">
        <div className="absolute inset-0 -z-20">
          <GenerativeBackdrop variant="cipher" />
        </div>
        <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

        <Container className="py-32">
          <Eyebrow className="mb-6">{notFound.eyebrow}</Eyebrow>
          <SplitHeading
            as="h1"
            roman={notFound.heading.roman}
            accent={notFound.heading.accent}
            className="max-w-[14ch]"
          />
          <p className="mt-8 max-w-measure text-lead text-ink-secondary">{notFound.body}</p>
          <Button to={notFound.action.href} className="mt-10">
            {notFound.action.label}
          </Button>
        </Container>
      </section>
    </PageShell>
  );
}
