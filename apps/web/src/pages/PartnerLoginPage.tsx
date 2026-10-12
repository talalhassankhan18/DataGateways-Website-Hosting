import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { Container } from '@/components/primitives/Container';
import { Eyebrow } from '@/components/primitives/Eyebrow';
import { Reveal } from '@/components/primitives/Reveal';
import { Section } from '@/components/primitives/Section';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { PageShell } from '@/components/layout/PageShell';
import { partners } from '@/content/partners';

const page = partners.login;

/**
 * The partner portal sign-in.
 *
 * There is no identity provider behind this form and it does not pretend there is. The notice
 * saying so is on the page before anyone types rather than only after a submit, and the submit
 * handler never sends anything anywhere — so nothing can be collected by a screen that cannot
 * check it. Autofill is switched off on the password field for the same reason: a manager filling
 * a real credential into a dead form helps nobody.
 *
 * Point the form at the real IdP and delete the notice together, in one change.
 */
export default function PartnerLoginPage() {
  const emailId = useId();
  const passwordId = useId();
  const noticeId = useId();
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell seo={page.seo} path="/partners/login" anchors={page.anchors}>
      <Section id={page.hero.id} tone="navy" className="min-h-[92svh] pt-[calc(var(--header-height)+4rem)]">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Eyebrow className="mb-6">{page.hero.eyebrow}</Eyebrow>
              <SplitHeading
                as="h1"
                size="h2"
                roman={page.hero.heading.roman}
                accent={page.hero.heading.accent}
              />
              <p className="mt-6 max-w-measure-sm text-body text-ink-secondary">{page.intro}</p>

              <div className="mt-10 border-t border-hairline/15 pt-8">
                <SplitHeading
                  as="h2"
                  size="h3"
                  roman={page.help.heading.roman}
                  accent={page.help.heading.accent}
                />
                <p className="mt-4 max-w-measure-sm text-body-sm text-ink-secondary">
                  {page.help.body}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {page.help.actions.map((action, index) => (
                    <Button
                      key={action.href}
                      to={action.href}
                      variant={index === 0 ? 'primary' : 'ghost'}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="rounded-md border border-hairline/15 bg-bg-surface p-8">
              <p
                id={noticeId}
                className="mb-8 flex gap-3 rounded-sm border border-accent/30 bg-accent/10 p-4 text-body-sm text-ink-secondary"
              >
                <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
                {page.notice}
              </p>

              <form
                className="flex flex-col gap-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="flex flex-col gap-2">
                  <label htmlFor={emailId} className="text-body-sm text-ink-secondary">
                    {page.form.emailLabel}
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder={page.form.emailPlaceholder}
                    aria-describedby={noticeId}
                    className="rounded-sm border border-hairline/20 bg-transparent px-4 py-3 text-body-sm text-ink-primary placeholder:text-ink-muted focus-visible:border-accent"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor={passwordId} className="text-body-sm text-ink-secondary">
                    {page.form.passwordLabel}
                  </label>
                  <input
                    id={passwordId}
                    type="password"
                    name="password"
                    autoComplete="off"
                    aria-describedby={noticeId}
                    className="rounded-sm border border-hairline/20 bg-transparent px-4 py-3 text-body-sm text-ink-primary focus-visible:border-accent"
                  />
                </div>

                <Button type="submit">{page.form.submitLabel}</Button>
                <Button to="/contact" variant="ghost">
                  {page.form.ssoLabel}
                </Button>

                {/* Polite, so it is announced without interrupting whatever the user is doing. */}
                <p role="status" aria-live="polite" className="min-h-[1.5rem] text-body-sm text-accent-ink">
                  {submitted ? page.notice : ''}
                </p>

                <a
                  href={page.form.forgotHref}
                  className="tap-target text-body-sm text-ink-secondary underline underline-offset-4 transition-colors duration-hover hover:text-ink-primary"
                >
                  {page.form.forgotLabel}
                </a>
              </form>
            </Reveal>
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
