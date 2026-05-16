# Web / Backend Team — Tasks & Progress

> **Audience**: EaseCity web + backend engineer(s) working on `easecity.hk`, `api.easecity.hk`, `share.easecity.hk`, `dl.easecity.hk`.
> **Primary point of contact**: founder (Eric).
> **Source of truth for specs**: `docs/API_CONTRACT.md` — read this first.
> **Updated**: 2026-05-11 (logout + JWKS + download manifest discovery + Redis JWT deny-list + Stripe catalog verify script; API_CONTRACT §10 decision log closed)

---

## Legal entity — use this verbatim in footers, privacy policy, ToS, invoices

| Context | Exact string to use |
|---------|---------------------|
| Website footer (en) | `© 2026 EaseCity Technologies Limited. All rights reserved.` |
| Website footer (zh-Hant) | `© 2026 逸城科技有限公司。版權所有。` |
| Privacy Policy — "Data Controller" | `EaseCity Technologies Limited (HK Company)` |
| ToS — "Company" / "We" | `EaseCity Technologies Limited ("EaseCity", "we", "us")` |
| Stripe account holder | `EaseCity Technologies Limited` |
| Stripe statement descriptor (credit card bill, ≤22 char) | `EASECITY` or `EC-SHARE` (founder picks one) |
| Stripe invoice company name | `EaseCity Technologies Limited` |
| Contact email domain | `*@easecity.hk` |
| Jurisdiction clause | `Hong Kong SAR` |

**Do not** use just "EaseCity" or "EC-Share" in legal contexts — always use the full `EaseCity Technologies Limited` for binding text.

---

## Your scope (in one paragraph)

You own everything on the **web side** of EC-Share: the marketing website, the HTTPS API that issues license JWTs, Stripe subscription integration (Checkout + webhooks), user account management, and the WebRTC signaling server (coming at M3). The Windows desktop client (Cursor + founder are building) consumes your API over HTTPS. Clean contract = clean separation.

### 4 surfaces you ship

| Surface | URL | Purpose | Tech (you decide) |
|---------|-----|---------|-------------------|
| Marketing | `easecity.hk`, `ecshare.easecity.hk` | Landing, pricing, docs, download CTA | Next.js / Astro / plain HTML+CSS — your call |
| API | `api.easecity.hk` | Auth + license + account + Stripe webhook | Node / Python FastAPI / Go / your preferred stack |
| Signaling | `share.easecity.hk` | WebRTC SDP/ICE hub + share token issuer (M3+) | Go on Fly.io recommended (see `docs/SHARE_ARCHITECTURE.md` §3) |
| Download/Updater | `dl.easecity.hk` | Installer hosting + auto-update manifest | Cloudflare Pages / S3 / any static CDN |

---

## Required reading before you start

In order:
1. `docs/API_CONTRACT.md` — HTTPS endpoint + JWT + DB schema spec
2. `docs/SUBSCRIPTION_TIERS.md` — business logic (tiers, feature gates, 14-day trial, offline grace)
3. **NEW** `docs/DASHBOARDS_SPEC.md` — three backends you build (User / Staff / Org) with pages, roles, security model
4. **NEW** `docs/WEBSITE_CONTENT.md` — every page the site needs + content requirements + CTA funnel
5. `docs/PRODUCT_ROADMAP.md` §3 (team model) + §4 (cloud budget ceiling)
6. `docs/SHARE_ARCHITECTURE.md` (only relevant at M3)

---

## What the founder needs **from you** (please answer)

Resolved decisions are captured in `docs/API_CONTRACT.md` §10 (2026-05-11). Open **product** questions (DNS, legal copy, screenshots) remain below under milestone sections.

---

## What **you need** from the founder (fill as you work)

Founder will update these as items become available:

