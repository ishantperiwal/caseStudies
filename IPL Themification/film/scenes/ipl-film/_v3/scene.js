// IPL Themification · storyboard animatic · 1920x1200 · 25 fps. Rough drawings only — for the idea, not the look.
// Story: one payment, played as a cricket over (every action scores runs) → pull back: the same slots
// re-skin for any season (the theming system the IPL work became).
import { gsap } from 'gsap';
import { studio } from '@studio/studio.js';
import { camera } from '@studio/kits/camera.js';
import { sketch, shotHud } from '@studio/kits/sketch.js';

const s = await studio({ id: 'ipl-film', width: 1920, height: 1200, fps: 25 });
const ink = document.getElementById('ink');
const sk = sketch(ink, { seed: 3 });
const G = (name, parent = ink) => sk.group(parent, name);
const C = { blue: '#2F6FD6', red: '#D64533', green: '#3CB371', gold: '#F2B33D', navy: '#1F3550' };

// ---------------------------------------------------------------- the phone and its screens
const P = { x: 770, y: 190, w: 380, h: 800 }, SC = { x: 794, y: 250, w: 332, h: 700 };
const phone = G('Phone');
sk.rect(phone, P.x, P.y, P.w, P.h, { r: 50, strokeWidth: 3 });
sk.rect(phone, P.x + 150, P.y + 22, 80, 20, { r: 10, fill: '#2b2b2b' });
const screen = (name) => G(name, phone);

const launcher = screen('Launcher');
for (let i = 0; i < 8; i++) {
  const x = SC.x + 20 + (i % 4) * 80, y = SC.y + 470 + Math.floor(i / 4) * 90;
  sk.rect(launcher, x, y, 56, 56, i === 5 ? { r: 14, fill: C.red } : { r: 14 });
}
sk.text(launcher, SC.x + 128, SC.y + 655, 'PayZapp', { size: 18 });
sk.text(launcher, SC.x + 166, SC.y + 120, '9:41', { size: 56, anchor: 'middle' });

const splash = screen('Splash');
sk.text(splash, SC.x + 166, SC.y + 380, 'PAYZAPP', { size: 52, anchor: 'middle', weight: 700, color: C.blue });
const bat = G('Splash – bat', splash); sk.rect(bat, SC.x + 150, SC.y + 160, 34, 150, { r: 10, fill: '#E7C27A' });
const ball0 = G('Splash – ball', splash); sk.circle(ball0, SC.x + 230, SC.y + 270, 44, { fill: C.red });
sk.text(splash, SC.x + 166, SC.y + 440, 'IPL logo animation', { size: 20, anchor: 'middle', color: '#888' });

const scan = screen('Scanner');
sk.rect(scan, SC.x + 56, SC.y + 170, 220, 220, { fill: '#ddd', fillStyle: 'cross-hatch' });
sk.text(scan, SC.x + 166, SC.y + 440, 'Scan any QR', { size: 22, anchor: 'middle' });
sk.path(scan, `M${SC.x} ${SC.y + 110} Q${SC.x + 166} ${SC.y + 40} ${SC.x + 332} ${SC.y + 110}`, { strokeWidth: 3 });   // stadium
sk.text(scan, SC.x + 166, SC.y + 95, 'stadium', { size: 18, anchor: 'middle', color: '#888' });
const burst = (name, cx, cy, n) => {
  const g = G(name, scan);
  const pts = Array.from({ length: 16 }, (_, k) => { const r = k % 2 ? 34 : 62, a = (k * Math.PI) / 8; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; });
  sk.path(g, `M${pts.join(' L')} Z`, { fill: C.gold });
  sk.text(g, cx, cy + 18, n, { size: 52, anchor: 'middle', weight: 700 });
  return g;
};
const b4 = burst('Burst – 4', SC.x + 70, SC.y + 520, '4'), b6 = burst('Burst – 6', SC.x + 250, SC.y + 560, '6');

