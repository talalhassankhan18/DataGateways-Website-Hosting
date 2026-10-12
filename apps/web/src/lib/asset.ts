/**
 * Turns a canonical content path into a URL that works wherever the site is deployed.
 *
 * Content stores asset paths root-relative — `/media/img-about.jpg` — and that is the right form
 * to keep: it is what `AVAILABLE_MEDIA` is keyed on, what the licence register lists, and what
 * reads correctly in a content file. It is not, however, a URL.
 *
 * Vite rewrites the asset references it can see in `index.html` and in CSS, but a path written as
 * a string in a `.ts` file is just a string. On a deployment with a base path — a GitHub Pages
 * project site at `/DataGateways-Website-Hosting/` — every one of those strings resolves against
 * the domain root instead, and every image, video, font and fetched document 404s while the page
 * itself loads fine. The site looks deployed and is visibly broken.
 *
 * So the resolution happens here, at the single boundary where a path becomes a URL: the `src`,
 * `poster` and `fetch` call sites. Not in the content files, which would mean 72 literals turning
 * into function calls and `generated/media.ts` — which `sync-assets.mjs` rewrites — losing the
 * change on the next sync.
 *
 * `BASE_URL` is whatever Vite's `base` was at build time and always ends in a slash, so with the
 * default `/` this returns the path unchanged and nothing differs for local development, cPanel
 * or Netlify.
 */
export const asset = (path: string): string => {
  if (!path) return path;

  /* Already a URL: an absolute `https://…`, a protocol-relative `//…`, or a `data:` / `blob:`
     payload. The partner directory's logos come from the API and can be any of these, so passing
     them through unchanged is what makes this safe to apply everywhere rather than only to paths
     known to be local. */
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return path;

  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
};
