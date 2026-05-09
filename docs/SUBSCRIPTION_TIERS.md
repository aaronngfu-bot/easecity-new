# EC-Share — Subscription Tiers (v0.2)

> **Status**: founder-confirmed pricing + trial model. Detailed implementation specs locked.
> **Framework**: Patrick Campbell's "graduation trigger" approach — each tier boundary answers *"why do I have to upgrade?"* in one sentence.
> **Prices in USD**. Adjust local pricing per market (APAC ≈ 0.7-0.8x, EU ≈ parity).
> **Last updated**: 2026-04-23

---

## 1. Tier matrix

> **Licensing model**: paid-only with 14-day Pro-level free trial. No free-forever tier. After trial expiry, the product requires a valid license to launch.

| | **Trial (14 days)** | **Pro** | **Business** | **Enterprise** |
|---|---|---|---|---|
| **Monthly price** | Free for 14 days | **$19** | **$49** | Custom (**from $2,499/yr / 50 seats**) |
| **Annual price** | — | **$190 (17% off)** | **$490 (17% off)** | Custom, annual-only |
| **Post-trial behavior** | Convert to paid or lock to reminder screen | — | — | — |
| **Graduation trigger** *(why you must upgrade)* | — | "I need to show someone outside my network" | "Legal says no SSO, no deal" | — |
| **Connected devices** | Up to 5 (same as Pro) | **5** | **15** | Unlimited |
| **Device grid** | ✅ | ✅ | ✅ | ✅ |
| **Focus mode (Vysor-like)** | ✅ | ✅ | ✅ | ✅ |
| **Screenshot & screen record** | ✅ | ✅ | ✅ | ✅ |
| **H.264/H.265 codec** | H.264 + H.265 | H.264 + H.265 | H.264 + H.265 | H.264 + H.265 (+ AV1 if M4 delivers) |
| **Max resolution** | 1080p | **1080p** | **1080p + custom** | Unlimited |
| **LAN mirroring (same Wi-Fi)** | ✅ | ✅ | ✅ | ✅ |
| **LAN share URL (copy local link to same-Wi-Fi peer, no cloud)** | ✅ | ✅ | ✅ | ✅ |
| **Invite share link (cross-network, via EaseCity cloud)** | 1 viewer (trial only) | ❌ | **5 concurrent viewers** | Unlimited |
| **Self-host signaling + TURN (Docker Compose on your infra)** | ❌ | ❌ | ❌ | **✅ (only Enterprise)** |
| **Viewer role controls (view vs operate)** | Basic | ❌ | ✅ | ✅ + per-device override |
| **Audit log retention** | ❌ | ❌ | **30 days** | Unlimited + SIEM forward |
| **SSO (SAML/OIDC)** | ❌ | ❌ | ❌ | ✅ |
| **RBAC** | ❌ | ❌ | Basic (3 roles) | Full (4 roles + custom) |
| **On-prem deployment** | ❌ | ❌ | ❌ | ✅ |
| **SLA** | None | Best-effort | 99.5% on share cloud | 99.9% + contract |
| **Support** | Docs | Email (48h) | Business-hours chat | Dedicated CSM + on-call |
| **Seats per license** | 1 (no team during trial) | 1 | Starts at 3, $15/seat add | Starts at 50, volume discount |

### Notes on trial design
- **Trial scope = full Pro + taste of Business**. Trial users get 1 share-viewer to experience the invite-link feature; this is Business's anchor, and letting trial users taste it drives Pro→Business upsell later.
- **Trial registration requires email**. No anonymous trials — we need an identity to track conversion.
- **Device fingerprint** is captured at trial start; 1 trial per machine per 365 days to prevent reset-abuse.
- **No credit card required to start trial**. Campbell data: no-CC trials have higher start rates (+300%) but lower conversion to paid (~35% lower). Counter this with good in-app conversion prompts on day 7, 12, 14.

---

## 2. Graduation trigger design (Campbell rule)

