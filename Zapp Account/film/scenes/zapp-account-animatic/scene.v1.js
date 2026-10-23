// Zapp Account — animatic. A ~64 s case-study film that follows the rehearsal script:
// premise → wallet → adoption gap → persona → problems → rebrand → directions →
// entry & onboarding → locked actions → familiarity → home hierarchy → results.
// 1920x1080 · 25 fps. One wide SVG "storyboard wall"; the camera travels between panels.
// All on-screen copy is lifted from the case study / presentation — placeholders, not new copy.
import { gsap } from 'gsap';
import { studio } from '@studio/studio.js';
import { camera } from '@studio/kits/camera.js';
import { cursor } from '@studio/kits/cursor.js';
import { sketch } from '@studio/kits/sketch.js';

const s = await studio({ id: 'zapp-account-animatic', width: 1920, height: 1080, fps: 25 });
const $ = (q) => document.querySelector(q);
const world = $('#world');
const sk = sketch(world, { seed: 11 });
const INK = '#2b2b2b', GREY = '#8a8478', ORANGE = '#F2711C', RED = '#E3262D', NAVY = '#24496B', BLUE = '#2F80ED', PAPER = '#ffffff';
const SVGNS = 'http://www.w3.org/2000/svg';
const node = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); (parent || world).appendChild(e); return e; };
const defs = node('defs', {});
const clip = (id, x, y, w, h, r = 0) => { const c = node('clipPath', { id }, defs); return node('rect', { x, y, width: w, height: h, rx: r }, c); };
const ellipse = (g, cx, cy, rx, ry, o) => sk.path(g, `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0`, o);
const logo = (g, x, y, size) => {
  const t = sk.text(g, x, y, '', { size, anchor: 'middle', weight: 900, font: "-apple-system, 'SF Pro Display', system-ui" });
  t.setAttribute('font-style', 'italic');
  t.innerHTML = `<tspan fill="${RED}">ZAPP</tspan><tspan fill="${NAVY}"> ACCOUNT</tspan>`;
  return t;
};
const arrow = (g, x1, y1, x2, y2, o = {}) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 16;
  sk.path(g, `M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 30} ${x2},${y2}`, { stroke: ORANGE, strokeWidth: 3, ...o });
  sk.path(g, `M${x2 - h * Math.cos(a - 0.5)},${y2 - h * Math.sin(a - 0.5)} L${x2},${y2} L${x2 - h * Math.cos(a + 0.5)},${y2 - h * Math.sin(a + 0.5)}`, { stroke: ORANGE, strokeWidth: 3, ...o });
};

// ---------------------------------------------------------------- shot list
const shots = [
  { id: 'title', at: 0, dur: 100, title: 'Driving Adoption', onscreen: '', action: 'Title writes itself in word by word; subtitle and dates follow.' },
  { id: 'wallet', hl: 'existed', at: 100, dur: 110, title: 'The wallet', onscreen: 'PayZapp Wallet already existed within PayZapp.', action: 'The old wallet with its capabilities (balance, payments, Auto-Load) — then the established wallets crowd in and it shrinks into the background.' },
  { id: 'gap', hl: 'adoption', at: 210, dur: 120, title: 'The adoption gap', onscreen: 'The problem was adoption', action: 'Directional chart draws on: PayZapp users high, wallet users flat and low. The gap is bracketed.' },
  { id: 'persona', hl: 'Core Persona', at: 330, dur: 90, title: 'Core persona', onscreen: 'Our Core Persona', action: 'Existing PayZapp user sketch; three facts pop in beside them.' },
  { id: 'problems', hl: 'revealed', at: 420, dur: 120, title: 'What interviews revealed', onscreen: 'What interviews revealed', action: 'Three problem cards deal in, one at a time.' },
  { id: 'rebrand', hl: 'call it', at: 540, dur: 100, title: 'The rebrand', onscreen: 'They wanted to call it', titlePos: 'tl', action: '“PayZapp Wallet” is struck through and lifts away; the Zapp Account wordmark lands with the proposition.' },
  { id: 'directions', hl: 'design directions', at: 640, dur: 120, title: 'Design directions', onscreen: 'Our findings shaped these design directions', titlePos: 'tl', action: 'The three directions build in as columns.' },
  { id: 'entry', hl: 'One benefit', at: 760, dur: 130, title: 'Entry points & onboarding', onscreen: 'One benefit at a time', action: 'PayZapp home with the Zapp spotlight banner. Tap Explore More → carousel walks through three benefits → tap the CTA.' },
  { id: 'locked', hl: 'upgrade opportunities', at: 890, dur: 120, title: 'Locked actions', onscreen: 'Locked actions became upgrade opportunities', action: 'Pan into Zapp Account (limited). Locks drop onto the three payment actions; tap one → the upgrade banner answers. Then it unlocks to full capability.' },
  { id: 'familiar', hl: 'Familiarity', at: 1010, dur: 100, title: 'Familiarity by design', onscreen: 'Familiarity by design worked in our favor', titlePos: 'tl', action: 'PayZapp home slides back in beside it; the matching payment rows light up and link across.' },
  { id: 'balance', hl: 'hero', at: 1110, dur: 70, title: 'Balance', onscreen: 'Balance became the hero', titlePos: 'br', action: 'Push in on the top of Zapp home. Cashpoints counter pings, then the balance gets the spotlight.' },
  { id: 'addmoney', hl: 'hero CTA', at: 1180, dur: 80, title: 'Add Money', onscreen: 'Add Money became the hero CTA', titlePos: 'br', action: 'Add Money is circled and tapped; loads result written in the margin.' },
  { id: 'autoload', hl: 'discoverable', at: 1260, dur: 75, title: 'Auto-Load', onscreen: 'Context made Auto-Load discoverable', titlePos: 'br', action: 'Auto-Load circled right under Add Money; adoption result in the margin.' },
  { id: 'nudge', hl: 'in context', at: 1335, dur: 75, title: 'Soft nudges', onscreen: 'Soft nudges reinforced value in context', titlePos: 'br', action: 'A soft nudge slides in under the payment actions, pointing at Scan and Pay; spends result in the margin.' },
  { id: 'results', hl: 'stronger use,', at: 1410, dur: 120, title: 'Impact', onscreen: 'The reported results show stronger use, not just a new name.', titlePos: 'tl', action: 'Four result cards count up: spends, loads, Auto-Load adoption, Top 5 wallet.' },
  { id: 'end', at: 1530, dur: 70, title: 'End card', onscreen: '', action: 'Wordmark + case-study title.' },
];
// shots stay on the editor timeline as beats; nothing is drawn for them on screen
shots.forEach((sh, i) => s.beat(`shot.${i + 1}.${sh.id}`, { at: sh.at, dur: sh.dur, note: sh.action }));
const shot = Object.fromEntries(shots.map((x) => [x.id, x]));

