# EC-Share — Product Roadmap (v0.2)

> **Status**: founder-confirmed milestones, team model, and cloud budget. Scope per milestone locked; durations are estimates under solo + Cursor model.
> **Last updated**: 2026-04-23
> **Repo codename**: MUPhone3
> **Shipping product name**: **EC-Share** (parent: EaseCity)

---

## 0. Positioning

> **EC-Share is a Vysor-class Android mirroring & sharing product — but modern, multi-device, and team-native.**

See `BRAND.md` for full positioning and tagline. See `SUBSCRIPTION_TIERS.md` for commercial model. See `SHARE_ARCHITECTURE.md` for cross-network share design. See `API_CONTRACT.md` for the HTTPS contract between desktop client and EaseCity backend.

---

## 1. Architecture transition: MUPhone3 → EC-Share

### What stays (~80% of MUPhone3 code)
- C++ server: scrcpy-server launch, encoder probe, NAL broadcast, TCP video/control ports
- Native Windows plugin: D3D11 + MFT H.264/H.265 decoder, DirectComposition compositor
- Flutter Windows UI: state machines, multi-device grid, keyboard shortcuts
- Server-side operational skills: `muphone-scrcpy-param`, `muphone-parity-sync`, `scrcpy-upgrade-pilot`

### What changes
- **Packaging**: two exes → one `ec-share.exe` with `--server-only`, `--client-only <url>`, default = hybrid
- **Transport layer**: LAN-only TCP → LAN TCP + optional WebRTC+TURN for invite-share (M3)
- **Identity**: none → email login + license JWT + 14-day trial + 44-day offline window
- **UI**: engineering dashboard → consumer-grade onboarding + Vysor-style focus mode
- **Branding**: "MUPhone Server/Client" labels → EC-Share wordmark, EaseCity domain

### What's brand-new (0%)
- Auto-update channel
- Code-signed installer (EV cert)
- Cloud signaling server + TURN relay
- Stripe subscription integration (via EaseCity backend team, we consume API only)
- License / entitlements layer
- First-run wizard (adb/vendor driver setup)
- RBAC + audit log (M4)
- SSO (M4)

---

## 2. Milestones

Each milestone must be **shippable** (can run, can demo, can receive money where applicable). Durations assume **solo founder + Cursor pair-programming** unless flagged otherwise.

### **M0 — Foundation (DONE)**
- ✅ Windows-only build pipeline (server + Flutter client)
- ✅ Per-device codec probe + H.264/H.265 ladder
- ✅ Health monitor AND-bug fix (60s forced restart)
- ✅ Config portability + absolute path lint
- ⏸ AV1 Layer 3 deferred to M4 reassessment

### **M0.5 — Internal Test Build (Self-host Alpha)** → **~2 weeks** → 3-5 internal testers
**Goal**: fastest dogfood. Rebranded, single-binary, zip-distributed, LAN-only. No login, no cloud, no billing. See `docs/INTERNAL_TEST_BUILD.md` for full spec.

| Work item | Est. | Notes |
|-----------|------|-------|
| Rebrand MUPhone → EC-Share / EaseCity | 0.5 day | Codebase strings, UI, binary names |
| Single-binary merge (server + client → `ec-share.exe` with mode flags) | 3-5 days | Hybrid mode default |
| Focus mode (tap grid cell → 1×1 fullscreen) | 1-2 days | Vysor parity, Flutter layer only |
| "Copy local share URL" button (LAN share, D-17) | 0.5 day | `http://<local-ip>:28100` to clipboard |
| Zip installer (`install.bat`, vendor bins bundled) | 1 day | No EV cert yet; SmartScreen warning OK for testers |
| Tester guide PDF/Markdown + distribution | 0.5 day | Email zip + Discord feedback channel |

**Out of scope (forbidden in M0.5)**: login, licensing, Stripe, EV cert, auto-update, UI overhaul, i18n, cloud share. See INTERNAL_TEST_BUILD.md §3.

