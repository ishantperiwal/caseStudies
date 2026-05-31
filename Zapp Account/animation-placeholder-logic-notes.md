# Zapp Account Accordion / Placeholder Logic Notes

This note exists so a fresh chat can understand the current animation fixes in
`zapp-account-a4-case-study.html` without re-debugging the same interaction.

## Problem We Were Solving

Expanding/collapsing sections had three related issues:

- The left vertical dashed guide briefly disappeared during accordion motion.
- Section content nudged slightly left/right during expansion or collapse.
- The "What we had to do" phone placeholder overhang was clipped by the animated
  accordion body, especially the image and caption.

Several attempted fixes solved one issue but reintroduced another:

- Making `.card-body` `overflow: visible` during animation stopped placeholder
  clipping, but allowed hidden section text to paint over content below.
- Adding a wide `clip-path` gave the phone room, but brought back the subtle
  horizontal shift and guide-line paint issue.
- Keeping `.card-body` `overflow: hidden` fixed text spill and shift, but clipped
  the phone because the visible phone lived inside the clipped body.

## Current Strategy

The current stable approach separates concerns:

1. Keep accordion text/content clipping during height animation.
2. Draw the left vertical guide in its own foreground layer.
3. Let only the phone paint outside via a synced fixed-position visual layer
   while text remains inside a clipped `.card-body-content` wrapper.
4. Keep an invisible spacer in that wrapper so text wrapping and section height
   remain the same.

## Accordion Body During Motion

Relevant CSS around line `240`:

```css
body.is-animating-motion .stack-section .card-body {
    overflow: hidden;
}

body.is-animating-motion .stack-section.has-floating-preview .card-body {
    overflow: visible;
}

body.is-animating-motion .stack-section.has-floating-preview .card-body > .card-body-clip {
    box-sizing: border-box;
    overflow: visible;
    will-change: clip-path;
}
```

Why:

- The accordion animates by changing inline `height` on `.card-body`.
- During that tween, normal sections keep `.card-body` clipped.
- Only `.has-floating-preview .card-body` gets `overflow: visible`, because that
  section has a `.card-body-clip` wrapper inside it.
- `.card-body-clip` clips the text with a per-frame bottom `clip-path` inset, so
  collapsed/expanding body text does not draw over sections below.
- Avoid using `clip-path` on `.card-body` itself. That caused the tiny
  left/right visual nudge. The current `clip-path` is only on the inner
  `.card-body-clip`, which does not affect the page column.

## Vertical Dashed Guides

The guides were split into two layers.

Relevant markup around line `966`:

```html
<div id="left-vertical-guide" class="fixed inset-0 pointer-events-none z-[2] flex justify-center">
    <div class="relative w-full max-w-5xl h-full">
        <div class="vertical-guide-line" style="left: -2px;"></div>
    </div>
</div>
<div id="vertical-guides" class="fixed inset-0 pointer-events-none z-0 flex justify-center">
    <div class="relative w-full max-w-5xl h-full">
        <div class="vertical-guide-line" style="right: -2px;"></div>
    </div>
</div>
```

Why:

- The left guide sits above the main content (`z-[2]`) so it does not disappear
  during accordion paint/clipping.
- The right guide stays behind the main content (`z-0`) so it does not draw over
  the phone preview, which overhangs to the right.
- Both are `pointer-events-none`, so they do not block interaction.

Shared guide CSS is `.vertical-guide-line` around line `244`.

## Floating Phone Preview

The "What we had to do" section now has:

```html
<article class="stack-section has-floating-preview">
```

The visible phone is a fixed-position child of `.card-body`, placed outside the
clipped `.card-body-clip` wrapper:

```html
<aside class="legacy-wallet-preview legacy-wallet-floating-preview editable-placeholder" ...>
```

It appears as the first child inside `.card-body`, around line `1087`.

Why:

- Because it is outside `.card-body-clip`, it is not clipped by the text
  wrapper during height animation.
- Because it is `position: fixed`, it does not contribute to document
  `scrollWidth`, which prevents the subtle horizontal nudge.
- It keeps the same placeholder editing attributes:
  `data-placeholder-id="before-payzapp-wallet"`.

Relevant CSS around line `304`:

```css
.legacy-wallet-floating-preview {
    float: none;
    position: fixed;
    top: var(--floating-preview-top, -9999px);
    left: var(--floating-preview-left, -9999px);
    right: auto;
    margin: 0;
    z-index: 4;
    pointer-events: none;
}

.stack-section.is-expanded .legacy-wallet-floating-preview {
    pointer-events: auto;
}
```

The preview only receives pointer events when its section is expanded, so it does
not steal clicks while collapsed.

Important override around the editable-placeholder styles:

```css
.legacy-wallet-floating-preview.editable-placeholder {
    position: fixed;
    left: var(--floating-preview-left, -9999px);
}
```

Why:

- `.editable-placeholder { position: relative; }` appears later in the CSS.
- Without this targeted override, the floating preview becomes relative again,
  takes up normal flow space, creates a huge blank collapsed section, and lands
  too low in expanded state.

## Invisible Spacer

Inside `.card-body-content`, which is inside `.card-body-clip`, the original
phone location was kept as a spacer:

```html
<aside class="legacy-wallet-preview legacy-wallet-flow-spacer" aria-hidden="true">
```

It appears around line `1112`.

Relevant CSS around line `318`:

```css
.legacy-wallet-flow-spacer {
    visibility: hidden;
    pointer-events: none;
}
```

Why:

- The spacer keeps the text wrapping exactly as if the floated phone were still
  inside the body.
- It contributes to natural height measurement and content flow.
- It is hidden and non-interactive, so users only see/interact with the floating
  preview.

On mobile, the floating preview is disabled and the spacer becomes visible:

```css
@media (max-width: 767px) {
    .legacy-wallet-floating-preview {
        display: none;
    }

    .legacy-wallet-flow-spacer {
        visibility: visible;
        pointer-events: auto;
    }
}
```

## Floating Preview Alignment

The floating preview top is synced in JS so it aligns with the body content even
if font loading or wrapping changes the header height.

Relevant JS around line `1510`:

```js
function syncFloatingPreviews() {
    document.querySelectorAll(".stack-section.has-floating-preview").forEach((section) => {
        const body = section.querySelector(".card-body");
        const preview = section.querySelector(".legacy-wallet-floating-preview");
        const spacer = section.querySelector(".legacy-wallet-flow-spacer");
        if (!preview || !spacer) return;

        const spacerRect = spacer.getBoundingClientRect();
        preview.style.setProperty("--floating-preview-top", `${spacerRect.top}px`);
        preview.style.setProperty("--floating-preview-left", `${spacerRect.left}px`);
    });
}
```

It runs:

- immediately after setup
- on `resize`
- on `scroll`
- on `load`
- after `document.fonts.ready`
- during accordion frame updates
- before calculating accordion dim/scroll state

## Frame-Accurate Text Clipping

The body height tween also updates the inner `.card-body-clip` paint boundary on
every frame.

Relevant helper shape:

```js
function setCardBodyTweenHeight(tween, height) {
    const clippedHeight = Math.max(0, height);
    tween.body.style.height = clippedHeight + "px";

    const clip = getCardBodyClip(tween.body);
    if (clip) {
        clip.style.height = "";
        const clipHeight = clip.getBoundingClientRect().height;
        const bottomInset = Math.max(0, clipHeight - clippedHeight);
        clip.style.clipPath = `inset(0 0 ${bottomInset}px 0)`;
    }
}
```

Why:

- A previous version used `height` on the padded `.card-body-content`.
- Near the final collapse frames, browser padding forced that wrapper to remain
  roughly one padding-block tall, so text still leaked below the dashed section
  line.
- The current `.card-body-clip` has no padding and uses paint clipping instead.
  The visible bottom tracks the animated `.card-body` bottom directly.
- The `clip-path` is cleared in `finishCardBodyTween()` after the animation.

## Placeholder Editing Caveat

Only the floating preview keeps `editable-placeholder` and the
`data-placeholder-id`. The hidden spacer intentionally does not.

Why:

- The placeholder script uses `[data-placeholder-id]` to restore/save pasted
  images.
- Duplicating the same `data-placeholder-id` on the spacer would cause duplicate
  restore/edit targets.
- The visible floating preview remains the single source of truth for the
  `before-payzapp-wallet` placeholder.

## Do Not Reintroduce

Avoid these patterns unless redesigning the interaction:

- `body.is-animating-motion .stack-section .card-body { overflow: visible; }`
  as a global rule. It causes hidden body text in other collapsed sections to
  spill over lower sections. Keep the visible overflow scoped to
  `.stack-section.has-floating-preview`.
- Large or one-sided `clip-path` on `.card-body` during animation. It can bring
  back the tiny horizontal shift and guide-line paint weirdness.
- Putting the visible overhanging phone inside `.card-body-clip` or
  `.card-body-content`. It will be clipped during height animation.
- Replacing the `.card-body-clip` paint `clip-path` with a height-based clip on
  padded `.card-body-content`. Padding causes a final-frame vertical leak.
- Removing the `.legacy-wallet-floating-preview.editable-placeholder` fixed
  position override. The later `.editable-placeholder` rule will make the
  floating phone relative again.

## Quick Mental Model

Accordion body can paint the phone. Inner zero-padding clip wrapper clips text.
Invisible spacer preserves layout. Left guide floats above; right guide stays
behind.