// ---------------------------------------------------------------- panel 0 · title  (centre 960)
const p0 = sk.group(world, 'Title');
const titleWords = ['Driving', 'Adoption'].map((w, i) => {
  const g = sk.group(p0, `Title – ${w}`);
  sk.text(g, i ? 990 : 930, 470, w, { size: 140, anchor: i ? 'start' : 'end' });
  return g;
});
const titleLine = sk.group(p0, 'Title underline');
sk.path(titleLine, 'M520,505 C800,490 1150,515 1420,498', { stroke: ORANGE, strokeWidth: 7 });
const titleSub = sk.group(p0, 'Title – subtitle');
sk.text(titleSub, 960, 580, 'How we repositioned PayZapp Wallet for the people already using PayZapp', { size: 36, anchor: 'middle', color: '#4a4a4a' });
const titleMeta = sk.group(p0, 'Title – meta');
sk.text(titleMeta, 960, 640, 'Zapp Account · Dec 2024 – Feb 2025', { size: 24, anchor: 'middle', color: GREY });

// ---------------------------------------------------------------- panel 1 · the wallet  (centre 3160)
const walletPhone = sk.group(world, 'Phone – PayZapp Wallet');
sk.rect(walletPhone, 2970, 150, 380, 780, { r: 48, fill: '#1f2a33', stroke: '#1f2a33', roughness: 0.5 });
sk.rect(walletPhone, 2980, 160, 360, 760, { r: 40, fill: PAPER, stroke: '#c9d3dd' });
sk.text(walletPhone, 3160, 240, 'PayZapp Wallet', { size: 30, anchor: 'middle' });
sk.text(walletPhone, 3160, 350, '₹ 1,250', { size: 56, anchor: 'middle' });
sk.rect(walletPhone, 3070, 390, 180, 50, { r: 25, fill: '#e6eef6', stroke: '#9fb3c8' });
sk.scribble(walletPhone, 3110, 415, 100, { stroke: '#9fb3c8' });
[0, 1, 2, 3, 4].forEach((i) => { sk.circle(walletPhone, 3030, 500 + i * 80, 36, { fill: '#eef2f6', stroke: '#c9d3dd' }); sk.scribble(walletPhone, 3065, 500 + i * 80, 160 - (i % 2) * 50); });
const chip = (g, x, y, label, o = {}) => { sk.rect(g, x, y, o.w || 220, o.h || 60, { r: (o.h || 60) / 2, fill: o.fill || PAPER, stroke: o.stroke || INK }); sk.text(g, x + (o.w || 220) / 2, y + (o.h || 60) / 2 + 9, label, { size: o.size || 28, anchor: 'middle', color: o.color || INK }); };
const walletChips = [['Balance', 2600, 300], ['Payments', 3520, 420], ['Auto-Load', 2640, 640]].map(([l, x, y]) => { const g = sk.group(world, `Chip – ${l}`); chip(g, x, y, l, { fill: '#e8f1ff', stroke: NAVY, color: NAVY }); return g; });
const rivals = [['Paytm', 2280, 200], ['PhonePe', 3780, 220], ['MobiKwik', 3760, 700]].map(([l, x, y]) => { const g = sk.group(world, `Rival – ${l}`); chip(g, x, y, l, { w: 300, h: 100, size: 40, fill: '#3a3a3a', stroke: '#3a3a3a', color: '#fff' }); return g; });

// ---------------------------------------------------------------- panel 2 · the adoption gap  (centre 5360)
const chart = sk.group(world, 'Chart');
sk.line(chart, 4620, 200, 4620, 700, { strokeWidth: 2.4 });
sk.line(chart, 4620, 700, 5990, 700, { strokeWidth: 2.4 });
const months = [4680, 4935, 5190, 5445, 5700, 5955];
months.forEach((x, i) => sk.text(chart, x, 740, `M${i + 1}`, { size: 22, anchor: 'middle', color: GREY }));
sk.text(chart, 4620, 800, 'Directional visualization, not plotted values', { size: 20, color: GREY });
const lines = sk.group(world, 'Chart – lines', { 'clip-path': 'url(#clipChart)' });
const chartWipe = clip('clipChart', 4600, 150, 0, 600);
const mau = [330, 300, 312, 282, 270, 252], wal = [640, 636, 642, 632, 634, 628];
sk.path(lines, 'M' + months.map((x, i) => `${x},${mau[i]}`).join(' L'), { stroke: BLUE, strokeWidth: 5 });
sk.path(lines, 'M' + months.map((x, i) => `${x},${wal[i]}`).join(' L'), { stroke: RED, strokeWidth: 5 });
sk.text(lines, 4680, 286, 'PayZapp monthly active users', { size: 28, color: BLUE });
sk.text(lines, 4680, 600, 'PayZapp Wallet users', { size: 28, color: RED });
const gapBracket = sk.group(world, 'Gap bracket');
sk.path(gapBracket, 'M6040,262 L6040,618', { stroke: ORANGE, strokeWidth: 4 });
sk.path(gapBracket, 'M6024,282 L6040,262 L6056,282 M6024,598 L6040,618 L6056,598', { stroke: ORANGE, strokeWidth: 4 });

// ---------------------------------------------------------------- panel 3 · persona  (centre 7560)
const person = sk.group(world, 'Persona – figure');
sk.circle(person, 7230, 330, 130, { fill: '#f3c6a5', stroke: INK });
sk.path(person, 'M7230,398 L7230,580 M7140,470 L7230,440 L7300,500 M7230,580 L7175,710 M7230,580 L7285,710', { strokeWidth: 4 });
sk.rect(person, 7290, 470, 44, 76, { r: 8, fill: NAVY, stroke: NAVY });
const personHead = sk.group(world, 'Persona – heading');
sk.text(personHead, 7440, 330, 'Existing PayZapp users', { size: 52 });
const facts = ['Salaried', 'Aged 25–40', 'Tier 2 & Tier 3 cities'].map((l, i) => { const g = sk.group(world, `Fact – ${l}`); chip(g, 7440, 380 + i * 96, l, { w: 380, h: 70, size: 32, fill: '#fff4e6', stroke: ORANGE }); return g; });

// ---------------------------------------------------------------- panel 4 · problems  (centre 9760)
const problemCards = [
  ['The wallet’s value', 'was unclear'],
  ['Auto-Load and other', 'capabilities went', 'undiscovered'],
  ['Wallet was a Cashpoints', 'conversion tool'],
].map((lines, i) => {
  const x = 9060 + i * 480, g = sk.group(world, `Problem – ${lines.join(' ')}`);
  sk.rect(g, x, 230, 440, 440, { r: 22, fill: PAPER });
  if (i === 0) { sk.circle(g, x + 220, 350, 150, { fill: '#e8f1ff', stroke: NAVY }); sk.text(g, x + 220, 385, '?', { size: 110, anchor: 'middle', color: NAVY }); }
  if (i === 1) { sk.circle(g, x + 205, 340, 120, { fill: '#e8f1ff', stroke: NAVY, strokeWidth: 4 }); sk.line(g, x + 248, 383, x + 292, 427, { stroke: NAVY, strokeWidth: 9 }); }
  if (i === 2) {
    sk.circle(g, x + 140, 350, 100, { fill: '#f6b84a', stroke: '#c98a1d' }); sk.text(g, x + 140, 368, '⚡', { size: 48, anchor: 'middle' });
    arrow(g, x + 200, 350, x + 262, 350);
    sk.rect(g, x + 270, 310, 110, 80, { r: 12, fill: '#e8f1ff', stroke: NAVY });
  }
  lines.forEach((l, k) => sk.text(g, x + 220, 500 + k * 42, l, { size: 32, anchor: 'middle' }));
  return g;
});

