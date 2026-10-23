// IPL Themification · film · 1920x1200 · 25 fps · loops.
// The body of work as a wall: every themed screen (and the same surfaces in other seasons) in columns that drift up
// and down; the wall ripples in from the centre, the camera visits one screen after another, pulls back, ripples out.
// Built from the approved animatic (_v4/), now with the real screens. Ground from the case-study cover.
import { studio } from '@studio/studio.js';
import lottie from 'lottie-web';

const s = await studio({ id: 'ipl-film', width: 1920, height: 1200, fps: 25 });
const camEl = document.getElementById('cam'), groundEl = document.getElementById('ground'), gridEl = document.getElementById('grid');
const SLABS = 20, DEPTH = 1.6;   // body ~32px thick
const W = 300, H = 620, PITCH = H + 110;   // more air between phones in a column

// ---------------------------------------------------------------- the screens (real assets from the case study)
const img = (src, style = '') => `<img src="assets/${src}" style="${style}">`;
// screenshots a little shorter than the phone's screen: scaled to its full height (proportions kept, a few px of each
// side trimmed), so their bottom nav bar sits on the bottom edge. ar = the screenshot's width / height
const full = (ar, inner) => `<div style="top:auto;bottom:0;aspect-ratio:${ar}">${inner}</div>`;   // full width, bottom on the bottom edge (a few px of the top may tuck under the status bar)
const fimg = (src) => `<img src="assets/${src}" style="position:absolute;left:0;top:0;width:100%">`;
const lot = (cls, style = '') => `<div class="lot ${cls}" style="${style}"></div>`;
// PayZapp home, from Figma (Handoffs › 768:2236): see .hm in index.html. Design px, 360 wide.
const H_ = (src) => `assets/home/${src}`;
const anchor = (x, tile, label, w) => `<div class="anc" style="left:${x}px;top:0">${tile}<p class="lbl" style="width:${w}px">${label}</p></div>`;
// tiles are Figma exports (48 px tile + its soft 4 px halo = 56 px), so their translucent borders match the design
const tile = (png) => `<img src="${H_(png)}" style="left:-4px;top:-4px;width:56px;height:56px">`;
const biller = (x, pic, label, dot = '') => `<div class="biller" style="left:${x}px;top:38px"><div class="pic">${pic}</div><p class="lbl">${label}</p>${dot}</div>`;
const cat = (x, icon, label) => `<div class="cat" style="left:${x}px;top:38px"><div class="bub"><img src="${H_(icon)}"></div><p class="lbl">${label}</p></div>`;
const homeHTML = () => `<div class="hm">
  <img src="assets/spot-1.png" style="left:0;top:0;width:360px;height:240px">
  <div class="tb" style="left:24px"><img src="${H_('user.svg')}"></div>
  <div class="tb" style="left:302px"><img src="${H_('bell.svg')}"></div>
  <div class="sheet">
    <div style="left:24px;top:24px">
      ${anchor(0, tile('tile-qr.png'), 'Scan any<br>QR', 70)}
      ${anchor(88, tile('upi-anchor.png'), 'Pay<br>Anyone', 72)}
      ${anchor(176, tile('tile-bank-transfer.png'), 'Bank<br>Transfer', 70)}
      ${anchor(264, tile('tile-balance.png'), 'Check<br>Balance', 66)}
    </div>
    <img src="${H_('upi-line-l.svg')}" style="left:0;top:150.5px;width:78px;height:1px;transform:rotate(180deg)">
    <img src="${H_('upi-line-r.svg')}" style="left:282px;top:150.5px;width:78px;height:1px;transform:scaleY(-1)">
    <img src="${H_('upi-pill.svg')}" style="left:76px;top:138px;width:208px;height:28px">
    <img src="${H_('upi-qr.svg')}" style="left:99.5px;top:145px;width:14px;height:14px">
    <p class="t" style="left:119.5px;top:143.5px;font-size:12px;font-weight:500;color:#1a3c63;opacity:.8">UPI ID: 8281908756@pz</p>
    <div style="left:24px;top:190px">
      ${anchor(0, tile('tile-bill.png'), 'Bill &amp;<br>Recharges', 67)}
      ${anchor(88, tile('tile-bank.png'), 'Accounts &amp;<br>Cards', 66)}
      ${anchor(176, tile('tile-wallet.png'), 'PayZapp<br>Wallet', 70)}
      ${anchor(264, tile('tile-passbook.png'), 'Passbook &amp;<br>Insights', 67)}
    </div>
    <div style="left:0;top:322px;width:360px;height:202px">
      <img src="${H_('offers-bg.svg')}" style="left:0;top:-6px;width:428px;height:166px">
      <p class="t h16" style="left:24px;top:28px">Explore offers &amp; rewards</p>
      <p class="t link" style="left:284px;top:29px">View all</p>
      <img src="${H_('banner-zoomcar.png')}" style="left:24px;top:66px;width:313px;height:121px">
      <img src="${H_('coin-top.png')}" style="left:205.57px;top:-24px;width:64.26px;height:50.58px">
      <img src="${H_('coin-left.png')}" style="left:0;top:71.25px;width:44px;height:115.33px">
    </div>
    <div style="left:23.5px;top:535px">
      <p class="t h16" style="left:0;top:0">Suggestions</p>
      ${biller(0, `<img src="${H_('bescom.png')}" style="left:-32.83%;top:-10.47%;width:170.17%;height:133.11%">`, 'BESCOM', `<img src="${H_('dot-red.svg')}" style="left:34.5px;top:-5.5px;width:17px;height:17px">`)}
      ${biller(88, `<img src="${H_('avatar1.jpg')}" style="left:0;top:0;width:100%;height:100%;object-fit:cover">`, 'Jaya')}
      ${biller(176, `<img src="${H_('avatar4.jpg')}" style="left:0;top:0;width:100%;height:100%;object-fit:cover">`, 'Rahul')}
      ${biller(264, `<img src="${H_('airtel.png')}" style="left:0;top:0;width:100%;height:100%">`, 'Airtel')}
    </div>
    <div style="left:23.5px;top:671px">
      <p class="t h16" style="left:0;top:0">Bills &amp; Recharges</p>
      <p class="t link" style="left:260px;top:1px">View all</p>
      ${cat(0, 'cat-electricity.svg', 'Electricity')}
      ${cat(87, 'cat-postpaid.svg', 'Mobile<br>Postpaid')}
      ${cat(174, 'cat-recharge.svg', 'Mobile<br>Recharge')}
      ${cat(261, 'cat-rent.svg', 'Rent')}
    </div>
  </div>
  <div class="nav">
    <div style="left:148px;top:0;width:64px;height:64px;filter:drop-shadow(0 0 12px rgba(0,0,0,.24))">
      <img src="${H_('nav-scan-ring.svg')}" style="left:-3px;top:-3px;width:70px;height:70px">
      <img src="${H_('nav-qr.svg')}" style="left:14px;top:14px;width:36px;height:36px">
      <div style="left:1px;top:1px;width:62px;height:62px;border-radius:1000px;overflow:hidden"><img src="${H_('nav-scan-still.png')}" style="left:-10.34%;top:-10.34%;width:120.69%;height:120.69%"></div>
    </div>
    <div style="left:-1px;top:33px;width:362px;height:79px">
      <img src="${H_('nav-shape.svg')}" style="left:-40px;top:-29px;width:442px;height:144px">
      <img src="${H_('nav-pay-tab.svg')}" style="left:-10px;top:7px;width:183px;height:72px">
      <img src="${H_('nav-shop-tab.svg')}" style="left:211px;top:10px;width:96px;height:40px;transform:scaleX(-1)">
      <img src="${H_('nav-shop-pill.svg')}" style="left:257px;top:14px;width:64px;height:32px">
      <img src="${H_('nav-offers.svg')}" style="left:279px;top:21px;width:20px;height:20px">
      <p class="t" style="left:289.5px;top:44px;transform:translateX(-50%);font-size:14px;font-weight:500;color:#a3ccf5">Shop</p>
      <img src="${H_('nav-rupee.svg')}" style="left:64px;top:20.9px;width:20px;height:20.2px">
      <p class="t" style="left:74px;top:54px;transform:translate(-50%,-50%);font-size:14px;font-weight:600;color:#fff">Pay</p>
    </div>
  </div>
</div>`;
const SCREENS = {
  'Splash': { html: lot('splash', 'transform:translateY(-6%)'),   // nudged up: the logo sits a little above centre, like the app's splash
  lottie: [['.splash', 'splash-ipl.json', 'xMidYMid meet']] },
  'Home spotlight': { html: homeHTML() },   // built from Figma, not a screenshot
  'Bottom sheet': { html: full('540/1104', fimg('bottom-sheet.png')) },
  'Scanner': { html: img('scan-bg.png') + lot('scan', 'top:-10px') + img('scan-overlay.png', 'top:auto;bottom:0'), lottie: [['.scan', 'scan-ipl.json', 'xMidYMin slice']] },
  'Payment success': { html: img('success.png') + lot('ball', 'top:10px;transform:scale(.9);transform-origin:top center'), lottie: [['.ball', 'pay-success.json', 'xMidYMin meet']] },
  'Runs sheet': { html: img('success.png') + lot('runs', 'top:auto;bottom:0') + '<div class="runs-txt"><b>6 Runs<br>Scored</b><span>Book flights on PayZapp Shop, get 25 runs!</span></div>',
    lottie: [['.runs', 'txn-runs.json', 'xMidYMax meet']] },
  'Leaderboard': { html: img('leaderboard.png') },
  'Refer & Score': { html: img('referral.png', 'top:auto;bottom:0') },
  'Scanner · Diwali': { html: full('540/1161', fimg('Diwali.png')) },
  'Scanner · Christmas': { html: full('540/1161', fimg('Christmas.png')) },
  'Home · Navratri': { html: full('540/1122', fimg('Navratri.png')) },
  'Home · Dussehra': { html: full('540/1122', fimg('Dussehra.png')) },
};

