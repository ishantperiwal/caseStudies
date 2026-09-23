# PocketSaga — design.emry

Design rationale, pattern inventory, and presentation brief · 22 September 2026

## How to use this document

Use this as the source brief for a future visual presentation, not as a claim that the prototype is a finished design system. It records the current implementation, proposes semantic token names, and identifies decisions that still need validation. Proposed names below are documentation proposals, not newly implemented CSS variables. No application styles were changed for this audit.

The review covers Discover, its four tabs, carousel variants, Community, Post and comments, reply threads, New Post and its selection sheets, the notification overlay, and Notification History. It is based on the current source and the screenshots and iteration history in this task. It is not a fresh visual verification of every screen, device, and interaction state.

## 1. The central idea: borrow the atmosphere

> The artwork sets the mood. PocketSaga carries that mood into the conversation.

Film and television key art already expresses a creative intention through color, lighting, composition, and texture. PocketSaga uses that existing visual language to give discussions a sense of belonging to the title being discussed.

A cold blue image, a warm brown scene, or a stark pale poster can lend a different atmosphere to the same interface. These are examples of visual treatment, not fixed rules about genres. The interface does not need to infer “horror” or invent a separate theme for every title.

The prism is a useful metaphor: a concentrated source image becomes a softer field of color around the content. This is a design metaphor, not a claim of physically simulated refraction. The poster stays recognizable where identification matters; its ambient version becomes quiet enough for reading.

Glass is the connecting material. It lets the title’s atmosphere remain perceptible while providing boundaries for controls, groups of content, and focused tasks. The aim is a coherent, restrained experience that feels considered and premium. “Premium” is a design intention, not a measured usability outcome.

### Premium as an intended impression

We aim for a premium feel through restrained, consistent material detailing. Glass lets us express light and depth while carrying the atmosphere of the artwork. The claim is about the quality of the execution, not an inherent superiority of transparent interfaces.

The intended lighting convention is a soft source toward the top-left: a subtle edge highlight catches that light, and a restrained fill falls away across the surface. Repeating this convention gives separate components a related material character. Current gradients suggest this direction; they are stylized cues, not a physically simulated lighting system. Secondary edge catches may describe form without becoming competing bright outlines.

Glass can evoke polished, carefully finished objects, but the association is contextual. Do not claim that people are inherently attracted to transparency, or that glass universally produces a premium perception. A credible premium impression depends on consistent lighting, restrained highlights, smooth motion, clear hierarchy, and legible controls. Validate the perceived result with users before presenting it as an established outcome.

Presentation wording: **“We use restrained, consistent material detailing to aim for a premium feel. Translucent surfaces carry the artwork’s atmosphere, while soft directional highlights give the interface a coherent sense of form.”**

### Terms to use in the presentation

- **Titles** or **film and television titles:** the movies and series people discuss.
- **Key art / poster artwork:** the visual source of the atmosphere.
- **Atmosphere:** the muted, distributed visual context behind the interface.
- **Translucency:** partial visibility through a surface; more accurate here than complete transparency.
- **Affordance / interaction cue:** what suggests an element can be tapped. Avoid “affordability.”
- **Material hierarchy:** how surface treatment helps distinguish content, controls, and overlays.

## 2. Design principles

### Let the title supply the atmosphere; let the product supply the structure

The artwork can change while reading order, typography, navigation, and action semantics stay familiar. Do not recolor every icon and label from the poster. Mint remains the product’s stable interaction accent.

### Use containers with a purpose

A glass container can define a tap target, collect related content, or distinguish an overlay from its background. A container is not automatically a button: the writing area and notification groups also use surfaces. Pair clickable containers with labels, icons, placement, and feedback.

Inline community links and reply actions can use mint without a separate pill. This keeps secondary actions recognizable without surrounding every word with extra chrome.

### Preserve atmosphere while making actions recognizable

Translucent controls allow some of the artwork-led atmosphere to continue through their boundaries. This reduces the visual separation that an opaque patch of interface color can create. The desired character is **restrained, cinematic, and materially refined**, while remaining approachable.