// ---------------------------------------------------------------- panel 5 · rebrand  (centre 11960)
const oldName = sk.group(world, 'Old name');
sk.text(oldName, 11960, 420, 'PayZapp Wallet', { size: 100, anchor: 'middle', color: '#555' });
const strike = sk.group(world, 'Strike');
sk.line(strike, 11620, 392, 12300, 384, { stroke: RED, strokeWidth: 9 });
const newName = sk.group(world, 'Zapp Account wordmark');
logo(newName, 11960, 600, 150);
const proposition = sk.group(world, 'Proposition');
sk.text(proposition, 11960, 700, 'A payment account for all your daily spends', { size: 44, anchor: 'middle' });

// ---------------------------------------------------------------- panel 6 · directions  (centre 14160)
const directions = [
  ['✦', 'Lead with value', 'Lead with the value users would feel,', 'not the feature terminology behind it.'],
  ['+', 'Center loading money', 'Make loading money the core action', 'of the Zapp Account experience.'],
  ['◎', 'Use contextual levers', 'Leverage familiar PayZapp contexts to', 'educate users even reinforce value.'],
].map(([glyph, head, a, b], i) => {
  const c = 13660 + i * 500, g = sk.group(world, `Direction – ${head}`);
  sk.circle(g, c, 360, 160, { fill: '#e8f1ff', stroke: NAVY });
  sk.text(g, c, 384, glyph, { size: 72, anchor: 'middle', color: NAVY });
  sk.text(g, c, 520, head, { size: 42, anchor: 'middle' });
  sk.text(g, c, 572, a, { size: 24, anchor: 'middle', color: '#666' });
  sk.text(g, c, 604, b, { size: 24, anchor: 'middle', color: '#666' });
  return g;
});

// ---------------------------------------------------------------- panel 7 · phones
// A = PayZapp home (left), B = Zapp Account home (right). Screen coords are traced from the
// real screens at ~0.49x, so the layout matches the product.
const AX = 16300, AY = 150, BX = 17300, BY = 150;
const phoneShell = (name, x, y) => {
  const g = sk.group(world, name);
  sk.rect(g, x, y, 380, 780, { r: 48, fill: '#1f2a33', stroke: '#1f2a33', roughness: 0.5 });
  clip(`clip-${name.replace(/\W+/g, '')}`, x + 10, y + 10, 360, 760, 40);
  const screen = sk.group(g, `${name} – screen`, { 'clip-path': `url(#clip-${name.replace(/\W+/g, '')})` });
  sk.rect(screen, x + 10, y + 10, 360, 760, { r: 0, fill: PAPER, stroke: 'none', roughness: 0.3 });
  return { g, screen };
};

// A · PayZapp home
const A = phoneShell('Phone – PayZapp home', AX, AY);
const a = (dx, dy) => [AX + dx, AY + dy];
const aHome = sk.group(A.screen, 'PayZapp home');
sk.rect(aHome, ...a(10, 10), 360, 260, { fill: '#e9eef3', stroke: 'none', roughness: 0.3 });
sk.rect(aHome, ...a(34, 62), 34, 34, { r: 8, fill: '#dfe5ec', stroke: '#b8c3cf' });
sk.rect(aHome, ...a(310, 62), 34, 34, { r: 8, fill: '#dfe5ec', stroke: '#b8c3cf' });
const spotlight = sk.group(aHome, 'Spotlight banner');
sk.text(spotlight, ...a(34, 134), 'Your Shortcut to Smart,', { size: 19, color: '#2b3a46' });
sk.text(spotlight, ...a(34, 158), 'Secure UPI Payments!', { size: 19, color: '#2b3a46' });
sk.scribble(spotlight, ...a(34, 182), 150); sk.scribble(spotlight, ...a(34, 198), 110);
const exploreBtn = sk.group(spotlight, 'Explore More');
sk.rect(exploreBtn, ...a(34, 212), 110, 32, { r: 8, fill: PAPER, stroke: '#b8c3cf' });
sk.text(exploreBtn, ...a(89, 234), 'Explore More ›', { size: 14, anchor: 'middle' });
sk.rect(spotlight, ...a(222, 110), 128, 132, { r: 14, fill: '#f6f9fc', stroke: '#9fb3c8' });
sk.line(spotlight, ...a(222, 110), ...a(350, 242), { stroke: '#c9d3dd' }); sk.line(spotlight, ...a(350, 110), ...a(222, 242), { stroke: '#c9d3dd' });
sk.text(spotlight, ...a(286, 182), '3D', { size: 20, anchor: 'middle', color: '#7f93a8' });
sk.rect(aHome, ...a(10, 258), 360, 520, { r: 24, fill: PAPER, stroke: '#e3e8ee' });
const aRow1 = sk.group(aHome, 'PayZapp – payment row');
[[59, 'Scan any QR'], [146, 'Pay Anyone'], [233, 'Bank Transfer'], [320, 'Check Balance']].forEach(([cx, l]) => {
  sk.rect(aRow1, ...a(cx - 24, 291), 48, 48, { r: 12, fill: BLUE, stroke: BLUE });
  sk.text(aRow1, ...a(cx, 362), l, { size: 12, anchor: 'middle' });
});
sk.rect(aHome, ...a(95, 400), 190, 26, { r: 13, fill: '#eef4fb', stroke: '#cfdcea' });
sk.text(aHome, ...a(190, 418), 'UPI ID: ••••@pz', { size: 12, anchor: 'middle', color: '#555' });
[[59, 'Bills & Recharges'], [146, 'Offers & Cashpoints'], [233, 'Zapp Account'], [320, 'Passbook']].forEach(([cx, l], i) => {
  sk.rect(aHome, ...a(cx - 24, 452), 48, 48, { r: 12, fill: '#eef4fb', stroke: '#cfdcea' });
  if (i === 2) sk.text(aHome, ...a(cx, 482), 'ZAPP', { size: 13, anchor: 'middle', color: RED, weight: 700 });
  sk.text(aHome, ...a(cx, 520), l, { size: 11, anchor: 'middle' });
});
sk.text(aHome, ...a(34, 600), 'Explore offers & rewards', { size: 15 });
sk.rect(aHome, ...a(34, 616), 312, 60, { r: 12, fill: '#d5ecbd', stroke: '#9cc77a' });
sk.rect(aHome, ...a(10, 694), 360, 80, { fill: '#1f3550', stroke: 'none', roughness: 0.3 });
sk.circle(aHome, ...a(190, 696), 64, { fill: BLUE, stroke: '#cfe2f7', strokeWidth: 3 });
[[50, 'Pay'], [118, 'Cards'], [262, 'Shop'], [330, 'Bank']].forEach(([x, l]) => sk.text(aHome, ...a(x, 752), l, { size: 13, anchor: 'middle', color: '#e6eef6' }));

