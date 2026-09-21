# PocketSaga coded prototypes — new chat context

Read this first, then inspect the implementation. This records current behavior and user preferences; later user instructions take precedence. Keep it updated when screens, shared patterns, or navigation change.

## Project and entry points

Workspace: `assignments/pocketSaga/codedProtoype/` (existing spelling intentional).

Plain HTML, CSS and classic deferred JavaScript; no framework, bundler or build step. GSAP and CustomEase are vendored. Google Fonts loads Newsreader and Manrope with local fallbacks. Keep runnable HTML screens at the top level and supporting code/assets in `components/`. This requested context document is a top-level documentation exception.

- `discover.html`: hero carousel, For you / Your posts / Your groups, community post cards and bottom navigation.
- `community.html`: Beyond Earth community, membership, posts and composer.
- `post.html`: sample Dark post, comments, sticky composer and comment focus mode.
- `create-post.html`: reusable new-post editor. Default has no media selected; `?media=interstellar` (also dark, whiplash, prestige) preselects media.

Navigation connects Discover post cards to the sample post, and community names/cards to the sample community. Content mapping remains intentionally incomplete until a later dataset pass. There is no backend or durable persistence.

## File map

All paths below are inside `components/`.

| Files | Responsibility |
| --- | --- |
| `components.js`, `community.css`, `icons.js` | Shared PocketSaga DOM components, device, community screen, base typography/layout and icons. |
| `surfaces.css` | Shared glass fill, edge, selection and post-card press treatments. |
| `motion.js` | Scroll header, moving tab selection, sticky tabs and bottom-navigation visibility. |
| `page-data.js`, `preview.js` | Community sample data and mounting/navigation hookup. |
| `discover.js`, `discover.css`, `discover-data.js`, `discover-icons.js`, `discover-preview.js` | Discover screen, data and entry point. |
| `card-deck.js`, `card-deck.css` | Reusable looping hero carousel. |
| `post.js`, `post.css`, `post-data.js`, `post-preview.js` | Full post, comments, pagination and entry point. |
| `reply-thread.js`, `reply-thread.css` | Expanding comment focus mode and reply composer. |
| `create-post.js`, `create-post.css`, `create-post-data.js`, `create-post-icons.js`, `create-post-preview.js` | New-post screen, media/community pickers, sample data and entry point. |
| `navigation.js`, `navigation.css` | In-phone route stack, history, cached views, screen transitions. |
| `vendor/gsap.min.js`, `vendor/CustomEase.min.js` | Local animation dependencies; preserve licenses. |
| `assets/` | Interstellar, Dark, Whiplash and Prestige artwork. |

Use existing HTML script order as the dependency reference. Asset paths resolve relative to the HTML, not to their data scripts. `components/README.md` contains older component notes; check code for current APIs.

## Shared implementation rules

`window.PocketSaga` exports device/page/card primitives, including `PhoneFrame`, `ProgressiveBlur`, `PostCard`, `Composer`, `MessageComposer`, `SeparatedMeta`, `Action`, `Avatar`, `Artwork` and `Icon`. `mountPage` handles uniform preview scaling and previous-mount cleanup. Dedicated screens compose these primitives.

Retain `.flat(Infinity)` in the DOM helper: shallow flattening previously displayed `[object HTMLSpanElement]`. User text uses text nodes; innerHTML is only for trusted local SVG paths.

Metadata dot separators must be separate entities with equal spacing before/after. Reuse `SeparatedMeta` rather than embedding spaced dots in text. Keep sample content separate from layout. Preserve unrelated workspace edits.

## Accepted visual direction

Dark translucent glass with subtle light from the top, muted mint accents, Newsreader headings and Manrope UI/body. Avoid flat opaque pills, bright borders and noisy glows.

- Device: natural outer width 438px; screen aspect ratio 412:896. Uniformly scale the entire phone to fit; never compress height alone.
- General screen horizontal padding: 16px. Scrolling content uses `.feed-scroll`; status and home indicators stay fixed.
- Circular app-bar actions: 44px touch targets, faint translucent fill and blur. Bottom-sheet close buttons have a smaller visible circle with a generous target.
- Selected tabs/navigation: subtle mint-tinted glass, light icon/text, weight 500. Unselected filter tabs have a faint flat pill; unselected bottom-nav items do not have individual containers.
- No system outline focus rings. Keep keyboard activation, labels, focus restoration and reduced-motion support.
- Tap feedback stays active during the press. Soft corner light plus a top-to-bottom fill highlight, restrained scale .985; release smoothly. Strong glow borders and larger scale reductions were rejected.
- Screen/focus transitions use cubic-bezier(.6,0,.25,1). Create-post navigation uses the normal slide with a 350ms duration.
- Shared post cards now highlight and scale to .985 while held. Cancel on pointer movement over 8px, pointer cancellation/leave/release. Nested controls act independently.

### Discover post cards — current tuning

Outer radius 28px. Padding is now 20px top/sides and 10px bottom; cards without the community banner have 24px top padding. Community/context line has extra space below it. Author row sits below the excerpt on Discover (above the headline in community cards).

Show the inset community banner only for communities not joined; always retain the compact linked community/context line. Joining removes matching banners. Community artwork is larger than the early compact version; Join uses the shared group/users icon.

Each card has blurred media artwork, controlled darkness, and a faint light wash stronger at the top and weaker at the bottom. Interstellar/Earth has a darker artwork override. Do not brighten every card to compensate for one image.

