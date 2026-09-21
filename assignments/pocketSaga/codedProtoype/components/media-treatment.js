/* Two deterministic asset treatments. No title/filename-specific exceptions.
   Measure the full poster once so its classification stays stable across crops. */
(() => {
  const settings = Object.freeze({ sampleSize: 64, meanThreshold: .28, highlightThreshold: .5, highlightCoverageThreshold: .28 });
  const profiles = Object.freeze({
    bright: Object.freeze({ pageVeil: .96, cardBrightness: .34, cardVeil: .85 }),
    'not-bright': Object.freeze({ pageVeil: .92, cardBrightness: .72, cardVeil: .85 })
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
          finish(measure(context.getImageData(0, 0, canvas.width, canvas.height).data));
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
    element.dataset.mediaTone = results.get(src)?.state || 'not-bright';
    element.style.setProperty('--atmosphere-veil-opacity', profile.pageVeil);
    element.style.setProperty('--card-artwork-brightness', profile.cardBrightness);
    element.style.setProperty('--card-veil-opacity', profile.cardVeil);
  }
  const ready = Promise.all(window.pocketSagaData.media.map(media => analyze(media.artwork)));
  window.PocketSagaMedia = { settings, profiles, measure, analyze, get, apply, ready, result: src => results.get(src) };
})();
