# Editable Static Page Framework

This document describes the editing model used in `zapp-account-a4-case-study.html` so it can be recreated on another static HTML page. The goal is to let a single HTML file behave like a lightweight authoring tool without needing a backend.

The model supports:

- Inline text editing.
- Image placeholder replacement.
- Hover annotations/highlights on image placeholders.
- Design controls for the accent color and section spacing.
- A save toolbar that writes the edited HTML back to disk.
- Portable local asset references when images are stored beside the HTML file.

## Mental Model

Think of the page as having two modes:

1. **View mode**
   The page behaves like a normal portfolio/case-study page. Text is not editable, placeholder controls are hidden, and highlights only appear on hover if they were saved.

2. **Edit mode**
   The same page is opened with `?edit=true`. The page turns on authoring UI for text, images, and highlights. Edits are tracked as unsaved changes. The user can then save a cleaned version of the HTML.

The page itself is the source of truth for text and highlight settings. For portable images, the HTML should reference files in a local asset folder.

## Core Principle

Persist user-facing content as normal HTML attributes and markup.

Do not make runtime-only DOM nodes the saved source of truth. Runtime controls should be rebuilt from saved attributes when the page loads.

Examples:

- Text content is saved directly inside elements with `data-text-key`.
- Highlight settings are saved as `data-highlight-*` attributes on the placeholder.
- Image paths are saved in the `src` attribute of an `img`.
- Design tokens (accent color and spacing) are saved as inline CSS custom properties on the `<html>` root element.
- Temporary UI such as handles, panels, arrows, and edit chips is removed before saving.

## Required Page Structure

### Text

Any text that should be editable gets a stable key:

```html
<h1 data-text-key="hero-title" spellcheck="false">Building Zapp Account</h1>
<p data-text-key="hero-subtitle" spellcheck="false">Case study subtitle here.</p>
```

The key is not used for storage by itself. It gives the editor a stable way to identify changed text and avoid double-counting unsaved changes.

### Image Placeholders

Any replaceable image area gets a `data-placeholder-id`:

```html
<div
  class="editable-placeholder has-saved-image"
  data-placeholder-id="hero-screen"
  data-placeholder-name="Hero screen"
  tabindex="-1"
>
  <img
    class="placeholder-image-layer"
    alt=""
    src="case study assets/zapp-placeholder-hero-screen.png"
  >
</div>
```

Use a stable placeholder ID. The same ID can also power default filenames:

```text
zapp-placeholder-hero-screen.png
```

If another element should mirror the same placeholder image, use a clone marker:

```html
<div data-placeholder-clone="hero-screen">
  <img class="placeholder-image-layer" alt="" src="case study assets/zapp-placeholder-hero-screen.png">
</div>
```

### Highlight Data

Highlights are saved as attributes on the placeholder:

```html
<div
  class="editable-placeholder has-saved-image"
  data-placeholder-id="hero-screen"
  data-highlight-active="true"
  data-highlight-x="50"
  data-highlight-y="35"
  data-highlight-label-x="80"
  data-highlight-label-y="18"
  data-highlight-text="Important area"
  data-highlight-rw="18"
  data-highlight-rh="18"
  data-highlight-curve="18"
  data-highlight-arrow-gap="9"
>
  ...
</div>
```

Suggested meanings:

- `data-highlight-active`: whether hover highlight should appear.
- `data-highlight-x`: spotlight center X as a percentage of placeholder width.
- `data-highlight-y`: spotlight center Y as a percentage of placeholder height.
- `data-highlight-label-x`: label center X as a percentage.
- `data-highlight-label-y`: label center Y as a percentage.
- `data-highlight-text`: visible note text.
- `data-highlight-rw`: spotlight radius width control.
- `data-highlight-rh`: spotlight radius height control.
- `data-highlight-curve`: arrow curvature control.
- `data-highlight-arrow-gap`: distance between the arrowhead and note label.

Keep highlight note text bounded. A short note works best; this implementation uses a 12-word limit in the editor panel and writes the final value back to `data-highlight-text`.

### Narrated Hover Pan/Zoom

Some image placeholders may need a bespoke hover motion that is chosen by narration rather than exposed as a general UI control. Keep this opt-in and per-placeholder.

Use an opt-in marker:

```html
<div
  class="editable-placeholder"
  data-placeholder-id="example-phone"
  data-hover-pan-zoom=""
>
  ...
</div>
```

Then define the motion with CSS variables scoped to that placeholder:

```css
.editable-placeholder[data-placeholder-id="example-phone"] {
  --hover-zoom: 1.4;
  --hover-pan-x: 0%;
  --hover-pan-y: -8%;
}
```

Expected behavior:

- The outer placeholder remains the hover target and bounding box.
- The full phone/mockup frame can transform, not just the uploaded image.
- A viewport wrapper with `overflow: hidden` can clip the zoomed frame if needed.
- Hover-out can use a short hold timer so zoom/highlight do not flicker if the user briefly leaves and re-enters.
- Any artifact fixes, such as temporary clipping during return animation, should stay implementation-specific and not become global rules.

## Edit Mode Activation

Use a query parameter:

```js
const params = new URLSearchParams(window.location.search);
const isEditMode = params.get("edit") === "true";
```

Only attach authoring controls when `isEditMode` is true. The viewer behavior can always run.

## Text Editing Flow

In edit mode:

1. Select all `[data-text-key]` elements.
2. Add `contenteditable="true"`.
3. Disable spellcheck if the design needs clean editing.
4. On `input`, mark that key as dirty.
5. Show a floating toolbar with a save button.

The dirty tracker should count each edited key once:

```js
const trackedKeys = new Set();
let changeCount = 0;

function markChange(key) {
  if (trackedKeys.has(key)) return;
  trackedKeys.add(key);
  changeCount++;
  updateToolbar();
}
```

Expose this as a shared hook so the image/highlight tools can reuse it:

```js
window.__caseStudyMarkChange = markChange;
```

If other edit tools may initialize before the text toolbar, queue changes:

```js
window.__caseStudyPendingChanges = window.__caseStudyPendingChanges || [];
```

Then flush the queue once the save toolbar exists.

## Image Editing Flow

The image editor should:

1. Find `[data-placeholder-id]`.
2. In edit mode, show an `Image` action on hover.
3. Open a modal with a paste zone.
4. Accept an image from the clipboard.
5. Preview it with `URL.createObjectURL(file)`.
6. Save it either to a local asset folder or to browser storage as fallback.
7. Apply it to the placeholder and any clones.

For a portable static page, prefer this asset-folder model:

```text
page.html
case study assets/
  zapp-placeholder-hero-screen.png
  zapp-placeholder-before-screen.png
```

The HTML should then contain relative paths:

```html
<img src="case study assets/zapp-placeholder-hero-screen.png" alt="">
```

This makes the page work through Live Server and direct file opening, as long as the asset folder stays beside the HTML file.

### Browser Storage Fallback

IndexedDB can be used as a fallback for temporary local editing:

- Store the image blob under `placeholder-blob:<id>`.
- Store metadata under `placeholder:<id>`.
- Restore the image with `URL.createObjectURL(blob)`.

But do not rely on IndexedDB for portability. It is tied to the browser origin. `file://...` and `http://localhost/...` are different origins, so an image saved under one may not appear under the other.

## Highlight Viewer Flow

The viewer is responsible for displaying saved highlights.

On load:

1. Find `.editable-placeholder`.
2. If `data-highlight-active="true"`, create the highlight DOM.
3. Read `data-highlight-*` values.
4. Position the spotlight, arrow, and label.
5. Show the highlight on hover.
6. If hover-out delay is used, keep spotlight, arrow, and label visible for the same hold duration as any related zoom motion.

The highlight DOM should be runtime-only:

```html
<div class="hi-spotlight"></div>
<svg class="hi-arrow">...</svg>
<div class="hi-label"></div>
```

Do not hand-write or persist these nodes in the saved page. Rebuild them from attributes.

## Highlight Editor Flow

In edit mode, each placeholder can expose a `Highlight` action.

When authoring starts:

1. Ensure default `data-highlight-*` attributes exist.
2. Create drag handles for the spotlight and label.
3. Create a small control panel.
4. Let the user adjust active state, width, height, curve, arrow gap, and note text.
5. Write every change back to `data-highlight-*`.
6. Mark the placeholder dirty through `window.__caseStudyMarkChange`.

Important: sliders must update the dataset, not just the visible CSS.

Correct pattern:

```js
panel.querySelector("[data-hi-rw]").addEventListener("input", (event) => {
  placeholder.dataset.highlightRw = event.target.value;
  syncHighlight(placeholder);
  markDirty(placeholder);
});
```

Incorrect pattern:

```js
spotlight.style.width = event.target.value;
```

That only changes the runtime DOM and will not survive saving unless converted into a saved attribute.

## Design Controls (Color And Spacing)

Edit mode also exposes a global design panel for the accent color and section
spacing. It is a single fixed panel, not a per-element tool.

### Panel

The `#design-control` panel is generated by the script itself, not hard-coded in
the page markup. The same script runs on every load:

- In view mode it removes the panel if present and stops.
- In edit mode (`?edit=true`) it reuses an existing `#design-control`, or builds
  one (`buildDesignControlPanel()` appends it to `<body>`), then unhides it
  (top-left) and wires up the sliders.