// A · onboarding carousel (over the home, inside the screen)
const carousel = sk.group(A.screen, 'Onboarding carousel');
sk.rect(carousel, ...a(10, 10), 360, 760, { fill: '#f4f9ff', stroke: 'none', roughness: 0.3 });
logo(carousel, ...a(190, 92), 22);
const slider = sk.group(carousel, 'Carousel – slides');
[0, 1, 2].forEach((i) => {
  const ox = i * 360, g = sk.group(slider, `Slide ${i + 1}`);
  sk.rect(g, ...a(60 + ox, 140), 260, 260, { r: 24, fill: '#e3efff', stroke: '#9cc3ea' });
  sk.line(g, ...a(60 + ox, 140), ...a(320 + ox, 400), { stroke: '#c9dcef' }); sk.line(g, ...a(320 + ox, 140), ...a(60 + ox, 400), { stroke: '#c9dcef' });
  sk.text(g, ...a(190 + ox, 278), `3D · benefit ${i + 1}`, { size: 18, anchor: 'middle', color: '#7f93a8' });
  sk.scribble(g, ...a(60 + ox, 460), 240, { strokeWidth: 10, stroke: '#7f93a8' });
  sk.scribble(g, ...a(60 + ox, 490), 180, { strokeWidth: 10, stroke: '#7f93a8' });
  sk.scribble(g, ...a(60 + ox, 532), 230); sk.scribble(g, ...a(60 + ox, 552), 170);
});
[170, 190, 210].forEach((x) => sk.circle(carousel, ...a(x, 630), 10, { fill: '#c9d3dd', stroke: 'none' }));
const dotOn = sk.group(carousel, 'Carousel – active dot');
sk.rect(dotOn, ...a(162, 624), 18, 12, { r: 6, fill: NAVY, stroke: NAVY });
const cta = sk.group(carousel, 'Carousel – CTA');
sk.rect(cta, ...a(40, 680), 300, 50, { r: 25, fill: NAVY, stroke: NAVY });
sk.scribble(cta, ...a(130, 705), 120, { stroke: '#c9dcef' });

// B · Zapp Account home (starts in the limited state)
const B = phoneShell('Phone – Zapp Account home', BX, BY);
const z = (dx, dy) => [BX + dx, BY + dy];
const zHome = sk.group(B.screen, 'Zapp home');
sk.rect(zHome, ...z(10, 10), 360, 330, { fill: '#eaf4ff', stroke: 'none', roughness: 0.3 });
sk.path(zHome, `M${z(58, 87).join(',')} h-20 m0,0 l9,-9 m-9,9 l9,9`, { stroke: NAVY, strokeWidth: 3 });
logo(zHome, ...z(186, 95), 24);
const coin = sk.group(zHome, 'Cashpoints counter');
sk.rect(coin, ...z(298, 72), 50, 30, { r: 15, fill: '#fde9c8', stroke: '#e9c48f' });
sk.circle(coin, ...z(314, 87), 16, { fill: '#f2a33a', stroke: '#c98a1d' });
sk.text(coin, ...z(334, 93), '7', { size: 16, weight: 700 });
const banner = sk.group(zHome, 'Upgrade banner');
sk.rect(banner, ...z(27, 136), 326, 85, { r: 18, fill: '#e3f0ff', stroke: '#9cc3ea' });
sk.rect(banner, ...z(42, 148), 40, 64, { r: 7, fill: PAPER, stroke: NAVY });
sk.text(banner, ...z(62, 188), '🔒', { size: 16, anchor: 'middle' });
sk.text(banner, ...z(96, 168), 'Upgrade Your Zapp Account', { size: 15, weight: 700 });
sk.scribble(banner, ...z(96, 188), 200); sk.scribble(banner, ...z(96, 204), 90);
const main = sk.group(zHome, 'Zapp home – body');
const bal = sk.group(main, 'Balance');
sk.text(bal, ...z(190, 286), '₹243.06', { size: 40, anchor: 'middle', weight: 700 });
const addBtn = sk.group(main, 'Add Money');
sk.rect(addBtn, ...z(117, 298), 146, 40, { r: 20, fill: NAVY, stroke: NAVY });
sk.text(addBtn, ...z(190, 324), '+ Add Money', { size: 17, anchor: 'middle', color: '#fff' });
const autoLoad = sk.group(main, 'Auto-Load');
sk.text(autoLoad, ...z(190, 368), '↻ Setup Auto-Load', { size: 15, anchor: 'middle', color: NAVY });
const actions = sk.group(main, 'Payment actions');
sk.rect(actions, ...z(37, 433), 306, 85, { r: 16, fill: '#f0f7ff', stroke: '#cfe2f7' });
const acts = [[94, '⌗', 'Scan', 'and Pay'], [190, '↗', 'Send Money', 'to Anyone'], [286, '⇥', 'Transfer to', 'Account']];
acts.forEach(([cx, gl, l1, l2]) => {
  sk.rect(actions, ...z(cx - 25, 409), 50, 50, { r: 14, fill: '#e6f1ff', stroke: '#9cc3ea' });
  sk.text(actions, ...z(cx, 442), gl, { size: 24, anchor: 'middle', color: NAVY });
  sk.text(actions, ...z(cx, 482), l1, { size: 12, anchor: 'middle' });
  sk.text(actions, ...z(cx, 497), l2, { size: 12, anchor: 'middle' });
});
const locks = acts.map(([cx], i) => {
  const g = sk.group(main, `Lock ${i + 1}`);
  sk.circle(g, ...z(cx + 20, 413), 24, { fill: NAVY, stroke: '#fff', strokeWidth: 2 });
  sk.rect(g, ...z(cx + 14, 412), 12, 9, { r: 2, fill: '#fff', stroke: '#fff', strokeWidth: 1 });
  sk.path(g, `M${z(cx + 16, 412).join(',')} v-4 a4,4 0 0 1 8,0 v4`, { stroke: '#fff', strokeWidth: 2 });
  return g;
});
const nudge = sk.group(main, 'Soft nudge');
sk.path(nudge, `M${z(84, 515).join(',')} l10,-12 l10,12`, { stroke: '#9fd9bf', fill: '#dff5ec', fillStyle: 'solid' });
sk.rect(nudge, ...z(30, 514), 320, 48, { r: 14, fill: '#dff5ec', stroke: '#9fd9bf' });
sk.text(nudge, ...z(50, 545), '✦', { size: 18, color: '#1f6e4f' });
sk.text(nudge, ...z(74, 534), 'Experience faster and secure payments', { size: 12, weight: 700, color: '#1f6e4f' });
sk.text(nudge, ...z(74, 551), 'without a PIN', { size: 12, color: '#1f6e4f' });
const lower = sk.group(main, 'Zapp home – shortcuts & rewards');
[[64, 'Payment', 'History'], [148, 'Tap and', 'Pay'], [232, 'View Card', ''], [315, 'Manage', 'Account']].forEach(([cx, l1, l2]) => {
  sk.rect(lower, ...z(cx - 23, 550), 46, 46, { r: 12, fill: '#e6f1ff', stroke: '#b9d6f5' });
  sk.text(lower, ...z(cx, 614), l1, { size: 12, anchor: 'middle', color: NAVY });
  if (l2) sk.text(lower, ...z(cx, 629), l2, { size: 12, anchor: 'middle', color: NAVY });
});
sk.text(lower, ...z(34, 676), 'REWARDS', { size: 13, color: '#7f8a96' });
sk.rect(lower, ...z(34, 690), 312, 52, { r: 14, fill: '#fff3dc', stroke: '#f0d29b' });
sk.scribble(lower, ...z(70, 712), 220, { stroke: '#e3c08a' }); sk.scribble(lower, ...z(70, 728), 140, { stroke: '#e3c08a' });

