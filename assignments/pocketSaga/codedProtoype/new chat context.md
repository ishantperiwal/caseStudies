# PocketSaga coded prototypes — new chat context

Read this first when adding or improving screens. Then inspect the actual files: this document records the current implementation and user preferences, not a substitute for the code. Later user instructions take precedence. Keep this context updated when behavior or structure changes.

## Project and entry point

This is a browser-based mobile UI prototype for PocketSaga, a community/discussion experience around movies and shows. The implemented screen is **Beyond Earth**, an Interstellar community with membership controls, a composer, posts, authors, media attachments, and reactions.

Workspace: `assignments/pocketSaga/codedProtoype/` (the spelling `codedProtoype` is intentional in the existing path).

Open [community.html](community.html). It was previously `test.html`; that old filename no longer exists. The preview uses plain HTML, CSS, and JavaScript with no framework, bundler, or build step. Google Fonts is the only remote presentation dependency; local font fallbacks are defined. GSAP is vendored locally.

Keep runnable screens at this folder’s top level, named for the screen. Put supporting code/assets in `components/`. This context document is an explicitly requested top-level documentation exception.

## File map

| File | Purpose |
| --- | --- |
| `community.html` | Small runnable entry point; loads styles and scripts in order. |
| `components/components.js` | DOM component library exposed as `window.PocketSaga`, page assembly, preview scaling, mounting and cleanup. |
| `components/community.css` | Shared visuals, theme tokens, device frame, spacing, scrolling, masks, and blur. |
| `components/page-data.js` | `window.communityPageData`: community, theme, device, viewer, labels, and posts. |
| `components/preview.js` | Mounts community data into `#app`; future action handlers can be supplied here. |
| `components/motion.js` | `window.PocketSagaMotion.scrollHeader`: shared GSAP title/action reveals. |
| `components/vendor/gsap.min.js` | Pinned GSAP 3.13.0; retain its license notice. |
| `components/icons.js` | Original local SVG paths exposed as `window.PocketSagaIcons`. |
| `components/assets/interstellar-1.jpg` | Artwork shared by the background, community identity, and attachment. |
| `components/README.md` | Component API and reuse notes. |

Script order: icons → GSAP → motion → components → page data → preview. Use deferred classic scripts so opening the HTML directly still works. Image paths in page data resolve relative to the HTML document, not the data script.

## Reusable components

- Device: `PhoneFrame`, `AtmosphericBackground`, `StatusBar`, `HomeIndicator`, `ProgressiveBlur`.
- Page: `CommunityPage`, `CommunityHeader`, `Composer`, `FeedToolbar`, `PostCard`.
- Card: `AuthorMeta`, `MediaAttachment`, `ReactionBar`.
- Primitives: `Action`, `Avatar`, `Artwork`, `Icon`.

`PocketSaga.mount(target, data, handlers)` creates the community preview and replaces previous content. It disconnects the previous mount’s observers/listeners and stops its animations. Its return value is the page element.

The DOM helper must retain `.flat(Infinity)` when assembling children. Flattening only one level previously caused the composer’s avatar and placeholder to render as `[object HTMLSpanElement]`. User content is inserted as text nodes; `innerHTML` is used only for trusted local icon paths.

Actions are semantic buttons with accessible labels. They emit a bubbling `community-action` event and can invoke supplied handlers: `back`, `membership`, `options`, `compose`, `sort`, `attachment`, `like`, `comments`. No backend, persistence, actual media playback, or default navigation is implemented. The filter is a visual control/action hook, not an implemented filter menu.

## Accepted visual direction

Dark, cinematic, semi-transparent surfaces; muted green accents; Newsreader headings and Manrope UI/body text. Preserve the atmospheric artwork and subtle card treatment when making unrelated changes.

- Phone casing: **438px** natural outer width. Inner screen: **412:896** fixed aspect ratio. The whole device scales uniformly down to fit the window, never compressing just its height. Casing, controls, text, and content scale together. This is an iPhone-style approximation, not an exact hardware preset.
- The background stays fixed inside the phone. Only `.feed-scroll` scrolls.
- Status indicators and home indicator stay fixed, without opaque bars.
- Feed side padding: **16px**.
- Post card padding: **16px top, 16px sides, 6px bottom**.
- Author/avatar/time row comes **above the headline**, with **16px** spacing below it.
- Do not repeat “Interstellar · Movie” above each post; the context belongs in the community header.
- Gap below Posts toolbar: **12px**. Sort control is icon-only, with an accessible label.
- Card fill has a faint top-left highlight and very subtle inset edge highlights. Keep it translucent, not a solid bright card.
- App-bar actions use the original faint circular fill, 44px touch targets, and **20px backdrop blur**. A darker button fill and extra visible edges/shadows were tried and rejected. Improve legibility by softening content behind buttons, not making them dark.

