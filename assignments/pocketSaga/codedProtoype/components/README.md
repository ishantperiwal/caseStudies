# PocketSaga reusable prototype components

Open `../community.html` directly. No install, build step, or local server is required. Google Fonts needs an internet connection; system fonts are the fallback.

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

Community scrolling is native. Discover separately scales/fades the carousel, greeting and utilities and snaps its intro at a 35% threshold; `collapseCarousel` and `dockTabs` manage this behavior. A viewport mask fades just the content entering the fixed app bar, together with a progressive blur. Header thresholds use rendered bounds to account for phone scaling and browser zoom; resizing recalculates them. Hidden actions are inert and removed from the accessibility tree.


## Automatic media treatment

`media-treatment.js` uses Canvas to downsample each full artwork to 64×64 and measure alpha-weighted, linear-sRGB luminance. There are only two states: `bright` and `not-bright`. The rule is bright when mean luminance is at least 0.28 **or** at least 28% of sampled pixels have luminance of 0.5 or more. This catches large bright patches as well as generally bright posters. Current assets classify as Interstellar = bright; Whiplash, The Prestige and Dark = not-bright. Full-asset sampling deliberately keeps classification stable across different screen crops; it is not a per-text-region contrast guarantee.

Tune thresholds and the two visual profiles centrally in that file. No catalog overrides, IDs or filename matching are used. Image blur, saturation and screen-specific ambient brightness remain shared design settings. The profile controls page veil opacity, post-card image brightness and card veil opacity. Carousel transitions blend the two veil values only during movement; they do not introduce a third classification.

Entry points wait for cached analysis before mounting to avoid a treatment flash. Unreadable/blocked images fall back to not-bright, with a three-second timeout so loading cannot block indefinitely. Remote artwork requires CORS permission for Canvas reads; direct file opening may use the fallback. Analysis and caching are in memory, once per URL per page session. Run `node --test tests/*.test.cjs` from the prototype root.


## Current visual conventions

- Post-card titles: 22px font / 28px line height. Post-card excerpts, community descriptions and thread replies: 22px line height. Full-post body and comment body retain their separate typography.
- Full-post spacing: attribution → title 24px; title → body 10px.
- Community header: group name above media metadata; total members appear in the action button, not below the title. Actions: membership, users icon + total + chevron, options.
- Your groups: users icon + online count + chevron, without a pill background. Catalog `activeMemberCount` supplies sample presence counts. Group cards use a single even translucent fill to avoid stacked gradient banding.
- Discover Write sits to the right of Notifications. It shares the mint-glass rule in `surfaces.css` with Join community and selected bottom navigation. Preserve translucency and edge highlights; do not replace with a solid mint fill.
- Comment translation notices are not rendered for now, though metadata is retained.

For full interaction history and current constraints, read `../new chat context.md`.

- Avatar designs are centralized in `components/avatars.js`: named variants define background/face colors and eye/smile paths; shared `settings.strokeWidth` controls strokes. People in `app-data.js` select a stable `avatarId`. `avatar.html` renders these exact definitions through `PocketSagaAvatars.get(person)` / `render(person)` at large and small sizes. Edit the shared module to revise the preview and future app avatars. All app entry pages load this module; the shared Avatar component renders these same faces for authors, comments, and the viewer.

- Current media lineup: Interstellar; Silicon Valley (Season 1); Everything Everywhere All at Once (2022); From (Season 1). These replace Whiplash, The Prestige, and Dark in the shared catalog, including community names, post titles/bodies, comments and replies, own posts, history, and picker labels. New community IDs: `pied-piper`, `every-universe`, `from-town`. Default post: `from-road`. Artwork is stored as local JPEGs in `components/assets`; see `media-sources.md` there for provenance. The existing automatic brightness classifier handles these new images without exceptions.
