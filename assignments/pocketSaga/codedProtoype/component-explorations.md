# Ongoing component explorations

Updated 25 September 2026. This document is the working handoff for components that are being evaluated outside the main PocketSaga prototype. Read it before changing an exploration or moving one into the app. Use the [project documentation hub](../README.md) and [Prism technical reference](../design%20system/README.md) for the shared material, geometry, typography and motion rules that still apply to these experiments.

## Status and boundary

The spoiler component is approved for isolated mock inserts in group feeds. **Never insert it in Discover / For You.** The artwork-based Discover variant remains available only on the standalone preview. Neither variant is registered in the design-system visualization yet.

Previews:
- `http://127.0.0.1:5500/assignments/pocketSaga/codedProtoype/spoiler-component-preview.html`
- Append `?variant=group` for the group-page specimen.

Central sources:
- `components/spoiler-card.js`: both variants, layout settings (`PocketSagaSpoiler.variants`), disclosure state and shared animation.
- `components/spoiler-card.css`: scoped presentation, borrowing the shared Medium mint recipe from `surfaces.css`.
- `components/spoiler-demo.js`: mock copy and placement only. Winden Theories after post 1 (Dark season), Dark after post 2 (episode), Beyond Earth after post 2 (movie). Shorter lists append the example.

`CommunityPage` has one optional call to `PocketSagaSpoilerDemo.insert(page, data)`. Only selected group feeds receive inserts. Mock records never enter `app-data.js`, `PocketSagaData`, Saved, publishing, comments, membership, or route navigation. Their reactions and save icon are display-only; reveal/hide works. Removing the demo script disables all inserts. The preview page loads only the component, so it does not receive automatic inserts. Unmount cleanup disconnects the component's resize observer and cancels active motion.

## Why the spoiler component exists

Watch history should normally prevent PocketSaga from surfacing posts about episodes the viewer has not watched. The important remaining case is a season-wide or otherwise ambiguous discussion that may reveal more than the viewer expects. That content can remain discoverable while its post body, author and reactions are concealed behind an explicit action.

The prototype does not attempt to solve moderation. Manual spoiler tagging, automated intent detection, reporting, and admin review are possible product mechanisms, but they are outside this three-day visual-design exercise. The component demonstrates how potentially unsafe content would be presented after classification.

## Spoiler card: approved direction so far

### Concealed state

- Uses the same artwork-derived blurred material as a normal For You post.
- Keeps the normal 28px card shape and directional material rim. The concealed rim is rendered above the blur with slightly more contrast so the boundary remains legible.
- Shows only information that is safe before disclosure:
  - centered media artwork;
  - a white scope label, currently `Dark · Season 1`;
  - a mint-glass eye action labeled `View potential spoiler`.
- The Dark artwork is 50 × 68px with an 8px radius.
- The artwork, label and action are treated as one centered cluster and shifted 10px upward for optical balance.
- The underlying real post remains visible only as a soft, continuous blur. There is no inner rectangle, hard blur boundary, heavy text shadow or explanatory spoiler subtext.
- The compact state has its own fixed minimum space instead of inheriting the full revealed post height.

Scope-copy rules:

- Season-wide: `Dark · Season 1`.
- Episode-specific: use the form `Dark · S1 · Episode 4`.
- Movie: show the title and `Movie`.
- Never write `All episodes`.

### Revealed state

- Revealing removes the centered artwork and scope label; they are disclosure UI, not duplicated post content.
- The example becomes a normal unjoined-group For You card for `Winden Theories` with its artwork, member count and Join action.
- The post then exposes its community context, title, body, author, type, reaction counts and save action.
- Top inset matches the standard For You card with a group suggestion row: 20px from the card edge.
- A full-width `Hide spoiler` control rests below the post content. It uses neutral material and white text and collapses the card again.

### Motion

- Reveal is a continuous spatial transition rather than an instant state swap.
- The card expands to make room for the real post while the same eye control travels from the concealed center to the bottom and grows into the full-width Hide control.
- Reveal uses 480ms with an eased settle; collapse uses 380ms and reverses the relationship.
- Post content fades and rises into place during reveal and recedes during collapse.
- Repeated taps are ignored while the transition is running.
- Reduced-motion mode switches states immediately.
- Focus follows the toggle without scrolling the feed.

## Files

- `spoiler-component-preview.html` — standalone phone preview and stylesheet/script loading.
- `components/spoiler-card.js` — spoiler-card structure, Join behavior, reveal/collapse state and local-coordinate motion.
- `components/spoiler-card.css` — concealed/revealed geometry, materials, blur, rim and button treatments.
- `components/spoiler-card-preview.js` — sample For You cards and spoiler-card data used by the standalone preview.

