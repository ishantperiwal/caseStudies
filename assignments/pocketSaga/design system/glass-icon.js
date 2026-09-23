// Liquid glass icon: a plain-JavaScript port of Originkit's "Liquid Glass Cluster" React component.
// A ray-marched 3D glass shape (X, torus, sphere or an extruded logo) refracts a backdrop plate with
// chromatic dispersion, frost and tint, plus Fresnel reflections of a painted studio environment.
// It spins, idles with a small float, tilts toward the pointer and can be dragged.
//
// Usage: const glass = PocketSagaGlassIcon.create(hostElement, { shape: 'Torus', backdrop: { type: 'Image', image: url } });
//        glass.update({ glass: { tint: '#BDE0CA' } });   glass.destroy();
(() => {
  const BEVEL = .025, CORE_REFRACT = 1, IOR = 1.5, THICKNESS = 2, IDLE_FLOAT = .05, TILT_RANGE = .5;
  const TILT_RATE = 5, DRAG_GAIN = .01, SPIN_YAW = .5, SPIN_PITCH = .2;
  const FOV = 45 * Math.PI / 180, CAM_DIST = 5, DEG = Math.PI / 180;
  const SDF_MAX = 512, SDF_PAD = 24, SDF_SPREAD = 32;

  const DEFAULTS = {
    background: '#000000',
    shape: 'Torus', // 'X' | 'Torus' | 'Sphere' | 'Logo' | 'Pyramid'
    logo: '', // image URL; alpha defines the extruded shape. Empty uses a rounded-square fallback.
    depth: 32,
    size: 60,
    speed: 100,
    direction: 'Clockwise', // or 'Counterclockwise'
    spinPitch: SPIN_PITCH, // 0 gives an upright turntable spin
    rotateAxis: 'free', // 'yaw' limits dragging to horizontal rotation and disables hover tilt
    inertia: 0, // > 0: a released drag keeps spinning; its extra speed decays at this rate per second
    backdrop: { type: 'Image', image: '', video: '', under: null, text: 'LIQUID\nGLASS', textColor: '#FFFFFF', textGradient: null, // e.g. ['#BDE0CA', '#B9B0D8'] shades the text left → right
      // paintText: optional (ctx, layout) => void to draw the text yourself (font, alignment and baseline are already set)
      font: { fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: 96, fontWeight: 700, fontStyle: 'normal', letterSpacing: 0, lineHeight: 1.1 } },
    glass: { tint: '#FFFFFF', chromatic: 25, frost: 50 },
    orient: { angleX: 100, angleY: 0, angleZ: 0, offsetX: 0, offsetY: 0 } // Originkit preset tilts 100° on X
  };

  function merge(base, extra) {
    const out = { ...base, ...(extra || {}) };
    ['backdrop', 'glass', 'orient'].forEach(key => { if (base[key]) out[key] = { ...base[key], ...((extra || {})[key] || {}) }; });
    out.backdrop.font = { ...base.backdrop.font, ...(((extra || {}).backdrop || {}).font || {}) };
    return out;
  }

  function parseColor(input, fallback) {
    if (!input) return fallback;
    const s = String(input).trim();
    if (s[0] === '#') {
      let h = s.slice(1);
      if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
      if (h.length >= 6) {
        const rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
        if (rgb.every(v => !isNaN(v))) return rgb;
      }
      return fallback;
    }
    const m = s.match(/rgba?\(([^)]+)\)/i);
    if (m) { const p = m[1].split(',').map(parseFloat); if (p.length >= 3) return [p[0] / 255, p[1] / 255, p[2] / 255]; }
    return fallback;
  }
  const numOf = (v, fallback) => { const n = typeof v === 'number' ? v : parseFloat(v); return Number.isFinite(n) ? n : fallback; };

  function rotYX(yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    return new Float32Array([cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx]);
  }
  function transpose3(m) { return new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]); }
  function mul3(a, b) {
    const o = new Float32Array(9);
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
    return o;
  }
  function rotYXZ(yaw, pitch, roll) {
    const base = rotYX(yaw, pitch);
    if (!roll) return base;
    const c = Math.cos(roll), s = Math.sin(roll);
    return mul3(base, new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]));
  }

  // Studio environment for reflections: dark room with three soft light boxes.
  function buildEnvCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, 1024, 512);
    const softbox = (x, y, w, h, intensity) => {
      const grd = ctx.createLinearGradient(x, y, x, y + h);
      grd.addColorStop(0, `rgba(255,255,255,${intensity})`);
      grd.addColorStop(1, `rgba(50,50,50,${intensity * .2})`);
      ctx.fillStyle = grd; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 80;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, 60); else ctx.rect(x, y, w, h);
      ctx.fill();
    };
    softbox(50, 100, 300, 312, 1); softbox(674, 100, 300, 312, 1); softbox(350, -50, 324, 150, .9);
    ctx.shadowBlur = 0;
    return canvas;
  }

  // Exact Euclidean distance transform (Felzenszwalb) used to bake a logo's alpha into a signed distance field.
  function edt1d(f, d, v, z, n) {
    let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  }
  function edt2d(mask, w, h) {
    const grid = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) grid[i] = mask[i] ? 0 : 1e20;
    const n = Math.max(w, h), f = new Float32Array(n), d = new Float32Array(n), v = new Int32Array(n), z = new Float32Array(n + 1);
    for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = grid[y * w + x]; edt1d(f, d, v, z, h); for (let y = 0; y < h; y++) grid[y * w + x] = d[y]; }
    for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = grid[y * w + x]; edt1d(f, d, v, z, w); for (let x = 0; x < w; x++) grid[y * w + x] = d[x]; }
    return grid;
  }
  function bakeSDF(alpha, w, h) {
    const inside = new Uint8Array(w * h), outside = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { const on = alpha[i * 4 + 3] > 127 ? 1 : 0; inside[i] = on; outside[i] = on ? 0 : 1; }
    const dOut = edt2d(inside, w, h), dIn = edt2d(outside, w, h);
    const signed = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) signed[i] = inside[i] ? Math.sqrt(dIn[i]) : -Math.sqrt(dOut[i]);
    const K = [.06136, .24477, .38774, .24477, .06136], tmp = new Float32Array(w * h), blurred = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let k = -2; k <= 2; k++) s += K[k + 2] * signed[y * w + Math.min(w - 1, Math.max(0, x + k))]; tmp[y * w + x] = s; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let k = -2; k <= 2; k++) s += K[k + 2] * tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x]; blurred[y * w + x] = s; }
    const out = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) { const b = Math.round(Math.max(0, Math.min(1, .5 + blurred[i] / (2 * SDF_SPREAD))) * 255); out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = b; out[i * 4 + 3] = 255; }
    return out;
  }
  function fallbackAlpha(w, h) {
    const px = new Uint8ClampedArray(w * h * 4), hx = w / 2 - SDF_PAD, hy = h / 2 - SDF_PAD, r = Math.min(hx, hy) * .45;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = Math.abs(x - w / 2) - (hx - r), dy = Math.abs(y - h / 2) - (hy - r);
      const d = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - r;
      px[(y * w + x) * 4 + 3] = d < 0 ? 255 : 0;
    }
    return px;
  }

  const FULLSCREEN_VS = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  const PLATE_FS = `precision highp float;
uniform sampler2D uPlate;uniform vec2 uPlateFit;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy/uRes-0.5)*uPlateFit+0.5;gl_FragColor=texture2D(uPlate,clamp(uv,0.0,1.0));}`;
  const GLASS_FS = `precision highp float;
uniform vec2 uRes;uniform float uAspect;uniform float uTanHalf;
uniform sampler2D uPlate;uniform vec2 uPlateFit;uniform float uHasPlate;uniform sampler2D uEnv;uniform sampler2D uSDF;
uniform mat3 uRot;uniform mat3 uRotT;uniform vec3 uCenter;uniform float uScale;uniform float uBoundR;
uniform float uShape;uniform float uHalfDepth;uniform float uBevel;uniform float uTorusTube;uniform vec2 uLogoHalf;uniform float uSdfUnits;
uniform float uDisp;uniform float uFrost;uniform vec3 uTint;
const float PI=3.14159265359;const float CORE_REFRACT=${CORE_REFRACT.toFixed(4)};const float IOR=${IOR.toFixed(4)};const float THICKNESS=${THICKNESS.toFixed(4)};
float sdCross(vec2 p,vec2 b){p=abs(p);p=(p.y>p.x)?p.yx:p.xy;vec2 q=p-b;float k=max(q.y,q.x);vec2 w=(k>0.0)?q:vec2(b.y-p.x,-k);return sign(k)*length(max(w,0.0));}
vec2 r45(vec2 p){const float c=0.7071067811865476;return vec2((p.x+p.y)*c,(p.y-p.x)*c);}
float sdLogo(vec2 p){vec2 uv=p/(2.0*uLogoHalf)+0.5;uv.y=1.0-uv.y;vec2 e=abs(p)-uLogoHalf;float dBox=length(max(e,0.0))+min(max(e.x,e.y),0.0);
  float dTex=(0.5-texture2D(uSDF,clamp(uv,0.0,1.0)).r)*2.0*uSdfUnits;return max(dTex,dBox);}
float extrudeRound(float d2,float pz,float hd,float r){vec2 q=vec2(d2+r,abs(pz)-hd+r);return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r;}
float sdPyramid(vec3 p,float h){float m2=h*h+0.25;p.xz=abs(p.xz);p.xz=(p.z>p.x)?p.zx:p.xz;p.xz-=0.5;
  vec3 q=vec3(p.z,h*p.y-0.5*p.x,h*p.x+0.5*p.y);float s=max(-q.x,0.0);float t=clamp((q.y-0.5*p.z)/(m2+0.25),0.0,1.0);
  float a=m2*(q.x+s)*(q.x+s)+q.y*q.y;float b=m2*(q.x+0.5*t)*(q.x+0.5*t)+(q.y-m2*t)*(q.y-m2*t);
  float d2=min(q.y,-q.x*m2-q.y*0.5)>0.0?0.0:min(a,b);return sqrt((d2+q.z*q.z)/m2)*sign(max(q.z,-p.y));}
float map(vec3 p){
  if(uShape>3.5){const float S=2.0;return sdPyramid(p/S+vec3(0.0,0.5,0.0),1.0)*S-uBevel;}
  if(uShape<0.5){return extrudeRound(sdCross(r45(p.xy),vec2(1.3,0.35)),p.z,uHalfDepth,uBevel);}
  else if(uShape<1.5){vec2 q=vec2(length(p.xy)-0.8,p.z);return length(q)-uTorusTube;}
  else if(uShape<2.5){return length(p)-1.2;}
  return extrudeRound(sdLogo(p.xy),p.z,uHalfDepth,uBevel);}
vec3 mapNormal(vec3 p){const float e=0.0015;vec2 k=vec2(1.0,-1.0);
  return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e));}
vec4 plate(vec2 s){if(uHasPlate<0.5)return vec4(0.0);vec2 uv=(s-0.5)*uPlateFit+0.5;return texture2D(uPlate,clamp(uv,0.0,1.0));}
float rand(vec2 co){return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 screenUv=gl_FragCoord.xy/uRes;vec2 ndc=screenUv*2.0-1.0;
  vec3 D=normalize(vec3(ndc.x*uTanHalf*uAspect,ndc.y*uTanHalf,-1.0));
  vec3 rd=normalize(uRotT*D);vec3 ro=(uRotT*-uCenter)/uScale;
  float bb=dot(ro,rd);float cc=dot(ro,ro)-uBoundR*uBoundR;float hh=bb*bb-cc;if(hh<0.0)discard;hh=sqrt(hh);
  float t=max(-bb-hh,0.0);float tMax=-bb+hh;bool hit=false;
  for(int i=0;i<80;i++){if(t>tMax)break;float d=map(ro+rd*t);if(d<0.0009){hit=true;break;}t+=d*0.9;}
  if(!hit)discard;
  vec3 pObj=ro+rd*t;vec3 nObj=mapNormal(pObj);
  vec3 vP=uCenter+uScale*(uRot*pObj);vec3 normal=normalize(uRot*nObj);vec3 viewDir=normalize(-vP);
  float fresnel=pow(1.0-max(dot(normal,viewDir),0.0),4.0);
  float coreFactor=pow(max(dot(normal,viewDir),0.0),2.0);
  vec2 lensOffset=(screenUv-0.5)*(CORE_REFRACT*0.15)*coreFactor;
  vec3 refractView=refract(-viewDir,normal,1.0/IOR);vec2 offset=refractView.xy*(THICKNESS*0.1)-lensOffset;
  vec3 reflectDir=reflect(-viewDir,normal);
  vec2 equirectUv=vec2(atan(reflectDir.z,reflectDir.x)/(2.0*PI)+0.5,asin(clamp(reflectDir.y,-1.0,1.0))/PI+0.5);
  vec3 reflection=texture2D(uEnv,equirectUv).rgb*2.5;
  vec3 transmission=vec3(0.0);float bgAlpha=0.0;
  vec2 uvR=screenUv+offset*(1.0+uDisp);vec2 uvG=screenUv+offset;vec2 uvB=screenUv+offset*(1.0-uDisp);
  if(uFrost>0.001){float rnd=rand(screenUv)*6.2831853;const int SAMPLES=24;const float GOLDEN_ANGLE=2.39996323;
    float radius=0.0;float radiusStep=1.0/float(SAMPLES);float blurMultiplier=uFrost*0.025;
    for(int i=0;i<SAMPLES;i++){float theta=float(i)*GOLDEN_ANGLE+rnd;radius+=radiusStep;vec2 bo=vec2(cos(theta),sin(theta))*radius*blurMultiplier;
      transmission.r+=plate(uvR+bo).r;vec4 g=plate(uvG+bo);transmission.g+=g.g;bgAlpha+=g.a;transmission.b+=plate(uvB+bo).b;}
    transmission/=float(SAMPLES);bgAlpha/=float(SAMPLES);
  }else{transmission.r=plate(uvR).r;vec4 g=plate(uvG);transmission.g=g.g;bgAlpha=g.a;transmission.b=plate(uvB).b;}
  transmission*=uTint;
  vec3 clearGlassTint=mix(uTint,reflection,0.5);transmission=mix(clearGlassTint,transmission,bgAlpha);
  vec3 finalColor=mix(transmission,reflection,fresnel*0.8);
  float baseAlpha=max(0.25,fresnel*0.85);float outAlpha=mix(baseAlpha,1.0,bgAlpha);
  gl_FragColor=vec4(finalColor,outAlpha);}`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('Glass icon shader:', gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
    return s;
  }
  function link(gl, vs, fs) {
    const v = compile(gl, gl.VERTEX_SHADER, vs), f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p); gl.deleteShader(v); gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn('Glass icon link:', gl.getProgramInfoLog(p)); return null; }
    return p;
  }

  function create(host, options) {
    let p = merge(DEFAULTS, options);
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    Object.assign(host.style, { overflow: 'hidden', background: p.background, touchAction: 'none' });
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    host.append(canvas);

    const opts = { antialias: false, alpha: true, premultipliedAlpha: true };
    const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
    if (!gl) return { update() {}, destroy() { canvas.remove(); } };
    const plateProg = link(gl, FULLSCREEN_VS, PLATE_FS), glassProg = link(gl, FULLSCREEN_VS, GLASS_FS);
    if (!plateProg || !glassProg) return { update() {}, destroy() { canvas.remove(); } };

    const loc = (prog, name) => gl.getUniformLocation(prog, name);
    const uPlatePass = { plate: loc(plateProg, 'uPlate'), fit: loc(plateProg, 'uPlateFit'), res: loc(plateProg, 'uRes') };
    const u = {};
    ['uRes', 'uAspect', 'uTanHalf', 'uPlate', 'uPlateFit', 'uHasPlate', 'uEnv', 'uSDF', 'uRot', 'uRotT', 'uCenter', 'uScale', 'uBoundR',
      'uShape', 'uHalfDepth', 'uBevel', 'uTorusTube', 'uLogoHalf', 'uSdfUnits', 'uDisp', 'uFrost', 'uTint'].forEach(name => { u[name] = loc(glassProg, name); });
    const aPlatePos = gl.getAttribLocation(plateProg, 'aPos'), aGlassPos = gl.getAttribLocation(glassProg, 'aPos');

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    function makeTex(wrap) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      return t;
    }
    const plateTex = makeTex(gl.CLAMP_TO_EDGE), sdfTex = makeTex(gl.CLAMP_TO_EDGE), envTex = makeTex(gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildEnvCanvas());

    let vw = 1, vh = 1, dprCur = 1, sdfH = 1, sdfReady = false, logoAspect = 1;
    let rebuildSDF = true, rebuildPlate = true;

    function uploadSDF(alpha, w, h, aspect) {
      const bytes = bakeSDF(alpha, w, h);
      sdfH = h; logoAspect = aspect;
      gl.bindTexture(gl.TEXTURE_2D, sdfTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      sdfReady = true;
    }
    const bakeFallback = () => uploadSDF(fallbackAlpha(320, 320), 320, 320, 1);
    let sdfToken = 0;
    function bakeLogo() {
      if (!p.logo) { bakeFallback(); return; }
      const token = ++sdfToken, img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (token !== sdfToken) return;
        const scale = Math.min((SDF_MAX - SDF_PAD * 2) / Math.max(img.width, 1), (SDF_MAX - SDF_PAD * 2) / Math.max(img.height, 1), 1);
        const iw = Math.max(1, Math.round(img.width * scale)), ih = Math.max(1, Math.round(img.height * scale));
        const w = iw + SDF_PAD * 2, h = ih + SDF_PAD * 2;
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const c2d = c.getContext('2d');
        c2d.drawImage(img, SDF_PAD, SDF_PAD, iw, ih);
        let data;
        try { data = c2d.getImageData(0, 0, w, h); } catch { bakeFallback(); return; }
        uploadSDF(data.data, w, h, w / h);
      };
      img.onerror = () => { if (token === sdfToken) bakeFallback(); };
      img.src = p.logo;
    }

    let plateReady = false, plateAspect = 1, video = null, plateToken = 0, fontsWaited = false;
    function clearVideo() { if (!video) return; video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    function uploadPlate(source) {
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      plateReady = true;
    }
    // backdrop.under: a live canvas (e.g. an animated shader background) composited beneath the text every
    // frame, so the glass refracts the moving background instead of empty transparency.
    let textPlate = null;
    const compose = document.createElement('canvas'), composeContext = compose.getContext('2d');
    function pumpUnder() {
      const under = p.backdrop.under;
      if (!under || !under.width || p.backdrop.type !== 'Text' || !textPlate) return;
      if (compose.width !== vw || compose.height !== vh) { compose.width = vw; compose.height = vh; }
      composeContext.clearRect(0, 0, vw, vh);
      // Crop the part of the (full-viewport) under canvas that sits behind this host, so refraction lines up.
      const rect = host.getBoundingClientRect(), scale = under.width / Math.max(innerWidth, 1);
      composeContext.drawImage(under, rect.left * scale, rect.top * scale, rect.width * scale, rect.height * scale, 0, 0, vw, vh);
      composeContext.drawImage(textPlate, 0, 0, vw, vh);
      plateAspect = vw / vh;
      uploadPlate(compose);
    }
    function bakePlateText() {
      const w = Math.max(2, vw), h = Math.max(2, vh), c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d'), f = p.backdrop.font;
      const fontPx = numOf(f.fontSize, 96) * dprCur, lineH = numOf(f.lineHeight, 1.1) * fontPx;
      ctx.fillStyle = p.background; ctx.fillRect(0, 0, w, h);
      ctx.font = `${f.fontStyle || 'normal'} ${f.fontWeight || 700} ${fontPx}px ${f.fontFamily || 'Inter, system-ui, sans-serif'}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = p.backdrop.textColor || '#FFFFFF';
      const stops = p.backdrop.textGradient;
      if (stops && stops.length) {
        const gradient = ctx.createLinearGradient(w * .15, 0, w * .85, 0);
        stops.forEach((color, i) => gradient.addColorStop(stops.length === 1 ? 0 : i / (stops.length - 1), color));
        ctx.fillStyle = gradient;
      }
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${numOf(f.letterSpacing, 0) * dprCur}px`;
      const lines = String(p.backdrop.text || '').split('\n'), top = h / 2 - (lines.length - 1) * lineH / 2;
      if (typeof p.backdrop.paintText === 'function') p.backdrop.paintText(ctx, { lines, x: w / 2, top, lineH, fontPx, dpr: dprCur, width: w, height: h });
      else lines.forEach((line, i) => ctx.fillText(line, w / 2, top + i * lineH));
      plateAspect = w / h;
      textPlate = c;
      if (!p.backdrop.under) uploadPlate(c);
      if (!fontsWaited && document.fonts) { fontsWaited = true; document.fonts.ready.then(() => { if (p.backdrop.type === 'Text') rebuildPlate = true; }); }
    }
    function loadPlate() {
      clearVideo(); plateReady = false;
      const token = ++plateToken, bd = p.backdrop;
      if (bd.type === 'Text') { bakePlateText(); return; }
      if (bd.type === 'Image' && bd.image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { if (token !== plateToken) return; plateAspect = img.width / Math.max(img.height, 1); uploadPlate(img); };
        img.src = bd.image;
        return;
      }
      if (bd.type === 'Video' && bd.video) {
        const v = document.createElement('video');
        Object.assign(v, { crossOrigin: 'anonymous', playsInline: true, loop: true, muted: true, src: bd.video });
        v.play().catch(() => {});
        video = v;
      }
    }
    function pumpVideo() {
      if (!video || video.readyState < 2 || !video.videoWidth) return;
      plateAspect = video.videoWidth / Math.max(video.videoHeight, 1);
      uploadPlate(video);
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      dprCur = dpr;
      const w = Math.max(1, Math.round((canvas.clientWidth || host.clientWidth || 1) * dpr));
      const h = Math.max(1, Math.round((canvas.clientHeight || host.clientHeight || 1) * dpr));
      if (w === vw && h === vh) return;
      vw = w; vh = h; canvas.width = w; canvas.height = h;
      if (p.backdrop.type === 'Text') rebuildPlate = true;
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let baseYaw = 0, basePitch = 0, tiltX = 0, tiltY = 0, tiltTargetX = 0, tiltTargetY = 0, dragging = false, lastX = 0, lastY = 0;
    let flingVel = 0, dragVel = 0, lastMoveTime = 0;
    function onPointerMove(e) {
      if (dragging) {
        const step = (e.clientX - lastX) * DRAG_GAIN, now = performance.now(), dt = Math.max((now - lastMoveTime) / 1000, 1 / 240);
        baseYaw += step;
        dragVel = dragVel * .6 + step / dt * .4;
        lastMoveTime = now;
        if (p.rotateAxis !== 'yaw') basePitch = Math.max(-1.4, Math.min(1.4, basePitch + (e.clientY - lastY) * DRAG_GAIN));
        lastX = e.clientX; lastY = e.clientY;
        return;
      }
      if (p.rotateAxis === 'yaw') return;
      const r = canvas.getBoundingClientRect();
      tiltTargetX = ((e.clientX - r.left) / Math.max(r.width, 1) * 2 - 1) * TILT_RANGE;
      tiltTargetY = (-(e.clientY - r.top) / Math.max(r.height, 1) * 2 + 1) * TILT_RANGE;
    }
    const onPointerDown = e => { dragging = true; lastX = e.clientX; lastY = e.clientY; flingVel = 0; dragVel = 0; lastMoveTime = performance.now(); canvas.style.cursor = 'grabbing'; };
    const onPointerUp = () => {
      if (dragging && p.inertia > 0 && performance.now() - lastMoveTime < 90) flingVel = Math.max(-18, Math.min(18, dragVel));
      dragging = false; canvas.style.cursor = p.rotateAxis === 'yaw' ? 'grab' : '';
    };
    const onLeave = () => { if (!dragging) { tiltTargetX = 0; tiltTargetY = 0; } };
    if (p.rotateAxis === 'yaw') canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerleave', onLeave);
    addEventListener('pointermove', onPointerMove);
    addEventListener('pointerup', onPointerUp);
    addEventListener('pointercancel', onPointerUp);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let raf = 0, prev = performance.now(), elapsed = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, .05);
      prev = now; elapsed += dt;
      if (rebuildSDF) { rebuildSDF = false; bakeLogo(); }
      if (rebuildPlate) { rebuildPlate = false; loadPlate(); }
      if (video) pumpVideo();
      pumpUnder();
      if (p.shape === 'Logo' && !sdfReady) return;

      const k = 1 - Math.exp(-TILT_RATE * dt);
      tiltX += (tiltTargetX - tiltX) * k; tiltY += (tiltTargetY - tiltY) * k;
      const spin = p.speed / 50 * (p.direction === 'Counterclockwise' ? -1 : 1);
      if (!dragging) { baseYaw += (spin * SPIN_YAW + flingVel) * dt; basePitch += spin * p.spinPitch * dt; }
      flingVel *= Math.exp(-(p.inertia || 0) * dt);

      const o = p.orient;
      const yaw = baseYaw + tiltX + o.angleY * DEG;
      const pitch = Math.max(-1.45, Math.min(1.45, basePitch - tiltY)) + o.angleX * DEG;
      const rot = rotYXZ(yaw, pitch, o.angleZ * DEG), rotT = transpose3(rot);

      const halfFrame = CAM_DIST * Math.tan(FOV / 2), targetHalf = Math.max(.02, p.size / 100) * halfFrame;
      const nativeDepth = Math.max(0, p.depth / 100), torusTube = Math.max(.02, nativeDepth * .5);
      let refHalf, boundR, shapeId, halfDepth = nativeDepth * .5, bevel = BEVEL, logoHalfX = 1, logoHalfY = 1;
      if (p.shape === 'X') { shapeId = 0; refHalf = 1.3; boundR = Math.hypot(1.3, .35) + halfDepth + bevel; }
      else if (p.shape === 'Torus') { shapeId = 1; refHalf = .8 + torusTube; boundR = .8 + torusTube; }
      else if (p.shape === 'Sphere') { shapeId = 2; refHalf = 1.2; boundR = 1.2; }
      else if (p.shape === 'Pyramid') { shapeId = 4; refHalf = 1.0; boundR = 1.8; bevel = .02; }
      else { shapeId = 3; logoHalfX = logoAspect; refHalf = 1; halfDepth *= refHalf / 1.3; bevel *= refHalf / 1.3; boundR = Math.hypot(logoHalfX, logoHalfY, halfDepth) + bevel; }

      const scale = targetHalf / refHalf, floatY = Math.sin(elapsed * 2) * IDLE_FLOAT;
      const screenAspect = vw / vh;
      const fitX = screenAspect > plateAspect ? 1 : screenAspect / plateAspect;
      const fitY = screenAspect > plateAspect ? plateAspect / screenAspect : 1;
      const hasPlate = plateReady && p.backdrop.type !== 'None' ? 1 : 0;

      gl.viewport(0, 0, vw, vh);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
      if (hasPlate) {
        gl.useProgram(plateProg);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, plateTex);
        gl.uniform1i(uPlatePass.plate, 0); gl.uniform2f(uPlatePass.fit, fitX, fitY); gl.uniform2f(uPlatePass.res, vw, vh);
        gl.enableVertexAttribArray(aPlatePos); gl.vertexAttribPointer(aPlatePos, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      gl.useProgram(glassProg);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, plateTex); gl.uniform1i(u.uPlate, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, envTex); gl.uniform1i(u.uEnv, 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, sdfTex); gl.uniform1i(u.uSDF, 2);
      gl.uniform2f(u.uRes, vw, vh); gl.uniform1f(u.uAspect, screenAspect); gl.uniform1f(u.uTanHalf, Math.tan(FOV / 2));
      gl.uniform2f(u.uPlateFit, fitX, fitY); gl.uniform1f(u.uHasPlate, hasPlate);
      gl.uniformMatrix3fv(u.uRot, false, rot); gl.uniformMatrix3fv(u.uRotT, false, rotT);
      gl.uniform3f(u.uCenter, o.offsetX / 100 * halfFrame * screenAspect, floatY + o.offsetY / 100 * halfFrame, -CAM_DIST);
      gl.uniform1f(u.uScale, scale); gl.uniform1f(u.uBoundR, boundR);
      gl.uniform1f(u.uShape, shapeId); gl.uniform1f(u.uHalfDepth, halfDepth); gl.uniform1f(u.uBevel, bevel); gl.uniform1f(u.uTorusTube, torusTube);
      gl.uniform2f(u.uLogoHalf, logoHalfX, logoHalfY);
      gl.uniform1f(u.uSdfUnits, SDF_SPREAD * (2 * logoHalfY) / Math.max(sdfH, 1));
      gl.uniform1f(u.uDisp, p.glass.chromatic / 1000); gl.uniform1f(u.uFrost, p.glass.frost / 100);
      gl.uniform3fv(u.uTint, parseColor(p.glass.tint, [1, 1, 1]));
      gl.enableVertexAttribArray(aGlassPos); gl.vertexAttribPointer(aGlassPos, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    raf = requestAnimationFrame(frame);

    return {
      update(next) {
        const before = p;
        p = merge(p, next);
        host.style.background = p.background;
        if (p.logo !== before.logo) rebuildSDF = true;
        const plateKey = value => JSON.stringify({ ...value, under: undefined, paintText: undefined });
        if (plateKey(p.backdrop) !== plateKey(before.backdrop) || p.background !== before.background) rebuildPlate = true;
      },
      destroy() {
        cancelAnimationFrame(raf); sdfToken++; plateToken++; clearVideo(); resizeObserver.disconnect();
        canvas.removeEventListener('pointerdown', onPointerDown); canvas.removeEventListener('pointerleave', onLeave);
        removeEventListener('pointermove', onPointerMove); removeEventListener('pointerup', onPointerUp); removeEventListener('pointercancel', onPointerUp);
        canvas.remove();
      }
    };
  }

  window.PocketSagaGlassIcon = { create, defaults: DEFAULTS };
})();
