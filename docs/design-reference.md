# Design reference — DataGateways

> **Provenance note.** The colour, type and section system below is read directly off dtv.sa's own
> computed styles, not inferred from the brief. Where the brief and the reference disagree — the
> brief specified a dark-only palette and an Instrument Serif italic accent, neither of which the
> reference uses — the reference wins, on the client's instruction. Brand colour is the exception:
> DTV's #003594 is Dhahran Techno Valley's, so the bands use DataGateways' own blue instead.

The layout grammar we are matching: full-bleed media heroes, split-weight headlines, numbered cards,
animated counters, a logo marquee and a branching contact wizard. Dark, cinematic, editorial.
Not a typical SaaS template.

---

## Colour

Defined once in `apps/web/src/styles/tokens.css` as CSS custom properties, surfaced to Tailwind in
`apps/web/tailwind.config.ts`. **No raw hex in JSX, ever.**

This is a **light-first** system. The page runs on a warm off-white and the composition is built
from alternating bands, exactly as the reference does it.

### Bands

| Token | Value | Where it is used |
| --- | --- | --- |
| `bg.base` | `#FBFBF9` | Page default — the positioning statement, story and lead bands |
| `bg.white` | `#FFFFFF` | News, article listings, product cards |
| `bg.grey` | `#EEF0F1` | Partner marquee, integrations grid, location block |
| `bg.band` | `#0A4FB0` | Brand blue: counters, closing CTA |
| `bg.navy` | `#041E42` | Hero floor, pathway strip, menu overlay, footer |

The home page rhythm, matching the reference: **hero (navy) → statement (light) → counters (blue)
→ marquee (grey) → news (white) → footer (navy)**. No two adjacent sections share a tone.

A band is applied with `<Section tone="...">`, which sets a `.tone-*` class. That class redefines
the ink tokens for everything inside it, so a card or heading works on any band without being told
which one it is sitting on. `.ink-on-dark` applies the light-on-dark ink set without a background,
for the header while it is transparent over the hero and for the anchor rail.

### Brand and ink

| Token | Value | Use |
| --- | --- | --- |
| `accent` | `#0E70F7` | Brand blue, sampled from the logo — fills, borders, display-size text |
| `accent.ink` | `#0A4FB0` | Accent applied to **small** text on light (7.35:1) |
| `accent.teal` | `#3DDBC8` | Counter `+`, alternating |
| `accent.amber` | `#FFA033` | Counter `+`, alternating |
| `ink.primary` | `#041E42` | Headings (15.97:1 on base) |
| `ink.body` | `#0B1526` | Long-form copy (17.63:1) |
| `ink.secondary` | `#4A5768` | Supporting copy (7.10:1) |
| `ink.dim` | `#5A6675` | Eyebrows and small labels (5.64:1) |

On the two dark bands these are redefined to white, `#BCCBE6` (4.65:1 on the blue band) and
`#8DC2FF`, so the same class names stay legible.

### Accessibility corrections

| Problem | Contrast | Fix |
| --- | --- | --- |
| White on `#0E70F7` as a band fill | 4.49:1 — a hair under AA | Bands use `#0A4FB0` at 7.61:1; `#0E70F7` stays a display and fill colour |
| `accent` `#0E70F7` as small text on light | 4.33:1 — fails AA normal | `accent.ink` `#0A4FB0` at 7.35:1 below 24px |

The counter `+` accents are display-only (52px/700), where the AA Large floor of 3:1 applies. They
clear it at 4.41:1 and 3.74:1 on the band and must never be used for body text.

---

## Type

Both families self-hosted from `apps/web/public/fonts`, `font-display: swap`. These are the two
families dtv.sa itself uses, confirmed by reading its computed styles. Both are Google Fonts under
the **SIL Open Font Licence 1.1**, so matching the reference's typography carries no licensing
problem.

| Role | Family | Spec |
| --- | --- | --- |
| Display | Space Grotesk 700 | Every heading, the positioning statement, counter figures |
| UI | Readex Pro 300–600 | Everything else |

**Every heading is uppercase**, set tight. Declared once in `styles/index.css` on `h1`–`h4` rather
than repeated per component.

| Style | Size | Detail |
| --- | --- | --- |
| Hero | `clamp(2.5rem, 7vw, 6rem)` | line-height 0.98, tracking −0.025em |
| H2 | `clamp(1.875rem, 3.6vw, 3.125rem)` | line-height 1.02, tracking −0.025em |
| Statement | `clamp(1.5rem, 3vw, 2.6rem)` | uppercase display, tracking −0.025em |
| Body | 17px / 1.7 | Readex Pro |
| Eyebrow | 12px | uppercase, 0.18em tracking, `ink.dim` |
| Index number | 13px | monospace, `accent.ink` |

