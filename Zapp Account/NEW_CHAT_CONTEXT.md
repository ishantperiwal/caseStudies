# New Chat Context

Use this file at the start of any new LLM chat for this project. It sets the working rules, rule precedence, and the project docs to read before making changes.

## How To Use

Start a new chat by saying:

```text
Read `NEW_CHAT_CONTEXT.md` first and follow it for this project.
```

Then ask the actual task.

## Rule Precedence

Follow rules in this order:

1. **System and developer instructions from the current chat.**
   These always win.

2. **The user's latest explicit request.**
   If the latest request conflicts with older context, follow the latest request.

3. **This file: `NEW_CHAT_CONTEXT.md`.**
   These are project-level working rules.

4. **Referenced project docs.**
   Read them when relevant:
   - `editable-static-page-framework.md`
   - `animation-placeholder-logic-notes.md`

5. **Existing code and design patterns in `zapp-account-a4-case-study.html`.**
   Preserve the page's current structure, edit mode, layout style, and visual language unless asked to change them.

6. **General assumptions.**
   Use these only when nothing above gives a clear answer.

## Project Files To Know

- `zapp-account-a4-case-study.html`: the main static case study page.
- `case study assets/`: local image assets referenced by the HTML.
- `editable-static-page-framework.md`: explains the text/image/highlight edit-mode model.
- `animation-placeholder-logic-notes.md`: notes for animation and placeholder behavior.

## Critical Content Rule

Do not change case-study body copy unless the user explicitly asks for that copy to be changed.

If a task asks for layout, styling, animation, image behavior, edit mode, or code structure, do not rewrite adjacent paragraphs, headings, labels, or bullets as a side effect.

If a content change seems useful but was not asked for, ask first.

Examples:

- If asked to adjust a box width, do not rewrite the text inside the box.
- If asked to add icons, do not rename the bullet labels unless asked.
- If asked to fix edit mode, do not change case-study narrative copy.
- If asked to update one sentence, change only that sentence unless the user approves broader editing.

## Editability Rule

Preserve edit-mode markers.

When changing editable text, keep its `data-text-key` unless there is a strong reason to replace it. If adding new editable copy, add a unique `data-text-key`.

For editable image areas, preserve:

- `data-placeholder-id`
- `.editable-placeholder`
- image `src` paths that point to local assets
- `data-placeholder-clone` relationships

For highlight authoring, preserve `data-highlight-*` attributes unless the user asks to reset or remove a highlight.

## Static Page Save Model

This page is a self-contained static HTML document with an edit mode.

Important principles:

- `?edit=true` enables editing UI.
- Text edits are saved into normal HTML text nodes.
- Image references should be durable relative paths into `case study assets/`.
- Highlight settings should be durable `data-highlight-*` attributes.
- Runtime-only UI should not be treated as source content.

Read `editable-static-page-framework.md` before changing edit-mode behavior.

## Layout And Visual Rules

Prefer small, local edits over broad refactors.

Respect existing visual patterns:

- Tailwind utility classes are used inline.
- The case-study layout uses fixed-width content, dashed guide lines, floating phone previews, and accordion sections.
- Some linter warnings about inline styles are already present and are not necessarily actionable.

When adding visual elements:

- Keep them compatible with the existing typography and spacing.
- Preserve responsive behavior.
- Avoid letting new content run behind floating phone previews.
- Check the edited area after changes.

## Interaction Rules

When modifying interaction code:

- Keep behavior scoped to the component being changed.
- Avoid global timers unless needed.
- Pause or stop timers when components are off-screen when practical.
- Preserve manual user control over automated UI.
- Respect reduced-motion CSS where relevant.

## Response Rules

After making changes, summarize:

- What changed.
- Whether editable markers were preserved.
- Any checks run.
- Any known remaining warnings or risks.

Do not over-explain unless asked.

## Current Strong Preference

The user wants tight control over narrative/content changes.

Always treat case-study copy as user-owned content. Ask before changing unrequested copy.
