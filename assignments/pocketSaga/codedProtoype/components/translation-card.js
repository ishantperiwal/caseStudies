/* Shared translation disclosure and presentation-only sample copy. */
(() => {
  const { node, Action } = PocketSaga;
  const original = {
    title: 'El verdadero viaje es volver a casa',
    body: 'Lo que más me emociona de Interstellar no es el espacio, sino la distancia entre un padre y su hija. Cada mensaje que recibe Cooper convierte el tiempo en algo que casi puedes sentir.'
  };
  const english = {
    title: 'The real journey is coming home',
    body: 'What moves me most about Interstellar isn’t space, but the distance between a father and his daughter. Every message Cooper receives makes time feel like something you can almost touch.'
  };
  const commentOriginal = { body: 'Sí, esa escena me dejó en silencio. Para él pasan unos minutos; para ella, toda una vida. Los mensajes hacen que esa diferencia duela de verdad.' };
  const commentEnglish = { body: 'Yes, that scene left me speechless. For him, a few minutes pass; for her, a whole lifetime. The messages make that difference truly hurt.' };
  function attach(card, source, translated, comment = false) {
    if (card.querySelector('.translation-control')) return;
    const title = card.querySelector('.post-title');
    const body = card.querySelector(comment ? '.comment-body' : '.post-body');
    let active = true;
    const status = node('span', 'translation-status');
    status.setAttribute('role', 'status');
    const button = Action({ label: 'Translate to English', children: 'Translate to English', className: 'translation-action tap-feedback', onClick: () => {
      active = !active;
      render();
      status.textContent = active ? 'English translation shown.' : 'Original Spanish shown.';
    } });
    const context = node('span', 'translation-source');
    const separator = node('span', 'translation-separator', '·');
    separator.setAttribute('aria-hidden', 'true');
    const control = node('div', 'translation-control', [context, separator, button, status]);
    body.after(control);
    function render() {
      const copy = active ? translated : source;
      if (title) { title.textContent = copy.title; title.lang = active ? 'en' : 'es'; if (card.getAttribute('role') === 'link') card.setAttribute('aria-label', `Open post: ${copy.title}`); }
      body.textContent = copy.body;
      body.lang = active ? 'en' : 'es';
      context.textContent = 'Translated from Spanish';
      separator.hidden = !active;
      context.hidden = !active;
      button.textContent = active ? 'View original' : 'Translate to English';
      button.setAttribute('aria-label', active ? 'View original Spanish' : 'Translate to English');
      card.dataset.translated = String(active);
    }
    render();
  }
  window.PocketSagaTranslation = { attach, original, english, commentOriginal, commentEnglish };
})();
