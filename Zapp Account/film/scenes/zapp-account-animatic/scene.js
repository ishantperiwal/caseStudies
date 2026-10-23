// Zapp Account — "Familiar by design" (v3). Real screens only; the story is told with depth (elements
// lift off the screen in 3D while the rest dims), camera push-ins on specific areas, and match cuts:
//   PayZapp row close-up → pull out → PayZapp Wallet tile lifts → push in → HARD CUT: same tile, now Zapp
//   Account → push into its logo → MATCH CUT to the same logo in the Zapp Account header → pull out →
//   PayZapp racks in beside it; its payment row flies over and lands on Zapp's actions (same places) →
//   down the screen, one decision per stop: Cashpoints up top → Balance → Add Money → Auto-Load → locks
//   (→ whip to the upgrade banner they lead to) → pull out to the hero angle with results → end card.
// 1920x1080 · 25 fps · 38 s. Earlier takes: scene.v1.js (storyboard), scene.v2.js (abstract motion).
import { gsap } from 'gsap';
import { studio } from '@studio/studio.js';
import { camera } from '@studio/kits/camera.js';

const s = await studio({ id: 'zapp-account-animatic', width: 1920, height: 1080, fps: 25 });
const $ = (q) => document.querySelector(q);
const hash = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------------------------------------------------------- tiny state helper: chain fromTo's per element
const S = (el, init) => {
  gsap.set(el, init);
  const cur = { ...init };
  return {
    el, cur,
    to(b, vars, x = {}) { const from = {}; for (const k in vars) from[k] = cur[k]; b.fromTo(el, from, vars, x); Object.assign(cur, vars); return b; },
  };
};

// ---------------------------------------------------------------- phones built from the real screens
// Screens are 720 px wide; the phone screen is 390 px, so k maps screen pixels to stage pixels.
const k = 390 / 720;
const SHOT = (a) => `0px ${32 * a}px ${54 * a}px ${-12 * a}px rgba(10,20,32,${0.42 * a})`;
const phone = (name, screens) => {
  const rig = document.createElement('div'); rig.className = 'rig'; rig.dataset.name = name;
  rig.innerHTML = `<div class="phone"><div class="shell"></div><div class="screen">${
    screens.map((sc) => `<img src="assets/${sc.src}" style="top:${sc.yOff * k}px" data-id="${sc.id}">`).join('')}<div class="veil"></div></div></div>`;
  $('#cam').appendChild(rig);
  const ph = rig.querySelector('.phone');
  const imgs = Object.fromEntries([...rig.querySelectorAll('img')].map((im) => [im.dataset.id, im]));
  const yOff = Object.fromEntries(screens.map((sc) => [sc.id, sc.yOff]));
  const src = Object.fromEntries(screens.map((sc) => [sc.id, sc.src]));
  const lift = (label, sid, { x, y, w, h }, r) => {
    const el = document.createElement('div');
    el.className = 'lift'; el.dataset.name = `${name} – ${label}`;
    Object.assign(el.style, {
      left: `${12 + x * k}px`, top: `${12 + y * k}px`, width: `${w * k}px`, height: `${h * k}px`, borderRadius: `${r}px`,
      backgroundImage: `url(assets/${src[sid]})`, backgroundPosition: `${-x * k}px ${-(y - yOff[sid]) * k}px`,
    });
    el.innerHTML = `<div class="ring" style="border-radius:${r + 6}px"></div>`;
    ph.appendChild(el);
    return { st: S(el, { opacity: 0, z: 0, x: 0, y: 0, scale: 1, rotation: 0, boxShadow: SHOT(0) }), ring: S(el.firstChild, { opacity: 0, scale: 1.08 }) };
  };
  return { rig: S(rig, { x: 0, y: 0, scale: 1, opacity: 1 }), ph: S(ph, { rotationX: 0, rotationY: 0, rotationZ: 0 }), imgs, veil: S(rig.querySelector('.veil'), { opacity: 0 }), lift };
};
const up = (b, L, z, x = {}) => { L.st.to(b, { opacity: 1, z, boxShadow: SHOT(1) }, x); L.ring.to(b, { opacity: 1, scale: 1 }, { ...x, ease: 'overshoot' }); return b; };
const down = (b, L, x = {}) => {
  L.ring.to(b, { opacity: 0, scale: 1.08 }, { ...x, dur: Math.min(x.dur ?? 8, 8), ease: 'fade' });
  L.st.to(b, { z: 0, boxShadow: SHOT(0) }, x);
  L.st.to(b, { opacity: 0 }, { at: (x.at || 0) + (x.dur ?? b.dur), dur: 1 });
  return b;
};

