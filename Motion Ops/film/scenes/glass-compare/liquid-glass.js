// Apple-style liquid glass, as a WebGL2 fragment shader over a backdrop image (what's behind the glass). It draws on a
// transparent canvas over the page: the glass itself, and outside it only its soft shadow.
// The glass is a rounded slab: flat in the middle, a curved bevel at the rim. Light is refracted through that bevel with
// Snell's law (so the rim pulls the backdrop inward and magnifies it), split per colour channel (dispersion), softened
// (frost), tinted, lit along the rim (fresnel + a directional highlight) and it casts a soft shadow.
export const GLASS_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uRes;
uniform vec2 uCenter, uHalf; uniform float uRadius, uBevel, uThick, uIor, uDisp, uFrost, uTint, uLight, uRim, uShadow;
out vec4 o;
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
vec3 tex(vec2 px) { return texture(uTex, clamp(px / uRes, vec2(0.), vec2(1.))).rgb; }
// frosted lookup: a golden-angle disk of taps (blur radius uFrost px)
vec3 frosted(vec2 px) {
  if (uFrost < 0.5) return tex(px);
  vec3 acc = vec3(0.); float wsum = 0.;
  for (int i = 0; i < 48; i++) { float fi = float(i) + .5, r = sqrt(fi / 48.) * uFrost, a = fi * 2.39996323;   // 48 taps: smooth at a strong frost
    float w = 1. - .5 * (r / uFrost); acc += tex(px + r * vec2(cos(a), sin(a))) * w; wsum += w; }
  return acc / wsum;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);          // stage px, y down
  vec2 lp = p - uCenter;
  float d = sdBox(lp, uHalf, uRadius);                              // < 0 inside the glass
  // outward normal of the shape (from the SDF's gradient)
  vec2 e = vec2(.75, 0.);
  // the normal's direction comes from the same box with corners at least as round as the bevel is wide: its contours
  // turn the corners smoothly, where the exact box's would meet along the diagonal and crease the surface
  float rn = max(uRadius, uBevel * 1.1);
  vec2 n2 = normalize(vec2(sdBox(lp + e.xy, uHalf, rn) - sdBox(lp - e.xy, uHalf, rn), sdBox(lp + e.yx, uHalf, rn) - sdBox(lp - e.yx, uHalf, rn)) + 1e-6);
  vec3 back = tex(p);
  // soft shadow under the slab (outside it)
  float sd = sdBox(lp - vec2(0., 10.), uHalf, uRadius);
  float shadow = uShadow * exp(-max(sd, 0.) * max(sd, 0.) / (2. * 28. * 28.)) * step(0., d);   // a tight, soft contact shadow
  if (d > 1.) { o = vec4(0., 0., 0., shadow); return; }   // outside: just the shadow, over the page
  // the bevel: a quarter circle across uBevel px in from the edge; its slope tilts the surface normal
  float s = max(-d, 0.), t = clamp(s / uBevel, 0., 1.), u = 1. - t;
  float slope = (uThick / uBevel) * u / sqrt(max(1. - u * u, 1e-3));   // dh/ds of h = thick * sqrt(1 - u^2)
  vec3 N = normalize(vec3(n2 * slope, 1.));                         // the surface normal, facing the viewer
  // refraction through the slab, per colour channel (dispersion), landing uThick below the surface
  vec3 col;
  for (int c = 0; c < 3; c++) {
    float ior = uIor + (float(c) - 1.) * uDisp;
    vec3 r = refract(vec3(0., 0., -1.), N, 1. / ior);
    vec2 off = r.xy / max(-r.z, .2) * uThick * 1.6;
    col[c] = frosted(p + off)[c];
  }
  col = mix(col, vec3(1.), uTint) * (1. + uTint * .25);              // milky white tint, a touch brighter
  // light: fresnel brightening toward the rim, strongest where the rim faces the light (and its opposite catch)
  vec2 L = vec2(cos(uLight), sin(uLight));
  float fres = pow(1. - N.z, 2.2);
  float facing = dot(n2, L);
  float rim = fres * (.35 + .65 * pow(max(facing, 0.), 1.5) + .45 * pow(max(-facing, 0.), 2.));
  float edge = smoothstep(2.2, 0., s) * (.55 + .45 * abs(facing));   // a crisp 1-2 px specular line right at the edge
  col += uRim * (rim * .9 + edge * .8);
  col = min(col, vec3(1.));
  float a = 1. - smoothstep(-.75, .75, d);                          // anti-aliased edge
  o = vec4(col * a, a + shadow * (1. - a));                       // premultiplied
}`;
export const GLASS_VERT = `#version 300 es
in vec2 pos; void main() { gl_Position = vec4(pos, 0., 1.); }`;