- [ ] **Stripe team invitation** to your email (founder invites you once HK account is approved; you then own Stripe products/prices/webhook setup)
- [x] **Statement descriptor decision**: **`EASECITY`** (≤ 22 chars, customer-card-bill text) ✅ confirmed 2026-04-23
- [ ] Domain DNS delegated / A-record pointing ready: ☐ api ☐ share ☐ dl ☐ ecshare
- [ ] Product screenshots for landing page (available after M0.5 ships)
- [ ] Marketing copy approvals / brand voice signoff from founder
- [ ] Logo assets (post-launch; wordmark OK for pre-launch)
- [ ] Accent color code (founder decides: orange vs blue)
- [ ] Privacy policy + ToS — founder drafts / CPA reviews before launch

**Note**: Stripe product/price IDs are **your output**, not founder's input. You create them in Stripe Dashboard and share back so the desktop client config can reference them.

---

## Task list by milestone

### 🔴 M2 critical path (aim to start during M1 development so you're ready)

#### Auth & license
- [x] `POST /api/v1/auth/email/request-otp` (§3.1 of API_CONTRACT) — implemented in current Next.js repo
- [x] `POST /api/v1/auth/email/verify-otp` (§3.2) — implemented; issues EC-Share license JWT
- [x] `POST /api/v1/auth/logout` (§3.5) — implemented; Redis deny-list when `UPSTASH_REDIS_*` set
- [x] `GET /api/v1/license/jwks` (§3.6) — public Ed25519 JWK + `kid` for desktop embedding
- [x] `GET /api/v1/download/latest-manifest` (§3.7) — discovery URL for dl.easecity.hk updater manifest
- [x] `POST /api/v1/license/refresh` (§4.1) — implemented with 44-day refresh grace
- [x] `GET /api/v1/account/me` (§4.2) — implemented
- [x] `POST /api/v1/account/change-email/request-otp` (§4.3a) — implemented
- [x] `POST /api/v1/account/change-email` (§4.3b) — implemented
- [x] `POST /api/v1/account/devices/rename` (§4.4) — implemented
- [x] `DELETE /api/v1/account/devices/{fingerprint}` (§4.5) — implemented; JWT invalidation via logout deny-list (`POST /api/v1/auth/logout`)

#### Stripe integration — **web team owns end-to-end after founder's KYC**

Founder handles: HK account KYC approval + invites you as Stripe team member with Developer role. Everything below is yours:

- [ ] **In Stripe Dashboard** (after founder invites you):
    - Create products + prices per SUBSCRIPTION_TIERS.md §1:
        - `price_pro_monthly` = $19 USD / month
        - `price_pro_annual` = $190 USD / year
        - `price_business_monthly` = $49 USD / month
        - `price_business_annual` = $490 USD / year
        - `price_enterprise_annual` = $2,499 USD / year (anchor; actual Enterprise deals custom-priced)
    - Enable **Stripe Tax** ($120/yr or 0.5% revenue minimum) — see SUBSCRIPTION_TIERS.md §6
    - Set Price metadata: `product = "ec_share"` and `tier = "pro"` / `"business"` / `"enterprise"` so webhook + checkout map cleanly
    - Enable Customer Portal (Settings → Billing → Customer Portal) and configure which features customers can self-serve
    - Generate webhook signing secret; store in backend secrets (e.g. Vercel env)
    - Confirm with founder: statement descriptor (`EASECITY` or `EC-SHARE`) + save to account settings
    - Send founder the **5 price IDs** once created — he'll paste them back in FOUNDER_TODO.md so they flow to the desktop client config
- [x] **In your backend code**:
    - Pricing page + server action creates Stripe Checkout sessions from allowed Price IDs (`src/actions/stripe.ts`)
    - Stripe Customer Portal redirect server action implemented for dashboard settings
    - Webhook endpoint `POST /webhooks/stripe` with signature verification implemented
    - Compatibility webhook endpoint `POST /api/payment/webhook` forwards to the same handler for older staging configs
    - Webhook handlers for the events listed in API_CONTRACT §5 implemented
    - Price → tier mapping implemented via Stripe Price metadata with env-var fallback (`src/lib/stripe-catalog.ts`)
    - Test-mode development path documented in `.env.example` and `docs_legacy/STAGING_ENV_CHECKLIST.md`