Because the script builds the panel when it is missing, the panel self-heals: it
keeps working even after the save step strips it from the on-disk file. Do not
rely on static `#design-control` markup being present; the builder is the single
source of truth for the panel structure.

### What It Controls

All values are CSS custom properties set on the `<html>` root element
(`document.documentElement`). The stylesheet and Tailwind config read these
properties, so changing one variable re-themes the whole page.

Accent color — three sliders write hue, saturation, and lightness:

- `--accent-h` (hue, default `14`)
- `--accent-s` (saturation %, default `56`)
- `--accent-l` (lightness %, default `55`)

These feed the Tailwind `accent` / `brand` color scales and every inline
`hsl(var(--accent-h) ...)` usage. The default `14 56% 55%` is the terracotta
accent.

Spacing tokens — generated sliders, all in `rem`:

- `--section-gap`: gap between stacked sections (default `4`).
- `--block-gap`: gap between content blocks (default `3`).
- `--heading-body-gap`: gap between a heading and its body (default `0.95`).
- `--section-heading-gap-collapsed`: section title gap when collapsed (default `0.9`).
- `--section-heading-gap-expanded`: section title gap when expanded (default `0.35`).

Only tokens that are actually consumed by the stylesheet are exposed. Defaults
match the stylesheet `:root` defaults so the panel and the page agree.

### Persistence Model

There are two layers, and only one is the source of truth:

1. **Durable source of truth: inline style on `<html>`.**
   The existing Save flow writes the chosen tokens onto the root element's
   `style` attribute, for example:

   ```html
   <html style="--accent-h: 199; --accent-s: 57; --accent-l: 30; --section-gap: 2rem; --block-gap: 3.65rem; --heading-body-gap: 1.2rem; --section-heading-gap-collapsed: 0.8rem; --section-heading-gap-expanded: 0.85rem;">
   ```

2. **Convenience layer: `localStorage`.**
   Choices are mirrored to `zapp-accent-hsl` (JSON `{h,s,l}`) and
   `zapp-spacing-tokens` (JSON map of token name to `rem` number). On load these
   are re-applied to the root in both view and edit mode, so a chosen look
   survives reloads before the file is saved. An older single-hue key
   `zapp-accent-hue` is read for backward compatibility.

Do not treat `localStorage` as the saved source of truth. It is origin-bound
(`file://` and `localhost` differ) and is only a pre-save convenience. The saved
HTML must carry the tokens inline on `<html>`.

### Change Tracking

Every slider change marks the page dirty through the shared hook, using stable
keys:

```js
markChange('design:accent-hsl');
markChange('design:--section-gap');
```

`markChange` calls `window.__caseStudyMarkChange` when present, otherwise it
queues into `window.__caseStudyPendingChanges` for later flushing, the same as
the text/image/highlight tools.

### Reset

A reset button (`#dc-reset`) restores defaults:

- Accent back to `14 / 56 / 55`.
- Spacing tokens via `root.style.removeProperty(...)`, so each falls back to the
  stylesheet `:root` default.
- Clears `zapp-accent-hsl`, `zapp-spacing-tokens`, and the legacy
  `zapp-accent-hue` keys.

### Save Cleanup

The panel is runtime-only UI. On save, remove it from the clone:

```js
const dc = clone.querySelector("#design-control");
if (dc) dc.remove();
```

This is safe: the chosen tokens already live inline on `<html>`, and the script
rebuilds the panel on the next `?edit=true` load. The saved file stays clean and
never carries the panel markup.

## Save Toolbar Flow

The save toolbar should be simple and predictable:

- The button label should stay `Save`.
- Progress and confirmation should appear in nearby status text.
- Example statuses:
  - `No unsaved changes`
  - `1 unsaved change`
  - `Saving changes...`
  - `Saved!`
  - `Save failed - try again.`

When the user clicks save:

1. Disable the save button.
2. Set status to `Saving changes...`.
3. Clone `document.documentElement`.
4. Clean runtime-only state from the clone.
5. Serialize the clone as HTML.
6. Write it to disk through the File System Access API, or offer a download fallback.
7. Reset dirty state.
8. Show `Saved!`.
9. Return to `No unsaved changes`.

## Cleaning Before Save

Before serializing, remove anything that should not become permanent page content.

Recommended cleanup:

```js
const clone = document.documentElement.cloneNode(true);

clone.querySelector("body").classList.remove(
  "is-text-editing",
  "is-placeholder-editing",
  "is-highlight-authoring",
  "is-any-expanded",
  "is-animating-motion"
);

clone.querySelectorAll(".hi-spotlight, .hi-arrow, .hi-label, .hi-handle, .hi-chip, .hi-panel")
  .forEach((node) => node.remove());

const designPanel = clone.querySelector("#design-control");
if (designPanel) designPanel.remove();

clone.querySelectorAll("[contenteditable]")
  .forEach((node) => node.removeAttribute("contenteditable"));

clone.querySelectorAll("[data-placeholder-id]")
  .forEach((node) => node.setAttribute("tabindex", "-1"));
```

Also remove framework-generated styles if the page uses a CDN that injects runtime `<style>` tags.

## Save-To-Disk Options

### Primary: File System Access API

Use `showOpenFilePicker()` to let the user select the HTML file, then write the cleaned HTML back.

This works best in Chromium-based browsers.

### Fallback: Download

If file writing is unavailable, create a blob and trigger a download:

```js
const blob = new Blob([cleanHtml], { type: "text/html" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "page.html";
link.click();
URL.revokeObjectURL(url);
```

## CSS Requirements

The placeholders need predictable layering:

```css
.editable-placeholder {
  position: relative;
}

.placeholder-image-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: none;
}

.has-saved-image .placeholder-image-layer {
  display: block;
}
```

For hover highlights, keep the spotlight within the placeholder bounds unless there is a deliberate reason to let it spill:

```css
.hi-spotlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
```

If extending the spotlight to avoid edge slivers, make sure it cannot wash over unrelated content. Keep the arrow SVG separate at `inset: 0` so arrow geometry still maps to the placeholder bounds.

## Implementation Checklist For Another Page

1. Add `data-text-key` to every editable text node.
2. Wrap replaceable image areas with `data-placeholder-id`.
3. Store durable image files in a sibling asset folder.
4. Reference those assets with relative `src` paths.
5. Add optional `data-placeholder-clone` for mirrored previews.
6. Store highlight settings as `data-highlight-*` attributes.
7. Build hover highlight DOM at runtime from those attributes.
8. In edit mode, expose text editing, image editing, and highlight authoring controls.
9. Add narrated, opt-in motion only through explicit attributes/classes such as `data-hover-pan-zoom`.
10. Track all changes through one shared dirty-state hook.
11. Save by cloning and cleaning the document, not by saving transient DOM.
12. Keep the button label as `Save`; use status text for progress and confirmation.
13. Test both `http://localhost/...` and direct `file://...` opening.
14. Expose accent/spacing design controls that write CSS custom properties onto the `<html>` root, mirror to `localStorage` only as a pre-save convenience, and get removed from the saved clone.

## Common Failure Modes

### Image exists but does not show

The HTML may not reference the image path. Check the actual `src`.

Good:

```html
<img src="case study assets/zapp-placeholder-hero-screen.png" alt="">
```

Bad:

```html
<img src="" alt="">
```

### Image works on Live Server but not direct file open

The page is probably restoring from IndexedDB or a browser file handle instead of a relative asset path. Use a real local `src` path for portable output.

### Highlight looks right but does not save

The editor probably changed runtime CSS or temporary DOM only. Make sure every setting writes to `data-highlight-*`.

### Save button keeps saying `Saving`

The static HTML or restore logic probably set the button text to `Saving...`. Initialize the button as `Save` and keep it that way. Put progress in the status label.

### Saved HTML includes edit controls

The cleanup step is incomplete. Remove `.hi-chip`, `.hi-panel`, `.hi-handle`, `.hi-label`, `.hi-arrow`, `.hi-spotlight`, `contenteditable`, and edit-mode classes before writing.

## Suggested Prompt For Another LLM

Use this prompt when asking another LLM to add the framework to a new page:

```text
Add a lightweight edit mode to this static HTML page.

Requirements:
- Activate edit mode with ?edit=true.
- Make elements with data-text-key editable.
- Add image placeholders using data-placeholder-id.
- Allow images to be pasted/replaced in edit mode.
- Store durable image references as relative paths into a sibling asset folder.
- Add hover highlights for placeholders using data-highlight-* attributes.
- In edit mode, allow highlight position, label, width, height, curve, and active state to be edited.
- Track all text/highlight/image changes through one dirty-state system.
- Provide a floating toolbar with Save and Download.
- The Save button must always say "Save"; progress goes in status text.
- On save, clone the document, remove transient edit UI, remove contenteditable, remove edit-mode classes, then serialize the cleaned HTML.
- Do not persist temporary highlight DOM, drag handles, edit chips, or injected framework styles.
- The saved page must work through Live Server and direct file opening when kept next to its asset folder.
```

## Final Rule

The saved HTML should be boring.

It should contain normal text, normal image paths, and normal `data-*` attributes. All editing controls should be temporary runtime behavior layered on top only when `?edit=true` is present.
