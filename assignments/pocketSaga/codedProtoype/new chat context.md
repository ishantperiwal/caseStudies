# PocketSaga coded prototypes — new chat context

Read this first, then inspect the implementation. This records current behavior and user preferences; later user instructions take precedence. Keep it updated when screens, shared patterns, or navigation change.

## Start here — required references

The [PocketSaga documentation hub](../README.md) defines the reading order and source-of-truth boundaries. Before creating or restyling UI, read the [Prism design-system technical reference](../design%20system/README.md) and reuse the closest implementation documented in the [prototype component reference](components/README.md). The visual/product rationale lives in [design.emry.md](design.emry.md); isolated unfinished work lives in [component-explorations.md](component-explorations.md).

Design-system use is the default, including during fast iteration. Name the intended material before styling a new control; material and geometry are separate decisions. Do not invent a one-off fill, border or shadow when an existing material role fits.

### Minimum design-system context

| Material name | Use it for | Current implementation examples |
| --- | --- | --- |
| **Neutral mint** | Quiet supporting surfaces and low-emphasis actions | Supporting surfaces; Hide spoiler |
| **Dense neutral** | Destination/selection controls needing clear separation without active mint emphasis | Choose a group; Post type |
| **Highlight mint** | Persistent selected or joined state | Undocked active filter; selected picker option |
| **Medium mint** | Inviting choose/reveal/continue actions | Choose a title; Show notification history; View potential spoiler |
| **Strong mint** | Primary action or strongest active destination | Join group; Write; Play; bottom-navigation and docked-filter selection |

The material name includes fill, wash, directional rim, blur, saturation and feedback—not just a color. Exact recipes live in [`design system/material.css`](../design%20system/material.css); app mappings live primarily in [`components/surfaces.css`](components/surfaces.css), with Dense neutral in [`components/create-post.css`](components/create-post.css). Prism's recipes are reference specimens and are not automatically synchronized with the app, so prefer an existing app selector when one exists.

Use Newsreader for editorial headings and Manrope for UI/body. Start from the 4/6/8/12/16/20/24/32 spacing scale and the documented radius anchors: 14 composer, 16 group inset, 18 clickable selection, 20 standard card, 24 hero/thread, 28 Discover post, fully rounded pills and 50% circles. All tappable elements use whole-container `.tap-feedback` (`.985` press over `85ms`) unless a documented moving-selection pattern owns the feedback. Preserve keyboard behavior and reduced-motion handling.


## Latest handoff — Prism design-system playground (23 September 2026)

Recent work is in `../design system/` (named **Prism**), separate from the prototype screens. It is a desktop presentation aid the user narrates, not an app-wide token migration. Read [its README](../design%20system/README.md) before editing: it holds every current value (colors, timings, sizes). This section is the overview of what the playground is, how it got here, and what not to repeat. Open `http://127.0.0.1:5500/assignments/pocketSaga/design%20system/index.html` (VS Code Live Server; its injected reload script may log a harmless console error).

### What it is now

