# DataGateways website — project log

A record of what has been built, what was decided and why, what is verified, and what is still
outstanding. Written to be read by someone picking this up cold.

**Last updated:** 12 October 2026

> **Analytics follow-ups, 12 October 2026.** Tracking moved to `react-ga4` at the client's
> request — a thin wrapper over the same `gtag.js`, so the wire format is unchanged and the
> consent handshake stays outside it (see [`ANALYTICS.md`](ANALYTICS.md)). The measurement ID
> changed to `G-YEG8CLH6T0`, replacing `G-G9BBDT5TQV`; GA4 properties do not merge, so the two
> days of data on the old ID stay there. The site also went live on GitHub Pages, which required
> a base path, a router basename, a `404.html` fallback and resolving 72 absolute asset paths.

> **Google Analytics added, 10 October 2026.** GA4 via `gtag.js`, behind a Consent Mode v2
> banner, with the contact and partner funnels, CTA clicks and outbound links instrumented. It
> 69 tests added; the full record is in [`ANALYTICS.md`](ANALYTICS.md).
>
> **Measurement ID supplied and set the same day**, so production is now live: the
> next deploy loads the tag and shows the banner. Development stays inert — Vite does not read
> `.env.production` in dev mode, verified. The one outstanding item blocks that deploy: the
> privacy policy does not name Google Analytics or list its cookies, and the drafted wording in
> [`ANALYTICS.md`](ANALYTICS.md) §8 is deliberately left for counsel rather than pasted in.
>
> Two pre-existing problems surfaced while testing and were **not** fixed, being out of scope and
> in one case a copy decision: a raw `<h2>` in `ServicePage.tsx:240` that fails the split-heading
> invariant, and a lint error in `NavDropdown.tsx:115`. Both in [`ANALYTICS.md`](ANALYTICS.md) §9.

> **Change of direction, 23 September 2026.** The client asked for five things, and all five are
> in: the navigation now carries data-gateways.com's own information architecture item for item;
> the home hero runs licensed footage; the headline is one centred line; the five cards beneath it
> behave exactly as the reference's do; and licensed photography runs through the inner pages.
>
> They also asked for the `PLACEHOLDER` outlines to come off so the site reads as finished rather
> than as a wireframe. That has been done — but it means the mechanical register in
> [`PLACEHOLDERS.md`](PLACEHOLDERS.md) now reports zero entries, **which is not the same as
> everything being verified**. The record moved to [`PRE-LAUNCH-SIGNOFF.md`](PRE-LAUNCH-SIGNOFF.md),
> which is maintained by hand. Read it before anything goes public: the compliance marks and the
> partner directory are the two items with real legal exposure.

---

## 1. At a glance

