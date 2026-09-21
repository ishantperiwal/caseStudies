/* Two deterministic asset treatments. No title/filename-specific exceptions.
   Measure the full poster once so its classification stays stable across crops. */
(() => {
  const settings = Object.freeze({ sampleSize: 64, meanThreshold: .28, highlightThreshold: .5, highlightCoverageThreshold: .28 });
  const profiles = Object.freeze({
    bright: Object.freeze({ pageVeil: .96, pageLift: 0, cardBrightness: .34, cardVeil: .85 }),
    'not-bright': Object.freeze({ pageVeil: .92, pageLift: 0, cardBrightness: .72, cardVeil: .85 })
  });
  const cache = new Map(), results = new Map();
  const linear = value => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  function measure(pixels) {
    let total = 0, highlights = 0, weight = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3] / 255;
      const luminance = .2126 * linear(pixels[i]) + .7152 * linear(pixels[i + 1]) + .0722 * linear(pixels[i + 2]);
      total += luminance * alpha;
      highlights += Number(luminance >= settings.highlightThreshold) * alpha;
      weight += alpha;
    }
    const mean = weight ? total / weight : 0;
    const highlightCoverage = weight ? highlights / weight : 0;
    const state = mean >= settings.meanThreshold || highlightCoverage >= settings.highlightCoverageThreshold ? 'bright' : 'not-bright';
    return { state, mean, highlightCoverage };
  }
  // Reversible experiment: false restores the original blurred-poster treatment.
  const ambience = { enabled: true, textureOpacity: .22, textureSaturation: .45, textureBlur: 28 };
  function palette(pixels) {
    const bins = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) continue;
      const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]].map(v => v / 255);
      const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
      const light = (max + min) / 2;
      if (delta < .08 || light < .1 || light > .85) continue;
      const saturation = delta / (1 - Math.abs(2 * light - 1));
      let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      hue = (hue * 60 + 360) % 360;
      const key = Math.round(hue / 30) % 12;
      const bin = bins.get(key) || { hue: key * 30, count: 0, saturation: 0 };
      bin.count++; bin.saturation += saturation; bins.set(key, bin);
    }
    const ranked = [...bins.values()].sort((a, b) => b.count - a.count);
    if (!ranked.length) return { primary: 'hsl(210, 5%, 24%)', secondary: 'hsl(210, 4%, 17%)' };
    const first = ranked[0];
    const hueDistance = h => Math.min(Math.abs(h - first.hue), 360 - Math.abs(h - first.hue));
    // A related secondary hue, never a second competing saturated accent.
    const second = ranked.find(b => hueDistance(b.hue) >= 30 && hueDistance(b.hue) <= 90 && b.count >= first.count * .2) || first;
    const muted = bin => {
      const cap = bin.hue <= 30 || bin.hue >= 330 ? 10 : 16;
      return Math.round(Math.min(cap, bin.saturation / bin.count * 100 * .25));
    };
    return { primary: `hsl(${first.hue}, ${muted(first)}%, 27%)`, secondary: `hsl(${second.hue}, ${Math.min(10, muted(second))}%, 19%)` };
  }
  const gradientCache = new Map();
  function ambientSource(src) {
    if (!ambience.enabled) return src;
    const colors = results.get(src)?.palette || palette([]);
    const key = JSON.stringify(colors);
    if (!gradientCache.has(key)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000" viewBox="0 0 600 1000"><defs><radialGradient id="a"><stop stop-color="${colors.primary}"/><stop offset="1" stop-color="${colors.primary}" stop-opacity="0"/></radialGradient><radialGradient id="b"><stop stop-color="${colors.secondary}"/><stop offset="1" stop-color="${colors.secondary}" stop-opacity="0"/></radialGradient></defs><path fill="#202323" d="M0 0h600v1000H0z"/><ellipse cx="300" cy="0" rx="580" ry="850" fill="url(#b)" opacity=".3"/><ellipse cx="300" cy="35" rx="440" ry="720" fill="url(#a)"/></svg>`;
      gradientCache.set(key, 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    }
    return gradientCache.get(key);
  }
  function analyze(src) {
    if (cache.has(src)) return cache.get(src);
    const promise = new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const finish = result => {
        if (settled) return;
        settled = true; clearTimeout(timeout);
        image.onload = image.onerror = null;
        results.set(src, result); resolve(result);
      };
      const fallback = () => finish({ state: 'not-bright', unavailable: true });
      const timeout = setTimeout(fallback, 3000);
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = settings.sampleSize;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          finish({ ...measure(pixels), palette: palette(pixels) });
        } catch { fallback(); } // CORS/file restrictions must never block the UI.
      };
      image.onerror = fallback;
      if (location.protocol !== 'file:') image.crossOrigin = 'anonymous';
      image.src = src;
    });
    cache.set(src, promise);
    return promise;
  }
  function get(src) { return profiles[results.get(src)?.state || 'not-bright']; }
  function apply(element, src) {
    const profile = get(src);
    element.dataset.ambience = ambience.enabled ? "palette" : "artwork";
    element.dataset.mediaTone = results.get(src)?.state || 'not-bright';
    element.style.setProperty('--atmosphere-veil-opacity', profile.pageVeil);
    element.style.setProperty('--atmosphere-light-overlay', src ? profile.pageLift : 0);
    element.style.setProperty('--card-artwork-brightness', profile.cardBrightness);
    element.style.setProperty('--card-veil-opacity', profile.cardVeil);
  }
  const ready = Promise.all(window.pocketSagaData.media.map(media => analyze(media.artwork)));
  window.PocketSagaMedia = { settings, profiles, measure, palette, ambience, ambientSource, analyze, get, apply, ready, result: src => results.get(src) };
})();
