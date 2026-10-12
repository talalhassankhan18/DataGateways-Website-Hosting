import type { ComponentType } from 'react';
import { Banknote, Building2, HeartPulse, RadioTower, ShieldCheck, Zap } from 'lucide-react';
import type { SectorTile } from '@/content/home';
import { cn } from '@/lib/cn';

export interface LogoMarqueeProps {
  tiles: readonly SectorTile[];
  /** Names the list for assistive tech, since the visual duplication carries no meaning. */
  label: string;
}

const ICONS: Record<SectorTile['icon'], ComponentType<{ className?: string }>> = {
  banking: Banknote,
  healthcare: HeartPulse,
  government: Building2,
  energy: Zap,
  telecom: RadioTower,
  insurance: ShieldCheck,
};

/**
 * One sector.
 *
 * The reference runs customer logos here, greyscale until hover. There are none to run — the
 * client has not supplied a logo set and each one would need written permission to display — so
 * this is the copy deck's stated fallback: sectors rather than customers. An icon and the
 * regulation that actually bites in that sector give the row something to say, which six bordered
 * words did not.
 *
 * Greyscale-to-colour is mirrored as muted-to-accent, so the hover behaviour matches even though
 * the content does not.
 */
const Tile = ({ tile }: { tile: SectorTile }) => {
  const Icon = ICONS[tile.icon];

  return (
    <div className="group/tile flex h-full w-[17rem] shrink-0 flex-col gap-3 rounded-sm border border-hairline/12 bg-bg-surface/60 px-7 py-6 transition-[border-color,background-color] duration-hover hover:border-accent/40 hover:bg-bg-surface">
      <Icon
        aria-hidden="true"
        className="h-6 w-6 text-ink-muted transition-colors duration-hover group-hover/tile:text-accent-ink"
      />
      <span className="text-body-sm font-semibold uppercase tracking-[0.1em] text-ink-primary">
        {tile.name}
      </span>
      <span className="text-eyebrow normal-case leading-snug tracking-normal text-ink-secondary">
        {tile.note}
      </span>
    </div>
  );
};

/**
 * Continuous horizontal loop, ~40s a cycle, paused on hover.
 *
 * The track is duplicated so the translate can wrap at -50% without a visible seam; the second copy
 * is hidden from assistive tech so the list is not read out twice. Under reduced motion the
 * animation is dropped by the global media query and the row simply sits still.
 */
export function LogoMarquee({ tiles, label }: LogoMarqueeProps) {
  return (
    <div className="mask-edges group/marquee overflow-hidden">
      <div
        className={cn(
          'flex w-max animate-marquee items-stretch gap-4',
          'group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none',
        )}
      >
        <ul aria-label={label} className="flex shrink-0 items-stretch gap-4">
          {tiles.map((tile) => (
            <li key={tile.name} className="flex">
              <Tile tile={tile} />
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="flex shrink-0 items-stretch gap-4">
          {tiles.map((tile) => (
            <Tile key={`${tile.name}-duplicate`} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
