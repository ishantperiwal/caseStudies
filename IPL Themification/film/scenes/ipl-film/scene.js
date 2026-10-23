// IPL Themification · film · 1920x1200 · 25 fps · loops.
// The body of work as a wall: every themed screen (and the same surfaces in other seasons) in columns that drift up
// and down; the wall ripples in from the centre, the camera visits one screen after another, pulls back, ripples out.
// Built from the approved animatic (_v4/), now with the real screens. Ground from the case-study cover.
import { studio } from '@studio/studio.js';
import { bezier } from '@studio/ease.js';
import lottie from 'lottie-web';

const s = await studio({ id: 'ipl-film', width: 1920, height: 1200, fps: 25 });
// the grid is fixed to the wall, so it moves and zooms exactly with the phones (cell size as it looked at the wall view)
{ const g = document.getElementById('grid'), cell = 100.5;
  g.style.setProperty('--cell', `${cell}px`); g.style.setProperty('--line', `${cell / 10}px`);
  g.style.setProperty('--ox', `${4500 % cell}px`); g.style.setProperty('--oy', `${4500 % cell}px`); }
const camEl = document.getElementById('cam'), groundEl = document.getElementById('ground'), gridEl = document.getElementById('grid');
const groundWrap = document.getElementById('groundWrap'), introEl = document.getElementById('intro');
const dimEl = document.getElementById('dim'), labelsEl = document.getElementById('labels');
const DIM = 0.42, FOCUS_SHIFT = 300;   // close-ups: the wall behind darkens; the phone sits SHIFT px left of centre, its label to the right
const focusEl = document.getElementById('camFocus'), shadowsEl = document.getElementById('shadows'), restEl = document.getElementById('rest');
const LIFT = 70, LIFT_GROW = 0.06, BLUR = 4.5;   // a focused phone rises LIFT px toward the camera, grows a little; the rest of the wall blurs BLUR px
const SLABS = 26, DEPTH = 1.6;   // body ~42px thick: 26 offset copies of the outline, 1.6 px apart along the view's depth
const W = 300, H = 620, PITCH = H + 110;   // more air between phones in a column

