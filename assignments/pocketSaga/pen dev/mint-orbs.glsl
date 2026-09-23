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

  float m = 0.0;
  float lit = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.52 + 0.13 * fi) + fi * 2.1) * 0.58,
      cos(t * (0.43 + 0.11 * fi) + fi * 1.7) * 0.33
    );
    float r = 0.11 + 0.032 * fi;
    vec2 dv = p - c;
    float d2 = dot(dv, dv);
    float contrib = r * r / (d2 + 0.0045);
    m += contrib;
    lit += contrib * (0.5 + 0.5 * dv.y / (length(dv) + 1e-4));
  }

  float iso = m - 1.0;
  float ring = smoothstep(0.42, 0.0, abs(iso));
  float fill = smoothstep(0.0, 1.4, iso);
  float halo = smoothstep(-0.9, 0.5, iso);
  float shade = clamp(lit / max(m, 1e-4), 0.0, 1.0);

  vec3 deep = u_mint * vec3(0.38, 0.60, 0.54);
  vec3 tone = mix(deep, u_mint, shade);

  vec3 col = u_bg;
  col += tone * ring * 0.23 * u_intensity;
  col += u_mint * fill * 0.045 * u_intensity;
  col += u_mint * halo * 0.018 * u_intensity;

  float vign = 1.0 - 1.05 * dot(uv - 0.5, uv - 0.5);
  col *= clamp(vign, 0.0, 1.0);
  col += grain(gl_FragCoord.xy, u_time) * (u_grain / 255.0) * 6.0;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