Every tier jump must have exactly one crystal-clear reason. In order of power:

### Trial → Pro
**Trigger**: "The 14 days ran out and I still need this daily."
- This is the **easiest conversion** — user already embedded the product in their workflow.
- Target conversion from Trial to Pro: **12-18%** (industry benchmark 10-15% for no-CC dev tools; we aim higher with strong in-trial hooks).

### Pro → Business
**Trigger**: "My client/colleague is on another network and I need them to see what I see."
- This trigger fires when Pro users start sending screen recordings over Slack/email. We know via telemetry (with their consent).
- Target conversion from Pro: **10-15%** over 12 months (higher because need is painful).

### Business → Enterprise
**Trigger**: "Our IT security team won't approve without SSO / SOC2 / on-prem."
- Pure gatekeeper trigger. Product features are secondary; compliance is primary.
- Target conversion from Business: **5-8%** (but ACV is 5-10x, so revenue-dominant).

---

## 3. What NOT to tier (intentional decisions)

Some features are in every tier so they never become a purchasing friction:

| Feature | Reason kept in every tier |
|---------|--------------------------|
| Focus mode | UX bedrock; gating it would make the product feel broken |
| Fast startup & low latency | Table stakes; don't gate table stakes |
| Auto-update | Support cost of outdated clients > revenue from gating |
| Basic keyboard/mouse passthrough | Core value |
| H.265 codec | Encoder probe already works; gating codec yields minimal $ but confuses users |

---

## 4. Pricing anchor methodology

We land at **$19 / $49 / $2,499** through Campbell's anchoring framework:

1. **Price against value per month to the buyer**, not cost-plus.
2. **Pro at $19**: QA/dev hourly rate is $30-60 globally. If EC-Share saves 1 hour/month → 2x ROI minimum. $19 is above "impulse purchase" ($10) and below "need boss approval" ($25-30).
3. **Business at $49**: fits most IC/team-lead credit cards without expense report. The jump from $19 → $49 (2.6x) is industry-standard for team tiers.
4. **Enterprise anchor $2,499/yr/50-seats = $50/seat/year**: intentionally **not** the lowest price on the market. Low anchors attract customers who won't pay for CSM. $2,499 is the "you're serious enough for our attention" floor; upsell on audit retention, SSO provider passthrough, custom RBAC.
5. **Annual discount = 2 months free (17%)** — industry standard; any deeper discount leaves money on the table.

### Pricing test plan
- Launch Pro at $19; run 60 days; A/B test $15 vs $19 vs $25 in cohorts after that.
- Never discount listed price in first 6 months (trains expectation).
- Yearly plan 17% off from day 1 (cashflow + commitment).

---

## 5. Technical implementation of tier gating

### License + trial lifecycle

```
User visits easecity.hk/ec-share → downloads installer → launches
   │
   ├── First launch detected on this machine fingerprint → start 14-day trial
   │   - Prompt for email (required)
   │   - Store machine fingerprint + email + trial_start on backend
   │   - Issue trial JWT (exp=14 days, tier="trial")
   │
   ├── Existing license key (paid user on new machine) → sign in → activate
   │
   └── Trial expired + no paid license → block UI, show upgrade CTA
```

### License key format
Signed JWT issued by EaseCity subscription backend:
```json
{
  "sub": "user_abc123",
  "email": "founder@example.com",
  "tier": "pro",              // "trial" | "pro" | "business" | "enterprise"
  "seats": 1,
  "iss": "https://easecity.hk",
  "iat": 1735603200,
  "exp": 1738195200,          // refresh every 24h while online
  "features": ["grid", "focus", "codec_h265"],
  "max_devices": 5,
  "trial_expires_at": null    // set only for tier=trial
}
```
- **Signing**: Ed25519 keypair. Public key embedded in `ec-share.exe`; private key on backend HSM/env secret only.
- **Renewal**: client calls `POST https://api.easecity.hk/api/v1/license/refresh` every 24h while online; returns new JWT with updated `exp`.

