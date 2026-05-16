# EaseCity DESIGN.md

Version: 1.0

This document defines the visual system for rebuilding EaseCity web UI. It is intentionally project-specific and should be treated as the source of truth for future landing pages, pricing pages, public product pages, auth screens, and dashboard/admin surfaces.

The existing frontend style may be ignored during redesign work. The non-negotiable brand constant is the primary color:

`#00E5CC`

## Source Inspiration

Use these references as design ingredients, not brand clones.

- Linear: near-black product marketing, disciplined surfaces, restrained accent usage, product UI as the hero.
- Stripe: commercial trust, pricing clarity, gradient atmosphere for payment and conversion sections.
- Supabase: developer platform credibility, product mockups, API and database-like UI patterns.
- NVIDIA: high-performance engineering energy, angular structure, dense technical storytelling.
- Vercel: minimal typography, black/white discipline, technical captions, clear deployment-style hierarchy.

Never copy logos, proprietary brand marks, proprietary fonts, screenshots, mascots, or distinctive brand-owned composition. Translate the principles into EaseCity's own visual language.

## Product Frame

EaseCity builds stream control infrastructure for teams that need one desktop hub to monitor and operate many Android devices in real time.

Primary product memory:

One control plane. Many live devices. No operational drift.

Audience:

- QA teams controlling multiple test devices.
- Support teams assisting device fleets.
- Operations teams monitoring live endpoints.
- Technical buyers evaluating low-latency infrastructure.
- Enterprise stakeholders who need reliability, auditability, and commercial trust.

Emotional tone:

- Precise
- Fast
- Controlled
- Infrastructure-grade
- Calm under load
- Premium but not decorative

Visual direction:

`industrial control plane`

The interface should feel like a live operations room rendered with the polish of a premium developer platform.

## Core Principles

1. Cyan is a signal, not decoration.
   Use `#00E5CC` for live state, primary action, focus, selected controls, and key data. Do not spread it across every border and icon.

2. Product UI is the protagonist.
   Pages should be built around console panels, device streams, topology maps, command logs, license states, billing status, and system metrics.

3. Dark canvas first, white canvas only for contrast.
   Use black and charcoal for heroes, dashboards, nav, and product panels. Use white or near-white for pricing comparison, legal copy, docs-like detail, or payment confidence sections.

4. Depth comes from surfaces and rules.
   Prefer stacked surface tones, 1px borders, top-edge highlights, and structured grids. Avoid generic floating glass cards everywhere.

5. The page should feel engineered.
   Layouts can be asymmetrical, dense, and technical, but reading order must stay obvious.

6. Motion must communicate system state.
   Animate sync, scan, stream, focus, and transitions. Avoid random bouncing, floating, or decorative motion.

## Color Palette

### Brand And Signal

- `signal`: `#00E5CC`
  Primary brand color. Use for primary CTA, selected state, live indicators, focus rings, active links, data highlights, and control lines.

- `signal-light`: `#35F5E0`
  Hover state, glow edge, high-energy data highlight.

- `signal-deep`: `#008F82`
  Pressed state, chart secondary cyan, subdued active state.

- `signal-dim`: `#003F3A`
  Tinted backgrounds, active table rows, subtle panels.

- `signal-veil`: `rgba(0, 229, 204, 0.12)`
  Ambient cyan overlay for hero atmosphere and selected cards.

### Dark Surfaces

- `void`: `#030506`
  Deepest page canvas. Use for hero, dashboard, footer, and full-screen app shells.

- `canvas`: `#07090B`
  Default dark page background.

- `surface-1`: `#101418`
  Cards and section panels.

- `surface-2`: `#171D22`
  Raised cards, product mockups, active pricing tier.

- `surface-3`: `#20282E`
  Nested controls, dropdowns, hover backgrounds.

- `surface-4`: `#2B353C`
  Highest dark elevation, rarely used.

### Light Surfaces

- `paper`: `#F7FAFA`
  Light section background.

- `paper-soft`: `#EEF4F3`
  Comparison table background, pricing feature rows.

- `paper-card`: `#FFFFFF`
  Light cards and form panels.

- `paper-border`: `#D8E2E0`
  Hairline borders on light surfaces.

### Text

- `text-primary`: `#F5F8F8`
  Main text on dark.

- `text-secondary`: `#C6D1D0`
  Paragraphs on dark.

- `text-muted`: `#839190`
  Captions, meta, inactive navigation.

- `text-faint`: `#536160`
  Disabled labels and non-critical metadata.

- `ink`: `#07100F`
  Main text on light.

- `ink-secondary`: `#344240`
  Paragraphs on light.

- `ink-muted`: `#667472`
  Captions on light.

### Semantic

Semantic colors should support system clarity without competing with signal cyan.

- `success`: `#20D990`
- `warning`: `#F5A524`
- `danger`: `#FF4D5E`
- `info`: `#7CA8FF`
- `neutral`: `#9AA6A5`

### Gradient Rules

Use gradients sparingly.

Allowed:

- Hero atmosphere: `radial-gradient(ellipse at 70% 0%, rgba(0,229,204,0.20), transparent 56%)`
- Payment/pricing trust section: cyan -> deep navy mesh with very low saturation.
- Data line glow: `linear-gradient(90deg, transparent, #00E5CC, transparent)`

Avoid:

