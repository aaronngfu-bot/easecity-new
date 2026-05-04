# EC-Share — Share Architecture (v0.2)

> **Status**: technical decisions locked. Implementation starts at M3 (~2026-08).
> **Scope**: How Alice (on her Wi-Fi) shows/controls her Android device to Bob (on his Wi-Fi, 5,000 km away) with zero install on Bob's side.
> **Based on**: Vysor's production architecture (Koush public statements) + Teleport engineering patterns + rom1v's scrcpy protocol.
> **Last updated**: 2026-04-23

---

## 0. Two transport paths (D-35 2026-04-23, founder-confirmed)

EC-Share supports **two distinct ways to consume a shared device**, chosen by the viewer based on install constraints and latency needs:

### Path A — Native peer (primary, low latency)
Alice and Bob both have `ec-share.exe`. Bob's app connects directly to Alice's TCP ports 28100 (video) + 28101 (control). No WebRTC, no TURN relay, no browser decoder.

- **Latency**: same-LAN ~2-5 ms, trans-continental ~50-150 ms (raw TCP round-trip + scrcpy encode)
- **Install cost**: Bob must install `ec-share.exe`
- **NAT**: Alice needs a reachable host — LAN (default), public IP with port forward, or Cloudflare TCP tunnel
- **Feature parity**: Bob sees **the same UI as Alice** — grid, controls, status
- **Business tier use**: primary transport for team members; delivers best UX

### Path B — Browser viewer (fallback, zero-install)
Bob opens a URL in Chrome/Edge/Firefox/Safari — no install. Alice's browser-facing WebRTC stream reaches Bob through our signaling server + optional TURN relay.

- **Latency**: same-region ~80-150 ms, cross-region via TURN ~200-400 ms
- **Install cost**: zero on Bob's side
- **NAT**: handled by our infra (signaling + TURN)
- **Feature parity**: viewer-only by default; operator controls require datachannel (more complex UX)
- **Use case**: ad-hoc demo to a client who refuses to install; auditor observing without account

### When to use which

