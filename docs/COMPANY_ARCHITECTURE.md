# EaseCity — Multi-Product Company Architecture (v0.1)

> **Status**: founder-requested. Long-lived reference doc governing how EaseCity extends beyond EC-Share without rewriting backend or re-educating users.
> **Inspired by**: Stripe (one account × 12 products), Atlassian (umbrella brand × product suite), GitHub platform (shared primitives + product-specific namespaces).
> **Applies to**: all EC-Share implementation decisions from this point forward.
> **Last updated**: 2026-04-23

---

## 0. Why this doc exists

Patrick McKenzie (Stripe) on Hacker News, paraphrased:

> "When we started Stripe, we made one correct decision and one incorrect one. The correct one: customer objects have no product attached. A Stripe Customer can buy Payments, Billing, Connect, Terminal, Atlas — they're all subscriptions against the same customer. The incorrect one: some early endpoints assumed 'the product is payments'. We rewrote those in 2016. Don't repeat our mistake."

EaseCity is where Stripe was on day 1. EC-Share is product #1 of N. This doc makes sure product #2 (whatever it is) doesn't force a rewrite of product #1's foundations.

---

## 1. Three-layer identity model

```
                        Layer 3: Product subscription
                        ┌──────────┬──────────┬────────┐
                        │ EC-Share │ Product2 │ ProdN  │
                        │ Pro tier │ Biz tier │ ...    │
                        └──────────┴──────────┴────────┘
                                ▲         ▲         ▲
                                │         │         │
                        Layer 2: Organization (optional, shared)
                        ┌──────────────────────────────────────┐
                        │ "Acme Corp" — members, SSO, audit     │
                        └──────────────────────────────────────┘
                                    ▲ (user belongs to org)
                                    │
                        Layer 1: EaseCity Account (user identity)
                        ┌──────────────────────────────────────┐
                        │ Email, OTP, password, 2FA, devices   │
                        └──────────────────────────────────────┘
```

### Layer 1: EaseCity Account
One per human. Email + OTP today; Google OAuth and other providers later.
- Works across ALL EaseCity products past and future.
- URL: `account.easecity.hk` (NOT `ec-share.easecity.hk/account`).
- Settings applicable cross-product: email, 2FA, language, security logs.
- Database: `easecity.users`.

### Layer 2: Organization (optional)
Groups of EaseCity Accounts. Represents a company/team.
- URL: `account.easecity.hk/org/<slug>`.
- Same org can subscribe to multiple EaseCity products with different seat counts.
- An account can belong to multiple orgs (dev consulting for 3 clients).
- Database: `easecity.organizations`, `easecity.org_members`.

### Layer 3: Product subscription
Each product sold (EC-Share, Product2, ...) is a subscription against an account OR an org.
- Individual (Pro tier): subscription attached to account.
- Team (Business/Enterprise): subscription attached to org.
- Database: `easecity.subscriptions` with `product_id` column (`ec_share`, `product2`).
- Stripe Customer = 1 per EaseCity Account or Org; all product subscriptions sit under it.

**Implication for billing**: a single Stripe invoice can have line items from multiple products. Customer sees "EaseCity Invoice #1234: EC-Share Pro ($19) + Product2 Business ($49)" — one payment, one receipt, one tax treatment.

---

## 2. Domain map (reserve now, populate as products launch)