- Purple-blue SaaS gradients.
- Rainbow feature cards.
- Cyan gradients on every heading.
- Overlapping glassmorphism effects that reduce readability.

## Typography

Use open-source or already-configured fonts only. Do not import proprietary fonts from reference brands.

Recommended project mapping:

- Display: `font-display`
  Large headings, hero numerals, chapter openers.

- Body: `font-sans`
  Paragraphs, nav, pricing, forms, admin UI.

- Mono: `font-mono`
  Device IDs, status codes, latency, command logs, license keys, API paths, telemetry captions.

### Type Scale

- `display-hero`: clamp(4.5rem, 13vw, 11rem), weight 700, line-height 0.88, letter-spacing -0.055em.
  Use for one memorable hero construct such as `1 -> N`, `CONTROL`, or `SYNC`.

- `display-xl`: clamp(3.2rem, 8vw, 6.5rem), weight 650-750, line-height 0.95, letter-spacing -0.045em.
  Use for page hero headings.

- `display-lg`: clamp(2.4rem, 5vw, 4.5rem), weight 650, line-height 1.0, letter-spacing -0.035em.
  Use for section openers.

- `heading-xl`: 32px, weight 650, line-height 1.15.
  Use for feature section titles and pricing tier headers.

- `heading-lg`: 24px, weight 600, line-height 1.25.
  Use for cards and dashboard panels.

- `body-lg`: 18px, weight 400, line-height 1.65.
  Use for hero body and high-level explanatory copy.

- `body`: 16px, weight 400, line-height 1.6.
  Use for normal content.

- `body-sm`: 14px, weight 400, line-height 1.5.
  Use for card text, table cells, help text.

- `caption`: 12px, weight 500, line-height 1.4.
  Use for metadata and small status labels.

- `micro-mono`: 10px to 11px, mono, uppercase, letter-spacing 0.18em.
  Use for system labels: `LATENCY`, `NODE`, `LICENSE`, `STREAM`, `ORDER`.

### Typography Rules

- Use display type for impact, not for every section.
- Mono labels should be functional and sparse.
- Avoid centered copy blocks longer than 3 lines.
- Use tabular numerals for money, latency, counts, and percentages.
- On Chinese pages, preserve clarity over decorative tracking. Avoid excessive letter spacing in Chinese body text.

## Layout System

### Container

- Max width: 1280px for normal marketing content.
- Wide product mockup: up to 1440px.
- Text reading width: 640px to 760px.
- Dashboard/admin content: full width with 24px to 32px page padding.

### Grid

Use a 12-column grid on desktop.

Recommended patterns:

- Hero: 7 columns text / 5 columns product console, or 5 columns copy / 7 columns live UI.
- Feature sections: one dominant panel plus two supporting panels, not equal card grids by default.
- Pricing: 3 columns desktop, 1 column mobile, with one highlighted plan.
- Admin dashboards: 4 metric cards, then 8/4 split for chart and activity feed.

### Spacing

Base unit: 4px.

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px
- `space-24`: 96px
- `space-32`: 128px

Section rhythm:

- Hero: 96px to 144px vertical padding.
- Dense product panels: 32px to 64px vertical padding.
- Marketing sections: 80px to 120px vertical padding.
- Dashboard/admin pages: 24px to 40px vertical padding.

### Responsive Behavior

- Below 1024px: collapse product mockups below copy.
- Below 768px: single-column layout, shorter hero type, sticky nav simplified.
- Below 480px: reduce chrome, hide secondary telemetry, preserve primary CTA and live state.
- Touch targets: minimum 44px height.
- Avoid horizontal scrolling except for deliberate code/table scrollers with visible affordance.

## Shape, Borders, And Depth

### Radius

- `radius-xs`: 4px for status badges and tiny controls.
- `radius-sm`: 6px for inputs and compact buttons.
- `radius-md`: 8px for primary buttons and small panels.
- `radius-lg`: 12px for cards.
- `radius-xl`: 16px for product screenshots and large panels.
- `radius-full`: only for status dots, avatars, and segmented controls.

Avoid overly soft 24px+ SaaS cards unless the component is intentionally a large hero object.

### Borders

Use 1px borders as structure.

- Dark border: `rgba(255,255,255,0.08)`
- Dark strong border: `rgba(0,229,204,0.28)`
- Light border: `#D8E2E0`
- Data border: `rgba(0,229,204,0.18)`

### Shadows

Use shadows sparingly on dark UI.

- Product panels may use a deep drop shadow: `0 32px 90px rgba(0,0,0,0.48)`.
- Cyan glow should appear only on active controls, live streams, and primary CTA hover.
- Light pricing cards may use soft shadows: `0 18px 50px rgba(7,16,15,0.10)`.

### Texture

Allowed:

- Fine noise at 2% to 5% opacity.
- Rule grids and measurement ticks.
- Thin scanlines inside live product mockups.
- Corner brackets on high-value cards.

Avoid:

- Heavy background patterns.
- Decorative blobs that do not map to product behavior.
- Too many overlapping translucent panels.

## Components

### Navigation

Navigation should feel like a control bar.

Desktop:

- Height: 64px to 72px.
- Background: transparent at top, then `rgba(3,5,6,0.82)` with blur and hairline border after scroll.
- Logo left, primary nav center or left-center, auth/CTA/language right.
- Active link uses a small cyan indicator, not a full glowing pill.
- Use mono numeric prefixes only if they serve hierarchy.