### Offline grace (founder-confirmed)
- **0-14 days offline**: full functionality (cached last-known-good JWT).
- **14-30 days offline** (days 15-44 cumulative): **read-only mode** — can see live devices, can't operate, no new shares.
- **> 44 days offline**: fully locked, "reconnect to unlock" CTA.

Rationale (Campbell + enterprise IT reality): 14 days covers vacations + common business trips; 30 additional read-only days covers extended offline factory/industrial use cases that want visibility but not control.

### Feature gate API (both C++ and Dart)

C++:
```cpp
// entitlements.h
class Entitlements {
public:
    static bool has(std::string_view feature);   // "grid", "share", "audit_30d", "sso"
    static int max_devices();
    static std::string tier();                    // "trial", "pro", "business", "enterprise"
    static bool is_trial();
    static int days_left_in_trial();              // -1 if not a trial
    static bool is_read_only_mode();              // true when offline 14-44 days
};
```

Dart:
```dart
// entitlements.dart
class Entitlements {
  static bool has(String feature);
  static int get maxDevices;
  static String get tier;
  static bool get isTrial;
  static int get daysLeftInTrial;
  static bool get isReadOnly;
}
```

Callsites use defensive checks:
```cpp
if (!Entitlements::has("share")) {
    show_upgrade_modal("Share link requires Business tier.");
    return;
}
```

---

## 6. Billing backend — **Stripe (confirmed)**

Founder choice: Stripe. Rationale notes below.

| Aspect | Stripe specifics for EC-Share |
|--------|-------------------------------|
| Core fee | 2.9% + $0.30 per successful charge |
| Integration | Stripe Checkout (hosted) for M2 quick start; migrate to Stripe Elements in M3+ for nicer UX |
| Subscription | Stripe Billing — handles proration, upgrade/downgrade, dunning |
| Tax compliance | **Buy Stripe Tax** (+0.5% revenue or $120/yr minimum). Handles VAT/GST for EU, UK, AU, Singapore, etc. Without this you lose weeks on quarterly tax filings. |
| Webhooks | Listen for `customer.subscription.*` → update license backend → reissue JWT |
| PCI scope | Stripe Checkout = SAQ-A (lowest PCI burden). Don't handle card numbers yourself. |
| Refunds | Self-serve 30-day refund policy (Campbell data: reduces chargebacks 60%+) |
| Currency | USD primary; enable GBP, EUR, HKD at launch for localized checkout |

### Hong Kong-specific note
EaseCity Technologies Limited (逸城科技有限公司) is a Hong Kong SAR–registered limited company with an active Business Registration (BR). Implications:
- **Stripe Hong Kong account** registered under the company name above; HKD payouts, convert to USD/bank as needed.
- HK has **no VAT/GST**, so domestic sales to HK customers = 0% tax. Stripe Tax still helps for international customers (EU VAT, AU GST, Singapore GST, etc.).
- HK profits tax on net income: **two-tier rate — 8.25% on first HK$2M, 16.5% above**. File annually with IRD.
- No withholding tax on outbound payments to contractors in most jurisdictions.
- Founder should confirm with a HK CPA: offshore claim eligibility (if majority of revenue + customers are outside HK, may qualify for 0% profits tax under offshore regime — significant savings, needs proper documentation from day 1).

### Migration path if needed
If Stripe Tax fees become painful at scale (e.g. $50k/mo revenue → $250/mo Tax fees), consider moving to Merchant-of-Record provider (Paddle / LemonSqueezy) which bundles tax handling into their commission. Not a day-1 concern.

---

## 7. Code-signing decision — **EV cert (professional recommendation)**

You asked me to call this. **Buy an EV (Extended Validation) code-signing cert**.

