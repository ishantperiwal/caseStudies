# Reusable community preview

Open `../community.html` directly. No install, build step, or local server is required. Google Fonts needs an internet connection; system fonts are the fallback.

## Files

- `page-data.js`: community, viewer, posts, optional media attachments, labels, theme colors, and phone width/time.
- `components.js`: reusable DOM components exposed through `window.PocketSaga`.
- `community.css`: shared component styles, design tokens, phone casing, fixed atmosphere, and progressive edge blur.
- `icons.js`: shared original SVG icon definitions.
- `assets/`: local artwork (URLs in page data are relative to the screen HTML) (one image reused across the background, community, and attachment).
- `preview.js`: mounts the configured page.

## Create another context

Copy `../community.html` to another screen name in the parent directory and copy `page-data.js` within this components directory. Update the new HTML’s data script reference, then edit the copied data. Keep the shared component/style/icon scripts. Update `community` for a different movie, book, show, or topic; the context appears once in the community header. Omit `attachment` for text-only posts. An empty `posts` array displays the configured empty-state label.

`theme` accepts `accent`, `text`, `muted`, `body`, and `background` CSS colors. `device.width` accepts a CSS length. Surface colors and card radius are CSS custom properties on `.phone-case`. Long names and attachment content wrap within the phone.

## Component composition

`CommunityPage` composes `PhoneFrame`, `AtmosphericBackground`, `StatusBar`, `HomeIndicator`, `CommunityHeader`, `Composer`, `FeedToolbar`, and `PostCard`. Cards compose `AuthorMeta`, `MediaAttachment`, and `ReactionBar`. Shared primitives are `ProgressiveBlur`, `Action`, `Avatar`, `Artwork`, and `Icon`.

The background and device overlays are siblings of the sole scrolling container. Both overlays use the same progressively masked blur component, with reversed direction at the top.

## Connect behavior

The page remains a UI prototype. Buttons expose callbacks and a bubbling `community-action` event; they do not persist changes or navigate by default.

```js
PocketSaga.mount(document.getElementById('app'), communityPageData, {
  compose: () => openComposer(),
  attachment: ({ post, attachment }) => openMedia(attachment),
  comments: ({ post }) => openDiscussion(post.id)
});
```

Supported actions: `back`, `membership`, `options`, `compose`, `sort`, `attachment`, `like`, `comments`. Event `detail` contains `action` and the relevant community/post/attachment. Mount replaces previous content, allowing a context switch without duplicating the frame. Text content uses DOM text nodes rather than HTML interpolation.

The screen keeps a fixed 412:896 aspect ratio. The preview scales the entire device uniformly to fit the available window, up to its natural size. Resizing or browser zoom does not compress the screen or reflow its content.

## Shared GSAP motion

`vendor/gsap.min.js` is the pinned local GSAP 3.13.0 distribution with its license notice retained. Source: https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js.

`PocketSagaMotion.scrollHeader({ scroller, navigation, titleTrigger, actionTrigger, title, actionSlot, duration: .18 })` reveals the compact title after the community name passes the app bar and reveals its circular filter action after the Posts toolbar passes it. The top-right navigation slot can hold another screen’s primary action. The helper returns a cleanup function and respects reduced motion.

Scrolling is entirely native: no snapping, scroll-position tweens, or introduction scaling/fading. A viewport mask fades just the content entering the fixed app bar, together with a progressive blur. Header thresholds use rendered bounds to account for phone scaling and browser zoom; resizing recalculates them. Hidden actions are inert and removed from the accessibility tree.
