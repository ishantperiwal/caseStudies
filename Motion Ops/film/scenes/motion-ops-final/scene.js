// motion-ops-final · 1920x1200 (16:10, the 1920×1080 composition centred) · 25 fps · the finished film (story from the motion-ops-film animatic)
// Look: an aqua ground (#BCD9D2) that sits with the navy cards, flat. The Motion Card is the real printed card from the case study:
// its exact front faces and the shared back, as a physical plastic card (rim thickness, a subtle bevel; no sheen,
// no cast shadow), in true 3D for the flip; flat once it settles. Figma is its light UI; the plugin is the case study's navy list.
//   close on a dot riding Page Transition's curve (0.6, 0, 0.2, 1) → pull back as the names designers juggle for easings
//   fill the backdrop → the names clear and the real card
//   materialises out of the curve's frame (the drawn curve becomes the printed one) → one slow 360 (its back shows
//   on the way round) while it settles back; as it finishes, four more featured cards spread out left and right, tilted,
//   stepping down → they gather and drift left as the plugin arrives, pour into its list → Figma builds around it →
//   a name is dragged out as a card between two screens → pull back: cards between screens across every flow
// Everything that moves is computed in s.onFrame from progress values the beats tween (pure function of the frame).
import { studio } from '@studio/studio.js';
import { bezier, rng } from '@studio/ease.js';
import { GLASS_FRAG, GLASS_VERT } from './liquid-glass.js';

const s = await studio({ id: 'motion-ops-final', width: 1920, height: 1200, fps: 25 });   // 16:10 like the other films; the composition is drawn in 1920×1080 coordinates, centred (OFFY)
const OFFY = 60;
const art = document.getElementById('art'), top = document.getElementById('top');
const deckEl = document.getElementById('deck3d');
// the cards' edge, drawn in 2D on each card as it appears on screen (it doesn't turn or foreshorten with the card): its
// silhouette grown by 3 px (blur + threshold, so corners stay concentric), a white copy up-left and a solid black copy
// down-right, black above white
{ const svg = document.getElementById('art'), defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS('http://www.w3.org/2000/svg', 'defs'), svg.firstChild);
  defs.insertAdjacentHTML('beforeend', `<filter id="cardEdge2d" x="-600" y="-600" width="3120" height="2280" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
    <feComponentTransfer in="b" result="grown"><feFuncA type="linear" slope="16" intercept="-1.2"/></feComponentTransfer>
    <feOffset in="grown" dx="-3" dy="-3" result="wo"/><feFlood flood-color="#fff"/><feComposite in2="wo" operator="in" result="white"/>
    <feOffset in="grown" dx="5" dy="6" result="bo"/><feFlood flood-color="#000"/><feComposite in2="bo" operator="in" result="black"/>
    <feMerge><feMergeNode in="white"/><feMergeNode in="black"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`); }
const NS = 'http://www.w3.org/2000/svg';
const node = (tag, attrs = {}, parent = art) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); parent.appendChild(e); return e; };
const grp = (name, parent = art) => { const g = node('g', {}, parent); g.dataset.name = name; return g; };
const text = (g, x, y, str, o = {}) => { const t = node('text', { x, y, 'font-size': 32, fill: '#fff', 'font-weight': 500, ...o }, g); t.textContent = str; return t; };
const div = (cls, parent, name) => { const d = document.createElement('div'); d.className = cls; if (name) d.dataset.name = name; parent.appendChild(d); return d; };
const clamp = (v) => Math.max(0, Math.min(1, v));
const ramp = (f, a, d) => clamp((f - a) / d);
const lerp = (a, b, t) => a + (b - a) * t;
const MOVE = bezier(0.45, 0, 0.2, 1), OVER = bezier(0.34, 1.3, 0.64, 1), SETTLE = bezier(0.16, 1, 0.3, 1), OUT = bezier(0.2, 0.9, 0.3, 1);
const C = { paper: '#F7FBFA', ground: '#BCD9D2', gridLine: '#CBE3DD', ink: '#10213F', warm: '#6A8783', blue: '#2A6FD6', blueHi: '#4E8FEA', soft: '#9FB8DD', muted: '#7FA6E0' };
const CARD_IMG = (n) => `assets/cards/${n}.png`;

// ---------------------------------------------------------------- shared paint
const defs = node('defs');
const grad = (id, stops, attrs = {}) => { const g = node('linearGradient', { id, ...attrs }, defs); stops.forEach(([o, c]) => node('stop', { offset: o, 'stop-color': c }, g)); return `url(#${id})`; };
const BRAND = grad('brand', [[0, '#3fd3e0'], [0.55, '#7fd1a0'], [1, '#d6d77a']], { x1: 0, y1: 0, x2: 1, y2: 0 });
const SCREEN_TOP = grad('screenTop', [[0, '#FFD3A6'], [1, '#FFF3E6']], { x1: 0, y1: 0, x2: 0, y2: 1 });
const shadow = (id, dy, blur, op) => { const f = node('filter', { id, x: '-40%', y: '-40%', width: '180%', height: '200%' }, defs); node('feDropShadow', { dx: 0, dy, stdDeviation: blur, 'flood-color': '#2a2014', 'flood-opacity': op }, f); return `url(#${id})`; };
const SH_SOFT = shadow('shSoft', 10, 14, 0.18), SH_UI = shadow('shUi', 30, 40, 0.22), SH_CARD = shadow('shCard', 3, 2.5, 0.55);   // cards: a sharp, strong shadow
{ const cl = node('clipPath', { id: 'cardRound', clipPathUnits: 'objectBoundingBox' }, defs); node('rect', { x: 0, y: 0, width: 1, height: 1, rx: 30 / 420, ry: 30 / 621.7 }, cl); }
// the ground: pale aqua with an open grid (7px lines on a 120px cell, lighter than the ground)
// (no vignette: the ground is flat, edge to edge)
let gridPat, gridLines; { const pt = gridPat = node('pattern', { id: 'grid', width: 120, height: 120, patternUnits: 'userSpaceOnUse', x: -3.5, y: -3.5 }, defs);   // 16 × 9 cells across the frame
  node('rect', { x: 0, y: 0, width: 120, height: 120, fill: C.ground }, pt); gridLines = [node('rect', { x: 0, y: 0, width: 7, height: 120, fill: C.gridLine }, pt), node('rect', { x: 0, y: 0, width: 120, height: 7, fill: C.gridLine }, pt)];
  const v = node('radialGradient', { id: 'vignette', cx: '50%', cy: '48%', r: '72%' }, defs); node('stop', { offset: 0.55, 'stop-color': '#1c3a36', 'stop-opacity': 0 }, v); node('stop', { offset: 1, 'stop-color': '#1c3a36', 'stop-opacity': 0.22 }, v); }
{ const gr = node('rect', { id: 'groundRect', x: 0, y: 0, width: 1920, height: 1080, fill: 'url(#grid)' }); gr.dataset.name = 'Ground (grid)'; }
const cardImage = (g, name, w) => { const h = w * 1350 / 912; return node('image', { href: CARD_IMG(name), x: -w / 2, y: -h / 2, width: w, height: h, 'clip-path': 'url(#cardRound)', preserveAspectRatio: 'none' }, g); };

// ---------------------------------------------------------------- the physical cards (HTML, true 3D)
const CW3 = 420, CH3 = CW3 * 1350 / 912, PX = CW3 / 912;   // card size on stage; px per image px
function physicalCard(front, name) {
  const wrap = div('mcwrap', deckEl, `Card – ${name} (2D edge)`), el = div('mc', wrap, `Card – ${name}`);   // the edge is drawn in 2D, on the card as seen
  const slabs = Array.from({ length: 18 }, (_, k) => { const d = div(k >= 11 ? 'slab backrim' : 'slab', el); d.style.transform = `translateZ(${(-(k + 1) * 0.9).toFixed(1)}px)`; return d; });   // ~16 px thick   // the back half of the rim takes the back's frame colours
  // a face = a rounded window (.rv) onto the full printed card; the window can grow while the print stays put
  const face = (src, back) => { const f = div('face', el); f.style.transform = back ? 'translateZ(-16.6px) rotateY(180deg)' : 'translateZ(0.4px)';
    const rv = div('rv', f), art = div('art', rv); const img = document.createElement('img'); img.src = src; art.appendChild(img); div('bevel', art); return { f, rv, art }; };
  const fr = face(CARD_IMG(front)), bk = face(CARD_IMG('back'), true);
  bk.rv.classList.add('back');   // the back's own gradient frame is its edge: no dark ring around it
  return { wrap, el, slabs, fr, bk };
}
// featured cards: the hero (Page Transition, the curve we draw) and four more from the case study
const SPREAD_SLOTS = [[-2, 'bottom-sheet', 'Bottom Sheet'], [-1, 'button-tap', 'Button Tap'], [1, 'pop-up-elastic', 'Pop-Up (Elastic)'], [2, 'pop-up', 'Pop-Up']];
const others = SPREAD_SLOTS.map(([j, file, name]) => ({ j, ...physicalCard(file, name) }));
const RANK = { '-1': 1, 1: 2, '-2': 3, 2: 4 };   // place in the gathered stack, under the hero (0): it's also the order they pour into the plugin
others.forEach((o) => { o.rank = RANK[o.j]; o.wrap.style.zIndex = 20 - o.rank; });   // outer cards tuck under the inner ones, and the stack keeps one clear order
const hero = physicalCard('page-transition', 'Page Transition (hero)'); hero.wrap.style.zIndex = 30;
// the hero is first built and revealed as the generic Motion Card (its anatomy: name, motion, component, the curve, the
// easing and duration tokens); while its back faces us it becomes a real one, Page Transition, before it flips back
const heroGeneric = document.createElement('img'); heroGeneric.src = CARD_IMG('generic'); heroGeneric.dataset.name = 'Hero – generic Motion Card face';
Object.assign(heroGeneric.style, { position: 'absolute', left: '0', top: '0', width: '100%', height: '100%', objectFit: 'cover' }); hero.fr.art.insertBefore(heroGeneric, hero.fr.art.querySelector('.bevel'));
// the hero is revealed by a scan from the top: the print sits in a wipe (straight bottom edge) inside the rounded card,
// and its shadow follows the wipe down
const heroShadow = div('hshadow', hero.fr.f, 'Hero – shadow (follows the scan)'); hero.fr.f.insertBefore(heroShadow, hero.fr.rv);
hero.fr.rv.style.boxShadow = 'none';
const heroWipe = div('wipe', hero.fr.rv, 'Hero – revealed part'); heroWipe.appendChild(hero.fr.art);
// behind the scan line the freshly made card glows: a brightened copy of its own print, seen only in a band that is
// brightest at the line and fades smoothly upward (so the ink and lines light up, not a white wash)
const scanGlow = div('art scanglow', heroWipe, 'Hero – glow behind the scan'); { const im = document.createElement('img'); im.src = CARD_IMG('generic'); scanGlow.appendChild(im); }
// a light sweep across the back: a broad, soft glow drifting slowly left to right, faint on the face and stronger on the
// card's frame
// three layers: a sheen (a brightened copy of the print, seen only where the light is, so the ink and the frame catch it
// more than the dark ground), a soft glow tinted with the card's own cyan → white → yellow, and the frame glinting
const sheen = div('art sheen', hero.bk.rv, 'Hero – sheen'); { const im = document.createElement('img'); im.src = CARD_IMG('back'); sheen.appendChild(im); }
const sweepBody = div('sweep', hero.bk.rv, 'Hero – light sweep (face)'), sweepEdge = div('sweep edge', hero.bk.rv, 'Hero – light sweep (edges)');
const glint = div('glint', hero.bk.rv, 'Hero – sparkle glint');   // the printed ✦ beside "Design" twinkles as the light passes it
const GLINT = { x: 357, y: 270 };   // card px
Object.assign(glint.style, { left: `${GLINT.x}px`, top: `${GLINT.y}px` });
// where the printed curve sits on the hero's face (image px, measured): ends and handles of 0.6, 0, 0.2, 1
const IMG = { A: { x: 192, y: 957 }, B: { x: 717, y: 434 }, P1: { x: 541.5, y: 957 }, P2: { x: 309.5, y: 434 }, cx: 456, cy: 675 };

// ---------------------------------------------------------------- the drawn curve (top layer, so it sits over the card as it forms)
// local units = image px, origin = the curve box's centre
const BOXC = { x: (IMG.A.x + IMG.B.x) / 2, y: (IMG.A.y + IMG.B.y) / 2 };
const L = (p) => ({ x: p.x - BOXC.x, y: p.y - BOXC.y });
const A = L(IMG.A), B = L(IMG.B), P1F = L(IMG.P1), P2F = L(IMG.P2);
const P1S = { x: lerp(A.x, B.x, 1 / 3), y: lerp(A.y, B.y, 1 / 3) }, P2S = { x: lerp(A.x, B.x, 2 / 3), y: lerp(A.y, B.y, 2 / 3) };
// the build, after Jakub Antalik's UI-generation skeleton (transitions.dev): an agent assembles the card on a dot matrix.
// A faint lattice (aligned to the card's printed grid) spreads from the curve; the card's frame draws as two dotted halves
// that meet at the bottom; then the parts are placed one by one, a selection bracket jumping to each with its size and
// position: dotted text lines with heavy end dots, a dotted box for the curve's window, the path, the icons. Guides run past
// the edges with square handles on the corners. Beside it, AGENT.LOG counts the parts and MOTION.CSS types this card's
// tokens. Monochrome ink on the paper. The card part rides the curve's transform (image-px units), so it builds while the
// camera pulls back and lands exactly on the card. Then a scan bar slides top to bottom and reveals the real card.
const skel = grp('Card build (agent skeleton)', top);
const halves = (x, y, w, h, r) => [   // a rounded rect as a right and a left half, both from top-centre to bottom-centre
  `M${x + w / 2},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + w / 2}`,
  `M${x + w / 2},${y} H${x + r} A${r},${r} 0 0 0 ${x},${y + r} V${y + h - r} A${r},${r} 0 0 0 ${x + r},${y + h} H${x + w / 2}`];