// familiarity overlays + captions
const bandA = sk.group(world, 'Match – PayZapp row');
sk.rect(bandA, AX + 14, AY + 280, 352, 102, { r: 16, fill: 'rgba(242,113,28,.12)', stroke: ORANGE, strokeWidth: 3 });
const bandB = sk.group(world, 'Match – Zapp row');
sk.rect(bandB, BX + 30, BY + 300, 320, 130, { r: 16, fill: 'rgba(242,113,28,.12)', stroke: ORANGE, strokeWidth: 3 });
const link = sk.group(world, 'Match – link');
arrow(link, AX + 372, AY + 330, BX + 24, AY + 360, { strokeLineDash: [12, 10] });
const capA = sk.group(world, 'Caption – PayZapp home');
sk.text(capA, AX + 190, AY + 830, 'PayZapp home', { size: 30, anchor: 'middle', color: GREY });
const capB = sk.group(world, 'Caption – Zapp Account');
sk.text(capB, BX + 190, BY + 830, 'Full capability', { size: 30, anchor: 'middle', color: GREY });

// hierarchy marks (full layout: body sits 95px higher once the banner is gone)
const UP = 95;
const ring = (name, cx, cy, rx, ry) => { const g = sk.group(world, name); ellipse(g, cx, cy, rx, ry, { stroke: ORANGE, strokeWidth: 4 }); return g; };
const ringCoin = ring('Mark – Cashpoints', BX + 323, BY + 87, 44, 28);
const ringBal = ring('Mark – Balance', BX + 190, BY + 268 - UP, 112, 30);
const ringAdd = ring('Mark – Add Money', BX + 190, BY + 318 - UP, 110, 36);
const ringAuto = ring('Mark – Auto-Load', BX + 190, BY + 362 - UP, 104, 22);
const ringNudge = ring('Mark – Soft nudge', BX + 190, BY + 538 - UP, 178, 40);
const note = (name, x, y, big, small, ax, ay) => {
  const g = sk.group(world, name);
  sk.text(g, x, y, big, { size: 46, color: ORANGE });
  if (small) sk.text(g, x, y + 36, small, { size: 24, color: '#9a6a3c' });
  arrow(g, x - 16, y - 14, ax, ay);
  return g;
};
const noteAdd = note('Note – loads', BX + 450, BY + 300 - UP, '1.5× monthly loads', 'in the six months after launch', BX + 306, BY + 316 - UP);
const noteAuto = note('Note – Auto-Load', BX + 450, BY + 400 - UP, '20% Auto-Load adoption', 'one in five wallet loaders', BX + 300, BY + 366 - UP);
const noteNudge = note('Note – spends', BX + 450, BY + 505 - UP, '2.1× monthly spends', '', BX + 372, BY + 538 - UP);
const tapRing = sk.group(world, 'Tap ripple');
sk.circle(tapRing, BX + 190, BY + 318 - UP, 70, { stroke: NAVY, strokeWidth: 3 });

// ---------------------------------------------------------------- panel 8 · results  (centre 19760)
const stats = [['2.1×', 'monthly spends', ''], ['1.5×', 'monthly loads', ''], ['20%', 'Auto-Load', 'adoption'], ['Top 5', 'digital wallets', 'by monthly spends']];
const statNums = [];
const statCards = stats.map(([n, l1, l2], i) => {
  const x = 18970 + i * 400, g = sk.group(world, `Result – ${l1} ${l2}`.trim());
  sk.rect(g, x, 300, 380, 300, { r: 22, fill: PAPER });
  statNums.push(sk.text(g, x + 190, 430, n, { size: i === 3 ? 84 : 100, anchor: 'middle', color: NAVY }));
  sk.text(g, x + 190, 500, l1, { size: 30, anchor: 'middle' });
  if (l2) sk.text(g, x + 190, 538, l2, { size: 30, anchor: 'middle' });
  return g;
});
const statFoot = sk.group(world, 'Results – footnote');
sk.text(statFoot, 19760, 680, 'Reported results · April – September 2025', { size: 24, anchor: 'middle', color: GREY });

// ---------------------------------------------------------------- panel 9 · end card  (centre 21960)
const endMark = sk.group(world, 'End – wordmark');
logo(endMark, 21960, 520, 130);
const endLine = sk.group(world, 'End – title');
sk.text(endLine, 21960, 620, 'Driving Adoption', { size: 54, anchor: 'middle', color: '#4a4a4a' });

// ---------------------------------------------------------------- camera + cursor
const VIEWS = {
  r0: { x: 960, y: 540, zoom: 1 }, r1: { x: 3160, y: 580, zoom: 1 }, r2: { x: 5360, y: 520, zoom: 1 },
  r3: { x: 7560, y: 520, zoom: 1 }, r4: { x: 9760, y: 500, zoom: 1 }, r5: { x: 11960, y: 560, zoom: 1 },
  r6: { x: 14160, y: 500, zoom: 1 },
  pA: { x: AX + 190 - 280, y: 540, zoom: 1 },
  pB: { x: BX + 190 - 280, y: 540, zoom: 1 },
  both: { x: (AX + BX + 380) / 2, y: 620, zoom: 0.8 },
  zTop: { x: BX + 490, y: 360, zoom: 1.6 },
  zNudge: { x: BX + 490, y: 470, zoom: 1.5 },
  r8: { x: 19760, y: 500, zoom: 1 }, r9: { x: 21960, y: 560, zoom: 1 },
};
const cam = camera(s, $('#cam'), { start: 'r0', views: VIEWS });
const P = cursor($('#cursors'), { name: 'User', from: '#7FB2FF', to: BLUE, x: AX + 420, y: AY + 960, showTag: false }).tilt(s);

const camMoves = [
  ['wallet', 'r1'], ['gap', 'r2'], ['persona', 'r3'], ['problems', 'r4'], ['rebrand', 'r5'], ['directions', 'r6'], ['entry', 'pA'],
];
camMoves.forEach(([id, v]) => s.beat(`cam.${id}`, { at: shot[id].at - 8, dur: 16, ease: 'whip', note: `Whip-pan to ${shot[id].title}` }, (b) => cam.to(b, v)));

