# 📦 EC-Share Web Team — Read-Me-First

Welcome. You're the backend/frontend engineer(s) building the **web side** of EC-Share (EaseCity Technologies Limited's first commercial product).

**The Windows desktop client is being built in parallel by the founder + Cursor. You own everything web.**

---

## What's in this zip

| # | File | Purpose | Read priority |
|---|------|---------|---------------|
| 1 | `_WEBTEAM_README.md` (this file) | Orientation + reading order | **Read first** |
| 2 | `COMPANY_ARCHITECTURE.md` | Multi-product umbrella architecture (foundational) | **🔴 Read before coding anything** |
| 3 | `API_CONTRACT.md` | HTTPS endpoints + JWT shape + DB schema spec | 🔴 Critical path |
| 4 | `SUBSCRIPTION_TIERS.md` | Business logic: tiers, 14-day trial, feature gates, offline grace | 🔴 Critical path |
| 5 | `DASHBOARDS_SPEC.md` | Three dashboards you build: User / Staff Admin / Customer Org Admin | 🔴 Critical path |
| 6 | `WEBSITE_CONTENT.md` | Every page the site needs + content requirements + CTA funnel | 🟡 M1 parallel |
| 7 | `WEB_TEAM_TASKS.md` | Your task list + progress tracker + what founder owes you | 🟡 Living doc |
| 8 | `BRAND.md` | Legal entity, visual direction, verbatim strings for footer/ToS | 🟢 Reference |
| 9 | `SHARE_ARCHITECTURE.md` | WebRTC + TURN signaling design (M3 only; skip for now) | ⏸ M3 |
| 10 | `PRODUCT_ROADMAP.md` | M0-M5 milestones + full decision log (33+ decisions) | 🟢 Reference |
| 11 | `PROGRESS.md` | Living project status (Cursor agent auto-updates; subscribe to file changes) | 🟢 Reference |
| 12 | `CHANGELOG.md` | Engineering change history | 🟢 Reference |

---

## Recommended reading order (90-120 minutes total)

1. **COMPANY_ARCHITECTURE.md** — 20 min. Understand the umbrella model before anything else. Prevents 6-month rewrites.
2. **API_CONTRACT.md** — 30 min. Your primary spec. JWT shape is load-bearing.
3. **SUBSCRIPTION_TIERS.md** — 20 min. Understand what a "Trial" / "Pro" / "Business" tier actually means.
4. **DASHBOARDS_SPEC.md** — 20 min. Three separate backends. Don't merge them.
5. **WEB_TEAM_TASKS.md** — 15 min. Your actionable task list, sorted by milestone.
6. **WEBSITE_CONTENT.md** — 15 min. Page-by-page content requirements.

---

## What founder is doing in parallel

- Building Windows desktop client (M0.5 internal test → M1 polished release)
- Procuring EV code-signing cert (3-10 business days KYC)
- Opening Stripe HK account → will invite you as Developer-role team member
- DNS setup on `easecity.hk` (subdomain list in WEB_TEAM_TASKS.md)

**You don't wait for any of this.** Start against Stripe test-mode keys, local Postgres, mocked auth.

---

## Top 5 questions that need YOUR decision (answer and send back)

From `API_CONTRACT.md` §10 — founder needs your answers to move forward:

1. Email delivery provider: **SendGrid / Postmark / SES**?
2. JWT key rotation schedule: **annual / semi-annual**?
3. Revoked-JWT deny list storage: **Redis / Postgres**?
4. Rate-limit storage: **in-process / Redis / Cloudflare**?
5. Backend hosting: **Fly.io / Railway / Vercel / AWS / your pick**?

Reply to founder via email/Slack with your picks + rough M2 timeline estimate.

## May 2026 addendum — contract reconciliation

The current Next.js implementation in this repo is ahead of the original v0.1 web-team checklist. Trust `API_CONTRACT.md` v0.2 for the desktop-facing API shape:

| Area | Current contract |
|---|---|
| API paths | Desktop-facing M2 routes use `/api/v1/*`, e.g. `POST /api/v1/license/refresh` |
| Response shape | Implemented API routes return `{ success, data, meta }`; desktop clients must read payloads from `data` |
| Stripe webhook | Prefer `POST /webhooks/stripe`; legacy `POST /api/payment/webhook` forwards to the same handler |
| Implemented M2 foundation | OTP login, license refresh, account lookup, change-email, device rename/delete, Prisma schema, Stripe webhook, and license JWT signing are present |
| Still deployment-blocked | Production Stripe products/price IDs, production Ed25519 key material, DNS, hosted secrets, and desktop public-key embedding |

## Late-April 2026 addendum — decisions that impact your work

Founder + Cursor agent ratified decisions D-39 through D-49 during Apr 23-24 UX design passes. The highlights that affect **your** code:

| Decision | What it means for web team |
|---|---|
| **D-39** | Cloudflare tunnel **dropped from M0.5**. Don't design around `*.trycloudflare.com` URLs in API responses. A future optional tunnel integration would live in a separate `tunnel_endpoint` field, not conflated with `alice_endpoint`. |
| **D-40** | Desktop UI unifies "host" as a **single `host:port` string**. Backend must persist and emit exactly that format (see API_CONTRACT §6 new section). Control port is a desktop implementation detail; don't model two ports server-side. |
| **D-44** | M1 may ship true single-socket desktop protocol. No schema change expected, but be aware when tempted to "optimize" around the two-port assumption. |
| **D-45 ~ D-49** | Desktop adds device ActionBar with custom actions + nickname edit. Impact on you: the heartbeat body (`POST /api/v1/host/heartbeat`) now carries per-device `alias`, `video_codec`, `video_encoder` — see WEB_TEAM_TASKS.md M3 section for full shape. |
| **D-46 (Enterprise)** | M4 org-level custom actions: `GET/PUT /api/v1/org/{slug}/custom-actions`. Placeholder in WEB_TEAM_TASKS.md Enterprise section. |
| **D-47 (Enterprise)** | M4 org-shared device aliases: `GET/PUT /api/v1/org/{slug}/device-aliases`. Same section. |

---

## How to stay in sync with the desktop team

- `PROGRESS.md` is updated every time the Cursor agent (working on desktop) makes a change. Subscribe to changes on that file (GitHub / Dropbox watch) to stay current without meetings.
- When desktop releases M0.5 (internal tester build, ~2-3 weeks from 2026-04-23), you'll get screenshots + GIFs usable for the landing page.
- When desktop ships M1 (~10-14 weeks out), your backend must be able to issue JWTs and receive Stripe webhooks.

---

## Contact

- Founder: via email or Slack (channels founder will share)
- Cursor agent (desktop): not addressable directly; all decisions flow through founder

---

## Versioning

These docs are v0.2+ each. Founder + Cursor iterate rapidly. **Check PROGRESS.md weekly for the summary of changes** — that's the lowest-cost way to stay current. If an earlier version is attached in a different zip, trust the latest ZIP's `CHANGELOG.md` to tell you what changed.
