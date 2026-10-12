# Pre-launch sign-off register — DataGateways

**Last updated:** 10 October 2026

Everything on this site that reads as fact but has not been confirmed by the client.

## Why this file exists

The site was originally built with every unverified value wrapped in `flag.placeholder()` or
`flag.confirm()`, which rendered a dashed `PLACEHOLDER` outline in development and produced
[`PLACEHOLDERS.md`](PLACEHOLDERS.md) mechanically. On 23 September 2026 the client asked for those
outlines removed and the drafted values written out, so the site reads as a finished product rather
than a wireframe.

That request was reasonable and has been carried out. It does, however, mean the code no longer
carries the markers, so `PLACEHOLDERS.md` reports close to zero entries — **that is not the same as
everything being verified**. This file is the record that survived the change, and it is maintained
by hand.

> **Nothing below should go in front of the public until the owning column has signed it off.**

---

## What the 30 September content rebuild cleared

Recorded so nobody re-audits work that is already done. Sources: the **DataNerve customer
presentation v1.5**, the **SOCMINT/OSINT briefing**, and the live **datagateways.net** pages
(`/`, `/company`, `/datanerve`, `/ainerve`, `/dspm`, `/soc-mint`, `/find-partner`,
`/become-partner`).

- **Invented metrics are gone.** `40+ Enterprise Customers`, `12+ Billion Records Secured`,
  `500+ Million Prompts Inspected`, `99.99% Uptime`, `48+ Engineers on Staff`,
  `9+ Deployment Regions`, `12+ Compliance Frameworks` and `73+ Supported Integrations` have all
  been replaced by figures from the client's own decks. See §2 for what is there now.
- **The three fabricated integration grids are gone** — 31 DataNerve, 24 AINerve and 18 SOCMINT
  third-party product names, none of them confirmed. The `IntegrationGrid` component and the
  `IntegrationsSection` / `IntegrationTile` types were deleted with them, so the section cannot
  come back by accident.
- **SOCMINT is no longer inferred from its name.** The whole page is now written from the client's
  OSINT briefing deck and their own `/soc-mint` page.
- **Contact details are real** — Texas, USA, `info@datagateways.net`, `+1 (872) 284-2859` — and
  replace the drafted London address and the deliberately unreachable Ofcom-range phone number.

---

## 1. Framework and compliance claims — legal sign-off required

The site no longer claims any certification it holds. What it does claim is **alignment and control
mapping**, which is a weaker and more defensible statement, and every instance is taken from the
client's own material.

| Claim | Where | Needs |
| --- | --- | --- |
| DAMA-DMBOK, DCAM, CMMI alignment | DataNerve showcase, Governance modules | Product team confirms the mapping ships |
| NIST CSF, NIST SP 800-53, ISO 27001, CIS, COBIT, PCI DSS, HIPAA control mapping | DataNerve showcase, Governance `Security Programme` | Confirm which are configured by default and which on request |
| GDPR, Saudi PDPL, HIPAA, PCI DSS compliance mapping | DSPM showcase | Confirm scope; the page already states it is evidence-based and not a legal certification |
| SAMA and regional expectations | DataNerve showcase | Confirm |
| **EU AI Act high-risk conformance support** | AINerve `Evidence` tier | **Still carries `flag.confirm()`.** The only claim on the site under an active marker |

- [ ] Legal confirms each mapping claim
- [ ] Anything without a confirmed mapping is **deleted**, not softened

---

## 2. Metrics — from the client's decks, still to be confirmed as publishable

Every figure below is quoted from client material rather than drafted. What is outstanding is
whether the client is willing to publish it, not whether it was invented.

| Value | Label | Source | Where |
| --- | --- | --- | --- |
| `24,104+` | Predefined interpreters | DataNerve deck, slide 29 | home counters, DataNerve, DSPM |
| `250` | Countries & territories | DataNerve deck, slide 29 | home counters, DataNerve, About |
| `9` | Regions covered | DataNerve deck, slide 29 | DSPM |
| `8+` | Sensitive data domains | DataNerve deck, slide 29 | DSPM |
| `90+` | Data quality detectors | DataNerve deck, slide 19 | home counters, DataNerve, Governance |
| `400+` | Dashboard widgets | DataNerve deck, slide 24 | home counters, DataNerve, Governance |
| `8` | Licensable modules | DataNerve deck, slide 48 | DataNerve, Governance, About |
| `3` | Deployment models | DataNerve deck, slide 47 | Products, About |
| `5+` / `15+` / `30–50%` / `<3s` | AINerve modules, workflows, cost efficiency, response time | Client brief, 30 Sept | home counters, switcher, AINerve |
| `<3s` / `15+` / `500M+` | SOCMINT response time, platforms, records | Client brief, 30 Sept | home counters, switcher, SOCMINT |
| `80%` | Governance initiatives predicted to fail by 2027 | **Gartner press release, 28 February 2024** — cited on the page | Governance callout |

