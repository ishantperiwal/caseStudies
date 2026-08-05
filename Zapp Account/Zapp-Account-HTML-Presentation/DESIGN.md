---
name: Zapp Account Portfolio Presentation
description: A crisp editorial-tech system that tells a senior product story through generous chapters and live product proof.
colors:
  light-canvas: "#f7f9fc"
  light-surface: "#ffffff"
  light-surface-soft: "#edf2f8"
  graphite-ink: "#101318"
  light-muted: "#56606d"
  light-line: "#d7dee8"
  zapp-blue: "#1d5bd6"
  device-graphite: "#1a1b1e"
  device-edge: "#484b51"
  dark-surface: "#171b21"
  dark-surface-soft: "#202630"
  dark-ink: "#f2f5f9"
  dark-muted: "#aeb8c5"
  dark-line: "#303844"
  dark-zapp-blue: "#78a8ff"
  dark-accent-ink: "#0c1728"
  dark-device: "#090a0c"
  dark-device-edge: "#5d6169"
typography:
  display:
    fontFamily: '"Archivo", "Segoe UI Variable Display", "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif'
    fontSize: "clamp(52px, 4vw, 78px)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Archivo", "Segoe UI Variable Display", "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif'
    fontSize: "clamp(40px, 4.2vw, 64px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: '"Archivo", "Segoe UI Variable Display", "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif'
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Source Sans 3", "Segoe UI Variable Text", "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif'
    fontSize: "clamp(17px, 1.05vw, 19px)"
    fontWeight: 400
    lineHeight: 1.56
    letterSpacing: "normal"
  label:
    fontFamily: '"Source Sans 3", "Segoe UI Variable Text", "Segoe UI", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  card: "24px"
  mini-phone: "28px"
  phone-screen: "34px"
  phone-shell: "42px"
  pill: "999px"
spacing:
  control-gap: "8px"
  compact: "12px"
  content: "16px"
  cluster: "24px"
  panel: "32px"
  chapter-inline: "48px"
components:
  button-primary:
    backgroundColor: "{colors.zapp-blue}"
    textColor: "{colors.light-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "38px"
  button-secondary:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "38px"
  tab-active:
    backgroundColor: "{colors.zapp-blue}"
    textColor: "{colors.light-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  card-accent:
    backgroundColor: "{colors.zapp-blue}"
    textColor: "{colors.light-surface}"
    rounded: "{rounded.card}"
    padding: "32px"
  device-frame:
    backgroundColor: "{colors.device-graphite}"
    textColor: "{colors.light-surface}"
    rounded: "{rounded.phone-shell}"
    padding: "8px"
  navigation-shell:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.graphite-ink}"
    padding: "0 32px"
    height: "72px"
  decision-row:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-muted}"
    padding: "18px 6px"
    width: "100%"
  metric-cell:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.graphite-ink}"
    padding: "28px"
    height: "176px"
---

# Design System: Zapp Account Portfolio Presentation

## Overview

**Creative North Star: "Live Product Storyboard"**

The system feels like a senior product designer walking an interviewer through a live argument: crisp editorial framing establishes the point, then large product screens prove it. It is calm, precise, and product-led, with generous space that lets one decision land before the next begins.

Cool white and graphite surfaces carry most of the visual weight. A restrained Zapp blue supplies the single clear signal for emphasis, action, selection, and data. Material depth is quiet everywhere except the framed phones, where realistic edges, inset shading, and ambient shadow make the product feel present rather than pasted into a slide.

Motion behaves as product evidence. Short reveals establish sequence, state changes explain interaction, and genuine prototypes or inline animation are preferred when they clarify the work. Every essential idea remains visible without motion, and the reduced-motion fallback removes transforms and near-eliminates duration.

**Key Characteristics:**

- Generous editorial hierarchy with one dominant idea per chapter
- Large framed phones as the strongest material objects
- Cool white and graphite neutrals with one restrained Zapp blue accent
- Sharp Archivo display typography paired with clear Source Sans 3 body and UI copy
- Short purposeful reveals, live product states, and reduced-motion parity
- Light and dark themes that preserve the same role hierarchy

## Colors

The palette is cool, restrained, and role-based: pale canvases and graphite copy create calm contrast while Zapp blue remains deliberately rare.

### Primary

- **Signal Zapp Blue** (`#1d5bd6`): Marks primary actions, selected states, evidence indices, metrics, and the strongest strategic panel in the light theme.
- **Night Zapp Blue** (`#78a8ff`): Preserves the same signal role against dark surfaces without becoming neon or decorative.

### Neutral