| Situation | Recommended path |
|-----------|-----------------|
| Internal team (Business tier, daily use) | **A — Native peer** |
| Demo to non-technical stakeholder | Either; start with B, promote to A if retention is good |
| Legal/audit observer, one-off | B — browser viewer |
| Pentest/security review of our product | B (they won't install our binary) |
| Factory QA, 24/7 monitoring | A — native peer over LAN (no cloud dependency) |

**Implementation timeline**: Path A ships in M0.5 (via `--client-only <host>` flag + Cloudflare TCP tunnel for beyond-LAN). Path B ships in M3.

## 1. User journey (Path B — browser viewer, M3)

```
Alice's side (EC-Share app)                        Bob's side (any modern browser)
─────────────────────────────────                  ─────────────────────────────────
1. Plugs in her phone                              4. Opens the link in Chrome/Edge/Firefox/Safari
2. Clicks "Share device" button                    5. Browser runs WebRTC page
3. Picks TTL (15m / 1h / 4h / 24h — no default)    6. Sees Alice's phone screen, live
4. Picks visibility ("First name" / "Device ID")   7. (if operator role) clicks "allow
5. Copies link, sends to Bob via Slack                control" → can tap/type
   https://share.easecity.hk/v/<token>
```

**Non-goals** (intentional):
- Bob doesn't install an app.
- Bob doesn't create an account to view.
- Alice doesn't configure a router, set port forwarding, or use a VPN.

## 1a. User journey (Path A — native peer, M0.5 onwards)

```
Alice's side (ec-share.exe, hybrid mode)           Bob's side (ec-share.exe, client-only mode)
─────────────────────────────────────────           ─────────────────────────────────────────────
1. Plugs in her phone                              4. Opens ec-share.exe
2. Clicks "Copy host" in top bar                   5. Pastes into "Connect to peer" field
   → e.g. "192.168.1.42:28100"                        (or launches with --client-only <host>)
   → or "abc-xyz.trycloudflare.com:28100"          6. Sees the full grid of Alice's devices
     if public tunnel is on                        7. Can operate (tap / type) just like Alice
3. Sends host string to Bob via Slack
```

No signaling server. No TURN relay. No account. No JWT. Plain TCP over cloudflared (if needed to cross NAT). M3 will add optional JWT-signed host URLs for access control, but M0.5 is open.

---

## 2. Component inventory

```
┌──────────────┐         ┌─────────────────────┐        ┌──────────────┐
│ Alice's      │  WSS    │ Signaling Server    │ WSS    │ Bob's        │
│ EC-Share     │◄──────► │ share.easecity.hk   │ ◄────► │ Browser      │
│ (Windows,    │         │ (Go, Fly.io multi-  │        │ (share page  │
│ libdata-     │         │  region edge)       │        │  on Cloud-   │
│ channel)     │         │ - WS hub            │        │  flare Pages)│
└──────┬───────┘         │ - Token issuer      │        └──────┬───────┘
       │                 │ - Session log       │               │
       │                 └─────────────────────┘               │
       │                                                       │
       │              WebRTC (UDP, DTLS-SRTP)                  │
       └───────────────────────────────────────────────────────┘
                                    │
                  (if direct P2P blocked by NAT)
                                    ▼
                    ┌──────────────────────────────────┐
                    │ TURN Servers (coturn)            │
                    │ - HK region (primary Asia)       │
                    │ - US-East region (primary Am/EU) │
                    │ - $18/mo each on DigitalOcean    │
                    └──────────────────────────────────┘
```

### Roles per component

| Component | What it does | What it does NOT do |
|-----------|--------------|---------------------|
| **Signaling server** | Exchanges SDP offers/answers, ICE candidates, issues short-lived tokens, logs session metadata | Touch video bytes; store screen content |
| **TURN servers** | Relay UDP packets when P2P fails due to symmetric NAT | Decrypt DTLS-SRTP (still end-to-end encrypted) |
| **EC-Share app (Alice)** | Captures scrcpy stream, negotiates WebRTC, encodes to RTP, transmits | Function while signaling offline (LAN still works) |
| **Browser (Bob)** | WebRTC receiver, renders H.264/H.265 in HTMLVideoElement | Need any install; know Alice's IP |

---

## 3. Technical stack (confirmed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **WebRTC native library** | **libdatachannel** (MIT, ~2MB) | See §3.1 below — not libwebrtc, not mediasoup. |
| **Signaling server language** | Go (static binary) | Single-file deploy to Fly.io, aligns with Hashimoto's single-binary philosophy, matches D-12 in ROADMAP. |
| **Signaling host** | Fly.io multi-region | Auto-placed edge nodes globally, $5-40/mo, static binary friendly. |
| **TURN server** | self-hosted **coturn** | Managed TURN (Twilio) is $0.40/GB — will blow budget at scale. coturn on DO is $18/mo/region. |
| **TURN initial regions** | HK + US-East (2 regions, $36/mo) | See §5.2 below. |
| **Browser viewer page** | React + Vite, static, on Cloudflare Pages | Free tier fits until >1M views/mo; SSR not needed. |
| **Invite token** | Ed25519-signed JWT, client-chosen TTL (15m / 1h / 4h / 24h) | No silent default; user explicitly picks per-link. |
| **Viewer identity display** | Alice chooses per-link: "First name" (default) or "Device ID only" | Privacy/trust balance; per-B-01 configurable flow. |

### 3.1 Why libdatachannel, not libwebrtc or mediasoup

You asked me to judge. **libdatachannel** (by paullouisageneau, MIT licensed) is the right fit. Here's the trade-off matrix:

| Criterion | libwebrtc | mediasoup-client-cpp | libdatachannel ✅ |
|-----------|-----------|---------------------|-------------------|
| **Binary size added to our DLL** | +30-50 MB | +15 MB | **+2-3 MB** |
| **Build time in our pipeline** | 30-60 minutes (needs Chromium build system) | 10-15 minutes | **2-5 minutes** |
| **API surface** | Massive (all of Chrome) | SFU client (we don't need SFU) | Minimal: RTCPeerConnection + DataChannel + Media Tracks |
| **License** | BSD + Google patent grant | MIT | **MIT** |
| **Used in production by** | Chrome, Discord, Signal | Jitsi, mediasoup users | Jitsi Videobridge, LiveKit, many P2P apps |
| **Our actual need** | 1:1 peer-to-peer, H.264/H.265 track passthrough, data channel for control, STUN/TURN client | Same | Same |
| **ICE/STUN/TURN built-in** | Yes | Yes | **Yes** |
| **DTLS-SRTP built-in** | Yes | Yes | **Yes** |
| **C++17 modern API** | Partially (legacy Chromium style) | Yes | **Yes** |
| **Cross-platform Windows x64** | Yes (painful) | Yes | **Yes (effortless)** |

**Verdict**: libwebrtc's features are 99% overkill for our use case — we don't need echo cancellation, AGC, Opus encoding, complex SFU logic. libdatachannel gives us exactly what EC-Share needs, with 10-20x smaller binary footprint and 10x faster build. mediasoup is designed for SFU topology we don't have.

If libdatachannel hits a wall (unlikely for 1:1 P2P), we can switch to libwebrtc in M4+ without re-architecting — the abstraction layer we build in M3 is the same.

---

## 4. Session lifecycle

### 4.1 Alice clicks "Share device"

Alice's app gathers inputs:
```json
{
  "device_id": 0,
  "role": "viewer",        // or "operator"
  "ttl_seconds": 3600,      // user explicitly picks 15m / 1h / 4h / 24h
  "show_identity": "first_name"  // or "device_id_only"
}
```

```
Alice App ──► POST https://share.easecity.hk/api/share/create
             Authorization: Bearer <license-jwt>    (for tier check)
             Body: (above)

Signaling ──► Validates license JWT (requires tier >= business OR trial)
             Creates session_id (UUID v4)
             Generates Ed25519-signed share token:
             { sub: session_id, role: "viewer",
               exp: now + ttl_seconds,
               identity: { show: "first_name", value: "Eric" },
               alice_cert_fingerprint: sha256 }

Signaling ──► Returns { session_id, share_token, share_url }

Alice App ──► Displays:
             https://share.easecity.hk/v/<share_token>
             UI shows: "Link expires in 1 hour" or user's chosen TTL
```

### 4.2 Bob opens the link

```
Bob Browser ──► GET /v/<token> → loads static React app from Cloudflare Pages

Bob Browser ──► WSS connect share.easecity.hk/signal?token=<token>
                Signaling validates JWT sig + exp, pairs with Alice's
                existing WebSocket by session_id

Signaling   ──► "bob_joined" event → Alice's app

Alice App   ──► Creates RTCPeerConnection (libdatachannel)
                Adds H.264/H.265 video track (fed from same NAL pipeline
                already supplying our local TCP video server)
                Sends SDP offer via signaling

Signaling   ──► Forwards offer to Bob

Bob Browser ──► setRemoteDescription(offer), creates answer, sends back

Signaling   ──► Forwards answer to Alice

(both sides exchange ICE candidates concurrently, including TURN relay)

ICE completes:
  - Best case: direct UDP P2P (srflx candidate wins ~70% of sessions)
  - NAT-hard case: TURN relay path (relay candidate only, ~30%)
```

### 4.3 Video flow

Alice App side (native plugin):
- scrcpy-server already emits H.264/H.265 NAL stream into our existing pipeline.
- **New module**: `web_rtc_sender.cpp` alongside `tcp_server.cpp`. Both receive NALs from the same `SendQueue`. LAN TCP remains untouched for local connections.
- `WebRTCSender` wraps NAL → RTP per RFC 6184 (H.264) or RFC 7798 (H.265), pushes onto PeerConnection's track.

Bob side (browser):
- `<video>` element gets `srcObject = peerConnection.getReceivers()[0].track`
- Browser uses built-in H.264 decoder (universal) or H.265 (Safari + Edge built-in; Chrome needs HEVC extension on Win).
- If browser refuses H.265, Alice's signaling negotiates H.264 fallback mid-offer (SDP renegotiation).

### 4.4 Control channel (operator role)

If token role=operator:
- Alice App opens an `RTCDataChannel(label: "control")`.
- Bob sends JSON `{type:"tap", x:500, y:1000}` etc.
- Alice App forwards to scrcpy-server's control socket. Requires scrcpy launched with `control=true` (currently we launch with `control=false`; M3 adds per-session override).

### 4.5 Session end

- Token expires → signaling server rejects any new WSS for this session_id
- Alice clicks "Stop sharing" → sends `close` on data channel, tears down PC, invalidates session_id server-side
- 30-minute idle timeout → auto-close
- Alice's app shutdown → graceful `close` + deny list entry (signaling ignores future rejoins on this session_id)

---

## 5. Security model (Teleport-inspired)

### 5.1 Token design
```json
{
  "alg": "EdDSA",
  "typ": "JWT",
  "kid": "share-2026a"
}
.
{
  "sub": "sess_abc123",
  "role": "viewer" | "operator",
  "exp": <epoch>,                 // 15m, 1h, 4h, or 24h from now
  "iat": <epoch>,
  "alice_user_id": "usr_xyz",
  "alice_cert_fingerprint": "sha256:…",  // pin Alice's DTLS cert
  "identity_display": {
    "mode": "first_name",          // or "device_id_only"
    "value": "Eric"                 // omitted if mode=device_id_only
  },
  "scope": {
    "device_ids": [0],
    "max_viewers": 1               // 1 for trial, 5 for Business, unlimited for Ent
  }
}
```

- **TTL**: user-explicit choice per link. Presets: 15m, 1h, 4h, 24h. No silent default — the share UI shows 4 buttons.
- **Revocation**: tokens are stateless; to revoke, signaling maintains a deny-list Redis key `revoked_session:<session_id>` with TTL matching max possible JWT exp (24h). Alice's "Stop sharing" button hits `POST /api/share/revoke`.
- **Cert pinning**: during ICE, peers verify DTLS cert fingerprint matches the one endorsed by signaling. Prevents MITM at TURN.

### 5.2 Identity visibility (new in v0.2)

Per Alice's per-link choice:

**Mode 1: `first_name` (default)**
Bob's browser shows:
> Shared by **Eric** · Device

**Mode 2: `device_id_only`**
Bob's browser shows:
> **Device #42** · Shared

- Email is **never** shown to Bob.
- Alice's full name is never shown (only first name).
- This lets individual contributors share with external clients without revealing personal info, while Enterprise admins can enforce `device_id_only` org-wide via policy (M4 feature).

### 5.3 Data privacy
- Video bytes **never** touch signaling or TURN in decrypted form. DTLS-SRTP end-to-end.
- Signaling logs: session_id, start/end timestamps, from/to IP (redacted to /24 for GDPR), role. **Not** device content.
- Business tier: 30-day retention. Enterprise: configurable + SIEM export.

### 5.4 Abuse prevention
- Rate limits: 10 share links / user / hour
- Viewer count caps per tier (Trial = 1, Pro = 0 [no share], Business = 5, Enterprise = unlimited)
- IP deny list for known abuse (Redis, 24h TTL)
- CAPTCHA on viewer page if 5+ failed WSS connects from one IP in 10 minutes

---

## 5. Infrastructure spec

### 5.1 Signaling server
- **Language**: Go
- **Deploy**: Fly.io multi-region edge (auto-placed globally, you pay per app, not per region)
- **Capacity**: ~10,000 concurrent WSS connections per 1 GB RAM
- **Scaling**: vertical to ~50k; horizontal with Redis pub/sub for cross-node signaling
- **Estimated cost Y1**: $30-80/month (see ROADMAP §4 budget table)

### 5.2 TURN server deployment — launch 2 regions

Founder asked for global market analysis. Here it is:

**Global latency reality (WebRTC):**
- < 150 ms RTT: "feels instant" (feasible for same-region)
- 150-250 ms: "usable" (inter-region, most global use cases)
- > 300 ms: "noticeably laggy" (must be avoided for tap-to-respond interaction)

**Coverage math (with user density assumption):**

| TURN regions | HK users | SG/SE-Asia | US users | EU users | MEA/LATAM | Cost/mo |
|--------------|----------|------------|----------|----------|-----------|---------|
| 1: HK only | ~20ms ★ | ~60ms | ~220ms ⚠️ | ~280ms ⚠️ | ~400ms ❌ | $18 |
| 1: US-East | ~220ms ⚠️ | ~260ms ⚠️ | ~20ms ★ | ~90ms | ~180ms | $18 |
| **2: HK + US-East ✅** | **~20ms** | **~60ms** | **~20ms** | **~90ms** | ~200ms | **$36** |
| 3: + EU (Frankfurt) | ~20ms | ~60ms | ~20ms | ~20ms ★ | ~140ms | $54 |
| 4: + MEA/LATAM | ~20ms | ~60ms | ~20ms | ~20ms | ~40ms | $72+ |

**Recommendation for launch: 2 regions (HK + US-East), $36/mo.**

Rationale:
- Covers your home market (HK) with first-class latency.
- Covers the world's two largest dev markets (US + EU served via US-East at 90ms, "usable" tier).
- Stays well under your $150/mo cloud budget ceiling (see ROADMAP §4) — total M3 cloud including signaling + DB + cert amortization lands at ~$90/mo.
- **Trigger for adding EU region**: when >15% of paying Business/Enterprise customers are in EU and reporting "laggy share" complaints. Expected around month 6-9 post-launch.

**Scaling the HK region for mainland China**: NOT in M3 scope; see §9 PRC note below.

### 5.3 Browser viewer page
- **Host**: Cloudflare Pages (free tier covers >100k/mo views easily)
- **Stack**: React + Vite, < 100 KB gzipped, no SSR
- **Branding**: minimal EC-Share wordmark + video element + role indicator
- **Supported browsers**: Chrome, Edge, Firefox, Safari — all current versions. H.265 falls back to H.264 if browser says no.

### 5.4 Total M3+ cloud cost summary
(From `PRODUCT_ROADMAP.md` §4 Year 1 ramp table):

| Month | Signaling | TURN (2 reg) | EV amort. | Stripe Tax | DB | Domain | Observ. | **Total** |
|-------|-----------|--------------|-----------|-----------|----|---------|---------|-----------|
| M3 launch (M+4) | $20 | $36 | $25 | $10 | $7 | $1 | $10 | **$109** |
| Y1 M+9 (~500 users) | $40 | $36 | $25 | $40 | $25 | $1 | $30 | **$197** |

Still under $300/mo ceiling.

---

## 6. Fallback & degradation

| Failure | Behavior |
|---------|----------|
| Signaling offline | Share feature disabled; LAN mirroring unaffected; UI banner "Sharing temporarily unavailable" |
| TURN quota hit / region down | Fall back to other TURN region; if all down, try P2P only; if P2P fails, show "cannot reach peer through firewall" |
| Bob's browser has no H.265 | Alice renegotiates to H.264 mid-session (SDP re-offer) |
| Bob's network loses connection | WebRTC auto-reconnects for 30s; session resumes |
| Alice's license expires mid-session | Existing shares continue to token expiry; no new ones issued |
| TTL expires during active session | Graceful 30-second warning to both sides, then auto-close |

---

## 7. Privacy & compliance implications

- **GDPR**: signaling logs are personal data. Need data processing agreement + right-to-erase workflow. Store minimum: session_id, timestamps, hashed IP (/24 truncation).
- **SOC2** (required for Enterprise): infra must run in audited cloud. Fly.io passes SOC2; DigitalOcean passes SOC2 Type II; Cloudflare passes SOC2. Coturn config must be audited against SOC2 controls.
- **Export control**: WebRTC uses DTLS, unrestricted. No EAR/ITAR flags.
- **China / GFW**: WebRTC + WSS may be throttled by GFW. Not in M3 scope (see §9). If targeting PRC post-launch, need dedicated HK relay with WSS obfuscation (e.g. via Cloudflare China Network).

---

## 8. Implementation order (M3 concrete)

1. **Week 1**: Signaling server scaffold in Go. Deploy to Fly.io, health-check endpoint. Token issuance + Ed25519 keys.
2. **Week 1-2**: Alice-side WebRTC integration. Add `web_rtc_sender.cpp` to `muphone_native`. Link against libdatachannel. Feed existing NAL pipeline into a WebRTC track.
3. **Week 2-3**: Bob-side browser page. React + Vite, static HTML+JS. Works in Chrome, Edge, Firefox, Safari.
4. **Week 3**: TURN deployment (HK + US-East coturn on DigitalOcean). End-to-end cross-region test.
5. **Week 3-4**: Data channel for control (operator role). Gate behind Business tier. Update scrcpy launch to `control=true` when session requires it.
6. **Week 4**: Identity visibility UI in Alice's app (toggle per link), server-side policy enforcement for Enterprise mode.

**Latency budget target**: < 150 ms P2P, < 250 ms TURN relay (same region).

---

## 9. Decisions confirmed (this pass)

| # | Decision | Value |
|---|----------|-------|
| SH-01 | WebRTC library | **libdatachannel** (not libwebrtc, not mediasoup) |
| SH-02 | Signaling language | Go on Fly.io |
| SH-03 | TURN deployment | Self-hosted coturn, **2 regions (HK + US-East)** at M3 launch |
| SH-04 | Browser viewer host | Cloudflare Pages |
| SH-05 | Token TTL | User-chosen per link: 15m / 1h / 4h / 24h. **No silent default.** |
| SH-06 | Viewer identity display | Per-link choice: "First name" (default) or "Device ID only" |
| SH-07 | PRC access | **Deferred to post-M4**; M3 launches without GFW-specific infra |
| SH-08 | Self-host policy (TailScale model) | **Trial/Pro/Business = EaseCity managed cloud only.** No self-host option in these tiers. Enterprise tier offers Docker Compose deploy of signaling+TURN on customer infra. See ROADMAP D-16. |
| SH-09 | LAN-only sharing (no cloud needed) | **Free feature in all tiers.** M1 ships "Copy local share URL" button that gives same-Wi-Fi peers `http://<local-ip>:28100`. No mDNS/autodiscovery until post-M3. See ROADMAP D-17. |

---

## 10. Still open (small / post-M3)

- [ ] EU TURN region timing: add at what user-density trigger? Recommendation: 15% of EU paying users + complaint signal.
- [ ] TURN bandwidth per-user quota (to prevent one Enterprise user from eating all TURN bandwidth): suggested 100 GB/month Business, 500 GB/month Enterprise. Confirm at M3 launch.
- [ ] WebRTC native library alternative: re-evaluate libdatachannel vs libwebrtc if we hit a wall in M3. Unlikely; flagged for M4 retrospective.
- [ ] PRC market re-evaluation: if HK mainland traffic grows organically, add HK relay + WSS obfuscation in M4+.
- [ ] Operator mode requires scrcpy `control=true` — must update our scrcpy_launcher to support per-session control flag (currently hardcoded `control=false`). Small scope change, slotted into M3 week 3-4.
