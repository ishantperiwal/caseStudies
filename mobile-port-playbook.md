# Mobile Port Playbook

How to take one of these desktop-authored case-study pages and make it read well on a
phone, without touching the copy and without changing the desktop.

Written from the Zapp Account port. Applies to `Lottiemon/`, `IPL Themification/`, and any
future case study built on the same idioms.

## How To Use

At the start of a chat:

```text
Read `mobile-port-playbook.md` first, then port <file> to mobile.
```

For Zapp Account, read `Zapp Account/NEW_CHAT_CONTEXT.md` as well — its content and
editability rules still take precedence over anything here.

---

## 1. Non-Negotiables

1. **Copy is never touched.** No heading, paragraph, label, or bullet changes as a side
   effect of a layout fix. Verify at the end: `git diff` must show zero changed lines that
   contain page text. Hiding an element on mobile is a layout decision and is allowed;
   rewriting or deleting its text is not.
2. **Desktop must come out byte-identical in behaviour.** Every rule goes inside the mobile
   media query. Every JS branch is guarded. Prove it — see §6.
3. **Editability markers survive.** `data-text-key`, `data-placeholder-id`,
   `data-placeholder-clone`, `.editable-placeholder`, `data-highlight-*`, and relative
   `case study assets/` paths stay exactly as they are.
4. **Runtime-generated nodes must not enter the source.** Anything JS builds for mobile gets
   `data-runtime-only="true"` and is stripped in the page's save routine. Adding *attributes*
   to existing elements does persist on save — avoid it, or add matching cleanup.
5. **One breakpoint per document.** Pick it, write it down, use it everywhere.

> These pages disagree today: Zapp Account uses `767 / 768`; Lottiemon uses `640`, `760`, and
> `1380`; IPL uses `767 / 768`. When porting Lottiemon, either normalise it to 767/768 first
> or accept that its existing three queries fire at different widths than anything you add.
> Do not add a fourth breakpoint.

---

## 2. Architecture: One Block, One Function

Do **not** scatter fixes into the existing media queries. Add:

**A. One CSS block** appended at the very end of the page's own `<style>`:

```css
/* ══ Mobile static mode (≤767px) ═══════════════════════════════════
   Why this exists, in one paragraph: what the desktop layout does,
   why it cannot survive a phone, what replaces it. */
@media (max-width: 767px) {
    /* ... everything ... */
}
```

Being last in the sheet is load-bearing: it wins ties against the earlier mobile rules the
page already has, so you rarely need `!important`.

**B. At most one JS function**, guarded and called after the page's other setup:

```js
function setupMobileStaticMode() {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    // ...
}
```

One place to read, one place to delete. If the port needs a second function, it probably
needs a rethink instead.

---

## 3. Step 0 — Survey Before You Write Any CSS

**Measure first. Every wrong guess in the Zapp port came from skipping this.**

Run the auditor:

```bash
node tools/mobile-audit.js "Lottiemon/lottiemon-case-study.html"
```

It reports, at 375/390/412px: horizontal overflow and what causes it, gutter mismatches
between headings and body copy, media that isn't centred, containers holding more than one
image, fixed-width SVGs, hover-only content, and phone frames whose image doesn't fill.

Read the output before deciding anything. The auditor finds problems; it does not know which
ones matter for a given page.

---

## 4. The Recurring Problems

Each applies only if the page actually has the idiom. Check with the auditor.

### 4.1 The gutter is inconsistent

Headings and body copy are marked up differently — `pl-10 pr-10` on one, the shorthand
`px-10` on the other — so a rule targeting only `.px-10` misaligns them down the whole page.

```css
main .px-10,
main .pl-10 { padding-left: 1.75rem; }

main .px-10,
main .pr-10 { padding-right: 1.75rem; }
```

`1.75rem` is the middle ground between the desktop `2.5rem` and a cramped `1.25rem`. The
`main` prefix outranks Tailwind's own utilities regardless of where the play-CDN injects its
sheet. **Grep for every padding utility the page uses before writing this** — `px-8`, `pl-6`,
and inline styles are all in play across these documents.

### 4.2 Desktop scroll choreography

Floating previews pinned to the margin, scroll-driven state machines, wheel hijacking,
arrow-key stepping. None of it survives a single column.

- Hide the floating element.
- Give each step its own inline copy of what the floating element was showing.
- **Skip registering the scroll/key listeners on mobile** — don't leave a rAF loop running
  against an invisible element on a phone battery.

Mirror rather than move. If the page has a clone mechanism (`data-placeholder-clone`), use
it: the clone stays in sync with edit-mode image swaps and no `data-placeholder-id` is
duplicated.

