// IPL Themification · storyboard animatic · 1920x1200 · 25 fps. Rough drawings only — for the idea, not the look.
// Idea: show the body of work. Every themed screen sits on a wall of columns that drift up and down on a loop;
// the camera zooms into one screen, pans to the next, and so on, then pulls back to the wall.
import { gsap } from 'gsap';
import { studio } from '@studio/studio.js';
import { sketch, shotHud } from '@studio/kits/sketch.js';

const s = await studio({ id: 'ipl-film', width: 1920, height: 1200, fps: 25 });
const ink = document.getElementById('ink'), camEl = document.getElementById('cam');
const sk = sketch(ink, { seed: 5 });
const C = { blue: '#2F6FD6', red: '#D64533', green: '#3CB371', gold: '#F2B33D', navy: '#1F3550', sky: '#BFDDF5', grass: '#9FD38A' };
const W = 300, H = 620, PITCH = H + 60;

// ---------------------------------------------------------------- the screens (each drawn at 0,0 → W,H)
const T = (g, x, y, t, o = {}) => sk.text(g, x, y, t, { size: 22, anchor: 'middle', ...o });
const ball = (g, cx, cy, d = 40) => sk.circle(g, cx, cy, d, { fill: C.red });
const lines = (g, y, n = 3) => { for (let i = 0; i < n; i++) sk.scribble(g, 40, y + i * 30, 200 - i * 30); };
const SCREENS = {
  'Splash': (g) => { sk.rect(g, 135, 150, 26, 140, { r: 8, fill: '#E7C27A' }); ball(g, 205, 260, 40); T(g, 150, 360, 'PAYZAPP', { size: 40, weight: 700, color: C.blue }); T(g, 150, 400, 'IPL logo animation', { size: 16, color: '#888' }); },
  'Promo video': (g) => { sk.rect(g, 0, 0, W, H, { r: 30, fill: C.sky, fillStyle: 'hachure', stroke: 'none' }); sk.circle(g, 150, 300, 110, { fill: '#fff' }); sk.path(g, 'M132 270 L132 330 L182 300 Z', { fill: '#2b2b2b' }); T(g, 150, 420, 'Season explainer', { size: 20 }); },
  'Home spotlight': (g) => { sk.rect(g, 0, 0, W, 210, { fill: C.sky, stroke: 'none' }); sk.path(g, 'M0 160 Q150 110 300 160', { strokeWidth: 2 }); sk.rect(g, 0, 165, W, 45, { fill: C.grass, stroke: 'none' }); T(g, 150, 90, "PLAY'ZAPP!", { size: 30, weight: 700 }); ball(g, 40, 70, 30);
    for (let i = 0; i < 4; i++) sk.rect(g, 22 + i * 68, 240, 50, 50, { r: 12, fill: '#D6E4FA' }); lines(g, 340, 4); },
  'Bottom sheet': (g) => { lines(g, 60, 4); sk.rect(g, 0, 300, W, 320, { fill: C.navy }); T(g, 150, 370, 'YOU UNLOCKED', { size: 26, weight: 700, color: '#fff' }); T(g, 150, 405, 'AN OFFER!', { size: 26, weight: 700, color: C.gold });
    sk.rect(g, 100, 450, 100, 80, { fill: '#F08A3C' }); sk.rect(g, 140, 450, 20, 80, { fill: C.gold, stroke: 'none' }); },
  'Scanner': (g) => { sk.rect(g, 0, 0, W, H, { r: 30, fill: '#3b4652', stroke: 'none' }); sk.path(g, 'M0 90 Q150 30 300 90', { stroke: '#fff', strokeWidth: 2 }); sk.rect(g, 60, 150, 180, 180, { fill: '#ddd', fillStyle: 'cross-hatch', stroke: '#fff' });
    [[70, 420, '4'], [225, 450, '6']].forEach(([cx, cy, n]) => { const p = Array.from({ length: 16 }, (_, k) => { const r = k % 2 ? 26 : 48, a = (k * Math.PI) / 8; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }); sk.path(g, `M${p.join(' L')} Z`, { fill: C.gold }); T(g, cx, cy + 14, n, { size: 40, weight: 700 }); }); },
  'Payment success': (g) => { sk.rect(g, 0, 0, W, 320, { fill: C.green, stroke: 'none' }); sk.circle(g, 150, 160, 110, { stroke: '#fff', strokeWidth: 5 }); sk.path(g, 'M118 162 L142 186 L188 134', { stroke: '#fff', strokeWidth: 7 }); ball(g, 230, 70, 30);
    T(g, 150, 380, '₹99 paid', { size: 28 }); T(g, 150, 410, 'ball bounces into the tick', { size: 15, color: '#888' }); lines(g, 450); },
  'Runs sheet': (g) => { sk.rect(g, 0, 0, W, 280, { fill: C.green, stroke: 'none' }); sk.rect(g, 0, 300, W, 320, { fill: C.navy }); T(g, 40, 410, '6 RUNS', { size: 46, weight: 700, color: '#fff', anchor: 'start' }); T(g, 40, 455, 'SCORED', { size: 30, color: '#cfd8e3', anchor: 'start' });
    sk.line(g, 230, 360, 230, 460, { stroke: '#fff' }); sk.line(g, 250, 360, 250, 460, { stroke: '#fff' }); },
  'Leaderboard': (g) => { T(g, 150, 60, '#ScoreBigOn', { size: 26, weight: 700, color: C.blue }); sk.rect(g, 30, 90, 240, 120, { r: 14, fill: '#4F6BE8' }); T(g, 150, 135, 'RUNS SCORED BY YOU', { size: 13, color: '#fff' }); T(g, 150, 185, '783', { size: 44, weight: 700, color: '#fff' });
    sk.rect(g, 0, 240, W, 380, { fill: C.grass, stroke: 'none' }); [[1, 'Single'], [2, 'Double'], [4, 'Chauka'], [6, 'Chakka'], [25, 'Free-hit'], [50, 'Power-play']].forEach(([n, t], i) => {
      const x = 22 + (i % 2) * 134, y = 270 + Math.floor(i / 2) * 110; sk.rect(g, x, y, 122, 96, { r: 12, fill: n === 50 ? C.gold : '#7FC36A' }); T(g, x + 14, y + 46, String(n), { size: 36, weight: 700, anchor: 'start' }); T(g, x + 14, y + 78, t, { size: 15, anchor: 'start' }); }); },
  'Refer & Score': (g) => { sk.rect(g, 0, 0, W, H, { r: 30, fill: C.navy, stroke: 'none' }); T(g, 150, 90, 'Refer and Score', { size: 28, weight: 700, color: '#fff' }); T(g, 150, 120, 'POWER-PLAY', { size: 15, color: '#cfd8e3' });
    sk.rect(g, 90, 220, 120, 86, { fill: '#9cc7f2' }); sk.path(g, 'M90 220 L150 270 L210 220', { stroke: '#2b2b2b' }); sk.rect(g, 80, 360, 140, 44, { r: 22, fill: '#fff' }); T(g, 150, 390, 'Share invite', { size: 18 });
    sk.rect(g, 10, 470, 120, 22, { r: 10, fill: '#E7C27A' }); T(g, 150, 560, '+50 runs', { size: 30, weight: 700, color: C.gold }); },
  // the same surfaces, other seasons (the system the IPL work became)
  'Scanner · Diwali': (g) => { sk.rect(g, 0, 0, W, H, { r: 30, fill: '#3b3530', stroke: 'none' }); sk.rect(g, 60, 150, 180, 180, { fill: '#ddd', fillStyle: 'cross-hatch', stroke: '#fff' });
    for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; sk.circle(g, 150 + 118 * Math.cos(a), 240 + 118 * Math.sin(a), 12, { fill: C.gold, stroke: 'none' }); }
    sk.path(g, 'M118 390 Q150 430 182 390 Z', { fill: '#B5651D' }); sk.path(g, 'M150 386 Q138 362 150 342 Q162 362 150 386 Z', { fill: C.gold }); },
  'Scanner · Christmas': (g) => { sk.rect(g, 0, 0, W, H, { r: 30, fill: '#3b4652', stroke: 'none' }); sk.rect(g, 60, 150, 180, 180, { fill: '#ddd', fillStyle: 'cross-hatch', stroke: '#fff' });
    sk.rect(g, 40, 130, 220, 220, { stroke: '#2E8B57', strokeWidth: 16 }); [[60, 150], [240, 330], [240, 150], [60, 330]].forEach(([x, y]) => sk.circle(g, x, y, 14, { fill: C.red, stroke: 'none' }));
    sk.path(g, 'M222 128 Q224 84 250 84 Q276 84 278 128 Z', { fill: C.gold }); },
  'Home · Navratri': (g) => { sk.rect(g, 0, 0, W, 230, { fill: '#F9D9A8', stroke: 'none' }); T(g, 110, 90, 'Festive fun', { size: 28, weight: 700, color: '#8a3b12' }); T(g, 100, 125, 'extra rewards!', { size: 20, color: '#8a3b12' });
    sk.rect(g, 222, 40, 10, 40, { stroke: '#7a4a1a' }); sk.circle(g, 227, 120, 70, { fill: '#F6C04E' }); for (let i = 0; i < 4; i++) sk.rect(g, 22 + i * 68, 260, 50, 50, { r: 12, fill: '#D6E4FA' });
    sk.path(g, 'M20 520 Q150 360 280 520 Z', { fill: '#F2C14E', fillStyle: 'hachure' }); sk.rect(g, 0, 500, W, 120, { fill: '#FFF6D6', stroke: 'none' }); T(g, 150, 560, 'Extra treats', { size: 24, weight: 700, color: '#C2378A' }); },
  'Home · Dussehra': (g) => { sk.rect(g, 0, 0, W, 230, { fill: '#CDEBD9', stroke: 'none' }); T(g, 30, 100, 'Need cash in a flash?', { size: 21, weight: 700, anchor: 'start' }); lines(g, 130, 2);
    for (let i = 0; i < 4; i++) sk.rect(g, 22 + i * 68, 260, 50, 50, { r: 12, fill: '#D6E4FA' }); sk.rect(g, 16, 340, 268, 280, { r: 24, fill: '#5B3A82' });
    sk.circle(g, 150, 380, 120, { fill: C.gold }); T(g, 150, 392, '₹30', { size: 34, weight: 700 }); T(g, 150, 480, 'one bill away!', { size: 20, color: '#fff' }); },
};
// the wall: wide and finite (7 columns × 2, the frame's shape). IPL screens plus the same surfaces in other seasons;
// a repeat is fine. Columns drift slowly, neighbours in opposite directions.
const COLS = [
  ['Scanner · Christmas', 'Home · Dussehra', 'Payment success'],
  ['Leaderboard', 'Splash', 'Bottom sheet'],
  ['Home · Navratri', 'Promo video', 'Runs sheet'],
  ['Refer & Score', 'Scanner', 'Leaderboard'],
  ['Home spotlight', 'Payment success', 'Scanner · Diwali'],
  ['Runs sheet', 'Refer & Score', 'Splash'],
  ['Bottom sheet', 'Home · Navratri', 'Home spotlight'],
];
const SHIFT = [-160, 160, -160, 160, -160, 160, -160], DRIFT = 0.25, MID = 390;
const cards = [];
COLS.forEach((list, c) => list.forEach((name, i) => {
  const g = sk.group(ink, name);
  sk.rect(g, 0, 0, W, H, { r: 30, fill: '#FFFFFF', strokeWidth: 3 });
  SCREENS[name](g);
  sk.rect(g, 0, 0, W, H, { r: 30, strokeWidth: 3 });   // outline again on top of the fills
  cards.push({ g, c, name, x: 960 + (c - 3) * 400, y: 600 + (i - (list.length - 1) / 2) * PITCH + SHIFT[c], st: { o: 0, sc: 0.6 } });
}));
const posOf = (cd, f) => ({ x: cd.x, y: cd.y + (cd.c % 2 ? -1 : 1) * DRIFT * (f - MID) });   // centre of the card
s.onFrame((f) => cards.forEach((cd) => {
  const p = posOf(cd, f), { o, sc } = cd.st;
  cd.g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${sc}) translate(${-W / 2} ${-H / 2})`);
  cd.g.setAttribute('opacity', o);
}));

// ---------------------------------------------------------------- camera: follows a moving screen (or the wall's centre)
// cam.a → cam.b blended by u; -1 = the wall's centre, else a card's index, so the camera tracks a card as it drifts
const Z0 = 0.8, ZOOM = 1.55, ZWALL = 0.6;
const cam = { a: -1, b: -1, u: 1, z: Z0, __label: 'camera' };
const WALL = { x: 960, y: 600 };
const at = (i, f) => (i < 0 ? WALL : posOf(cards[Math.round(i)], f));
s.onFrame((f) => {
  const pa = at(cam.a, f), pb = at(cam.b, f);
  const x = pa.x + (pb.x - pa.x) * cam.u, y = pa.y + (pb.y - pa.y) * cam.u;
  camEl.style.transformOrigin = '0 0';
  camEl.style.transform = `translate(${960 - x * cam.z}px, ${600 - y * cam.z}px) scale(${cam.z})`;
}, -1);

// ================================================================ in: the wall builds from nothing, one screen at a time
// ripple: each screen scales up in place; its delay grows with its distance from the centre, so they pop in as a wave
const RIPPLE = 0.012;   // frames of delay per px from the centre
const dist = (cd) => Math.hypot(posOf(cd, 0).x - 960, posOf(cd, 0).y - 600);
const DMIN = Math.min(...cards.map(dist));
s.beat('wall.in', { at: 0, dur: 14, ease: 'overshoot', note: 'Ripple: screens scale up in place, a wave spreading out from the centre' }, (b) =>
  cards.forEach((cd) => {
    const d = 2 + Math.round((dist(cd) - DMIN) * RIPPLE);   // the wave starts at the screen nearest the centre
    b.fromTo(cd.st, { sc: 0.6 }, { sc: 1 }, { at: d });
    b.fromTo(cd.st, { o: 0 }, { o: 1 }, { at: d, dur: 6, ease: 'fade' });
  }));

const MOVE = 30, HOLD = 62;
const STOPS = [   // the screens the camera visits, and what to notice on each (from the case study)
  ['Splash', 'IPL logo animation the moment the app opens'],
  ['Scanner', 'Stadium vibe: fours and sixes play when the scanner opens'],
  ['Payment success', 'The tick is a bouncing cricket ball'],
  ['Runs sheet', 'Then a sheet slides up with the runs you scored'],
  ['Leaderboard', 'Runs add up on the #ScoreBigOn leaderboard'],
  ['Refer & Score', 'Refer & Score: the 50-run Power-play'],
  ['Home spotlight', 'Spotlight banners tease the campaign, then lead into it'],
];
let prev = -1;
const f0 = 30;   // the first push starts as the last screens are still landing
const shots = [{ id: 'in', at: 0, dur: f0, title: 'Build', action: 'Empty page → screens scale up in a ripple from the centre' }];
STOPS.forEach(([name, what], i) => {
  const at0 = f0 + i * (MOVE + HOLD), target = cards.indexOf(cards.filter((cd) => cd.name === name).sort((p, q) => dist(p) - dist(q))[0]);   // the copy nearest the centre
  s.beat(`cam.${name.toLowerCase().replace(/\W+/g, '-')}`, { at: at0, dur: MOVE, ease: 'move', note: `Camera ${i ? 'pans' : 'pushes in'} to ${name}` }, (b) => {
    b.set(cam, { a: prev, b: target, u: 0 });
    b.fromTo(cam, { u: 0 }, { u: 1 });
    if (!i) b.fromTo(cam, { z: Z0 }, { z: ZOOM });
    else { b.fromTo(cam, { z: ZOOM }, { z: ZOOM * 0.8 }, { dur: MOVE / 2, ease: 'fade' }); b.fromTo(cam, { z: ZOOM * 0.8 }, { z: ZOOM }, { at: MOVE / 2, dur: MOVE / 2, ease: 'fade' }); }   // a small breath out between screens
  });
  shots.push({ id: name.toLowerCase().replace(/\W+/g, '-'), at: at0, dur: MOVE + HOLD, title: name, action: what });
  prev = target;
});

// ================================================================ end: the whole wall, then it clears back to nothing
const END = f0 + STOPS.length * (MOVE + HOLD);
s.beat('cam.out', { at: END, dur: 44, ease: 'move', note: 'Pull back: the whole body of work, edge to edge' }, (b) => {
  b.set(cam, { a: prev, b: -1, u: 0 });
  b.fromTo(cam, { u: 0 }, { u: 1 });
  b.fromTo(cam, { z: ZOOM }, { z: ZWALL });
});
const DMAX = Math.max(...cards.map(dist));
s.beat('wall.out', { at: END + 70, dur: 12, ease: 'exit', note: 'Reverse ripple: screens scale down in place, outermost first, to an empty page' }, (b) =>
  cards.forEach((cd) => {
    const d = Math.round((DMAX - dist(cd)) * RIPPLE);
    b.fromTo(cd.st, { sc: 1 }, { sc: 0.6 }, { at: d });
    b.fromTo(cd.st, { o: 1 }, { o: 0 }, { at: d + 6, dur: 6, ease: 'fade' });
  }));
s.beat('cam.reset', { at: END + 70, dur: 40, ease: 'move', note: 'Camera returns to the opening view for the loop' }, (b) => b.fromTo(cam, { z: ZWALL }, { z: Z0 }));
shots.push({ id: 'end', at: END, dur: 110, title: 'The whole wall', action: 'Pull back to all of it, then it clears; loops' });
shotHud(s, document.getElementById('stage'), shots);
s.ready({ tail: 0 });