**Exit criteria**: 3+ internal testers complete ≥1 session with real Android device; no showstopper bugs; feedback triaged into M1 backlog.

### **M1 — EC-Share Core** → **~10 weeks, target 2026-07-02** → releases **Pro tier** (with 14-day trial)
**Goal**: the product feels like a product, not an engineering demo. First paying user week 1 after launch.

| Work item | Est. | Owner | Notes |
|-----------|------|-------|-------|
| Rebrand MUPhone → EC-Share / EaseCity in code + UI strings | 0.5 wk | me | Search/replace + wordmark everywhere |
| Single-binary packaging | 1 wk | me | Merge `muphone-server.exe` + `muphone_client.exe` behind `ec-share.exe` + mode flags |
| First-run wizard | 1 wk | me | Detect missing ADB drivers / vendor bins → guided download |
| UI overhaul (Linear/Raycast style, zh-HK + en) | 2 wk | me + optional UI contractor | Flutter: rounded cards, command palette, keyboard-first nav |
| Single-device focus mode | 1 wk | me | Vysor parity: grid cell → fullscreen |
| Auto-update (Squirrel.Windows) | 1 wk | me | Signed delta updates, no UAC |
| Code-signed installer (EV cert) | 0.5 wk code + up to 2 wk vendor wait | me | Identity verification 3-10 business days, start week 1 |
| i18n scaffold zh-HK + en | 0.5 wk | me | Flutter `intl`; zh-Hant default for HK market |
| Telemetry (opt-in, anonymous) | 0.5 wk | me | Session count, codec, crashes — no device content |
| QA + polish buffer | 1 wk | me | |

**Parallel track (founder): procure EV cert immediately (3-10 business days verification)**

**Exit criteria**: installable by a non-dev from `easecity.hk/ec-share`, works out of box with a plugged-in Android, feels premium, installs without SmartScreen warning.

### **M2 — Identity & Licensing** → **~3 weeks, dependent on M1** → tiers can actually collect money
**Goal**: login + tier gating, so M1's trial converts to paying Pro.

| Work item | Est. | Owner | Notes |
|-----------|------|-------|-------|
| Login UI (email + OTP primary, Google OAuth optional) | 1 wk | me | See `API_CONTRACT.md` §3 |
| License fetch + local JWT cache | 0.5 wk | me | |
| 14-day trial flow (start, reminder at day 7/12/14, expire) | 0.5 wk | me | Machine fingerprint + email on backend |
| Feature gate infrastructure (Entitlements API in C++ + Dart) | 0.5 wk | me | See `SUBSCRIPTION_TIERS.md` §5 |
| Account settings UI (email, tier, device management, logout) | 0.5 wk | me | |
| Stripe integration (webhook → license issuance) | 1 wk | **EaseCity web team** | Server-side; see `API_CONTRACT.md` §5 |
| Offline grace logic (14d full + 30d read-only) | 0.5 wk | me | |
| Integration testing trial → Pro paid upgrade flow end-to-end | 0.5 wk | me + web team | |

**Exit criteria**: a paying Pro customer gets Pro features, a trial user gets 14 full days, trial expires cleanly, everything still works offline for 14 days.

### **M3 — Invite Share** → **~4 weeks** → releases **Business tier**, the differentiator
**Goal**: "share this device with my client" works across any network. See `SHARE_ARCHITECTURE.md` for full spec.

| Work item | Est. | Owner | Notes |
|-----------|------|-------|-------|
| Signaling server (Go, single-file) on **Fly.io** | 1 wk | me | WSS hub, token issuance, session log |
| Alice-side WebRTC integration (native plugin) | 1.5 wk | me | libwebrtc or mediasoup-client C++ bindings |
| Bob-side browser viewer page (static HTML+JS) | 0.5 wk | me | On `share.easecity.hk`, Cloudflare Pages |
| Short-lived JWT invite tokens | 0.5 wk | me + web team | Ed25519 signed by signaling server |
| Self-hosted coturn on DigitalOcean | 0.5 wk | me | $18/mo, US region first |
| Viewer role controls (viewer vs operator) | 0.5 wk | me | Via RTCDataChannel scope |
| 30-day audit log (Business tier) | 0.5 wk | web team | Store session metadata only |
| End-to-end cross-network test (HK → US coffee shop) | 0.5 wk | me | |