This is a contextual choice, not a claim that opaque controls are inferior. Solid fills can provide more predictable contrast. PocketSaga trades some of that predictability for atmospheric continuity, and must support that choice with sufficient tint, blur, edge definition, and readable labels.

Presentation wording: **“Glass lets us give important actions a clear, tappable form without visually disconnecting them from the atmosphere behind them.”**

The container boundary, label, icon, placement, and press feedback work together to suggest interaction. The actual hit area supports touch usability. Translucency alone does not establish tap affordance, particularly because some non-interactive content also uses glass surfaces.

### Express feedback through the same material

A restrained press compression and a subtle increase in surface light acknowledge a tap without introducing a different visual language. Current shared press treatments add faint highlight pools near the upper edge; like and save actions use more expressive confirmation animations. Keep those distinct roles: press feedback acknowledges input, while persistent selected or filled states communicate the result.

Describe this as a shared interaction vocabulary, not a claim that every control currently has identical feedback. Labels, recognizable symbols, and adequate targets remain necessary even when motion and material cues are present.

### Use shape to distinguish roles

Rounded forms support the intended approachable character. Their degree of roundness follows the component’s role rather than a rule that everything should become a pill.

- **Pills:** compact actions and selections, such as tabs and action buttons.
- **Rounded rectangles:** reading, writing, and grouped-content surfaces.
- **Circles:** identity markers and compact icon controls.

The hero’s “Write your thoughts” invitation is a useful example. Its rounded rectangle suggests a writing surface and aligns with the card’s text and margins, even though tapping it opens the editor rather than accepting text in place. The circular avatar identifies the person; the enclosing surface serves a different role and need not repeat that circle. A pill would give this invitation more of a standalone-action character.

Use **related corner geometry** for nested surfaces: inner radii generally decrease with the inset so the space between curves feels balanced. Treat this as an optical relationship, not a rigid formula or a claim that the current prototype uses mathematically concentric curves everywhere. Glass can reduce the visual weight of nesting, but each additional boundary must still clarify grouping or interaction.

Presentation wording: **“We use rounded forms with a deliberate shape hierarchy. Pills identify compact actions and selections; rounded rectangles support reading and writing. Related corner geometry keeps nested surfaces calm and orderly.”**

Do not equate pills with playfulness, rounded rectangles with seriousness, or rounded corners with proven usability. Shape, color, proportion, typography, and motion contribute together to the intended character.

### Use translucency selectively

A faint fill works over a calm background. Controls passing over detailed content need more protection. The sticky tabs, composer, and community selector therefore use stronger fills than quiet content surfaces. Visibility takes precedence over maximum transparency.

### Make depth explain behavior

Backdrop blur separates a foreground control from content behind it. A dark scrim signals a modal task. Edge highlights describe a surface boundary. Motion explains where content came from and where it goes.

The system is **blur-led, not shadow-free**. Upward shadows support the navbar and comment composer; downward shadows support sticky tabs. These are restrained supporting cues, not the central visual language. Shadows and blur serve complementary purposes: shadows separate surfaces, while blur softens the detail behind them. The choice is contextual, not a judgment that shadows are old-fashioned or inferior.

### Preserve orientation

Tab order determines slide direction. A selected pill moves across the tab row. Unread notifications appear over the existing screen before history becomes a separate destination. These choices preserve context while the user changes focus.

### Delight should confirm a result

The heart bounce and filled particles celebrate a like. The floating “Saved” label confirms saving. Keep feedback brief and local to the action; respect reduced-motion preferences.

## 3. What the atmosphere actually does today

The current implementation uses a shared `AmbientArtwork` / `AtmosphericBackground` system, with intentional screen-specific treatments.

1. Sample each source poster and classify it as **bright** or **not bright** using luminance and highlight coverage. This is deterministic image analysis, not genre or emotion recognition.
2. Extract a dominant chromatic hue and a related secondary hue. Near-neutral and extreme-lightness pixels are excluded from palette selection. Saturation is deliberately limited.
3. Generate a broad, muted color field. Add a blurred, desaturated version of the original poster as texture.
4. Composite this over a dark foundation. Bright artwork receives an additional darkening treatment.
5. Place legible surfaces and text above the atmosphere.

