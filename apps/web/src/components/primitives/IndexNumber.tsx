import { cn } from '@/lib/cn';

export interface IndexNumberProps {
  value: string;
  className?: string;
  /**
   * Index numbers are a visual motif, not information — a screen reader announcing "zero one" before
   * every card title is noise. Set false only where the number is the thing being referred to.
   */
  decorative?: boolean;
}

export function IndexNumber({ value, className, decorative = true }: IndexNumberProps) {
  return (
    <span
      aria-hidden={decorative || undefined}
      className={cn('font-mono text-index tabular-nums text-accent-ink', className)}
    >
      {value}
    </span>
  );
}
