// Zapp Account — motion piece (v2). One continuous chain, no slides: every idea turns into the next.
//   coin drops → "Driving Adoption" → the title bursts into PayZapp users → they pour into PayZapp,
//   a trickle into the wallet → the two streams become the adoption gap → the wallet line twists into
//   ? → magnifier → Cashpoints coin → the coin flips into the Zapp Account wordmark → the wordmark flies
//   into a phone that builds itself; PayZapp's payment row slides into Zapp's → locks drop and pop →
//   coins stream in (loads), loop (Auto-Load), stream out (spends) → the phone stands on the #5 bar.
// 1920x1080 · 25 fps · ~42 s. Copy is lifted from the case study; v1 storyboard is in scene.v1.js.
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin.js';
import { studio } from '@studio/studio.js';
import { camera } from '@studio/kits/camera.js';

gsap.registerPlugin(MorphSVGPlugin);
const s = await studio({ id: 'zapp-account-animatic', width: 1920, height: 1080, fps: 25 });
const $ = (q) => document.querySelector(q), $$ = (q) => [...document.querySelectorAll(q)];
const NAVY = '#1E3A5F', RED = '#E3262D', BLUE = '#2F80ED', ORANGE = '#F2711C', COIN = '#F6B23C';
const world = $('#world');
const SVGNS = 'http://www.w3.org/2000/svg';
const node = (tag, attrs = {}, parent = world) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); parent.appendChild(e); return e; };
const hash = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const outExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------- beat map (frames)
const T = {
  drop: 0, title: 14, burst: 46, gather: 74, stream: 132, gap: 168, dim: 212,
  qmark: 220, mag: 266, coin: 312, flip: 366, prop: 392,
  build: 442, familiar: 498, locks: 548, unlock: 584,
  loads: 616, auto: 716, spends: 790, top5: 860, end: 968, out: 1060,
};
const acts = [
  ['open', 0, T.burst, 'Coin drops; “Driving Adoption” bursts out of the impact'],
  ['users', T.burst, T.stream, 'The title scatters into PayZapp users, who pour into PayZapp — only a trickle reaches the wallet'],
  ['gap', T.stream, T.dim, 'Both streams flow into the chart: users high, wallet flat. The gap is bracketed'],
  ['problems', T.dim, T.flip, 'The wallet line twists into ? → magnifier → Cashpoints coin'],
  ['rebrand', T.flip, T.build, 'The coin flips into the Zapp Account wordmark'],
  ['build', T.build, T.locks, 'Wordmark flies into a phone that builds itself; PayZapp’s payment row slides into Zapp’s'],
  ['locks', T.locks, T.loads, 'Locks drop onto the actions, shake and pop off'],
  ['money', T.loads, T.top5, 'Coins stream in (loads), loop (Auto-Load), stream out (spends)'],
  ['top5', T.top5, T.end, 'Pull out: the phone stands on the #5 bar'],
  ['end', T.end, T.out, 'Wordmark + title'],
];
acts.forEach(([id, a, b, note], i) => s.beat(`act.${i + 1}.${id}`, { at: a, dur: b - a, note }));

// ---------------------------------------------------------------- kinetic type
const typeLayer = $('#type');
const kt = (id, text, { hl = '', style = {} } = {}) => {
  const el = document.createElement('div');
  el.className = 'kt'; el.dataset.name = `Type – ${text}`;
  Object.assign(el.style, style);
  const words = text.split(' '), h = hl.split(' ').filter(Boolean);
  const hs = h.length ? words.findIndex((_, i) => h.every((x, k) => words[i + k] === x)) : -1;
  el.innerHTML = words.map((w, i) => (i === hs ? '<span class="hl">' : '') + `<span class="w"><i>${w}</i></span>`
    + (hs >= 0 && i === hs + h.length - 1 ? '<svg class="sq" viewBox="0 0 100 20" preserveAspectRatio="none"><path pathLength="1" d="M2,13 C18,4 32,18 50,10 S82,3 98,11"/></svg></span>' : '')).join(' ');
  typeLayer.appendChild(el);
  const line = { id, el, ws: [...el.querySelectorAll('.w i')], sq: el.querySelector('.sq path') };
  gsap.set(el, { opacity: 0 });
  gsap.set(line.ws, { opacity: 0 });
  if (line.sq) gsap.set(line.sq, { opacity: 0, attr: { 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 } });
  return line;
};
const typeIn = (L, at, { stagger = 2, dur = 16 } = {}) => s.beat(`type.${L.id}.in`, { at, dur, stagger, ease: 'settle', note: 'Words tumble in' }, (b) => {
  b.set(L.el, { opacity: 1 });
  L.ws.forEach((w, i) => b.fromTo(w,
    { opacity: 0, y: 70, rotation: (hash(i, L.id.length) - 0.5) * 26, filter: 'blur(10px)' },
    { opacity: 1, y: 0, rotation: 0, filter: 'blur(0px)' }, { i }));
  if (L.sq) {
    b.set(L.sq, { opacity: 1 }, L.ws.length * stagger + 4);
    b.fromTo(L.sq, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 } }, { at: L.ws.length * stagger + 4, dur: 14, ease: 'move' });
  }
});
const typeOut = (L, at) => s.beat(`type.${L.id}.out`, { at, dur: 10, stagger: 1, ease: 'exit', note: 'Words fly off' }, (b) => {
  L.ws.forEach((w, i) => b.fromTo(w, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -50, filter: 'blur(8px)' }, { i }));
  if (L.sq) { b.fromTo(L.sq, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': -1 } }, { dur: 8 }); b.set(L.sq, { opacity: 0 }, 8); }
  b.set(L.el, { opacity: 0 }, L.ws.length + 10);
});
const center = (top, size) => ({ left: '0', right: '0', top: `${top}px`, maxWidth: 'none', textAlign: 'center', fontSize: `${size}px` });

// ---------------------------------------------------------------- SVG pieces
const draws = [];
const drawable = (el) => { el.setAttribute('pathLength', 1); el.setAttribute('stroke-dasharray', '1 1'); el.setAttribute('stroke-dashoffset', 1); draws.push(el); return el; };
const draw = (b, els, x = {}) => b.fromTo(els, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 } }, { ease: 'move', ...x });