**Current defaults:** poster texture opacity 22%, saturation multiplier 0.45, blur 28px, brightness multiplier 0.72; ambient composite opacity 58%. These values belong to different layers and should not be presented as one opacity value.

**Discover hero:** texture opacity is increased to 52%, the palette layer is reduced to 55%, and a spatial mask fades the hero atmosphere toward the feed. The active title drives background crossfades.

**Discover feed:** a dark base of `#121415` emerges as the hero leaves. Post-specific atmospheric treatments provide contextual color. Their details should be shown through screenshots rather than described as literal poster replicas.

**Community, Post, New Post:** use the shared atmosphere mechanism with the relevant artwork. New Post changes its atmosphere when a title is selected. It has its own base background, so “same system” does not mean pixel-identical output.

**Notification History:** intentionally uses a quiet, slightly green-black background without poster atmosphere, because it aggregates activity across titles. The notification overlay retains the existing screen behind a darkened blur.

**Important implementation distinction:** in the enabled palette mode, the shared legacy veil background is transparent and the ambient wrapper no longer applies its old whole-image blur. Texture blur and brightness still apply inside it. Do not show the legacy blurred-poster configuration as though it were the current default.

## 4. Screen and state inventory

| Screen / state | Purpose and patterns | Presentation emphasis |
| --- | --- | --- |
| Discover, hero visible | Greeting, title carousel, compose entry, tabs, feed, bottom navigation | One title supplies an atmosphere without redesigning the app |
| Discover, sticky tabs | Persistent tab selection, protected reading boundary, darker feed context | Visibility changes with context; layer order matters |
| Your posts / Saved | Same post-card language, different content sets | Reuse and spatial tab navigation |
| Your groups | Joined groups followed by recommendations | Grouping and a restrained uppercase section label |
| Community | Artwork-led context, membership actions, feed | The same material system supports a title-specific destination |
| Dedicated Post | Author and tappable community, editorial title, body, media identifier, reactions, share, save | Reading hierarchy and secondary inline actions |
| Comments / reply thread | Comment surfaces, fixed composer, focused thread overlay | Depth communicates a narrower conversational context |
| New Post | Media selector, flexible writing area, Clip/Scene tools, community destination and Post action | Writing takes remaining space; controls remain anchored |
| Title suggestions | Centered rows, fewer items at top for the default five-item set, search | Lightweight selection; Dark sits above paired suggestions |
| Select community | Bottom sheet, scrollable choices, faded list boundaries | Focused selection while retaining screen context |
| Unread notifications overlay | Title, staggered notification cards, history action, outside-dismiss | Quick triage without immediately leaving Discover |
| Notification History | Date headings, read/unread cards, compact metadata | Calm cross-title utility destination |

### Carousel variants

Type A preserves the stacked treatment (`discover.html?carousel=a`). Type B is the default: one previous and one next card peek from the edges, side cards are smaller and darker, and the incoming card grows into the center. Type B has no added outer card shadow. Parked-artwork blur and the experimental top shine were removed; do not depict either as an accepted design feature. The active reflection is a separate depth cue.

## 5. The surface grammar

A reusable surface recipe consists of **fill + light wash + edge highlight + optional backdrop blur + interaction state**. Use the shared top-left lighting convention to relate these surfaces; adjust intensity for readability rather than introducing a new lighting direction for every component. The exact visual result depends on what is behind it.