#### Database
- [x] Postgres schema from API_CONTRACT §7 implemented in Prisma (`User`, `Organization`, `OrgMember`, `EmailOtpChallenge`, `Trial`, `Subscription`, `Device`)
- [x] Baseline Prisma migration exists at `prisma/migrations/20260427172000_ec_share_m2_foundation`

#### Ed25519 keypair
- [x] License JWT signing/verification implemented with Ed25519 (`src/lib/license-jwt.ts`)
- [x] Dev key-generation helper exists (`npm run ecshare:key`)
- [ ] Generate production signing keypair
- [ ] Store production private key in hosting secrets (Fly.io secrets / env var / HashiCorp Vault)
- [ ] Publish production public key — **need to send to founder so it gets embedded in desktop client binary**
- [x] Document key ID (`kid`) in JWT header — start with `2026a`

### 🟡 M1 website path (parallel, not blocking desktop client)

- [ ] Landing page hero ("Android device mirroring for teams." — see BRAND.md)
- [ ] Pricing page (3 tiers display; see SUBSCRIPTION_TIERS.md §1)
- [ ] Download page (direct download link OK)
- [ ] Features page (screenshots from M0.5)
- [ ] Docs (quickstart, troubleshooting, FAQ from SUBSCRIPTION_TIERS.md §8)
- [ ] Privacy policy + ToS
- [ ] Newsletter signup (leads for launch)
- [ ] Blog skeleton (for SEO content marketing)
- [ ] **🆕 i18n**: all M1 website pages translated to **7 launch locales** per D-32: en / zh-Hant / zh-Hans / ja / ko / pt-BR / es. Translation workflow = GPT-4 + Crowdin (free tier for open projects); each page kept in parallel ARB-like format. Founder approves copy; web team runs the translation pipeline.

### 🟢 M3 path (signaling server for cross-network share)

- [ ] Signaling server in Go (scaffold on Fly.io)
- [ ] WebSocket hub with session pairing
- [ ] Share token issuance (`POST /api/share/create`)
- [ ] Share token revocation (`POST /api/share/revoke`)
- [ ] Signaling logs → Postgres (session metadata, not content)
- [ ] Browser viewer static page on Cloudflare Pages
- [ ] TURN server deployment on DigitalOcean (HK + US-East)

### 🟣 M3 new items — dashboard device list + protocol handler (D-37, D-38)