Mobile:

- Keep logo, language, and menu button visible.
- Menu should be full-width dark surface with clear touch targets.
- Avoid overly animated nav drawers.

### Buttons

Primary button:

- Background: `#00E5CC`
- Text: `#03100F`
- Radius: 8px
- Height: 44px to 48px
- Padding: 14px 18px
- Hover: `#35F5E0`
- Pressed: `#008F82`
- Include arrow/icon only when it clarifies forward motion.

Secondary button:

- Background: `surface-1`
- Border: `rgba(255,255,255,0.10)`
- Text: `text-primary`
- Hover border: `rgba(0,229,204,0.32)`

Ghost button:

- Transparent.
- Text: `text-secondary`.
- Hover text: `#00E5CC`.
- Use for secondary navigation, not primary conversion.

Danger button:

- Use red only for destructive admin actions.
- Do not reuse cyan for destructive confirmation.

### Badges And Status

Status badges should be compact and factual.

Common statuses:

- `LIVE`
- `SYNC OK`
- `LATENCY 0.8MS`
- `LICENSE ACTIVE`
- `DEVICE ONLINE`
- `PAYMENT VERIFIED`
- `ADMIN`

Rules:

- Use a 6px status dot for live/online state.
- Use mono captions.
- Cyan means live/active/selected.
- Green means success/completed.
- Amber means pending/warning.
- Red means failed/destructive/error.

### Cards

Cards should be composed as product panels, not generic feature boxes.

Default dark card:

- Background: `surface-1`
- Border: `rgba(255,255,255,0.08)`
- Radius: 12px
- Padding: 24px
- No heavy glow.

Highlighted dark card:

- Background: `linear-gradient(135deg, rgba(0,229,204,0.10), #171D22 42%, #101418)`
- Border: `rgba(0,229,204,0.28)`
- Add small corner bracket or top rule.

Light card:

- Background: `#FFFFFF`
- Border: `#D8E2E0`
- Text: `#07100F`
- Use for pricing, billing, trust, and documentation sections.

Avoid equal-weight card walls. At least one card or panel should define the hierarchy.

### Hero

The homepage hero should be a product-control composition, not a generic SaaS headline.

Required ingredients:

- One oversized visual idea: `1 -> N`, live console, or multi-device topology.
- A product mockup showing multiple device streams or a command/control interface.
- One primary CTA and one secondary CTA.
- Live telemetry strip: latency, nodes, sync state, license state, or session count.
- Cyan used as a live signal.

Recommended composition:

- Left: large display headline with concise product promise.
- Right: layered product console with 3 device streams, selected-device focus, and command log.
- Bottom: telemetry rail or customer/trust proof.

Do not use:

- Centered headline over vague gradient only.
- Stock illustrations.
- Generic abstract devices without operational details.

### Product Console Mockups

Product mockups are the main visual asset.

Use:

- Window chrome with title, environment, status.
- Left rail for devices or sessions.
- Main area for live stream panes.
- Right rail for commands, audit log, selected device details, or license state.
- Latency, fps, node count, and active operator metrics.

Visual rules:

- Screens should have real UI fragments, not placeholder rectangles.
- Active stream gets cyan border and a clear selected label.
- Inactive streams stay readable but subdued.
- Command logs use mono and short lines.
- Avoid fake complexity that hurts comprehension.

### Device Stream Cards

Each stream card should show:

- Device name or ID.
- Online/offline state.
- Location or group.
- Latency/FPS.
- A visual screen preview.
- Selected or controllable state.

Selected state:

- Cyan top border or left rail.
- Subtle cyan background tint.
- Clear label: `CONTROL TARGET`.

### Pricing

Pricing should borrow Stripe clarity and Linear restraint.

Structure:

- Light or near-white pricing body can be used for trust and readability.
- 3 tiers maximum in the main section.
- One recommended tier.
- Price numerals should be large, tabular, and calm.
- Feature comparison should be specific to device control, licenses, operators, and support.

Recommended tier names:

- Starter
- Team
- Enterprise

Pricing card states:

- Default: white card, subtle border.
- Recommended: dark card or cyan-tinted top rail.
- Enterprise: technical sales panel with security/support emphasis.

Do not:

- Overload with flashy gradients.
- Use cyan as a full-card fill except for small recommended markers.
- Hide operational limits.

### Forms

Forms should feel secure and enterprise-ready.

Inputs:

- Height: 44px to 48px.
- Radius: 8px.
- Border: clear in default, cyan on focus.
- Error text below field, not only color.
- Labels above fields.

Contact and auth screens:

- Use split composition: form panel plus product/trust panel.
- Include security copy near sensitive actions.
- Keep Turnstile/captcha spacing stable.

### Tables

Admin, orders, devices, users, and license tables should prioritize scanning.

Rules:

- Sticky header where useful.
- 13px to 14px body text.
- Mono for IDs, order numbers, and timestamps.
- Status badges in fixed-width columns.
- Row hover should be subtle.
- Selected or actionable row can use `signal-veil`.
- Empty states should explain the next action.

### Charts

Charts must be calm and legible.

Palette:

- Primary line: `#00E5CC`
- Secondary line: `#7CA8FF`
- Success: `#20D990`
- Warning: `#F5A524`
- Muted grid: `rgba(255,255,255,0.08)` on dark or `#D8E2E0` on light.

