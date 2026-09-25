# Design-system playground

Updated 25 September 2026. Start with the [PocketSaga documentation hub](../README.md). The overall history (what was built, tried and rejected, user preferences) lives in the "Latest handoff" section of [new chat context.md](../codedProtoype/new%20chat%20context.md); this README is the detailed parameter reference. This is a visual presentation aid and material exploration beside the prototype, not a complete migration of the app to new tokens.

Open `http://127.0.0.1:5500/assignments/pocketSaga/design%20system/index.html` using the existing local server. The presentation rationale and semantic proposals live in [design.emry.md](../codedProtoype/design.emry.md); the project handoff lives in [new chat context.md](../codedProtoype/new%20chat%20context.md).

## Views

| View | Content |
| --- | --- |
| Prism (title, default) | Glass pyramid (`glass-icon.js` Pyramid shape) with a fixed 12° tilt: drag rotates it horizontally only (no pitch, no hover tilt, grab cursor) and a released flick keeps spinning with inertia that decays at 1.1/s back to the slow idle spin. The live ribbon shader canvas is composited beneath the text every frame (`backdrop.under`), so the glass refracts the moving background and the lettering. "PRISM" in Manrope 500 capitals with wide tracking: a restrained mint glow rising from the top (7% / 14%), vertical strong-mint fill `#7fb398 → #5a8a72 → #34594a`, a top-down inner sheen and a highlight on top-facing edges only (cut with a down-shifted copy so glyph overlaps never show), via `backdrop.paintText`. "DESIGN SYSTEM" (Manrope 500, 15px, `#a3b4ad`) is drawn into the same plate 28px below the capitals so the glass refracts it too; its first and last letters' ink align exactly with the ink of the P and M (a visually hidden HTML copy remains for screen readers). Created on entering the view and destroyed on leaving (`prism-title.js`) |
| Material | Five reusable surface variations: Neutral mint, Dense neutral, Highlight mint, Medium mint and Strong mint; Container/Pill geometry and cumulative construction steps |
| Background | Artwork → Blur → Mute → Palette → Contrast; fixed sample text demonstrates readability |
| Shapes | Rounded rectangles for content/writing and clickable selection surfaces; pills showing Join group and Joined membership states; three circles showing Add, New Post, and one shared avatar; real Dark discussion copy |
| Iconography | Labeled specimens generated from the shared prototype icon libraries, excluding the phone's signal, Wi-Fi and battery status indicators |
| Patterns | Progressive blur on the left at full height, Changed value and Like & save stacked on the right, each with a Shapes-style caption. **Progressive blur** (Content under chrome): a 340px phone-like viewport (`#0e0f10`) with real feed cards looping upward (42s, static under reduced motion) beneath a status bar (0–59px), a Beyond Earth app bar (59–103px) and the home indicator, using the app's geometry. Steps **Content → Blur → Progressive → Fade → Scrim**, loading fully built; clicking the current step returns to Content. Blur: one uniform 12px band with a hard edge; Progressive: the app's `ProgressiveBlur` recipe, four 1/3/6/12px layers with overlapping eased masks (0–35, 20–60, 45–85, 65–100%) in a 12–147px top zone and an 88px bottom zone; Fade: the `.feed-scroll` content mask (transparent to 88px, opaque at 147px), so content is already half faded behind the app bar; Scrim: Discover's sticky-top black gradient peaking at 35%. Values are local copies of `components.js`/`community.css`. **Changed value**: choose Beyond Earth or Dark group; the control gets the New Post light sweep and gentle scale pulse. **Like & save**: a neutral-material post card with the app's reaction row; Like and Save call the app's own `PocketSagaMotion.animateLike` / `animateSave` (`motion.js`, vendored GSAP loaded by the playground), so hearts rise from the tapped heart and "Saved" floats up from the bookmark instead of a screen-edge toast |
| Color | Primary accent, Secondary accent & feedback first; then the supporting Foundation and Text neutrals; source hex values from the design brief |
| Spacing & roundness | 4/6/8/12/16/20/24/32 spacing scale; short semantic labels; single-corner diagrams with highlighted arcs |
| Font & typography | Newsreader editorial styles and Manrope UI/body styles; role, size, line height and weight with real copy |
| Avatars | Five actual shared character avatars; 20px navigation, 24px author, 32px composer, 34px notification samples |
| App (last) | The live Discover prototype (`../codedProtoype/discover.html`) in an iframe, 640px wide (above the prototype's 600px mobile breakpoint, so it keeps the scaled phone casing) and full panel height. Loaded on first visit, then kept alive so its route, scroll and drafts survive tab switches. Its page backdrop is cleared after load and the frame uses `color-scheme: dark`, so the ribbon shows around the phone. Wheel and arrow keys inside the frame drive the app, not the playground; use the sidebar (or scroll/arrows outside the frame) to leave |

Keep text minimal. The user narrates the presentation. Do not add long explanatory panels. Focus on desktop web presentation for now.

## Layout and controls

- At 1024px and wider the playground is two panes with 24px margins and gutter: a full-height glass sidebar on the left (252px, 50% dark glass, 22px blur, top-left rim) holds the view list, and the selected view's content sits within a full-height rounded (28px) outline on the right, with no extra fill over the wallpaper; its rim sits above the content and retains a faint left edge (`body::before`/`::after`; `body` gets 24px 24px 24px 300px padding and is locked to the viewport height; tall views scroll inside `main` within the panel, with 28px fade edges). On desktop the empty header collapses to 0 and the footer (shape toggle + artwork selector) only takes space on Material and Background, so the other views get the panel's full height. At desktop heights up to 900px, Color (24px group gap, 68px swatches) and Typography (12px row padding) tighten so they fit without scrolling. The dropdown trigger is hidden; narrower screens keep the dropdown. The Prism title stage fills the right panel and clips to its corners (the glass crops the matching region of the full-screen ribbon canvas so refraction still lines up). Each view item has an 18px line icon (1.4 stroke, currentColor; 72% opacity, full when selected or hovered): pyramid, stacked layers, framed landscape, square/circle/triangle, droplet, spacing arrows, Aa, person. In both layouts the selected item is neutral glass (12% → 5% white sheen with the 155° top-left rim), not mint.
- Top-left custom dropdown (narrow screens): dark glass (78% `rgb(14 18 17)`) with a 1px pastel rim (mint → lavender → peach conic gradient) and soft matching glow, slowly turning over 8s (static under reduced motion); readable over raw artwork and the plain canvas, with a minimum 252px menu and single-line option labels.
- Material construction steps sit below five equal samples inside `main` (72px gap); Background steps sit below the sample text. Both have no visible description line beneath them (the step description text is hidden). The Container/Pill toggle changes all five samples together. Shape toggle bottom-left; artwork arrows, thumbnail and counter bottom-right.
- Five artwork backgrounds; there is no empty/no-background option on Material or Background. The `1×5` counter is visually hidden (still announced to screen readers); the thumbnail sits centered between the arrows. No visible artwork title. The thumbnail remains sharp; the material preview background uses the shared blurred atmosphere.
- Material and Background use the blurred banner atmosphere and show the artwork selector. Shapes, Iconography, Patterns, Color, Spacing, Typography and Avatars use the animated Ribbon flow shader instead and hide the selector.
- Scroll-connected tabs: scrolling (wheel/trackpad, vertical) past the end of a view's content by 140px of overscroll slides the view up and out (260ms, fading) and slides the next sidebar view in from below (380ms); scrolling up past the top goes to the previous view and lands at its bottom. The sidebar selection follows. A 320ms quiet-wheel cooldown absorbs trackpad momentum so one flick advances one view; a clear jump in wheel delta (momentum only decays) is treated as a fresh swipe and ends the cooldown at once, so repeated flicks keep advancing without pausing. The title view moves its fixed stage directly. Reduced motion switches without the slide. On desktop, wheeling over the sidebar works the same as over the pane (the narrow-screen dropdown menu still ignores it).
- Keyboard: ArrowUp/ArrowDown (and Page Up/Down) scroll the pane's content and, at its edge, move to the previous/next view with the same slide (on desktop this also works while a sidebar item has focus, e.g. right after clicking one, and focus follows the new item; the narrow-screen dropdown keeps its own up/down focus navigation). Sidebar items show no focus ring: keyboard focus uses the same soft hover light. The slide moves the whole right pane — its glass fill and rim (`body::before`/`::after`, animated as pseudo-elements) — together with the content.
- Arrow keys change the background on Material and Background. Menu supports outside dismissal, Escape and up/down navigation.
- The static-view background (`ribbon-bg.js`) renders `../pen dev/ribbon-flow.glsl` unchanged, full screen, with the uniforms from pen.dev node `PbOB3` ("Ribbon flow · Shader background"): speed .22, ribbon width .3, intensity 1.0 (pen node: 1.9), angle 0, motion .42, distortion .55, grain .35, background `#05080A`, mint `#94A39C` (very muted; pen node: `#BDE0CA`). Edit the .glsl in pen dev to change both; update the uniform values in `ribbon-bg.js` if the pen node's values change. The playground raises the shader's breathing width floor from 0.25 to 0.85 (`minWidth` in `ribbon-bg.js`, patched into the loaded source) so the ribbon never thins much; the .glsl file itself is unchanged. It only animates while a static view is visible; one still frame under reduced motion.

## Material construction

Current sequence: **Fill → Tint → Wash & blur → Edge → Feedback**. Wash and blur were combined at the user's request.

1. Fill: all samples begin with 4% white fill.
2. Tint: Neutral mint uses `rgb(178 219 194 / 4%)`; Dense neutral uses `rgb(43 49 47 / 76%)`; Highlight mint uses `rgb(178 219 194 / 14%)`; Medium mint uses `rgb(120 169 138 / 10%)`; Strong mint uses `rgb(128 213 169 / 25%)`. These are alternative fills, not stacked opacity percentages; the washes and edges also affect perceived strength.
3. Wash & blur: each variation has a directional wash and 18px backdrop blur, except Medium mint, which adds a localized upper-left reflection, 20px blur and 1.12 saturation. Dense neutral keeps a near-white wash with no mint tint; Strong mint uses 1.25 saturation.
4. Edge: masked 1px directional rim; Dense neutral uses a brighter neutral rim; Medium mint has a brighter rim and shallow inset depth, while Strong mint adds a stronger mint rim and subtle shadows.
5. Feedback: pressing compresses the sample to .97 scale and reveals a soft upper-surface highlight; release restores it.

**Fresh loads enable all material steps. Fill cannot be disabled.** Selecting a step enables its predecessors. Clicking the selected step again returns to Fill only; clicking Fill again leaves Fill on. Only the endpoint has `aria-pressed=true`; all completed labels are equally bright.

Dense neutral is the reusable treatment currently used by the New Post “Choose a group” control. It is a separate neutral surface, not another level of mint intensity. Its fill, wash, rim and blur in `material.css` match the app recipe in `create-post.css`; the sample stays role-agnostic.

Medium mint is used by the empty New Post “Choose a title” control and the “Show notification history” action in the unread-notifications overlay. Both share the same fill, upper-left reflection, rim, blur and inset depth in the app.

Blur softens content behind the material, not the wash. It is barely visible over an already blurred wallpaper and invisible over a uniform base. Do not add a blur slider: four samples use 18px while Medium mint uses 20px. The app itself has multiple surface blur values; this is not a claim of global uniformity.

## Connected construction controls

Step containers use div backgrounds and rectangular bridges filtered together by an SVG blur/alpha-threshold filter. Labels and accessible buttons sit above the filtered layer, remaining crisp. Inspired by the user's [metaball reference](https://blobs.webflow.io/).

- Glass look: the same `#step-goo` filter merges the shapes, then renders them at 40% alpha with a directional highlight: SVG specular lighting from the top-left (azimuth 225°, elevation 35°) on the blurred merged alpha, so only light-facing edges catch a rim. Neutral vertical sheens: inactive `#434846 → #303433`, active `#848a87 → #666b68`. The Container/Pill toggle, artwork arrows and thumbnail frame share a matching CSS glass (8%→3% white sheen, 18px backdrop blur and a 1px masked 155° gradient rim, bright top-left fading to near-zero, as in `material.css`); the top-left dropdown keeps its own style. No mint on these controls.
- 15px container radius, 7px bridge height, 24px desktop gap (smaller responsive gaps).
- Press feedback: pressing a step squashes its pill and label to .92; release plays an elastic overshoot (1.06 → .985 → 1.012 → 1, 620ms). Keyboard activation plays the bounce. Connecting bridges stretch in with overshoot and a brief thickness swell (scaleY up to 1.9), staggered 45ms, which the goo filter turns into a blobby join. Disabled under reduced motion.
- Hover light: hovering (or keyboard-focusing) a step sweeps a soft 50%-white band across that pill (620ms), then outward across its left and right bridges (120ms / 260ms later, the left one travelling leftward). Bridges only show it when connected; unconnected pills still get their own sweep. The light is inside the goo layer, so it follows the merged shape. Disabled under reduced motion.
- Bridges animate only between completed steps. The remaining steps are separate. An earlier half-filled outgoing bridge experiment is superseded.
- Background construction always has a step selected: fresh load starts with all five steps active (Contrast), and clicking the selected step again returns to Artwork (like Material's permanent Fill).
- ResizeObserver measures the div shapes; MutationObserver updates cumulative colors/connections. Restrict stage queries to `button[data-material-step]` and `button[data-step]`: the preview container also carries a stage attribute.

## Background construction

The final atmosphere uses the prototype's shared `PocketSagaMedia` palette and image treatment: 28px poster-texture blur, .45 saturation, .72 brightness, .22 texture opacity over the extracted palette; the combined layer has .58 opacity over off-black. Bright artwork receives profile-based additional darkening. Early stages deliberately reveal the raw artwork and intermediate treatments; Material always uses the finished atmosphere.

The Palette step draws two subdued radial gradients from the artwork's sampled colors over a dark base; it does not add a fixed mint tint. Command-click Palette to isolate this gradient, hiding the poster texture and reading sample. Command-click it again to restore the normal Palette step. A normal click retains the usual cumulative-step behavior, and the artwork arrows can compare isolated gradients across posters.

Artwork-derived colors are contextual, not extra brand tokens. Like `#E4B1B3` and like-surface `#432E32` are secondary notification badge colors: three seeded like notifications, one initially unread. They are not the general post-heart palette.

## Geometry and typography

Spacing labels are proposed semantic ranges, not proof of universal application: inline 4–8, Discover title/body 6, related items 12–16, insets 16–24, sections 24–32px. Optical exceptions remain.

Radius anchors: composer 14, group inset 16, standard card 20, hero/thread 24, Discover post 28px; full rounding for pills and 50% for circles. Inner radii relate optically to outer radius and inset; there is no universal subtraction rule.

The Shapes view separates content rounded rectangles from clickable rounded rectangles. The latter uses the New Post “Choose a title” selection surface as its example: an 18px radius, medium-mint material and button semantics. Its interactive role comes from behavior and content, not from pill geometry; pills remain the compact action/selection shape.

At wide desktop widths (1400px and above), the four Shapes columns spread into a 1120px maximum layout with a 36–48px horizontal gap. Narrower panels keep the 24px gap and existing responsive column changes.

All clickable Shapes samples use the app's `.tap-feedback` press scale of .985 over 85ms, alongside their material's held-press light; reduced-motion users get no scale. The Pills examples show the real Join group and Joined membership states. Discover's For you tab is an actual button, but its travelling selection highlight deliberately suppresses the tab's scale, so it is not represented as a generic pill action here.

The Circles sample shows the Add control, the New Post action with its shared Discover icon, and one avatar rendered by the same `PocketSagaAvatars.render` function as the app. The composer sample also uses the shared viewer portrait instead of a letter placeholder. The Avatars view shows all five people.

Newsreader 500: post 30/35.4, hero 28/30.8, feed 22/28, screen 20/24. Manrope: reading 15/24, UI/activity 14/21.7, feed body 13/22, metadata 12/18; section labels 12px semibold with 1px tracking. The number after `/` is line height in pixels.

## Files and maintenance

- `index.html`: views, controls, SVG goo filter.
- `material.css`: local material recipes adapted from app surfaces; not automatically synchronized with app CSS.
- `playground.css`: layouts, samples, construction overrides and connected-step visuals.
- `playground.js`: navigation, construction state, wallpapers, shared avatar rendering and bridge geometry.
- `catalog-paths.js`: resolves shared media artwork paths for this directory.
- `ribbon-bg.js`: Ribbon flow shader background for the static views.
- `prism-title.js`: title view setup.
- `glass-icon.js` + `glass-icon.html`: standalone plain-JS port of Originkit's Liquid Glass Cluster (ray-marched 3D glass X/torus/sphere/extruded logo refracting a backdrop, with dispersion, frost, tint, Fresnel studio reflections, spin, pointer tilt and drag). `PocketSagaGlassIcon.create(host, options)` returns `{update, destroy}`; options mirror the React props. The demo shows a torus over Interstellar artwork. Used by the Prism title view; adds a `Pyramid` shape, `spinPitch`, `rotateAxis: 'yaw'`, `inertia`, `backdrop.textGradient` and `backdrop.paintText` to the original.
- Shared dependencies: app-data.js, media-treatment.js and avatars.js in the prototype.

Previous edit scripts accidentally overwrote playground.css with JavaScript. Use distinct file/content variables or targeted patches; inspect the stylesheet and run a browser check after multi-file edits. JavaScript syntax checks alone do not detect a corrupted stylesheet.

## Open findings

The mint washes still have a diagonal brightness trough: the 155-degree gradient fades down and brightens again toward the bottom. The user noticed a dark diagonal band. A one-way fade was discussed but **has not been implemented or approved as a change**. Preserve that distinction in future work.

The playground contains locally copied recipes and proposed semantic groupings. Do not describe it as a fully enforced app-wide design system. Verify consequential visual changes in the browser, including construction selection, toggling, reset and layout.

- Navigation order update: Iconography follows Avatars, immediately before App. Sidebar, narrow-screen menu and scroll-connected view order share the menu DOM order.
