# EC-Share — Current Progress

> **Living document.** Updated every Cursor session that touches code or docs.
> Older session notes: [progress-archive/2026-08.md](progress-archive/2026-08.md).

---

## Last session: 2026-08-27 (site-images: hero plate split from the services case study, exact upload sizes, rounded corners)

**Summary**: `ecShareHero` still fed two placements — the product page's wide plate and the services page's lead case study — so replacing one silently changed the other. Split a `servicesCaseEcShare` slot out for the case study (`fallback` kept pointing at the same shipped photo, so nothing visibly changes until an admin uploads a distinct one), matching the split already done for the mosaic scene last session. `ServicesPageClient.tsx`'s `cases[0]` now reads `images.servicesCaseEcShare`.

The hero plate's `sizes="100vw"` was wrong: the plate lives inside `container-max`, capped at 1360px content width, and never renders wider than that no matter the screen — so `100vw` told Next.js's image optimizer a full-viewport image might be needed when it never can be. Now `sizes="(max-width: 767px) 100vw, 1360px"`. Worked out the plate's exact render box (1360×583px max, desktop 21:9; up to 720×540px, mobile 4:3) and wrote both the box and a 2× upload recommendation (2720×1166px) straight into the slot's `shape` text, which the admin media screen renders verbatim under the slot label — so whoever uploads next sees the number without asking. Also tightened the app-icon slot's `shape` the same way (upload ≥320×320px for retina) and fixed its stale `alt` text, which had been reading the mosaic's scene-1 caption rather than describing the hero photo itself.

Added `border-radius` to the two `/ec-share` photo containers that had none — the hero plate (`0.75rem`) and the scene mosaic's `.pieceFrame` (`0.625rem`, shared by both photographs and their type-composed placeholders). Left the services page's `.caseShot` alone: its three case cards already carry `border-radius: 0.625rem`. Also left the services hero band (`.heroPlate` there, the full-viewport-width image closing the first screen) unrounded on purpose — a radius on an edge-to-edge band would leave a gap against the viewport edge instead of reading as a frame.

**Files changed**: `lib/site-images.ts`, `components/services/ServicesPageClient.tsx`, `app/(public)/ec-share/EcSharePageClient.tsx`, `app/(public)/ec-share/editorial.module.css`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`, `docs/progress-archive/2026-08.md`.

**Verified**: `tsc --noEmit` and `next lint` clean (`next build` skipped this session — a `next dev` server was running against the same `.next` directory, which reliably breaks a concurrent production build with an unrelated `MODULE_NOT_FOUND` on a webpack chunk; not a symptom of anything touched here). Loaded `/ec-share` and `/services` in-browser: hero plate and mosaic tiles show rounded corners, the services hero band stays square, and the lead case study still renders the same mirroring photo now that it reads from `servicesCaseEcShare`. `/admin/media` lists the new "Services case: EC-Share" slot with its own `Replace` control, its own fallback path, and no "replaced" badge (confirming it hasn't inherited whatever override the original hero slot happens to carry), and the hero slot's card shows the new pixel guidance text.

---

## Previous session: 2026-08-27 (product animations redesigned bolder, monitor-mirror glue fix, disconnect no longer touches the phone's own screen, blog entrance drift removed)

**Summary**: A direct follow-up on the previous session's animation/interaction work, correcting three things the user caught on review and redesigning the five non-chat product scenes from scratch.

The five non-chat `HeroIllustration` scenes (news, game, social, youtube, gallery) were rebuilt with bolder, simpler motifs after the first pass's fine detail (scrolling list rows, a dashed patrol path, scrolling avatars+captions) proved illegible at the size these devices actually render. News is now one tag swatch cycling through three colours beside two static headline bars; game is three score stars filling in sequence plus an independently bouncing gem; social dropped the scrolling feed for one still photo with a heart-pop + expanding-ring "like" burst; youtube lost its illegible channel-info micro-text; gallery's photo view dropped its caption lines. All still close CSS loops (frame 0 === frame 100).

Disconnecting a device previously dimmed/grayscaled it and swapped in a "no signal" X — wrong model. The device is the source, not a mirror of the monitor, so its own screen must never change; only the monitor's copy of it should disappear. `isOn` no longer touches the outer device's rendering at all; only `visibleDevices` (which drives the monitor grid and cables) reads connection state.

The monitor's mirrored screen content is drawn in a `<g transform="translate() scale()">` nested inside each `.ec-mon-cell`, while the bezel/wall are `<rect>`s positioned via `x`/`y`. Both need to move together when the grid re-flows, but only the rects had a transition rule — the `<g>` snapped instantly, so for the first ~0.4s after every click the mirrored screen sat visibly detached from its own bezel. Added `.ec-mon-cell > g` to the transition selector.

Blog cards' entrance still had `.blog-berth` sliding in from a 22px X offset, staggered per card — harmless in isolation, but a fast scroll landed several cards mid-slide simultaneously and read as the whole rail lurching left before snapping to rest. Removed the transform outright; cards now only fade in, so there's nothing left to overshoot.

`site-images.ts`'s `ecShareHero` slot fed three different placements — the product hero plate, the services-page lead case study, *and* the product page's "one desk, eight live screens" mosaic scene — off one photograph, so replacing any one of the three silently changed the other two. Split a dedicated `ecShareSceneDesk` slot out for that scene (`fallback: null`, same as the other not-yet-shot scenes), so it now composes from type until an admin uploads its own photo, independent of whatever the hero plate shows. `SITE_IMAGE_SLOTS` already drives the admin media UI generically, so the new slot needed no admin-side changes.

**Files changed**: `components/illustrations/HeroIllustration.tsx`, `app/globals.css`, `lib/site-images.ts`, `app/(public)/ec-share/EcSharePageClient.tsx`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`, `docs/progress-archive/2026-08.md`.