const pay = screen('Pay');
sk.circle(pay, SC.x + 166, SC.y + 170, 80, { fill: '#eee' });
sk.text(pay, SC.x + 166, SC.y + 250, 'Apna Kirana', { size: 24, anchor: 'middle' });
sk.text(pay, SC.x + 166, SC.y + 340, '₹99', { size: 70, anchor: 'middle', weight: 700 });
sk.rect(pay, SC.x + 40, SC.y + 590, 252, 60, { r: 30, fill: C.blue });
sk.text(pay, SC.x + 166, SC.y + 628, 'Pay', { size: 28, anchor: 'middle', color: '#fff' });

const success = screen('Payment success');
sk.rect(success, SC.x, SC.y - 40, SC.w, 380, { fill: C.green, stroke: 'none' });
const ring = G('Success – ring', success); sk.circle(ring, SC.x + 166, SC.y + 170, 130, { stroke: '#fff', strokeWidth: 6 });
const tick = sk.path(success, `M${SC.x + 126} ${SC.y + 172} L${SC.x + 156} ${SC.y + 202} L${SC.x + 210} ${SC.y + 140}`, { stroke: '#fff', strokeWidth: 8 });
tick.dataset.name = 'Success – tick';
sk.text(success, SC.x + 166, SC.y + 420, '₹99 paid', { size: 30, anchor: 'middle' });
const ball = G('Cricket ball', success); sk.circle(ball, SC.x + 166, SC.y + 170, 46, { fill: C.red });
const sheet = G('Runs sheet', success);
sk.rect(sheet, SC.x, SC.y + 470, SC.w, 240, { fill: C.navy });
sk.text(sheet, SC.x + 30, SC.y + 560, '+6 RUNS', { size: 46, weight: 700, color: '#fff' });
sk.text(sheet, SC.x + 30, SC.y + 610, 'scored', { size: 28, color: '#cfd8e3' });

const refer = screen('Refer & Score');
sk.text(refer, SC.x + 166, SC.y + 110, 'Refer & Score', { size: 36, anchor: 'middle', weight: 700 });
sk.text(refer, SC.x + 166, SC.y + 150, 'POWER-PLAY', { size: 20, anchor: 'middle', color: '#888' });
sk.rect(refer, SC.x + 96, SC.y + 240, 140, 100, { fill: '#9cc7f2' });
sk.path(refer, `M${SC.x + 96} ${SC.y + 240} L${SC.x + 166} ${SC.y + 300} L${SC.x + 236} ${SC.y + 240}`, { strokeWidth: 2 });
sk.rect(refer, SC.x + 66, SC.y + 420, 200, 56, { r: 28, fill: '#fff' });
sk.text(refer, SC.x + 166, SC.y + 456, 'Share invite', { size: 24, anchor: 'middle' });

const screens = { launcher, splash, scan, pay, success, refer };
gsap.set(Object.values(screens), { autoAlpha: 0 }); gsap.set(launcher, { autoAlpha: 1 });
const show = (b, id, at = 0) => Object.entries(screens).forEach(([k, g]) => b.set(g, { autoAlpha: k === id ? 1 : 0 }, at));

// tap marker
const tap = G('Tap'); sk.circle(tap, 0, 0, 44, { fill: '#ffffffaa', strokeWidth: 3 });
gsap.set(tap, { autoAlpha: 0, x: 0, y: 0 });
const tapAt = (name, at, x, y) => s.beat(name, { at, dur: 14, note: 'Tap' }, (b) => {
  b.set(tap, { x, y, autoAlpha: 1, scale: 1, transformOrigin: '50% 50%' });
  b.fromTo(tap, { scale: 1 }, { scale: 0.7 }, { dur: 5, ease: 'snap' });
  b.fromTo(tap, { scale: 0.7 }, { scale: 1 }, { at: 5, dur: 6, ease: 'overshoot' });
  b.set(tap, { autoAlpha: 0 }, 14);
});

