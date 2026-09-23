/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Speed
 * @range 0.0, 0.6
 * @default 0.09
 */
uniform float u_speed;

/**
 * @label Ribbon width
 * @range 0.04, 0.9
 * @default 0.30
 */
uniform float u_softness;

/**
 * @label Intensity
 * @range 0.0, 2.0
 * @default 1.0
 */
uniform float u_intensity;

/**
 * @label Sweep angle
 * @range -0.8, 0.8
 * @default 0.0
 */
uniform float u_angle;

/**
 * @label Motion
 * @range 0.0, 1.0
 * @default 0.16
 */
uniform float u_motion;

/**
 * @label Distortion
 * @range 0.0, 1.0
 * @default 0.0
 */
uniform float u_warp;

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

vec2 g_p0;
vec2 g_p1;
vec2 g_p2;
vec2 g_p3;

vec2 bezier(float t) {
  float m = 1.0 - t;
  return m * m * m * g_p0
       + 3.0 * m * m * t * g_p1
       + 3.0 * m * t * t * g_p2
       + t * t * t * g_p3;
}

float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ny = 0.5 * u_resolution.y / u_resolution.x;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.x;

  float ca = cos(u_angle);
  float sa = sin(u_angle);
  p = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);

  float t = u_time * u_speed;

  float drift = sin(t * 0.43) * 0.05 * ny;
  float m = u_motion;
  g_p0 = vec2(-0.80, -1.30 * ny + drift) + vec2(sin(t * 0.61 + 2.1), 0.0) * m * 1.2;
  g_p1 = vec2( 0.62, -0.42 * ny + drift) + vec2(sin(t * 0.91), cos(t * 0.67)) * m
       + vec2(0.0, sin(t * 1.43) * ny * 0.10) * m * 3.0;
  g_p2 = vec2(-0.66,  0.38 * ny + drift) + vec2(cos(t * 0.79 + 1.3), sin(t * 1.07 + 0.5)) * m
       + vec2(0.0, cos(t * 1.19 + 0.8) * ny * 0.10) * m * 3.0;
  g_p3 = vec2( 0.80,  1.30 * ny + drift) + vec2(cos(t * 0.53 + 0.7), 0.0) * m * 1.2;

  vec2 q = p;
  q += u_warp * 0.14 * vec2(
    sin(p.y * 2.3 + t * 1.6),
    sin(p.x * 3.1 - t * 1.9 + 1.7)
  );
  q += u_warp * 0.07 * vec2(
    sin(p.y * 5.1 - t * 2.4 + 0.9),
    sin(p.x * 6.7 + t * 2.1)
  );

  float sig2 = max(u_softness * 0.45, 1e-3);
  sig2 = sig2 * sig2;

  float best = 1e9;
  float wsum = 1e-3;
  float tsum = 0.5e-3;
  float ssum = 0.0;
  vec2 prev = bezier(0.0);

  for (int i = 1; i <= 32; i++) {
    float tt = float(i) / 32.0;
    vec2 cur = bezier(tt);
    vec2 pa = q - prev;
    vec2 ba = cur - prev;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    vec2 foot = prev + ba * h;
    float dd = length(q - foot);
    best = min(best, dd);

    float w = exp(-dd * dd / sig2);
    wsum += w;
    tsum += w * (float(i - 1) + h) / 32.0;
    ssum += w * cross2(ba / max(length(ba), 1e-6), q - foot);
    prev = cur;
  }

  float invW = 1.0 / wsum;
  float avgT = tsum * invW;
  float avgSide = ssum * invW;

  float taper = 0.45 + 0.55 * sin(3.14159265 * avgT);
  float breathe = 1.0 + u_motion * 1.4 * sin(t * 1.7 + q.y * 2.4);
  float wid = u_softness * 0.45 * taper * max(breathe, 0.25);

  float k = best / max(wid, 1e-4);
  float band = exp(-k * k * 1.6);
  float bloom = exp(-k * k * 0.16);

  float shimmer = 0.80 + 0.20 * sin(q.y * 4.6 - t * 3.1) * sin(q.x * 2.7 + t * 1.9);
  band *= shimmer;

  float across = clamp(0.5 + 0.5 * (avgSide / max(wid, 1e-4)), 0.0, 1.0);
  across = clamp(across + u_motion * 0.45 * sin(q.y * 3.4 - t * 2.2), 0.0, 1.0);

  vec3 deep = u_mint * vec3(0.42, 0.62, 0.55);
  vec3 ribbon = mix(deep, u_mint, across);

  vec3 col = u_bg;
  col += ribbon * band * 0.155 * u_intensity;
  col += u_mint * bloom * 0.042 * u_intensity;

  float vign = 1.0 - 1.05 * dot(uv - 0.5, uv - 0.5);
  col *= clamp(vign, 0.0, 1.0);

  float n = hash(gl_FragCoord.xy + fract(u_time) * 17.0) - 0.5;
  col += n * (u_grain / 255.0) * 6.0;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
