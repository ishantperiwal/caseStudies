# PocketSaga documentation hub

Start here in a new chat. PocketSaga has one prototype, one presentation-oriented design-system playground, and a small set of documents with different responsibilities. Read the linked source for the kind of work being changed instead of reconstructing visual rules from screenshots.

## Reading order

1. [Current handoff](codedProtoype/new%20chat%20context.md) — current behavior, recent decisions, rejected directions and implementation constraints.
2. [Prism design-system technical reference](design%20system/README.md) — material recipes, geometry, type, spacing, iconography, patterns and playground maintenance.
3. [Prototype technical reference](codedProtoype/components/README.md) — architecture, shared components, data, runtime behavior and file ownership.
4. [Design rationale and visual character](codedProtoype/design.emry.md) — product intent, presentation language and semantic design proposals.
5. [Ongoing component explorations](codedProtoype/component-explorations.md) — reviewable components that are deliberately separate from the app or Prism.

For implementation work, the minimum useful context is the current handoff plus the Prism technical reference. For a new component, also read the prototype technical reference. For presentation reasoning, use the design rationale.

## Design-system-first rule

Before creating or changing a UI element:

1. Name its role: content surface, destination/selection control, selected state, inviting action, or primary action.
2. Choose one of the five existing materials below.
3. Choose geometry separately: rounded content rectangle, clickable rounded rectangle, pill, or circle.
4. Reuse the closest app implementation in `codedProtoype/components/` before copying values from the playground.
5. Apply the shared tap, focus and reduced-motion behavior.
6. Verify the result in its real screen context and, when useful, against the Prism specimen.

Do not invent a new material because a new component has appeared. A documented exception is allowed when the component has a real functional need, but record the reason in the current handoff and the relevant technical README.

## Material quick reference

Material names describe surface treatment, not shape. The exact construction and current values live in the [Prism technical reference](design%20system/README.md#material-construction).

| Material | Intended role | Current examples |
| --- | --- | --- |
| **Neutral mint** | Quiet supporting surfaces and low-emphasis actions | Post/supporting surfaces; full-width Hide spoiler action |
| **Dense neutral** | Clear destination or selection controls that need separation without active mint emphasis | Choose a group; Post type |
| **Highlight mint** | Persistent selected or joined state | Undocked selected filter; chosen picker option; Joined specimen |
| **Medium mint** | An inviting action that asks the user to choose, reveal or continue | Choose a title; Show notification history; View potential spoiler |
| **Strong mint** | Primary action or strongest active destination | Join group; Write; Play; travelling bottom-navigation selection; docked filter selection |

Current specimen fills are Neutral `rgb(178 219 194 / 4%)`, Dense neutral `rgb(43 49 47 / 76%)`, Highlight `rgb(178 219 194 / 14%)`, Medium `rgb(120 169 138 / 10%)`, and Strong `rgb(128 213 169 / 25%)`. A material also includes its wash, directional rim, blur, saturation and feedback; never reproduce it from the fill alone.

## Fast implementation references

- Playground recipes: [`design system/material.css`](design%20system/material.css). These are reference specimens and are not automatically synchronized with the app.
- App surfaces and material mappings: [`codedProtoype/components/surfaces.css`](codedProtoype/components/surfaces.css).
- Dense-neutral controls: [`codedProtoype/components/create-post.css`](codedProtoype/components/create-post.css).
- Shared tap behavior: `.tap-feedback` in [`codedProtoype/components/community.css`](codedProtoype/components/community.css): scale to `.985` over `85ms`, with a restrained upper-surface light; disabled under reduced motion.
- Changed-value feedback: the light sweep plus `1 → 1.012 → 1` pulse described in the [motion pattern documentation](codedProtoype/design.emry.md#changed-value-feedback-light-sweep-and-gentle-pulse) and implemented in the New Post pickers. Use it for a changed picker value, not every tap.

## Foundation shorthand

- **Atmosphere:** artwork-derived muted palette plus a softly blurred poster texture over an off-black base. Artwork supplies context; it does not create new brand colors.
- **Light:** restrained and directional, usually from the top-left or top. Avoid uniform bright outlines.
- **Typography:** Newsreader for editorial headings; Manrope for UI, body and metadata.
- **Spacing scale:** 4, 6, 8, 12, 16, 20, 24 and 32px, with optical exceptions documented where needed.
- **Radius anchors:** composer 14px; group inset 16px; clickable selection 18px; standard card 20px; hero/thread 24px; Discover post 28px; pills fully rounded; circles 50%.
- **Terminology:** visible product copy says **group/groups**. `community` remains only in legacy code and route names.
- **Interaction:** any element that can be tapped gets whole-container press feedback. Persistent selection treatment and momentary pressed feedback are separate states.

## Source-of-truth boundaries

- `design system/README.md` owns Prism's exact presentation values and behavior.
- `codedProtoype/components/README.md` owns prototype architecture and shared component usage.
- `codedProtoype/new chat context.md` owns recent decisions, exceptions and rejected experiments.
- `codedProtoype/design.emry.md` owns rationale and presentation framing.
- `codedProtoype/component-explorations.md` owns work that is not yet approved for the app or Prism.

When a decision changes, update the owning document and leave a short cross-reference in the current handoff. Avoid copying long implementation histories into every file.
