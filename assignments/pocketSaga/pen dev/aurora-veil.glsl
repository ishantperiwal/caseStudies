/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Speed
 * @range 0.0, 1.0
 * @default 0.12
 */
uniform float u_speed;

/**
 * @label Intensity
 * @range 0.0, 3.0
 * @default 1.0
 */
uniform float u_intensity;

/**
 * @label Grain
 * @range 0.0, 1.0
 * @default 0.35
 */
uniform float u_grain;

/**
 * @label Background
 * @color
 * @default #05080A
 */
uniform vec3 u_bg;

/**
 * @label Mint
 * @color
 * @default #BDE0CA
 */
uniform vec3 u_mint;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float grain(vec2 fc, float tt) {
  return hash21(fc + fract(tt) * 17.0) - 0.5;
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  vec2 p = vec2((uv.x - 0.5) * ar, uv.y - 0.5);
  float t = u_time * u_speed;

  float curtain = 0.0;
  float depth = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 sp = vec2(p.x * 3.8 + fi * 2.7, p.y * 0.55 - t * (0.7 + 0.22 * fi) + fi * 6.1);
    float n = fbm(sp + vec2(t * 0.25, 0.0));
    float streak = smoothstep(0.34, 0.66, n);
    curtain += streak * (0.62 - 0.16 * fi);
    depth += streak * fi;
  }

  float fade = smoothstep(-0.52, 0.18, p.y) * smoothstep(0.60, -0.05, p.y);
  curtain *= fade;

  vec3 deep = u_mint * vec3(0.40, 0.62, 0.55);
  vec3 tone = mix(u_mint, deep, clamp(depth * 0.35, 0.0, 1.0));

  vec3 col = u_bg;
  col += tone * curtain * 0.26 * u_intensity;
  col += u_mint * curtain * curtain * 0.07 * u_intensity;

  float vign = 1.0 - 1.05 * dot(uv - 0.5, uv - 0.5);
  col *= clamp(vign, 0.0, 1.0);
  col += grain(gl_FragCoord.xy, u_time) * (u_grain / 255.0) * 6.0;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
