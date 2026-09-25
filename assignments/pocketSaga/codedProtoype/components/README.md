# PocketSaga reusable prototype components

Open `../community.html` directly. No install, build step, or local server is required. Google Fonts needs an internet connection; system fonts are the fallback.

The product term is **group/groups** in all visible copy. Legacy filenames, CSS classes, data fields and route/event keys still use `community` for compatibility.

## Files

- `app-data.js`: shared JSON-compatible catalog for people, media, communities, posts, comments and watch history.
- `data-store.js`: ID lookups, screen adapters and session mutations.
- `media-treatment.js`: automatic bright/not-bright classification and visual profiles.
- `surfaces.css`: shared glass surfaces and stronger mint treatment for primary actions.
- `page-data.js`, `post-data.js`, `discover-data.js`, `create-post-data.js`: thin adapters for existing screen shells.
- `components.js`: reusable DOM components exposed through `window.PocketSaga`.
- `community.css`: shared component styles, design tokens, phone casing, fixed atmosphere, and progressive edge blur.
- `icons.js`: shared original SVG icon definitions.
- `assets/`: local artwork (URLs in page data are relative to the screen HTML) (one image reused across the background, community, and attachment).
- `preview.js`: mounts the configured page.
- `home.js`, `home.css`, `home-data.js`, `home-preview.js`: Home tab (`home.html`). Its data is the `home` block in `app-data.js` (featured title, continue-watching entries with an optional community prompt, suggestions) plus the shared watch history, resolved by `PocketSagaData.home()`.

## Create another context

Edit `app-data.js` instead of copying screen datasets. Add a media record with a unique `id`, title, subtitle and artwork path; a community references it using `mediaId`. A post references `authorId`, `communityId` and `mediaId`, and holds its paragraphs and comments. `discoverPostIds` controls the For you seed order; Your posts is derived from `viewerId`, and community feeds are derived from community IDs. `watchHistory` controls carousel order and watched labels. Card excerpts come from the first paragraph; comment counts are derived from top-level comments, excluding replies.

Open `../post.html?post=ishant-whiplash` or `../community.html?community=note` to populate the same shells with different records. All HTML entry points load the catalog and store before their adapters. This uses a JavaScript assignment around JSON-compatible data so direct file opening works without fetch/CORS; the object itself can be exported as JSON for a future API. New posts, comments and replies live in memory until reload. Run `node --test ../tests/data-store.test.cjs` from this directory for data-layer checks.

`theme` accepts `accent`, `text`, `muted`, `body`, and `background` CSS colors. `device.width` accepts a CSS length. Surface colors and card radius are CSS custom properties on `.phone-case`. Long names and attachment content wrap within the phone.

## Component composition

`CommunityPage` composes `PhoneFrame`, `AtmosphericBackground`, `StatusBar`, `HomeIndicator`, `CommunityHeader`, `Composer`, `FeedToolbar`, and `PostCard`. Cards compose `AuthorMeta`, `MediaAttachment`, and `ReactionBar`. Shared primitives are `ProgressiveBlur`, `Action`, `Avatar`, `Artwork`, and `Icon`.

The background and device overlays are siblings of the sole scrolling container. Both overlays use the same progressively masked blur component, with reversed direction at the top.

## Connect behavior

Components expose callbacks and bubbling action events. The supplied entry points attach `PocketSagaNavigation` to handle ID-based post/community routes and Back. Other actions such as member-list browsing remain event hooks. Changes are session-only.

```js
PocketSaga.mount(document.getElementById('app'), communityPageData, {
  compose: () => openComposer(),
  attachment: ({ post, attachment }) => openMedia(attachment),
  comments: ({ post }) => openDiscussion(post.id)
});
```

Community actions: `back`, `membership`, `members`, `options`, `compose`, `sort`, `attachment`, `like`, `comments`, `open-post`. Event `detail` contains `action` and the relevant community/post/attachment. Mount replaces previous content, allowing a context switch without duplicating the frame. Text content uses DOM text nodes rather than HTML interpolation.

The screen keeps a fixed 412:896 aspect ratio. The preview scales the entire device uniformly to fit the available window, up to its natural size. Resizing or browser zoom does not compress the screen or reflow its content.

## Shared GSAP motion

`vendor/gsap.min.js` is the pinned local GSAP 3.13.0 distribution with its license notice retained. Source: https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js.

`PocketSagaMotion.scrollHeader({ scroller, navigation, titleTrigger, actionTrigger, title, actionSlot, duration: .18 })` reveals the compact title after the community name passes the app bar and reveals its circular filter action after the Posts toolbar passes it. The top-right navigation slot can hold another screen’s primary action. The helper returns a cleanup function and respects reduced motion.

Community scrolling is native. Discover separately scales/fades the carousel, greeting and utilities and snaps its intro at a 35% threshold; `collapseCarousel` and `dockTabs` manage this behavior. The slide deck sends its side cards outward during hero collapse; on a return to full visibility, they retain a small amount of speed-sensitive outward travel and settle elastically while the hero itself stays at full size. Filters stay in the native layout until they align with a separate fixed row; visibility, accessibility and focus switch at that boundary, with selection shared between both rows. The snap endpoint matches the handoff position. A viewport mask and soft top blur activate only after docking. The Discover hero ambience also fades vertically toward the filters and feed. Header thresholds use rendered bounds to account for phone scaling and browser zoom; resizing recalculates them. Hidden actions are inert and removed from the accessibility tree.