// A: the hero phone — PayZapp (with Wallet) → PayZapp (with Zapp Account) → Zapp Account (limited)
const A = phone('Phone – hero', [
  { id: 'wallet', src: 'payzapp-wallet-home.png', yOff: 0 },
  { id: 'payzapp', src: 'payzapp-home.png', yOff: 8 },     // +8 so its tiles sit exactly where the Wallet's did
  { id: 'zapp', src: 'zapp-limited.png', yOff: 0 },
]);
// B: PayZapp, racked in beside it for the familiarity match
const B = phone('Phone – PayZapp', [{ id: 'payzapp', src: 'payzapp-home.png', yOff: 8 }]);

// lifted layers (regions in screen pixels)
const tileW = A.lift('PayZapp Wallet tile', 'wallet', { x: 388, y: 894, w: 120, h: 118 }, 14);
const tileZ = A.lift('Zapp Account tile', 'payzapp', { x: 388, y: 894, w: 120, h: 118 }, 14);
const rowA = A.lift('Payment actions', 'zapp', { x: 48, y: 796, w: 624, h: 232 }, 18);
const pill = A.lift('Cashpoints', 'zapp', { x: 572, y: 120, w: 104, h: 66 }, 18);
const bal = A.lift('Balance', 'zapp', { x: 236, y: 484, w: 248, h: 76 }, 10);
const add = A.lift('Add Money', 'zapp', { x: 212, y: 575, w: 298, h: 84 }, 23);
const auto = A.lift('Auto-Load', 'zapp', { x: 222, y: 682, w: 280, h: 44 }, 8);
const locks = [203, 393, 591].map((cx, i) => A.lift(`Lock ${i + 1}`, 'zapp', { x: cx - 28, y: 784, w: 56, h: 56 }, 16));
const banner = A.lift('Upgrade banner', 'zapp', { x: 28, y: 250, w: 664, h: 180 }, 18);
const rowB = B.lift('Payment row', 'payzapp', { x: 16, y: 560, w: 520, h: 196 }, 12);
gsap.set(rowB.st.el, { transformOrigin: `${(272 - 16) * k}px ${(620 - 560) * k}px` });   // pivot on "Pay Anyone"

// ---------------------------------------------------------------- camera (content coords; phone A starts centred at 960,540)
const P = (x, y, cx = 960) => [cx - 195 + x * k, 118 + y * k];
const at = (pt, zoom, sx = 1200, sy = 540) => ({ x: pt[0] - (sx - 960) / zoom, y: pt[1] - (sy - 540) / zoom, zoom });
const AX = 1210;   // phone A's centre once B joins it
const VIEWS = {
  rowA1: at(P(96, 620), 2.2, 1100), rowA2: at(P(448, 620), 2.2, 1100),
  wideR: { x: 640, y: 540, zoom: 1 },
  tile: at(P(448, 952), 2.3, 1350), tilePunch: at(P(448, 952), 2.45, 1350),
  tileDeep: at(P(448, 952), 5.5, 960),
  head: at(P(362, 152), 2.15, 960),
  zWideR: { x: 640, y: 540, zoom: 1 },
  pair: { x: 960, y: 650, zoom: 0.78 },
  rowZ: at(P(361, 854, AX), 2.0, 1200, 560),
  pill: at(P(624, 152, AX), 2.0, 1500, 440),
  money: at(P(360, 570, AX), 2.0, 1200, 560),
  auto: at(P(360, 650, AX), 2.0, 1200, 560),
  locks: at(P(393, 830, AX), 2.1, 1200, 600),
  banner: at(P(360, 339, AX), 1.9, 1200, 520),
  heroR: { x: AX - 330, y: 540, zoom: 1 },
};
const cam = camera(s, $('#cam'), { start: 'rowA1', views: VIEWS });
const drift = $('#drift');
s.onFrame((f) => { drift.style.transform = `translate(${4 * Math.sin(f / 53)}px, ${3 * Math.sin(f / 67 + 1)}px) rotate(${0.2 * Math.sin(f / 89 + 2)}deg)`; });

