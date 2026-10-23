// IPL Themification · ANIMATIC · 1920x1200 (16:10) · 25 fps · 624 frames · seamless loop.
// Follows the "Thumbnail explainer" theme beat for beat (same aspects, same frames, same camera); only the content
// changes, and the screens are rough sketches (blocking, not final art).
//   1 Arrival 0–42 · 2 Build 38–130 · 3 Travel 30–190 · 4 Before / After 196–360 · 5 Split exit 360–396
//   6 Number card 374–440 · 7 Card stack 440–580 · 8 Loop out 580–624
// Content: After = PayZapp home in its IPL skin (PLAY'ZAPP spotlight, themed offers); Before = the everyday home.
// Number cards are placeholders (the case study has no outcome metrics yet): marked TBD on screen.
import { gsap } from 'gsap';
import { studio } from '@studio/studio.js';
import { sketch, shotHud } from '@studio/kits/sketch.js';

const s = await studio({ id: 'ipl-film', width: 1920, height: 1200, fps: 25 });
const $ = (q) => document.querySelector(q);

const S = (el, init) => {
  gsap.set(el, init);
  const cur = { ...init };
  return { el, cur, to(b, vars, x = {}) { const from = {}; for (const k in vars) from[k] = cur[k]; b.fromTo(el, from, vars, x); Object.assign(cur, vars); return b; } };
};

// ---------------------------------------------------------------- timing (frames) — the theme's, unchanged
const ARRIVE = { dur: 42, ease: [0.22, 0.6, 0.3, 1] };
const PUSH = { ease: [0.55, 0, 0.3, 1] };
const BUILD = { header: 38, balance: 50, actions: 66, nudge: 82, quick: 94, footer: 110 };
const BA = { start: 196, move: 50, labels: 246, out: 360 };
const BEAT = 70;

// ---------------------------------------------------------------- camera rig
const CAM = { rx: 30, rz: -20, ry: 12, s: 0.95, fx: 0, fy: 0, ty: 0, __label: 'camera' };
const cam = S(CAM, { ...CAM });
const CAM0 = { rx: CAM.rx, rz: CAM.rz, ry: CAM.ry, s: CAM.s };
const grid = $('#grid'), GRID_K = 1.45, GRID_DAMP = 0.65;
const worlds = [$('#world'), $('#world2'), $('#world3')];
s.onFrame(() => {
  const t = `scale(${CAM.s}) rotateX(${CAM.rx}deg) rotateZ(${CAM.rz}deg) rotateY(${CAM.ry}deg) translate3d(${-CAM.fx}px, ${-(CAM.fy + CAM.ty)}px, 0)`;
  worlds.forEach((w) => { w.style.transform = t; });
  grid.style.transform = `translateZ(-260px) scale(${GRID_K * Math.pow(CAM.s, -GRID_DAMP)})`;
});
gsap.set('#grid', { opacity: 0.35 });

