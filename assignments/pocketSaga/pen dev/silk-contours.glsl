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

  vec2 w = vec2(
    fbm(p * 1.7 + vec2(0.0, t * 0.35)),
    fbm(p * 1.7 + vec2(5.2, t * 0.28 + 1.3))
  );
  float field = fbm(p * 2.3 + w * 1.5 + vec2(t * 0.12, 0.0));

  float lines = abs(fract(field * 7.0) - 0.5);
  float band = smoothstep(0.11, 0.0, lines);
  float sheen = smoothstep(0.30, 0.75, field);

  vec3 deep = u_mint * vec3(0.38, 0.60, 0.54);
  vec3 tone = mix(deep, u_mint, sheen);

  vec3 col = u_bg;
  col += tone * band * 0.15 * u_intensity;
  col += u_mint * sheen * 0.035 * u_intensity;

  float vign = 1.0 - 1.05 * dot(uv - 0.5, uv - 0.5);
  col *= clamp(vign, 0.0, 1.0);
  col += grain(gl_FragCoord.xy, u_time) * (u_grain / 255.0) * 6.0;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