**Mirror what each source actually holds, not what you assume it holds.** In Zapp, only 10 of
22 phone states had a real PNG; five were live prototype iframes with no image on disk, and
five were transition states with neither. Blanket-applying one shape produced broken images.
Branch:

```js
const savedSrc = source.classList.contains("has-saved-image")
    ? source.querySelector(".placeholder-image-layer")?.getAttribute("src") : null;
const embedSrc = source.querySelector(".execution-phone-embed")?.dataset.embedSrc || null;
if (!savedSrc && !embedSrc) return null;   // nothing to show — show nothing
```

### 4.3 Spacer sections and animation gaps

Sections that exist only to give a desktop animation room to play read as dead space on a
phone. Hide them, and check the *rhythm variable* too — in Zapp a `--timeline-gap: 9rem`
(sized for a transition animation that doesn't run on mobile) left a 200px void even after
the section itself was hidden.

### 4.4 Fixed-pixel SVGs

Hand-laid flow diagrams carry explicit `width`/`height` and often a `min-width` that no
`width: 100%` can beat. **Check for `min-width` before assuming scale-to-fit works.**

Scaling a 522-unit viewBox into 295px puts its labels near 7px — technically fits, actually
unreadable. Prefer keeping the scroll and giving it the full screen:

```css
.scope-flowchart {
    overflow-x: auto;
    overscroll-behavior-x: contain;   /* don't chain into page scroll / back gesture */
    margin-inline: -1.75rem;
    padding-inline: 1.75rem;
}
```

### 4.5 Hover-only content

Highlight callouts, tooltips, pan-zoom — all dead on touch, and their labels are usually
positioned outside the frame anyway. If the hidden text carries meaning, surface it as a
static caption from the same authored attribute:

```js
if (source.dataset.highlightActive === "true" && source.dataset.highlightText) { /* caption */ }
```

Don't invent new copy. Re-present what the author already wrote.

### 4.6 Multi-image groups → horizontal carousel

Any container with two or more images becomes a vertical slog. If it is already a flex row
that merely wraps, converting is cheap:

```css
main .group.group {                      /* doubled class — see §5 */
    display: flex;
    flex-wrap: nowrap;
    gap: 1rem;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1.75rem;
    padding-inline: 1.75rem;
    margin-left: -1.75rem;
    margin-right: -1.75rem;              /* full-bleed track */
    scrollbar-width: none;
}
main .group::-webkit-scrollbar { display: none; }

main .group > * {
    flex: 0 0 auto;
    width: min(76vw, 17rem);             /* leaves the next slide peeking */
    max-width: none;
    scroll-snap-align: center;
}
```

The peek is the affordance — no arrows or dots needed. Remove these containers and their
children from any `margin-inline: auto` centring rule: auto margins on a flex item in a
scrolling row push siblings apart.

*Known gap:* the track is touch- and trackpad-scrollable but not keyboard-reachable, which
needs `tabindex="0"` on the container. That persists into the saved document, so add it only
with matching save-clean.

### 4.7 Media that won't centre

Start with the blanket rule, then handle what resists:

```css
.preview, .stack, .inline-image, .img-placeholder {
    margin-left: auto;
    margin-right: auto;
    float: none;
}
```

**Negative slack means auto margins are not the cause.** In Zapp, three elements resisted for
three different reasons:

| Symptom | Real cause | Fix |
|---|---|---|
| Sits off the left of the *screen* | `transform: translateX(-7.5rem)` slide-in that only resolves when its section expands | `transform: none` |
| Inherits a text indent | `.numbered-point > :not(h3):not(.sticky-note)` sets `margin-left` and out-specifies a bare class | raise specificity (§5) |
| Off by a fixed amount, out of flow | still `position: absolute` — the existing mobile rule re-slotted it in a grid but never reset positioning | `position: static; transform: none` |

### 4.8 Stat rows and equal distribution

A row of figures is usually a shrink-to-fit flex child, so it spans its content rather than
the column, with unequal columns.

**`flex: 1 1 0` does not give equal columns when the columns have different padding.** Free
space is shared between *content* boxes and each column's padding is added on top — in Zapp
that produced 111 / 122 / 111 from three identical 100px content boxes. Use grid, which sizes
border boxes:

```css
.stat-row { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; width: 100%; align-self: stretch; }
```

(`auto` tracks are the separators.) Outer columns keep zero outer padding so the first and
last stay flush with the page gutter.

To restyle Tailwind-utility markup without editing it, match on stable attributes instead:

```css
main [data-text-key^="hero-stat"][data-text-key$="-value"] { font-size: 1.85rem; }
main div:has(> [data-text-key^="hero-stat"][data-text-key$="-label"]) { padding-inline: 0.5rem; }
```

---

### 4.9 Content clipped inside a container

**The one no page-level check can see.** A row that overflows its own box and is then
clipped by an ancestor never changes `document.scrollWidth`, so the page reports no
horizontal overflow while content is cut off and unreachable.

IPL's two-up phone rows were inline-styled:

```html
<div style="display:flex; flex-wrap:nowrap; width:max-content; max-width:100vw;
            position:relative; left:50%; transform:translateX(-50%);">
```

`width: max-content` makes the row 536px; `max-width: 100vw` caps the *box* at 375 but
nothing shrinks the items; `left:50% + translateX(-50%)` then centres the overflow so it is
sliced off **both** edges — ~80px of each phone, with no way to scroll to it. Every automated
check passed. It was found by looking at the page.

Same fix as §4.6, with `!important` because the offending values are inline styles, and
`:has(> .phone-col)` to target a row that carries no class of its own:

```css
main section div:has(> .phone-col) {
    left: auto !important;
    transform: none !important;
    width: auto !important;
    max-width: none !important;
    justify-content: flex-start !important;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    margin-inline: -1.75rem !important;
    padding-inline: 1.75rem;
}
```

The auditor now detects this, but only counts content that is **visible** and **off-viewport**
and **not reachable by scrolling**. Overflowing a parent is normal — full-bleed tracks,
carousel slides, hover labels at `opacity: 0` and blurred background orbs all do it on
purpose. Getting those exclusions wrong is what makes the check either useless or deafening.

## 5. The Two Mistakes That Cost The Most

### 5.1 Reusing half a component

Twice in the Zapp port, a component was reused outside its usual container and only *part* of
its rule set came along:

- An image layer was added without `has-saved-image` — the class the framework uses to switch
  `.placeholder-image-layer` from `display:none` to visible *and* to darken the screen behind
  it. Result: a white casing with the image floating inside the frame's padding.
- An iframe got `display: block` but not `position: absolute` + `inset` + sizing. Same visible
  symptom, same root cause.

Both happened because a generic rule —
`.screen > *:not(.image-layer):not(.overlay) { position: relative }` — forces defaults onto
every child, and the framework beats it with a *more specific* rule scoped to a container
class the new element doesn't have.

> **Rule:** when reusing a framework component outside its normal container, find every rule
> that targets it in its normal container and replicate the whole set, not the one property
> you noticed was wrong. Grep the component's class name and read all matches before writing.

### 5.2 Specificity arithmetic

A class always outranks a type selector. Count classes first, and only then elements.

| Selector | Specificity | |
|---|---|---|
| `.numbered-point > .direction-screens.direction-screens` | (0,3,0) | existing rule |
| `main .direction-screens.direction-screens` | (0,2,1) | **loses** |
| `main .numbered-point > .direction-screens.direction-screens` | (0,3,1) | wins |

Being later in the stylesheet only breaks *ties*. When an override silently does nothing,
check computed style in a browser — not the source — and count.

Doubling a class (`.x.x`) is the cheapest way to add specificity without touching markup, and
the codebase already uses that trick. Leave a comment saying why, or it gets "simplified"
back into breakage.

---

## 6. Verification

Never report a mobile port as done on the strength of source reading. The Zapp port passed
its own tests three times while still visibly broken, because the tests asserted the wrong
things.

**Required:**

1. `node --check` on the page's inline script if any JS changed.
2. **Real browser at 375 / 390 / 412px.** `tools/mobile-audit.js` does this via
   `puppeteer-core` against installed Chrome — no browser download.
3. **Desktop regression at 1440 / 1024 / 768px.** Assert the things you changed are *not*
   changed there: floating elements still visible, carousels still wrapped grids, original
   font sizes and padding intact, zero runtime nodes built.
4. **Look at screenshots.** Computed-style assertions passed on a phone frame whose image was
   visibly inset in white. Some classes of wrong only show up visually.
5. `git diff` — confirm no copy lines and no markers changed.

**The auditor has been wrong in every direction.** It has reported a broken page clean by
matching no elements at all; by excluding the wrong things; and by crashing, where a
`grep -c ISSUE` over a stack trace counted zero and looked like a pass. It has also cried
wolf on a finished page. Check the `scope inspected:` line, check the exit code, and never
read "0 issues" as "done".

**Trust the auditor only as far as its fixture.** `tools/fixture-known-bad.html` reproduces
every defect found during the Zapp port. Run it after changing the auditor:

```bash
node tools/mobile-audit.js "tools/fixture-known-bad.html"
```

It must report all of them, and must stay silent on the two cases planted to be correct
(a decorative overlay, a phone frame whose media fills a nested wrapper). The auditor has
twice called a broken page clean — once matching no elements at all, once excluding the
wrong things. A detector that only ever says "ok" is worse than none.

**Screenshot gotchas that cost real time:**

- Pass `--allow-file-access-from-files` or `file://` fetches (Lottie JSON, iframes) fail and
  you will chase a phantom broken image.
- Accordion sections start collapsed and only one stays open — expand the specific one you
  want before measuring or shooting, and re-measure after.
- An element inside a collapsed section can still report non-zero geometry. Don't trust a
  measurement you haven't seen rendered.

---

## 7. Per-Document Baseline

Measured with `tools/mobile-audit.js` and confirmed by screenshot. Re-run before relying on it.

| | Zapp Account | IPL Themification | Lottiemon |
|---|---|---|---|
| Lines | 19,753 | 1,189 | 751 |
| Audit result | **0 issues** (37 media checked) | **0 issues** (4 media, 34 svg) | **0 issues** (8 media checked) |
| Reads well at 375px | yes, ported | yes, ported | **yes, unported** |
| Breakpoints | 767 / 768 | 767 / 768 | 640 / 760 / 1380 |
| Tailwind CDN | yes | yes | yes |
| Content width | `--content-w` token | `max-w-3xl/4xl` | `max-w-2xl/3xl/4xl` |
| Placeholder system | yes | yes (12) | **no** — plain `<img>` |
| Phone device (`.legacy-wallet-device`) | yes | yes (13) | no |
| `.numbered-point` | yes | 1 | 10 |
| `.sticky-note` | yes | no | 10 |
| `.stack-section` accordion | yes | **no** | **no** |

**Lottiemon needs far less than expected.** It has no mobile media queries at all, yet audits
clean and reads correctly at 375px — because it leans on Tailwind responsive utilities
(`grid sm:grid-cols-2` collapses below 640px) and `max-w-*` rather than a fixed column. Do not
port it wholesale. The only candidate is §4.1-style hero top spacing: roughly 280px of blank
space sits above the H1 on a 375px screen. Check anything else against the auditor first.

**IPL is ported.** Its two-up phone showcase rows were clipped on both edges (§4.9) — the
only real defect, and one no automated check caught at the time. They are now horizontal
carousels, and the gutter came down to 1.75rem. Desktop measurements at 1440/1024/768 are
byte-identical to before.

Its two *original* audit findings were tool bugs, not page bugs, and investigating them is
part of why the auditor is now trustworthy:

- `img.critical-asset.absolute.-bottom-4` — campaign artwork deliberately anchored to a card's
  bottom-right with `pointer-events-none`, the copy given `pr-20` to clear it. Decorative
  overlays are supposed to be off-centre.
- A phone frame "49px short" — that 49px is the status bar and home indicator, which live in
  `.legacy-wallet-screen` but outside the `.phone-screen-content` wrapper the media actually
  fills. Screenshotting the phone settled it in seconds.

The auditor now skips decorative overlays and measures media against its real containing
block. **Both were caught by looking at the page, not by reading the numbers.**

IPL shares the phone device and placeholder system with Zapp, so if it ever does need work,
§4.2, §4.5 and §5.1 transfer directly. It has no accordion, so §4.1's header gutter work
does not apply.

**The Zapp mobile block is not portable wholesale.** It is written against `--content-w`,
`.stack-section`, `.direction-screens` and a scroll-driven journey that only that document
has. Take the method and the recipes, not the block.

**IPL has a pre-existing encoding bug**, unrelated to mobile and left alone because it is
copy: 25 occurrences of double-encoded UTF-8 (`â€"` where an em dash belongs), including in
the `<title>`. Visible at every width. Fixing it means re-saving the file as UTF-8 and
repairing the mangled characters — ask before touching it.

**Sticky notes:** hidden below 1400px in Zapp by pre-existing rules, so their text is
unreachable on mobile *and* most laptops. Decided for Zapp: leave hidden. Lottiemon has 10 —
ask before deciding, since it is a content-visibility call, not a layout one.

## 8. Reporting

After a port, state:

- What changed, and which of §4's problems it addressed.
- That copy and markers are untouched, with the `git diff` evidence.
- Which checks in §6 ran, and their results — including anything still failing.
- What you deliberately did **not** do, and why.

Say plainly when something is unverified. "Not tested on a real device" is a useful sentence;
headless Chrome is not iOS Safari, and lazy iframes, `aspect-ratio`, and momentum scrolling
all differ there.