**Exit criteria**: founder shares device link with random client over coffee-shop Wi-Fi, video works in < 3 seconds, client never installs anything, Business tier purchase unlocks multi-viewer.

### **M4 — Enterprise** → **~3 weeks + sales work**
**Goal**: pass security review at a Fortune 500.

| Work item | Est. | Owner |
|-----------|------|-------|
| RBAC (admin / operator / viewer / auditor roles) | 1 wk | me |
| Audit log upgrade (unlimited retention + SIEM export) | 0.5 wk | me + web team |
| SSO via WorkOS ($125/mo saves 2 months of SAML/OIDC engineering) | 1 wk | web team |
| On-prem deployment Docker Compose | 0.5 wk | me |
| Reassess AV1 Layer 3 | 0.5 wk | me |

**Exit criteria**: signed first Enterprise contract.

### **M5 — Cross-platform & Polish (ongoing)**
- macOS / Linux client (if demand exists post-launch)
- iOS mirroring (different approach — AirPlay receiver or vidstream)
- Performance: predictive low-latency mode, adaptive bitrate, client-side packet-loss concealment
- Accessibility: screen-reader support, high-contrast mode

---

## 3. Team model

**Confirmed**: **solo founder + Cursor (me) pair-programming**, with **EaseCity web team** owning the HTTPS backend (API in `API_CONTRACT.md`).

### What only the founder must do (non-delegable)
- EV code-signing cert procurement (identity verification, business docs)
- Stripe HK account setup + bank wire
- Domain DNS configuration (`easecity.hk`, `share.easecity.hk`, `api.easecity.hk`, `dl.easecity.hk`)
- Trademark filing (post-launch if traction, per BRAND.md B-06)
- Sales conversations for Enterprise (M4+)
- Pricing experiments & customer support triage

### What can be outsourced
- Logo / brand identity (post-launch, per BRAND.md; Fiverr/Dribbble $200-500 when ready)
- UI/UX polish beyond Flutter baseline (optional contractor in M1 UI overhaul week)
- Marketing copy / SEO site content (cheap via Upwork or write yourself)
- Video tutorials (post-launch, fiverr voiceover artist)

### What the EaseCity web team owns
See `API_CONTRACT.md`. Critical path items for M1-M2 launch:
- `POST /api/trial/start`
- `POST /api/license/activate`
- `POST /api/license/refresh`
- `POST /api/auth/email-otp` (start + verify)
- Stripe webhook consumer (`customer.subscription.*` → reissue JWT)
- Postgres schema (users, licenses, subscriptions, trials)

### Tasks I (Cursor) can autonomously complete in code
Server/client side: single-binary refactor, UI overhaul, first-run wizard, auto-update integration, feature gate infra, WebRTC integration, coturn config, installer packaging, i18n scaffolding.

### Tasks the founder must decide
All of §5 open questions below + any customer-facing copy tone.

---

## 4. Cloud infrastructure budget (Year 1, founder-confirmed ceiling)

**Target ceiling: $150/month average over Y1 months 1-6; ramp to $300/month by Y1 month 12.**

| Line item | Month 1-3 (pre-launch) | Month 4-6 (post-launch, ~100 users) | Month 7-12 (~500 users) |
|-----------|------------------------|--------------------------------------|-------------------------|
| Fly.io signaling server | $5 | $20 | $40 |
| DigitalOcean coturn (1 region) | $0 (not yet) | $18 | $36 (2 regions HK + US) |
| EV code-signing cert (amortized) | $25 | $25 | $25 |
| Stripe Tax | $0 | ~$10 | ~$40 |
| Postgres (Supabase free / Render $7 after) | $0 | $7 | $25 |
| Cloudflare Pages (static viewer) | $0 | $0 | $0 |
| Domain + DNS | $1 | $1 | $1 |
| Buffer / observability (Sentry / Grafana Cloud free) | $0 | $10 | $30 |
| **Total / month** | **$31** | **$91** | **$197** |

