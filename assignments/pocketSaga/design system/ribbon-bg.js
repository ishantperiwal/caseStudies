// Full-screen background for the static views, rendered from the pen.dev "Ribbon flow · Shader background" node (PbOB3).
// The fragment shader is loaded unchanged from ../pen dev/ribbon-flow.glsl; uniforms mirror that node's values.
(() => {
  const canvas = document.querySelector('.ribbon-bg');
  // preserveDrawingBuffer lets the Prism title's glass read this canvas as its live backdrop.
  const gl = canvas && canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) return;
  const hex = value => [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16) / 255);
  const uniforms = { u_speed: .22, u_softness: .3, u_intensity: 1.0, u_angle: 0, u_motion: .42, u_warp: .55, u_grain: .35, u_bg: hex('#05080A'), u_mint: hex('#94A39C') };
  // The .glsl lets the ribbon breathe down to 25% width; keep it fuller here without changing the pen dev file.
  const minWidth = .85;
  const staticView = () => !['material', 'background'].includes(document.body.dataset.view);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  fetch('../pen%20dev/ribbon-flow.glsl').then(response => response.text()).then(source => {
    const compile = (type, code) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, code); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, 'precision highp float;\n' + source.replace('max(breathe, 0.25)', `max(breathe, ${minWidth.toFixed(2)})`)));
    gl.linkProgram(program); gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const location = name => gl.getUniformLocation(program, name);
    Object.entries(uniforms).forEach(([name, value]) => Array.isArray(value) ? gl.uniform3fv(location(name), value) : gl.uniform1f(location(name), value));
    const resolution = location('u_resolution'), time = location('u_time');

    function draw(now) {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const width = Math.round(innerWidth * dpr), height = Math.round(innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); }
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, now / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (reduceMotion) { draw(0); addEventListener('resize', () => draw(0)); return; }
    (function frame(now) { if (staticView()) draw(now); requestAnimationFrame(frame); })(performance.now());
  }).catch(error => console.error('Ribbon background:', error));
})();