Rules:

- Use cyan for the most important series only.
- Avoid rainbow dashboards.
- Label axes clearly.
- Tooltips should look like product panels.

### Footer

Footer should feel like the bottom of an infrastructure console.

Use:

- Dark canvas.
- Thin top rule.
- Company identity, product links, legal links.
- Optional tiny telemetry line: build, region, status.

Avoid:

- Large decorative CTA unless the page lacks a closing CTA.
- Overly bright footer backgrounds.

## Page Guidance

### Homepage

Goal:

Make visitors understand EaseCity in one glance: one desktop controls many live Android devices.

Must include:

- Product-control hero.
- Multi-device sync showcase.
- Technical edge section.
- Use cases for QA, support, and operations.
- Trust/commercial CTA.

Visual emphasis:

- Product console and `1 -> N` topology.
- Cyan live signal.
- Dark control-room atmosphere.

### Services Page

Goal:

Explain the platform and roadmap.

Use:

- Dense technical cards.
- Architecture diagram.
- Dark-to-light sections for clarity.
- Specific capabilities over vague marketing copy.

### Pricing Page

Goal:

Make plans easy to compare and make payment feel safe.

Use:

- Light pricing section for readability.
- Dark header for premium product context.
- Clear plan cards and limits.
- Stripe-like trust cues without copying Stripe visuals.

### About Page

Goal:

Position EaseCity as Hong Kong-built infrastructure.

Use:

- Editorial layout.
- Strong typography.
- City/infrastructure references through grid, density, and system maps rather than stock skyline decoration.

### Contact Page

Goal:

Convert technical buyers.

Use:

- Form plus technical qualification panel.
- Clear response expectation.
- Security and privacy reassurance.

### Auth Pages

Goal:

Make login/register feel secure and product-connected.

Use:

- Compact dark form card.
- Side product panel or device-stream detail.
- Clear error states.
- Minimal distraction.

### Dashboard/User Pages

Goal:

Give customers their license, devices, orders, downloads, and account state quickly.

Use:

- App-shell layout.
- Status-first cards.
- Tables and compact panels.
- Clear download/license actions.

### Admin Pages

Goal:

Operate users, orders, revenue, and support state with low friction.

Use:

- Dense dashboard layout.
- Tables, filters, revenue chart, audit activity.
- Restrained cyan for selected filters and key metrics.

## Motion

Motion should suggest live infrastructure.

Allowed:

- Stream pulse on active device.
- Scanline inside live preview.
- Command log line reveal.
- Top nav progress rail.
- CTA arrow movement.
- Chart draw-in on first load.
- Subtle panel entrance with 120ms to 320ms duration.

Rules:

- Use one staged hero load sequence.
- Respect `prefers-reduced-motion`.
- Keep dashboard interactions fast.
- Avoid infinite decorative movement except live indicators.

Motion timing:

- Micro hover: 120ms to 180ms.
- Panel enter: 220ms to 320ms.
- Hero sequence: 600ms to 1000ms total.
- Live pulse: 1600ms to 2400ms, low opacity.

## Accessibility

Minimum requirements:

- Text contrast meets WCAG AA.
- Cyan text on dark must be large or paired with strong contrast.
- Focus states must be visible and not color-only.
- Buttons and links need accessible labels when icon-only.
- Do not encode state with color alone.
- All interactive controls need keyboard access.
- Form errors must be tied to fields.
- Tables need clear headers.
- Motion respects reduced-motion preference.

Special note:

`#00E5CC` on white has weak contrast for body text. On light surfaces, use cyan for borders, icons, focus, or large bold labels only. Use dark ink for normal text.

## Implementation Notes

For Tailwind implementation:

- Keep color tokens semantic: `bg-bg-base`, `bg-bg-surface`, `text-text-primary`, `border-border`, `accent-cyan`, `signal`.
- If redesigning tokens, update `tailwind.config.ts` first and then migrate components.
- Keep shared component utilities in `src/app/globals.css` only when they are truly reusable.
- Prefer component-level composition over many one-off utility blobs.
- New user-facing strings must be added to both `en` and `zh` translations.
- Preserve responsive and keyboard behavior during visual redesign.

For pages:

- Public pages live under `src/app/(public)`.
- Auth pages live under `src/app/(auth)`.
- Admin pages live under `src/app/admin`.
- Reusable visual sections should live under `src/components`.

## Do

- Use `#00E5CC` as the brand's live signal.
- Build around real product concepts: streams, devices, sessions, licenses, operators, orders.
- Prefer dark product panels with crisp hierarchy.
- Use light sections only when they improve trust or readability.
- Make pricing clear and commercial.
- Make dashboards dense but scannable.
- Use typography and spacing to create a premium feel.
- Keep visual language consistent across public, auth, account, and admin surfaces.

## Do Not

- Do not copy a reference brand 1:1.
- Do not introduce a second dominant accent color.
- Do not use purple gradients as the default SaaS solution.
- Do not use generic card grids without hierarchy.
- Do not make every card glow cyan.
- Do not use stock illustrations as the primary product visual.
- Do not hide real product details behind abstract shapes.
- Do not create motion that does not communicate state.
- Do not reduce accessibility for visual drama.

## Agent Prompt Guide

