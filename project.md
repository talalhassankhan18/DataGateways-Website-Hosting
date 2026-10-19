# DataGateways website — change log

Every change made to this site, newest first, with the request it answers and the file it lives
in. Kept so that a later request can be checked against what is already there before anything is
touched — which is the specific thing the 19 October email asked for.

**How to use it:** each entry names the file and the reason. If a change appears to have been
lost, find it here first — the entry says where it lives, so it can be confirmed in seconds
rather than re-done from memory.

---

## Round 8 — 19 October 2026 (Program Outcome panel overlap)

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 8.1 | The grey band overlapped the bottom of the Program Outcome panel | ✅ | `pages/CapabilityPage.tsx` |

**What was wrong.** The Data Quality section carried `className="-mt-16 lg:-mt-24"`, a -96px top
margin at `lg`. Sections are plain block elements in the flow, so a negative top margin does not
tighten the join — it drags the whole next band up over the one above it. The grey band started
96px before the light band ended, and painted over the last 68px of the Program Outcome panel
including its bottom border.

Measured on `/products/datanerve/governance` at 1440x900, before: `#management` ran to 2785 while
`#data-quality` began at 2689. After: no section on the page overlaps its neighbour, and the
panel clears the next band by 88px — exactly the `py-section` padding every other band uses.

**Where it came from.** This change log, Round 5 (commit `9460057`, earlier the same day). It was
the only negative margin on a `Section` anywhere in the app, and the comment above it explained
only the grey tone, not the margin — so nothing recorded why the band was being pulled up. It has
been removed rather than reduced, and the reasoning is now a comment in the file: bands are
separated by their own padding, and if this join ever needs to be tighter, the padding is the
thing to change.

DSPM and DLP share this template and were checked too — no overlaps, and neither page has the
panel, which belongs to the `management` block that only Data Governance defines.

---

## Round 7 — 19 October 2026 (responsiveness audit)

A sweep of all 16 routes at nine viewports from 320x568 to 2560x1440, checking for horizontal page
scroll, elements past the viewport edge, and text clipped inside its own box.

**Result: no page anywhere has a horizontal scrollbar, at any of the nine widths.** Four real
defects were found and fixed; everything else the sweep flagged was intentional and is listed
below so the next audit does not re-raise it.

| # | Defect | Where | Fix |
| --- | --- | --- | --- |
| 7.1 | Header "Menu" button sat 17px off the right edge at <=356px, on every route — the only navigation a phone has, partly out of reach | `layout/Header.tsx` | Tighten gap, wordmark tracking and button padding below 360px |
| 7.2 | Footer logo lockup overflowed the viewport by 3px at 320px and ignored the gutter entirely | `layout/Footer.tsx` | Drop the wordmark to `text-xl`/`0.06em` below 360px |
| 7.3 | Hero headline overlapped the first hero card by 44px at 320x568 — it printed over "01 Data governance" | `styles/index.css` | Ceiling the headline's centre so it cannot cross where the cards start |
| 7.4 | DSPM hero-card blurb had 65px of text cut off mid-word at 1024px | `styles/index.css` | `overflow-wrap: break-word` on `.hero-card__blurb` |

**7.1 — the header, in numbers.** At 320px the row has 280px of content box and wanted 317: the
logo is `shrink-0` at 203px (32px mark + 12px gap + a 159px wordmark, 36px of which is its 0.2em
tracking), plus a 24px gap, plus a 90px button. The button lost and was pushed off-screen.
Tightening the three gives back about 50px. The bound is `max-[359px]` rather than `max-sm`
because `sm` is 480px in this config and the header already fits from about 357px up — a 375px or
414px phone is correct as it is and must not be restyled to fix a 320px one. Verified: at 360px
and 375px the logo is still 203px and the button still 90px, unchanged.

