import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cardVariants, groupVariants, revealVariants, VIEWPORT } from '@/lib/motion';
import { cn } from '@/lib/cn';

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  /* Ordered, for the sequences that are genuinely steps — an engagement timeline reads wrong to a
     screen reader as an unordered list. */
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  header: motion.header,
  figure: motion.figure,
} as const;

export type RevealTag = keyof typeof TAGS;

export interface RevealProps {
  children: ReactNode;
  as?: RevealTag;
  className?: string;
  /** Proportion of the element that must be visible before it animates. */
  amount?: number;
}

/**
 * Fade up 60px when the element enters the viewport. Static under reduced motion.
 *
 * `VIEWPORT.once` is false, matching the reference's `toggleActions: 'restart none none reverse'`:
 * scrolling back up re-arms the reveal rather than leaving the page spent after one pass.
 */
export function Reveal({ children, as = 'div', className, amount = VIEWPORT.amount }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  const Tag = TAGS[as];

  return (
    <Tag
      className={cn(className)}
      variants={revealVariants(reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEWPORT.once, amount }}
    >
      {children}
    </Tag>
  );
}

/** Parent of a card stack. Children arrive 140ms apart, down the stack. */
export function RevealGroup({ children, as = 'div', className, amount = VIEWPORT.amount }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  const Tag = TAGS[as];

  return (
    <Tag
      className={cn(className)}
      variants={groupVariants(reduced)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: VIEWPORT.once, amount }}
    >
      {children}
    </Tag>
  );
}

export interface RevealItemProps {
  children: ReactNode;
  as?: RevealTag;
  className?: string;
}

/** A child of RevealGroup. Inherits the parent's trigger, offset by its position in the stack. */
export function RevealItem({ children, as = 'div', className }: RevealItemProps) {
  const reduced = useReducedMotion() ?? false;
  const Tag = TAGS[as];

  return (
    <Tag className={cn(className)} variants={cardVariants(reduced)}>
      {children}
    </Tag>
  );
}