- **Layout (≥1024px):** two panes with 24px margins/gutter. Left: full-height glass sidebar (236px) listing the views, each with an 18px line icon; selected item is neutral glass (no mint — the user disliked the green highlight). Right: a matching full-height rounded (28px) glass panel (`body::before/::after`) showing the selected view. Narrow screens fall back to the top-left dropdown. No Reset button (removed at the user's request; reload restores defaults).
- **Views, in order:** Prism (title, default) → Material → Background → Shapes → Patterns → Color → Spacing & roundness → Font & typography → Avatars → Iconography → App.
- **Patterns (25 September 2026):** Progressive blur (phone viewport using app geometry; steps Content → Blur → Progressive → Fade → Scrim; content fades out behind the app bar as on Discover/Post) on the left; Changed value and Like & save (calls the app’s real `animateLike`/`animateSave`, so feedback appears where you tap) stacked on the right. The user considers progressive blur a pattern, not a separate view.
- **Scroll-connected tabs:** wheel/trackpad past the end of a view's content (140px overscroll), or ArrowUp/Down/PageUp/PageDown at an edge, slides the whole right pane (fill, rim and content) up and out and the next view in from below; the sidebar selection follows. A short cooldown absorbs trackpad momentum. Clicking the sidebar still switches instantly.
- **Prism title:** `prism-title.js` + `glass-icon.js`. A ray-marched glass pyramid (port of Originkit's "Liquid Glass Cluster" React component, extended with a Pyramid shape, yaw-only drag with inertia, `backdrop.under` and `backdrop.paintText`) refracts "PRISM" (Manrope 500 capitals, strong-mint fill, soft top glow, top-edge highlight) and "DESIGN SYSTEM" (tracked so its letter ink spans exactly P→M). The live ribbon shader is composited under the text each frame so the glass refracts the moving background. Whole composition scaled by `SCALE = .85`.
- **Backgrounds:** Material and Background use the blurred banner atmosphere with the artwork selector (5 artworks, no empty option). All other views use the Ribbon flow shader (`ribbon-bg.js`, loading `../pen dev/ribbon-flow.glsl` unchanged; muted mint `#94A39C`, intensity 1.0, breathing width floor .85).
- **Material:** Fill → Tint → Wash & blur → Edge → Feedback; all on at load; Fill cannot switch off. **Background:** Artwork → Blur → Mute → Palette → Contrast; loads with all five on; never fully off. Both step rows sit 72px below their content (not in the footer), with no description line.
- **Step controls:** goo-merged glass pills (SVG blur/threshold + specular top-left rim). Elastic press (squash .92 → overshoot → settle), bridges stretch in with overshoot and a thickness swell, and a hover light sweeps the pill then travels outward across connected bridges.
- **Shared control glass:** Container/Pill toggle, artwork arrows and thumbnail frame use one CSS glass with a 155° top-left-bright rim (the user objected to uniform all-round borders).

### What was tried and rejected (don't reintroduce)

- Backdrops for the static views, in order: soft CSS blobs (too minty, then "not interesting"), SVG tapered ribbon waves ("ugly, not subtle"), a warped conic gradient via SVG `feDisplacementMap` plus grain (pixelated/dithered — avoid displacement filters and grain overlays on large layers), six varied blobs ("looks bad"), a mint liquid-glass panel behind content (misread request). The pen.dev Ribbon flow shader was the one kept.
- Pasting the user's light pastel `.gradient-fluid` CSS verbatim as a backdrop was declined mid-way; don't add it.
- Lavender dropdown glass (replaced by the dark glass with a turning pastel rim, kept for narrow screens).
- PRISM text: pastel left→right gradient; Newsreader serif; title case "Prism"; a stroked outline edge (showed the font's overlapping contours as boxes — edges are now cut by subtracting a shifted copy); top-left highlight (now top-down); heavy glow (now 7%/14%); a transparent plate that made the pyramid milky grey (fixed by compositing the ribbon under the text).
- Uniform ring borders on glass controls; description text under the steps; the visible `1×5` counter; R24/R14 radius labels on the Shapes card; the Reset button.

### User preferences

Minimal text; muted, subtle mint (they repeatedly asked to mute further); glass with directional top-left or top-down light rather than all-round rims; elastic, tactile feedback; verify in the browser before reporting. When a request is ambiguous (which element, which file), ask rather than guess — misreading a pen.dev selection caused real frustration.

### pen.dev

`pen dev/pocket saga designs.pen` via the pencil MCP (needs a file open in pen.dev; `get_app_state` shows the selection). Node `PbOB3` "Ribbon flow · Shader background" runs `pen dev/ribbon-flow.glsl`; node `I7q4g` ("+ My List" button) runs `liquid-glass.glsl` and was left at its original dark tint.

### Maintenance notes

- Earlier Python edit scripts overwrote CSS with JS; use targeted, asserted replacements and check the stylesheet and browser, not just `node --check`.
- A user revert restored `index.html`/`playground.js` but left CSS from a reverted one-page layout (`.page-section`, `.prism-hero`, `.prism-doc`, `.pd-*`) in `playground.css`. Its `main{display:block}` was removed because it collapsed the step spacing; the rest is unused except `body[data-view=title]::before{background:none}`.
- Live Server/Chrome caches scripts aggressively: after edits, `fetch(file, {cache:'reload'})` then reload when verifying.
- Stage selectors must target buttons (`button[data-material-step]`, `button[data-step]`) because the specimen container also carries a stage attribute.
- Open finding still unresolved: the mint washes' 155° gradient dips mid-way (diagonal dark band); a one-way fade was only discussed.

## Project and entry points

Workspace: `assignments/pocketSaga/codedProtoype/` (existing spelling intentional).

Plain HTML, CSS and classic deferred JavaScript; no framework, bundler or build step. GSAP and CustomEase are vendored. Google Fonts loads Newsreader and Manrope with local fallbacks. Keep runnable HTML screens at the top level and supporting code/assets in `components/`. This requested context document is a top-level documentation exception.

- `discover.html`: hero carousel, For you / Your posts / Your groups, group post cards and bottom navigation.
- `community.html`: Beyond Earth group, membership, posts and composer. The legacy filename remains, but visible product copy says “group.”
- `post.html`: sample Dark post, comments, sticky composer and comment focus mode.
- `home.html`: Home tab (streaming home, recreated from pen.dev frame `uV1Qn` in the PocketSaga design language): For Ishant header with Cast/Search, All / TV shows / Movies filter pills (they filter every shelf; Categories is a placeholder), featured Interstellar hero with mint Play and glass My List, Continue watching (Dark S1 E4, Silicon Valley S2 E1) with the "Finished Dark episode 3?" row that opens the Dark group route in place, Recently watched (the same watch history as the Discover carousel, with its labels) and Your next movie night (Inception, The Prestige, Whiplash). Content comes from `home` in `app-data.js` via `PocketSagaData.home()`. Home and Community share one phone via `components/tabs.js`, used by both `home.html` and `discover.html`: one bottom navigation with a travelling mint selector (`selectionHighlight`). The outgoing panel stays above, blurs/fades and slides 40px over 260ms; the incoming panel is fully rendered beneath it, slides from 56px to zero over 420ms starting at 60ms, and sharpens through a separate 8px backdrop-blur overlay that fades over the same interval. Keeping opacity/filter off the incoming panel preserves its descendant glass compositing. The URL is swapped with replaceState so a reload keeps the tab; routes (post, group, editor) still open over the shell through `navigation.js`. Playback, My List, Cast, Search, Categories and poster taps show "connected later" toasts. Not part of the presented assignment; it exists so the Home → Community switch is possible.
- `create-post.html`: reusable new-post editor. Default has no media selected; `?media=interstellar` (also dark, whiplash, prestige) preselects media.

Navigation resolves selected posts and communities by ID through the shared data store. Standalone post/community pages accept `?post=<id>` and `?community=<id>`. There is no backend or durable persistence.

## File map

All paths below are inside `components/`.

| Files | Responsibility |
| --- | --- |
| `components.js`, `community.css`, `icons.js` | Shared PocketSaga DOM components, device, community screen, base typography/layout and icons. |
| `surfaces.css` | Shared glass fill, edge, selection and post-card press treatments. |
| `motion.js` | Scroll header, moving tab selection, sticky tabs and bottom-navigation visibility. |
| `app-data.js`, `data-store.js` | Single content catalog, relationships, screen adapters and session mutations. |
| `media-treatment.js` | Cached Canvas analysis and shared bright/not-bright treatments. |
| `page-data.js`, `preview.js` | Community data adapter and mounting/navigation hookup. |
| `discover.js`, `discover.css`, `discover-data.js`, `discover-icons.js`, `discover-preview.js` | Discover screen, data and entry point. |
| `home.js`, `home.css`, `home-data.js`, `home-preview.js` | Home tab screen, data adapter and entry point. Reuses Discover's filter pills and `BottomNavigation(emit, viewer, selected)`. |
| `tabs.js` | Main tab shell hosting the Home and Community/Discover panels with one shared bottom navigation and the directional tab transition. |
| `card-deck.js`, `card-deck.css` | Reusable looping hero carousel. |
| `post.js`, `post.css`, `post-data.js`, `post-preview.js` | Full post, comments, pagination and entry point. |
| `reply-thread.js`, `reply-thread.css` | Expanding comment focus mode and reply composer. |
| `create-post.js`, `create-post.css`, `create-post-data.js`, `create-post-icons.js`, `create-post-preview.js` | New-post screen, media/community pickers, sample data and entry point. |
| `navigation.js`, `navigation.css` | In-phone route stack, history, cached views, screen transitions. |
| `vendor/gsap.min.js`, `vendor/CustomEase.min.js` | Local animation dependencies; preserve licenses. |
| `assets/` | Interstellar, Dark, Whiplash and Prestige artwork. |

Use existing HTML script order as the dependency reference. Asset paths resolve relative to the HTML, not to their data scripts. `components/README.md` documents data setup, component APIs and automatic media treatment. All entry scripts await `PocketSagaMedia.ready` before mounting.

## Shared implementation rules

`window.PocketSaga` exports device/page/card primitives, including `PhoneFrame`, `ProgressiveBlur`, `PostCard`, `Composer`, `MessageComposer`, `SeparatedMeta`, `Action`, `Avatar`, `Artwork` and `Icon`. `mountPage` handles uniform preview scaling and previous-mount cleanup. Dedicated screens compose these primitives.

Retain `.flat(Infinity)` in the DOM helper: shallow flattening previously displayed `[object HTMLSpanElement]`. User text uses text nodes; innerHTML is only for trusted local SVG paths.

Shared post-card titles use 22px Newsreader with a 28px line height. `.post-body`, `.community-description` and `.thread-reply-body` use 22px line height (previously 20px). This does not change input or metadata line heights. Full-post body remains 15px/1.6; comment body remains 14px/1.55.

Visible product terminology is **group/groups** everywhere. “Community” remains only in legacy filenames, CSS classes, data fields and route/event keys; do not expose it in labels, headings, accessibility copy, page titles or empty states.

Full-post spacing: author attribution to title is 24px; title to body is 10px. The `.post-detail` stack keeps its 20px gap, with targeted +4px title and -10px body margins. Other stack gaps remain unchanged.

Metadata dot separators must be separate entities with equal spacing before/after. Reuse `SeparatedMeta` rather than embedding spaced dots in text. Keep sample content separate from layout. Preserve unrelated workspace edits.

## Accepted visual direction

Dark translucent glass with subtle light from the top, muted mint accents, Newsreader headings and Manrope UI/body. Avoid flat opaque pills, bright borders and noisy glows.

- Device: natural outer width 438px; screen aspect ratio 412:896. Uniformly scale the entire phone to fit; never compress height alone.
- General screen horizontal padding: 16px. Scrolling content uses `.feed-scroll`; status and home indicators stay fixed.
- Circular app-bar actions: 44px touch targets, faint translucent fill and blur. Bottom-sheet close buttons have a smaller visible circle with a generous target.
- Selected filter tabs: subtle mint-tinted glass, light icon/text, weight 500. Selected bottom navigation uses the stronger mint-glass treatment shared with the Write and Join community CTAs. Unselected filter tabs have a faint flat pill; unselected bottom-nav items do not have individual containers.
- No system outline focus rings. Keep keyboard activation, labels, focus restoration and reduced-motion support.
- Tap feedback stays active during the press. Soft corner light plus a top-to-bottom fill highlight, restrained scale .985; release smoothly. Strong glow borders and larger scale reductions were rejected.
- Screen/focus transitions use cubic-bezier(.6,0,.25,1). Create-post and full-post navigation use the shared rounded activity entrance with a 400ms duration.
- Shared post cards now highlight and scale to .985 while held. Cancel on pointer movement over 8px, pointer cancellation/leave/release. Nested controls act independently.

### Discover post cards — current tuning

“Your posts” includes four sample posts from `discoverPageData.yourPosts`, authored by the viewer, with new local publications prepended. “Your groups” currently has two joined groups: Beyond Earth and Pied Piper Garage. The remaining five are shown below the Recommended groups heading. Membership is shared across the app, so joined groups do not show Join banners in For you and the create-post group selector shows the same joined set.

Outer radius 28px. Padding is now 20px top/sides and 10px bottom; cards without the community banner have 24px top padding. Community/context line has extra space below it. Author row sits below the excerpt on Discover (above the headline in community cards).

Show the inset community banner only for communities not joined; always retain the compact linked community/context line. Joining removes matching banners. Community artwork is larger than the early compact version; Join uses the shared group/users icon.

Each card has blurred media artwork, controlled darkness, and a faint light wash stronger at the top and weaker at the bottom. Brightness comes from the shared automatic two-state profile described below; there are no per-community or per-filename overrides.

Discover-only `::after` border is 1.4px. Bottom-right radial highlight peaks at 5% white, fading through weaker stops; fill unchanged. It lives in `surfaces.css` but is scoped to `.discover-post`. Earlier changes appeared ineffective because the shared `:is()` selector had excessive specificity from comment exclusions; those exclusions now use `:where()` so this override applies. Do not reintroduce that specificity bug.

Filter pills have 6px extra margin below their anchor, on top of the scroll layout gap.

## Community cards, header and primary actions

Your groups shows a plain trailing users icon, online count and right chevron: `128 online` for Beyond Earth, `46 online` for After the Last Note, `83 online` for The Final Reveal. Counts come from `activeMemberCount` in the shared catalog; these are sample values, not live presence. Do not restore Joined/new-post labels or a pill container around this text. The whole row opens the community. Its fill is a single uniform 3% white layer; nested gradients and duplicate inner borders were removed to reduce banding.

Community header order: group name, then media title/type/year or season/episode. Do not repeat member totals beneath the name. The action row has Join community/Joined, a separate users-icon + total-count + right-chevron button, and circular options. The member button emits `members`; a member-list screen is not yet implemented.

On Discover, Notifications comes before Write, so Write is the rightmost top action. Write (`.discover-write`), the unjoined community CTA (`.membership-join`) and selected bottom-navigation item share the final rule in `surfaces.css`: translucent mint fill `rgb(128 213 169 / 25%)`, light text, soft gradient, bright glass edge and 18px backdrop blur with 1.25 saturation. Keep these treatments centralized. Flat solid mint was rejected, as was the earlier more saturated green treatment. Joined and member-count controls retain the quieter style.

## Scrolling and blur

Discover now uses a shrinking hero intro: the carousel is natively sticky within the padded scroll area, scales from 1 to .6 about its top center and fades out as the feed moves up. Type B's two side cards receive an additional scroll-linked horizontal offset so their visible centers move outward instead of being pulled toward the middle by the parent scale; the active card stays centered and horizontal swipes still interpolate smoothly. There is no JavaScript vertical counter-translation. The greeting and top-right utilities fade with the exact same scroll progress and restore together on reverse scroll; tab docking does not independently animate their opacity. `PocketSagaMotion.collapseCarousel` measures the tabs’ docking distance, then snaps to feed-only after 35% progress on release/160ms scroll idle, or restores the intro below that threshold. Snap duration is 400ms; new input interrupts it and re-arms settling even if the final wheel/keyboard event produces no scroll. `scrollend` also schedules settling. This prevents trackpad momentum tails from cancelling the snap and stranding the intro halfway; `/private/tmp/pocketsaga-thread-check/scroll-snap.mjs` covers that regression and both endpoints. Touch contact blocks snapping until release, including native pointer cancellation. Scrolling beyond the intro remains natural. Short feeds reserve enough height to reach the docked state; hidden/inert routes do not snap. Reduced motion bypasses scale and animated snapping. Community scrolling remains natural. Content dissipates smoothly behind app bars, not through hard clipping or opaque strips.

Community: back stays fixed; compact community name appears after the large name passes; Posts heading scrolls away; circular filter appears in top-right once its toolbar passes. Reverse scrolling reverses these states independently.

Base top blur: top 12px, height 135px, ending at 147px. Feed mask is transparent through 88px and becomes fully visible at 147px through eased stops. Keep standard/WebKit masks aligned. Preserve blur softness when merely shifting its position.

Discover filters use two permanent rows: one in the normal layout and an identical fixed row in the heading slot. At the shared header position (slot top + 6px), dockTabs hides/inerts the layout row and reveals the fixed row; it reverses on upward scroll. The layout row always retains its space. No reparenting or translated floating row. Both rows share selection state and pill-click snapping; keyboard focus transfers to the corresponding button at handoff. The feed mask and top blur activate only when docked, keeping approaching layout pills crisp. The snap endpoint matches the handoff exactly. Bottom navigation hides scrolling down and returns scrolling up, with jitter thresholds. Content remains visible but blurred through the bottom/home region.

Discover top ambient artwork fades with scroll, followed by an off-black/dark-gray base. Mint background was rejected. The atmosphere remains darkened for readability, with a subtle color lift: shared page artwork uses saturate(1.1), Discover/community brightness is .72, and Create post brightness is .59. Discover post artwork uses saturate(.9) instead of the earlier .75; use the shared bright/not-bright profile for card brightness and veil strength.

## Hero carousel

Watch timing is a separate top-right glass tag (`watchedLabel` in history data, sample labels: Interstellar “Recently watched”, Whiplash “Watched yesterday”, The Prestige “Watched in 2023”, Dark “Watched last month”). Bottom subtitles describe the media: “Movie · 2014” / “Movie · 2006”, or season/episode (Dark: “Season 1 · Episode 3”). The tag fades with the active card’s copy during swipes.

The active card has a decorative artwork reflection beneath it, mirrored onto a shallow perspective plane that widens toward the viewer. It uses 7px blur, a fading mask and 28% peak opacity, and follows card movement while blending between outgoing/incoming cards. The reflection is a separate non-interactive, aria-hidden layer so it does not affect composer backdrop sampling. The reflection has a faint white gradient wash (20% at its top, composited within the 28% reflection opacity) to retain glow with dark posters. Its 56px plane is tilted 65 degrees, starting 4px below the card, for a flatter projection. Carousel height is 348px to reserve compact reflection space above the filters.

Hero title-to-subtitle gap is 4px; subtitle-to-composer spacing remains 14px. During carousel movement, fade the individual title, subtitle and composer elements, never the `.watch-card-copy` wrapper. A translucent wrapper creates a backdrop root that blocks the composer from sampling the artwork, causing its blur to suddenly intensify when the animation settles.

Horizontal movement only. Scaled cards behind the active card are accepted; vertical offsets are not. Previous card peeks from the left at full opacity; its parked x is `-w + 8`, leaving a 16px gap before the active card at x=24. Reverse swipe brings it above the outgoing card. Release includes a small directional elastic continuation before settling. Swipes retain vertical page scrolling.

Ambient artwork crossfades during swipe progress, not only after settling. Bottom artwork blur overscans to avoid an unblurred hairline. Keep the directional right-edge shadow subtle and avoid heavy bottom black overlays.

**The entire active hero card is now tappable** and opens New post with that media selected. The thoughts box does the same. Touch/pointer swipes, horizontal wheel/trackpad gestures and Left/Right arrow keys navigate the carousel; Enter/Space on the active card opens the editor. A swipe or horizontal scroll must not trigger compose.

## New-post screen and navigation transition

New post uses `#0e0f10` as its default off-black background, matching Discover’s scrolled base, including when no media is selected.

Hero entry preselects that media; top create button opens an unselected editor with the restored “Choose a title” / “Search movies and series” card. There is no inline search or suggestion rail. Clicking the card opens the floating media-search overlay. Its media suggestions wrap at natural content widths, centered per row, with 14px vertical / 16px horizontal padding, 16px gaps, 34×46px artwork and 6px extra after the text; blank search shows watched media (plus the current selection), and typing searches the full local catalog. No watched-time labels or section heading appear on these cards. Subtext is `Movie`, `S1 · E3`, or `Season 3`, derived from mediaType/season/episode fields in the catalog. The group picker retains full-width rows and lists only groups whose shared `joined` state is true. Selected media has a trailing change-icon action that reopens the title picker with the current title selected; the banner itself also opens the picker. There is no inline clear action, close button, or remove-selected footer in the sheet. Use the same reusable `PocketSagaCreatePost.CreatePostPage` for both. Title/group pickers preserve draft text; changing media may clear an incompatible group selection. Post requires media, group and a nonempty headline. Publishing through Discover adds a local preview post; standalone editor only provides a local confirmation. The editor toolbar contains Clip (clapperboard icon) followed by Scene (still-image frame icon). Attach was renamed Scene; Poll was removed. Clip/Scene are affordances for a later pass, not implemented enrichment features.

Editor: 16px gap between the writing surface and the fixed group/Post action row (scroll bottom padding 100px, footer bottom 32px + button height 52px). 24px top and 20px side/bottom internal padding; Newsreader headline 28px, weight 400, 32px line height. Starts one line and grows up to 160px. A subtle 1px `#ffffff12` separator sits between headline and body, with 14px gaps above and below. The former two-line minimum and missing separator were corrected.

Create-post and full-post entry use the centrally defined `activity` transition in `navigation.js` (`PocketSagaNavigation.transitions.activity`; route assignments in `routeTransitions`) over 400ms with cubic-bezier(.6,0,.25,1). The entire incoming screen enters from the right at 88% scale with 48px corners, growing to fill the phone. The previous screen scales down around its center to 92%, gains 40px corners, dims to 80% opacity, and subtly blurs to 5px. The returning screen animates back to zero blur as it expands, with the temporary filter cleared on completion. Back reverses the transition over the full 400ms. Always spread the shared foreground/backdrop settings when passing them to GSAP: `gsap.set` mutates its vars with `duration: 0`, which otherwise makes subsequent Back tweens close instantly. A temporary `activity-back.mjs` regression check verifies the outgoing post and returning backdrop at mid-animation. The outer phone, status bar and home indicator stay fixed. Cached backdrop geometry is retained for Back; the restored active screen returns to full scale and clears temporary radius/origin styling. This applies to both hero and toolbar editor entry, and full post entry from cards/comments on Discover or community screens, including locally published cards. Publishing replaces the editor with the created post using this transition; Back returns to the originating screen. Hero entry still preselects the tapped media and restores focus to the hero on Back. The earlier seamless image morph remains removed.

Community routes also use the shared activity transition. Discover community banners have independent held-press highlighting and .985 scale with 8px movement cancellation; parent post cards ignore nested links, and Join remains independent. `navigation.js` keeps the outer phone/status/home fixed, caches screens to preserve scroll/drafts, integrates browser Back/Forward, restores focus, and cleans up on unmount. Each new create entry gets a fresh route token; cached history entries retain their draft. Do not replace the entire device during navigation.

## Post comments and focus mode

The “Translated from Spanish · See original” notice is hidden in `CommentCard`. Translation metadata remains in the catalog for future use.

Comments paginate without a Load more button. Entire comment opens focus mode, including comments with no replies. Use the same MessageComposer for main comments and focused replies; main composer sticks to the bottom.

Expand/collapse animates container geometry separately from text; text blur/fades rather than scaling with the surface. Expanded surface is slightly more opaque, with subtle borders. Empty threads have dynamic height and centered “No replies yet.” Bottom sheets have no visible close buttons. Dismiss pickers via scrim tap or Escape; reply sheets also retain drag-down dismissal. Keyboard-opened reply sheets focus the drag handle. Keep header spacing restrained. Bottom-sheet heading text has a subtle 4px left inset for optical balance (`.create-picker-header h2` and `.thread-heading`); body alignment remains unchanged.

Dragging the handle down moves the **top edge downward while the bottom stays fixed**, shrinking height; release past threshold dismisses, otherwise restores. Background blur releases during the later part of dismissal, not immediately. Preserve Escape, focus restoration, scroll restoration and local reply counts.

## Design source

Use pen.dev MCP for `assignments/pocketSaga/pen dev/pocket saga designs.pen`; never read encrypted .pen contents from the filesystem. Recheck live state/selection before relying on IDs.

Known frames: `Czra1` selected-media create post, `McTEg` unselected-media create post, `vfozf` full Dark post, `VJKxI` reply focus, `m6MegG` older Beyond Earth community reference. HTML has evolved through user feedback and need not exactly match every canvas detail.

## Verification and remaining work

Run syntax checks for changed JavaScript and verify relative asset/import paths after moving files. Temporary HappyDOM checks using actual vendored GSAP live in `/private/tmp/pocketsaga-thread-check/`: `check.mjs`, `discover.mjs`, `navigation.mjs`, `create-post.mjs`. They cover interaction/navigation lifecycles, carousel, focus mode, drafts, pickers and local publication. Temporary files may not persist and older checks may assume outdated labels/script lists. Current committed checks are `tests/data-store.test.cjs` and `tests/media-treatment.test.cjs`: run `node --test tests/*.test.cjs` from the prototype root. There is no committed full browser test suite.

The current Chrome preview at `http://127.0.0.1:5500/assignments/pocketSaga/codedProtoype/discover.html` is accessible through cua_repl. Use that supported browser surface for visual checks; do not claim mocked DOM checks are visual verification. Old temporary morph diagnostics in `/private/tmp/pocketsaga-thread-check/` describe the removed experiment and should not be used as checks for current navigation.

Route content is now connected through the shared catalog and store described below. Backend persistence, real enrichment tools and several secondary actions remain outside this prototype pass.


## Shared data layer

`components/app-data.js` is the single JSON-compatible content catalog: people, viewer ID, media/artwork, watch history, communities, posts and per-post comments/replies. The JavaScript assignment loads the catalog without fetch and can be extracted as JSON. Screen mounting subsequently waits for asynchronous media analysis, which can fall back when file:// pixel reads are blocked. `data-store.js` resolves relationships and exposes `discover()`, `post(id)`, `community(id)`, `editor()`, `publish()`, `addComment()` and `setLike()`. Existing *-data.js files are thin screen adapters. No content should be duplicated in those adapters.

Navigation tokens include record IDs (`post:ishant-whiplash`, `community:note`). Standalone examples: `post.html?post=ishant-whiplash`, `community.html?community=note`. Unknown standalone IDs use defaults; stale route stacks stop at the last valid ancestor. Each community filters posts by its ID. Your posts filters by viewer ID. Comments belong only to their post, with counts matching the seeded top-level comments.

Publishing registers the record in the in-memory store, adds it to Discover, and opens the new post. Main comments and focused replies remain with that post during the session. Retained feed reaction counts refresh on Back. Runtime edits reset on a full reload; there is no backend or browser-storage persistence. `node --test tests/data-store.test.cjs` validates catalog relationships, assets and runtime additions without dependencies.


## Automatic two-state artwork brightness

Supersedes the earlier Interstellar brightness override and Dark filename exceptions. `media-treatment.js` classifies full posters using Canvas (64×64, linear-sRGB luminance): mean >= .28 OR coverage of pixels >= .5 is at least .28. Exactly two states: bright / not-bright. Current browser-verified split: Interstellar bright, other three not-bright. Central profiles: bright page veil .96 and card brightness .34; not-bright page veil .92 and card brightness .72; both card veil .85. Existing screen blur/saturation/base brightness remain unchanged. All four entry scripts await analysis before mount. Results cache per URL; failed/blocked images fall back to not-bright after at most 3s. Discovery interpolates profile veil values during swipes; editor media selection reapplies the matching profile. See components/README.md for scope and test instructions.

Picker header tuning: 32px minimum height, 8px top margin and 4px optical left inset. Search follows with a 12px effective gap. Media picker cards show compact Movie/season/episode metadata; watched labels remain on the Discover carousel.

Media title picker: search sits below the centered suggestions, above a generic interactive QWERTY keyboard. The mock keys support typing, backspace, shift, numbers/symbols and space and filter the same search input. Physical keyboard input remains supported; inputMode=none avoids a duplicate mobile keyboard. The media picker has no enclosing sheet, visible heading or drag handle. Centered suggestion pills float above an independent 64px glass search box, styled like the comment composer. The transparent layout wrapper sizes to content and caps its height for scrolling results. The simulated OS keyboard is a separate sibling below, full viewport width on a near-black background with its own home indicator. A 12px gap separates search and keyboard; keyboard keys participate in the modal focus trap. Group selection retains its bottom sheet. Group pickers do not include this keyboard.

Floating suggestion surfaces use a subtle 4% white fill. Their results container has no edge mask: the inherited bottom fade was darkening the last row of pills. Community picker list masks remain unchanged.

- Discover short feeds reserve only enough height to finish collapsing the hero, including the scroller bottom padding in that calculation. They should not scroll further once docked unless actual content overflows. Discover feed mask activates only when docked and fades from 105px to full opacity at 133px, where the first settled card begins. The top blur ends at 133px. The filter anchor has 12px bottom margin, giving the snapped pills 6px more breathing room above the feed.

- Every Discover filter-pill tap, including the selected pill, scrolls to the full-feed sticky endpoint using the shared 400ms carousel snap motion. From deeper in the feed it returns to that endpoint; reduced motion jumps directly.

- Avatar designs are centralized in `components/avatars.js`: named variants define background/face colors and eye/smile paths; shared `settings.strokeWidth` controls strokes. People in `app-data.js` select a stable `avatarId`. `avatar.html` renders these exact definitions through `PocketSagaAvatars.get(person)` / `render(person)` at large and small sizes. Edit the shared module to revise the preview and future app avatars. All app entry pages load this module; the shared Avatar component renders these same faces for authors, comments, and the viewer.

- Current media lineup: Interstellar; Silicon Valley (Season 1); From (Season 1). These replace Whiplash, The Prestige, and Dark in the shared catalog, including community names, post titles/bodies, comments and replies, own posts, history, and picker labels. New community IDs: `pied-piper`, `from-town`. Default post: `from-road`. Artwork is stored as local JPEGs in `components/assets`; see `media-sources.md` there for provenance. The existing automatic brightness classifier handles these new images without exceptions.

- Everything Everywhere All at Once has been removed from the active catalog, including watch history, communities, posts, and nested comments. The discarded ambience experiment remains disabled. Discover now has 7 seeded posts: 5 from unjoined communities and 2 from joined communities.

- Added Coherence (2013) with local `components/assets/coherence.jpg`, watched-last-week history, unjoined community `coherence-dinner` (The Other Dinner Party), and two Discover posts with comments. It uses the same automatic artwork treatment and shared page adapters.

- Palette ambience trial: `media-treatment.js` extracts dominant chromatic hue buckets from the existing 64px analysis, ignoring near-black/white/neutral pixels. It chooses one dominant and an optional related secondary hue, caps saturation at 16%/10% (red/orange primary hues capped at 10%), and generates cached soft SVG gradients for page backgrounds and Discover cards. Actual posters/reflections remain untouched. Existing carousel/editor crossfades consume these gradient sources. Set `ambience.enabled` to false in that module and reload to restore original blurred artwork globally. Empty/unreadable images have a neutral fallback.

- Palette saturation reduced again: primary maximum 16%, secondary 10%, red/orange primary 10%. Mirrored gradient placement remains upper-right/lower-left. Dark is back alongside the other titles, using existing dark-artwork.png, S1 E3 scope, an unjoined Dark community, and two posts with matching comments.

- Palette ambience now uses a soft top-center spotlight: primary ellipse centered at (300,35) in the 600×1000 gradient, with a faint wider secondary halo at the same horizontal center. Colors fade down toward the dark base; saturation remains muted. Hero carousel metadata appears above its title.

- Non-bright page backgrounds have a trial 1% white overlay (`pageLift` in media-treatment.js), above the ambience veil but beneath content. Bright artwork and empty editor backgrounds get none. Discover interpolates this value during carousel changes. This does not affect posters or reflections. Set not-bright pageLift to 0 to revert.

- Palette background base lifted from #080a0b to #202323 and the additional page bottom-darkening veil removed. Existing layer opacity and subtle non-bright white lift remain, so the final background is still dark but the spotlight no longer fades into near-black. Two muted tones remain, with a shared hue when no related secondary is prominent.

- The trial white page-background overlay is now disabled: pageLift is 0 for both artwork brightness states.

- Hybrid ambience is now active: shared `AmbientArtwork` wraps the palette base and original poster texture in one layer so carousel/editor crossfades move both together. Central media-treatment ambience settings: textureOpacity .22 (further multiplied by page/card opacity), textureSaturation .45, textureBlur 28px. Texture CSS brightness .72. Actual banners/reflections unchanged. Set textureOpacity to 0 for palette-only; set ambience.enabled false and reload for the original blurred-poster mode.

- The progressive-only Discover header experiment was rejected: it exposed too much artwork/text behind the sticky pills and produced visual artifacts. Restored the scroll-content mask with an eased 105–133px feather, plus the original top blur at 55% opacity over 121px. Removed the navigation blur preset and the extra blur on unselected pills. The approved hybrid artwork ambience remains intact. Visually checked both the carousel and scrolled sticky-pills state.

- Carousel artwork, blur, shade and copy now sit inside `.watch-card-surface` with an explicit 24px rounded clip-path. This contains overscanned backdrop layers at the bottom corners during transforms; the outer card retains its shadow and the reflection remains separate. Checked Interstellar and Silicon Valley after carousel navigation.

- Carousel settle now retains the existing visible card and reflection nodes, shifts their slots, and creates only the hidden end-of-stack card. Avoid rebuilding the entire deck on settle: recreating backdrop layers can produce a sudden edge/halo change. Forward/reverse wraparound, retained blur nodes, active geometry, focus and compose callbacks were checked with `/private/tmp/pocketsaga-thread-check/deck-settle.mjs`; browser checked returning to Interstellar.

- Discover hero-only trial: `.discover-page .atmosphere .ambient-poster-texture` overrides texture opacity to .52 (shared default .22), and the hero `.ambient-color-base` opacity is .55. This favors blurred banner texture over the extracted-color gradient, preserving saturation, blur and scroll fade. Post-card and other page backgrounds retain the shared defaults. Remove these two CSS overrides to revert.

- Shared comment/reply composer glass: reduced solid fill to 48% (54% focused), 22px backdrop blur with 1.12 saturation, soft directional surface highlights. The rim now catches light near the upper-left and fades away along most of the perimeter instead of outlining the entire box. Centralized in the final message-composer rules in surfaces.css; visually checked on the Silicon Valley post.

- Bright artwork darkening is restored across all hybrid ambient backgrounds: shared profiles now set ambientShade .24 for bright and 0 for non-bright. AmbientArtwork applies each image’s own classification to its composite, whose black overlay fades with that image. This covers Discover hero, post cards, post/community/editor backgrounds without darkening sharp banners or reflections. The legacy pageVeil .96/.92 is still for original-artwork mode; hybrid darkening uses the separate ambientShade value.

- Comment expansion and collapse both use a shared 350ms transitionDuration in reply-thread.js. Accompanying content/composer/scrim fades are proportional and finish within the same 350ms. Reduced-motion behavior remains immediate.

- Expanded reply panel fill is now 88% opaque (previously about 38%) to suppress background bleed, retaining its soft highlight and backdrop blur. The separate comment/reply input keeps its translucent glass treatment.

- Discover filter-to-feed spacing: anchor bottom margin stays at 12px throughout scrolling. Removed the trial 12–20px animated gap, which made pills and feed appear to shift apart. Header feather ends at 133px at the aligned handoff position; top blur height is 121px. Scroll snap checks pass.

- Discover hero backdrop has a page-local vertical mask: full strength through 30% of the screen, gradually fading toward the filters/feed, transparent by 90%. Shared post-card/community/post/editor ambience is unchanged. Native-to-fixed filter handoff, selection sync, reverse scrolling and short-feed snapping were browser checked; all 8 committed tests and the updated scroll-snap regression check pass.

- Bright carousel banners give the Write your thoughts composer a smoky 28% dark fill, subtle light gradient and gently lifted label (#cddbd3); reduced from the stronger 42% / #e4ede8 trial. CardDeck applies the existing media classifier to each card, so this is automatic rather than title-specific. Non-bright composers keep their previous style. Browser checked Interstellar and the non-bright card styles.

- On a leftward carousel slide, the outgoing perspective reflection fades with an eased gesture-progress curve and reaches zero at 70% travel. Canceling the swipe restores it along the same curve. Incoming and reverse-swipe reflections retain their existing fade.

- Discover explicitly overrides the shared .feed-scroll mask with mask-image:none before docking (including -webkit-mask-image). Otherwise the shared mask dims approaching layout pills despite the conditional docked mask. The layout anchor is positioned at z-index:4 above the header blur at z-index:3. Browser checked clear pills during approach and matching fixed-row handoff; the content mask activates only after docking.

- Hero top anchoring now uses native sticky positioning (`top:0` within the padded Discover scroller), with scale/opacity driven by scroll progress. Its rendered top remains identical at scroll 0 and the full collapsed endpoint, eliminating the frame lag from JavaScript counter-translation. Existing 35% snapping and pill handoff remain intact.

- Group picker heading-to-list spacing tightened by 16px: sheet results use 12px top padding instead of 28px, retaining the existing -12px margin. The top scroll feather now ends at 12px so the first card stays fully visible.

- New-post empty title state has a horizontal suggestion rail: a 190px “Choose a title” control with “Search movies and series” subtext and a chevron, followed by watched-title cards with a trailing plus. The chooser heading is 15px/600: between the 14px/500 suggestion names and 16px/500 selected banner title. Its chevron uses the unmodified library shape at 16px; the trial stroke made it look heavy. The cards share artwork/text markup and metadata with the search overlay and select directly through changeMedia. Selecting shows the existing full-width selected banner; clearing restores the rail. The chooser opens the search overlay.

- Community list edge fade softened: top mask now eases to full visibility over 28px while keeping 12px top padding and the tighter heading gap. Bottom fade spans 32px and retains 40% visibility at the edge instead of disappearing completely. Standard/WebKit masks match; browser checked the scrolled sheet.

- Inline title suggestions now animate into the selected banner: other cards fade over 140ms, a temporary copy travels from the tapped card’s visible position and expands over 520ms, then crossfades into the selected control over 140ms. Artwork and type grow independently without stretching text. Geometry accounts for phone preview scaling and horizontal rail scroll. Repeated taps are blocked during motion; focus returns to the selected control. Reduced motion selects immediately and destroy kills the transition/removes its copy. Browser checked Dark and a later rail item.

- Community bottom-edge correction: removed the bottom content mask and the sheet’s 16px bottom inset. The scrolling list now reaches the actual rounded sheet boundary, with 32px internal scroll padding so the last card can clear it. A separate pointer-transparent 40px overlay applies a softly ramped 4px backdrop blur with only a faint tint. The top mask remains unchanged. Browser checked the initial edge and the fully scrolled last card.

- Title selection motion refined to 420ms total: selected card moves/expands immediately over 360ms while other options blur to 5px and fade over 180ms; final handoff overlaps the last 80ms. The temporary card receives explicit left/top geometry before insertion, avoiding an origin flash. Target geometry comes from the rail rather than waiting for a layout swap. Browser checked travel, final selection and cleanup.

- Selecting a different title from the search sheet now triggers a Prism-style 620ms light sweep after dismissal. Only changed controls are highlighted: title banner, community selector if cleared, and Post if availability changes, staggered 90ms. Dismissing or reselecting the same title gives no sweep. Light is clipped to each control, non-interactive, self-removing, and skipped under reduced motion. Browser verified title selection and visible sweep.

- Expanding title cards previously rotated the trailing plus into a cross; this is superseded by the persistent Change action described below.

- Selection sweep softened: duration 1.1s (was 620ms), peak white 9% (was 22%), wider graduated falloff plus 5px blur. Browser checked after sheet selection.

- Title expansion release/settle refinement: samples the pressed pseudo-element opacity and carries it onto the moving card, easing it out over 300ms. The glass surface stays opaque (no competing backdrop crossfade), matches the final fill/blur, and crossfades only its contents to exact selected markup over 120ms before the final handoff at 490ms. Browser checked selected state and temporary-copy cleanup.

- Selection sweep starts 80ms into sheet dismissal, 200ms earlier than waiting for dismissal completion. Its existing soft 1.1s motion and brightness are unchanged.

- Title expansion flicker fix: inline suggestion selection now lays out the real selected banner and animates its wrapper from the tapped pill’s measured position/width over 420ms. Artwork and title animate directly and remain mounted/opaque through completion. Removed the temporary flight card, late content crossfade and 490ms surface swap. Press light releases over 300ms. The full selected subtitle appears from the start, and other suggestions hide when selection begins. Refreshes during expansion preserve the animated content. Browser checked Dark/Coherence, reselect and retained draft; temporary title-continuity.mjs checks node continuity across the final frames, focus, cleanup and reduced motion. All 10 committed tests pass.

- Changed-value feedback now combines the existing sweep with a 1 → 1.012 → 1 scale pulse over 1.1s, starting together 80ms into dismissal and sharing the 90ms control stagger. The title wrapper pulses with its close action; rail padding prevents clipping. Reduced motion skips both. Documented the pattern and usage in design.emry.md; browser checked concurrent sweep/pulse.

- Title expansion text containment: the selected banner and its text column now clip overflow, with single-line ellipsis as a fallback while the control is still pill-width. The title grows via horizontal glyph scale instead of animated font size, keeping its line box and the two-line copy layout stable on every frame. Browser frame checks at 90–190ms confirmed Dark and the longer Silicon Valley title remain inside the expanding surface and settle without a layout jump; continuity and all 10 committed tests pass.

- When its list genuinely overflows, the group picker bottom dissolve reuses the shared `ProgressiveBlur('bottom')` primitive from the Discover shell: four overlapping 1/3/6/12px masked blur layers across a 76px boundary zone, with a continuous sheet-colored wash reaching 92% at the rounded edge. A `ResizeObserver` compares the results’ scroll and client heights and hides the effect when every row fits. This supersedes the single 10px overlay, which still left a sharp hairline where its blur began. Browser checked the current two-row non-scrollable sheet with no blur.

- Selected-title trailing action changed from ×/Remove to a 44×44px icon action using the Lucide `refresh-cw` glyph from `create-post-icons.js`. It opens the existing title picker with the current title selected and keeps the draft intact; the selected banner remains an equivalent larger target. During inline suggestion expansion, the source plus fades/rotates into the refresh icon within the same mounted control, with no end swap. Browser checked the transition, final icon and picker reopening on Dark; all 10 committed tests pass.

- Group terminology and joined-set correction: content inside the Community tab uses group/groups, including group page actions, accessibility labels and create-post footer. The bottom navigation itself is labeled “Community.” The create-post sheet is titled “Select a group” and derives its rows from the same live `joined` state used by Your groups, so it currently shows only Beyond Earth and Pied Piper Garage rather than all seven catalog groups. Browser checked the two-row sheet, Your groups separation between joined and recommended, Home↔Community navigation, and the group page labels; all 10 tests pass.

- Home↔Community settle flicker fix: the incoming tab panel previously animated parent opacity and filter, which isolated every descendant `backdrop-filter` surface; clearing those properties after the slide caused the top glass, bottom glass and For you highlight to recompose together one frame late. The outgoing panel now owns the fade/blur above a fully composed incoming panel, while the destination only translates on a permanently promoted layer. Frame checks confirmed the Community visuals are identical at 420ms and later with no post-settle activation; all 10 tests pass.

- Home↔Community cross-blur restored without parent filtering: each incoming panel now has a pointer-transparent 8px `backdrop-filter` overlay above its content. It starts fully visible before the destination is revealed, fades to zero over the 420ms entrance, and is hidden after settling. The outgoing panel keeps its existing fade/blur/slide. The destination panel itself remains fully opaque and unfiltered, so its nested glass stays composed. Live checks confirmed mid-transition overlay opacity, rapid reversal cleanup, and unchanged settled For you and bottom navigation treatments.

- Create-post control states: the empty title chooser uses mild mint action glass (`rgb(120 169 138 / 10%)`, localized reflection and rim, 20px blur and inset depth) over a 7% neutral base. The disabled Post button uses a very faint neutral fill/rim, 42% muted text, no shadow and no pointer events. `refresh()` removes `tap-feedback` while Post is disabled and restores it only when title, joined group and headline make the draft valid. Browser checked the empty state and the re-enabled valid-draft state; all 10 tests pass.

- Glass role split: the undocked Discover “For you” selection returned to its original quiet highlight (`rgb(178 219 194 / 14%)`, pale wash, shared 18px blur and restrained rim/shadow). It indicates the active feed and should not look especially clickable. The New Post empty title chooser retains the refined mild mint action treatment: a clearer 10% base tint, localized upper-left white reflection, brighter directional rim, 20px blur and shallow inset darkening. These are separate CSS rules and design-system roles; the stronger selected bottom navigation/Write treatment is unchanged.

- New Post editor scroll/strip correction: the title suggestion rail now scrolls only horizontally. The writing surface no longer applies backdrop blur at its upper edge, where it sampled the moving rail as a light band. Its near-opaque dark fill was later reverted to the original translucent `#ffffff05` fill and shared light wash; the no-blur rule remains to prevent the moving strip. The writing surface stays fixed when its content fits, and the headline textarea hides its own vertical overflow until text exceeds its 160px cap. The body textarea still scrolls when long; a ResizeObserver enables form scrolling only when the entire form genuinely overflows a short viewport. Browser checked horizontal rail movement, wheel input over the empty headline (all vertical scroll positions remain zero), long body scrolling, and long-headline overflow. Syntax and diff checks pass.

- Hero carousel horizontal scrolling: `card-deck.js` now consumes horizontal-dominant `wheel` input (plus Shift+wheel), maps accumulated delta to the same live `paint(progress)` path as pointer swipes, and settles after 140ms of gesture quiet. Momentum belongs to one bounded gesture, vertical wheel input remains native, and handled horizontal events stop before Discover’s vertical collapse listener. The accessible carousel label now mentions horizontal scrolling; syntax and all 10 tests pass.

- Navigation label correction: the bottom tab is “Community” (its existing route key), while the feed’s “Your groups,” group picker and all group entities keep “group” language. The bottom-right pale haze seen on the empty editor was the hardware frame’s bright `#484d49` gradient stop showing through the antialiased rounded inner corner, not the bottom progressive blur or disabled Post button. The shared frame stop is now `#303531`; browser checks on the standalone editor and the in-app Community → New post route confirmed a darker corner while preserving the frame rim.

- Ongoing standalone component work is indexed in [component-explorations.md](component-explorations.md). Start there before changing the spoiler-card preview or beginning the queued translation and RTL demonstrations. The current spoiler card is intentionally isolated from the real For You feed and design-system visualization until its concealed state, revealed state and transition are approved.

- Community/Discover greeting trial: the shared 24px Ishant avatar appears inline between “Hi,” and “Ishant” in the Community tab header only. It is decorative within the heading, so accessibility still announces the greeting once. Home and the other screens are unchanged.

- Profile remains a visible bottom-navigation placeholder. Tapping it keeps the existing icon/text press feedback but performs no navigation, moves no selection highlight and shows no “connected later” toast, from either Home or Community and in the standalone previews.

- Save is now part of the shared `PostCard` reaction row for catalog-backed posts, including group pages. Discover no longer appends a second Save button. It uses the existing saved-post store, persistence, labels and feedback, aligned to the trailing edge. Standalone synthetic preview posts without a store record omit Save.

- Spoiler integration approved for isolated group-feed mock examples only, never For You. `spoiler-card.js`/`.css` centralize the two variants; `spoiler-demo.js` owns separate sample copy and placement for Winden Theories (the first For You card’s group), Dark, and Beyond Earth. `CommunityPage` invokes the optional installer once. No catalog/store entries or route/save/reaction connections are created; only reveal/hide is interactive. See component-explorations.md for details.

- Group composer now opens the existing New Post route with the group's media and group preselected. The optional group ID is carried in the draft route token and validated against the media in the editor. The picker includes the currently selected group even if unjoined; entering the editor never changes membership. Standalone group/post entry points load the editor dependencies too. Browser checked Winden Theories → preselected Dark/Winden Theories → Close back to the group; existing tests pass.

- Group feed toolbar now has For you / All posts chips using shared glass-choice material, with the existing sort action on the right. Selection updates locally and emits feed-filter; both modes currently show the same prototype dataset. No recommendation engine is connected.

- Group feed chips were rejected and removed. Restored the simple Posts heading, trailing sort action, and original toolbar-to-post spacing.

- Translation exploration now has an isolated three-context preview: `translation-component-preview.html` (Discover), `?variant=group`, and `?variant=comment`. Optional inline translation and See original use fixed Spanish/English sample copy. See component-explorations.md; main app remains unchanged.

- Translation mock inserts approved: one separate For You card, group cards beside existing spoilers (Winden Theories/Dark/Beyond Earth), and a translated comment on the first For You post. Shared translation-card assets serve both preview and optional translation-demo installer. Mocks have no navigation or store connections; only translation toggles act. See component-explorations.md.

- Greeting avatar hidden: Discover now shows plain “Hi, Ishant” text. Notification dismissal now removes the card once and animates remaining rows/history via 300ms position transforms instead of height/padding collapse, avoiding minimum-height snaps and repeated layout. Swipe geometry uses local pixels at phone-preview scale. Entrance uses a shorter 320ms staggered translate/fade without per-card filter animation. Swipe and keyboard dismissal browser checked.

- Notification history material trial: Show notification history now uses Prism Highlight mint (14% fill, pale directional wash/rim, 18px blur and restrained shadow), replacing Medium mint. Geometry and tap feedback remain unchanged.

- Bottom navigation shadow trial: increased outer black shadow opacity from 32% to 40% (`#00000066`), preserving the -2px upward offset, 24px blur and inset highlights.

- Stronger bottom-navigation shadow trial rejected; restored the original `0 -2px 24px #00000052` outer shadow (32% opacity).