**7.3 — the headline, and why it was not obvious.** Below `lg` the cards are not on the hero
floor; they start in the normal flow at the section's `pt-[68svh]`. The headline knew nothing
about that — `--cards-peek` is `0` below `lg`, so it centred at `50svh + 6.5rem` however short the
window was. The two values converge as the viewport loses height, meet at about 1067px tall and
cross below it. The fix is a `min()` ceiling at `68svh - 1rem - 4.5rem`, taken only when it is the
smaller, so every viewport that was already correct is untouched. Confirmed at 1440x900 the
computed `top` is 478px, identical to the old formula; `lg` keeps the original rule outright.

**7.4 — a clipping caused by the copy, fixed without touching the copy.** The card is 160px wide
at `lg` and the blurb opens on "Discovery,classififcation,access" — no spaces after the commas, so
the browser sees one 225px word, cannot break it, and `overflow: hidden` cut 65px off mid-word.
Allowing the break keeps the client's wording verbatim and changes nothing for text that fits.
The missing spaces remain a copy question, logged under known issues.

**Flagged by the sweep, intentional, not defects:**

| Pattern | Why it is correct |
| --- | --- |
| `section#hero` reports a 3–52px horizontal cut on every hero | The background image is a `scale(1.12)` Ken Burns layer, centred and clipped by the section on purpose |
| AINerve module `li` reports a 32px cut | A `pointer-events-none` hover accent at `-right-8`, clipped by design |
| DSPM compliance table overflows its row | It is inside `overflow-x-auto` — the standard responsive-table treatment |
| Footer reports a 6px cut | The decorative wordmark marquee |
| `sr-only` headings and captions report large cuts | Visually hidden by definition — the counters `h2` is `sr-only` and reports 519px |
| `/contact` reports a 9979px overflow | The spam honeypot at `left: -9999px` |

**A measurement trap worth recording.** The counter panel appeared pinned 32px to the right with
its entrance never running. It was not: the browser pane was hidden, so `requestAnimationFrame`
was paused and every framer-motion entrance froze at its initial value. With the pane shown, rAF
runs at ~61fps and the panel settles to `transform: none`. **Animation state measured in a hidden
pane is not evidence.** The `overflow-x-clip` guard `CounterSlider` documents is what kept that
frozen state from becoming a page-wide scrollbar.

---

## Round 6 — 19 October 2026 (hero welcome line)

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 6.1 | Hero kicker and lead are too small — make them bigger | ✅ | `components/media/HeroSlider.tsx` |
| 6.2 | "Your trusted partner in Data Security and Artificial Intelligence." on one line | ✅ | `components/media/HeroSlider.tsx` |

**What changed.**

| | Before | After |
| --- | --- | --- |
| Kicker | `clamp(1rem, 1.8vw, 1.4rem)` | `clamp(1.125rem, min(2.9vw, 4.6svh), 2.75rem)` |
| Lead | `text-body-sm sm:text-base lg:text-lead` | `clamp(1.0625rem, min(2.2vw, 3.5svh), 2.125rem)` |
| Lead wrapping | `max-w-measure`, always wrapped | `md:max-w-none md:whitespace-nowrap` |
| Gap between them | `mt-2` | `mt-3 sm:mt-4` |

At 1440x900 that takes the kicker from 22.4px to 41.4px and the lead from 21px to 31.5px.

**Why the clamps use `min(vw, svh)`.** This block is positioned absolutely at the top of the hero
while the rotating headline is centred in it, so the two converge as the window gets shorter —
height is the dimension that runs out first, not width. Sized on width alone the enlarged pair
cleared the headline by 149px at 1440x900 but by 15px at 1366x620, which is not clearance, it is
luck. The clamp answers to whichever dimension is tighter, so the gap holds on a short laptop.

**Why the lead wraps again below `md`.** One line of it is about 29x its own font size, so 66
characters on a 375px phone would mean roughly 12px type. The single line is kept from 768px up,
where it fits with room to spare, and allowed to wrap below that.

**Do not raise the kicker's 1.125rem floor.** On a phone the vw term has collapsed and the floor
is what actually renders. At 1.25rem the unbreakable line measures 305px against the 280px a
320px screen has to give it, and the overflow does not scroll — the hero clips it, so the word is
cut in half. This was tried in this round and reverted. The growth went into the ceiling instead,
which is where it is visible anyway.