// dropping coin
const coinA = node('g', { 'data-name': 'Coin – drop' });
node('circle', { cx: 960, cy: 540, r: 58, fill: COIN, stroke: '#D48A12', 'stroke-width': 5 }, coinA);
node('circle', { cx: 960, cy: 540, r: 40, fill: 'none', stroke: '#E39A1F', 'stroke-width': 3 }, coinA);
node('text', { x: 960, y: 560, 'text-anchor': 'middle', 'font-size': 54, 'font-weight': 800, fill: '#9A5A06', 'font-family': 'system-ui' }, coinA).textContent = '₹';

// PayZapp phone + wallet pocket outlines (users pour in)
const outlines = node('g', { 'data-name': 'PayZapp + wallet outlines' });
const pzRect = drawable(node('rect', { x: 640, y: 150, width: 360, height: 780, rx: 54, fill: 'none', stroke: NAVY, 'stroke-width': 5 }, outlines));
const pkRect = drawable(node('rect', { x: 1080, y: 650, width: 200, height: 220, rx: 30, fill: 'none', stroke: RED, 'stroke-width': 4 }, outlines));
const outlineText = node('g', {}, outlines);
node('text', { x: 820, y: 985, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: NAVY, 'font-family': 'system-ui' }, outlineText).textContent = 'PayZapp';
node('text', { x: 1180, y: 915, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: RED, 'font-family': 'system-ui' }, outlineText).textContent = 'PayZapp Wallet';