| Role | Current recipe / representative value | Use and constraints |
| --- | --- | --- |
| Quiet surface | `--surface: #FFFFFF08` ≈ 3.1% white, plus shared light wash and rim | Comments and supporting content; insufficient alone over busy artwork |
| Neutral control | `--control: #FFFFFF0C` ≈ 4.7% white | Circular controls and neutral pills, with contextual overrides |
| Shared rim | 1px masked gradient, strongest near top-left | Directional highlight rather than a uniform bright outline |
| Discover post | `#15191B70` ≈ 44% opacity; 16px backdrop blur; 28px radius | Content surface with title-specific atmosphere; lower-right rim accent peaks at 2.5% white |
| Primary / prominent selection | `rgb(128 213 169 / 25%)` plus mint wash and rim; 18px blur | Write action, membership primary treatment, selected navigation and sticky tab marker |
| Quiet selection | `rgb(178 219 194 / 14%)` plus pale mint wash | Non-sticky Discover selection; should not compete with Write |
| Sticky tab base | `rgb(35 39 37 / 78%)` | Stable neutral protection under the travelling mint marker |
| Comment composer | `rgb(38 46 43 / 48%)`; 22px blur | Persistent input over scrolling content; fill strengthens on focus |
| Community destination | `rgb(43 49 47 / 76%)`; brighter directional rim | Secondary action that needs more separation; 18px left padding |
| Read notification | White gradient 4% → 2.5% | Quiet but still visibly bounded |
| Unread notification | Mint gradient `#BDE0CA26` → `#BDE0CA0D` ≈ 15% → 5% | Activity emphasis, with avatar badge and content hierarchy |
| Notification scrim | Black 55% + 16px backdrop blur | Modal focus over the existing screen |
| Community picker | Dark translucent sheet, 18px backdrop blur | Focused choice; list boundary uses an opacity mask |

The generic `.glass-surface` class supplies shared paint and edges; it does **not** guarantee a particular blur strength. The title selector currently omits its extra backdrop blur to reduce a reported rendering seam. Glass-like appearance does not require every component to perform a separate blur.

### Interaction hierarchy

1. **Primary:** contained mint treatment for an important action or active navigation state.
2. **Secondary:** neutral glass container, clear text/icon, adequate target area.
3. **Inline / tertiary:** mint text or icon without additional container, such as a community link or Reply.
4. **State feedback:** filled heart/bookmark, selected marker, unread tint, disabled styling, focused input.

Mint is an invitation to interact and a state signal—not a guarantee that everything mint is clickable. Static context text also uses mint today; see the audit below.

## 6. design.emry token proposal

Separate **primitives** (raw values), **semantic roles** (why a value exists), and **component recipes** (how several values compose). Do not turn every historical one-off value into a permanent token.

### Palette for the future presentation

These are source values, not sampled final glass colors. Show translucent swatches over both a dark base and two contrasting artworks.

| Proposed semantic token | Current value | Role |
| --- | --- | --- |
| `color.canvas.base` | `#080A0B` | Main off-black foundation |
| `color.canvas.feed` | `#121415` | Discover scrolled-feed base |
| `color.canvas.history` | `#0D1110` | Quiet slightly mint history background |
| `color.canvas.editor` | `#0E0F10` | New Post foundation |
| `color.text.primary` | `#EEF2E9` | Off-white titles and primary labels |
| `color.text.body` | `#AFBCB5` | Shared feed body text |
| `color.text.muted` | `#A3B4AD` | Metadata and secondary labels |
| `color.text.reading` | `#CDDBD3` | Dedicated post/editor reading copy |
| `color.accent.mint` | `#BDE0CA` | Stable product accent |
| `color.text.onMint` | `#E3F8EB` | Text on prominent mint glass |
| `color.feedback.like` | `#E4B1B3` | Notification like badge accent |
| `color.feedback.likeSurface` | `#432E32` | Like badge background |

Group mint and on-mint text under **Primary accent**. Group the like badge accent and its surface under **Secondary accent & feedback**; these are component-specific supporting colors.

For the main palette slide, emphasize base, feed, primary text, muted text, and mint. Put the additional roles in a supporting specification. Keep **artwork-derived colors** in a separate lane: cold blue, warm brown, muted red, pale gray are contextual examples, not fixed brand tokens. Extract the actual swatches from chosen demonstration assets when preparing the deck.

### Other token families

