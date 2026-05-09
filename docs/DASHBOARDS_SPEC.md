# EC-Share — Three Dashboards Spec (v0.1)

> **Status**: founder-requested professional judgement. Scope of three distinct backends inside the EaseCity web estate.
> **Audience**: EaseCity web team implementing the backend surfaces; founder reviewing scope.
> **Best-minds framework**: Linear (workspace admin design) + GitLab (`/admin` vs `/-/user_settings` separation) + WorkOS (customer-side org admin).
> **Last updated**: 2026-04-23

---

## 0. Three distinct audiences, three distinct backends

Most SaaS founders conflate these three and build one monolithic "admin page." Linear and GitLab publicly documented why that's a mistake — it mixes security contexts, permissions, and UX expectations. Do three.

| Backend | Audience | Access URL | Who sees it | Security model |
|---------|----------|------------|-------------|----------------|
| **User Dashboard** (個人/用戶後台) | Every logged-in user | **`account.easecity.hk`** (subdomain, **cross-product** per COMPANY_ARCHITECTURE.md) | Everyone | Standard login (email OTP / SSO) |
| **EaseCity Staff Admin** (員工後台 / 管理員後台) | EaseCity internal team only | `admin.easecity.hk` (separate subdomain) | Founder + hired staff | Login + **2FA required** + **IP allowlist** |
| **Customer Org Admin** (公司後台 / 客戶組織後台) | Business + Enterprise tier customer admins | **`account.easecity.hk/org/<slug>`** (under account, **cross-product** scope) | Only users with `org_admin` role | Standard login + org-scoped permissions |

Founder is the only EaseCity staff at launch, but build the Staff Admin with **role-based access from day 1** — adding colleagues later is a 5-minute config change, not a rewrite.

---

## 1. User Dashboard — `account.easecity.hk`

### Audience
Every logged-in EaseCity account, **regardless of which product(s) they subscribe to**. Cross-product identity (D-24).

### Purpose
Self-service: manage all EaseCity subscriptions, devices, security, billing. Reduce support tickets. Single login for future products.

### Route structure (multi-product ready)

```
account.easecity.hk/
├── /                              Account home: show subscriptions across all products
├── /billing                       Shared Stripe Customer Portal redirect
├── /security                      2FA, sessions, email — cross-product
├── /org/<slug>                    Organization admin (if user is org admin)
├── /ec-share/                     EC-Share-specific: devices, shares
│   ├── /devices
│   ├── /shares
│   └── /trial (if trial active)
└── /<future-product>/             Placeholder for future products
```

### Pages

| Section | What the user does | Backed by |
|---------|-------------------|-----------|
| **Home** | See "welcome back" + subscription status + days-left-in-trial (if trial) + CTA to upgrade + **device list with "Connect" buttons** (see §1a) | Custom page pulling from license JWT |
| **Subscription** | View current tier; change plan (Pro ↔ Business); cancel; resubscribe; see next billing date; toggle annual/monthly | **Stripe Customer Portal** (80% free from Stripe, redirect them out) |
| **Payment method** | Update card; view invoice history; download PDF invoices | Stripe Customer Portal |
| **Devices** | See activated devices (fingerprint + nickname + last seen); rename; revoke (force logout from a machine); see seat quota | Custom page, calls `GET /api/v1/account/me` (API_CONTRACT §4.2) |
| **Shares** (Business/Enterprise only) | Active invite links; revoke; view count per link; 30-day history | Custom page, calls signaling server API |
| **Account** | Change email (requires OTP); logout all sessions; export data (GDPR); delete account | Custom page + API_CONTRACT §4.3 |
| **Notifications** | Email preferences (product updates, billing alerts, security) | Custom page |

### 1a. Device list with one-click "Connect" (D-37 2026-04-23, D-47 2026-04-24)

The dashboard's device list on the Home page shows each of the user's currently online devices (fed by the EaseCity backend, which aggregates what each running `ec-share.exe` reports to `api.easecity.hk` as heartbeat). Each row shows:

- **Alias** (user-set nickname, e.g. "Eric's Pixel 7") — primary label. Falls back to `serial` when no alias is set (D-47).
- **Phase indicator** — colored dot (online / locked / starting / failed / offline)
- **Reachability hint** — "LAN" / "VPN" / "Public" based on endpoint analysis
- **Codec/encoder tag** — small text like `H.264 hw` or `H.264 sw` (useful for enterprise diagnostics)
- **Last seen** — "5s ago" / "2m ago" if heartbeat stale

Next to each device:

| Button | Action | Status |
|--------|--------|--------|
| **Open in app** (primary) | Launches `ec-share://connect?host=<alice_reachable_endpoint>&device_id=<id>&token=<short-lived-jwt>` protocol handler → Windows dispatches `ec-share.exe --client-only <host>` with the JWT providing authorization | **M3 feature**; M0.5 uses manual copy-paste of host |
| **Open in browser** (fallback) | Opens `share.easecity.hk/v/<token>?device_id=<id>` — browser viewer via WebRTC (Path B) | **M3 feature** |
| **Copy host** (alternative) | Copies `host:port` string; user pastes into their `ec-share.exe` peer-connect field manually | Available once M0.5 ships the `--client-only` flow |

**Protocol handler registration** (M1 installer work): the installer registers `ec-share://` as a URL scheme under `HKEY_CLASSES_ROOT\ec-share\shell\open\command` pointing to `ec-share.exe --client-only %1`. The Dart side parses the full URL and extracts `host`, `device_id`, `token`.