When asking an agent to redesign an EaseCity page, use this prompt pattern:

```text
Redesign [page/component] using the EaseCity DESIGN.md system.
Ignore the old visual style except for product content and behavior.
Keep #00E5CC as the only dominant brand accent.
Use an industrial control-plane direction: dark precision surfaces, product UI mockups, live status, crisp borders, and restrained motion.
Preserve i18n, accessibility, responsive behavior, and existing business logic.
```

For homepage work:

```text
Create a product-led homepage hero for EaseCity.
The first impression should be: one desktop control plane operating many live Android devices.
Use a dark control-room canvas, a large 1 -> N visual, a multi-device product console, live telemetry, and #00E5CC as the active signal.
Avoid generic SaaS hero layouts.
```

For pricing work:

```text
Redesign pricing with Stripe-level clarity and Linear-level restraint.
Use a dark premium header and a light comparison/pricing body.
Keep #00E5CC for recommended state, CTA, and focus only.
Make plan limits, licenses, operators, support, and billing details easy to compare.
```

For dashboard/admin work:

```text
Redesign this surface as a dense but calm operations console.
Prioritize status, filters, tables, charts, and actionable rows.
Use cyan only for active state and primary metrics.
Keep IDs, timestamps, and technical values in mono.
```

## Quality Gate

Before shipping any redesigned UI, check:

- The page has a clear point of view: industrial control plane.
- `#00E5CC` is used deliberately, not everywhere.
- The product is visible through real UI details.
- Hierarchy is clear on desktop and mobile.
- The design does not look like interchangeable AI SaaS UI.
- Forms, tables, and actions remain accessible.
- Motion reinforces live control or state changes.
- The result feels like EaseCity, not like a copied reference site.
---
version: 1.0
name: EaseCity Signal Infrastructure
description: A dark-first, engineering-grade SaaS design system for EaseCity. The system uses #00E5CC as the single primary brand signal and combines a Linear-like dark surface ladder, Stripe-like commercial trust moments, Supabase-like product UI evidence, NVIDIA-like angular technical density, and Vercel-like restrained developer-platform typography.
---

# EaseCity DESIGN.md

## 1. Visual Theme And Atmosphere

EaseCity should feel like a real-time infrastructure command center for software, licenses, payments, devices, and distributed users. The interface is technical, precise, and premium, but not decorative for its own sake.

The primary visual idea is **one live signal across a controlled city grid**.

- The single chromatic brand color is `#00E5CC`.
- The default page surface is near-black, not blue-black and not purple-black.
- Cyan is a scarce signal: CTAs, active states, live indicators, focus rings, data paths, and decisive status moments.
- Product UI panels, dashboards, terminal snippets, device cards, and pricing tables should carry the page, not abstract illustration.
- Use hard geometry, hairline borders, restrained glow, and dense but readable layouts.
- Avoid generic AI gradients, random purple-blue glow, and oversized glassmorphism.

Primary reference blend:

- Linear: dark product-led surfaces, precise cards, quiet premium tone.
- Stripe: conversion trust, pricing clarity, occasional gradient mesh for commercial sections.
- Supabase: developer infrastructure credibility, product mockups, clean technical panels.
- NVIDIA: angular technical grids, high-contrast black/white/cyan energy.
- Vercel: minimal developer-platform hierarchy, strong typography, sparse decoration.

## 2. Color Palette And Roles

### Brand

| Token | Hex | Role |
| --- | --- | --- |
| `signal` | `#00E5CC` | Primary brand color, CTA, live state, active nav, focus ring, selected tab |
| `signal-light` | `#35F5E0` | Hover state, small highlights, bright data points |
| `signal-deep` | `#009E91` | Pressed state, darker chart segment, secondary data line |
| `signal-dim` | `#003F3A` | Subtle fills behind active states |
| `signal-glow` | `rgba(0, 229, 204, 0.18)` | Controlled aura around live/product elements |

### Dark Surfaces

| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#050708` | Default page background |
| `surface-1` | `#0A0D0F` | Raised page panels and hero product frames |
| `surface-2` | `#11161A` | Cards, pricing tiers, form panels |
| `surface-3` | `#172027` | Hovered cards, selected pricing tier, nested product surfaces |
| `surface-4` | `#1F2A32` | Highest dark elevation, dropdowns, admin row hover |

### Light Commercial Surfaces

Use light surfaces sparingly for conversion-heavy sections such as pricing comparison, billing trust, invoices, and legal clarity. A light section should feel intentional, like an operational report pulled from the system.

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#F7FAFA` | Light chapter background |
| `paper-soft` | `#EEF5F4` | Light cards and comparison rows |
| `paper-line` | `#D7E4E2` | Light borders |
| `paper-ink` | `#071112` | Text on light surfaces |
| `paper-muted` | `#566668` | Secondary text on light surfaces |

### Text

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#F4FBFA` | Primary text on dark |
| `ink-muted` | `#B7C8C7` | Secondary body text |
| `ink-subtle` | `#7F9492` | Meta text, captions, disabled copy |
| `ink-faint` | `#50615F` | Decorative numbering, inactive technical labels |
| `on-signal` | `#001211` | Text on cyan buttons |

### Borders And Rules

