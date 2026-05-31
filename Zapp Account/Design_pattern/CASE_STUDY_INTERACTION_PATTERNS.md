# Case Study Interaction Patterns

This file documents project-specific interaction and authoring behavior that does not fit cleanly into the standard `DESIGN.md` token schema. Use it with `DESIGN.md` when recreating this case-study style.

## Static Edit Mode

The page is both a finished static case study and a lightweight authoring surface.

- View mode is normal page viewing.
- Edit mode is enabled with `?edit=true`.
- Text edits persist in normal text nodes marked with `data-text-key`.
- Image edits persist through `src` values pointing to `case study assets/`.
- Highlight settings persist as `data-highlight-*` attributes.
- Runtime controls are removed before saving.

When adding any new visible text that should be editable, add a unique `data-text-key`.

## Image Placeholder Pattern

Every replaceable image area should use:

```html
<div class="editable-placeholder" data-placeholder-id="stable-id" data-placeholder-name="Readable name">
  ...
</div>
```

Phone placeholders should include a stable viewport wrapper:

```html
<div class="rebrand-phone-placeholder editable-placeholder" data-placeholder-id="example">
  <div class="rebrand-phone-viewport">
    <div class="legacy-wallet-device">
      <div class="legacy-wallet-screen">
        <img class="placeholder-image-layer" alt="">
        ...
      </div>
    </div>
  </div>
</div>
```

The viewport exists so zoomed or animated phone frames can be clipped without affecting the rest of the page.

## Phone Image Fit

Uploaded screenshots inside phones should:

- Use `object-fit: cover`.
- Use `object-position: top center`.
- Overscan the screen slightly with negative inset.
- Disable default `max-width: 100%` image clamping when necessary.

This avoids right/top sub-pixel gaps and keeps screenshots visually flush with the phone screen.

## Narrated Hover Pan/Zoom

This is not a user-facing control. It is an agent-authored behavior applied only when the user asks for a specific placeholder.

Opt in with:

```html
data-hover-pan-zoom=""
```

Then define per-placeholder values:

```css
.editable-placeholder[data-placeholder-id="example"] {
  --hover-zoom: 1.4;
  --hover-pan-x: 0%;
  --hover-pan-y: -8%;
}
```

Behavior:

- The full phone frame transforms, not only the image.
- The resting transform should be explicit: `translate3d(0, 0, 0) scale(1)`.
- Zoom state should use `translate3d(var(--hover-pan-x), var(--hover-pan-y), 0) scale(var(--hover-zoom))`.
- Keep `will-change: transform` and `backface-visibility: hidden` on animated phone frames to avoid compositor snapping.
- Hover-out should hold briefly, currently 650ms, so the motion does not reset if the cursor leaves and quickly returns.

## Temporary Hairline Clip

Some scaled phone frames can expose a black top hairline because of sub-pixel compositing.

The current working technique is:

- While zoomed, apply `clip-path: inset(1px 0 0 0)` to the phone viewport.
- On zoom-out, keep a temporary reset class.
- Remove that reset class after 50ms so the normal state does not remain visibly clipped.

The same temporary clip can be applied to phone placeholders with highlight-only behavior, using an `is-highlight-clipped` class while the highlight is visible.

Avoid permanent clips in the normal resting state; they can make the phone casing look cut.

## Hover Highlight Timing

Highlights use three runtime elements:

- `.hi-spotlight`
- `.hi-arrow`
- `.hi-label`

The spotlight appears first. The arrow and label should fade in after a short delay so they do not pop in abruptly.

Current timing:

- Spotlight opacity: 0.6s.
- Arrow and label opacity: 0.45s.
- Arrow and label delay: 0.18s.
- Hover-out hold: 650ms.

If pan/zoom and highlight exist on the same placeholder, their hover-out hold should feel coordinated.

## Highlight Authoring Controls

Highlight editor controls should include:

- Active toggle.
- Width slider.
- Height slider.
- Curve slider.
- Arrow gap slider.
- Note text editor.

Note text should remain short. The current implementation uses a 12-word limit. Do not trim spaces on every keystroke; only enforce the word limit when the user exceeds it.

The Space key must not bubble from the highlight text editor to the image-placeholder keyboard handler, or it can open the image upload modal.

## Flow Comparison Pattern

Use this structure:

- Title: `Flow Comparison`.
- Before/After tabs directly under the title.
- Legend on the right when desktop space allows.
- Green legend swatch means "What we had to do".
- Green flow nodes use the same semantic meaning as `success-surface` and `success-border`.

## Equation Pattern

Use a simple centered equation when explaining business logic.

Preferred structure:

```text
Adoption [proportional symbol] Load money amount + Monthly load amount + Frequency of loads
```

Make the subject sit in an invisible term-sized container so it aligns vertically with the green terms.

Use green surfaces for the right-hand terms, and button-like plus symbols between them.

## Save Hygiene

Before saving cleaned HTML:

- Remove `.hi-spotlight`, `.hi-arrow`, `.hi-label`, `.hi-handle`, `.hi-chip`, and `.hi-panel`.
- Remove authoring state classes.
- Remove `contenteditable`.
- Preserve saved `data-highlight-*`.
- Preserve image `src` paths.
- Preserve `data-placeholder-id` and `data-text-key`.