**Token verification** (M3 backend work): the dashboard asks `api.easecity.hk/api/v1/share/create` for a short-lived JWT bound to this user, this device, and this tier's permissions. Alice's `ec-share.exe` server (if it's the one Bob connects to) validates the token signature against the EaseCity public key embedded at install time before accepting the connection. For same-account connections (Alice shares to her own machine on another network), the token also carries `self=true` and the server skips additional checks.

**Why a protocol handler and not just a deep link**:
- Shorter flow: 1 click instead of "copy paste host → open app → paste"
- Chained experience: user sees device list on web, taps → native app opens in 2-3 seconds
- Avoids reinventing single-sign-on for the native app (the URL token IS the auth)
- Matches Zoom / Slack / Teams behavior users already expect

### What to show for each tier

| | Trial | Pro | Business | Enterprise (member) |
|---|---|---|---|---|
| Home banner | "X days left in trial" + upgrade CTA | "You're on Pro" | "You're on Business" | "Member of Acme Corp" |
| Subscription section | Read-only + CTA to subscribe | Yes | Yes | Read-only (org admin controls) |
| Devices section | Yes (1 device) | Yes (5) | Yes (15) | Yes (unlimited) |
| Shares section | Hidden | Hidden | Visible | Visible |
| Export/delete data | Yes | Yes | Yes | Yes |

### Empty states (often forgotten)

- **Trial user who hasn't used the app yet**: show "Download EC-Share to get started" with big download button
- **No devices registered**: show onboarding illustration + step-by-step first-device guide
- **No shares yet** (Business): link to docs on how to create a share link

---

## 2. EaseCity Staff Admin — `admin.easecity.hk`

### Audience
**EaseCity internal team only.** Launch = founder (Eric) alone. Post-launch = 2-5 staff (support, engineer, finance, etc.) — design for growth, not for today's team size.

### Security posture (non-negotiable)

- Separate subdomain `admin.easecity.hk` — **not** a path within the main site (reduces attack surface)
- **Cloudflare Zero Trust** or IP allowlist at the edge (office/home IPs; WireGuard/Tailscale for remote)
- **2FA mandatory** for every staff account (TOTP via authenticator app; no SMS)
- Every action logs to an append-only **audit log** that staff cannot edit
- Session timeout 30 minutes of inactivity
- Backend requires staff-role JWT, not user-role JWT (separate signing key)

### Staff roles (internal RBAC)

| Role | Permissions |
|------|-------------|
| **SuperAdmin** | Everything, including adding/removing staff. Founder only. |
| **Support** | Search users, reset passwords, extend trials, resend OTP, view (not modify) subscriptions |
| **Billing** | View + issue refunds, see MRR/LTV, export financial reports; cannot change user tier |
| **Engineer** | View system logs, feature flags, integrations health; cannot access PII except for debugging tickets |
| **ReadOnly** | See everything non-sensitive; for board/investor read-only accounts |

### Pages

| Section | What staff does |
|---------|-----------------|
| **Dashboard home** | KPIs: MRR / WAU / DAU / trials active / conversion rate (last 7/30 days) / churn rate / active shares / error rate |
| **Users** | Search by email / user_id / Stripe customer_id; see full profile (subscription, devices, shares, audit trail of that user) |
| **Subscriptions** | List all; filter by tier / status / renewal date; highlight "past due" + "cancelling" |
| **Trials** | All active trials; days left; one-click extend (logged in audit) |
| **Share sessions** | Recent share sessions; revoke; see duration + bytes relayed (TURN) |
| **Support tools** | Resend password; resend OTP; force logout; manual tier override (with justification required) |
| **Feature flags** | Toggle flags on per-user or per-cohort basis; for beta testing Pro features with specific customers |
| **Broadcasts** | Compose email/in-app notice; target segment (tier / country / last-active); approval queue if >1 staff |
| **System health** | Signaling server status, TURN region statuses, DB health, last webhook receipt from Stripe |
| **Audit log** | Every staff action (who did what to whom when) + user self-service events (login, device revoke, etc.) |
| **Staff management** (SuperAdmin only) | Add/remove staff, change roles, view staff's audit trail |

### Integration with other tools

Staff admin is **not** the analytics tool. Point engineers/founder at dedicated tools for deep dives:
- **Metrics**: Grafana Cloud / Datadog free tier
- **Error tracking**: Sentry
- **Log search**: Grafana Loki / Papertrail
- **Customer support ticketing**: Crisp / Intercom / Plain (recommended: Plain — built for dev tools)

Staff admin handles the **actions that require DB writes** (refunds, tier overrides, broadcasts). Everything read-only → point to external tools.

### Stack recommendation
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui (fast to build, looks decent, no design system work needed)
- **Backend endpoints**: `/api/admin/*` prefix, guarded by middleware requiring `staff_role` claim on JWT; all calls written to audit log before executing
- **Don't use Retool** unless you want vendor lock-in; SuperAdmin actions need to be testable in CI

---

## 3. Customer Org Admin — `account.easecity.hk/org/<slug>`

### Audience
Users with `org_admin` or `org_owner` role **in their own customer organization**. Business + Enterprise tiers only. Pro is individual-subscription (no organization exists).

**Cross-product scope**: an organization can subscribe to multiple EaseCity products. Org admin UI surfaces all subscriptions under one org (D-24, D-30).

### Access gating

```
┌─ User logs in
└─ Does user.org_memberships include any org where role ∈ {org_admin, org_owner}?
    ├─ YES → show "Organization" nav item, list orgs user can admin
    ├─       → clicking an org opens /org/<slug>
    └─ NO   → nav item hidden; /org routes return 404
```

### Roles inside a customer org

| Role | Who assigns | Permissions in their own org |
|------|-------------|-------------------------------|
| **org_owner** | Initial person who set up the org (the one whose credit card pays) | Everything, including closing the org |
| **org_admin** | Any org_owner or org_admin | Manage members + devices + settings + policies; cannot close org |
| **org_operator** | Any org_admin | Everyday users: connect devices, share; no admin access |
| **org_viewer** | Any org_admin | Watch-only; cannot operate devices (useful for customer-side QA observers) |
| **org_auditor** | Any org_admin (Enterprise only) | Read audit log only; for compliance officers |

### Pages

| Section | What an org admin does | Gated by tier |
|---------|-----------------------|---------------|
| **Org home** | See # members, # devices, # active shares, seat utilization | Business + |
| **Members** | Invite by email; assign role; remove; transfer ownership | Business + |
| **Seats** | Buy more seats ($15/mo extra for Business via Stripe Customer Portal); release seats | Business + |
| **Devices** | Org-wide device pool; shared or member-assigned; revoke | Business + |
| **Audit log** | All share sessions + admin actions in org | Business (30d) / Enterprise (unlimited + SIEM export) |
| **Shares** | All active share links across org; force-revoke any | Business + |
| **Policies** | Enforce "Device ID only" identity display; token-TTL cap; device share whitelist | Enterprise only |
| **SSO** | Upload SAML metadata or configure OIDC endpoint; test connection | Enterprise only |
| **Billing** | Invoice history; change payment method (owner only, via Stripe Customer Portal) | Business + |
| **Danger zone** | Transfer ownership; close organization (requires typing org name) | Business + |

### Key UX patterns

- **Role badges everywhere**: next to every member's name, always show their role
- **"You are viewing as org_admin for Acme Corp"** banner when in /org pages (prevents confusion if user is in multiple orgs)
- **Policy preview**: when org_admin changes a policy, show "This will affect X sessions / Y members"
- **Audit-log download**: CSV + JSON, signed by server (downstream auditors need to verify authenticity)

### Enterprise-only additions

- **Policy-as-code export/import** (for customers with multiple EC-Share orgs who want consistent policies)
- **Webhook integration**: customer can register their own webhook URL to receive audit events real-time
- **Priority support queue**: button to open a ticket that jumps their queue in Staff Admin's support tools

---

## 4. What ISN'T a dashboard (avoid scope creep)

These often get requested as "put it in admin" but should live elsewhere:

| Request | Put it where instead |
|---------|---------------------|
| "See all my screenshots" | Desktop app local filesystem; we don't store screen content |
| "Live stream my devices to my browser" | Already happens via share link at Business+; not an admin feature |
| "Team Slack/Discord integration" | Post-M4 feature; use Zapier/Webhook in the meantime |
| "AI-powered device issue detection" | Not in roadmap; don't build speculative ML |
| "Mobile app to manage my subscription" | Stripe has a native customer-portal mobile flow; redirect |

---

## 5. Build order (aligned with milestones)

| Dashboard | First usable version | Milestone |
|-----------|---------------------|-----------|
| **User Dashboard** | Login + subscription (Stripe Portal) + devices list + logout | **M2** (part of Identity & Licensing) |
| **EaseCity Staff Admin** | Dashboard home + Users search + Support tools | **M2** (founder needs it day-one to help first customers) |
| **Staff Admin (full)** | All sections above | **M3** (broadcasts, audit log maturity, feature flags) |
| **Customer Org Admin** | Members + Seats + Audit log | **M3** (arrives with Business tier launch) |
| **Customer Org Admin (Enterprise)** | Policies + SSO + Webhooks | **M4** (arrives with Enterprise tier launch) |

**Implication**: web team must deliver M2 User Dashboard + Staff Admin minimum by the time M1's desktop app ships. Otherwise paid users exist but have no place to manage their subscription (except Stripe's own portal, which is OK but incomplete).