| Token | Hex | Role |
| --- | --- | --- |
| `line` | `#243034` | Default dark hairline |
| `line-soft` | `#172024` | Subtle section separators |
| `line-strong` | `#3A4A4F` | Inputs, table boundaries, prominent panels |
| `line-signal` | `rgba(0, 229, 204, 0.32)` | Active border and selected card outline |

### Semantic States

Do not let semantic colors compete with the brand color. Keep them muted and operational.

| Token | Hex | Role |
| --- | --- | --- |
| `success` | `#2DD4BF` | Success status when brand signal is not already used |
| `warning` | `#F59E0B` | Warning status, billing attention |
| `danger` | `#F43F5E` | Errors, destructive actions |
| `info` | `#60A5FA` | Informational notices |

## 3. Typography Rules

Use open, web-safe substitutes. Do not depend on proprietary fonts from reference brands.

### Font Families

| Token | Family | Use |
| --- | --- | --- |
| `display` | `Geist, Inter, Instrument Sans, system-ui, sans-serif` | Hero, page titles, pricing headline, section titles |
| `body` | `Inter, Instrument Sans, system-ui, sans-serif` | Navigation, cards, forms, body copy |
| `mono` | `JetBrains Mono, Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace` | Status labels, command surfaces, IDs, logs, API snippets |

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Use |
| --- | --- | --- | --- | --- | --- |
| `display-hero` | `clamp(4.5rem, 13vw, 11rem)` | 650 | 0.88 | `-0.06em` | Home hero, campaign headline |
| `display-xl` | `clamp(3.5rem, 8vw, 6.5rem)` | 650 | 0.94 | `-0.05em` | Page hero |
| `display-lg` | `clamp(2.5rem, 5vw, 4.5rem)` | 620 | 1.0 | `-0.04em` | Section opener |
| `heading-xl` | `2rem` | 620 | 1.15 | `-0.03em` | Pricing tier title, dashboard title |
| `heading-lg` | `1.5rem` | 600 | 1.2 | `-0.02em` | Cards, feature blocks |
| `heading-md` | `1.125rem` | 600 | 1.3 | `-0.01em` | Form sections, table headings |
| `body-lg` | `1.125rem` | 400 | 1.65 | `0` | Hero subhead, lead copy |
| `body` | `1rem` | 400 | 1.55 | `0` | Default text |
| `body-sm` | `0.875rem` | 400 | 1.5 | `0` | Card descriptions, nav |
| `caption` | `0.75rem` | 500 | 1.35 | `0.02em` | Supporting labels |
| `mono-label` | `0.6875rem` | 500 | 1.2 | `0.16em` | Eyebrows, status codes |
| `mono-code` | `0.8125rem` | 400 | 1.6 | `0` | Terminal and API code |

### Typography Principles

- Display type should be tight, confident, and technical. Use negative tracking at large sizes.
- Body copy should be calm and legible. Do not overuse monospace for paragraphs.
- Monospace is for operational proof: timestamps, IDs, commands, device fingerprints, status labels, license keys, and API snippets.
- Uppercase micro-labels should be rare and purposeful.
- Use tabular numbers for pricing, revenue, device counts, uptime, latency, and analytics.

## 4. Layout Principles

### Grid

- Use a max content width of `1200px` to `1280px`.
- Default desktop grid: 12 columns.
- Product sections can use asymmetry: 7/5, 5/7, 8/4.
- Admin and dashboard surfaces can use denser grids, but keep row height and alignment consistent.
- Mobile collapses to one column below `768px`.

### Spacing Scale

Base unit: `4px`.

| Token | Value | Use |
| --- | --- | --- |
| `space-1` | `4px` | Tiny icon gaps |
| `space-2` | `8px` | Compact labels, badges |
| `space-3` | `12px` | Inline controls |
| `space-4` | `16px` | Form fields, card internals |
| `space-6` | `24px` | Default card padding |
| `space-8` | `32px` | Large card padding, hero CTA gap |
| `space-12` | `48px` | Section internal grouping |
| `space-16` | `64px` | Compact section padding |
| `space-24` | `96px` | Standard section padding |
| `space-32` | `128px` | Hero and major chapter padding |

### Whitespace Philosophy

On dark pages, whitespace is carried by surface contrast, not by empty white areas. Use panels, rules, and measured vertical rhythm to create breathing room.

On light commercial sections, use larger margins and fewer borders. Light mode should feel like a pricing or compliance document, not a separate product.

## 5. Shapes, Borders, And Depth

### Radius

EaseCity should feel precise, not pillowy.

| Token | Value | Use |
| --- | --- | --- |
| `radius-xs` | `2px` | Data cells, corner markers, chart segments |
| `radius-sm` | `4px` | Badges, command chips |
| `radius-md` | `8px` | Buttons, inputs, tabs |
| `radius-lg` | `12px` | Cards, pricing tiers |
| `radius-xl` | `16px` | Hero product frames, modal shells |
| `radius-full` | `999px` | Status dots, avatars only |

### Borders

- Every dark card gets a 1px border.
- Use border hierarchy instead of heavy shadows.
- Active cards use `line-signal`, not a full cyan background.
- Avoid thick neon outlines.

### Shadows And Glow

Shadows should be almost invisible on dark surfaces.

