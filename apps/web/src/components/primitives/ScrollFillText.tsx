import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { fillProgress } from '@/lib/scrollFill';
import { cn } from '@/lib/cn';

export interface ScrollFillTextProps {
  children: string;
  className?: string;
  /** Rendered as a paragraph by default; the positioning statement is not a heading. */
  as?: 'p' | 'h2';
  id?: string;
}

/**
 * The reference's signature statement effect: the text starts dim and fills to full ink character
 * by character as the block travels up the viewport, scrubbed to scroll position rather than
 * played on a timer.
 *
 * **Why this is hand-rolled rather than `useScroll` + `useTransform`.** Two reasons, both found the
 * hard way:
 *
 *  1. Lenis drives scrolling here, and framer-motion's `useScroll` did not track through it — the
 *     progress value stayed pinned at 0 however far the page moved.
 *  2. One `useTransform` per character means ~150 motion values re-evaluating every frame for a
 *     single sentence.
 *
 * Instead one rAF-throttled listener writes a single `--fill` custom property on the element, and
 * CSS derives each character's opacity from its own `--i` index. That is one style write per frame
 * regardless of length, and it is immune to whatever owns the scroll position.
 *
 * Two things this must not break:
 *  - The text stays one accessible string. Characters are split for painting only, so the element
 *    carries an `aria-label` and the spans are hidden from assistive tech.
 *  - Copy and paste still yields the real sentence, so the spaces are real text nodes rather than
 *    margins, and words never break mid-word because characters nest inside word wrappers.
 */
export function ScrollFillText({ children, className, as: Tag = 'p', id }: ScrollFillTextProps) {
  const ref = useRef<HTMLParagraphElement & HTMLHeadingElement>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;

    let frame = 0;

    const read = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        '--fill',
        String(fillProgress(rect.top, rect.height, window.innerHeight)),
      );
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced, children]);

  if (reduced) {
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  const words = children.split(/(\s+)/).filter((part) => part.length > 0);
  const totalChars = children.replace(/\s/g, '').length;
  let charIndex = -1;

  return (
    <Tag
      ref={ref}
      id={id}
      aria-label={children}
      className={cn('scroll-fill', className)}
      style={{ '--n': totalChars } as React.CSSProperties}
    >
      {words.map((word, wordIndex) => {
        // Real space text nodes, so the sentence survives being copied.
        if (/^\s+$/.test(word)) return ' ';

        return (
          <span key={`word-${wordIndex}`} aria-hidden="true" className="inline-block">
            {[...word].map((char, i) => {
              charIndex += 1;
              return (
                <span
                  key={`${wordIndex}-${i}`}
                  style={{ '--i': charIndex } as React.CSSProperties}
                >
                  {char}
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
