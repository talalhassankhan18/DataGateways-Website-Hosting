import { useEffect, useState } from 'react';
import type { Article } from '@datagateways/shared';
import { Container } from '@/components/primitives/Container';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { Reveal, RevealGroup } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ArticleCard } from '@/components/content/ArticleCard';
import { FilterTabs } from '@/components/content/FilterTabs';
import { SectionHeading } from '@/components/content/SectionHeading';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { fetchArticles } from '@/lib/api';
import { resources } from '@/content/resources';

type Status = 'loading' | 'ready' | 'error';

export default function ResourcesPage() {
  const [category, setCategory] = useState('all');
  const [articles, setArticles] = useState<readonly Article[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchArticles(category)
      .then((response) => {
        if (cancelled) return;
        setArticles(response.articles);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <PageShell seo={resources.seo} path="/resources" anchors={resources.anchors}>
      <ImageHero
        id={resources.hero.id}
        eyebrow={resources.hero.eyebrow}
        heading={resources.hero.heading}
        lead={resources.hero.lead}
        media={{ image: '/media/hero-platform.jpg', generative: 'lattice' }}
        compact
        scrollCueTarget={resources.listing.id}
      />

      <Section id={resources.listing.id} tone="white" labelledBy="resources-listing-heading">
        <Container>
          <SectionHeading
            id="resources-listing-heading"
            heading={resources.listing.heading}
            className="mb-12"
          />

          <Reveal>
            <FilterTabs
              tabs={resources.listing.tabs}
              active={category}
              onChange={setCategory}
              label={resources.hero.eyebrow}
            />
          </Reveal>

          <div aria-live="polite" aria-busy={status === 'loading'} className="mt-12">
            {status === 'loading' ? (
              <p className="text-body-sm text-ink-muted">{resources.listing.loadingState}</p>
            ) : null}

            {status === 'error' ? (
              <p role="alert" className="text-body-sm text-ink-secondary">
                {resources.listing.errorState}
              </p>
            ) : null}

            {status === 'ready' && articles.length === 0 ? (
              <PlaceholderBadge item={resources.listing.emptyState} as="div">
                <p className="rounded-sm border border-dashed border-hairline/15 px-6 py-10 text-center text-body-sm text-ink-secondary">
                  {resources.listing.emptyState.value}
                </p>
              </PlaceholderBadge>
            ) : null}

            {status === 'ready' && articles.length > 0 ? (
              <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </RevealGroup>
            ) : null}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