// status bar on every screen, coloured like the top of that screen: [background, light icons?]
const BAR = {
  'Splash': ['#fff', 0], 'Home spotlight': ['#fff', 0], 'Bottom sheet': ['#77CAE6', 0], 'Scanner': ['#09235A', 1],
  'Payment success': ['#40DB81', 1], 'Runs sheet': ['#40DB81', 1], 'Leaderboard': ['#fff', 0], 'Refer & Score': ['#fff', 0],
  'Scanner · Diwali': ['#272522', 1], 'Scanner · Christmas': ['#757779', 1], 'Home · Navratri': ['#fff', 0], 'Home · Dussehra': ['#fff', 0],
};
const statusBar = (name) => { const [bg, light] = BAR[name]; return `<div class="sbar${light ? ' light' : ''}" style="background:${bg}"><b>9:41</b><img src="assets/statusbar-right.svg"></div>`; };

// ---------------------------------------------------------------- the wall: 7 columns × 3, neighbours drift in opposite directions
const COLS = [
  ['Runs sheet', 'Scanner · Christmas', 'Home · Dussehra', 'Payment success', 'Splash'],
  ['Scanner · Diwali', 'Leaderboard', 'Splash', 'Bottom sheet', 'Refer & Score'],
  ['Payment success', 'Home · Navratri', 'Home spotlight', 'Runs sheet', 'Scanner · Christmas'],
  ['Home · Dussehra', 'Refer & Score', 'Scanner', 'Leaderboard', 'Home · Navratri'],
  ['Bottom sheet', 'Home spotlight', 'Payment success', 'Scanner · Diwali', 'Leaderboard'],
  ['Scanner', 'Runs sheet', 'Refer & Score', 'Splash', 'Home · Dussehra'],
  ['Leaderboard', 'Bottom sheet', 'Home · Navratri', 'Home spotlight', 'Payment success'],
];
const SHIFT = [-160, 160, -160, 160, -160, 160, -160], DRIFT = 0.25, MID = 390;
const cards = [], lotties = [];
COLS.forEach((list, c) => list.forEach((name, i) => {
  const el = document.createElement('div');
  el.className = 'ph'; el.dataset.name = name;
  el.innerHTML = `${Array.from({ length: SLABS }, (_, k) => `<i class="slab" style="transform:translateZ(${-(k + 1) * DEPTH}px)"></i>`).join('')}<div class="face"><div class="scr">${statusBar(name)}<div class="body">${SCREENS[name].html}</div></div><div class="isl"></div></div>`;   // screen inside the face: drawn as one piece, so it can never drop out on its own
  camEl.appendChild(el);
  (SCREENS[name].lottie || []).forEach(([sel, path, fit]) => lotties.push({ container: el.querySelector(sel), path: `assets/${path}`, fit, card: cards.length, txt: el.querySelector('.runs-txt') }));
  cards.push({ el, c, name, x: 960 + (c - 3) * 400, y: 600 + (i - (list.length - 1) / 2) * PITCH + SHIFT[c], st: { o: 0, sc: 0.6 } });
}));
const posOf = (cd, f) => ({ x: cd.x, y: cd.y + (cd.c % 2 ? -1 : 1) * DRIFT * (f - MID) });
s.onFrame((f) => cards.forEach((cd, i) => {
  // in a close-up the other screens step back (smaller) and fade; the one in focus stays as it is
  const inFocus = (i === Math.round(cam.a) ? 1 - cam.u : 0) + (i === Math.round(cam.b) ? cam.u : 0);
  const back = cam.focus * (1 - inFocus);
  const p = posOf(cd, f), o = cd.st.o * (1 - 0.65 * back), sc = cd.st.sc * (1 - 0.12 * back);
  cd.el.style.transform = `translate(${p.x - W / 2}px, ${p.y - H / 2}px) scale(${sc})`;
  for (const k of cd.el.children) k.style.opacity = o;   // per part: opacity on the phone itself would flatten its 3D body
}));

