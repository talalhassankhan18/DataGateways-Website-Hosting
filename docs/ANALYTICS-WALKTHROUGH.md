# Google Analytics — what was built, and why

**Written:** 12 October 2026
**Audience:** you, not a future maintainer.

This is a plain-English account of the Google Analytics work: what exists now, what each piece
does, the decisions behind it, and what went wrong along the way.

It is **not** the reference document. [`ANALYTICS.md`](ANALYTICS.md) is — that one stays current
as the code changes and is the thing to trust if the two ever disagree. This file is a snapshot
of a particular week's work and will age; that is fine, it is a record rather than a spec.

---

## 1. The short version

Your site measures traffic with Google Analytics 4, behind a cookie-consent banner, and it is
live at <https://talalhassankhan18.github.io/DataGateways-Website-Hosting/>.

| | |
| --- | --- |
| **Property** | `G-YEG8CLH6T0` |
| **Library** | `react-ga4` (a thin wrapper over Google's `gtag.js`) |
| **Consent** | Consent Mode v2 — everything denied until a visitor accepts |
| **Events** | 9, listed in §4 |
| **Personal data sent** | None |
| **Tests added** | 69 |
| **Still outstanding** | The privacy policy does not mention Google Analytics (§8) |

---

## 2. What actually got built

Eight new files. Nothing else in the site was restructured.

### The engine

**`apps/web/src/lib/analytics.ts`** — the whole Google Analytics surface in one file. It decides
whether analytics runs at all, performs the consent handshake in the right order, declares every
event the site is allowed to send, and deletes the GA cookies when someone withdraws consent.

**`apps/web/src/lib/consent.ts`** — remembers the visitor's decision. Three states: *not asked
yet*, *accepted*, *refused*. Stored in the browser's `localStorage`, not in a cookie — storing a
decision *about* cookies inside a cookie would mean writing the very thing being consented to
before consent exists.

**`apps/web/src/lib/useLinkTracking.ts`** — one listener that notices every click on a link
leaving your site: outbound links, the footer's social icons, email and phone links.

### The visitor-facing part

**`apps/web/src/components/layout/CookieBanner.tsx`** — the banner. Accept and Decline are the
same size, in the same row, one click each.

**`apps/web/src/components/layout/CookieSettingsLink.tsx`** — "Cookie settings" in the footer,
which brings the banner back so a decision can be changed.

**`apps/web/src/content/consent.ts`** — all the banner's wording. Your codebase has a rule that
no visible text lives inside a component, and consent copy is the text most likely to come back
from a lawyer with changes, so it belongs somewhere editable without touching code.

### Supporting

**`apps/web/src/lib/asset.ts`** and **`apps/web/src/env.d.ts`** — both needed for deployment
rather than analytics; see §6.

---

## 3. The four decisions, and why

These were put to you before anything was written.

**Driven by an environment variable, not a hardcoded ID.** With `VITE_GA_MEASUREMENT_ID` empty,
the whole thing switches off: no script, no network request, no banner. That is how a fresh clone
of the repo behaves, and it is how you turn analytics off in one move if you ever need to.

**Google's `gtag.js` directly, not Google Tag Manager.** Every event this site sends is written
down in one file in your repository, reviewed alongside the code that fires it. A Tag Manager
container moves that into a web console — the right trade when a marketing team needs to ship
tags without a developer, the wrong one for a site with nine events sold by a company whose
product is data governance.

*(On 12 October you asked for `react-ga4` instead. It wraps the same `gtag.js`, so what reaches
Google is byte-for-byte identical — see §7.)*

**A consent banner with Consent Mode v2.** Your visitors are EU- and UK-facing and your product
is data security. Loading analytics without asking would have been both a legal risk and an
awkward look.

**Track the contact and partner funnels, plus CTA and outbound clicks** — not scroll depth, which
GA4 already measures on its own and would have double-counted.

---

## 4. What gets measured

| Event | When it fires |
| --- | --- |
| `page_view` | Every page, including each click-through within the site |
| `generate_lead` | A contact or partner form is accepted by the API |
| `form_start` | Someone first interacts with either form |
| `form_error` | A submission is rejected |
| `cta_click` | A button or arrow link to another page on your site |
| `outbound_click` | A link to another website |
| `contact_channel_click` | An email or phone link |
| `partner_filter` | The region or country filter on the partner directory |
| `consent_update` | The banner decision itself |

### What is deliberately **not** sent

No name, email address, organisation, or message content — ever. The contact form reports *that*
a lead arrived and *which category* it chose, nothing more. Email and phone clicks report which
channel was used, never the address or the number.

The partner directory's free-text search box is also untracked, on purpose. The two dropdowns
beside it report values from a fixed list; the search box would report whatever somebody typed,
which is a free-text field being copied into a third-party system. There is a comment at that
input saying so, because it is the kind of thing a future developer would "fix" without realising.

---

## 5. How a page view actually travels

Worth reading once, because the ordering is the part that quietly breaks.

1. **Before React starts**, the app creates Google's `dataLayer` and pushes a *consent default*
   saying every category is denied.
2. **Only then** is the Google script loaded. This order is everything: Consent Mode reads the
   defaults at the moment the tag loads, so a default pushed afterwards is a default that never
   applied — and that failure is invisible. The integration looks correct and sets cookies anyway.
3. If the visitor accepted on a previous visit, that decision is replayed now. Otherwise the
   banner appears.
4. Each time the visitor opens a page, one `page_view` is sent with the path and title.
5. If they accept, a single consent update unlocks analytics storage and Google sets its cookies.
   If they decline, the cookies are deleted.

**Until someone accepts, no cookie is set and no identifier exists.** Google still receives an
anonymous ping — that is Google's own recommended configuration, and it is lawful because nothing
is stored on the visitor's device. If your lawyer would rather nothing at all reached Google
before consent, that is a three-line change; it is flagged in the sign-off register.

---

## 6. What broke along the way

Recorded because each of these would have shipped, and most were invisible in tests.

**Page views were counted twice.** React's development mode runs effects twice, which exposed it
— but a component remounting for any reason would have done the same in production, silently.
Fixed by ignoring a repeat of the page already reported.

**Declining after accepting left the cookies behind.** Consent Mode stops Google *using* a cookie
but never removes one already written, so withdrawal left the tracking identifier on the device
indefinitely. Now the cookies are deleted.

**The banner appeared when no measurement ID was configured.** The site would have asked every
visitor to consent to analytics that could never load — untrue, and the state your site would
have launched in.

**With browser storage blocked, the banner could never be dismissed.** In private browsing an
accepted choice evaporated and the banner returned forever. A test caught this one.

**72 asset paths broke on GitHub Pages.** This was the big one. Your site is served from
`/DataGateways-Website-Hosting/` rather than a domain root. Vite rewrites asset links in the HTML
automatically, but a path written as a string in a TypeScript file is just a string — so every
image, video, logo and the privacy and terms documents pointed at the wrong place and returned
"not found", while the page itself loaded fine. That is what `asset.ts` fixes.

---

## 7. Two changes you asked for afterwards

**Moved to `react-ga4` (12 October).** It owns initialisation, page views and events now. It is a
wrapper over the same `gtag.js`, so what Google receives did not change and your data stays
comparable across the switch.

One thing it is deliberately not allowed to do: the consent handshake. Its `initialize()` loads
the Google script *before* it sends anything, and any consent instruction given beforehand is
queued and delivered *after* — which would place the consent defaults too late to apply. That is
the exact silent failure described in §5, so the defaults are still sent directly.

**Changed the measurement ID, twice (12 October).** It now points at `G-YEG8CLH6T0`, the property
for `www.datagateways.net`. That is the fourth ID supplied in three days. A note worth keeping:
**GA4 properties do not merge.** Whatever each one collected stays in it — the two days of data on
`G-G9BBDT5TQV` are not coming across.

**Renamed the banner's accept button to "Accept cookies"** (it said "Accept analytics"). The body
still names Google Analytics, which is the disclosure the GDPR wants; the button is the decision,
and "cookies" is the word people recognise from every other banner.

On that — when Google told you *"your Google tag wasn't detected"*, the integration was working
correctly. You were testing from the setup page of a *different* property, so Google looked for a
tag that genuinely was not there. If that message appears again, check which property you are
testing from before changing anything.

---

## 8. Where things stand

### Verified working

Checked on the live site and against a local copy of how GitHub Pages serves it: one script tag
with the right ID, consent denied by default, no cookie before consent, cookies appearing on
accept and deleted on withdrawal, one page view per page, the full contact funnel firing against
the real API, and requests reaching Google with your measurement ID.

**141 tests** (16 API, 125 web) — 69 of them new. One test fails and always did: a heading on the
Services page bypasses the component that gives every heading the site's two-colour split. It
predates this work and is unrelated to it.

### Still outstanding — one of these matters

**The privacy policy does not mention Google Analytics.** It has generic cookie wording but does
not name Google, list the cookies, or state how long they last, which GDPR expects. Drafted
wording is ready in [`ANALYTICS.md`](ANALYTICS.md) §8. I deliberately did not paste it into the
policy — that is your lawyer's text, not something to be written by a developer.

**In your GA4 account**, before relying on reports: register the thirteen custom dimensions
(GA4 does not backfill, so do this early), raise data retention from the two-month default, and
turn off Google Signals unless you want cross-device advertising data.

**Two things are now publicly readable** because the repo is public: the site code, which is
marked "All rights reserved", and `docs/PRE-LAUNCH-SIGNOFF.md`, which states that the partner
directory is fictional and the compliance marks are unverified.

**`.github/workflows/npm-publish.yml`** is GitHub's default template, added through the web
interface rather than by me. It is dormant — it only runs when you create a release — and would
fail anyway because the project is marked private. Worth deleting so nobody wonders later why
this site has a package-publishing workflow.

---

## 9. Working with it day to day

**Deploying** is `git push`. There is no `npm run deploy`; pushing to `main` triggers the build,
so a deploy can never pick up changes you forgot to commit.

**Checking what analytics is doing** — open the site, press F12, and in the console run:

```js
window.dataLayer.map(a => Array.from(a))
```

That shows every instruction in order. It is the honest view, and it does not depend on Google
responding.

**Turning analytics off entirely** — clear `VITE_GA_MEASUREMENT_ID` in `apps/web/.env.production`.
Everything stops, including the banner.

**A warning about local development:** `apps/web/.env` currently holds the live measurement ID,
which you asked for so you could see it working. That means `npm run dev` reports into your real
property, and localhost traffic is indistinguishable from real visitors once it arrives. Delete
that file when you no longer need it.

**Changing the banner wording** — `apps/web/src/content/consent.ts`. Never in the component.