### Why EV, not OV
| Aspect | EV cert (recommended) | OV cert (not recommended) |
|--------|------------------------|----------------------------|
| Cost | ~$300/yr (Sectigo, DigiCert, SSL.com) | ~$70-100/yr |
| Windows SmartScreen | **No warning from day 1** | Warns users for the first 30-60 downloads until reputation accrues |
| Microsoft Defender | Whitelisted fast | Slow to whitelist |
| Required hardware | USB token or cloud HSM (DigiCert-hosted, etc.) | Software cert |
| User onboarding impact | 0 friction | ~15-25% of installs abandon at the SmartScreen warning |

**Math**: if your M1 launch gets 1,000 downloads in month 1 and OV cert causes ~20% to bail at SmartScreen, that's 200 lost conversions. At trial→Pro conversion of 12% and $19/mo, that's ~$456/mo lost revenue. EV cert pays for itself **in week 1**.

### Procurement
- **Recommended vendor**: SSL.com or Sectigo (most HK-friendly, accept non-US entity)
- **Timeline**: 3-10 business days for identity verification (need business registration, bank reference letter, phone callback)
- **HSM options**: SSL.com's eSigner (cloud, $120/yr extra) or DigiCert's KeyLocker (free with EV)
- **Action item for founder**: start EV cert procurement as soon as M1 start date is set — it's the longest-lead item before installer ship.

---

## 8. FAQ — pre-empting pricing objections

> **"Why no free forever tier?"**
> Two reasons: (1) every free-forever user costs $3-8/month in support + bandwidth (telemetry data from comparable tools) and generates low conversion. (2) A 14-day full-feature trial converts 3-5x better than a crippled free tier at the same support cost. We'd rather spend those dollars acquiring paying users than hosting free ones indefinitely.

> **"Why $19 not $9.99?"**
> Pricing at 9.99 signals consumer impulse-buy and triggers discount culture. $19 signals "professional tool." Competitors live at $10-24/mo; we're mid-pack with a differentiated offer.

> **"Can I pay yearly and skip monthly?"**
> Yes, default to the yearly toggle. Campbell data: 38% of self-serve SaaS customers pick yearly when it's default, 7% when it's second option.

> **"What if a Business customer only has 2 seats?"**
> Sell them 3-seat minimum. If they push back, offer Pro with share-1-viewer as a compromise. Don't sell 2-seat Business — it erodes the tier ladder.

> **"What if I lose internet while traveling?"**
> Your license works offline for 14 days (full features) + another 30 days in read-only mode.

---

## 9. Decisions confirmed (this pass)

| # | Decision | Value |
|---|----------|-------|
| S-01 | Tier structure | **No free forever** — Trial (14d) → Pro → Business → Enterprise |
| S-02 | Pro price | $19/mo or $190/yr |
| S-03 | Business price | $49/mo or $490/yr |
| S-04 | Enterprise anchor floor | $2,499/yr / 50 seats ($50/seat/yr) |
| S-05 | Billing provider | **Stripe** (with Stripe Tax) |
| S-06 | Code-signing cert | **EV cert** (procure early, long lead time) |
| S-07 | Offline grace | 14 days full + 30 days read-only |
| S-08 | Trial feature scope | Full Pro + 1 share-viewer (taste Business) |
| S-09 | Trial requires CC? | **No**, email-only to maximize trial starts |
| S-10 | Self-host option | **Enterprise-only** (TailScale model; matches ROADMAP D-16) |
| S-11 | LAN share URL | **Free feature in all tiers** (matches ROADMAP D-17) |

---

## 10. Still open (small items)

- [ ] Decide annual pricing display: show monthly-equivalent ($190/yr ≈ $15.83/mo) or annual total ($190)? Recommendation: show monthly-equivalent prominently with "billed annually" in small text.
- [ ] Enterprise pricing page: public or "contact sales"? Recommendation: "Starting at $2,499/yr" displayed + contact form.
- [ ] Chinese/HK local pricing HKD equivalents for domestic market.
- [ ] Does Business seat floor (3) hold after first 10 customers? Review at M3+30 days.