**Y1 total cloud + cert spend**: ~$1,400 (very conservative) to ~$2,400 (if usage tracks to upper plan).

**Notes**:
- Stripe's 2.9% + $0.30 per charge is **not** in this table; that's cost of revenue, not infra.
- TURN bandwidth is the wildcard. If your share sessions are heavy (Enterprise customers streaming 6-hour QA sessions), add $50-100/mo from month 6 onward. See `SHARE_ARCHITECTURE.md` §5 for cost model.
- WorkOS ($125/mo) kicks in only when M4 ships. Not counted in Y1 M1-M2 budget.

---

## 5. Localization (i18n) plan

**Confirmed (D-32, superseding earlier D-11)**: M1 launches with **7 locales covering ~75% of global Android-developer population**:

| Priority | Locale | ARB file | Market rationale |
|---------|--------|----------|---------|
| 1 | **en** (English) | `intl_en.arb` | Global default; SEO + Product Hunt + HN |
| 2 | **zh-Hant** (繁體中文, HK/TW) | `intl_zh_Hant.arb` | EaseCity home market |
| 3 | **zh-Hans** (简体中文, PRC) | `intl_zh_Hans.arb` | World's largest single Android dev market |
| 4 | **ja** (日本語) | `intl_ja.arb` | Highest-paying Android dev market in APAC |
| 5 | **ko** (한국어) | `intl_ko.arb` | QA/enterprise buyer density highest globally |
| 6 | **pt-BR** (Português, Brasil) | `intl_pt_BR.arb` | Largest Latin-American dev market; heavy scrcpy users |
| 7 | **es** (Español, LATAM+ES) | `intl_es.arb` | Covers rest of LATAM + Spain |

### Phase 2 locales (M2-M3 expansion based on usage data)
Deferred but reserved: de, fr, ru, it, tr, id-ID, vi, hi, ar (Arabic requires RTL layout work).

### Implementation notes
- Flutter `intl` package with ARB files at `client/lib/l10n/intl_<locale>.arb`.
- Default locale: follow OS locale; fallback order en → zh-Hant → zh-Hans → ja → ko → pt-BR → es.
- UI text externalized from day 1 of M1 (not retrofitted from M0.5).
- Server log / engineer-facing text stays English-only (ops efficiency).
- Translation workflow: GPT-4 + human native-speaker review on Crowdin (free tier for open projects; paid ~$30/mo for us).
- Website (easecity.hk) matches the same 7 locales at M1 launch (web team coordinates translation with founder).
- Source-of-truth locale is **en**; all other locales are downstream translations kept in sync via `ec-share-i18n` repository (managed by Crowdin).

---

## 6. Go-to-market alignment

| Milestone | Who buys | How they hear about us | Test hypothesis |
|-----------|----------|-----------------------|-----------------|
| M1 ships | Individual devs / QA + small teams (Pro) | SEO ("scrcpy GUI", "Vysor alternative", "Android mirror tool"), ProductHunt, Reddit r/android_dev | Pro at $19/mo converts ≥10% from trial |
| M2 ships | Paying Pro subscribers | Same + tier-specific content | Sub churn ≤ 6% monthly |
| M3 ships | Business (3-10 seat teams) | Slack/Discord referrals, viral "share-a-device" loop | Business conversion ≥ 10% of active Pro users after 90d |
| M4 ships | Enterprise (50+ seat orgs) | Outbound sales, security review–friendly pitch | First signed contract within 60d of M4 launch |

---

## 7. Decision log