// ---------------------------------------------------------------- initial state
const hidden = [
  ...titleWords, titleLine, titleSub, titleMeta,
  walletPhone, ...walletChips, ...rivals,
  gapBracket, person, personHead, ...facts, ...problemCards,
  oldName, strike, newName, proposition, ...directions,
  A.g, carousel, ...locks, nudge, bandA, bandB, link, capA, capB,
  ringCoin, ringBal, ringAdd, ringAuto, ringNudge, noteAdd, noteAuto, noteNudge, tapRing,
  ...statCards, statFoot, endMark, endLine,
];
gsap.set(hidden, { opacity: 0 });
gsap.set([...walletChips, ...rivals, ...locks, ...facts, newName, ringCoin, ringBal, ringAdd, ringAuto, ringNudge, tapRing, bal, addBtn, coin, banner, walletPhone], { transformOrigin: '50% 50%' });
gsap.set(P.el || '#cursors .ms-cur', { opacity: 0 });

// kinetic type: each line's words tumble in, a squiggle draws under the key phrase, then they fly off
const typeLayer = $('#type');
const jit = (i) => { const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
shots.filter((x) => x.onscreen).forEach((x, li) => {
  const el = document.createElement('div');
  el.className = `kt kt-${x.titlePos || 'bl'}`;
  el.dataset.name = `Type – ${x.title}`;
  const words = x.onscreen.split(' '), hl = (x.hl || '').split(' ').filter(Boolean);
  const hs = hl.length ? words.findIndex((_, i) => hl.every((h, k) => words[i + k] === h)) : -1;
  el.innerHTML = words.map((w, i) => (i === hs ? '<span class="hl">' : '') + `<span class="w"><i>${w}</i></span>`
    + (hs >= 0 && i === hs + hl.length - 1 ? '<svg class="sq" viewBox="0 0 100 20" preserveAspectRatio="none"><path pathLength="1" d="M2,13 C18,4 32,18 50,10 S82,3 98,11"/></svg></span>' : '')).join(' ');
  typeLayer.appendChild(el);
  const ws = [...el.querySelectorAll('.w i')], sq = el.querySelector('.sq path');
  gsap.set(el, { opacity: 0 });
  gsap.set(ws, { opacity: 0 });
  if (sq) gsap.set(sq, { attr: { 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 } });
  s.beat(`type.${x.id}.in`, { at: x.at + 10, dur: 16, stagger: 2, ease: 'settle', note: `Type in: “${x.onscreen}”` }, (b) => {
    b.set(el, { opacity: 1 });
    ws.forEach((w, i) => b.fromTo(w,
      { opacity: 0, y: 70, rotation: (jit(li * 31 + i) - 0.5) * 24, filter: 'blur(10px)' },
      { opacity: 1, y: 0, rotation: 0, filter: 'blur(0px)' }, { i }));
    if (sq) b.fromTo(sq, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 } }, { at: ws.length * 2 + 4, dur: 14, ease: 'move' });
  });
  s.beat(`type.${x.id}.out`, { at: x.at + x.dur - 14, dur: 10, stagger: 1, ease: 'exit', note: 'Words fly off' }, (b) => {
    ws.forEach((w, i) => b.fromTo(w, { opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: -50, filter: 'blur(8px)' }, { i }));
    if (sq) b.fromTo(sq, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': -1 } }, { dur: 8 });
    b.set(el, { opacity: 0 }, ws.length + 10);
  });
});

// handheld drift on the whole shot — a pure function of the frame
const drift = $('#drift');
s.onFrame((f) => {
  drift.style.transform = `translate(${7 * Math.sin(f / 47)}px, ${5 * Math.sin(f / 61 + 1)}px) rotate(${0.35 * Math.sin(f / 83 + 2)}deg) scale(${1 + 0.006 * Math.sin(f / 71)})`;
});

// doodles (rings, arrows, strike, bracket, links) draw on as strokes rather than fading
const strokes = (g) => [...g.querySelectorAll('path')].filter((p) => p.getAttribute('fill') === 'none' || !p.getAttribute('fill'));
const prepDraw = (...gs) => gs.forEach((g) => {
  strokes(g).forEach((p) => { p.setAttribute('pathLength', 1); p.setAttribute('stroke-dasharray', '1 1'); p.setAttribute('stroke-dashoffset', 1); });
  gsap.set(g.querySelectorAll('text'), { opacity: 0 });
});
const draw = (b, g, x = {}) => {
  b.set(g, { opacity: 1 }, x.at || 0);
  const t = g.querySelectorAll('text');
  if (t.length) b.fromTo(t, { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, { ...x, at: (x.at || 0) + 4, ease: 'settle' });
  return b.fromTo(strokes(g), { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 } }, { ease: 'move', ...x });
};
prepDraw(titleLine, strike, gapBracket, link, ringCoin, ringBal, ringAdd, ringAuto, ringNudge, noteAdd, noteAuto, noteNudge);

// ---------------------------------------------------------------- 1 · title
s.beat('title.words', { at: 6, dur: 16, stagger: 6, ease: 'settle', note: 'Title writes in word by word' },
  (b) => b.each(titleWords, { opacity: 0, y: 40 }, { opacity: 1, y: 0 }));
s.beat('title.underline', { after: 'title.words', overlap: 0.4, dur: 14, ease: 'snap' }, (b) => draw(b, titleLine));
s.beat('title.sub', { after: 'title.underline', overlap: 0.5, dur: 14, stagger: 6, ease: 'fade' }, (b) => b.each([titleSub, titleMeta], { opacity: 0, y: 14 }, { opacity: 1, y: 0 }));

// ---------------------------------------------------------------- 2 · wallet
s.beat('wallet.in', { at: shot.wallet.at + 6, dur: 18, ease: 'settle', note: 'The old wallet rises in' },
  (b) => b.fromTo(walletPhone, { opacity: 0, y: 60, scale: 0.75 }, { opacity: 1, y: 0, scale: 0.75 }));
s.beat('wallet.chips', { after: 'wallet.in', overlap: 0.3, dur: 12, stagger: 5, ease: 'overshoot', note: 'Its capabilities pop out around it' },
  (b) => b.each(walletChips, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1 }));
s.beat('wallet.crowd', { at: shot.wallet.at + 62, dur: 14, stagger: 5, ease: 'overshoot', note: 'Established wallets crowd in' },
  (b) => b.each(rivals, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }));
s.beat('wallet.shrink', { with: 'wallet.crowd', offset: 8, dur: 20, ease: 'move', note: 'Our wallet shrinks and fades back' }, (b) => {
  b.fromTo(walletPhone, { opacity: 1, scale: 0.75 }, { opacity: 0.45, scale: 0.62 });
  b.fromTo(walletChips, { opacity: 1 }, { opacity: 0.3 }, { ease: 'fade' });
});

// ---------------------------------------------------------------- 3 · gap
s.beat('gap.draw', { at: shot.gap.at + 8, dur: 40, ease: 'move', note: 'Both lines draw on left to right' },
  (b) => b.fromTo(chartWipe, { attr: { width: 0 } }, { attr: { width: 1420 } }));
s.beat('gap.bracket', { after: 'gap.draw', gap: 4, dur: 14, ease: 'overshoot', note: 'The gap gets bracketed' },
  (b) => draw(b, gapBracket));