- [ ] **Device list API**: `GET /api/v1/account/devices/live` returns devices currently heartbeating to `api.easecity.hk` with their reachable endpoint. Each entry includes:
    - `alice_endpoint` — single **`host:port`** string (video port 28100 is canonical; see API_CONTRACT §6 "Host-endpoint format convention" D-40). Web backend never emits two ports.
    - `device_id`, `serial`, `alias` (nickname user set via desktop's device-card ActionBar — persisted client-side and reported via heartbeat, D-47)
    - `last_seen_at`, `device_phase`
    - `video_codec` + `video_encoder` (so dashboard can hint "H.264 / software encoder" in the device row, helpful for enterprise diagnostics)
- [ ] **⚠ NOTE — Cloudflare tunnel dropped from M0.5 (D-39, 2026-04-24)**: do NOT assume Alice's endpoint is ever a `*.trycloudflare.com` URL. It will be LAN IP / Tailscale IP / VPN IP / public IP (with manual port forward). If desktop later opts into tunnels again, this will be a separate `tunnel_endpoint` field distinct from `alice_endpoint`.
- [ ] **Per-row "Open in app" button** on dashboard's Home page:
    - Calls `POST /api/v1/share/create-native` to mint a short-lived JWT
    - Generates deep link: `ec-share://connect?host=<endpoint>&device_id=<id>&alias=<url-encoded-alias>&token=<jwt>`
    - On click, uses `<a href="ec-share://…">` — Windows/macOS dispatches to installed `ec-share.exe`
    - If app not installed, fallback UI shows "Install EC-Share" + small "Open in browser (experimental)" secondary button
    - **Alias** is passed so Bob's desktop shows "Opening Eric's Pixel 7…" in the loading skeleton rather than "Opening device …"
- [ ] **Per-row "Open in browser" fallback button** (M3 only, gated until WebRTC ships):
    - Calls `POST /api/v1/share/create` (same as invite-link share) to mint token
    - Redirects to `https://share.easecity.hk/v/<token>?device_id=<id>`
- [ ] **Short-lived native-connect JWT schema** (new vs share-link JWT):
    ```json
    {
      "sub": "session_abc123",
      "host": "192.168.1.42:28100",  ← single host:port string; see API_CONTRACT §6 (D-40)
      "device_id": 0,
      "alias": "Eric's Pixel 7",      ← device nickname set on Alice's desktop (D-47); optional
      "self": true | false,           ← true if same user; bypasses owner-check
      "user_id": "usr_xyz",
      "exp": <epoch + 5 minutes>,
      "role": "operator" | "viewer"
    }
    ```
- [ ] **Alice-side heartbeat endpoint** (web team + Cursor agent work shared): `POST /api/v1/host/heartbeat` from running `ec-share.exe` → registers its reachable endpoint; dashboard learns which of user's machines is online and what host string to use. Sends every 60s. Heartbeat body:
    ```json
    {
      "machine_fingerprint": "sha256_hex_64chars",  ← identifies Alice's physical PC
      "alice_endpoint": "192.168.0.113:28100",      ← single host:port per D-40
      "devices": [
        { "device_id": 0, "serial": "HT86K0200481", "alias": "Eric's Pixel 7", "phase": "online", "video_codec": "h264", "video_encoder": "OMX.google.h264.encoder" },
        ...
      ],
      "app_version": "0.0.5-alpha.1",
      "heartbeat_version": 1
    }
    ```
    Web backend merges this into the live-devices view served by `GET /api/v1/account/devices/live`.

### 🔵 M4 Enterprise surface

- [ ] WorkOS integration for SAML/OIDC (see ROADMAP D-05)
- [ ] Admin dashboard for Enterprise customers (user/device management)
- [ ] Audit log export (SIEM forward to Splunk/Datadog)
- [ ] Docker Compose package for on-prem self-host (per ROADMAP D-16, SH-08)
- [ ] **Org-level custom actions** (builds on D-46): Enterprise tier org-admin can push a shared `custom_actions.apps[]` and `custom_actions.adb[]` config to all seats; desktop's Settings → Host → Custom actions gets a "Managed by org admin" section above the user's personal list. Requires:
    - `GET /api/v1/org/{slug}/custom-actions` — returns shared list
    - `PUT /api/v1/org/{slug}/custom-actions` — org admin updates
    - Desktop fetches on license refresh and merges (org list read-only for members)
- [ ] **Device alias sync** (builds on D-47): Enterprise tier org can share device aliases across members (so when a phone moves between desks, everyone sees the same "Eric's Pixel 7" label). Requires:
    - `GET /api/v1/org/{slug}/device-aliases`
    - `PUT /api/v1/org/{slug}/device-aliases/{serial}`
    - Desktop resolves alias priority: org-shared > personal > serial fallback

---

## Progress log (web team updates this, or founder relays updates)

| Date | Who | Update |
|------|-----|--------|
| 2026-05-05 | Cursor | Reconciled web/backend contract against current Next.js implementation: M2 routes use `/api/v1/*` + `{ success, data, meta }` envelope; auth/license/account/device APIs are implemented; Stripe webhook supports `/webhooks/stripe` plus legacy `/api/payment/webhook`; production Stripe/DNS/key material remain founder/web-team deployment tasks. |
| 2026-04-23 | founder | Created this doc; will forward to web team with API_CONTRACT.md |

---

## Info the founder will feed to you (periodic updates)

The founder will periodically append updates to this file's progress log when:
- Stripe IDs are ready
- EV cert procured (affects download signing workflow at Squirrel.Windows update channel)
- DNS records live
- Brand assets finalized
- Alpha tester feedback that changes API surface

The Cursor agent keeps `docs/PROGRESS.md` up to date; the web team can subscribe to that file for changes.
