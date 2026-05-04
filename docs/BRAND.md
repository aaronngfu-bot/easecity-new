# EC-Share — Brand Notes (v0.2)

> **Status**: founder-confirmed direction. Logo + trademark deferred to post-launch.
> Companion to `PRODUCT_ROADMAP.md`, `SUBSCRIPTION_TIERS.md`, `SHARE_ARCHITECTURE.md`.
> **Last updated**: 2026-04-23

---

## 1. Name & entity

### Brand hierarchy (umbrella model)

**EaseCity is the umbrella brand. EC-Share is product #1 of N.**

All EaseCity products share: corporate identity, user login, org/team management, billing, domain root, docs infrastructure. See `COMPANY_ARCHITECTURE.md` for full architecture.

```
EaseCity (corporate brand, always displayed as parent)
  └── EC-Share (product #1 — launched)
  └── <Product 2> (future)
  └── <Product N> (future)
```

Every EC-Share user-facing surface displays "EaseCity ▸ EC-Share" breadcrumb — trains users on the hierarchy from day 1.

- **Product name (current)**: **EC-Share**
- **Pronunciation**: "ee-see share"
- **EC** stands for **EaseCity** — the parent company / publisher.
- **Comparable model**: Atlassian → {Jira, Confluence, Bitbucket}, Stripe → {Payments, Billing, Connect, Atlas}, Adobe → {Photoshop, Illustrator, Premiere}.
  - We explicitly avoid 37signals → {Basecamp, Hey} pattern (independent domains, no shared login) because our future products will likely share the same buyer persona.

### Legal entity (confirmed 2026-04-23)

| Field | Value |
|-------|-------|
| Legal name (English) | **EaseCity Technologies Limited** |
| Legal name (Chinese) | **逸城科技有限公司** |
| Incorporation | Hong Kong Limited Company |
| Business Registration (BR) | Issued (founder holds the certificate) |
| Use in UI / footers | Marketing copy uses **EC-Share** + **EaseCity**; legal footers and invoicing use **EaseCity Technologies Limited · 逸城科技有限公司** |
| Use in Stripe | Account holder / merchant descriptor = **EaseCity Technologies Limited**; customer-facing statement descriptor = **EASECITY** or **EC-SHARE** (≤ 22 char) |

