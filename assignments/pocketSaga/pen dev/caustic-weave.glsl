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

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  vec2 p = vec2((uv.x - 0.5) * ar, uv.y - 0.5);
  float t = u_time * u_speed;

  float f = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float a = fi * 1.13 + t * 0.09;
    vec2 d = vec2(cos(a), sin(a));
    f += sin(dot(p, d) * (5.5 + fi * 2.1) + t * (0.9 + 0.35 * fi));
  }
  f /= 5.0;

  float g = sin(f * 3.2);
  float lines = pow(max(0.0, 1.0 - abs(g)), 9.0);
  float bloom = pow(max(0.0, 1.0 - abs(g)), 2.0);

  vec3 deep = u_mint * vec3(0.40, 0.62, 0.55);
  vec3 tone = mix(deep, u_mint, clamp(0.5 + 0.5 * f * 2.0, 0.0, 1.0));

  vec3 col = u_bg;
  col += tone * lines * 0.20 * u_intensity;
  col += u_mint * bloom * 0.028 * u_intensity;

  float vign = 1.0 - 1.05 * dot(uv - 0.5, uv - 0.5);
  col *= clamp(vign, 0.0, 1.0);
  col += grain(gl_FragCoord.xy, u_time) * (u_grain / 255.0) * 6.0;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