| ID | Decision | Date | Rationale |
|----|----------|------|-----------|
| D-01 | Defer AV1 Layer 3 | 2026-04-23 | OBU demuxer is 1-2 days; product-market fit matters more. Revisit at M4. |
| D-02 | Single-binary architecture | 2026-04-23 | Hashimoto rule; matches founder's "self-contained app" vision. |
| D-03 | LAN-first, cloud-assisted share (WebRTC + TURN) | 2026-04-23 | Vysor does it this way for 7 years; no shortcut. |
| D-04 | Product name: **EC-Share**, company: **EaseCity** | 2026-04-23 | Founder pick. |
| D-05 | WorkOS for SSO at M4 | 2026-04-23 | SAML/OIDC in-house = 2 months; WorkOS $125/mo. |
| D-06 | Stripe for billing (with Stripe Tax) | 2026-04-23 | Founder pick over Paddle. |
| D-07 | EV code-signing cert | 2026-04-23 | Zero-friction SmartScreen from day 1. Cost pays back in week 1. |
| D-08 | No free-forever tier; 14-day Pro trial only | 2026-04-23 | Founder pick, Campbell-compatible. |
| D-09 | Tier prices: Pro $19 / Business $49 / Enterprise $2,499/yr | 2026-04-23 | Founder pick aligned with Campbell standard anchors. |
| D-10 | Offline grace: 14d full + 30d read-only | 2026-04-23 | Founder pick; covers vacations + industrial offline use. |
| D-11 | i18n: M1 = en + zh-HK; zh-CN deferred | 2026-04-23 | HK primary market. **Superseded by D-32 2026-04-23 (late): expanded to 7 locales.** |
| D-12 | Signaling server on Fly.io (Go) | 2026-04-23 | Global edge, static binary, $5-40/mo. |
| D-13 | Cloud budget ceiling: $150/mo Y1 months 1-6 | 2026-04-23 | Founder pick balanced plan. |
| D-14 | Backend responsibility: EaseCity web team via API contract | 2026-04-23 | Founder decision; clean API boundary. |
| D-15 | M1 launch target: ~2026-07-02 (10 weeks) | 2026-04-23 | Founder "flexible" choice; author recommendation. |
| D-16 | Self-host policy: **TailScale model** — Trial/Pro/Business all use EaseCity managed cloud; Enterprise tier can deploy signaling+TURN on-prem via Docker Compose | 2026-04-23 | Avoids support-cost trap & churn spiral from hobbyist self-host; aligns with TailScale/GitLab/Sentry industry pattern. |
| D-17 | LAN-only sharing is **free in all tiers** (copy `http://<local-ip>:28100` to a same-Wi-Fi friend); M1 implementation = "copy local URL" button, no mDNS discovery in M1 | 2026-04-23 | Preserves founder intent of user flexibility without port-forwarding / cert / DDNS pitfalls. Consumer-grade mDNS discovery deferred to post-M3. |
| D-18 | **Add M0.5 Internal Test Build** before M1 — rebranded self-host alpha for 3-5 testers, 2-week scope | 2026-04-23 | Founder request to validate core UX before investing 10 weeks in M1 polish. See `INTERNAL_TEST_BUILD.md`. |
| D-19 | **Three separate dashboards model** — User Dashboard (`/account`), EaseCity Staff Admin (`admin.easecity.hk`), Customer Org Admin (`/org`) | 2026-04-23 | Avoid monolithic admin conflation. Linear/GitLab/WorkOS pattern. See `DASHBOARDS_SPEC.md`. |
| D-20 | Staff Admin on **separate subdomain** with IP allowlist + mandatory 2FA | 2026-04-23 | Attack-surface reduction; separates staff-role JWT from user-role JWT. |
| D-21 | Stripe scope fully delegated to web team after founder KYC | 2026-04-23 | Founder bottleneck reduced to KYC + inviting web team; web team can develop against Stripe test-mode keys immediately. |
| D-22 | Stripe statement descriptor = **EASECITY** | 2026-04-23 | Founder pick; generic enough for future EaseCity products to share an account. |
| D-23 | Umbrella architecture: **EaseCity is umbrella brand; EC-Share is product #1 of N** | 2026-04-23 | Stripe/Atlassian pattern. Avoids Day-500 rewrite when product #2 ships. See `COMPANY_ARCHITECTURE.md`. |
| D-24 | User identity cross-product at **`account.easecity.hk`** (single sign-on across all future products) | 2026-04-23 | Customer has one EaseCity account, possibly multiple product subscriptions. |
| D-25 | API gateway split: shared (`/auth/*`, `/account/*`, `/license/*`, `/org/*`, `/billing/*`) vs product-namespaced (`/ec-share/*`, `/<future>/*`) | 2026-04-23 | Stripe-style resource design. See `API_CONTRACT.md` §0. |
| D-26 | License JWT carries **`product` claim**; one JWT per product per user | 2026-04-23 | Same machine can hold multiple EaseCity product licenses simultaneously. |
| D-27 | Stripe products scoped as "EC-Share Pro/Business/Enterprise"; prices metadata `{ product, tier }` | 2026-04-23 | Single Stripe account cleanly supports multiple product lines. |
| D-28 | DB: `subscriptions`/`licenses`/`trials`/`devices`/`audit_log` carry `product`; `users`/`orgs`/`org_members` don't | 2026-04-23 | Identity tables shared; activity tables product-scoped. |
| D-29 | Staff Admin has product dropdown (default "All products"; only "EC-Share" populated at launch) | 2026-04-23 | Forward-compatible admin UI. |
| D-30 | Customer Org Admin moves from `easecity.hk/org` → **`account.easecity.hk/org/<slug>`** (cross-product scope) | 2026-04-23 | Orgs can subscribe to multiple products; UI must reflect this. |
| D-31 | Corporate content pages (Privacy, ToS, About, Contact) shared across products at `easecity.hk/*` | 2026-04-23 | Legal entity (EaseCity Technologies Limited) owns all products; privacy/ToS are entity-level. |
| D-32 | **Expand M1 i18n to 7 launch locales**: en + zh-Hant + zh-Hans + ja + ko + pt-BR + es | 2026-04-23 | Covers ~75% of global Android dev population; supersedes D-11. Translation via GPT-4 + Crowdin native-speaker review. |
| D-33 | **M0.5 adds public-tunnel mode** (beyond LAN) via embedded Cloudflare Tunnel | 2026-04-23 | Superseded 2026-04-23: changed from HTTP tunnel to **TCP tunnel** since consumers are `ec-share.exe` peers, not browsers (D-35). |
| D-34 | **Cancel M0.5 focus mode** | 2026-04-23 | Not worth Day 6-7 cost for internal alpha; grid + single-device selection is sufficient. Reconsider in M1 UI overhaul. |
| D-35 | **Two transport paths: native peer (primary) + browser WebRTC (fallback)** | 2026-04-23 | Native `ec-share.exe` ↔ `ec-share.exe` over raw TCP preserves sub-100ms latency globally. WebRTC+TURN adds 100-300ms for DTLS+relay — fine for passive viewing, breaks interactive control. WebRTC becomes browser zero-install fallback only. |
| D-36 | **M0.5 is native-only transport**; browser viewer deferred to M3 | 2026-04-23 | M0.5 scope tightens: `--client-only <host>` real integration + Cloudflare TCP tunnel. Removes browser HTML viewer work from M0.5 (saves ~2 days) and aligns with D-35 primary-path choice. |
| D-37 | **Protocol handler `ec-share://connect?host=...&device_id=...&token=...`** | 2026-04-23 | M3 feature: dashboard 1-click device open launches native app via URL scheme with short-lived JWT auth. Installer registers the scheme under `HKEY_CLASSES_ROOT`. Matches Zoom/Slack UX. |
| D-38 | **Dashboard device list has both "Open in app" (primary) and "Open in browser" (fallback)** | 2026-04-23 | Per D-35: native path is preferred; browser path available for zero-install situations. |
| D-39 | **Cancel Cloudflare tunnel in M0.5** — internal testing uses LAN + manual port forward + Tailscale/ngrok | 2026-04-24 | Internal alpha doesn't warrant tunnel infra. Deferred to M1 evaluation. |
| D-40 | Single-port: **UI-layer unification (Option A) for M0.5; protocol-level multiplex scheduled for M1 (D-44)** | 2026-04-24 | rom1v's stated rule: no mid-alpha protocol changes. User sees one host string; internally two TCP ports until M1. |
| D-41 | First-run shows **mode selection** full-screen (Host / Connect cards); subsequent launches auto-resume last mode with skeleton shimmer | 2026-04-24 | Pennarun's action-first verbs + Arc's remember-last-state. See `UX_MODE_SELECTION.md` §2. |
| D-42 | Settings reorganized into 4 sections: **General / Host / Connect / About**. Host & Connect sections hide when not in that mode | 2026-04-24 | Saarinen's "settings is not a junk drawer." Removes ad-hoc rows+cols stepper, ADB playground, detach toggle. |
| D-43 | Copy-host dropdown shows **LAN addresses + optional Public IP** (opt-in, detected via `api.ipify.org`). Public IP requires manual port forward | 2026-04-24 | Replaces Cloudflare tunnel with simple router-forward UX. UPnP intentionally not automated. |
| D-44 | **True single-socket protocol multiplexing — scheduled for M1** | 2026-04-24 | Follow scrcpy v2 pattern: length-prefix + channel_id on one TCP connection. Deferred out of M0.5 per D-40. |
| D-45 | Device cards gain a 22 px **top ActionBar** (nickname, App ▾, ADB ▾, ℹ hover, ⋮ menu). Old bottom overlay + top-left dot merged into ActionBar | 2026-04-24 | Vysor pattern (Koush) + Linear hover-reveal (Saarinen). See `UX_DEVICE_CARD.md`. |
| D-46 | **Custom actions** (per-device App-launch + ADB shortcuts) user-configured in Settings → Host → Custom actions. Schema `{label, icon?, package/activity/command, confirm?}`. Defaults: Settings/Chrome/Camera + Reboot/Power/Vol/Screenshot | 2026-04-24 | Stream Deck + Raycast pattern; avoids rebuild per workflow change. |
| D-47 | **Device aliases persisted by serial** (not device_id, which is a volatile server slot index). Inline double-click edit in ActionBar; stored in `state.json.device_aliases` | 2026-04-24 | device_id changes across server restarts; serial is immutable. |
| D-48 | **Hover info panel** on ℹ icon (300 ms delay) shows serial, Android version, codec+encoder, physical/stream dimensions, fps, bitrate, session uptime, last IDR, phase | 2026-04-24 | Saarinen hover-reveal rule; info that tester needs mid-debug without leaving grid view. |
| D-49 | Current `device_card.dart` bottom device-name overlay **removed entirely**; duplicate info + obstructs video | 2026-04-24 | Nickname already in top ActionBar; bottom area reserved for NavBar Android keys. |