const SKEL = { at: 102 }, BK = 1.5;
const GRIDIN = { at: SKEL.at + 2, dur: 30 };   // the ground's grid fades in as the names flash out   // BK: the build's pace (its part timings stretch by it)
const RD = rng(29), MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
const matrixG = grp('Dot matrix (clipped above the scan)', skel); matrixG.setAttribute('clip-path', 'url(#belowScanSkel)');
const DOTS = [];
const addDot = (x, y, o) => { const el = node('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 0, fill: C.ink }, matrixG); const d = { el, x, y, ...o, last: '' }; DOTS.push(d); return d; };
// 1) the lattice: spreads out from the curve; on the card's printed grid pitch, so it runs straight into the print
const LAT = 29.3, LAT_OP = 0.3;
for (let gy = -3; 0.5 + gy * LAT <= 1350 + 3 * LAT; gy++) for (let gx = -3; 15.2 + gx * LAT <= 912 + 3 * LAT; gx++) {
  const x = 15.2 + gx * LAT, y = 0.5 + gy * LAT, out = Math.max(0, -x, x - 912, -y, y - 1350);   // px outside the card
  const op = LAT_OP * Math.max(0, 1 - out / 100);
  if (op < 0.02) continue;
  addDot(x, y, { kind: 'lattice', t: SKEL.at + BK * (1 + Math.hypot(x - BOXC.x, y - BOXC.y) / 80), r: 3, op, outside: out > 0 });
}
// short vertical runs of lattice dots that light up darker now and then, the "processing"
const latt = DOTS.filter((d) => !d.outside);
for (let k = 0; latt.length && k < 60; k++) {
  const a = latt[Math.floor(RD() * latt.length)], len = 1 + Math.floor(RD() * 4), period = 9 + Math.floor(RD() * 14), phase = Math.floor(RD() * 30);
  for (let i = 0; i < len; i++) { const d = latt.find((q) => Math.abs(q.x - a.x) < 1 && Math.abs(q.y - (a.y + i * LAT)) < 1); if (d) Object.assign(d, { flick: true, period, phase: phase + i }); }
}
// 2) the parts, placed one by one (image px; at = frames from SKEL.at)
function dotPath(d, at, dur, o = {}) {   // dots along a path, written in over `dur` frames
  const { gap = 11, r = 3.2, op = 0.72 } = o, pth = node('path', { d }, skel), len = pth.getTotalLength(), n = Math.max(2, Math.round(len / gap));
  for (let k = 0; k <= n; k++) { const pt = pth.getPointAtLength((k / n) * len); addDot(pt.x, pt.y, { kind: 'part', t: SKEL.at + BK * (at + (k / n) * dur), r, op, drop: RD() < 0.07, dropPhase: Math.floor(RD() * 40) }); }
  pth.remove();
}
const PARTS = [
  { type: 'frame', box: [0, 0, 912, 1350], at: 0, draw: () => halves(1, 1, 910, 1348, 65).forEach((d) => dotPath(d, 0, 14, { gap: 10, r: 3.4, op: 0.75 })) },
  { type: 'text', box: [286, 52, 340, 44], at: 5 },
  { type: 'text', box: [105, 228, 260, 40], at: 7.5 },
  { type: 'text', box: [700, 232, 118, 34], at: 9.5 },
  { type: 'box', box: [50, 337, 812, 706], at: 11.5, draw: (pt) => halves(50, 337, 812, 706, 52).forEach((d) => dotPath(d, pt.at, 8, { gap: 11, r: 3, op: 0.6 })) },
  { type: 'path', box: [192, 434, 525, 523], at: 14, draw: () => {} },   // the curve itself is already there
  { type: 'icon', box: [167, 1110, 52, 60], at: 16, draw: (pt) => dotPath('M195,1112 m-28,28 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0', pt.at, 5, { gap: 9, r: 2.8 }) },
  { type: 'text', box: [262, 1118, 330, 44], at: 17.5 },
  { type: 'icon', box: [167, 1222, 56, 56], at: 19, draw: (pt) => dotPath('M195,1222 m-28,28 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0', pt.at, 5, { gap: 9, r: 2.8 }) },
  { type: 'text', box: [262, 1228, 210, 44], at: 20.5 },
];
PARTS.forEach((pt) => {
  if (pt.draw) return pt.draw(pt);
  const [x, y, w, h] = pt.box, my = y + h / 2;   // a text line: a dotted run with heavy dots at both ends
  dotPath(`M${x},${my} H${x + w}`, pt.at, 6, { gap: 10, r: 2.8, op: 0.7 });
  addDot(x, my, { kind: 'part', t: SKEL.at + BK * pt.at, r: 6.5, op: 0.85 }); addDot(x + w, my, { kind: 'part', t: SKEL.at + BK * (pt.at + 6), r: 6.5, op: 0.85 });
});
// 3) the selection bracket: jumps to each part as it is placed, with its size above and its position below
const brG = grp('Selection bracket', matrixG);
const brCorners = [0, 1, 2, 3].map(() => node('path', { fill: 'none', stroke: C.ink, 'stroke-width': 3.2, 'stroke-linecap': 'square' }, brG));
const brLabel = text(brG, 0, 0, '', { 'font-size': 24, fill: C.ink, 'font-family': MONO, 'font-weight': 500 });
const brPos = text(brG, 0, 0, '', { 'font-size': 22, fill: C.ink, 'font-family': MONO, 'font-weight': 500 });
const cpx = (v) => Math.round(v * PX);   // image px → card px, for the readouts
// 4) guides past the edges, square handles on the corners, the size/time readout (outside the clip: they hold to the end)
const guideG = grp('Guides, handles and readouts', skel);
const GD = 120, guide = (x1, y1, x2, y2) => node('path', { d: `M${x1},${y1} L${x2},${y2}`, fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '0 10', opacity: 0 }, guideG);
const guides = [guide(-GD, 0, 912 + GD, 0), guide(-GD, 1350, 912 + GD, 1350), guide(0, -GD, 0, 1350 + GD), guide(912, -GD, 912, 1350 + GD)];
const handles = [[0, 0], [912, 0], [0, 1350], [912, 1350]].map(([x, y]) => node('rect', { x: x - 9, y: y - 9, width: 18, height: 18, fill: C.paper, stroke: C.ink, 'stroke-width': 2.4, opacity: 0 }, guideG));
const readout = text(guideG, 0, -30, '', { 'font-size': 26, fill: C.ink, 'font-family': MONO, 'font-weight': 500 }); readout.style.opacity = 0;
// 5) the side panels (stage px): AGENT.LOG on the left, MOTION.CSS on the right
const SHOW_PANELS = false;   // AGENT.LOG / MOTION.CSS beside the card build: off here (the names clearing already carry this moment); kept for reuse
const panels = grp('Agent panels', top);
const pText = (x, y, o = {}) => { const t = text(panels, x, y, '', { 'font-size': 16.5, fill: C.ink, 'font-family': MONO, 'font-weight': 500, ...o }); t.style.whiteSpace = 'pre'; return t; };   // keeps the code's indents
const logHead = pText(232, 166, { 'letter-spacing': 0.5 });
node('path', { d: 'M232,178 H612', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '0 5', 'stroke-linecap': 'round', opacity: 0.5 }, panels);
const logRows = PARTS.map((_, i) => pText(232, 206 + i * 25));
const CSS_LINES = [['/* page transition / slides left */', ''], ['.page-transition {', ''], ['  --pt-motion: ', 'slide-left;'], ['  --pt-component: ', 'page;'],
  ['  --pt-ease: ', 'cubic-bezier(0.6, 0, 0.2, 1);'], ['  --pt-duration: ', '550ms;'], ['}', '']];
const cssHead = pText(1290, 166, { 'letter-spacing': 0.5 });
node('path', { d: 'M1290,178 H1730', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '0 5', 'stroke-linecap': 'round', opacity: 0.5 }, panels);
const cssRows = CSS_LINES.map((_, i) => { const t = pText(1290, 206 + i * 25); const a = node('tspan', {}, t), b = node('tspan', { fill: C.warm }, t); return { a, b }; });
const caret = node('rect', { width: 8, height: 16, fill: C.ink }, panels);
const status = pText(1290, 930, { fill: C.warm });
const PANEL = { in: 106, type: 110, cps: 6 };   // fade in; typing start; chars per frame
const setText = (el, str) => { if (el.textContent !== str) el.textContent = str; };
// the dot trail behind a scan: dots the line has passed linger a moment above it, light (they sit on the revealed UI),
// shrinking and fading over `len`. Returns [r, op, fill] for a dot at y, or null if the scan hasn't reached it.
const TRAIL_FILL = '#CFE0FF';
function trail(y, sy, len, r, op) { if (y >= sy) return null; const t = (sy - y) / len; if (t >= 1) return [0, 0, TRAIL_FILL]; return [r * (1 - 0.45 * t), Math.min(0.9, op + 0.2) * (1 - t) * (1 - t), TRAIL_FILL]; }
const paint = (d, r, op, fill) => { const key = `${r.toFixed(2)}|${op.toFixed(2)}|${fill}`; if (key !== d.last) { d.el.setAttribute('r', r.toFixed(2)); d.el.setAttribute('fill-opacity', op.toFixed(2)); d.el.setAttribute('fill', fill); d.last = key; } };
// the scan: a crisp slider (white core, blue leading band, knobs on both ends) from the card's top edge to its bottom edge
const SCAN = { at: 146, dur: 40, y0: 0, y1: 1350 }, SCANE = bezier(0.3, 0, 0.7, 1);
const scanG = grp('Scan bar', skel);

const scanBand = node('rect', { x: -40, y: 0, width: 992, height: 7, fill: C.blue }, scanG);
const scanCore = node('rect', { x: -40, y: 0, width: 992, height: 4, fill: '#FFFFFF' }, scanG);
const scanKnobs = [];   // no end knobs: the scan lines are just the line
const scanY = (f) => lerp(SCAN.y0, SCAN.y1, SCANE(ramp(f, SCAN.at, SCAN.dur)));
const curveClip = node('clipPath', { id: 'belowScan' }, defs), curveClipR = node('rect', { x: -2000, y: 0, width: 4000, height: 4000 }, curveClip);
const skelClip = node('clipPath', { id: 'belowScanSkel' }, defs), skelClipR = node('rect', { x: -1000, y: -1000, width: 3000, height: 4000 }, skelClip);   // in the skeleton's own units (image px)
// a glass panel holds the curve in the opening (it blurs the names behind it); it goes as we pull back to build the card
// liquid glass: a clear body (light blur), a lens rim that blurs and brightens harder at the edge, and a specular edge light
const glassParts = [div('glass', deckEl, 'Glass panel (behind the curve)'), div('glass spec', deckEl, 'Glass – edge light')];
const curveG = grp('The curve being drawn', top); curveG.setAttribute('clip-path', 'url(#belowScan)');   // gone above the scan
const curveHalo = node('path', { fill: 'none', 'stroke-width': 90, 'stroke-linecap': 'round', stroke: C.ground, filter: 'url(#curveHalo)' }, curveG);   // first: behind the handles too
const hLines = [0, 1].map(() => node('line', { 'stroke-width': 5, stroke: C.blue }, curveG));
// a soft halo in the ground's colour behind the line, so it reads clearly over the backdrop of names (until the card forms)
{ const hf = node('filter', { id: 'curveHalo', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); node('feGaussianBlur', { stdDeviation: 22 }, hf); }
const curveP = node('path', { fill: 'none', 'stroke-width': 8, 'stroke-linecap': 'round', stroke: C.ink }, curveG);
const knobs = [0, 1].map(() => node('circle', { r: 14, 'stroke-width': 5, fill: '#fff', stroke: C.blue }, curveG));
const pulses = [A, B].map((p) => node('circle', { cx: p.x, cy: p.y, r: 23, fill: 'none', stroke: C.blue, 'stroke-width': 4 }, curveG));
const ends = [A, B].map((p, i) => { const g = grp(i ? 'Point B' : 'Point A', curveG); node('circle', { cx: 0, cy: 0, r: 23, fill: C.blue }, g);
  return g; });
const BIG = { x: 960, y: 530, k: 1 };                                                   // the whole curve, before the card forms
// the opening: a dot rides the curve in time (x is time, y is progress), drawing it as it goes, so it is slow at the
// ends and fast in the middle; the camera starts close on it and pulls back to the whole curve
const CS = Array.from({ length: 241 }, (_, i) => { const u = i / 240, w = 1 - u;   // samples of the final curve: point and length so far
  return { x: w * w * w * A.x + 3 * w * w * u * P1F.x + 3 * w * u * u * P2F.x + u * u * u * B.x, y: w * w * w * A.y + 3 * w * w * u * P1F.y + 3 * w * u * u * P2F.y + u * u * u * B.y }; });
CS.forEach((p, i) => (p.len = i ? CS[i - 1].len + Math.hypot(p.x - CS[i - 1].x, p.y - CS[i - 1].y) : 0));
const CLEN = CS[CS.length - 1].len;
const atTime = (tau) => { const x = lerp(A.x, B.x, clamp(tau)); let i = 1; while (i < CS.length - 1 && CS[i].x < x) i++;   // the curve's point at a time
  const p = CS[i - 1], q = CS[i], k = q.x === p.x ? 0 : clamp((x - p.x) / (q.x - p.x)); return { x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), len: lerp(p.len, q.len, k) }; };
const ZOOM0 = 3.2;
const riderTrail = [1, 2, 3, 4, 5, 6].map(() => node('circle', { r: 0, fill: C.blue }, curveG));   // spacing shows the speed
const rider = node('circle', { r: 0, fill: C.blue, stroke: '#fff', 'stroke-width': 0 }, curveG);
// the backdrop: the many names designers juggle for "how it moves" (Figma, CSS, platforms, libraries, plain talk), as a
// wall of big, heavy type, tone on tone, that bleeds off both edges; rows slide in from alternate sides (centre rows
// first) and keep drifting, so it reads at thumbnail size and stays behind the curve
// the opening's backdrop has two versions: 'bubbles' (people's handoff questions, as chat bubbles) or 'names' (a wall of
// easing names). Switch here.
const OPENING = 'names';
const namesG = grp('Easing names (backdrop)'), NAMEIN = bezier(0.25, 0.55, 0.25, 1), WORDOUT = bezier(0.4, 0, 0.6, 1);
const NAME_ROWS = [   // rows 180 px apart (every 1½ grid cells), symmetric about the frame's centre; the extra rows above and
  // below fill the frame as the camera pulls back (rows 3–7 are the ones in frame at first)
  ['Decelerate', 'Ease Out Quint', 'Spring(0.6)', 'Expo.out'], ['too bouncy?', 'can it settle softer?', 0, 1], ['Standard', 'Snappy', 'ease-out', 'Sine.inOut'],
  ['Ease In', 'Ease Out', 'Linear', 'Spring', 'Gentle'], ['cubic-bezier(.4, 0, .2, 1)', 'Bouncy', 'Quick', 'Smooth'],
  ['Ease In And Out', 'Custom', 'FastOutSlowIn', 'Emphasized'], ['a bit snappier?', 'feels sluggish', 0, 1],
  ['Ease Out Back', 'Power2.out', 'moving → slow', 'Overshoot'],
  ['Accelerate', 'Anticipate', 'easeInOutCubic', 'Elastic'], ['same as the bottom sheet?', 'slower?', 0, 1], ['Smart Animate', 'Dissolve', 'Instant', 'Push'],
];
const NAME_ROW0 = -3;   // index of the first row (rows run from y = 180 × (i + 1) + 50)
const names = NAME_ROWS.map((row, j) => { const i = j + NAME_ROW0;
  const ital = row[row.length - 1] === 1, words = row.filter((w) => typeof w === 'string'), dir = ((i % 2) + 2) % 2 ? -1 : 1;   // even rows enter from the left, odd from the right
  const g = grp(`Names row ${i + 1}`, namesG), y = 180 * (i + 1) + 50;
  const st_ = { 'font-size': 140, 'font-weight': 900, fill: '#A3C9C0', 'letter-spacing': -3 };
  const items = [0, 1, 2].flatMap(() => words).map((w) => { const ig = grp(w, g);   // one group per name (+ its separator dot), so each can leave on its own; repeated: long enough to run off both edges
    const t = text(ig, 0, y, w, { ...st_, ...(ital ? { 'font-style': 'italic' } : {}) }), dot = text(ig, 0, y, '·', { ...st_, 'text-anchor': 'middle' }); return { ig, t, dot, cx: 0 }; });
  return { g, items, dir, y, laid: false, at: Math.abs(i - 2) * 3 };
});
// the chat bubbles: what people ask each other about a motion, as big speech bubbles in a bento layout around the curve
// (two columns of three tiles on the 120 px grid, the curve in the open centre), each with a tail toward the centre
const bubblesG = grp('Chat bubbles (backdrop)'), CREAM = '#FFF4E2';
namesG.id = 'namesLayer';
// liquid-glass refraction: under the glass, a copy of what's behind it (the grid and the names) is drawn through a
// displacement map, so near the panel's edge the backdrop bends and stretches inward like light through thick glass;
// clipped to the panel. The map is made once on a canvas (R/G = x/y push toward the centre, strongest at the rim).
const REFRACT = (() => {
  const N = 512, R = 0.085, cv_ = document.createElement('canvas'); cv_.width = cv_.height = N; const cx = cv_.getContext('2d'), im = cx.createImageData(N, N);
  const rr = 64 / 680;   // corner radius as a fraction of the panel
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = (x + 0.5) / N, v = (y + 0.5) / N, qx = Math.max(Math.abs(u - 0.5) - (0.5 - rr), 0), qy = Math.max(Math.abs(v - 0.5) - (0.5 - rr), 0);
    const inner = Math.min(Math.max(Math.abs(u - 0.5) - (0.5 - rr), Math.abs(v - 0.5) - (0.5 - rr)), 0);
    const d = rr - (Math.hypot(qx, qy) + inner);   // distance inside the rounded edge (0 at the edge)
    const k = d < R ? (1 - d / R) ** 1.6 : 0, dx = -(u - 0.5), dy = -(v - 0.5), l = Math.hypot(dx, dy) || 1;
    const o = (y * N + x) * 4; im.data[o] = 128 + 127 * k * (dx / l); im.data[o + 1] = 128 + 127 * k * (dy / l); im.data[o + 2] = 128; im.data[o + 3] = 255; }
  cx.putImageData(im, 0, 0); return cv_.toDataURL();
})();
const refrF = node('filter', { id: 'glassRefract', filterUnits: 'userSpaceOnUse', x: -500, y: -500, width: 2920, height: 2080, 'color-interpolation-filters': 'sRGB' }, defs);
const refrMap = node('feImage', { href: REFRACT, result: 'raw', preserveAspectRatio: 'none' }, refrF);
const refrSoft = node('feGaussianBlur', { in: 'raw', stdDeviation: 3, result: 'map' }, refrF);   // smooths the 8-bit map, so the bend has no steps
const refrDisp = node('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G' }, refrF);
const refrClip = node('clipPath', { id: 'glassClip' }, defs), refrClipR = node('rect', {}, refrClip);
const refrG = grp('Glass – refracted backdrop'); refrG.setAttribute('clip-path', 'url(#glassClip)');
const refrInner = node('g', { filter: 'url(#glassRefract)' }, refrG);
node('use', { href: '#groundRect' }, refrInner); node('use', { href: '#namesLayer' }, refrInner);
// The backdrop — the ground (its grid) and the names — is drawn on a canvas, not by the SVG: so the glass, a WebGL
// liquid-glass shader (liquid-glass.js), can read it directly. The SVG names and ground stay as the source of truth
// (their layout, motion, flash and blur are computed on them as before, hidden): each frame the canvas draws exactly
// what they hold — every word with its transform, opacity and filter — and the shader bends that through a frosted slab
// with a curved rim, a fresnel rim light and a soft shadow. (The DOM glass above — backdrop-filter + SVG displacement —
// is kept, off.)
const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));   // a sharp canvas at --scale 2 too
const bdCv = document.createElement('canvas'); bdCv.width = 1920 * DPR; bdCv.height = 1200 * DPR; bdCv.dataset.name = 'Backdrop – ground and names (canvas)';
Object.assign(bdCv.style, { position: 'absolute', left: 0, top: 0, width: '1920px', height: '1200px', pointerEvents: 'none' });   // the whole 16:10 frame
art.before(bdCv);   // under everything, where the SVG ground and names were
const bd = bdCv.getContext('2d');
document.getElementById('groundRect').style.visibility = 'hidden'; namesG.style.visibility = 'hidden';   // still laid out and measured
const pxScale = (str, k) => str.replace(/(-?\d*\.?\d+)px/g, (_, v) => `${(+v * k).toFixed(2)}px`);
function drawBackdrop() {
  // the ground and its grid (the pattern's cells, as patternTransform places them; the lines at the grid's opacity)
  bd.setTransform(DPR, 0, 0, DPR, 0, DPR * OFFY); bd.globalAlpha = 1; bd.filter = 'none';   // composition coordinates (y 0 is OFFY down the frame)
  bd.fillStyle = C.ground; bd.fillRect(0, -OFFY, 1920, 1080 + 2 * OFFY);
  const ga = +(gridLines[0].getAttribute('opacity') ?? 1);
  if (ga > 0.001) {
    const m = (gridPat.getAttribute('patternTransform') || '').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)/), tx = m ? +m[1] : 0, ty = m ? +m[2] : 0, k = m ? +m[3] : 1;
    bd.setTransform(DPR * k, 0, 0, DPR * k, DPR * tx, DPR * (ty + OFFY)); bd.globalAlpha = ga; bd.fillStyle = C.gridLine;
    const x0 = Math.floor((-tx / k + 3.5) / 120) - 1, x1 = Math.ceil(((1920 - tx) / k + 3.5) / 120) + 1, y0 = Math.floor(((-OFFY - ty) / k + 3.5) / 120) - 1, y1 = Math.ceil(((1080 + OFFY - ty) / k + 3.5) / 120) + 1;
    for (let i = x0; i <= x1; i++) bd.fillRect(i * 120 - 3.5, y0 * 120 - 3.5, 7, (y1 - y0 + 1) * 120);
    for (let j = y0; j <= y1; j++) bd.fillRect(x0 * 120 - 3.5, j * 120 - 3.5, (x1 - x0 + 1) * 120, 7);
  }
  // the names: each word and dot exactly as the (hidden) SVG holds it
  if (namesG.style.display === 'none') return;
  for (const n of names) {
    const ro = +(n.g.style.opacity || 1); if (ro <= 0.001) continue;
    for (const it of n.items) {
      const io = +(it.ig.style.opacity || 1); if (ro * io <= 0.001) continue;
      for (const t of [it.t, it.dot]) {
        const M = t.getCTM(); if (!M) continue;
        bd.setTransform(DPR * M.a, DPR * M.b, DPR * M.c, DPR * M.d, DPR * M.e, DPR * (M.f + OFFY));
        bd.globalAlpha = ro * io;
        bd.filter = it.ig.style.filter ? pxScale(it.ig.style.filter, Math.sqrt(Math.abs(M.a * M.d - M.b * M.c)) * DPR) : 'none';   // canvas filters work in canvas px
        bd.font = `${t.getAttribute('font-style') === 'italic' ? 'italic ' : ''}${t.getAttribute('font-weight')} ${t.getAttribute('font-size')}px InterLocal`;
        bd.letterSpacing = `${t.getAttribute('letter-spacing') || 0}px`;
        bd.textAlign = t.getAttribute('text-anchor') === 'middle' ? 'center' : 'left'; bd.textBaseline = 'alphabetic';
        bd.fillStyle = t.getAttribute('fill'); bd.fillText(t.textContent, +t.getAttribute('x'), +t.getAttribute('y'));
      }
    }
  }
  bd.filter = 'none'; bd.globalAlpha = 1;
}
const glCv = document.createElement('canvas'); glCv.width = 1920 * DPR; glCv.height = 1200 * DPR; glCv.dataset.name = 'Glass – WebGL liquid glass';
Object.assign(glCv.style, { position: 'absolute', left: 0, top: 0, width: '1920px', height: '1200px', pointerEvents: 'none', display: 'none' });
art.after(glCv);   // above the backdrop and the SVG art, under the cards (#deck3d) and the curve (#top)
const lg = (() => {
  const gl = glCv.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: true, antialias: false });
  const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, GLASS_VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, GLASS_FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'pos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
  const U = (n) => gl.getUniformLocation(prog, n);
  return { gl, U };
})();
const GLASS_LOOK = { bevel: 0.22, thick: 0.16, ior: 1.5, disp: 0.035, frost: 7 / 520, tint: 0.12, light: -2.35, rim: 0.55, shadow: 0.09 };   // bevel/thick/frost scale with the panel's size
let glassNow = null;
function drawGlass(rect, opacity) {
  if (opacity <= 0.001) { glCv.style.display = 'none'; return; }
  glCv.style.display = '';
  const { gl, U } = lg, m = Math.min(rect.w, rect.h), D = DPR;   // the shader works in canvas px
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bdCv);   // this frame's backdrop, straight from its canvas
  gl.uniform2f(U('uRes'), 1920 * D, 1200 * D); gl.uniform2f(U('uCenter'), (rect.x + rect.w / 2) * D, (rect.y + OFFY + rect.h / 2) * D); gl.uniform2f(U('uHalf'), rect.w / 2 * D, rect.h / 2 * D); gl.uniform1f(U('uRadius'), rect.r * D);
  gl.uniform1f(U('uBevel'), m * GLASS_LOOK.bevel * D); gl.uniform1f(U('uThick'), m * GLASS_LOOK.thick * D); gl.uniform1f(U('uIor'), GLASS_LOOK.ior); gl.uniform1f(U('uDisp'), GLASS_LOOK.disp);
  gl.uniform1f(U('uFrost'), m * GLASS_LOOK.frost * D); gl.uniform1f(U('uTint'), GLASS_LOOK.tint); gl.uniform1f(U('uLight'), GLASS_LOOK.light); gl.uniform1f(U('uRim'), GLASS_LOOK.rim);
  gl.uniform1f(U('uShadow'), GLASS_LOOK.shadow); gl.uniform1f(U('uOpacity'), opacity);
  gl.viewport(0, 0, 1920 * D, 1200 * D); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
}
// both draw last, once the names, the ground and the glass's placement have been set for this frame
s.onFrame(() => { drawBackdrop(); if (glassNow) drawGlass(glassNow.rect, glassNow.opacity); }, 100);
const BUBBLES = [   // [side, x, y, w, h, (unused), lines]
  [-1, 60, 60, 480, 340, 0, ['Which easing', 'should it be?']], [1, 1380, 60, 480, 280, 1, ['A little more', 'subtle?']],
  [-1, 60, 420, 480, 280, 1, ['Can it feel a', 'bit snappier?']], [1, 1380, 360, 480, 340, 0, ['Send me the', 'bezier values?']],
  [-1, 60, 720, 480, 300, 0, ['300 ms', 'or 350?']], [1, 1380, 720, 480, 300, 1, ['Doesn’t match', 'the prototype.']],
];
const bubbles = BUBBLES.map(([side, x, y, w, h, navy, lines], i) => {
  const g = grp(`Bubble – ${lines.join(' ')}`, bubblesG), shell = grp('bubble', g); shell.setAttribute('filter', SH_SOFT);
  // one geometric shape: a rounded rectangle whose lower inner corner runs out into a straight triangular tail
  const r = 22, T = 44, e = side < 0 ? x + w : x, d = -side, ty = y + h;   // e: the inner edge; d: toward the centre
  const pts = side < 0
    ? `M${x + r},${y} H${e - r} Q${e},${y} ${e},${y + r} V${ty - 52} L${e + T},${ty} H${x + r} Q${x},${ty} ${x},${ty - r} V${y + r} Q${x},${y} ${x + r},${y} Z`
    : `M${x + w - r},${y} H${e + r} Q${e},${y} ${e},${y + r} V${ty - 52} L${e - T},${ty} H${x + w - r} Q${x + w},${ty} ${x + w},${ty - r} V${y + r} Q${x + w},${y} ${x + w - r},${y} Z`;
  node('path', { fill: CREAM, d: pts }, shell);   // a curved tail reaching toward the centre
  const fs = 56, lh = 66, y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + fs * 0.36;
  lines.forEach((ln, k) => text(g, x + 44, y0 + k * lh, ln, { 'font-size': fs, 'font-weight': 700, fill: C.ink, 'letter-spacing': -1.2 }));
  return { g, side, ax: side < 0 ? e + T : e - T, y: ty, at: 20 + i * 6 };
});
const layBubble = () => {};
const HK = 1.3, SETTLED = 1.0;   // the card's scale while it forms; it settles back to SETTLED (a gentle pull-back) while it spins
const ALIGN = { x: 960 + (BOXC.x - IMG.cx) * PX * HK, y: 540 + (BOXC.y - IMG.cy) * PX * HK, k: PX * HK };   // exactly over the printed curve of the card at (960, 540)
const cursor = grp('Cursor', top);
const curArrow = node('path', { d: 'M0,0 L0,40 L10,31 L17,47 L24,44 L17,28 L31,28 Z', fill: '#fff', stroke: '#111', 'stroke-width': 2.5, 'stroke-linejoin': 'round', filter: SH_SOFT }, cursor);
// the grab hand (open, then closed while it holds the plugin's window): drawn twice, a dark outline layer under a white
// fill layer, so the overlapping parts read as one shape; its hotspot is the palm's centre
const handShape = (closed) => { const g = grp(closed ? 'Cursor – hand (grabbing)' : 'Cursor – hand (open)', cursor); g.setAttribute('filter', SH_SOFT);
  const fl = closed ? 7 : 17, parts = (o) => { node('rect', { x: -12, y: -4, width: 25, height: 21, rx: 9, ...o }, g);
    [-11, -5, 1, 7].forEach((x, i) => node('rect', { x, y: -4 - fl + (i === 0 || i === 3 ? 3 : 0), width: 6, height: fl + 6, rx: 3, ...o }, g));
    node('rect', { x: -19, y: 1, width: 11, height: 6, rx: 3, transform: 'rotate(35 -13 4)', ...o }, g); };
  parts({ fill: '#111', stroke: '#111', 'stroke-width': 5, 'stroke-linejoin': 'round' }); parts({ fill: '#fff' }); return g; };
