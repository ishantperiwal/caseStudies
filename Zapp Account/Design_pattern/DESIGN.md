---
version: alpha
name: Zapp Account Case Study
description: Editorial case-study design system for the Zapp Account static portfolio page.
colors:
  canvas: "#EDEDED"
  page: "#F7F7F4"
  surface: "#FCFBF9"
  surface-soft: "#F8F8F6"
  white: "#FFFFFF"
  ink: "#000000"
  deep: "#131313"
  body: "#1F1F1F"
  muted: "#6C6C6C"
  medium: "#949494"
  outline: "#474747"
  accent: "#2747E0"
  success: "#064E3B"
  success-surface: "#EDF8F1"
  success-border: "#9BCFAD"
  marker: "#FFDE5A"
  note: "#FFF8DC"
  phone-shell: "#1A1A1A"
  phone-screen: "#F7F7F4"
  danger: "#991B1B"
  danger-surface: "#FEE2E2"
typography:
  display-xl:
    fontFamily: Space Grotesk
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: -0.02em
  section-summary:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.02em
  heading-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.02em
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0em
  label-caps:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.05em
  note-hand:
    fontFamily: Caveat
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: 0em
rounded:
  none: 0px
  xs: 2px
  sm: 3px
  md: 8px
  phone-screen: 28px
  phone-shell: 35px
  full: 9999px
spacing:
  hairline: 2px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section-gap: 64px
  page-max-width: 64rem
  page-horizontal-padding: 40px
  phone-width: 17rem
components:
  page:
    backgroundColor: "{colors.page}"
    textColor: "{colors.deep}"
    typography: "{typography.body-md}"
  section-card:
    backgroundColor: "transparent"
    borderColor: "rgba(71, 71, 71, 0.20)"
    padding: "{spacing.page-horizontal-padding}"
    rounded: "{rounded.none}"
  equation-term:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    borderColor: "rgba(6, 78, 59, 0.18)"
    typography: "{typography.heading-sm}"
    padding: "0.32rem 0.55rem"
  phone-placeholder:
    backgroundColor: "{colors.phone-shell}"
    screenColor: "{colors.phone-screen}"
    width: "{spacing.phone-width}"
    rounded: "{rounded.phone-shell}"
  hover-highlight:
    backgroundColor: "{colors.page}"
    labelBackgroundColor: "{colors.note}"
    textColor: "{colors.phone-shell}"
    typography: "{typography.note-hand}"
  flow-worked-node:
    backgroundColor: "{colors.success-surface}"
    borderColor: "{colors.success-border}"
    textColor: "{colors.deep}"
---

# Zapp Account Case Study Design

## Overview

This design system describes a polished editorial case study for a fintech product revamp. It should feel structured, analytical, and crafted by a product designer rather than like a generic marketing page.

The visual language combines a warm paper-like canvas, black editorial typography, dashed construction lines, and selective green/blue accents. The page should feel like a documented design process: layered, annotated, and precise.

Use this `DESIGN.md` as the main styling source of truth. For behavior that falls outside the official token schema, especially editable placeholders, hover annotations, phone mockups, and accordion motion, see `CASE_STUDY_INTERACTION_PATTERNS.md`.

## Colors

The palette is intentionally restrained.