| Token | Value | Use |
| --- | --- | --- |
| `shadow-panel` | `0 24px 80px rgba(0,0,0,0.35)` | Hero product frame, modal |
| `shadow-card` | `0 12px 40px rgba(0,0,0,0.24)` | Hovered cards only |
| `glow-signal` | `0 0 24px rgba(0,229,204,0.18)` | Live indicators, primary CTA hover |
| `glow-line` | `0 0 0 1px rgba(0,229,204,0.28)` | Selected state |

Glow is a status effect, not decoration.

## 6. Component Styling

### Buttons

#### Primary Button

Use for the main conversion action only.

- Background: `signal`
- Text: `on-signal`
- Border: none
- Radius: `radius-md`
- Padding: `12px 18px`
- Font: `body`, `600`
- Hover: `signal-light`
- Pressed: `signal-deep`
- Optional: tiny mono prefix such as `START`, `SYNC`, `BUY`

#### Secondary Button

Use for secondary navigation or product exploration.

- Background: `surface-2`
- Text: `ink`
- Border: `1px solid line`
- Radius: `radius-md`
- Hover: `surface-3`, border `line-strong`

#### Ghost Button

Use in nav and low-priority actions.

- Background: transparent
- Text: `ink-muted`
- Hover text: `signal`
- Optional underline or left rule, never a glow.

### Cards

#### Feature Card

- Background: `surface-1` or `surface-2`
- Border: `1px solid line`
- Radius: `radius-lg`
- Padding: `24px`
- Top-right or top-left 6px cyan corner marker for featured cards only.
- Content order: mono label, title, description, product/data detail.

#### Product UI Frame

Use for screenshots, generated mockups, dashboard previews, terminal windows, admin tables, device sync diagrams.

- Background: `surface-1`
- Border: `1px solid line-strong`
- Radius: `radius-xl`
- Padding: `8px` to `16px`
- Header strip with three compact controls or live status metadata.
- Internal UI should use small type, aligned rows, tabular numbers, and restrained cyan indicators.

#### Pricing Card

- Background: `surface-2`
- Border: `1px solid line`
- Featured tier: `surface-3` with `line-signal`
- Radius: `radius-lg`
- Price numerals use tabular numbers.
- CTA should be primary only on the recommended tier.
- Comparison rows should be readable and not over-decorated.

### Navigation

- Fixed top nav on marketing pages.
- Background starts transparent or `canvas/80`, becomes `surface-1/90` with blur after scroll.
- Active nav item uses cyan label or thin cyan underline.
- Keep nav height between `64px` and `80px`.
- Mobile menu should be a full dark panel with clear tap targets.

### Forms

- Inputs use `surface-1`, `line`, `ink`, and `radius-md`.
- Focus ring is `2px` cyan at 50% opacity.
- Error text uses `danger`, not cyan.
- Labels are body text, not all-caps unless the field is technical.
- Contact and billing forms may use a light commercial panel if the surrounding page is dark.

### Tables And Admin Lists

- Use dense but readable rows.
- Row height: `48px` to `56px`.
- Header text: `mono-label` or `caption`.
- Use tabular numbers.
- Hover row: `surface-2`.
- Selected row: left cyan rule, not full cyan fill.
- Status badges should be compact and semantic.

### Badges And Status

#### Live Badge

- Dot: `signal`, 6px, subtle pulse.
- Text: uppercase mono, `signal` or `ink-muted`.
- Background: `signal-dim` at low opacity.
- Border: `line-signal`.

#### Plan / Billing Badge

- Neutral background unless it is the current plan.
- Current plan can use cyan border and cyan text.

### Terminal And Code Surfaces

- Background: `#030506`
- Border: `1px solid line`
- Text: `ink-muted`
- Prompt symbol or successful response: `signal`
- Error output: `danger`
- Use monospace at `13px`.
- Keep code lines short and purposeful. These are proof surfaces, not decoration.

### Charts

- Primary series: `signal`
- Secondary series: muted gray-blue such as `#4B6268`
- Revenue or conversion highlight: `signal-light`
- Warning series: `warning`
- Grid lines: `line-soft`
- Avoid rainbow charts. Use color only for meaning.

## 7. Page Patterns

### Home Page

Goal: communicate "one hub controlling many endpoints".

Recommended structure:

1. Hero with massive tight display headline, concise subhead, primary CTA, secondary CTA.
2. Product UI frame showing device/license/order sync, not abstract illustration.
3. Trust strip with uptime, latency, active nodes, license status.
4. Feature grid: sync, licensing, billing, admin control, account security.
5. Workflow section with three or four connected steps.
6. Pricing preview or CTA band.

Hero background may use a subtle cyan radial glow, but only behind the product frame or signal path.

### Pricing Page

Goal: Stripe-like clarity with Linear-like dark precision.

- Use a dark hero with one primary message.
- Pricing cards may sit on dark or light commercial surface.
- Recommended plan uses cyan border and primary CTA.
- Include billing trust points: secure checkout, license activation, team/device management.
- Avoid flashy discount stickers.

### Services Page

Goal: infrastructure capability catalog.

- Use angular technical grid.
- Each service card should include: label, title, short explanation, concrete output.
- Include product screenshots, diagrams, or table snippets where possible.
- Cyan should indicate selected service or active pathway.

### Dashboard Page

Goal: show operational proof.

- Use product-first dark admin UI.
- Put important numbers at the top in compact KPI tiles.
- Tables should be precise, aligned, and restrained.
- Use cyan for active/healthy/live states; warnings and errors get their own semantic colors.