// ---------------------------------------------------------------- the screens (real assets from the case study)
const img = (src, style = '') => `<img src="assets/${src}" style="${style}">`;
// screenshots a little shorter than the phone's screen: scaled to its full height (proportions kept, a few px of each
// side trimmed), so their bottom nav bar sits on the bottom edge. ar = the screenshot's width / height
const full = (ar, inner) => `<div style="top:auto;bottom:0;aspect-ratio:${ar}">${inner}</div>`;   // full width, bottom on the bottom edge (a few px of the top may tuck under the status bar)
const fimg = (src) => `<img src="assets/${src}" style="position:absolute;left:0;top:0;width:100%">`;
const lot = (cls, style = '') => `<div class="lot ${cls}" style="${style}"></div>`;
// PayZapp home, from Figma (Handoffs › 768:2236): see .hm in index.html. Design px, 360 wide.
const SPOT_IMGS = [1, 4, 5];   // spotlight banners shown in the carousel: the first and the last two
const H_ = (src) => `assets/home/${src}`;
const anchor = (x, tile, label, w) => `<div class="anc" style="left:${x}px;top:0">${tile}<p class="lbl" style="width:${w}px">${label}</p></div>`;
// tiles are Figma exports (48 px tile + its soft 4 px halo = 56 px), so their translucent borders match the design
const tile = (png) => `<img src="${H_(png)}" style="left:-4px;top:-4px;width:56px;height:56px">`;
const biller = (x, pic, label, dot = '') => `<div class="biller" style="left:${x}px;top:38px"><div class="pic">${pic}</div><p class="lbl">${label}</p>${dot}</div>`;
const cat = (x, icon, label) => `<div class="cat" style="left:${x}px;top:38px"><div class="bub"><img src="${H_(icon)}"></div><p class="lbl">${label}</p></div>`;
const homeHTML = () => `<div class="hm">
  <div class="spots" style="left:0;top:0;width:360px;height:240px;overflow:hidden"><div class="strip" style="left:0;top:0;width:1800px;height:240px">${SPOT_IMGS.map((k, j) => `<img src="assets/spot-${k}.png" style="left:${j * 360}px;top:0;width:360px;height:240px">`).join('')}</div></div>
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
  'Leaderboard': { html: img('leaderboard.png', 'height:auto') },   // a tall page: scrolled through in its close-up
  'Refer & Score': { html: img('referral.png', 'top:auto;bottom:0') + '<div class="ref-scrim" style="height:100%;background:#000;opacity:0"></div><div class="ref-lot" style="top:auto;bottom:0;height:100%;opacity:0"></div><img class="ref-sheet" src="assets/referral/sheet.png" style="top:auto;bottom:0;left:.5%;width:99%;opacity:0">' },
  'Scanner · Diwali': { html: full('540/1161', fimg('Diwali.png')) },
  'Scanner · Christmas': { html: full('540/1161', fimg('Christmas.png')) },
  'Home · Navratri': { html: full('540/1122', fimg('Navratri.png')) },
  'Home · Dussehra': { html: full('540/1122', fimg('Dussehra.png')) },
  'Promo video': { html: '<video class="promo" src="assets/promo.webm" muted playsinline preload="auto" style="height:100%;object-fit:cover"></video>' },   // the case study's season explainer (15.6 s)
};

// status bar on every screen, coloured like the top of that screen: [background, light icons?]
const BAR = {
  'Splash': ['#fff', 0], 'Home spotlight': ['#fff', 0], 'Bottom sheet': ['#77CAE6', 0], 'Scanner': ['#09235A', 1],
  'Payment success': ['#40DB81', 1], 'Runs sheet': ['#40DB81', 1], 'Leaderboard': ['#fff', 0, 'fade'], 'Refer & Score': ['#fff', 0],
  'Scanner · Diwali': ['#272522', 1], 'Scanner · Christmas': ['#757779', 1], 'Home · Navratri': ['#fff', 0], 'Home · Dussehra': ['#fff', 0], 'Promo video': ['#BCD3FE', 0, 'fade'],   // 'fade': the bar's colour dissolves into the content below instead of ending in a hard edge
};
const statusBar = (name) => { const [bg, light, over] = BAR[name]; return `<div class="sbar${light ? ' light' : ''}" style="${over ? `height:49px;background:linear-gradient(${bg} 0 31px, transparent 49px)` : `background:${bg}`}"><b>9:41</b><img src="assets/statusbar-right.svg"></div>`; };

// ---------------------------------------------------------------- the wall: 7 columns × 3, neighbours drift in opposite directions
const COLS = [
  ['Runs sheet', 'Scanner · Christmas', 'Home · Dussehra', 'Payment success', 'Splash'],
  ['Scanner · Diwali', 'Leaderboard', 'Splash', 'Bottom sheet', 'Refer & Score'],
  ['Payment success', 'Promo video', 'Home spotlight', 'Runs sheet', 'Scanner · Christmas'],
  ['Home · Dussehra', 'Refer & Score', 'Scanner', 'Leaderboard', 'Home · Navratri'],
  ['Bottom sheet', 'Home spotlight', 'Payment success', 'Scanner · Diwali', 'Leaderboard'],
  ['Scanner', 'Runs sheet', 'Refer & Score', 'Splash', 'Home · Dussehra'],
  ['Leaderboard', 'Bottom sheet', 'Home · Navratri', 'Home spotlight', 'Payment success'],
];
const SHIFT = [-160, 160, -160, 160, -160, 160, -160], DRIFT = 0.25;
const cards = [], lotties = [];
COLS.forEach((list, c) => list.forEach((name, i) => {
  const el = document.createElement('div');
  el.className = 'ph'; el.dataset.name = name;
  el.innerHTML = `<i class="thick"></i><div class="face"><div class="scr">${statusBar(name)}<div class="body" style="background:${BAR[name][0]}">${SCREENS[name].html}</div></div><div class="isl"></div></div>`;   // screen inside the face: drawn as one piece, so it can never drop out on its own
  camEl.appendChild(el);
  const sh = document.createElement('div'); sh.className = 'lift-sh'; shadowsEl.appendChild(sh);
  (SCREENS[name].lottie || []).forEach(([sel, path, fit]) => lotties.push({ container: el.querySelector(sel), path: `assets/${path}`, fit, card: cards.length, txt: el.querySelector('.runs-txt') }));
  cards.push({ el, sh, c, name, x: 960 + (c - 3) * 400, y: 600 + (i - (list.length - 1) / 2) * PITCH + SHIFT[c], st: { o: 0, sc: 0.6 } });
}));
// The columns drift on the wide views only: the drift eases to a stop as the camera pushes into the first phone
// (frames DRIFT_STOP), stays still through the close-ups, and eases back up on the final pull-back (DRIFT_GO, set below).
const INTRO_OUT = 80;   // the intro pair holds until here, then slides off
const OUT_DUR = 26;   // the pair's slide-off
const T0 = INTRO_OUT + Math.round(OUT_DUR * 0.74);   // the wall ripples in from here: as the sliding pair nears the edges
const DRIFT_STOP = [T0 + 55, T0 + 101];
let DRIFT_GO = null, driftCum = null;
const LIFT_EASE = bezier(0.45, 0, 0.15, 1);
const focusOf = (i) => (i === Math.round(cam.a) ? 1 - smooth(cam.ph / 0.5) : 0) + (i === Math.round(cam.b) ? LIFT_EASE(Math.max(0, Math.min(1, (cam.ph - 0.35) / 0.65))) : 0);   // the lift follows the camera's landing curve: eases in, then a long soft settle
const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
function drifted(f) {   // how far the columns have drifted by frame f (in DRIFT units), 0 at the moment they stop
  if (!DRIFT_GO) return Math.min(f, DRIFT_STOP[0]) - DRIFT_STOP[0];   // before the stops are laid out (only frame 0 asks)
  if (!driftCum) {
    driftCum = [0];
    for (let k = 1; k <= DRIFT_GO[1] + 400; k++) {
      const rate = (1 - smooth((k - DRIFT_STOP[0]) / (DRIFT_STOP[1] - DRIFT_STOP[0]))) + smooth((k - DRIFT_GO[0]) / (DRIFT_GO[1] - DRIFT_GO[0]));
      driftCum.push(driftCum[k - 1] + rate);
    }
    const z = driftCum[DRIFT_STOP[1]]; driftCum = driftCum.map((v) => v - z);
  }
  const i = Math.max(0, Math.min(driftCum.length - 1, Math.round(f)));
  return driftCum[i];
}
const posOf = (cd, f) => ({ x: cd.x, y: cd.y + (cd.c % 2 ? -1 : 1) * DRIFT * drifted(f) });
s.onFrame((f) => cards.forEach((cd, i) => {
  // in a close-up the phone in focus lifts off the wall; the others step back (smaller), fade a little and blur
  // over a pan (cam.ph 0 → 1): the phone being left settles back in the first part; the next one lifts only in the
  // later part, as the camera closes in on it
  const inFocus = focusOf(i);
  const back = cam.focus * (1 - inFocus), lift = cam.focus * inFocus;
  const p = posOf(cd, f), o = cd.st.o * (1 - 0.35 * back), sc = cd.st.sc * (1 - 0.12 * back) * (1 + LIFT_GROW * lift);
  // lifted: rises toward the camera (along the view's depth, the opposite way to its thickness) above the blurred wall
  const lx = -DEPTH_ON_WALL.x * LIFT * lift, ly = -DEPTH_ON_WALL.y * LIFT * lift;
  cd.el.style.transform = `translate(${p.x - W / 2 + lx}px, ${p.y - H / 2 + ly}px) scale(${sc})`;
  // a phone in (or leaving / arriving at) focus sits above the blurred wall, carrying its own outline and its own blur,
  // which ramps with how far it is out of focus; once fully out of focus it matches the wall's blur and joins it
  const near = lift > 0.001;
  const parent = near ? focusEl : camEl;
  if (cd.el.parentNode !== parent) parent.appendChild(cd.el);
  const out = cam.focus * (1 - inFocus);   // how far it still belongs to the wall: the same blur and the same darkening as the overlay it now sits above
  cd.el.style.filter = near ? `url(#stickerF) blur(${(BLUR * out).toFixed(2)}px) brightness(${(1 - DIM * out).toFixed(3)})` : '';
  cd.sh.style.display = lift > 0.001 ? 'block' : 'none';
  if (lift > 0.001) { cd.sh.style.transform = `translate(${p.x - W / 2}px, ${p.y - H / 2}px) scale(${sc})`; cd.sh.style.opacity = lift * o; }
  // fading: the face fades by o; the body behind it is SLABS stacked layers each faded by o, so it reads as 1-(1-o)^n
  const [thick, face] = cd.el.children;
  face.style.opacity = o; thick.style.opacity = 1 - Math.pow(1 - o, SLABS + 1);
  const k = sc.toFixed(3);   // the body's thickness: offset copies of the outline (in the phone's own px, so ÷ scale)
  if (cd.k !== k) { cd.k = k; thick.style.boxShadow = SLAB_SHADOW(sc); }
}));