// ---------------------------------------------------------------- leaderboard (beside the phone)
const L = { x: 1260, y: 300 };
const board = G('Leaderboard');
sk.rect(board, L.x, L.y, 440, 560, { r: 18, strokeWidth: 3 });
sk.text(board, L.x + 30, L.y + 60, 'Leaderboard · Runs', { size: 32, weight: 700 });
const ROWS = [['Arup', 902], ['Bharat', 838], ['Meera', 831], ['Kabir', 786], ['You', 783]];
const rowY = (rank) => L.y + 100 + rank * 86;
let youText;
const rows = ROWS.map(([name, runs], i) => {
  const g = G(`Row – ${name}`, board);
  sk.rect(g, L.x + 20, 0, 400, 70, name === 'You' ? { r: 12, fill: C.gold, fillStyle: 'hachure' } : { r: 12 });
  sk.text(g, L.x + 44, 45, name, { size: 28, weight: name === 'You' ? 700 : 400 });
  const t = sk.text(g, L.x + 396, 45, String(runs), { size: 28, anchor: 'end' });
  if (name === 'You') youText = t;
  gsap.set(g, { y: rowY(i) });
  return g;
});
const [rArup, rBharat, rMeera, rKabir, rYou] = rows;
const you = { runs: 783 };
s.onFrame(() => { youText.textContent = Math.round(you.runs); });
gsap.set(board, { autoAlpha: 0, x: 600 });

const token = (name, txt, size) => { const g = G(name); sk.text(g, 0, 0, txt, { size, weight: 700, color: C.red, anchor: 'middle' }); gsap.set(g, { autoAlpha: 0 }); return g; };
const t6 = token('+6', '+6', 90), t50 = token('+50', '+50', 130);

// ---------------------------------------------------------------- the system: four themable slots, any season
const SEASONS = [['IPL', C.blue], ['Diwali', '#E07B1A'], ['Navratri', '#C2378A'], ['Christmas', '#2E8B57']];
const motif = (g, season, cx, cy) => {
  if (season === 'IPL') { sk.circle(g, cx, cy, 50, { fill: C.red }); return; }
  if (season === 'Diwali') { sk.path(g, `M${cx - 34} ${cy} Q${cx} ${cy + 40} ${cx + 34} ${cy} Z`, { fill: '#B5651D' }); sk.path(g, `M${cx} ${cy - 6} Q${cx - 12} ${cy - 30} ${cx} ${cy - 48} Q${cx + 12} ${cy - 30} ${cx} ${cy - 6} Z`, { fill: C.gold }); return; }
  if (season === 'Navratri') { sk.rect(g, cx - 20, cy - 46, 40, 10, { fill: '#7a4a1a' }); sk.circle(g, cx, cy, 64, { fill: '#F6C04E' }); sk.rect(g, cx - 20, cy + 32, 40, 10, { fill: '#7a4a1a' }); return; }
  sk.path(g, `M${cx - 32} ${cy + 26} Q${cx - 30} ${cy - 40} ${cx} ${cy - 40} Q${cx + 30} ${cy - 40} ${cx + 32} ${cy + 26} Z`, { fill: C.gold }); sk.circle(g, cx, cy + 32, 14, { fill: C.red });
};
const RW = 260, RH = 540, RY = 300;
const SLOTS = [   // the surfaces the case study themed: [label, slot rect within the phone]
  ['Splash', [30, 130, 200, 200]], ['Scanner', [20, 110, 220, 240]], ['Payment success', [12, 40, 236, 190]], ['Home banner', [12, 40, 236, 150]],
];
const skins = [];   // skins[season][slot]
const minis = SLOTS.map(([label, [sx, sy, sw, sh]], k) => {
  const x = 960 + (k - 1.5) * 380 - RW / 2;
  const g = G(`Slot phone – ${label}`);
  sk.rect(g, x, RY, RW, RH, { r: 36, strokeWidth: 3 });
  if (label === 'Scanner') sk.rect(g, x + 75, RY + 175, 110, 110, { fill: '#ddd', fillStyle: 'cross-hatch' });
  for (let r = 0; r < 4; r++) sk.scribble(g, x + 30, RY + (label === 'Splash' ? 400 : 300) + r * 40, 180 - r * 20);
  sk.rect(g, x + sx, RY + sy, sw, sh, { r: 12, stroke: '#999', strokeLineDash: [8, 8] });   // the slot
  sk.text(g, x + RW / 2, RY + RH + 50, label, { size: 28, anchor: 'middle', color: '#555' });
  SEASONS.forEach(([season, col], si) => {
    const sg = G(`${label} – ${season}`, g);
    sk.rect(sg, x + sx, RY + sy, sw, sh, { r: 12, fill: col, fillStyle: 'hachure', hachureGap: 7, stroke: col });
    motif(sg, season, x + sx + sw / 2, RY + sy + sh / 2);
    (skins[si] ||= []).push(sg);
    gsap.set(sg, { autoAlpha: 0 });
  });
  gsap.set(g, { autoAlpha: 0, y: 700 });
  return g;
});
const seasonWord = G('Season');
const words = SEASONS.map(([season, col]) => { const t = sk.text(seasonWord, 960, 190, season, { size: 84, anchor: 'middle', weight: 700, color: col }); gsap.set(t, { autoAlpha: 0 }); return t; });

