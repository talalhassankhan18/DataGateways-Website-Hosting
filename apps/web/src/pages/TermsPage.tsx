import { useEffect, useState } from 'react';
import { Container } from '@/components/primitives/Container';
import { Section } from '@/components/primitives/Section';
import { PageShell } from '@/components/layout/PageShell';
import { renderPolicy } from './PrivacyPage';

const seo = {
  title: 'Terms and Conditions | DataGateways',
  description: 'DataGateways website terms and conditions.',
};

export default function TermsPage() {
  const [termsMarkdown, setTermsMarkdown] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/terms-and-conditions.md')
      .then((response) => {
        if (!response.ok) throw new Error(`Terms and conditions request failed: ${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (active) setTermsMarkdown(content);
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell seo={seo} path="/terms">
      <Section id="terms-and-conditions" tone="light">
        <Container className="max-w-4xl">
          <article>
            {termsMarkdown ? (
              renderPolicy(termsMarkdown)
            ) : (
              <p className="text-body text-ink-secondary">Loading terms and conditions...</p>
            )}
          </article>
        </Container>
      </Section>
    </PageShell>
  );
}