// ---------------------------------------------------------------- camera: follows a moving screen (or the wall's centre)
const ZIN = 1.0, Z0 = 0.8, ZOOM = 1.85;   // ZIN: the intro's view (grid at its usual density); eases out to Z0 as the wall ripples in   // ZIN: the opening, close in; it eases out to Z0 as the wall ripples in   // ZOOM: one screen nearly fills the frame
const VIEW = { rx: 21, rz: -16, ry: 8 };   // was { rx: 30, rz: -20, ry: 12 }: a little more front-on   // default angle on the wall
// The phones' depth direction as it lands on the wall, in wall px: a point 1 px behind the wall projects to the same
// screen spot as this offset on the wall. The slabs are drawn as box-shadows offset along it (identical silhouette).
const DEPTH_ON_WALL = (() => {
  const m = new DOMMatrix(`rotateX(${VIEW.rx}deg) rotateZ(${VIEW.rz}deg) rotateY(${VIEW.ry}deg)`);
  const dx = -m.m31, dy = -m.m32, det = m.m11 * m.m22 - m.m12 * m.m21;   // screen offset of z = -1, mapped back onto the wall
  return { x: (dx * m.m22 - dy * m.m21) / det, y: (dy * m.m11 - dx * m.m12) / det };
})();
// the body's side, as stacked copies of the outline along the depth — one flat colour, as on the Thumbnail
// explainer's phone (real form, flat light: no fake shading)
const sideAt = () => '#2B353E';
const SLABS_OF = (n, sc) => Array.from({ length: n }, (_, k) => `${(DEPTH_ON_WALL.x * (k + 1) * DEPTH / sc).toFixed(2)}px ${(DEPTH_ON_WALL.y * (k + 1) * DEPTH / sc).toFixed(2)}px 0 0 ${sideAt(k / (n - 1))}`).join(', ');
const SLAB_SHADOW = (sc) => SLABS_OF(SLABS, sc);
// flat: 0 = the wall's angle, 1 = straight on (close-ups); focus: 0 = all screens equal, 1 = the one in focus stands out
const cam = { br: 0, ph: 1, a: -1, b: -1, u: 1, z: ZIN, flat: 0, focus: 0, lock: 0, down: 0, __label: 'camera' };
// What each close-up frames: zoom, and dy = the point it centres on, in phone px from the phone's centre (+ = down).
// Most frame the whole phone; some close in on the part that matters.
const FRAMING = {
  'Splash': { z0: 3.2, dy0: 200, z: 1.75, dy: 0 },   // two steps: first close on the dock (the PayZapp icon), then out to the whole phone as the app opens
  'Scanner': { z: 2.05, dy: -80 },          // the scan box and the fours and sixes, a little above the middle
  'Payment success': { z: 2.45, dy: -140 }, // the ball dropping into the tick and the amount, top half
  'Home spotlight': { z: 2.6, dy: -178 },   // just the spotlight banner at the top
  'Refer & Score': { z: 2.55, dy: 150 },    // the invite sheet at the bottom
  'Bottom sheet': { z: 2.45, dy: 140 },     // the offer sheet at the bottom
  'Leaderboard': { z: 1.75, dy: 0 },        // a full-screen scroll: the whole phone
};
const frameOf = (name) => FRAMING[name] || { z: ZOOM, dy: 0 };
// a two-step close-up (z0, dy0 → z, dy) moves on to its second framing as cam.down goes 0 → 1
const mix = (a, b) => a + (b - a) * cam.down;
const dyOf = (fr) => (fr.dy0 == null ? fr.dy : mix(fr.dy0, fr.dy));
const thickOf = (fr) => { const t = (dy) => (dy ? 0 : SLABS * DEPTH / 2); return fr.dy0 == null ? t(fr.dy) : mix(t(fr.dy0), t(fr.dy)); };   // whole phone: centre on face + thickness; a part: on the part
const at = (i, f) => {
  if (i < 0) return { x: 960, y: 600 };
  const cd = cards[Math.round(i)], p = posOf(cd, f), fr = frameOf(cd.name);
  const d = thickOf(fr) - LIFT * cam.focus;
  return { x: p.x + DEPTH_ON_WALL.x * d, y: p.y + dyOf(fr) * (1 + LIFT_GROW) + DEPTH_ON_WALL.y * d };
};   // frame the whole phone (face + its thickness, centred), where it has risen to
s.onFrame((f) => {
  const pa = at(cam.a, f), pb = at(cam.b, f);
  let x = pa.x + (pb.x - pa.x) * cam.u, y = pa.y + (pb.y - pa.y) * cam.u;
  // the wall is seen at an angle (the theme's three-quarter view, orthographic); the camera looks at (x, y) on it
  // The camera is orthographic and only ever looks at the flat wall (z = 0), so its 3D view is exactly a 2D affine
  // transform: the same picture, drawn as a few flat layers instead of hundreds of 3D ones (light on the GPU).
  const z = cam.z * (1 - BREATH * cam.br);   // zoom, with the arc each pan eases out along
  const R = new DOMMatrix(`rotateX(${VIEW.rx * (1 - cam.flat)}deg) rotateZ(${VIEW.rz * (1 - cam.flat)}deg) rotateY(${VIEW.ry * (1 - cam.flat)}deg)`);
  if (cam.lock) {   // the first push: the target's on-screen spot travels one straight line to its close-up spot while the
    // zoom grows (solving the camera around it), so the zoom never shoves it outward before the pan brings it back
    const dx = pb.x - pa.x, dy = pb.y - pa.y;
    const sx = (960 + Z0 * (R.m11 * dx + R.m21 * dy)) * (1 - cam.u) + (960 - FOCUS_SHIFT) * cam.u;
    const sy = (600 + Z0 * (R.m12 * dx + R.m22 * dy)) * (1 - cam.u) + 600 * cam.u;
    const ex = (sx - 960 + FOCUS_SHIFT * cam.focus) / z, ey = (sy - 600) / z, det = R.m11 * R.m22 - R.m21 * R.m12;
    x = pb.x - (R.m22 * ex - R.m21 * ey) / det; y = pb.y - (R.m11 * ey - R.m12 * ex) / det;
  }
  const m = new DOMMatrix(`translate(${960 - FOCUS_SHIFT * cam.focus}px, 600px) scale(${z}) rotateX(${VIEW.rx * (1 - cam.flat)}deg) rotateZ(${VIEW.rz * (1 - cam.flat)}deg) rotateY(${VIEW.ry * (1 - cam.flat)}deg) translate(${-x}px, ${-y}px)`);
  const t = `matrix(${m.m11}, ${m.m12}, ${m.m21}, ${m.m22}, ${m.m41}, ${m.m42})`;
  camEl.style.transform = t; groundEl.style.transform = t; focusEl.style.transform = t; shadowsEl.style.transform = t; labelsEl.style.transform = t; introEl.style.transform = t;
  dimEl.style.opacity = (DIM * cam.focus).toFixed(3);
  restEl.style.filter = groundWrap.style.filter = cam.focus > 0.001 ? `blur(${(BLUR * cam.focus).toFixed(2)}px)` : 'none';   // the grid blurs with the wall

}, -1);

