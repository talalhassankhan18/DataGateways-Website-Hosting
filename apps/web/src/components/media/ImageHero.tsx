import type { BackdropVariant } from '@/lib/backdrop';
import { HeroMedia } from './HeroMedia';
import { HeroShell, type HeroShellProps } from './HeroShell';

export interface ImageHeroProps extends Omit<HeroShellProps, 'media'> {
  media: {
    readonly image: string;
    readonly generative: BackdropVariant;
  };
}

/**
 * The shared hero footage. Every inner page runs the same clip the home page does, so the site
 * holds one moving identity rather than changing picture from section to section.
 *
 * Declared once here rather than repeated per page: the pages keep their own still, which stays
 * meaningful as the poster and as the fallback wherever the video is not loaded.
 */
const SHARED_VIDEO = [
  { src: '/media/hero-home.webm', type: 'video/webm' },
  { src: '/media/hero-home.mp4', type: 'video/mp4' },
] as const;

/**
 * Hero for the inner pages.
 *
 * The page's own image is the poster, so it is what paints first and becomes the LCP element, and
 * the shared clip fades in over it once the browser is idle. All of the loading policy —
 * never below 768px, never under reduced motion, never before idle — lives in HeroMedia, which the
 * home hero shares, so there is one set of rules rather than two that drift.
 *
 * Where the video is not loaded the page still shows its own still, and where neither exists the
 * authored canvas draws instead. Nothing renders a broken frame.
 */
export function ImageHero({ media, ...shell }: ImageHeroProps) {
  return (
    <HeroShell
      {...shell}
      media={
        <HeroMedia
          media={{
            poster: media.image,
            sources: SHARED_VIDEO,
            generative: media.generative,
          }}
        />
      }
    />
  );
}