- **Cool Canvas** (`#f7f9fc`): Default light-theme chapter background and translucent control foundation.
- **Clear Surface** (`#ffffff`): Raised or alternating light-theme chapters, button surfaces, and screen interiors.
- **Mist Surface** (`#edf2f8`): Quiet contrast for secondary panels and rejected directions.
- **Graphite Ink** (`#101318`): Primary light-theme text and the dark-theme canvas.
- **Slate Copy** (`#56606d`): Secondary prose, captions, and supporting labels in the light theme.
- **Cloud Rule** (`#d7dee8`): Hairline separators, control borders, and grouped-row structure.
- **Device Graphite** (`#1a1b1e`) and **Device Edge** (`#484b51`): The light-theme phone shell and its visible edge.
- **Night Surface** (`#171b21`) and **Night Soft Surface** (`#202630`): Dark-theme chapter layers.
- **Night Ink** (`#f2f5f9`) and **Night Slate** (`#aeb8c5`): Dark-theme primary and secondary copy.
- **Night Rule** (`#303844`): Dark-theme separators and control borders.
- **Night Accent Ink** (`#0c1728`): Legible copy on the lighter dark-theme blue.
- **Deep Device** (`#090a0c`) and **Night Device Edge** (`#5d6169`): Dark-theme phone material.

**The One Accent Rule.** Zapp blue is reserved for action, active state, evidence, and decisive emphasis; its rarity is what gives it authority.

**The Role-Preserving Theme Rule.** Dark mode changes luminance and material values, not the hierarchy or meaning of a color role.

## Typography

**Display Font:** Archivo (loaded as a variable font with `display=swap`, with Segoe UI Variable Display, Segoe UI, Helvetica Neue, Arial, and system fallbacks)  
**Body Font:** Source Sans 3 (loaded as a variable font with `display=swap`, with Segoe UI Variable Text, Segoe UI, Helvetica Neue, Arial, and system fallbacks)

**Character:** Archivo gives major arguments, evidence, and metrics a sharper editorial authority without the rounded softness of the previous display voice. Source Sans 3 keeps narrative copy, controls, labels, and metadata open, calm, and highly readable.

### Hierarchy

- **Display** (700, `clamp(52px, 4vw, 78px)`, 0.96): Opening argument and only the most important portfolio statement.
- **Headline** (700, `clamp(40px, 4.5vw, 68px)`, 1): Chapter theses, balanced to a readable maximum of roughly 17 characters per line.
- **Title** (700, `24px`, 1.1): Evidence and decision headings inside structured groups.
- **Body** (400, `clamp(17px, 1.05vw, 19px)`, 1.56): Explanatory narrative, generally held to about 60-68 characters per line.
- **Label** (650, `13px`, 1.4): Controls, navigation status, metadata, captions, and compact supporting information.

Supporting roles use named CSS tokens rather than isolated values: lead copy is `clamp(20px, 1.35vw, 22px)`, supporting copy is `16px`, captions are `12px`, statements are `clamp(28px, 3vw, 45px)`, and display-scale evidence stays below a 96px ceiling.

Large statistics use the display logic with tabular numerals, a tighter line-height (0.9), and stronger negative tracking so evidence reads as a single visual unit.

**The Editorial Pairing Rule.** Use Archivo only for display-scale arguments, evidence, metrics, and quotations; keep Source Sans 3 for reading, controls, labels, captions, and metadata.

**The Thesis-Support Rule.** Every chapter has one dominant statement that carries its purpose. Supporting copy, examples, and evidence follow beneath it and recede through smaller scale, lighter tone, and spacing, not additional hues. At desktop presentation widths, carrier headings use intentional two-line compositions and never fall into accidental three-line wraps.

## Layout

The presentation is a chapter-based scrollytelling surface. Each chapter starts at the viewport edge, uses a fixed 72px top bar, and receives at least 48px of inline space around a fluid content area that tops out near 1320px. The rhythm is generous: section introductions commonly separate from evidence by 44-58px, paired panels use 22-24px gaps, and large product stages can open to 130-170px between copy and device proof.

Desktop chapters may use asymmetric two-column grids when one side is product evidence. At 1120px, outer spacing and phone widths tighten. At 900px, the system shifts to single-column reading, the top bar becomes 64px, and product objects move below their explanation. At 620px, strategy and metrics stack to one column, controls compact, and the discovery trio remains a same-width horizontal scroll row so all three entry points stay available.

Scroll snapping is proximity-based rather than forceful. Print removes interface chrome and gives each chapter a page. Responsive behavior preserves argument order and touch readability instead of shrinking the desktop composition.

**The Surface-Scope Rule.** Chapter compositions belong to this portfolio presentation; future product surfaces inherit the tokens, materials, and interaction behavior, not its task-local slide arrangements.

## Elevation & Depth

Depth is a restrained hybrid of tonal layering and ambient shadow. Most narrative surfaces separate through color and one-pixel rules. Strong elevation is concentrated on phone frames, the hero render, and a small number of floating controls so the product remains the most tangible object in the composition.

### Shadow Vocabulary

- **Product Ambient** (`0 28px 80px rgba(30, 57, 92, 0.16)`): Primary light-theme device lift; dark mode deepens it to `rgba(0, 0, 0, 0.36)`.
- **Surface Soft** (`0 14px 42px rgba(30, 57, 92, 0.10)`): Quiet lift for selected editorial panels, miniature devices, and floating controls; dark mode uses `rgba(0, 0, 0, 0.22)`.
- **Hero Object** (`drop-shadow(0 34px 36px rgba(18, 37, 68, 0.22))`): Reserved for the opening phone render.

