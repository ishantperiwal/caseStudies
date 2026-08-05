# Zapp Account presentation - continuation context

Use this file to continue the project in a new Codex or ChatGPT conversation. Attach this file, or paste its contents, and ask the new conversation to continue from the current implementation.

## Non-negotiable safety restriction

The original case-study source is located at:

`D:\Work\Plugins\my case studies\Zapp Account`

Do not open, read, search, enumerate, copy, modify, or otherwise touch any folder named `backup never touch or read unless asked`, or any equivalent protected backup folder. This restriction applies recursively and remains in force unless the user explicitly revokes it.

The protected backup folder was not opened or read while creating the current presentation. The original case-study folder was not modified.

## Project objective

Turn the Zapp Account case study into a polished portfolio presentation for a Google Senior Interaction Designer interview.

The interview requirements being addressed are:

- A 45-minute portfolio presentation.
- One or two projects discussed in depth.
- Beginning-to-end involvement.
- Process and finished work.
- Challenges and alternative solutions.
- Final results and impact.
- Clear individual contribution.
- Evidence of problem solving, creativity, collaboration, leadership, presentation skill, UX thinking, and content considerations.

## User's visual direction

- Keep the sharp Archivo display typography and readable Source Sans 3 body/UI typography with robust local system fallbacks.
- Make the existing phone-case and product images the main visual storytelling devices.
- Use genuine product motion wherever motion assets or prototypes exist.
- Avoid a generic slide-deck appearance.
- Reduce the number of slides while preserving the complete story.
- Keep the interface calm, crisp, editorial, and senior rather than decorative or crowded.
- Give every chapter one dominant thesis heading; supporting copy and evidence should follow and recede through size and lightness rather than additional hues.
- Audience profile facts confirmed for the context chapter: existing PayZapp users, salaried, aged 25–40, primarily across Tier 2 and Tier 3 cities. Do not replace these with vague labels such as “starting point” or “journey priority.”

The creative north star is **Live Product Storyboard**: the product itself should carry the narrative, supported by concise editorial explanation.

## Current deliverable

The preferred presentation is a standalone HTML package. Its entry point is:

`index.html`

The package contains:

- `index.html` - presentation structure and content.
- `styles.css` - responsive visual system and phone framing.
- `script.js` - navigation, themes, prototype switching, and motion behavior.
- `assets/` - copied case-study imagery and motion assets.
- `prototypes/` - local Video KYC, Zapp Home, carousel, and related product prototypes.
- `DESIGN.md` - durable visual-system documentation.
- `.impeccable/design.json` - machine-readable design tokens and component guidance.
- `README.md` - short usage instructions.

The working copy used to build this package is located at:

`C:\Users\ishan\Documents\Codex\2026-08-03\referenced-chatgpt-conversation-this-is-an\presentation\html`

The user-facing, copyable package is located at:

`C:\Users\ishan\Documents\Codex\2026-08-03\referenced-chatgpt-conversation-this-is-an\outputs\Zapp-Account-HTML-Presentation`

## Current presentation structure

The presentation currently contains eleven chapters:

1. Opening - the product and case-study premise.
2. Working model - Zeta owned product execution while HDFC Bank leadership set quarterly priorities, reviewed changes, and approved what moved forward.
3. The brief - the existing PayZapp Wallet and HDFC Bank's ambition to give it a clearer purpose and test its market potential.
4. Zapp Account - the new name and its proposition as an everyday spends account for planned and unplanned expenses.
5. Audience and evidence - who the team was solving for and why adoption was difficult.
6. Role and strategy - the candidate's role and the three design jobs.
7. Discovery - the entry points and how people encountered Zapp Account.
8. Video KYC - explaining value, setting expectations, progress, and unlock state.
9. Account Home - balance, loading money, quick actions, rewards, and action hierarchy.
10. Judgment and delivery - constraints, alternatives, trade-offs, and collaboration.
11. Impact and close - reported outcomes, lessons, and the final argument.

## Implemented presentation behavior