---

## Layout

- Container max **1440px**; margins 80px desktop, 20px mobile.
- Grid: 12 columns desktop, 8 tablet, 4 mobile.
- Border radius **max 4px** — sharp, not rounded.
- Vertical rhythm on an 8px scale. Section spacing 120px desktop / 72px mobile.

---

## The signature pattern

Every `h1` and `h2` on the site renders through one component:

```tsx
<SplitHeading roman="Zero Trust" accent="Starts Here" as="h1" />
```

Both halves are uppercase Space Grotesk 700. The emphasis is carried by **colour, never by slant** —
neither family ships a true italic, and a synthesised oblique on a grotesque reads as a rendering
fault rather than as emphasis. The copy deck gives every headline pre-split into its two halves.
**If a heading anywhere bypasses this component, it is a bug** — enforced by a test in
`SplitHeading.test.tsx` that scans the source for any `h1` or `h2` outside this component.

Two supporting motifs used everywhere: zero-padded index numbers (`01`, `02`, `03`) on cards, nav
items and wizard steps, and an uppercase eyebrow label above every `h1`.

---

## Motion spec

Every value below is read off the reference site's own `main.js`, which drives its motion with
**GSAP + ScrollTrigger + Lenis**. We run **framer-motion + Lenis**, so GSAP's named eases are
expressed as their cubic-bezier equivalents in `apps/web/src/lib/motion.ts`:

| GSAP | cubic-bezier |
| --- | --- |
| `expo.out` | `0.16, 1, 0.3, 1` |
| `power3.out` | `0.215, 0.61, 0.355, 1` |
| `power2.out` | `0.25, 0.46, 0.45, 0.94` |

### The home hero

Laid out as the reference lays its own out, and read off its computed styles:

| Element | Spec |
| --- | --- |
| Headline | `position: absolute`, centred at `50svh - peek/2`, `text-align: center`, **`white-space: nowrap`**, `min(6.6vw, 6.5rem)`, `line-height: 1` |
| Card strip | `position: absolute; inset-inline: 0; bottom: 0`, `grid-template-columns: repeat(5, 1fr)` |
| Card, closed | `min-height: 9.5rem`, hairline top and inline-end borders at `white/.28` |
| Card, open | height follows its content, background `accent-solid/.55`, `0.65s cubic-bezier(.22,1,.36,1)` |
| Card title / index on open | `scale(1.12)` / `scale(1.25)`, `0.45s`, same curve |
| Card detail | `opacity 0 → 1`, `translateY(14px) → 0`, `0.45s` with a `0.12s` delay |
| Headline while a card is open | `opacity: 0.14`, `0.45s` |

**The one deliberate divergence: the open height is content-driven, not fixed.** The reference
hard-codes `height: min(50svh, 470px)` and can afford to, because its cards say a single word. Ours
carry a 20–30 word blurb whose wrapped height depends on the column width and the viewport — at
1024×640 the tallest cell needs 406px against a fixed 320px, so the last line of the blurb and the
whole Explore cue were being cut off the bottom. The cell now opens to exactly what its content
needs, via a `grid-template-rows: 0fr → 1fr` transition, which is the only way to animate to a
content-driven height in CSS (`height: auto` is not interpolable). `min-height` still holds the
closed peek, and `align-items: end` means a cell that grows does so upward on its own.

Four other things that are load-bearing rather than incidental:

1. **The size is capped so the longest headline in the copy deck still fits one line at 390px.** A
   longer one will overflow rather than reflow — that is the trade `nowrap` makes, and the
   reference makes it too. Check any new hero headline at mobile width.
2. **The open state is CSS on `:hover` and `:focus-within`, not React state.** An `onMouseEnter`
   would not fire for a keyboard user; `:focus-within` gets that for free.
3. **Nothing inside the folded-away detail is focusable.** The card's only link is its title, so the
   closed state hides no tab stop. Adding a second link inside the detail would break that.
4. **Below `lg` the whole thing becomes a stacked band, fully open.** Five columns of accordion at
   390px would be five unreadable slivers, and there is no hover to open them with. The spacing
   above it is **padding on the section, not margin on the list** — a margin there collapses through
   the section, because `overflow: clip` does not open a block formatting context.

### On load — the hero sequence

The hero resolves as one sequence, not as separate elements appearing.