| Family | Current anchors | Proposed direction |
| --- | --- | --- |
| Typography | Manrope for UI/body; Newsreader for editorial titles | Name roles rather than fonts alone |
| Screen title | Newsreader 20px / 24px, weight 500; optical 2px adjustment | `type.screenTitle` |
| Feed title | Newsreader 22px / 28px, weight 500 | `type.feedTitle` |
| Post title | Newsreader 30px / 1.18, weight 500 | `type.postTitle` |
| Hero title | Newsreader 28px / 1.1, weight 500 | `type.heroTitle` |
| Notification summary | Manrope 14px / 1.55 | `type.activitySummary` |
| Section label | 12px, weight 600, uppercase, 1px tracking | `type.sectionLabel` |
| Spacing | 4, 6, 8, 12, 16, 20, 24, 32px appear frequently | Small core scale; retain 6px for Discover title-to-body gap |
| Radius | 14px hero composer; 16px group inset; 20px standard cards; 24px hero/thread; 28px Discover posts | Role-based geometry; review inner/outer radii together with inset spacing; full pills use a pill radius |
| Controls | Header circles 44px desktop, 42px mobile; tabs 38px minimum; detail pills 44px; destination 52px | Separate visible size from interactive target size |
| Surface blur | 16, 18, 22px | Small named material scale, chosen by role |
| Edge blur | Bottom: 1, 3, 6, 12px layers; sticky top now uses the same strengths | Matching strengths do not mean matching masks or perceived blur |
| Boundary scrim | Sticky top black gradient peaks at 35% | Keep independent of blur and fade distance |
| Supporting shadow | `0 -2px 24px #00000052`; downward counterpart for sticky tabs | About 32% black, reserved for persistent controls |

### Spacing and roundness: working semantic rules

These are proposed semantic ranges grounded in the prototype, not a claim that every existing component already conforms.

- **Inline: 4–8px.** Keep icons, labels and metadata together. Existing 5px optical gaps are valid exceptions.
- **Reading: 6px.** Preserve the explicit Discover post title-to-body gap; do not apply it indiscriminately to every text block.
- **Related items: 12–16px.** Separate repeated cards and adjacent controls; notification cards use 12px separation and a 16px avatar-to-copy gap.
- **Inset: 16–24px.** Give content breathing room inside surfaces. Insets are independent of corner radius.
- **Sections: 24–32px.** Make separate content groups more distinct than items within a group.

Use the smallest gap that makes the relationship clear. Increase spacing between groups before adding another container. The 4px family is the baseline, with deliberate reading and optical exceptions.

Roundness follows role: composer 14px, group inset 16px, standard cards 20px, hero/thread 24px, Discover posts 28px. Compact action pills use full rounding; circular controls use equal dimensions and 50% radius. Inner radii should visually relate to the enclosing curve and inset, not automatically copy the outer radius. The rule is optical consistency, not a universal subtraction formula.

## 7. Motion rules for the presentation

- A travelling selected surface sits **above stable pill bases and below icons/text**. It must not disappear under a container during a transition.
- Selecting a tab to the right sends outgoing content left; incoming content enters from the right. Reverse for a leftward selection. Current distances are 20px out / 24px in, with fade and 4px transition blur.
- In sticky mode, incoming content resets to its top while invisible. Do not combine this with a visible vertical scroll animation.
- Notification cards use staggered slide, opacity, and blur transitions on entry, with an exit transition as well. Outside-tap dismisses the panel.
- Likes and saves respond locally with a compression and elastic release; persistent filled icons communicate state after decorative feedback ends.
- Reduced-motion alternatives should preserve the state change without requiring the movement to understand it.

Presentation instruction: use a short recording for these examples. A static slide cannot prove temporal continuity or directional coherence.

## 8. Inconsistencies and open issues

These are findings and recommendations, not changes applied during this audit.

