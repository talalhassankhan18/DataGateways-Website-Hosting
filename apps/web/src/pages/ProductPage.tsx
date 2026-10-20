import { useParams } from 'react-router-dom';
import { Container } from '@/components/primitives/Container';
import { DividedGrid } from '@/components/primitives/DividedGrid';
import { Reveal, RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { CtaBand } from '@/components/content/CtaBand';
import { ModuleCard } from '@/components/content/ModuleCard';
import { PathwayCard } from '@/components/content/PathwayCard';
import { SectionHeading } from '@/components/content/SectionHeading';
import { StepCard } from '@/components/content/StepCard';
import { TierCard } from '@/components/content/TierCard';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { isProductSlug, products } from '@/content/products';
import {
  BarChart3,
  BookOpen,
  Bot,
  ClipboardList,
  Code2,
  Database,
  FileText,
  FileUser,
  Headphones,
  Languages,
  Presentation,
  Receipt,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import NotFoundPage from './NotFoundPage';

function getAgentIcon(title: string): React.ComponentType<{ className?: string }> {
  const lower = title.toLowerCase();
  if (lower.includes('sql') || lower.includes('database')) return Database;
  if (lower.includes('translation')) return Languages;
  if (lower.includes('compliance') || lower.includes('policy checker')) return ShieldCheck;
  if (lower.includes('contract') || lower.includes('legal')) return Scale;
  if (lower.includes('hr') || lower.includes('human resources')) return Users;
  if (lower.includes('invoice') || lower.includes('expense')) return Receipt;
  if (lower.includes('presentation')) return Presentation;
  if (lower.includes('resume')) return FileUser;
  if (lower.includes('meeting') || lower.includes('action items') || lower.includes('notes')) return ClipboardList;
  if (lower.includes('report') || lower.includes('drafting')) return FileText;
  if (lower.includes('code review') || lower.includes('code')) return Code2;
  if (lower.includes('security') || lower.includes('alert') || lower.includes('log triage')) return ShieldAlert;
  if (lower.includes('document q&a') || lower.includes('knowledge')) return BookOpen;
  if (lower.includes('support') || lower.includes('customer') || lower.includes('triage')) return Headphones;
  if (lower.includes('analyst') || lower.includes('data analyst')) return BarChart3;
  return Bot;
}

/**
 * One template, three shapes.
 *
 * The spine — hero, lead and figures, CTA — is fixed. Everything between is optional and
 * rendered only where the product actually has it, so DataNerve's eight modules, AINerve's defence
 * pillars and SOCMINT's five-step method each get the section that fits them instead of all three
 * being bent through the same fixed run. See the note on `ProductPage` in content/products.ts.
 */
export default function ProductPage() {
  const { slug } = useParams();

  if (!isProductSlug(slug)) return <NotFoundPage />;

  const product = products[slug];

  return (
    <PageShell seo={product.seo} path={`/products/${product.slug}`} anchors={product.anchors}>
      <ImageHero
        id={product.hero.id}
        eyebrow={product.hero.eyebrow}
        heading={product.hero.heading}
        media={product.hero.media}
        compact
        scrollCueTarget={product.lead.id}
      />

      <Section id={product.lead.id} tone="light">
        <Container>
          <ScrollFillBody paragraphs={[product.lead.text]} size="lead" />

          {/* The headline figures, as a plain definition list: each value is described by the
              label under it, which is exactly what dl/dt/dd is for. */}
          <Reveal
            as="div"
            className={`mt-14 grid gap-x-8 gap-y-10 border-t border-hairline/15 pt-12 sm:grid-cols-2 ${
              product.slug === 'socmint'
                ? 'mx-auto lg:max-w-4xl lg:grid-cols-3 lg:gap-x-16'
                : 'lg:grid-cols-4'
            }`}
          >
            {product.stats.map((stat) => (
              <dl key={stat.label} className="min-w-0 text-center">
                <dd className="whitespace-nowrap font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.03em] text-accent-ink">
                  {stat.value}
                </dd>
                <dt className="mt-3 text-body-sm text-ink-secondary">{stat.label}</dt>
              </dl>
            ))}
          </Reveal>
        </Container>
      </Section>

      {product.tiers ? (
        <Section id={product.tiers.id} tone="white" labelledBy="product-tiers-heading">
          <Container>
            <SectionHeading
              id="product-tiers-heading"
              heading={product.tiers.heading}
              className="mb-16"
            />

            <RevealGroup as="ul" className="grid gap-4 lg:grid-cols-3" amount={0.1}>
              {product.tiers.cards.map((card) => (
                <TierCard key={card.title} card={card} />
              ))}
            </RevealGroup>
          </Container>
        </Section>
      ) : null}

      {product.governanceModules ? (
        <Section
          id={product.governanceModules.id}
          tone="light"
          labelledBy="product-governance-modules-heading"
        >
          <Container>
            <SectionHeading
              id="product-governance-modules-heading"
              eyebrow={product.governanceModules.eyebrow}
              heading={product.governanceModules.heading}
              lead={product.governanceModules.intro}
              className="mb-14 max-w-3xl"
            />

            {/* Numbered rather than bulleted: these are six controls a prompt passes through,
                and the order is the order they run in. No blurbs — the brief gave the five
                names and nothing else, and a sentence written here would be a product claim
                nobody has approved. */}
            <RevealGroup as="ol" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" amount={0.1}>
              {product.governanceModules.cards.map((card) => (
                <RevealItem
                  as="li"
                  key={card.title}
                  className="flex h-full items-start gap-5 rounded-md border border-hairline/15 bg-bg-base p-6"
                >
                  <span className="font-mono text-index font-semibold tracking-[0.1em] text-accent-ink">
                    {card.index}
                  </span>
                  <h3 className="text-body font-semibold leading-[1.35] text-ink-primary">
                    {card.title}
                  </h3>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </Section>
      ) : null}

      {product.agents ? (
        <Section id={product.agents.id} tone="white" labelledBy="product-agents-heading">
          <Container>
            <SectionHeading
              id="product-agents-heading"
              eyebrow={product.agents.eyebrow}
              heading={product.agents.heading}
              lead={product.agents.intro}
              className="mb-14 max-w-3xl"
            />

            {/* Fifteen names in a plain divided list. Cards would give each one a box it has
                nothing to fill, and a three-column list reads faster than fifteen tiles. */}
            <RevealGroup
              as="ul"
              className="grid border-t border-hairline/15 sm:grid-cols-2 lg:grid-cols-3"
              amount={0.05}
            >
              {product.agents.items.map((item) => {
                const Icon = getAgentIcon(item);
                return (
                  <RevealItem
                    as="li"
                    key={item}
                    className="flex items-center gap-3.5 border-b border-hairline/15 py-3.5 pr-6 text-body-sm text-ink-primary sm:[&:nth-child(2n)]:pl-6 lg:[&:nth-child(3n+1)]:pl-0 lg:[&:not(:nth-child(3n+1))]:pl-6"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-solid/10 text-accent-solid"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-ink-primary">{item}</span>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </Container>
        </Section>
      ) : null}

      {product.method ? (
        <Section id={product.method.id} tone="white" labelledBy="product-method-heading">
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="product-method-heading"
                heading={product.method.heading}
                className="lg:col-span-5"
              />
              <Reveal className="lg:col-span-6 lg:col-start-7">
                <p className="max-w-measure text-body text-ink-secondary">{product.method.intro}</p>
              </Reveal>
            </div>

            {/* `ol`, because these are genuinely ordered — a screen reader reading them as an
                unordered list loses the only thing that makes a methodology a methodology. */}
            <DividedGrid as="ol" columns="sm:grid-cols-2 lg:grid-cols-5" separated>
              {product.method.steps.map((step) => (
                <StepCard key={step.title} card={step} />
              ))}
            </DividedGrid>
          </Container>
        </Section>
      ) : null}

      {product.modules ? (
        <Section
          id={product.modules.id}
          tone={product.method || product.tiers ? 'grey' : 'white'}
          labelledBy="product-modules-heading"
        >
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="product-modules-heading"
                heading={product.modules.heading}
                className="lg:col-span-5"
              />
              {product.modules.intro ? (
                <Reveal className="lg:col-span-6 lg:col-start-7">
                  <p className="max-w-measure text-body text-ink-secondary">
                    {product.modules.intro}
                  </p>
                </Reveal>
              ) : null}
            </div>

            <DividedGrid columns="sm:grid-cols-1 lg:grid-cols-2">
              {product.modules.cards.map((card) => (
                <ModuleCard key={card.title} card={card} />
              ))}
            </DividedGrid>
          </Container>
        </Section>
      ) : null}

      {product.subPages ? (
        <Section id={product.subPages.id} tone="white" labelledBy="product-subpages-heading">
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="product-subpages-heading"
                heading={product.subPages.heading}
                className="lg:col-span-5"
              />
              <Reveal className="lg:col-span-6 lg:col-start-7">
                <p className="max-w-measure text-body text-ink-secondary">
                  {product.subPages.intro}
                </p>
              </Reveal>
            </div>

            <DividedGrid>
              {product.subPages.cards.map((card) => (
                <PathwayCard key={card.title} card={card} />
              ))}
            </DividedGrid>
          </Container>
        </Section>
      ) : null}

      <CtaBand content={product.cta} />
    </PageShell>
  );
}