Discover-only `::after` border is 1.4px. Bottom-right radial highlight peaks at approximately 7% white, fading through weaker stops; fill unchanged. It lives in `surfaces.css` but is scoped to `.discover-post`. Earlier changes appeared ineffective because the shared `:is()` selector had excessive specificity from comment exclusions; those exclusions now use `:where()` so this override applies. Do not reintroduce that specificity bug.

Filter pills have 6px extra margin below their anchor, on top of the scroll layout gap.

## Scrolling and blur

Natural scrolling: no snapping or intro scale/collapse. Content dissipates smoothly behind app bars, not through hard clipping or opaque strips.

Community: back stays fixed; compact community name appears after the large name passes; Posts heading scrolls away; circular filter appears in top-right once its toolbar passes. Reverse scrolling reverses these states independently.

Base top blur: top 12px, height 135px, ending at 147px. Feed mask is transparent through 88px and becomes fully visible at 147px through eased stops. Keep standard/WebKit masks aligned. Preserve blur softness when merely shifting its position.

Discover: actual filter tabs dock into the header after passing it, replacing the greeting and hiding both utilities. Docked tabs have added top space and a slightly longer downward blur (147px blur height). Selection moves smoothly; content transitions fade/blur. Bottom navigation hides scrolling down and returns scrolling up, with jitter thresholds. Content remains visible but blurred through the bottom/home region.

Discover top ambient artwork fades with scroll, followed by an off-black/dark-gray base. Mint background was rejected. The atmosphere on Discover/community is deliberately darkened for readability.

## Hero carousel

Horizontal movement only. Scaled cards behind the active card are accepted; vertical offsets are not. Previous card peeks from the left at full opacity. Reverse swipe brings it above the outgoing card. Release includes a small directional elastic continuation before settling. Swipes retain vertical page scrolling.

Ambient artwork crossfades during swipe progress, not only after settling. Bottom artwork blur overscans to avoid an unblurred hairline. Keep the directional right-edge shadow subtle and avoid heavy bottom black overlays.

**The entire active hero card is now tappable** and opens New post with that media selected. The thoughts box does the same. Arrow keys navigate the carousel; Enter/Space on the active card opens the editor. A swipe must not trigger compose.

## New-post screen and navigation transition

Hero entry preselects that media; top create button opens an unselected editor. Use the same reusable `PocketSagaCreatePost.CreatePostPage` for both. Media/community pickers preserve draft text; changing media may clear an incompatible community selection. Post requires media, community and a nonempty headline. Publishing through Discover adds a local preview post; standalone editor only provides a local confirmation. Clip/Attach/Poll are affordances for a later pass, not implemented enrichment features.

Editor: 20px internal padding; Newsreader headline 28px, weight 400, 32px line height. Starts one line and grows up to 160px. A subtle 1px `#ffffff12` separator sits between headline and body, with 14px gaps above and below. The former two-line minimum and missing separator were corrected.

Create-post entry now uses the shared horizontal slide transition, including taps on hero cards, with a 350ms duration in both directions and cubic-bezier(.6,0,.25,1). The user dropped the seamless hero morph/crossfade experiment and will define a different interaction later. The custom image geometry, clones, clip expansion and separate content entrance have been removed. Hero entry still preselects the tapped media and restores focus to the hero on Back.

Other routes retain slide transitions. `navigation.js` keeps the outer phone/status/home fixed, caches screens to preserve scroll/drafts, integrates browser Back/Forward, restores focus, and cleans up on unmount. Each new create entry gets a fresh route token; cached history entries retain their draft. Do not replace the entire device during navigation.

## Post comments and focus mode

Comments paginate without a Load more button. Entire comment opens focus mode, including comments with no replies. Use the same MessageComposer for main comments and focused replies; main composer sticks to the bottom.

Expand/collapse animates container geometry separately from text; text blur/fades rather than scaling with the surface. Expanded surface is slightly more opaque, with subtle borders. Empty threads have dynamic height and centered “No replies yet.” Keep header/close aligned and gaps restrained.

Dragging the handle down moves the **top edge downward while the bottom stays fixed**, shrinking height; release past threshold dismisses, otherwise restores. Background blur releases during the later part of dismissal, not immediately. Preserve Escape, focus restoration, scroll restoration and local reply counts.

## Design source

Use pen.dev MCP for `assignments/pocketSaga/pen dev/pocket saga designs.pen`; never read encrypted .pen contents from the filesystem. Recheck live state/selection before relying on IDs.

Known frames: `Czra1` selected-media create post, `McTEg` unselected-media create post, `vfozf` full Dark post, `VJKxI` reply focus, `m6MegG` older Beyond Earth community reference. HTML has evolved through user feedback and need not exactly match every canvas detail.

## Verification and remaining work

Run syntax checks for changed JavaScript and verify relative asset/import paths after moving files. Temporary HappyDOM checks using actual vendored GSAP live in `/private/tmp/pocketsaga-thread-check/`: `check.mjs`, `discover.mjs`, `navigation.mjs`, `create-post.mjs`. They cover interaction/navigation lifecycles, carousel, focus mode, drafts, pickers and local publication. Temporary files may not persist; there is no committed full browser test suite.

The current Chrome preview at `http://127.0.0.1:5500/assignments/pocketSaga/codedProtoype/discover.html` is accessible through cua_repl. Use that supported browser surface for visual checks; do not claim mocked DOM checks are visual verification. Old temporary morph diagnostics in `/private/tmp/pocketsaga-thread-check/` describe the removed experiment and should not be used as checks for current navigation.

Later dataset pass will connect route content consistently. Backend persistence, real enrichment tools and several secondary actions remain outside this prototype pass.
