# Bitlance UI Design System

A standard reference for designers and developers building any Bitlance surface (marketing site, app, admin panel). Covers color, type, spacing, components, and states so new screens stay consistent with what's already shipped.

---

## 1. Brand Foundations

**Product:** Bitlance, a Bitcoin-native freelance marketplace.  
**Design personality:** Warm, direct, confident. Not corporate-cold, not crypto-flashy. Feels like a real product built by people who use Bitcoin daily, not a hype-driven crypto app.

---

## 2. Color System

### Primary palette

| Token | Hex | Usage |
|---|---|---|
| `color-primary` | `#F2861D` | Primary CTAs ("Sign Up," "Apply Now," "Post a Job"), active nav underline, links, key stat highlights |
| `color-primary-hover` | `#D9740F` | Hover/pressed state for primary buttons |
| `color-background` | `#FAF6EF` | Page background (warm off-white/cream, not pure white) |
| `color-surface` | `#FFFFFF` | Card backgrounds, panels, modals |
| `color-text-primary` | `#1A1A1A` | Headlines, primary body text |
| `color-text-secondary` | `#6B6B6B` | Supporting text, metadata (timestamps, labels) |
| `color-border` | `#EAE4D8` | Card borders, dividers |

### Admin/dashboard palette

| Token | Hex | Usage |
|---|---|---|
| `color-admin-bg` | `#2A1E14` | Admin sidebar background, dark cards (dark brown-black) |
| `color-admin-accent` | `#F2861D` | Active nav item highlight, icons |

### Status colors

| Token | Hex | Usage |
|---|---|---|
| `color-success` | `#16A34A` | "Open" status tags, success states, completed indicators |
| `color-neutral-tag` | `#9CA3AF` | "Closed" status tags |
| `color-warning` | `#F59E0B` | Pending/attention states |

**Rule:** Orange is reserved for primary actions and brand moments. It should never appear as a background color for large surfaces, it's an accent, not a fill.

---

## 3. Typography

| Role | Weight | Approx. Size | Usage |
|---|---|---|---|
| Display / Hero headline | Bold (700) | 48–64px | Homepage hero only ("Work Online. Get Paid in Bitcoin.") |
| Page heading (H1) | Bold (700) | 32–40px | Page-level titles ("Available Jobs," "Job Posting Form") |
| Section heading (H2) | Semibold (600) | 24–28px | Section breaks within a page |
| Body | Regular (400) | 16px | Paragraph text, descriptions |
| Small / metadata | Regular (400) | 13–14px | Timestamps, tags, secondary labels |
| Button text | Semibold (600) | 15–16px | All CTA and button labels |

**Font family:** Clean sans-serif (Inter / system grotesque). No serif or decorative display face.

---

## 4. Spacing & Layout

- `space-xs`: 4px
- `space-sm`: 8px
- `space-md`: 16px
- `space-lg`: 24px
- `space-xl`: 40px
- `space-2xl`: 64px+

**Border radius:** Uniform moderate radius (~8–12px, `rounded-lg` / `rounded-xl`). Avoid mixing pill buttons with sharp or heavy rounded corners.

---

## 5. Components

### Buttons
- **Primary:** Solid orange fill (`#F2861D`, hover `#D9740F`), white text, moderate radius (8–10px).
- **Secondary:** Outline or light-fill, dark text (`#1A1A1A`), border `#EAE4D8`.

### Cards
- Background `#FFFFFF`
- Border `#EAE4D8`
- Radius 10–12px (`rounded-xl`)
- Padding 16–24px
- Warm page background: `#FAF6EF`
