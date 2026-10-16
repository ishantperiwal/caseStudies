# Planet Pop — Kurzgesagt-style Canvas study

A 2-second, 1920×1080 procedural animation: a small planet springs out of a singularity, gets an orbital ring and an atmosphere, then floats.

| File | What it is |
|---|---|
| `planet.html` | The deliverable. One self-contained file that exposes `window.draw({ ctx, width, height, t })`. It has no animation loop. Opening it directly renders one frame (`?t=1.5` picks which one). |
| `preview.html` | An external frame stepper: play/pause, scrub, ±1 frame, loop, 0.25×/0.5× speed. It drives `planet.html` through `postMessage` and never touches its state. |

## Run

Open `planet.html` or `preview.html` in a browser. The files work straight from disk. From the repo root you can also serve them:

```bash
python3 -m http.server 5500
```

Then go to `http://localhost:5500/experiments/kurzgesagt-planet/preview.html`.

## Timeline

- **0.00–0.60** The singularity charges and the 4-point stars sparkle in while drifting. At 0.15s the planet pops using `sin(p·π·0.7)·1.2` and a thin cyan shockwave expands and fades.
- **0.60–1.20** The ring sweeps around the planet. It is drawn twice: a back pass under the planet, then a front pass clipped to the near half. The atmosphere snaps on and four satellites bounce onto the ring.
- **1.20–2.00** The planet floats at `sin(t·4)·8px`, the rim pulses, and one light sweep crosses the lit edge.

## Notes

- **Scale curve.** The brief's overshoot curve peaks at 1.2 and ends at about 0.97 when p = 1, not at 1.0. From 0.60s on, a damped spring takes over. It starts from the curve's value and velocity, so there's no jump, and it comes to rest at exactly 1.0.
- **Purity.** Everything is a constant or a function of `t`. Stars and dust get their randomness from a sine hash of their index, so there's no PRNG state. `draw` resets the transform and canvas state on every call. A render at a given `t` matches pixel for pixel no matter which frames came before it, even when the incoming context is left dirty.
- **Ring depth.** The ring bands are fully opaque, so the front pass can paint over the back pass without leaving a visible seam.
