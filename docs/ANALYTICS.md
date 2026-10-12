# Google Analytics 4 — integration record

**Added:** 10 October 2026
**Measurement ID:** `G-P817Q57NCR`, set 12 October 2026. It replaced `G-G9BBDT5TQV`, which was
live from 10–12 October; GA4 properties do not merge, so data collected against the old ID stays
in the old property.
**Status:** built, tested, and **armed**. The next production deploy will load Google Analytics
and show the consent banner to real visitors.

> **One thing is now overdue rather than pending.** The privacy policy still does not name Google
> Analytics or list its cookies (§8). While the measurement ID was empty that was an item on a
> checklist; now that the tag is armed, the first production deploy sets cookies on consent under
> a policy that does not describe them. Either get the §8 wording in front of counsel before that
> deploy, or clear `VITE_GA_MEASUREMENT_ID` until it is done — clearing it turns the whole
> integration, banner included, back off.

Google Analytics 4 via `gtag.js`, under Consent Mode v2, behind a consent banner. This document
is the whole record: what was built, why each decision went the way it did, what was verified and
how, what is still outstanding, and what has to happen before it goes live.

---

## 1. At a glance

| | |
| --- | --- |
| **Method** | `react-ga4` (a thin typed wrapper over `gtag.js`) — no Google Tag Manager |
| **Consent** | Consent Mode v2, everything denied by default, banner upgrades on accept |
| **Measurement ID** | `VITE_GA_MEASUREMENT_ID` = `G-P817Q57NCR`, in both `.env.production` and (at the client's request) `.env`, so development reports too — see §6 |
| **Events** | 9, all declared in `apps/web/src/lib/analytics.ts` |
| **Personal data sent** | None. Enforced by a closed parameter taxonomy and covered by tests |
| **New tests** | 69 (web suite went from 56 to 125) |
| **Build impact** | One dependency, `react-ga4` ^3.0.1. The analytics and consent code is roughly 6 KB of source |

### The four decisions

These were put to the client before anything was written, and all four were taken on the
recommended option:

1. **Env var**, not a hardcoded ID — so the integration turns off by clearing one variable.
2. **Direct `gtag.js`**, not Google Tag Manager. *(Superseded 12 October: the client asked for
   `react-ga4` instead. It wraps the same `gtag.js`, so the wire format is unchanged — see below.)*
3. **Consent banner + Consent Mode v2**, not unconditional loading.
4. **Track the contact funnel, the partner funnel, and CTA/outbound clicks** — not scroll depth,
   which GA4's own Enhanced Measurement already covers and which would have double-counted.

---

## 2. Why these choices

### Why `react-ga4`, and what it is not allowed to do

Adopted on 12 October at the client's request. It is a thin typed wrapper over `gtag.js`:
`event(name, params)` becomes `gtag('event', name, params)` with unmapped keys passed through
untouched, and `send({hitType:'pageview', page, title, location})` becomes
`gtag('event','page_view', { page_path, page_title, page_location })` — exactly the shape this
integration already sent. **The wire format did not change**, so data before and after the switch
is directly comparable, and the taxonomy in §5 still describes what GA receives.

It owns initialisation, page views and events. It is deliberately **not** allowed to perform the
consent handshake. `ReactGA.initialize()` injects the `gtag.js` script *before* it pushes
anything, and any `ReactGA.gtag()` call made beforehand is queued and flushed *after* `config`.
Routing the Consent Mode defaults through it would therefore place them after the tag had already
loaded — the one ordering that silently does nothing. So the defaults are pushed straight onto the
`dataLayer` first and `initialize` is called second; react-ga4 reuses an existing `window.dataLayer`,
so the queue it inherits already has consent at the front. `analytics.test.ts` asserts that order.

Two smaller consequences worth knowing: react-ga4 appends its script to `<body>` rather than
`<head>` and gives it no identifying attribute, so tests match on `src`; and its singleton survives
`vi.resetModules()`, because vitest externalises `node_modules` — tests must call `ReactGA.reset()`
by hand or every test after the first silently measures nothing.

### Why not Google Tag Manager

Every event this site sends is declared in one TypeScript file, in the repository, reviewed with
the code that fires it. A GTM container moves that out to a web console. That is the right trade
when a marketing team needs to ship tags without a deploy; it is the wrong one for a site with
nine events sold by a company whose product is data governance — the event list is exactly the
kind of thing that should be in a diff.

It is also smaller: no container payload, no second abstraction between an event and its call
site.

If GTM is wanted later, the migration is contained: `trackEvent` becomes a `dataLayer.push` and
the taxonomy in `analytics.ts` becomes the container's trigger list.

### Why the banner looks the way it does

Four things about it are compliance decisions, not styling, and each is the reason the obvious
simpler version is wrong:

- **Accept and Decline are the same size, in the same row, one click each.** Not a bright accept
  button beside a grey text link. The EDPB and CNIL both read a refusal that is harder to find or
  operate than an acceptance as no consent at all. For a company selling data governance, getting
  this wrong would be worse than the fine. `CookieBanner.test.tsx` asserts the shared padding,
  text size and minimum width so a restyle cannot quietly break it.
- **No close button, no X.** Dismissal is not consent, so the only two exits state a position.
  The banner is non-modal and traps nothing, so it blocks no reading in the meantime.
- **It is second in the DOM**, behind only the skip link, so a keyboard or screen-reader user
  meets the choice before the navigation rather than after the footer. It paints fixed at the
  bottom, where people look for it.
- **It does not take focus.** An unexpected focus jump on load is disorienting, and hostile to a
  visitor with no intention of engaging with it. The labelled `region` is how a screen reader
  finds it on demand.

### Why consent is stored in `localStorage`, not a cookie

The decision is a decision *about* cookies. Storing it in one would mean writing the thing being
consented to before consent exists. What is stored is a single enum, a timestamp and a schema
version — no identifier.

### Why Global Privacy Control is honoured

`navigator.globalPrivacyControl` is a browser-level opt-out, legally binding under the CPRA and
recognised by several EU regulators. When it is set, the banner never appears and consent can
never be granted — not by the UI, not by a stray call. Asking again for something already refused
at the browser level is the dark pattern the signal exists to stop.

It is deliberately **not** persisted. It is the browser's position, not ours to cache: if the
visitor turns it off, the site falls back to asking.

---

## 3. What was built

### New files

| File | What it is |
| --- | --- |
| `apps/web/src/lib/analytics.ts` | The whole GA4 surface: configuration, consent mode, the event taxonomy, `trackEvent` / `trackPageView`, link classification, cookie cleanup |
| `apps/web/src/lib/consent.ts` | The consent store — three states, `localStorage`, GPC, a `useSyncExternalStore` hook |
| `apps/web/src/lib/useLinkTracking.ts` | One delegated listener for every outbound, `mailto` and `tel` link |
| `apps/web/src/content/consent.ts` | All banner copy, per the project's no-strings-in-JSX rule |
| `apps/web/src/components/layout/CookieBanner.tsx` | The banner |
| `apps/web/src/components/layout/CookieSettingsLink.tsx` | The footer control that reopens the choice |
| `apps/web/src/env.d.ts` | Types `import.meta.env`, so a typo in a `VITE_*` name is a build error rather than a silent `undefined` |
| `apps/web/src/lib/asset.ts` | Resolves content asset paths against `BASE_URL`, for deployments served from a subpath |

### Files changed

| File | Change |
| --- | --- |
| `main.tsx` | `initAnalytics()` before React renders |
| `App.tsx` | Renders `CookieBanner`, calls `useLinkTracking()` |
| `layout/Meta.tsx` | Sends the page view |
| `layout/Footer.tsx` | "Cookie settings" in the legal row |
| `primitives/Button.tsx`, `primitives/ArrowLink.tsx` | `cta_click` on internal destinations |
| `contact/ContactForm.tsx` | `form_start`, `generate_lead`, `form_error` |
| `content/PartnerApplicationForm.tsx` | The same three, under a different `form_name` |
| `pages/PartnerFindPage.tsx` | `partner_filter` on the region and country selects |
| `content/index.ts` | Exports the new `consent` copy |
| `.env.example`, `.env.production` | The new variable, documented, empty |

### Test files added

`analytics.test.ts` (31) · `consent.test.ts` (14) · `CookieBanner.test.tsx` (13) ·
`Meta.test.tsx` (5) · `useLinkTracking.test.tsx` (6) — **69 new tests.**

---

## 4. The three properties the implementation holds

Stated here because they are what the tests are actually protecting, and because each one fails
silently if it breaks.

### 4.1 Inert without a measurement ID

`VITE_GA_MEASUREMENT_ID` unset or malformed means: no script tag, no `dataLayer`, no request, no
banner, no footer control. Every exported function stays callable and does nothing, so no call
site guards and no test stubs.

The ID is shape-checked against `/^G-[A-Z0-9]{6,15}$/`. This is not pedantry — the common failure
is a GTM container ID (`GTM-…`) or a Universal Analytics property (`UA-…`) pasted into the
variable, which `gtag` accepts without complaint and reports nothing against. Staying inert is
louder than looking configured and measuring nothing.

**This is the state of a fresh clone**, which has neither `.env` nor `.env.local` — both are
gitignored. It is not the state of this machine: `.env.production` carries `G-P817Q57NCR` and, at
the client's request on 11 October, so does `.env`, which means `npm run dev` reports into the
live property too. §6 covers how to undo that.

### 4.2 Consent before storage

The default consent state is denied, and it is pushed onto the `dataLayer` **before** the
`gtag.js` tag is injected. Consent Mode reads its defaults at load, so a default pushed afterwards
is a default that never applied — and that failure is invisible: the integration looks correct and
sets cookies anyway. `analytics.test.ts` asserts the ordering explicitly.

All seven v2 signals are named, because Google treats an unmentioned signal as granted:

| Signal | Default | On accept |
| --- | --- | --- |
| `ad_storage` | denied | denied |
| `ad_user_data` | denied | denied |
| `ad_personalization` | denied | denied |
| `analytics_storage` | denied | **granted** |
| `functionality_storage` | denied | **granted** |
| `personalization_storage` | denied | denied |
| `security_storage` | granted | granted |

The three advertising signals stay denied in every state this site can reach, because it runs no
advertising tags. `security_storage` stays granted throughout: it covers fraud prevention and
authentication and is strictly necessary — denying it is not more private, it only breaks things.

> **What this means in practice.** This is Consent Mode *advanced*: `gtag.js` loads before a
> choice is made and sends cookieless pings. No `_ga` cookie, no client ID, no identifier — but
> a request does reach Google carrying the page URL and a coarse signal. This is Google's own
> recommended configuration and is generally considered compliant, because ePrivacy consent
> governs *storage on the device* and nothing is stored. **If the client's counsel would rather
> nothing at all reached Google before consent**, the change is small and local: move
> `injectScript()` out of `initAnalytics` and into the granted branch of `applyConsent`. Flagged
> in the sign-off register.

**Withdrawal actually deletes the cookies.** Consent Mode stops `gtag` *using* a cookie but does
not remove one already written, so a visitor who accepts and later declines would otherwise keep
the `_ga` client ID indefinitely — the identifier that withdrawal was supposed to be the end of.
`clearAnalyticsCookies()` expires every `_ga*`, `_gid` and `_gat` cookie across the host and each
parent domain. Verified in a real browser, not only in jsdom.

### 4.3 No personal data, ever

Event parameters are a closed, discriminated-union taxonomy. A parameter outside it is a type
error at the call site, not a field that silently never appears in a report.

Nothing a visitor types is sent:

- The contact form reports **that** a lead arrived and **which branch** it chose — a fixed enum
  from the content deck. Not the name, email, organisation, message or reference.
- The partner form reports only that an application was submitted.
- `mailto:` and `tel:` clicks report **which channel** was used, never the address or number.
  `useLinkTracking.test.tsx` asserts the serialised events contain neither.
- The partner directory's **free-text search box is deliberately not tracked**, and there is a
  comment at the input saying so. The two selects beside it report values from a fixed list; the
  box would report whatever someone types. Which regions get searched is the useful signal, and
  the selects already carry it.
- `page_location` carries the full URL so GA4 can read `utm_*` and `gclid` for attribution. No
  route on this site puts personal data in a query string — **that is now a constraint on anyone
  adding one.**

---

## 5. The event taxonomy

`page_view` and `generate_lead` are GA4's own recommended names, so they populate the standard
reports with no configuration. The other seven are custom.

| Event | Fires when | Parameters |
| --- | --- | --- |
| `page_view` | Every route change, including the first | `page_path`, `page_title`, `page_location` |
| `generate_lead` | Contact or partner form accepted by the API | `form_name`, `enquiry_branch?` |
| `form_start` | First real interaction with either form | `form_name` |
| `form_error` | Submission rejected | `form_name`, `error_kind` |
| `cta_click` | A `Button` or `ArrowLink` to an internal destination | `cta_label`, `cta_destination`, `cta_location` |
| `outbound_click` | Any link to another host | `link_url`, `link_domain`, `link_text` |
| `contact_channel_click` | Any `mailto:` or `tel:` link | `channel` |
| `partner_filter` | Region or country select on the partner directory | `filter_type`, `filter_value` |
| `consent_update` | The banner decision | `consent_state` |

`form_name` is `contact` or `partner_application`. `error_kind` is `validation`, `rate_limited`
or `generic`.

### Three design notes worth knowing before changing any of this

**Page views come from `Meta`, not from the router.** Every page reaches `Meta` through
`PageShell`, which makes "every page renders `PageShell`" the thing that guarantees every page is
measured. `Meta.test.tsx` enforces that by scanning `src/pages` — the same technique
`SplitHeading.test.tsx` uses, and for the same reason: a render test cannot catch a page nobody
thought to test. Tracking in `App.tsx` instead would have to be remembered, and a route rendering
its own shell would slip past it.

**Page views are deduplicated on the path.** "The effect ran" and "the visitor arrived somewhere
new" are not the same event. StrictMode double-invokes effects in development — but the dev
symptom is not the reason the dedupe is there. A component that remounts for any reason at all (a
Suspense boundary resolving, a key changing) would do the same in production, silently, and the
only evidence would be a bounce rate that looks wrong. *This was caught in browser testing, not
by a unit test — see §7.*

**No click is counted twice.** `Button` and `ArrowLink` fire `cta_click` for **internal**
destinations only; the delegated listener fires `outbound_click` and `contact_channel_click` for
**external** ones. No href is seen by both. The split exists because the alternative is three
slightly different definitions of "external" and a click that counts twice or not at all — so all
three share one `classifyLink`. There is a test named for this invariant.

In-page `#anchor` links are ignored: the anchor rail is built from them and they are not
navigation.

### Registering the custom dimensions

Custom event parameters do not appear in GA4 reports until they are registered. In the property:
**Admin → Data display → Custom definitions → Create custom dimension**, scope *Event*, one per
parameter you want to report on:

`form_name`, `enquiry_branch`, `error_kind`, `cta_label`, `cta_destination`, `cta_location`,
`link_url`, `link_domain`, `link_text`, `channel`, `filter_type`, `filter_value`, `consent_state`

GA4 allows 50 event-scoped custom dimensions, so all thirteen fit comfortably. Data only appears
from the moment a dimension is registered — it is not backfilled.

Mark `generate_lead` as a key event (**Admin → Events**) to get conversion reporting.

---

## 6. Running and testing it

### Default: nothing happens

```bash
npm run dev
```

With no measurement ID, the site runs exactly as it did before this work: no banner, no script,
no requests. This is intentional and is the state every checkout starts in.

### Measuring locally

> **Current state, 12 October: `apps/web/.env` holds the live production ID**, at the client's
> request, so `npm run dev` reports into the real property. That file is gitignored, so it is
> local to this machine — delete it, or blank the value, to make development inert again.
>
> Development traffic is indistinguishable from real visitors once it is in a property and cannot
> be deleted selectively afterwards. Worth pairing with GA4's *internal traffic* filter
> (Admin → Data streams → Configure tag settings → Define internal traffic) on this machine's IP.

To measure against a **separate test property** instead, put its ID in `apps/web/.env.local`,
which outranks `.env`:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Restart the dev server; Vite reads env files at startup.

One Vite behaviour is relied on deliberately: **`.env.local` cannot leak into a production
build**, because Vite ranks `.env.[mode]` above `.env.local`, so `.env.production` wins.
Verified — a build with a local ID present contains zero occurrences of it.

To override a production build on purpose — as §7's verification did — use
`.env.production.local`, which outranks both and is gitignored.

### Verifying without Google

The authoritative check is the `dataLayer`, in the browser console:

```js
window.dataLayer.map(a => Array.from(a))
```

That shows every command in order — consent default first, then `js`, `config`, the consent
replay, then each event. It does not depend on Google responding, and it is how the behaviour in
§7 was confirmed.

### Verifying with Google

GA4 **Admin → DebugView**, with the GA Debugger extension on, or by appending `&debug_mode=1`. The
page-view dedupe matters here: without it every page reports twice in dev and DebugView is
unreadable.

### Useful console one-liners

```js
document.cookie.split('; ').filter(c => c.startsWith('_ga'))   // should be empty before consent
localStorage.getItem('dg.consent.analytics')                   // the stored decision
localStorage.removeItem('dg.consent.analytics'); location.reload()  // bring the banner back
```

---

## 7. What was verified, and how

Everything below was exercised in a real browser against the dev server with a test measurement
ID, **not** only in jsdom.

| Check | Result |
| --- | --- |
| No ID → no banner, no footer control, no script, no `dataLayer`, no cookies | ✅ |
| Consent default pushed first, all seven signals, denied | ✅ |
| `config` with `send_page_view: false` | ✅ |
| **No `_ga` cookie before consent** | ✅ — `document.cookie` empty |
| Accept → `consent update` granted → `_ga` and `_ga_<STREAM>` appear | ✅ |
| Decision survives a full server restart; banner stays away | ✅ |
| Footer "Cookie settings" → storage cleared, banner returns, polite announcement | ✅ |
| Decline after accepting → **cookies deleted**, consent denied | ✅ |
| SPA navigation → one `page_view` per route, correct new title | ✅ |
| `cta_click` with label, destination and origin path | ✅ |
| Contact funnel: `form_start` → `form_error` (validation) → `generate_lead` | ✅ — real API submission |
| Real hits reach `google-analytics.com/g/collect` | ✅ — 3 hits for 3 events |
| Banner at 375×812: buttons stack full-width, equal, no overflow | ✅ |
| Console errors across home, contact, about, a capability page | ✅ none |

Re-verified on **10 October 2026 against the minified production build** (`vite preview`) once
the real measurement ID was supplied, since minification and the production React build are the
one thing a dev-server run does not exercise:

| Check | Result |
| --- | --- |
| Real ID embedded in the bundle and passing the shape check | ✅ — one occurrence, `analyticsConfigured` resolves true |
| Banner renders, consent default denied, `send_page_view: false` | ✅ |
| Exactly one `page_view` — the dedupe survives minification | ✅ |
| No cookie before consent; `_ga` + `_ga_<STREAM>` on accept | ✅ |

> Done with a throwaway ID layered in via a gitignored `.env.production.local`, which Vite ranks
> above `.env.production`. That exercised the real production code path without putting test hits
> in the client's property. The override was removed and the bundle rebuilt afterwards —
> confirmed to contain the configured ID and no trace of the throwaway.
>
Separation of development from the client's property was also confirmed that day, by restarting
`npm run dev` with the real ID in `.env.production` and nothing in `.env`. *(That separation no
longer applies: `.env` now carries the production ID — see §6.)*

| Check | Result |
| --- | --- |
| Banner in development | ✅ absent |
| gtag script in development | ✅ not injected |
| `dataLayer` in development | ✅ never created |
| The production ID anywhere in the dev page | ✅ nowhere |

> **What none of this proves** is that the configured ID is a live, correctly configured property —
> that is a GA account fact, not a code fact. Confirm it in **GA4 → Reports → Realtime** on the
> first deploy.

### Suite state

| | Before | After |
| --- | --- | --- |
| API tests | 16 passing | 16 passing |
| Web tests | 56 (1 failing) | **125 (1 failing)** |
| Type errors | 0 | 0 |
| Lint | 1 error, 1 warning | 1 error, 1 warning |

The lint error and the failing test are **both pre-existing and unrelated** — see §9.

### Three bugs that browser testing caught and unit tests had not

Recorded because each one would have shipped, and each was invisible in jsdom:

1. **`page_view` fired twice on every first load.** StrictMode double-invoking the effect — but a
   remount would do the same in production. Fixed by deduplicating on the path in `trackPageView`;
   two tests now cover it.
2. **Declining after accepting left the `_ga` cookies in place.** Consent Mode never deletes what
   it has already written, so the client ID survived a withdrawal. Fixed by `clearAnalyticsCookies()`.
3. **The banner rendered with no measurement ID configured.** The site would have asked every
   visitor to consent to analytics that could never load — untrue, and the state the client's site
   would have launched in. Fixed by gating both the banner and the footer control on
   `analyticsConfigured`.

A fourth was caught by a test while writing it: with `localStorage` blocked (private browsing),
an accepted choice evaporated and **the banner could never be dismissed**. Fixed by holding the
decision in memory alongside storage.

---

## 8. Before this goes live

In order.

1. ~~**Create the GA4 property** and a Web data stream for `datagateways.net`.~~
   **Done** — `G-P817Q57NCR`, set 12 October 2026.
2. ~~**Set `VITE_GA_MEASUREMENT_ID`** in `apps/web/.env.production`.~~ **Done, 10 October 2026.**
   The production bundle carries the ID and was verified serving the built output; nothing else
   in the code changed.
3. **Register the thirteen custom dimensions** listed in §5, and mark `generate_lead` as a key
   event. Do this *before* launch — dimensions are not backfilled.
4. **Set data retention** to 14 months (**Admin → Data settings → Data retention**). The default
   is 2 months, which is almost always shorter than wanted, and the setting is not retroactive.
5. **Turn off Google Signals** unless the client has a reason to want it. It is cross-device
   advertising data and adds a consent dimension this banner does not ask about.
6. **Decide the advanced-vs-basic consent mode question** in §4.2 with counsel, and record it.
7. **Update the privacy policy** — see below. This is the one item with real legal exposure.
8. **Confirm the Google Ads data-processing terms / DPA** are accepted in the GA account, and add
   Google as a processor in the client's record of processing activities. GA4 transfers data to
   the US; the client's existing transfer-mechanism language should be checked against it.

### The privacy policy needs a paragraph it does not have

`apps/web/public/privacy-policy.md` has a *Cookies and Similar Automated Data Collection* section
(§3b) with generic language, including "Where required by law, we will provide appropriate cookie
controls or consent mechanisms." That section is now true — the mechanism exists — but it does
**not name Google Analytics, list the cookies, or state their lifetimes**, which GDPR Article 13
transparency and the ePrivacy consent requirement both expect.

**This has deliberately not been edited.** It is the client's legal text and the wording is for
their counsel, not for this repo. The factual content they need is below; it describes exactly
what the implementation does and can be handed over as-is for review.

> **Analytics cookies.** With your consent, we use Google Analytics 4, a service provided by
> Google LLC, to understand how visitors use this website. Google Analytics sets the following
> first-party cookies:
>
> | Cookie | Purpose | Expires |
> | --- | --- | --- |
> | `_ga` | Distinguishes one visitor from another | 2 years |
> | `_ga_<STREAM ID>` | Maintains session state | 2 years |
>
> These cookies are **not** set unless you accept them. Until you do, Google Analytics runs in a
> cookieless mode that stores nothing on your device. We do not use Google Analytics for
> advertising, and advertising-related consent signals are refused at all times.
>
> We do not send Google Analytics your name, email address, organisation, or the content of any
> message you submit through this website.
>
> You can change or withdraw your choice at any time using the **Cookie settings** link in the
> footer of any page. If your browser sends a Global Privacy Control signal, analytics stays off
> and we do not ask you to choose. Withdrawing consent deletes the cookies listed above.

Lifetimes shown are Google's defaults; confirm them against the property's configured retention
before publishing.

---

## 9. Pre-existing issues found while testing — not caused by this work

Reported rather than fixed, because neither is in scope for an analytics integration and the
first is a content decision.

1. **`npm test` fails: one test, pre-existing.**
   `SplitHeading.test.tsx` → *the split-heading invariant* reports
   `pages/ServicePage.tsx:240` — a raw `<h2>` that bypasses `SplitHeading`. The README calls this
   "a bug, not a style choice", and the test exists specifically to catch it. Whether that heading
   should be split, and where the roman/accent break falls, is a copy decision.

2. **`npm run lint` fails: one error, pre-existing.**
   `layout/NavDropdown.tsx:115` — `@typescript-eslint/no-unused-expressions`. Also a
   `react-refresh` warning at `pages/PrivacyPage.tsx:36`, which is pre-existing and harmless
   (the file exports `renderPolicy` alongside the component).

3. **Worth knowing when running the dev server from tooling.** The API reads `PORT` from the
   environment (defaulting to 4000). A launcher that exports `PORT=3000` for the web server passes
   it through `concurrently` to the API as well, which then tries to bind 3000, collides with
   Vite, and exits with `EADDRINUSE` — while the web server comes up fine, so it looks like only
   the API is broken. Not a project bug; a sharp edge.

---

## 10. If you need to change something

| You want to | Do this |
| --- | --- |
| Add an event | Add a variant to the `AnalyticsEvent` union in `analytics.ts`, then call `trackEvent`. The union makes the parameters mandatory and typo-proof |
| Change banner wording | `src/content/consent.ts`. Never in the component |
| Re-ask everyone for consent | Bump `STORAGE_VERSION` in `consent.ts`. An older stored record reads back as `unset` |
| Stop loading gtag before consent | Move `injectScript()` into the granted branch of `applyConsent` — see §4.2 |
| Add an advertising tag | Change `GRANTED_ON_ACCEPT` **and** the banner copy. The copy currently promises nothing is shared with advertisers |
| Switch to GTM | Replace the body of `trackEvent` with a `dataLayer.push`. The taxonomy becomes the container's trigger list |
| Turn it all off | Clear `VITE_GA_MEASUREMENT_ID`. Everything goes inert, including the banner — see the caveat below |

**One caveat on turning it off.** Clearing the measurement ID stops everything *new* — no script,
no requests, no banner — but it also stops `clearAnalyticsCookies()`, which only runs when
analytics is configured. A visitor who had already accepted keeps their `_ga` cookie until it
expires. If analytics is ever switched off permanently rather than temporarily, sweep those
cookies once (the function is exported-adjacent in `analytics.ts` and is four lines to call from
`initAnalytics` unconditionally). Left as-is deliberately: running cookie-clearing code on every
page load forever, for a case that happens approximately never, is the worse trade.

**Do not** put personal data in a query string on any route. `page_location` carries the full URL
to GA for campaign attribution, and that is only safe while the URLs stay clean.
