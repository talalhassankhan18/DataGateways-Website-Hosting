import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { createBackdrop, type BackdropVariant } from '@/lib/backdrop';
import { cn } from '@/lib/cn';

export interface GenerativeBackdropProps {
  variant: BackdropVariant;
  /** Off when layered over a still plate that already carries the wash. */
  wash?: boolean;
  className?: string;
}

const FALLBACK_ACCENT: [number, number, number] = [14, 112, 247];
const FALLBACK_INK: [number, number, number] = [245, 247, 250];

/** Reads a design token rather than hard-coding a colour the theme could change underneath us. */
const readToken = (name: string, fallback: [number, number, number]): [number, number, number] => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  return parts.length === 3 && parts.every(Number.isFinite)
    ? [parts[0], parts[1], parts[2]]
    : fallback;
};

/**
 * Original artwork standing in for the hero media. Purely decorative, so it is hidden from
 * assistive tech entirely.
 *
 * Costs nothing when it is not being looked at: the loop stops when the tab is hidden or the canvas
 * scrolls out of view, and under reduced motion it paints one static frame and never starts.
 */
export function GenerativeBackdrop({ variant, wash = true, className }: GenerativeBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const backdrop = createBackdrop(
      ctx,
      variant,
      {
        accent: readToken('--accent', FALLBACK_ACCENT),
        ink: readToken('--ink-primary', FALLBACK_INK),
      },
      { wash },
    );

    let frame = 0;
    let last = 0;
    let onScreen = true;

    const applySize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backdrop.resize(width, height);
      backdrop.draw();
    };

    const loop = (time: number) => {
      // Clamped so a backgrounded tab returning does not jump the animation forward by seconds.
      const dt = last === 0 ? 0 : Math.min(0.05, (time - last) / 1000);
      last = time;
      backdrop.step(dt);
      backdrop.draw();
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const start = () => {
      if (reduced || frame !== 0) return;
      if (!onScreen || document.visibilityState !== 'visible') return;
      last = 0;
      frame = window.requestAnimationFrame(loop);
    };

    applySize();

    const resizeObserver = new ResizeObserver(applySize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? true;
        if (onScreen) start();
        else stop();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [variant, reduced, wash]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}