Phone depth also uses a subtle metallic gradient, a one-pixel edge, and inset highlights; it is not shadow alone.

**The Product Proof Rule.** The strongest depth belongs to the product object; editorial containers remain tonal or softly lifted.

## Shapes

The form language is softly technical. Editorial panels use generous 24px corners, controls use full pill geometry, and phones use nested radii that distinguish the shell from the screen. Hairline borders organize data and controls without turning the surface into a boxed dashboard.

- **Editorial panels:** Gently curved corners (24px) with overflow clipping when color fields meet.
- **Pill controls:** Fully rounded ends (999px) for actions, tabs, navigation, and transient help.
- **Phone shells:** Deep device corners (42px shell, 34px screen) with compact 32px/26px radii on narrower screens.
- **Miniature phone:** A slightly tighter 28px silhouette so it reads as supporting evidence.

**The Nested Material Rule.** Device shell and screen radii must remain visibly distinct; flattening them into one card radius removes the sense of real hardware.

## Components

### Buttons

- **Shape:** Compact pill controls (999px) with a minimum 38px height.
- **Primary:** Signal Zapp Blue with clear surface text, a matching blue border, and 16px horizontal padding.
- **Secondary:** Clear surface with graphite text and a one-pixel cloud rule.
- **Hover / Focus:** Hover lifts by 1px over 180ms; active compresses to 0.98 scale; keyboard focus uses a 3px blue outline with 4px offset.
- **Dark Theme:** Roles translate to Night Zapp Blue, Night Accent Ink, and the dark surface/rule pair.

### Decision Rows

Decision rows are editorial selectors rather than boxed buttons. They span the copy column, use 18px vertical padding and horizontal rules, and shift from muted text to blue with a 16px rightward move when active. A short blue line appears before the active label to make state legible beyond color.

### Tabs and Prototype Toggles

Prototype controls reuse the pill button family at 14px, 650-680 weight. The active or pressed state fills with blue and reverses the text; inactive controls remain white with a quiet rule. State changes swap real screens or live prototypes with a short opacity-and-position transition.

### Cards / Containers

- **Corner Style:** Soft editorial panels (24px).
- **Background:** Clear, mist, or blue according to hierarchy; avoid arbitrary color variants.
- **Shadow Strategy:** Tonal by default, softly lifted only when the panel must sit above its neighbors.
- **Border:** One-pixel rules structure grouped rows; standalone panels usually rely on fill.
- **Internal Padding:** 32px for large strategy and judgment panels, 24px for compact rails.

### Navigation

The fixed top bar uses a three-part desktop grid for brand, live chapter status, and actions. It is translucent cool canvas with a blurred backdrop and one bottom rule. Below 900px it becomes a two-part layout, hides the center status and secondary brand label, and keeps the key actions available. A floating pill at the lower right provides Previous/Next chapter navigation with clear disabled opacity.

### Framed Device

The framed phone is the signature component. A graphite gradient shell, metallic edge, nested white screen, inset screen shading, and ambient product shadow make screenshots feel like live objects. The default shell is 42px with 8px material thickness; the screen is 34px and preserves a 9:19 aspect ratio. The discovery trio uses a tighter 32px shell and 26px screen radius so three equal devices read as a clean horizontal set. Product imagery stays undistorted inside the frame.

### Metrics

Metrics form a border-led field rather than separate cards. Four equal columns share top and bottom rules, with one-pixel vertical separators. The value is large, blue, tightly tracked, and tabular; the label and provenance remain compact and neutral. The field becomes two columns at 900px and one column at 620px.

**The Purposeful State Rule.** Motion must reveal sequence or prove interaction: 180-420ms for controls and content swaps, 560-760ms for chapter reveals, and a single 1000ms hero arrival. Reduced motion removes transforms and reduces duration to 0.01ms.

## Do's and Don'ts

### Do:

- **Do** let large, framed product screens carry the strongest depth and visual emphasis.
- **Do** use Zapp blue for primary action, selected state, evidence, and decisive data.
- **Do** keep body copy near 60-68 characters per line and preserve generous chapter spacing.
- **Do** use genuine product motion or live prototypes when they clarify a decision, with a complete reduced-motion fallback.
- **Do** preserve color-role meaning and contrast when translating between light and dark themes.

### Don't:

- **Don't** introduce extra accent hues, decorative gradients, or bright status colors into the presentation system.
- **Don't** make every panel float; most narrative structure should come from tonal layers and one-pixel rules.
- **Don't** use Archivo for long-form body copy or introduce a third typeface.
- **Don't** shrink multi-column desktop arrangements onto mobile; restore reading order and retain only the most useful product proof.
- **Don't** promote a chapter's one-off composition into a universal layout rule for other surfaces.
