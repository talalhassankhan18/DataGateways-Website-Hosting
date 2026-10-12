import type { CtaBandContent } from '@datagateways/shared';
import { Button } from '@/components/primitives/Button';
import { Container } from '@/components/primitives/Container';
import { Reveal } from '@/components/primitives/Reveal';
import { SplitHeading } from '@/components/primitives/SplitHeading';

export interface CtaBandProps {
  content: CtaBandContent;
}

export function CtaBand({ content }: CtaBandProps) {
  return (
    <div className="tone-band">
      <Container>
        <Reveal className="flex flex-col gap-8 py-20 lg:flex-row lg:items-center lg:justify-between">
          <SplitHeading
            as="h2"
            roman={content.heading.roman}
            accent={content.heading.accent}
            className="max-w-[16ch]"
          />
          <Button to={content.action.href} className="self-start lg:self-auto">
            {content.action.label}
          </Button>
        </Reveal>
      </Container>
    </div>
  );
}