**Verified**: `tsc --noEmit`, `next lint`, `next build` (45 routes) all clean. Confirmed via `getComputedStyle` that all `ec-game-star`/`ec-game-gem`/`ec-news-thumb`/`ec-like`/`ec-like-ring` elements exist (6 each, matching 3 outer + 3 monitor-mirrored devices where applicable) and carry their new animation names. Dispatched a `MouseEvent` to disconnect a device: outer device kept its plain `ec-device` class and its live scene content (confirmed via `innerHTML`), no cable to it, and the monitor grid re-flowed 2×3 → 3+2 with no visible screen/bezel separation. Confirmed `getComputedStyle(...).transform === 'none'` on all live `.blog-berth` cards. Confirmed `/ec-share`'s first scene now renders the type-composed placeholder frame (not the hero photo) and `GET /api/admin/site-images` lists `ecShareSceneDesk` as its own slot.

---

## Previous session: 2026-08-27 (admin uploads: forced the read-write token, skipping stale OIDC)

**Summary**: Every upload on `/admin/media` (and the blog editor's uploader, same shared code path) 500'd with the generic "An unexpected error occurred" — `withErrorHandler`'s fallback message, logged server-side as `BlobOidcEnvironmentNotAllowedError: Vercel Blob: OIDC is enabled for this project, but not for the "development" environment.`. `@vercel/blob@2.8.0`'s `resolveBlobAuth()` tries `VERCEL_OIDC_TOKEN` (paired with `BLOB_STORE_ID`) before ever looking at `BLOB_READ_WRITE_TOKEN`, and picks it as soon as the env var is a non-empty string — it doesn't check expiry or whether the store's Vercel dashboard "Project Connection" actually permits OIDC for the current environment. `.env.local` has a `VERCEL_OIDC_TOKEN` left over from an earlier `vercel env pull` (decoding it: scoped to `environment:development`, a 12h token, long since expired), and this store's connection apparently isn't OIDC-enabled for Development regardless — so every upload took that branch and failed before `BLOB_READ_WRITE_TOKEN` (sitting right there in the same file, and perfectly valid) was ever tried.

Fix is in code, not `.env.local` (which `vercel env pull` will happily overwrite again): `uploadImage()` now passes `token: process.env.BLOB_READ_WRITE_TOKEN` explicitly to `put()`. `resolveBlobAuth` checks an explicit `token` option first, ahead of OIDC, so this can't regress the next time env vars get re-synced.

**Files changed**: `lib/blob-upload.ts`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`.

**Verified**: `tsc --noEmit` and `next lint` clean. Called `POST /api/admin/upload` directly from an authenticated admin session with a 1×1 PNG — `201`, a real `https://*.public.blob.vercel-storage.com/site/...` URL back, where before the fix this exact call 500'd. Test blob deleted afterward via a one-off `del()` script so the store doesn't accumulate throwaway test files.

---

## Previous session: 2026-08-27 (dropped the v1/v2/v3 comparison routes)

**Summary**: Asked which of the four service-detail treatments to keep — the original `/services/[slug]` page, or one of the three one-screen redesigns behind `v1`/`v2`/`v3` — the answer was the original: it is what is actually live, and it is the one to optimize going forward, not the redesigns. Deleted `services/[slug]/{v1,v2,v3}/page.tsx`, `components/services/detail/{ServiceDatasheet,ServiceEngagement,ServiceQuestions,StageGlyph}.tsx` and their three CSS modules. Nothing else linked to those routes (checked nav, `ServicesPageClient`, `sitemap.ts`), so this is a clean removal, not a redirect. `lib/service-content.ts` — the bilingual definitions/signals/scope/FAQ data written for the redesigns — is left in place unused: it is data, not a "version," and is the obvious source to draw on when the live page gets optimized next.

**Files changed**: deleted the six files above; `docs/PROGRESS.md`, `docs/CHANGELOG.md`.

**Verified**: `tsc --noEmit`, `next lint`, `next build` all clean after the deletion (once `.next`'s stale route-type stubs were cleared — `next build` had generated `.next/types/.../v1/page.ts` etc. that outlived the pages themselves). Confirmed `/services/system-development/v2` now 404s and `/services/system-development` still renders its process timeline and quote card correctly, in both languages.

---

## Previous session: 2026-08-27 (per-service V2 glyphs, full-height rail, tag/modal i18n)

**Summary**: V2's four stage glyphs were one fixed set reused across all six services — a rack blueprint under "Consulting" reads as a mistake, not a choice. `StageGlyph` now takes a `family` (the same six keys `ServiceIcon` already uses) and draws twenty-four glyphs instead of four, each stage reinterpreted through that service's own visual vocabulary: a rack/terminal for system development, a browser/globe for web platforms, an artboard/phone-screen for UI-UX, a lens/loop for consulting, a target/funnel for advertising, a lens/palette for brand. One motif repeats on purpose across all six families' fourth glyph — a small pulsing dot (a terminal cursor, a globe ping, a QA marker, a funnel's peak) — so despite six different frames, "Ship & Maintain" always reads as the stage that keeps running.

On a 1080p screen the leftover height below V2's content was a modest, intentional-looking bottom margin; on a 1440p+ monitor it was several hundred pixels of dead space under the footer. `.stages` now takes `flex: 1 1 auto` inside `.body` (`.foot` stays `flex: none`), so a taller viewport stretches the grid row instead of leaving a gap after it — each stage card's `margin-top: auto` detail block just settles further down inside a more generously proportioned card. Measured at 2560×1440: content now reaches y=1398 of a 1434 section bottom, versus y=1041 before.

Two i18n holes, both structural rather than missing strings: `service.tags` (`Architecture`, `Performance`, `Process`, `Design Systems`, `Brand Identity`, `Visual System`) was a flat `string[]`, so it never had a Chinese half to switch to — it's now `{ en, zh }` per service, threaded through every place that reads it (`ServiceDatasheet`, `ServiceEngagement`, `ServiceQuestions`, the generic `/services/[slug]` page, `ServicesPageClient`). And `QuoteModal` / `ContactForm` both hardcoded the literal string `"QUOTE.REQUEST"` in their header — never a translation key at all — now `contactForm.quoteEyebrow`.

**Files changed**: `components/services/detail/StageGlyph.tsx`, `components/services/detail/engagement.module.css`, `components/services/detail/ServiceEngagement.tsx`, `components/services/detail/{ServiceDatasheet,ServiceQuestions}.tsx`, `app/(public)/services/[slug]/page.tsx`, `components/services/ServicesPageClient.tsx`, `components/contact/{QuoteModal,ContactForm}.tsx`, `lib/services.ts`, `i18n/translations.ts`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`.

**Verified**: `tsc --noEmit` and `next lint` clean. All six families' four glyphs inspected with the draw animation frozen mid-cycle across `system-development`, `web-platforms`, `ui-ux-design`, `consulting`, `advertising`, `brand-design` — no misplaced or missing strokes. Fill fix measured at 2560×1440 and confirmed unaffected at 390px, where `.stages` has no extra height to grow into. Tag translation and the modal eyebrow confirmed by switching language on `/services/consulting/v2` (`Architecture` → `架構` etc.) and by opening the quote modal on both that page and `/about`, where `contactForm.quoteEyebrow` reads `報價需求` in both places.

---

## Previous session: 2026-08-25 (paired index, install timeline, normalised draws)

**Summary**: The `/ec-share` section subtitles stopped living across the gutter from their headline after two failed passes at aligning them there, and stack under it on a 42rem measure — which is what the `/services` heads had been doing all along. The six capabilities went two up: as full-width rows they ran 780px on a 1080 screen with most of each row's measure empty, and paired the section is 632px. The four install steps moved onto one shared line, the fill carrying into each gutter so the segments meet end to end, with a tick marking each stop; below 1024 the per-column rules stay. And the three quote drawings were rebuilt on `pathLength="1"` so nothing is scaled — the scope box had been growing on `scaleX`, thinning its own verticals.

---

## Previous sessions: 2026-08-25 (icon alignment, looping diagrams, framed index, step drawings)

**Summary**: The `/ec-share` hero icon became a square the exact height of the two-line headline, then grew to span the platform line as well; `--icon-size` is the sum of what it covers, which needed the eyebrow's line-height fixed rather than inherited. Making it fit took the title clamp from 4.6rem to 4.1rem, since the icon ate enough measure that "Every Android device," wrapped to a third line. The hero also took `min-height: 100svh`, because the fold used to land wherever the headline stopped — 73px shorter in Chinese — so "為裝置團隊打造" peeked in on one language and not the other.

Capability rows lost their 01–06 numerals and their diagrams stopped reading `--t`: each runs a closed CSS loop offset by a negative `--rd`, paused off screen, resolved to a rest frame under reduced motion. The install steps became a row of four with drawings on the same 48-unit bed, and both enumerations moved onto the tint band so the page alternates. The photo essay moved between them: capabilities, evidence, how to begin, then the ask.

`/services`: the practice index became a framed panel with dividers, a surface tint and a signal edge down the open row; its detail link became a button in the panel's bottom-right corner; the quote steps gained drawings; the case-study eyebrow got the motion rule it had been missing; both quote buttons lost their arrows. Reveal timing settled at `--p` starting at `0.8vh` over a `0.34–0.5vh` travel, after `pace="early"`'s first cut overshot.

---

## Previous session: 2026-08-25 (capability diagrams, arrow process)

**Summary**: `FeatureGlyph.tsx` gave each of the six `/ec-share` capabilities a monoline diagram on a 48-unit bed, in a new glyph column between the numeral and the name; the app icon moved out of its identity cluster to stand left of the headline. On `/services` the four process stages became one track with an arrowhead — vertical while stacked, horizontal once they are a row, the signal drawing along it as the section arrives — and the quote steps lost their separators. The diagrams read `--t` at this point; they moved to closed loops the next session.

---

## Previous session: 2026-08-25 (load entrance, product identity slot; services atelier shipped; ec-share editorial shipped)

Three sessions: `Scrub`'s load-enter fix for sections visible at mount, `/services` promoted to the atelier direction (three preview routes deleted), and `/ec-share` shipped its editorial direction (stage/console rejected). Full detail archived at [progress-archive/2026-08.md](progress-archive/2026-08.md).

---

## Previous sessions: 2026-08-25 and 2026-08-24 (superseded passes, harbour hero)

Two `/ec-share` passes before the editorial direction (a taste-skill preserve and a homepage clone), the harbour copy / plate-lift / hull-slosh session, and four homepage hero sessions — plate rigidity, plate as one HTML transform, waterline continued below the scene, hero submersion and heading reveals. All superseded or archived in full at [progress-archive/2026-08.md](progress-archive/2026-08.md).

---

## Earlier: 2026-08-24 (services grid vs taste-skill, page-wide motion system)

The services-grid taste pass and the session that gave `Scrub` its `--p` / `--q` split are archived in full at [progress-archive/2026-08.md](progress-archive/2026-08.md).

---

## Milestone status

| Milestone | % | Target date | Blockers |
|-----------|----|-------------|----------|
| **M0 Foundation** | **100%** | — | — |
| **M0.5 Internal Test Build** | **~70%** | +1 week | Day 9–12 (device-card, installer, tester guide) |
| **M1 EC-Share Core** | **0%** | ~2026-07-02 | EV cert; accent color |
| **M2 Identity & Licensing** | **web/backend partial** | M1 + 3 weeks | Production Stripe/DNS/keys; desktop JWT |
| **M3 Invite Share** | **0%** | M2 + 4 weeks | libdatachannel |
| **M4 Enterprise** | **0%** | M3 + 3 weeks | First Enterprise prospect |

---

## Active blockers (founder action required)

1. **EV code-signing cert** — blocks M1 installer.
2. **Production API contract handoff** — staging + secrets/DNS.
3. **Stripe HK account** — blocks M2 revenue.
4. **DNS on `easecity.hk`** — `api.`, `share.`, `dl.`, `ecshare.`.

See `docs/FOUNDER_TODO.md`.

---

## Active blockers (web team action required)

1. Production hosting, email, rate-limit, and deny-list storage choices.
2. Production secrets: Stripe Price IDs, webhook secret, Ed25519 key, hosted env.

See `docs/WEB_TEAM_TASKS.md`.

---

## Recent changes log

- 2026-08-27 — `servicesCaseEcShare` split out from `ecShareHero`; hero plate `sizes` fixed and exact upload dimensions added to its admin-visible `shape` text; rounded corners added to the `/ec-share` hero plate and scene mosaic (services case cards already had them; services' full-width hero band deliberately left square).
- 2026-08-27 — Product loop animations (news/game/social/youtube/gallery) redesigned bolder; monitor-mirror screen now glued to its bezel during grid re-flow; disconnecting a device no longer touches its own screen, only the monitor's copy; blog card entrance no longer slides in from the side; `/ec-share`'s "one desk, eight live screens" scene split into its own image slot instead of reusing the hero photo.
- 2026-08-27 — Registration Turnstile fixed across language switches; homepage blog skeleton matches real cards; first pass of five homepage product loop animations and device-disconnect interaction (superseded above).
- 2026-08-25 — `/ec-share` section heads move onto the index grid; install steps gain drawings; capability index joins the tint band; hero icon spans the platform line and headline. `/services` case eyebrow scrubs, detail button goes to the panel corner, quote buttons lose their arrows.
- 2026-08-25 — `/ec-share` install steps go four across and the photo essay moves between the two lists; hero eyebrow aligns to the icon; `/services` detail link becomes a button; reveal pulled back from the first `early` cut.
- 2026-08-25 — `/ec-share` hero icon aligned to the headline and the hero held to `100svh`; capability numerals dropped and their diagrams put on closed loops; `/services` index framed and quote steps illustrated; both pages reveal earlier.
- 2026-08-25 — Six capability diagrams on `/ec-share`; `/services` process becomes one arrow track; quote steps unruled.
- 2026-08-25 — `Scrub` sections on screen at mount enter on a clock; `/services` rules simplified; `/ec-share` gains an app icon slot and drops the column grid.
- 2026-08-25 — `/ec-share` dropped the homepage clone: centered enter hero, magnetic dock, station rail, evidence plates.
- 2026-08-25 — `/ec-share` now reuses homepage split / svc-grid / process-line / blog-rail / punch-in CTA.
- 2026-08-25 — `/ec-share` taste-skill preserve: split hero, surface grid, workflow rail, 1+2 gallery.
- 2026-08-25 — Seven harbour vessel/slosh tuning passes and the hero copy fade. Detail in [progress-archive/2026-08.md](progress-archive/2026-08.md).
- 2026-08-24 — Site motion pass, skyline PNG restores, Impeccable audit / harden / optimize. Same archive.

---

## Next planned work (when founder says go)

1. Remaining Impeccable P1s: `/impeccable adapt`, `/impeccable distill`.
2. `/impeccable polish` after those, or `/impeccable init` to write `PRODUCT.md`.
3. Resume M0.5 Day 9+ when product work resumes.

---

## How this file is maintained

Updated by the Cursor agent at the end of sessions that modify code or docs (`.cursor/rules/update-progress.mdc`).
