# EC-Share — Current Progress

> **Living document.** Updated every Cursor session that touches code or docs (enforced by `.cursor/rules/update-progress.mdc`).
> If this file ever exceeds 200 lines, archive the oldest weekly summaries into `docs/progress-archive/YYYY-MM.md`.

---

## Last session: 2026-04-24 (Day 8 — mode selection UI + TopBar wired up)

**Summary**: **M0.5 Day 8 shipped.** First-run mode chooser implemented and plumbed end-to-end: fresh install shows two-card chooser ("Share my devices" / "Connect to a host") with inline IP input + recent-hosts list; user pick persists to `state.json` (`last_mode`, `last_host`, `recent_hosts`). On relaunch, app auto-resumes the last mode and attempts connect — no second prompt. Top-bar `_Logo` replaced by clickable `_ModePill` that always shows current mode (Host / Connect) + serverHost; clicking reopens the chooser mid-session (re-entrant-safe native init prevents double handler registration). **Bonus fix**: discovered `TopBar` was never wired into the render tree (Day 7's Copy-host button was invisible — code was correct, just not parented). Fixed by wrapping MainScreen body in `Column[TopBar, Expanded(DeviceGrid)]`. `_EmptyState` localized text ("未連接到伺服器") replaced with dynamic English string that reflects current mode + serverHost. Also repacked web-team zip `2026-04-24b` with API §6 host-format addendum + D-39..D-49 addendum in `_WEBTEAM_README.md`. Zero analyzer warnings, 14/14 tests green, `ec-share.exe` release build clean in 15.8s.

**Files changed this session**:
- **NEW** `client/lib/models/recent_host.dart` (~65 lines): `RecentHost` data class with JSON round-trip, dedup key, favorite flag
- **NEW** `client/lib/services/persistence_adapter.dart` (~130 lines): typed facade over `Persistence` — `loadLastMode/saveLastMode`, `loadLastHost/saveLastHost`, `loadRecentHosts/addOrUpdateRecentHost/removeRecentHost`, generic `loadSetting/saveSetting`
- **NEW** `client/lib/widgets/mode_selection.dart` (~270 lines): full-screen two-card chooser + recent-hosts list + inline host validation
- Updated `client/lib/models/app_state.dart`: added `AppMode` enum (+ `AppModeX` extension with persistence keys), `_currentMode` field, `currentMode` getter, `setMode(mode)` method. `isHostingServer` kept as derived getter for backwards compat. `setHostingServer(bool)` legacy shim forwards to `setMode`.
- Updated `client/lib/widgets/main_screen.dart`: replaced `initState → _initNativeAndConnect` with `initState → _initialize` gate (persistence-aware, CLI-aware); added `_onModePicked`, `_openModeSelection`, `_splitHostPort` helpers; `_initNativeAndConnect` made re-entrant safe (guards keyboard-handler + event-sub registration); build method now returns Column[TopBar, Expanded(DeviceGrid)] when mode established, ModeSelection when not
- Updated `client/lib/widgets/top_bar.dart`: `_Logo` → `_ModePill` (icon + wordmark + separator + current-mode chip + chevron). `TopBar` now takes optional `onSwitchMode` callback.
- Updated `client/lib/widgets/device_grid.dart`: `_EmptyState` now reads `state.serverHost` + `state.isHostingServer` instead of hardcoded "127.0.0.1" + Chinese copy
- Updated `docs/API_CONTRACT.md`: new §6 "Host-endpoint format convention (D-40)" codifying single `host:port` contract
- Updated `docs/WEB_TEAM_TASKS.md`: M3 endpoints add `alias`/`video_codec`/`video_encoder` to heartbeat + device-list responses; deep-link adds `alias` param; ⚠ note about Cloudflare-tunnel drop (D-39); M4 org-level custom-actions + device-alias-sync placeholder (D-46 / D-47)
- Updated `docs/DASHBOARDS_SPEC.md`: §1a device-row now shows alias + phase dot + reachability + codec tag + last-seen
- Updated `docs/_WEBTEAM_README.md`: late-April 2026 addendum with D-39..D-49 impact table
- **NEW** `dist/EC-Share-WebTeam-Docs-2026-04-24b.zip` (84.8 KB, 12 docs)

## Earlier today: 2026-04-24 (UX design pass part 2 — device card)

**Summary**: Second design-pass following founder's device-card requirements. Best-minds consult (Koush / Saarinen / Dropbox / Stream Deck) yields 5 new decisions (D-45 ~ D-49). Full design doc `UX_DEVICE_CARD.md` written: 22 px top ActionBar per device with nickname (inline-edit via serial-keyed persistence), App-launch dropdown, ADB-shortcut dropdown, ℹ hover info panel, ⋮ more menu. Existing bottom device-name overlay removed entirely. Custom actions schema (`{label, icon, package/activity/command, confirm}`) with defaults shipped. Day 9 scope expands to absorb this (~1 contiguous extra day) — Day 10 installer pushes back 0.5 day (absorbed within buffer). Still no code changes — this session is design-only per founder's preferred flow (UX_MODE_SELECTION → review → code; same pattern here).

**Files changed this session**:
- **NEW** `docs/UX_DEVICE_CARD.md` (~330 lines): full device-card UX spec — action bar layout, custom actions schema, nickname persistence, info panel data mapping, implementation plan
- Updated `docs/PRODUCT_ROADMAP.md` (+D-45 through D-49, 5 new decisions)
- Updated `docs/INTERNAL_TEST_BUILD.md` (Day 9 scope expanded to include device ActionBar + custom actions + nickname edit)
- Updated `docs/PROGRESS.md` (this file)
- Updated `docs/CHANGELOG.md`

### Earlier this session: UX_MODE_SELECTION design pass

**Summary**: Best-minds consult (Pennarun / Mann / Saarinen / rom1v) on 4 design questions. 6 decisions ratified (D-39 ~ D-44). `UX_MODE_SELECTION.md` covers mode chooser, top-bar pill, settings reorganization (4 sections), skeleton shimmer rules, single-port rom1v decision, Cloudflare-tunnel drop. No code changes; founder preferred docs-first.

**Files changed this session**:
- **NEW** `docs/UX_MODE_SELECTION.md` (~400 lines): full design spec — state machine, first-run flow, top-bar pill, settings IA, shimmer rules, single-port decision, persistence schema, day-by-day implementation plan
- Updated `docs/PRODUCT_ROADMAP.md` (+D-39 through D-44, 6 new decisions)
- Updated `docs/INTERNAL_TEST_BUILD.md` (Day 8-9 scope rewritten: mode UI + settings + shimmer instead of Cloudflare; Day 10 installer no longer bundles cloudflared)
- Updated `docs/PROGRESS.md` (this file)
- Updated `docs/CHANGELOG.md`

**Best-minds per sub-question** (logged for provenance):
- Dual-mode first-run = Avery Pennarun (Tailscale) + Thomas Paul Mann (Raycast)
- Single-port = Romain Vimont (rom1v) — PRs #2547 / #2877 rationale: no mid-alpha protocol changes
- Skeleton shimmer = Karri Saarinen (Linear) — 3 rules: 300ms threshold / gradient spec / box-match
- Cloudflare-tunnel-cancel = pure scope discipline, founder directive confirmed

### Earlier this session: Day 7 + repacked web-team zip

**Summary**: **M0.5 Day 7 coded** — LAN address auto-detection + top-bar "Copy host" button. Alice opens `ec-share.exe`, sees a 💬 "Copy 192.168.0.113:28100" chip in the top bar; one click copies the host string to clipboard, ready to paste into Bob's `ec-share.exe` (settings-modal host field or `--client-only <addr>` CLI). Multi-IP machines (e.g. Wi-Fi + VPN) get a dropdown of site-local IPv4s. Button hides in `--client-only` mode (no server hosted locally). Zero analyzer warnings, 14/14 tests green, rebuild clean. Also repackaged web-team docs zip with D-34..D-38 updates from previous session (`dist/EC-Share-WebTeam-Docs-2026-04-24.zip`, 78 KB, 12 docs).

**Files changed this session**:
- **NEW** `client/lib/services/host_info.dart` — `HostInfo.getLanIPv4Addresses()` + `formatHostString()`; filters loopback, link-local, virtual adapters (Hyper-V/WSL/VMware/Docker/etc); ranks 192.168.x first, then 10.x, then 172.16-31
- `client/lib/models/app_state.dart` — new `lanAddresses` / `isHostingServer` state; `setLanAddresses` / `setHostingServer` setters; no-op on identical list
- `client/lib/main.dart` — sets `state.setHostingServer(false)` when `--client-only` flag present
- `client/lib/widgets/main_screen.dart` — kicks off `HostInfo.getLanIPv4Addresses()` in background during `_initNativeAndConnect`, only when `state.isHostingServer`
- `client/lib/widgets/top_bar.dart` — new `_CopyHostButton` widget; single-address = one-click copy; multi-address = PopupMenu; SnackBar confirmation
- **NEW** `dist/EC-Share-WebTeam-Docs-2026-04-24.zip` — 78 KB, 12 docs, ready to forward to web team
- Updated `docs/PROGRESS.md` (this file)
- Updated `docs/CHANGELOG.md`

**UI behavior verified**: on founder's machine, detection returns 2 site-local addresses (`192.168.0.113` primary + `10.5.0.2` NordVPN), so the button renders as a dropdown; both are dialable from peers on the same respective networks. Filter is conservative — VPN adapters are kept because they're sometimes the correct peer path (e.g. Tailscale, WireGuard teams).

### Earlier this session (yesterday's date 2026-04-23): transport-model rethink + Day 6

**Summary**: Founder flagged two architectural corrections late in session — (1) WebRTC's TURN-relay latency too high for interactive control; native `ec-share.exe ↔ ec-share.exe` TCP must be **primary** transport with WebRTC demoted to browser-only fallback (D-35). (2) Web dashboard needs both "open device in native app" (D-37 via `ec-share://` protocol handler + short-lived JWT) and "open in browser" fallback. (3) Cancel M0.5 focus mode (D-34) since grid is sufficient for alpha. (4) Cancel M0.5 browser viewer (D-36), move it to M3 with WebRTC. **Day 6 implemented** as `--client-only <host>` real integration: Dart main now receives args, parses the flag, auto-configures AppState's `serverHost` so `ec-share.exe --client-only 192.168.1.42` launches the UI and auto-connects to that remote host. 14/14 tests still pass; rebuild zero-warning.

**Files changed this session**:
- Updated `docs/INTERNAL_TEST_BUILD.md` (§1 positioning rewritten with native-peer rationale; §2 scope adds peer-connect UI + host-display UI, removes focus mode + browser viewer, changes tunnel to TCP mode; §3 updated forbidden list; §7 revised 9-step order, total 12 days not 14-15)
- Updated `docs/SHARE_ARCHITECTURE.md` (new §0 "Two transport paths" — Path A native primary, Path B browser fallback, with when-to-use-which matrix; split §1 into §1 browser journey + new §1a native peer journey)
- Updated `docs/DASHBOARDS_SPEC.md` (new §1a device list with "Open in app" + "Open in browser" buttons + protocol handler spec)
- Updated `docs/PRODUCT_ROADMAP.md` (D-33 marked superseded; +D-34 cancel focus mode; +D-35 two transport paths; +D-36 M0.5 native-only; +D-37 ec-share:// protocol handler; +D-38 dashboard dual button)
- Updated `docs/WEB_TEAM_TASKS.md` (new M3 section with device-list API, Open-in-app deep link generation, JWT schema, heartbeat endpoint)
- Updated `docs/FOUNDER_TODO.md` (Done log +1)
- Code: `client/lib/main.dart` — `main(List<String> args)` now parses `--client-only <host>` and threads the host into `AppState.setServerHost` via new `MUPhoneApp.initialHost` constructor param
- Updated `docs/PROGRESS.md` (this file)
- Updated `docs/CHANGELOG.md`

**What D-35 means in practice**: the server architecture already supports this — it listens on `0.0.0.0:28100/28101`. Today Alice's own UI connects to `127.0.0.1`, and Bob's UI (on another machine with `ec-share.exe`) can connect to Alice's LAN or tunnel-provided endpoint via **the same protocol + code path**. No new server code needed for M0.5; the heavy lifting was in getting single-binary + mode dispatch right (Day 2-5), now we just wire the host string through to Dart (Day 6).

### Earlier this session: Wave B + Wave C single-binary

**Summary**: Server logic refactored into a static library (`ec-share-server-lib.lib`) and Flutter runner now links against it. Single binary `ec-share.exe` (815 KB) spawns a server worker thread at startup (hybrid mode) while the Flutter UI owns the main thread. Verified with smoke test: process persists, ports 28100/28101 listening, Flutter UI connects to in-process server via 127.0.0.1. Mode flags `--server-only` / `--client-only` scaffolded (dispatch path present; thorough smoke test deferred to Day 6-9). `ec-share-server.exe` retained as separate headless build for Enterprise on-prem / factory deployments.

**Files changed this session** (Wave B + C):
- **NEW** `server/src/server_lib.h` — public API (`ServerOptions` + `run_server` + `run_server_cli`) with external `stop_event` for cooperative shutdown from Flutter UI
- **NEW** `server/src/server_lib.cpp` — full server main-loop body, formerly inside `main.cpp`; adds `WaitForMultipleObjects` for external stop event
- `server/src/main.cpp` — now 10-line thin wrapper forwarding to `run_server_cli`
- `server/CMakeLists.txt` — split into `ec-share-server-lib` (STATIC) + `ec-share-server` (thin exe linking the lib)
- `client/windows/CMakeLists.txt` — `BINARY_NAME` → `ec-share`; `add_subdirectory(../../server ec-share-server-build EXCLUDE_FROM_ALL)` brings the lib into the Flutter build tree
- `client/windows/runner/CMakeLists.txt` — link `ec-share-server-lib`
- `client/windows/runner/main.cpp` — add mode detection (`--server-only` / `--client-only` / default hybrid); spawn server worker thread with stop event in hybrid mode; include `<shellapi.h>` for `CommandLineToArgvW` (hidden by `WIN32_LEAN_AND_MEAN` propagated from server-lib)
- `client/windows/runner/utils.cpp` — add `<shellapi.h>` for same reason
- **NEW** `scripts/start-ec-share.bat` — launches unified binary in hybrid mode (`%*` passes through flags)
- `scripts/start-server.bat` — now launches the separate headless `ec-share-server.exe` (Enterprise on-prem use case)
- `scripts/start-client.bat` — legacy shim, defaults to `ec-share.exe` hybrid

**Build results**:
- Server standalone: `ec-share-server-lib.lib` (16 MB) + `ec-share-server.exe` (413 KB) — zero warnings
- Unified binary: `ec-share.exe` (815 KB) — zero warnings
- Smoke test (hybrid): process stays alive, Winsock ports listen, Flutter UI's control-client connects to its own embedded server

### Earlier this session: M0.5 Day 1

**Summary**: User-visible rebrand from MUPhone → EC-Share in both server and client. New binaries `ec-share-server.exe` + `ec-share-client.exe` built with zero warnings. Dart class identifiers (`MUPhoneColors`, `MUPhoneApp`, `MUPhonePlugin`, Dart package name `muphone_client`, C++ namespace `muphone`, plugin folder `muphone_native`) **intentionally preserved** — deferred to Day 2-5 single-binary refactor to avoid cascading 100+ file edits in the same session. Runner's `/utf-8` compile flag added to fix C4819 on zh-HK Windows (also future-proofs non-ASCII UI strings). Windows runner resource metadata (CompanyName, FileDescription, ProductName, etc.) rebranded to EaseCity Technologies Limited / EC-Share. 14/14 flutter tests still pass. Log file renamed `muphone-server.log` → `ec-share-server.log`. `VERSION.txt` → `0.0.5-alpha.1`.

**Files changed this session**:
- Code: `server/CMakeLists.txt` (project+target = ec-share-server), `server/src/main.cpp` (log filename + banner), `client/windows/CMakeLists.txt` (BINARY_NAME + /utf-8), `client/windows/runner/Runner.rc` (all VS_VERSION_INFO fields), `client/windows/runner/main.cpp` (initial window title), `client/pubspec.yaml` (description; name kept), `client/lib/main.dart` (title:'EC-Share'), `client/lib/widgets/top_bar.dart` ('EC-Share' brand text), `client/lib/models/app_state.dart` (4 windowTitle strings), `client/windows/plugins/muphone_native/src/plugin.cpp` (detach window title), `scripts/start-server.bat`, `scripts/start-client.bat`, `client/README.md`, `VERSION.txt`
- Build: server clean rebuild → zero warning; client clean rebuild → zero warning; fixed INSTALL-step failure by `mkdir client/build/native_assets/windows` (Flutter native-asset hook target that Cursor had blown away with recursive `Remove-Item`)
- Docs: updated `PROGRESS.md` (this file), `CHANGELOG.md`, `FOUNDER_TODO.md` (Done log +1)

**What was intentionally NOT done this session** (deferred to Day 2-5 per INTERNAL_TEST_BUILD.md):
- `namespace muphone` → `namespace ecshare` (18+ files, would cascade)
- Dart class renames (`MUPhoneColors`, `MUPhoneApp`, `MUPhoneShortcutManager`) — 100+ usages
- Dart package name `muphone_client` — 4 import callsites + IDE configs + tests + Runner.rc refs would all need syncing
- Plugin folder `muphone_native` → `ec_share_native` — requires Flutter plugin regeneration
- `MethodChannel 'muphone_native'` name — symmetric Dart + C++ change
- Log MODULE names inside `LOG_INFO(...)` calls (engineer-facing only)

### Earlier session: 2026-04-23 (midnight)

**Summary**: Two founder asks landed — (1) i18n expanded from en+zh-HK to 7 global launch locales (D-32: en/zh-Hant/zh-Hans/ja/ko/pt-BR/es); (2) M0.5 scope upgraded to support public-Internet connectivity (D-33: embedded Cloudflare Tunnel). Web team documentation packaged into a single handoff zip (`dist/EC-Share-WebTeam-Docs-2026-04-23.zip`).

**Files changed this session**:
- Updated `docs/PRODUCT_ROADMAP.md` (§5 i18n expanded to 7 locales; +D-32 / +D-33; D-11 marked superseded)
- Updated `docs/INTERNAL_TEST_BUILD.md` (§1 positioning; §2 scope +public tunnel +viewer page; §3 scope out; §4 artifact layout with cloudflared + viewer; §7 implementation order day 8-11 expanded)
- Updated `docs/FOUNDER_TODO.md` (Done log +2 entries)
- Updated `docs/WEB_TEAM_TASKS.md` (M1 website path: 7-locale translation commitment added)
- **NEW** `docs/_WEBTEAM_README.md` (entry doc for zip handoff, reading order, top 5 questions to web team)
- **NEW** `dist/EC-Share-WebTeam-Docs-2026-04-23.zip` (70 KB, 12 docs packaged for web team)
- Updated `docs/PROGRESS.md` (this file)
- Updated `docs/CHANGELOG.md`

### Earlier session: 2026-04-23 (late night)

**Summary**: Multi-product umbrella architecture codified in new `COMPANY_ARCHITECTURE.md` drawing on Stripe/Atlassian/GitHub-platform patterns. 9 forward-compatibility decisions landed (D-23 ~ D-31) touching domain map, JWT shape, database schema, API path conventions.

**Files changed this session**:
- **NEW** `docs/COMPANY_ARCHITECTURE.md` — multi-product umbrella architecture (7 sections, all invariants)
- Updated `docs/BRAND.md` (§1 umbrella brand hierarchy explicit)
- Updated `docs/DASHBOARDS_SPEC.md` (URLs moved to `account.easecity.hk` for cross-product; §1 + §3 route trees)
- Updated `docs/API_CONTRACT.md` (§0 path convention, §4.1 product claim in license refresh, §6 JWT payload adds `product`/`org_id`/`org_role`, §7 DB schema split by cross-product vs product-specific)
- Updated `docs/WEBSITE_CONTENT.md` (site map reorganized as umbrella + subdomain architecture; §1 homepage rebalances company vs product weighting)
- Updated `docs/PRODUCT_ROADMAP.md` (+D-23 ~ D-31, 9 decisions)
- Updated `docs/SUBSCRIPTION_TIERS.md` (Stripe price metadata `{ product, tier }` scheme)
- Updated `docs/FOUNDER_TODO.md` (DNS task expanded to full subdomain list; Done log +1)
- Updated `docs/PROGRESS.md` (this file)
- Updated `docs/CHANGELOG.md`

### Earlier session: 2026-04-23 (night)

**Summary**: Statement descriptor confirmed **EASECITY**. Three-dashboards model (User / Staff / Org) spec drafted. Website content requirements exhaustively listed.

Files: DASHBOARDS_SPEC.md, WEBSITE_CONTENT.md, FOUNDER_TODO.md, WEB_TEAM_TASKS.md, PRODUCT_ROADMAP.md (+D-19~D-22), PROGRESS.md, CHANGELOG.md.

### Earlier session: 2026-04-23 (evening)

**Summary**: Founder clarified Stripe scope division — Stripe integration is **web team's responsibility end-to-end**. Web team can develop against Stripe test-mode keys immediately, unblocking M2 code-path.

Files: FOUNDER_TODO.md, WEB_TEAM_TASKS.md, PROGRESS.md, CHANGELOG.md.

### Earlier session: 2026-04-23 (late)

**Summary**: Founder confirmed HK company incorporation — **EaseCity Technologies Limited (逸城科技有限公司)** with active BR. Legal entity name propagated across all relevant docs. Stripe KYC longest-lead item (BR) now resolved; only bank account + UBO docs remaining.

Files: BRAND.md (§1 + B-07/B-08/B-09), FOUNDER_TODO.md, WEB_TEAM_TASKS.md, SUBSCRIPTION_TIERS.md (§6), PROGRESS.md, CHANGELOG.md.

### Earlier session: 2026-04-23 (main)

**Summary**: Product direction locked via best-minds framework; 5 strategic docs signed off by founder; TailScale self-host model confirmed (Enterprise-only on-prem); internal test build (M0.5) scope defined; founder + web-team task lists created; progress-tracking discipline installed as Cursor rule.

Files: INTERNAL_TEST_BUILD.md, FOUNDER_TODO.md, WEB_TEAM_TASKS.md, PROGRESS.md, `.cursor/rules/update-progress.mdc`, PRODUCT_ROADMAP.md (+M0.5, +D-18), CHANGELOG.md.

---

## Milestone status

| Milestone | % | Target date | Blockers |
|-----------|----|-------------|----------|
| **M0 Foundation** (codec probe, HEVC, health fix) | **100%** ✅ | — | — |
| **M0.5 Internal Test Build** (self-host alpha for internal dogfood) | **~70%** (Day 1 ✅, Day 2-5 ✅, Day 6 ✅, Day 7 ✅, Day 8 ✅) | +1 week | Day 9 device-card action bar + settings reorg; Day 10 installer; Day 11 tester guide; Day 12 distribute |
| **M1 EC-Share Core** (single-binary, UI overhaul, installer, auto-update) | **0%** | ~2026-07-02 (10 weeks) | EV cert procurement (3-10d); accent color pick |
| **M2 Identity & Licensing** (login, trial, license JWT) | **0%** | M1 + 3 weeks | Web team hasn't started API_CONTRACT review |
| **M3 Invite Share** (WebRTC + TURN, browser viewer) | **0%** | M2 + 4 weeks | libdatachannel integration scaffolding |
| **M4 Enterprise** (RBAC, SSO, on-prem) | **0%** | M3 + 3 weeks | First Enterprise prospect conversation |

---

## Active blockers (founder action required)

1. **EV code-signing cert procurement** — 3-10 business days KYC. Blocks M1 installer ship. **Start this first.**
2. **API_CONTRACT.md handoff to web team** — cannot start M2 backend until they begin.
3. **Stripe HK account application** — requires BR + bank reference. Blocks M2 revenue path.
4. **DNS records on `easecity.hk`** — `api.`, `share.`, `dl.`, `ecshare.` subdomains needed by M1 end.

See `docs/FOUNDER_TODO.md` for the full list and priorities.

---

## Active blockers (web team action required)

1. **Review `docs/API_CONTRACT.md`** — web team hasn't started.
2. **Open questions in API_CONTRACT §10** — 6 items need web-team answers.

See `docs/WEB_TEAM_TASKS.md` for the full list.

---

## Recent changes log

### Week of 2026-04-21
- 2026-04-24 — **M0.5 Day 8 complete**: first-run mode chooser (two-card UI + recent-hosts list + inline IP validation); TopBar `_Logo` replaced by `_ModePill` (click reopens chooser); re-entrant-safe native init; persistence adapter with typed `last_mode`/`last_host`/`recent_hosts`; **bonus fix** `TopBar` now actually rendered (was orphan widget; Day 7 copy-host chip was invisible until now); `_EmptyState` localized text replaced. Web-team zip repacked `2026-04-24b` with API §6 host-format addendum + D-39..D-49 impact table.
- 2026-04-24 — **M0.5 Day 7 complete**: LAN IPv4 detection + top-bar "Copy host" button (single-IP one-click, multi-IP dropdown, `--client-only`-aware visibility). Web-team docs zip repackaged with D-34..D-38 updates.
- 2026-04-23 — **Transport-model rethink**: native `ec-share.exe` peer becomes primary (low-latency TCP); WebRTC demoted to browser fallback (D-35). M0.5 focus mode cancelled (D-34); browser viewer deferred to M3 (D-36). Dashboard gets `ec-share://` protocol handler for 1-click device open (D-37, D-38). M0.5 Day 6 coded: `--client-only <host>` real integration — Dart parses arg, auto-connects.
- 2026-04-23 — **M0.5 Day 2-5 single-binary merged**: `server_lib.h/.cpp` library split; Flutter runner links `ec-share-server-lib`; unified `ec-share.exe` (815 KB) hybrid mode boots server worker thread + Flutter UI in one process. Mode flags `--server-only`/`--client-only` dispatched.
- 2026-04-23 — **M0.5 Day 1 complete**: user-visible rebrand MUPhone → EC-Share in server + client; new binaries `ec-share-server.exe` + `ec-share-client.exe` built zero-warning; internal identifiers (namespace, Dart classes, plugin folder, package name) preserved for Day 2-5.
- 2026-04-23 — **i18n expanded to 7 M1 launch locales** (D-32) + **M0.5 adds Cloudflare Tunnel for public connectivity** (D-33); web team handoff zip produced at `dist/EC-Share-WebTeam-Docs-2026-04-23.zip`.
- 2026-04-23 — **Multi-product umbrella architecture locked** in new `COMPANY_ARCHITECTURE.md` + 9 decisions (D-23 ~ D-31): `account.easecity.hk` for cross-product identity, JWT carries `product` claim, DB tables split cross-product vs product-specific, staff admin gets product switcher, API paths follow shared-vs-product-namespaced convention.
- 2026-04-23 — Three-dashboards model spec'd (User / Staff / Org) in new `DASHBOARDS_SPEC.md`; website content requirements spec'd in new `WEBSITE_CONTENT.md`; 4 decisions added (D-19/20/21/22) including EASECITY statement descriptor.
- 2026-04-23 — Stripe scope division clarified: web team owns end-to-end after founder's KYC; founder only invites web team as Stripe members. Docs updated in FOUNDER_TODO + WEB_TEAM_TASKS.
- 2026-04-23 — HK company info captured: **EaseCity Technologies Limited (逸城科技有限公司)**, BR issued. Propagated to BRAND, FOUNDER_TODO, WEB_TEAM_TASKS, SUBSCRIPTION_TIERS.
- 2026-04-23 — Product direction set: MUPhone3 → EC-Share / EaseCity. 43 decisions signed off (see ROADMAP §7).
- 2026-04-23 — 5 strategic docs created/updated to v0.2: BRAND, SUBSCRIPTION_TIERS, PRODUCT_ROADMAP, SHARE_ARCHITECTURE, BRAND.
- 2026-04-23 — New `docs/API_CONTRACT.md` v0.1 drafted for web-team handoff.
- 2026-04-23 — TailScale self-host model confirmed (D-16); LAN share free in all tiers (D-17); Internal Test Build milestone M0.5 added (D-18).
- 2026-04-23 — Progress-tracking discipline installed: `docs/PROGRESS.md` + `docs/FOUNDER_TODO.md` + `docs/WEB_TEAM_TASKS.md` + `.cursor/rules/update-progress.mdc`.
- 2026-04-23 — AV1 gated in server (codec ladder defaults to H.265 > H.264; AV1 deferred past M4).
- 2026-04-23 — Health monitor AND-bug fixed (60s forced restart path).
- 2026-04-23 — Device codec probe + HEVC MFT decoder landed (codec-aware client pipeline).

---

## Next planned work (when founder says go)

The natural next coding tasks, in order:

1. **M0.5 kickoff**: rebrand `MUPhone` → `EC-Share` / `EaseCity` across codebase strings (UI, logs, config, binary names). ~0.5 day.
2. **M0.5 step 2**: single-binary merge of `muphone-server.exe` + `muphone_client.exe` → `ec-share.exe` with `--server-only` / `--client-only` flags. ~1 week.
3. **M0.5 step 3**: bundle vendor bins into zip-only installer (no EV cert yet). ~1 day.
4. **M0.5 step 4**: write tester setup guide + distribute to 3-5 internal testers.

After M0.5 feedback, we enter M1 proper (UI overhaul, first-run wizard, EV-signed installer, auto-update).

---

## How this file is maintained

This file is updated by the Cursor AI agent **at the end of every session that modifies code or docs**, enforced by `.cursor/rules/update-progress.mdc`.

The founder does **not** need to update this file manually; the agent does. But the founder is welcome to edit free-form notes or add annotations.
