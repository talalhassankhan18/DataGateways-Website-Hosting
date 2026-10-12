import { ScrollFillText } from '@/components/primitives/ScrollFillText';
import { cn } from '@/lib/cn';

export interface ScrollFillBodyProps {
  /** One entry per paragraph. Each fills independently as it travels up the viewport. */
  paragraphs: readonly string[];
  className?: string;
  /** `lead` is the larger setting used for a page's opening statement. */
  size?: 'body' | 'lead';
}

const SIZE: Record<NonNullable<ScrollFillBodyProps['size']>, string> = {
  body: 'text-body',
  lead: 'text-[clamp(1.125rem,1.7vw,1.5rem)] leading-[1.6]',
};

/**
 * Body copy whose ink is scrubbed in character by character as it travels up the viewport — the
 * reference's treatment for its positioning statement, applied to the places on this site that do
 * the same job: the opening paragraphs of a page or a section.
 *
 * Each paragraph fills on its own so a long run does not have to be read as one block. The cost
 * stays flat: ScrollFillText writes a single custom property per element per frame and CSS derives
 * every character's opacity from it, so paragraph count drives DOM size but not scroll work.
 *
 * Accessibility is ScrollFillText's: the container carries the full string as its accessible name
 * and the split spans are hidden, so a reader gets sentences rather than characters. Under reduced
 * motion the text renders at full ink and never splits.
 */
export function ScrollFillBody({ paragraphs, className, size = 'body' }: ScrollFillBodyProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {paragraphs.map((paragraph) => (
        <ScrollFillText
          key={paragraph.slice(0, 48)}
          className={cn('max-w-measure text-ink-body', SIZE[size])}
        >
          {paragraph}
        </ScrollFillText>
      ))}
    </div>
  );
}