```
easecity.hk                     ← Corporate umbrella
    /                           Homepage: "EaseCity — B2B tools for [whatever]"
    /products                   Products overview grid
    /products/ec-share          EC-Share product page
    /products/<future>          Future products
    /about                      Company, mission, team, jobs
    /blog                       Shared blog, tagged by product
    /press                      Media kit, logos, screenshots, boilerplate
    /contact                    Shared contact + support routing
    /privacy                    Entity-level privacy policy (one for all products)
    /terms                      Entity-level ToS (one for all products)
    /security                   Corporate security page (SOC2 etc.)

account.easecity.hk             ← Single-sign-on account dashboard (cross-product)
    /                           Account home with subscription list
    /billing                    Stripe Customer Portal redirect
    /security                   2FA, session management, device logins
    /org/<slug>                 Organization admin (if user is org admin)
    /ec-share/*                 EC-Share-specific account screens (devices, shares)
    /<future>/*                 Future product-specific screens

admin.easecity.hk               ← Internal EaseCity staff admin (subdomain, 2FA, IP allowlist)
    (cross-product; each product has its own section but same navigation/UI)

api.easecity.hk                 ← Cross-product HTTPS API
    /auth/*                     Shared: OTP, OAuth, sessions
    /account/*                  Shared: profile, org management, billing portal URLs
    /license/*                  Shared: JWT issuance, refresh (with product claim inside)
    /ec-share/*                 Product-specific: encoder policies, share tokens
    /<future>/*                 Future

docs.easecity.hk                ← Shared docs site, sectioned by product
    /ec-share                   EC-Share quickstart, troubleshooting
    /<future>                   Future

Product-facing subdomains (one per product, for brand salience + share-URL shortness):
share.easecity.hk               ← EC-Share signaling + browser viewer for invite links
                                   (product-specific; do NOT rename to "share.xyz"
                                    because users will send these URLs externally
                                    and domain consistency with easecity.hk matters)
dl.easecity.hk                  ← Shared installer hosting (paths distinguish products)
                                     dl.easecity.hk/ec-share/win/latest/
                                     dl.easecity.hk/<future>/...
```

**Optional per-product short domains** (post-launch, for viral/shareable links):
- `ecsh.re` → 302 redirect to `share.easecity.hk` (keeps DNS simple)
- Similar for future products if share UX demands shorter URLs

---

## 3. Backend rules for multi-product readiness

### Rule 1: Every API resource has a product namespace OR is explicitly shared

**Bad (current draft in API_CONTRACT.md)**:
```
POST /license/refresh   ← Ambiguous: which product?
```

**Good (updated)**:
```
POST /license/refresh
  Body: { product: "ec_share", device_fingerprint: "...", app_version: "..." }
  Response includes product-specific features array

POST /ec-share/share/create   ← Product-scoped resource
```

Rules:
- `/auth/*`, `/account/*`, `/org/*`, `/billing/*` → **shared** across products (no prefix)
- `/license/*` → **shared** but body/response carry `product` field
- `/ec-share/*` → **product-specific**
- `/<future>/*` → **product-specific**

### Rule 2: License JWT carries product claim

The JWT (API_CONTRACT §6) must have:
```json
{
  "sub": "usr_xyz",
  "product": "ec_share",   ← NEW: tells desktop client this JWT is for which product
  "tier": "pro",
  ...
}
```

A user who has **both** EC-Share Pro and (future) Product2 Business gets **two JWTs**, one per product. Each desktop app holds its own JWT.

### Rule 3: Database tables carry `product_id` from day 1

| Table | Must have product_id? | Notes |
|-------|----------------------|-------|
| `users` | ❌ No | Cross-product identity |
| `organizations` | ❌ No | Cross-product org |
| `org_members` | ❌ No | Cross-product membership |
| `subscriptions` | ✅ Yes | Product-specific |
| `licenses` | ✅ Yes | Product-specific JWTs |
| `trials` | ✅ Yes | Product-specific trials (can trial EC-Share + Product2 independently) |
| `devices` | ✅ Yes | `ec-share:<fingerprint>` — devices are product-scoped |
| `audit_log` | ✅ Yes (nullable for account-level events) | Product actions vs account actions |

### Rule 4: Stripe configuration uses products, not flat pricing

In Stripe dashboard:
```
Product: "EC-Share Pro"     → price_ec_share_pro_monthly, price_ec_share_pro_annual
Product: "EC-Share Business" → price_ec_share_business_monthly, ...
Product: "EC-Share Enterprise" → price_ec_share_enterprise_annual, ...

(future)
Product: "Product2 Pro" → ...
```

Each price has metadata `{ "product": "ec_share", "tier": "pro" }` so the webhook can dispatch without a lookup table that gets out of date.

### Rule 5: Staff Admin has product switcher

When a user opens `admin.easecity.hk`, they land on a dashboard showing KPIs for ALL products. A product dropdown filters views. Internal engineer sees:
```
EaseCity Staff Admin  [All products ▾]
  Users  Subscriptions  Trials  Audit log  ...
```

Dropdown options: "All products" (default) / "EC-Share" / "Product2" / ...