// ---------------------------------------------------------------- kinetic type
const typeLayer = $('#type');
const kt = (id, text, { hl = '', style = {}, cls = '' } = {}) => {
  const el = document.createElement('div');
  el.className = `kt ${cls}`; el.dataset.name = `Type – ${text}`;
  Object.assign(el.style, style);
  const words = text.split(' '), h = hl.split(' ').filter(Boolean);
  const hs = h.length ? words.findIndex((_, i) => h.every((x, j) => words[i + j] === x)) : -1;
  el.innerHTML = words.map((w, i) => (i === hs ? '<span class="hl">' : '') + `<span class="w"><i>${w}</i></span>`
    + (hs >= 0 && i === hs + h.length - 1 ? '<svg class="sq" viewBox="0 0 100 20" preserveAspectRatio="none"><path pathLength="1" d="M2,13 C18,4 32,18 50,10 S82,3 98,11"/></svg></span>' : '')).join(' ');
  typeLayer.appendChild(el);
  const L = { id, el, ws: [...el.querySelectorAll('.w i')], sq: el.querySelector('.sq path') };
  gsap.set(el, { opacity: 0 }); gsap.set(L.ws, { opacity: 0 });
  if (L.sq) gsap.set(L.sq, { opacity: 0, attr: { 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 } });
  return L;
};
const typeIn = (L, f, { stagger = 2 } = {}) => s.beat(`type.${L.id}.in`, { at: f, dur: 16, stagger, ease: 'settle', note: 'Words tumble in' }, (b) => {
  b.set(L.el, { opacity: 1 });
  L.ws.forEach((w, i) => b.fromTo(w, { opacity: 0, y: 60, rotation: (hash(i, L.id.length) - 0.5) * 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, rotation: 0, filter: 'blur(0px)' }, { i }));
  if (L.sq) {
    const t = L.ws.length * stagger + 4;
    b.set(L.sq, { opacity: 1 }, t);
    b.fromTo(L.sq, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 } }, { at: t, dur: 14, ease: 'move' });
  }
});
const typeOut = (L, f) => s.beat(`type.${L.id}.out`, { at: f, dur: 10, stagger: 1, ease: 'exit', note: 'Words fly off' }, (b) => {
  L.ws.forEach((w, i) => b.fromTo(w, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -40, filter: 'blur(6px)' }, { i }));
  if (L.sq) { b.fromTo(L.sq, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': -1 } }, { dur: 8 }); b.set(L.sq, { opacity: 0 }, 8); }
  b.set(L.el, { opacity: 0 }, L.ws.length + 10);
});
const say = (id, text, inF, outF, o = {}) => { const L = kt(id, text, { style: { top: '330px', ...o.style }, ...o }); typeIn(L, inF, o); typeOut(L, outF); return L; };

// ---------------------------------------------------------------- initial state
const wash = S($('#wash'), { opacity: 0 });
const end = S($('#end'), { opacity: 0 });
gsap.set([A.imgs.payzapp, A.imgs.zapp], { opacity: 0 });
const rigB = B.rig, phB = B.ph;
gsap.set(rigB.el, { x: -40, opacity: 0, scale: 0.8, filter: 'blur(12px)' });
Object.assign(rigB.cur, { x: -40, opacity: 0, scale: 0.8, filter: 'blur(12px)' });
gsap.set(phB.el, { rotationY: 12 }); phB.cur.rotationY = 12;
const acts = [
  [0, 96, 'Familiar ground: close on PayZapp’s payment row, pull out; the PayZapp Wallet tile lifts'],
  [96, 160, 'Rebrand match cut: push in on the tile — hard cut, same frame, now Zapp Account'],
  [160, 238, 'Push into the tile’s logo → match cut to the same logo in the Zapp Account header → pull out'],
  [238, 356, 'Familiarity: PayZapp racks in beside it; its payment row flies over and lands on Zapp’s actions'],
  [356, 436, 'Cashpoints up top: whip up to the header; the counter lifts'],
  [436, 558, 'Balance, then Add Money lift — the hero and the hero CTA'],
  [558, 630, 'Auto-Load lifts right under Add Money'],
  [630, 758, 'Locks lift off one by one → whip up to the upgrade banner they lead to'],
  [758, 868, 'Pull out to the hero angle; results'],
  [868, 950, 'End card'],
];
acts.forEach(([a, b, note], i) => s.beat(`shot.${i + 1}`, { at: a, dur: b - a, note }));

// ---------------------------------------------------------------- 1 · familiar ground
s.beat('open.drift', { at: 0, dur: 44, ease: [0.3, 0, 0.7, 1], note: 'Slow drift along PayZapp’s payment row' }, (b) => cam.to(b, 'rowA2'));
s.beat('open.pull', { at: 40, dur: 40, ease: 'move', note: 'Pull out to the whole home; phone tilts into depth' }, (b) => {
  cam.to(b, 'wideR');
  A.ph.to(b, { rotationY: -16, rotationX: 6 });
});
say('wallet', 'PayZapp Wallet already existed within PayZapp.', 54, 114, { hl: 'PayZapp Wallet' });
s.beat('open.tile', { at: 76, dur: 16, ease: 'settle', note: 'The PayZapp Wallet tile lifts off the screen' }, (b) => {
  A.veil.to(b, { opacity: 1 }, { ease: 'fade' });
  up(b, tileW, 80);
});

// ---------------------------------------------------------------- 2 · rebrand match cut
s.beat('cut.push', { at: 96, dur: 26, ease: 'move', note: 'Push in on the tile; phone squares up' }, (b) => {
  cam.to(b, 'tile');
  A.ph.to(b, { rotationY: 0, rotationX: 0 });
});
s.beat('cut.swap', { at: 124, dur: 1, ease: 'linear', note: 'HARD CUT — same frame, the tile is now Zapp Account' }, (b) => {
  b.set(A.imgs.wallet, { opacity: 0 }); b.set(A.imgs.payzapp, { opacity: 1 });
  tileW.st.to(b, { opacity: 0 }, { dur: 0 }); tileW.ring.to(b, { opacity: 0 }, { dur: 0 });
  tileZ.st.to(b, { opacity: 1, z: 80, boxShadow: SHOT(1) }, { dur: 0 }); tileZ.ring.to(b, { opacity: 1, scale: 1 }, { dur: 0 });
  cam.to(b, 'tilePunch', { dur: 1 });
});
s.beat('cut.settle', { at: 125, dur: 14, ease: 'settle' }, (b) => cam.to(b, 'tile'));
say('name', 'They wanted to call it Zapp Account', 128, 156, { hl: 'Zapp Account' });

// ---------------------------------------------------------------- 3 · logo match cut into the Zapp Account header
s.beat('through.push', { at: 160, dur: 18, ease: [0.55, 0, 1, 0.6], note: 'Accelerate into the tile’s Zapp logo' }, (b) => {
  cam.to(b, 'tileDeep');
  wash.to(b, { opacity: 0.6 }, { at: 10, dur: 8, ease: 'fade' });
});
s.beat('through.cut', { at: 178, dur: 1, ease: 'linear', note: 'MATCH CUT — the same logo, now in the Zapp Account header' }, (b) => {
  b.set(A.imgs.payzapp, { opacity: 0 }); b.set(A.imgs.zapp, { opacity: 1 });
  A.veil.to(b, { opacity: 0 }, { dur: 0 });
  tileZ.st.to(b, { opacity: 0, z: 0, boxShadow: SHOT(0) }, { dur: 0 }); tileZ.ring.to(b, { opacity: 0 }, { dur: 0 });
  cam.to(b, 'head', { dur: 1 });
});
s.beat('through.pull', { at: 179, dur: 42, ease: [0, 0.55, 0.25, 1], note: 'Decelerating pull-out reveals Zapp Account' }, (b) => {
  cam.to(b, 'zWideR');
  wash.to(b, { opacity: 0 }, { dur: 12, ease: 'fade' });
  A.ph.to(b, { rotationY: -14, rotationX: 5 }, { at: 8, dur: 34 });
});
say('prop', 'A payment account for all your daily spends', 198, 234, { hl: 'daily spends' });

// ---------------------------------------------------------------- 4 · familiarity: PayZapp's row lands on Zapp's actions
s.beat('fam.pair', { at: 238, dur: 32, ease: 'move', note: 'Zapp slides right; PayZapp racks into focus beside it' }, (b) => {
  cam.to(b, 'pair');
  A.rig.to(b, { x: AX - 960 });
  A.ph.to(b, { rotationY: -8, rotationX: 3 });
  rigB.to(b, { x: -250, opacity: 1, scale: 1, filter: 'blur(0px)' }, { at: 4, dur: 28 });
  phB.to(b, { rotationY: 8 }, { at: 4, dur: 28 });
});
s.beat('fam.nofilter', { at: 271, dur: 1 }, (b) => rigB.to(b, { filter: 'none' }, { dur: 0 }));
say('fam', 'Familiarity by design worked in our favor', 246, 352, { hl: 'Familiarity', style: { left: '0', right: '0', top: '40px', maxWidth: 'none', textAlign: 'center', fontSize: '66px' } });
s.beat('fam.lift', { at: 274, dur: 14, ease: 'settle', note: 'Both payment rows lift; phones square up' }, (b) => {
  A.ph.to(b, { rotationY: 0, rotationX: 0 }); phB.to(b, { rotationY: 0 });
  A.veil.to(b, { opacity: 1 }, { ease: 'fade' }); B.veil.to(b, { opacity: 1 }, { ease: 'fade' });
  up(b, rowB, 60); up(b, rowA, 60);
});
const FLY = { x: (AX - 195 + 361 * k) - (710 - 195 + 272 * k), y: (854 - 620) * k, scale: 194.5 / 176 };
s.beat('fam.fly', { at: 294, dur: 22, ease: 'move', note: 'PayZapp’s row flies across and lands exactly on Zapp’s actions' }, (b) => {
  rowB.ring.to(b, { opacity: 0 }, { dur: 6, ease: 'fade' });
  rowB.st.to(b, { x: FLY.x, y: FLY.y, scale: FLY.scale });
  rowB.st.to(b, { z: 150 }, { dur: 10, ease: 'settle' });
  rowB.st.to(b, { z: 0 }, { at: 10, dur: 12, ease: 'move' });
  rowA.ring.to(b, { opacity: 0 }, { dur: 6, ease: 'fade' });
  rowA.st.to(b, { z: 0, boxShadow: SHOT(0) }, { at: 6, dur: 12 });
});
s.beat('fam.land', { at: 316, dur: 16, ease: 'overshoot', note: 'Same places, same order — PayZapp dissolves into Zapp' }, (b) => {
  rowB.st.to(b, { opacity: 0 }, { dur: 10, ease: 'fade' });
  rowA.st.to(b, { z: 60, boxShadow: SHOT(1) }, { at: 4, dur: 12 });
  rowA.ring.to(b, { opacity: 1, scale: 1 }, { at: 4, dur: 12 });
});
s.beat('fam.close', { at: 320, dur: 32, ease: 'move', note: 'Push in on the matched row; PayZapp steps back' }, (b) => {
  cam.to(b, 'rowZ');
  rigB.to(b, { opacity: 0, scale: 0.92 }, { dur: 18, ease: 'fade' });
});

// ---------------------------------------------------------------- 5 · Cashpoints up top
s.beat('cash.whip', { at: 356, dur: 16, ease: 'whip', note: 'Whip up to the header' }, (b) => {
  cam.to(b, 'pill');
  down(b, rowA, { dur: 8, ease: 'fade' });
});
s.beat('cash.up', { at: 364, dur: 14, ease: 'overshoot', note: 'Cashpoints counter lifts — kept up top, where the existing habit lives' }, (b) => up(b, pill, 90));
s.beat('cash.wobble', { at: 392, dur: 18, note: 'Counter ticks' }, (b) => {
  pill.st.to(b, { rotation: -7, scale: 1.08 }, { dur: 6, ease: 'snap' });
  pill.st.to(b, { rotation: 0, scale: 1 }, { at: 6, dur: 12, ease: 'overshoot' });
});
say('cash', 'Cashpoints reinforced an existing behavior', 366, 430, { hl: 'Cashpoints' });

// ---------------------------------------------------------------- 6 · Balance → Add Money
s.beat('money.tilt', { at: 436, dur: 20, ease: 'move', note: 'Tilt down to the balance' }, (b) => {
  cam.to(b, 'money');
  down(b, pill, { dur: 10 });
});
s.beat('bal.up', { at: 446, dur: 16, ease: 'settle', note: 'Balance lifts — the first thing people check' }, (b) => up(b, bal, 70));
say('bal', 'Balance became the hero', 450, 492, { hl: 'hero' });
s.beat('add.up', { at: 496, dur: 16, ease: 'overshoot', note: 'Add Money lifts higher; balance eases back' }, (b) => {
  up(b, add, 120);
  bal.ring.to(b, { opacity: 0 }, { dur: 6, ease: 'fade' });
  bal.st.to(b, { z: 25, boxShadow: SHOT(0.4) });
});
say('add', 'Add Money became the hero CTA', 500, 554, { hl: 'hero CTA' });
say('loads', '1.5× monthly loads', 520, 554, { hl: '1.5×', cls: 'sub', style: { top: '610px' } });
s.beat('add.press', { at: 530, dur: 12, note: 'Tap' }, (b) => {
  add.st.to(b, { scale: 0.93 }, { dur: 4, ease: 'snap' });
  add.st.to(b, { scale: 1 }, { at: 4, dur: 8, ease: 'overshoot' });
});

// ---------------------------------------------------------------- 7 · Auto-Load, right under Add Money
s.beat('auto.nudge', { at: 558, dur: 16, ease: 'move', note: 'Nudge down' }, (b) => {
  cam.to(b, 'auto');
  down(b, bal, { dur: 10 });
  add.ring.to(b, { opacity: 0 }, { dur: 6, ease: 'fade' });
  add.st.to(b, { z: 40, boxShadow: SHOT(0.5) });
});
s.beat('auto.up', { at: 566, dur: 16, ease: 'settle', note: 'Auto-Load lifts — borrowing Add Money’s attention' }, (b) => up(b, auto, 80));
say('auto', 'Context made Auto-Load discoverable', 570, 626, { hl: 'discoverable' });
say('autos', '20% Auto-Load adoption', 590, 626, { hl: '20%', cls: 'sub', style: { top: '610px' } });

// ---------------------------------------------------------------- 8 · locks → upgrade banner
s.beat('locks.tilt', { at: 630, dur: 18, ease: 'move', note: 'Tilt down to the payment actions' }, (b) => {
  cam.to(b, 'locks');
  down(b, add, { dur: 10 }); down(b, auto, { dur: 10 });
});
s.beat('locks.up', { at: 642, dur: 14, stagger: 6, ease: 'overshoot', note: 'Locks lift off one by one' }, (b) => locks.forEach((L, i) => {
  L.st.to(b, { opacity: 1, z: 130, rotation: (i - 1) * 8, boxShadow: SHOT(1) }, { i });
  L.ring.to(b, { opacity: 1, scale: 1 }, { i });
}));
say('lock', 'Locked actions became upgrade opportunities', 646, 754, { hl: 'opportunities' });
s.beat('locks.press', { at: 684, dur: 10, note: 'Tap a lock' }, (b) => {
  locks[0].st.to(b, { scale: 0.82 }, { dur: 4, ease: 'snap' });
  locks[0].st.to(b, { scale: 1 }, { at: 4, dur: 6, ease: 'overshoot' });
});
s.beat('locks.whip', { at: 696, dur: 16, ease: 'whip', note: 'Whip up to the upgrade it leads to' }, (b) => {
  cam.to(b, 'banner');
  locks.forEach((L) => { L.ring.to(b, { opacity: 0 }, { dur: 6, ease: 'fade' }); L.st.to(b, { z: 0, rotation: 0, boxShadow: SHOT(0) }, { dur: 12 }); L.st.to(b, { opacity: 0 }, { at: 12, dur: 1 }); });
  up(b, banner, 70, { at: 8, dur: 14, ease: 'settle' });
});
s.beat('banner.pulse', { at: 722, dur: 20, note: 'Banner answers' }, (b) => {
  banner.st.to(b, { scale: 1.04 }, { dur: 7, ease: 'snap' });
  banner.st.to(b, { scale: 1 }, { at: 7, dur: 13, ease: 'overshoot' });
});

// ---------------------------------------------------------------- 9 · pull out: hero angle + results
s.beat('hero.out', { at: 758, dur: 40, ease: 'move', note: 'Pull out to the hero angle' }, (b) => {
  cam.to(b, 'heroR');
  A.ph.to(b, { rotationY: -20, rotationX: 8, rotationZ: 2 });
  down(b, banner, { dur: 14 });
  A.veil.to(b, { opacity: 0 }, { dur: 14, ease: 'fade' });
});
[['r1', '2.1× monthly spends', '2.1×', 250], ['r2', '1.5× monthly loads', '1.5×', 350], ['r3', '20% Auto-Load adoption', '20%', 450], ['r4', 'Top 5 digital wallets by monthly spends', 'Top 5', 550]]
  .forEach(([id, text, hl, top], i) => say(id, text, 776 + i * 10, 858 + i * 2, { hl, style: { top: `${top}px`, fontSize: '62px', maxWidth: '760px' } }));

// ---------------------------------------------------------------- 10 · end
const endLetters = (() => { const el = $('#endMark'); el.innerHTML = [...'ZAPP'].map((c) => `<i class="r">${c}</i>`).join('') + '<i>&nbsp;</i>' + [...'ACCOUNT'].map((c) => `<i class="n">${c}</i>`).join(''); return [...el.querySelectorAll('i')]; })();
gsap.set('#endMark', { xPercent: -50, yPercent: -50 });
gsap.set(endLetters, { opacity: 0 });
s.beat('end.in', { at: 868, dur: 14, ease: 'fade', note: 'End card' }, (b) => end.to(b, { opacity: 1 }));
s.beat('end.letters', { at: 876, dur: 16, stagger: 1.5, ease: 'overshoot', note: 'Wordmark springs in' }, (b) =>
  endLetters.forEach((l, i) => b.fromTo(l, { opacity: 0, y: 50, rotation: (hash(i, 14) - 0.5) * 30 }, { opacity: 1, y: 0, rotation: 0 }, { i })));
const tEnd = kt('end', 'Driving Adoption', { style: { left: '0', right: '0', top: '580px', maxWidth: 'none', textAlign: 'center', fontSize: '60px' } });
typeIn(tEnd, 900, { stagger: 4 });

s.ready({ tail: 20 });
