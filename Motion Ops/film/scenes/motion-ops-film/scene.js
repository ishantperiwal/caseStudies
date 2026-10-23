// motion-ops-film · 1920x1080 · 25 fps · ANIMATIC (everything sketched, plain paper, few words)
// The motion language, shown physically:
//   A → B (two points, one line) → a cursor pulls one Bézier handle (the other mirrors it) into a curve
//   → lines build around the curve: it becomes the top of a whole Motion Card (motion, component, easing, duration)
//   → the card fans open like a peacock's tail (every card) and closes → the deck lives in a Figma plugin
// Anything that changes shape per frame (the line, the curve, the cards' poses) is computed in s.onFrame from
// progress values that the beats tween, so every frame is a pure function of the frame number.
import rough from 'roughjs';
import { studio } from '@studio/studio.js';
import { bezier, rng } from '@studio/ease.js';
import { shotHud, HAND } from '@studio/kits/sketch.js';

const s = await studio({ id: 'motion-ops-film', width: 1920, height: 1080, fps: 25 });
const svg = document.getElementById('art');
const rc = rough.svg(svg);
const INK = '#2b2b2b', BLUE = '#2f6fd6', MUTED = '#8a8579', FAINT = '#c9c3b6';
const NS = 'http://www.w3.org/2000/svg';
const node = (tag, attrs = {}, parent = svg) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); parent.appendChild(e); return e; };
const grp = (name, parent = svg) => { const g = node('g', {}, parent); g.dataset.name = name; return g; };
const text = (g, x, y, str, o = {}) => { const t = node('text', { x, y, 'font-size': 34, 'font-family': HAND, fill: INK, ...o }, g); t.textContent = str; return t; };
const clamp = (v) => Math.max(0, Math.min(1, v));
const ramp = (f, a, d) => clamp((f - a) / d);
const lerp = (a, b, t) => a + (b - a) * t;
const MOVE = bezier(0.45, 0, 0.2, 1), OVER = bezier(0.34, 1.4, 0.64, 1);
const rr = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
// a rough stroke redrawn every frame with a fixed seed, so it changes shape smoothly instead of boiling
const live = (layer, d, o = {}) => layer.replaceChildren(rc.path(d, { seed: 42, roughness: 0.5, bowing: 0.4, strokeWidth: 5, stroke: INK, ...o }));
// draw-on: reveal a group's strokes along their length (p 0 → 1)
function drawOn(g) {
  const paths = [...g.querySelectorAll('path')].filter((p) => p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none');
  const lens = paths.map((p) => p.getTotalLength());
  return (p) => paths.forEach((el, i) => { el.style.strokeDasharray = `${lens[i]} ${lens[i]}`; el.style.strokeDashoffset = `${(lens[i] * (1 - p)).toFixed(1)}`; });
}

// ---------------------------------------------------------------- the Motion Card, in card units (origin = the curve's centre)
// The curve sits in the top window; below it, the card's fields: motion, component, easing, duration.
const A = { x: -260, y: 180 }, B = { x: 260, y: -180 };   // the curve's ends (y up on screen = negative)
const CW = B.x - A.x, CH = A.y - B.y;
const cp = (e) => [{ x: A.x + e[0] * CW, y: A.y - e[1] * CH }, { x: A.x + e[2] * CW, y: A.y - e[3] * CH }];
const curveD = (p1, p2) => `M${A.x},${A.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${B.x},${B.y}`;
const BODY = { x: -340, y: -320, w: 680, h: 1160, r: 44 }, WIN = { x: -300, y: -285, w: 600, h: 560, r: 24 };
const ROWS = [{ y: 360, label: 'Motion' }, { y: 470, label: 'Component' }, { y: 580, label: 'Easing' }, { y: 690, label: 'Duration' }];
const SEPS = [415, 525, 635];
function frameLines(g, seed) {   // the card's structure: outline, the curve's window, row separators
  g.appendChild(rc.path(rr(BODY.x, BODY.y, BODY.w, BODY.h, BODY.r), { seed, roughness: 1, strokeWidth: 4, stroke: INK }));
  g.appendChild(rc.path(rr(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r), { seed: seed + 1, roughness: 0.8, strokeWidth: 3, stroke: INK }));
  SEPS.forEach((y, i) => g.appendChild(rc.line(-300, y, 300, y, { seed: seed + 2 + i, roughness: 0.8, strokeWidth: 2, stroke: FAINT })));
}
function rowArt(g, i, ms, seed) {   // one field: a small label and a sketched value
  const { y, label } = ROWS[i], o = { seed, roughness: 1, strokeWidth: 3, stroke: INK };
  text(g, -290, y + 12, label, { fill: MUTED, 'font-size': 32 });
  if (i === 0) { g.appendChild(rc.rectangle(40, y - 22, 44, 44, { ...o, fill: '#cfe0fb', fillStyle: 'solid', stroke: BLUE })); g.appendChild(rc.line(100, y, 230, y, o)); g.appendChild(rc.line(230, y, 212, y - 12, o)); g.appendChild(rc.line(230, y, 212, y + 12, o)); }
  if (i === 1) { g.appendChild(rc.path(rr(40, y - 24, 200, 48, 16), { ...o, fill: '#FFE9A8', fillStyle: 'solid', stroke: '#b58a1a' })); }
  if (i === 2) { g.appendChild(rc.line(40, y, 250, y, { ...o, seed: seed + 1, stroke: FAINT, strokeWidth: 8, roughness: 1.6 })); }
  if (i === 3) { g.appendChild(rc.path(rr(40, y - 30, 190, 60, 30), { ...o, fill: '#f2efe8', fillStyle: 'solid' })); text(g, 135, y + 12, `${ms} ms`, { 'text-anchor': 'middle' }); }
}
function cardArt(g, ease, ms, seed) {   // a finished card: depth, body, structure, curve, fields
  g.appendChild(rc.path(rr(BODY.x + 18, BODY.y + 18, BODY.w, BODY.h, BODY.r), { seed, roughness: 1, strokeWidth: 3, stroke: '#cfc6b3', fill: '#e7e0d1', fillStyle: 'solid' }));
  g.appendChild(rc.path(rr(BODY.x, BODY.y, BODY.w, BODY.h, BODY.r), { seed: seed + 1, roughness: 1, stroke: 'none', fill: '#fff', fillStyle: 'solid' }));
  frameLines(g, seed + 2);
  const [p1, p2] = cp(ease);
  g.appendChild(rc.path(curveD(p1, p2), { seed: seed + 8, roughness: 0.6, strokeWidth: 9, stroke: BLUE }));
  [A, B].forEach((p, i) => g.appendChild(rc.circle(p.x, p.y, 30, { seed: seed + 9 + i, roughness: 0.6, strokeWidth: 3, stroke: INK, fill: INK, fillStyle: 'solid' })));
  ROWS.forEach((_, i) => rowArt(g, i, ms, seed + 20 + i * 3));
}
// the deck: 13 presets, each named for how it starts and settles (case study): different curves and durations
const HERO_EASE = [0.65, 0, 0.35, 1];
const DECK = [
  [[0.4, 0, 1, 1], 150], [[0.6, 0, 0.8, 0.4], 200], [[0.5, 0, 0.7, 0.6], 250], [[0.45, 0, 0.55, 1], 300], [[0.5, 0, 0.5, 1], 350], [[0.4, 0, 0.2, 1], 300],
  [HERO_EASE, 300],   // the hero: the one drawn by hand
  [[0.2, 0, 0, 1], 250], [[0, 0, 0.2, 1], 200], [[0.16, 1, 0.3, 1], 400], [[0.34, 1.4, 0.64, 1], 450], [[0.1, 0.7, 0.1, 1], 500], [[0, 0.55, 0.45, 1], 250],
];
const MID = 6, N = DECK.length;

// ---------------------------------------------------------------- Figma: window chrome, the canvas world (zooms out later), the plugin
// The window chrome (frame, toolbar, layers panel) sits behind; the canvas is its own "world" group, clipped to the
// canvas area until the camera pulls back to show many flows, each with Motion Cards placed between screens.
const win = grp('Figma window');
{
  const o = { roughness: 1, strokeWidth: 3, stroke: INK };
  win.appendChild(rc.rectangle(210, 130, 1500, 780, { ...o, seed: 101, fill: '#fff', fillStyle: 'solid' }));
  win.appendChild(rc.line(210, 182, 1710, 182, { ...o, seed: 102 }));
  [240, 268, 296].forEach((x, i) => win.appendChild(rc.circle(x, 156, 16, { ...o, seed: 103 + i })));
  win.appendChild(rc.line(470, 182, 470, 910, { ...o, seed: 106 }));
  [230, 270, 310, 350, 390].forEach((y, i) => win.appendChild(rc.line(240, y, 240 + [180, 140, 160, 120, 150][i], y, { ...o, seed: 107 + i, stroke: FAINT, strokeWidth: 6, roughness: 1.6 })));
}
const winDraw = drawOn(win);
const clip = node('clipPath', { id: 'canvasClip' }, node('defs')); const clipR = node('rect', { x: 470, y: 182, width: 1240, height: 728 }, clip);
const world = grp('Figma canvas (zooms out)'); world.setAttribute('clip-path', 'url(#canvasClip)');
const worldIn = grp('Canvas content', world);
function screen(g, x, y, seed) {   // a sketched app screen on the canvas
  g.appendChild(rc.rectangle(x - 85, y - 165, 170, 330, { seed, roughness: 1, strokeWidth: 3, stroke: INK, fill: '#fff', fillStyle: 'solid' }));
  g.appendChild(rc.line(x - 55, y - 110, x + 45, y - 110, { seed: seed + 1, roughness: 1.4, strokeWidth: 6, stroke: FAINT }));
  g.appendChild(rc.line(x - 55, y - 80, x + 15, y - 80, { seed: seed + 2, roughness: 1.4, strokeWidth: 5, stroke: FAINT }));
}
const FLOW = { x0: 620, y0: 560, dx: 500, dy: 440 }, ZOOM = { x: 870, y: 560, k: 0.34 };
const flows = grp('Many flows, specs between screens', worldIn);
const flowCards = [];
{
  const R2 = rng(11);
  for (let r = -3; r <= 3; r++) for (let c = -4; c <= 5; c++) {
    const x = FLOW.x0 + c * FLOW.dx, y = FLOW.y0 + r * FLOW.dy;
    if (r === 0 && (c === 0 || c === 1)) continue;   // the two frames we work on (drawn below)
    screen(flows, x, y, 600 + (r + 3) * 40 + (c + 4) * 3);
    if (c < 5 && !(r === 0 && c === 0)) {
      if (R2() < 0.42) { const k = grp('Spec between screens', flows); cardArt(k, DECK[Math.floor(R2() * N)][0], DECK[Math.floor(R2() * N)][1], 900 + flowCards.length * 30);
        flowCards.push({ g: k, x: x + FLOW.dx / 2, y: y - 50, d: R2() }); }
      else { flows.appendChild(rc.line(x + 100, y, x + FLOW.dx - 100, y, { seed: 800 + r * 20 + c, roughness: 1, strokeWidth: 3, stroke: FAINT })); }
    }
  }
}
const pair = grp('The two frames', worldIn); screen(pair, FLOW.x0, FLOW.y0, 112); screen(pair, FLOW.x0 + FLOW.dx, FLOW.y0, 116);
// the plugin: a list of easings by name (as in the case study); a card only forms when you pick one
const plugin = grp('Plugin panel – Motion Cards');
plugin.appendChild(rc.rectangle(1300, 215, 350, 660, { seed: 120, roughness: 1, strokeWidth: 3, stroke: INK, fill: '#fff', fillStyle: 'solid' }));
plugin.appendChild(rc.line(1300, 262, 1650, 262, { seed: 121, roughness: 1, strokeWidth: 3, stroke: INK }));
text(plugin, 1322, 249, 'Motion Cards', { 'font-size': 26 });
const LIST = [['h', 'DECELERATION'], ['r', 'moving → superSlow'], ['r', 'moving → verySlow'], ['r', 'moving → slow'], ['h', 'ACCELERATION'], ['r', 'superSlow → moving'], ['r', 'verySlow → moving'], ['r', 'slow → moving'], ['h', 'STANDARD'], ['r', 'slow → slow']];
const PICK_ROW = 3, rowY = (i) => 312 + i * 54;
const pickHi = grp('Picked row highlight', plugin); pickHi.appendChild(rc.rectangle(1312, rowY(PICK_ROW) - 32, 326, 46, { seed: 130, roughness: 0.8, strokeWidth: 2, stroke: BLUE, fill: '#dfe9fb', fillStyle: 'solid' }));
const listRows = LIST.map(([kind, label], i) => { const g = grp(`Plugin row – ${label}`, plugin);
  text(g, kind === 'h' ? 1475 : 1330, rowY(i), label, kind === 'h' ? { 'font-size': 18, fill: MUTED, 'text-anchor': 'middle', 'letter-spacing': 3 } : { 'font-size': 26 }); return g; });
const INTO = { x: 1475, y: 470, k: 0.04 };   // where the deck pours into the list

// ---------------------------------------------------------------- the deck (fan cards) and the hero (drawn live, then one of them)
const deckG = grp('Deck');
const order = [...Array(N).keys()].sort((a, b) => Math.abs(b - MID) - Math.abs(a - MID));   // outer cards behind, middle in front
const cards = [];
order.forEach((i) => { if (i === MID) return; const g = grp(`Card – ${DECK[i][1]} ms`, deckG); cardArt(g, DECK[i][0], DECK[i][1], 200 + i * 40); cards[i] = g; });

const hero = grp('Hero card', deckG);
const heroFill = grp('Hero – card fill', hero);
heroFill.appendChild(rc.path(rr(BODY.x + 18, BODY.y + 18, BODY.w, BODY.h, BODY.r), { seed: 300, roughness: 1, strokeWidth: 3, stroke: '#cfc6b3', fill: '#e7e0d1', fillStyle: 'solid' }));
heroFill.appendChild(rc.path(rr(BODY.x, BODY.y, BODY.w, BODY.h, BODY.r), { seed: 301, roughness: 1, stroke: 'none', fill: '#fff', fillStyle: 'solid' }));
const heroLines = grp('Hero – the card builds around the curve', hero); frameLines(heroLines, 302);
const drawLines = drawOn(heroLines);
const heroRows = ROWS.map((r, i) => { const g = grp(`Field – ${r.label}`, hero); rowArt(g, i, 300, 320 + i * 3); return g; });
const handles = grp('Bézier handles', hero);
const hLines = [grp('Handle 1 – line', handles), grp('Handle 2 – line (mirrors 1)', handles)];
const knobs = [0, 1].map(() => node('circle', { r: 13, fill: '#fff', stroke: BLUE, 'stroke-width': 4 }, handles));
const curveL = grp('The line / curve', hero);
const ends = [A, B].map((p, i) => { const g = grp(i ? 'Point B' : 'Point A', hero); g.appendChild(rc.circle(0, 0, 30, { seed: 310 + i, roughness: 0.6, strokeWidth: 3, stroke: INK, fill: INK, fillStyle: 'solid' }));
  g.lbl = text(g, i ? 26 : -26, i ? -18 : 50, i ? 'B' : 'A', { 'font-size': 40, 'text-anchor': 'middle', fill: MUTED }); return g; });
const rider = node('circle', { r: 16, fill: BLUE }, hero); rider.dataset.name = 'Dot riding the curve';

const copyLayer = grp('Dragged card (over the plugin, zooms with the canvas)'); const copy = grp('Card dragged onto the canvas', copyLayer); cardArt(copy, DECK[9][0], DECK[9][1], 400);
const cursor = grp('Cursor');
cursor.appendChild(rc.path('M0,0 L0,46 L12,35 L21,55 L30,51 L21,32 L38,32 Z', { seed: 500, roughness: 0.6, strokeWidth: 3, stroke: INK, fill: '#fff', fillStyle: 'solid' }));

// ---------------------------------------------------------------- state the beats tween; the frame hook turns it into drawing
const st = { a: 0, b: 0, line: 0, p1: 0, hand: 0, body: 0, reveal: 0, fill: 0, rows: 0, ride: 0, shrink: 0, win: 0, panel: 0, dx: 0, px: -300, list: 0, hi: 0, copy: 0, zoom: 0, chrome: 1, flows: 0, __label: 'drawing' };
const cur = { x: 1560, y: 980, o: 0, press: 0, follow: 0, __label: 'cursor' };
const BIG = { x: 960, y: 520, k: 0.9 };    // the curve, close up
const CARD = { x: 960, y: 372, k: 0.6 };   // the whole card in view (its centre is 260 below the curve's)
const SLOT = { x: 960, y: 372, k: 0.22 }, PIVOT = { x: 960, y: 985 }, R = SLOT.y - PIVOT.y;
const toStage = (p, pose) => ({ x: pose.x + p.x * pose.k, y: pose.y + p.y * pose.k });
const P1S = { x: A.x + CW / 3, y: A.y - CH / 3 }, [P1F] = cp(HERO_EASE);
const mirror = (p) => ({ x: A.x + B.x - p.x, y: A.y + B.y - p.y });   // the second handle follows the first

// ================================================================ 1 · A → B
s.beat('ab.points', { at: 2, dur: 14, ease: 'linear', note: 'Point A, then point B' }, (b) => { b.fromTo(st, { a: 0 }, { a: 1 }, { dur: 8 }); b.fromTo(st, { b: 0 }, { b: 1 }, { at: 6, dur: 8 }); });
s.beat('ab.line', { at: 14, dur: 22, ease: 'move', note: 'They connect: a straight line draws from A to B' }, (b) => b.fromTo(st, { line: 0 }, { line: 1 }));

// ================================================================ 2 · shape it: one handle, the other mirrors it
s.beat('curve.handles', { at: 34, dur: 8, ease: 'settle', note: 'Bézier handles appear on the line' }, (b) => b.fromTo(st, { hand: 0 }, { hand: 1 }));
s.beat('cursor.in', { at: 38, dur: 18, ease: 'move', note: 'A cursor comes in to a handle' }, (b) => {
  const h = toStage(P1S, BIG);
  b.fromTo(cur, { x: 1560, y: 980, o: 0 }, { x: h.x, y: h.y, o: 1 });
});
s.beat('curve.drag', { at: 58, dur: 24, ease: 'move', note: 'One drag: the other handle mirrors it, the line becomes an ease curve' }, (b) => {
  b.set(cur, { follow: 1 }); b.fromTo(cur, { press: 0 }, { press: 1 }, { dur: 3 });
  b.fromTo(st, { p1: 0 }, { p1: 1 });
  b.fromTo(cur, { press: 1 }, { press: 0 }, { at: 24, dur: 3 });
});
s.beat('cursor.out', { at: 84, dur: 14, ease: 'exit', note: 'The cursor lets go and leaves' }, (b) => {
  const a = toStage(P1F, BIG);
  b.set(cur, { follow: 0, x: a.x, y: a.y }); b.fromTo(cur, { x: a.x, y: a.y, o: 1 }, { x: a.x + 300, y: a.y + 420, o: 0 });
});

// ================================================================ 3 · the curve goes into a Motion Card
s.beat('card.build', { at: 88, dur: 28, ease: 'move', note: 'Lines build around the curve: it becomes the top of a card, and we pull back to see the whole card' }, (b) => {
  b.fromTo(st, { hand: 1 }, { hand: 0 }, { dur: 8, ease: 'fade' });
  b.fromTo(st, { body: 0 }, { body: 1 });
  b.fromTo(st, { reveal: 0 }, { reveal: 1 }, { at: 2, dur: 26 });
  b.fromTo(st, { fill: 0 }, { fill: 1 }, { at: 16, dur: 10, ease: 'fade' });
});
s.beat('card.fields', { at: 108, dur: 26, ease: 'linear', note: 'Its fields fill in: motion, component, easing, duration' }, (b) => b.fromTo(st, { rows: 0 }, { rows: 1 }));
s.beat('card.ride', { at: 132, dur: 20, ease: HERO_EASE, note: 'A dot rides the curve, on the card’s own easing' }, (b) => b.fromTo(st, { ride: 0 }, { ride: 1 }));
s.beat('card.shrink', { at: 150, dur: 22, ease: 'move', note: 'The card settles into the middle of the deck' }, (b) => b.fromTo(st, { shrink: 0 }, { shrink: 1 }));

// ================================================================ 4 · the deck: fans open like a peacock's tail, then closes
const FAN = { at: 172, open: 18, hold: 26, close: 16, step: 2 }, SPREAD = 10.5;   // degrees between cards
s.beat('deck.open', { at: FAN.at, dur: FAN.open + FAN.step * MID, ease: 'linear', note: 'The card fans open: every Motion Card, each its own curve' }, (b) => b.track(deckG));
s.beat('deck.close', { at: FAN.at + FAN.open + FAN.hold, dur: FAN.close + FAN.step * MID, ease: 'linear', note: 'The fan closes back into one card' }, (b) => b.track(deckG));
const openOf = (i, f) => {
  const d = Math.abs(i - MID), t0 = FAN.at + d * FAN.step, t1 = FAN.at + FAN.open + FAN.hold + (MID - d) * FAN.step;   // opens middle-out, closes outside-in
  return OVER(ramp(f, t0, FAN.open)) - MOVE(ramp(f, t1, FAN.close));
};

// ================================================================ 5 · Figma: the deck pours into the plugin's list; a name drags out as a card
const PG = { at: 240, dur: 16, step: 1.2 };   // the deck flies into the plugin as it finishes closing
// balance: as the fan collapses the deck drifts left, so the plugin arriving on the right sits in a centred pair;
// when Figma builds, the plugin glides to its place in the window
s.beat('deck.shift', { at: 214, dur: 32, ease: 'move', note: 'The collapsing deck drifts left to make room for the plugin' }, (b) => b.fromTo(st, { dx: 0 }, { dx: -300 }));
s.beat('figma.panel', { at: 234, dur: 12, ease: 'settle', note: 'The plugin panel appears on its own, ready to take the deck' }, (b) => b.fromTo(st, { panel: 0 }, { panel: 1 }));
s.beat('figma.deck', { at: PG.at, dur: PG.dur + PG.step * (N - 1), ease: 'linear', note: 'The deck pours into the plugin: it becomes a list of easings by name' }, (b) => {
  b.track(deckG); b.fromTo(st, { list: 0 }, { list: 1 }, { at: 6, dur: 24 });
});
s.beat('figma.window', { at: 266, dur: 26, ease: 'move', note: 'Then Figma builds itself around the plugin: window, layers, canvas, two frames' }, (b) => {
  b.fromTo(st, { win: 0 }, { win: 1 });
  b.fromTo(st, { px: -300 }, { px: 0 }, { dur: 22 });   // the plugin glides to its place in the window
});
const tileOf = (i, f) => MOVE(ramp(f, PG.at + i * PG.step, PG.dur));
const DROP = { x: 870, y: 450, k: 0.24 }   // a touch bigger than true scale: it has to read in a thumbnail
, ROWPT = { x: 1420, y: rowY(PICK_ROW) - 10 };
s.beat('figma.pick', { at: 292, dur: 14, ease: 'move', note: 'The cursor picks a name in the list…' }, (b) => {
  b.fromTo(cur, { x: 1180, y: 980, o: 0 }, { x: ROWPT.x, y: ROWPT.y, o: 1 });
  b.fromTo(st, { hi: 0 }, { hi: 1 }, { at: 10, dur: 4, ease: 'fade' });
  b.fromTo(cur, { press: 0 }, { press: 1 }, { at: 14, dur: 3 });
});
s.beat('figma.drop', { at: 308, dur: 24, ease: 'move', note: '…drags it out: it becomes a Motion Card, dropped between the two screens' }, (b) => {
  b.fromTo(st, { copy: 0 }, { copy: 1 });
  b.fromTo(cur, { x: ROWPT.x, y: ROWPT.y }, { x: DROP.x + 10, y: DROP.y + 30 });
  b.fromTo(cur, { press: 1 }, { press: 0 }, { at: 24, dur: 3 });
  b.fromTo(cur, { o: 1 }, { o: 0 }, { at: 28, dur: 8, ease: 'fade' });
  b.fromTo(st, { hi: 1 }, { hi: 0 }, { at: 20, dur: 6, ease: 'fade' });
});

// ================================================================ 6 · zoom out: specs between screens, everywhere
s.beat('world.zoom', { at: 338, dur: 44, ease: [0.6, 0, 0.1, 1], note: 'Pull back: many flows, Motion Cards placed between screens all over' }, (b) => {
  b.fromTo(st, { zoom: 0 }, { zoom: 1 });
  b.fromTo(st, { chrome: 1 }, { chrome: 0 }, { dur: 14, ease: 'fade' });
  b.fromTo(st, { flows: 0 }, { flows: 1 }, { at: 4, dur: 40, ease: 'linear' });
});

// ---------------------------------------------------------------- the frame hook: everything shape-changing, from the state above
const tf = (x, y, a, k) => `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(2)}) scale(${k.toFixed(4)})`;
s.onFrame((f) => {
  // points, line, curve, handles
  ends.forEach((g, i) => { const p = i ? B : A, v = OVER(i ? st.b : st.a); g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${v.toFixed(3)})`); g.lbl.style.opacity = (1 - st.body).toFixed(2); });
  const p1 = { x: lerp(P1S.x, P1F.x, st.p1), y: lerp(P1S.y, P1F.y, st.p1) }, p2 = mirror(p1);
  if (st.line < 1) live(curveL, `M${A.x},${A.y} L${lerp(A.x, B.x, st.line).toFixed(1)},${lerp(A.y, B.y, st.line).toFixed(1)}`);
  else live(curveL, curveD(p1, p2), { stroke: st.p1 > 0 ? BLUE : INK, strokeWidth: lerp(5, 9, st.p1) });
  curveL.style.opacity = st.line > 0 ? 1 : 0;
  handles.style.opacity = st.hand.toFixed(3);
  [[A, p1], [B, p2]].forEach(([e, h], i) => { live(hLines[i], `M${e.x},${e.y} L${h.x.toFixed(1)},${h.y.toFixed(1)}`, { stroke: BLUE, strokeWidth: 2.5, roughness: 0.3 }); knobs[i].setAttribute('cx', h.x.toFixed(1)); knobs[i].setAttribute('cy', h.y.toFixed(1)); });
  // the card building around it
  drawLines(st.body); heroLines.style.opacity = st.body > 0 ? 1 : 0;
  heroFill.style.opacity = st.fill.toFixed(3);
  heroRows.forEach((g, i) => { const v = MOVE(clamp(st.rows * 4 - i * 0.9)); g.style.opacity = v.toFixed(3); g.setAttribute('transform', `translate(${(-24 * (1 - v)).toFixed(1)} 0)`); });
  const r = st.ride, q = 1 - r, [P1, P2] = cp(HERO_EASE);
  rider.setAttribute('cx', (q * q * q * A.x + 3 * q * q * r * P1.x + 3 * q * r * r * P2.x + r * r * r * B.x).toFixed(1));
  rider.setAttribute('cy', (q * q * q * A.y + 3 * q * q * r * P1.y + 3 * q * r * r * P2.y + r * r * r * B.y).toFixed(1));
  rider.style.opacity = r > 0 && r < 1 ? 1 : 0;
  // poses: curve close-up → whole card → deck slot → fan angle → plugin tile
  for (let i = 0; i < N; i++) {
    const g = i === MID ? hero : cards[i];
    const ang = SPREAD * (i - MID) * openOf(i, f), rad = (ang * Math.PI) / 180;
    let x = PIVOT.x + st.dx - R * Math.sin(rad), y = PIVOT.y + R * Math.cos(rad), k = SLOT.k;
    if (i === MID) {
      const v = MOVE(st.reveal), m = st.shrink;
      const bx = lerp(BIG.x, CARD.x, v), by = lerp(BIG.y, CARD.y, v), bk = lerp(BIG.k, CARD.k, v);
      x = lerp(bx, x, m); y = lerp(by, y, m); k = lerp(bk, k, m);   // (st.dx only moves after the hero has landed)
    }
    const tp = tileOf(i, f);   // pouring into the plugin's list
    x = lerp(x, INTO.x + st.px, tp); y = lerp(y, INTO.y, tp); k = lerp(k, INTO.k, tp);
    g.setAttribute('transform', tf(x, y, ang * (1 - tp), k));
    g.style.opacity = ((i === MID || st.shrink >= 1 ? 1 : 0) * (1 - ramp(tp, 0.6, 0.4))).toFixed(3);   // the rest of the deck waits behind the hero until it lands
  }
  // Figma: window, plugin list, the dragged card, then the pull-back
  win.style.opacity = st.win > 0 ? st.chrome.toFixed(3) : 0; winDraw(st.win);
  [...win.querySelectorAll('path')].forEach((p) => { if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') p.style.opacity = st.win; });
  world.style.opacity = st.win.toFixed(3);
  plugin.style.opacity = st.panel.toFixed(3);
  plugin.setAttribute('transform', `translate(${(st.px + 40 * (1 - st.panel) + 700 * MOVE(ramp(st.zoom, 0, 0.45))).toFixed(1)} 0)`);   // slides off screen as we pull back
  listRows.forEach((g, i) => { const v = MOVE(clamp(st.list * 3 - i * 0.2)); g.style.opacity = v.toFixed(3); g.setAttribute('transform', `translate(0 ${(-14 * (1 - v)).toFixed(1)})`); });
  pickHi.style.opacity = st.hi.toFixed(3);
  const cm = MOVE(st.copy), wk = lerp(1, ZOOM.k, st.zoom);
  // the card forms from the row as it is dragged (in canvas coords: the world is still at 1:1 while dragging)
  copy.style.opacity = st.copy > 0 ? 1 : 0;
  copy.setAttribute('transform', tf(lerp(ROWPT.x, DROP.x, cm), lerp(ROWPT.y - 40, DROP.y, cm), lerp(-6, 0, cm), lerp(0.03, DROP.k, cm)));
  const wt = `translate(${ZOOM.x} ${ZOOM.y}) scale(${wk.toFixed(4)}) translate(${-ZOOM.x} ${-ZOOM.y})`;
  worldIn.setAttribute('transform', wt); copyLayer.setAttribute('transform', wt);
  const open = MOVE(ramp(st.zoom, 0.05, 0.5));   // the clip opens out from the canvas area to the whole frame
  clipR.setAttribute('x', lerp(470, 0, open).toFixed(1)); clipR.setAttribute('y', lerp(182, 0, open).toFixed(1));
  clipR.setAttribute('width', lerp(1240, 1920, open).toFixed(1)); clipR.setAttribute('height', lerp(728, 1080, open).toFixed(1));
  flows.style.opacity = st.zoom > 0 ? 1 : 0;
  flowCards.forEach((c) => { const v = OVER(ramp(st.flows, c.d * 0.7, 0.3)); c.g.setAttribute('transform', tf(c.x, c.y, 0, DROP.k * v)); c.g.style.opacity = v > 0 ? 1 : 0; });   // specs pop in between screens as the view widens
  // cursor
  const ch = cur.follow === 1 ? toStage(p1, BIG) : cur;
  cursor.setAttribute('transform', `translate(${ch.x.toFixed(1)} ${ch.y.toFixed(1)}) scale(${(1 - 0.12 * cur.press).toFixed(3)})`);
  cursor.style.opacity = cur.o.toFixed(3);
});

shotHud(s, document.getElementById('stage'), [
  { id: 'ab', at: 0, dur: 34, title: 'A → B', action: 'Two points, one line.' },
  { id: 'shape', at: 34, dur: 54, title: 'Shape it', action: 'Pull one handle: an ease curve.' },
  { id: 'card', at: 88, dur: 84, title: 'A Motion Card', action: 'The curve goes into a card.' },
  { id: 'deck', at: 172, dur: 64, title: 'The deck', action: 'Every card, fanned open, then closed.' },
  { id: 'figma', at: 236, dur: 102, title: 'In Figma', action: 'The deck becomes a plugin; drag out a card.' },
  { id: 'everywhere', at: 338, dur: 74, title: 'Everywhere', action: 'Specs between screens, across every flow.' },
]);

await document.fonts.ready;
s.ready({ tail: 30 });