// ================================================================ intro: a pair of screens, before the wall
// The offer bottom sheet slides down into place behind, the payment success slides up in front of it, overlapping;
// they hold a moment (the cricket ball drops into the tick), then slide off the way they came as the wall ripples in.
// The pair lies on the wall like every other phone and is seen through the same camera; they're just bigger and
// closer together. World px, around the wall's centre (960, 600).
const INTRO_SCALE = 2.6, INTRO_SLABS = Math.round(SLABS * 2.6);   // INTRO_SLABS: as thick for its size as the wall phones are for theirs (scaled with the phone)
const INTRO = [
  { name: 'Bottom sheet', x: -250, y: -330, from: -2200, delay: 0 },   // behind: comes down the wall from above
  { name: 'Payment success', x: 250, y: 330, from: 2200, delay: 0 },   // in front: comes up the wall from below, over its lower right (at the same time as the one behind)
];
const introPhones = INTRO.map((p) => {
  const el = cards.find((cd) => cd.name === p.name).el.cloneNode(true);
  el.dataset.name = `Intro – ${p.name}`;
  introEl.appendChild(el);
  const [thick] = el.children, sc = INTRO_SCALE;
  el.style.filter = 'url(#stickerF)';   // each phone its own outline, so the front one keeps it where it overlaps
  thick.style.boxShadow = SLABS_OF(INTRO_SLABS, sc);
  thick.style.opacity = 1;
  [...el.children].forEach((k) => (k.style.opacity = 1));
  return { ...p, el, sc, st: { y: p.from, o: 1 } };
});
s.onFrame(() => introPhones.forEach((p) => {   // slides along the wall (so, on screen, along the phone's own axis)
  p.el.style.transform = `translate(${960 + p.x - W / 2}px, ${600 + p.y + p.st.y - H / 2}px) scale(${p.sc})`;
  p.el.style.opacity = p.st.o;
}));
introPhones.forEach((p, i) => {
  s.beat(`intro.in.${i}`, { at: 4 + p.delay, dur: 20, ease: [0.07, 0.62, 0.17, 1], note: `Intro: ${p.name} slides ${p.from < 0 ? 'down' : 'up'} into the pair` }, (b) =>
    b.fromTo(p.st, { y: p.from }, { y: 0 }));
  s.beat(`intro.out.${i}`, { at: INTRO_OUT, dur: OUT_DUR, ease: [0.62, 0, 0.92, 0.2], note: `Intro: ${p.name} holds, then slides back off the way it came; the wall ripples in behind as it reaches the edges; fades at the edge` }, (b) => {
    b.fromTo(p.st, { y: 0 }, { y: p.from });
    b.fromTo(p.st, { o: 1 }, { o: 0 }, { at: OUT_DUR - 5, dur: 5, ease: 'fade' });   // fades only at the very end, when they're nearly off at the edges
  });
});

// ================================================================ in: a ripple from the centre, each screen scaling up in place
const RIPPLE = 0.012;
const dist = (cd) => Math.hypot(posOf(cd, 0).x - 960, posOf(cd, 0).y - 600);
const DMIN = Math.min(...cards.map(dist)), DMAX = Math.max(...cards.map(dist));
s.beat('wall.in', { at: T0, dur: 14, ease: 'overshoot', note: 'Ripple: screens scale up in place, spreading out from the centre' }, (b) =>
  cards.forEach((cd) => {
    const d = 2 + Math.round((dist(cd) - DMIN) * RIPPLE);
    b.fromTo(cd.st, { sc: 0.6 }, { sc: 1 }, { at: d });
    b.fromTo(cd.st, { o: 0 }, { o: 1 }, { at: d, dur: 6, ease: 'fade' });
  }));

s.beat('cam.open', { at: T0, dur: 30, ease: [0.25, 0.1, 0.25, 1], note: 'Opening: the camera starts close and eases out a little while the screens ripple in' }, (b) =>
  b.fromTo(cam, { z: ZIN }, { z: Z0 }));