### Rule 6: Brand hierarchy in UI

Every product UI shows:
```
EaseCity ▸ EC-Share
```
At the top of the app. "EaseCity" links to corporate site, clickable. "EC-Share" is current product. This trains users on the hierarchy.

---

## 4. Decisions to rewrite or migrate from v0.2 drafts

These are the docs that currently assume EC-Share is a single product, and need light revision to align with multi-product architecture:

| Doc | Section | Before | After |
|-----|---------|--------|-------|
| `WEBSITE_CONTENT.md` | Site map | `easecity.hk/account`, `/org` | `account.easecity.hk`, subtree-based |
| `DASHBOARDS_SPEC.md` | §1 User Dashboard URL | `easecity.hk/account` | `account.easecity.hk` |
| `DASHBOARDS_SPEC.md` | §3 Customer Org Admin URL | `/org` within web app | `account.easecity.hk/org/<slug>` |
| `API_CONTRACT.md` | §2 Base URL | `https://api.easecity.hk` | unchanged; but paths must follow product-namespace rule |
| `API_CONTRACT.md` | §6 JWT payload | missing `product` claim | add `product: "ec_share"` |
| `BRAND.md` | §1 Name & entity | Product-centric | Make umbrella-first: "EaseCity is a holding; EC-Share is first product" |
| `SUBSCRIPTION_TIERS.md` | §6 Stripe setup | Flat products/prices | Scope products under "EC-Share [Pro/Business/Enterprise]" |
| `PRODUCT_ROADMAP.md` | §1 architecture transition | MUPhone → EC-Share | Add umbrella readiness as ongoing invariant |

All updates land in this session alongside this new doc.

---

## 5. What this does NOT force us to do

Building for future products ≠ building the future products now. Specifically:

- We do **NOT** build a product switcher in the desktop client (EC-Share is standalone desktop app)
- We do **NOT** build a unified marketing site with 5 empty product slots — EC-Share is the only headline product at launch
- We do **NOT** build cross-product billing bundles — one Stripe customer object is sufficient; bundles come later
- We do **NOT** build multi-product analytics dashboards — staff admin shows EC-Share metrics prominently, product dropdown is "All / EC-Share" with one option

The reserved architecture means product #2 costs 20% extra effort (add a prefix path, add a webhook dispatcher) instead of 200% (rewrite auth/billing/admin).

---

## 6. Decisions landing this session

| ID | Decision |
|----|----------|
| **D-23** | Umbrella architecture: EaseCity is umbrella; EC-Share is product #1 of N |
| **D-24** | User identity layer at `account.easecity.hk` (single sign-on across all future products) |
| **D-25** | API gateway at `api.easecity.hk` with shared `/auth/*` `/account/*` `/license/*` and product-namespaced `/ec-share/*` |
| **D-26** | License JWT carries `product` claim; one JWT per product per user |
| **D-27** | Stripe: products scoped as "EC-Share Pro/Business/Enterprise"; prices metadata `{ product, tier }` |
| **D-28** | Database schema: `subscriptions`, `licenses`, `trials`, `devices`, `audit_log` carry `product_id`; `users`, `organizations`, `org_members` do not |
| **D-29** | Staff Admin shows product switcher dropdown from day 1 (default "All products"; only "EC-Share" populated at launch) |
| **D-30** | Customer Org Admin URL moves from `easecity.hk/org` to `account.easecity.hk/org/<slug>` |
| **D-31** | Corporate content pages (Privacy, ToS, About, Contact) are shared across products; product-specific sub-pages linked under `/products/<product>` |

---

## 7. Questions deferred to a later day (open)

- [ ] When should we move from "shared everything" to "one product per line of business"? Threshold: 3+ products with orthogonal audiences.
- [ ] Multi-currency / multi-region billing: when do we need Paddle-as-MoR despite Stripe pick? (Answer: when revenue > $500k/yr and tax compliance is bottleneck.)
- [ ] Does the future product share Stripe Customer with EC-Share, or will we need separate EaseCity entities for regulatory reasons (e.g., financial products)? → consult CPA if expanding into regulated vertical.
- [ ] Mobile apps across products: shared login via OAuth PKCE, or product-specific mobile apps with separate login?