---

## 8. Open questions remaining

- [ ] Accent color choice (see `BRAND.md` §8): blue vs orange. **Recommendation: orange**. Founder confirms before UI overhaul in M1.
- [ ] WebRTC native library: libwebrtc (Google, huge) vs mediasoup-client (medium) vs minimal custom. Decision due M3 kickoff.
- [ ] PRC market: ship zh-CN + dedicated HK/SG relay TURN for mainland accessibility? Decision due M4.
- [ ] Post-launch logo / brand identity contractor: Fiverr cheap vs Dribbble mid-tier. Decision due post-M1.
- [ ] Team expansion trigger: when does founder hire #1 FTE engineer? Usually at $10k MRR milestone.

---

## 9. References

- Vysor public changelog & Koush Twitter (WebRTC adoption, 2020)
- Patrick Campbell — *The Pricing Page Bible*, Price Intelligently blog
- Mitchell Hashimoto on single-binary ops — HashiTalks 2019 keynote
- Paul Betts — *"Why we chose Squirrel over MSI"*, GitHub Desktop engineering blog
- Teleport Gravitational engineering blog — short-lived certs & session auth
- rom1v — scrcpy GitHub discussions on codec & NAL protocol
- Fly.io pricing & architecture docs
- DigitalOcean coturn deployment guide
