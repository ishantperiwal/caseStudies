/* Shared avatar artwork and crop definitions. Preview and app use this renderer. */
(() => {
  const variants = {
    mint: { panel: 0, description: 'Mint · easygoing' },
    rose: { panel: 1, description: 'Coral · cheerful' },
    blue: { panel: 2, description: 'Blue · curious' },
    amber: { panel: 3, description: 'Amber · mellow' },
    lilac: { panel: 4, description: 'Lilac · playful' }
  };
  const settings = {
    artwork: new URL('assets/avatar-characters-bright.png', document.currentScript.src).href,
    width: 2172, height: 724, panels: 5, cropTop: 105
  };
  function get(person) { return variants[person?.avatarId] || variants.mint; }
  function render(person) {
    const variant = get(person);
    const size = settings.width / settings.panels;
    // Square crop centers the face; the same SVG is clipped by circle or tile wrappers.
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${variant.panel * size} ${settings.cropTop} ${size} ${size}" aria-hidden="true" overflow="hidden"><image href="${settings.artwork}" width="${settings.width}" height="${settings.height}"/></svg>`;
  }
  window.PocketSagaAvatars = { variants, settings, get, render };
})();