The component intentionally reuses the shared PocketSaga helpers and materials: `Artwork`, `AmbientArtwork`, `AuthorMeta`, `ReactionBar`, `Action`, `Icon`, `SeparatedMeta`, `PocketSagaMedia`, Discover post styles, shared surface tokens and tap feedback.

## Things to preserve while iterating

- Keep the preview background off-black and the surrounding cards visually identical to the actual For You environment.
- Keep mock spoiler inserts isolated to the explicitly selected group feeds; never add them to For You.
- Keep the conceal blur continuous to the card edges; do not reintroduce an inset blurred panel.
- Keep the outer directional rim above the blur.
- Avoid extra warning copy below the reveal action.
- Do not place a permanent media header above the revealed post; the group container becomes the post's first content.
- The reveal and hide actions must remain real buttons with universal tap-scale feedback.
- Do not use `Season 1 · All episodes` or equivalent redundant scope copy.

## Open review questions

1. Does the concealed card reveal enough context without exposing the post's argument?
2. Is the compact height correct when it appears between real feed cards?
3. Does the moving toggle feel connected to the expanding card, or should its travel/settle be softened further?
4. Should the revealed Hide control retain the eye icon, use an eye-off icon, or become text-only?
5. How should a joined-group spoiler differ, if at all, from this unjoined-group example?
6. Which feed examples should be marked as season-wide spoilers when the component moves into the app?
7. What metadata is safe for an episode-specific concealed card when watch history is incomplete or uncertain?

## Related explorations not built yet

### Translation affordance

An isolated interactive preview is now available at `translation-component-preview.html`: default Discover post, `?variant=group` for Beyond Earth, and `?variant=comment` for a comment on an Interstellar post. The preview uses the real screen/card primitives, with local Spanish and English sample copy. Approved mock inserts now reuse the same translation component in the app, as described below.

English is shown automatically on initial load, with the compact notice `Translated from Spanish · View original` below the body. View original switches the title and body (or comment body) back to Spanish; `Translate to English` restores English. The row uses a 22px minimum height, no extra top margin, and tighter comment gaps. The original remains recoverable. Names, title/group metadata, author attribution and reactions do not translate. The action has shared tap feedback, keyboard activation, retained button focus, language attributes and a screen-reader status announcement. State changes are immediate, including under reduced motion.

The existing Neutral mint content surface supplies the material; the translation action is deliberately unfilled and subordinate to the content. It is not a primary CTA or a global language setting. The same placement is reused in all three contexts. Local editorial sample translations demonstrate presentation only; automatic detection, network loading/error states and an actual translation service are outside this specimen.

Files: `components/translation-preview.js`, `components/translation-preview.css`, and `translation-component-preview.html`. Browser checked original/translated states in all three contexts. No design-system registration yet.

### Right-to-left / global-audience component

The proposed scalability demonstration is a dedicated Hebrew or other RTL component rather than converting the whole prototype. It should mirror alignment, reading order, metadata, actions and directional icons while continuing to use the same material tokens. This belongs in a standalone preview first and then in the design-system visualization. No RTL component has been implemented yet.

### Design-system registration

After approval, show the spoiler card as a component with Concealed and Revealed states, and show its reveal/collapse movement as a reusable disclosure pattern. Translation and RTL examples should receive their own clearly labeled component demonstrations rather than being mixed into the Material foundations.

## Quick verification

On the standalone preview:

1. Confirm the compact spoiler card sits naturally between two normal For You cards.
2. Confirm the poster, white scope label and View action are centered slightly above the card's optical midpoint.
3. Confirm the outer highlight rim remains sharp above the blurred content.
4. Select `View potential spoiler`; the card should expand, the post should resolve into focus and the control should travel to the bottom.
5. Confirm the revealed group row begins at the same top inset as other For You cards.
6. Select `Hide spoiler`; the card should reverse into its compact state without jumping the feed.
7. Repeat with reduced motion enabled; both state changes should be immediate and remain usable.


## Edge and motion correction — 25 September 2026

The missing rim was caused by the standalone article lacking the `.post-card` pseudo-element setup: its earlier rule supplied a gradient but no generated content or mask. The spoiler stylesheet now defines a complete, pointer-transparent rim above the blurred content in both states.

Reveal/collapse now keeps the sensitive content, cover and toggle mounted in stable containers. Height and button geometry use local CSS pixels (242px compact height), avoiding transformed phone measurements and reparenting. The same easing synchronizes height, button travel/width, content blur/opacity and cover fade; no separate CSS filter transition competes with it. A ResizeObserver updates settled geometry when content or viewport width changes. Browser checked both endpoints and repeat reveal/collapse; JavaScript syntax and all 10 existing tests pass.

## Group-page variant — 25 September 2026