- [ ] Client confirms each figure is publishable
- [ ] Marketing confirms the Gartner citation is licensed for use on a public page

**Two figures the client changed on 30 September that the decks do not support as written:**

- **`9+ Regions Covered`** on the home counter band. Slide 29 of the DataNerve deck says `9`, not
  `9+`. The plus claims a tenth region that no source names. Either the deck is out of date or the
  plus should go.
- **`24,000+ Predefined Interpreters`** on the home counter band, where the deck says `24,104+`.
  Rounding down a `+` figure is safe, and the product and DSPM pages still carry the exact number —
  a rounded headline over an exact detail page is a deliberate pattern, not a mismatch. Noted so
  nobody "fixes" one to match the other without knowing which way round it should go.

**Response time was `2–5s` for AINerve and `1–3s` for SOCMINT and is now `<3s` for both.** That
came from the client on 30 September and has been applied to every place each claim appears — the
counter band, the product switcher, both product pages, and the AI hero slide, which had it written
out in prose as "two to five seconds". A figure stated two ways on one site is worse than either.

**Not carried over from the live site, deliberately.** `datagateways.net/ainerve` currently
publishes `sub-2ms prompt evaluation`, `99.94% defense rate`, `1.2ms routing latency` and
`25+ model providers`. These are precise engineering claims that conflict with the `2–5s` response
time in the client brief, so none of them were brought across. If they are real, they should
replace the brief's figures rather than sit alongside them.

---

## 3. Product roadmap dates — three sources disagree

This needs resolving before launch, because the site states a date on the home page, the DataNerve
page and the DSPM page.

| Capability | Client brief (30 Sept) | DataNerve deck, slide 46 | Live datagateways.net/dspm |
| --- | --- | --- | --- |
| Governance | Available now | Available | Available |
| DSPM | **Launching 1 October** | Available | **Coming November 2026** |
| DLP | — | **April 2027** | November 2026 (full-estate coverage) |

The site currently follows the client brief for DSPM (`Launching 1 October`) and the deck for DLP
(`April 2027`, carried in the DLP page callout with an explicit "dates to be confirmed" note).

- [ ] Product team settles the real dates and the site is updated in one pass
- [ ] `content/home.ts` launch article dates (`2026-09-01`, `2026-10-01`, `2026-10-15`) follow them

---

## 4. Partner directory — entirely fictional

The nine organisations in the `Find a Partner` directory
([partners.ts](../apps/web/src/content/partners.ts)) are **invented**, along with their tiers and
specialisms. Their regions were remapped on 30 September to the client's own taxonomy (Africa,
Asia, Europe, Global, Latin America & Caribbean, Middle East, North America, Oceania, South
America), which makes the filter real but does nothing about the listings.

This is the highest-risk item on the site: naming a company as a certified partner when it is not
is a claim about a third party, not just about DataGateways.

- [ ] Replace with the real partner list, with each partner's written permission to be listed
- [ ] Or cut the directory and leave the page as a "contact us for a referral" panel

The `Become a Partner` form beside it is real and working — it posts through the contact API on the
`partner` branch and returns a reference number. Its field set matches the client's own
`become-partner` page.

---

## 5. Remaining product capability claims

Written as plain statements, sourced from the client's material, but never independently verified:

- [ ] The AINerve capability set as a whole — the gateway, policy engine, routing, streaming
      de-identification and agentic workflows are described from the live `/ainerve` page and the
      client brief; nobody on this side has seen the product
- [ ] DataNerve source-family support (SQL Server, PostgreSQL, MySQL/MariaDB, Oracle, MongoDB, S3,
      Azure Blob, GCS, SharePoint, OneDrive, Teams, Google Drive). The DSPM page already states
      these are validated during proof of value, which is the deck's own wording
- [ ] SOCMINT platform coverage — the named platforms plus "a further 30 to 40 mobile applications
      searched in context" is the client's own claim from `/soc-mint`

---

## 6. Other

- [x] **The four contact mailboxes were on the wrong domain.** `sales@`, `partners@`, `support@`
      and `careers@data-gateways.com` — the client's domain is `datagateways.net`, so all four
      reached nobody, and all four were marked `flag.verified()`. The contact page now publishes
      `info@datagateways.net`, the one address the live site carries, and the enquiry type is
      routed in the message body instead. **If the client has real per-team mailboxes, they go
      back in; until then one working address beats four that bounce.**
- [ ] **Partner portal login has no authentication behind it.** The form at `/partners/login`
      renders and states plainly on the page that the portal is not connected; submitting sends
      nothing anywhere, and autofill is disabled on the password field so no manager can put a real
      credential into a dead form. Wire it to the real IdP and delete the notice in one change.