// ---------------------------------------------------------------- 4 · persona
s.beat('persona.in', { at: shot.persona.at + 6, dur: 16, ease: 'settle' }, (b) => {
  b.fromTo(person, { opacity: 0, y: 30 }, { opacity: 1, y: 0 });
  b.fromTo(personHead, { opacity: 0, x: -20 }, { opacity: 1, x: 0 }, { at: 6 });
});
s.beat('persona.facts', { after: 'persona.in', overlap: 0.3, dur: 12, stagger: 7, ease: 'overshoot', note: 'Salaried · 25–40 · Tier 2 & 3' },
  (b) => b.each(facts, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }));

// ---------------------------------------------------------------- 5 · problems
s.beat('problems.deal', { at: shot.problems.at + 8, dur: 16, stagger: 18, ease: 'settle', note: 'Cards deal in one at a time' },
  (b) => b.each(problemCards, { opacity: 0, y: 80, rotation: -4 }, { opacity: 1, y: 0, rotation: 0 }));

// ---------------------------------------------------------------- 6 · rebrand
s.beat('rebrand.old', { at: shot.rebrand.at + 6, dur: 12, ease: 'fade' }, (b) => b.fromTo(oldName, { opacity: 0 }, { opacity: 1 }));
s.beat('rebrand.strike', { after: 'rebrand.old', gap: 6, dur: 10, ease: 'snap', note: 'Struck through' }, (b) => draw(b, strike));
s.beat('rebrand.lift', { after: 'rebrand.strike', gap: 4, dur: 16, ease: 'move' }, (b) => b.fromTo([oldName, strike], { opacity: 1, y: 0 }, { opacity: 0.25, y: -50 }));
s.beat('rebrand.new', { with: 'rebrand.lift', offset: 4, dur: 16, ease: 'overshoot', note: 'Wordmark lands' }, (b) => b.fromTo(newName, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }));
s.beat('rebrand.prop', { after: 'rebrand.new', gap: 2, dur: 14, ease: 'fade' }, (b) => b.fromTo(proposition, { opacity: 0, y: 16 }, { opacity: 1, y: 0 }));

// ---------------------------------------------------------------- 7 · directions
s.beat('directions.in', { at: shot.directions.at + 10, dur: 18, stagger: 12, ease: 'settle', note: 'Three columns build in' },
  (b) => b.each(directions, { opacity: 0, y: 50 }, { opacity: 1, y: 0 }));

// ---------------------------------------------------------------- 8 · entry & onboarding
s.beat('entry.home', { at: shot.entry.at + 4, dur: 16, ease: 'settle', note: 'PayZapp home with the Zapp spotlight banner' },
  (b) => b.fromTo(A.g, { opacity: 0, y: 40 }, { opacity: 1, y: 0 }));
s.beat('entry.reach', { after: 'entry.home', gap: 4, dur: 18, note: 'Cursor heads for Explore More' }, (b) => {
  P.fade(b, 0, 1, { dur: 6, ease: 'fade' });
  P.move(b, ...a(96, 232));
});
s.beat('entry.tap', { after: 'entry.reach', gap: 2, dur: 9 }, (b) => P.click(b));
s.beat('entry.carousel', { with: 'entry.tap', offset: 4, dur: 14, ease: 'settle', note: 'Onboarding carousel slides up' },
  (b) => b.fromTo(carousel, { opacity: 0, y: 60 }, { opacity: 1, y: 0 }));
s.beat('entry.cursorAway', { with: 'entry.carousel', dur: 14, ease: 'move' }, (b) => P.move(b, ...a(330, 600)));
s.beat('entry.slide2', { after: 'entry.carousel', gap: 10, dur: 12, ease: 'snap', note: 'One benefit at a time' }, (b) => {
  b.fromTo(slider, { x: 0 }, { x: -360 });
  b.fromTo(dotOn, { x: 0 }, { x: 20 });
});
s.beat('entry.slide3', { after: 'entry.slide2', gap: 12, dur: 12, ease: 'snap' }, (b) => {
  b.fromTo(slider, { x: -360 }, { x: -720 });
  b.fromTo(dotOn, { x: 20 }, { x: 40 });
});
s.beat('entry.toCta', { after: 'entry.slide3', gap: 2, dur: 14 }, (b) => P.move(b, ...a(200, 706)));
s.beat('entry.ctaTap', { after: 'entry.toCta', gap: 1, dur: 9, note: 'Tap the CTA' }, (b) => P.click(b));

// ---------------------------------------------------------------- 9 · locked actions
s.beat('locked.pan', { at: shot.locked.at - 6, dur: 22, ease: 'move', note: 'Pan into Zapp Account; PayZapp steps away' }, (b) => {
  cam.to(b, 'pB');
  b.fromTo(A.g, { opacity: 1 }, { opacity: 0 }, { dur: 12, ease: 'fade' });
  P.move(b, ...z(200, 600));
});
s.beat('locked.locks', { after: 'locked.pan', gap: 2, dur: 10, stagger: 5, ease: 'overshoot', note: 'Locks drop onto Scan, Send, Transfer' },
  (b) => b.each(locks, { opacity: 0, scale: 0.2, y: -14 }, { opacity: 1, scale: 1, y: 0 }));
s.beat('locked.reach', { after: 'locked.locks', gap: 2, dur: 14 }, (b) => P.move(b, ...z(116, 418)));
s.beat('locked.tap', { after: 'locked.reach', gap: 1, dur: 9, note: 'Tap a locked action' }, (b) => P.click(b));
s.beat('locked.answer', { with: 'locked.tap', offset: 4, dur: 16, ease: 'overshoot', note: 'Upgrade banner answers' }, (b) => {
  b.fromTo(banner, { scale: 1 }, { scale: 1.06 }, { dur: 6, ease: 'snap' });
  b.fromTo(banner, { scale: 1.06 }, { scale: 1 }, { at: 6, dur: 10 });
});
s.beat('locked.unlock', { after: 'locked.answer', gap: 8, dur: 18, ease: 'move', note: 'Upgrade complete: locks pop off, banner folds away, body rises' }, (b) => {
  b.each(locks, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.2 }, { dur: 8, ease: 'snap' });
  b.fromTo(banner, { opacity: 1 }, { opacity: 0 }, { dur: 8, ease: 'fade' });
  b.fromTo(main, { y: 0 }, { y: -UP }, { at: 4 });
});

// ---------------------------------------------------------------- 10 · familiarity
s.beat('familiar.out', { at: shot.familiar.at - 4, dur: 22, ease: 'move', note: 'Pull out; PayZapp home slides back in beside it' }, (b) => {
  cam.to(b, 'both');
  b.set(carousel, { opacity: 0 });
  b.fromTo(A.g, { opacity: 0, x: -60 }, { opacity: 1, x: 0 }, { at: 4, dur: 16, ease: 'settle' });
  P.move(b, BX + 520, BY + 900, { ease: 'exit' });
  P.fade(b, 1, 0, { at: 6, dur: 10, ease: 'fade' });
});
s.beat('familiar.caps', { after: 'familiar.out', overlap: 0.3, dur: 10, stagger: 4, ease: 'fade' }, (b) => b.each([capA, capB], { opacity: 0 }, { opacity: 1 }));
s.beat('familiar.match', { after: 'familiar.out', gap: 6, dur: 12, stagger: 8, ease: 'settle', note: 'Matching payment rows light up and link' },
  (b) => { b.each([bandA, bandB], { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1 }); draw(b, link, { at: 12, dur: 16 }); });

