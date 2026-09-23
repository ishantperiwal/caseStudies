// Prism title screen: a slowly turning glass pyramid (glass-icon.js) in front of shaded "PRISM" lettering.
// The glass only exists while the title view is visible.
(() => {
  const stage = document.querySelector('.prism-stage');
  if (!stage || !window.PocketSagaGlassIcon) return;
  let glass = null;

  // Strong-mint lettering: a soft mint glow rising from the top, a vertical mint fill (light at the top, deep
  // at the bottom), a top-down sheen inside the letters, and a highlight on the top-facing edges only. The edge
  // is cut by subtracting a copy of the text shifted down, so overlapping glyph contours never show.
  function vertical(ctx, box, stops) {
    const gradient = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    return gradient;
  }
  function layer(ctx, layout) {
    const canvas = document.createElement('canvas');
    canvas.width = layout.width; canvas.height = layout.height;
    const e = canvas.getContext('2d');
    e.font = ctx.font; e.textAlign = ctx.textAlign; e.textBaseline = ctx.textBaseline;
    if ('letterSpacing' in ctx) e.letterSpacing = ctx.letterSpacing;
    return [canvas, e];
  }
  function paintStrongMint(ctx, layout) {
    const text = layout.lines.join(' '), d = layout.dpr;
    const m = ctx.measureText(text);
    const box = { x: layout.x - m.width / 2, y: layout.top - m.actualBoundingBoxAscent, w: m.width, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent };
    const draw = (style, x = 0, y = 0) => { ctx.fillStyle = style; ctx.fillText(text, layout.x + x, layout.top + y); };

    ctx.save();
    [[56, -12, 'rgb(128 213 169 / 7%)'], [20, -5, 'rgb(189 224 202 / 14%)']].forEach(([blur, rise, color]) => {
      ctx.shadowColor = color; ctx.shadowBlur = blur * d; ctx.shadowOffsetY = rise * d;
      draw('#4a7862');
    });
    ctx.restore();

    draw(vertical(ctx, box, [[0, '#7fb398'], [.38, '#5a8a72'], [1, '#34594a']]));
    draw(vertical(ctx, box, [[0, 'rgb(227 248 235 / 34%)'], [.42, 'rgb(227 248 235 / 0%)']]));

    const [edgeCanvas, e] = layer(ctx, layout);
    e.fillStyle = vertical(e, box, [[0, '#f0fff6'], [.5, '#a5ffd3'], [1, '#80efb5']]);
    e.fillText(text, layout.x, layout.top);
    e.globalCompositeOperation = 'destination-out';
    e.fillText(text, layout.x, layout.top + 1.4 * d);
    ctx.globalAlpha = .8; ctx.drawImage(edgeCanvas, 0, 0); ctx.globalAlpha = 1;

    // "DESIGN SYSTEM" is drawn into the same plate so the glass refracts it too. Its first and last letters' ink
    // line up with the ink of the P and the M (text-metric ink bounds, so side bearings and trailing tracking don't count).
    const inkLeft = layout.x - m.actualBoundingBoxLeft, inkRight = layout.x + m.actualBoundingBoxRight;
    const label = 'DESIGN SYSTEM';
    ctx.save();
    ctx.font = `500 ${15 * SCALE * d}px Manrope, system-ui, sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    const plain = ctx.measureText(label);
    const spacing = Math.max(0, (inkRight - inkLeft - plain.actualBoundingBoxLeft - plain.actualBoundingBoxRight) / (label.length - 1));
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
    ctx.fillStyle = '#a3b4ad';
    ctx.fillText(label, inkLeft + plain.actualBoundingBoxLeft, layout.top + m.actualBoundingBoxDescent + 28 * SCALE * d);
    ctx.restore();
  }

  // The whole title composition (PRISM, caption, gap and pyramid) is scaled from one factor.
  const SCALE = .85;
  const options = () => ({
    background: 'transparent', // the ribbon shader background shows through
    shape: 'Pyramid',
    size: 30 * SCALE,
    speed: 22,
    spinPitch: 0,
    rotateAxis: 'yaw',
    inertia: 1.1,
    orient: { angleX: 12, angleY: 0, angleZ: 0, offsetX: 0, offsetY: 4 },
    glass: { tint: '#F4FBF7', chromatic: 45, frost: 10 },
    backdrop: {
      type: 'Text',
      under: document.querySelector('.ribbon-bg'),
      text: 'PRISM',
      paintText: paintStrongMint,
      font: { fontFamily: 'Manrope, system-ui, sans-serif', fontSize: Math.min(stage.clientWidth * .22, 310) * SCALE, fontWeight: 500, letterSpacing: Math.min(stage.clientWidth * .018, 24) * SCALE, lineHeight: 1 }
    }
  });

  function sync() {
    const visible = document.body.dataset.view === 'title';
    if (visible && !glass) glass = PocketSagaGlassIcon.create(stage, options());
    if (!visible && glass) { glass.destroy(); glass = null; }
  }
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-view'] });
  addEventListener('resize', () => { if (glass) glass.update(options()); });
  sync();
})();