- [ ] **The hero footage now loads on phones**, at the client's request, where it was withheld
      below 768px. That is 2.8MB (WebM) or 3.0MB (MP4) on a mobile connection, after the poster
      has already painted. A visitor on Data Saver or a connection the browser rates 2G or slower
      still gets the poster and no download, which is the case the width rule was really
      protecting. If mobile data turns out to matter more than the motion does, the honest fix is
      a short, small, phone-sized encode rather than reinstating a breakpoint.
- [ ] Customer logo marquee still shows sector labels, not customer logos. The real set needs
      written permission per logo.
- [ ] **`img-partner-certified.jpg` was supplied at 612x286.** The showcase frame is 4:3, so the
      crop leaves 381px of usable width against the ~1200px the frame wants on a retina screen —
      it is visibly soft. Every other supplied image clears it. A full-size version of the same
      shot is the only fix; upscaling adds bytes and no detail.
- [ ] The three DataNerve capability showcases (Governance, DSPM, DLP) still run generated plates.
      No client photography was supplied for them.
- [ ] Three launch items on the home page carry drafted headlines and dates.
- [ ] Real logo SVG to replace the letterspaced wordmark.
- [ ] Six footer-linked pages are still unbuilt: `/careers`, `/security`, `/status`, `/docs`,
      `/privacy`, `/terms`. They are held in the `PENDING_PAGES` allowlist in
      `content/navigation.test.ts`, which fails if one is forgotten.
- [ ] **Heading case.** Every heading on this build is uppercase, following dtv.sa. Forcepoint and
      the client's own datagateways.net both set headings in sentence case. The two references
      pull in opposite directions and nobody has decided which wins.
- [ ] The service pages are now rebuilt from `datagateways.net/data-services` and `/ai-services`
      — three data services and five AI services, each with the four capabilities the client's own
      pages list. The **engagement phases are no longer dated**: the previous draft quoted a week
      count against each one and nobody on the delivery side had ever quoted them. If real
      durations exist, `EngagementPhase.duration` is still there and the page renders it.

---

## 7. Analytics and cookies — added 10 October 2026

> **Changed 10 October 2026: this section is no longer hypothetical.** The client supplied
> measurement ID `G-YEG8CLH6T0` (set 12 October, replacing `G-G9BBDT5TQV`) and it is set in
> `.env.production`. **The next production deploy
> loads Google Analytics and shows the consent banner to real visitors.** The first item below
> was a checklist entry while the variable was empty; it is now a blocker.

Development is unaffected and cannot reach the property — `npm run dev` does not read
`.env.production`, verified. Clearing `VITE_GA_MEASUREMENT_ID` turns the whole integration,
banner included, back off.

| Item | Owner | Why it is here |
| --- | --- | --- |
| 🔴 **The privacy policy does not mention Google Analytics** — *blocking the next deploy* | Legal | §3b of `privacy-policy.md` has generic cookie language but does not name the processor, the cookies or their lifetimes, which GDPR Art. 13 expects. Drafted wording is ready in [`ANALYTICS.md`](ANALYTICS.md) §8 — **it has deliberately not been pasted into the policy**, because that is counsel's text, not this repo's |
| **Advanced vs basic consent mode** | Legal | `gtag.js` currently loads before a choice is made and sends cookieless pings. Google's own recommended setup, and defensible because nothing is stored — but if counsel wants nothing reaching Google pre-consent, the change is three lines. [`ANALYTICS.md`](ANALYTICS.md) §4.2 |
| **Google as a processor** | Legal / Ops | GA4 transfers to the US. Needs adding to the record of processing activities, and the Google data-processing terms accepting in the account |
| **GA4 property configuration** | Ops | Data retention defaults to 2 months and is not retroactive; Google Signals should be off; thirteen custom dimensions must be registered *before* launch, as they are not backfilled. Checklist in [`ANALYTICS.md`](ANALYTICS.md) §8 |
| **Banner copy** | Legal / Client | `src/content/consent.ts`. It currently promises "nothing is shared with advertisers", which is true of the implementation and must stay true if any advertising tag is ever added |

> The implementation itself is finished and tested — these are account, policy and legal items,
> not code. The deploy-blocking one is the privacy policy: everything else can be corrected after
> launch without a visitor having been misinformed.

---

## Restoring the markers

The `flag` system is still in place and nothing about it was removed. To put a value back under the
register, wrap it again:

```ts
value: flag.confirm('40+', 'Client to supply the real customer count.'),
```

Then run `npm run docs:placeholders`. The dashed development outline and the
[`PLACEHOLDERS.md`](PLACEHOLDERS.md) row both come back automatically.