**Measured after the change — nine viewports, no overlap and no horizontal scroll at any:**

| Viewport | Kicker | Lead | Lead lines | Slack on the line | Gap to headline |
| --- | --- | --- | --- | --- | --- |
| 1920x1080 | 44px | 34px | 1 | — | 229px |
| 1440x900 | 41.4px | 31.5px | 1 | 303px | 162px |
| 1440x700 | 32.2px | 24.5px | 1 | — | 87px |
| 1366x620 | 28.5px | 21.7px | 1 | 528px | 72px |
| 1280x800 | — | 28px | 1 | 250px | — |
| 1024x768 | — | 22.5px | 1 | 161px | — |
| 768x1024 | 17px | 17px | 1 | 194px | — |
| 767x1024 | 17px | 17px | 2 (by design) | — | — |
| 375x812 | 18px | 17px | 2 (by design) | 30px | 282px |
| 320x568 | 18px | 17px | 3 (by design) | 6px | 123px |

---

## Round 5 — 19 October 2026 (follow-up)

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 5.1 | Counter reads 24.000, should be 24,000 | ✅ | `lib/format.ts` |
| 5.2 | Remove the lines between the stats | ✅ | `CounterSlider.tsx`, `CounterRow.tsx` |
| 5.3 | Remove "Available now" wherever it appears | ✅ | `pages/CapabilityPage.tsx` |
| 5.4 | AINerve: add the five AI Governance modules | ✅ | `content/products.ts`, `pages/ProductPage.tsx` |
| 5.5 | AINerve: add the agentic workflows | ✅ | as above |
| 5.6 | AINerve: replace Cost Efficiency with 100% On-Prem Data Processing | ✅ | `content/products.ts`, `content/home.ts` |
| 5.7 | Find a Partner: proper dropdown back, with a search bar | ✅ | `components/content/SearchableSelect.tsx` (new) |
| 5.8 | Check page URLs against datagateways.net | ✅ | `App.tsx` + four content files |

**5.1.** My fault, introduced in round 4. `parseCounter` swapped the comma for a dot before
parsing, so `24,000+` was read as twenty-four point zero zero zero and animated to "24.000" — the
right digits with the wrong meaning. The parser now matches the grouped part separately from the
fractional part, so either spelling (`24000+` or `24,000+`) renders `24,000`. Four regression
tests added; verified against every counter value on the site.

**5.2.** The hairline rules between figures were added in round 4 and removed again here, in the
slider and in `CounterRow` so the two counter presentations still match. The label-depth
reservation stays — that is what actually levels the row.

**5.3.** The availability pill is gone from all three capability pages. `status` stays on the
content objects (it is still true, and DLP states its date in the callout) but nothing renders it.

**5.4 / 5.5.** Two new sections between Defence and Gateway. The five modules are numbered,
because they are controls a prompt passes through in order. The fifteen agents are a plain
divided list rather than cards — **no blurbs were written for either.** The brief gave names
only, and a sentence invented here would read as an approved product claim.

**5.6.** Replaced on the AINerve page **and** in the homepage counter band, which carried the
same "30 to 50% Cost Efficiency Gain" figure — leaving it would have the two pages stating
different things about the same product.

**5.7.** A new `SearchableSelect`: closed it reads and announces like a select, open it shows a
search field above the options. A native `<select>` cannot hold a search field and 249 countries
is not a list to scroll. Escape closes and returns focus, clicking outside closes, the search
field takes focus on open, and the options carry `listbox`/`option` roles with `aria-selected`.
Verified: 250 options, search field present, filtering works.

**5.8 — URL check.** `datagateways.net` is already serving this build (the asset hashes match).
All sixteen routes resolve there. Two differ:

| Our route | Live site | Action |
| --- | --- | --- |
| `/partners/become` | **301 →** `/partners/become-partner` | **Changed.** The app now serves `/partners/become-partner` and redirects the old path |
| `/partners/login` | **302 →** `https://partner.datagateways.net/login` | **Not changed — needs your decision.** See below |