// ---------------------------------------------------------------- 11 · balance
s.beat('balance.push', { at: shot.balance.at - 6, dur: 22, ease: 'move', note: 'Push in on the top of Zapp home' }, (b) => {
  cam.to(b, 'zTop');
  b.fromTo([bandA, bandB, link, capA, capB], { opacity: 1 }, { opacity: 0 }, { dur: 8, ease: 'fade' });
});
s.beat('balance.coin', { after: 'balance.push', gap: -4, dur: 14, ease: 'overshoot', note: 'Cashpoints counter pings' }, (b) => {
  draw(b, ringCoin, { dur: 14 });
  b.fromTo(coin, { scale: 1 }, { scale: 1.2 }, { dur: 5, ease: 'snap' });
  b.fromTo(coin, { scale: 1.2 }, { scale: 1 }, { at: 5, dur: 9 });
});
s.beat('balance.hero', { after: 'balance.coin', gap: 2, dur: 16, ease: 'overshoot', note: 'Balance takes the spotlight' }, (b) => {
  b.fromTo(ringCoin, { opacity: 1 }, { opacity: 0 }, { dur: 6, ease: 'fade' });
  draw(b, ringBal, { dur: 14 });
  b.fromTo(bal, { scale: 1 }, { scale: 1.12 }, { dur: 6, ease: 'snap' });
  b.fromTo(bal, { scale: 1.12 }, { scale: 1 }, { at: 6, dur: 10 });
});

// ---------------------------------------------------------------- 12 · add money
s.beat('add.mark', { at: shot.addmoney.at + 4, dur: 14, ease: 'overshoot', note: 'Add Money circled' }, (b) => {
  b.fromTo(ringBal, { opacity: 1 }, { opacity: 0 }, { dur: 6, ease: 'fade' });
  draw(b, ringAdd, { dur: 14 });
  P.fade(b, 0, 1, { dur: 6, ease: 'fade' });
  P.move(b, BX + 330, BY + 420 - UP, { dur: 1 });
});
s.beat('add.reach', { after: 'add.mark', gap: 0, dur: 14 }, (b) => P.move(b, BX + 214, BY + 326 - UP));
s.beat('add.tap', { after: 'add.reach', gap: 1, dur: 12, note: 'Tap — ripple' }, (b) => {
  P.click(b);
  b.fromTo(addBtn, { scale: 1 }, { scale: 0.92 }, { dur: 3, ease: 'fade' });
  b.fromTo(addBtn, { scale: 0.92 }, { scale: 1 }, { at: 3, dur: 8, ease: 'overshoot' });
  b.fromTo(tapRing, { opacity: 0.8, scale: 0.6 }, { opacity: 0, scale: 1.6 }, { at: 2, dur: 10, ease: 'fade' });
});
s.beat('add.note', { after: 'add.tap', gap: 0, dur: 14, ease: 'settle', note: 'Loads result written in the margin' }, (b) => {
  draw(b, noteAdd, { dur: 14 });
  P.move(b, BX + 280, BY + 520, { ease: 'exit' });
  P.fade(b, 1, 0, { at: 4, dur: 8, ease: 'fade' });
});

// ---------------------------------------------------------------- 13 · auto-load
s.beat('auto.mark', { at: shot.autoload.at + 4, dur: 14, ease: 'overshoot', note: 'Auto-Load circled under Add Money' }, (b) => {
  b.fromTo([ringAdd, noteAdd], { opacity: 1 }, { opacity: 0.25 }, { dur: 8, ease: 'fade' });
  draw(b, ringAuto, { dur: 14 });
});
s.beat('auto.note', { after: 'auto.mark', gap: 2, dur: 14, ease: 'settle', note: 'Adoption result in the margin' },
  (b) => draw(b, noteAuto, { dur: 14 }));

// ---------------------------------------------------------------- 14 · soft nudge
s.beat('nudge.tilt', { at: shot.nudge.at - 6, dur: 18, ease: 'move', note: 'Camera eases down' }, (b) => {
  cam.to(b, 'zNudge');
  b.fromTo([ringAdd, noteAdd, ringAuto, noteAuto], { opacity: (i) => (i < 2 ? 0.25 : 1) }, { opacity: 0 }, { dur: 8, ease: 'fade' });
});
s.beat('nudge.in', { after: 'nudge.tilt', gap: -6, dur: 16, ease: 'settle', note: 'Nudge slides in under the payment actions' }, (b) => {
  b.fromTo(lower, { y: 0 }, { y: 60 });
  b.fromTo(nudge, { opacity: 0, y: -10 }, { opacity: 1, y: 0 }, { at: 4 });
});
s.beat('nudge.note', { after: 'nudge.in', gap: 4, dur: 14, ease: 'settle', note: 'Spends result in the margin' }, (b) => {
  draw(b, ringNudge, { dur: 14 });
  draw(b, noteNudge, { at: 4, dur: 14 });
});

// ---------------------------------------------------------------- 15 · results
s.beat('cam.results', { at: shot.results.at - 8, dur: 16, ease: 'whip', note: 'Whip-pan to the results' }, (b) => cam.to(b, 'r8'));
s.beat('results.cards', { at: shot.results.at + 10, dur: 16, stagger: 8, ease: 'settle', note: 'Result cards rise in; numbers count up' },
  (b) => b.each(statCards, { opacity: 0, y: 50 }, { opacity: 1, y: 0 }));
s.beat('results.foot', { after: 'results.cards', gap: 4, dur: 12, ease: 'fade' }, (b) => b.fromTo(statFoot, { opacity: 0 }, { opacity: 1 }));

// count-ups: pure function of the frame
const outCubic = (p) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);
s.onFrame((f) => {
  const r = s.beats['results.cards'];
  const p = (i) => outCubic((f - (r.f0 + i * 8 + 4)) / 30);
  statNums[0].textContent = `${(1 + 1.1 * p(0)).toFixed(1)}×`;
  statNums[1].textContent = `${(1 + 0.5 * p(1)).toFixed(1)}×`;
  statNums[2].textContent = `${Math.round(20 * p(2))}%`;
});

// ---------------------------------------------------------------- 16 · end
s.beat('cam.end', { at: shot.end.at - 8, dur: 16, ease: 'whip' }, (b) => cam.to(b, 'r9'));
s.beat('end.mark', { at: shot.end.at + 6, dur: 16, ease: 'overshoot', note: 'Wordmark + title' }, (b) => {
  b.fromTo(endMark, { opacity: 0, scale: 0.8, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1 });
  b.fromTo(endLine, { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, { at: 8, dur: 12, ease: 'fade' });
});

s.ready();