### Admin Pages

Goal: dense operator tooling.

- Prioritize scan speed over marketing polish.
- Use sticky table headers, compact filters, clear status badges.
- Destructive actions must be visually separated from primary cyan actions.
- Use left rules and active tabs instead of large filled backgrounds.

### Auth Pages

Goal: secure, calm, quick.

- Single centered form panel.
- Dark surface with subtle cyan focus states.
- Use plain security copy and clear error states.
- Avoid decorative animation around login/register forms.

### Contact Page

Goal: sales/support handoff.

- Split layout: left side value/trust, right side form.
- Use light commercial panel for the form if contrast helps conversion.
- Include response time and what happens next.

## 8. Motion And Interaction

Motion should feel like signal acquisition, not entertainment.

- Default transition: `180ms ease-out`.
- Larger entrance transitions: `420ms` to `700ms`.
- Use subtle upward fades for section entry.
- Use line draw or pulse for sync paths.
- Use hover lift no more than `translateY(-2px)`.
- Live dots can pulse; cards should not constantly animate.
- Respect reduced motion.

Approved motion:

- Signal pulse on live indicator.
- Progress line moving across a topology path.
- Product panel reveal.
- Tab underline transition.
- Pricing tier hover lift.

Avoid:

- Infinite floating cards.
- Excessive parallax.
- Big spinning gradients.
- Random shimmer on static content.

## 9. Iconography And Visual Assets

- Icons should be line-based, 1.5px to 2px stroke.
- Use simple geometric metaphors: node, key, lock, card, server, route, pulse, receipt, user, shield.
- Icons are supporting elements. The product UI and data should be the main visuals.
- Avoid cartoon mascots, generic 3D blobs, stock photos, and brand-like clones from references.

## 10. Responsive Behavior

### Breakpoints

| Name | Width | Behavior |
| --- | --- | --- |
| `mobile` | `< 640px` | One column, reduced display type, nav drawer |
| `tablet` | `640px - 1023px` | Two-column cards where useful, simplified product frames |
| `desktop` | `1024px - 1439px` | Full 12-column layout |
| `wide` | `>= 1440px` | Keep content max-width; increase breathing room, not card count |

### Touch Targets

- Buttons: minimum `44px` height on touch devices.
- Nav drawer links: minimum `48px` height.
- Form fields: minimum `44px` height.
- Table row actions should not rely on hover only.

### Mobile Rules

- Hide non-essential telemetry.
- Convert dense comparison tables into per-plan accordions or stacked rows.
- Product UI frames may crop horizontally only if the crop is intentional and readable.
- Keep CTA pair visible without wrapping into awkward shapes.

## 11. Accessibility

- Maintain WCAG AA contrast for text and controls.
- Do not use cyan alone to communicate state; pair with text or icon.
- Focus state must be visible on dark and light surfaces.
- Animated live indicators need an accessible text label.
- Form errors must be linked to fields.
- Do not place long paragraphs over gradients.
- Respect `prefers-reduced-motion`.

## 12. Do And Don't

### Do

- Use `#00E5CC` as a scarce, high-confidence signal.
- Build pages around product UI frames, tables, dashboards, and real workflows.
- Keep dark surfaces layered: canvas -> surface-1 -> surface-2 -> surface-3.
- Use hairline borders and small cyan markers for precision.
- Use tabular numbers for anything operational.
- Let light sections appear only when they improve trust, pricing clarity, or readability.

### Don't

- Do not use purple-blue AI gradients as the default look.
- Do not fill entire cards with cyan.
- Do not use many bright accent colors.
- Do not make every card glassy or glowing.
- Do not copy the exact brand identity, logos, proprietary fonts, or unmistakable layouts from the reference sites.
- Do not make marketing pages feel disconnected from the actual dashboard/product.

## 13. Implementation Notes For Agents

When implementing this design in the EaseCity repo:

- Treat this file as the visual source of truth.
- Keep `#00E5CC` as the primary brand color.
- Use local Tailwind tokens where possible, but update or extend them if they conflict with this design.
- Prefer reusable components for buttons, badges, cards, product frames, KPI tiles, and status rows.
- Keep i18n strings in both English and Chinese when adding UI copy.
- Do not introduce proprietary font files from reference brands.
- Use generated product mockups made from real EaseCity concepts: licenses, devices, orders, users, subscriptions, heartbeat, manifests.
- Before broad page rewrites, align the core primitives first: colors, type scale, buttons, cards, nav, forms.

## 14. Agent Prompt Guide

Use this prompt when asking an AI coding agent to build or redesign UI:

> Redesign this EaseCity page using `DESIGN.md`. Keep `#00E5CC` as the only primary brand color. Use a dark-first engineering SaaS style: Linear-like surface precision, Stripe-like conversion clarity, Supabase-like product UI evidence, NVIDIA-like angular technical grids, and Vercel-like restrained developer typography. Do not copy any brand identity directly. Build the page around real EaseCity product concepts, dashboard panels, status badges, and clear CTAs.

Quick color reference:

- Primary: `#00E5CC`
- Dark canvas: `#050708`
- Card surface: `#11161A`
- Elevated surface: `#172027`
- Primary text: `#F4FBFA`
- Secondary text: `#B7C8C7`
- Border: `#243034`
- Light commercial surface: `#F7FAFA`
