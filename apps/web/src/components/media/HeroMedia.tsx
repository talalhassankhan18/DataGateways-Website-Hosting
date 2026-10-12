import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AVAILABLE_MEDIA } from '@/generated/media';
import { useSaveData } from '@/lib/hooks';
import type { BackdropVariant } from '@/lib/backdrop';
import { asset } from '@/lib/asset';
import { GenerativeBackdrop } from './GenerativeBackdrop';

export interface VideoSource {
  readonly src: string;
  readonly type: string;
}

export interface HeroMediaSpec {
  readonly poster: string;
  readonly sources: readonly VideoSource[];
  /** Drawn when there is no footage, and layered over the poster while the video loads. */
  readonly generative: BackdropVariant;
}

const exists = (path: string) => AVAILABLE_MEDIA.includes(path);

/**
 * Defers a value until the browser is idle, so nothing here competes with first paint.
 * requestIdleCallback is missing in Safari, hence the timeout fallback.
 */
const useAfterIdle = (enabled: boolean): boolean => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const idle = window.requestIdleCallback;
    if (typeof idle === 'function') {
      const handle = idle(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(handle);
  }, [enabled]);

  return ready;
};

/**
 * The background layer of a hero: poster first, then footage, with the authored canvas standing in
 * for whichever is absent.
 *
 * The clip is decorative and carries no audio track, so it is hidden from assistive tech entirely
 * rather than given controls nobody can use.
 *
 * ---- When the footage loads ----
 *
 * Never under reduced motion, and never before the browser is idle, so the poster is always what
 * paints first and becomes the LCP element. It plays on phones as well as on desktop: the clip was
 * withheld below 768px to save a phone visitor 2.8MB, which was a defensible call and is not the
 * one the client wants — the hero is the same on every device now.
 *
 * What stayed is the part that matters more than the breakpoint did. A visitor on Data Saver, or
 * on a connection the browser rates 2G or slower, still gets the poster and the canvas and no
 * download. That is the case the 768px rule was really protecting, and a width was only ever a
 * proxy for it: a phone on wifi was being denied the hero while a laptop tethered to a weak signal
 * was served 2.8MB.
 */
export function HeroMedia({ media }: { media: HeroMediaSpec }) {
  const reduced = useReducedMotion() ?? false;
  const saveData = useSaveData();

  const posterAvailable = exists(media.poster);
  const sources = media.sources.filter((source) => exists(source.src));

  const wantsVideo = !reduced && !saveData && sources.length > 0;
  const videoMounted = useAfterIdle(wantsVideo) && wantsVideo;

  return (
    <>
      {posterAvailable ? (
        <motion.img
          src={asset(media.poster)}
          alt=""
          // React 18 does not map the camelCase name onto the DOM attribute and warns
          // instead, so the hint is spelled the way HTML spells it.
          {...{ fetchpriority: 'high' }}
          decoding="async"
          // Reference: the hero plate settles from 1.12 rather than sitting still.
          initial={reduced ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Layered over the plate rather than swapped with it: the plate is the LCP element and the
          canvas supplies the motion on top. Dropped once real footage mounts, and under reduced
          motion, where the still plate is the whole hero. */}
      {videoMounted || (posterAvailable && reduced) ? null : (
        <GenerativeBackdrop variant={media.generative} wash={!posterAvailable} />
      )}

      {videoMounted ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={posterAvailable ? asset(media.poster) : undefined}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {sources.map((source) => (
            <source key={source.src} src={asset(source.src)} type={source.type} />
          ))}
        </video>
      ) : null}
    </>
  );
}