The become-partner change mattered for more than tidiness: the page declared
`/partners/become` as its canonical URL, and that URL 301s elsewhere — a page telling search
engines its canonical address is one that redirects away.

> **`/partners/login` is left alone deliberately.** The host already redirects it to
> `partner.datagateways.net`, so production behaviour is correct today whatever the app does.
> Pointing the nav at another subdomain in-app is an authentication decision rather than a URL
> correction, and if that redirect is a temporary arrangement, hard-coding it here would outlast
> it. Say the word and it is one line.

---

## Round 4 — 19 October 2026 (management email)

Every numbered point from the email, with what was done.

### 1. Homepage

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 1.1 | First card shows outdated content; replace with the supplied DataNerve sentence | ✅ | `apps/web/src/content/home.ts` — `hero.slides[0].blurb` |
| 1.2 | Adjust spacing and alignment of the counters in the blue slider | ✅ | `components/content/CounterSlider.tsx`, `components/content/Counter.tsx` |
| 1.3 | Counter order: detectors, regions, countries, interpreters | ✅ | `content/home.ts` — `counters.groups[0].items` |
| 1.4 | List Regions before Countries | ✅ | satisfied by 1.3 — Regions is 2nd, Countries 3rd |
| 1.5 | Improve the presentation of the program outcomes | ✅ | `pages/CapabilityPage.tsx`, `content/site.ts` |

**1.1 — first card.** Applied to the **hero slider's first card**, the first card on the page. Its
blurb had been shortened on 12 October to level the card heights; that trim is almost certainly
the reversion the email refers to, so the supplied copy is now authoritative and the layout
accommodates it rather than the other way round.

> If "first card" meant the **DataNerve card in Our Products** further down the page instead, it
> is a one-line move — say so and it moves.

**1.2 — counters.** The figures floated in a bare grid and the labels wrapped to different depths,
so the row ended on a ragged edge and the band changed height as it rotated. Labels now reserve
two lines and the columns are divided by hairlines, matching the `CounterRow` treatment used
elsewhere so the two counter presentations read as one component. Verified: four cells on one
row, every label exactly 42px, dividers present.

**1.3 — counter order.** Now `90+ Data Quality Detectors`, `9+ Regions Covered`,
`250 Countries & Territories`, `24,000+ Predefined Interpreters`. The interpreter figure was
`24000+` and is now written `24,000+` as the email writes it. Existing label wording was kept —
the instruction was about order.

**1.5 — program outcomes.** This block lives on the capability pages (Data Governance and the
others), not the homepage; it is the only thing on the site by that name. It was a transparent box
carrying 8 units of padding, so the label and the sentence sat at different left edges with
nothing to justify the inset. It now has a real surface and the same accent rule as the DSPM
executive point and the compliance notes, so the three read as one device. Its label moved out of
the component and into `site.ui.programOutcome`, per the project's no-strings-in-JSX rule.

### 2. Products and Data Governance

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 2.1 | Correct alignment and spacing on the Data Governance page | ✅ | `pages/CapabilityPage.tsx`, `content/capabilities.ts` |
| 2.2 | Remove the "Coming Soon" label from DSPM | ✅ | `content/capabilities.ts`, `content/products.ts` |

**2.1.** Headings and section padding were already consistent (all at the 80px gutter, all 88px).
The real faults were two bands in a row sharing a tone — `management` and `data-quality` both
light — which merged into one two-thousand-pixel stretch with nothing marking where one subject
ended and the next began; and the `maturity` section repeating the `Data Governance` eyebrow the
`management` band two sections earlier already used, so the page appeared to restate itself.
`data-quality` is now grey (the one tone that collides with neither neighbour) and the maturity
eyebrow reads `Assessment and roadmap`. **Verified: no two adjacent sections share a tone, on
Data Governance or DSPM.** The same collision existed on DSPM between `modules` and
`risk-posture` and was fixed at the same time.

**2.2.** Removed in both places it appeared: the status badge on the DSPM page
(`status: 'Coming soon'` → `'Available now'`) and the card tag on the Products page
(`tag: 'Coming soon'` → the capability name). **Verified: the string no longer appears anywhere
in the content layer.**

