import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { Container } from '@/components/primitives/Container';
import { Section } from '@/components/primitives/Section';
import { PageShell } from '@/components/layout/PageShell';

const seo = {
  title: 'Privacy Policy | DataGateways',
  description: 'DataGateways privacy policy.',
};

function inlineMarkdown(value: string): ReactNode {
  const parts = value.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          className="text-accent-ink underline underline-offset-2"
        >
          {link[1]}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function renderPolicy(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line === '---') {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const className =
        level === 1
          ? 'text-h2'
          : level === 2
            ? 'text-h3'
            : level === 3
              ? 'text-h4'
              : 'text-body font-bold';
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';

      blocks.push(
        <Tag key={index} className={`${className} mt-10 font-bold uppercase text-ink-primary first:mt-0`}>
          {inlineMarkdown(heading[2])}
        </Tag>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={index}
          className="my-6 border-l-2 border-accent/50 pl-5 text-body-sm italic text-ink-secondary"
        >
          {inlineMarkdown(line.slice(2))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }

      blocks.push(
        <ul key={index} className="my-4 list-disc space-y-2 pl-6 text-body text-ink-secondary">
          {items.map((item) => (
            <li key={item}>{inlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next === '---' ||
        /^(#{1,4})\s+/.test(next) ||
        next.startsWith('> ') ||
        next.startsWith('- ')
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }

    blocks.push(
      <p key={index} className="my-4 text-body leading-[1.75] text-ink-secondary [text-align:justify]">
        {inlineMarkdown(paragraph.join(' '))}
      </p>,
    );
  }

  return blocks;
}

export default function PrivacyPage() {
  const [policyMarkdown, setPolicyMarkdown] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/privacy-policy.md')
      .then((response) => {
        if (!response.ok) throw new Error(`Privacy policy request failed: ${response.status}`);
        return response.text();
      })
      .then((content) => {
        if (active) setPolicyMarkdown(content);
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PageShell seo={seo} path="/privacy">
      <Section id="privacy-policy" tone="light">
        <Container className="max-w-4xl">
          <article>
            {policyMarkdown ? (
              renderPolicy(policyMarkdown)
            ) : (
              <p className="text-body text-ink-secondary">Loading privacy policy...</p>
            )}
          </article>
        </Container>
      </Section>
    </PageShell>
  );
}