// chart frame
const chart = node('g', { 'data-name': 'Chart' });
const axes = [node('path', { d: 'M240,250 L240,800 L1690,800', fill: 'none', stroke: '#B8C4D0', 'stroke-width': 3 }, chart)].map(drawable);
const chartText = node('g', {}, chart);
node('text', { x: 262, y: 290, 'font-size': 26, 'font-weight': 700, fill: BLUE, 'font-family': 'system-ui' }, chartText).textContent = 'PayZapp monthly active users';
node('text', { x: 262, y: 728, 'font-size': 26, 'font-weight': 700, fill: RED, 'font-family': 'system-ui' }, chartText).textContent = 'PayZapp Wallet users';
const bracket = node('g', { 'data-name': 'Gap bracket' });
[node('path', { d: 'M1730,300 L1730,750', fill: 'none', stroke: ORANGE, 'stroke-width': 6, 'stroke-linecap': 'round' }, bracket),
  node('path', { d: 'M1712,322 L1730,300 L1748,322', fill: 'none', stroke: ORANGE, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bracket),
  node('path', { d: 'M1712,728 L1730,750 L1748,728', fill: 'none', stroke: ORANGE, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bracket)].forEach(drawable);

// one line that becomes ? → magnifier → coin
const SHAPES = {
  line: 'M260,760 C700,758 1220,762 1660,754',
  qmark: 'M872,440 C872,320 1050,310 1050,420 C1050,500 960,505 960,585 L960,612',
  mag: 'M1112,652 L1021,561 A100,100 0 0 1 879,419 A100,100 0 0 1 1021,561',
  coin: 'M1080,520 A120,120 0 0 1 840,520 A120,120 0 0 1 1080,520',
};
const morph = node('path', { d: SHAPES.line, fill: 'none', stroke: RED, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-name': 'Morph line' });
const qdot = node('circle', { cx: 960, cy: 672, r: 15, fill: NAVY, 'data-name': 'Question dot' });
const coinB = node('g', { 'data-name': 'Coin – Cashpoints' });
node('circle', { cx: 960, cy: 520, r: 120, fill: COIN, stroke: '#D48A12', 'stroke-width': 8 }, coinB);
node('circle', { cx: 960, cy: 520, r: 88, fill: 'none', stroke: '#E39A1F', 'stroke-width': 5 }, coinB);
node('path', { d: 'M978,450 L922,532 L962,532 L942,592 L1000,506 L960,506 Z', fill: '#9A5A06' }, coinB);

// wordmark (letters spring out of the coin)
const markHTML = (el) => { el.innerHTML = [...'ZAPP'].map((c) => `<i class="r">${c}</i>`).join('') + '<i>&nbsp;</i>' + [...'ACCOUNT'].map((c) => `<i class="n">${c}</i>`).join(''); return [...el.querySelectorAll('i')]; };
const mark = $('#mark'), markLetters = markHTML(mark);
const endLetters = markHTML($('#endMark'));

// ranking bars
const BAR = { base: 1380, xs: [-260, 380, 1020, 1660, 2300], hs: [1250, 1050, 880, 740, 620] };
const bars = BAR.xs.map((x, i) => {
  const b = document.createElement('div');
  b.className = 'bar' + (i === 4 ? ' zapp' : ''); b.dataset.name = `Bar #${i + 1}`;
  Object.assign(b.style, { position: 'absolute', left: `${x - 190}px`, top: `${BAR.base - BAR.hs[i]}px`, height: `${BAR.hs[i]}px` });
  $('#bars').appendChild(b);
  const r = document.createElement('div');
  r.className = 'rank' + (i === 4 ? ' zapp' : ''); r.textContent = `#${i + 1}`; r.dataset.name = `Rank #${i + 1}`;
  Object.assign(r.style, { position: 'absolute', left: `${x - 190}px`, top: `${BAR.base + 30}px` });
  $('#bars').appendChild(r);
  return { b, r };
});

// ---------------------------------------------------------------- particles + coins (canvas, pure function of frame)
const fx = $('#fx'), ctx = fx.getContext('2d');
const N = 420, isWallet = (i) => i % 13 === 0;
const slots = (() => {
  const out = []; let pj = 0, wj = 0;
  for (let i = 0; i < N; i++) {
    if (isWallet(i)) { out.push([1100 + (wj % 6) * 32, 684 + Math.floor(wj / 6) * 32]); wj++; }
    else { out.push([668 + (pj % 14) * 23.4, 186 + Math.floor(pj / 14) * 25.6]); pj++; }
  }
  return out;
})();
const topY = (x) => 330 - ((x - 260) / 1400) * 80 + Math.sin(x / 120) * 6;
const botY = (x) => 760 - ((x - 260) / 1400) * 6;
const BALP = [960, 312], AUTOP = [888, 444], SCANP = [856, 532];
const bez = (a, c, b, t) => [lerp(lerp(a[0], c[0], t), lerp(c[0], b[0], t), t), lerp(lerp(a[1], c[1], t), lerp(c[1], b[1], t), t)];
const coinDot = (x, y, r = 10, a = 1) => {
  ctx.globalAlpha = a;
  ctx.fillStyle = COIN; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#D48A12'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fill();
};
const IN = { n: 40, t0: 648, gap: 0.8, dur: 22 }, AUTO = { n: 18, t0: 722, gap: 3, orbit: 26, fly: 12 }, OUT = { n: 36, t0: 796, gap: 1.3, dur: 24 };
const arrived = (f, c) => { let k = 0; for (let i = 0; i < c.n; i++) if (f >= c.t0 + i * c.gap + (c.dur || c.orbit + c.fly)) k++; return k / c.n; };
const left = (f, c) => { let k = 0; for (let i = 0; i < c.n; i++) if (f >= c.t0 + i * c.gap + 4) k++; return k / c.n; };

s.onFrame((f) => {
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, 1920, 1080);
  // users
  if (f >= T.burst && f < 400) {
    const fade = f < T.dim ? 1 : f < 260 ? lerp(1, 0.12, (f - T.dim) / 48) : lerp(0.12, 0, clamp01((f - 330) / 60));
    for (let i = 0; i < N; i++) {
      const r1 = hash(i, 1), r2 = hash(i, 2), r3 = hash(i, 3), r4 = hash(i, 4), r5 = hash(i, 5), r6 = hash(i, 6);
      const S = [960 + (r1 - 0.5) * 1100, 540 + (r2 - 0.5) * 130];
      const F = [960 + (r1 - 0.5) * 1800 + Math.sin(f / 40 + r3 * 6) * 14, 540 + (r4 - 0.5) * 950 + Math.cos(f / 47 + r5 * 6) * 12];
      const e = outExpo(clamp01((f - T.burst - r5 * 6) / 30));
      let x = lerp(S[0], F[0], e), y = lerp(S[1], F[1], e);
      const g = inOut(clamp01((f - T.gather - r5 * 14) / 26));
      const G = [slots[i][0] + Math.sin(f / 9 + r3 * 9) * 1.5, slots[i][1] + Math.cos(f / 11 + r4 * 9) * 1.5];
      x = lerp(x, G[0], g); y = lerp(y, G[1], g);
      const st = inOut(clamp01((f - T.stream - r6 * 16) / 30));
      if (st > 0) {
        const u = (r3 + Math.max(0, f - T.stream) * 0.0045) % 1, rx = 260 + u * 1400;
        const ry = isWallet(i) ? botY(rx) + (r4 - 0.5) * 8 : topY(rx) + (r4 - 0.5) * 34;
        x = lerp(x, rx, st); y = lerp(y, ry, st);
      }
      ctx.globalAlpha = fade * (0.55 + r2 * 0.45);
      ctx.fillStyle = isWallet(i) ? RED : (r6 < 0.3 ? BLUE : NAVY);
      ctx.beginPath(); ctx.arc(x, y, isWallet(i) ? 4.2 : 3.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  // loads: coins rise into the balance
  for (let i = 0; i < IN.n; i++) {
    const p = (f - (IN.t0 + i * IN.gap)) / IN.dur;
    if (p <= 0 || p >= 1) continue;
    const a = [960 + (hash(i, 7) - 0.5) * 760, 1180], c = [960 + (hash(i, 8) - 0.5) * 360, 640];
    const [x, y] = bez(a, c, BALP, inOut(p));
    coinDot(x, y, lerp(12, 6, p));
  }
  // Auto-Load: coins orbit the icon, then hop into the balance
  for (let i = 0; i < AUTO.n; i++) {
    const t = f - (AUTO.t0 + i * AUTO.gap);
    if (t <= 0 || t >= AUTO.orbit + AUTO.fly) continue;
    const ang = -Math.PI / 2 + Math.min(t, AUTO.orbit) / AUTO.orbit * Math.PI * 2 + hash(i, 9);
    const o = [AUTOP[0] + Math.cos(ang) * 56, AUTOP[1] + Math.sin(ang) * 56];
    const q = clamp01((t - AUTO.orbit) / AUTO.fly);
    const [x, y] = q > 0 ? bez(o, [o[0] + 40, BALP[1] - 40], BALP, inOut(q)) : o;
    coinDot(x, y, q > 0 ? lerp(9, 6, q) : 9, t < 4 ? t / 4 : 1);
  }
  // spends: coins leave from Scan and Pay, out of frame
  for (let i = 0; i < OUT.n; i++) {
    const p = (f - (OUT.t0 + i * OUT.gap)) / OUT.dur;
    if (p <= 0 || p >= 1) continue;
    const b = [1700 + hash(i, 10) * 500, 760 + (hash(i, 11) - 0.5) * 320], c = [1120, 380 + hash(i, 12) * 180];
    const [x, y] = bez(SCANP, c, b, inOut(p));
    coinDot(x, y, lerp(7, 12, p));
  }
  ctx.globalAlpha = 1;
  // balance follows the money
  const v = 243.06 + 1820 * arrived(f, IN) + 940 * arrived(f, AUTO) - 1340 * left(f, OUT);
  const [rup, pai] = v.toFixed(2).split('.');
  $('#bal').innerHTML = `₹${Number(rup).toLocaleString('en-IN')}<small>.${pai}</small>`;
});

// ---------------------------------------------------------------- camera + drift
const cam = camera(s, $('#cam'), {
  start: 'full',
  views: {
    full: { x: 960, y: 540, zoom: 1 },
    impact: { x: 960, y: 540, zoom: 1.12 },
    phoneR: { x: 630, y: 540, zoom: 1 },
    money: { x: 1320, y: 470, zoom: 1.25 },
    pull: { x: 960, y: 620, zoom: 0.5 },
  },
});
const drift = $('#drift');
s.onFrame((f) => {
  drift.style.transform = `translate(${7 * Math.sin(f / 47)}px, ${5 * Math.sin(f / 61 + 1)}px) rotate(${0.35 * Math.sin(f / 83 + 2)}deg) scale(${1 + 0.006 * Math.sin(f / 71)})`;
});

// ---------------------------------------------------------------- initial state
const phoneWrap = $('#phoneWrap'), phone = $('#phone');
const ghosts = $$('.ghost'), glbls = $$('.glbl'), tiles = $$('.tile'), lbls = $$('.lbl'), locks = $$('.lock');
const scs = $$('.sc'), sclbls = $$('.sclbl'), uiTop = ['#back', '#coinPill', '#bal', '#addBtn', '#autoIc', '#autoTx'].map($);
gsap.set([coinA, outlineText, chartText, morph, qdot, coinB, phoneWrap, '#end', ...markLetters, ...endLetters], { opacity: 0 });
gsap.set([mark, $('#endMark')], { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });
gsap.set(coinA, { svgOrigin: '960 540' });
gsap.set(coinB, { svgOrigin: '960 520' });
gsap.set(uiTop.concat(['#actCard', '#rwLbl', '#rw'].map($), ghosts, glbls, tiles, lbls, locks, scs, sclbls), { opacity: 0 });
gsap.set([...tiles, ...locks, $('#addBtn'), $('#autoIc'), $('#coinPill')], { transformOrigin: '50% 50%' });
bars.forEach(({ b, r }) => gsap.set([b, r], { opacity: 0 }));

// ---------------------------------------------------------------- 1 · coin drop → title
const tTitle = kt('title', 'Driving Adoption', { style: center(462, 150) });
s.beat('coin.drop', { at: T.drop, dur: 14, ease: [0.55, 0, 1, 0.45], note: 'Coin falls' }, (b) => b.fromTo(coinA, { opacity: 1, y: -720 }, { opacity: 1, y: 0 }));
s.beat('coin.squash', { after: 'coin.drop', dur: 10, ease: 'overshoot', note: 'Lands — squash and settle' }, (b) => {
  b.fromTo(coinA, { scaleX: 1.35, scaleY: 0.6 }, { scaleX: 1, scaleY: 1 });
  cam.to(b, 'impact', { dur: 4, ease: 'snap' });
});
s.beat('coin.pop', { at: T.title, dur: 8, ease: 'snap', note: 'Coin shrinks away as the title punches out' }, (b) => b.fromTo(coinA, { scale: 1, opacity: 1 }, { scale: 0, opacity: 0 }));
s.beat('title.in', { at: T.title + 2, dur: 14, stagger: 3, ease: 'overshoot', note: '“Driving Adoption” punches out of the impact' }, (b) => {
  b.set(tTitle.el, { opacity: 1 });
  tTitle.ws.forEach((w, i) => b.fromTo(w, { opacity: 0, scale: 0.2, y: 20, filter: 'blur(8px)' }, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }, { i }));
  cam.to(b, 'full', { dur: 20, ease: 'settle' });
});
s.beat('title.burst', { at: T.burst - 2, dur: 10, ease: 'exit', note: 'Title bursts into dots' }, (b) => {
  b.fromTo(tTitle.ws, { opacity: 1, scale: 1, filter: 'blur(0px)' }, { opacity: 0, scale: 1.35, filter: 'blur(14px)' });
  b.set(tTitle.el, { opacity: 0 }, 10);
});

// ---------------------------------------------------------------- 2 · users pour into PayZapp, a trickle to the wallet
s.beat('users.outline', { at: T.gather - 4, dur: 26, ease: 'move', note: 'PayZapp and the wallet draw themselves around the dots' }, (b) => {
  draw(b, pzRect);
  draw(b, pkRect, { at: 8, dur: 20 });
  b.fromTo(outlineText, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, { at: 14, dur: 12, ease: 'settle' });
});

// ---------------------------------------------------------------- 3 · streams become the gap
s.beat('gap.outlinesOff', { at: T.stream, dur: 22, ease: 'exit', note: 'Containers slide away; the dots keep flowing' }, (b) =>
  b.fromTo(outlines, { opacity: 1, x: 0 }, { opacity: 0, x: -160 }));
s.beat('gap.axes', { at: T.stream + 10, dur: 24, ease: 'move' }, (b) => {
  draw(b, axes);
  b.fromTo(chartText, { opacity: 0, x: -20 }, { opacity: 1, x: 0 }, { at: 14, dur: 12, ease: 'settle' });
});
s.beat('gap.bracket', { at: T.gap, dur: 16, ease: 'move', note: 'The gap gets bracketed' }, (b) => draw(b, [...bracket.children]));
const tGap = kt('gap', 'The problem was adoption', { hl: 'adoption', style: { left: '300px', top: '480px' } });
typeIn(tGap, T.gap + 4);
typeOut(tGap, T.dim - 8);

// ---------------------------------------------------------------- 4 · the wallet line twists: ? → magnifier → coin
s.beat('prob.fadeChart', { at: T.dim, dur: 20, ease: 'fade', note: 'Chart dissolves; the wallet line stays' }, (b) => {
  b.fromTo([chartText, ...axes, bracket], { opacity: 1 }, { opacity: 0 });
  b.fromTo(morph, { opacity: 0 }, { opacity: 1 }, { dur: 6 });
});
s.beat('prob.qmark', { at: T.qmark, dur: 24, ease: 'snap', note: 'Line twists into a question mark' }, (b) => {
  b.fromTo(morph, { morphSVG: SHAPES.line, stroke: RED, strokeWidth: 8 }, { morphSVG: SHAPES.qmark, stroke: NAVY, strokeWidth: 26 });
  b.fromTo(qdot, { opacity: 0, scale: 0, svgOrigin: '960 672' }, { opacity: 1, scale: 1, svgOrigin: '960 672' }, { at: 18, dur: 10, ease: 'overshoot' });
});
const tP1 = kt('p1', 'The wallet’s value was unclear', { hl: 'unclear', style: center(860, 64) });
typeIn(tP1, T.qmark + 16);
typeOut(tP1, T.mag - 4);
s.beat('prob.mag', { at: T.mag, dur: 22, ease: 'snap', note: '? becomes a magnifier' }, (b) => {
  b.fromTo(qdot, { opacity: 1, scale: 1, svgOrigin: '960 672' }, { opacity: 0, scale: 0, svgOrigin: '960 672' }, { dur: 6 });
  b.fromTo(morph, { morphSVG: SHAPES.qmark }, { morphSVG: SHAPES.mag });
});
s.beat('prob.search', { after: 'prob.mag', dur: 22, ease: 'move', note: 'Magnifier searches' }, (b) => {
  b.fromTo(morph, { x: 0, rotation: 0, svgOrigin: '960 520' }, { x: 70, rotation: -10, svgOrigin: '960 520' }, { dur: 11 });
  b.fromTo(morph, { x: 70, rotation: -10, svgOrigin: '960 520' }, { x: 0, rotation: 0, svgOrigin: '960 520' }, { at: 11, dur: 11 });
});
const tP2 = kt('p2', 'Auto-Load and other capabilities went undiscovered', { hl: 'undiscovered', style: center(860, 64) });
typeIn(tP2, T.mag + 14, { stagger: 1.5 });
typeOut(tP2, T.coin - 4);
s.beat('prob.coin', { at: T.coin, dur: 20, ease: 'snap', note: 'Magnifier closes into a coin' }, (b) => {
  b.fromTo(morph, { morphSVG: SHAPES.mag, stroke: NAVY }, { morphSVG: SHAPES.coin, stroke: '#D48A12' });
  b.fromTo(coinB, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }, { at: 14, dur: 10, ease: 'overshoot' });
  b.set(morph, { opacity: 0 }, 22);
});
const tP3 = kt('p3', 'Wallet was a Cashpoints conversion tool', { hl: 'Cashpoints conversion tool', style: center(860, 64) });
typeIn(tP3, T.coin + 14);
typeOut(tP3, T.flip - 4);

// ---------------------------------------------------------------- 5 · coin flips into the wordmark
s.beat('rebrand.flip', { at: T.flip, dur: 8, ease: 'anticipate', note: 'Coin flips edge-on' }, (b) => b.fromTo(coinB, { scaleX: 1 }, { scaleX: 0 }));
s.beat('rebrand.letters', { at: T.flip + 6, dur: 16, stagger: 1.5, ease: 'overshoot', note: 'Wordmark letters spring out of the coin' }, (b) => {
  markLetters.forEach((l, i) => b.fromTo(l, { opacity: 0, scale: 0, x: (5.5 - i) * 46, rotation: (hash(i, 13) - 0.5) * 60 }, { opacity: 1, scale: 1, x: 0, rotation: 0 }, { i }));
  b.set(coinB, { opacity: 0 }, 2);
});
const tProp = kt('prop', 'A payment account for all your daily spends', { hl: 'daily spends', style: center(650, 58) });
typeIn(tProp, T.prop);
typeOut(tProp, T.build - 6);

// ---------------------------------------------------------------- 6 · the wordmark flies into a phone that builds itself
const HEAD = { y: 204 - 540, scale: 0.165 };
s.beat('build.fly', { at: T.build, dur: 26, ease: 'move', note: 'Wordmark flies up into the phone header; camera slides right' }, (b) => {
  b.fromTo(mark, { y: 0, scale: 1 }, { y: HEAD.y, scale: HEAD.scale });
  cam.to(b, 'phoneR', { dur: 30 });
});
s.beat('build.phone', { at: T.build + 6, dur: 26, ease: 'settle', note: 'Phone swings in from a tilt' }, (b) => {
  b.fromTo(phoneWrap, { opacity: 0 }, { opacity: 1 }, { dur: 8, ease: 'fade' });
  b.fromTo(phone, { scale: 0.7, rotationY: -38, rotationX: 16, y: 60 }, { scale: 1, rotationY: 0, rotationX: 0, y: 0 });
});
s.beat('build.ui', { at: T.build + 22, dur: 12, stagger: 3, ease: 'overshoot', note: 'Balance, Add Money, Auto-Load pop in' }, (b) =>
  b.each(uiTop, { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1 }));
s.beat('build.ghosts', { at: T.build + 34, dur: 12, stagger: 2, ease: 'settle', note: 'PayZapp’s familiar payment row appears' }, (b) => {
  b.each(ghosts, { opacity: 0, y: 20 }, { opacity: 1, y: 0 });
  b.each(glbls, { opacity: 0 }, { opacity: 1 }, { at: 4 });
});
// PayZapp row → Zapp row: same place, same order
const GDX = [52 - 84, 140 - 188, 236 - 292];
s.beat('familiar.slide', { at: T.familiar + 8, dur: 22, ease: 'move', note: 'PayZapp’s payment row slides into Zapp’s three actions' }, (b) => {
  b.fromTo('#actCard', { opacity: 0, scaleY: 0.6 }, { opacity: 1, scaleY: 1 }, { dur: 14, ease: 'settle' });
  tiles.forEach((t, i) => b.fromTo(t, { opacity: 1, x: GDX[i], scale: 54 / 68, backgroundColor: BLUE, color: '#fff' }, { opacity: 1, x: 0, scale: 1, backgroundColor: '#E6F1FF', color: NAVY }));
  b.fromTo(ghosts, { opacity: 1 }, { opacity: 0 }, { dur: 2 });
  b.fromTo(glbls, { opacity: 1 }, { opacity: 0 }, { dur: 8, ease: 'fade' });
  b.each(lbls, { opacity: 0, y: 8 }, { opacity: 1, y: 0 }, { at: 12, dur: 10 });
});
s.beat('familiar.rest', { at: T.familiar + 26, dur: 12, stagger: 2, ease: 'settle', note: 'Shortcuts and rewards settle in' }, (b) =>
  b.each([...scs, ...sclbls, $('#rwLbl'), $('#rw')], { opacity: 0, y: 18 }, { opacity: 1, y: 0 }));
const tFam = kt('fam', 'Familiarity by design worked in our favor', { hl: 'Familiarity', style: { left: '110px', top: '360px', maxWidth: '760px', fontSize: '84px' } });
typeIn(tFam, T.familiar);
typeOut(tFam, T.locks - 6);

// ---------------------------------------------------------------- 7 · locks drop, shake, pop off
s.beat('locks.drop', { at: T.locks, dur: 12, stagger: 4, ease: 'overshoot', note: 'Locks drop onto the three actions' }, (b) =>
  b.each(locks, { opacity: 0, y: -40, scale: 0.3 }, { opacity: 1, y: 0, scale: 1 }));
const tLock = kt('lock', 'Locked actions became upgrade opportunities', { hl: 'upgrade opportunities', style: { left: '110px', top: '330px', maxWidth: '760px', fontSize: '84px' } });
typeIn(tLock, T.locks + 4);
typeOut(tLock, T.loads - 4);
s.beat('locks.press', { at: T.unlock - 10, dur: 10, ease: 'snap', note: 'Scan and Pay pressed' }, (b) => {
  b.fromTo(tiles[0], { scale: 1 }, { scale: 0.88 }, { dur: 4 });
  b.fromTo(tiles[0], { scale: 0.88 }, { scale: 1 }, { at: 4, dur: 6, ease: 'overshoot' });
});
s.beat('locks.shake', { at: T.unlock, dur: 8, note: 'Locks rattle' }, (b) => locks.forEach((l) => {
  b.fromTo(l, { rotation: 0 }, { rotation: 16 }, { dur: 2, ease: 'linear' });
  b.fromTo(l, { rotation: 16 }, { rotation: -16 }, { at: 2, dur: 3, ease: 'linear' });
  b.fromTo(l, { rotation: -16 }, { rotation: 0 }, { at: 5, dur: 3, ease: 'linear' });
}));
s.beat('locks.pop', { after: 'locks.shake', dur: 14, stagger: 3, ease: 'exit', note: 'Locks pop off — full capability' }, (b) =>
  b.each(locks, { opacity: 1, y: 0, x: 0, rotation: 0, scale: 1 }, { opacity: 0, y: -90, x: 30, rotation: 50, scale: 0.6 }));

// ---------------------------------------------------------------- 8 · money moves: loads, Auto-Load, spends
const stat = (id, label, at, out, fmt) => {
  const n = document.createElement('div');
  n.className = 'num'; n.dataset.name = `Number – ${label}`;
  Object.assign(n.style, { left: '900px', top: '210px' });
  typeLayer.appendChild(n);
  gsap.set(n, { opacity: 0, transformOrigin: '0% 100%' });
  const L = kt(id, label, { style: { left: '908px', top: '420px', fontSize: '68px' } });
  s.beat(`stat.${id}.num`, { at, dur: 14, ease: 'overshoot', note: `Number counts up: ${label}` }, (b) => b.fromTo(n, { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0 }));
  typeIn(L, at + 6);
  s.beat(`stat.${id}.out`, { at: out, dur: 10, ease: 'exit' }, (b) => b.fromTo(n, { opacity: 1, y: 0 }, { opacity: 0, y: -60 }));
  typeOut(L, out);
  s.onFrame((f) => { n.textContent = fmt(outExpo(clamp01((f - at) / 34))); });
};
s.beat('money.push', { at: T.loads, dur: 26, ease: 'move', note: 'Camera swings across; phone to the left' }, (b) => cam.to(b, 'money'));
s.beat('money.add', { at: T.loads + 28, dur: 10, ease: 'snap', note: 'Add Money pressed' }, (b) => {
  b.fromTo('#addBtn', { scale: 1 }, { scale: 0.9 }, { dur: 3 });
  b.fromTo('#addBtn', { scale: 0.9 }, { scale: 1 }, { at: 3, dur: 7, ease: 'overshoot' });
});
stat('loads', 'monthly loads', 660, 712, (p) => `${(1 + 0.5 * p).toFixed(1)}×`);
s.beat('money.autoSpin', { at: T.auto, dur: 72, ease: [0.4, 0, 0.6, 1], note: 'Auto-Load icon spins while coins loop' }, (b) => b.fromTo('#autoIc', { rotation: 0 }, { rotation: 1080 }));
stat('auto', 'Auto-Load adoption', 724, 782, (p) => `${Math.round(20 * p)}%`);
s.beat('money.scan', { at: T.spends, dur: 10, ease: 'snap', note: 'Scan and Pay pressed — money goes out' }, (b) => {
  b.fromTo(tiles[0], { scale: 1 }, { scale: 0.88 }, { dur: 4 });
  b.fromTo(tiles[0], { scale: 0.88 }, { scale: 1 }, { at: 4, dur: 6, ease: 'overshoot' });
});
stat('spends', 'monthly spends', 798, 852, (p) => `${(1 + 1.1 * p).toFixed(1)}×`);

// ---------------------------------------------------------------- 9 · pull out: the phone stands on the #5 bar
const POD = { x: BAR.xs[4] - 960, y: 556 - 540, scale: 0.45 };
s.beat('top5.pull', { at: T.top5, dur: 40, ease: 'move', note: 'Pull out; phone glides onto its podium' }, (b) => {
  cam.to(b, 'pull');
  b.fromTo(phoneWrap, { x: 0, y: 0, scale: 1 }, { x: POD.x, y: POD.y, scale: POD.scale });
  b.fromTo(mark, { x: 0, y: HEAD.y, scale: HEAD.scale }, { x: POD.x, y: POD.y + HEAD.y * POD.scale, scale: HEAD.scale * POD.scale });
});
s.beat('top5.bars', { at: T.top5 + 10, dur: 22, stagger: 5, ease: 'settle', note: 'Bars rise, #1 to #5' }, (b) => {
  bars.forEach(({ b: bar }, i) => b.fromTo(bar, { opacity: 1, scaleY: 0 }, { opacity: 1, scaleY: 1 }, { i }));
  bars.forEach(({ r }, i) => b.fromTo(r, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, { i, at: 12, dur: 12 }));
});
const tTop = kt('top', 'Top digital wallets by monthly spends', { hl: 'Top', style: { left: '84px', top: '70px', maxWidth: '1700px' } });
typeIn(tTop, T.top5 + 30);
typeOut(tTop, T.end - 12);

// ---------------------------------------------------------------- 10 · end
s.beat('end.wipe', { at: T.end, dur: 14, ease: 'fade', note: 'End card' }, (b) => b.fromTo('#end', { opacity: 0 }, { opacity: 1 }));
s.beat('end.letters', { at: T.end + 8, dur: 16, stagger: 1.5, ease: 'overshoot', note: 'Wordmark springs in' }, (b) =>
  endLetters.forEach((l, i) => b.fromTo(l, { opacity: 0, y: 60, rotation: (hash(i, 14) - 0.5) * 40 }, { opacity: 1, y: 0, rotation: 0 }, { i })));
const tEnd = kt('end', 'Driving Adoption', { style: center(620, 64) });
typeIn(tEnd, T.end + 30, { stagger: 4 });

s.ready({ tail: 40 });