- **Page (#F7F7F4):** Warm off-white base used behind all content. It should never become pure white unless an element needs a surface.
- **Ink (#000000) and Deep (#131313):** Primary editorial text colors. Headlines, core labels, and interface chrome should feel sharp and high contrast.
- **Muted (#6C6C6C), Medium (#949494), Outline (#474747):** Supporting hierarchy, guide lines, captions, dashed dividers, and inactive text.
- **Accent (#2747E0):** Utility blue for edit-mode controls, active authoring outlines, and rare interaction affordances.
- **Success (#064E3B), Success Surface (#EDF8F1), Success Border (#9BCFAD):** Used to mark achieved/worked-on items, available capabilities, and positive system meaning.
- **Marker (#FFDE5A):** Inline keyword highlight color, used like a subtle marker stroke instead of a full badge.
- **Note (#FFF8DC):** Handwritten annotation note surface.
- **Phone Shell (#1A1A1A):** Device casing and dark edge color.
- **Danger (#991B1B), Danger Surface (#FEE2E2):** Used only for unavailable or excluded states, such as MinKYC capability gaps.

Do not introduce large new palettes. New states should be derived from these tokens unless the content requires a clearly separate semantic color.

## Typography

The typographic system uses three voices:

- **Space Grotesk:** Display, headings, equation chips, tabs, technical headings, and UI labels. It gives the page a constructed, product-design feel.
- **IBM Plex Sans:** Narrative body copy. It should stay readable, calm, and not over-styled.
- **Caveat:** Handwritten highlight notes and sticky-note style annotations only.

Headlines should use tight tracking, generally `-0.02em`. Body copy should stay around 15-16px with comfortable `1.6` line height. Metadata and tiny labels should use the mono utility style with uppercase text and subtle letter spacing.

Avoid mixing too many weights in one block. Most sections should use regular body copy, medium summaries, and semibold mini headings.

## Layout

The page uses a fixed-width editorial canvas with a max width around `64rem`. Content lives on a warm dotted-paper background with vertical and horizontal construction guide lines.

Layout principles:

- Use stacked accordion sections as the main narrative rhythm.
- Keep section bodies padded with approximately 40px horizontal spacing on desktop.
- Use dashed or dotted guide lines rather than heavy separators.
- Prefer compact, structured diagrams over decorative cards.
- Keep major explanatory graphics close to the paragraph they clarify.
- Avoid full-bleed blocks except the hero and deliberately framed flowcharts.
- Preserve responsive behavior by letting complex rows wrap instead of shrinking text too aggressively.

For local explanatory models, use simple equation or grid patterns. The adoption equation is the reference pattern: one clear subject, a proportional relationship, and a small number of terms.

## Elevation & Depth

Depth should come from tonal layering, borders, and motion rather than shadows.

Use:

- Thin borders with low-opacity `outline`.
- Slightly tinted surfaces for diagrams and callouts.
- Green worked-state surfaces for meaningful product changes.
- Motion and opacity to reveal hierarchy in accordion states.

Avoid heavy card shadows. Shadows are acceptable only for temporary edit-mode controls, modal surfaces, and hover toolbars where they need to float above the page.

## Shapes

Most rectangular UI should have square or near-square corners. The page should feel architectural and grid-led.

Exceptions:

- Phone shells use large rounded corners.
- Phone screens use smaller but still strong rounded corners.
- Pills and icon badges can use `rounded.full`.
- Sticky notes and handwritten highlights can use small softened corners.

Do not randomly mix rounded cards into the editorial content. If a component uses a strong radius, it should have a product/device or control reason.

## Components

### Accordion Sections

Accordion cards are the main content structure. Collapsed headers should show the section title and summary with softened scale and opacity. Expanded sections reveal the body with smooth height and opacity transitions.

Use the plus/minus affordance on the right edge. Keep collapsed summaries short and scannable.

### Phone Placeholders

Phone placeholders are a core visual motif. Use a dark `phone-shell`, rounded shell, inner rounded screen, and top-centered dynamic-island notch. Standard phone width is `17rem`.

Uploaded images should:

- Fill the phone screen using `object-fit: cover`.
- Stay top-aligned.
- Overscan slightly to avoid sub-pixel hairlines.
- Be stored with durable relative paths in `case study assets/`.

### Hover Highlights

Hover highlights are annotations, not permanent overlays. They consist of:

- A radial spotlight.
- A curved arrow.
- A handwritten note.

Keep note text short. The current authoring model caps note text at 12 words. Arrow distance, highlight radius, curve, and note position are per-placeholder settings stored as attributes.

### Flowcharts

Flowcharts should be clean, rectilinear, and mostly neutral. Use green worked nodes to show work the team had to do. Always include a legend if green has meaning.

Tabs for before/after comparisons should sit directly under the flow title. Keep the legend on the opposite side when space allows.

### Equation Blocks

Equation blocks are for simple product logic. They should be centered and read left-to-right.

The preferred pattern is:

`Subject` + proportional symbol + green terms separated by plus buttons.

The subject can have an invisible container so it vertically aligns with the green chips without implying it is one of the terms.

### Sticky Notes

Sticky notes should feel like designer annotations. Use sparingly, offset outside the main text column when space allows, and rotate very slightly. They should support the narrative, not repeat it.

## Do's and Don'ts

- Do keep the page editorial, analytical, and process-led.
- Do preserve `data-text-key`, `data-placeholder-id`, and `data-highlight-*` when editing existing elements.
- Do use green only for positive/worked/available meaning.
- Do use blue mostly for editing controls and rare product accents.
- Do keep diagrams close to the section they explain.
- Do prefer one strong visual idea per section over several competing decorations.
- Don't rewrite case-study copy as a side effect of styling work.
- Don't use generic rounded cards everywhere.
- Don't introduce heavy shadows into content sections.
- Don't let phone placeholders or floating previews collide with body copy.
- Don't make runtime edit controls part of the saved design surface.