## Automatic media treatment

`media-treatment.js` uses Canvas to downsample each full artwork to 64×64 and measure alpha-weighted, linear-sRGB luminance. There are only two states: `bright` and `not-bright`. The rule is bright when mean luminance is at least 0.28 **or** at least 28% of sampled pixels have luminance of 0.5 or more. This catches large bright patches as well as generally bright posters. Current assets classify as Interstellar = bright; Whiplash, The Prestige and Dark = not-bright. Full-asset sampling deliberately keeps classification stable across different screen crops; it is not a per-text-region contrast guarantee.

Tune thresholds and the two visual profiles centrally in that file. No catalog overrides, IDs or filename matching are used. Image blur, saturation and screen-specific ambient brightness remain shared design settings. The profile controls page veil opacity, post-card image brightness and card veil opacity. Carousel transitions blend the two veil values only during movement; they do not introduce a third classification.

Entry points wait for cached analysis before mounting to avoid a treatment flash. Unreadable/blocked images fall back to not-bright, with a three-second timeout so loading cannot block indefinitely. Remote artwork requires CORS permission for Canvas reads; direct file opening may use the fallback. Analysis and caching are in memory, once per URL per page session. Run `node --test tests/*.test.cjs` from the prototype root.


## Current visual conventions

- Post-card titles: 22px font / 28px line height. Post-card excerpts, community descriptions and thread replies: 22px line height. Full-post body and comment body retain their separate typography.
- Full-post spacing: attribution → title 24px; title → body 10px.
- Community header: group name above media metadata; total members appear in the action button, not below the title. Actions: membership, users icon + total + chevron, options.
- Group names: one-line names keep their normal type size. When a name wraps, the group heading steps from 28px to 26px and the Your groups cards step from 14px to 13px. Compact group names inside Discover post cards stay on one line and truncate with an ellipsis; the full name remains in the accessible label and group page. “Questions Beyond the Stars” shows both treatments.
- Your groups: users icon + online count + chevron, without a pill background. Catalog `activeMemberCount` supplies sample presence counts. Group cards use a single even translucent fill to avoid stacked gradient banding.
- Discover Write sits to the right of Notifications. It shares the mint-glass rule in `surfaces.css` with Join group and selected bottom navigation. Preserve translucency and edge highlights; do not replace with a solid mint fill.
- Comment translation notices are not rendered for now, though metadata is retained.

For full interaction history and current constraints, read `../new chat context.md`.

- Avatar designs are centralized in `components/avatars.js`: named variants define background/face colors and eye/smile paths; shared `settings.strokeWidth` controls strokes. People in `app-data.js` select a stable `avatarId`. `avatar.html` renders these exact definitions through `PocketSagaAvatars.get(person)` / `render(person)` at large and small sizes. Edit the shared module to revise the preview and future app avatars. All app entry pages load this module; the shared Avatar component renders these same faces for authors, comments, and the viewer.

- Current media lineup: Interstellar; Silicon Valley (Season 1); From (Season 1). These replace Whiplash, The Prestige, and Dark in the shared catalog, including community names, post titles/bodies, comments and replies, own posts, history, and picker labels. New community IDs: `pied-piper`, `from-town`. Default post: `from-road`. Artwork is stored as local JPEGs in `components/assets`; see `media-sources.md` there for provenance. The existing automatic brightness classifier handles these new images without exceptions.

- Everything Everywhere All at Once has been removed from the active catalog, including watch history, communities, posts, and nested comments. The discarded ambience experiment remains disabled. Discover now has 7 seeded posts: 5 from unjoined communities and 2 from joined communities.

- Palette ambience trial: `media-treatment.js` extracts dominant chromatic hue buckets from the existing 64px analysis, ignoring near-black/white/neutral pixels. It chooses one dominant and an optional related secondary hue, caps saturation at 16%/10% (red/orange primary hues capped at 10%), and generates cached soft SVG gradients for page backgrounds and Discover cards. Actual posters/reflections remain untouched. Existing carousel/editor crossfades consume these gradient sources. Set `ambience.enabled` to false in that module and reload to restore original blurred artwork globally. Empty/unreadable images have a neutral fallback.

- Palette saturation reduced again: primary maximum 16%, secondary 10%, red/orange primary 10%. Mirrored gradient placement remains upper-right/lower-left. Dark is back alongside the other titles, using existing dark-artwork.png, S1 E3 scope, an unjoined Dark community, and two posts with matching comments.

- Hybrid ambience is now active: shared `AmbientArtwork` wraps the palette base and original poster texture in one layer so carousel/editor crossfades move both together. Central media-treatment ambience settings: textureOpacity .22 (further multiplied by page/card opacity), textureSaturation .45, textureBlur 28px. Texture CSS brightness .72. Actual banners/reflections unchanged. Set textureOpacity to 0 for palette-only; set ambience.enabled false and reload for the original blurred-poster mode.

- Every hydrated and newly published post includes media identifier data derived from its selected movie/show. The identifier card renders only on the dedicated post page, not in Discover or community feed cards, which already identify the title in their metadata. Its action uses a play icon and says Watch by default, or Watch clip when `clip` metadata exists. Optional `scene: {src, alt}` renders as a separate still image above the identifier in feeds and post detail. Clip/scene picking and playback remain prototype placeholders.
