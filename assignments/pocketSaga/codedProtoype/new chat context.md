# PocketSaga coded prototypes — new chat context

Read this first, then inspect the implementation. This records current behavior and user preferences; later user instructions take precedence. Keep it updated when screens, shared patterns, or navigation change.

## Project and entry points

Workspace: `assignments/pocketSaga/codedProtoype/` (existing spelling intentional).

Plain HTML, CSS and classic deferred JavaScript; no framework, bundler or build step. GSAP and CustomEase are vendored. Google Fonts loads Newsreader and Manrope with local fallbacks. Keep runnable HTML screens at the top level and supporting code/assets in `components/`. This requested context document is a top-level documentation exception.

- `discover.html`: hero carousel, For you / Your posts / Your groups, community post cards and bottom navigation.
- `community.html`: Beyond Earth community, membership, posts and composer.
- `post.html`: sample Dark post, comments, sticky composer and comment focus mode.
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

“Your posts” includes four sample posts from `discoverPageData.yourPosts`, authored by the viewer, with new local publications prepended. “Your groups” lists the joined Beyond Earth, After the Last Note and The Final Reveal communities. Dark remains unjoined for the recommendation/Join flow. Membership is shared across tabs, so joined groups do not show Join banners in For you.

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

Discover now uses a shrinking hero intro: the carousel counter-translates vertical scrolling, scales from 1 to .6 and fades out as the feed moves up. The greeting and top-right utilities fade with the exact same scroll progress and restore together on reverse scroll; tab docking does not independently animate their opacity. `PocketSagaMotion.collapseCarousel` measures the tabs’ docking distance, then snaps to feed-only after 35% progress on release/160ms scroll idle, or restores the intro below that threshold. Snap duration is 400ms; new input interrupts it and re-arms settling even if the final wheel/keyboard event produces no scroll. `scrollend` also schedules settling. This prevents trackpad momentum tails from cancelling the snap and stranding the intro halfway; `/private/tmp/pocketsaga-thread-check/scroll-snap.mjs` covers that regression and both endpoints. Touch contact blocks snapping until release, including native pointer cancellation. Scrolling beyond the intro remains natural. Short feeds reserve enough height to reach the docked state; hidden/inert routes do not snap. Reduced motion bypasses scale and animated snapping. Community scrolling remains natural. Content dissipates smoothly behind app bars, not through hard clipping or opaque strips.

Community: back stays fixed; compact community name appears after the large name passes; Posts heading scrolls away; circular filter appears in top-right once its toolbar passes. Reverse scrolling reverses these states independently.

Base top blur: top 12px, height 135px, ending at 147px. Feed mask is transparent through 88px and becomes fully visible at 147px through eased stops. Keep standard/WebKit masks aligned. Preserve blur softness when merely shifting its position.

Discover: at scrollTop ≤ 0, the filter tabs live in their native scroll anchor so they share elastic overscroll. At positive scroll positions, the same row moves into a floating header layer above the feed mask and tracks its reserved anchor until docking. The switch preserves visual position without fading; no reparenting or opacity reset occurs at the docking threshold. Docking replaces the greeting and both utilities, whose fade is controlled by carousel collapse. Docked tabs have added top space and a slightly longer downward blur (147px blur height). Selection moves smoothly; content transitions fade/blur. Bottom navigation hides scrolling down and returns scrolling up, with jitter thresholds. Content remains visible but blurred through the bottom/home region.

Discover top ambient artwork fades with scroll, followed by an off-black/dark-gray base. Mint background was rejected. The atmosphere remains darkened for readability, with a subtle color lift: shared page artwork uses saturate(1.1), Discover/community brightness is .72, and Create post brightness is .59. Discover post artwork uses saturate(.9) instead of the earlier .75; use the shared bright/not-bright profile for card brightness and veil strength.

## Hero carousel

Watch timing is a separate top-right glass tag (`watchedLabel` in history data, sample labels: Interstellar “Recently watched”, Whiplash “Watched yesterday”, The Prestige “Watched in 2023”, Dark “Watched last month”). Bottom subtitles describe the media: “Movie · 2014” / “Movie · 2006”, or season/episode (Dark: “Season 1 · Episode 3”). The tag fades with the active card’s copy during swipes.

The active card has a decorative artwork reflection beneath it, mirrored onto a shallow perspective plane that widens toward the viewer. It uses 7px blur, a fading mask and 28% peak opacity, and follows card movement while blending between outgoing/incoming cards. The reflection is a separate non-interactive, aria-hidden layer so it does not affect composer backdrop sampling. The reflection has a faint white gradient wash (20% at its top, composited within the 28% reflection opacity) to retain glow with dark posters. Its 56px plane is tilted 65 degrees, starting 4px below the card, for a flatter projection. Carousel height is 348px to reserve compact reflection space above the filters.

Hero title-to-subtitle gap is 4px; subtitle-to-composer spacing remains 14px. During carousel movement, fade the individual title, subtitle and composer elements, never the `.watch-card-copy` wrapper. A translucent wrapper creates a backdrop root that blocks the composer from sampling the artwork, causing its blur to suddenly intensify when the animation settles.