// ---------------------------------------------------------------- camera
const cam = camera(s, document.getElementById('cam'), { start: 'wide', views: {
  wide: { x: 960, y: 590, zoom: 1 }, phone: { x: 960, y: 590, zoom: 1.3 }, scan: { x: 960, y: 560, zoom: 1.55 },
  board: { x: 1220, y: 590, zoom: 1.05 }, row: { x: 960, y: 560, zoom: 0.95 },
} });
gsap.set(phone, { y: 900, rotation: -10, transformOrigin: '50% 50%' });

// ================================================================ 1 · Open the app
s.beat('open.arrive', { at: 0, dur: 36, ease: [0.22, 0.6, 0.3, 1], note: 'Phone rises in' }, (b) => {
  b.fromTo(phone, { y: 900, rotation: -10 }, { y: 0, rotation: 0 });
  cam.to(b, 'phone');
});
tapAt('open.tap', 40, SC.x + 108, SC.y + 498);
s.beat('open.splash', { at: 50, dur: 30, ease: 'settle', note: 'App opens on the IPL splash: logo, bat swings, ball spins in' }, (b) => {
  show(b, 'splash');
  b.fromTo(bat, { rotation: -60, transformOrigin: '50% 100%' }, { rotation: 0 }, { dur: 16 });
  b.fromTo(ball0, { x: 160, rotation: 0, transformOrigin: '50% 50%' }, { x: 0, rotation: 360 }, { at: 8, dur: 20 });
});