- Full-height chapter-based scrolling.
- Previous and Next controls.
- Arrow-key, Page Up, Page Down, Home, and End navigation.
- Full-screen presentation mode.
- Light and dark themes.
- Responsive layouts.
- Reduced-motion and reduced-transparency support.
- Intersection-based content reveals.
- Existing phone-case artwork used as the dominant hero visual.
- Three framed product entry points in the discovery chapter.
- Original inline GIF used where genuine motion was available.
- Interactive Video KYC static-screen selector.
- Optional live Video KYC prototype.
- Live Zapp Home prototype with Funding, Quick actions, and Rewards views.
- Accessible active-state semantics for the interactive choices.

The decorative impact-number count-up was removed because intermediate animation frames could appear to report incorrect values. Impact figures now remain visually stable.

## Visual system

- Palette: cool white, graphite, restrained Zapp blue, and an optional dark theme.
- Typography: Archivo for display roles and Source Sans 3 for body/UI roles, with Segoe UI Variable, Segoe UI, Helvetica Neue, Helvetica, Arial, and system sans-serif fallbacks.
- Composition: generous editorial spacing with large product devices rather than collections of small screenshots.
- Materials: restrained borders, tonal surfaces, and subtle device depth.
- Motion: short, purposeful transitions and real product motion; no decorative spectacle.
- Accessibility: visible focus states, semantic active states, reduced-motion support, iframe titles, and useful image alternatives.

Refer to `DESIGN.md` before changing the visual language. Preserve the established system unless the user explicitly asks for a redesign.

## Review status

The finished presentation passed review for:

- Overall thesis and live-product-storyboard direction.
- First-viewport hierarchy.
- Phone imagery and device framing.
- Reduction from the earlier 17-slide version to the current eleven-chapter structure.
- Integration of genuine product motion and live prototypes.
- Coherent light and dark visual worlds.

The presentation intentionally does not use a globally pinned or sticky phone. Phones remain chapter-local because introducing a pinned object would be a larger structural change and was not necessary to satisfy the user's request.

## Content that still requires user confirmation

Do not invent these facts. Ask the user when the next revision reaches them:

1. The precise wording of the user's individual contribution.
2. Which decisions the user personally led versus influenced or executed.
3. The specific collaborators and how the user worked with product, engineering, research, content, compliance, operations, or leadership.
4. Examples of disagreement, alternatives considered, and how decisions were reached.
5. The provenance, dates, denominators, confidentiality, and approved wording of the impact metrics.
6. Whether named personas and audience evidence may be shown during the interview.
7. Whether any remote prototype dependency should be made completely offline.

Current reported figures displayed in the presentation include approximately `2.1x` monthly spends, `1.5x` monthly loads, and `20%` of wallet loaders using Auto-Load. Treat them as provisional until the user confirms them.

## Known technical considerations

- The HTML package should be copied as one folder so all relative assets and prototypes remain available.
- Opening `index.html` directly may work, but a small local web server is more reliable for embedded prototypes.
- Some embedded prototype content may use remote Google Fonts or a CDN-hosted Lottie library and can therefore require an internet connection.
- Responsive rules exist at approximately 900px and 620px. Desktop presentation has received the strongest visual review.
- On very narrow screens, the discovery chapter keeps all three same-width devices in a horizontal scroll row to preserve the requested trio while avoiding clipping.

## Recommended next steps

1. Review every chapter with the user and collect factual corrections.
2. Strengthen the individual-contribution and collaboration language.
3. Confirm or replace all impact figures.
4. Rehearse the eleven-chapter story against the 45-minute interview allocation.
5. Decide whether this project should occupy roughly 25-30 minutes alongside a second, shorter project.
6. Test on the exact laptop, browser, screen resolution, and internet conditions that will be used for the interview.
7. Make the prototypes completely offline only if interview conditions require it.

## Suggested prompt for a new conversation

> Continue the Zapp Account Google Senior Interaction Designer portfolio-presentation project using the attached `CHAT-CONTEXT.md`. Inspect the existing HTML package before proposing changes. Preserve the Live Product Storyboard direction, Archivo and Source Sans 3 typography, phone-first imagery, genuine product motion, eleven-chapter structure, and accessibility behavior. Do not open or read any folder named `backup never touch or read unless asked` or equivalent. First summarize the current state and the exact change I am requesting, then make only the necessary edits and verify the presentation visually.

## Important working principle

Treat the existing HTML, `DESIGN.md`, and this context file as the current source of truth. Do not restart the deck from scratch or return to the older 17-slide structure unless the user explicitly requests it.
