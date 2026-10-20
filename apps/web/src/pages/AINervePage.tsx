import { Container } from '@/components/primitives/Container';
import { Reveal, RevealGroup, RevealItem } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { ScrollFillBody } from '@/components/content/ScrollFillBody';
import { CtaBand } from '@/components/content/CtaBand';
import { ModuleCard } from '@/components/content/ModuleCard';
import { SectionHeading } from '@/components/content/SectionHeading';
import { TierCard } from '@/components/content/TierCard';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { PageShell } from '@/components/layout/PageShell';
import { ImageHero } from '@/components/media/ImageHero';
import { DividedGrid } from '@/components/primitives/DividedGrid';
import { products } from '@/content/products';
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

const product = products['ainerve'];

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
 * Dedicated AINerve page.
 *
 * The shared ProductPage template renders all optional sections, but AINerve has three sections
 * that benefit from their own visual treatment — the six governance modules, the fifteen agentic
 * workflows, and the gateway surface — so this page owns its layout rather than inheriting a
 * generic run. The content objects are the same ones ProductPage would use.
 */
export default function AINervePage() {
  return (
    <PageShell seo={product.seo} path="/products/ainerve" anchors={product.anchors}>

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <ImageHero
        id={product.hero.id}
        eyebrow={product.hero.eyebrow}
        heading={product.hero.heading}
        media={product.hero.media}
        compact
        scrollCueTarget={product.lead.id}
      />

      {/* ─── Lead + headline stats ─────────────────────────────────────────── */}
      <Section id={product.lead.id} tone="light">
        <Container>
          <ScrollFillBody paragraphs={[product.lead.text]} size="lead" />

          <Reveal
            as="div"
            className="mt-14 grid gap-x-8 gap-y-10 border-t border-hairline/15 pt-12 sm:grid-cols-2 lg:grid-cols-4"
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

      {/* ─── Defence tiers ────────────────────────────────────────────────── */}
      {product.tiers && (
        <Section id={product.tiers.id} tone="white" labelledBy="ai-tiers-heading">
          <Container>
            <SectionHeading
              id="ai-tiers-heading"
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
      )}

      {/* ─── Five governance modules ───────────────────────────────────────
          Enhanced: dark navy band, large gradient index numbers, accent ring on hover.
          The dark tone makes the numbered controls read as a control panel — which is
          exactly what they are — rather than another light card grid. */}
      {product.governanceModules && (
        <Section
          id={product.governanceModules.id}
          tone="navy"
          labelledBy="ai-gov-heading"
        >
          <Container>
            <Reveal className="mb-14 max-w-3xl">
              <Eyebrow className="mb-5">{product.governanceModules.eyebrow}</Eyebrow>
              <SplitHeading
                id="ai-gov-heading"
                as="h2"
                roman={product.governanceModules.heading.roman}
                accent={product.governanceModules.heading.accent}
                className="max-w-[18ch]"
              />
              <p className="mt-6 max-w-measure text-lead text-ink-secondary">
                {product.governanceModules.intro}
              </p>
            </Reveal>

            <RevealGroup
              as="ol"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              amount={0.1}
            >
              {product.governanceModules.cards.map((card) => (
                <RevealItem
                  as="li"
                  key={card.title}
                  className={[
                    'group/gm relative flex h-full flex-col gap-5 overflow-hidden',
                    'rounded-lg border border-white/10 bg-white/5 p-7',
                    'transition-all duration-300',
                    'hover:border-accent/50 hover:bg-white/10 hover:shadow-[0_0_32px_-4px_rgba(0,200,200,0.18)]',
                  ].join(' ')}
                >
                  {/* Subtle gradient glow in the corner */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 opacity-0 group-hover/gm:opacity-100"
                  />

                  {/* Large gradient index */}
                  <span
                    aria-hidden="true"
                    className="font-mono text-[3rem] font-bold leading-none tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent-teal, #2dd4bf) 0%, var(--color-accent-ink, #0ea5e9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {card.index}
                  </span>

                  <h3 className="text-body font-semibold leading-[1.35] text-ink-primary">
                    {card.title}
                  </h3>

                  {/* Bottom accent line grows on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/gm:scale-x-100"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </Section>
      )}

      {/* ─── Agentic workflows ────────────────────────────────────────────────
          Enhanced: grey band, dot-matrix grid, each agent item has a teal bullet
          that blooms into a pill on hover. 3-column on desktop reads faster than
          15 tiles and keeps the section compact. */}
      {product.agents && (
        <Section id={product.agents.id} tone="grey" labelledBy="ai-agents-heading">
          <Container>
            <Reveal className="mb-14 max-w-3xl">
              <Eyebrow className="mb-5">{product.agents.eyebrow}</Eyebrow>
              <SplitHeading
                id="ai-agents-heading"
                as="h2"
                roman={product.agents.heading.roman}
                accent={product.agents.heading.accent}
                className="max-w-[18ch]"
              />
              <p className="mt-6 max-w-measure text-lead text-ink-secondary">
                {product.agents.intro}
              </p>
            </Reveal>

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
                    className={[
                      'group/ag flex items-center gap-3.5',
                      'border-b border-hairline/15 py-3.5 pr-6 text-body-sm text-ink-primary',
                      'transition-colors duration-200 hover:text-accent-ink',
                      'sm:[&:nth-child(2n)]:pl-6',
                      'lg:[&:nth-child(3n+1)]:pl-0 lg:[&:not(:nth-child(3n+1))]:pl-6',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-solid/10 text-accent-solid transition-all duration-200 group-hover/ag:bg-accent-solid group-hover/ag:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-ink-primary transition-colors duration-200 group-hover/ag:text-accent-ink">
                      {item}
                    </span>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </Container>
        </Section>
      )}

      {/* ─── Gateway modules ──────────────────────────────────────────────── */}
      {product.modules && (
        <Section id={product.modules.id} tone="white" labelledBy="ai-modules-heading">
          <Container>
            <div className="mb-14 grid gap-8 lg:grid-cols-12">
              <SectionHeading
                id="ai-modules-heading"
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
      )}

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <CtaBand content={product.cta} />
    </PageShell>
  );
}