// ================================================================ 2 · Scan: the stadium
s.beat('scan.in', { at: 92, dur: 24, ease: 'move', note: 'Scanner opens with a stadium vibe; camera pushes in' }, (b) => { show(b, 'scan'); cam.to(b, 'scan'); });
gsap.set([b4, b6], { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' });
s.beat('scan.four', { at: 116, dur: 14, ease: 'overshoot', note: 'A FOUR goes off' }, (b) => b.fromTo(b4, { autoAlpha: 1, scale: 0 }, { scale: 1 }));
s.beat('scan.six', { at: 132, dur: 14, ease: 'overshoot', note: 'then a SIX' }, (b) => b.fromTo(b6, { autoAlpha: 1, scale: 0 }, { scale: 1 }));

// ================================================================ 3 · Pay → the ball becomes the tick
s.beat('pay.in', { at: 160, dur: 24, ease: 'move', note: 'Pay ₹99 to Apna Kirana' }, (b) => { show(b, 'pay'); cam.to(b, 'phone'); });
tapAt('pay.tap', 186, SC.x + 166, SC.y + 620);
gsap.set([ring, tick], { autoAlpha: 0 }); gsap.set(ball, { y: -420 }); gsap.set(sheet, { y: 260, autoAlpha: 0 });
s.beat('success.ball', { at: 200, dur: 46, note: 'Success: a cricket ball bounces in and settles…' }, (b) => {
  show(b, 'success');
  [[-420, 0, 12, 'power2.in'], [0, -110, 8, 'power2.out'], [-110, 0, 8, 'power2.in'], [0, -40, 6, 'power2.out'], [-40, 0, 6, 'power2.in']]
    .reduce((t, [a, z, d, e]) => { b.fromTo(ball, { y: a }, { y: z }, { at: t, dur: d, ease: (p) => gsap.parseEase(e)(p) }); return t + d; }, 0);
});
s.beat('success.tick', { at: 242, dur: 14, ease: 'settle', note: '…into the checkmark' }, (b) => {
  b.fromTo(ball, { autoAlpha: 1, scale: 1, transformOrigin: '50% 50%' }, { autoAlpha: 0, scale: 2.6 });
  b.fromTo(ring, { autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1 });
  b.fromTo(tick, { autoAlpha: 0 }, { autoAlpha: 1 }, { at: 6, dur: 6 });
});
s.beat('runs.sheet', { at: 262, dur: 16, ease: 'settle', note: 'The runs sheet slides up: +6 runs scored' }, (b) => { b.set(sheet, { autoAlpha: 1 }); b.fromTo(sheet, { y: 260 }, { y: 0 }); });

// ================================================================ 4 · Runs land on the leaderboard
s.beat('board.in', { at: 286, dur: 30, ease: 'move', note: 'Camera opens up; the leaderboard slides in beside the phone' }, (b) => {
  cam.to(b, 'board');
  b.fromTo(board, { autoAlpha: 1, x: 600 }, { x: 0 });
});
const fly = (name, g, at, from, to, note) => s.beat(name, { at, dur: 26, note }, (b) => {
  b.set(g, { autoAlpha: 1 });
  b.fromTo(g, { x: from[0] }, { x: to[0] }, { ease: 'move' });
  b.fromTo(g, { y: from[1] }, { y: to[1] }, { ease: [0.3, -0.6, 0.6, 1] });   // arcs up, then drops onto the row
  b.set(g, { autoAlpha: 0 }, 26);
});
fly('runs.fly6', t6, 314, [SC.x + 100, SC.y + 560], [L.x + 330, rowY(4) + 50], '+6 flies from the sheet onto your row');
s.beat('runs.count6', { at: 340, dur: 10, ease: 'move', note: '783 → 789' }, (b) => b.fromTo(you, { runs: 783 }, { runs: 789 }));
s.beat('runs.climb6', { at: 346, dur: 16, ease: 'move', note: 'You pass Kabir' }, (b) => {
  b.fromTo(rYou, { y: rowY(4) }, { y: rowY(3) }); b.fromTo(rKabir, { y: rowY(3) }, { y: rowY(4) });
});

// ================================================================ 5 · Power-play: refer a friend
s.beat('refer.in', { at: 372, dur: 20, ease: 'move', note: 'Refer & Score — the Power-play' }, (b) => show(b, 'refer'));
tapAt('refer.tap', 396, SC.x + 166, SC.y + 448);
fly('refer.fly50', t50, 410, [SC.x + 166, SC.y + 420], [L.x + 330, rowY(3) + 60], '+50, the biggest single reward');
s.beat('refer.count', { at: 436, dur: 12, ease: 'move', note: '789 → 839' }, (b) => b.fromTo(you, { runs: 789 }, { runs: 839 }));
s.beat('refer.climb', { at: 442, dur: 20, ease: 'move', note: 'You jump to #2' }, (b) => {
  b.fromTo(rYou, { y: rowY(3) }, { y: rowY(1) }); b.fromTo(rBharat, { y: rowY(1) }, { y: rowY(2) }); b.fromTo(rMeera, { y: rowY(2) }, { y: rowY(3) });
});

// ================================================================ 6 · Pull back: it was slots all along
s.beat('system.out', { at: 486, dur: 30, ease: 'exit', note: 'Phone and leaderboard clear…' }, (b) => {
  b.fromTo(phone, { y: 0, autoAlpha: 1 }, { y: -900 });
  b.fromTo(board, { x: 0 }, { x: 900 });
  b.set([phone, board], { autoAlpha: 0 }, 30);
});
s.beat('system.in', { at: 494, dur: 34, stagger: 4, ease: 'settle', note: '…as the four themed surfaces rise in, each with its slot' }, (b) => {
  cam.to(b, 'row');
  minis.forEach((g, i) => b.fromTo(g, { autoAlpha: 1, y: 700 }, { y: 0 }, { i }));
});
s.beat('system.ipl', { at: 530, dur: 12, stagger: 3, ease: 'fade', note: 'Slots fill: IPL' }, (b) => {
  skins[0].forEach((g, i) => b.fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1 }, { i }));
  b.fromTo(words[0], { autoAlpha: 0 }, { autoAlpha: 1 });
});

