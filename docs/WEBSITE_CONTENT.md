# EC-Share — Website Content Requirements (v0.1)

> **Audience**: web team building `easecity.hk` + subdomains.
> **Purpose**: exhaustive list of pages to build + content assets each page needs (so nothing is forgotten when founder ships a tester build and suddenly the website has half-finished pages).
> **Last updated**: 2026-04-23

---

## 0. Site map

```
easecity.hk
├── /                          ← homepage (company + EC-Share pitch)
├── /ec-share                  ← EC-Share product page (or ecshare.easecity.hk)
├── /pricing                   ← tier comparison + CTA
├── /download                  ← installer download + system requirements
├── /docs                      ← user guide, quickstart, troubleshooting
├── /blog                      ← SEO content (optional launch; yes by M3)
├── /about                     ← company / team / mission
├── /contact                   ← contact form + support email + office address
├── /privacy                   ← privacy policy (legal)
├── /terms                     ← terms of service (legal)
├── /security                  ← security whitepaper (lightweight; Enterprise reassurance)
│
├── /login                     ← email-OTP login + future Google SSO
├── /signup                    ← trial signup flow (email → OTP → download)
│
├── /account                   ← User Dashboard (see DASHBOARDS_SPEC.md §1)
├── /org                       ← Customer Org Admin (see DASHBOARDS_SPEC.md §3)
│
└── /admin (on admin.easecity.hk) ← EaseCity Staff Admin (see DASHBOARDS_SPEC.md §2)
```

---

## 1. Homepage — `easecity.hk/`

### Role of homepage (corporate umbrella)

At launch, the homepage **sells EaseCity as a company** and **EC-Share as its flagship**. Weighting: ~60% EC-Share-specific content, ~40% corporate trust signals. When product #2 ships, this rebalances.

### Content needed from founder

| Asset | Recommended | Notes |
|-------|-------------|-------|
| Hero headline (launch) | "Android device mirroring for teams." (from BRAND.md — **confirmed**) | At M1 launch, product = hero. Post product #2, switch to company-level headline. |
| Company sub-headline | "EaseCity builds B2B developer tools for modern teams." (or similar) | Founder confirms tone |
| EC-Share hero GIF/video | 10-15 second loop of grid → focus → share link → browser viewer | **Needed from M0.5 onward**; founder/Cursor produces by running the app |
| Products showcase | Single product card at M1 (EC-Share); grows as products launch | Reserved slot for product #2 |
| Feature blocks (EC-Share, 3-4) | Grid / Focus / Share link / Enterprise | Needs icon + 1-paragraph each |
| Customer logos (post-launch) | 5-8 logos of paying customers | Skip until you have permission |
| Testimonial (post-launch) | 1-3 quotes + headshot + company | Skip until M3+ |
| Press/media mentions | Product Hunt badge, Hacker News thread link | Add post-launch |
| Final CTA | "Start your 14-day free trial of EC-Share" | Button → `account.easecity.hk/signup?product=ec-share` |

### SEO metadata

- Title: `EC-Share — Android device mirroring for teams`
- Meta description: 155-160 chars, reuse tagline + call out team feature
- OG image: 1200×630 PNG with EC-Share wordmark + screenshot
- Canonical: `https://easecity.hk/`

---

## 2. EC-Share product page — `/ec-share` (or `ecshare.easecity.hk`)

Deep-dive on the product. Homepage sells the category; this page sells the specific product.

### Content needed

| Section | Asset | Notes |
|---------|-------|-------|
| Product hero | Wordmark + tagline + 1 big screenshot | Screenshot from M0.5 |
| "How it works" | 3-step illustrated flow (connect → grid → share) | Web designer draws; founder approves |
| Full feature list | Bulleted + icons, ~15-20 features | Draft from SUBSCRIPTION_TIERS.md matrix |
| Device compatibility | "Android 5+ required; Windows 10/11" | From ARCHITECTURE.md |
| Codec capabilities | "Hardware H.264 + H.265 on compatible devices" | From encoder-probe work |
| Performance stats | "Sub-100ms latency on LAN" + benchmark graphic | Run benchmarks in M0.5 |
| Comparison table | EC-Share vs Vysor vs scrcpy | From PRODUCT_ROADMAP.md §0 |
| FAQ | 10-15 Q&A | Start with SUBSCRIPTION_TIERS.md §8; expand from support tickets |
| Download CTA | Single big button | → `/download` |

---

## 3. Pricing — `/pricing`

