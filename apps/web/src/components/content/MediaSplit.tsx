import { Check } from 'lucide-react';
import type { Heading } from '@datagateways/shared';
import { Reveal } from '@/components/primitives/Reveal';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { AVAILABLE_MEDIA } from '@/generated/media';
import { cn } from '@/lib/cn';

export interface MediaSplitProps {
  id?: string;
  heading: Heading;
  body: string;
  image: string;
  points?: readonly string[];
  /** Puts the image first on wide screens. Alternating it down a page stops the rhythm setting. */
  reverse?: boolean;
  className?: string;
}

/**
 * A band of copy beside a photograph — the pattern the product, service and partner pages all use
 * to break up a run of card grids.
 *
 * The image is decorative: the heading and body carry every fact in the band, so an alt string
 * here would only repeat them to a screen reader. It is lazily decoded and never blocks paint, and
 * a file that was never synced renders nothing rather than a broken frame.
 */
export function MediaSplit({
  id,
  heading,
  body,
  image,
  points,
  reverse = false,
  className,
}: MediaSplitProps) {
  const available = AVAILABLE_MEDIA.includes(image);

  return (
    <div
      className={cn(
        'grid items-center gap-10 lg:grid-cols-2 lg:gap-16',
        className,
      )}
    >
      <Reveal className={cn(reverse && 'lg:order-2')}>
        <SplitHeading id={id} as="h2" roman={heading.roman} accent={heading.accent} />
        <p className="mt-6 max-w-measure text-body text-ink-secondary">{body}</p>

        {points && points.length > 0 ? (
          <ul className="mt-8 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-body-sm text-ink-secondary">
                <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-accent-ink" />
                {point}
              </li>
            ))}
          </ul>
        ) : null}
      </Reveal>

      {available ? (
        <Reveal
          as="figure"
          className={cn(
            'group/media overflow-hidden rounded-sm border border-hairline/10 bg-bg-navy',
            reverse && 'lg:order-1',
          )}
        >
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] h-full w-full object-cover transition-transform duration-[900ms] ease-entrance group-hover/media:scale-[1.04]"
          />
        </Reveal>
      ) : null}
    </div>
  );
}
