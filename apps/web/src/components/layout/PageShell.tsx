import type { ReactNode } from 'react';
import type { SeoMeta } from '@datagateways/shared';
import type { AnchorDef } from '@/content/home';
import { Meta } from './Meta';

export interface PageShellProps {
  seo: SeoMeta;
  path: string;
  anchors?: readonly AnchorDef[];
  children: ReactNode;
}

/**
 * Per-page wrapper: metadata, the anchor rail, and the main landmark the skip link targets.
 * Header and Footer live above this in the router layout so they survive route changes.
 */
export function PageShell({ seo, path, children }: PageShellProps) {
  return (
    <>
      <Meta seo={seo} path={path} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </>
  );
}
