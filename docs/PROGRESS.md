# EC-Share — Current Progress

> **Living document.** Updated every Cursor session that touches code or docs.
> Older session notes: [progress-archive/2026-08.md](progress-archive/2026-08.md).

---

## Last session: 2026-08-24 (page-wide motion system)

**Summary**: Replaced the homepage's ad-hoc scroll motion with one system. `Scrub` now emits two variables — `--p` for entrance (settles) and `--q` for sustained parallax (never settles) — so the page has continuous depth instead of entrance-only fades; before this, every `--t` saturated and the whole page below the hero went static. Collapsed twenty bespoke scrub windows and seven lift distances onto one window plus a three-step lift scale, so a section title travels the same distance everywhere. `will-change` is now scoped to sections being scrubbed (was permanent on several elements page-wide); offscreen sections are no longer measured or written. Hero switched to depth exit now that the pin constraint is lifted: the harbour plate (buildings + vessels + water, coupled by `--plate-lift` because the water band overlaps the building bases) leads at -7vh while the moon lags at -1.4vh.

**Verified**: production build clean; measured 29px sustained art/copy differential in products with `--p` already at 1; no scrubbed element stranded below full opacity at rest; only near-viewport sections carry `data-scrubbing`.

**Files changed**: `Scrub.tsx`, `globals.css`, `docs/PROGRESS.md`, `docs/CHANGELOG.md`.

**Earlier the same day**: Hero haze + horizon handoff, blog pier line, services feature panel and diagonal landing; Emil motion bar applied site-wide.

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

- 2026-08-24 — Site motion pass: command palette instant; hero fade/depth ease-out; homepage scrub GPU-only.
- 2026-08-24 — Restored uncompressed skyline PNGs and random hull-chop ripple dashes.
- 2026-08-24 — Restored uncompressed skyline PNGs and vessel hull wake rings.
- 2026-08-24 — `/impeccable optimize`: themed WebP skyline + paused/capped `CityField` / `HarbourWater` RAF.
- 2026-08-24 — `/impeccable harden`: skip link, single main, bilingual nav/chat/admin chrome, chat abort + Esc.
- 2026-08-24 — Installed Impeccable and completed a full-site UI audit (`12/20` Acceptable). See session canvas.
- 2026-08-24 — Harbour hero: mountain layer, light/dark skyline, waterline and vessel alignment. Detail in [progress-archive/2026-08.md](progress-archive/2026-08.md).

---

## Next planned work (when founder says go)

1. Remaining Impeccable P1s: `/impeccable adapt`, `/impeccable distill`.
2. `/impeccable polish` after those, or `/impeccable init` to write `PRODUCT.md`.
3. Resume M0.5 Day 9+ when product work resumes.

---

## How this file is maintained

Updated by the Cursor agent at the end of sessions that modify code or docs (`.cursor/rules/update-progress.mdc`).
