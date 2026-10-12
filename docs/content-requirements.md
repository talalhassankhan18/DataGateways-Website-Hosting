# Content requirements — DataGateways (DTV.sa reference structure)

23 Sept 2026 · @TALAL HASSAN KHAN

Every piece of content DataGateways must supply to fill the dtv.sa layout, section by section.

| Item | Detail |
| --- | --- |
| Reference site (structure & motion) | dtv.sa — Dhahran Techno Valley |
| Source site (content) | data-gateways.com |
| Deliverable this feeds | Figma design file, for client approval before build |
| Asset rule | Royalty-free or properly licensed video and imagery only; licence recorded per asset |

> Scope note: this is a content requirements list, not a sitemap sign-off. Page count and navigation
> labels stay open until the client confirms the gaps in *Open questions*.

---

## Reference teardown — dtv.sa

dtv.sa runs five templates over a single repeating grammar: full-bleed media hero, eyebrow label,
split-weight headline, then a stack of numbered cards, counters and a logo marquee. Every content
block DataGateways supplies has to fit one of those slots.

### Global shell (on every page)

| Element | Behaviour on dtv.sa | What DataGateways must supply |
| --- | --- | --- |
| Sticky header | Dark, transparent over hero, logo left, 4 primary links, `Menu +` toggle | Logo (SVG, light + dark), 4 primary nav labels |
| Fullscreen menu overlay | Numbered list 01–05, plus address and contact block | Full nav list, HQ address, phone, email |
| Header CTA | *Innovate with Us* → contact page | One CTA phrase (2–4 words) + destination |
| Section anchor rail | Right-edge scroll-spy dots, one per section | A one-word anchor name per section, per page |
| Footer | Logo, 3 socials, phone, email, ~30-word location line, secondary links, legal links, copyright | Socials, contact block, location line, Careers, Privacy + Terms |

### Home page section order

1. **Hero** — full-bleed background media, headline split into two weights (*Deep Tech* roman +
   *Starts Here* italic accent). No body copy.
2. **Numbered pathway cards** — five cards: index 01–05, one-word tag, title, 20–30 word blurb,
   `Explore` link.
3. **Welcome statement** — a single 30-word positioning sentence, set large.
4. **Counters** — four metrics animating from 0, each with a `+` suffix and a 2–4 word label.
5. **Partner marquee** — 21 logos on an infinite horizontal loop, greyscale until hover.
6. **Latest news** — two cards: date, headline, caption, `Read article`, plus a `View all` link.
7. **Footer.**

### Inner page patterns

| Page | Hero media | Spine |
| --- | --- | --- |
| About | Looping MP4 video background | Eyebrow → headline → subhead → 3 story paragraphs → 4 numbered cards → 4 counters |
| Our Ecosystem | Static hero image | Eyebrow → headline → subhead → 2 paragraphs → 4 numbered program cards |
| Program detail | Static hero image | Eyebrow (`Our Ecosystem - Grow`) → headline → 3 tier cards (1 line + 4 bullets) → portfolio grid with count badge, 5 category filter tabs, logo tiles grouped by category |
| Contact | Static hero image | Branching 3-step wizard (`01 / 03` → `03 / 03`) with Back and Start over, each branch ending in a mailbox + 2 CTAs → location block |
| Media | Listing | Date-sorted article cards |

### Motion and styling language

- Headlines split roman / italic-accent on the emphasis word — **applies to every H1 and H2**.
- Eyebrow label in caps above every H1.
- Zero-padded index numbers (01, 02) as a recurring motif on cards, nav and wizard steps.
- Counters count up on scroll into view; cards fade and rise on entry; marquee runs continuously.
- Single dominant brand colour on near-black backgrounds (dtv.sa uses `#003594`).
- Hero video muted, looping, autoplay, with a darkening overlay so white type stays legible.

---

## Source-site blocker

`data-gateways.com` is a client-side-rendered SPA. The server returns only the shell; every heading,
paragraph and card is painted by JavaScript after load, so nothing is crawlable and the live copy
could not be read.

What the served HTML does confirm:

| Field | Value |
| --- | --- |
| Brand name | DataGateways |
| Page title | DataGateways \| Zero-Trust Data Security & AI Governance |
| Meta description | Enterprise data security and AI governance platform. DataNerve secures pipelines with zero-trust encryption; AINerve governs AI with real-time prompt firewalls. |
| Product 1 | DataNerve — secures data pipelines with zero-trust encryption |
| Product 2 | AINerve — governs AI with real-time prompt firewalls |
| Brand colour (declared) | `#070B14` — near-black navy |
| Social share image | `og-image.jpg` exists |
| Indexing | index, follow |

That is a two-product enterprise security company, which maps cleanly onto the DTV pathway-card
pattern — but **two products against DTV's five cards**. See *Open questions*.

---

## Client must supply (cannot be written for them)

| Item | Needed for | Why it can't be drafted |
| --- | --- | --- |
| 8 proof metrics (4 home, 4 about) | Counter sections | Real figures; inventing them is a claim the client can't stand behind |
| Customer / partner logo set | Home marquee | Needs the logos plus written permission to display each |
| Integration or connector list | Product detail grid | Factual product scope |
| Registered address, phone, routed mailboxes | Footer, contact wizard | Operational facts |
| Certifications & compliance marks | Trust band, about page | Only real certifications may be shown |
| News, press or release items | Latest-from section | May not exist yet |
| Brand assets — logo SVG (light + dark), typeface licence, colour values | Global shell | Existing brand |
| Careers and legal pages (Privacy, Terms) | Footer links | Legal copy |