// ---------------------------------------------------------------- camera: follows a moving screen (or the wall's centre)
const ZIN = 2.0, Z0 = 0.8, ZOOM = 1.85, ZWALL = 0.6;   // ZIN: the opening, close in; it eases out to Z0 as the wall ripples in   // ZOOM: one screen nearly fills the frame
const VIEW = { rx: 30, rz: -20, ry: 12 };   // default angle on the wall
// flat: 0 = the wall's angle, 1 = straight on (close-ups); focus: 0 = all screens equal, 1 = the one in focus stands out
const cam = { a: -1, b: -1, u: 1, z: ZIN, flat: 0, focus: 0, __label: 'camera' };
const at = (i, f) => (i < 0 ? { x: 960, y: 600 } : posOf(cards[Math.round(i)], f));
s.onFrame((f) => {
  const pa = at(cam.a, f), pb = at(cam.b, f);
  const x = pa.x + (pb.x - pa.x) * cam.u, y = pa.y + (pb.y - pa.y) * cam.u;
  // the wall is seen at an angle (the theme's three-quarter view, orthographic); the camera looks at (x, y) on it
  const t = `translate(960px, 600px) scale(${cam.z}) rotateX(${VIEW.rx * (1 - cam.flat)}deg) rotateZ(${VIEW.rz * (1 - cam.flat)}deg) rotateY(${VIEW.ry * (1 - cam.flat)}deg) translate(${-x}px, ${-y}px)`;
  camEl.style.transform = t; groundEl.style.transform = t;
  // the grid zooms much less than the phones do: its cells are counter-scaled against the zoom
  const g = 1.45 * Math.pow(cam.z, -0.65);
  gridEl.style.setProperty('--cell', `${60 * g}px`); gridEl.style.setProperty('--line', `${6 * g}px`);
  gridEl.style.setProperty('--ox', `${4500 % (60 * g)}px`); gridEl.style.setProperty('--oy', `${4500 % (60 * g)}px`);
}, -1);

