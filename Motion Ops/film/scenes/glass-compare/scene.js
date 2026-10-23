// glass-compare · 1920x1080 · 25 fps
// Two glass slabs over the same moving backdrop (the film's aqua grid and its names), so they can be compared in motion:
//   left  — the DOM way motion-ops-final does it now: the backdrop bent by an SVG displacement filter, clipped to the
//           slab, under a CSS backdrop-filter frost and a rim;
//   right — a WebGL liquid-glass shader (liquid-glass.js): a slab with a curved rim that refracts the backdrop through
//           it (Snell's law, per colour channel), a little frost, a fresnel rim light and a soft shadow.
// The backdrop is drawn on a canvas each frame, so both slabs see exactly the same pixels; everything is a pure function
// of the frame (the shader draws inside onFrame — no loop of its own).
import { studio } from '@studio/studio.js';
import { bezier } from '@studio/ease.js';
import { GLASS_FRAG, GLASS_VERT } from './liquid-glass.js';

const s = await studio({ id: 'glass-compare', width: 1920, height: 1080, fps: 25 });
const W = 1920, H = 1080, $ = (id) => document.getElementById(id);
const st = { t: 0 };
const C = { ground: '#BCD9D2', grid: '#CBE3DD', name: '#A3C9C0' };
const SIZE = 520, RADIUS = 72, CENTERS = [{ x: 540, y: 500 }, { x: 1380, y: 500 }];
const SMOOTH = bezier(0.45, 0, 0.55, 1);

// ---- the backdrop: grid + rows of names scrolling in alternate directions (as in the film's opening)
const ROWS = [
  'Ease In · Spring · Gentle · Standard · Snappy · ease-out · Sine.inOut · ',
  'Linear · Bouncy · Quick · Emphasized · cubic-bezier(.4, 0, .2, 1) · ',
  'Custom · FastOutSlowIn · Ease Out · Anticipate · moving → slow · ',
  'a bit snappier? · feels sluggish · can it settle softer? · too bouncy · ',
  'Power2.out · easeInOutCubic · Overshoot · Decelerate · Elastic · ',
];
const bg = $('bg'), g = bg.getContext('2d');
function drawBackdrop(f) {
  g.fillStyle = C.ground; g.fillRect(0, 0, W, H);
  g.fillStyle = C.grid; for (let x = -3.5; x < W; x += 120) g.fillRect(x, 0, 7, H); for (let y = -3.5; y < H; y += 120) g.fillRect(0, y, W, 7);
  g.fillStyle = C.name; g.font = '900 150px InterLocal'; g.textBaseline = 'alphabetic';
  ROWS.forEach((row, i) => {
    const w = g.measureText(row).width, dir = i % 2 ? 1 : -1, x = ((dir * f * 4.2 + i * 377) % w + w) % w - w;
    for (let k = 0; k < 4; k++) g.fillText(row, x + k * w, 200 + i * 205);
  });
}

// ---- the slabs' motion: both float together (a slow bob and sway), so the names slide under them
const slab = (f, i) => {
  const c = CENTERS[i], ph = f / 25;
  return { x: c.x + 22 * Math.sin(ph * 1.1 + 0.6), y: c.y + 30 * Math.sin(ph * 1.6), w: SIZE, h: SIZE, r: RADIUS };
};

// ---- left: the DOM glass (as motion-ops-final builds it)
const MAP = (() => {   // the film's displacement map: R/G push toward the centre, strongest at the rim
  const N = 512, R = 0.085, cv = document.createElement('canvas'); cv.width = cv.height = N; const cx = cv.getContext('2d'), im = cx.createImageData(N, N), rr = RADIUS / SIZE;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = (x + 0.5) / N, v = (y + 0.5) / N, qx = Math.max(Math.abs(u - 0.5) - (0.5 - rr), 0), qy = Math.max(Math.abs(v - 0.5) - (0.5 - rr), 0);
    const inner = Math.min(Math.max(Math.abs(u - 0.5) - (0.5 - rr), Math.abs(v - 0.5) - (0.5 - rr)), 0), d = rr - (Math.hypot(qx, qy) + inner);
    const k = d < R ? (1 - d / R) ** 1.6 : 0, dx = -(u - 0.5), dy = -(v - 0.5), l = Math.hypot(dx, dy) || 1, o = (y * N + x) * 4;
    im.data[o] = 128 + 127 * k * (dx / l); im.data[o + 1] = 128 + 127 * k * (dy / l); im.data[o + 2] = 128; im.data[o + 3] = 255; }
  cx.putImageData(im, 0, 0); return cv.toDataURL();
})();
const domSlab = $('domSlab'), domBack = $('domBack'), domShadow = $('domShadow'), db = domBack.getContext('2d');
domBack.width = SIZE; domBack.height = SIZE;
const map = $('domMap'); map.setAttribute('href', MAP); map.setAttribute('width', SIZE); map.setAttribute('height', SIZE);
$('domDisp').setAttribute('scale', (95 * SIZE / 680).toFixed(1)); $('domSoft').setAttribute('stdDeviation', (3 * SIZE / 680).toFixed(2));
function drawDom(f) {
  const r = slab(f, 0), x = r.x - r.w / 2, y = r.y - r.h / 2;
  for (const el of [domSlab, domShadow]) Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${r.w}px`, height: `${r.h}px`, borderRadius: `${r.r}px` });
  db.clearRect(0, 0, r.w, r.h); db.drawImage(bg, x, y, r.w, r.h, 0, 0, r.w, r.h);   // what's behind the slab, to be bent
}

// ---- right: the WebGL shader
const gl = $('gl').getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: true, antialias: false });
const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, GLASS_VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, GLASS_FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(prog, 'pos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
[[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
const U = (n) => gl.getUniformLocation(prog, n);
const GLASS = { bevel: SIZE * 0.22, thick: SIZE * 0.16, ior: 1.5, disp: 0.035, frost: 7, tint: 0.12, light: -2.35, rim: 0.55, shadow: 0.09 };
function drawGl(f) {
  const r = slab(f, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bg);   // this frame's backdrop
  gl.uniform2f(U('uRes'), W, H); gl.uniform2f(U('uCenter'), r.x, r.y); gl.uniform2f(U('uHalf'), r.w / 2, r.h / 2); gl.uniform1f(U('uRadius'), r.r);
  gl.uniform1f(U('uBevel'), GLASS.bevel); gl.uniform1f(U('uThick'), GLASS.thick); gl.uniform1f(U('uIor'), GLASS.ior); gl.uniform1f(U('uDisp'), GLASS.disp);
  gl.uniform1f(U('uFrost'), GLASS.frost); gl.uniform1f(U('uTint'), GLASS.tint); gl.uniform1f(U('uLight'), GLASS.light); gl.uniform1f(U('uRim'), GLASS.rim); gl.uniform1f(U('uShadow'), GLASS.shadow);
  gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// labels under each slab
CENTERS.forEach((c, i) => Object.assign($(i ? 'lblGl' : 'lblDom').style, { left: `${c.x - 380}px`, top: `${c.y + SIZE / 2 + 70}px` }));

s.beat('slabs.float', { at: 0, dur: 250, ease: 'linear', note: 'Both slabs float over the scrolling names; compare the DOM glass (left) with the WebGL shader (right)' },
  (b) => b.fromTo(st, { t: 0 }, { t: 1 }));
s.onFrame((f) => { drawBackdrop(f); drawDom(f); drawGl(f); });

await Promise.all(['500', '700', '900'].map((w) => document.fonts.load(`${w} 150px InterLocal`)));
s.ready({ tail: 0 });
