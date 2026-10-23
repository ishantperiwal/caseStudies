// IPL Themification · animatic · 1920x1200 (16:10) · 25 fps · seamless loop.
// Built on the "Thumbnail explainer" theme: the product carries the story, few words, one sticker outline.
//   1 Arrival   – the phone rises in with one full turn; the camera pushes in on the home screen's empty spotlight slot
//   2 The slot  – an IPL spotlight drops into the slot from the lens, then the carousel turns to #ScoreBigOn
//   3 Surfaces  – one flip per themed surface: the scanner (fours and sixes), payment success (ball tick → runs
//                 sheet), the Runs leaderboard (camera travels down to the ways to score)
//   4 Numbers   – the phone splits off; three cards stack: 1 run, 6 runs, 50 runs, each on the runs ladder
//   5 Reuse     – the phone comes back: the same slot turns Navratri, the same scanner turns Diwali, then Christmas
//   6 Loop out  – the phone leaves, the camera returns to the opening view
import { gsap } from 'gsap';
import { studio } from '@studio/studio.js';
import { bezier } from '@studio/ease.js';
import { lottieKit } from '@studio/kits/lottie.js';
import { shotHud } from '@studio/kits/sketch.js';

const HUD = true;   // animatic overlay (shot name + action); set false for a clean preview

const s = await studio({ id: 'ipl-film', width: 1920, height: 1200, fps: 25 });
const $ = (q) => document.querySelector(q);

// chain fromTo's on one target without restating where it was
const S = (el, init) => {
  gsap.set(el, init);
  const cur = { ...init };
  return { el, cur, to(b, vars, x = {}) { const from = {}; for (const k in vars) from[k] = cur[k]; b.fromTo(el, from, vars, x); Object.assign(cur, vars); return b; } };
};

// ---------------------------------------------------------------- timing (frames)
const ARRIVE = { dur: 42, ease: [0.22, 0.6, 0.3, 1] };
const PUSH = [0.55, 0, 0.3, 1];
const FLIP = { dur: 54, ease: [0.62, 0, 0.22, 1] };
const LEAVE = [0.4, 0, 0.75, 0.55];
const T = {
  drop: 34, carousel: 84,
  flip1: 118, flip2: 192, flip3: 266, scroll: 300,
  out: 400, num0: 414, beat: 56,
  back: 590, navratri: 642, flip4: 672, xmas: 744, loop: 784,
};
// the frame inside a flip where the phone is edge-on (half a turn done): screens swap there, unseen
const half = (ease, dur) => { const f = bezier(...ease); let lo = 0, hi = 1; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; f(m) < 0.5 ? (lo = m) : (hi = m); } return Math.round(lo * dur); };
const SWAP = half(FLIP.ease, FLIP.dur);

// ---------------------------------------------------------------- camera rig (orthographic, rotated world)
const V0 = { rx: 30, rz: -20, ry: 12, s: 0.95, fx: 0, fy: 0, ty: 0 };     // opening view: angled three-quarter
const SHOW = { rx: 12, rz: -8, ry: 4, s: 1.25, fy: 0, ty: 0 };           // flatter, whole phone, for the surfaces
const BOARD = { s: 1.75, ty: 10 };                                        // closer, on the runs ladder
const CAM = { ...V0, __label: 'camera' };
const cam = S(CAM, { ...V0 });
const grid = $('#grid'), GRID_K = 1.45, GRID_DAMP = 0.65;
const worlds = [$('#world'), $('#world2'), $('#world3')];
s.onFrame(() => {
  const t = `scale(${CAM.s}) rotateX(${CAM.rx}deg) rotateZ(${CAM.rz}deg) rotateY(${CAM.ry}deg) translate3d(${-CAM.fx}px, ${-(CAM.fy + CAM.ty)}px, 0)`;
  worlds.forEach((w) => { w.style.transform = t; });
  grid.style.transform = `translateZ(-260px) scale(${GRID_K * Math.pow(CAM.s, -GRID_DAMP)})`;   // grid zooms slower than the camera
});
gsap.set('#grid', { opacity: 0.35 });