> The email's earlier draft also asked to move Governance Maturity from DataNerve to DSPM. That
> point is **not** in the final email and has **not** been actioned.

### 3. About Us

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 3.1 | Correct heading styles, font sizes, spacing, alignment | ✅ | `pages/AboutPage.tsx`, `content/about.ts` |
| 3.2 | Two columns, working at all screen sizes | ✅ | `pages/AboutPage.tsx` |
| 3.3 | Consistent heading and text structure throughout | ✅ | as above |

The page was genuinely inconsistent with the rest of the site, in three specific ways:

- The vision band rendered **two stacked headings** — an `h2` reading "Our Vision" directly above
  an `h3` saying much the same thing — while the eyebrow the content already carried went unused.
- That `"Our" / "Vision"` was **hardcoded in the component**, which breaks this project's own rule
  that no user-visible string lives in JSX.
- One band was centred and the other was not, so neither matched the twelve-column heading-left /
  body-right split every other section on the site uses.

All three are fixed. Both bands now use `grid lg:grid-cols-12` with the heading in the left five
and the body in the right six, collapsing to a single column below `lg`. One eyebrow and one
heading per section. The story heading is split across the two inks like every other heading
(`About` / `us`) rather than being set entirely in the primary ink. **Verified: two `h2`s, no
stray `h3`, both grids twelve columns.**

### 4. Pending items

| # | Request | Done | Where |
| --- | --- | --- | --- |
| 4.1 | Add the DLP date (April 2027) | ✅ | `content/capabilities.ts` — `dlp.callout` |
| 4.2 | "Four Report Depths, One Source Of Truth" → "Reporting" | ✅ | `content/capabilities.ts` — `governance.grid.heading` |
| 4.3 | SOCMINT hero heading on two lines, proper spacing | ✅ | `components/primitives/HeroHeading.tsx`, `components/media/HeroShell.tsx` |
| 4.4 | Find a Partner: all countries, searchable; same for regions | ✅ | `pages/PartnerFindPage.tsx`, `content/countries.ts` (new) |
| 4.5 | Find a Partner: remove Bronze and General from cards | ✅ | `pages/PartnerFindPage.tsx` |
| 4.6 | Adjust hero section heights on all pages | ✅ | `components/media/HeroShell.tsx` |

**4.1.** The DLP callout renders in date-only mode, which showed the figure alone — "April 2027"
with nothing explaining it. `StatCallout` now lets a short caption through in that mode, so it
reads "April 2027 / Planned availability for Data Loss Prevention."

**4.3 — and every other hero.** Stacked heroes wrapped wherever the 12-character measure ran out,
so the same two-part headline broke after a different word on every page; SOCMINT's came out over
several ragged lines. `HeroHeading` now breaks at the roman/accent seam, which is the split the
whole type system is built around, and the measure widened to 26 characters so neither half wraps
early. The longest half in the entire site is 30 characters, so **every** inner hero is now
exactly two lines. Verified on SOCMINT, DSPM and About.

**4.4.** The country list was derived from the partners the API returned, so it offered one
country and read as broken even though it was accurate. It is now the full ISO 3166 list — 249
countries, generated into `content/countries.ts` — with countries that actually have a partner
floated to the top. Both controls changed from `<select>` to a text input backed by a `<datalist>`,
which is searchable in every current browser and needs no new dependency. Matching is by
substring, so a partial entry narrows rather than emptying the directory. **Verified: 258 options
across the two lists, Pakistan and Switzerland both present, both inputs searchable.**

