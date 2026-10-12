#!/usr/bin/env node
/**
 * Post-build step for GitHub Pages.
 *
 * The repo already ships two SPA-fallback files and GitHub Pages reads neither of them:
 * `_redirects` is Netlify's and Cloudflare Pages', `.htaccess` is Apache's. Pages has its own
 * mechanism — it serves `404.html` for any path with no file behind it — so without this step
 * every deep link 404s. Only the bare root would work, which means every refresh, every shared
 * link and every back-button into a route is broken.
 *
 * Serving index.html as the 404 document is the standard SPA trick: the router reads
 * `location.pathname` on boot and renders the right route regardless of which document the host
 * handed over. The real 404 page still works, because React Router's catch-all renders it.
 *
 * One wrinkle worth knowing: Pages returns HTTP 404 with that body. The page is correct and the
 * visitor sees the right thing, but crawlers are told the URL does not exist. That is acceptable
 * here because the canonical URLs point at datagateways.net (see content/site.ts), so the Pages
 * deploy is a preview rather than the indexed home of this content.
 */
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'apps', 'web', 'dist');
const index = join(dist, 'index.html');

if (!existsSync(index)) {
  console.error('pages: apps/web/dist/index.html is missing — run the web build first.');
  process.exit(1);
}

copyFileSync(index, join(dist, '404.html'));

/* Stops Pages running the output through Jekyll, which silently drops files and directories whose
   names begin with an underscore. Vite emits `assets/`, so nothing is at risk today — but the
   failure mode is an asset that vanishes with no error, and the fix is an empty file. */
writeFileSync(join(dist, '.nojekyll'), '');

console.log('pages: wrote 404.html (SPA fallback) and .nojekyll');