// ================================================================ the camera visits one screen after another
const MOVE = 46, HOLD = 46, BREATH = 0.16;   // pan length (a long, soft landing); hold; how far each pan eases out
const focusSpans = {};   // card index → [start, end) frames while the camera is on it
const STOPS = ['Splash', 'Scanner', 'Payment success', 'Leaderboard', 'Refer & Score', 'Home spotlight', 'Promo video', 'Bottom sheet'];   // every stop a different screen
const POSTER = 0.75;   // the promo video's resting frame (s): the 'Introducing #ScoreBigOn' title card, not the empty opening
const PROMO_SPEED = 1.5;   // plays a little faster than real time
const VIDEO_F = Math.ceil(((15.64 - POSTER) / PROMO_SPEED) * 25);   // the promo video's length in frames: the camera stays on it until it has played through
// the referral sequence from the case study (frames at 25 fps, from when the camera arrives): the screen dims and the
// invite animates in (Lottie 0→15), the invite sheet shows, a pause, the rest plays out (15→end), then it all slides away
const REF = { in: 12.5, pause: 50, play: 77.5, out: 16 };   // pause: hold on the invite sheet (2 s) before the rest plays
const REF_F = REF.in + REF.pause + REF.play + REF.out;
const BOARD_F = 90;   // the Leaderboard close-up: a slow, continuous scroll down the page
// A screen's animation starts as the camera lands on it (SETTLE_D frames from landing: negative = a touch before, while
// the move is easing out), so the hook plays the moment the screen is in focus; each still plays for as long as before
const SETTLE_D = -6, ANIMATED = new Set(['Splash', 'Scanner', 'Payment success', 'Leaderboard', 'Refer & Score', 'Promo video', 'Home spotlight']);
const SPOT = { slide: 14, rest: 34 }, SPOT_N = SPOT_IMGS.length;   // the spotlight carousel: each banner rests, then slides to the next
const PROMO_F = 190;   // how much of the promo plays: the camera moves on after the leaderboard part ("make it to the top"), not the whole video
// Splash: the app is opened from the phone's home screen first (as in the case study): frames from the camera landing
const OPEN = { show: -12, at: -10, tap: 2, open: 8, dur: 16, lead: 26 };   // dot appears, moves to the icon, presses; the app grows out of the icon; lead: the splash animation starts lead + SETTLE_D after landing
// Payment success: one full loop, tick → ball → bounces → back to the tick; it starts PAY.pre frames before the camera
// settles (playing while it travels in) and the camera moves on just as the tick is back (lottie frame PAY.back, at 60 fps)
const PAY = { pre: 16, back: 165 };
const ANIM_F = { 'Splash': OPEN.lead + HOLD + MOVE / 2, 'Payment success': Math.round((PAY.back / 60) * 25) + 4 - PAY.pre, 'Promo video': Math.min(VIDEO_F + 12, PROMO_F), 'Refer & Score': Math.ceil(REF_F + 12), 'Leaderboard': BOARD_F + MOVE / 2, 'Home spotlight': (SPOT_N - 1) * (SPOT.slide + SPOT.rest) + SPOT.rest };   // play time once started
const holdOf = (name) => (ANIMATED.has(name) ? SETTLE_D + (ANIM_F[name] ?? HOLD + MOVE / 2) : HOLD);
let prev = -1, at0 = 0;
const f0 = T0 + 55;   // the first push: the opening zoom-out ends at 30, then the wall holds a second (still drifting) before the camera moves in
const labelFor = {}, landAt = {};
STOPS.forEach((name, i) => {
  at0 = i ? at0 + MOVE + holdOf(STOPS[i - 1]) : f0;
  const HOLD = holdOf(name);
  const target = cards.indexOf(cards.filter((cd) => cd.name === name).sort((p, q) => dist(p) - dist(q))[0]);   // the copy nearest the centre
  // one continuous move: a soft-in/soft-out pan, the zoom easing out and back in one smooth arc (no stop midway), and
  // during the hold a slow push-in, so the camera never comes fully to rest between screens
  s.beat(`cam.${name.toLowerCase().replace(/\W+/g, '-')}`, { at: at0, dur: MOVE, ease: [0.45, 0, 0.15, 1.01], note: `Camera ${i ? 'pans' : 'pushes in'} to ${name}` }, (b) => {
    b.set(cam, { a: prev, b: target, u: 0, ph: 0, lock: i ? 0 : 1 });
    b.fromTo(cam, { u: 0 }, { u: 1 });
    b.fromTo(cam, { ph: 0 }, { ph: 1 }, { ease: 'linear' });
    if (!i) {   // zoom grows at an even perceived rate (eased in log space), the rest steps back as we close in (the wall keeps its angle)
      const z1 = frameOf(name).z0 ?? frameOf(name).z, e = bezier(0.45, 0, 0.15, 1.01);
      b.fromTo(cam, { z: Z0 }, { z: z1 }, { ease: (p) => (Z0 * (z1 / Z0) ** e(p) - Z0) / (z1 - Z0) });
      b.fromTo(cam, { focus: 0 }, { focus: 1 });
    }
    else {
      b.fromTo(cam, { z: frameOf(STOPS[i - 1]).z }, { z: frameOf(name).z });   // each screen's own zoom
      b.fromTo(cam, { br: 0 }, { br: 1 }, { ease: (p) => (1 - Math.cos(2 * Math.PI * p)) / 2 });   // zoom eases out and back in one arc, starting and ending at rest
    }
  });
  focusSpans[target] = [at0 + MOVE + (ANIMATED.has(name) ? SETTLE_D : 0) + (name === 'Splash' ? OPEN.lead : 0), at0 + MOVE + HOLD];   // its animations play from a beat after the camera lands until it moves on
  landAt[name] = at0 + MOVE;
  if (frameOf(name).z0) {   // the second step: as the app opens, the camera pulls back from the dock to the whole phone (zoom eased in log space)
    const { z0, z } = frameOf(name), e = bezier(0.45, 0, 0.15, 1.01);
    s.beat(`cam.${name.toLowerCase().replace(/\W+/g, '-')}.out`, { at: at0 + MOVE + OPEN.open, dur: 30, ease: 'linear', note: `Camera pulls back from the dock to the whole ${name} phone as the app opens` }, (b) => {
      b.fromTo(cam, { down: 0 }, { down: 1 }, { ease: [0.45, 0, 0.15, 1.01] });
      b.fromTo(cam, { z: z0 }, { z }, { ease: (p) => (z0 * (z / z0) ** e(p) - z0) / (z - z0) });
    });
  }
  labelFor[target] = name;
  prev = target;
});

