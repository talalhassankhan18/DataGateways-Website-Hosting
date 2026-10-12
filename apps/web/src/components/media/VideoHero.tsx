import { HeroMedia, type HeroMediaSpec, type VideoSource } from './HeroMedia';
import { HeroShell, type HeroShellProps } from './HeroShell';

export type { VideoSource };

export interface VideoHeroProps extends Omit<HeroShellProps, 'media'> {
  media: HeroMediaSpec;
}

/**
 * Poster-first hero for any page that has footage. All of the loading policy lives in HeroMedia,
 * which the home hero shares; this is only the shell around it.
 */
export function VideoHero({ media, ...shell }: VideoHeroProps) {
  return <HeroShell {...shell} media={<HeroMedia media={media} />} />;
}