| Finding | Implication | Recommended next step |
| --- | --- | --- |
| Numerous late CSS overrides and selectors with different specificity | The selected marker actually remained behind containers despite earlier edits | Consolidate accepted component recipes and verify computed styles in both sticky and non-sticky states |
| Mint appears on static context as well as links | “Mint always means clickable” is not true today | Describe it as an accent/state cue, or distinguish static metadata from interactive text |
| Top and bottom blur use equal strengths but different masks and extents | They need not look identical | Compare over the same content; tokenise strength separately from coverage and mask |
| Picker list fade is an opacity mask, not a progressive blur | Calling every soft boundary “blur” misrepresents the implementation | Label effects accurately in the presentation |
| Header buttons differ between desktop and phone; several inline actions have small heights | Consistency and touch comfort need checking | Define visible size plus hit area; verify actual targets, not just circular artwork |
| `.phone-case :focus, :focus-visible` removes outlines globally; notifications have a local exception | Keyboard focus can be invisible elsewhere | Add a shared visible keyboard-focus treatment before claiming accessibility readiness |
| Read/unread distinction depends substantially on tint | State may be subtle over some backgrounds | Evaluate an additional persistent non-color cue without restoring verbose card content |
| Metadata uses mixed compact and long timestamps across contexts | May feel inconsistent if presented as one rule | Define timestamps by context, then unify those with the same role |
| Body copy uses several nearby colors and 13/14/15px roles | Some hierarchy is intentional; some may be accumulated tuning | Keep named reading roles and collapse unexplained duplicates |
| New Post and History use different base blacks | Could be intentional contextual variation | Retain as named roles or converge after comparison; avoid “all pages use exactly the same background” |
| Community selector has a custom stronger fill; title selector omits blur | Useful visibility/rendering exceptions, not a fully uniform recipe | Document these as material variants rather than hidden exceptions |
| Notification edge hairline was accepted after clipping fixes altered the casing | Known preview rendering limitation remains | Do not reintroduce the rejected clipping change; recheck separately for production |
| Title selector previously showed a focus-time strip; extra blur was removed | Fix is not proof of cross-browser robustness | Check focus/resize states on real devices before calling it resolved universally |
| Phone appeared visually denser/larger than expected at 100% to the user | Device/browser scaling is not validated across phones | Demonstrate at a disclosed zoom; do not market 90% browser zoom as a responsive solution |
| Clip and Scene controls currently show future-pass notices | Some flows are prototype placeholders | Label them honestly; do not imply playback/upload is complete |

Contrast is not certified by this audit. Translucent surfaces must be tested on their composited backgrounds, especially pale posters, scrolling high-detail content, selected tabs, disabled actions, and muted metadata. Color values alone do not establish readability.

## 9. Suggested presentation sequence

| Slide | Main message | Visual evidence to prepare |
| --- | --- | --- |
| 1. The artwork sets the mood | Bring the title’s atmosphere into its conversation | One poster beside the corresponding screen |
| 2. Borrow, then quiet | Preserve identity while reducing visual competition | Poster → muted palette → blurred texture → finished screen |
| 3. A stable interface, changing atmosphere | Context varies; product structure stays familiar | Same layout using Dark, From, and Interstellar |
| 4. Glass with a job | Surfaces preserve atmosphere while making important actions recognizable; shape distinguishes roles | Annotated content card, neutral pill, hero composer with circular avatar, mint selection, inline community link |
| 5. Reading through atmosphere | Typography and contrast carry the discussion | Dedicated Post with clear title/body/meta hierarchy |
| 6. Material detail and perceived refinement | Consistent directional light, restrained rims, blur, and selective shadows create coherent form; premium is the intended impression | Enlarged top-left edge/fill detail, layer diagram, and sticky header/composer examples |
| 7. Navigation has direction | Motion explains relationships | Recorded tab change and Type B carousel swipe |
| 8. Focus without losing place | Overlays narrow attention while preserving context | Notification overlay and community/reply sheet |
| 9. Writing remains the task | Flexible editor and anchored actions | New Post, title selection, community selection |
| 10. The system underneath | Small stable palette, semantic roles, artwork-derived atmosphere | Swatches, surface recipes, typography and state matrix |
| 11. What we learned | Visibility limits and restraint shaped the result | Type A vs B; removed shine; stronger neutral selector; brief unresolved audit |

Do not invent research outcomes. Present decisions as rationale and prototype observations unless later supported by user testing. Show only accepted states as the final design; label alternatives as explorations.

## 10. Instructions for whoever makes the visual deck

