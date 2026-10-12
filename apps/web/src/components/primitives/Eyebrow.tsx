import { cn } from '@/lib/cn';

export interface EyebrowProps {
  children: string;
  className?: string;
  id?: string;
  showRule?: boolean;
}

/** The uppercase label that sits above every h1. */
export function Eyebrow({ children, className, id, showRule = false }: EyebrowProps) {
  return (
    <p id={id} className={cn('flex items-center gap-3 text-eyebrow uppercase text-ink-dim', className)}>
      {showRule ? <span aria-hidden="true" className="h-px w-8 shrink-0 bg-accent/70" /> : null}
      {children}
    </p>
  );
}
