/* Retire only this preview's experimental offline worker, if previously loaded. */
(() => {
  if (!('serviceWorker' in navigator)) return;
  const scope = new URL('../', document.currentScript.src).href;
  navigator.serviceWorker.getRegistration(scope).then(async registration => {
    if (!registration || registration.scope !== scope) return;
    const worker = registration.active || registration.waiting || registration.installing;
    if (worker?.scriptURL !== new URL('sw.js', scope).href) return;
    await registration.unregister();
    if ('caches' in window) await caches.delete('pocketsaga-v1');
  }).catch(() => {});
})();
