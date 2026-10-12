import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** 1440px max, 20px gutters on mobile, 80px from 1024px up. */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-container px-gutter', className)}>{children}</div>;
}