| Element | Behaviour |
| --- | --- |
| Hero plate | `scale 1.12 → 1`, 2.4s, power2.out |
| Eyebrow | `y 20 → 0`, fade, 0.9s, power3.out, 0.2s delay |
| Headline | **per word**: `y 26 → 0`, fade, 0.9s, power3.out, **0.18s stagger**, 0.35s delay |
| Subhead / lead | `y 24 → 0`, fade, 1s, power3.out, 0.6s delay |
| Numbered strip | `y 56 → 0`, fade, 1.1s, expo.out, 0.45s + **0.09s per cell** |
| Scroll cue, anchor rail | fade in, 1s, 1.05s delay — last to arrive |

### On scroll

| Element | Behaviour |
| --- | --- |
| Header | solid past **40px**; **hides while scrolling down** past 300px, returns instantly on scroll up |
| Scroll cue | fades out past **60px** |
| Hero content | parallax **scrubbed**: `y → 18%`, opacity `1 → 0.25`, from `top top` to `bottom 35%` |
| Positioning statement | **scrubbed character fill**, `0.18 → 1` opacity, window `top 82%` → `bottom 45%` |
| Sections (`Reveal`) | `y 60 → 0`, fade, 1s, expo.out, at ~86% viewport |
| Card stacks | `y 60 → 0`, 1.1s, expo.out, **0.14s stagger** |
| Counters | 0 → target over **1.8s**, power2.out, thousands-separated |
| Marquee | continuous translate, ~40s cycle, greyscale → colour on hover, paused on hover |
| Card hover | cell background lifts; link arrow travels 4px |

**Reveals replay.** The reference uses `toggleActions: 'restart none none reverse'`, so scrolling
back up re-arms them. `VIEWPORT.once` is therefore `false` — this is deliberate, not an oversight,
and it is most of why scrolling the reference back and forth feels alive rather than spent.

### Smooth scrolling

Lenis at `duration: 1.1`, `smoothWheel: true`, **pointer devices only** (`hover: hover`) and never
under reduced motion — hijacking scroll on a touch device fights the platform's own momentum.

Two consequences that are easy to trip over, both handled in `lib/useSmoothScroll.ts`:

1. **Lenis owns the scroll position and ignores `window.scrollTo`.** Route changes and anchor jumps
   must go through `scrollToElement()` / `window.__lenis.scrollTo()`, or they silently do nothing.
2. **Lenis does not reliably emit a native `scroll` event.** Its own event is re-published as the
   native one, so the header, scroll-spy, scroll cue and statement fill keep working unchanged
   rather than each needing to know Lenis exists.

   **That re-publish must be guarded, and the reason is not obvious.** Lenis attaches its own
   `onNativeScroll` listener to the same window, so a bare `dispatchEvent` feeds straight back into
   it, which emits another Lenis scroll, which re-dispatches — recursing until the stack blows on
   the first wheel gesture. `reentrantSafe()` in `lib/useSmoothScroll.ts` cuts that cycle, and
   `useSmoothScroll.test.ts` locks it. Do not unwrap it.

### Reduced motion

Every entry above has a `prefers-reduced-motion` fallback: entrances render final states with no
transform, counters show final values immediately, the marquee holds static, the statement renders
at full ink with no character split at all, and Lenis never initialises.

---

## Media rules

- The home hero runs **licensed footage** (Mixkit Free) with the clip's own first frame as the
  poster. Inner pages run **licensed photography** (Pexels Licence), chosen against the brief's own
  rules: dark and low-contrast, **no recognisable faces, no third-party trademarks, no vendor
  dashboards**. Several otherwise-good candidates were rejected for a visible Apple logo, Dell and
  Intel badges, and the stock "CYBER ATTACK" text-overlay genre, which reads as fake on a real
  security vendor's site.
- The six hero plates in `assets/media` are **original SVG artwork**, generated by
  `scripts/generate-hero-art.mjs` (`npm run art:generate`), and remain the fallback for every slot.
  A file that was never synced renders nothing rather than a broken frame — every consumer checks
  `AVAILABLE_MEDIA` first.
- Everything comes from `assets/media`, which is licensed. **Never fetch media from a URL at runtime.**
- Never reference anything from dtv.sa.
- Every file in `assets/media` has a row in `docs/licences.csv`.
- Hero video is never requested below 768px — the poster stands in.

---

## Accessibility floor

WCAG 2.1 AA. Semantic landmarks, exactly one `h1` per page, visible focus rings, `aria-label` on
icon-only controls, focus trapping in the menu overlay, full keyboard operation for the wizard and
the filter tabs, and every animation gated behind `useReducedMotion()`.

## Performance floor

LCP under 2.5s. Hero poster renders immediately; video loads after and never below 768px. Routes
below the home page are lazy-loaded. Fonts self-hosted with `font-display: swap`, with metric-matched fallbacks so the hero headline does not reflow when Space Grotesk arrives.