| | |
| --- | --- |
| **Goal** | A marketing site for DataGateways, built to the structure and motion of [dtv.sa](https://dtv.sa) |
| **Stack** | React 18 + Vite + TypeScript + Tailwind (web) · Express + Zod (API) · npm workspaces |
| **Pages** | Home, About, Platform, Product detail ×3, DataNerve capability ×3, Services ×2, Partner ×3, Contact, 404 (Resources built but feature-flagged off) |
| **State** | Builds clean; 141 tests (16 API, 125 web) with 1 pre-existing failure; 0 type errors; 1 pre-existing lint error |
| **Not yet done** | Nothing is committed to git; drafted content still needs client sign-off — see [`PRE-LAUNCH-SIGNOFF.md`](PRE-LAUNCH-SIGNOFF.md) |

### Commands

```bash
npm run dev          # web on :3000 (LAN-reachable), api on :4000
npm run share        # public tunnel to :3000, for a reviewer on another network
npm run build        # typecheck + build both apps
npm test             # 141 tests across both workspaces
npm run lint         # eslint, zero-warning policy
npm run art:generate # regenerate the six hero plates
npm run docs:placeholders  # rebuild the unverified-claims register
npm run fonts:fetch  # re-download the two self-hosted families
```

---

### Showing it to someone on another network

`npm run share` opens a Cloudflare quick tunnel to `:3000` and prints a throwaway
`https://<random>.trycloudflare.com` URL. No account, no router configuration, nothing listening
on the public IP — it is an outbound connection from this machine that Cloudflare forwards back
down.

Vite would otherwise refuse those requests. It checks the `Host` header and rejects anything it
does not recognise, which is what stops DNS rebinding — a hostile page pointing a domain it owns
at `127.0.0.1` to read your dev server through it. `server.allowedHosts` in
[`apps/web/vite.config.ts`](../apps/web/vite.config.ts) names the tunnel providers explicitly
rather than being set to `true`, so the protection still holds for every other hostname.

Three things to know before sending the link:

- **It is public and unauthenticated.** Unguessable is not the same as private.
- **It dies when the command stops**, and a new run gives a different address.
- **It serves the dev server**, current working state and source maps included. For an actual
  review, `npm run build && npm run preview` first and tunnel that instead: it is the bundle that
  would ship, and it has no HMR socket to fail over the tunnel.

And the standing one: the site still carries unconfirmed compliance marks and an invented partner
directory ([`PRE-LAUNCH-SIGNOFF.md`](PRE-LAUNCH-SIGNOFF.md)). Fine for a named reviewer; not fine
anywhere a crawler could reach.

---

## 2. Repository shape

```
apps/
  web/     React marketing site
    src/components/{primitives,layout,content,media,contact}
    src/content/       ALL copy — typed objects, no strings in JSX
    src/lib/           motion, backdrop, scroll, hooks, formatting
    src/styles/        tokens.css, fonts.css, index.css
  api/     Express: /api/health, /api/contact, /api/resources
packages/
  shared/  types + constants shared by both apps
assets/    logo, the six generated hero plates, the hero clip and 17 licensed stills
scripts/   asset sync, hero-art generator, font fetcher, placeholder register, share tunnel
.tools/    cloudflared, fetched on first `npm run share`. Gitignored; not a source.
docs/      design reference, copy deck, licence register, this log
```

**Content separation is strict.** Every user-visible string lives in `apps/web/src/content/*.ts` as
a typed object. A hardcoded string in a component is a bug — it is what makes the client's real copy
droppable later without touching a component.

---

## 3. Design system

Read directly off the reference site's computed styles, not inferred from the brief.
Full detail in [`design-reference.md`](design-reference.md).

### Typography

| Role | Family | Licence |
| --- | --- | --- |
| Display — every heading, uppercase, −0.025em | **Space Grotesk 700** | SIL OFL 1.1 |
| UI and body | **Readex Pro 300–600** | SIL OFL 1.1 |

Both are the reference's own families, both are Google Fonts under an open licence, both are
self-hosted from `apps/web/public/fonts` with metric-matched fallbacks so the hero does not reflow
when the webfont arrives.

### The light/dark band system

This is a **light-first** design. The page runs on a warm off-white and is composed of alternating
bands, exactly as the reference does it:

```
HOME:  hero + card strip (footage) → statement (light) → counters (blue)
       → marquee (grey) → news (white) → footer (navy)
```

| Token | Value | Used for |
| --- | --- | --- |
| `bg.base` | `#FBFBF9` | page default |
| `bg.white` | `#FFFFFF` | news, listings |
| `bg.grey` | `#EEF0F1` | marquee, integrations |
| `bg.band` | `#0A4FB0` | counters, closing CTA |
| `bg.navy` | `#041E42` | hero floor, menu overlay, footer |

A band is set with `<Section tone="...">`, which applies a `.tone-*` class that **redefines the ink
tokens for everything inside it**. That is why one card component works on the off-white statement
band and on the blue counter band without being told where it is.

### Two judgement calls

**1. Brand blue is DataGateways', not DTV's.** The reference uses `#003594`; that is Dhahran Techno
Valley's brand colour, and the brief is explicit that the reference is for structure and motion
only. Bands use `#0A4FB0`, derived from the client's own logo blue `#0E70F7`.

> The logo blue could not be used for the bands directly: white text on `#0E70F7` is **4.49:1**, a
> hair under the AA floor of 4.5. `#0A4FB0` clears it at 7.61:1. `#0E70F7` remains the display and
> fill accent, with `#0A4FB0` for accent *text* on light (7.35:1).

**2. Emphasis is colour, not italic.** The written brief specified an Instrument Serif italic accent
half on every headline. The reference has no italic at all — its emphasis is a colour shift. On the
client's instruction the reference won; Instrument Serif and Inter were removed entirely.

---

## 3b. Navigation

The IA is **data-gateways.com's own**, kept item for item; only the presentation is this design's.

```
Home                /
Product ▾           /platform
  DataNerve ▸       /platform/datanerve
    Governance      /platform/datanerve/governance
    DSPM            /platform/datanerve/dspm
    DLP             /platform/datanerve/dlp
  AINerve           /platform/ainerve
  SOCMINT           /platform/socmint
  ── View All       /platform
Services ▾          /services/data
  Data Services     /services/data
  AI Services       /services/ai
Partner Program ▾   /partners/find
  Find a Partner    /partners/find
  Become a Partner  /partners/become
  ── Login as Partner  /partners/login
About Us            /about
```

Ten pages were written to stand behind the new entries, rather than pointing the nav at stubs.
Three of them — the DataNerve capability pages — share one template, because Governance, DSPM and
DLP are three facets of one product and giving each its own layout would imply otherwise.

**The dropdowns are disclosures, not ARIA menus.** A `button` carrying `aria-expanded` over a plain
list of links, not `role="menu"`/`menuitem`. Those roles promise application-style arrow-key
semantics this nav does not implement, and screen readers stop announcing the contents as links
once you claim them.

Three details that are easy to get wrong and are handled in `NavDropdown.tsx`:

- **Every node that opens a panel also has its own destination.** A parent reachable only by
  hovering is unreachable on touch and by keyboard. `Product` resolves to the platform overview,
  and a test asserts no panel-opening node is left without an href.
- **Escape listens at the document, not on the wrapper**, so it still fires when the panel was
  opened by hover and focus is somewhere else entirely — and it hands focus back to the trigger,
  without which the browser drops focus to the top of the document when the panel unmounts.
- **Hover-close is delayed 140ms**, so a diagonal mouse path from the trigger into the panel does
  not dismiss it on the way.

---

## 4. Motion

Every timing is taken from the reference's `main.js`, which runs GSAP + ScrollTrigger + Lenis. This
build uses **framer-motion + Lenis**, with GSAP's named eases expressed as cubic-beziers in
`lib/motion.ts`. Full table in [`design-reference.md`](design-reference.md#motion-spec).

The load-bearing pieces:

- **Hero sequence** — plate settles from `scale 1.12`; the headline arrives **word by word** at a
  0.18s stagger; the numbered strip follows at 0.09s per cell. One sequence, not six elements.
- **The home hero is the reference's own layout**, not the shell the inner pages use. The headline
  is one centred line that never wraps, sized off the viewport (`min(6.6vw, 6.5rem)`) rather than a
  type scale, and the five cards are an **accordion overlaid on the hero floor**: each folded to a
  9.5rem peek showing its index and title, opening on hover or focus to reveal the tag, blurb and
  link cue, with the headline stepping back to `opacity: 0.14` and the scroll cue retiring while
  one is open. Every value is read off the reference's computed styles.
  - **One deliberate divergence: the open height follows the content.** The reference hard-codes
    `min(50svh, 470px)`, which it can afford because its cards say a single word; ours carry a
    20–30 word blurb, and at 1024×640 the tallest cell needs 406px against that 320px — the last
    line and the whole Explore cue were being cut off. It is a `grid-template-rows: 0fr → 1fr`
    transition now, the only way to animate to a content-driven height in CSS. Measured clipping at
    1440×900, 1280×660 and 1024×640: zero on all five cells.
  - That opening is **CSS, not state**. A React `onMouseEnter` would not fire for a keyboard user;
    `:focus-within` gets that for free, which is the whole reason the detail is revealed by a
    parent selector rather than a prop.
  - Nothing inside the folded-away detail is focusable — the card's only link is its title — so the
    collapsed state hides no tab stop.
  - Below `lg` the accordion becomes a plain stacked band, fully open. Five columns of accordion at
    390px would be five unreadable slivers, and there is no hover to open them with.
- **Hero parallax** — scrubbed to scroll, `y → 18%` and opacity → 0.25, so the next band reads as
  sliding over the hero.
- **Statement fill** — the positioning sentence fills character by character, scrubbed to scroll
  position across a `top 82%` → `bottom 45%` window.
- **Header** — solid past 40px, and **hides while scrolling down** past 300px, returning instantly
  on scroll up.
- **Reveals replay** — matching `toggleActions: 'restart none none reverse'`, scrolling back up
  re-arms them rather than leaving the page spent.
- **Counters** — 1.8s on power2.out, thousands-separated, re-running when scrolled back to.

### Accessibility is not traded away for any of it

- The hero headline is split into per-word spans for animation, so the `h1` carries the full string
  as `aria-label` and every span is `aria-hidden`. A screen reader gets one heading with complete
  text. The spaces are **real text nodes, not margins**, so copying the headline yields
  `Zero Trust Starts Here` rather than `ZeroTrustStartsHere`.
- The statement's 150 character spans are treated the same way.
- Everything is gated behind `useReducedMotion()`: entrances render final states, counters show
  final values, the marquee holds, the statement renders unsplit at full ink, and Lenis never
  initialises.

### Two Lenis consequences worth knowing

Both cost real debugging time and are handled in `lib/useSmoothScroll.ts`:

1. **Lenis owns scrolling and ignores `window.scrollTo`.** Route changes silently stopped resetting
   scroll until `App.tsx` was taught to route through `window.__lenis.scrollTo(0)`.
2. **Lenis does not reliably emit a native `scroll` event.** Rather than rewire the header,
   scroll-spy, scroll cue and statement fill to each know about Lenis, its own event is
   **re-published as the native one** — one line, and every existing consumer keeps working.

The statement fill is deliberately **not** `useScroll` + `useTransform`: framer's `useScroll` did
not track through Lenis, and one motion value per character is ~150 re-evaluating every frame. It is
one rAF-throttled listener writing a single `--fill` custom property, with CSS deriving each
character's opacity from its own index.

---

## 5. Media — licensed footage and photography, over authored artwork

**Superseded 23 Sept 2026.** The original pass concluded no usable stock existed and fell back to
generated SVG. That conclusion was wrong about the sources, not about the standard: a second look
found [Mixkit](https://mixkit.co) and the Pexels CDN both reachable and both on the brief's
approved list. The authored plates remain in the repo as the fallback layer.

### Hero footage

| File | Source | Licence |
| --- | --- | --- |
| `hero-home.mp4` (720p, 5.8 MB) | Mixkit — 3D lines and luminous points rotating | Mixkit Free, commercial use, no attribution |
| `hero-home-poster.jpg` (91 kB) | The clip's own first frame | as above |

The poster is the clip's first frame, so the swap from still to video is invisible. **5.8 MB is over
the 4 MB budget in the requirements doc** and there is no way to re-encode it here — no ffmpeg in
this environment. It is survivable only because of how the clip is loaded: never below 768px, never
under reduced motion, and never before `requestIdleCallback` fires, so the poster is always the LCP
element and the video never competes with first paint. **Re-encode it before launch**; a 1080p
VP9/WebM pair at ~2 MB would be a straight improvement, and the sources list already prefers WebM.

### Photography

Seventeen stills from the Pexels CDN (Pexels Licence — commercial use, no attribution), one per
product, capability, service and partner page plus three article thumbnails, 3.0 MB in total, all
lazily loaded. Each was chosen against the brief's own rules — dark and low-contrast so white type
sits on it, **no recognisable faces, no third-party trademarks, no vendor dashboards**. Several
otherwise-good candidates were rejected on exactly those grounds: an Apple logo in one, Dell and
Intel hardware badges in several data-centre shots, and the entire "cyber security" category, which
is mostly stock text overlays reading CYBER ATTACK and PHISHING — the kind of thing that reads as
fake on a real security vendor's site.

### The authored plates are still here

The six SVG plates generated by `scripts/generate-hero-art.mjs` and the matching animated canvas
variants in `lib/backdrop.ts` remain the fallback for every slot. Nothing renders a broken frame:
each consumer checks `AVAILABLE_MEDIA` first, so deleting a photo degrades that hero to the canvas
rather than to an empty box.

| Plate | Variant | Page |
| --- | --- | --- |
| `hero-home.svg` | network | Home |
| `hero-about.svg` | lattice | About |
| `hero-platform.svg` | circuit | Platform |
| `hero-datanerve.svg` | cipher | DataNerve |
| `hero-ainerve.svg` | signal | AINerve |
| `hero-contact.svg` | architecture | Contact |

Each pairs with a matching **animated canvas** variant in `lib/backdrop.ts` drawing the same
composition: the plate paints immediately, the canvas animates on top. The canvas skips its own
wash when layered (otherwise the two stack and the hero reads a stop brighter), stops when
off-screen or the tab is hidden, and never starts under reduced motion.

Only the home hero has footage. The others still run plate-plus-canvas, or a photograph where the
page gained one; dropping `hero-about.mp4` / `.webm` into `assets/media` switches the About hero
over with no code change.

Every file — plate, clip and photograph — has a row in [`licences.csv`](licences.csv), now 27
entries. **No row, no ship.**

---

## 6. Defects found and fixed

| What | Why it mattered |
| --- | --- |
| `FullscreenMenu.tsx` left mid-refactor with an orphaned `AnimatePresence` tail | **Nothing typechecked.** The repo did not build. |
| `npm run docs:placeholders` pointed at a script that did not exist | The unverified-claims register could not be produced at all |
| Zero test files, despite vitest, supertest and testing-library all being installed | No safety net anywhere |
| API tests ran **twice** — once from `src`, once from stale compiled output in `dist/` | Half the run was testing whatever was last built, not the current source |
| Test files compiled into the shipped `dist/` build output | Tests shipping to production |
| `/resources` 404'd from **both navs** | The page was correctly feature-flagged off, but the nav items were written out by hand and never cut. The copy deck's own instruction is "cut this page *and* drop the nav item". |
| Footer used `<h2>` for link-group labels | Put footer labels level with page section headings in the screen-reader outline |
| Hero headline `textContent` had no spaces after the word split | Copying the headline gave `ZeroTrustStartsHere` |
| Cipher hero plate silently rendered blank | Raw `<`, `>` and `&` in the glyph set are illegal XML; browsers drop the whole SVG with no console error |
| Route change stopped resetting scroll once Lenis was added | Introduced during this work; caught and fixed |
| **Re-publishing Lenis's scroll event as a native one recursed until the stack blew** | Lenis attaches its own `onNativeScroll` listener to the same window, so the synthetic event fed straight back into it, which emitted another Lenis scroll, which re-dispatched. `Maximum call stack size exceeded` on the first wheel gesture — and it killed every scroll-driven effect on the page. This had been in the code since Lenis was added and had **never been seen, because the build had never been scrolled in a real browser**. Fixed with a re-entrancy guard, and locked by `useSmoothScroll.test.ts`. |
| `fetchPriority="high"` on the hero images | React 18 does not map the camelCase name onto the DOM attribute; it warned on every hero and dropped the hint, so the LCP image never actually got priority |
| Mobile hero collapsed its own top margin out of the section | The card strip's `mt-[68svh]` collapsed through the section — `overflow: clip` does not open a block formatting context the way `overflow: hidden` does — dragging the whole hero 574px down the page and leaving a band of bare white above it. Now padding on the section. |

Several of these are now **locked by tests** rather than just fixed — see below.

---

## 7. Testing

**50 tests. 16 API, 34 web.**

### API (`apps/api/src/app.test.ts`)

Covers the security-critical behaviour, not just the happy path:

- Honeypot and completion-timing bot checks — and that both look **identical to the caller**,
  because telling a bot it was caught only teaches it what to change
- The response never echoes back submitted content
- Unknown fields are rejected rather than passed through
- A mail failure does not leak its cause in production
- Rate limiting
- **Fail-closed config**: production refuses to boot without SMTP and all four routed mailboxes
- `TRUST_PROXY_HOPS` defaults to 0, so `X-Forwarded-For` cannot walk around the rate limiter

### Web

- **The split-heading invariant** — a source scan asserting no `h1` or `h2` anywhere bypasses
  `SplitHeading`. The design reference says a heading that does is a bug; a rendering test cannot
  catch one added to a page nobody thought to test, so this walks the source instead.
- **Navigation** — every nav href resolves to a registered route **at all three levels**, with
  parameterised routes expanded against the slug lists their page validates against, so a nav item
  pointing at a product nobody added fails here rather than rendering the 404 page in front of the
  client. Also: no panel-opening node is left without its own destination, the Resources nav item
  is cut whenever its page is, menu indices stay `01..0n` with no gap, and every footer link points
  at either a real route or an explicitly-listed outstanding page.
- **Lenis re-entrancy** — the guard that stops the synthetic scroll event recursing into Lenis's
  own listener, including that it re-arms after a throwing listener. This one is a regression test
  for a crash that only ever appeared in a real browser.
- **Contact wizard** — branching, Back preserving earlier answers, Start over clearing them, focus
  moving to the step heading so keyboard focus is never stranded, the polite live announcement, and
  full keyboard operation.
- **Scroll fill** — the geometry unit-tested without a browser (monotonic, clamped to 0–1, no
  divide-by-zero), plus the accessibility contract: one readable string, spans hidden, every
  character indexed.

---

## 8. Still outstanding

### Blocking launch

On the client's instruction the `PLACEHOLDER` outlines were removed and the drafted values written
out, so the site reads as finished. [`PLACEHOLDERS.md`](PLACEHOLDERS.md) is still generated
mechanically and now reports **zero entries** — because nothing is *marked* any more, not because
everything is verified. The record is [`PRE-LAUNCH-SIGNOFF.md`](PRE-LAUNCH-SIGNOFF.md), kept by hand.

The two items with real legal exposure:

- [ ] **Every compliance mark** — SOC 2, ISO 27001, GDPR, HIPAA, EU AI Act — is a draft assumption.
      Publishing an unearned certification mark is a legal problem, not a copy problem.
- [ ] **The nine partner organisations in the directory are invented.** Naming a company as a
      certified partner when it is not is a claim about a third party, not just about DataGateways.

And the rest:

- [ ] Seven counter figures, drafted
- [ ] Three integration grids (73 named products) need product-team sign-off on supported scope
- [ ] SOCMINT's entire page is inferred from the nav label — no description of the product was
      available — so every capability on it needs a read
- [ ] Point the contact wizard at real routed inboxes
- [ ] Customer logo set, with written permission per logo
- [ ] Registered address; the phone number is deliberately from Ofcom's fictional-use range
- [ ] Wire `/partners/login` to a real identity provider, and delete its "not connected" notice in
      the same change
- [ ] Re-encode the hero clip — 5.8 MB is over the 4 MB budget, and no ffmpeg was available here
- [ ] Real logo SVG to replace the letterspaced wordmark

### Pages not yet built

Linked from the footer on purpose — the links are the record of what is outstanding — and held in a
`PENDING_PAGES` allowlist that fails the navigation test if one is forgotten:
`/careers`, `/security`, `/status`, `/docs`, `/privacy`, `/terms`.

### Housekeeping

- [ ] **Nothing is committed to git.** The repository has no commits at all.
- [ ] Resources page is built but flagged off (`features.resources`), per the copy deck's rule that
      it ships only with four or more real articles.

---

## 9. Known limitations of this verification

Stated plainly so nobody assumes more was checked than was:

### What was verified in a browser this time

The preview pane runs `requestAnimationFrame` only intermittently — it freezes whenever the pane is
hidden, which is most of the time — so anything driven by rAF could only be checked in the windows
where it happened to be running. Within those windows, confirmed by screenshot and by measuring the
DOM at 1440×900 and 390×844:

- The centred one-line headline, at both widths, with the text measured against the viewport
- The card accordion opening on focus: height, blue tint, revealed detail, and the headline
  dimming to 0.14 behind it
- All three nav levels, including the DataNerve submenu panel
- The hero video mounting and playing
- Header going solid past 40px and the statement fill reaching 1 — after real wheel gestures
- Zero horizontal overflow, exactly one `h1`, and no broken images on all 13 routes at both widths
- A clean console after repeated real scrolling, which is what proves the Lenis recursion is gone

### What still has not been verified

- **The hero entrance sequence has never been watched running.** The word stagger, the strip
  stagger and the plate settle all start from `opacity: 0`, so with rAF frozen they simply stay
  hidden; the screenshots above were taken either during a live window or with the resting state
  forced by injected CSS. The final layout is right. **The timing of the sequence, the parallax
  scrub, the counters and the marquee still need a human with a real browser window.**
- The header's hide-on-scroll past 300px was not reproduced — it needs sustained downward scrolling
  that the pane's frozen rAF makes unreliable to drive.
- Colour contrast figures were computed numerically against the tokens, not measured with a
  third-party auditing tool. The new surfaces — the navy dropdown panels, the teal card tag on the
  expanded card tint, the partner tier chips — have **not** been checked at all.
- No cross-browser testing — the build targets ES2022 and modern Chrome/Safari/Firefox but has only
  run in the bundled Chromium. The card accordion leans on `:has()` for the headline dim, which is
  the one piece here with a meaningful support floor (Safari 15.4+, Chrome 105+, Firefox 121+). It
  degrades to "headline does not dim", which is cosmetic.
- The 5.8 MB hero clip has not been load-tested on a throttled connection.