const curOpen = handShape(false), curClosed = handShape(true);
[curOpen, curClosed].forEach((g) => g.setAttribute('transform', 'scale(1.2)'));

// ---------------------------------------------------------------- Figma
// Everything here is drawn in "figma" coordinates (the final, zoomed-out frame) inside one camera group, figCam. The
// camera starts zoomed in on the plugin (which first appears alone) and pulls back while Figma constructs around it,
// the same way the card was built: a dot skeleton of its parts, then a scan that reveals the real UI.
const FIGBLUE = '#0D99FF', LINKBLUE = '#7CC4F0', FG = { ink: '#FFFFFF', grey: '#A3A3A3', line: '#3A3A3A', field: '#383838', canvas: '#1E1E1E', panel: '#2C2C2C', icon: '#E6E6E6' };   // Figma UI3, dark
const figCam = grp('Figma (camera)');
const figUI = grp('Figma UI (revealed by the scan)', figCam);
const figClip = node('clipPath', { id: 'figScan' }, defs), figClipR = node('rect', { x: 0, y: 0, width: 1920, height: 0 }, figClip);
figUI.setAttribute('clip-path', 'url(#figScan)');
const F = (t, x, y, str, o = {}) => text(t, x, y, str, { 'font-size': 12, fill: FG.ink, 'font-weight': 500, ...o });
// Figma, drawn the way the case study draws it: a simplified, skeletal Figma (big shapes and placeholder bars, few
// words), so it reads in a thumbnail. A tab bar, a row of tools, Layers on the left, a near-empty right panel, and the
// canvas with the flow's frames sitting in grey artboards
const WIN = { x: 120, y: 70, w: 1680, h: 940 }, WR = 40, TOP = 64, TOOLS = 46, CT = WIN.y + TOP + TOOLS;
const LP = { x: WIN.x, y: CT, w: 300, h: WIN.y + WIN.h - CT }, RP = { x: WIN.x + WIN.w - 250, y: CT, w: 250, h: WIN.y + WIN.h - CT };
const FGP = { bar: '#1A1A1A', panel: '#2C2C2C', edge: '#383838', pill: '#454545', pillHi: '#5A5A5A', icon: '#9A9A9A', board: '#2F2F2F' };
// a solid black shadow at the bottom right (no blur); its corners are concentric with the window's: 8–9 px out, so its
// radius is the window's + 8.5
const hardShadow = (g, x, y, w, h, r, k = 1) => node('rect', { x: x + 2 * k, y: y + 3 * k, width: w + 6 * k, height: h + 6 * k, rx: r + 8.5 * k, fill: '#000' }, g);
hardShadow(figUI, WIN.x, WIN.y, WIN.w, WIN.h, WR);
node('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: WR, fill: FG.canvas }, figUI);
{ const cp = node('clipPath', { id: 'figWin' }, defs); node('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: WR }, cp); }
const chrome = grp('Figma chrome', figUI); chrome.setAttribute('clip-path', 'url(#figWin)');
// tab bar: home, a tab, the open tab (joined to the tools row), close
node('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: TOP, fill: FGP.bar }, chrome);
const ty0 = WIN.y + TOP / 2;
node('path', { d: `M${WIN.x + 34},${ty0 + 11} V${ty0 - 2} L${WIN.x + 46},${ty0 - 12} L${WIN.x + 58},${ty0 - 2} V${ty0 + 11} Z`, fill: FGP.icon, stroke: FGP.icon, 'stroke-width': 3, 'stroke-linejoin': 'round' }, chrome);   // home
node('line', { x1: WIN.x + 92, y1: WIN.y, x2: WIN.x + 92, y2: WIN.y + TOP, stroke: FGP.edge, 'stroke-width': 1.5 }, chrome);
node('rect', { x: WIN.x + 116, y: ty0 - 10, width: 132, height: 20, rx: 10, fill: FGP.pill }, chrome);
node('rect', { x: WIN.x + 276, y: WIN.y, width: 230, height: TOP, fill: FGP.panel }, chrome);   // the open tab
F(chrome, WIN.x + 306, ty0 + 6, 'Payment flow', { 'font-size': 17, 'font-weight': 600 });   // the open file
node('path', { d: `M${WIN.x + WIN.w - 54},${ty0 - 8} l16,16 m0,-16 l-16,16`, stroke: '#C8C8C8', 'stroke-width': 3, 'stroke-linecap': 'round' }, chrome);
// tools row
node('rect', { x: WIN.x, y: WIN.y + TOP, width: WIN.w, height: TOOLS, fill: FGP.panel }, chrome);
node('line', { x1: WIN.x, y1: CT, x2: WIN.x + WIN.w, y2: CT, stroke: FGP.edge, 'stroke-width': 1.5 }, chrome);
const tlx = (i) => WIN.x + 38 + i * 36, tly = WIN.y + TOP + TOOLS / 2, tls = { fill: FGP.icon };
// the Figma mark, in its colours: it's what says “this is Figma” at a glance
function figmaMark(g, cx, cy, s) {   // s: one cell (the mark is 2 × 3 cells)
  const x = cx - s, y = cy - 1.5 * s, h = s / 2;
  node('path', { d: `M${x + s},${y} H${x + h} A${h},${h} 0 0 0 ${x + h},${y + s} H${x + s} Z`, fill: '#F24E1E' }, g);
  node('path', { d: `M${x + s},${y} H${x + 1.5 * s} A${h},${h} 0 0 1 ${x + 1.5 * s},${y + s} H${x + s} Z`, fill: '#FF7262' }, g);
  node('path', { d: `M${x + s},${y + s} H${x + h} A${h},${h} 0 0 0 ${x + h},${y + 2 * s} H${x + s} Z`, fill: '#A259FF' }, g);
  node('circle', { cx: x + 1.5 * s, cy: y + 1.5 * s, r: h, fill: '#1ABCFE' }, g);
  node('path', { d: `M${x + s},${y + 2 * s} H${x + h} A${h},${h} 0 1 0 ${x + s},${y + 2.5 * s} Z`, fill: '#0ACF83' }, g);
}
figmaMark(chrome, tlx(0), tly, 9);
node('path', { d: `M${tlx(1) - 5},${tly - 7} L${tlx(1) + 7},${tly} L${tlx(1) - 5},${tly + 7} Z`, ...tls }, chrome);   // play
node('path', { d: `M${tlx(2) - 3},${tly - 8} V${tly + 8} M${tlx(2) + 3},${tly - 8} V${tly + 8} M${tlx(2) - 8},${tly - 3} H${tlx(2) + 8} M${tlx(2) - 8},${tly + 3} H${tlx(2) + 8}`, stroke: FGP.icon, 'stroke-width': 1.8 }, chrome);   // frame
node('rect', { x: tlx(3) - 7, y: tly - 7, width: 14, height: 14, rx: 2, ...tls }, chrome);
node('circle', { cx: tlx(4), cy: tly, r: 7, ...tls }, chrome);
// left panel: Layers / Assets, then the layers as placeholder rows
node('rect', { x: LP.x, y: LP.y, width: LP.w, height: LP.h, fill: FGP.panel }, chrome);
node('line', { x1: LP.x + LP.w, y1: LP.y, x2: LP.x + LP.w, y2: LP.y + LP.h, stroke: FGP.edge, 'stroke-width': 1.5 }, chrome);
F(chrome, LP.x + 38, LP.y + 38, 'Layers', { 'font-size': 17, 'font-weight': 600 }); F(chrome, LP.x + 120, LP.y + 38, 'Assets', { 'font-size': 17, fill: '#8C8C8C' });
node('line', { x1: LP.x, y1: LP.y + 62, x2: LP.x + LP.w, y2: LP.y + 62, stroke: FGP.edge, 'stroke-width': 1.5 }, chrome);
const ICONS = {
  frame: (g, x, y) => node('path', { d: `M${x + 3},${y - 6} V${y + 8} M${x + 10},${y - 6} V${y + 8} M${x},${y - 2} H${x + 13} M${x},${y + 4} H${x + 13}`, stroke: FGP.icon, 'stroke-width': 1.6, fill: 'none' }, g),
  rect: (g, x, y) => node('rect', { x, y: y - 6, width: 12, height: 12, rx: 2.5, fill: 'none', stroke: FGP.icon, 'stroke-width': 1.6 }, g),
  text: (g, x, y) => node('path', { d: `M${x},${y - 5} H${x + 12} M${x + 6},${y - 5} V${y + 7}`, stroke: FGP.icon, 'stroke-width': 1.8, fill: 'none' }, g),
  comp: (g, x, y, c = '#9747FF') => node('path', { d: `M${x + 7},${y - 7} L${x + 14},${y} L${x + 7},${y + 7} L${x},${y} Z`, fill: 'none', stroke: c, 'stroke-width': 1.8 }, g),
};
const LROW = (i) => LP.y + 96 + i * 38;
const LAYERS = [['frame', 0, 64], ['frame', 0, 58], ['rect', 1, 104], ['text', 1, 48], ['frame', 0, 66], ['rect', 1, 76], ['text', 1, 58]];
const layerRows = grp('Layer rows', chrome);
LAYERS.forEach(([ic, ind, w], i) => { const y = LROW(i), x = LP.x + 30 + ind * 22; ICONS[ic](layerRows, x, y); node('rect', { x: x + 26, y: y - 5, width: w, height: 10, rx: 5, fill: ind ? FGP.pill : FGP.pillHi }, layerRows); });
const newLayer = grp('Layer – Motion Card (selected)', chrome);
node('rect', { x: LP.x + 10, y: LROW(0) - 17, width: LP.w - 20, height: 34, rx: 7, fill: 'rgba(13, 153, 255, .28)' }, newLayer);
ICONS.comp(newLayer, LP.x + 30, LROW(0), '#7CC4FF'); F(newLayer, LP.x + 54, LROW(0) + 5.5, 'Motion Card', { 'font-size': 15, fill: '#FFFFFF', 'font-weight': 600 });
// right panel: near empty, as in the case study
node('rect', { x: RP.x, y: RP.y, width: RP.w, height: RP.h, fill: FGP.panel }, chrome);
node('line', { x1: RP.x, y1: RP.y, x2: RP.x, y2: RP.y + RP.h, stroke: FGP.edge, 'stroke-width': 1.5 }, chrome);
F(chrome, RP.x + 24, RP.y + 38, 'Design', { 'font-size': 16, fill: '#8C8C8C', 'font-weight': 600 }); F(chrome, RP.x + 104, RP.y + 38, 'Prototype', { 'font-size': 16, 'font-weight': 600 });
node('line', { x1: RP.x, y1: RP.y + 62, x2: RP.x + RP.w, y2: RP.y + 62, stroke: FGP.edge, 'stroke-width': 1.5 }, chrome);
node('rect', { x: RP.x + 24, y: RP.y + 88, width: 120, height: 14, rx: 7, fill: FGP.pill }, chrome); node('rect', { x: RP.x + 24, y: RP.y + 116, width: 72, height: 14, rx: 7, fill: FGP.pill }, chrome);
// UI3's floating toolbar at the bottom of the canvas: move (active), frame, shape, pen, text, comment
{ const cx = (LP.x + LP.w + RP.x) / 2, w = 300, ht = 50, y = WIN.y + WIN.h - 30 - ht, tb = grp('Figma toolbar', chrome);
  node('rect', { x: cx - w / 2, y, width: w, height: ht, rx: 14, fill: FGP.panel, stroke: FGP.edge, 'stroke-width': 1.5 }, tb);
  const ix = (i) => cx - w / 2 + 30 + i * 48, iy = y + ht / 2;
  node('rect', { x: ix(0) - 17, y: iy - 17, width: 34, height: 34, rx: 9, fill: FIGBLUE }, tb);
  node('path', { d: `M${ix(0) - 5},${iy - 8} L${ix(0) + 7},${iy + 1} L${ix(0) + 1},${iy + 2} L${ix(0) - 2},${iy + 8} Z`, fill: '#fff' }, tb);   // move
  node('path', { d: `M${ix(1) - 3},${iy - 9} V${iy + 9} M${ix(1) + 4},${iy - 9} V${iy + 9} M${ix(1) - 9},${iy - 3} H${ix(1) + 9} M${ix(1) - 9},${iy + 4} H${ix(1) + 9}`, stroke: FGP.icon, 'stroke-width': 1.8 }, tb);   // frame
  node('rect', { x: ix(2) - 8, y: iy - 8, width: 16, height: 16, rx: 2, fill: 'none', stroke: FGP.icon, 'stroke-width': 1.8 }, tb);   // shape
  node('path', { d: `M${ix(3) - 7},${iy + 8} L${ix(3) - 4},${iy - 2} L${ix(3) + 3},${iy - 9} L${ix(3) + 8},${iy - 4} L${ix(3) + 1},${iy + 3} Z`, fill: 'none', stroke: FGP.icon, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, tb);   // pen
  node('path', { d: `M${ix(4) - 7},${iy - 7} H${ix(4) + 7} M${ix(4)},${iy - 7} V${iy + 8}`, stroke: FGP.icon, 'stroke-width': 2 }, tb);   // text
  node('path', { d: `M${ix(5)},${iy - 8} A8,8 0 1 1 ${ix(5) - 8},${iy} V${iy + 8} H${ix(5)} A8,8 0 0 0 ${ix(5)},${iy - 8} Z`, fill: 'none', stroke: FGP.icon, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, tb); }   // comment
// the flow: three frames with prototype noodles between them
const SCR = [{ x: 560, name: 'Home' }, { x: 985, name: 'Sending' }, { x: 1410, name: 'Details' }],   // centred on the canvas, gaps wide enough for a placed card
      SY = 580, SK = 1, SW = 176 * SK, SH = 340 * SK, AB = 12;   // AB: artboard padding. SY: the canvas's vertical middle (above the toolbar)
// in the whole-window view the frames sit closer together (SPREAD), in the middle of the canvas; as the camera closes in on
// the plugin they spread to SCR, so there's room on the links for the cards
const SPREAD = 0.73, SCRC = SCR.map((sc) => 985 + (sc.x - 985) * SPREAD);
const scrG = SCR.map((sc) => {
  const g = grp(`Frame – ${sc.name}`, figUI);
  node('rect', { x: sc.x - SW / 2 - AB, y: SY - SH / 2 - AB, width: SW + 2 * AB, height: SH + 2 * AB, rx: 15 + AB, fill: FGP.board }, g);   // the artboard (corners concentric with the screen's)
  F(g, sc.x - SW / 2 - AB, SY - SH / 2 - AB - 12, sc.name, { 'font-size': 15, fill: '#9A9A9A' });
  const inner = grp('screen', g); inner.setAttribute('transform', `translate(${sc.x} ${SY}) scale(${SK})`);
  screen(inner, 0, 0);
  const hi = node('rect', { x: sc.x - SW / 2 - 3, y: SY - SH / 2 - 3, width: SW + 6, height: SH + 6, rx: 17, fill: 'none', stroke: FIGBLUE, 'stroke-width': 2.5, opacity: 0 }, g);
  return { g, inner, hi };
});
function screen(g, x, y) {   // a payment prompt, as a skeleton: who you're paying (avatar, name, UPI id), the amount, a note
  const sg = grp('screen', g); sg.setAttribute('transform', `translate(${x} ${y})`); sg.setAttribute('filter', SH_SOFT);
  node('rect', { x: -88, y: -170, width: 176, height: 340, rx: 15, fill: '#fff' }, sg);
  node('path', { d: 'M-88,-155 A15,15 0 0 1 -73,-170 H73 A15,15 0 0 1 88,-155 V-28 H-88 Z', fill: SCREEN_TOP }, sg);
  node('path', { d: 'M-60,-148 L-68,-140 L-60,-132', stroke: '#C98A57', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sg);
  node('rect', { x: -30, y: -145, width: 60, height: 10, rx: 5, fill: '#F6B987' }, sg);
  node('circle', { cx: 0, cy: -94, r: 24, fill: '#F08A3C' }, sg);
  text(sg, 0, -87, 'R', { 'font-size': 20, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
  node('rect', { x: -36, y: -61, width: 72, height: 10, rx: 5, fill: '#F08A3C' }, sg); node('rect', { x: -26, y: -45, width: 52, height: 7, rx: 3.5, fill: '#F6B987' }, sg);
  node('rect', { x: -42, y: -4, width: 84, height: 18, rx: 9, fill: '#D5DCE7' }, sg);   // the amount, as a skeleton (₹500 is spelt out only on the Pay button and on Details)
  node('rect', { x: -40, y: 32, width: 80, height: 22, rx: 11, fill: 'none', stroke: '#E2E8F0', 'stroke-width': 1.5 }, sg); node('rect', { x: -22, y: 40, width: 44, height: 6, rx: 3, fill: '#E9EDF3' }, sg);
  return sg;
}
// each frame tells its step of a payment: Home asks you to pay Riya ₹500; on Sending a bottom sheet slides up over a
// dimmed screen, “Paying…” (card 1: Slides Up · Bottom Sheet); then Details slides in from the right (card 2: Slides Left · Page)
const ripple = (g, x, y) => node('circle', { cx: x, cy: y, r: 0, fill: 'none', stroke: C.blue, 'stroke-width': 3, opacity: 0 }, g);
node('rect', { x: -68, y: 84, width: 136, height: 40, rx: 20, fill: C.blue }, scrG[0].inner);
text(scrG[0].inner, 0, 109, 'Pay ₹500', { 'font-size': 15, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });

// the bottom sheet (clipped to the screen): a scrim dims the screen, the sheet rises from the bottom edge
const SHEET_Y = 30;   // its top edge, in screen px
function bottomSheet(g, name) {
  const wrap = grp(name, g); wrap.setAttribute('clip-path', 'url(#detailsClip)');
  const scrim = node('rect', { x: -88, y: -170, width: 176, height: 340, fill: '#0B1424', opacity: 0.32 }, wrap);
  const sheet = grp('Sheet', wrap);
  node('rect', { x: -88, y: SHEET_Y, width: 176, height: 170 - SHEET_Y + 20, rx: 18, fill: '#fff' }, sheet);
  node('rect', { x: -16, y: SHEET_Y + 9, width: 32, height: 4, rx: 2, fill: '#D5DCE7' }, sheet);   // grabber
  node('circle', { cx: 0, cy: SHEET_Y + 52, r: 15, fill: 'none', stroke: '#E2E8F0', 'stroke-width': 3.5 }, sheet);
  const spin = node('path', { d: `M0,${SHEET_Y + 37} A15,15 0 0 1 15,${SHEET_Y + 52}`, fill: 'none', stroke: C.blue, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, sheet);
  text(sheet, 0, SHEET_Y + 93, 'Paying…', { 'font-size': 16, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' });
  node('rect', { x: -32, y: SHEET_Y + 104, width: 64, height: 7, rx: 3.5, fill: '#E2E8F0' }, sheet);   // to Riya, as a skeleton
  return { wrap, scrim, sheet, spin };
}
const toast = bottomSheet(scrG[1].inner, 'Bottom sheet – Paying (slides up)');


// Details: the payment-sent look underneath, and the details page that slides over it (clipped to the screen)
screen(scrG[2].inner, 0, 0);
{ const under = bottomSheet(scrG[2].inner, 'Bottom sheet (under Details)'); under.spin.remove(); }   // Sending's state, which Details slides in over
{ const cp = node('clipPath', { id: 'detailsClip' }, defs); node('rect', { x: -88, y: -170, width: 176, height: 340, rx: 15 }, cp); }
const pageWrap = grp('Details page (clip)', scrG[2].inner); pageWrap.setAttribute('clip-path', 'url(#detailsClip)');
const page = grp('Details page (slides in)', pageWrap);
node('rect', { x: -88, y: -170, width: 176, height: 340, rx: 15, fill: '#fff' }, page);
node('path', { d: 'M-60,-148 L-68,-140 L-60,-132', stroke: '#8A97AD', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, page);
node('rect', { x: -30, y: -145, width: 60, height: 10, rx: 5, fill: '#D5DCE7' }, page);
const TICK_Y = -84, tick = grp('Tick', page); node('circle', { cx: 0, cy: TICK_Y, r: 26, fill: '#3DDC84' }, tick); node('path', { d: `M-11,${TICK_Y + 1.5} L-3.5,${TICK_Y + 9} L11,${TICK_Y - 6}`, stroke: '#fff', 'stroke-width': 5.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tick);
{ const t = text(page, 0, -22, '', { 'font-size': 30, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }); node('tspan', { 'font-weight': 500 }, t).textContent = '₹'; node('tspan', {}, t).textContent = '500'; }   // ₹ in Inter Medium   // tick, amount, then the detail rows on an even rhythm
[18, 42, 66].forEach((y, i) => { node('rect', { x: -68, y: y - 4, width: [44, 52, 38][i], height: 8, rx: 4, fill: '#E2E8F0' }, page); node('rect', { x: 68 - [48, 36, 56][i], y: y - 4, width: [48, 36, 56][i], height: 8, rx: 4, fill: '#C8D2E0' }, page); });
node('rect', { x: -68, y: 116, width: 136, height: 34, rx: 17, fill: '#EAF1FD' }, page);
text(page, 0, 138, 'Done', { 'font-size': 13, 'font-weight': 600, fill: C.blue, 'text-anchor': 'middle' });
const linkD = (x1, x2) => `M${x1 + 4},${SY} H${x2 - 2} M${x2 - 9},${SY - 6} L${x2 - 2},${SY} L${x2 - 9},${SY + 6}`;
const noodles = [0, 1].map((i) => {
  const x1 = SCR[i].x + SW / 2 + AB, x2 = SCR[i + 1].x - SW / 2 - AB, g = grp(`Prototype link ${i + 1}`, figUI);
  const knob = node('circle', { cx: x1, cy: SY, r: 5.5, fill: '#fff', stroke: LINKBLUE, 'stroke-width': 2.5 }, g);
  const line = node('path', { d: linkD(x1, x2), stroke: LINKBLUE, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const dot = node('circle', { cx: x1, cy: SY, r: 6, fill: FIGBLUE, opacity: 0 }, g);
  return { x1, x2, dot, knob, line };   // x1, x2: where it ends up (spread)
});
// the frames and links at a given spread (0: close together, 1: SCR)
function placeFlow(sp) {
  const xs = SCR.map((sc, i) => lerp(SCRC[i], sc.x, sp));
  scrG.forEach((g, i) => g.g.setAttribute('transform', `translate(${(xs[i] - SCR[i].x).toFixed(1)} 0)`));
  noodles.forEach((nd, i) => { const x1 = xs[i] + SW / 2 + AB, x2 = xs[i + 1] - SW / 2 - AB; nd.knob.setAttribute('cx', x1.toFixed(1)); nd.line.setAttribute('d', linkD(x1, x2)); });
}
// the plugin, in Figma: a list of easings by name; a window (title, close) builds around it first
const PAC = { x: 1475, y: 506.5 }, PK = 0.62, PC = { x: 1405, y: 430 };   // the plugin floats in the canvas's top-right corner (it may overlap the Done frame)   // plugin art centre (panel coords), its scale and centre in Figma
const plugin = grp('Plugin – Motion Card', figCam);
const placePlugin = (o) => plugin.setAttribute('transform', `translate(${(PC.x + o.x).toFixed(2)} ${(PC.y + o.y).toFixed(2)}) scale(${PK}) translate(${-PAC.x} ${-PAC.y})`);
placePlugin({ x: 0, y: 0 });
const pluginIn = grp('Plugin (entrance)', plugin);
const pwin = grp('Plugin window', pluginIn);
const pwinShadow = node('rect', { fill: '#000' }, pwin);   // a solid black shadow, bottom right, concentric corners
const pwinRect = node('rect', { fill: FG.panel, stroke: '#444' }, pwin);
const pwinTitle = grp('Plugin title bar', pwin);
node('image', { href: 'assets/plugin-icon.png', x: 1271, y: 155, width: 32, height: 32 }, pwinTitle);
F(pwinTitle, 1315, 179, 'Motion Card Plugin', { 'font-size': 23, 'font-weight': 600 });
node('path', { d: 'M1653,164 L1667,178 M1667,164 L1653,178', stroke: FG.icon, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, pwinTitle);
node('line', { x1: 1253, y1: 206, x2: 1697, y2: 206, stroke: FG.line, 'stroke-width': 1.5 }, pwinTitle);
node('rect', { x: 1265, y: 215, width: 420, height: 650, rx: 18, fill: '#0F2648' }, pluginIn);   // wider and shorter: the same presence, more legible rows
text(pluginIn, 1475, 258, 'CHOOSE AN EASING', { 'font-size': 19, fill: C.muted, 'text-anchor': 'middle', 'font-weight': 700, 'letter-spacing': 4 });
node('rect', { x: 1283, y: 276, width: 384, height: 516, rx: 14, fill: '#0A1E3C' }, pluginIn);
const LIST = [['h', 'DECELERATION'], ['r', 'moving → superSlow'], ['r', 'moving → verySlow'], ['r', 'moving → slow'], ['h', 'ACCELERATION'], ['r', 'superSlow → moving'], ['r', 'verySlow → moving'], ['r', 'slow → moving'], ['h', 'STANDARD'], ['r', 'slow → slow']];
const PICK_ROW = 3, rowY = (i) => 322 + i * 60;   // big type, room to breathe: the list runs past the window's bottom (clipped), which is fine
const listG = grp('Plugin list (clipped)', pluginIn);
{ const cp = node('clipPath', { id: 'pluginListClip' }, defs); node('rect', { x: 1283, y: 276, width: 384, height: 516, rx: 14 }, cp); listG.setAttribute('clip-path', 'url(#pluginListClip)'); }
const pickHi = grp('Picked row highlight', listG); node('rect', { x: 1295, y: rowY(PICK_ROW) - 33, width: 360, height: 50, rx: 12, fill: '#244B87' }, pickHi);
let nRow = 0;
const listRows = LIST.map(([kind, label], i) => {
  const g = grp(`Plugin row – ${label}`, listG);
  if (kind === 'h') { node('rect', { x: 1340, y: rowY(i) - 28, width: 270, height: 40, rx: 20, fill: '#13325E' }, g); text(g, 1475, rowY(i) - 1.5, label, { 'font-size': 17.5, fill: C.soft, 'text-anchor': 'middle', 'font-weight': 700, 'letter-spacing': 4 }); }
  else { nRow++; text(g, 1307, rowY(i), String(nRow), { 'font-size': 19, fill: '#5B7DB0', 'font-weight': 600 }); const [a, b] = label.split(' → '); const t = text(g, 1336, rowY(i), '', { 'font-size': 27, 'font-weight': 700 });
    [[a, '#fff'], [' → ', C.soft], [b, '#fff']].forEach(([str, c]) => { const sp = node('tspan', { fill: c }, t); sp.textContent = str; }); }
  return g;
});
text(pluginIn, 1475, 840, 'Motion Card', { 'font-size': 32, 'font-weight': 700, 'text-anchor': 'middle', fill: BRAND });
{ const cp = node('clipPath', { id: 'pluginPanelClip' }, defs); node('rect', { x: 1265, y: 215, width: 420, height: 650, rx: 18 }, cp);   // the brand bar: full width, flush with the panel's bottom edge
  node('rect', { x: 1265, y: 858, width: 420, height: 7, fill: BRAND, 'clip-path': 'url(#pluginPanelClip)' }, pluginIn); }
const panelToFig = (q) => ({ x: PC.x + PK * (q.x - PAC.x), y: PC.y + PK * (q.y - PAC.y) });
// the plugin is constructed the same way as the card and Figma: a dot skeleton of its parts, a bracket jumping between
// them, then a scan from the top reveals it (panel coords)
const LATE = 134;   // extra time (the slower pull to the card, the slow shine on the back, the slower flip back); everything after the flip shifts by it
const PB = { at: 252 + LATE, scanAt: 266 + LATE, scan: 26 };   // the scan takes as long as the card's
const pClip = node('clipPath', { id: 'pluginScan' }, defs), pClipR = node('rect', { x: 1200, y: 100, width: 600, height: 0 }, pClip);
pluginIn.setAttribute('clip-path', 'url(#pluginScan)');
const pSkel = grp('Plugin skeleton', plugin);
const pSkelClip = node('clipPath', { id: 'pluginBelowScan' }, defs), pSkelClipR = node('rect', { x: 1200, y: 100, width: 600, height: 900 }, pSkelClip);
pSkel.setAttribute('clip-path', 'url(#pluginBelowScan)');
const PDOTS = [];
const pDot = (x, y, t, r = 3.4, op = 0.75, o = {}) => { const d = { el: node('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 0, fill: C.ink }, pSkel), x, y, t, r, op, last: '', ...o }; PDOTS.push(d); return d; };
function pLine(d, at, dur, o = {}) { const { gap = 12, r = 3.4, op = 0.75 } = o, pth = node('path', { d }, pSkel), len = pth.getTotalLength(), n = Math.max(2, Math.round(len / gap));
  for (let k = 0; k <= n; k++) { const pt = pth.getPointAtLength((k / n) * len); pDot(pt.x, pt.y, PB.at + at + (k / n) * dur, r, op, { drop: RD() < 0.07, dropPhase: Math.floor(RD() * 40) }); } pth.remove(); }
const pRow = (x, y, w, at) => { pLine(`M${x},${y} H${x + w}`, at, 4, { gap: 7, r: 1.6, op: 0.6 }); pDot(x, y, PB.at + at, 3.4, 0.85); pDot(x + w, y, PB.at + at + 4, 3.4, 0.85); };
const PPARTS = [
  { type: 'PANEL', box: [1265, 215, 420, 650], at: 0, draw: () => halves(1265, 215, 420, 650, 18).forEach((d) => pLine(d, 0, 9, { gap: 7, r: 2, op: 0.75 })) },
  { type: 'TEXT', box: [1360, 238, 230, 26], at: 3, draw: (pt) => pRow(1360, 251, 230, pt.at) },
  { type: 'LIST', box: [1283, 276, 384, 516], at: 5, draw: (pt) => { halves(1283, 276, 384, 516, 14).forEach((d) => pLine(d, pt.at, 6, { gap: 7, r: 1.7, op: 0.55 }));
    LIST.forEach(([kind], i) => rowY(i) < 782 && (kind === 'h' ? pRow(1380, rowY(i) - 8, 190, pt.at + 2 + i * 0.5) : pRow(1307, rowY(i) - 8, 280, pt.at + 2 + i * 0.5))); } },
  { type: 'TEXT', box: [1265, 814, 420, 51], at: 9, draw: (pt) => { pRow(1400, 830, 150, pt.at); pRow(1265, 861, 420, pt.at + 1); } },
];
// built exactly like the card: a faint lattice spreads from the centre (same on-screen pitch as the card's), runs of it
// flash darker (the "processing"), part dots drop out for a frame now and then; guides, corner handles and a readout
const PBOX = { x: 1265, y: 215, w: 420, h: 650 }, PLAT = 17.5, PC0 = { x: PBOX.x + PBOX.w / 2, y: PBOX.y + PBOX.h / 2 };
for (let gy = -3; gy * PLAT <= PBOX.h + 3 * PLAT; gy++) for (let gx = -3; gx * PLAT <= PBOX.w + 3 * PLAT; gx++) {
  const x = PBOX.x + 0.5 * PLAT + gx * PLAT, y = PBOX.y + 0.5 * PLAT + gy * PLAT, out = Math.max(0, PBOX.x - x, x - PBOX.x - PBOX.w, PBOX.y - y, y - PBOX.y - PBOX.h);
  const op = LAT_OP * Math.max(0, 1 - out / 60);
  if (op > 0.01) pDot(x, y, PB.at + 1 + Math.hypot(x - PC0.x, y - PC0.y) / 45, 1.8, op, { kind: 'lattice', outside: out > 0 });
}
{ const pl = PDOTS.filter((d) => d.kind === 'lattice' && !d.outside);
  for (let k = 0; k < 40; k++) { const a = pl[Math.floor(RD() * pl.length)], len = 1 + Math.floor(RD() * 4), period = 9 + Math.floor(RD() * 14), phase = Math.floor(RD() * 30);
    for (let i = 0; i < len; i++) { const d = pl.find((q) => Math.abs(q.x - a.x) < 1 && Math.abs(q.y - (a.y + i * PLAT)) < 1); if (d) Object.assign(d, { flick: true, period, phase: phase + i }); } } }
PPARTS.forEach((pt) => pt.draw(pt));
const pGuideG = grp('Guides, handles and readout (plugin build)', plugin), PGD = 70;
const pGuide = (x1, y1, x2, y2) => node('path', { d: `M${x1},${y1} L${x2},${y2}`, fill: 'none', stroke: C.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-dasharray': '0 6', opacity: 0 }, pGuideG);
const pGuides = [pGuide(PBOX.x - PGD, PBOX.y, PBOX.x + PBOX.w + PGD, PBOX.y), pGuide(PBOX.x - PGD, PBOX.y + PBOX.h, PBOX.x + PBOX.w + PGD, PBOX.y + PBOX.h),
  pGuide(PBOX.x, PBOX.y - PGD, PBOX.x, PBOX.y + PBOX.h + PGD), pGuide(PBOX.x + PBOX.w, PBOX.y - PGD, PBOX.x + PBOX.w, PBOX.y + PBOX.h + PGD)];
const pHandles = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([i, j]) => node('rect', { x: PBOX.x + i * PBOX.w - 5.5, y: PBOX.y + j * PBOX.h - 5.5, width: 11, height: 11, fill: C.paper, stroke: C.ink, 'stroke-width': 1.5, opacity: 0 }, pGuideG));
const pReadout = text(pGuideG, PBOX.x, PBOX.y + PBOX.h + 30, '', { 'font-size': 15.6, fill: C.ink, 'font-family': MONO, 'font-weight': 500 }); pReadout.style.opacity = 0;
const pBr = grp('Selection bracket (plugin build)', pSkel);
const pBrC = [0, 1, 2, 3].map(() => node('path', { fill: 'none', stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'square' }, pBr));
const pBrL = text(pBr, 0, 0, '', { 'font-size': 20, fill: C.ink, 'font-family': MONO, 'font-weight': 500 });
const pScan = grp('Plugin scan bar', plugin);
node('rect', { x: 1262, y: -2, width: 426, height: 9, fill: C.blue }, pScan);
node('rect', { x: 1262, y: -5, width: 426, height: 5, fill: '#fff' }, pScan);
// the Figma skeleton: dots tracing the parts (figma coords), and the selection bracket jumping between them
const figSkel = grp('Figma skeleton', figCam); figCam.insertBefore(figSkel, plugin);   // the Figma build sits behind the plugin window
const figSkelClip = node('clipPath', { id: 'figBelowScan' }, defs), figSkelClipR = node('rect', { x: 0, y: 0, width: 1920, height: 1200 }, figSkelClip);
figSkel.setAttribute('clip-path', 'url(#figBelowScan)');
const FDOTS = [];
let xf = null;   // while drawing a panel's skeleton: map its points like the panel's contents
const fDot = (x0, y0, t, r = 2.3, op = 0.7) => { const { x, y } = xf ? xf(x0, y0) : { x: x0, y: y0 }; FDOTS.push({ el: node('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 0, fill: C.ink }, figSkel), x, y, t, r, op, last: '' }); };
function fLine(d, at, dur, o = {}) { const { gap = 8, r = 2.3, op = 0.7 } = o, pth = node('path', { d }, figSkel), len = pth.getTotalLength(), n = Math.max(2, Math.round(len / gap));
  for (let k = 0; k <= n; k++) { const pt = pth.getPointAtLength((k / n) * len); fDot(pt.x, pt.y, FIG.at + at + (k / n) * dur, r, op); } pth.remove(); }
const rrHalves = (x, y, w, h, r) => halves(x, y, w, h, r);
const fRow = (x, y, w, at) => { fLine(`M${x},${y} H${x + w}`, at, 4, { gap: 7, r: 1.9, op: 0.6 }); fDot(x, y, FIG.at + at, 3.6, 0.85); };
const SHOWN = 48;   // the hold after the cards land and the carry to the centre, before Figma builds around it; Figma and everything after shift by it
const FIG = { at: 316 + LATE + SHOWN, zoom: 44, scan: 22, scanAt: 334 + LATE + SHOWN };
const FPARTS = [
  { type: 'FRAME', box: [WIN.x, WIN.y, WIN.w, WIN.h], at: 0, draw: () => rrHalves(WIN.x, WIN.y, WIN.w, WIN.h, WR).forEach((d) => fLine(d, 0, 12, { gap: 9, r: 2.6, op: 0.75 })) },
  { type: 'TABS', box: [WIN.x, WIN.y, WIN.w, TOP + TOOLS], at: 3, draw: (pt) => { fLine(`M${WIN.x},${CT} H${WIN.x + WIN.w}`, pt.at, 8, { gap: 8 }); fDot(WIN.x + 46, ty0, FIG.at + pt.at + 1, 4, 0.85);
    fRow(WIN.x + 116, ty0, 132, pt.at + 2); fRow(WIN.x + 324, ty0, 134, pt.at + 3); fDot(WIN.x + WIN.w - 46, ty0, FIG.at + pt.at + 4, 4, 0.85); for (let i = 0; i < 5; i++) fDot(tlx(i), tly, FIG.at + pt.at + 4 + i * 0.5, 3.2, 0.8); } },
  { type: 'PANEL', box: [LP.x, LP.y, LP.w, LP.h], at: 5, draw: (pt) => { fLine(`M${LP.x + LP.w},${LP.y} V${LP.y + LP.h - WR}`, pt.at, 7, { gap: 8 }); fRow(LP.x + 38, LP.y + 32, 60, pt.at + 2); fRow(LP.x + 120, LP.y + 32, 60, pt.at + 2.5);
    LAYERS.forEach(([, ind, w], i) => fRow(LP.x + 30 + ind * 22, LROW(i), 26 + w, pt.at + 3 + i * 0.5)); } },
  { type: 'PANEL', box: [RP.x, RP.y, RP.w, RP.h], at: 6, draw: (pt) => { fLine(`M${RP.x},${RP.y} V${RP.y + RP.h - WR}`, pt.at, 7, { gap: 8 }); fRow(RP.x + 24, RP.y + 35, 120, pt.at + 2); fRow(RP.x + 24, RP.y + 63, 72, pt.at + 2.5); } },
  ...SCRC.map((cx, i) => ({ type: 'ARTBOARD', box: [cx - SW / 2 - AB, SY - SH / 2 - AB, SW + 2 * AB, SH + 2 * AB], at: 8 + i * 2, draw: (pt) => {
    rrHalves(cx - SW / 2 - AB, SY - SH / 2 - AB, SW + 2 * AB, SH + 2 * AB, 15 + AB).forEach((d) => fLine(d, pt.at, 7, { gap: 8 }));
    rrHalves(cx - SW / 2, SY - SH / 2, SW, SH, 15).forEach((d) => fLine(d, pt.at + 1, 6, { gap: 7, r: 1.9, op: 0.6 })); fRow(cx - 50, SY - SH / 2 + 34, 100, pt.at + 3); fRow(cx - 58, SY + 12, 116, pt.at + 4); fRow(cx - 58, SY + 34, 88, pt.at + 4.5); } })),
  { type: 'LINK', box: [SCRC[0] + SW / 2 + AB, SY - 8, SCRC[2] - SCRC[0] - SW - 2 * AB, 16], at: 14, draw: (pt) => [0, 1].forEach((i) => fLine(`M${SCRC[i] + SW / 2 + AB},${SY} H${SCRC[i + 1] - SW / 2 - AB}`, pt.at + i, 4, { gap: 7, r: 2.1 })) },
];
FPARTS.forEach((pt) => pt.draw(pt));
const fBr = grp('Selection bracket (Figma build)', figSkel);
const fBrC = [0, 1, 2, 3].map(() => node('path', { fill: 'none', stroke: C.ink, 'stroke-width': 2.4, 'stroke-linecap': 'square' }, fBr));
const fBrL = text(fBr, 0, 0, '', { 'font-size': 14, fill: C.ink, 'font-family': MONO, 'font-weight': 500 });
// the figma scan bar (figma coords: spans the window)
const fScan = grp('Figma scan bar', figCam); figCam.insertBefore(fScan, plugin);   // the plugin floats above Figma's build and scan
node('rect', { x: WIN.x - 30, y: -1, width: WIN.w + 60, height: 6, fill: C.blue }, fScan);
node('rect', { x: WIN.x - 30, y: -3, width: WIN.w + 60, height: 3.5, fill: '#fff' }, fScan);
// the dragged card, its drop target (just above the link from Home to Toast) and Figma's selection on it
// the placed card is the case study's Figma component, "Motion Card (Full)": a Motion box (name, the curve in its
// window, its values) over a Tokens box (the easing and duration tokens), centred in the gap between two frames
const CARD_W = 150, MC_TOP = 222, MC_GAP = 10, MC_TOK = 88, CARD_H = MC_TOP + MC_GAP + MC_TOK, GRAB = { x: 0, y: -0.3 * CARD_H };   // where the cursor holds it
const DROP_C = { x: (noodles[0].x1 + noodles[0].x2) / 2, y: SY };
const copy = grp('Card dragged onto the canvas', figCam); copy.setAttribute('filter', SH_CARD);
function motionCardFull(g, sp) {   // sp: { title, comp, v: [x1, y1, x2, y2], ms, te, td }
  const W = CARD_W, x0 = -W / 2, y0 = -CARD_H / 2, y1 = y0 + MC_TOP + MC_GAP, box = { fill: '#10284C', stroke: '#24467A', 'stroke-width': 1.2 };
  const it = (x, y, str, o) => text(g, x, y, str, { 'font-style': 'italic', fill: '#fff', ...o });
  const glass = (x, y) => node('path', { fill: C.blueHi, stroke: C.blueHi, 'stroke-width': 1.6, 'stroke-linejoin': 'round', d:   // ⧗ easing: two triangles, tip into tip (overlapping a little), corners softly rounded
    `M${x - 4.4},${y - 4.9} H${x + 4.4} L${x},${y + 1.1} Z M${x - 4.4},${y + 4.9} H${x + 4.4} L${x},${y - 1.1} Z` }, g);
  const dia = (x, y) => node('path', { d: `M${x},${y - 5.5} L${x + 5.5},${y} L${x},${y + 5.5} L${x - 5.5},${y} Z`, fill: C.blueHi }, g);   // ◆ duration
  node('rect', { x: x0, y: y0, width: W, height: MC_TOP, rx: 12, ...box }, g);
  g._head = [it(x0 + 13, y0 + 26, sp.title, { 'font-size': 12.5, 'font-weight': 700 }), it(x0 + W - 13, y0 + 26, sp.comp, { 'font-size': sp.comp.length > 8 ? 8.5 : 10, fill: '#6E9BE0', 'text-anchor': 'end', 'font-weight': 600 })];   // the movement, then the component
  const gx = x0 + 10, gy = y0 + 40, gw = W - 20, gh = 112;   // even rhythm: 16 px around each block
  node('rect', { x: gx, y: gy, width: gw, height: gh, rx: 8, fill: '#0A1E3C' }, g);
  for (let i = 1; i < 6; i++) { node('line', { x1: gx + (gw * i) / 6, y1: gy + 6, x2: gx + (gw * i) / 6, y2: gy + gh - 6, stroke: '#163463', 'stroke-width': 0.8, opacity: 0.35 }, g); node('line', { x1: gx + 6, y1: gy + (gh * i) / 6, x2: gx + gw - 6, y2: gy + (gh * i) / 6, stroke: '#163463', 'stroke-width': 0.8, opacity: 0.35 }, g); }   // the graph's grid: barely there
  const a = { x: gx + 18, y: gy + gh - 14 }, z = { x: gx + gw - 18, y: gy + 14 }, at = (u, v) => ({ x: lerp(a.x, z.x, u), y: lerp(a.y, z.y, v) }), p1 = at(sp.v[0], sp.v[1]), p2 = at(sp.v[2], sp.v[3]);
  node('line', { x1: a.x, y1: a.y, x2: p1.x, y2: p1.y, stroke: C.blue, 'stroke-width': 1.4 }, g); node('line', { x1: z.x, y1: z.y, x2: p2.x, y2: p2.y, stroke: C.blue, 'stroke-width': 1.4 }, g);
  node('path', { d: `M${a.x},${a.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${z.x},${z.y}`, fill: 'none', stroke: '#fff', 'stroke-width': 2 }, g);
  [p1, p2].forEach((q) => node('circle', { cx: q.x, cy: q.y, r: 3, fill: '#0A1E3C', stroke: '#fff', 'stroke-width': 1.3 }, g));
  [a, z].forEach((q) => node('circle', { cx: q.x, cy: q.y, r: 4.5, fill: C.blue }, g));
  glass(x0 + 19, y0 + 174); text(g, x0 + 33, y0 + 178.5, sp.v.join(', '), { 'font-size': 11.5, fill: '#fff', 'font-weight': 500 });
  dia(x0 + 19, y0 + 198); text(g, x0 + 33, y0 + 202.5, sp.ms, { 'font-size': 11.5, fill: '#fff', 'font-weight': 500 });
  node('rect', { x: x0, y: y1, width: W, height: MC_TOK, rx: 12, ...box }, g);
  it(x0 + 13, y1 + 26, 'Tokens', { 'font-size': 12.5, 'font-weight': 700 });
  glass(x0 + 19, y1 + 48); it(x0 + 33, y1 + 52, sp.te, { 'font-size': 11.5, 'font-weight': 500, fill: '#DCE6F5' });
  dia(x0 + 19, y1 + 70); it(x0 + 33, y1 + 74, sp.td, { 'font-size': 11.5, 'font-weight': 500, fill: '#DCE6F5' });
}
motionCardFull(copy, { title: 'Slides Up', comp: 'Bottom Sheet', v: [0.1, 0.1, 0.1, 1], ms: '250 ms', te: 'moving_slow', td: 'quick2' });
// card 1's header highlighted once it's placed, like a marker: a solid blue block wipes in behind each word (the
// movement, then the component), the words turn white on it, and it wipes off to the right. Solid fills, no glow: nothing to band.
const headMarks = (card) => card._head.map((t) => { const r = node('rect', { rx: 4, fill: '#2F74E0', width: 0, height: 0 }, card); card.insertBefore(r, t); return { t, r, base: t.getAttribute('fill'), bb: null }; });
const headMark = headMarks(copy);
// a second card pops in on the next link: the page transition to Details
const DROP_C2 = { x: (noodles[1].x1 + noodles[1].x2) / 2, y: SY };
const copy2 = grp('Card 2 – Slides Left · Page', figCam); copy2.setAttribute('filter', SH_CARD);
motionCardFull(copy2, { title: 'Slides Left', comp: 'Page', v: [0.6, 0, 0.2, 1], ms: '550 ms', te: 'slow_slow', td: 'long1' });
const headMark2 = headMarks(copy2);
const sel = grp('Figma selection', figCam);
node('rect', { x: DROP_C.x - CARD_W / 2 - 1, y: DROP_C.y - CARD_H / 2 - 1, width: CARD_W + 2, height: CARD_H + 2, fill: 'none', stroke: FIGBLUE, 'stroke-width': 1.5 }, sel);
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => node('rect', { x: DROP_C.x + sx * (CARD_W / 2 + 1) - 4, y: DROP_C.y + sy * (CARD_H / 2 + 1) - 4, width: 8, height: 8, fill: '#fff', stroke: FIGBLUE, 'stroke-width': 1.5 }, sel));
node('rect', { x: DROP_C.x - 30, y: DROP_C.y + CARD_H / 2 + 8, width: 60, height: 18, rx: 4, fill: FIGBLUE }, sel);
F(sel, DROP_C.x, DROP_C.y + CARD_H / 2 + 21, `${CARD_W} × ${Math.round(CARD_H)}`, { 'font-size': 10.5, fill: '#fff', 'font-weight': 600, 'text-anchor': 'middle' });

// ---------------------------------------------------------------- state the beats tween
const st = { a: 0, b: 0, line: 1, p1: 1, ride: 0, zoom: 0, hand: 0, pull: 0, spin: 0, settle: 0, gather: 0, dx: 0,
  pwin: 0, center: 0, cam: 0, hi: 0, drag: 0, __label: 'drawing' };
const cur = { x: 1560, y: 980, o: 0, press: 0, follow: 0, __label: 'cursor' };
const toStage = (p, pose) => ({ x: pose.x + p.x * pose.k, y: pose.y + p.y * pose.k });

// ================================================================ 1 · close on the curve: a dot rides it, then we pull back as the names fill in
s.beat('curve.start', { at: 0, dur: 8, ease: 'linear', note: 'Close on the curve’s start point; a dot sets off' }, (b) => b.fromTo(st, { a: 0 }, { a: 1 }));
s.beat('curve.ride', { at: 4, dur: 52, ease: 'linear', note: 'The dot rides the curve in time, drawing it: slow at the ends, fast in the middle' }, (b) => b.fromTo(st, { ride: 0 }, { ride: 1 }));
s.beat('curve.zoomOut', { at: 18, dur: 48, ease: 'move', note: 'The camera follows the dot, then pulls back to the whole curve' }, (b) => b.fromTo(st, { zoom: 0 }, { zoom: 1 }));
s.beat('curve.end', { at: 54, dur: 10, ease: 'linear', note: 'It lands on the end point; the Bézier handles open out' }, (b) => { b.fromTo(st, { b: 0 }, { b: 1 }, { dur: 8 }); b.fromTo(st, { hand: 0 }, { hand: 1 }, { at: 3, dur: 22, ease: 'linear' }); });   // the handles draw out slowly
s.beat('bubbles.in', { at: 20, dur: 48, ease: 'linear', note: 'Around it, people’s questions pop up as chat bubbles, alternating sides' }, (b) => b.track(bubblesG));
s.beat('names.in', { at: 22, dur: 36, ease: 'linear', note: 'Behind it, the names for easings cascade in: Figma’s, CSS, platforms, libraries, and how designers talk about it' }, (b) => b.track(namesG));
// ================================================================ 3 · the real card materialises around the curve, shows its depth, flips, settles
s.beat('card.pull', { at: 82, dur: 58, ease: 'move', note: 'Pull back: the curve shrinks to where it sits on the real card' }, (b) => b.fromTo(st, { pull: 0 }, { pull: 1 }));
s.beat('card.build', { at: SKEL.at, dur: SCAN.at - SKEL.at, ease: 'linear', note: 'An agent assembles the card on a dot matrix as we pull back: frame, then each part with its bracket; the log counts, the CSS types' }, (b) => b.track(skel, panels));
s.beat('card.scan', { at: SCAN.at, dur: SCAN.dur, ease: 'linear', note: 'A scan bar slides top to bottom, revealing the real card' }, (b) => b.track(scanG, deckEl));
// the card holds a beat once it's built, then flips 180° to its back while coming closer to the camera; a shine sweeps
// across the back; then it flips the rest of the way round, back to its face, settling back as the others spread out
const FLIP = { at1: SCAN.at + SCAN.dur + 50,   // the scan camera settles back out (+28), then the whole card holds ~0.9 s before the flip
      d1: 32, back: 50, d2: 28, near: 1.12 }, FLIPE = bezier(0.65, 0, 0.25, 1),   // the first flip: slow, cinematic (gentle start, long settle)
      FLIPE2 = bezier(0.74, 0, 0.2, 1);   // the flip back: a slower, weightier turn that settles gently
FLIP.at2 = FLIP.at1 + FLIP.d1 + FLIP.back; FLIP.shine = { at: FLIP.at1 + FLIP.d1 + 1, dur: 50 };
s.beat('card.flip', { at: FLIP.at1, dur: FLIP.d1, ease: 'linear', note: 'After a short hold, the card flips 180° to its back and comes closer' }, (b) => b.track(deckEl));
s.beat('card.shine', { at: FLIP.shine.at, dur: FLIP.shine.dur, ease: 'linear', note: 'A shine sweeps across the back' }, (b) => b.track(deckEl));
s.beat('card.flipBack', { at: FLIP.at2, dur: FLIP.d2, ease: 'linear', note: 'It flips back to its face and settles back as the others spread out' }, (b) => b.track(deckEl));
// ================================================================ 4 · the featured cards spread out from behind it, left and right
const SP = { at: FLIP.at2 + Math.round(FLIP.d2 * 0.55), dur: 18, step: 3 };   // a quicker spread
s.beat('deck.spread', { at: SP.at, dur: SP.dur + SP.step, ease: 'linear', note: 'Four more featured cards slide out left and right, tilted, stepping down' }, (b) => b.track(deckEl));
s.beat('deck.gather', { at: 244 + LATE, dur: 26, ease: [0.52, 0, 0.24, 1], note: 'They gather into one stack and drift left as the plugin arrives' }, (b) => { b.fromTo(st, { gather: 0 }, { gather: 1 }); b.fromTo(st, { dx: 0 }, { dx: -384 }); });   // collapse and drift are one move: same start, same curve   // the stack moves to the left third
// ================================================================ 5 · the plugin; its window; Figma builds around it as we pull back
const ROWE = bezier(0.25, 1.5, 0.5, 1);   // the rows' slide in: a small overshoot to the right, then settle
const PG = { at: PB.scanAt + 26,   // the gathered stack holds a beat beside the plugin before the cards pour in
      dur: 16, step: 3 };   // then the cards pour in, one by one
s.beat('plugin.build', { at: PB.at, dur: PB.scanAt + PB.scan - PB.at, ease: 'linear', note: 'The plugin is constructed like the card: a dot skeleton of its parts, then a scan reveals it' }, (b) => b.track(pSkel, pluginIn));
s.beat('figma.deck', { at: PG.at, dur: PG.dur + PG.step * 4, ease: 'linear', note: 'The cards pour into the plugin: it becomes a list of easings by name' }, (b) => { b.track(deckEl, ...listRows); });
s.beat('figma.pluginWindow', { at: PG.at, dur: 28, ease: 'move', note: 'A plugin window forms around it: title, close' }, (b) => b.fromTo(st, { pwin: 0 }, { pwin: 1 }));
s.beat('figma.build', { at: FIG.at, dur: FIG.scanAt + FIG.scan - FIG.at, ease: 'linear', note: 'Figma constructs around the plugin like the card did: a dot skeleton of its parts, then a scan reveals the UI' }, (b) => b.track(figSkel, figUI));
// once the cards are in, the plugin moves to the centre of the frame and holds there, then Figma builds around it
const SHOW = { at: PG.at + PG.dur + PG.step * 4 - 9, dur: 34 },   // as the last cards land, the camera brings the plugin to the centre on its own (no cursor yet)
      ZC = 1.25 * 1.2 / PK, QC = { x: 960, y: 626 };   // QC: the plugin sits a little low, so its title bar keeps clear space above it (its foot may run off the bottom)   // holds a beat after the last card lands; the camera pushes in (1.25×) while the cursor carries it to the centre   // centred zoom and where the plugin's centre sits
s.beat('plugin.show', { at: SHOW.at, dur: SHOW.dur, ease: 'move', note: 'The plugin slides to the centre of the frame and holds' }, (b) => b.fromTo(st, { center: 0 }, { center: 1 }));
s.beat('figma.zoom', { at: FIG.at, dur: FIG.zoom, ease: 'move', note: 'The camera pulls back while it builds: the plugin ends small in the whole Figma window' }, (b) => b.fromTo(st, { cam: 0 }, { cam: 1 }));
// ================================================================ 6 · pick a name, drag it out as a card, drop it on the flow; the flow runs
// the cursor carries the plugin: it comes in as the last cards land, grabs the window by its title bar and drags it to
// the centre (plugin.show), holds it there, then, still holding, eases it right to the edge of the canvas while the
// camera pulls back and Figma builds; it lets go and goes on to pick an easing. (The plugin can sit anywhere.)
// then the cursor comes in, grabs the title bar, and carries it right as Figma builds; MVX: it ends on the edge of the
// canvas and the right panel, just clear of the Details frame
const MV = { in: FIG.at - 36, enter: 24, grab: FIG.at - 10, release: FIG.at + FIG.zoom }, MVX = 240;   // enter: its unhurried glide in to the title bar (arrives 2f before the grab)
const WSHIFT = 18;   // the pick starts a moment after it lets go: the whole Figma window holds long enough to read as Figma
const pOff = (f) => ({ x: MVX * MOVE(ramp(f, FIG.at, FIG.zoom - 6)), y: 0 });   // starts as the centring ends: one continuous swing, left to the centre and back right
const HOVPT = panelToFig({ x: 1592, y: 172 });   // on the title bar, in the empty stretch between the title and the ×
s.beat('plugin.carry', { at: MV.in, dur: MV.release + 6 - MV.in, ease: 'linear', note: 'The cursor grabs the centred plugin by its title bar and eases it right to the edge of the canvas as Figma builds' }, (b) => b.track(plugin));
const ROWPT = (() => { const q = panelToFig({ x: 1430, y: rowY(PICK_ROW) - 6 }); return { x: q.x + MVX, y: q.y }; })();   // in the moved window
const PICK = { at: 360 + LATE + SHOWN + WSHIFT, move: 28, press: 36 };   // taken slowly: the cursor travels to the easing (move), rests on it, presses (press)
const DRAG = { at: PICK.at + PICK.press + 4, dur: 40 };
s.beat('figma.pick', { at: PICK.at, dur: PICK.press + 4, ease: 'move', note: 'The cursor picks “moving → slow” in the plugin (the camera closes in on it)…' }, (b) => {
  b.fromTo(st, { hi: 0 }, { hi: 1 }, { at: PICK.move - 3, dur: 4, ease: 'fade' });
});
s.beat('figma.drag', { at: DRAG.at, dur: DRAG.dur, ease: 'linear', note: '…drags it out (held right under the cursor) and drops it as a Motion Card just above the link from Home to Toast' }, (b) => {
  b.fromTo(st, { drag: 0 }, { drag: 1 });
  b.fromTo(st, { hi: 1 }, { hi: 0 }, { at: 8, dur: 6, ease: 'fade' });
});
// the drag's camera follows the card without closing in; once it's placed the camera zooms in onto the bottom of the card
// (zin), pans slowly up it to its header (pan; “Slides Up · Toast”), which is highlighted; then pulls back out to the whole step
const HEAD = { at: DRAG.at + DRAG.dur, zin: 38, pan: 54, shine: 40, out: 40 };
HEAD.glint = HEAD.zin + HEAD.pan - 4;   // the highlight starts as the pan lands
HEAD.outAt = HEAD.at + HEAD.glint + HEAD.shine + 12;
const RUN = { at: HEAD.outAt, k: 1.8, x: 60 };   // the run starts as the highlight ends: the camera goes straight on to Sending
// the run's clock: step u (in RUN.k frames) → frame; x extra frames are spread over steps 12–24, the toast: the camera
// closes in on it, it plays, we hold, then pull back out to see the whole step
const rt = (u) => RUN.at + u * RUN.k + RUN.x * clamp((u - 12) / 12) + 22 * clamp((u - 30) / 12) + 16 * clamp((u - 54) / 12) + 18 * clamp((u - 18) / 3);   // +22: card 2 pops and the camera closes in on it, unhurried; +16: the pull back to Details, slower; +18: a hold on the sheet once it's up
// the camera never parks (motion principle 10): wherever a camera move would come to rest, it keeps drifting the same
// way (a slow zoom, in log scale per second) until the next move starts and blends the drift away over its length
const DRIFT = 0.035;
const HOLDS = [   // [drift from, until the next move starts, direction (-1 out / +1 in), that next move's length]
  [58, 82, -1, 58],                                                  // after the opening pull back → the pull into the card
  [SCAN.at + SCAN.dur + 20, FLIP.at1, -1, 32],                       // the card holds to be read → the flip and push in
  [FIG.at + FIG.zoom - 8, PICK.at, -1, PICK.press + 2],               // the whole Figma window → the zoom in on the pick
  [Math.round(rt(66)), 1e9, 1, 1],                      // the flow's last pan → to the end
];
const driftLog = (f) => HOLDS.reduce((sum, [a, b, dir, len]) => {
  const secs = (Math.min(f, b) - a) / 25; if (secs <= 0) return sum;
  const T0 = 0.6, dist = secs < T0 ? 0.5 * secs * secs / T0 : secs - T0 / 2;   // its speed builds up over 0.6 s (no kick)
  const fade = f > b ? 1 - MOVE(ramp(f, b, len)) : 1;   // the next move blends it away over its own length
  return sum + dir * DRIFT * dist * fade;
}, 0);
const DOT2 = 24;   // the dot sets off along the second link as the camera pulls back from the sheet, so card 2 pops in during that move
const POP2 = (() => { let v = 0; while (MOVE(v) < 0.15 && v < 1) v += 0.005; return Math.round(rt(DOT2) + v * (rt(DOT2 + 10) - rt(DOT2))); })();   // the second card pops in as the dot travelling the second link reaches it (15% along: the card is up as the dot passes under it)   // k: the flow run's pace (all its steps and the camera's pans stretch by it)
// the focus camera: as the card is dragged, zoom in toward the cursor (so the placement reads in a thumbnail), then
// follow the flow, Home/Toast → Toast → Done
const FIGV = { z: 1.0, c: { x: 960, y: 540 } };   // the pull back ends on the whole Figma window (its chrome is what says it's Figma)
const FOCUS = { z: 2.1, at: PICK.at, dur: PICK.press + 8 };
const PICK_ZOOM = (f) => 0.3 * MOVE(ramp(f, PICK.at, PICK.press + 8)) * (1 - MOVE(ramp(f, DRAG.at, DRAG.dur * 0.6)));   // closer still on the plugin while the easing is picked; eases back as the drag sets off   // closes in as the cursor heads for the easing; stays close through the drag
const pickFig = (f) => { const po = pOff(f), pk = MOVE(ramp(f, PICK.at, PICK.move)); return { x: lerp(HOVPT.x + po.x, ROWPT.x, pk), y: lerp(HOVPT.y + po.y, ROWPT.y, pk) }; };   // the cursor, in Figma coords
const curFig = (f) => { const dm = MOVE(ramp(f, DRAG.at, DRAG.dur)); return { x: lerp(ROWPT.x, DROP_C.x + GRAB.x, dm), y: lerp(ROWPT.y, DROP_C.y + GRAB.y, dm) }; };
const CARD2_TOP = { x: (noodles[1].x1 + noodles[1].x2) / 2, y: SY - (MC_TOP + MC_GAP + MC_TOK) / 2 + 30 };   // card 2's header: Slides Left · Page
const TOASTF = { x: SCR[1].x, y: SY + 72 };
const SCRIM = bezier(0.4, 0, 0.4, 1);   // the bottom of Sending, where the bottom sheet slides up
const CARD1_BOT = { x: DROP_C.x, y: SY + CARD_H / 2 - 74 }, CARD1_TOP = { x: DROP_C.x, y: SY - CARD_H / 2 + 62 };   // framed on card 1's header (Slides Up · Toast), sitting in the upper third
const TOGO = (f) => MOVE(ramp(f, HEAD.outAt, rt(18) - HEAD.outAt));   // from card 1's header straight over to the bottom of Sending
const DROP_ZOOM = (f) => 0.95 * MOVE(ramp(f, HEAD.at, HEAD.zin)) * (1 - TOGO(f))   // in once it's placed (onto its bottom), up to its header
  + 0.45 * TOGO(f) * (1 - MOVE(ramp(f, rt(21), rt(30) - rt(21))));   // then straight on, a touch wider, onto the sheet as it rises; it holds, then pulls back out as card 2 pops in
const CARD2_ZOOM = (f) => MOVE(ramp(f, rt(30), rt(42) - rt(30))) * (1 - MOVE(ramp(f, rt(54), rt(66) - rt(54))));   // a closer look while we read it
const focusPt = (f) => {
  const end = DRAG.at + DRAG.dur, A = { x: DROP_C.x, y: SY }, pts = [[end, A], [end + HEAD.zin, CARD1_BOT], [end + HEAD.zin + HEAD.pan, CARD1_TOP], [HEAD.outAt, CARD1_TOP], [rt(18), TOASTF, 'lead'], [rt(21), TOASTF], [rt(30), { x: (SCR[1].x + DROP_C2.x) / 2, y: SY }], [rt(42), CARD2_TOP], [rt(54), CARD2_TOP], [rt(66), { x: SCR[2].x, y: SY }]];
  if (f < DRAG.at) return pickFig(f);   // on the cursor as it goes to the easing
  if (f <= end) { const c = curFig(f), w = MOVE(ramp(f, DRAG.at, DRAG.dur)); return { x: lerp(c.x, A.x, w), y: lerp(c.y, A.y, w) }; }   // follows the cursor, arriving framed on the card as it drops: one move   // follows the cursor, arriving framed on the placement as it drops: one move
  let p = A;
  for (let i = 1; i < pts.length; i++) {
    const [t0] = pts[i - 1], [t1, q, lead] = pts[i], d = t1 - t0; if (f <= t0) break;
    const wx = lead ? MOVE(ramp(f, t0, d * 0.65)) : MOVE(ramp(f, t0, d)), wy = lead ? MOVE(ramp(f, t0 + d * 0.35, d * 0.65)) : wx;   // lead: across first, then down
    p = { x: lerp(p.x, q.x, wx), y: lerp(p.y, q.y, wy) };
  }
  return p;
};
s.beat('card2.pop', { at: POP2, dur: 16, ease: 'linear', note: 'As the dot passes along the second link, a second card pops in there: Slides Left · Page' }, (b) => b.track(copy2));
// the end: the Figma window slides away to the left and leaves the plain ground the film opens on (no grid), so it loops
const EXIT = { at: Math.round(rt(92)) + 8, dur: 36 }, EXITE = bezier(0.6, 0, 0.3, 1);
s.beat('end.exit', { at: EXIT.at, dur: EXIT.dur, ease: 'linear', note: 'Figma slides away to the left, leaving the plain ground the film starts on (it loops)' }, (b) => b.track(figCam));
s.beat('flow.run', { at: RUN.at, dur: Math.round(rt(92) - RUN.at), ease: 'linear', note: 'The flow runs: tap Pay → the bottom sheet slides up, Paying… (card 1) → the dot reaches Details, card 2 pops in and we read it → the camera moves to Details, which slides in from the right (card 2)' }, (b) => b.track(figUI));

// ---------------------------------------------------------------- poses
const tf = (x, y, a, k) => `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(2)}) scale(${k.toFixed(4)})`;
const STACK = { x: 960, y: 540, s: 1.12 };   // the gathered stack: a little shorter than the plugin beside it, similar weight
const nrm = (a) => ((((a % 360) + 540) % 360) - 180);   // an angle as the shortest turn from 0
function heroPose(f) {
  const a = FLIPE(ramp(f, FLIP.at1, FLIP.d1)), b = FLIPE2(ramp(f, FLIP.at2, FLIP.d2));
  const ta = Math.sin(Math.PI * a);   // mid-turn of the first flip
  const p = { x: 960, y: 540, z: 0, rx: 9 * ta, ry: 180 * a + 180 * b, rz: -3 * ta, s: 1 };   // tips back and rolls a touch as it turns, like a card flipped by hand; flat and still on its back while the light sweeps
  p.z += 140 * ta + 90 * Math.sin(Math.PI * b);   // lifts toward the camera as it turns
  p.s *= lerp(lerp(HK, HK * FLIP.near, a), SETTLED, b); p.y += -30 * b;   // closer on the back; back to settled, facing us
  // during the shine the card itself comes closer, never holding still: it rushes in and slows hard as it nears (heading
  // at the frame's vertical centre at the top), then eases away slowly and speeds up as it goes back into the flip over
  const pc = pushCam(f); p.s *= pc.k; p.y += pc.dy * p.s / pc.k + pc.ry;
  return p;
}
// the push in on the card through the flip and shine is a camera move: the card and the ground both take it (the ground
// with parallax), so the scene moves rather than one object. It never holds still: it rushes in and slows hard as it
// nears (the heading at the frame's vertical centre at the top), then eases away slowly and speeds up into the flip back
function pushCam(f) {
  const b = FLIPE2(ramp(f, FLIP.at2, FLIP.d2));
  const S0 = FLIP.at1 + 2, PK1 = FLIP.at1 + 50, E1 = FLIP.at2 + 16, PUSHIN = bezier(0.45, 0, 0.12, 1);
  const push = f < PK1 ? PUSHIN(ramp(f, S0, PK1 - S0)) : 1 - ramp(f, PK1, E1 - PK1) ** 3;
  const creep = ramp(f, S0, E1 - S0) ** 1.5 * (1 - b);   // underneath, a slow steady drift so it is never still, even at the top
  const k = (1 + 0.3 * push) * (1 + 0.05 * creep);
  return { k, dy: 40.85 * push * k, ry: -26 * creep };   // 40.85: the heading's distance above the card's centre (card px)
}
function otherPose(o, f, base) {   // from behind the hero → its spread slot (left/right, tilted, stepping down)
  const a = Math.abs(o.j), sp = OUT(ramp(f, SP.at + (a - 1) * SP.step, SP.dur));
  const slot = { x: 960 + o.j * 300, y: base.y + 10 * a + 8 * a * a, z: 0, rx: 0, ry: 0, rz: 6 * o.j, s: base.s * (1 - 0.05 * a) };
  const behind = { ...base, rx: 0, ry: 0, rz: 0, z: 0 };   // exactly behind the first card
  const p = {}; for (const k of Object.keys(slot)) p[k] = lerp(behind[k], slot[k], sp);
  return { p, fade: OUT(ramp(f, SP.at + (a - 1) * SP.step, 4)), dim: sp * a };   // dim: cards further back sit a step darker (depth)   // fades in as it comes out from behind (outer cards over longer)
}
const tr3 = (p) => `translate3d(${(p.x - CW3 / 2).toFixed(1)}px, ${(p.y - CH3 / 2).toFixed(1)}px, ${p.z.toFixed(1)}px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) rotateZ(${p.rz.toFixed(2)}deg) scale(${p.s.toFixed(4)})`;
function place(c, p, op) {
  c.el.style.transform = tr3(p); c.el.style.opacity = op.toFixed(3);
  // the back half of the rim wears the back's colours only while the back is turned toward us: with the front facing,
  // it could only ever show as a sub-pixel sliver beside the edge, flickering in and out as the card turns
  const front = Math.cos(p.rx * Math.PI / 180) * Math.cos(p.ry * Math.PI / 180) > 0;
  if (c.front !== front) { c.front = front; c.slabs?.forEach((d, k) => k >= 11 && d.classList.toggle('dim', front)); }
}

// ---------------------------------------------------------------- the frame hook
const FZ0 = 1.2 / PK, FQ0 = { x: 1344, y: 545 };   // plugin on the right third   // the plugin first shows big (1.2× its panel size), beside the stack, the pair centred
let camZ = FZ0, camQ = FQ0;
const figToStage = (q) => ({ x: camQ.x + camZ * (q.x - PC.x), y: camQ.y + camZ * (q.y - PC.y) });
s.onFrame((f) => {
  { const c = st.cam, z0 = FZ0 * Math.pow(ZC / FZ0, st.center), q0 = { x: lerp(FQ0.x, QC.x, st.center), y: lerp(FQ0.y, QC.y, st.center) - 42 * (1 - OUT(st.pwin)) * (1 - st.center) };   // before its window (title bar) forms, the bare panel is centred on its own, so it doesn't sit low   // right third → centred → the whole window
    // the pull back ends a little closer than the whole window (FIGV), framed on the canvas, flow and plugin
    const qf = { x: 960 - FIGV.z * (FIGV.c.x - PC.x), y: 540 - FIGV.z * (FIGV.c.y - PC.y) };
    camZ = z0 * Math.pow(FIGV.z / z0, c); camQ = { x: lerp(q0.x, qf.x, c), y: lerp(q0.y, qf.y, c) }; }
  const fz = MOVE(ramp(f, FOCUS.at, FOCUS.dur));
  placeFlow(fz);   // the frames spread apart as the camera closes in on the plugin
  if (fz > 0) {   // zoomed toward the focus point: it slides to the frame's centre as the zoom grows
    const fp = focusPt(f), zb = camZ, base = { x: camQ.x + zb * (fp.x - PC.x), y: camQ.y + zb * (fp.y - PC.y) };   // from the framed view
    const z = zb * Math.pow(FOCUS.z / FIGV.z, fz) * (1 + 0.62 * CARD2_ZOOM(f)) * (1 + DROP_ZOOM(f)) * (1 + PICK_ZOOM(f)), sp = { x: lerp(base.x, 960, fz), y: lerp(base.y, 540, fz) };
    camZ = z; camQ = { x: sp.x - z * (fp.x - PC.x), y: sp.y - z * (fp.y - PC.y) };
  }
  // ---- the drawn curve: on paper in navy ink; as the card forms it turns white over the printed curve, then hands over
  const pull = MOVE(st.pull), cp = { x: lerp(BIG.x, ALIGN.x, pull), y: lerp(BIG.y, ALIGN.y, pull), k: lerp(BIG.k, ALIGN.k, pull) };
  // the opening camera: close on the rider (following its time, with a gentler path than the steep curve), pulling back
  // to the whole curve at BIG; from there the pull to the card takes over
  const rz = st.zoom, rp = atTime(st.ride), rk = Math.pow(ZOOM0, 1 - rz), fy = lerp(A.y, B.y, rp.x === A.x ? 0 : (3 - 2 * clamp(st.ride)) * clamp(st.ride) ** 2);
  const fpt = { x: lerp(rp.x, 0, rz), y: lerp(fy, 0, rz) }, cam0 = { x: BIG.x - rk * fpt.x, y: BIG.y - rk * fpt.y, k: rk };
  const cv = pull > 0 ? cp : cam0, inv = Math.pow(cv.k, -0.6);   // strokes thin a little when close, so they stay elegant
  curveG.setAttribute('transform', `translate(${cv.x.toFixed(2)} ${cv.y.toFixed(2)}) scale(${cv.k.toFixed(4)})`);
  curveP.setAttribute('stroke-width', (8 * inv).toFixed(2));
  curveP.style.strokeDasharray = curveHalo.style.strokeDasharray = `${CLEN.toFixed(1)} ${CLEN.toFixed(1)}`; curveP.style.strokeDashoffset = curveHalo.style.strokeDashoffset = (CLEN - (st.ride >= 1 ? CLEN : rp.len)).toFixed(1);
  curveHalo.style.opacity = 0;
  { const GB = 340, gi = OUT(ramp(f, 14, 24)), go = 1 - MOVE(ramp(f, 110, 16));   // the glass holds through the pull back and fades as the build gets going   // local half-size around the curve (image px)
    const gx = cv.x - GB * cv.k, gy = cv.y - GB * cv.k, gw = 2 * GB * cv.k, show = gi * go > 0.001;
    refrG.style.display = 'none';   // the DOM glass is off: the WebGL glass draws the panel
    glassNow = { rect: { x: gx, y: gy, w: gw, h: gw, r: 64 * cv.k }, opacity: show ? gi * go : 0 };   // drawn after the frame's other updates (below)
    [['x', gx], ['y', gy], ['width', gw], ['height', gw]].forEach(([a, v]) => { refrMap.setAttribute(a, v.toFixed(1)); refrClipR.setAttribute(a, v.toFixed(1)); });
    refrClipR.setAttribute('rx', (64 * cv.k).toFixed(1)); refrDisp.setAttribute('scale', (95 * cv.k).toFixed(1)); refrSoft.setAttribute('stdDeviation', (3 * cv.k).toFixed(2));
    for (const glass of glassParts) Object.assign(glass.style, { left: `${(cv.x - GB * cv.k).toFixed(1)}px`, top: `${(cv.y - GB * cv.k).toFixed(1)}px`, width: `${(2 * GB * cv.k).toFixed(1)}px`, height: `${(2 * GB * cv.k).toFixed(1)}px`,
      borderRadius: `${(64 * cv.k).toFixed(1)}px`, opacity: (gi * go).toFixed(3), display: 'none' }); } curveHalo.setAttribute('stroke-width', (100 * Math.pow(cv.k, -0.3)).toFixed(1));   // a gentle clearing, not a band   // drawn by the rider
  const riding = st.ride > 0 && st.b < 1, rOut = 1 - ramp(st.b, 0, 0.6);
  rider.setAttribute('cx', rp.x.toFixed(1)); rider.setAttribute('cy', rp.y.toFixed(1)); rider.setAttribute('r', (riding ? 15 * inv * rOut : 0).toFixed(2)); rider.setAttribute('stroke-width', (5 * inv).toFixed(2));
  riderTrail.forEach((c, i) => { const q = atTime(st.ride - (i + 1) * 0.022); c.setAttribute('cx', q.x.toFixed(1)); c.setAttribute('cy', q.y.toFixed(1));
    c.setAttribute('r', (riding && st.ride - (i + 1) * 0.022 > 0 ? 11 * inv * (1 - i / 7) * rOut : 0).toFixed(2)); c.style.opacity = (0.32 * (1 - i / 6)).toFixed(3); });
  // the names: rows slide in from alternate sides and keep drifting, then slide on out and fade as the card starts to form
  const nOut = MOVE(ramp(f, 86, 14));
  names.forEach((n) => {
    if (!n.laid) {   // lay the names out along the row from their measured widths (fonts are loaded before any frame renders)
      const GAP = 120, ws = n.items.map((it) => it.t.getComputedTextLength() + (it.t.getAttribute('font-style') ? 12 : 0)), total = ws.reduce((a, b) => a + b + GAP, 0);
      let x = n.dir > 0 ? -900 : 2820 - total;
      n.items.forEach((it, k) => { it.t.setAttribute('x', x.toFixed(1)); it.dot.setAttribute('x', (x + ws[k] + GAP / 2).toFixed(1)); it.cx = x + (ws[k] + GAP) / 2; x += ws[k] + GAP; }); n.laid = true; }
    const v = NAMEIN(ramp(f, 18 + n.at, 30)), x = n.dir * (-480 * (1 - v) + 0.9 * Math.max(0, f - 22));   // a long, gentle slide in, then a slow drift
    n.g.style.opacity = v.toFixed(3); n.g.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
    // the exit: as the card (the solution) starts to form, the doubts clear: name by name, radiating out from the centre,
    // each flashing bright then fading where it stands
    n.items.forEach((it) => { const d = Math.hypot(it.cx + x - 960, n.y - 40 - 540), t0 = SKEL.at - 2 + d / 60, fl = ramp(f, t0, 3), fo = ramp(f, t0 + 3, 9);
      const glow = 0.55 * fl * (1 - fo), col = `rgb(${[163, 201, 192].map((c) => Math.round(c + (255 - c) * glow)).join(',')})`;   // a soft flash, not full white
      it.t.setAttribute('fill', col); it.dot.setAttribute('fill', col); it.ig.style.opacity = (1 - WORDOUT(fo)).toFixed(3);
      // a brighter flash (a white glow round the word at its peak), then it blurs as it fades
      it.ig.style.filter = fl > 0 && fo < 1 ? `drop-shadow(0 0 ${(14 * glow).toFixed(1)}px rgba(255,255,255,${(0.6 * glow).toFixed(2)})) blur(${(14 * fo).toFixed(1)}px)` : ''; });
  });
  namesG.style.display = OPENING === 'names' && f < 132 ? '' : 'none';
  bubblesG.style.display = OPENING === 'bubbles' && f < 104 ? '' : 'none';
  { // the bubbles live in the scene: they ride the opening camera (and the pull to the card) with a little parallax
    const Zb = pull > 0 ? cp.k : cam0.k, kb = Math.pow(Zb, 0.6), ob = { x: 0.6 * ((pull > 0 ? cp.x : cam0.x) - BIG.x), y: 0.6 * ((pull > 0 ? cp.y : cam0.y) - BIG.y) };
    bubblesG.setAttribute('transform', `translate(${(960 + ob.x).toFixed(2)} ${(540 + ob.y).toFixed(2)}) scale(${kb.toFixed(4)}) translate(-960 -540)`);
    namesG.setAttribute('transform', bubblesG.getAttribute('transform')); }   // the names ride the camera the same way
  if (OPENING === 'bubbles') bubbles.forEach((b) => {
    const v = ramp(f, b.at, 12), k = OVER(v), out = MOVE(ramp(f, 84 + Math.abs(b.y - 570) / 40, 14));   // pop in from the tail   // pop in from the avatar; clear outwards as the card starts to form
    b.g.style.opacity = (clamp(v * 3) * (1 - out)).toFixed(3);
    b.g.setAttribute('transform', `translate(${(b.side * 260 * out).toFixed(1)} 0) translate(${b.ax} ${b.y}) scale(${Math.max(0, k).toFixed(4)}) translate(${-b.ax} ${-b.y})`); });
  const SLOWIO = bezier(0.55, 0, 0.35, 1), SCANPAN = bezier(0.45, 0, 0.2, 1);
  // ---- the scan camera: as the scan line travels down the card, push in toward it and follow it, then pull back out (as the
  // card holds, before the flip); applied to the card (3D layer) and the build/curve/panels layer
  const scw = SLOWIO(ramp(f, SCAN.at - 26, 34)) * (1 - SLOWIO(ramp(f, SCAN.at + SCAN.dur - 6, 34)));   // slow in, a gentle follow, slow out
  const scz = 1 + 0.4 * scw, scLine = 540 - CH3 * HK / 2 + SCANPAN(ramp(f, SCAN.at, SCAN.dur)) * CH3 * HK;   // the camera's own path down the card, top to bottom: starts slow, settles gently
  const scF = { x: 960, y: lerp(540, scLine, 0.6) }, scTo = { x: 960, y: lerp(scF.y, 540, scw) };   // a soft follow: the frame leans toward the line, never chases it
  const scT = scw > 0.0005 ? `translate(${(scTo.x - scz * scF.x).toFixed(2)}px, ${(scTo.y - scz * scF.y).toFixed(2)}px) scale(${scz.toFixed(4)})` : '';
  // a slow, continuous dolly in from the moment the spread settles, through the gather, the plugin builds and comes to the centre, so the camera is never
  // parked; it hands over to the pull back into Figma (deck, overlays and Figma take it; the ground with parallax)
  const dk = (1 + 0.07 * SLOWIO(ramp(f, FLIP.at2 + FLIP.d2 - 4, 94)) * (1 - MOVE(ramp(f, FIG.at, FIG.zoom)))) * Math.exp(driftLog(f));
  const dT = Math.abs(dk - 1) > 0.0005 ? `translate(${(960 * (1 - dk)).toFixed(2)}px, ${(540 * (1 - dk)).toFixed(2)}px) scale(${dk.toFixed(4)}) ` : '';
  deckEl.style.transformOrigin = top.style.transformOrigin = '0 0'; deckEl.style.transform = top.style.transform = (dT + scT).trim();
  // ---- the ground moves with the camera: one continuous camera zoom through the film (the opening's pull-back, the curve
  // shrinking into the card, the card settling back, the plugin push-in, the pull-back into Figma, the focus zoom), taken
  // with parallax (power 0.5: the ground is further back, so it moves less), normalised so the grid is its own size in
  // the cards section; pans follow the opening and Figma cameras the same way
  { const settle = lerp(HK, SETTLED, FLIPE2(ramp(f, FLIP.at2, FLIP.d2))) / HK;
    const pcam = pushCam(f), Z = (pull > 0 ? cp.k : cam0.k) * settle * (camZ / FZ0) * scz * pcam.k * dk, k = Math.pow(Z / (ALIGN.k * SETTLED / HK), 0.5);
    const scPan = scw > 0.0005 ? scTo.y - scz * scF.y - (1 - scz) * 540 : 0;   // the scan camera's pan (relative to a zoom about the centre)
    const off = { x: 0.5 * (cam0.x - BIG.x + camQ.x - FQ0.x), y: 0.5 * (cam0.y - BIG.y + camQ.y - FQ0.y + pcam.dy + pcam.ry + scPan) };
    { const g = (MOVE(ramp(f, GRIDIN.at, GRIDIN.dur)) * (1 - MOVE(ramp(f, EXIT.at + 10, EXIT.dur)))).toFixed(3); gridLines.forEach((r) => r.setAttribute('opacity', g)); }   // no grid while the names run: it comes in as they go
    gridPat.setAttribute('patternTransform', `translate(${(960 * (1 - k) + off.x).toFixed(2)} ${(540 * (1 - k) + off.y).toFixed(2)}) scale(${k.toFixed(4)})`); }
  skel.setAttribute('transform', `translate(${cp.x.toFixed(2)} ${cp.y.toFixed(2)}) scale(${cp.k.toFixed(4)}) translate(${-BOXC.x} ${-BOXC.y})`);   // rides the curve
  ends.forEach((g, i) => { const p = i ? B : A, t = i ? st.b : st.a, v = OVER(t); g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${(Math.max(0, v) * inv).toFixed(3)})`);
    const pr = ramp(t, 0.2, 0.8); pulses[i].setAttribute('r', lerp(23, 70, pr).toFixed(1)); pulses[i].style.opacity = (t > 0.2 && t < 1 ? 0.6 * (1 - pr) : 0).toFixed(3); });
  const q = MOVE(st.p1), p1 = { x: lerp(P1S.x, P1F.x, q), y: lerp(P1S.y, P1F.y, q) }, p2 = { x: lerp(P2S.x, P2F.x, q), y: lerp(P2S.y, P2F.y, q) };
  curveP.setAttribute('d', `M${A.x},${A.y} C${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${B.x},${B.y}`);
  curveHalo.setAttribute('d', curveP.getAttribute('d'));
  curveP.style.opacity = f >= 4 ? 1 : 0;
  const hs = MOVE(st.hand), kr = OUT(ramp(st.hand, 0, 0.35));   // the line draws out from its end point; its knob rides the tip
  [[A, p1], [B, p2]].forEach(([e, h], i) => { const l = hLines[i];
    l.setAttribute('x1', e.x); l.setAttribute('y1', e.y); l.setAttribute('x2', lerp(e.x, h.x, clamp(hs)).toFixed(1)); l.setAttribute('y2', lerp(e.y, h.y, clamp(hs)).toFixed(1)); l.style.opacity = st.hand > 0 ? 1 : 0;
    knobs[i].setAttribute('cx', lerp(e.x, h.x, hs).toFixed(1)); knobs[i].setAttribute('cy', lerp(e.y, h.y, hs).toFixed(1)); knobs[i].setAttribute('r', (14 * kr).toFixed(2));
    knobs[i].style.opacity = st.hand > 0 ? 1 : 0; });

  // ---- the build (only the part below the scan is left); none of it exists outside its own frames
  const live = f >= SKEL.at - 2 && f < SCAN.at + SCAN.dur + 7;
  skel.style.display = live ? '' : 'none';
  panels.style.display = SHOW_PANELS && live ? '' : 'none';
  const sy = scanY(f), scanning = f >= SCAN.at && f < SCAN.at + SCAN.dur, fi = Math.floor(f);
  if (live) {
    skelClipR.setAttribute('y', (f >= SCAN.at ? sy - 160 : -1000).toFixed(1));   // keeps a trail above the line
    const outFade = 1 - ramp(f, SCAN.at, 8);   // the lattice past the card's edges leaves as the scan starts
    for (const d of DOTS) {
      const v = ramp(f, d.t, 4);
      let r = 0, op = d.op;
      if (v > 0) {
        r = d.r * Math.max(0, OVER(v));
        if (v < 1 && d.kind === 'part') { r *= 1.35; op = 0.95; }                                        // the writing head
        if (d.flick && f > d.t + 4 && (fi + d.phase) % d.period < 2) { r *= 1.55; op = 0.8; }           // processing
        if (d.drop && v >= 1 && (fi + d.dropPhase) % 37 === 0) r = 0;                                    // a dot drops out for a frame
        if (d.outside) op *= outFade;
        if (scanning) { const near = clamp(1 - (d.y - sy) / 140); r *= 1 + 0.5 * near; op = lerp(op, 0.95, near); }   // read by the scan
      }
      const tr = f >= SCAN.at && v > 0 ? trail(d.y, sy, 160, r, op * (1 - ramp(f, SCAN.at + SCAN.dur, 6))) : null;
      if (tr) paint(d, ...tr); else paint(d, r, op, d.col || C.ink);
    }
    // the selection bracket: jumps to the part being placed
    let cur = 0; PARTS.forEach((pt, i) => { if (f >= SKEL.at + BK * pt.at) cur = i; });
    const prev = PARTS[Math.max(0, cur - 1)], now = PARTS[cur], jv = MOVE(ramp(f, SKEL.at + BK * now.at, 5));
    const bx = lerp(prev.box[0], now.box[0], jv) - 14, by = lerp(prev.box[1], now.box[1], jv) - 14, bw = lerp(prev.box[2], now.box[2], jv) + 28, bh = lerp(prev.box[3], now.box[3], jv) + 28, L = 22;
    [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, sx, sy2], i) => brCorners[i].setAttribute('d', `M${x + sx * L},${y} H${x} V${y + sy2 * L}`));
    brG.style.opacity = (ramp(f, SKEL.at + 1, 3) * (1 - ramp(f, SKEL.at + BK * 22, 6))).toFixed(3);
    brLabel.setAttribute('x', bx.toFixed(1)); brLabel.setAttribute('y', (by - 12).toFixed(1));
    setText(brLabel, `${now.type.toUpperCase()} ${cpx(now.box[2])}×${cpx(now.box[3])}`);
    brPos.setAttribute('x', (bx + 4).toFixed(1)); brPos.setAttribute('y', (by + bh + 30).toFixed(1));
    setText(brPos, `${String(cpx(now.box[0])).padStart(3, '0')} · ${String(cpx(now.box[1])).padStart(3, '0')}`);
    // guides, handles and the size/time readout; they leave as the scan finishes
    const gIn = ramp(f, SKEL.at + BK * 6, 10), gOut = 1 - ramp(f, SCAN.at + SCAN.dur - 6, 6);
    guides.forEach((g, i) => g.setAttribute('opacity', (0.34 * ramp(f, SKEL.at + BK * (6 + i * 2), 10) * gOut).toFixed(3)));
    handles.forEach((h, i) => h.setAttribute('opacity', (0.8 * OVER(ramp(f, SKEL.at + BK * (12 + i), 8)) * gOut).toFixed(3)));
    readout.style.opacity = (0.7 * gIn * gOut).toFixed(3);
    setText(readout, `420 × 622  t+${Math.max(0, (Math.min(f, SCAN.at + SCAN.dur) - SKEL.at) / s.fps).toFixed(2)}s`);
    // the panels: AGENT.LOG counts the parts, MOTION.CSS types this card's tokens
    panels.style.opacity = (ramp(f, PANEL.in, 6) * (1 - ramp(f, SCAN.at + 12, 10))).toFixed(3);
    const placed = PARTS.filter((pt) => f >= SKEL.at + BK * pt.at).length;
    setText(logHead, `AGENT.LOG // PARTS ${String(placed).padStart(2, '0')}/${PARTS.length}`);
    PARTS.forEach((pt, i) => {
      const prog = ramp(f, SKEL.at + BK * pt.at, 9), n = Math.round(prog * 6), [x, y, w, h] = pt.box;
      setText(logRows[i], f < SKEL.at + BK * pt.at ? '' : `${pt.type.padStart(5)}  ${String(cpx(x)).padStart(3, '0')},${String(cpx(y)).padStart(3, '0')}  ${`${cpx(w)}×${cpx(h)}`.padEnd(7)} [${'#'.repeat(n)}${'.'.repeat(6 - n)}]`);
      logRows[i].setAttribute('fill-opacity', prog >= 1 ? 0.55 : 0.9);
    });
    let left = Math.max(0, Math.floor((f - PANEL.type) * PANEL.cps)), lines = 0, cx = 1290, cy = 206;
    CSS_LINES.forEach(([a, b], i) => {
      const ta = a.slice(0, Math.max(0, left)); left -= a.length; const tb = b.slice(0, Math.max(0, left)); left -= b.length;
      setText(cssRows[i].a, ta); setText(cssRows[i].b, tb);
      if (ta.length) { lines = i + 1; cx = 1290 + (ta.length + tb.length) * 9.93; cy = 206 + i * 25; }
    });
    setText(cssHead, `MOTION.CSS // 01 RECIPE  ${Math.min(4, Math.max(0, lines - 2))} TOKENS`);
    caret.setAttribute('x', cx.toFixed(1)); caret.setAttribute('y', (cy - 13).toFixed(1)); caret.style.opacity = fi % 10 < 6 ? 0.8 : 0;
    setText(status, `${180 + ((fi * 37) % 64)} TOK/S · ${lines} LN · ${f < SCAN.at ? 'GENERATING' : 'APPLYING'}`);
  }
  // ---- the scan bar and what it reveals
  scanG.style.opacity = scanning ? clamp(Math.min((f - SCAN.at) / 2, (SCAN.at + SCAN.dur - f) / 2)).toFixed(3) : 0;
  scanBand.setAttribute('y', (sy - 1).toFixed(1)); scanCore.setAttribute('y', (sy - 3).toFixed(1));
  scanKnobs.forEach((k) => k.setAttribute('transform', `translate(0 ${sy.toFixed(1)})`));
  curveClipR.setAttribute('y', (sy - BOXC.y).toFixed(1));   // the drawn curve, only below the scan (the clip is in the curve's own units)
  const wipeH = clamp(sy / 1350) * CH3, botR = Math.min(30, Math.max(0, wipeH - (CH3 - 30)));
  heroWipe.style.height = `${wipeH.toFixed(2)}px`;
  { const on = f >= SCAN.at && f < SCAN.at + SCAN.dur + 10, fade = 1 - ramp(f, SCAN.at + SCAN.dur - 4, 12), T = 260;   // band height (card px)
    scanGlow.style.display = on ? '' : 'none';
    if (on) { const stops = Array.from({ length: 13 }, (_, i) => { const u = i / 12, a = fade * Math.pow(u, 2.2);   // smooth: eases in from nothing to full at the line
        return `rgba(0,0,0,${a.toFixed(3)}) ${(wipeH - T + u * T).toFixed(1)}px`; }).join(', ');
      scanGlow.style.webkitMaskImage = scanGlow.style.maskImage = `linear-gradient(180deg, rgba(0,0,0,0) 0px, ${stops}, rgba(0,0,0,0) ${(wipeH + 1).toFixed(1)}px)`; } }
  Object.assign(heroShadow.style, { height: `${wipeH.toFixed(2)}px`, borderRadius: `30px 30px ${botR.toFixed(1)}px ${botR.toFixed(1)}px`, opacity: clamp(wipeH / 30).toFixed(3),
    clipPath: wipeH < CH3 - 0.5 ? 'inset(-40px -40px 0 -40px)' : 'none' });   // no shadow under the scanning edge
  { const lt = ramp(f, FLIP.shine.at, FLIP.shine.dur), on = lt > 0 && lt < 1, x = lerp(-62, 162, lt);   // the light enters from beyond the left edge and leaves past the right one, at a constant, unhurried pace
    const env = Math.sin(Math.PI * clamp(lt)) ** 0.6;   // only the faint all-round frame glow swells in and out
    const soft = (k) => (0.5 + 0.5 * Math.cos(Math.PI * k)) ** 1.5;   // a broad, soft falloff: no bright core, no hard edge
    const stops = (w, col) => Array.from({ length: 25 }, (_, i) => { const k = -1 + i / 12; return `${col(k, soft(k))} ${(x + k * w).toFixed(1)}%`; }).join(', ');
    const white = (a) => (k, v) => `rgba(255,255,255,${(a * v).toFixed(3)})`;
    const tint = (a) => (k, v) => { const c = k < 0 ? [lerp(255, 150, -k), lerp(255, 236, -k), lerp(255, 245, -k)] : [lerp(255, 246, k), lerp(255, 238, k), lerp(255, 170, k)];   // cyan leading, warm yellow trailing
      return `rgba(${c.map(Math.round).join(',')},${(a * v).toFixed(3)})`; };
    sheen.style.webkitMaskImage = sheen.style.maskImage = `linear-gradient(105deg, ${stops(34, white(0.85))})`;
    sweepBody.style.background = `linear-gradient(105deg, ${stops(50, tint(0.12))})`;
    sweepEdge.style.background = `linear-gradient(105deg, ${stops(40, tint(0.6))}), rgba(255,255,255,${(0.12 * env).toFixed(3)})`;   // the frame glows a touch all round, more where the light is
    sheen.style.opacity = sweepBody.style.opacity = sweepEdge.style.opacity = on ? 1 : 0;
    // the sparkle: where the light's centre crosses it (its position along the 105° gradient line, in %)
    const gp = 50 + 100 * ((GLINT.x - 210) * 0.966 + (GLINT.y - 310.85) * 0.259) / 566.7;
    const fc = FLIP.shine.at + FLIP.shine.dur * (gp + 62) / 224, gv = Math.exp(-(((f - fc) / 9) ** 2));   // the sparkle: centred on the frame the light crosses it, but a slow, lingering twinkle (~1 s)
    glint.style.opacity = (gv > 0.01 ? gv : 0).toFixed(3); glint.style.transform = `translate(-50%, -50%) scale(${(0.3 + 0.65 * gv).toFixed(3)}) rotate(${lerp(-30, 30, clamp((f - fc + 18) / 36)).toFixed(1)}deg)`; }
  const solid = ramp(f, SCAN.at + SCAN.dur - 2, 4);   // the rim and the back only exist once the card is whole
  [...hero.slabs, hero.bk.f].forEach((d) => (d.style.opacity = solid.toFixed(3)));
  heroGeneric.style.display = f < FLIP.at2 ? '' : 'none';   // swapped while the back faces us
  const hp = heroPose(f);
  { // while the scan is revealing it, the edge stops at the scan line (no black band under the line)
    const scanEdge = f >= SCAN.at && f < SCAN.at + SCAN.dur && wipeH < CH3 - 0.5, line = hp.y - (CH3 / 2) * hp.s + wipeH * hp.s;   // the card scales about its centre
    hero.wrap.style.clipPath = scanEdge ? `inset(-200px -200px ${(1080 - line).toFixed(1)}px -200px)` : ''; }
  const g = st.gather, pours = (i) => MOVE(ramp(f, PG.at + i * PG.step, PG.dur));
  const toStack = (p, behind) => ({ x: lerp(p.x, STACK.x + st.dx, g), y: lerp(p.y, STACK.y + behind * 4, g), z: lerp(p.z, -behind * 6, g), rx: lerp(p.rx, 0, g), ry: lerp(nrm(p.ry), 0, g), rz: lerp(p.rz, -behind * 1.5, g), s: lerp(p.s, STACK.s, g) });
  // each card goes into its own place in the list (the pair of rows it becomes): the first highest, the next just below…
  const into = (k) => figToStage(panelToFig({ x: 1445, y: Math.min(770, (rowY(2 * k) + rowY(2 * k + 1)) / 2 - 10) }));
  const toPlugin = (p, t, k) => { const q = into(k); return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), z: p.z, rx: p.rx, ry: p.ry, rz: lerp(p.rz, 0, t), s: lerp(p.s, 0.05, t) }; };
  place(hero, toPlugin(toStack(hp, 0), pours(0), 0), (f >= SCAN.at ? 1 : 0) * (1 - ramp(pours(0), 0.6, 0.4)));
  others.forEach((o, i) => {
    const { p, fade, dim } = otherPose(o, f, hp);
    o.el.style.filter = dim > 0.01 ? `brightness(${(1 - 0.14 * dim * (1 - st.gather)).toFixed(3)})` : 'none';
    place(o, toPlugin(toStack(p, o.rank * 0.6), pours(o.rank), o.rank), fade * (1 - ramp(pours(o.rank), 0.6, 0.4)));   // top of the stack first, then the next one down
  });

  // ---- Figma: the camera (zoomed in on the plugin → the whole window), the plugin, the build, the drag, the flow
  // (camZ, camQ are computed at the top of the hook)
  const exitX = -2400 * EXITE(ramp(f, EXIT.at, EXIT.dur));
  figCam.setAttribute('transform', `${exitX ? `translate(${exitX.toFixed(1)} 0) ` : ''}${Math.abs(dk - 1) > 0.0005 ? `translate(${(960 * (1 - dk)).toFixed(2)} ${(540 * (1 - dk)).toFixed(2)}) scale(${dk.toFixed(4)}) ` : ''}translate(${camQ.x.toFixed(2)} ${camQ.y.toFixed(2)}) scale(${camZ.toFixed(4)}) translate(${-PC.x} ${-PC.y})`);
  figCam.style.display = f >= PB.at - 1 ? '' : 'none';
  // the plugin's construction: skeleton dots, bracket, scan
  const psy = lerp(205, 875, bezier(0.3, 0, 0.7, 1)(ramp(f, PB.scanAt, PB.scan))), pScanning = f >= PB.scanAt && f < PB.scanAt + PB.scan;
  pClipR.setAttribute('height', (f >= PB.scanAt + PB.scan ? 1000 : f >= PB.scanAt ? Math.max(0, psy - 100) : 0).toFixed(1));
  pSkelClipR.setAttribute('y', (f >= PB.scanAt ? psy - 90 : 100).toFixed(1));
  const pLive = f >= PB.at && f < PB.scanAt + PB.scan + 7;
  pSkel.style.display = pGuideG.style.display = pLive ? '' : 'none';
  if (pLive) {
    const pOutFade = 1 - ramp(f, PB.scanAt, 6);   // the lattice past the panel's edges leaves as the scan starts
    for (const d of PDOTS) {
      const v = ramp(f, d.t, 3); let r = 0, op = d.op;
      if (v > 0) {
        r = d.r * Math.max(0, OVER(v));
        if (v < 1 && d.kind !== 'lattice') { r *= 1.4; op = 0.95; }                                      // the writing head
        if (d.flick && f > d.t + 3 && (fi + d.phase) % d.period < 2) { r *= 1.55; op = 0.8; }           // processing
        if (d.drop && v >= 1 && (fi + d.dropPhase) % 37 === 0) r = 0;                                    // a dot drops out for a frame
        if (d.outside) op *= pOutFade;
        if (pScanning) { const near = clamp(1 - (d.y - psy) / 84); r *= 1 + 0.5 * near; op = lerp(op, 0.95, near); }   // read by the scan
      }
      const tr = f >= PB.scanAt && v > 0 ? trail(d.y, psy, 96, r, op * (1 - ramp(f, PB.scanAt + PB.scan, 6))) : null; if (tr) paint(d, ...tr); else paint(d, r, op, C.ink);
    }
    const pgIn = ramp(f, PB.at + 2, 6), pgOut = 1 - ramp(f, PB.scanAt + PB.scan - 4, 6);   // guides, handles and readout; they leave as the scan finishes
    pGuides.forEach((g, i) => g.setAttribute('opacity', (0.5 * ramp(f, PB.at + 2 + i, 6) * pgOut).toFixed(3)));
    pHandles.forEach((h, i) => h.setAttribute('opacity', (0.8 * OVER(ramp(f, PB.at + 6 + i, 5)) * pgOut).toFixed(3)));
    pReadout.style.opacity = (0.7 * pgIn * pgOut).toFixed(3);
    setText(pReadout, `${PBOX.w} × ${PBOX.h}  t+${Math.max(0, (Math.min(f, PB.scanAt + PB.scan) - PB.at) / s.fps).toFixed(2)}s`);
    let pi = 0; PPARTS.forEach((pt, i) => { if (f >= PB.at + pt.at) pi = i; });
    const pv = PPARTS[Math.max(0, pi - 1)], nw = PPARTS[pi], jv = MOVE(ramp(f, PB.at + nw.at, 3)), M = 14;
    const bx = lerp(pv.box[0], nw.box[0], jv) - M, by = lerp(pv.box[1], nw.box[1], jv) - M, bw = lerp(pv.box[2], nw.box[2], jv) + 2 * M, bh = lerp(pv.box[3], nw.box[3], jv) + 2 * M, LL = 22;
    [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, sx, sy2], i) => pBrC[i].setAttribute('d', `M${x + sx * LL},${y} H${x} V${y + sy2 * LL}`));
    pBr.style.opacity = (ramp(f, PB.at + 1, 3) * (1 - ramp(f, PB.scanAt, 3))).toFixed(3);
    pBrL.setAttribute('x', bx.toFixed(1)); pBrL.setAttribute('y', (by - 10).toFixed(1)); setText(pBrL, `${nw.type} ${nw.box[2]}×${nw.box[3]}`);
  }
  pScan.style.display = pScanning ? '' : 'none';
  pScan.setAttribute('transform', `translate(0 ${psy.toFixed(1)})`); pScan.style.opacity = clamp(Math.min((f - PB.scanAt) / 2, (PB.scanAt + PB.scan - f) / 2)).toFixed(3);
  listRows.forEach((r, i) => {   // the cards become the list: as each card goes in, its two rows carry on its rightward motion, overshoot a touch and settle
    const v = ramp(f, PG.at + Math.floor(i / 2) * PG.step + 10 + (i % 2) * 1.5, 13);
    r.style.opacity = clamp(v * 3).toFixed(3); r.setAttribute('transform', `translate(${(-56 * (1 - ROWE(v))).toFixed(1)} 0)`); });
  pickHi.style.opacity = st.hi.toFixed(3);
  const pw = OUT(st.pwin), pr = { x: lerp(1265, 1253, pw), y: lerp(215, 136, pw), w: lerp(420, 444, pw), h: lerp(650, 741, pw) };   // the window grows out from the panel
  Object.assign(pwinRect.style, { opacity: pw > 0 ? 1 : 0 }); pwinRect.setAttribute('x', pr.x.toFixed(1)); pwinRect.setAttribute('y', pr.y.toFixed(1)); pwinRect.setAttribute('width', pr.w.toFixed(1)); pwinRect.setAttribute('height', pr.h.toFixed(1)); pwinRect.setAttribute('rx', lerp(18, 16, pw).toFixed(1));
  { const K = 1.6, e = pwinShadow;   // plugin units (it is drawn at 0.62×)
    e.style.opacity = pw > 0 ? 1 : 0; e.setAttribute('x', (pr.x + 2 * K).toFixed(1)); e.setAttribute('y', (pr.y + 3 * K).toFixed(1));
    e.setAttribute('width', (pr.w + 6 * K).toFixed(1)); e.setAttribute('height', (pr.h + 6 * K).toFixed(1)); e.setAttribute('rx', (lerp(18, 16, pw) + 8.5 * K).toFixed(1)); }
  pwinTitle.style.opacity = ramp(st.pwin, 0.5, 0.5).toFixed(3);
  // the build: skeleton dots, bracket, scan
  const fsy = lerp(WIN.y - 10, WIN.y + WIN.h + 10, bezier(0.3, 0, 0.7, 1)(ramp(f, FIG.scanAt, FIG.scan))), fScanning = f >= FIG.scanAt && f < FIG.scanAt + FIG.scan;
  figClipR.setAttribute('height', Math.max(0, f >= FIG.scanAt ? fsy : 0).toFixed(1));
  figSkelClipR.setAttribute('y', (f >= FIG.scanAt ? fsy - 80 : 0).toFixed(1));
  const fLive = f >= FIG.at && f < FIG.scanAt + FIG.scan + 7, fi2 = Math.floor(f);
  figSkel.style.display = fLive ? '' : 'none';
  if (fLive) {
    for (const d of FDOTS) {
      const v = ramp(f, d.t, 3); let r = 0, op = d.op;
      if (v > 0) { r = d.r * Math.max(0, OVER(v)); if (v < 1) { r *= 1.4; op = 0.95; } if (fScanning) { const near = clamp(1 - (d.y - fsy) / 90); r *= 1 + 0.5 * near; op = lerp(op, 0.95, near); } }
      const tr = f >= FIG.scanAt && v > 0 ? trail(d.y, fsy, 80, r, op * (1 - ramp(f, FIG.scanAt + FIG.scan, 6))) : null; if (tr) paint(d, ...tr); else paint(d, r, op, C.ink);
    }
    let ci = 0; FPARTS.forEach((pt, i) => { if (f >= FIG.at + pt.at) ci = i; });
    const pv = FPARTS[Math.max(0, ci - 1)], nw = FPARTS[ci], jv = MOVE(ramp(f, FIG.at + nw.at, 3)), M = 10;
    const bx = lerp(pv.box[0], nw.box[0], jv) - M, by = lerp(pv.box[1], nw.box[1], jv) - M, bw = lerp(pv.box[2], nw.box[2], jv) + 2 * M, bh = lerp(pv.box[3], nw.box[3], jv) + 2 * M, LL = 16;
    [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(([x, y, sx, sy2], i) => fBrC[i].setAttribute('d', `M${x + sx * LL},${y} H${x} V${y + sy2 * LL}`));
    fBr.style.opacity = (ramp(f, FIG.at + 1, 3) * (1 - ramp(f, FIG.at + 18, 4))).toFixed(3);
    fBrL.setAttribute('x', bx.toFixed(1)); fBrL.setAttribute('y', (by - 8).toFixed(1)); setText(fBrL, `${nw.type} ${Math.round(nw.box[2])}×${Math.round(nw.box[3])}`);
  }
  fScan.style.display = fScanning ? '' : 'none';
  fScan.setAttribute('transform', `translate(0 ${fsy.toFixed(1)})`); fScan.style.opacity = clamp(Math.min((f - FIG.scanAt) / 2, (FIG.scanAt + FIG.scan - f) / 2)).toFixed(3);
  // the drag: the card forms under the cursor and stays held at the same point while it travels
  const dv = st.drag, dm = MOVE(dv), grow = OUT(ramp(dv, 0, 0.45));
  const curPt = { x: lerp(ROWPT.x, DROP_C.x + GRAB.x, dm), y: lerp(ROWPT.y, DROP_C.y + GRAB.y, dm) };
  // held, it's lifted a little (1.06); set down, it presses just under its size and settles back: dropped into place
  const ck = lerp(0.28, 1, grow), DEND = DRAG.at + DRAG.dur;
  const settle = f < DEND - 5 ? 1 + 0.06 * grow : f < DEND + 2 ? lerp(1.06, 0.955, MOVE(ramp(f, DEND - 5, 7))) : lerp(0.955, 1, SETTLE(ramp(f, DEND + 2, 12)));
  const tilt = -5 * Math.sin(Math.PI * dm);
  copy.style.display = f >= DRAG.at ? '' : 'none';
  copy.setAttribute('transform', `translate(${(curPt.x - GRAB.x * ck).toFixed(1)} ${(curPt.y - GRAB.y * ck).toFixed(1)}) rotate(${tilt.toFixed(2)}) scale(${(ck * settle).toFixed(4)})`);
  if (f >= DRAG.at && f < DRAG.at + DRAG.dur + 18) { const cs = figToStage(curPt); cur.x = cs.x; cur.y = cs.y; }   // the cursor is the one holding it
  placePlugin(pOff(f));
  if (f >= MV.in && f < DRAG.at) {   // in, onto the title bar, the move, then on to the easing it picks (figma coords → stage)
    const ap = MOVE(ramp(f, MV.in, MV.enter)), po = pOff(f), on = figToStage({ x: HOVPT.x + po.x, y: HOVPT.y + po.y }), start = { x: 1560, y: 820 };   // stage px
    let q = { x: lerp(start.x, on.x, ap), y: lerp(start.y, on.y, ap) };
    const pk = MOVE(ramp(f, PICK.at, PICK.move)), row = figToStage(ROWPT); if (pk > 0) q = { x: lerp(on.x, row.x, pk), y: lerp(on.y, row.y, pk) };
    cur.x = q.x; cur.y = q.y;
  }
  // the cursor's visibility and press are a pure function of the frame (no tweens), so it never depends on the order frames are rendered in
  cur.o = f < MV.in ? 0 : f < DRAG.at + DRAG.dur + 10 ? ramp(f, MV.in, 4) : 1 - ramp(f, DRAG.at + DRAG.dur + 10, 8);
  cur.press = ramp(f, PICK.at + PICK.press, 3) * (1 - ramp(f, DRAG.at + DRAG.dur, 3));
  if (f < MV.in) { cur.x = 1560; cur.y = 1000; }
  const hand = f >= MV.in + MV.enter - 5 && f < MV.release + 4 ? (f >= MV.grab && f < MV.release ? 2 : 1) : 0;   // arrow → open hand → grabbing → open → arrow
  curArrow.style.display = hand ? 'none' : ''; curOpen.style.display = hand === 1 ? '' : 'none'; curClosed.style.display = hand === 2 ? '' : 'none';
  const dropped = ramp(f, DRAG.at + DRAG.dur, 3);
  // once the card is dropped, Figma's chrome (tabs, tools, both side panels) and the plugin clear away: only the canvas
  // and the flow are left, which is all that matters from here
  { const clear = MOVE(ramp(f, DRAG.at + DRAG.dur + 2, 16)); chrome.style.opacity = (1 - clear).toFixed(3); plugin.style.opacity = (1 - clear).toFixed(3); }
  sel.style.display = 'none';   // no selection box on the dropped card: the drop itself says it's placed
  newLayer.style.opacity = dropped.toFixed(3); layerRows.setAttribute("transform", `translate(0 ${(38 * OUT(dropped)).toFixed(1)})`);
  // the flow runs: Home → (link) → Toast, whose toast slides up on the card's easing → (link) → Done
  const run = (a, d) => ramp(f, rt(a), rt(a + d) - rt(a)), TOASTE = bezier(0.1, 0.1, 0.1, 1), PAGEE = bezier(0.6, 0, 0.2, 1);
  scrG[0].hi.setAttribute('opacity', (run(0, 4) * (1 - run(10, 4))).toFixed(3));
  [[noodles[0], 4], [noodles[1], DOT2]].forEach(([nd, a]) => { const v = run(a, 10); nd.dot.setAttribute('cx', lerp(nd.x1, nd.x2, MOVE(v)).toFixed(1)); nd.dot.setAttribute('opacity', (v > 0 && v < 1 ? 1 : 0)); });
  scrG[1].hi.setAttribute('opacity', (run(13, 4) * (1 - run(30, 4))).toFixed(3));
  const tv = TOASTE(ramp(f, rt(18), 7 * RUN.k)), tOut = 0;   // not there until the dot has reached Sending and the camera is on it; then at its own pace   // shown in the design; the prototype replays it
  toast.spin.setAttribute('transform', `rotate(${(f * 14) % 360} 0 ${SHEET_Y + 52})`);   // a pure function of the frame
  toast.sheet.setAttribute('transform', `translate(0 ${((170 - SHEET_Y + 4) * (1 - tv)).toFixed(1)})`); toast.scrim.setAttribute('opacity', (0.32 * SCRIM(ramp(f, rt(18) - 3, 7 * RUN.k + 6))).toFixed(3));   // the dim fades in smoothly over the sheet's rise (its own gentle curve, not the sheet's snappy one)
  toast.wrap.style.display = tv > 0 ? '' : 'none';
  const pv = f < RUN.at ? 1 : PAGEE(run(68, 14)); page.setAttribute('transform', `translate(${(176 * (1 - pv)).toFixed(1)} 0)`);   // Details slides in from the right on card 2's easing
  const pop2 = OVER(ramp(f, POP2, 16));
  copy2.style.display = f >= POP2 ? '' : 'none'; copy2.style.opacity = clamp(ramp(f, POP2, 4)).toFixed(3);
  copy2.setAttribute('transform', `translate(${DROP_C2.x} ${DROP_C2.y}) scale(${Math.max(0, pop2).toFixed(4)})`);
  // the marker on each card's header while the camera reads it: card 1 after its pan up, card 2 once the camera is on it
  [[headMark, HEAD.at + HEAD.glint, HEAD.shine], [headMark2, rt(42) - 4, rt(54) - rt(42)]].forEach(([marks, at, hold]) => marks.forEach((m, i) => {
    if (!m.bb?.w) { const b = m.t.getBBox();   // (0 while its card is hidden: measured once it shows)
      m.bb = { x: b.x - 5, y: b.y - 1, w: b.width + 10, h: b.height + 2 }; m.r.setAttribute('y', m.bb.y.toFixed(1)); m.r.setAttribute('height', m.bb.h.toFixed(1)); }
    const pin = MOVE(ramp(f, at + i * 7, 13)), pout = MOVE(ramp(f, at + hold - 8 + i * 5, 13)), on = pin * (1 - pout);
    m.r.setAttribute('x', (m.bb.x + m.bb.w * pout).toFixed(1)); m.r.setAttribute('width', Math.max(0, m.bb.w * (pin - pout)).toFixed(1));
    m.t.setAttribute('fill', on > 0.5 ? '#fff' : m.base);
  }));
  if (f >= RUN.at) copy.setAttribute('transform', `translate(${DROP_C.x} ${DROP_C.y})`);   // placed: it stays put (no pulse) while the toast plays
  scrG[2].hi.setAttribute('opacity', run(64, 4).toFixed(3));
  const tk = f < RUN.at ? 1 : OVER(run(81, 8)); tick.setAttribute('transform', `translate(0 ${TICK_Y}) scale(${Math.max(0, tk).toFixed(3)}) translate(0 ${-TICK_Y})`);

  // ---- cursor
  const ch = cur;
  cursor.setAttribute('transform', `translate(${ch.x.toFixed(1)} ${ch.y.toFixed(1)}) scale(${(1.3 * (1 + 0.45 * fz) * (1 - 0.12 * cur.press)).toFixed(3)})`);   // grows a little with the focus zoom
  cursor.style.opacity = cur.o.toFixed(3);
});

await Promise.all([...document.querySelectorAll('#deck3d img')].map((im) => im.decode().catch(() => {})));
await Promise.all(['500', '600', '700', '900', 'italic 500', 'italic 600', 'italic 700', 'italic 900'].map((w) => document.fonts.load(`${w} 32px InterLocal`)));

await Promise.all(['500', '600', '700'].map((w) => document.fonts.load(`${w} 32px InterLocal`, '₹')));   // the rupee sign's own file
s.ready({ tail: 14 });   // a beat of the plain ground, then it loops
