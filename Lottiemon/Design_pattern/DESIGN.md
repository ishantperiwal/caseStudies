---
version: current
name: Zapp Account Case Study
description: Tokenized editorial case-study design system. Change one hue slider on the html element to re-theme the entire page. All blue-tinted colors, the background, separators, and brand palette derive from --accent-h.

# ── Theme slider (set on <html style="...">)
theme-slider:
  accent-h:
    value: 206
    description: Hue (0-360). Drives all blue-tinted colors, background tint, brand palette, separators, and highlight overlays. Change this one number to re-theme.
  accent-s:
    value: 54
    description: Saturation (%) for brand accent colors (Tailwind brand.* scale).
  accent-l:
    value: 29
    description: Lightness (%) for brand accent colors (Tailwind brand.* scale).

# ── Derived tokens (computed from --accent-h/s/l)
derived:
  color-bg:
    value: hsl(var(--accent-h), 30%, 97%)
    role: Page background, dot-matrix fog overlay, phone screen color, highlight spotlight outermost stop.
  canvas:
    value: var(--color-bg)
    role: Tailwind canvas token. Same as background.
  warm-50:
    value: var(--color-bg)
    role: Tailwind warm.50 token. Same as background.
  section-separator:
    value: hsl(var(--accent-h), 28%, 52%, 0.15)
    role: Section divider lines. Transitions with accent hue.
  text-blue-deep:
    value: hsl(var(--accent-h), 20%, 15%)
    role: Blue-tinted deep text (replaces #1b2433). Section subtext, titles, toolbar backgrounds.
  text-blue-body:
    value: hsl(var(--accent-h), 14%, 27%)
    role: Blue-tinted body text (replaces #3a4452). Strategy subtext, option descriptions, node card paragraphs.
  text-blue-label:
    value: hsl(var(--accent-h), 16%, 46%)
    role: Blue-tinted labels/badges (replaces #60728c). Results MoM badge, secondary metadata.
  avatar-default:
    value: hsl(var(--accent-h), 12%, 55%)
    role: Default avatar icon color (replaces #7b8c9d).
  secure-icon-bg:
    value: hsl(var(--accent-h), 40%, 95%)
    role: Light pastel background for "Secure" value prop icon (replaces #e9f1ff).
  active-avatar-bg:
    value: hsl(var(--accent-h), 25%, 93%)
    role: Active avatar background (replaces #e4f1f4).
  nav-key-color:
    value: hsl(var(--accent-h), 35%, 42%)
    role: Journey navigation key icon color.
  nav-hint-sub:
    value: hsl(var(--accent-h), 20%, 52%)
    role: Journey navigation hint subtitle text.
  spotlight-alpha:
    value: color-mix(in srgb, var(--color-bg) 45%, transparent)
    role: Middle stop in highlight radial spotlight.
  spotlight-beta:
    value: color-mix(in srgb, var(--color-bg) 88%, transparent)
    role: Near-outer stop in highlight radial spotlight.

# ── Warm ink text scale (fixed — does not shift with accent hue)
warm-scale:
  ink: "#2C2621"
  deep: "#5C5146"
  muted: "#7A6F64"
  medium: "#A89B8F"
  outline: "#433A31"  
  color-deep: "#4A4038"
  warm-100: "#F4EFEA"
  warm-200: "#EBE5DC"
  warm-300: "#D5C9BA"
  warm-400: "#A89B8F"
  warm-500: "#7A6F64"
  warm-600: "#5C5146"
  warm-700: "#433A31"
  warm-800: "#2C2621"
  warm-900: "#1C1815"
  warm-950: "#13110F"

# ── Semantic colors (fixed meaning — do not shift with accent hue)
semantic:
  teal-primary: "#1a5f67"
  teal-deep: "#064e3b"
  teal-subtext: "#2a5560"
  teal-dark: "#1b4332"
  teal-heavy: "#0f3323"
  teal-icon: "#2f7a45"
  teal-surface-light: "#edf8f1"
  teal-surface-cool: "#f2f8f9"
  teal-surface-soft: "#d7eee7"
  teal-surface-active: "#e4f1f4"
  teal-border-worked: "#9bcfad"
  teal-bg-light: "#c2e8d0"
  danger-text: "#991b1b"
  danger-surface: "#fee2e2"
  highlight-amber-bg: "#fff4cf"
  highlight-amber-text: "#8a5a00"

# ── Device colors (fixed)
device:
  bezel-start: "#303033"
  bezel-mid: "#1d1d1f"
  bezel-end: "#161617"
  screen-dark: "#1a1a1a"
  notch: "#050505"

# ── Border gray (fixed, neutral)
border:
  base: rgb(71, 71, 71)
  opacities: [0.08, 0.10, 0.12, 0.14, 0.16, 0.18, 0.22, 0.24, 0.28, 0.32, 0.34, 0.45, 0.55, 0.60, 0.62, 0.72]

typography:
  display:
    fontFamily: "'Fraunces', serif"
    role: Headings, large numbers, accent text, equation chips, section titles.
  body:
    fontFamily: "'Instrument Sans', sans-serif"
    role: Body copy, UI labels, navigation, inline text.
  mono:
    fontFamily: "'DM Mono', monospace"
    role: Kickers, metadata, labels, uppercase tracking text, timeline markers.
  sticky:
    fontFamily: "'Caveat', cursive"
    role: Handwritten sticky-note annotations only.
  scale:
    h1: "clamp(2.8rem, 6vw, 4.4rem)"
    h1-weight: 300
    h1-lineHeight: 1.02
    h1-letterSpacing: "-0.015em"
    section-heading-collapsed: "1.125rem / 1.35rem at md"
    section-heading-collapsed-weight: 600
    section-subtext-collapsed: "scale(0.89) mobile / scale(0.78) desktop"
    section-heading-expanded-weight: 600
    body-size: "15px / 1rem"
    body-lineHeight: "1.65rem"
    body-letterSpacing: "0.012em"
    mini-heading-size: "1.15rem"
    mini-heading-weight: 600
    mono-label-size: "10px-11px"
    mono-label-weight: 700
    mono-label-letterSpacing: "0.05em-0.15em"

spacing:
  section-gap: "2.5rem"
  block-gap: "3.65rem"
  heading-body-gap: "1.2rem"
  section-heading-gap-collapsed: "0.8rem"
  section-heading-gap-expanded: "0.85rem"
  page-max-width: "max-w-4xl (56rem / 896px)"
  page-horizontal-padding: "2.5rem (pl-10 pr-10)"

background:
  dot-matrix:
    element: "html::before"
    position: "fixed, inset 0, z-index 0"
    pattern: "radial-gradient(circle, rgba(120, 120, 120, 0.28) 1.5px, transparent 1.5px)"
    size: "22px × 22px"
  fog-overlay:
    element: "html::after"
    position: "fixed, inset 0, z-index 1"
    gradient: "radial-gradient(ellipse 46% 120% at center, var(--color-bg) 0%, var(--color-bg) 45%, color-mix(in srgb, var(--color-bg) 28%, transparent) 72%, transparent 100%)"
    purpose: "Smothers dot matrix under the content area. Transitions cleanly at edges."
  page:
    element: "body"
    background: "var(--color-bg)"
    z-index: 2
---

# Zapp Account Case Study Design System

## Overview

This design system powers a polished editorial case study with a one-slider theming engine. Change `--accent-h` on the `<html>` element and every blue-tinted color — background, separators, text tones, brand palette, highlight overlays — shifts to the new hue. The warm ink text scale and semantic green/teal colors stay fixed.

Use this `DESIGN.md` as the token reference for porting the theme to a new page or re-skinning an existing one. For interaction details (accordion animation, floating previews, placeholder editing, hover highlights), see `CASE_STUDY_INTERACTION_PATTERNS.md`.

## Theme Engine

### The one slider

Set these three CSS variables on the `<html>` element:

```css
style="--accent-h: 206; --accent-s: 54; --accent-l: 29;"
```

- **`--accent-h`** (206 = blue): The master hue. Every derived color uses this value.
- **`--accent-s`** (54): Saturation for brand accent colors.
- **`--accent-l`** (29): Lightness for brand accent colors.

The `:root {}` CSS block should NOT redefine these — the `<html>` element is the single source of truth.

### What shifts

| Category | Token | Derivation |
|----------|-------|-----------|
| Page background | `--color-bg` | `hsl(var(--accent-h), 30%, 97%)` |
| Tailwind canvas | `canvas` | `var(--color-bg)` |
| Tailwind warm.50 | `warm.50` | `var(--color-bg)` |
| Section separators | `--section-separator-color` | `hsl(var(--accent-h), 28%, 52%, 0.15)` |
| Brand 50-700 | `brand.*` in Tailwind config | `hsl(var(--accent-h) ... var(--accent-s)... var(--accent-l)...)` |
| Deep blue text | (was `#1b2433`) | `hsl(var(--accent-h), 20%, 15%)` |
| Body blue text | (was `#3a4452`) | `hsl(var(--accent-h), 14%, 27%)` |
| Label blue | (was `#60728c`) | `hsl(var(--accent-h), 16%, 46%)` |
| Avatar icon | (was `#7b8c9d`) | `hsl(var(--accent-h), 12%, 55%)` |
| Secure icon bg | (was `#e9f1ff`) | `hsl(var(--accent-h), 40%, 95%)` |
| Active avatar bg | (was `#e4f1f4`) | `hsl(var(--accent-h), 25%, 93%)` |
| Nav key color | (was `hsl(206, 35%, 42%)`) | `hsl(var(--accent-h), 35%, 42%)` |
| Nav hint subtitle | (was `hsl(206, 20%, 52%)`) | `hsl(var(--accent-h), 20%, 52%)` |
| Spotlight overlay | (was `rgba(250,250,250,*)`) | `color-mix(in srgb, var(--color-bg) N%, transparent)` |

### What stays fixed

| Category | Reason |
|----------|--------|
| Ink (`#2C2621`), deep (`#5C5146`), muted (`#7A6F64`), medium (`#A89B8F`), outline (`#433A31`) | Warm-earth text scale — works with any accent hue |
| `warm.100` through `warm.950` | Hardcoded hex earth tones — neutral warm palette |
| Teal/green (`#1a5f67`, `#064e3b`, `#edf8f1`, etc.) | Semantic meaning: success, positive, worked, available |
| Danger (`#991b1b`, `#fee2e2`) | Semantic meaning: error, unavailable |
| Amber (`#fff4cf`, `#8a5a00`, `#fff1a8`) | Semantic meaning: highlight, fast, warning |
| Device dark (`#303033`, `#1a1a1a`) | Phone bezel/screen — not part of page theme |
| Border gray (`rgba(71, 71, 71, *)`) | Neutral structural gray — intentionally disconnected from accent |

## Colors

### Tokens that shift with `--accent-h`

All listed above under "What shifts." The pattern is consistent: any color whose hue component is `206` (blue) in the CSS is derived from `var(--accent-h)`. Any color that semantically means "success," "danger," "phone," or "warm neutral" is hardcoded.

### Warm ink text scale

| Name | Hex | Tailwind token | Use |
|------|-----|---------------|-----|
| ink | `#2C2621` | `theme('colors.ink')` | Primary headings, labels |
| deep | `#5C5146` | `theme('colors.deep')` | Secondary text, subtext |
| muted | `#7A6F64` | `theme('colors.muted')` | Tertiary labels, metadata |
| medium | `#A89B8F` | `theme('colors.medium')` | Subtle text |
| outline | `#433A31` | `theme('colors.outline')` | Blockquote border, structural lines |
| `--color-deep` | `#4A4038` | CSS variable | Default body text color |

### Teal semantic scale (success, worked, available)

| Name | Hex | Use |
|------|-----|-----|
| `#1a5f67` | Primary | Cumulative metrics, active fills, highlights |
| `#064e3b` | Deep | KYC tabs active, pills, equation terms |
| `#2a5560` | Subtext | Results subtext |
| `#1b4332` | Dark | Results today value |
| `#0f3323` | Heavy | Strategy finding text |
| `#2f7a45` | Icon | Convenient value prop icon |
| `#edf8f1` | Light surface | Pill backgrounds, worked node cards |
| `#f2f8f9` | Cool surface | Cumulative card backgrounds |
| `#d7eee7` | Soft surface | Wallet card background |
| `#9bcfad` | Border | Worked node border |

### Borders and separators

All structural borders use `rgba(71, 71, 71, opacity)` with opacities ranging from `0.08` (subtle) to `0.72` (prominent). The color `rgb(71, 71, 71)` is a neutral gray — it does not shift with accent hue. Section separators are the exception: they use `var(--section-separator-color)` which is hue-derived and can be toggled to `transparent` via the edit-mode design panel.

## Typography

### Font families

| Voice | Font | CSS Variable | Role |
|-------|------|-------------|------|
| Display | Fraunces (serif) | `var(--font-display)` | Headings, large numbers, accent text |
| Body | Instrument Sans | `var(--font-body)` | Body copy, UI labels, form elements |
| Mono | DM Mono | `var(--font-mono)` | Kickers, metadata, labels, uppercase tracking |
| Sticky | Caveat (cursive) | `var(--font-sticky)` | Handwritten annotations only |

### Scale

| Token | Value | Notes |
|-------|-------|-------|
| `h1` | `clamp(2.8rem, 6vw, 4.4rem)` | font-weight: 300, line-height: 1.02, tracking: -0.015em |
| Collapsed section heading | `1.125rem` (mobile) / `1.35rem` (≥768px) | font-weight: 600, letter-spacing: -0.02em |
| Expanded section heading | inherits from h2/h3 | font-family switches to body, weight 600 |
| Collapsed subtext | `scale(0.89)` mobile / `scale(0.78)` desktop | font-weight: 400, color: `var(--color-deep)` |
| Body text | `15px` (0.9375rem) | line-height: 1.65rem, letter-spacing: 0.012em |
| Mini heading (h3/h4) | `1.15rem` | font-weight: 600, line-height: 1.35 |
| Mono label | `10px–11px` | font-weight: 700, letter-spacing: 0.05em–0.15em, uppercase |

## Spacing

All spacing tokens are set as CSS variables on the `<html>` element and are adjustable via the edit-mode design panel:

| Token | Default | Purpose |
|-------|---------|---------|
| `--section-gap` | `2.5rem` | Vertical gap between accordion sections |
| `--block-gap` | `3.65rem` | Gap between content blocks within a section |
| `--heading-body-gap` | `1.2rem` | Gap between a heading and its following paragraph |
| `--section-heading-gap-collapsed` | `0.8rem` | Gap below collapsed section heading |
| `--section-heading-gap-expanded` | `0.85rem` | Gap below expanded section heading |

Page container: `max-width: 56rem` (896px, Tailwind `max-w-4xl`). Horizontal padding: `2.5rem` on each side.

## Background Pattern

The background uses three layers:

1. **Dot matrix** (`html::before`, z-index: 0) — A full-viewport grid of subtle dots: `radial-gradient(circle, rgba(120, 120, 120, 0.28) 1.5px, transparent 1.5px)` at `22px` spacing.

2. **Fog overlay** (`html::after`, z-index: 1) — A central elliptical gradient that masks the dots under the content area. Uses `var(--color-bg)` at full opacity in the center, fading to transparent at the edges: `radial-gradient(ellipse 46% 120% at center, var(--color-bg) 0%, var(--color-bg) 45%, color-mix(in srgb, var(--color-bg) 28%, transparent) 72%, transparent 100%)`.

3. **Content** (`body`, z-index: 2) — Solid `var(--color-bg)` background.

## Accordion Section Structure

Sections use the `.stack-section` class within a `.stack-container`. Each section has:

- `.section-header` — Clickable header with h2, subtext, and +/− toggle
- `.card-body` — Collapsed by default (`height: 0; overflow: hidden`)

### States

| State | Heading | Subtext | Body |
|-------|---------|---------|------|
| Collapsed | `1.125rem`, weight 600, ink color | `scale(0.89)`, body font, deep color | `height: 0` |
| Expanded | Body font, deep color, weight 600 | Full size, display font, weight 600 | `height: auto` (JS-animated) |
| Hover (collapsed) | No change | No change | `::before` pseudo with `hsl(var(--accent-h) ... / 0.05)` background, scaled 1.02x |

### Hover suppression during animation

The hover highlight is suppressed during expand/collapse animation via `body:not(.is-animating-motion)` on the hover selector. It reappears after the animation completes if the cursor is still hovering.

## Phone Mockup Pattern

```css
.legacy-wallet-device       /* Dark gradient shell */
.legacy-wallet-screen       /* var(--color-bg) fill, inner shadow */
.placeholder-image-layer    /* Image: display:none → display:block on .has-saved-image */
.placeholder-default        /* Wireframe bars/tiles/cards: opacity:0 on .has-saved-image */
```

- Device bezel: `linear-gradient(145deg, #303033 0%, #1d1d1f 36%, #161617 100%)`, border-radius: `2.2rem`
- Screen: border-radius: `1.75rem`, aspect-ratio: `9/19`, inner shadow on `::after`
- Images: hidden by default, shown when parent has `has-saved-image` class
- Wireframe content: hidden (`opacity: 0`) when image is present

## Content Loading Indicator

For execution journey states with content that may not be fully loaded:

- States with `has-saved-image` (images) or `has-live-embed` (iframes) get `is-content-loading` class added at init if their content isn't ready
- Loading ring: `::before` pseudo on `.legacy-wallet-screen` — thin white ring with brighter top segment, rotating + fading
- Hidden when: `img.complete && img.naturalWidth > 0`, or `img.onload`, or `iframe.onload`, or `img.onerror`

```css
.execution-phone-state.is-content-loading .legacy-wallet-screen::before {
    /* Pulsing ring animation */
}
```

## How to Use for a New Case Study

1. **Copy the HTML file** and replace all body content while preserving the CSS + JS engine
2. **Change `--accent-h`** on `<html>` to your desired hue (e.g., `14` = terracotta, `270` = violet, `340` = rose)
3. **Adjust `--accent-s` and `--accent-l`** if the brand colors need different saturation/lightness
4. **Keep the warm ink text scale** — it works with any accent hue
5. **Keep the teal semantic scale** — it carries fixed meaning (success/positive/worked)
6. **Replace images** in `case study assets/` with new `zapp-placeholder-*.png` files
7. **Edit `data-text-key`** content for your new case study text
8. **Do not change** `data-placeholder-id`, `data-journey-*`, `data-highlight-*` attribute names — they're wired to the JS engine