## Current scroll behavior — important

**Natural scrolling. No snap, scroll-position tween, or whole-introduction scale/fade.** Earlier experiments with snapping and shrinking were replaced at the user’s request; do not restore them by accident.

1. The back button remains fixed in the app bar below the device status area.
2. Content scrolls normally and dissipates into a soft blur/fade behind the app bar.
3. When the large community name passes the app bar, a centered compact community name appears.
4. **Posts scrolls away; it is not sticky.**
5. Once the Posts toolbar passes the app bar, a circular filter action appears in the **top-right action slot**. This slot is intended for a screen-specific prominent action on future screens.
6. Scrolling back reverses the title/filter reveals. Their thresholds are independent.

`scrollHeader` accepts DOM references: `scroller`, `navigation`, `titleTrigger`, `actionTrigger`, `title`, `actionSlot`, plus optional reveal `duration` (default .18 seconds). It uses rendered element bounds so browser zoom and device scaling do not distort thresholds. GSAP animates only header reveal opacity. Hidden header elements are inert and aria-hidden; the scrolled-out toolbar becomes inert. Reduced-motion preferences are respected. The helper returns cleanup.

## Blur tuning — preserve these recent decisions

The user likes the current **softness and transition length**. Recent changes only shifted the effect downward in small steps, totaling **12px**; avoid changing the length when asked to move it.

- `.screen-top-blur`: top **12px**, height **135px**, bottom **147px**.
- Feed fade mask: transparent through **88px**, then stops at **98 / 108 / 118 / 129 / 140px**, fully visible at **147px**. Both standard and WebKit masks must match.
- Top blur uses five layers: `.5 / 1.5 / 3 / 6 / 10px`, with eased masks.
- Back-button app bar: top **59px**, height **44px**. Introduction begins at **135px**.
- Content may pass visibly behind the translucent back button; its own blur protects readability. Do not force a hard content cutoff at the button’s bottom.
- Bottom uses a transparent progressive blur behind the home indicator. Do not restore a solid bottom fill.

Avoid separate opaque background strips behind the status bar/navigation/toolbar. Those produced visible seams. Keep device controls outside the scrolling content and above the blur. Changes to stacking contexts, masks, and overflow can affect backdrop blur: visually check them.

## Adding another screen

For another community context, copy the small HTML entry and the data file, change the copied entry’s data reference, and edit the data. Reuse components/styles/motion. If retaining `preview.js`, the new data script should set `window.communityPageData` in that page.

For a different screen layout, create a dedicated page component/entry script inside `components/` and compose the existing device and UI primitives. `PocketSaga.mount` currently assembles `CommunityPage` and expects community-specific selectors; adapt the mounting API or add a screen-specific mount rather than passing incompatible DOM to it. The top-right navigation slot and `scrollHeader` can be reused with appropriate triggers.

Keep theme/content separate from markup. Optional attachments and an empty posts list already have rendering paths. Do not duplicate entire card markup per post. Keep shared changes intentional: they affect every screen that imports them.

## Design source

The pen.dev canvas was accessible in the previous session at:
`assignments/pocketSaga/pen dev/pocket saga designs.pen`

Relevant frame: `m6MegG`, “04b · Interstellar / Beyond Earth group feed”. Other screens exist in that design file. Recheck the live app state before relying on IDs or selection. Access `.pen` files only with pen.dev tools; do not parse their encrypted contents as text. The HTML has evolved through this conversation, so the canvas is a reference rather than a guaranteed current match.

## Verification and known limits

Run `node --check` on edited JavaScript and verify relative HTML/asset paths after moving files. Earlier code-level checks covered component rendering, alternate context/empty feed, action hooks, header thresholds in both directions, cleanup, and unchanged scroll position. These checks were ad hoc; there is no committed automated browser test suite.

Browser security previously blocked opening the local file through browser automation. Later visual feedback came from user screenshots; the current complete page has **not** had a fresh automated visual verification. Do not describe syntax or mocked geometry checks as browser verification. Use an authorized available preview surface and respect tool restrictions.

When visually checking, cover initial view, slow scroll into the app bar, Posts passing the action threshold, reverse scroll, narrow windows, and browser zoom. Watch for hard blur edges, content interfering with buttons, duplicate filter controls, blank header gaps, and stretched device proportions. Keep changes scoped and do not overwrite unrelated workspace edits.
