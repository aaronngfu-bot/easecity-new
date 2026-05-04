# MUPhone / EC-Share — Engineering Changelog

所有從 Cursor 介入到目前狀態的實際改動記錄。
最後更新：2026-04-24

## 2026-04-24 — M0.5 Day 8: first-run mode chooser + TopBar wired up
### Code
- **NEW** `client/lib/models/recent_host.dart` — `RecentHost` data class
- **NEW** `client/lib/services/persistence_adapter.dart` — typed facade over `Persistence`: `loadLastMode/saveLastMode`, `loadLastHost/saveLastHost`, `loadRecentHosts/addOrUpdateRecentHost`, generic `loadSetting/saveSetting`
- **NEW** `client/lib/widgets/mode_selection.dart` — full-screen two-card chooser ("Share my devices" / "Connect to a host") + inline host validation + recent-hosts list
- `client/lib/models/app_state.dart` — added `AppMode` enum + `AppModeX` extension; `_currentMode` field, `currentMode` getter, `setMode(mode)` method; kept `isHostingServer`/`setHostingServer` as legacy shims
- `client/lib/widgets/main_screen.dart` — `initState → _initialize` gate (persistence + CLI-aware); `_onModePicked`/`_openModeSelection`/`_splitHostPort` helpers; `_initNativeAndConnect` made re-entrant safe; build returns `Column[TopBar, Expanded(DeviceGrid)]` when mode established, `ModeSelection` when not
- `client/lib/widgets/top_bar.dart` — `_Logo` → `_ModePill` (icon + wordmark + divider + current-mode chip + chevron); `TopBar` takes optional `onSwitchMode`
- `client/lib/widgets/device_grid.dart` — `_EmptyState` reads `state.serverHost`/`state.isHostingServer` instead of hardcoded strings; translated Chinese copy out
- **Bonus fix**: `TopBar` was never wired into the MainScreen render tree (Day 7's Copy-host button was invisible) — fixed by parenting TopBar above DeviceGrid in a Column

### Docs
- `docs/API_CONTRACT.md` — new §6 "Host-endpoint format convention (D-40)" codifying single `host:port` contract; called out M1 single-socket forward-compatibility (D-44)
- `docs/WEB_TEAM_TASKS.md` — M3 heartbeat body + `GET /v1/account/devices/live` response now include `alias`/`video_codec`/`video_encoder`; deep-link carries `alias`; ⚠ note about D-39 Cloudflare drop; M4 org-level custom-actions and device-alias-sync placeholder
- `docs/DASHBOARDS_SPEC.md` — §1a device-row shows alias + phase dot + reachability + codec tag + last-seen
- `docs/_WEBTEAM_README.md` — late-April addendum with D-39..D-49 impact table
- **NEW** `dist/EC-Share-WebTeam-Docs-2026-04-24b.zip` (84.8 KB, 12 docs)

### Validation
- `flutter analyze` → 0 issues
- `flutter test` → 14/14 passing
- `flutter build windows --release` → `ec-share.exe` built in 15.8s, zero warnings


## 2026-04-23 — Product direction set: EC-Share (v0.2 after founder sign-off)
- Founder confirmed: MUPhone3 (repo codename) → commercial product **EC-Share** under parent **EaseCity**
- `docs/BRAND.md` v0.2: EC-Share, domain `easecity.hk`, tagline "Android device mirroring for teams.", wordmark logo deferred
- `docs/SUBSCRIPTION_TIERS.md` v0.2: **No free-forever tier**; 14-day Pro trial → Pro $19 → Business $49 → Enterprise from $2,499/yr; Stripe + Stripe Tax; EV code-signing cert
- `docs/PRODUCT_ROADMAP.md` v0.2: M1 target ~2026-07-02 (10 weeks), cloud budget ceiling $150/mo Y1 months 1-6, i18n = zh-HK + en, solo + Cursor model with EaseCity web team owning backend
- `docs/SHARE_ARCHITECTURE.md` v0.2: **libdatachannel** (not libwebrtc), Fly.io signaling (Go), **self-hosted coturn in HK + US-East** ($36/mo), Token TTL user-picked per link, per-link viewer identity toggle, PRC deferred post-M4
- `docs/API_CONTRACT.md` v0.1 (**new**): HTTPS contract between desktop client and EaseCity backend (license JWT shape, Stripe webhook spec, Postgres schema reference)

### Decision log (see PRODUCT_ROADMAP §7)
- D-01: defer AV1 Layer 3 until M4 reassessment
- D-02: single-binary packaging in M1
- D-03: LAN-first + cloud-assisted share in M3 (WebRTC + TURN, Vysor parity)
- D-04 to D-15: see ROADMAP for full list (brand, pricing, provider, budget, launch target, team)
- D-16: self-host policy — **TailScale model** (Enterprise-only on-prem; Trial/Pro/Business all use managed cloud)
- D-17: LAN share URL is free in all tiers, M1 ships "Copy local URL" button (no mDNS in M1)
- D-18: M0.5 Internal Test Build added — self-host alpha for 3-5 testers, 2-week scope before M1

### Workflow discipline (this session)
- New Cursor rule `.cursor/rules/update-progress.mdc` (alwaysApply) — agent must update tracking files every session
- New `docs/PROGRESS.md` (living status, < 200 lines, auto-maintained)
- New `docs/FOUNDER_TODO.md` (founder-only actions, EV cert / Stripe / DNS / brand decisions)
- New `docs/WEB_TEAM_TASKS.md` (EaseCity web+backend team task list + info they need from founder)
- New `docs/INTERNAL_TEST_BUILD.md` (M0.5 spec)

### Legal entity captured (late 2026-04-23)
- HK company confirmed: **EaseCity Technologies Limited · 逸城科技有限公司**, BR issued
- Decisions B-07/B-08/B-09 in BRAND.md
- Stripe HK application has BR ready (only bank account + UBO docs remaining)
- Legal entity strings for footer/ToS/privacy/invoicing now documented verbatim in WEB_TEAM_TASKS.md

### Stripe scope clarified (evening 2026-04-23)
- **Web team owns Stripe end-to-end** after founder's HK account KYC
- Founder's Stripe TODO reduced to: open account, pass KYC, invite web team as Developer-role members, pick statement descriptor
- Web team's Stripe TODO expanded: create products/prices, enable Stripe Tax, build Checkout + Customer Portal + webhook, own API key lifecycle
- Web team can develop against Stripe test-mode keys immediately (no blocker from founder)

### Three-dashboards model + website content (night 2026-04-23)
- **New** `docs/DASHBOARDS_SPEC.md` — separates User Dashboard (`/account`) from EaseCity Staff Admin (`admin.easecity.hk`) from Customer Org Admin (`/org`); Linear/GitLab/WorkOS pattern
- **New** `docs/WEBSITE_CONTENT.md` — 13 pages × content assets × CTA/telemetry wiring for easecity.hk
- D-19: three-dashboards model confirmed
- D-20: Staff Admin on separate subdomain with IP allowlist + 2FA (security isolation)
- D-21: Stripe delegation to web team codified as roadmap decision
- D-22: statement descriptor = **EASECITY**

### UX design pass part 2 — device card (evening 2026-04-24)
- **NEW** `docs/UX_DEVICE_CARD.md` — 330-line spec for 22 px top ActionBar per device with nickname, App ▾, ADB ▾, ℹ hover, ⋮ menu; removes old bottom overlay entirely
- D-45: device cards gain **top ActionBar** (Vysor pattern)
- D-46: **custom actions** schema + defaults (Settings/Chrome/Camera + Reboot/Power/Vol/Screenshot) user-configurable under Settings → Host → Custom actions
- D-47: **device aliases persisted by serial** (not device_id); inline double-click edit
- D-48: **hover info panel** on ℹ icon showing serial, Android, codec+encoder, dimensions, fps, bitrate, uptime, last IDR, phase
- D-49: current `device_card.dart` bottom device-name overlay **removed** — duplicate info + obstructs video
- `INTERNAL_TEST_BUILD.md` Day 9 scope expanded to absorb device-card work (~1 contiguous extra day; Day 10 installer absorbed within buffer)
- No code — Day 9 implementation pending founder green-light

### UX design pass for Day 8-9 (late 2026-04-24)
- **NEW** `docs/UX_MODE_SELECTION.md` — 400-line spec: state machine, first-run flow, top-bar pill, settings IA (4-section: General/Host/Connect/About), skeleton-shimmer rules, single-port decision, persistence schema, day-by-day plan
- D-39: **Cancel Cloudflare tunnel in M0.5** — LAN + router port forward + Tailscale/ngrok as tester-side alternatives
- D-40: Single-port = **UI-layer unification (Option A)** for M0.5; protocol multiplex deferred (rom1v PR #2547/#2877 rationale)
- D-41: First-run shows **mode selection full-screen** (Host / Connect cards); subsequent launches auto-resume last mode
- D-42: Settings **reorganized into 4 sections**; removes ad-hoc rows+cols stepper, ADB playground, detach toggle
- D-43: Copy-host dropdown includes **Public IP** (opt-in via `api.ipify.org`) with port-forward guidance
- D-44: True single-socket multiplexing **scheduled for M1**
- `INTERNAL_TEST_BUILD.md` Day 8-9 scope rewritten: mode UI + settings redesign + shimmer (was: Cloudflare tunnel)
- No code changes — design-only pass; Day 8-9 implementation pending founder green-light

### M0.5 Day 7 — Copy host UI (2026-04-24)
- **New** `client/lib/services/host_info.dart` — detects site-local IPv4 addresses (RFC 1918), filters virtual adapters (Hyper-V/WSL/VMware/Docker/tap/tun/ZeroTier/Tailscale prefix match), ranks 192.168.x > 10.x > 172.16-31.x
- `AppState` adds `lanAddresses` + `isHostingServer` (false when launched `--client-only`)
- `MUPhoneApp` marks `isHostingServer=false` when `initialHost != null`
- `MainScreen._initNativeAndConnect` kicks off IP detection in background (only if hosting)
- **`_CopyHostButton`** widget in top bar:
    - Single address → one-click copy (hover tooltip shows full `ip:port`)
    - Multi-address → PopupMenu dropdown listing all site-local IPv4s
    - SnackBar confirmation `"Copied host: 192.168.0.113:28100"` (floating, 2s)
    - Hidden in `--client-only` mode (this machine isn't hosting)
- Verified on founder machine: detects `192.168.0.113` + `10.5.0.2` (NordVPN); both shown in dropdown
- Zero analyzer issues (after 1-line doc-comment fix), 14/14 tests pass, rebuild zero-warning

### Web-team docs repackaged (2026-04-24)
- `dist/EC-Share-WebTeam-Docs-2026-04-24.zip` (77.9 KB) — 12 docs including all D-23..D-38 decisions + `_WEBTEAM_README.md` entry doc
- Safe to forward to EaseCity web/backend team

### Transport-model rethink + M0.5 Day 6 (midnight 2026-04-23)
- D-34: **Cancel M0.5 focus mode** — not worth Day 6-7 cost for internal alpha
- D-35: **Two transport paths** — native peer (TCP, primary, low-latency) + browser WebRTC (fallback, zero-install). Matrix of when-to-use in SHARE_ARCHITECTURE.md §0.
- D-36: **M0.5 is native-only transport** — browser viewer deferred to M3 (saves ~2 days)
- D-37: **`ec-share://connect?host=...&device_id=...&token=...`** protocol handler for dashboard 1-click device open; installer registers URL scheme under HKEY_CLASSES_ROOT (M3 work)
- D-38: Dashboard device list has both "Open in app" (primary, D-37 protocol) and "Open in browser" (fallback, browser WebRTC) buttons
- D-33 superseded: Cloudflare tunnel changes from HTTP to **TCP mode** since consumers are native peers not browsers
- Docs updated: INTERNAL_TEST_BUILD (scope shrinks), SHARE_ARCHITECTURE (two-path rationale), DASHBOARDS_SPEC (device list + protocol), PRODUCT_ROADMAP (+D-34~D-38), WEB_TEAM_TASKS (M3 dashboard items), FOUNDER_TODO (Done log)
- **Code**: `client/lib/main.dart` now accepts `List<String> args` and extracts `--client-only <host>`; threads host via `MUPhoneApp.initialHost` into `AppState.setServerHost`. 14/14 tests green. Rebuild zero warning.

### M0.5 Day 2-5 — single-binary (night 2026-04-23)
- **Server library extraction**: `server/src/server_lib.{h,cpp}` — `run_server(ServerOptions)` + `run_server_cli(argc,argv)` public API. All main-loop logic (ADB poller, launch pool, TCP video/control servers, health monitor) now reusable as library.
- **CMake split**: `server/CMakeLists.txt` → `ec-share-server-lib` (STATIC, 16 MB, all subsystems) + `ec-share-server` (thin exe forwarding to `run_server_cli`)
- **Unified binary**: `client/windows/runner/main.cpp` detects mode via argv:
    - default (no flags) → hybrid: spawn server worker thread, run Flutter UI
    - `--server-only` → call `run_server_cli`, no Flutter
    - `--client-only` → Flutter UI only, no local server (placeholder; will consume url arg in M1)
- **Cooperative shutdown**: `ServerOptions.external_stop_event` lets Flutter signal server teardown via `WaitForMultipleObjects`; `install_ctrl_handler=false` in hybrid mode (no console handler needed)
- **Output**: `ec-share.exe` (815 KB) — single binary replaces the `ec-share-server.exe` + `ec-share-client.exe` pair for end-user install. Zero warnings.
- **Smoke test**: hybrid mode process boots, ports 28100/28101 listening, Flutter UI's control client connects to in-process server.
- **`<shellapi.h>` explicit include** in runner `main.cpp` + `utils.cpp` — `WIN32_LEAN_AND_MEAN` propagated from server-lib's PUBLIC compile definitions was hiding `CommandLineToArgvW`.
- **Scripts consolidated**: new `scripts/start-ec-share.bat` for unified binary; `start-server.bat` retained for headless server-only builds; `start-client.bat` becomes a thin shim.
- **Legacy retained**: `ec-share-server.exe` still ships for Enterprise on-prem / factory / CI deployments that don't want the Flutter UI.

### M0.5 Day 1 — user-visible rebrand (late evening 2026-04-23)
- **Binaries renamed** to user-visible product name:
    - `muphone-server.exe` → `ec-share-server.exe` (server CMake target + project name)
    - `muphone_client.exe` → `ec-share-client.exe` (client CMake BINARY_NAME only; project name + Dart package name preserved)
- **Log file** `muphone-server.log` → `ec-share-server.log`
- **Log banner** "=== MUPhone Server v..." → "=== EC-Share Server v... (alpha) ===" + EaseCity Technologies Limited (逸城科技有限公司) subtitle
- **Window title** (Dart) and **initial window title** (runner/main.cpp) show "EC-Share"
- **Runner.rc resource metadata**: CompanyName=`EaseCity Technologies Limited`, FileDescription=`EC-Share — Android device mirroring for teams`, ProductName=`EC-Share`, InternalName=`ec-share-client`, OriginalFilename=`ec-share-client.exe`, LegalCopyright updated
- **Top-bar brand text**: "MUPhone" → "EC-Share"
- **Detach-device window title** in native plugin: "MUPhone Device" → "EC-Share Device"
- **Scripts**: `start-server.bat` / `start-client.bat` point to new binaries
- **VERSION.txt**: `0.1.0` → `0.0.5-alpha.1`
- **Runner CMake `/utf-8` flag added** — resolves C4819 on zh-HK Windows (CP950 default code page); future-proofs non-ASCII UI strings
- **`client/build/native_assets/windows`** mkdir'd — Flutter's native-asset hook target (got wiped by recursive `Remove-Item client/build`)
- Builds: server zero-warning, client zero-warning; 14/14 Dart tests pass
- **Deferred to Day 2-5 single-binary refactor**: C++ `namespace muphone`, Dart classes (`MUPhoneColors`, `MUPhoneApp`, `MUPhoneShortcutManager`), Dart package `muphone_client`, plugin folder `muphone_native`, MethodChannel name

### i18n expansion + M0.5 public-tunnel + web-team zip handoff (midnight 2026-04-23)
- D-32: i18n scope expanded from en+zh-HK to **7 M1 launch locales**: en + zh-Hant + zh-Hans + ja + ko + pt-BR + es (covers ~75% Android-dev population)
- D-11 superseded by D-32 (history preserved)
- D-33: M0.5 gains **public-tunnel mode** via embedded Cloudflare Tunnel (`cloudflared.exe`) for beyond-LAN testing
- M0.5 scope: +public tunnel button, +minimal browser viewer page (WebCodecs H.264 decode)
- M0.5 implementation order: 10 days → 14-15 days (tunnel + viewer page)
- **Web team documentation packaged** into `dist/EC-Share-WebTeam-Docs-2026-04-23.zip` (70 KB, 12 docs)
- New `docs/_WEBTEAM_README.md` entry doc with reading order + top 5 questions needing web-team decision

### Multi-product umbrella architecture (late night 2026-04-23)
- **New** `docs/COMPANY_ARCHITECTURE.md` — Stripe/Atlassian/GitHub-platform-style umbrella; 3-layer identity (Account → Org → Product subscription); shared vs product-namespaced API paths; cross-product vs product-specific DB tables
- D-23: EaseCity = umbrella brand; EC-Share = product #1 of N
- D-24: `account.easecity.hk` is cross-product User Dashboard (single sign-on across all future EaseCity products)
- D-25: API gateway splits shared (`/auth/*` `/account/*` `/license/*` `/org/*` `/billing/*`) from product-specific (`/ec-share/*` `/<future>/*`)
- D-26: License JWT carries `product` claim; one JWT per product per user
- D-27: Stripe products scoped as "EC-Share Pro/Business/Enterprise"; prices metadata `{ product, tier }`
- D-28: DB `subscriptions`/`licenses`/`trials`/`devices`/`audit_log` carry `product`; `users`/`orgs`/`org_members` don't
- D-29: Staff Admin shows product switcher (default "All products")
- D-30: Customer Org Admin at `account.easecity.hk/org/<slug>` (cross-product scope)
- D-31: Corporate content pages (Privacy, ToS, About, Contact) shared across products at `easecity.hk/*`
- Aligned: BRAND.md, DASHBOARDS_SPEC.md, API_CONTRACT.md, WEBSITE_CONTENT.md, SUBSCRIPTION_TIERS.md, FOUNDER_TODO.md

---

## 系統目前狀態

| 指標 | 狀態 |
|------|------|
| 伺服器 | 穩定運行，12 裝置 ONLINE，零振盪 |
| scrcpy-server | ADB forward + TCP socket，77-byte header 解析實際解析度，max_size=720 |
| 客戶端連線 | 成功（EventChannel 事件到達 Dart） |
| 裝置列表 | 正確顯示，報告實際 video + physical 解析度 |
| 斷線偵測 | ControlClient disconnect_handler → 即時通知 Dart |
| H264 解碼 | MFT 軟體解碼 + IMF2DBuffer stride 修正 → NV12 D3D11 staging texture |
| 影片渲染 | 共享 VideoProcessor（1 個）+ per-device OutputView → BGRA shared handle |
| UI | 6×2 網格，NavBar ADB 按鈕，手勢/鍵盤控制，ADB 文字輸入 |

---

## 改動總覽

### 1. scrcpy 傳輸模型

| 項目 | 實際實作 |
|------|---------|
| 二進位 | `scrcpy-server` JAR (v2.7) |
| 啟動方式 | `adb shell app_process / com.genymobile.scrcpy.Server 2.7 tunnel_forward=true` |
| 傳輸 | ADB forward + TCP socket |
| max_size | **720**（原 1920，減少解碼負擔，提升 FPS） |
| Header 解析 | **77 bytes**（原 76），正確解析 codec_id + width + height |
| 實際解析度 | 從 header 讀取並報告（e.g. 328×720 for 20:9 phone） |
| 物理解析度 | 啟動前執行 `adb shell wm size` 取得（用於手勢座標映射） |
| 啟動前清理 | `adb shell ps | grep scrcpy | kill` + `forward --remove-all` |
| Push 驗證 | push 後 `adb shell ls` 驗證檔案存在 |

### 2. 伺服器

| 項目 | 實作 |
|------|------|
| 主迴圈 | Event-driven (`WaitForSingleObject`) + **LaunchPool(4 workers)** |
| 裝置啟動 | 非阻塞並行（最多 4 台同時），同時查詢 physical 解析度 |
| Health monitor | 只在 process dead + NAL timeout 時觸發 restart（queue-based，非阻塞） |
| 時間比較 | `safe_elapsed()` 防 uint64 underflow |
| 退避 | 1/2/4/8/10s cap + jitter(0-400ms) |
| Keyframe cache | 每裝置緩存 SPS+PPS+IDR，新 client 訂閱時立即發送 |
| SendQueue config 處理 | config NAL 累積（不被 IDR 覆蓋），dequeue 順序：config → IDR → P-frame |
| **TCP 傳送修復** | **per-session 專用發送線程（阻塞 I/O），消除 WOULDBLOCK 數據丟失** |
| **TCP 鎖優化** | **broadcast_frame 快照 session 指標，send 在鎖外執行，消除 PipeReader 阻塞** |
| device_list 欄位 | 新增 `physical_width`, `physical_height`, `width`, `height`（實際 scrcpy 解析度） |

### 3. 客戶端 Native Plugin

| 項目 | 實作 |
|------|------|
| Plugin 註冊 | C-export `MUPhonePluginRegisterWithRegistrar` 從 runner 呼叫 |
| Event dispatch | Adaptive demand-driven timer（EmitEvent CAS arm 1ms） |
| ControlClient 斷線偵測 | `disconnect_handler_` → EmitEvent("disconnected") |
| H264 解碼 | MFT (`CLSID_CMSH264DecoderMFT`) 軟體解碼（無 DXGI manager） |
| STREAM_CHANGE 處理 | 只重新協商 output type，保留 MFT 內部 NAL 緩衝 |
| NV12 stride | **IMF2DBuffer::Lock2D 取得實際 pitch**（修正右側條紋根因之一） |
| **共享 VideoProcessor** | **ONE VideoProcessorEnumerator + ONE VideoProcessor 供所有 12 台設備共用（消除 ~8 個上限）** |
| per-device 資源 | 每台設備只需一個 VideoProcessorOutputView |
| Texture 輸出 | NV12 staging → 共享 VideoProcessorBlt → BGRA shared handle → Flutter Texture |
| SPS/PPS 處理 | StreamManager 累積 SPS+PPS，合併後送 create_decoder |
| 解碼迴圈 | `drain_all_output()`: 最多 10 次 ProcessOutput 迴圈，非阻塞 |
| Sample 時間戳 | 單調遞增，100ns 單位，每幀 +333333 (~30fps) |
| **recv/decode 分離** | **VideoReceiver recv 線程只接收，推入 work_queue；單一 decode_worker 線程解碼** |
| **ADB 自動偵測** | **AdbExecutor 啟動時自動 SearchPath adb.exe 或找 vendor 目錄** |

### 4. 客戶端 UI (Flutter/Dart)

| 項目 | 實作 |
|------|------|
| 標題列 | Win32 原生（自訂 icon.ico + 動態中文標題） |
| 標題格式 | `MUPhone — IP — X 在線 / Y 裝置` |
| 視窗內容 | 100% DeviceGrid（無應用內頂部列） |
| Device Card | 影片區 + 底部 NavBar (22px)，無頂部 ADB 列 |
| **NavBar 按鈕** | **◀ → `input keyevent 4` (Back)；○ → `input keyevent 3` (Home)；☰ → `input keyevent 187` (Recent)** |
| **網格預設** | **6×2（原 5×2），state.json 持久化，啟動自動套用** |
| 設定（按 = 開啟） | 伺服器 IP/Port + 連線狀態 + 網格配置 + 裝置列表（中文） |
| 伺服器斷線 | 自動清空裝置列表，標題更新為「離線」 |
| 伺服器 IP | 設定視窗可修改並重新連接 |
| **activeSerial** | **AppState 追蹤最後互動設備，作為鍵盤/手勢輸入目標** |
| **手勢控制** | **左鍵點擊 → ADB tap；拖拽 → ADB swipe；長按 → ADB long press** |
| **滑鼠右鍵** | **→ `input keyevent 4` (Android Back)** |
| **滑鼠中鍵** | **→ 雙擊當前游標位置（連發兩次 tap，間距 80ms）** |
| **全域鍵盤輸入** | **點擊設備後成為鍵盤目標；可見字元 → ADB_INPUT_TEXT；Enter/Space → keyevent 66；Backspace → keyevent 67；Ctrl+V → 讀取剪貼板 → ADB_INPUT_TEXT** |
| **座標映射** | **widget 座標 × (physicalWidth / widgetWidth) → 設備物理座標** |
| **physicalWidth/Height** | **從 server device_list 接收（來自 `adb shell wm size`），估算比例用於 ADB 輸入** |

### 5. 已修復的 Bug

| Bug | 根因 | 修復 |
|-----|------|------|
| **12 台只有 8 台有畫面** | **VideoProcessorBlt 資源上限 ~8，後 4 台 CreateVideoProcessor 靜默失敗** | **ONE 共享 VideoProcessorEnumerator + VideoProcessor，per-device 只建 OutputView** |
| **右側彩色直條** | **VideoProcessor OutputWidth=328，BGRA texture=328，但 GPU 對齊邊界像素保留舊幀** | **共享 VP OutputWidth = BGRA texture width（精確填充）+ NV12 stride 修正** |
| **畫面不即時（首幀靜止）** | **recv 線程同步呼叫 MFT decode（~15ms），TCP 背壓導致 P-frame 全丟** | **recv/decode 分離：recv 線程只接收，work_queue + decode_worker 線程** |
| **TCP 串流損壞後凍結** | **VideoSession::send_pending WOULDBLOCK 丟棄 payload 殘餘，下一幀 header 錯位** | **per-session 阻塞發送線程，send_all 確保完整傳輸** |
| **scrcpy 解析度錯誤** | **server 回報硬編碼 1080×1920，實際 scrcpy 輸出 328×720** | **解析 77-byte scrcpy header 取得 width/height，正確回報** |
| **ADB 命令無效** | **AdbExecutor.adb_path_ 從未設置（空字串）** | **啟動時自動 SearchPath adb.exe 或找 vendor 目錄** |
| MFT ProcessOutput 不產出幀 | STREAM_CHANGE 時 configure_types() 重設 input type | 分離 set_output_type()，STREAM_CHANGE 只重新協商 output |
| PostMessage 事件不到達 Dart | 外部 PluginRegistrar delegate 不被 engine 路由 | Adaptive timer 取代 PostMessage |
| Health monitor 殺死靜態畫面裝置 | 30s NAL timeout 不區分 process alive/dead | 只在 process dead 時觸發 restart |
| SendQueue 丟棄 config NAL | config 被 IDR 覆蓋 | config 累積不被清除 |

---

## 已知待解決

| 問題 | 狀態 |
|------|------|
| 右側條紋（4 台不顯示） | 共享 VideoProcessor 部署中，測試驗證中 |
| 多 GPU 廠商相容性矩陣測試 | 待執行 |
| scrcpy 靜態畫面時不發送 P-frame | 正常行為（畫面無變化時 scrcpy 不發送新幀） |