Horizontal movement only. Scaled cards behind the active card are accepted; vertical offsets are not. Previous card peeks from the left at full opacity; its parked x is `-w + 8`, leaving a 16px gap before the active card at x=24. Reverse swipe brings it above the outgoing card. Release includes a small directional elastic continuation before settling. Swipes retain vertical page scrolling.

Ambient artwork crossfades during swipe progress, not only after settling. Bottom artwork blur overscans to avoid an unblurred hairline. Keep the directional right-edge shadow subtle and avoid heavy bottom black overlays.

**The entire active hero card is now tappable** and opens New post with that media selected. The thoughts box does the same. Arrow keys navigate the carousel; Enter/Space on the active card opens the editor. A swipe must not trigger compose.

## New-post screen and navigation transition

New post uses `#0e0f10` as its default off-black background, matching Discover’s scrolled base, including when no media is selected.

Hero entry preselects that media; top create button opens an unselected editor with the restored “Choose a title” / “Search movies and series” card. There is no inline search or suggestion rail. Clicking the card opens the floating media-search overlay. Its media suggestions wrap at natural content widths, centered per row, with 14px vertical / 16px horizontal padding, 16px gaps, 34×46px artwork and 6px extra after the text; blank search shows watched media (plus the current selection), and typing searches the full local catalog. No watched-time labels or section heading appear on these cards. Subtext is `Movie`, `S1 · E3`, or `Season 3`, derived from mediaType/season/episode fields in the catalog. Community pickers retain full-width rows. Selected media has a trailing cross to clear it without changing the draft; the banner itself opens the picker. No close button or remove-selected footer is shown in the sheet. Use the same reusable `PocketSagaCreatePost.CreatePostPage` for both. Media/community pickers preserve draft text; changing media may clear an incompatible community selection. Post requires media, community and a nonempty headline. Publishing through Discover adds a local preview post; standalone editor only provides a local confirmation. The editor toolbar contains Clip (clapperboard icon) followed by Scene (still-image frame icon). Attach was renamed Scene; Poll was removed. Clip/Scene are affordances for a later pass, not implemented enrichment features.

Editor: 16px gap between the writing surface and the fixed community/Post action row (scroll bottom padding 100px, footer bottom 32px + button height 52px). 24px top and 20px side/bottom internal padding; Newsreader headline 28px, weight 400, 32px line height. Starts one line and grows up to 160px. A subtle 1px `#ffffff12` separator sits between headline and body, with 14px gaps above and below. The former two-line minimum and missing separator were corrected.

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

Media title picker: search sits below the centered suggestions, above a generic interactive QWERTY keyboard. The mock keys support typing, backspace, shift, numbers/symbols and space and filter the same search input. Physical keyboard input remains supported; inputMode=none avoids a duplicate mobile keyboard. The media picker has no enclosing sheet, visible heading or drag handle. Centered suggestion pills float above an independent 64px glass search box, styled like the comment composer. The transparent layout wrapper sizes to content and caps its height for scrolling results. The simulated OS keyboard is a separate sibling below, full viewport width on a near-black background with its own home indicator. A 12px gap separates search and keyboard; keyboard keys participate in the modal focus trap. Community selection retains its bottom sheet. Community pickers do not include this keyboard.

Floating suggestion surfaces use a subtle 4% white fill. Their results container has no edge mask: the inherited bottom fade was darkening the last row of pills. Community picker list masks remain unchanged.

- Discover short feeds reserve only enough height to finish collapsing the hero, including the scroller bottom padding in that calculation. They should not scroll further once docked unless actual content overflows. Discover feed mask stays transparent through the sticky pills at 109px and fades to full opacity at 125px, where the first settled card begins. The top blur ends at 115px. The filter anchor has 12px bottom margin, giving the snapped pills 6px more breathing room above the feed.

- Every Discover filter-pill tap, including the selected pill, scrolls to the full-feed sticky endpoint using the shared 400ms carousel snap motion. From deeper in the feed it returns to that endpoint; reduced motion jumps directly.

- Avatar designs are centralized in `components/avatars.js`: named variants define background/face colors and eye/smile paths; shared `settings.strokeWidth` controls strokes. People in `app-data.js` select a stable `avatarId`. `avatar.html` renders these exact definitions through `PocketSagaAvatars.get(person)` / `render(person)` at large and small sizes. Edit the shared module to revise the preview and future app avatars. All app entry pages load this module; the shared Avatar component renders these same faces for authors, comments, and the viewer.

- Current media lineup: Interstellar; Silicon Valley (Season 1); Everything Everywhere All at Once (2022); From (Season 1). These replace Whiplash, The Prestige, and Dark in the shared catalog, including community names, post titles/bodies, comments and replies, own posts, history, and picker labels. New community IDs: `pied-piper`, `every-universe`, `from-town`. Default post: `from-road`. Artwork is stored as local JPEGs in `components/assets`; see `media-sources.md` there for provenance. The existing automatic brightness classifier handles these new images without exceptions.