// ---------------------------------------------------------------- labels: what each screen is, beside it while in focus
const LABELS = {
  'Splash': ['Splash<br>Screen', 'An IPL logo animation, the moment the app opens'],
  'Scanner': ['UPI QR<br>Scanner', 'Fours and sixes go off when you scan'],
  'Payment success': ['Payment<br>Success', 'A cricket ball bounces into the tick'],
  'Leaderboard': ['Score<br>Leaderboard', 'Every payment scores runs'],
  'Refer & Score': ['Refer &amp;<br>Score', 'Refer a friend: the 50-run power-play'],
  'Home spotlight': ['Home Page<br>Spotlights', 'Banners tease the campaign, then lead into it'],
  'Promo video': ['Promo<br>Video', 'The season, explained in-app'],
  'Bottom sheet': ['Bottom<br>Sheets', 'Nudges sent to segmented users'],
};
const labels = Object.entries(labelFor).map(([i, name]) => {
  const el = document.createElement('div'); el.className = 'slbl'; el.dataset.name = `Label – ${LABELS[name][0].replace('<br>', ' ').replace('&amp;', '&')}`;
  el.innerHTML = `<b>${LABELS[name][0]}</b>`;   // the name only (the second line is kept for reference)
  labelsEl.appendChild(el);
  return { el, i: +i };
});
s.onFrame((f) => labels.forEach(({ el, i }) => {
  const k = cam.focus * focusOf(i), cd = cards[i], p = posOf(cd, f);
  const leaving = i === Math.round(cam.a) && i !== Math.round(cam.b);   // the camera is moving away from this screen
  const two = frameOf(cd.name).dy0 != null;   // a two-step close-up: the label waits for the second step, then slides in on the other labels' curve as the pull-back settles
  const a = leaving ? cam.focus * (1 - smooth(cam.ph / 0.2)) : k * (two ? LIFT_EASE(Math.max(0, Math.min(1, (f - landAt[cd.name] - OPEN.open - 18) / 30))) : 1);   // leaving: the label fades out quickly (first fifth of the move), ahead of the phone settling back
  el.style.opacity = (leaving ? a : smooth(a / 0.35)).toFixed(3);   // arriving: opaque within the first third of the slide (no long see-through phase); the slide keeps its soft settle
  if (a < 0.001) return;
  const sc = cd.st.sc * (1 + LIFT_GROW * k), lx = -DEPTH_ON_WALL.x * LIFT * k, ly = -DEPTH_ON_WALL.y * LIFT * k;
  const fr = frameOf(cd.name), tyOf = (v) => (v ? v * sc - 70 : -95), ty = fr.dy0 == null ? tyOf(fr.dy) : mix(tyOf(fr.dy0), tyOf(fr.dy));   // beside what the close-up frames
  el.style.transform = `translate(${p.x + lx + (W / 2) * sc + 40 * ZOOM / cam.z}px, ${p.y + ly + ty + 60 * (1 - a)}px) scale(${(ZOOM / cam.z).toFixed(4)})`;   // same on-screen size at every zoom; beside the phone's right edge; slides up along the phone's edge as it appears
}), 5);

// ================================================================ end: the whole wall, then a reverse ripple back to the ground
const END = at0 + MOVE + holdOf(STOPS.at(-1));
DRIFT_GO = [END, END + 44];   // the columns start drifting again with the pull-back
s.beat('cam.out', { at: END, dur: 44, ease: 'move', note: 'Pull back to the whole wall' }, (b) => {
  b.set(cam, { a: prev, b: -1, u: 0, ph: 0 });
  b.fromTo(cam, { u: 0 }, { u: 1 });
  b.fromTo(cam, { ph: 0 }, { ph: 1 }, { ease: 'linear' });
  b.fromTo(cam, { z: frameOf(STOPS.at(-1)).z }, { z: Z0 });   // back to the same wall view the opening settled on
  b.fromTo(cam, { focus: 1 }, { focus: 0 });   // everything equal again
});
// The ending is the opening played backwards, so the last frame leads straight into frame 0: the wall holds as long as
// the opening's hold, then each screen scales away in place in the opening's ripple order, reversed (outermost
// first), while the camera eases back in to the opening's close view on the opening's curve, reversed.
const LOOP = END + 44 + 55;   // mirror of frame 0: the pull-back ends where the opening's push began (55)
const OVERSHOOT = bezier(0.34, 1.56, 0.64, 1), rev = (fn) => (p) => 1 - fn(1 - p);
s.beat('wall.out', { at: LOOP - 40, dur: 40, note: 'Reverse ripple: the opening ripple played backwards, outermost screens first' }, (b) =>
  cards.forEach((cd) => {
    const d = 2 + Math.round((dist(cd) - DMIN) * RIPPLE);   // this screen's delay in the opening
    b.fromTo(cd.st, { sc: 1 }, { sc: 0.6 }, { at: 40 - d - 14, dur: 14, ease: rev(OVERSHOOT) });
    b.fromTo(cd.st, { o: 1 }, { o: 0 }, { at: 40 - d - 6, dur: 6, ease: rev(bezier(0.25, 0.1, 0.25, 1)) });
  }));
s.beat('cam.reset', { at: LOOP - 30, dur: 30, ease: rev(bezier(0.25, 0.1, 0.25, 1)), note: 'Camera eases back in to the opening view (the opening zoom-out, reversed)' }, (b) =>
  b.fromTo(cam, { z: Z0 }, { z: ZIN }));