// ================================================================ in: a ripple from the centre, each screen scaling up in place
const RIPPLE = 0.012;
const dist = (cd) => Math.hypot(posOf(cd, 0).x - 960, posOf(cd, 0).y - 600);
const DMIN = Math.min(...cards.map(dist)), DMAX = Math.max(...cards.map(dist));
s.beat('wall.in', { at: 0, dur: 14, ease: 'overshoot', note: 'Ripple: screens scale up in place, spreading out from the centre' }, (b) =>
  cards.forEach((cd) => {
    const d = 2 + Math.round((dist(cd) - DMIN) * RIPPLE);
    b.fromTo(cd.st, { sc: 0.6 }, { sc: 1 }, { at: d });
    b.fromTo(cd.st, { o: 0 }, { o: 1 }, { at: d, dur: 6, ease: 'fade' });
  }));

s.beat('cam.open', { at: 0, dur: 30, ease: [0.25, 0.1, 0.25, 1], note: 'Opening: the camera starts close and eases out a little while the screens ripple in' }, (b) =>
  b.fromTo(cam, { z: ZIN }, { z: Z0 }));

// ================================================================ the camera visits one screen after another
const MOVE = 30, HOLD = 62;
const focusSpans = {};   // card index → [start, end) frames while the camera is on it
const STOPS = ['Splash', 'Scanner', 'Payment success', 'Runs sheet', 'Leaderboard', 'Refer & Score', 'Home spotlight'];
let prev = -1;
const f0 = 55;   // the first push: the opening zoom-out ends at 30, then the wall holds a second (still drifting) before the camera moves in
STOPS.forEach((name, i) => {
  const at0 = f0 + i * (MOVE + HOLD);
  const target = cards.indexOf(cards.filter((cd) => cd.name === name).sort((p, q) => dist(p) - dist(q))[0]);   // the copy nearest the centre
  s.beat(`cam.${name.toLowerCase().replace(/\W+/g, '-')}`, { at: at0, dur: MOVE, ease: 'move', note: `Camera ${i ? 'pans' : 'pushes in'} to ${name}` }, (b) => {
    b.set(cam, { a: prev, b: target, u: 0 });
    b.fromTo(cam, { u: 0 }, { u: 1 });
    if (!i) { b.fromTo(cam, { z: Z0 }, { z: ZOOM }); b.fromTo(cam, { focus: 0 }, { focus: 1 }); }   // the rest steps back as we close in (the wall keeps its angle)
    else { b.fromTo(cam, { z: ZOOM }, { z: ZOOM * 0.8 }, { dur: MOVE / 2, ease: 'fade' }); b.fromTo(cam, { z: ZOOM * 0.8 }, { z: ZOOM }, { at: MOVE / 2, dur: MOVE / 2, ease: 'fade' }); }
  });
  focusSpans[target] = [at0 + MOVE / 2, at0 + MOVE + HOLD];   // its animations play from when the camera arrives until it moves on
  prev = target;
});

