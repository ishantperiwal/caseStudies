#version 100
precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @backdrop */
uniform sampler2D u_backdrop;

/** @sdf */
uniform sampler2D u_sdf;

/**
 * @label Refraction
 * @default 18
 * @range 0, 40
 */
uniform float u_refraction;

/**
 * @label Frost
 * @default 6
 * @range 0, 16
 */
uniform float u_frost;

/**
 * @label Tint
 * @color
 * @default #dff7ff
 */
uniform vec3 u_tint;

/**
 * @label Tint Strength
 * @default 0.16
 * @range 0, 0.85
 */
uniform float u_tintStrength;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 sdf = texture2D(u_sdf, uv);
  float inside = smoothstep(-1.0, 1.5, sdf.r);
  vec2 gradient = sdf.gb;
  vec2 normal = gradient / max(length(gradient), 0.0001);
  float edge = 1.0 - smoothstep(0.0, 22.0, sdf.r);
  vec2 px = 1.0 / u_resolution;
  vec2 bend = normal * edge * u_refraction * px;
  vec2 p = clamp(uv + bend, px * 0.5, vec2(1.0) - px * 0.5);
  vec3 c = texture2D(u_backdrop, p).rgb * 0.28;
  c += texture2D(u_backdrop, p + vec2(u_frost, 0.0) * px).rgb * 0.12;
  c += texture2D(u_backdrop, p - vec2(u_frost, 0.0) * px).rgb * 0.12;
  c += texture2D(u_backdrop, p + vec2(0.0, u_frost) * px).rgb * 0.12;
  c += texture2D(u_backdrop, p - vec2(0.0, u_frost) * px).rgb * 0.12;
  c += texture2D(u_backdrop, p + vec2(u_frost, u_frost) * px * 0.7).rgb * 0.12;
  c += texture2D(u_backdrop, p - vec2(u_frost, u_frost) * px * 0.7).rgb * 0.12;
  c = mix(c, u_tint, u_tintStrength);
  float highlight = pow(max(0.0, dot(normal, normalize(vec2(-0.7, 0.7)))), 8.0) * edge;
  c += highlight * 0.22;
  gl_FragColor = vec4(c, 0.86 * inside);
}