// ---------------------------------------------------------------- phone body (the theme's: extruded, flat light)
const SLABS = 26, DEPTH = 1.6, THICK = SLABS * DEPTH;
for (let k = 1; k <= SLABS; k++) { const el = document.createElement('div'); el.className = 'slab'; $('#slabs').appendChild(el); gsap.set(el, { z: -k * DEPTH }); }
gsap.set('#backplate', { z: -THICK - 0.5, rotationY: 180 });
{
  const R = 58, W = 384, H = 804;
  [['left', -0.2, R, THICK, H - 2 * R, { rotationY: -90 }], ['right', W - 0.8, R, THICK, H - 2 * R, { rotationY: 90 }],
   ['top', R, 0, W - 2 * R, THICK, { rotationX: 90 }], ['bottom', R, H, W - 2 * R, THICK, { rotationX: -90 }]].forEach(([side, x, y, w, h, rot]) => {
    const el = document.createElement('div');
    el.className = 'side-wall'; el.dataset.name = `Side wall – ${side}`;
    const vertical = side === 'left' || side === 'right';
    Object.assign(el.style, { left: `${vertical ? x - w / 2 : x}px`, top: `${vertical ? y : y - h / 2}px`, width: `${w}px`, height: `${h}px` });
    $('#slabs').after(el);
    gsap.set(el, { z: -THICK / 2, ...rot });
    if (side === 'left') [34, h - 34].forEach((at) => {
      const band = document.createElement('i'); band.className = 'antenna';
      Object.assign(band.style, { left: '0', right: '0', top: `${at - 3.5}px`, height: '7px' });
      el.appendChild(band);
    });
  });
}
const extrude = (parent, pts, h, z0 = 0) => pts.forEach(([x0, y0], k) => {
  const [x1, y1] = pts[(k + 1) % pts.length], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
  if (L < 0.01) return;
  const w = document.createElement('b'); w.className = 'xw';
  Object.assign(w.style, { width: `${h}px`, height: `${L + 0.4}px`, transformOrigin: '0 0',
    transform: `translate3d(${x0}px, ${y0}px, ${z0}px) rotateZ(${Math.atan2(-dx, dy) * 180 / Math.PI}deg) rotateY(-90deg)` });
  parent.appendChild(w);
});
const roundRect = (w, h, r, seg = 6) => {
  const pts = [];
  [[w - r, r, -90], [w - r, h - r, 0], [r, h - r, 90], [r, r, 180]].forEach(([cx, cy, a0]) => { for (let k = 0; k <= seg; k++) { const a = ((a0 + (90 * k) / seg) * Math.PI) / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } });
  return pts;
};
const circle = (r, n = 28) => Array.from({ length: n }, (_, k) => [r + r * Math.cos((2 * Math.PI * k) / n), r + r * Math.sin((2 * Math.PI * k) / n)]);
{
  const PILL = Math.round(THICK * 0.48);
  [['left', 176, 96], ['right', 220, 90]].forEach(([side, top, len]) => {
    const el = document.createElement('div'); el.className = 'side-btn';
    Object.assign(el.style, { left: `${(side === 'left' ? -0.6 : 384.6) - PILL / 2}px`, top: `${top}px`, width: `${PILL}px`, height: `${len}px` });
    el.innerHTML = '<i class="groove"></i><i class="cap"></i>';
    $('#phone').appendChild(el);
    gsap.set(el, { z: -THICK / 2, rotationY: side === 'left' ? -90 : 90 });
    const [groove, cap] = el.children;
    groove.style.borderRadius = `${PILL / 2 + 2}px`; cap.style.borderRadius = `${PILL / 2}px`;
    gsap.set(cap, { z: 3.5 });
    extrude(el, roundRect(PILL, len, PILL / 2), 3.5);
  });
  const bump = $('.cam-bump');
  extrude(bump, roundRect(88, 158, 44), 8);
  gsap.set(bump.querySelector('.cap'), { z: 8 });
  bump.querySelectorAll('.lens').forEach((l) => { extrude(l, circle(32), 5, 8); gsap.set(l.querySelector('.glass'), { z: 13 }); });
}
gsap.set('#screen', { z: 3 });
gsap.set(['.island', '.home-ind'], { z: 1.5 });

const PHONE0 = { x: 400, y: 1450, rotationY: -360, rotationZ: 18 };   // first frame: below the frame, slightly right
const phone = S($('#phone'), { x: PHONE0.x, y: PHONE0.y, z: 0, rotationX: 0, rotationY: PHONE0.rotationY, rotationZ: PHONE0.rotationZ });