Preview: `http://127.0.0.1:5500/assignments/pocketSaga/codedProtoype/spoiler-component-preview.html?variant=group`.

`PocketSagaSpoiler.create({ variant: 'group', ... })` shares the disclosure state and motion with the For You version. It uses the native group post surface and corner radius, 16px top/side insets and 6px bottom inset. Revealed content follows normal group posts: author, headline/body, reactions, then Hide spoiler. There is no repeated group suggestion, Join row, or media context. A display-only Save icon matches the current standard card layout. The concealed group variant omits artwork because the surrounding page already establishes the title. Its 154px compact state centers only the scope label and reveal action: `Dark · Season 1`, `Dark · S1 · Episode 4`, or `Interstellar · Movie`. Author, text and reactions remain concealed. The For You variant retains its artwork.

The preview mounts the actual shared Winden Theories group page and inserts this variant among normal cards. A second, preview-only atmosphere discussion supplies surrounding content when the catalog has only one group post. The real group route and catalog are unchanged. The group variant is now also used by the approved mock inserts described above.

## Disclosure material — 25 September 2026

Both preview variants now use the shared Prism **Medium mint** rule in `surfaces.css` for View potential spoiler: 10% mint fill, the defined upper-left reflection, 20px blur / 1.12 saturation, directional 1px rim and inset depth. This replaces the custom 18% approximation. Hide spoiler retains its neutral treatment.

The spoiler card rim now uses the standard 1px `--surface-edge` recipe in both states, above the blur. Removed the stronger concealed-state override and extra bottom-right highlight; the Medium mint button material is unchanged.

## Stable disclosure spacing — 25 September 2026

Expanded cards use natural document flow: post content, 12px gap, Hide spoiler, then a bottom inset equal to the side inset (16px group / 20px Discover specimen). Previously the group variant inherited 6px bottom spacing from the ordinary reaction row, which was too tight for a full-width control. Layout measurements now read the natural endpoints in local CSS pixels; absolute positioning and explicit height exist only during animation and are removed afterward. No ResizeObserver or fixed-height calculation controls the settled card. Browser checked desktop and a 320px viewport, including repeated collapse/reveal: group bottom inset stays 16px with no leftover height override.

## Top-anchored disclosure — 25 September 2026

Feeds containing a spoiler disable native scroll anchoring so the browser cannot follow a later post as the card expands. Collapse measurements preserve the scroll range; when collapsing at the end of a feed, only the necessary bottom breathing space is retained to avoid forced scroll clamping. Browser measured identical scrollTop (373px), spoiler top and preceding-card top across reveal/collapse; only the following card moved and returned.

- Translation refinement: no hover underline; the source label, dot and View original are siblings with equal 8px gaps. Original mode shows only the mint Translate to English action. Translation-bearing posts reduce only the gap below their copy by 8px; comments reduce the following gap to 2px. Top spacing stays unchanged.

- Discover translation spacing: retain the standard 12px copy-to-author gap (`margin-bottom: 0` on the translated Discover copy). The tighter bottom gap applies only to group posts and comments.
- Discover translation top spacing is now 12px: the existing 6px copy gap plus 6px row margin, matching the 12px separation before the author below.

- Discover placement trial: translation metadata/action now sits at the bottom right in the reaction row immediately before Save (10px type, equal 6px dot gaps). This supersedes the above/below-copy spacing trial; group/comment placement is unchanged.

- Bottom-right Discover placement was rejected. Restored translation below the body and above attribution, with 12px separation above and below; original 11px translation type and standard reaction/Save layout restored.


## Translation mock inserts — 25 September 2026

`translation-card.js` / `translation-card.css` own shared disclosure and spacing; the standalone preview consumes them. `translation-demo.js` is the optional mock installer loaded by Discover, Home, group and post entry pages.

- For You: a separate Interstellar translation post in fourth position, after the first three regular posts; no inserts in Your posts, Saved or Your groups.
- Group feeds: Winden Theories, Dark (`dark`) and Beyond Earth (`earth`) receive a separate translation post immediately after their spoiler specimen. Dark examples use Winden-specific Spanish/English copy.
- First seeded For You post (`winden`): its post detail receives a new translated comment, with a local display count including the specimen.
- All mocks render English first. View original / Translate to English is their only interactive action. Card clicks, Join, reactions, Save, reply and comment focus are disconnected; the normal surrounding cards retain their behavior.
- Mock records never enter the shared catalog/store or Saved. Removing the optional demo script disables inserts. Shared components and previews remain usable independently.

Browser checked the For You card's inert body and working translation toggle, the first post's extra comment, and Winden Theories with adjacent spoiler/translation cards. Existing 10 tests pass.

- The inserted translated comment uses a mock-only author, Mateo R., with the amber avatar, distinct from Lucía M.’s existing English comment.