// ================================================================ end: the whole wall, then a reverse ripple back to the ground
const END = f0 + STOPS.length * (MOVE + HOLD);
s.beat('cam.out', { at: END, dur: 44, ease: 'move', note: 'Pull back to the whole wall' }, (b) => {
  b.set(cam, { a: prev, b: -1, u: 0 });
  b.fromTo(cam, { u: 0 }, { u: 1 });
  b.fromTo(cam, { z: ZOOM }, { z: ZWALL });
  b.fromTo(cam, { focus: 1 }, { focus: 0 });   // everything equal again
});
s.beat('wall.out', { at: END + 70, dur: 12, ease: 'exit', note: 'Reverse ripple: screens scale down in place, outermost first' }, (b) =>
  cards.forEach((cd) => {
    const d = Math.round((DMAX - dist(cd)) * RIPPLE);
    b.fromTo(cd.st, { sc: 1 }, { sc: 0.6 }, { at: d });
    b.fromTo(cd.st, { o: 1 }, { o: 0 }, { at: d + 6, dur: 6, ease: 'fade' });
  }));
s.beat('cam.reset', { at: END + 70, dur: 40, ease: 'move', note: 'Camera returns to the opening view for the loop' }, (b) => b.fromTo(cam, { z: ZWALL }, { z: ZIN }));

// ---------------------------------------------------------------- Lotties (stepped by the frame) and images loaded before the first capture
// Lotties hold still (on their finished state) until the camera focuses on their screen; then they play from the
// start, and pause where they are when the camera moves on. Screens the camera never visits stay still.
await Promise.all(lotties.map(async (l) => {
  const anim = lottie.loadAnimation({ container: l.container, renderer: 'svg', loop: false, autoplay: false, path: l.path, rendererSettings: { preserveAspectRatio: l.fit } });
  if (!anim.isLoaded) await new Promise((ok) => anim.addEventListener('DOMLoaded', ok));
  const fr = anim.frameRate, n = anim.totalFrames, span = focusSpans[l.card];
  s.onFrame((f) => {
    let k = n - 1;   // still: the finished state
    if (span && f >= span[0]) k = (((Math.min(f, span[1]) - span[0]) / s.fps) * fr) % n;   // playing, then held where it stopped
    anim.goToAndStop(k, true);
    if (l.txt) l.txt.style.opacity = span && f >= span[0] && f < span[1] ? Math.min(1, k / (0.5 * fr)) : 1;   // the runs text arrives with the sheet
  });
}));
await Promise.all([...camEl.querySelectorAll('img')].map((im) => im.decode().catch(() => {})));
await Promise.all([400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 16px InterLocal`)));
s.ready({ tail: 0 });