// ---------------------------------------------------------------- screens: one layer per surface, swapped while edge-on
const L = Object.fromEntries(['home', 'scan', 'success', 'board', 'diwali', 'xmas'].map((id) => [id, $('#' + id)]));
gsap.set(Object.values(L), { autoAlpha: 0 });
gsap.set(L.home, { autoAlpha: 1 });
const show = (b, id, at) => { Object.entries(L).forEach(([k, el]) => b.set(el, { autoAlpha: k === id ? 1 : 0 }, at)); };
const WIPE0 = 'inset(0% 100% 0% 0%)', WIPE1 = 'inset(0% 0% 0% 0%)';   // a new skin wipes on from the left
gsap.set('.slot', { autoAlpha: 0, scale: 1.7, y: -40, zIndex: 3, transformOrigin: '50% 30%' });
gsap.set('#spotB', { x: 360 });
gsap.set('#spotC', { clipPath: WIPE0 });
gsap.set(L.xmas, { clipPath: WIPE0 });
gsap.set('.runs-txt', { opacity: 0, y: 24 });
gsap.set('#boardImg', { y: 0 });

// ================================================================ 1 · Arrival
s.beat('phone.fly', { at: 0, dur: ARRIVE.dur, ease: ARRIVE.ease, note: 'Phone rises in from the bottom right with one full turn and lands; the spotlight slot is empty' }, (b) =>
  phone.to(b, { x: 0, y: 0, rotationY: 0, rotationZ: 0 }));
s.beat('cam.zoom', { at: 0, dur: ARRIVE.dur, ease: PUSH, note: 'Camera pushes in on the top of the phone with the fly-in; lands with it' }, (b) =>
  cam.to(b, { s: 2.4, fy: -270 }));

// ================================================================ 2 · The slot
s.beat('slot.drop', { at: T.drop, dur: 22, ease: [0.2, 0.7, 0.3, 1], note: 'An IPL spotlight drops into the empty slot from the lens and lands under the home screen' }, (b) => {
  b.fromTo('.slot', { autoAlpha: 0 }, { autoAlpha: 1 }, { dur: 5, ease: 'fade' });
  b.fromTo('.slot', { scale: 1.7, y: -40 }, { scale: 1, y: 0 });
  b.set('.slot', { zIndex: 0 }, 22);   // once landed it sits behind the home screen's icons, like the real slot
});
s.beat('slot.carousel', { at: T.carousel, dur: 20, ease: 'move', note: 'The carousel turns: Unleash the cricket fever → #ScoreBigOn PayZapp' }, (b) => {
  b.fromTo('#spotA', { x: 0 }, { x: -360 });
  b.fromTo('#spotB', { x: 360 }, { x: 0 });
});