---

## 6. Technology stack recommendation (web team's call; these are defaults)

| Layer | Recommendation | Rationale |
|-------|---------------|-----------|
| Marketing site (`easecity.hk`) | **Astro** or **Next.js** | SSG for SEO; minimal JS; easy to content-edit |
| User Dashboard (`easecity.hk/account`) | **Next.js** (same codebase as marketing, shared layout) | Fewer repos, shared components |
| Customer Org Admin (`easecity.hk/org`) | Same Next.js app, gated routes | Ditto |
| Staff Admin (`admin.easecity.hk`) | **Separate React+Vite SPA** | Security isolation, faster builds, different dependency set |
| API (`api.easecity.hk`) | **Go** or **Python FastAPI** — web team's call | One backend serves all frontends |
| Database | **Postgres** (Supabase / Neon / RDS) | |
| Auth | **Email-OTP** custom for v1; add Google OAuth in M3+; WorkOS for SSO in M4 | |
| Design system | **shadcn/ui + Tailwind** for both frontends | Copy-paste components; no dependency lock |

---

## 7. Decisions to propose (founder sign-off needed)

- [ ] **D-19**: Three dashboards model (User + Staff + Org) as specified here
- [ ] **D-20**: Staff Admin on separate subdomain `admin.easecity.hk` with IP allowlist + 2FA (non-negotiable)
- [ ] **D-21**: Org Admin gated routes inside main web app at `/org` (not separate subdomain)
- [ ] **D-22**: Stack: Next.js for public+user+org; separate Vite SPA for Staff Admin
- [ ] **D-23**: M2 delivers User Dashboard + minimum Staff Admin; M3 adds Org Admin; M4 adds Enterprise features
- [ ] **D-24**: Defer all "AI analytics" / "mobile app" / "integrations marketplace" features until post-M5