**4.5.** The tier badge is gone — a badge that only ever reads "Bronze" ranks your own partners in
public for no benefit. The region moved into the space it left. `focusArea` is hidden when it
reads "General" (the backend's placeholder) and still shown when it says something real.

**4.6.** `62svh` → `58svh` for inner pages and `92svh` → `74svh` for the full heroes. Both are
floors, not fixed heights, so a long headline still grows its own hero rather than overflowing it.

### 5. Preventing reversion

See **How changes are protected** below.

---

## Rounds 1–3 — 10 to 13 October 2026

Summarised; the full detail is in `docs/ANALYTICS.md`, `docs/ANALYTICS-WALKTHROUGH.md` and
`docs/PROJECT-LOG.md`.

| Date | Change |
| --- | --- |
| 13 Oct | Partner directory appeared stuck on a previous filter — results returned to the DOM invisible because they mounted into a finished reveal animation. Each card now reveals itself |
| 12 Oct | Hero cards: duplicate subheading removed, heights levelled open and closed, blurbs given a six-line budget |
| 12 Oct | DSPM page: three sections added from the Unified Risk deck — unified risk posture, evidence assurance, compliance and control mapping |
| 12 Oct | Consent popup removed from first load at the client's request; analytics now runs by default. **This weakened the GDPR position — see `docs/PRE-LAUNCH-SIGNOFF.md`** |
| 12 Oct | Large-screen layout: the shell was capped at 1440px, leaving 560px of dead space each side on a 2560px monitor. Now steps to 1840px |
| 12 Oct | Analytics measurement ID changed to `G-YEG8CLH6T0`; consent button relabelled "Accept cookies" |
| 10–12 Oct | Google Analytics 4 integrated, then routed through `react-ga4`; GitHub Pages deployment built |

---

## How changes are protected

The 19 October email asks that approved work stop being undone. Four things are in place.

**1. Every change is committed with the reason.** Nothing is edited in place and forgotten. The
commit messages say what was changed and why, so a later edit that would undo one is visible in
the history rather than discovered on the live site.

**2. The site has a test suite — 151 tests.** It runs before every change is committed. It covers
the things that silently regress: every navigation link resolving, the partner directory returning
all results when a filter is cleared, the contact form's branching, the consent banner's behaviour,
and the heading invariant below.

**3. Two invariants are enforced by reading the source, not by rendering.** A test walks every
file and fails if a heading bypasses `SplitHeading`, or if a page is added without the shell that
reports it to analytics. These catch a regression on a page nobody thought to write a test for —
which is exactly how the earlier reversions went unnoticed.

**4. Copy lives in content files, not in components.** Every user-visible string sits in
`apps/web/src/content/*.ts`. A copy change is a one-line edit to a data file, which is far harder
to lose under a layout change than a sentence buried in JSX. Two strings were found violating this
rule during this round and moved out.

### Known issues, carried forward

| Issue | Status |
| --- | --- |
| One test fails: a heading in `ServicePage.tsx` bypasses `SplitHeading` | **Pre-existing**, predates all of this work. Fixing it means deciding where the two-tone split falls, which is a copy decision |
| One lint error in `NavDropdown.tsx:115` | **Pre-existing** |
| Privacy policy does not name Google Analytics | **Blocks the next deploy.** Drafted wording awaiting counsel — `docs/ANALYTICS.md` §8 |
| No consent is requested before cookies are set | Deliberate client decision, 12 Oct. Recorded in `docs/PRE-LAUNCH-SIGNOFF.md` |
| DSPM lead paragraph contains typos (`classififcation`, `remidiations`, `Ai`, missing spaces) | Supplied verbatim by the client and applied as given. Corrected version available on request |
| Compliance table names GDPR, Saudi PDPL, HIPAA, PCI DSS | Needs legal sign-off — `docs/PRE-LAUNCH-SIGNOFF.md` §8 |

### Verification run for this round

- **155 tests** (16 API, 139 web) — 1 failure, the pre-existing one above
- **0 TypeScript errors**
- **Lint unchanged** — 1 error, 1 warning, both pre-existing
- **Production build clean**
- Checked in a browser at 1440×900 on Home, Data Governance, DSPM, DLP, SOCMINT, About and Find a
  Partner
- Round 6 additionally measured the hero at ten viewports from 1920×1080 down to 320×568 — see the
  table in that entry
- Round 7 swept all 16 routes at nine viewports from 320×568 to 2560×1440: no horizontal page
  scroll anywhere, and the four defects it found are fixed and re-verified