### Content needed

- **Tier comparison table**: identical to SUBSCRIPTION_TIERS.md §1 but cleaner visual design
- **Monthly / Annual toggle**: default to **Annual** (Campbell data: 38% conversion vs 7%)
- **Currency toggle**: USD primary; HKD / EUR / GBP optional (Stripe handles conversion)
- **Per-tier CTA buttons**:
  - Trial: "Start free 14-day trial" → `/signup`
  - Pro: "Subscribe to Pro" → Stripe Checkout
  - Business: "Subscribe to Business" → Stripe Checkout
  - Enterprise: "Contact sales" → mailto or form
- **FAQ** (pricing-specific): billing cadence, refund policy, team vs seat, etc.
- **Trust signals**:
  - Stripe badge ("Payments secured by Stripe")
  - SOC2 badge (when Enterprise tier ships M4+; not before — don't lie)
  - Currency + tax info ("Prices exclude applicable VAT/GST")

### Stripe integration points (web team owns)

| Button | Destination |
|--------|-------------|
| Pro monthly | Stripe Checkout with `price_pro_monthly` |
| Pro annual | Stripe Checkout with `price_pro_annual` |
| Business monthly | Stripe Checkout with `price_business_monthly` |
| Business annual | Stripe Checkout with `price_business_annual` |
| Enterprise | `mailto:enterprise@easecity.hk` or custom form |

---

## 4. Download — `/download`

### Content needed

- Big "Download for Windows" button (initially only Windows)
- **What you get**: a brief list (installer size, first-run wizard, 14-day Pro trial included)
- **System requirements**: Windows 10 version 2004+, x64, 4GB RAM, USB port for Android
- **Vendor binaries notice**: "EC-Share includes ADB tools from Google and scrcpy from Genymobile (both open source)"
- **Checksum / signature verification**: SHA256 of installer + instructions to verify (for security-conscious users)
- **macOS / Linux** subscribe-to-notify form (gauge demand before building M5)
- **Version history**: collapsible changelog; auto-generated from GitHub releases or manual

### Assets needed

- Installer MSIX / zip hosted on `dl.easecity.hk` (Cloudflare Pages or S3)
- Release notes (auto-extracted from CHANGELOG.md)
- Screenshot or GIF showing the install experience

---

## 5. Docs — `/docs`

### Minimum viable content for M1 launch

- **Quickstart** (10 min): install → connect first device → see grid → focus mode → try share
- **Connecting Android devices**: USB debugging setup, troubleshooting ADB
- **Multi-device setup**: how to connect 5, 10, 15 devices without hubs; recommended hub chips
- **Sharing devices**: Pro's LAN URL; Business's cross-network invite link
- **Troubleshooting**: device not appearing, black screen (matches MUPhone3 debug cases we've hit), codec compatibility
- **FAQ**: billing, refunds, trial extension, offline usage

### Tech for docs

- **MkDocs Material** or **Docusaurus** hosted statically; simple to maintain, search-friendly
- **Alternatively**: inline in Next.js app with MDX — more work but better brand consistency

### Content creators needed

- Founder drafts from M0.5 tester Q&A (what did they actually ask?)
- Web team formats into docs-site structure
- Post-launch: accept community PR contributions

---

## 6. Blog — `/blog` (optional M1; yes by M3)

SEO engine + thought leadership. Post-launch.

Launch topics (write before M1 ships, publish at M1 launch day):
- "Why we built EC-Share: scrcpy is great, Vysor is great, we needed both."
- "Hardware vs software encoders on Android: what we learned building EC-Share"
- "How to mirror 15 Android devices at once for QA testing"
- "Announcing EC-Share: Android mirroring for teams"

Technology: same stack as `/docs` or simple headless CMS (Sanity / Contentful / Ghost).

---

## 7. About — `/about`

### Content

- Company overview: EaseCity Technologies Limited (逸城科技有限公司), founded 2026, HK SAR
- Mission statement (1 paragraph)
- Founder bio + photo (optional; photo humanizes early-stage company)
- Jobs (link, even if empty for now — signals growth)
- Press kit (logo downloads, screenshots, spokesperson email)

---

## 8. Contact — `/contact`

- Support email: `support@easecity.hk`
- Sales (Enterprise): `enterprise@easecity.hk`
- General: `hello@easecity.hk`
- Office address (post BR registration): use BR-registered address
- Contact form (short: name, email, category, message) → routes to HubSpot/Plain/Crisp ticket

---

## 9. Legal — `/privacy` + `/terms`

### Must-have clauses

- **Privacy policy**:
  - Data Controller: `EaseCity Technologies Limited (HK Company)`
  - What we collect: email, payment info (via Stripe), device fingerprints, session metadata, telemetry (if opted in)
  - What we never collect: **device screen content**, keystrokes, location
  - Third parties: Stripe, DigitalOcean (TURN), Fly.io (signaling), Postgres host, email provider
  - GDPR rights: export, delete, object to processing
  - Cookies: essential only (no marketing trackers without consent banner)
  - Jurisdiction: Hong Kong SAR
  - Contact: `privacy@easecity.hk`

- **Terms of Service**:
  - Acceptable use (no reverse engineering the encoder, no using to spy on users without consent, etc.)
  - Subscription + refund terms (30-day refund policy per Campbell recommendation)
  - IP ownership (we own the product, you own your data)
  - Warranty disclaimer ("as is")
  - Liability cap (standard: fees paid in last 12 months)
  - Jurisdiction: Hong Kong courts

**Founder should**:
1. Draft from Termly / iubenda generator (paid template $10-30)
2. Have a HK solicitor review ($500-1,500 one-time) before launch — worth it for SaaS
3. **Do not** launch without these pages live

---

## 10. Security page — `/security`

Lightweight page for Enterprise prospects who ask "are you SOC2?"

- Encryption in transit: TLS 1.3
- Encryption at rest: DB encrypted (hosted Postgres)
- Authentication: email OTP today, SSO available in Enterprise tier
- Video stream: DTLS-SRTP end-to-end, never decrypted on our servers
- Data retention: minimum necessary; GDPR export/delete supported
- Third-party audits: SOC2 Type II targeted for M4+ (don't claim until achieved)
- Responsible disclosure: `security@easecity.hk` with PGP public key

---

## 11. Asset delivery checklist (who produces what)

| Asset | Produced by | Delivery timing |
|-------|-------------|----------------|
| Copy / headlines | Founder + web team collaboration | Pre-M1 for homepage; M1 launch for product pages |
| Screenshots | Cursor + founder (run the app, capture) | Post-M0.5 (when UI stabilizes) |
| GIFs / demo videos | Founder (using OBS / ScreenToGif free tools) | Post-M0.5 for homepage hero |
| Icons / illustrations | Web team with shadcn/Lucide + Midjourney | During M1 |
| Customer logos | Founder (after securing permission) | Post-M1 launch |
| Legal copy | Founder + HK solicitor | Pre-M1 launch |
| Logo / wordmark assets | Founder has wordmark; pro logo post-launch | Inline SVG OK for M1 |
| Press kit | Founder | At M1 launch day |

---

## 12. What EACH page's hero button should DO (conversion tracking)

| Page | Primary CTA button | Destination | Telemetry event |
|------|---------------------|-------------|-----------------|
| `/` homepage | "Start 14-day trial" | `/signup` | `cta_homepage_signup` |
| `/ec-share` | "Download" | `/download` | `cta_product_download` |
| `/pricing` Pro | "Start Pro" | Stripe Checkout | `cta_pricing_pro_checkout` |
| `/pricing` Business | "Start Business" | Stripe Checkout | `cta_pricing_business_checkout` |
| `/pricing` Enterprise | "Contact sales" | mailto or form | `cta_pricing_enterprise_contact` |
| `/download` | "Download for Windows" | installer URL | `cta_download_windows_click` |
| `/blog/*` | "Start 14-day trial" | `/signup` | `cta_blog_signup` |

**Web team**: wire these events to PostHog / Plausible / Mixpanel so founder sees conversion funnel.

---

## 13. Decisions needed from founder

- [ ] **Support email aliases** on `easecity.hk` domain: decide which aliases to create (`support@`, `enterprise@`, `privacy@`, `security@`, `hello@`)
- [ ] **Office address** to show on /contact (BR-registered or Virtual address)
- [ ] **Blog launch timing**: M1 launch day? Or delay until M3?
- [ ] **Analytics provider**: PostHog (open-source) / Plausible (lightweight EU) / Mixpanel (industry standard) — web team can recommend
- [ ] **Consent banner needed?** If any analytics beyond Plausible-like "cookieless" → need EU consent banner (Cookiebot, Axeptio, etc.)
- [ ] **ToS + Privacy drafting approach**: Termly/iubenda template + HK solicitor review, or custom-drafted from scratch?