// ================================================================ 3 · Surfaces: one flip each
const flip = (name, at, to, rotationY, note, camTo) => s.beat(name, { at, dur: FLIP.dur, ease: FLIP.ease, note }, (b) => {
  phone.to(b, { rotationY });
  if (camTo) cam.to(b, camTo);
  show(b, to, SWAP);
});
flip('flip.scanner', T.flip1, 'scan', 360, 'Camera pulls back and flattens while the phone flips once; it lands on the scanner (fours and sixes)', { ...SHOW });
flip('flip.success', T.flip2, 'success', 720, 'Flip: payment success — the tick is a bouncing cricket ball');
s.beat('runs.in', { at: T.flip2 + SWAP + 34, dur: 16, ease: 'settle', note: 'The runs sheet slides up: 6 runs scored' }, (b) =>
  b.fromTo('.runs-txt', { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, { at: 8 }));
flip('flip.board', T.flip3, 'board', 1080, 'Flip: the Runs leaderboard');
s.beat('board.push', { at: T.scroll, dur: 70, ease: 'move', note: 'Camera pushes in and travels down while the leaderboard scrolls to the ways to score' }, (b) => {
  cam.to(b, BOARD);
  b.fromTo('#boardImg', { y: 0 }, { y: -860 }, { at: 4, dur: 80, ease: [0.4, 0, 0.3, 1] });
});

// ================================================================ 4 · Numbers: the runs ladder
const NUM_S = 2.1;
const CELL = 60 * GRID_K * Math.pow(NUM_S, -GRID_DAMP);   // one grid cell in world px at NUM_S
const CARD = { w: 12 * CELL, h: 5 * CELL, gap: CELL };
const cardY = (i) => i * (CARD.h + CARD.gap) + CELL / 2;  // 5 cells tall: half-cell shift keeps the edges on grid lines
const LADDER = [1, 2, 4, 6, 25, 50];
const CARDS = [   // the leaderboard's own ways to score (Single, Chakka, Power-play)
  { n: 1, unit: 'run', label: 'Open PayZapp daily' },
  { n: 6, unit: 'runs', label: 'Recharge or pay a bill' },
  { n: 50, unit: 'runs', label: 'Refer a friend' },
];
const cards = CARDS.map((c, i) => {
  const at = T.num0 + i * T.beat;
  const el = document.createElement('div');
  el.className = 'co'; el.dataset.name = `Card – ${c.n} ${c.unit}`;
  Object.assign(el.style, { width: `${CARD.w}px`, height: `${CARD.h}px` });
  el.innerHTML = `<i class="co-bg"></i><div class="txt"><b class="num">0</b><span class="lbl">${c.label}</span></div>
    <div class="viz ladder">${LADDER.map((v) => `<div class="col${v === c.n ? ' on' : ''}"><i class="${v === c.n ? 'on' : ''}" style="height:${Math.round(14 + 106 * Math.sqrt(v / 50))}px"></i><span>${v}</span></div>`).join('')}</div>`;
  $('#world3').appendChild(el);
  const numEl = el.querySelector('.num'), bar = el.querySelector('i.on');
  s.onFrame((f) => {   // counts up; this card's bar fills with it
    const p = Math.max(0, Math.min(1, (f - at - 4) / 22)), e = 1 - Math.pow(1 - p, 3);
    numEl.innerHTML = `${Math.round(c.n * e)}<span class="u">${c.unit}</span>`;
    bar.style.setProperty('--fill', e.toFixed(3));
  });
  const bg = el.querySelector('.co-bg'), parts = [numEl, el.querySelector('.lbl'), el.querySelector('.viz')];
  const off = { x: 0, y: 40 };
  gsap.set(el, { opacity: 0 }); gsap.set(bg, { opacity: 0 }); gsap.set(parts, { opacity: 0, y: 16 });
  s.beat(`number.${c.n}`, { at, dur: 16, ease: 'settle', note: `Card: ${c.n} ${c.unit} — ${c.label}` }, (b) => {
    b.fromTo(off, { y: 40 }, { y: 0 }, { dur: 18 });
    b.fromTo(el, { opacity: 0 }, { opacity: 1 }, { dur: 1 });
    b.fromTo(bg, { opacity: 0 }, { opacity: 1 }, { dur: 12, ease: 'fade' });
    b.each(parts, { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, { at: 6, dur: 16 });
    if (i) cam.to(b, { ty: cardY(i) }, { at: -6, dur: 30, ease: 'move' });   // pan only: centre the new card under the last
    else cam.to(b, { rx: 0, rz: 0, ry: 0, s: NUM_S, ty: cardY(0) }, { at: T.out - at, dur: 50, ease: 'move' });   // squares up with the phone leaving
  });
  return { el, off };
});
s.onFrame(() => cards.forEach((c, i) => { c.el.style.transform = `translate3d(${-CARD.w / 2 + c.off.x}px, ${cardY(i) - CARD.h / 2 + c.off.y}px, 0)`; }), 60);
s.beat('phone.out', { at: T.out, dur: 36, ease: LEAVE, note: 'The phone slides out right, flipping, as the first card lands' }, (b) => {
  phone.to(b, { x: 1150, rotationY: 1260 });
  phone.to(b, { x: -1150, rotationY: 900 }, { at: 37, dur: 1 });   // parked out of frame on the left for its return
  show(b, 'home', 37);                                              // it comes back on the home screen (slot still IPL)
});

// ================================================================ 5 · Reuse: same surfaces, other seasons
s.beat('reuse.cards', { at: T.back, dur: 24, stagger: 4, ease: 'exit', note: 'The cards slide off right' }, (b) => cards.forEach((c, i) => {
  b.fromTo(c.off, { x: 0 }, { x: 1700 }, { at: i * 4 });
  b.fromTo(c.el, { opacity: 1 }, { opacity: 0 }, { at: i * 4 + 23, dur: 1 });
}));
s.beat('reuse.in', { at: T.back, dur: 50, ease: [0.22, 0.6, 0.3, 1], note: 'The phone flips back in from the left on the home screen as the camera returns' }, (b) => {
  phone.to(b, { x: 0, rotationY: 1080 });
  cam.to(b, { ...SHOW }, { ease: 'move' });
});
s.beat('reuse.navratri', { at: T.navratri, dur: 18, ease: 'move', note: 'Same slot, next season: the spotlight wipes to Navratri' }, (b) =>
  b.fromTo('#spotC', { clipPath: WIPE0 }, { clipPath: WIPE1 }));
flip('reuse.diwali', T.flip4, 'diwali', 1440, 'Flip: the same scanner, dressed for Diwali');
s.beat('reuse.xmas', { at: T.xmas, dur: 18, ease: 'move', note: 'Wipe: and for Christmas' }, (b) => {
  b.set(L.xmas, { autoAlpha: 1 });
  b.fromTo(L.xmas, { clipPath: WIPE0 }, { clipPath: WIPE1 });
});

// ================================================================ 6 · Loop out
s.beat('loop.phone', { at: T.loop, dur: 40, ease: LEAVE, note: 'The phone leaves through the top left, turning' }, (b) => {
  phone.to(b, { x: -1000, y: -1700, rotationY: 1800 });
  // out of frame: park it at its first-frame spot and reset every screen, so the last frame leads into frame 0
  phone.to(b, { x: PHONE0.x, y: PHONE0.y, rotationY: PHONE0.rotationY, rotationZ: PHONE0.rotationZ }, { at: 41, dur: 1 });
  show(b, 'home', 41);
  b.set('.slot', { autoAlpha: 0, scale: 1.7, y: -40, zIndex: 3 }, 41);
  b.set('#spotA', { x: 0 }, 41); b.set('#spotB', { x: 360 }, 41);
  b.set('#spotC', { clipPath: WIPE0 }, 41); b.set(L.xmas, { clipPath: WIPE0 }, 41);
  b.set('.runs-txt', { opacity: 0, y: 24 }, 41); b.set('#boardImg', { y: 0 }, 41);
});
s.beat('loop.camera', { at: T.loop + 4, dur: ARRIVE.dur, ease: [0.7, 0, 0.45, 1], note: 'Camera eases back to the opening view (the push-in, reversed)' }, (b) =>
  cam.to(b, { ...V0 }));

// ---------------------------------------------------------------- Lotties, stepped by the frame
const lot = (id, path, at, loop) => lottieKit(s, { container: $(id), path, at, loop, fit: id === '#runsLottie' ? 'xMidYMax meet' : id === '#scanLottie' ? 'xMidYMin slice' : 'xMidYMin meet' });
await Promise.all([
  lot('#scanLottie', 'assets/scan-ipl.json', T.flip1 + SWAP, true),
  lot('#ballLottie', 'assets/pay-success.json', T.flip2 + SWAP),
  lot('#runsLottie', 'assets/txn-runs.json', T.flip2 + SWAP + 34),
]);

// ---------------------------------------------------------------- animatic overlay
if (HUD) shotHud(s, $('#stage'), [
  { id: 'arrival', at: 0, dur: T.drop, title: 'Arrival', action: 'Phone rises in, one full turn; camera pushes in on the empty spotlight slot' },
  { id: 'slot', at: T.drop, dur: T.flip1 - T.drop, title: 'The slot', action: 'IPL spotlight drops in from the lens; the carousel turns to #ScoreBigOn' },
  { id: 'scanner', at: T.flip1, dur: T.flip2 - T.flip1, title: 'Scanner', action: 'Flip: the scanner, with fours and sixes' },
  { id: 'success', at: T.flip2, dur: T.flip3 - T.flip2, title: 'Payment success', action: 'Flip: cricket-ball tick, then the runs sheet' },
  { id: 'board', at: T.flip3, dur: T.out - T.flip3, title: 'Leaderboard', action: 'Flip, push in, travel down to the ways to score' },
  { id: 'numbers', at: T.out, dur: T.back - T.out, title: 'Runs ladder', action: 'Phone splits off; 1 run · 6 runs · 50 runs stack up' },
  { id: 'reuse', at: T.back, dur: T.loop - T.back, title: 'Any season', action: 'Same slot → Navratri; same scanner → Diwali → Christmas' },
  { id: 'loop', at: T.loop, dur: 44, title: 'Loop out', action: 'Phone leaves top left; camera returns to the opening view' },
]);

await Promise.all([700, 800].map((w) => document.fonts.load(`${w} 20px ManropeLocal`)).concat([400, 800].map((w) => document.fonts.load(`${w} 16px InterLocal`))));
s.ready({ tail: -1 });   // loop: the last frame is one step before frame 0's state