// ---------------------------------------------------------------- phone body (the theme's)
const SLABS = 26, DEPTH = 1.6, THICK = SLABS * DEPTH;
const phoneEl = $('#phone');
for (let k = 1; k <= SLABS; k++) { const el = document.createElement('div'); el.className = 'slab'; $('#slabs').appendChild(el); gsap.set(el, { z: -k * DEPTH }); }
gsap.set('#backplate', { z: -THICK - 0.5, rotationY: 180 });
{
  const R = 58, W = 384, H = 804;
  [['left', -0.2, R, THICK, H - 2 * R, { rotationY: -90 }], ['right', W - 0.8, R, THICK, H - 2 * R, { rotationY: 90 }],
   ['top', R, 0, W - 2 * R, THICK, { rotationX: 90 }], ['bottom', R, H, W - 2 * R, THICK, { rotationX: -90 }]].forEach(([side, x, y, w, h, rot]) => {
    const el = document.createElement('div'); el.className = 'side-wall';
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
    phoneEl.appendChild(el);
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
gsap.set('.screen', { z: 3 });
gsap.set(['.island', '.home-ind'], { z: 1.5 });
// the Before phone: a copy of the body, its screen sketched separately below
const phoneB = phoneEl.cloneNode(true);
phoneB.id = 'phoneBefore'; phoneB.dataset.name = 'Phone – Before';
phoneB.querySelector('#slabs').id = ''; phoneB.querySelector('#backplate').id = '';
phoneEl.after(phoneB);

// ---------------------------------------------------------------- sketch helpers (animatic art)
const NS = 'http://www.w3.org/2000/svg';
let seed = 7;
const SYS = "-apple-system, 'SF Pro Text', system-ui";
const svgFor = (host, w, h) => { const v = document.createElementNS(NS, 'svg'); v.setAttribute('width', w); v.setAttribute('height', h); host.appendChild(v); return v; };
// a component = one piece that travels whole (tile + glyph + label together)
const comp = (scr, { grp, name, x, y, w, h, top = false }, draw) => {
  const el = document.createElement('div');
  el.className = 'pc'; el.dataset.name = name;
  Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  (top ? scr.querySelector('.screen') : scr.querySelector('.content')).appendChild(el);
  const v = svgFor(el, w, h), sk = sketch(v, { seed: seed++, roughness: 1.2 });
  draw(sk, v, w, h);
  return { el, grp };
};
const T = (sk, v, x, y, str, o = {}) => sk.text(v, x, y, str, { size: 13, ...o });
const pill = (sk, v, x, y, w, h, label, fill = '#fff') => { sk.rect(v, x, y, w, h, { r: h / 2, fill }); T(sk, v, x + w / 2, y + h / 2 + 5, label, { anchor: 'middle', size: 14 }); };
const tile = (sk, v, w, label, fill) => {
  sk.rect(v, (w - 52) / 2, 0, 52, 52, { r: 15, fill });
  sk.rect(v, w / 2 - 11, 15, 22, 22, { r: 5, fill: '#fff', strokeWidth: 1.5 });
  label.forEach((ln, i) => T(sk, v, w / 2, 72 + i * 16, ln, { anchor: 'middle', size: 12.5 }));
};
const statusBar = (scr, grp) => comp(scr, { grp, name: 'Status bar', x: 18, y: 14, w: 324, h: 22, top: true }, (sk, v) => {
  T(sk, v, 18, 16, '9:41', { size: 15, weight: 700, font: SYS });
  [0, 1, 2].forEach((k) => sk.rect(v, 254 + k * 22, 4, 16, 10, { r: 2, fill: '#2b2b2b', strokeWidth: 1 }));
});
const avatarBell = (scr, grp) => [
  comp(scr, { grp, name: 'Profile', x: 22, y: 56, w: 36, h: 36 }, (sk, v) => { sk.rect(v, 0, 0, 36, 36, { r: 10, fill: '#E7ECF2' }); sk.circle(v, 18, 15, 11, { fill: '#2b2b2b' }); sk.path(v, 'M9 31 Q18 19 27 31', { strokeWidth: 3 }); }),
  comp(scr, { grp, name: 'Notifications', x: 302, y: 56, w: 36, h: 36 }, (sk, v) => { sk.rect(v, 0, 0, 36, 36, { r: 10, fill: '#E7ECF2' }); sk.path(v, 'M11 25 Q11 10 18 10 Q25 10 25 25 Z', { fill: '#2b2b2b' }); }),
];

// ---------------------------------------------------------------- AFTER: PayZapp home, IPL skin (Bottom Sheets.png / home spotlight)
const A = phoneEl;
{
  const wash = A.querySelector('.top-wash'), v = svgFor(wash, 360, 236), sk = sketch(v, { seed: 3 });
  sk.rect(v, -4, -4, 368, 244, { fill: '#D3EAFA', stroke: 'none' });                         // sky
  sk.path(v, 'M-10 168 Q180 112 370 168 L370 196 L-10 196 Z', { fill: '#9EC3E6' });         // stands
  sk.rect(v, -4, 192, 368, 48, { fill: '#BFE3A6', stroke: '#7FAF6A' });                     // outfield
  sk.path(v, 'M156 192 L204 192 L222 240 L138 240 Z', { fill: '#F0D79E', stroke: '#C9A866' }); // pitch
}
const compsA = [
  statusBar(A, 'header'), ...avatarBell(A, 'header'),
  comp(A, { grp: 'balance', name: 'Cricket ball', x: 26, y: 100, w: 34, h: 34 }, (sk, v) => { sk.circle(v, 17, 17, 32, { fill: '#E2553F' }); sk.path(v, 'M9 6 Q17 17 9 28 M25 6 Q17 17 25 28', { stroke: '#fff', strokeWidth: 1.5 }); }),
  comp(A, { grp: 'balance', name: "PLAY'ZAPP!", x: 60, y: 88, w: 240, h: 40 }, (sk, v) => T(sk, v, 120, 30, "PLAY'ZAPP!", { anchor: 'middle', size: 32, weight: 700 })),
  comp(A, { grp: 'balance', name: 'Campaign line', x: 70, y: 134, w: 220, h: 24 }, (sk, v) => { sk.scribble(v, 0, 6, 220, { stroke: '#5A7891' }); sk.scribble(v, 30, 20, 160, { stroke: '#5A7891' }); }),
  comp(A, { grp: 'balance', name: 'Learn more', x: 120, y: 168, w: 120, h: 34 }, (sk, v) => pill(sk, v, 0, 0, 120, 34, 'Learn more')),
  ...[['Send', 'Money'], ['Bills &', 'Recharges'], ['Passbook'], ['Accounts', '& Cards']].map((lbl, i) =>
    comp(A, { grp: 'actions', name: `Tile – ${lbl.join(' ')}`, x: 8 + i * 87, y: 250, w: 84, h: 100 }, (sk, v, w) => tile(sk, v, w, lbl, '#BFD7FF'))),
  comp(A, { grp: 'nudge', name: 'Accounts & Cards', x: 22, y: 360, w: 316, h: 28 }, (sk, v) => { T(sk, v, 0, 20, 'Accounts & Cards', { size: 18, weight: 700 }); pill(sk, v, 200, 0, 116, 26, 'UPI ID', '#E7ECF2'); }),
  ...[22, 238].map((x, i) => comp(A, { grp: 'quick', name: `Wallet card ${i + 1}`, x, y: 400, w: 200, h: 104 }, (sk, v) => {
    sk.rect(v, 0, 0, 200, 104, { r: 16, fill: '#F1F4F9' });
    T(sk, v, 16, 28, i ? 'PayZapp Cash' : 'PayZapp Wallet', { size: 14 });
    T(sk, v, 16, 62, i ? '20.25' : '₹2,160', { size: 24, weight: 700, font: SYS });
    sk.scribble(v, 16, 84, 90);
  })),
  comp(A, { grp: 'footer', name: 'Offers header', x: 22, y: 524, w: 316, h: 26 }, (sk, v) => T(sk, v, 0, 19, 'Explore offers & rewards', { size: 17, weight: 700 })),
  comp(A, { grp: 'footer', name: 'Offer – Score & Win', x: 22, y: 560, w: 316, h: 134 }, (sk, v) => {
    sk.rect(v, 0, 0, 316, 134, { r: 18, fill: '#FFDFAE' });
    T(sk, v, 158, 40, 'SCORE & WIN', { anchor: 'middle', size: 26, weight: 700 });
    sk.scribble(v, 48, 62, 220, { stroke: '#B88A4E' });
    pill(sk, v, 108, 82, 100, 30, 'Learn more');
    sk.circle(v, 276, 32, 26, { fill: '#E2553F' });
  }),
  ...[['Free-hit!', '#DDF2CF', 22], ['Power-play!', '#FFE1DA', 188]].map(([t, fill, x]) => comp(A, { grp: 'footer', name: `Offer – ${t}`, x, y: 708, w: 150, h: 112 }, (sk, v) => {
    sk.rect(v, 0, 0, 150, 112, { r: 16, fill });
    T(sk, v, 16, 36, t, { size: 18, weight: 700 }); sk.scribble(v, 16, 60, 110); sk.scribble(v, 16, 78, 80);
  })),
];

// ---------------------------------------------------------------- BEFORE: the everyday PayZapp home
{
  const wash = phoneB.querySelector('.top-wash'), v = svgFor(wash, 360, 236), sk = sketch(v, { seed: 41 });
  sk.rect(v, -4, -4, 368, 244, { fill: '#DDEFE7', stroke: 'none' });
  [0, 1, 2].forEach((k) => sk.rect(v, 250 + k * 8, 120 - k * 18, 90, 46, { r: 6, fill: '#9CCDB5' }));   // cash stack
}
const compsB = [
  statusBar(phoneB), ...avatarBell(phoneB),
  comp(phoneB, { name: 'Before – Loan offer', x: 22, y: 98, w: 230, h: 104 }, (sk, v) => {
    T(sk, v, 0, 24, 'Need cash in a flash?', { size: 21, weight: 700 });
    sk.scribble(v, 0, 46, 210, { stroke: '#6E8A7E' }); sk.scribble(v, 0, 62, 170, { stroke: '#6E8A7E' });
    pill(sk, v, 0, 74, 110, 30, 'Apply now', '#F4F7F5');
  }),
  ...[['Scan any', 'QR'], ['Pay', 'Anyone'], ['Bank', 'Transfer'], ['Check', 'Balance']].map((lbl, i) =>
    comp(phoneB, { name: `Before – ${lbl.join(' ')}`, x: 8 + i * 87, y: 250, w: 84, h: 100 }, (sk, v, w) => tile(sk, v, w, lbl, '#D9E1EC'))),
  comp(phoneB, { name: 'Before – UPI ID', x: 80, y: 362, w: 200, h: 26 }, (sk, v) => pill(sk, v, 0, 0, 200, 26, 'UPI ID: 828…@pz', '#EEF2F6')),
  ...[['Bill &', 'Recharges'], ['Accounts', '& Cards'], ['PayZapp', 'Wallet'], ['Passbook', '& Insights']].map((lbl, i) =>
    comp(phoneB, { name: `Before – ${lbl.join(' ')}`, x: 8 + i * 87, y: 408, w: 84, h: 100 }, (sk, v, w) => tile(sk, v, w, lbl, '#EEF2F6'))),
  comp(phoneB, { name: 'Before – Offers', x: 22, y: 530, w: 316, h: 170 }, (sk, v) => {
    T(sk, v, 0, 19, 'Explore offers & rewards', { size: 17, weight: 700 });
    sk.rect(v, 0, 36, 316, 130, { r: 18, fill: '#EDEFF2' });
    sk.scribble(v, 20, 80, 200); sk.scribble(v, 20, 100, 150);
  }),
];

// ---------------------------------------------------------------- build: each component slides up into place, whole
const SLIDE = 36;
compsA.forEach((c) => gsap.set(c.el, { y: SLIDE, opacity: 0 }));
const PHONE0 = { x: 400, y: 1450 };
const phone = S(phoneEl, { x: PHONE0.x, y: PHONE0.y, z: 0, rotationX: 0, rotationY: -360, rotationZ: 18 });
const content = A.querySelector('.content'), washA = A.querySelector('.top-wash');

// ================================================================ 1 · Arrival
s.beat('phone.fly', { at: 0, dur: ARRIVE.dur, ease: ARRIVE.ease, note: 'Phone slides in from the bottom right, turning one full rotation, and lands (screen lit, empty)' }, (b) =>
  phone.to(b, { x: 0, y: 0, rotationY: 0, rotationZ: 0 }));
s.beat('cam.zoom', { at: 0, dur: ARRIVE.dur, ease: PUSH.ease, note: 'Camera pushes in with the fly-in; lands with it' }, (b) => cam.to(b, { s: 2.4 }));
s.beat('cam.frame', { at: 0, dur: ARRIVE.dur, ease: PUSH.ease, note: 'Framing settles on the top of the phone with the landing' }, (b) => cam.to(b, { fy: -270 }));

// ================================================================ 3 · Travel
s.beat('cam.travel', { at: ARRIVE.dur - 12, dur: 158, ease: [0.42, 0, 0.3, 1], note: 'Camera travels slowly down to the bottom of the screen' }, (b) => cam.to(b, { ty: 485 }));
s.beat('screen.scroll', { at: 64, dur: 118, ease: [0.4, 0, 0.3, 1], note: 'Screen scrolls up a little so the IPL offers come into view' }, (b) => b.fromTo(content, { y: 0 }, { y: -92 }));

// ================================================================ 2 · Build
gsap.set(washA, { opacity: 0, y: -60 });
s.beat('screen.wash', { at: 54, dur: 14, ease: 'settle', note: 'The IPL stadium backdrop fades in just before the banner content lands' }, (b) =>
  b.fromTo(washA, { opacity: 0, y: -60 }, { opacity: 1, y: 0 }));
Object.entries(BUILD).forEach(([grp, at]) => {
  const list = compsA.filter((c) => c.grp === grp);
  s.beat(`fly.${grp}`, { at, dur: 18, stagger: 3, ease: [0.2, 0.7, 0.3, 1], note: `${grp}: components slide into place, whole` }, (b) => list.forEach((c, i) => {
    b.fromTo(c.el, { y: SLIDE }, { y: 0 }, { i });
    b.fromTo(c.el, { opacity: 0 }, { opacity: 1 }, { i, dur: 5, ease: 'fade' });
  }));
});

// ================================================================ 4 · Before / After
const BA_POS = 232, BA_VIEW = { rx: 0, rz: 0, ry: 0, s: 1.75, ty: 80 };
const phoneBefore = S(phoneB, { x: -1500, y: 0, z: 0, rotationX: 0, rotationY: 30, rotationZ: 0, autoAlpha: 0 });
s.beat('ba.reframe', { at: BA.start, dur: BA.move, ease: 'move', note: 'Before/After: camera squares up; the IPL home slides right, upright' }, (b) => {
  cam.to(b, BA_VIEW);
  phone.to(b, { x: BA_POS, y: 0, z: 0, rotationY: 0 });
  b.fromTo(content, { y: -92 }, { y: 0 }, { dur: 30 });
});
s.beat('ba.beforeIn', { at: BA.start + 10, dur: BA.move, ease: 'settle', note: 'The everyday PayZapp home slides in on the left' }, (b) => {
  phoneBefore.to(b, { autoAlpha: 1 }, { dur: 1 });
  phoneBefore.to(b, { x: -BA_POS, rotationY: 0 });
});
const baLayer = document.createElement('div'); baLayer.id = 'baLabels'; $('#stage').appendChild(baLayer);
const baLabels = [['Before', phoneB], ['After', phoneEl]].map(([title, el]) => {
  const d = document.createElement('div'); d.className = 'ba-label'; d.dataset.name = `Label – ${title}`;
  d.innerHTML = `<b>${title}</b>`; baLayer.appendChild(d); gsap.set(d, { opacity: 0, xPercent: -50, yPercent: -100 });
  return { d, el };
});
s.beat('ba.labels', { at: BA.labels, dur: 16, stagger: 6, ease: 'settle', note: 'Before / After labels rise in above the phones' }, (b) =>
  b.each(baLabels.map((l) => l.d), { opacity: 0, y: 24 }, { opacity: 1, y: 0 }));
s.beat('ba.labelsOut', { at: BA.out - 6, dur: 12, ease: 'exit', note: 'Labels lift away' }, (b) =>
  b.fromTo(baLabels.map((l) => l.d), { opacity: 1, y: 0 }, { opacity: 0, y: -20 }));
const stageEl = $('#stage');
s.onFrame(() => {
  const sr = stageEl.getBoundingClientRect(), k = sr.width / 1920;
  baLabels.forEach(({ d, el }) => {
    if (+getComputedStyle(d).opacity === 0) return;
    const r = el.getBoundingClientRect();
    Object.assign(d.style, { left: `${(r.left + r.width / 2 - sr.left) / k}px`, top: `${(r.top - sr.top) / k - 50}px` });
  });
}, 55);

// ================================================================ 5 · Split exit
s.beat('ba.beforeOut', { at: BA.out, dur: 36, ease: [0.4, 0, 0.75, 0.55], note: 'The everyday home slides out left, flipping' }, (b) => {
  phoneBefore.to(b, { x: -1150, rotationY: -180 });
  phoneBefore.to(b, { autoAlpha: 0 }, { at: 35, dur: 1 });
});
const PHONE_OFF = BA.out, NUM0 = PHONE_OFF + 14;
s.beat('phone.out', { at: PHONE_OFF, dur: 36, ease: [0.4, 0, 0.75, 0.55], note: 'The IPL home slides out right, flipping, as the first number lands' }, (b) => {
  phone.to(b, { x: 1150, y: 0, z: 0, rotationY: 180 });
  phone.to(b, { x: PHONE0.x, y: PHONE0.y, z: 0, rotationY: -360, rotationZ: 18 }, { at: 37, dur: 1 });   // parked unseen at its first-frame spot
  compsA.forEach((c) => b.set(c.el, { y: SLIDE, opacity: 0 }, 37));                                      // and its screen back to empty, for the loop
  b.set(washA, { opacity: 0, y: -60 }, 37);
});

// ================================================================ 6 · Number card · 7 · Card stack (placeholders: TBD)
const NUM_S = 2.1;
const CELL = 60 * GRID_K * Math.pow(NUM_S, -GRID_DAMP);
const CARD = { w: 12 * CELL, h: 5 * CELL, gap: CELL };
const cardY = (i) => i * (CARD.h + CARD.gap) + CELL / 2;
const FY = -270, tyFor = (yc) => yc - FY;
const CALLOUTS = [   // the brief's three goals: growth, activation, engagement — numbers to come from the campaign data
  { kicker: 'New users', num: '?×', label: 'New users', viz: 'bars', mult: 1.6 },
  { kicker: 'Activation', num: '?%', label: 'Users activated', viz: 'people' },
  { kicker: 'Transactions', num: '?×', label: 'Monthly transactions', viz: 'bars', mult: 1.9 },
];
const BAR_H = 70;
const PERSON = '<svg viewBox="0 0 24 36"><circle cx="12" cy="7.5" r="6.5"/><path d="M1.5 35v-8.5C1.5 20 6 16.5 12 16.5S22.5 20 22.5 26.5V35z"/></svg>';
const vizHtml = (c) => c.viz === 'bars'
  ? `<div class="viz bars"><div class="col"><i class="bar pre" style="height:${BAR_H}px"></i><span>Pre</span></div><i class="chev" style="margin-bottom:${26 + BAR_H / 2 - 14}px"><svg viewBox="0 0 18 18"><path d="M6 3l6 6-6 6"/></svg></i><div class="col"><i class="bar ipl" style="height:${BAR_H}px"></i><span>IPL</span></div></div>`
  : `<div class="viz people"><div class="group">${[0, 1, 2, 3, 4].map((k) => `<i class="pp p${k}${k === 3 ? ' on' : ''}">${PERSON}</i>`).join('')}</div></div>`;
const cards = CALLOUTS.map((c, i) => {
  const at = NUM0 + i * BEAT;
  const el = document.createElement('div');
  el.className = 'co'; el.dataset.name = `Card – ${c.kicker}`;
  Object.assign(el.style, { width: `${CARD.w}px`, height: `${CARD.h}px` });
  el.innerHTML = `<i class="co-bg"></i><span class="tbd">TBD</span><div class="txt"><b class="num">${c.num}</b><span class="lbl">${c.label}</span></div>${vizHtml(c)}`;
  $('#world3').appendChild(el);
  const barB = el.querySelector('.bar.ipl'), firstP = el.querySelector('.pp.on');
  s.onFrame((f) => {   // the chart grows as the card lands
    const p = Math.max(0, Math.min(1, (f - at - 4) / 26)), e = 1 - Math.pow(1 - p, 3);
    if (barB) barB.style.height = `${BAR_H * (1 + (c.mult - 1) * e)}px`;
    if (firstP) firstP.style.setProperty('--fill', e.toFixed(3));
  });
  const bg = el.querySelector('.co-bg'), parts = [el.querySelector('.num'), el.querySelector('.lbl'), el.querySelector('.viz'), el.querySelector('.tbd')];
  const off = { x: 0, y: 40 };
  gsap.set(el, { opacity: 0 }); gsap.set(bg, { opacity: 0 }); gsap.set(parts, { opacity: 0, y: 16 });
  s.beat(`number.${c.kicker.toLowerCase().replace(/\W+/g, '-')}`, { at, dur: 16, ease: 'settle', note: `Number: ${c.label} (placeholder)` }, (b) => {
    b.fromTo(off, { y: 40 }, { y: 0 }, { dur: 18 });
    b.fromTo(el, { opacity: 0 }, { opacity: 1 }, { dur: 1 });
    b.fromTo(bg, { opacity: 0 }, { opacity: 1 }, { dur: 12, ease: 'fade' });
    b.each(parts, { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, { at: 6, dur: 16 });
    if (i) cam.to(b, { ty: tyFor(cardY(i)) }, { at: -6, dur: 30, ease: 'move' });
    else cam.to(b, { ty: tyFor(cardY(0)), s: NUM_S }, { at: PHONE_OFF - NUM0, dur: 52, ease: 'move' });
  });
  return { el, off };
});
s.onFrame(() => cards.forEach((c, i) => { c.el.style.transform = `translate3d(${-CARD.w / 2 + c.off.x}px, ${cardY(i) - CARD.h / 2 + c.off.y}px, 0)`; }), 60);

// ================================================================ 8 · Loop out
const EXIT = NUM0 + 2 * BEAT + 64;
s.beat('loop.cards', { at: EXIT, dur: 24, stagger: 4, ease: 'exit', note: 'The three cards slide off to the right' }, (b) => cards.forEach((c, i) => {
  b.fromTo(c.off, { x: 0 }, { x: 1600 }, { at: i * 4 });
  b.fromTo(c.el, { opacity: 1 }, { opacity: 0 }, { at: i * 4 + 23, dur: 1 });
}));
s.beat('loop.camera', { at: EXIT + 4, dur: ARRIVE.dur, ease: [0.7, 0, 0.45, 1], note: 'Camera eases back to the opening view as the cards clear' }, (b) =>
  cam.to(b, { ...CAM0, fx: 0, fy: 0, ty: 0 }));

// ---------------------------------------------------------------- animatic HUD: the theme's eight aspects
shotHud(s, stageEl, [
  { id: 'arrival', at: 0, dur: 38, title: 'Arrival', action: 'Phone rises in from bottom right with one full turn; camera pushes in, lands with it' },
  { id: 'build', at: 38, dur: 92, title: 'Build', action: 'IPL home assembles piece by piece: stadium spotlight, PLAY\'ZAPP!, tiles, cards, offers' },
  { id: 'travel', at: 130, dur: 66, title: 'Travel', action: 'Camera travels down the screen while it scrolls to the IPL offers' },
  { id: 'before-after', at: 196, dur: 164, title: 'Before / After', action: 'Camera squares up; the everyday PayZapp home slides in beside the IPL one' },
  { id: 'split', at: 360, dur: 14, title: 'Split exit', action: 'The pair splits apart, each flipping as it leaves' },
  { id: 'number', at: 374, dur: 66, title: 'Number card', action: 'PLACEHOLDER: new users — real number needed' },
  { id: 'stack', at: 440, dur: EXIT - 440, title: 'Card stack', action: 'PLACEHOLDER: users activated, monthly transactions — real numbers needed' },
  { id: 'loop', at: EXIT, dur: 624 - EXIT, title: 'Loop out', action: 'Cards slide off right; camera eases back to the opening view' },
]);

await Promise.all([700, 800].map((w) => document.fonts.load(`${w} 20px ManropeLocal`)));
s.ready({ tail: -1 });