- **Company domain**: [`easecity.hk`](https://easecity.hk)
- **Product subdomain convention** (proposed):
  - Marketing/landing: `ecshare.easecity.hk` (or subpath `easecity.hk/ec-share`)
  - Signaling / share cloud: `share.easecity.hk`
  - Share links (user-facing URLs): `share.easecity.hk/v/<token>`
  - Downloads / updater channel: `dl.easecity.hk`
- **Later opportunity**: acquire a short link domain (e.g. `ecsh.re`, `easec.it`, 4-8 chars) once share feature ships in M3, to make Slack/email pastes friendlier. Not a blocker for launch.

---

## 2. Positioning statement (Campbell method)

> **For developer, QA, and support teams who need to see and operate Android devices in real time, EC-Share is a modern Android mirroring platform that — unlike Vysor or free scrcpy — lets you watch 15 devices at once, share any one of them with a teammate via a browser link, and pass enterprise security review.**

Breakdown:
- **Target audience**: dev, QA, support teams (not consumers, not casual users)
- **Core benefit**: real-time device visibility & control
- **Category**: Android mirroring platform
- **Differentiators vs incumbents**: multi-device grid + share-link + enterprise-ready
- **Core message**: "Vysor was great for one device. EC-Share is what a team uses."

---

## 3. Voice & tone

Inspired by Linear, Raycast, and Arc:

- **Confident without boasting**: "Connect 15 devices." not "Connect up to 15 amazing devices!"
- **Concrete over abstract**: "Open a link. See the phone." not "Seamlessly collaborate on device testing."
- **Show, don't tell**: marketing site leads with a 10-second GIF of share-link working, not a paragraph of benefits.
- **Respect the reader's time**: every page < 500 words above the fold.

---

## 4. Tagline

### Primary (confirmed)

> **"Android device mirroring for teams."**

- **Why this one**: SEO-optimized for the long-tail terms real buyers search ("android device mirroring", "mirror android for team"). It's a direct, no-poetry statement that works as both marketing hero and HTML `<meta name="description">`. Campbell rule: descriptive > clever when you're unknown.

### Usage rules
- Landing page hero: use primary verbatim.
- Installer splash: use primary.
- Social bio (X, LinkedIn): use primary.
- Presentations / pitch deck cover: you may use a punchier variant (see "secondary pool" below) for visual/brand feel, but always reference primary for search/SEO.

### Secondary pool (for internal decks / variants)
Kept as rotation options when the primary feels too plain for a specific surface:
- "Every Android. Every Screen. One Link." — product-beat emphasis
- "Your team's Android control room." — team/pro-user framing
- "Mirror. Grid. Share." — Linear-style, three beats
- "See the phone. Share the phone." — Arc-style rhythm

---

## 5. Visual direction

### Logo (deferred, wordmark in use until post-launch)

- **Phase 1 (now → M3 launch)**: text-only **wordmark** logo.
  - Type: Inter Bold or IBM Plex Sans Bold, 600-700 weight
  - Treatment: "EC-Share" rendered clean, single color. A subtle separator (dot, hyphen, or slash) between "EC" and "Share" is acceptable.
  - Icon slot (app launcher, taskbar): use a minimal geometric mark derived from the wordmark — e.g. "EC" in a rounded square, or a stylized grid-cell icon.
- **Phase 2 (post-launch, based on traction)**: commission professional logomark.
  - Recommended budget when revenue justifies: Dribbble/Upwork mid-tier, ~$200-500.
  - Brief will be written against the positioning statement + competitor visual review.

### Color system
- **Base**: dark-first. Near-black surface `#0F1114`, cards `#15181C`, borders `#2A2F36`.
- **Accent (choose one at launch)**:
  - Option A: Linear blue `#5E6AD2` — developer-tool coded, safe
  - Option B: Warm orange `#F76E11` — warmer, more consumer-ready, stands out in a sea of blue dev tools
  - Recommendation: **Option B (warm orange)** to differentiate from the sea of blue dev tooling (scrcpy, VSCode, Vercel, Linear, etc.)
- **Text**: off-white `#E6E9EE` body, pure white `#FFFFFF` only for headlines.
- **Color space**: P3 where available (macOS + modern Windows), sRGB fallback.

### Typography
- **UI**: Inter (free) — preferred for product readability
- **Marketing headlines**: Inter or IBM Plex Sans
- **Code / logs / shell text**: JetBrains Mono

### Motion
- 200-300 ms cubic-bezier `(0.4, 0.0, 0.2, 1)` transitions
- No bounce, no spring physics
- Motion is informational, not decorative

### Spacing
- 8 px grid throughout
- Generous whitespace (density reference: Linear, not Bloomberg Terminal)

### Iconography
- Lucide Icons (free, Apache 2.0) as default
- 1.5 px stroke, 24 × 24 default size

---

## 6. What EC-Share is **not** (brand guardrails)

- Not a consumer game streaming tool (unlike Steam Link, Moonlight).
- Not a remote IT desktop (unlike AnyDesk, TeamViewer).
- Not a QA automation framework (unlike Maestro, Appium).
- Not a cloud device farm (unlike BrowserStack, Sauce Labs).
- Not an ADB wrapper (unlike scrcpy Buddy, scrcpy GUI).

Avoid borrowing language from any of the above categories.

---

## 7. Decisions confirmed (this pass)

| # | Decision | Value |
|---|----------|-------|
| B-01 | Product name | EC-Share |
| B-02 | Parent company | EaseCity |
| B-03 | Primary domain | `easecity.hk` |
| B-04 | Primary tagline | "Android device mirroring for teams." |
| B-05 | Logo treatment (pre-launch) | Wordmark only; professional logo deferred post-launch |
| B-06 | Trademark strategy | Deferred until post-launch traction signal; when filed, register **both** English "EaseCity" / "EC-Share" + Chinese "逸城科技" + "EC-Share" |
| B-07 | Legal entity name (en) | EaseCity Technologies Limited |
| B-08 | Legal entity name (zh-Hant) | 逸城科技有限公司 |
| B-09 | Jurisdiction | Hong Kong SAR (HK Limited Company, BR issued) |

---

## 8. Still open (small items)

- [ ] Accent color choice: Linear blue vs warm orange (see §5). I recommend orange; founder confirms before UI overhaul begins in M1.
- [ ] Wordmark separator style: "EC-Share" vs "EC Share" vs "ECShare" vs "EC·Share". Affects how we render in headers + installer.
- [ ] Short sharing domain purchase (post-M3, when share feature actually ships).