// ---------------------------------------------------------------- Lotties (stepped by the frame) and images loaded before the first capture
// Lotties hold still (on their finished state) until the camera focuses on their screen; then they play from the
// start, and pause where they are when the camera moves on. Screens the camera never visits stay still.
// Home spotlight: in its close-up the spotlight carousel goes through all five IPL banners, one after another
for (const cd of cards.filter((c) => c.name === 'Home spotlight')) {
  const span = focusSpans[cards.indexOf(cd)], strip = cd.el.querySelector('.strip');
  if (!span) continue;
  const ease = bezier(0.45, 0, 0.15, 1), step = SPOT.slide + SPOT.rest;
  s.onFrame((f) => {
    const t = f - span[0];
    let x = 0;
    if (t > 0) { const k = Math.min(SPOT_N - 1, Math.floor(t / step)), u = t - k * step;   // rest first, then slide
      x = k + (k < SPOT_N - 1 && u > SPOT.rest ? ease(Math.min(1, (u - SPOT.rest) / SPOT.slide)) : 0); }
    strip.style.transform = `translateX(${(-360 * Math.min(x, SPOT_N - 1)).toFixed(1)}px)`;
  });
}
// Leaderboard: in its close-up, the page scrolls slowly and continuously from the top until the camera has moved on
for (const cd of cards.filter((c) => c.name === 'Leaderboard')) {
  const span = focusSpans[cards.indexOf(cd)];
  if (!span) continue;
  const im = cd.el.querySelector('.body img'), body = cd.el.querySelector('.body');
  // a continuous, slow scroll: it eases up to speed (RAMP frames), then keeps going at V px/frame, past the prizes, the
  // Daily / Weekly / Season tabs and 'Runs scored by you', until the camera has left (never stops on screen)
  const a = span[0] + 14, RAMP = 16, V = 2.4, END = span[1] + MOVE;
  // the status bar stays white, then turns green once (and only once) as the green "How to score runs" section
  // reaches it; time + icons go white with it. GREEN_AT: where that section starts in the page image (px)
  const sbar = cd.el.querySelector('.sbar'), clock = sbar.querySelector('b'), icons = sbar.querySelector('img');
  const GREEN_AT = 1290, GREEN = [76, 148, 71], BLEND = 70;
  s.onFrame((f) => {
    const range = Math.max(0, im.offsetHeight - body.offsetHeight), u = Math.max(0, Math.min(f, END) - a);
    const y = Math.min(range, V * (u < RAMP ? (u * u) / (2 * RAMP) : u - RAMP / 2));
    im.style.transform = `translateY(${(-y).toFixed(1)}px)`;
    const yImg = (y + 10) * (im.naturalWidth / im.offsetWidth);   // the page just below the bar
    const w = smooth((yImg - (GREEN_AT - BLEND)) / BLEND);           // 0 = white bar, 1 = green bar
    const [r, g, bl] = GREEN.map((v) => Math.round(255 + (v - 255) * w));
    sbar.style.background = `linear-gradient(rgb(${r}, ${g}, ${bl}) 0 31px, rgba(${r}, ${g}, ${bl}, 0) 49px)`;
    const t = Math.round(255 * w); clock.style.color = `rgb(${t}, ${t}, ${t})`; icons.style.filter = `invert(${w.toFixed(2)})`;
  });
}
// Splash: the visited copy starts on the phone's home screen (the case study's); a touch moves to the PayZapp icon in
// the dock and taps it, the app grows out of the icon to fill the screen, then the splash animation plays
{
  const cd = cards[+Object.keys(labelFor).find((k) => labelFor[k] === 'Splash')], L = landAt['Splash'];
  const scr = cd.el.querySelector('.scr'), app = [scr.querySelector('.sbar'), scr.querySelector('.body')];
  const SW = 282, SH = 602, IMG_H = SW * 1145 / 540;   // screen; the home screenshot (540 × 1145) at the screen's width
  const icon = { x: SW * 205 / 540, y: IMG_H * 1045 / 1145, s: SW * 82 / 540, r: 13 };   // the PayZapp icon in the dock
  const os = document.createElement('div');
  Object.assign(os.style, { position: 'absolute', inset: '0', zIndex: 0, background: '#5B7E9C' });
  os.innerHTML = `<img src="assets/android-home.png" style="position:absolute;left:0;top:0;width:100%"><div class="sbar light" style="background:none"><b>9:41</b><img src="assets/statusbar-right.svg"></div>`;
  const dot = document.createElement('i');
  Object.assign(dot.style, { position: 'absolute', left: '0', top: '0', width: '30px', height: '30px', margin: '-15px 0 0 -15px', borderRadius: '50%', background: 'rgba(255,255,255,.85)', boxShadow: '0 1px 6px rgba(0,0,0,.3)' });
  os.appendChild(dot);
  scr.insertBefore(os, scr.firstChild);
  app[1].style.zIndex = 1;   // the app paints over the home screen as it opens
  const move = bezier(0.45, 0, 0.15, 1), grow = bezier(0.22, 0.61, 0.36, 1), ramp = (f, a, d) => Math.max(0, Math.min(1, (f - a) / d));
  s.onFrame((f) => {
    const t = f - L;
    // the touch: appears mid-screen, moves to the icon, presses, lifts as the app opens
    const m = move(ramp(t, OPEN.at, OPEN.tap - OPEN.at)), x = SW * 0.5 + (icon.x - SW * 0.5) * m, y = SH * 0.48 + (icon.y - SH * 0.48) * m;
    const press = ramp(t, OPEN.tap, 3) - ramp(t, OPEN.tap + 4, 3);
    dot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(smooth(ramp(t, OPEN.show, 5)) * (1 - 0.2 * press)).toFixed(3)})`;
    dot.style.opacity = (1 - ramp(t, OPEN.open, 4)).toFixed(3);
    // the app: hidden, then a rounded rect growing from the icon to the full screen
    const p = grow(ramp(t, OPEN.open, OPEN.dur)), q = 1 - p;
    const T = (icon.y - icon.s / 2) * q, R = (SW - icon.x - icon.s / 2) * q, B = (SH - icon.y - icon.s / 2) * q, Lf = (icon.x - icon.s / 2) * q, rad = icon.r * q + 32 * p;
    app.forEach((el) => {   // the same screen rect, in each element's own box (bar: top 0, 31 tall; body: from 30 down)
      const top = el.offsetTop, bot = SH - top - el.offsetHeight;
      el.style.clipPath = t < OPEN.open ? 'inset(50%)' : `inset(${(T - top).toFixed(1)}px ${R.toFixed(1)}px ${(B - bot).toFixed(1)}px ${Lf.toFixed(1)}px round ${rad.toFixed(1)}px)`;
    });
    os.style.visibility = p >= 1 ? 'hidden' : 'visible';
  });
}
// Refer & Score: the full referral animation, stepped by the frame, only once the camera is on it (else the plain screen)
for (const cd of cards.filter((c) => c.name === 'Refer & Score')) {
  const q = (c) => cd.el.querySelector(c), scrim = q('.ref-scrim'), lot = q('.ref-lot'), sheet = q('.ref-sheet'), span = focusSpans[cards.indexOf(cd)];
  if (!span) continue;
  const barScrim = document.createElement('div');   // the backdrop dims the status bar too
  Object.assign(barScrim.style, { position: 'absolute', inset: '0', background: '#000', opacity: '0' });
  q('.sbar').appendChild(barScrim);
  const anim = lottie.loadAnimation({ container: lot, renderer: 'svg', loop: false, autoplay: false, path: 'assets/referral/referral.json', rendererSettings: { preserveAspectRatio: 'xMidYMax meet' } });
  if (!anim.isLoaded) await new Promise((ok) => anim.addEventListener('DOMLoaded', ok));
  const last = anim.totalFrames - 1, ramp = (t, a, d) => Math.max(0, Math.min(1, (t - a) / d));
  const t1 = REF.in, t2 = t1 + REF.pause, t3 = t2 + REF.play, SHEET_IN = bezier(0.2, 0.8, 0.2, 1);
  s.onFrame((f) => {
    const t = f - span[0];
    if (t < 0 || t > t3 + REF.out) { scrim.style.opacity = 0; barScrim.style.opacity = 0; lot.style.opacity = 0; sheet.style.opacity = 0; return; }
    const k = t < t1 ? 15 * t / t1 : t < t2 ? 15 : Math.min(last, 15 + (last - 15) * (t - t2) / REF.play);
    anim.goToAndStop(k, true);
    const fadeIn = ramp(t, 0, 11), exit = ramp(t, t3, REF.out);
    scrim.style.opacity = barScrim.style.opacity = 0.55 * fadeIn * (1 - exit);   // only the backdrop fades
    // the sheet (invite + share row) slides up from below like a bottom sheet, solid (no see-through layering), and back down at the end
    const y = (1 - SHEET_IN(ramp(t, 0, 20))) * 0.5 * lot.offsetHeight + 1.1 * lot.offsetHeight * exit * exit;
    lot.style.opacity = 1;
    lot.style.transform = sheet.style.transform = `translateY(${y.toFixed(1)}px)`;
    sheet.style.opacity = 1 - ramp(t, t2, 4);
  });
}
// the intro's payment success: the cricket ball drops into the tick while the pair holds
{
  const box = introPhones[1].el.querySelector('.ball');
  box.innerHTML = '';
  const anim = lottie.loadAnimation({ container: box, renderer: 'svg', loop: false, autoplay: false, path: 'assets/pay-success.json', rendererSettings: { preserveAspectRatio: 'xMidYMin meet' } });
  if (!anim.isLoaded) await new Promise((ok) => anim.addEventListener('DOMLoaded', ok));
  s.onFrame((f) => anim.goToAndStop(Math.max(0, Math.min(anim.totalFrames - 1, ((f - 22) / s.fps) * anim.frameRate)), true));
}
// The promo video: still on its first frame until the camera reaches it, then it plays through (frame-accurate: each
// frame seeks the video to its time; capture waits for the seek), and holds its last frame after.
for (const cd of cards.filter((c) => c.name === 'Promo video')) {
  const v = cd.el.querySelector('video'), span = focusSpans[cards.indexOf(cd)];
  await new Promise((ok) => (v.readyState >= 2 ? ok() : v.addEventListener('loadeddata', ok, { once: true })));
  s.onFrame((f) => {
    const t = span ? Math.max(POSTER, Math.min(v.duration - 0.02, POSTER + (PROMO_SPEED * (f - span[0])) / s.fps)) : POSTER;   // rests on the title card; plays on from there
    if (Math.abs(v.currentTime - t) < 0.001) return;
    v.currentTime = t;
    s.waitFor(new Promise((ok) => { v.addEventListener('seeked', ok, { once: true }); setTimeout(ok, 1500); }));   // capture waits for the frame
  });
}
const HOOK = { 'scan-ipl.json': 80 };   // where a screen's animation starts: skips a slow wind-up so the hook plays at once
const PRE = { 'pay-success.json': PAY.pre };   // starts this many frames early, so it's already playing while the camera travels to it
await Promise.all(lotties.map(async (l) => {
  const anim = lottie.loadAnimation({ container: l.container, renderer: 'svg', loop: false, autoplay: false, path: l.path, rendererSettings: { preserveAspectRatio: l.fit } });
  if (!anim.isLoaded) await new Promise((ok) => anim.addEventListener('DOMLoaded', ok));
  const fr = anim.frameRate, n = anim.totalFrames, span = focusSpans[l.card], file = l.path.split('/').pop(), k0 = HOOK[file] || 0;
  const go = span && span[0] - (PRE[file] || 0);   // when it starts playing
  s.onFrame((f) => {
    let k = n - 1;   // still: the finished state
    if (span && f >= go) k = k0 + (((Math.min(f, span[1]) - go) / s.fps) * fr) % (n - k0);   // playing, then held where it stopped
    else if (span && f >= go - MOVE) k = k0;   // while the camera travels to it: at its start, so the hook plays from the top (no jump from the end state)
    anim.goToAndStop(k, true);
    if (l.txt) l.txt.style.opacity = span && f >= span[0] && f < span[1] ? Math.min(1, k / (0.5 * fr)) : 1;   // the runs text arrives with the sheet
  });
}));
await Promise.all([...document.querySelectorAll('#cam img, #camFocus img')].map((im) => im.decode().catch(() => {})));
await Promise.all([400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 16px InterLocal`)).concat(document.fonts.load('600 64px FrauncesLocal')));
s.ready({ tail: -1 });   // loop: the last frame is one step before frame LOOP, which equals frame 0