// ================================================================ 7 · Any season
const seasonAt = [0, 570, 610, 650];
[1, 2, 3].forEach((si) => s.beat(`season.${SEASONS[si][0].toLowerCase()}`, { at: seasonAt[si], dur: 12, stagger: 3, ease: 'fade', note: `Same slots → ${SEASONS[si][0]}` }, (b) => {
  skins[si].forEach((g, i) => { b.fromTo(g, { autoAlpha: 0 }, { autoAlpha: 1 }, { i }); b.fromTo(skins[si - 1][i], { autoAlpha: 1 }, { autoAlpha: 0 }, { i, at: 10, dur: 1 }); });
  b.fromTo(words[si - 1], { autoAlpha: 1 }, { autoAlpha: 0 }, { dur: 6 });
  b.fromTo(words[si], { autoAlpha: 0 }, { autoAlpha: 1 }, { at: 4 });
}));

// ================================================================ 8 · Loop out
s.beat('loop.out', { at: 694, dur: 30, stagger: 3, ease: 'exit', note: 'Phones drop away; back to the start' }, (b) => {
  minis.forEach((g, i) => b.fromTo(g, { y: 0 }, { y: 800 }, { i }));
  b.fromTo(words[3], { autoAlpha: 1 }, { autoAlpha: 0 }, { dur: 8 });
  cam.to(b, 'wide', { dur: 30, ease: 'move' });
});

shotHud(s, document.getElementById('stage'), [
  { id: 'open', at: 0, dur: 92, title: 'Open the app', action: 'Tap PayZapp → IPL splash: logo, bat swings, ball spins in' },
  { id: 'scan', at: 92, dur: 68, title: 'Scan', action: 'Scanner gets a stadium vibe — a FOUR, then a SIX go off' },
  { id: 'pay', at: 160, dur: 126, title: 'Pay', action: 'Pay ₹99 → a cricket ball bounces into the tick → +6 runs sheet' },
  { id: 'board', at: 286, dur: 86, title: 'Runs count', action: '+6 flies to the leaderboard; you pass Kabir' },
  { id: 'refer', at: 372, dur: 114, title: 'Power-play', action: 'Refer & Score: +50, the biggest reward — you jump to #2' },
  { id: 'system', at: 486, dur: 84, title: 'Pull back', action: 'It was themable slots all along: splash, scanner, success, home banner' },
  { id: 'seasons', at: 570, dur: 124, title: 'Any season', action: 'Same slots → Diwali → Navratri → Christmas' },
  { id: 'loop', at: 694, dur: 30, title: 'Loop', action: 'Back to the start' },
]);
s.ready({ tail: 0 });