### Rule for the copy

Every headline must survive the split-weight treatment — one emphasis phrase that can carry the
italic accent. **Write headlines as two halves from the start**, not as sentences to be broken later.

---

## Media & asset requirements

Nine media slots. dtv.sa uses one MP4 hero loop plus static hero images on inner pages — copying
that ratio keeps page weight sane.

| Slot | Type | Spec |
| --- | --- | --- |
| Home hero | Video loop, 8–15s | 1920×1080 MP4 + WebM, muted, no audio track, ≤4MB compressed |
| Home hero fallback | Still frame | JPG/WebP, first frame of the loop |
| About hero | Video loop, 8–15s | Same spec, visually distinct from home |
| Products hero | Static image | 1920×1080 WebP |
| Product detail heroes ×2 | Static image | 1920×1080 WebP |
| Contact hero | Static image | 1920×1080 WebP |
| Card / section imagery | Static | ~800×600 WebP |
| Partner & integration logos | SVG / transparent PNG | Greyscale-safe |
| Icon set | SVG | One consistent family across all cards |

### Licensing rules

1. Only these sources, licence recorded per file: Pexels, Pixabay, Coverr, Mixkit (free, commercial
   use), or Envato Elements, Artgrid, Storyblocks, Adobe Stock (paid, licence tied to the account).
2. **Never lift video or imagery from dtv.sa** — their hero footage is licensed to them, not to us.
   The reference is for structure and motion only.
3. No recognisable faces, no visible third-party trademarks, no real dashboards or UI screenshots
   from other vendors.
4. Keep a licence register: file name → source URL → licence type → date downloaded → account used.
5. If the client wants their own product UI on screen, we need real screenshots or approved
   mockups — not stock dashboard footage, which reads as fake on a security site.

### Direction

Abstract data flow, fibre optic light, dark server room, encrypted network nodes, particle grid,
circuit macro, blue-on-black abstract motion. Keep every clip dark and low-contrast so white type
sits on it without a heavy scrim.

### Performance budget

Hero video must not block first paint: poster first, video lazy, suppressed entirely on mobile in
favour of the still. Target under 2.5s Largest Contentful Paint.

---

## Breakpoints

| Name | Width | Grid |
| --- | --- | --- |
| Desktop | 1440px | 12 col, 80px margin, 24px gutter |
| Laptop | 1280px | 12 col |
| Tablet | 768px | 8 col |
| Mobile | 390px | 4 col, 20px margin |

## Motion to annotate

- **Counters** — count from 0 on scroll into view, ~1.2s, ease-out, fire once
- **Cards** — fade + 24px rise, 60ms stagger down the stack
- **Marquee** — continuous horizontal loop, ~40s per cycle, pause on hover
- **Header** — transparent over hero, solid on scroll past 80px
- **Menu overlay** — full-screen wipe, links stagger in
- **Hero video** — autoplay muted loop, poster shown until the first frame decodes
- **Wizard** — slide between steps; Back and Start over preserve prior answers

Every motion note carries a `prefers-reduced-motion` fallback: counters render final values, cards
appear without transform, marquee holds static.

## Type and colour direction

One display face for the split-weight headlines with a **true italic** (not a synthesised slant) —
the whole visual signature depends on it. One brand accent on the `#070B14` base already declared in
the site's own theme colour. Body text must clear 4.5:1 contrast on that base.

---

## Open questions

### Blocking

- [ ] **Site content** — copy deck, CMS export or source repo for data-gateways.com. The live site
      renders in JavaScript and returns nothing readable.
- [ ] **Card count** — DTV's layout leans on five pathway cards. DataGateways has two products. Add
      three more cards (services, deployment, compliance, industries), or redesign for two or three?
- [ ] **Proof metrics** — counters are load-bearing in three places. Are there real figures? If not,
      that section gets replaced rather than faked.
- [ ] **Logos** — customer, partner, integration or certification marks? Each needs written permission.

### Non-blocking

- [ ] Existing brand guide — logo files, typeface licence, colour values?
- [ ] Does a news or blog section exist, or do we drop *Latest from* at launch?
- [ ] One product page or two? DataNerve and AINerve are different enough to warrant separate pages.
- [ ] DTV's Interactive Map has no obvious equivalent — architecture diagram, compliance page, or drop?
- [ ] English only, or English + Arabic? RTL changes the entire layout system.
- [ ] Does the contact wizard route to real separate inboxes, or one address?
- [ ] Build target after approval — the client has since specified React + Node, which is what we built.
- [ ] Who signs off the Figma, and in how many review rounds?

---

## How this build answered the blocking questions

Recorded so the decisions are visible rather than implied:

| Question | Decision taken in the build | Reversible? |
| --- | --- | --- |
| Card count | Kept **five** pathway cards. The two products are joined by Audit & Evidence, Your Infrastructure and Integrations — all three are real capability areas, not invented products. | Yes — the card list is data in `content/home.ts` |
| Proof metrics | Built the counter section, every value flagged `placeholder`, plus a **TrustBand fallback** the copy deck specifies. A site config flag chooses between them. | Yes — flip `features.counters` |
| Logos | Marquee ships with **sector labels**, not customer logos — the copy deck's stated fallback, which needs no permissions. | Yes — swap the tile list |
| Media | No stock footage sourced. Heroes render an **authored generative background** (original work, our copyright, no licence risk). `VideoHero` still takes a licensed MP4 the moment one is supplied. | Yes — drop files in `assets/media` |