- Use actual prototype captures. Prepare unscrolled and sticky Discover, all four tabs, one Post, Community, a reply thread, New Post, both selection flows, unread notifications, and history.
- Use the same capture dimensions and disclosed zoom for comparison slides. Keep native phone screenshots separate from scaled desktop casing captures.
- Include a bright artwork example as well as dark artwork; dark-on-dark alone cannot demonstrate the system’s robustness.
- Include a shape comparison: a compact action pill, the rounded-rectangle hero composer, and its circular avatar. Annotate role, inset, and related corner geometry; do not imply one shape is universally more premium.
- Include default and pressed close-ups to show the subtle material highlight and compression, alongside the persistent state that follows the action.
- Show translucent swatches over real backgrounds. Never imply a glass recipe is a single flat hex color.
- Use Manrope for explanatory copy and Newsreader for key statements if the presentation tool supports the fonts.
- Keep slide copy concise: one claim, one visual demonstration, one short reason. Put exact tokens and caveats in speaker notes or appendix.
- Explain premium through execution: consistent top-left lighting cues, restrained highlights, clear hierarchy, and polished transitions. Avoid universal claims about glass or innate attraction to transparency.
- Use actual masks and blur labels in diagrams: **background texture blur**, **backdrop blur**, **opacity fade**, **scrim**, **edge highlight**, **supporting shadow**.
- Show the brand accent as stable and poster colors as contextual. Avoid turning the deck itself into an aggressively tinted rainbow.
- Include a small state comparison: default / pressed / selected / focused / disabled / read / unread. Only label states that exist or explicitly mark them proposed.
- If a known visual artifact remains, acknowledge it as a prototype limitation. Do not silently alter the screenshot and call it implementation evidence.

## 11. Source map

Paths below are relative to this file.

- [Shared components](components/components.js): atmosphere composition, controls, post cards, progressive blur.
- [Media treatment](components/media-treatment.js): luminance classification, palette extraction, texture configuration.
- [Shared styles](components/community.css) and [surfaces](components/surfaces.css): primitive colors, typography, glass recipes, highlights, selection and shadows.
- [Discover styles](components/discover.css) and [behavior](components/discover.js): tabs, sticky atmosphere, feed and navigation.
- [Carousel](components/card-deck.js) and [styles](components/card-deck.css): variants, focus and reflections.
- [Post](components/post.css) and [reply threads](components/reply-thread.css): reading, comments and focused conversation.
- [New Post](components/create-post.css) and [behavior](components/create-post.js): writing, selectors and sheets.
- [Notifications](components/notifications.css): read/unread treatment, overlay and history.
- [Motion](components/motion.js): selection, scroll transitions and feedback.
- [Mobile overrides](components/mobile.css): edge-to-edge viewport and header control sizing.

### Next decisions before visual production

Confirm the main comparison titles, choose whether the deck presents Type B alone or includes Type A as exploration, and decide which audit items to fix before capturing. Preserve the central proposition throughout: **the atmosphere belongs to the title; clarity and interaction belong to PocketSaga.**

## Design-system playground — implementation update, 22 September 2026

A separate [visual playground](../design%20system/index.html) now accompanies this brief. Its [README](../design%20system/README.md) records the full view inventory, implementation parameters, controls and outstanding findings.

Views: Material, Background, Shapes, Color, Spacing & roundness, Font & typography, and Avatars. Presentation copy stays minimal. Shape diagrams use actual corner roles; typography uses real copy; avatars use the shared renderer. The color view separates primary mint accents from secondary like-notification feedback colors.

Material construction is now **Fill → Tint → Wash & blur → Edge → Feedback**. It starts fully enabled; Fill is permanent. Selecting a step applies its predecessors; selecting the current step again returns to Fill. The centered neutral metaball controls connect only completed steps, with equally bright completed labels. Background construction has a separate fully-off state.

The playground fixes material blur at 18px, with 1.25 saturation on strong mint. It uses the shared blurred artwork atmosphere rather than a sharp wallpaper. This can make the additional surface blur hard to perceive, since detail is already softened. The wash itself is not blurred.

**Unresolved:** mint wash gradients dim centrally and brighten again toward the bottom, producing a visible diagonal trough. A smoother one-way fade was discussed, not implemented. Material recipes remain locally copied from the prototype, so this playground does not enforce app-wide consistency automatically.
