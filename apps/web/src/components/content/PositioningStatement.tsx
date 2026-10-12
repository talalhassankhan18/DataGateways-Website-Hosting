import { ScrollFillText } from '@/components/primitives/ScrollFillText';

export interface PositioningStatementProps {
  statement: string;
}

/**
 * One sentence, set large in the display face, with a lot of air around it.
 *
 * The reference scrubs this block's ink in character by character as it travels up the viewport
 * rather than fading it in as a unit — see ScrollFillText, which is where that behaviour lives.
 */
export function PositioningStatement({ statement }: PositioningStatementProps) {
  return (
    <ScrollFillText className="mx-auto max-w-[38ch] text-center font-display text-statement font-bold uppercase text-ink-primary">
      {statement}
    </ScrollFillText>
  );
}
