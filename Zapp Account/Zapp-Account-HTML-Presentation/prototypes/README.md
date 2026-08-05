# Prototype Embeds

This folder contains coded phone-screen prototypes used inside the main Zapp Account case study.

## File Pattern

Each prototype folder should follow this structure:

- `embed.html` is the source of truth for the actual prototype.
- `index.html` is only a standalone preview shell that loads `embed.html` inside a phone frame.
- `assets/` contains all local images, SVGs, Lottie JSON, and other dependencies for that prototype.

Do not duplicate the prototype implementation between `index.html` and `embed.html`. Make design and animation changes in `embed.html`; `index.html` will automatically reflect those changes because it previews `embed.html` in an iframe.

## Main Case Study Connection

The main case study file embeds prototypes in the "How did we solve it?" phone placeholder using an iframe with `data-embed-src`.

Current prototype connections:

- `prototypes/carousel/embed.html` is used for the onboarding carousel screen.
- `prototypes/video-kyc/embed.html` is used for the Video KYC screen.
- `prototypes/zapp-home/embed.html` is used for the Zapp Home screen.

In `zapp-account-a4-case-study.html`, the relevant markup pattern is:

```html
<div class="execution-phone-state has-live-embed" data-journey-screen-state="...">
  <div class="legacy-wallet-device">
    <div class="legacy-wallet-screen">
      <iframe
        class="execution-phone-embed"
        data-embed-src="prototypes/example/embed.html"
        src="prototypes/example/embed.html"
        loading="lazy"
        scrolling="no"
        tabindex="-1"
        aria-hidden="true">
      </iframe>
    </div>
  </div>
</div>
```

The case-study JavaScript also lazy-attaches the iframe `src` from `data-embed-src` when the matching phone state becomes active.

## Previewing

To preview a prototype by itself, open that folder's `index.html`.

To see the prototype as it appears inside the case-study phone frame, open `zapp-account-a4-case-study.html` and navigate to the matching journey section.

## Adding A New Prototype

1. Create a new folder under `prototypes/`.
2. Put the real implementation in `embed.html`.
3. Add local dependencies under `assets/`.
4. Create a lightweight `index.html` preview shell that iframes `embed.html`.
5. In `zapp-account-a4-case-study.html`, add or update the phone state iframe to point to `prototypes/<name>/embed.html`.
